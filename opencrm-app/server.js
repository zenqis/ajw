import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.OPENCRM_PORT || process.env.PORT || 3025);
const dataDir = path.join(__dirname, "data");
const dbPath = path.join(dataDir, "opencrm.json");
const publicDir = path.join(__dirname, "public");

fs.mkdirSync(dataDir, { recursive: true });

function id(prefix) {
  return `${prefix}_${crypto.randomUUID().slice(0, 8)}`;
}

function nowIso() {
  return new Date().toISOString();
}

function daysAgo(days) {
  return new Date(Date.now() - days * 86400000).toISOString();
}

function seedState() {
  return {
    schema_version: 2,
    users: [{ id: "usr_owner", name: "OpenCRM Owner", email: "owner@opencrm.local", role: "admin" }],
    customers: [],
    conversations: [],
    messages: {},
    agents: [],
    deals: [],
    stages: ["New Lead", "Qualified", "Proposal", "Won", "Follow Up"],
    knowledge: [],
    flows: [{ id: "flow_default", name: "Default WhatsApp AI Handover", active: false, nodes: ["trigger", "ai_response", "condition", "handover", "end"], executions: 0 }],
    products: [],
    orders: [],
    broadcasts: [],
    webhook_events: [],
    settings: {
      ai_mode: "hybrid",
      provider: "growthcircle",
      verify_token: process.env.META_VERIFY_TOKEN || process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || "opencrm-ajw-verify",
      moonwa_endpoint_text: process.env.MOONWA_SEND_TEXT_URL || "https://api.moonwa.id/api/send-message",
      moonwa_endpoint_media: process.env.MOONWA_SEND_MEDIA_URL || "https://api.moonwa.id/api/send-media",
      moonwa_auto_reply: false
    },
    created_at: nowIso()
  };
}

function loadState() {
  if (!fs.existsSync(dbPath)) {
    const state = seedState();
    fs.writeFileSync(dbPath, JSON.stringify(state, null, 2));
    return state;
  }
  try {
    const parsed = JSON.parse(fs.readFileSync(dbPath, "utf8"));
    if (parsed.schema_version !== 2 || parsed.customers?.some((c) => ["cus_andi", "cus_sari", "cus_bima", "cus_maya"].includes(c.id))) {
      const fresh = seedState();
      fs.writeFileSync(dbPath, JSON.stringify(fresh, null, 2));
      return fresh;
    }
    return { ...seedState(), ...parsed };
  } catch {
    return seedState();
  }
}

let state = loadState();

function saveState() {
  fs.writeFileSync(dbPath, JSON.stringify(state, null, 2));
}

function send(res, status, data, headers = {}) {
  const body = typeof data === "string" ? data : JSON.stringify(data);
  res.writeHead(status, {
    "Content-Type": typeof data === "string" ? "text/plain; charset=utf-8" : "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    ...headers
  });
  res.end(body);
}

function readBody(req) {
  return new Promise((resolve) => {
    let raw = "";
    req.on("data", (chunk) => { raw += chunk; });
    req.on("end", () => {
      if (!raw) return resolve({ raw: "", data: {} });
      try { resolve({ raw, data: JSON.parse(raw) }); } catch { resolve({ raw, data: { raw } }); }
    });
  });
}

function getCustomer(customerId) {
  return state.customers.find((c) => c.id === customerId) || null;
}

function publicBase(req) {
  const configured = String(process.env.API_PUBLIC_URL || process.env.BACKEND_URL || "").replace(/\/$/, "");
  if (configured) return configured;
  const host = req.headers["x-forwarded-host"] || req.headers.host || `localhost:${port}`;
  const proto = req.headers["x-forwarded-proto"] || "http";
  return `${proto}://${host}`.replace(/\/$/, "");
}

