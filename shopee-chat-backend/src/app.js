import "dotenv/config";
import cors from "cors";
import express from "express";

import {
  deleteAiKnowledge,
  deleteQuickReply,
  getAiSetting,
  getConversationById,
  getDbPath,
  getTokenByShopId,
  isSupabaseEnabled,
  insertWebhookEvent,
  listWebhookEvents,
  listConversationsWithStats,
  listMessages,
  listOrdersByConversation,
  listProductsByShop,
  listQuickReplies,
  listAiDrafts,
  listAiLearningSamples,
  listAiKnowledge,
  listTokens,
  nowIso,
  upsertAiDraft,
  upsertAiLearningSample,
  updateAiDraft,
  upsertAiKnowledge,
  upsertAiSetting,
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
const openAiKey = String(process.env.OPENAI_API_KEY || "").trim();
const openAiModel = String(process.env.OPENAI_MODEL || "gpt-4o-mini").trim();
const anthropicKey = String(process.env.ANTHROPIC_API_KEY || "").trim();
const anthropicModel = String(process.env.ANTHROPIC_MODEL || "claude-3-5-sonnet-latest").trim();
const lastOrderSyncAt = new Map();
const autonomousRunLock = new Map();

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

function toIsoFromUnixMaybe(ts) {
  const sec = toUnixSec(ts);
  if (!sec) return "";
  const ms = sec * 1000;
  const d = new Date(ms);
  return Number.isNaN(d.getTime()) ? "" : d.toISOString();
}

function toUnixSec(ts) {
  let n = Number(ts || 0);
  if (!Number.isFinite(n) || n <= 0) return 0;
  if (n >= 1e18) n = n / 1e9;
  else if (n >= 1e15) n = n / 1e6;
  else if (n >= 1e12) n = n / 1e3;
  return Math.floor(n);
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
  if (!token.refresh_token) {
    throw new Error("Token shop kedaluwarsa dan refresh_token tidak ada. OAuth ulang diperlukan.");
  }
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
    created_timestamp: toUnixSec(m.created_timestamp),
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

async function syncConversations(
  shopId,
  { syncMessages = true, hotLimit = 12, pageSize = 50, maxPages = 8, listType = "all" } = {}
) {
  const accessToken = await ensureAccessToken(shopId);
  const path = "/api/v2/sellerchat/get_conversation_list";
  const allConversations = [];
  const seenConversationIds = new Set();
  let offset = 0;
  let page = 0;
  let keepPaging = true;

  while (keepPaging && page < Math.max(1, Number(maxPages || 1))) {
    const ts = Math.floor(Date.now() / 1000);
    const query = buildSignedQuery(path, ts, { accessToken, shopId });
    const queryObj = Object.fromEntries(new URLSearchParams(query));
    queryObj.direction = "latest";
    queryObj.type = String(listType || "all");
    queryObj.page_size = String(Math.min(100, Math.max(10, Number(pageSize || 50))));
    queryObj.offset = String(Math.max(0, Number(offset || 0)));

    const data = await callShopee(path, "GET", { query: queryObj });
    if (data.error) throw new Error(`${data.error}: ${data.message || "get_conversation_list gagal"}`);

    const response = (data && data.response) || {};
    const chunk = Array.isArray(response.conversations) ? response.conversations : [];
    for (const conv of chunk) {
      const id = String(conv && conv.conversation_id ? conv.conversation_id : "");
      if (!id || seenConversationIds.has(id)) continue;
      seenConversationIds.add(id);
      allConversations.push(conv);
    }

    const nextOffset = Number(response.next_offset || response.offset || 0);
    const hasNext =
      Boolean(response.has_more || response.has_next_page) &&
      Number.isFinite(nextOffset) &&
      nextOffset > offset &&
      chunk.length > 0;
    keepPaging = hasNext;
    offset = nextOffset;
    page += 1;
  }

  const conversations = allConversations.sort(
    (a, b) => Number(b.last_message_timestamp || 0) - Number(a.last_message_timestamp || 0)
  );

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
      last_message_timestamp: toUnixSec(c.last_message_timestamp),
      latest_from_id: "",
      has_unreplied: Number(c.unread_count || 0) > 0 ? 1 : 0,
      raw_json: JSON.stringify(c || {}),
      updated_at: nowIso()
    }))
  );

  if (syncMessages) {
    // Keep realtime snappy: sync message detail only for hottest conversations.
    for (const c of conversations.slice(0, Math.max(0, Number(hotLimit || 0)))) {
      await syncConversationMessages(shopId, c.conversation_id);
    }
  }

  return conversations.length;
}

