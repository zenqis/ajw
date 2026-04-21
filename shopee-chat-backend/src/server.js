import "dotenv/config";
import express from "express";
import cors from "cors";

import { db, nowIso } from "./db.js";
import {
  buildAuthUrl,
  buildSignedQuery,
  callShopee,
  getBaseUrl,
  verifyLivePushSignature
} from "./shopee.js";

const app = express();
const port = Number(process.env.PORT || 3010);
const baseUrl = String(process.env.APP_BASE_URL || `http://localhost:${port}`).replace(/\/$/, "");
const redirectPath = process.env.SHOPEE_REDIRECT_PATH || "/api/shopee/oauth/callback";
const redirectUrl = `${baseUrl}${redirectPath}`;

app.use(cors());
app.use(express.json({ limit: "2mb" }));
app.use(express.text({ type: "*/*", limit: "2mb" }));

function jsonFromRaw(req, _res, next) {
  if (typeof req.body === "string") {
    try {
      req.rawBody = req.body;
      req.body = req.body ? JSON.parse(req.body) : {};
    } catch {
      req.body = {};
    }
  } else {
    req.rawBody = JSON.stringify(req.body || {});
  }
  next();
}

const upsertTokenStmt = db.prepare(`
INSERT INTO shopee_tokens (shop_id, access_token, refresh_token, expire_in, updated_at)
VALUES (@shop_id, @access_token, @refresh_token, @expire_in, @updated_at)
ON CONFLICT(shop_id) DO UPDATE SET
  access_token=excluded.access_token,
  refresh_token=excluded.refresh_token,
  expire_in=excluded.expire_in,
  updated_at=excluded.updated_at
`);

const upsertConversationStmt = db.prepare(`
INSERT INTO shopee_conversations (
  conversation_id, shop_id, to_id, to_name, to_avatar, unread_count, pinned,
  latest_message_id, latest_message_type, latest_message_text, last_message_timestamp, raw_json, updated_at
)
VALUES (
  @conversation_id, @shop_id, @to_id, @to_name, @to_avatar, @unread_count, @pinned,
  @latest_message_id, @latest_message_type, @latest_message_text, @last_message_timestamp, @raw_json, @updated_at
)
ON CONFLICT(conversation_id) DO UPDATE SET
  to_id=excluded.to_id,
  to_name=excluded.to_name,
  to_avatar=excluded.to_avatar,
  unread_count=excluded.unread_count,
  pinned=excluded.pinned,
  latest_message_id=excluded.latest_message_id,
  latest_message_type=excluded.latest_message_type,
  latest_message_text=excluded.latest_message_text,
  last_message_timestamp=excluded.last_message_timestamp,
  raw_json=excluded.raw_json,
  updated_at=excluded.updated_at
`);

const upsertMessageStmt = db.prepare(`
INSERT INTO shopee_messages (
  message_id, conversation_id, shop_id, message_type, from_id, to_id,
  created_timestamp, content_text, raw_json, updated_at
)
VALUES (
  @message_id, @conversation_id, @shop_id, @message_type, @from_id, @to_id,
  @created_timestamp, @content_text, @raw_json, @updated_at
)
ON CONFLICT(message_id) DO UPDATE SET
  message_type=excluded.message_type,
  from_id=excluded.from_id,
  to_id=excluded.to_id,
  created_timestamp=excluded.created_timestamp,
  content_text=excluded.content_text,
  raw_json=excluded.raw_json,
  updated_at=excluded.updated_at
`);

function getTokenByShopId(shopId) {
  return db.prepare("SELECT * FROM shopee_tokens WHERE shop_id = ?").get(String(shopId));
}

async function refreshAccessToken(shopId, refreshToken) {
  const path = "/api/v2/auth/access_token/get";
  const ts = Math.floor(Date.now() / 1000);
  const query = buildSignedQuery(path, ts);
  const payload = {
    partner_id: Number(process.env.SHOPEE_PARTNER_ID),
    refresh_token: refreshToken,
    shop_id: Number(shopId)
  };
  const data = await callShopee(path, "POST", { query: Object.fromEntries(new URLSearchParams(query)), body: payload });
  if (data.error) throw new Error(`${data.error}: ${data.message || "refresh token gagal"}`);
  const saved = {
    shop_id: String(shopId),
    access_token: data.access_token,
    refresh_token: data.refresh_token || refreshToken,
    expire_in: Number(data.expire_in || 0),
    updated_at: nowIso()
  };
  upsertTokenStmt.run(saved);
  return saved.access_token;
}