function webhookConfig(req) {
  const token = String(process.env.META_VERIFY_TOKEN || process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || state.settings.verify_token || "opencrm-ajw-verify");
  const base = publicBase(req);
  return {
    callback_url: `${base}/api/webhooks/whatsapp`,
    v1_callback_url: `${base}/api/v1/webhooks/whatsapp`,
    waha_webhook_url: `${base}/api/webhooks/waha`,
    waha_v1_webhook_url: `${base}/api/v1/webhooks/waha`,
    waha_docker_host_url: `http://host.docker.internal:${port}/api/webhooks/waha`,
    moonwa_webhook_url: `${base}/api/webhooks/moonwa`,
    moonwa_v1_webhook_url: `${base}/api/v1/webhooks/moonwa`,
    moonwa_test_url: `${base}/api/webhooks/moonwa/test`,
    moonwa_send_text_api: `${base}/api/moonwa/send-text`,
    moonwa_send_media_api: `${base}/api/moonwa/send-media`,
    verify_token: token,
    verify_token_ready: Boolean(token),
    waha_hmac_enabled: Boolean(process.env.WAHA_WEBHOOK_SECRET || process.env.WHATSAPP_HOOK_HMAC_KEY),
    whatsapp_ready: Boolean(process.env.WHATSAPP_ACCESS_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID),
    waba_id: process.env.WHATSAPP_WABA_ID || "",
    phone_number_id: process.env.WHATSAPP_PHONE_NUMBER_ID || "",
    moonwa_ready: Boolean(process.env.MOONWA_API_KEY || state.settings.moonwa_api_key),
    moonwa_auto_reply: Boolean(state.settings.moonwa_auto_reply)
  };
}

function summarizeWhatsAppPayload(payload) {
  const entries = Array.isArray(payload.entry) ? payload.entry : [];
  const summary = { messages: 0, statuses: 0, contacts: 0, text: "", phone_number_ids: [] };
  const phones = new Set();
  const samples = [];
  for (const entry of entries) {
    for (const change of Array.isArray(entry.changes) ? entry.changes : []) {
      const value = change.value || {};
      if (value.metadata?.phone_number_id) phones.add(String(value.metadata.phone_number_id));
      const contacts = Array.isArray(value.contacts) ? value.contacts : [];
      const messages = Array.isArray(value.messages) ? value.messages : [];
      const statuses = Array.isArray(value.statuses) ? value.statuses : [];
      summary.contacts += contacts.length;
      summary.messages += messages.length;
      summary.statuses += statuses.length;
      for (const msg of messages) {
        const text = msg.text?.body || msg.button?.text || msg.interactive?.button_reply?.title || msg.type || "";
        if (text) samples.push(text);
      }
      for (const st of statuses) samples.push(`status:${st.status || st.id || "unknown"}`);
    }
  }
  summary.phone_number_ids = Array.from(phones);
  summary.text = samples.slice(0, 3).join(" | ");
  return summary;
}

function verifyWahaHmac(req, raw) {
  const secret = String(process.env.WAHA_WEBHOOK_SECRET || process.env.WHATSAPP_HOOK_HMAC_KEY || "").trim();
  if (!secret) return true;
  const incoming = String(req.headers["x-webhook-hmac"] || "").trim();
  const algo = String(req.headers["x-webhook-hmac-algorithm"] || "sha512").trim().toLowerCase();
  if (!incoming) return false;
  if (!["sha256", "sha384", "sha512"].includes(algo)) return false;
  const digest = crypto.createHmac(algo, secret).update(raw || "").digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(incoming));
  } catch {
    return false;
  }
}

function normalizeWahaPayload(body) {
  const payload = body?.payload || {};
  const fromMe = Boolean(payload.fromMe);
  const chatId = String(payload.chatId || payload.from || payload.to || "");
  const contactId = String(payload.from || payload.author || chatId || body.session || "unknown");
  const name = String(payload._data?.notifyName || payload.notifyName || payload.pushName || payload.sender?.pushName || payload.from || chatId || "WhatsApp Contact");
  const text = String(
    payload.body ||
      payload.text ||
      payload.caption ||
      payload.message?.conversation ||
      payload.message?.extendedTextMessage?.text ||
      payload._data?.body ||
      body.event ||
      "WAHA event"
  );
  const messageId = String(payload.id || payload._data?.id?.id || body.id || id("waha_msg"));
  return {
    source: "waha",
    event: String(body.event || "message"),
    session: String(body.session || "default"),
    contact_id: contactId,
    chat_id: chatId,
    name,
    text,
    message_id: messageId,
    from_me: fromMe,
    timestamp: Number(body.timestamp || payload.timestamp || Date.now())
  };
}

