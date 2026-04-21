import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";

const dbPath = process.env.DB_PATH || "./data/shopee_chat.db";
const absDbPath = path.resolve(process.cwd(), dbPath);
fs.mkdirSync(path.dirname(absDbPath), { recursive: true });

export const db = new Database(absDbPath);

db.pragma("journal_mode = WAL");

db.exec(`
CREATE TABLE IF NOT EXISTS shopee_tokens (
  shop_id TEXT PRIMARY KEY,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expire_in INTEGER,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS shopee_conversations (
  conversation_id TEXT PRIMARY KEY,
  shop_id TEXT NOT NULL,
  to_id TEXT,
  to_name TEXT,
  to_avatar TEXT,
  unread_count INTEGER DEFAULT 0,
  pinned INTEGER DEFAULT 0,
  latest_message_id TEXT,
  latest_message_type TEXT,
  latest_message_text TEXT,
  last_message_timestamp INTEGER DEFAULT 0,
  raw_json TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS shopee_messages (
  message_id TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL,
  shop_id TEXT NOT NULL,
  message_type TEXT,
  from_id TEXT,
  to_id TEXT,
  created_timestamp INTEGER,
  content_text TEXT,
  raw_json TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS shopee_webhook_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_key TEXT,
  payload TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_msg_conversation_ts
ON shopee_messages(conversation_id, created_timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_conv_shop_ts
ON shopee_conversations(shop_id, last_message_timestamp DESC);
`);

export function nowIso() {
  return new Date().toISOString();
}