async function fetchConversationsRaw(shopId, { pageSize = 100, maxPages = 6 } = {}) {
  const accessToken = await ensureAccessToken(shopId);
  const path = "/api/v2/sellerchat/get_conversation_list";
  const rows = [];
  const seen = new Set();
  let offset = 0;
  let page = 0;
  let keep = true;

  while (keep && page < Math.max(1, Number(maxPages || 1))) {
    const ts = Math.floor(Date.now() / 1000);
    const query = buildSignedQuery(path, ts, { accessToken, shopId });
    const queryObj = Object.fromEntries(new URLSearchParams(query));
    queryObj.direction = "latest";
    queryObj.type = "all";
    queryObj.page_size = String(Math.min(100, Math.max(10, Number(pageSize || 100))));
    queryObj.offset = String(Math.max(0, Number(offset || 0)));

    const data = await callShopee(path, "GET", { query: queryObj });
    if (data.error) throw new Error(`${data.error}: ${data.message || "get_conversation_list gagal"}`);
    const response = (data && data.response) || {};
    const chunk = Array.isArray(response.conversations) ? response.conversations : [];
    for (const c of chunk) {
      const id = String(c && c.conversation_id ? c.conversation_id : "");
      if (!id || seen.has(id)) continue;
      seen.add(id);
      rows.push(c);
    }

    const nextOffset = Number(response.next_offset || response.offset || 0);
    const hasNext =
      Boolean(response.has_more || response.has_next_page) &&
      Number.isFinite(nextOffset) &&
      nextOffset > offset &&
      chunk.length > 0;
    keep = hasNext;
    offset = nextOffset;
    page += 1;
  }

  rows.sort((a, b) => Number(b.last_message_timestamp || 0) - Number(a.last_message_timestamp || 0));
  return rows;
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
  const listRows = [];
  const listByItemId = {};
  let offset = 0;
  let page = 0;
  const maxPages = 10;

  while (page < maxPages) {
    const listData = await callShopeeAuth(listPath, "GET", {
      shopId,
      accessToken,
      query: {
        offset: String(offset),
        page_size: "100",
        item_status: "NORMAL"
      }
    });

    if (listData && listData.error) throw new Error(`${listData.error}: ${listData.message || "get_item_list gagal"}`);
    const chunk = ((listData && listData.response && listData.response.item) || []).filter(Boolean);
    if (!chunk.length) break;
    for (const row of chunk) {
      const id = String(row.item_id || "");
      if (!id) continue;
      listByItemId[id] = row;
      listRows.push(row);
    }

    const hasNext =
      Boolean(listData && listData.response && listData.response.has_next_page) &&
      Number(listData && listData.response && listData.response.next_offset) > offset;
    if (!hasNext) break;
    offset = Number(listData.response.next_offset || 0);
    page += 1;
  }

  const itemIds = listRows.map((r) => String(r.item_id || "")).filter(Boolean);

  if (!itemIds.length) return [];

  const infoPath = "/api/v2/product/get_item_base_info";
  const infoRows = [];
  for (let i = 0; i < itemIds.length; i += 50) {
    const batch = itemIds.slice(i, i + 50);
    const infoData = await callShopeeAuth(infoPath, "GET", {
      shopId,
      accessToken,
      query: {
        item_id_list: batch.join(",")
      }
    });
    if (infoData && infoData.error) throw new Error(`${infoData.error}: ${infoData.message || "get_item_base_info gagal"}`);
    const chunk = ((infoData && infoData.response && infoData.response.item_list) || []).filter(Boolean);
    infoRows.push(...chunk);
  }

  const items = infoRows.map((item) => {
    const itemId = String(item.item_id || "");
    const listRef = listByItemId[itemId] || {};
    const stockFromInfo =
      item.stock_info_v2 && item.stock_info_v2.summary_info
        ? Number(item.stock_info_v2.summary_info.total_available_stock || 0)
        : 0;
    const stock =
      stockFromInfo > 0
        ? stockFromInfo
        : Number(listRef.current_stock || listRef.normal_stock || listRef.stock || 0);

    return {
      id: `${shopId}_${itemId}`,
      shop_id: String(shopId),
      item_id: itemId,
      item_name: String(item.item_name || listRef.item_name || ""),
      sku: String(item.item_sku || listRef.item_sku || ""),
      price_info: JSON.stringify(item.price_info || listRef.price_info || []),
      stock,
      image_url:
        item.image && item.image.image_url_list && item.image.image_url_list[0]
          ? item.image.image_url_list[0]
          : String(listRef.image && listRef.image.image_url ? listRef.image.image_url : ""),
      status: String(item.item_status || listRef.item_status || ""),
      raw_json: JSON.stringify({ base_info: item || {}, list_info: listRef || {} }),
      updated_at: nowIso()
    };
  });

  await upsertProducts(items);
  return items;
}

