import "dotenv/config";
import cors from "cors";
import express from "express";

import {
  deleteQuickReply,
  getConversationById,
  getDbPath,
  getTokenByShopId,
  isSupabaseEnabled,
  insertWebhookEvent,
  listConversationsWithStats,
  listMessages,
  listOrdersByConversation,
  listProductsByShop,
  listQuickReplies,
  listTokens,
  nowIso,
  updateConversationStats,
  upsertConversations,
  upsertMessages,
  upsertOrders,
  upsertProducts,
  upsertQuickReply,
  upsertToken
} from "./db.js";
import {
  buildAuthUrl,
  buildSignedQuery,
  callShopee,
  callShopeeAuth,
  getBaseUrl,
  verifyLivePushSignature
} from "./shopee.js";

const app = express();
const port = Number(process.env.PORT || 3010);
const baseUrl = String(process.env.APP_BASE_URL || `http://localhost:${port}`).replace(/\/$/, "");
const redirectPath = process.env.SHOPEE_REDIRECT_PATH || "/api/shopee/oauth/callback";
const redirectUrl = `${baseUrl}${redirectPath}`;
const supabaseUrl = String(process.env.SUPABASE_URL || "").replace(/\/$/, "");
const supabaseKey = String(
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.SUPABASE_KEY ||
    ""
).trim();
const supabaseBucket = String(process.env.SUPABASE_STORAGE_BUCKET || "chat-media").trim();

app.use(cors());
app.use(express.json({ limit: "18mb" }));
app.use(express.text({ type: "*/*", limit: "18mb" }));

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

function safeJsonParse(v, fallback) {
  try {
    return JSON.parse(v);
  } catch {
    return fallback;
  }
}

function contentText(content) {
  if (!content) return "";
  if (typeof content.text === "string") return content.text;
  if (typeof content.order_sn === "string") return `ORDER:${content.order_sn}`;
  if (typeof content.url === "string") return content.url;
  if (typeof content.image_url === "string") return content.image_url;
  if (typeof content.video_url === "string") return content.video_url;
  return "";
}

function extractOrderSn(content) {
  if (!content) return "";
  if (typeof content.order_sn === "string") return content.order_sn;
  if (typeof content.text === "string") {
    const match = content.text.match(/\b\d{5,}[A-Z0-9]+\b/i);
    return match ? match[0] : "";
  }
  return "";
}

function summarizeMessageType(messageType, content) {
  const kind = String(messageType || "").toLowerCase();
  if (kind === "text") return contentText(content);
  if (kind.includes("image")) return "[Gambar]";
  if (kind.includes("video")) return "[Video]";
  if (kind.includes("item") || kind.includes("product")) return "[Produk]";
  if (kind.includes("order")) return extractOrderSn(content) ? `ORDER:${extractOrderSn(content)}` : "[Pesanan]";
  return contentText(content) || `[${messageType || "pesan"}]`;
}

function sortByCreatedDesc(rows) {
  return (rows || []).slice().sort((a, b) => Number(b.created_timestamp || 0) - Number(a.created_timestamp || 0));
}

function mediaKindFromMime(mime) {
  const m = String(mime || "").toLowerCase();
  if (m.startsWith("video/")) return "video";
  return "image";
}

function normalizeFilename(name) {
  return String(name || "file")
    .replace(/[^\w.\-]+/g, "_")
    .replace(/_+/g, "_")
    .slice(0, 100);
}

function publicStorageUrl(objectPath) {
  return `${supabaseUrl}/storage/v1/object/public/${supabaseBucket}/${objectPath}`;
}