async function ensureAccessToken(shopId) {
  const token = getTokenByShopId(shopId);
  if (!token) throw new Error("Token shop belum ada. Lakukan OAuth terlebih dahulu.");

  const updatedAt = new Date(token.updated_at).getTime();
  const maxAgeMs = Math.max(0, Number(token.expire_in || 0) - 300) * 1000;
  const expired = !updatedAt || Date.now() - updatedAt >= maxAgeMs;
  if (!expired) return token.access_token;
  if (!token.refresh_token) return token.access_token;
  return refreshAccessToken(shopId, token.refresh_token);
}

function contentText(content) {
  if (!content) return "";
  if (typeof content.text === "string") return content.text;
  if (typeof content.url === "string") return content.url;
  if (typeof content.order_sn === "string") return `ORDER:${content.order_sn}`;
  return "";
}

async function syncConversationMessages(shopId, conversationId) {
  const accessToken = await ensureAccessToken(shopId);
  const path = "/api/v2/sellerchat/get_message";
  const ts = Math.floor(Date.now() / 1000);
  const query = buildSignedQuery(path, ts, { accessToken, shopId });
  const queryObj = Object.fromEntries(new URLSearchParams(query));
  queryObj.conversation_id = String(conversationId);
  queryObj.page_size = "50";

  const data = await callShopee(path, "GET", { query: queryObj });
  if (data.error) throw new Error(`${data.error}: ${data.message || "get_message gagal"}`);
  const rows = ((data.response && data.response.messages) || []).map((m) => ({
    message_id: String(m.message_id),
    conversation_id: String(m.conversation_id || conversationId),
    shop_id: String(shopId),
    message_type: m.message_type || "",
    from_id: String(m.from_id || ""),
    to_id: String(m.to_id || ""),
    created_timestamp: Number(m.created_timestamp || 0),
    content_text: contentText(m.content),
    raw_json: JSON.stringify(m || {}),
    updated_at: nowIso()
  }));
  const trx = db.transaction((items) => items.forEach((r) => upsertMessageStmt.run(r)));
  trx(rows);
  return rows.length;
}

async function syncConversations(shopId) {
  const accessToken = await ensureAccessToken(shopId);
  const path = "/api/v2/sellerchat/get_conversation_list";
  const ts = Math.floor(Date.now() / 1000);
  const query = buildSignedQuery(path, ts, { accessToken, shopId });
  const queryObj = Object.fromEntries(new URLSearchParams(query));
  queryObj.direction = "latest";
  queryObj.type = "all";
  queryObj.page_size = "50";

  const data = await callShopee(path, "GET", { query: queryObj });
  if (data.error) throw new Error(`${data.error}: ${data.message || "get_conversation_list gagal"}`);
  const conversations = (data.response && data.response.conversations) || [];
  const rows = conversations.map((c) => ({
    conversation_id: String(c.conversation_id),
    shop_id: String(shopId),
    to_id: String(c.to_id || ""),
    to_name: c.to_name || "",
    to_avatar: c.to_avatar || "",
    unread_count: Number(c.unread_count || 0),
    pinned: c.pinned ? 1 : 0,
    latest_message_id: c.latest_message_id || "",
    latest_message_type: c.latest_message_type || "",
    latest_message_text: contentText(c.latest_message_content),
    last_message_timestamp: Number(c.last_message_timestamp || 0),
    raw_json: JSON.stringify(c || {}),
    updated_at: nowIso()
  }));
  const trx = db.transaction((items) => items.forEach((r) => upsertConversationStmt.run(r)));
  trx(rows);

  for (const c of conversations.slice(0, 20)) {
    await syncConversationMessages(shopId, c.conversation_id);
  }

  return rows.length;
}

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    env: process.env.SHOPEE_ENV || "live",
    base_url: getBaseUrl(),
    db_path: process.env.DB_PATH || "./data/shopee_chat.db"
  });
});

app.get("/api/shopee/oauth/url", (req, res) => {
  const shopId = String(req.query.shop_id || "");
  const url = buildAuthUrl({ redirectUrl: shopId ? `${redirectUrl}?shop_id=${encodeURIComponent(shopId)}` : redirectUrl });
  res.json({ ok: true, url });
});