function normalizeMoonwaPayload(body) {
  const text = String(
    body.message ||
      body.text ||
      body.body ||
      body.caption ||
      body.messages ||
      body?.data?.message ||
      body?.data?.text ||
      ""
  );
  const from = String(body.from || body.sender || body.phone || body.number || body?.data?.from || body?.data?.phone || "unknown");
  const name = String(body.name || body.pushName || body.senderName || body?.data?.name || from || "MoonWA Contact");
  const messageId = String(body.id || body.message_id || body.msgId || body?.data?.id || id("moonwa_msg"));
  return {
    source: "moonwa",
    event: "message",
    session: String(body.session || body.device || body.instance || "moonwa"),
    contact_id: from,
    chat_id: from,
    name,
    text: text || "MoonWA inbound message",
    message_id: messageId,
    from_me: Boolean(body.isMe || body.fromMe),
    is_group: Boolean(body.isGroup),
    raw_type: String(body.type || body.message_type || "text")
  };
}

function upsertInboundMessage(normalized) {
  let customer = state.customers.find((c) => c.external_id === normalized.contact_id || c.phone === normalized.contact_id || c.phone === normalized.chat_id);
  if (!customer) {
    customer = {
      id: id("cus"),
      external_id: normalized.contact_id,
      name: normalized.name || normalized.contact_id || "WhatsApp Contact",
      phone: normalized.contact_id,
      channel: normalized.source === "waha" ? "WAHA" : normalized.source === "moonwa" ? "MoonWA" : "WhatsApp",
      level: "Unclassified",
      stage: "New Lead",
      tags: [normalized.source],
      revenue: 0,
      last_seen: nowIso()
    };
    state.customers.unshift(customer);
  }
  customer.last_seen = nowIso();
  if (normalized.name && /^WhatsApp Contact$/.test(customer.name)) customer.name = normalized.name;

  let conversation = state.conversations.find((c) => c.customer_id === customer.id && c.channel === customer.channel && c.status !== "resolved");
  if (!conversation) {
    conversation = {
      id: id("conv"),
      customer_id: customer.id,
      channel: customer.channel,
      status: "open",
      priority: "normal",
      assigned_to: "Unassigned",
      unread: 0,
      ai_confidence: 0,
      last_message: "",
      updated_at: nowIso()
    };
    state.conversations.unshift(conversation);
    state.messages[conversation.id] = [];
  }
  const exists = (state.messages[conversation.id] || []).some((m) => m.provider_message_id === normalized.message_id);
  if (!exists) {
    const sender = normalized.from_me ? "agent" : "customer";
    const msg = {
      id: id("msg"),
      provider_message_id: normalized.message_id,
      sender,
      text: normalized.text,
      created_at: nowIso()
    };
    state.messages[conversation.id] = state.messages[conversation.id] || [];
    state.messages[conversation.id].push(msg);
    conversation.last_message = normalized.text;
    conversation.updated_at = nowIso();
    if (!normalized.from_me) conversation.unread += 1;
    conversation.status = "open";
  }
  return { customer, conversation };
}

function moonwaWebhookResponse(normalized) {
  if (!state.settings.moonwa_auto_reply) {
    return { status: "success", data: false };
  }
  const text = String(normalized.text || "").trim().toLowerCase();
  if (text === "ping") {
    return {
      status: "success",
      data: JSON.stringify({
        message_type: "text",
        message: { message: "pong" }
      })
    };
  }
  return { status: "success", data: false };
}

async function postJson(url, body, headers = {}) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body)
  });
  const text = await response.text();
  let data = {};
  try { data = text ? JSON.parse(text) : {}; } catch { data = { raw: text }; }
  if (!response.ok) throw new Error(data.error || data.message || response.statusText);
  return data;
}

async function sendMoonwaText(body) {
  const apiKey = String(body.api_key || process.env.MOONWA_API_KEY || state.settings.moonwa_api_key || "").trim();
  const endpoint = String(body.endpoint || process.env.MOONWA_SEND_TEXT_URL || state.settings.moonwa_endpoint_text || "https://api.moonwa.id/api/send-message").trim();
  const to = String(body.to || body.phone || body.number || "").trim();
  const message = String(body.message || body.text || "").trim();
  if (!to) throw new Error("to/phone wajib");
  if (!message) throw new Error("message wajib");
  const payload = { ...body, to, phone: to, number: to, message, text: message };
  if (apiKey) {
    payload.api_key = apiKey;
    payload.apiKey = apiKey;
    payload.token = apiKey;
  }
  return postJson(endpoint, payload);
}

