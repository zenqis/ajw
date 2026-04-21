import fs from "node:fs";
import path from "node:path";

const isVercel = Boolean(process.env.VERCEL || process.env.VERCEL_URL);
const defaultPath = isVercel ? "/tmp/shopee_chat.json" : "./data/shopee_chat.json";
const dbPath = process.env.DB_PATH || defaultPath;
const absDbPath = path.isAbsolute(dbPath) ? dbPath : path.resolve(process.cwd(), dbPath);

const supabaseUrl = String(process.env.SUPABASE_URL || "").replace(/\/$/, "");
const supabaseKey = String(
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.SUPABASE_KEY ||
    ""
).trim();
const useSupabase = Boolean(supabaseUrl && supabaseKey);

let persistenceEnabled = true;

try {
  fs.mkdirSync(path.dirname(absDbPath), { recursive: true });
} catch (err) {
  persistenceEnabled = false;
  console.error("[db] mkdir failed, fallback to memory-only mode:", err.message || err);
}

function defaultState() {
  return {
    tokens: {},
    conversations: {},
    messages: {},
    webhook_events: [],
    quick_replies: {},
    orders: {},
    products: {},
    ai_knowledge: {},
    ai_settings: {},
    ai_drafts: {},
    ai_learning: {}
  };
}

function normalizeUnixTs(value) {
  const n = Number(value || 0);
  if (!Number.isFinite(n) || n <= 0) return 0;
  // ns -> s
  if (n >= 1e18) return Math.floor(n / 1e9);
  // us -> s
  if (n >= 1e15) return Math.floor(n / 1e6);
  // ms -> s
  if (n >= 1e12) return Math.floor(n / 1e3);
  return Math.floor(n);
}

let state = defaultState();
if (persistenceEnabled && fs.existsSync(absDbPath)) {
  try {
    const raw = fs.readFileSync(absDbPath, "utf8");
    const parsed = JSON.parse(raw || "{}");
    state = {
      tokens: parsed.tokens || {},
      conversations: parsed.conversations || {},
      messages: parsed.messages || {},
      webhook_events: Array.isArray(parsed.webhook_events) ? parsed.webhook_events : [],
      quick_replies: parsed.quick_replies || {},
      orders: parsed.orders || {},
      products: parsed.products || {},
      ai_knowledge: parsed.ai_knowledge || {},
      ai_settings: parsed.ai_settings || {},
      ai_drafts: parsed.ai_drafts || {},
      ai_learning: parsed.ai_learning || {}
    };
  } catch {
    state = defaultState();
  }
}

function persist() {
  if (!persistenceEnabled || useSupabase) return;
  try {
    fs.writeFileSync(absDbPath, JSON.stringify(state, null, 2), "utf8");
  } catch (err) {
    persistenceEnabled = false;
    console.error("[db] write failed, fallback to memory-only mode:", err.message || err);
  }
}

function sbHeaders(extra = {}) {
  return {
    apikey: supabaseKey,
    Authorization: `Bearer ${supabaseKey}`,
    ...extra
  };
}

function chunkRows(rows, size = 100) {
  const out = [];
  for (let i = 0; i < rows.length; i += size) out.push(rows.slice(i, i + size));
  return out;
}