app.get("/api/shopee/oauth/callback", async (req, res) => {
  try {
    const code = String(req.query.code || "");
    const shopId = String(req.query.shop_id || "");
    if (!code || !shopId) throw new Error("Parameter code/shop_id tidak lengkap.");

    const path = "/api/v2/auth/token/get";
    const ts = Math.floor(Date.now() / 1000);
    const query = buildSignedQuery(path, ts);
    const payload = {
      code,
      partner_id: Number(process.env.SHOPEE_PARTNER_ID),
      shop_id: Number(shopId)
    };
    const data = await callShopee(path, "POST", { query: Object.fromEntries(new URLSearchParams(query)), body: payload });
    if (data.error) throw new Error(`${data.error}: ${data.message || "token/get gagal"}`);

    upsertTokenStmt.run({
      shop_id: String(shopId),
      access_token: String(data.access_token || ""),
      refresh_token: String(data.refresh_token || ""),
      expire_in: Number(data.expire_in || 0),
      updated_at: nowIso()
    });

    res.send(`<html><body style="font-family:Arial;padding:24px">OAuth berhasil untuk shop_id <b>${shopId}</b>. Anda bisa kembali ke AJW.</body></html>`);
  } catch (err) {
    res.status(400).send(`<html><body style="font-family:Arial;padding:24px">OAuth gagal: ${String(err.message || err)}</body></html>`);
  }
});

app.post("/api/shopee/live-push", jsonFromRaw, async (req, res) => {
  const verified = verifyLivePushSignature(req.rawBody || "{}", req.headers || {});
  if (!verified) return res.status(401).json({ ok: false, error: "invalid_signature" });

  const payload = req.body || {};
  db.prepare("INSERT INTO shopee_webhook_events (event_key, payload, created_at) VALUES (?,?,?)").run(
    String(payload.code || payload.push_code || payload.type || ""),
    JSON.stringify(payload),
    nowIso()
  );

  const shopId = String(payload.shop_id || payload.shopid || "");
  const conversationId = String(payload.conversation_id || "");
  try {
    if (shopId && conversationId) {
      await syncConversationMessages(shopId, conversationId);
    } else if (shopId) {
      await syncConversations(shopId);
    }
  } catch (err) {
    console.error("live-push sync warning:", err.message || err);
  }
  res.json({ ok: true });
});

app.post("/api/chat/sync", express.json(), async (req, res) => {
  try {
    const shopId = String(req.body.shop_id || "");
    const conversationId = String(req.body.conversation_id || "");
    if (!shopId) throw new Error("shop_id wajib diisi");
    const count = conversationId
      ? await syncConversationMessages(shopId, conversationId)
      : await syncConversations(shopId);
    res.json({ ok: true, synced: count });
  } catch (err) {
    res.status(400).json({ ok: false, error: String(err.message || err) });
  }
});

app.get("/api/chat/conversations", (req, res) => {
  const limit = Math.min(100, Math.max(1, Number(req.query.limit || 50)));
  const offset = Math.max(0, Number(req.query.offset || 0));
  const shopId = String(req.query.shop_id || "");
  const sql = shopId
    ? "SELECT * FROM shopee_conversations WHERE shop_id=? ORDER BY last_message_timestamp DESC LIMIT ? OFFSET ?"
    : "SELECT * FROM shopee_conversations ORDER BY last_message_timestamp DESC LIMIT ? OFFSET ?";
  const rows = shopId
    ? db.prepare(sql).all(shopId, limit, offset)
    : db.prepare(sql).all(limit, offset);
  res.json({ ok: true, rows });
});

app.get("/api/chat/messages", (req, res) => {
  const conversationId = String(req.query.conversation_id || "");
  if (!conversationId) return res.status(400).json({ ok: false, error: "conversation_id wajib" });
  const limit = Math.min(200, Math.max(1, Number(req.query.limit || 100)));
  const rows = db
    .prepare("SELECT * FROM shopee_messages WHERE conversation_id=? ORDER BY created_timestamp ASC LIMIT ?")
    .all(conversationId, limit);
  res.json({ ok: true, rows });
});

app.listen(port, () => {
  console.log(`Shopee chat backend running on ${baseUrl}`);
  console.log(`OAuth redirect: ${redirectUrl}`);
});