async function syncLatestShopOrders(shopId) {
  const accessToken = await ensureAccessToken(shopId);
  const now = Math.floor(Date.now() / 1000);
  const from = now - 60 * 60 * 24 * 14;
  const listPath = "/api/v2/order/get_order_list";
  const listData = await callShopeeAuth(listPath, "GET", {
    shopId,
    accessToken,
    query: {
      time_range_field: "create_time",
      time_from: String(from),
      time_to: String(now),
      page_size: "50",
      order_status: "READY_TO_SHIP"
    }
  }).catch(async function () {
    return callShopeeAuth(listPath, "GET", {
      shopId,
      accessToken,
      query: {
        time_range_field: "create_time",
        time_from: String(from),
        time_to: String(now),
        page_size: "50"
      }
    });
  });

  if (listData && listData.error) throw new Error(`${listData.error}: ${listData.message || "get_order_list gagal"}`);
  const orderRefs = ((listData && listData.response && listData.response.order_list) || [])
    .map((row) => String(row.order_sn || ""))
    .filter(Boolean);
  if (!orderRefs.length) return [];

  return syncOrdersByRefs(shopId, "", orderRefs.slice(0, 50));
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

function smartReplyFromText(
  text,
  { templates = [], historyRows = [], orderBrief = [], productBrief = [], learningRows = [] } = {}
) {
  const raw = String(text || "").trim();
  const lower = raw.toLowerCase();
  const normalize = (s) => String(s || "").toLowerCase();
  const pickTemplate = (re) => templates.find((t) => re.test(normalize(t)));
  const firstProduct = productBrief && productBrief[0] ? productBrief[0] : null;
  const firstOrder = orderBrief && orderBrief[0] ? orderBrief[0] : null;
  const learningExample = learningRows && learningRows[0] ? String(learningRows[0].seller_text || "") : "";

  if (!raw) {
    return (
      learningExample ||
      templates[0] ||
      "Halo kak, terima kasih sudah hubungi Anton Pancing. Boleh info kendala atau produk yang ingin dicari?"
    );
  }

  const wantsCatalog = /katalog|pilihan|list|daftar|lengkap|semua produk|lihat produk/.test(lower);
  const asksStock = /stok|ready|tersedia|habis/.test(lower);
  const asksPrice = /harga|diskon|promo|murah|berapa/.test(lower);
  const asksShipping = /kirim|pengiriman|resi|tracking|ongkir|sampai kapan|estimasi/.test(lower);
  const asksBuy = /checkout|order|beli|ambil|gas|lanjut/.test(lower);
  const complaint = /komplain|komplain|retur|refund|rusak|salah kirim|belum sampai|kecewa/.test(lower);
  const asksRecommend = /rekomendasi|saran|cocok|bagus buat|pilih yang mana/.test(lower);

  if (complaint) {
    return (
      pickTemplate(/retur|refund|maaf|kendala|komplain/) ||
      "Mohon maaf ya kak atas kendalanya. Biar cepat dibantu, kirim nomor pesanan dan foto atau video kendalanya ya, nanti kami follow up segera."
    );
  }

  if (asksShipping) {
    if (firstOrder && firstOrder.order_sn) {
      return `Untuk pesanan ${firstOrder.order_sn}, status saat ini ${firstOrder.status || "diproses"} ya kak. Jika sudah dikirim, nomor resi akan otomatis muncul di detail pesanan.`;
    }
    return (
      pickTemplate(/kirim|resi|pengiriman|tracking/) ||
      "Siap kak, pesanan diproses sesuai antrean. Nomor resi otomatis muncul setelah paket dikirim. Kalau berkenan, kirim nomor pesanan agar kami bantu cek lebih detail."
    );
  }

  if (asksStock && firstProduct) {
    return `Untuk ${firstProduct.item_name || "produk ini"}, stok terpantau ${firstProduct.stock ?? "-"} ya kak. Kalau mau, saya bantu arahkan ke varian yang paling ready.`;
  }
  if (asksStock) {
    return (
      pickTemplate(/stok|ready|tersedia|habis/) ||
      "Siap kak, untuk cek stok paling akurat mohon sebutkan nama produk atau variannya ya, nanti kami cekkan langsung."
    );
  }

  if (asksPrice && firstProduct) {
    return `Harga ${firstProduct.item_name || "produk ini"} bisa dicek di etalase ya kak, dan promo aktif akan otomatis terpotong saat checkout.`;
  }
  if (asksPrice) {
    return (
      pickTemplate(/harga|promo|diskon/) ||
      "Untuk harga terbaru dan promo, silakan cek di etalase produk ya kak karena update-nya realtime."
    );
  }

  if (asksRecommend) {
    return (
      pickTemplate(/rekomendasi|cocok|saran/) ||
      "Siap kak, biar pas saya bantu rekomendasikan. Kakak biasa mancing target ikan apa dan kisaran budget berapa?"
    );
  }

  if (wantsCatalog) {
    return (
      pickTemplate(/katalog|pilihan|website|shopee|lazada/) ||
      "Kalau mau lihat pilihan lengkap, bisa cek katalog toko kami di website, Shopee, atau Lazada ya kak."
    );
  }

  if (asksBuy) {
    return (
      pickTemplate(/order|checkout|beli/) ||
      "Siap kak, kalau produknya sudah cocok bisa langsung checkout ya. Kalau perlu, saya bantu pilihkan varian yang paling pas."
    );
  }

  const latestHistory = historyRows && historyRows.length ? String(historyRows[historyRows.length - 1].text || "") : "";
  if (latestHistory && latestHistory !== raw && /ukuran|warna|varian|tipe/.test(lower)) {
    return "Siap kak, untuk memastikan varian yang tepat boleh infokan ukuran atau tipe yang dicari ya.";
  }

  return (
    learningExample ||
    templates[0] ||
    "Siap kak, kami bantu ya. Boleh infokan nama produk atau kebutuhan utama kakak supaya kami arahkan yang paling cocok."
  );
}

async function latestIncomingText(conversationId, shopId) {
  const latest = (await listMessages(conversationId, 30, "desc")).find(
    (m) => String(m.from_id || "") !== String(shopId || "")
  );
  return String((latest && latest.content_text) || "").trim();
}

function defaultAiSetting(shopId) {
  return {
    shop_id: String(shopId || ""),
    ai_enabled: 0,
    require_approval: 1,
    provider: openAiKey ? "openai" : anthropicKey ? "claude" : "smart",
    model: openAiKey ? openAiModel : anthropicKey ? anthropicModel : "smart",
    prompt_preset:
      "Balas ramah, singkat, jelas, bahasa Indonesia santai sopan, dan sesuaikan kebiasaan toko."
  };
}

function pickKnowledgeByText(text, rows, limit = 6) {
  const raw = String(text || "").toLowerCase();
  const scored = (rows || [])
    .filter((r) => Number(r.active || 0) !== 0)
    .map((r) => {
      const keyword = String(r.keyword || "").toLowerCase();
      const template = String(r.template || "");
      const group = String(r.group_name || "General");
      let score = Number(r.priority || 0);
      if (keyword && raw.includes(keyword)) score += 6;
      const words = keyword.split(/[,\s]+/).filter(Boolean);
      for (const w of words) {
        if (w.length >= 3 && raw.includes(w)) score += 1;
      }
      return { id: String(r.id || ""), keyword, template, group, score };
    })
    .filter((r) => r.template)
    .sort((a, b) => b.score - a.score);
  return scored.slice(0, limit);
}

function pickLearningByText(text, rows, limit = 4) {
  const raw = String(text || "").toLowerCase();
  const scored = (rows || [])
    .map((r) => {
      const customerText = String(r.customer_text || "").toLowerCase();
      const notes = String(r.notes || "").toLowerCase();
      let score = Number(r.score || 0) / 10;
      const words = raw.split(/[^\p{L}\p{N}]+/u).filter((w) => w && w.length >= 3);
      for (const w of words) {
        if (customerText.includes(w)) score += 2;
        else if (notes.includes(w)) score += 1;
      }
      return {
        id: String(r.id || ""),
        customer_text: String(r.customer_text || ""),
        seller_text: String(r.seller_text || ""),
        source: String(r.source || "manual_reply"),
        score
      };
    })
    .filter((r) => r.seller_text && r.score > 0)
    .sort((a, b) => b.score - a.score);
  return scored.slice(0, limit);
}

function summarizeAiEffectiveness(rows) {
  const list = Array.isArray(rows) ? rows : [];
  const scored = list.filter((r) => Number(r.score || 0) > 0);
  const average = scored.length
    ? scored.reduce((sum, r) => sum + Number(r.score || 0), 0) / scored.length
    : 0;
  return {
    total_learning: list.length,
    scored_count: scored.length,
    avg_score: Number(average.toFixed(2)),
    label: average >= 4.2 ? "sangat_baik" : average >= 3.4 ? "baik" : average >= 2.5 ? "cukup" : "perlu_belajar"
  };
}

async function safeListAiLearning(params) {
  try {
    return await listAiLearningSamples(params);
  } catch (err) {
    console.error("ai learning list warning:", err.message || err);
    return [];
  }
}

async function safeUpsertAiLearning(row) {
  try {
    return await upsertAiLearningSample(row);
  } catch (err) {
    console.error("ai learning upsert warning:", err.message || err);
    return null;
  }
}

async function requestOpenAiDraft({ incomingText, historyRows, knowledgeRows, preset }) {
  const prompt = [
    "Kamu CS marketplace Indonesia.",
    String(preset || ""),
    "Buat 1 balasan singkat (maks 600 chars), profesional, ramah.",
    "Gunakan referensi knowledge jika relevan, jangan halusinasi stok/resi.",
    "Jika data kurang pasti, minta klarifikasi singkat."
  ]
    .filter(Boolean)
    .join("\n");
  const payload = {
    model: openAiModel,
    temperature: 0.3,
    messages: [
      { role: "system", content: prompt },
      {
        role: "user",
        content:
          "Pesan pembeli:\n" +
          String(incomingText || "") +
          "\n\nHistori singkat:\n" +
          historyRows.map((h) => `- ${h.role}: ${h.text}`).join("\n") +
          "\n\nKnowledge:\n" +
          knowledgeRows.map((k) => `- [${k.group}] ${k.template}`).join("\n")
      }
    ]
  };
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${openAiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error((json && (json.error?.message || json.message)) || "OpenAI request gagal");
  }
  return String(json?.choices?.[0]?.message?.content || "").trim();
}

async function requestClaudeDraft({ incomingText, historyRows, knowledgeRows, preset }) {
  const msg =
    "Pesan pembeli:\n" +
    String(incomingText || "") +
    "\n\nHistori singkat:\n" +
    historyRows.map((h) => `- ${h.role}: ${h.text}`).join("\n") +
    "\n\nKnowledge:\n" +
    knowledgeRows.map((k) => `- [${k.group}] ${k.template}`).join("\n") +
    "\n\nInstruksi:\nBuat 1 balasan singkat, ramah, sopan, jelas, maksimal 600 karakter.";
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": anthropicKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json"
    },
    body: JSON.stringify({
      model: anthropicModel,
      max_tokens: 500,
      temperature: 0.3,
      system: String(preset || "Kamu CS marketplace Indonesia."),
      messages: [{ role: "user", content: msg }]
    })
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error((json && (json.error?.message || json.message)) || "Claude request gagal");
  }
  const text = Array.isArray(json?.content)
    ? json.content.map((c) => (typeof c?.text === "string" ? c.text : "")).join("\n")
    : "";
  return String(text || "").trim();
}