async function sbRequest(tablePath, { method = "GET", query = {}, headers = {}, body } = {}) {
  const url = new URL(`${supabaseUrl}/rest/v1/${tablePath}`);
  Object.entries(query || {}).forEach(([key, value]) => {
    if (value == null || value === "") return;
    url.searchParams.set(key, String(value));
  });

  const res = await fetch(url, {
    method,
    headers: sbHeaders({
      "Content-Type": "application/json",
      ...headers
    }),
    body: body == null ? undefined : JSON.stringify(body)
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    const msg =
      (data && (data.message || data.error_description || data.hint || data.details)) ||
      text ||
      `Supabase ${method} ${tablePath} gagal`;
    throw new Error(msg);
  }
  return data;
}

async function sbUpsert(table, rows, onConflict) {
  if (!rows || !rows.length) return;
  for (const batch of chunkRows(rows)) {
    await sbRequest(table, {
      method: "POST",
      query: { on_conflict: onConflict },
      headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
      body: batch
    });
  }
}

async function sbSelect(table, query = {}) {
  return sbRequest(table, {
    method: "GET",
    query
  });
}

async function sbPatch(table, filters, values) {
  return sbRequest(table, {
    method: "PATCH",
    query: filters,
    headers: { Prefer: "return=minimal" },
    body: values
  });
}

async function sbDelete(table, filters) {
  return sbRequest(table, {
    method: "DELETE",
    query: filters,
    headers: { Prefer: "return=minimal" }
  });
}

export function nowIso() {
  return new Date().toISOString();
}

export function getDbPath() {
  return useSupabase ? `${supabaseUrl}/rest/v1` : persistenceEnabled ? absDbPath : "memory://volatile";
}

export function isSupabaseEnabled() {
  return useSupabase;
}

export async function upsertToken(row) {
  const clean = { ...row, shop_id: String(row.shop_id || "") };
  if (useSupabase) {
    await sbUpsert("shopee_chat_tokens", [clean], "shop_id");
    return;
  }
  state.tokens[clean.shop_id] = clean;
  persist();
}

export async function getTokenByShopId(shopId) {
  if (useSupabase) {
    const rows = await sbSelect("shopee_chat_tokens", {
      select: "*",
      shop_id: `eq.${String(shopId || "")}`,
      limit: 1
    });
    return rows && rows[0] ? rows[0] : null;
  }
  return state.tokens[String(shopId)] || null;
}

export async function upsertConversations(rows) {
  const clean = (rows || []).map((row) => ({
    ...row,
    conversation_id: String(row.conversation_id || ""),
    shop_id: String(row.shop_id || ""),
    last_message_timestamp: normalizeUnixTs(row.last_message_timestamp)
  }));
  if (!clean.length) return;
  if (useSupabase) {
    await sbUpsert("shopee_chat_conversations", clean, "conversation_id");
    return;
  }
  for (const row of clean) state.conversations[row.conversation_id] = row;
  persist();
}

export async function updateConversationStats(conversationId, values) {
  const id = String(conversationId || "");
  if (!id) return;
  if (useSupabase) {
    await sbPatch("shopee_chat_conversations", { conversation_id: `eq.${id}` }, values);
    return;
  }
  state.conversations[id] = { ...(state.conversations[id] || {}), ...values };
  persist();
}

export async function getConversationById(conversationId) {
  const id = String(conversationId || "");
  if (useSupabase) {
    const rows = await sbSelect("shopee_chat_conversations", {
      select: "*",
      conversation_id: `eq.${id}`,
      limit: 1
    });
    return rows && rows[0] ? rows[0] : null;
  }
  return state.conversations[id] || null;
}

export async function upsertMessages(rows) {
  const clean = (rows || []).map((row) => ({
    ...row,
    message_id: String(row.message_id || ""),
    conversation_id: String(row.conversation_id || ""),
    shop_id: String(row.shop_id || ""),
    created_timestamp: normalizeUnixTs(row.created_timestamp)
  }));
  if (!clean.length) return;
  if (useSupabase) {
    await sbUpsert("shopee_chat_messages", clean, "message_id");
    return;
  }
  for (const row of clean) state.messages[row.message_id] = row;
  persist();
}

export async function insertWebhookEvent(eventKey, payload, createdAt) {
  const row = {
    id: String(Date.now()) + "_" + Math.random().toString(36).slice(2, 7),
    event_key: String(eventKey || ""),
    payload,
    created_at: createdAt
  };
  if (useSupabase) {
    await sbRequest("shopee_chat_webhook_events", {
      method: "POST",
      headers: { Prefer: "return=minimal" },
      body: [row]
    });
    return;
  }
  state.webhook_events.unshift(row);
  state.webhook_events = state.webhook_events.slice(0, 2000);
  persist();
}

export async function listWebhookEvents({ limit = 50, eventKey = "" } = {}) {
  const safeLimit = Math.min(500, Math.max(1, Number(limit || 50)));
  const key = String(eventKey || "").trim();
  if (useSupabase) {
    const query = {
      select: "*",
      order: "created_at.desc",
      limit: safeLimit
    };
    if (key) query.event_key = `eq.${key}`;
    return sbSelect("shopee_chat_webhook_events", query);
  }

  let rows = state.webhook_events.slice(0, safeLimit * 3);
  if (key) rows = rows.filter((r) => String(r.event_key || "") === key);
  rows.sort((a, b) => String(b.created_at || "").localeCompare(String(a.created_at || "")));
  return rows.slice(0, safeLimit);
}

export async function listConversationsWithStats({ shopId = "", limit = 50, offset = 0 } = {}) {
  if (useSupabase) {
    const query = {
      select: "*",
      order: "last_message_timestamp.desc",
      limit,
      offset
    };
    if (shopId) query.shop_id = `eq.${String(shopId)}`;
    return sbSelect("shopee_chat_conversations", query);
  }

  const rows = Object.values(state.conversations)
    .filter((r) => (shopId ? String(r.shop_id) === String(shopId) : true))
    .map((r) => ({
      ...r,
      last_message_timestamp: normalizeUnixTs(r.last_message_timestamp)
    }));
  rows.sort((a, b) => Number(b.last_message_timestamp || 0) - Number(a.last_message_timestamp || 0));
  return rows.slice(offset, offset + limit);
}

export async function listMessages(conversationId, limit = 100, order = "desc") {
  const desc = String(order || "desc").toLowerCase() !== "asc";
  if (useSupabase) {
    return sbSelect("shopee_chat_messages", {
      select: "*",
      conversation_id: `eq.${String(conversationId || "")}`,
      order: `created_timestamp.${desc ? "desc" : "asc"}`,
      limit
    });
  }

  const rows = Object.values(state.messages)
    .filter((r) => String(r.conversation_id) === String(conversationId))
    .map((r) => ({
      ...r,
      created_timestamp: normalizeUnixTs(r.created_timestamp)
    }));
  rows.sort((a, b) =>
    desc
      ? Number(b.created_timestamp || 0) - Number(a.created_timestamp || 0)
      : Number(a.created_timestamp || 0) - Number(b.created_timestamp || 0)
  );
  return rows.slice(0, limit);
}

export async function listTokens() {
  if (useSupabase) {
    return sbSelect("shopee_chat_tokens", {
      select: "shop_id,updated_at,expire_in",
      order: "updated_at.desc"
    });
  }
  return Object.values(state.tokens).map((t) => ({
    shop_id: String(t.shop_id || ""),
    updated_at: t.updated_at || "",
    expire_in: Number(t.expire_in || 0)
  }));
}

export async function listQuickReplies({ shopId = "", limit = 100 } = {}) {
  if (useSupabase) {
    const query = {
      select: "*",
      order: "position.asc",
      limit
    };
    if (shopId) query.shop_id = `eq.${String(shopId)}`;
    return sbSelect("shopee_chat_quick_replies", query);
  }

  const rows = Object.values(state.quick_replies).filter((r) =>
    shopId ? String(r.shop_id) === String(shopId) : true
  );
  rows.sort((a, b) => Number(a.position || 0) - Number(b.position || 0));
  return rows.slice(0, limit);
}

export async function upsertQuickReply(row) {
  const clean = {
    id: String(row.id || `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`),
    shop_id: String(row.shop_id || ""),
    title: String(row.title || ""),
    content: String(row.content || ""),
    group_name: String(row.group_name || "Umum"),
    position: Number(row.position || 0),
    updated_at: row.updated_at || nowIso()
  };
  if (useSupabase) {
    await sbUpsert("shopee_chat_quick_replies", [clean], "id");
    return clean;
  }
  state.quick_replies[clean.id] = clean;
  persist();
  return clean;
}

export async function deleteQuickReply(id) {
  const key = String(id || "");
  if (useSupabase) {
    await sbDelete("shopee_chat_quick_replies", { id: `eq.${key}` });
    return;
  }
  delete state.quick_replies[key];
  persist();
}

export async function upsertOrders(rows) {
  const clean = (rows || []).map((row) => ({
    ...row,
    id: String(row.id || `${row.shop_id}_${row.order_sn}`),
    shop_id: String(row.shop_id || ""),
    conversation_id: String(row.conversation_id || ""),
    order_sn: String(row.order_sn || "")
  }));
  if (!clean.length) return;
  if (useSupabase) {
    await sbUpsert("shopee_chat_orders", clean, "id");
    return;
  }
  for (const row of clean) state.orders[row.id] = row;
  persist();
}

export async function listOrdersByConversation({ shopId = "", conversationId = "", limit = 20 } = {}) {
  if (useSupabase) {
    const query = {
      select: "*",
      order: "create_time.desc",
      limit
    };
    if (shopId) query.shop_id = `eq.${String(shopId)}`;
    if (conversationId) query.conversation_id = `eq.${String(conversationId)}`;
    return sbSelect("shopee_chat_orders", query);
  }

  const rows = Object.values(state.orders).filter((r) => {
    if (shopId && String(r.shop_id) !== String(shopId)) return false;
    if (conversationId && String(r.conversation_id) !== String(conversationId)) return false;
    return true;
  });
  rows.sort((a, b) => Number(b.create_time || 0) - Number(a.create_time || 0));
  return rows.slice(0, limit);
}

export async function upsertProducts(rows) {
  const clean = (rows || []).map((row) => ({
    ...row,
    id: String(row.id || `${row.shop_id}_${row.item_id}`),
    shop_id: String(row.shop_id || ""),
    item_id: String(row.item_id || "")
  }));
  if (!clean.length) return;
  if (useSupabase) {
    await sbUpsert("shopee_chat_products", clean, "id");
    return;
  }
  for (const row of clean) state.products[row.id] = row;
  persist();
}

export async function listProductsByShop({ shopId = "", search = "", limit = 80 } = {}) {
  if (useSupabase) {
    const query = {
      select: "*",
      order: "updated_at.desc",
      limit
    };
    if (shopId) query.shop_id = `eq.${String(shopId)}`;
    if (search) query.item_name = `ilike.*${String(search).replace(/\*/g, "")}*`;
    return sbSelect("shopee_chat_products", query);
  }

  const term = String(search || "").toLowerCase();
  const rows = Object.values(state.products).filter((r) => {
    if (shopId && String(r.shop_id) !== String(shopId)) return false;
    if (!term) return true;
    return String(r.item_name || "").toLowerCase().includes(term) || String(r.sku || "").toLowerCase().includes(term);
  });
  rows.sort((a, b) => String(b.updated_at || "").localeCompare(String(a.updated_at || "")));
  return rows.slice(0, limit);
}

export async function listAiKnowledge({ shopId = "", groupName = "", search = "", limit = 200 } = {}) {
  if (useSupabase) {
    const query = {
      select: "*",
      order: "position.asc",
      limit
    };
    if (shopId) query.shop_id = `eq.${String(shopId)}`;
    if (groupName) query.group_name = `eq.${String(groupName)}`;
    if (search) query.keyword = `ilike.*${String(search).replace(/\*/g, "")}*`;
    return sbSelect("shopee_chat_ai_knowledge", query);
  }

  const term = String(search || "").toLowerCase();
  const rows = Object.values(state.ai_knowledge).filter((r) => {
    if (shopId && String(r.shop_id) !== String(shopId)) return false;
    if (groupName && String(r.group_name) !== String(groupName)) return false;
    if (!term) return true;
    return (
      String(r.keyword || "").toLowerCase().includes(term) ||
      String(r.template || "").toLowerCase().includes(term)
    );
  });
  rows.sort((a, b) => Number(a.position || 0) - Number(b.position || 0));
  return rows.slice(0, limit);
}

export async function upsertAiKnowledge(row) {
  const clean = {
    id: String(row.id || `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`),
    shop_id: String(row.shop_id || ""),
    keyword: String(row.keyword || "").trim(),
    template: String(row.template || "").trim(),
    group_name: String(row.group_name || "General"),
    priority: Number(row.priority || 0),
    active: row.active == null ? 1 : Number(row.active ? 1 : 0),
    position: Number(row.position || 0),
    source: String(row.source || "manual"),
    updated_at: row.updated_at || nowIso()
  };
  if (useSupabase) {
    await sbUpsert("shopee_chat_ai_knowledge", [clean], "id");
    return clean;
  }
  state.ai_knowledge[clean.id] = clean;
  persist();
  return clean;
}

export async function deleteAiKnowledge(id) {
  const key = String(id || "");
  if (useSupabase) {
    await sbDelete("shopee_chat_ai_knowledge", { id: `eq.${key}` });
    return;
  }
  delete state.ai_knowledge[key];
  persist();
}

export async function getAiSetting(shopId) {
  const key = String(shopId || "");
  if (useSupabase) {
    const rows = await sbSelect("shopee_chat_ai_settings", {
      select: "*",
      shop_id: `eq.${key}`,
      limit: 1
    });
    return rows && rows[0] ? rows[0] : null;
  }
  return state.ai_settings[key] || null;
}

export async function upsertAiSetting(row) {
  const clean = {
    shop_id: String(row.shop_id || ""),
    ai_enabled: Number(row.ai_enabled ? 1 : 0),
    require_approval: row.require_approval == null ? 1 : Number(row.require_approval ? 1 : 0),
    provider: String(row.provider || "smart"),
    model: String(row.model || ""),
    prompt_preset: String(row.prompt_preset || ""),
    updated_at: row.updated_at || nowIso()
  };
  if (useSupabase) {
    await sbUpsert("shopee_chat_ai_settings", [clean], "shop_id");
    return clean;
  }
  state.ai_settings[clean.shop_id] = clean;
  persist();
  return clean;
}

export async function upsertAiDraft(row) {
  const clean = {
    id: String(row.id || `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`),
    shop_id: String(row.shop_id || ""),
    conversation_id: String(row.conversation_id || ""),
    source_message_id: String(row.source_message_id || ""),
    source_text: String(row.source_text || ""),
    draft_text: String(row.draft_text || ""),
    provider: String(row.provider || "smart"),
    model: String(row.model || ""),
    knowledge_refs: String(row.knowledge_refs || ""),
    status: String(row.status || "draft"),
    created_at: row.created_at || nowIso(),
    updated_at: row.updated_at || nowIso()
  };
  if (useSupabase) {
    await sbUpsert("shopee_chat_ai_drafts", [clean], "id");
    return clean;
  }
  state.ai_drafts[clean.id] = clean;
  persist();
  return clean;
}

export async function updateAiDraft(id, values) {
  const key = String(id || "");
  if (!key) return null;
  if (useSupabase) {
    await sbPatch("shopee_chat_ai_drafts", { id: `eq.${key}` }, {
      ...values,
      updated_at: nowIso()
    });
    const rows = await sbSelect("shopee_chat_ai_drafts", {
      select: "*",
      id: `eq.${key}`,
      limit: 1
    });
    return rows && rows[0] ? rows[0] : null;
  }
  state.ai_drafts[key] = {
    ...(state.ai_drafts[key] || { id: key }),
    ...values,
    updated_at: nowIso()
  };
  persist();
  return state.ai_drafts[key];
}

export async function listAiDrafts({ shopId = "", conversationId = "", status = "", limit = 60 } = {}) {
  if (useSupabase) {
    const query = {
      select: "*",
      order: "created_at.desc",
      limit
    };
    if (shopId) query.shop_id = `eq.${String(shopId)}`;
    if (conversationId) query.conversation_id = `eq.${String(conversationId)}`;
    if (status) query.status = `eq.${String(status)}`;
    return sbSelect("shopee_chat_ai_drafts", query);
  }
  const rows = Object.values(state.ai_drafts).filter((r) => {
    if (shopId && String(r.shop_id) !== String(shopId)) return false;
    if (conversationId && String(r.conversation_id) !== String(conversationId)) return false;
    if (status && String(r.status) !== String(status)) return false;
    return true;
  });
  rows.sort((a, b) => String(b.created_at || "").localeCompare(String(a.created_at || "")));
  return rows.slice(0, limit);
}

export async function listAiLearningSamples({ shopId = "", conversationId = "", search = "", limit = 80 } = {}) {
  if (useSupabase) {
    const query = {
      select: "*",
      order: "updated_at.desc",
      limit
    };
    if (shopId) query.shop_id = `eq.${String(shopId)}`;
    if (conversationId) query.conversation_id = `eq.${String(conversationId)}`;
    if (search) query.customer_text = `ilike.*${String(search).replace(/\*/g, "")}*`;
    return sbSelect("shopee_chat_ai_learning", query);
  }
  const term = String(search || "").toLowerCase();
  const rows = Object.values(state.ai_learning).filter((r) => {
    if (shopId && String(r.shop_id) !== String(shopId)) return false;
    if (conversationId && String(r.conversation_id) !== String(conversationId)) return false;
    if (!term) return true;
    return (
      String(r.customer_text || "").toLowerCase().includes(term) ||
      String(r.seller_text || "").toLowerCase().includes(term) ||
      String(r.notes || "").toLowerCase().includes(term)
    );
  });
  rows.sort((a, b) => String(b.updated_at || "").localeCompare(String(a.updated_at || "")));
  return rows.slice(0, limit);
}

export async function upsertAiLearningSample(row) {
  const clean = {
    id: String(row.id || `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`),
    shop_id: String(row.shop_id || ""),
    conversation_id: String(row.conversation_id || ""),
    customer_text: String(row.customer_text || "").trim(),
    seller_text: String(row.seller_text || "").trim(),
    source: String(row.source || "manual_reply"),
    score: row.score == null ? null : Number(row.score || 0),
    notes: String(row.notes || "").trim(),
    metadata_json: String(row.metadata_json || ""),
    updated_at: row.updated_at || nowIso()
  };
  if (useSupabase) {
    await sbUpsert("shopee_chat_ai_learning", [clean], "id");
    return clean;
  }
  state.ai_learning[clean.id] = clean;
  persist();
  return clean;
}
