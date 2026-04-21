import fs from "node:fs";
import path from "node:path";

const isVercel = Boolean(process.env.VERCEL || process.env.VERCEL_URL);
const defaultPath = isVercel ? "/tmp/shopee_chat.json" : "./data/shopee_chat.json";
const dbPath = process.env.DB_PATH || defaultPath;
const absDbPath = path.isAbsolute(dbPath) ? dbPath : path.resolve(process.cwd(), dbPath);
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
    webhook_events: []
  };
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
      webhook_events: Array.isArray(parsed.webhook_events) ? parsed.webhook_events : []
    };
  } catch {
    state = defaultState();
  }
}

function persist() {
  if (!persistenceEnabled) return;
  try {
    fs.writeFileSync(absDbPath, JSON.stringify(state, null, 2), "utf8");
  } catch (err) {
    persistenceEnabled = false;
    console.error("[db] write failed, fallback to memory-only mode:", err.message || err);
  }
}

export function nowIso() {
  return new Date().toISOString();
}

export function getDbPath() {
  return persistenceEnabled ? absDbPath : "memory://volatile";
}

export function upsertToken(row) {
  state.tokens[String(row.shop_id)] = { ...row };
  persist();
}

export function getTokenByShopId(shopId) {
  return state.tokens[String(shopId)] || null;
}

export function upsertConversations(rows) {
  for (const row of rows) {
    state.conversations[String(row.conversation_id)] = { ...row };
  }
  persist();
}

export function upsertMessages(rows) {
  for (const row of rows) {
    state.messages[String(row.message_id)] = { ...row };
  }
  persist();
}

export function insertWebhookEvent(eventKey, payload, createdAt) {
  state.webhook_events.unshift({
    id: String(Date.now()) + "_" + Math.random().toString(36).slice(2, 7),
    event_key: eventKey,
    payload,
    created_at: createdAt
  });
  state.webhook_events = state.webhook_events.slice(0, 2000);
  persist();
}

export function listConversations({ shopId = "", limit = 50, offset = 0 } = {}) {
  const all = Object.values(state.conversations);
  const filtered = shopId ? all.filter((r) => String(r.shop_id) === String(shopId)) : all;
  filtered.sort((a, b) => Number(b.last_message_timestamp || 0) - Number(a.last_message_timestamp || 0));
  return filtered.slice(offset, offset + limit);
}

export function listMessages(conversationId, limit = 100) {
  const rows = Object.values(state.messages).filter(
    (r) => String(r.conversation_id) === String(conversationId)
  );
  rows.sort((a, b) => Number(a.created_timestamp || 0) - Number(b.created_timestamp || 0));
  return rows.slice(0, limit);
}