async function generateAiDraft({ shopId, conversationId, incomingText }) {
  const settings = (await getAiSetting(shopId)) || defaultAiSetting(shopId);
  const historyRaw = await listMessages(conversationId, 20, "desc");
  const historyRows = historyRaw
    .slice(0, 10)
    .reverse()
    .map((m) => ({
      role: String(m.from_id || "") === String(shopId) ? "penjual" : "pembeli",
      text: String(m.content_text || "").slice(0, 260)
    }));
  const quickReplies = await listQuickReplies({ shopId, limit: 120 });
  const knowledge = await listAiKnowledge({ shopId, limit: 240 });
  const learning = await safeListAiLearning({ shopId, limit: 240 });
  const recentOrders = await listOrdersByConversation({ shopId, conversationId, limit: 8 });
  const searchTerm = String(incomingText || "")
    .split(/\s+/)
    .filter((w) => w && w.length >= 3)
    .slice(0, 5)
    .join(" ");
  const productHints = await listProductsByShop({ shopId, search: searchTerm, limit: 25 });
  const mergedKnowledge = [
    ...knowledge,
    ...quickReplies.map((q, idx) => ({
      id: `qr_${idx}`,
      keyword: String(q.title || ""),
      template: String(q.content || ""),
      group_name: String(q.group_name || "Umum"),
      priority: 2,
      active: 1
    }))
  ];
  const selectedKnowledge = pickKnowledgeByText(incomingText, mergedKnowledge, 8);
  const selectedLearning = pickLearningByText(incomingText, learning, 5);
  let text = "";
  let provider = String(settings.provider || "smart").toLowerCase();
  let model = String(settings.model || "");
  let fallbackReason = "";
  const orderBrief = recentOrders.slice(0, 3).map((o) => ({
    order_sn: o.order_sn,
    status: o.order_status,
    total_amount: o.total_amount
  }));
  const productBrief = productHints.slice(0, 8).map((p) => ({
    item_name: p.item_name,
    sku: p.sku,
    stock: p.stock
  }));
  const learningBrief = selectedLearning.map((l) => ({
    customer_text: l.customer_text,
    seller_text: l.seller_text,
    source: l.source
  }));

  if (provider === "openai" && openAiKey) {
    try {
      text = await requestOpenAiDraft({
        incomingText,
        historyRows,
        knowledgeRows: selectedKnowledge,
        preset:
          String(settings.prompt_preset || "") +
          "\nKonteks order: " +
          JSON.stringify(orderBrief) +
          "\nKonteks produk: " +
          JSON.stringify(productBrief) +
          "\nContoh gaya jawaban toko: " +
          JSON.stringify(learningBrief)
      });
    } catch (_err) {
      provider = "smart";
      fallbackReason = "openai_error";
    }
  } else if ((provider === "claude" || provider === "anthropic") && anthropicKey) {
    try {
      text = await requestClaudeDraft({
        incomingText,
        historyRows,
        knowledgeRows: selectedKnowledge,
        preset:
          String(settings.prompt_preset || "") +
          "\nKonteks order: " +
          JSON.stringify(orderBrief) +
          "\nKonteks produk: " +
          JSON.stringify(productBrief) +
          "\nContoh gaya jawaban toko: " +
          JSON.stringify(learningBrief)
      });
    } catch (_err) {
      provider = "smart";
      fallbackReason = "claude_error";
    }
  } else if (provider === "openai" && !openAiKey) {
    provider = "smart";
    fallbackReason = "openai_key_missing";
  } else if ((provider === "claude" || provider === "anthropic") && !anthropicKey) {
    provider = "smart";
    fallbackReason = "claude_key_missing";
  }

  if (!text) {
    const templates = [
      ...selectedLearning.map((l) => l.seller_text),
      ...selectedKnowledge.map((k) => k.template)
    ].filter(Boolean);
    text = smartReplyFromText(incomingText, {
      templates,
      historyRows,
      orderBrief,
      productBrief,
      learningRows: selectedLearning
    });
    provider = "smart";
    model = fallbackReason ? `rule-engine(${fallbackReason})` : "rule-engine";
  }

  return {
    text: String(text || "").slice(0, 1600),
    provider,
    model: model || (provider === "openai" ? openAiModel : provider === "claude" ? anthropicModel : "rule-engine"),
    refs: selectedKnowledge.map((k) => ({ id: k.id, keyword: k.keyword, group: k.group })),
    learning_refs: selectedLearning.map((l) => ({ id: l.id, customer_text: l.customer_text, source: l.source }))
  };
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
    storage_bucket: supabaseBucket,
    ai: {
      openai_ready: Boolean(openAiKey),
      claude_ready: Boolean(anthropicKey),
      default_provider: openAiKey ? "openai" : anthropicKey ? "claude" : "smart"
    }
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
  const shopId = String(payload.shop_id || payload.shopid || "");
  const conversationId = String(payload.conversation_id || "");
  const pushCode = String(payload.code || payload.push_code || payload.type || "");

  // Ack fast to minimize push failure/timeout in Shopee monitor.
  res.json({ ok: true });

  Promise.resolve()
    .then(async () => {
      await insertWebhookEvent(
        pushCode,
        JSON.stringify(payload),
        nowIso()
      );
      if (shopId && conversationId) {
        await syncConversationMessages(shopId, conversationId);
      } else if (shopId) {
        const deepSync = pushCode === "10" || pushCode === "webchat_push";
        if (deepSync) {
          await syncConversations(shopId, {
            syncMessages: true,
            hotLimit: 30,
            listType: "unread",
            pageSize: 100,
            maxPages: 6
          });
        }
        await syncConversations(shopId, {
          syncMessages: deepSync,
          hotLimit: deepSync ? 20 : 0,
          listType: "all",
          pageSize: 100,
          maxPages: 6
        });
      }
    })
    .catch((err) => {
      console.error("live-push async warning:", err.message || err);
    });
});