async function uploadMediaToSupabase({ dataUrl, filename, mime, shopId, conversationId }) {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase belum dikonfigurasi untuk upload media.");
  }
  const match = String(dataUrl || "").match(/^data:([^;]+);base64,(.+)$/);
  if (!match) throw new Error("Format data_url tidak valid.");

  const contentType = String(mime || match[1] || "application/octet-stream");
  const buffer = Buffer.from(match[2], "base64");
  const objectPath = `${String(shopId || "shop")}/${String(conversationId || "conv")}/${Date.now()}_${normalizeFilename(filename)}`;
  const url = `${supabaseUrl}/storage/v1/object/${supabaseBucket}/${objectPath}`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
      "Content-Type": contentType,
      "x-upsert": "true"
    },
    body: buffer
  });

  const text = await res.text();
  if (!res.ok) {
    throw new Error(text || "Upload media ke Supabase gagal.");
  }
  return {
    object_path: objectPath,
    public_url: publicStorageUrl(objectPath),
    mime: contentType,
    size: buffer.length
  };
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
  const data = await callShopee(path, "POST", {
    query: Object.fromEntries(new URLSearchParams(query)),
    body: payload
  });
  if (data.error) throw new Error(`${data.error}: ${data.message || "refresh token gagal"}`);
  const saved = {
    shop_id: String(shopId),
    access_token: String(data.access_token || ""),
    refresh_token: String(data.refresh_token || refreshToken || ""),
    expire_in: Number(data.expire_in || 0),
    updated_at: nowIso()
  };
  await upsertToken(saved);
  return saved.access_token;
}

async function ensureAccessToken(shopId) {
  const token = await getTokenByShopId(shopId);
  if (!token) throw new Error("Token shop belum ada. Lakukan OAuth terlebih dahulu.");

  const updatedAt = new Date(token.updated_at).getTime();
  const maxAgeMs = Math.max(0, Number(token.expire_in || 0) - 300) * 1000;
  const expired = !updatedAt || Date.now() - updatedAt >= maxAgeMs;
  if (!expired) return token.access_token;
  if (!token.refresh_token) return token.access_token;
  return refreshAccessToken(shopId, token.refresh_token);
}

async function syncConversationMessages(shopId, conversationId) {
  const accessToken = await ensureAccessToken(shopId);
  const path = "/api/v2/sellerchat/get_message";
  const ts = Math.floor(Date.now() / 1000);
  const query = buildSignedQuery(path, ts, { accessToken, shopId });
  const queryObj = Object.fromEntries(new URLSearchParams(query));
  queryObj.conversation_id = String(conversationId);
  queryObj.page_size = "100";

  const data = await callShopee(path, "GET", { query: queryObj });
  if (data.error) throw new Error(`${data.error}: ${data.message || "get_message gagal"}`);

  const messages = ((data.response && data.response.messages) || []).map((m) => ({
    message_id: String(m.message_id),
    conversation_id: String(m.conversation_id || conversationId),
    shop_id: String(shopId),
    message_type: String(m.message_type || ""),
    from_id: String(m.from_id || ""),
    to_id: String(m.to_id || ""),
    created_timestamp: Number(m.created_timestamp || 0),
    content_text: summarizeMessageType(m.message_type, m.content),
    content_order_sn: extractOrderSn(m.content),
    raw_json: JSON.stringify(m || {}),
    updated_at: nowIso()
  }));

  await upsertMessages(messages);

  const latest = sortByCreatedDesc(messages)[0] || null;
  if (latest) {
    await updateConversationStats(conversationId, {
      latest_from_id: String(latest.from_id || ""),
      has_unreplied: String(latest.from_id || "") !== String(shopId) ? 1 : 0,
      latest_message_text: latest.content_text || "",
      last_message_timestamp: Number(latest.created_timestamp || 0),
      updated_at: nowIso()
    });
  }

  const orderRefs = Array.from(
    new Set(messages.map((m) => String(m.content_order_sn || "").trim()).filter(Boolean))
  );
  if (orderRefs.length) {
    try {
      await syncOrdersByRefs(shopId, conversationId, orderRefs);
    } catch (err) {
      console.error("sync orders warning:", err.message || err);
    }
  }

  return messages.length;
}

