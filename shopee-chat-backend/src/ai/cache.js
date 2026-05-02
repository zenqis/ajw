import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const isVercel = Boolean(process.env.VERCEL || process.env.VERCEL_URL);
const defaultPath = isVercel
  ? "/tmp/ajw_ai_gateway_cache.json"
  : path.resolve(process.cwd(), "./data/ajw_ai_gateway_cache.json");
const cachePath = process.env.AI_CACHE_PATH || defaultPath;

let state = { entries: {} };

try {
  fs.mkdirSync(path.dirname(cachePath), { recursive: true });
  if (fs.existsSync(cachePath)) {
    state = JSON.parse(fs.readFileSync(cachePath, "utf8") || "{\"entries\":{}}");
    if (!state || typeof state !== "object" || !state.entries || typeof state.entries !== "object") {
      state = { entries: {} };
    }
  }
} catch {
  state = { entries: {} };
}

function persist() {
  try {
    fs.writeFileSync(cachePath, JSON.stringify(state, null, 2), "utf8");
  } catch {
    // Ignore cache persistence failures; runtime can still continue uncached.
  }
}

function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (!value || typeof value !== "object") return value;
  return Object.keys(value)
    .sort()
    .reduce((acc, key) => {
      acc[key] = stable(value[key]);
      return acc;
    }, {});
}

function prune(maxEntries = 300) {
  const rows = Object.entries(state.entries || {}).sort((a, b) => {
    return Number((b[1] && b[1].createdAt) || 0) - Number((a[1] && a[1].createdAt) || 0);
  });
  if (rows.length <= maxEntries) return;
  state.entries = rows.slice(0, maxEntries).reduce((acc, [key, value]) => {
    acc[key] = value;
    return acc;
  }, {});
  persist();
}

export function createCacheKey(input) {
  return crypto.createHash("sha256").update(JSON.stringify(stable(input))).digest("hex");
}

export function getCachedValue(key) {
  const row = state.entries[key];
  if (!row) return null;
  if (row.expiresAt && row.expiresAt < Date.now()) {
    delete state.entries[key];
    persist();
    return null;
  }
  return row;
}

export function setCachedValue(key, value, { ttlMs = 1000 * 60 * 60 * 24 * 14, meta = {} } = {}) {
  state.entries[key] = {
    key,
    createdAt: Date.now(),
    expiresAt: ttlMs > 0 ? Date.now() + ttlMs : 0,
    meta,
    value
  };
  prune();
  persist();
  return state.entries[key];
}