app.post("/api/chat/sync", async (req, res) => {
  try {
    const shopId = String(req.body.shop_id || "").trim();
    const conversationId = String(req.body.conversation_id || "").trim();
    if (!shopId) throw new Error("shop_id wajib diisi");
    const synced = conversationId
      ? await syncConversationMessages(shopId, conversationId)
      : await syncConversations(shopId, {
          syncMessages: true,
          hotLimit: 16,
          pageSize: 100,
          maxPages: 8
        });

    let productsSynced = 0;
    let ordersSynced = 0;
    if (!conversationId) {
      try {
        productsSynced = (await syncShopProducts(shopId)).length;
      } catch (err) {
        console.error("product sync warning:", err.message || err);
      }
      try {
        ordersSynced = (await syncLatestShopOrders(shopId)).length;
      } catch (err) {
        console.error("order sync warning:", err.message || err);
      }
    }

    res.json({ ok: true, synced, products_synced: productsSynced, orders_synced: ordersSynced });
  } catch (err) {
    res.status(400).json({ ok: false, error: String(err.message || err) });
  }
});

app.post("/api/chat/realtime/poll", async (req, res) => {
  try {
    const shopId = String(req.body.shop_id || "").trim();
    const conversationId = String(req.body.conversation_id || "").trim();
    if (!shopId) throw new Error("shop_id wajib");

    // Always refresh conversation list so newest buyers bubble up immediately.
    await syncConversations(shopId, {
      syncMessages: false,
      listType: "all",
      pageSize: 100,
      maxPages: 4
    });
    if (!conversationId) {
      await syncConversations(shopId, {
        syncMessages: true,
        hotLimit: 20,
        listType: "unread",
        pageSize: 100,
        maxPages: 3
      });
    }
    if (conversationId) await syncConversationMessages(shopId, conversationId);
    try {
      const now = Date.now();
      const last = Number(lastOrderSyncAt.get(shopId) || 0);
      if (!last || now - last > 60 * 1000) {
        await syncLatestShopOrders(shopId);
        lastOrderSyncAt.set(shopId, now);
      }
    } catch (err) {
      console.error("poll order sync warning:", err.message || err);
    }

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
    const sync = String(req.query.sync || "") === "1";
    const syncType = String(req.query.sync_type || "all").toLowerCase();
    if (sync && shopId) {
      try {
        await syncConversations(shopId, {
          syncMessages: syncType === "unread",
          hotLimit: syncType === "unread" ? 20 : 0,
          listType: syncType === "unread" ? "unread" : "all",
          pageSize: 100,
          maxPages: 4
        });
      } catch (err) {
        console.error("conversation sync warning:", err.message || err);
      }
    }
    const recentDays = Math.min(3650, Math.max(1, Number(req.query.recent_days || 90)));
    const minTs = Math.floor(Date.now() / 1000) - recentDays * 24 * 60 * 60;
    let rows = await listConversationsWithStats({ shopId, limit: 300, offset: 0 });
    if (filter === "unreplied") rows = rows.filter((r) => Number(r.has_unreplied || 0) > 0);
    if (filter === "unread") rows = rows.filter((r) => Number(r.unread_count || 0) > 0);
    rows = rows.filter((r) => Number(r.last_message_timestamp || 0) >= minTs);
    if (!rows.length) {
      // Fallback so UI does not look empty when shop has no recent interaction.
      rows = (await listConversationsWithStats({ shopId, limit: 100, offset: 0 }))
        .sort((a, b) => Number(b.last_message_timestamp || 0) - Number(a.last_message_timestamp || 0))
        .slice(0, 30);
    }
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

app.post("/api/chat/conversation/read", async (req, res) => {
  try {
    const shopId = String(req.body.shop_id || "").trim();
    const conversationId = String(req.body.conversation_id || "").trim();
    if (!shopId || !conversationId) throw new Error("shop_id dan conversation_id wajib");
    await updateConversationStats(conversationId, {
      shop_id: shopId,
      unread_count: 0,
      has_unreplied: 0,
      updated_at: nowIso()
    });
    res.json({ ok: true });
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
    const conv = await getConversationById(conversationId);
    const convName = String((conv && conv.to_name) || "").trim().toLowerCase();
    let rows = await listOrdersByConversation({ shopId, conversationId, limit: 50 });

    if ((!rows || !rows.length) && convName) {
      rows = (await listOrdersByConversation({ shopId, conversationId: "", limit: 50 })).filter((row) =>
        String(row.customer_name || "").trim().toLowerCase() === convName
      );
    }

    rows = rows.sort((a, b) => Number(b.create_time || 0) - Number(a.create_time || 0)).slice(0, 20);
    res.json({ ok: true, rows });
  } catch (err) {
    res.status(400).json({ ok: false, error: String(err.message || err) });
  }
});

app.get("/api/chat/products", async (req, res) => {
  try {
    const shopId = String(req.query.shop_id || "").trim();
    const search = String(req.query.search || "").trim();
    const limit = Math.min(300, Math.max(20, Number(req.query.limit || 180)));
    if (!shopId) throw new Error("shop_id wajib");
    const refresh = String(req.query.refresh || "") === "1";
    if (refresh) {
      try {
        await syncShopProducts(shopId);
      } catch (err) {
        console.error("product refresh warning:", err.message || err);
      }
    }
    const rows = await listProductsByShop({ shopId, search, limit });
    res.json({ ok: true, rows });
  } catch (err) {
    res.status(400).json({ ok: false, error: String(err.message || err) });
  }
});

app.get("/api/chat/debug/push-last", async (req, res) => {
  try {
    const limit = Math.min(100, Math.max(1, Number(req.query.limit || 20)));
    const rows = await listWebhookEvents({ limit });
    const parsed = rows.map((r) => {
      const payload = safeJsonParse(r.payload || "{}", {});
      return {
        id: r.id,
        event_key: r.event_key || "",
        created_at: r.created_at || "",
        shop_id: String(payload.shop_id || payload.shopid || ""),
        conversation_id: String(payload.conversation_id || ""),
        message_id: String(payload.message_id || ""),
        push_code: String(payload.code || payload.push_code || payload.type || ""),
        payload
      };
    });
    res.json({ ok: true, rows: parsed });
  } catch (err) {
    res.status(400).json({ ok: false, error: String(err.message || err) });
  }
});

app.get("/api/chat/debug/shopee-raw", async (req, res) => {
  try {
    const shopId = String(req.query.shop_id || "").trim();
    if (!shopId) throw new Error("shop_id wajib");
    const maxPages = Math.min(12, Math.max(1, Number(req.query.max_pages || 6)));
    const pageSize = Math.min(100, Math.max(10, Number(req.query.page_size || 100)));
    const rows = await fetchConversationsRaw(shopId, { maxPages, pageSize });
    const compact = rows.slice(0, 50).map((c) => ({
      conversation_id: String(c.conversation_id || ""),
      to_name: c.to_name || "",
      to_id: String(c.to_id || ""),
      unread_count: Number(c.unread_count || 0),
      latest_message_type: String(c.latest_message_type || ""),
      latest_message_content: summarizeMessageType(c.latest_message_type, c.latest_message_content),
      last_message_timestamp_raw: Number(c.last_message_timestamp || 0),
      last_message_timestamp: toUnixSec(c.last_message_timestamp),
      last_message_time_iso: toIsoFromUnixMaybe(c.last_message_timestamp)
    }));
    res.json({
      ok: true,
      shop_id: shopId,
      total_raw: rows.length,
      newest_timestamp: compact[0] ? compact[0].last_message_timestamp : 0,
      newest_time_iso: compact[0] ? compact[0].last_message_time_iso : "",
      rows: compact
    });
  } catch (err) {
    res.status(400).json({ ok: false, error: String(err.message || err) });
  }
});

app.get("/api/chat/quick-replies", async (req, res) => {
  try {
    const shopId = String(req.query.shop_id || "").trim();
    if (!shopId) throw new Error("shop_id wajib");
    const limit = Math.min(5000, Math.max(1, Number(req.query.limit || 2000)));
    const rows = await listQuickReplies({ shopId, limit });
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

app.get("/api/chat/knowledge", async (req, res) => {
  try {
    const shopId = String(req.query.shop_id || "").trim();
    if (!shopId) throw new Error("shop_id wajib");
    const groupName = String(req.query.group_name || "").trim();
    const search = String(req.query.search || "").trim();
    const limit = Math.min(5000, Math.max(1, Number(req.query.limit || 2000)));
    const rows = await listAiKnowledge({ shopId, groupName, search, limit });
    res.json({ ok: true, rows });
  } catch (err) {
    res.status(400).json({ ok: false, error: String(err.message || err) });
  }
});

app.post("/api/chat/knowledge", async (req, res) => {
  try {
    const shopId = String(req.body.shop_id || "").trim();
    const keyword = String(req.body.keyword || "").trim();
    const template = String(req.body.template || "").trim();
    if (!shopId) throw new Error("shop_id wajib");
    if (!keyword) throw new Error("keyword wajib");
    if (!template) throw new Error("template wajib");
    const row = await upsertAiKnowledge({
      id: req.body.id,
      shop_id: shopId,
      keyword,
      template,
      group_name: String(req.body.group_name || "General"),
      priority: Number(req.body.priority || 0),
      active: req.body.active == null ? 1 : Number(req.body.active ? 1 : 0),
      position: Number(req.body.position || 0),
      source: String(req.body.source || "manual"),
      updated_at: nowIso()
    });
    res.json({ ok: true, row });
  } catch (err) {
    res.status(400).json({ ok: false, error: String(err.message || err) });
  }
});

app.delete("/api/chat/knowledge/:id", async (req, res) => {
  try {
    await deleteAiKnowledge(String(req.params.id || ""));
    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ ok: false, error: String(err.message || err) });
  }
});

app.get("/api/chat/ai/settings", async (req, res) => {
  try {
    const shopId = String(req.query.shop_id || "").trim();
    if (!shopId) throw new Error("shop_id wajib");
    const row = (await getAiSetting(shopId)) || defaultAiSetting(shopId);
    res.json({ ok: true, row });
  } catch (err) {
    res.status(400).json({ ok: false, error: String(err.message || err) });
  }
});

app.post("/api/chat/ai/settings", async (req, res) => {
  try {
    const shopId = String(req.body.shop_id || "").trim();
    if (!shopId) throw new Error("shop_id wajib");
    const row = await upsertAiSetting({
      shop_id: shopId,
      ai_enabled: req.body.ai_enabled == null ? 1 : Number(req.body.ai_enabled ? 1 : 0),
      require_approval: req.body.require_approval == null ? 1 : Number(req.body.require_approval ? 1 : 0),
      provider: String(req.body.provider || "smart"),
      model: String(req.body.model || ""),
      prompt_preset: String(req.body.prompt_preset || ""),
      updated_at: nowIso()
    });
    res.json({ ok: true, row });
  } catch (err) {
    res.status(400).json({ ok: false, error: String(err.message || err) });
  }
});

app.post("/api/chat/ai/draft", async (req, res) => {
  try {
    const shopId = String(req.body.shop_id || "").trim();
    const conversationId = String(req.body.conversation_id || "").trim();
    if (!shopId || !conversationId) throw new Error("shop_id dan conversation_id wajib");
    const incomingText = String(req.body.incoming_text || "").trim() || (await latestIncomingText(conversationId, shopId));
    if (!incomingText) throw new Error("Tidak ada pesan pembeli untuk dibuatkan draft.");
    const ai = await generateAiDraft({ shopId, conversationId, incomingText });
    const row = await upsertAiDraft({
      shop_id: shopId,
      conversation_id: conversationId,
      source_text: incomingText,
      draft_text: ai.text,
      provider: ai.provider,
      model: ai.model,
      knowledge_refs: JSON.stringify(ai.refs || []),
      status: "draft",
      created_at: nowIso(),
      updated_at: nowIso()
    });
    res.json({ ok: true, row, refs: ai.refs || [] });
  } catch (err) {
    res.status(400).json({ ok: false, error: String(err.message || err) });
  }
});

app.get("/api/chat/ai/drafts", async (req, res) => {
  try {
    const shopId = String(req.query.shop_id || "").trim();
    const conversationId = String(req.query.conversation_id || "").trim();
    const status = String(req.query.status || "").trim();
    if (!shopId) throw new Error("shop_id wajib");
    const rows = await listAiDrafts({
      shopId,
      conversationId,
      status,
      limit: Math.min(120, Math.max(1, Number(req.query.limit || 25)))
    });
    res.json({ ok: true, rows });
  } catch (err) {
    res.status(400).json({ ok: false, error: String(err.message || err) });
  }
});

app.get("/api/chat/ai/learning", async (req, res) => {
  try {
    const shopId = String(req.query.shop_id || "").trim();
    const conversationId = String(req.query.conversation_id || "").trim();
    const search = String(req.query.search || "").trim();
    if (!shopId) throw new Error("shop_id wajib");
    const rows = await safeListAiLearning({
      shopId,
      conversationId,
      search,
      limit: Math.min(300, Math.max(1, Number(req.query.limit || 60)))
    });
    res.json({ ok: true, rows, stats: summarizeAiEffectiveness(rows) });
  } catch (err) {
    res.status(400).json({ ok: false, error: String(err.message || err) });
  }
});

app.post("/api/chat/ai/learning", async (req, res) => {
  try {
    const shopId = String(req.body.shop_id || "").trim();
    const conversationId = String(req.body.conversation_id || "").trim();
    const customerText = String(req.body.customer_text || "").trim();
    const sellerText = String(req.body.seller_text || "").trim();
    if (!shopId) throw new Error("shop_id wajib");
    if (!customerText) throw new Error("customer_text wajib");
    if (!sellerText) throw new Error("seller_text wajib");
    const row = await safeUpsertAiLearning({
      id: req.body.id,
      shop_id: shopId,
      conversation_id: conversationId,
      customer_text: customerText,
      seller_text: sellerText,
      source: String(req.body.source || "manual_feedback"),
      score: req.body.score == null ? null : Number(req.body.score || 0),
      notes: String(req.body.notes || "").trim(),
      metadata_json: JSON.stringify(req.body.metadata || {}),
      updated_at: nowIso()
    });
    res.json({ ok: true, row });
  } catch (err) {
    res.status(400).json({ ok: false, error: String(err.message || err) });
  }
});

app.post("/api/chat/ai/test-draft", async (req, res) => {
  try {
    const shopId = String(req.body.shop_id || "").trim();
    const conversationId = String(req.body.conversation_id || "").trim();
    const incomingText = String(req.body.incoming_text || "").trim();
    if (!shopId) throw new Error("shop_id wajib");
    if (!incomingText) throw new Error("incoming_text wajib");
    const ai = await generateAiDraft({ shopId, conversationId, incomingText });
    const recentLearning = await safeListAiLearning({ shopId, search: incomingText, limit: 20 });
    const stats = summarizeAiEffectiveness(recentLearning);
    res.json({
      ok: true,
      draft_text: ai.text,
      provider: ai.provider,
      model: ai.model,
      refs: ai.refs || [],
      learning_refs: ai.learning_refs || [],
      stats
    });
  } catch (err) {
    res.status(400).json({ ok: false, error: String(err.message || err) });
  }
});

app.post("/api/chat/ai/approve-send", async (req, res) => {
  try {
    const draftId = String(req.body.draft_id || "").trim();
    const shopId = String(req.body.shop_id || "").trim();
    const conversationId = String(req.body.conversation_id || "").trim();
    const approved = req.body.approved == null ? true : Boolean(req.body.approved);
    const finalText = String(req.body.final_text || "").trim();
    if (!draftId || !shopId || !conversationId) throw new Error("draft_id, shop_id, conversation_id wajib");
    const row = await updateAiDraft(draftId, {
      status: approved ? "approved" : "rejected",
      draft_text: finalText || undefined
    });
    if (approved) {
      const text = finalText || String((row && row.draft_text) || "");
      if (!text) throw new Error("draft_text kosong");
      await sendShopeeText(shopId, conversationId, text);
      const customerText = String((row && row.source_text) || "").trim();
      if (customerText) {
        await safeUpsertAiLearning({
          shop_id: shopId,
          conversation_id: conversationId,
          customer_text: customerText,
          seller_text: text,
          source: "ai_approved",
          score: 5,
          notes: "Approved dan dikirim dari draft AI.",
          metadata_json: JSON.stringify({ draft_id: draftId }),
          updated_at: nowIso()
        });
      }
      await updateAiDraft(draftId, { status: "sent" });
    }
    res.json({ ok: true, row });
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
    const customerText =
      String(req.body.customer_text || "").trim() || (await latestIncomingText(conversationId, shopId));
    await sendShopeeText(shopId, conversationId, text);
    if (customerText) {
      await safeUpsertAiLearning({
        shop_id: shopId,
        conversation_id: conversationId,
        customer_text: customerText,
        seller_text: text,
        source: "manual_reply",
        score: 5,
        notes: "Belajar dari balasan manual penjual.",
        updated_at: nowIso()
      });
    }
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

app.post("/api/chat/ai/autonomous/run", async (req, res) => {
  try {
    const shopId = String(req.body.shop_id || "").trim();
    const limit = Math.min(30, Math.max(1, Number(req.body.limit || 5)));
    const dryRun = Boolean(req.body.dry_run);
    if (!shopId) throw new Error("shop_id wajib");
    const aiSettings = (await getAiSetting(shopId)) || defaultAiSetting(shopId);
    if (Number(aiSettings.ai_enabled || 0) === 0) {
      return res.json({
        ok: true,
        disabled: true,
        message: "AI belum aktif. Aktifkan AI di Mode AI terlebih dahulu.",
        rows: [],
        count: 0,
        provider: String(aiSettings.provider || "smart")
      });
    }

    if (autonomousRunLock.get(shopId)) {
      return res.json({ ok: true, busy: true, rows: [] });
    }
    autonomousRunLock.set(shopId, true);
    try {
      await syncConversations(shopId, {
        syncMessages: true,
        hotLimit: 40,
        listType: "unread",
        pageSize: 100,
        maxPages: 4
      });

      const convs = (await listConversationsWithStats({ shopId, limit: 300, offset: 0 }))
        .filter((c) => Number(c.unread_count || 0) > 0 || Number(c.has_unreplied || 0) > 0)
        .sort((a, b) => Number(b.last_message_timestamp || 0) - Number(a.last_message_timestamp || 0))
        .slice(0, limit);

      const rows = [];
      for (const conv of convs) {
        const conversationId = String(conv.conversation_id || "");
        if (!conversationId) continue;
        await syncConversationMessages(shopId, conversationId);
        const incomingText = await latestIncomingText(conversationId, shopId);
        if (!incomingText) continue;

        const ai = await generateAiDraft({ shopId, conversationId, incomingText });
        const draft = await upsertAiDraft({
          shop_id: shopId,
          conversation_id: conversationId,
          source_text: incomingText,
          draft_text: ai.text,
          provider: ai.provider,
          model: ai.model,
          knowledge_refs: JSON.stringify(ai.refs || []),
          status: dryRun ? "draft" : "sent",
          created_at: nowIso(),
          updated_at: nowIso()
        });

        if (!dryRun) {
          await sendShopeeText(shopId, conversationId, ai.text);
          await safeUpsertAiLearning({
            shop_id: shopId,
            conversation_id: conversationId,
            customer_text: incomingText,
            seller_text: ai.text,
            source: "autonomous_ai",
            score: 4,
            notes: "Balasan autonomous AI.",
            updated_at: nowIso()
          });
          await updateConversationStats(conversationId, {
            shop_id: shopId,
            unread_count: 0,
            has_unreplied: 0,
            latest_from_id: String(shopId),
            updated_at: nowIso()
          });
        }

        rows.push({
          conversation_id: conversationId,
          to_name: conv.to_name || "",
          incoming_text: incomingText,
          reply: ai.text,
          draft_id: draft.id
        });
      }

      res.json({
        ok: true,
        dry_run: dryRun,
        count: rows.length,
        rows,
        provider: String(aiSettings.provider || "smart")
      });
    } finally {
      autonomousRunLock.delete(shopId);
    }
  } catch (err) {
    res.status(400).json({ ok: false, error: String(err.message || err) });
  }
});

export default app;