async function syncConversations(shopId) {
  const accessToken = await ensureAccessToken(shopId);
  const path = "/api/v2/sellerchat/get_conversation_list";
  const ts = Math.floor(Date.now() / 1000);
  const query = buildSignedQuery(path, ts, { accessToken, shopId });
  const queryObj = Object.fromEntries(new URLSearchParams(query));
  queryObj.direction = "latest";
  queryObj.type = "all";
  queryObj.page_size = "100";

  const data = await callShopee(path, "GET", { query: queryObj });
  if (data.error) throw new Error(`${data.error}: ${data.message || "get_conversation_list gagal"}`);
  const conversations = (data.response && data.response.conversations) || [];

  await upsertConversations(
    conversations.map((c) => ({
      conversation_id: String(c.conversation_id),
      shop_id: String(shopId),
      to_id: String(c.to_id || ""),
      to_name: c.to_name || "",
      to_avatar: c.to_avatar || "",
      unread_count: Number(c.unread_count || 0),
      pinned: c.pinned ? 1 : 0,
      latest_message_id: String(c.latest_message_id || ""),
      latest_message_type: String(c.latest_message_type || ""),
      latest_message_text: summarizeMessageType(c.latest_message_type, c.latest_message_content),
      last_message_timestamp: Number(c.last_message_timestamp || 0),
      latest_from_id: "",
      has_unreplied: Number(c.unread_count || 0) > 0 ? 1 : 0,
      raw_json: JSON.stringify(c || {}),
      updated_at: nowIso()
    }))
  );

  for (const c of conversations.slice(0, 30)) {
    await syncConversationMessages(shopId, c.conversation_id);
  }

  return conversations.length;
}

async function syncOrdersByRefs(shopId, conversationId, orderRefs) {
  if (!orderRefs || !orderRefs.length) return [];
  const accessToken = await ensureAccessToken(shopId);
  const path = "/api/v2/order/get_order_detail";
  const query = {
    order_sn_list: orderRefs.join(","),
    response_optional_fields:
      "item_list,total_amount,buyer_username,buyer_user_id,create_time,pay_time,message_to_seller,note,package_list"
  };

  let data = null;
  try {
    data = await callShopeeAuth(path, "GET", {
      shopId,
      accessToken,
      query
    });
  } catch (_err) {
    data = await callShopeeAuth(path, "GET", {
      shopId,
      accessToken,
      query: { order_sn_list: orderRefs.join(",") }
    });
  }

  if (data && data.error) throw new Error(`${data.error}: ${data.message || "get_order_detail gagal"}`);
  const orders = ((data && data.response && data.response.order_list) || []).map((order) => ({
    id: `${shopId}_${String(order.order_sn || "")}`,
    shop_id: String(shopId),
    conversation_id: String(conversationId || ""),
    order_sn: String(order.order_sn || ""),
    customer_name: String(order.buyer_username || ""),
    order_status: String(order.order_status || ""),
    create_time: Number(order.create_time || 0),
    pay_time: Number(order.pay_time || 0),
    total_amount: Number(order.total_amount || 0),
    item_count: Array.isArray(order.item_list) ? order.item_list.length : 0,
    items_json: JSON.stringify(order.item_list || []),
    raw_json: JSON.stringify(order || {}),
    updated_at: nowIso()
  }));

  await upsertOrders(orders);
  return orders;
}

async function syncShopProducts(shopId) {
  const accessToken = await ensureAccessToken(shopId);
  const listPath = "/api/v2/product/get_item_list";
  const listData = await callShopeeAuth(listPath, "GET", {
    shopId,
    accessToken,
    query: {
      offset: "0",
      page_size: "40",
      item_status: "NORMAL"
    }
  });

  if (listData && listData.error) throw new Error(`${listData.error}: ${listData.message || "get_item_list gagal"}`);
  const itemIds = ((listData && listData.response && listData.response.item) || [])
    .map((r) => String(r.item_id || ""))
    .filter(Boolean);

  if (!itemIds.length) return [];

  const infoPath = "/api/v2/product/get_item_base_info";
  const infoData = await callShopeeAuth(infoPath, "GET", {
    shopId,
    accessToken,
    query: {
      item_id_list: itemIds.join(",")
    }
  });

  if (infoData && infoData.error) throw new Error(`${infoData.error}: ${infoData.message || "get_item_base_info gagal"}`);
  const items = ((infoData && infoData.response && infoData.response.item_list) || []).map((item) => ({
    id: `${shopId}_${String(item.item_id || "")}`,
    shop_id: String(shopId),
    item_id: String(item.item_id || ""),
    item_name: String(item.item_name || ""),
    sku: String(item.item_sku || ""),
    price_info: JSON.stringify(item.price_info || []),
    stock: Number(item.stock_info_v2 && item.stock_info_v2.summary_info ? item.stock_info_v2.summary_info.total_available_stock || 0 : 0),
    image_url: item.image && item.image.image_url_list && item.image.image_url_list[0] ? item.image.image_url_list[0] : "",
    status: String(item.item_status || ""),
    raw_json: JSON.stringify(item || {}),
    updated_at: nowIso()
  }));

  await upsertProducts(items);
  return items;
}