async function sendMoonwaMedia(body) {
  const apiKey = String(body.api_key || process.env.MOONWA_API_KEY || state.settings.moonwa_api_key || "").trim();
  const endpoint = String(body.endpoint || process.env.MOONWA_SEND_MEDIA_URL || state.settings.moonwa_endpoint_media || "https://api.moonwa.id/api/send-media").trim();
  const to = String(body.to || body.phone || body.number || "").trim();
  const url = String(body.url || body.media_url || body.media || "").trim();
  if (!to) throw new Error("to/phone wajib");
  if (!url) throw new Error("url/media_url wajib");
  const payload = { ...body, to, phone: to, number: to, url, media_url: url };
  if (apiKey) {
    payload.api_key = apiKey;
    payload.apiKey = apiKey;
    payload.token = apiKey;
  }
  return postJson(endpoint, payload);
}

function dashboardMetrics() {
  const open = state.conversations.filter((c) => c.status === "open").length;
  const pending = state.conversations.filter((c) => c.status === "pending").length;
  const resolved = state.conversations.filter((c) => c.status === "resolved").length;
  const revenue = state.orders.reduce((sum, o) => sum + Number(o.amount || 0), 0);
  const dayLabels = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
  const volume = dayLabels.map((day) => ({ day, ai: 0, cs: 0, handover: 0, total: 0 }));
  for (const conv of state.conversations) {
    const d = new Date(conv.updated_at || Date.now());
    const idx = (d.getDay() + 6) % 7;
    volume[idx].total += 1;
    if (String(conv.assigned_to || "").toLowerCase().includes("ai")) volume[idx].ai += 1;
    else if (String(conv.status || "") === "pending") volume[idx].handover += 1;
    else volume[idx].cs += 1;
  }
  const agentMap = new Map();
  for (const conv of state.conversations) {
    const name = conv.assigned_to && conv.assigned_to !== "Unassigned" ? conv.assigned_to : "Unassigned";
    const row = agentMap.get(name) || { id: `agt_${name.toLowerCase().replace(/[^a-z0-9]+/g, "_")}`, name, role: name === "Unassigned" ? "Queue" : "Agent", online: false, chats: 0, csat: 0, revenue: 0 };
    row.chats += 1;
    agentMap.set(name, row);
  }
  return {
    cards: {
      incomingChats: state.conversations.length,
      aiResolvedRate: state.conversations.length ? Math.round((resolved / state.conversations.length) * 1000) / 10 : 0,
      avgResponseSeconds: 0,
      revenue
    },
    volume,
    funnel: state.stages.map((stage) => ({
      label: stage,
      value: state.deals.filter((d) => d.stage === stage).length,
      amount: state.deals.filter((d) => d.stage === stage).reduce((s, d) => s + Number(d.value || 0), 0)
    })),
    agents: state.agents.length ? state.agents : Array.from(agentMap.values()),
    alerts: [
      state.conversations.length
        ? { id: "al_live", tone: "success", title: "Webhook menerima data", description: `${state.conversations.length} conversation tersimpan dari channel aktif.` }
        : { id: "al_empty", tone: "warning", title: "Belum ada conversation", description: "Tempel URL webhook di WAHA atau Meta WhatsApp, lalu kirim pesan test." },
      pending > 0
        ? { id: "al_pending", tone: "danger", title: "Handover pending", description: `${pending} conversation menunggu agent manusia.` }
        : { id: "al_clear", tone: "success", title: "Handover bersih", description: "Tidak ada queue handover pending." }
    ],
    counts: { open, pending, resolved }
  };
}

function serveStatic(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  let pathname = decodeURIComponent(url.pathname);
  if (pathname === "/") pathname = "/index.html";
  const filePath = path.resolve(publicDir, `.${pathname}`);
  if (!filePath.startsWith(publicDir)) return send(res, 403, "Forbidden");
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    const fallback = path.join(publicDir, "index.html");
    return fs.createReadStream(fallback).pipe(res);
  }
  const ext = path.extname(filePath).toLowerCase();
  const types = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".svg": "image/svg+xml"
  };
  res.writeHead(200, { "Content-Type": types[ext] || "application/octet-stream" });
  fs.createReadStream(filePath).pipe(res);
}