async function sendShopeePayloadCandidates(shopId, conversationId, candidates) {
  const accessToken = await ensureAccessToken(shopId);
  const path = "/api/v2/sellerchat/send_message";
  const conv = await getConversationById(conversationId);
  const toId = conv ? String(conv.to_id || "") : "";
  let lastErr = null;

  for (const candidate of candidates) {
    const payload = {
      request_id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      ...candidate
    };
    if (!payload.to_id && toId) payload.to_id = Number(toId);

    try {
      const data = await callShopeeAuth(path, "POST", {
        shopId,
        accessToken,
        body: payload
      });
      if (data && data.error) throw new Error(`${data.error}: ${data.message || "send_message gagal"}`);
      await syncConversationMessages(shopId, conversationId);
      return data;
    } catch (err) {
      lastErr = err;
    }
  }

  throw lastErr || new Error("Gagal kirim pesan ke Shopee");
}

async function sendShopeeText(shopId, conversationId, text) {
  return sendShopeePayloadCandidates(shopId, conversationId, [
    {
      conversation_id: String(conversationId),
      message_type: "text",
      content: { text: String(text || "") }
    },
    {
      message_type: "text",
      content: { text: String(text || "") }
    }
  ]);
}

async function sendShopeeMedia(shopId, conversationId, mediaType, url, caption) {
  const kind = String(mediaType || "image").toLowerCase() === "video" ? "video" : "image";
  const textFallback = [caption, url].filter(Boolean).join("\n");
  const keyName = kind === "video" ? "video_url" : "image_url";

  return sendShopeePayloadCandidates(shopId, conversationId, [
    {
      conversation_id: String(conversationId),
      message_type: kind,
      content: { [keyName]: url, text: caption || "" }
    },
    {
      conversation_id: String(conversationId),
      message_type: kind,
      content: { url, text: caption || "" }
    },
    {
      conversation_id: String(conversationId),
      message_type: "text",
      content: { text: textFallback }
    }
  ]);
}

function smartReplyFromText(text, templates = []) {
  const raw = String(text || "").toLowerCase();
  if (!raw) return templates[0] || "Halo kak, terima kasih sudah menghubungi kami. Ada yang bisa kami bantu?";
  if (raw.includes("stok")) {
    return (
      templates.find((t) => /stok/i.test(t)) ||
      "Untuk stok saat ini tersedia kak. Silakan infokan varian yang dibutuhkan ya."
    );
  }
  if (raw.includes("kirim") || raw.includes("resi")) {
    return (
      templates.find((t) => /kirim|resi/i.test(t)) ||
      "Pesanan akan diproses sesuai antrean dan nomor resi otomatis muncul setelah paket dikirim ya kak."
    );
  }
  if (raw.includes("harga") || raw.includes("diskon")) {
    return (
      templates.find((t) => /harga|diskon|promo/i.test(t)) ||
      "Harga dan promo mengikuti yang tampil di etalase. Jika ada promo aktif, otomatis terpotong saat checkout."
    );
  }
  return (
    templates[0] ||
    "Baik kak, terima kasih infonya. Kami bantu cek dulu, mohon tunggu sebentar ya."
  );
}

async function latestIncomingText(conversationId, shopId) {
  const latest = (await listMessages(conversationId, 30, "desc")).find(
    (m) => String(m.from_id || "") !== String(shopId || "")
  );
  return String((latest && latest.content_text) || "").trim();
}

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    env: process.env.SHOPEE_ENV || "live",
    base_url: getBaseUrl(),
    app_base_url: baseUrl,
    redirect_url: redirectUrl,
    db_path: getDbPath(),
    supabase_enabled: isSupabaseEnabled(),
    storage_bucket: supabaseBucket
  });
});

app.get("/", (_req, res) => {
  res.json({
    ok: true,
    service: "ajw-shopee-chat-backend",
    health: "/health"
  });
});

app.get("/api/shopee/oauth/url", (_req, res) => {
  try {
    const url = buildAuthUrl({ redirectUrl });
    res.json({ ok: true, url });
  } catch (err) {
    res.status(400).json({ ok: false, error: String(err.message || err) });
  }
});

app.get("/api/shopee/oauth/callback", async (req, res) => {
  try {
    const code = String(req.query.code || "");
    const rawShopId = req.query.shop_id;
    const shopId = Array.isArray(rawShopId)
      ? String(rawShopId[rawShopId.length - 1] || "")
      : String(rawShopId || "");
    if (!code || !shopId) throw new Error("Parameter code/shop_id tidak lengkap.");

    const path = "/api/v2/auth/token/get";
    const ts = Math.floor(Date.now() / 1000);
    const query = buildSignedQuery(path, ts);
    const payload = {
      code,
      partner_id: Number(process.env.SHOPEE_PARTNER_ID),
      shop_id: Number(shopId)
    };
    const data = await callShopee(path, "POST", {
      query: Object.fromEntries(new URLSearchParams(query)),
      body: payload
    });
    if (data.error) throw new Error(`${data.error}: ${data.message || "token/get gagal"}`);

    await upsertToken({
      shop_id: String(shopId),
      access_token: String(data.access_token || ""),
      refresh_token: String(data.refresh_token || ""),
      expire_in: Number(data.expire_in || 0),
      updated_at: nowIso()
    });

    res.send(
      `<html><body style="font-family:Arial;padding:24px">OAuth berhasil untuk shop_id <b>${shopId}</b>. Token sudah disimpan${isSupabaseEnabled() ? " ke Supabase" : ""}. Anda bisa kembali ke AJW.</body></html>`
    );
  } catch (err) {
    res.status(400).send(
      `<html><body style="font-family:Arial;padding:24px">OAuth gagal: ${String(err.message || err)}</body></html>`
    );
  }
});