async function handleApi(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const method = req.method || "GET";
  const parts = url.pathname.split("/").filter(Boolean);
  const read = method === "GET" ? { raw: "", data: {} } : await readBody(req);
  const body = read.data;
  const rawBody = read.raw;

  if (url.pathname === "/health") return send(res, 200, { ok: true, name: "OpenCRM", time: nowIso() });

  if (method === "POST" && url.pathname === "/api/auth/login") {
    return send(res, 200, { ok: true, token: "local-demo-token", user: state.users[0] });
  }
  if (url.pathname === "/api/auth/me") return send(res, 200, { ok: true, user: state.users[0], organization: { id: "org_demo", name: "OpenCRM Workspace" } });

  if (url.pathname === "/api/metrics/dashboard") return send(res, 200, { ok: true, data: dashboardMetrics() });
  if (url.pathname === "/api/agents") return send(res, 200, { ok: true, data: state.agents });
  if (url.pathname === "/api/customers") {
    if (method === "POST") {
      const row = { id: id("cus"), name: body.name || "Customer Baru", phone: body.phone || "", channel: body.channel || "WhatsApp", level: body.level || "Unclassified", stage: body.stage || "New Lead", tags: [], revenue: 0, last_seen: nowIso() };
      state.customers.unshift(row);
      saveState();
      return send(res, 200, { ok: true, data: row });
    }
    return send(res, 200, { ok: true, data: state.customers });
  }

  if (url.pathname === "/api/conversations") {
    const status = url.searchParams.get("status") || "";
    const data = state.conversations
      .filter((c) => status ? c.status === status : true)
      .map((c) => ({ ...c, customer: getCustomer(c.customer_id) }))
      .sort((a, b) => String(b.updated_at).localeCompare(String(a.updated_at)));
    return send(res, 200, { ok: true, data });
  }

  if (parts[0] === "api" && parts[1] === "conversations" && parts[2]) {
    const conv = state.conversations.find((c) => c.id === parts[2]);
    if (!conv) return send(res, 404, { ok: false, error: "Conversation tidak ditemukan" });
    if (parts[3] === "messages" && method === "GET") return send(res, 200, { ok: true, data: state.messages[conv.id] || [] });
    if (parts[3] === "messages" && method === "POST") {
      const msg = { id: id("msg"), sender: body.sender || "agent", text: String(body.text || ""), created_at: nowIso() };
      state.messages[conv.id] = state.messages[conv.id] || [];
      state.messages[conv.id].push(msg);
      conv.last_message = msg.text;
      conv.updated_at = nowIso();
      conv.unread = 0;
      saveState();
      return send(res, 200, { ok: true, data: msg });
    }
    if (method === "PATCH") {
      Object.assign(conv, body, { updated_at: nowIso() });
      saveState();
      return send(res, 200, { ok: true, data: conv });
    }
  }

  if (url.pathname === "/api/pipeline") return send(res, 200, { ok: true, stages: state.stages, deals: state.deals.map((d) => ({ ...d, customer: getCustomer(d.customer_id) })) });
  if (parts[0] === "api" && parts[1] === "deals" && parts[2] && method === "PATCH") {
    const deal = state.deals.find((d) => d.id === parts[2]);
    if (!deal) return send(res, 404, { ok: false, error: "Deal tidak ditemukan" });
    Object.assign(deal, body);
    saveState();
    return send(res, 200, { ok: true, data: deal });
  }

  if (url.pathname === "/api/knowledge") {
    if (method === "POST") {
      const row = { id: id("kb"), title: body.title || "Knowledge baru", type: body.type || "Text", status: "ready", chunks: 1, updated_at: nowIso() };
      state.knowledge.unshift(row);
      saveState();
      return send(res, 200, { ok: true, data: row });
    }
    return send(res, 200, { ok: true, data: state.knowledge });
  }
  if (url.pathname === "/api/flows") return send(res, 200, { ok: true, data: state.flows });
  if (url.pathname === "/api/products") return send(res, 200, { ok: true, data: state.products });
  if (url.pathname === "/api/orders") return send(res, 200, { ok: true, data: state.orders.map((o) => ({ ...o, customer: getCustomer(o.customer_id) })) });

  if (url.pathname === "/api/ai/generate" && method === "POST") {
    const prompt = String(body.prompt || "");
    return send(res, 200, {
      ok: true,
      data: {
        provider: state.settings.provider,
        confidence: 88,
        text: `Terima kasih sudah menghubungi kami. Berdasarkan konteks OpenCRM, jawaban terbaik untuk: "${prompt.slice(0, 120)}" adalah menawarkan bantuan spesifik, konfirmasi kebutuhan pelanggan, lalu arahkan ke agent jika butuh validasi stok atau pembayaran.`
      }
    });
  }

  if (url.pathname === "/api/webhook-events") return send(res, 200, { ok: true, data: state.webhook_events.slice(0, 80) });
  if (url.pathname === "/api/waba/webhook-config" || url.pathname === "/api/v1/waba/webhook-config") return send(res, 200, { ok: true, data: webhookConfig(req), ...webhookConfig(req) });

  if (url.pathname === "/api/moonwa/config" && method === "GET") {
    return send(res, 200, {
      ok: true,
      data: {
        webhook: webhookConfig(req),
        send_text_endpoint: state.settings.moonwa_endpoint_text,
        send_media_endpoint: state.settings.moonwa_endpoint_media,
        api_key_ready: Boolean(process.env.MOONWA_API_KEY || state.settings.moonwa_api_key),
        auto_reply: Boolean(state.settings.moonwa_auto_reply)
      }
    });
  }

  if (url.pathname === "/api/moonwa/config" && method === "POST") {
    state.settings.moonwa_api_key = String(body.api_key || state.settings.moonwa_api_key || "").trim();
    state.settings.moonwa_endpoint_text = String(body.send_text_endpoint || body.endpoint_text || state.settings.moonwa_endpoint_text || "").trim();
    state.settings.moonwa_endpoint_media = String(body.send_media_endpoint || body.endpoint_media || state.settings.moonwa_endpoint_media || "").trim();
    state.settings.moonwa_auto_reply = Boolean(body.auto_reply);
    saveState();
    return send(res, 200, { ok: true, data: { api_key_ready: Boolean(state.settings.moonwa_api_key), auto_reply: state.settings.moonwa_auto_reply } });
  }

  if (url.pathname === "/api/moonwa/send-text" && method === "POST") {
    try {
      const data = body.dry_run ? { dry_run: true, payload: body } : await sendMoonwaText(body);
      return send(res, 200, { ok: true, data });
    } catch (err) {
      return send(res, 400, { ok: false, error: String(err.message || err) });
    }
  }

  if (url.pathname === "/api/moonwa/send-media" && method === "POST") {
    try {
      const data = body.dry_run ? { dry_run: true, payload: body } : await sendMoonwaMedia(body);
      return send(res, 200, { ok: true, data });
    } catch (err) {
      return send(res, 400, { ok: false, error: String(err.message || err) });
    }
  }

  if ((url.pathname === "/api/webhooks/whatsapp" || url.pathname === "/api/v1/webhooks/whatsapp") && method === "GET") {
    const expected = webhookConfig(req).verify_token;
    const mode = url.searchParams.get("hub.mode") || url.searchParams.get("mode");
    const token = url.searchParams.get("hub.verify_token") || url.searchParams.get("verify_token");
    const challenge = url.searchParams.get("hub.challenge") || url.searchParams.get("challenge") || "";
    if (mode === "subscribe" && token === expected) return send(res, 200, challenge);
    return send(res, 403, { ok: false, error: "Verify token tidak cocok" });
  }

  if ((url.pathname === "/api/webhooks/whatsapp" || url.pathname === "/api/v1/webhooks/whatsapp") && method === "POST") {
    const summary = summarizeWhatsAppPayload(body);
    const event = { id: id("wh"), event: "whatsapp.inbound", summary, payload: body, created_at: nowIso() };
    state.webhook_events.unshift(event);
    state.webhook_events = state.webhook_events.slice(0, 500);
    if (summary.messages > 0) {
      const entry = (body.entry || [])[0] || {};
      const change = (entry.changes || [])[0] || {};
      const value = change.value || {};
      const contact = (value.contacts || [])[0] || {};
      const msg = (value.messages || [])[0] || {};
      upsertInboundMessage({
        source: "meta",
        event: "message",
        session: value.metadata?.phone_number_id || "meta",
        contact_id: contact.wa_id || msg.from || "unknown",
        chat_id: msg.from || contact.wa_id || "unknown",
        name: contact.profile?.name || contact.wa_id || msg.from || "WhatsApp Contact",
        text: msg.text?.body || msg.button?.text || msg.type || "WhatsApp inbound message",
        message_id: msg.id || id("meta_msg"),
        from_me: false,
        timestamp: Number(msg.timestamp || Date.now())
      });
    }
    saveState();
    return send(res, 200, { ok: true, success: true, summary });
  }

  if ((url.pathname === "/api/webhooks/waha" || url.pathname === "/api/v1/webhooks/waha") && method === "GET") {
    return send(res, 200, { ok: true, provider: "WAHA", accepted_events: ["message", "message.any", "session.status", "message.ack"], ...webhookConfig(req) });
  }

  if ((url.pathname === "/api/webhooks/waha" || url.pathname === "/api/v1/webhooks/waha") && method === "POST") {
    if (!verifyWahaHmac(req, rawBody)) return send(res, 401, { ok: false, error: "WAHA HMAC tidak valid" });
    const normalized = normalizeWahaPayload(body);
    const result = normalized.from_me || !/^message/.test(normalized.event)
      ? { customer: null, conversation: null }
      : upsertInboundMessage(normalized);
    const event = {
      id: id("waha"),
      event: `waha.${normalized.event}`,
      session: normalized.session,
      summary: {
        event: normalized.event,
        session: normalized.session,
        chat_id: normalized.chat_id,
        from_me: normalized.from_me,
        text: normalized.text,
        conversation_id: result.conversation?.id || ""
      },
      payload: body,
      created_at: nowIso()
    };
    state.webhook_events.unshift(event);
    state.webhook_events = state.webhook_events.slice(0, 500);
    saveState();
    return send(res, 200, { ok: true, success: true, data: event.summary });
  }

  if ((url.pathname === "/api/webhooks/moonwa" || url.pathname === "/api/v1/webhooks/moonwa") && method === "GET") {
    return send(res, 200, { ok: true, provider: "MoonWA", accepted_fields: ["message", "from", "isGroup", "isMe"], ...webhookConfig(req) });
  }

  if ((url.pathname === "/api/webhooks/moonwa" || url.pathname === "/api/v1/webhooks/moonwa") && method === "POST") {
    const normalized = normalizeMoonwaPayload(body);
    const result = normalized.from_me || normalized.is_group
      ? { customer: null, conversation: null }
      : upsertInboundMessage(normalized);
    const event = {
      id: id("moonwa"),
      event: "moonwa.message",
      session: normalized.session,
      summary: {
        from: normalized.contact_id,
        is_group: normalized.is_group,
        is_me: normalized.from_me,
        text: normalized.text,
        conversation_id: result.conversation?.id || ""
      },
      payload: body,
      created_at: nowIso()
    };
    state.webhook_events.unshift(event);
    state.webhook_events = state.webhook_events.slice(0, 500);
    saveState();
    return send(res, 200, moonwaWebhookResponse(normalized));
  }

  if (url.pathname === "/api/webhooks/moonwa/test" && method === "POST") {
    const normalized = normalizeMoonwaPayload({
      message: body.message || "ping",
      from: body.from || "6280000000000",
      isGroup: false,
      isMe: false,
      id: `moonwa_test_${Date.now()}`
    });
    const response = moonwaWebhookResponse(normalized);
    return send(res, 200, {
      ok: true,
      dry_run: true,
      note: "Uji webhook tidak menyimpan customer/conversation.",
      normalized,
      moonwa_response: response
    });
  }

  return send(res, 404, { ok: false, error: "Route tidak ditemukan" });
}

const server = http.createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization,X-App-Id,X-Org-Slug");
  if (req.method === "OPTIONS") return send(res, 204, "");
  if (req.url.startsWith("/api/") || req.url === "/health") {
    handleApi(req, res).catch((err) => send(res, 500, { ok: false, error: String(err.message || err) }));
    return;
  }
  serveStatic(req, res);
});

server.listen(port, () => {
  console.log(`OpenCRM running on http://localhost:${port}`);
  console.log(`WhatsApp webhook: http://localhost:${port}/api/webhooks/whatsapp`);
});