app.post("/api/shopee/live-push", jsonFromRaw, async (req, res) => {
  const verified = verifyLivePushSignature(req.rawBody || "{}", req.headers || {});
  if (!verified) return res.status(401).json({ ok: false, error: "invalid_signature" });

  const payload = req.body || {};
  await insertWebhookEvent(
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

app.post("/api/chat/sync", async (req, res) => {
  try {
    const shopId = String(req.body.shop_id || "").trim();
    const conversationId = String(req.body.conversation_id || "").trim();
    if (!shopId) throw new Error("shop_id wajib diisi");
    const synced = conversationId
      ? await syncConversationMessages(shopId, conversationId)
      : await syncConversations(shopId);

    let productsSynced = 0;
    if (!conversationId) {
      try {
        productsSynced = (await syncShopProducts(shopId)).length;
      } catch (err) {
        console.error("product sync warning:", err.message || err);
      }
    }

    res.json({ ok: true, synced, products_synced: productsSynced });
  } catch (err) {
    res.status(400).json({ ok: false, error: String(err.message || err) });
  }
});

app.post("/api/chat/realtime/poll", async (req, res) => {
  try {
    const shopId = String(req.body.shop_id || "").trim();
    const conversationId = String(req.body.conversation_id || "").trim();
    if (!shopId) throw new Error("shop_id wajib");

    if (conversationId) await syncConversationMessages(shopId, conversationId);
    else await syncConversations(shopId);

    const conversations = await listConversationsWithStats({ shopId, limit: 100, offset: 0 });
    const messages = conversationId ? await listMessages(conversationId, 120, "asc") : [];
    res.json({ ok: true, conversations, messages, ts: Date.now() });
  } catch (err) {
    res.status(400).json({ ok: false, error: String(err.message || err) });
  }
});

app.get("/api/chat/conversations", async (req, res) => {
  try {
    const limit = Math.min(150, Math.max(1, Number(req.query.limit || 80)));
    const offset = Math.max(0, Number(req.query.offset || 0));
    const shopId = String(req.query.shop_id || "");
    const filter = String(req.query.filter || "all").toLowerCase();
    let rows = await listConversationsWithStats({ shopId, limit: 300, offset: 0 });
    if (filter === "unreplied") rows = rows.filter((r) => Number(r.has_unreplied || 0) > 0);
    if (filter === "unread") rows = rows.filter((r) => Number(r.unread_count || 0) > 0);
    rows = rows.slice(offset, offset + limit);
    res.json({ ok: true, rows });
  } catch (err) {
    res.status(400).json({ ok: false, error: String(err.message || err) });
  }
});

app.get("/api/chat/messages", async (req, res) => {
  try {
    const conversationId = String(req.query.conversation_id || "");
    if (!conversationId) throw new Error("conversation_id wajib");
    const limit = Math.min(300, Math.max(1, Number(req.query.limit || 120)));
    const order = String(req.query.order || "asc");
    const rows = await listMessages(conversationId, limit, order);
    res.json({ ok: true, rows });
  } catch (err) {
    res.status(400).json({ ok: false, error: String(err.message || err) });
  }
});

app.get("/api/chat/shops", async (_req, res) => {
  try {
    const rows = (await listTokens())
      .map((r) => ({
        shop_id: String(r.shop_id || ""),
        expire_in: Number(r.expire_in || 0),
        updated_at: r.updated_at || "",
        label: `Shop ${String(r.shop_id || "-")}`
      }))
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
    res.json({ ok: true, rows });
  } catch (err) {
    res.status(400).json({ ok: false, error: String(err.message || err) });
  }
});

app.get("/api/chat/orders", async (req, res) => {
  try {
    const shopId = String(req.query.shop_id || "").trim();
    const conversationId = String(req.query.conversation_id || "").trim();
    if (!shopId || !conversationId) throw new Error("shop_id dan conversation_id wajib");
    const refresh = String(req.query.refresh || "") === "1";
    if (refresh) {
      const messages = await listMessages(conversationId, 120, "desc");
      const orderRefs = Array.from(
        new Set(
          messages
            .map((m) => {
              if (m.content_order_sn) return String(m.content_order_sn);
              const raw = safeJsonParse(m.raw_json || "{}", {});
              return extractOrderSn(raw.content);
            })
            .filter(Boolean)
        )
      );
      if (orderRefs.length) await syncOrdersByRefs(shopId, conversationId, orderRefs);
    }
    const rows = await listOrdersByConversation({ shopId, conversationId, limit: 20 });
    res.json({ ok: true, rows });
  } catch (err) {
    res.status(400).json({ ok: false, error: String(err.message || err) });
  }
});

app.get("/api/chat/products", async (req, res) => {
  try {
    const shopId = String(req.query.shop_id || "").trim();
    const search = String(req.query.search || "").trim();
    if (!shopId) throw new Error("shop_id wajib");
    const refresh = String(req.query.refresh || "") === "1";
    if (refresh) {
      try {
        await syncShopProducts(shopId);
      } catch (err) {
        console.error("product refresh warning:", err.message || err);
      }
    }
    const rows = await listProductsByShop({ shopId, search, limit: 80 });
    res.json({ ok: true, rows });
  } catch (err) {
    res.status(400).json({ ok: false, error: String(err.message || err) });
  }
});

app.get("/api/chat/quick-replies", async (req, res) => {
  try {
    const shopId = String(req.query.shop_id || "").trim();
    if (!shopId) throw new Error("shop_id wajib");
    const rows = await listQuickReplies({ shopId, limit: 200 });
    res.json({ ok: true, rows });
  } catch (err) {
    res.status(400).json({ ok: false, error: String(err.message || err) });
  }
});

app.post("/api/chat/quick-replies", async (req, res) => {
  try {
    const shopId = String(req.body.shop_id || "").trim();
    const title = String(req.body.title || "").trim();
    const content = String(req.body.content || "").trim();
    if (!shopId) throw new Error("shop_id wajib");
    if (!content) throw new Error("content wajib");
    const saved = await upsertQuickReply({
      id: req.body.id,
      shop_id: shopId,
      title: title || content.slice(0, 36),
      content,
      group_name: String(req.body.group_name || "Umum"),
      position: Number(req.body.position || 0),
      updated_at: nowIso()
    });
    res.json({ ok: true, row: saved });
  } catch (err) {
    res.status(400).json({ ok: false, error: String(err.message || err) });
  }
});

app.delete("/api/chat/quick-replies/:id", async (req, res) => {
  try {
    await deleteQuickReply(String(req.params.id || ""));
    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ ok: false, error: String(err.message || err) });
  }
});

app.post("/api/chat/send", async (req, res) => {
  try {
    const shopId = String(req.body.shop_id || "").trim();
    const conversationId = String(req.body.conversation_id || "").trim();
    const text = String(req.body.text || "").trim();
    if (!shopId) throw new Error("shop_id wajib");
    if (!conversationId) throw new Error("conversation_id wajib");
    if (!text) throw new Error("text wajib");
    if (text.length > 1900) throw new Error("text terlalu panjang");
    await sendShopeeText(shopId, conversationId, text);
    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ ok: false, error: String(err.message || err) });
  }
});

app.post("/api/chat/upload-media", async (req, res) => {
  try {
    const shopId = String(req.body.shop_id || "").trim();
    const conversationId = String(req.body.conversation_id || "").trim();
    if (!shopId || !conversationId) throw new Error("shop_id dan conversation_id wajib");
    const row = await uploadMediaToSupabase({
      dataUrl: String(req.body.data_url || ""),
      filename: String(req.body.filename || "upload.bin"),
      mime: String(req.body.mime || ""),
      shopId,
      conversationId
    });
    res.json({ ok: true, row });
  } catch (err) {
    res.status(400).json({ ok: false, error: String(err.message || err) });
  }
});

app.post("/api/chat/send-media", async (req, res) => {
  try {
    const shopId = String(req.body.shop_id || "").trim();
    const conversationId = String(req.body.conversation_id || "").trim();
    const mediaUrl = String(req.body.media_url || "").trim();
    const caption = String(req.body.caption || "").trim();
    const mediaType = mediaKindFromMime(req.body.mime || req.body.media_type);
    if (!shopId || !conversationId) throw new Error("shop_id dan conversation_id wajib");
    if (!mediaUrl) throw new Error("media_url wajib");
    await sendShopeeMedia(shopId, conversationId, mediaType, mediaUrl, caption);
    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ ok: false, error: String(err.message || err) });
  }
});

app.post("/api/chat/auto-reply", async (req, res) => {
  try {
    const shopId = String(req.body.shop_id || "").trim();
    const dryRun = Boolean(req.body.dry_run);
    const limit = Math.min(50, Math.max(1, Number(req.body.limit || 15)));
    if (!shopId) throw new Error("shop_id wajib");

    let templates = Array.isArray(req.body.templates)
      ? req.body.templates.map((x) => String(x || "").trim()).filter(Boolean)
      : [];
    if (!templates.length) {
      templates = (await listQuickReplies({ shopId, limit: 30 })).map((r) => String(r.content || "").trim()).filter(Boolean);
    }

    const convs = (await listConversationsWithStats({ shopId, limit: 300, offset: 0 })).filter(
      (r) => Number(r.has_unreplied || 0) > 0
    );
    const targets = convs.slice(0, limit);
    const results = [];

    for (const c of targets) {
      const incoming = await latestIncomingText(c.conversation_id, shopId);
      const reply = smartReplyFromText(incoming, templates);
      if (!reply) continue;
      if (!dryRun) await sendShopeeText(shopId, c.conversation_id, reply);
      results.push({
        conversation_id: c.conversation_id,
        to_name: c.to_name || "",
        incoming,
        reply
      });
    }

    res.json({ ok: true, dry_run: dryRun, count: results.length, rows: results });
  } catch (err) {
    res.status(400).json({ ok: false, error: String(err.message || err) });
  }
});

export default app;
