const state = {
  route: location.hash.replace("#/", "") || "dashboard",
  data: {},
  selectedConversation: "",
  dark: localStorage.getItem("opencrm_theme") === "dark"
};

const navGroups = [
  {
    label: "Operasional",
    items: [
      ["dashboard", "Dashboard", "D"],
      ["inbox", "Inbox", "I"],
      ["handover", "Handover", "H"],
      ["orders", "Orders", "O"]
    ]
  },
  {
    label: "Data",
    items: [
      ["customers", "Pelanggan", "P"],
      ["products", "Products", "PR"],
      ["pipeline", "CRM Pipeline", "C"]
    ]
  },
  {
    label: "Otomasi",
    items: [
      ["flows", "Workflow", "W"],
      ["ai", "AI Playground", "AI"],
      ["knowledge", "Knowledge Base", "K"],
      ["broadcast", "Broadcast", "B"]
    ]
  },
  {
    label: "System",
    items: [
      ["settings", "Settings", "S"],
      ["developer", "Developer", "DV"]
    ]
  }
];

const pageMeta = {
  dashboard: ["Dashboard", "Ringkasan chat, AI, revenue, agent, dan alert operasional."],
  inbox: ["Inbox", "Unified inbox multi-channel dengan AI assist dan handover."],
  handover: ["Handover", "Queue percakapan dari AI ke human agent."],
  orders: ["Orders", "Order, invoice, pembayaran, dan konteks commerce dari chat."],
  customers: ["Pelanggan", "Customer profile, level, tag, dan riwayat kontak."],
  products: ["Products", "Catalog, variants, stock, dan harga."],
  pipeline: ["CRM Pipeline", "Kanban stage untuk lead dan deal dari conversation."],
  flows: ["Workflow", "Visual flow builder trigger, AI, condition, handover, dan action."],
  ai: ["AI Playground", "Simulasi response AI dengan provider dan confidence."],
  knowledge: ["Knowledge Base", "Sources, FAQ, chunking, embedding, dan status indexing."],
  broadcast: ["Broadcast", "Audience targeting, template, preview, dan tracking."],
  settings: ["Settings", "Integrasi WhatsApp, AI mode, dan workspace config."],
  developer: ["Developer", "Webhook event, API endpoint, dan kontrak integrasi."]
};

function esc(value) {
  return String(value == null ? "" : value).replace(/[&<>"']/g, (ch) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[ch]);
}

function rupiah(value) {
  return "Rp " + Number(value || 0).toLocaleString("id-ID");
}

function shortTime(value) {
  if (!value) return "-";
  return new Date(value).toLocaleString("id-ID", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

function toast(message) {
  const el = document.getElementById("toast");
  el.textContent = message;
  el.classList.add("show");
  clearTimeout(toast.t);
  toast.t = setTimeout(() => el.classList.remove("show"), 2600);
}

async function api(path, options = {}) {
  const res = await fetch(path, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options.headers || {}) }
  });
  const text = await res.text();
  let data = {};
  try { data = text ? JSON.parse(text) : {}; } catch { data = { raw: text }; }
  if (!res.ok || data.ok === false) throw new Error(data.error || res.statusText);
  return data;
}

function avatar(name, size = 32) {
  const initials = String(name || "OC").split(/\s+/).filter(Boolean).slice(0, 2).map((x) => x[0]).join("").toUpperCase();
  const palettes = [
    ["#d97706", "#7c2d12"],
    ["#0f766e", "#164e63"],
    ["#9333ea", "#4c1d95"],
    ["#dc2626", "#7f1d1d"],
    ["#0369a1", "#1e3a8a"],
    ["#65a30d", "#3f6212"],
    ["#c026d3", "#701a75"]
  ];
  let hash = 0;
  for (const ch of String(name || "")) hash = (hash + ch.charCodeAt(0)) % palettes.length;
  const p = palettes[hash];
  return `<div class="ocm-avatar" style="width:${size}px;height:${size}px;background:linear-gradient(135deg,${p[0]},${p[1]})">${esc(initials || "O")}</div>`;
}

function setRoute(route) {
  location.hash = "#/" + route;
}

function currentItems() {
  return navGroups.flatMap((g) => g.items);
}

function renderNav() {
  const nav = document.getElementById("nav");
  nav.innerHTML = navGroups.map((group) => `
    <div class="ocm-nav-group">
      <div class="ocm-nav-label">${group.label}</div>
      ${group.items.map((item) => `
        <a href="#/${item[0]}" class="${state.route === item[0] ? "active" : ""}">
          <span class="ocm-nav-icon">${item[2]}</span>
          <span>${item[1]}</span>
        </a>
      `).join("")}
    </div>
  `).join("");

  const bottomItems = ["dashboard", "inbox", "pipeline", "ai", "settings"].map((key) => currentItems().find((x) => x[0] === key));
  document.getElementById("bottomNav").innerHTML = bottomItems.map((item) => `
    <a href="#/${item[0]}" class="${state.route === item[0] ? "active" : ""}">
      <span>${item[2]}</span><span>${item[1]}</span>
    </a>
  `).join("");
}

function setPageMeta() {
  const meta = pageMeta[state.route] || pageMeta.dashboard;
  document.getElementById("pageTitle").textContent = meta[0];
  document.getElementById("pageSubtitle").textContent = meta[1];
}

function shellLoading() {
  document.getElementById("view").innerHTML = `<section class="ocm-card"><div class="ocm-card-body">Memuat OpenCRM...</div></section>`;
}

function sectionHead(title, subtitle, action = "") {
  return `
    <div class="ocm-section-head">
      <div><h2>${esc(title)}</h2><p>${esc(subtitle)}</p></div>
      <div>${action}</div>
    </div>
  `;
}

function statCard(label, value, delta, tag = "") {
  return `
    <section class="ocm-card ocm-stat">
      <div class="label"><span>${esc(label)}</span>${tag ? `<span class="ocm-tag">${esc(tag)}</span>` : ""}</div>
      <div class="value">${esc(value)}</div>
      <div class="delta">${esc(delta)}</div>
    </section>
  `;
}

function emptyState(title, body, action = "") {
  return `
    <div class="ocm-empty">
      <div class="ocm-empty-icon">O</div>
      <strong>${esc(title)}</strong>
      <p>${esc(body)}</p>
      ${action}
    </div>
  `;
}

async function renderDashboard() {
  const { data } = await api("/api/metrics/dashboard");
  const cards = data.cards;
  const maxVolume = Math.max(...data.volume.map((x) => x.total), 1);
  const hasConversations = cards.incomingChats > 0;
  document.getElementById("view").innerHTML = `
    ${sectionHead("Dashboard", "Pantauan performa OpenCRM lintas channel, AI, agent, dan commerce.", `<button class="ocm-btn primary" data-refresh>Refresh</button>`)}
    <div class="ocm-grid-4">
      ${statCard("Chat masuk", String(cards.incomingChats), hasConversations ? "Data dari webhook aktif" : "Belum ada pesan masuk", "7D")}
      ${statCard("AI resolved", cards.aiResolvedRate + "%", hasConversations ? "Dihitung dari conversation resolved" : "Menunggu data conversation", "AI")}
      ${statCard("Avg response", cards.avgResponseSeconds ? cards.avgResponseSeconds + "s" : "-", "Aktif setelah ada response agent", "SLA")}
      ${statCard("Revenue", rupiah(cards.revenue), cards.revenue ? "Tersambung ke order" : "Belum ada order", "Commerce")}
    </div>
    <div class="ocm-grid-2">
      <section class="ocm-card">
        <div class="ocm-card-header"><h3 class="ocm-card-title">Chat Volume</h3><div><span class="ocm-tag">AI</span> <span class="ocm-tag success">CS</span> <span class="ocm-tag warning">Handover</span></div></div>
        <div class="ocm-card-body">
          ${hasConversations ? data.volume.map((row) => `
            <div style="margin-bottom:13px">
              <div style="display:flex;justify-content:space-between;font-size:.78rem;margin-bottom:6px"><strong>${row.day}</strong><span>${row.total}</span></div>
              <div class="ocm-progress-track"><div class="ocm-progress-bar" style="width:${Math.round(row.total / maxVolume * 100)}%"></div></div>
            </div>
          `).join("") : emptyState("Belum ada volume chat", "Tempel webhook URL di WhatsApp/WAHA, lalu kirim pesan untuk mulai mengisi grafik.")}
        </div>
      </section>
      <section class="ocm-card">
        <div class="ocm-card-header"><h3 class="ocm-card-title">Sales Funnel</h3><span class="ocm-tag">CRM</span></div>
        <div class="ocm-card-body">
          ${data.funnel.some((row) => row.value > 0) ? data.funnel.map((row) => `
            <div style="display:flex;align-items:center;justify-content:space-between;border:1px solid var(--ocm-line);border-radius:10px;padding:10px;margin-bottom:9px">
              <div><strong style="font-size:.84rem">${esc(row.label)}</strong><div style="font-size:.72rem;color:var(--ocm-text-muted)">${row.value} deal</div></div>
              <span class="ocm-tag">${rupiah(row.amount)}</span>
            </div>
          `).join("") : emptyState("Pipeline masih kosong", "Deal akan muncul setelah dibuat dari customer atau conversation.")}
        </div>
      </section>
    </div>
    <div class="ocm-grid-2">
      <section class="ocm-card">
        <div class="ocm-card-header"><h3 class="ocm-card-title">Agent Performance</h3></div>
        <div class="ocm-card-body" style="padding:0">
          <table class="ocm-table">
            <thead><tr><th>Agent</th><th>Chats</th><th>CSAT</th><th>Revenue</th></tr></thead>
            <tbody>${data.agents.length ? data.agents.map((a) => `
              <tr><td><div style="display:flex;align-items:center;gap:9px">${avatar(a.name, 26)}<strong>${esc(a.name)}</strong></div></td><td>${a.chats}</td><td>${a.csat}</td><td>${rupiah(a.revenue)}</td></tr>
            `).join("") : `<tr><td colspan="4">${emptyState("Belum ada agent performance", "Data agent akan terisi setelah conversation ditugaskan atau agent dibuat.")}</td></tr>`}</tbody>
          </table>
        </div>
      </section>
      <section class="ocm-card">
        <div class="ocm-card-header"><h3 class="ocm-card-title">Operational Alerts</h3></div>
        <div class="ocm-card-body">${data.alerts.map((a) => `<div class="ocm-alert ${a.tone}"><strong>${esc(a.title)}</strong><span>${esc(a.description)}</span></div>`).join("")}</div>
      </section>
    </div>
  `;
}

async function renderInbox() {
  const convs = (await api("/api/conversations")).data;
  if (!state.selectedConversation && convs[0]) state.selectedConversation = convs[0].id;
  const selected = convs.find((c) => c.id === state.selectedConversation) || convs[0];
  const messages = selected ? (await api(`/api/conversations/${selected.id}/messages`)).data : [];
  document.getElementById("view").innerHTML = `
    <div class="ocm-inbox">
      <section class="ocm-card conv-panel" style="overflow:hidden">
        <div class="ocm-card-header"><h3 class="ocm-card-title">Conversations</h3><span class="ocm-tag">${convs.length}</span></div>
        <div>${convs.length ? convs.map((c) => `
          <div class="ocm-conv ${selected && selected.id === c.id ? "active" : ""}" data-conv="${c.id}">
            ${avatar(c.customer.name, 34)}
            <div style="min-width:0;flex:1">
              <div style="display:flex;justify-content:space-between;gap:8px"><strong>${esc(c.customer.name)}</strong><span class="ocm-tag ${c.status === "open" ? "success" : c.status === "pending" ? "warning" : ""}">${esc(c.status)}</span></div>
              <p>${esc(c.last_message)}</p>
            </div>
          </div>
        `).join("") : emptyState("Inbox masih kosong", "Gunakan halaman Settings untuk mengambil URL webhook, lalu kirim pesan WhatsApp test dari WAHA atau Meta.")}</div>
      </section>
      <section class="ocm-card ocm-chat">
        <div class="ocm-card-header">
          <div><h3 class="ocm-card-title">${selected ? esc(selected.customer.name) : "Conversation"}</h3><span style="font-size:.74rem;color:var(--ocm-text-muted)">${selected ? esc(selected.channel + " - " + selected.assigned_to) : ""}</span></div>
          <div>${selected ? `<span class="ocm-tag">AI ${selected.ai_confidence}%</span>` : ""}</div>
        </div>
        <div class="ocm-messages">
          ${messages.length ? messages.map((m) => `<div class="ocm-message ${esc(m.sender)}"><strong style="font-size:.7rem;text-transform:uppercase">${esc(m.sender)}</strong><br>${esc(m.text)}<div style="font-size:.65rem;color:var(--ocm-text-muted);margin-top:6px">${shortTime(m.created_at)}</div></div>`).join("") : emptyState("Pilih conversation", "Pesan akan tampil di sini setelah webhook menerima chat.")}
        </div>
        <form class="ocm-composer" id="composer">
          <input class="ocm-input" name="text" placeholder="Tulis balasan...">
          <button class="ocm-btn primary">Kirim</button>
        </form>
      </section>
      <section class="ocm-card customer-panel">
        <div class="ocm-card-header"><h3 class="ocm-card-title">Customer Context</h3></div>
        <div class="ocm-card-body">${selected ? `
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px">${avatar(selected.customer.name, 44)}<div><strong>${esc(selected.customer.name)}</strong><div style="font-size:.78rem;color:var(--ocm-text-muted)">${esc(selected.customer.phone)}</div></div></div>
          <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px"><span class="ocm-tag">${esc(selected.customer.level)}</span>${selected.customer.tags.map((t) => `<span class="ocm-tag">${esc(t)}</span>`).join("")}</div>
          <table class="ocm-table"><tr><td>Stage</td><td>${esc(selected.customer.stage)}</td></tr><tr><td>Revenue</td><td>${rupiah(selected.customer.revenue)}</td></tr><tr><td>Last seen</td><td>${shortTime(selected.customer.last_seen)}</td></tr></table>
          <button class="ocm-btn primary" style="width:100%;margin-top:14px" data-ai-reply>Buat AI Reply</button>
        ` : ""}</div>
      </section>
    </div>
  `;
}

async function renderPipeline() {
  const data = await api("/api/pipeline");
  const hasDeals = data.deals.length > 0;
  document.getElementById("view").innerHTML = `
    ${sectionHead("CRM Pipeline", "Drag-style stage board untuk deal dari conversation.", `<button class="ocm-btn primary">New Deal</button>`)}
    ${hasDeals ? `<div class="ocm-kanban">
      ${data.stages.map((stage) => {
        const deals = data.deals.filter((d) => d.stage === stage);
        return `<section class="ocm-column"><div class="ocm-column-head"><span>${esc(stage)}</span><span>${deals.length}</span></div>${deals.map((d) => `
          <article class="ocm-deal">
            <strong>${esc(d.title)}</strong>
            <p>${esc(d.customer.name)} - ${rupiah(d.value)}</p>
            <select class="ocm-select" data-deal="${d.id}">
              ${data.stages.map((s) => `<option value="${esc(s)}" ${s === d.stage ? "selected" : ""}>${esc(s)}</option>`).join("")}
            </select>
          </article>
        `).join("")}</section>`;
      }).join("")}
    </div>` : `<section class="ocm-card"><div class="ocm-card-body">${emptyState("Belum ada deal", "Deal akan muncul setelah dibuat dari customer atau conversation.")}</div></section>`}
  `;
}

async function renderCustomers() {
  const rows = (await api("/api/customers")).data;
  document.getElementById("view").innerHTML = `
    ${sectionHead("Pelanggan", "Profile pelanggan dengan channel, level, tag, stage, dan revenue.", `<button class="ocm-btn primary" data-add-customer>Tambah Customer</button>`)}
    <section class="ocm-card"><div class="ocm-card-body" style="padding:0"><table class="ocm-table">
      <thead><tr><th>Nama</th><th>Channel</th><th>Level</th><th>Stage</th><th>Revenue</th><th>Last Seen</th></tr></thead>
      <tbody>${rows.length ? rows.map((c) => `<tr><td><div style="display:flex;align-items:center;gap:9px">${avatar(c.name, 28)}<strong>${esc(c.name)}</strong></div></td><td>${esc(c.channel)}</td><td><span class="ocm-tag">${esc(c.level)}</span></td><td>${esc(c.stage)}</td><td>${rupiah(c.revenue)}</td><td>${shortTime(c.last_seen)}</td></tr>`).join("") : `<tr><td colspan="6">${emptyState("Belum ada pelanggan", "Customer akan otomatis dibuat saat webhook menerima pesan masuk, atau tambahkan manual.")}</td></tr>`}</tbody>
    </table></div></section>
  `;
}

async function renderKnowledge() {
  const rows = (await api("/api/knowledge")).data;
  document.getElementById("view").innerHTML = `
    ${sectionHead("Knowledge Base", "Sources, FAQ, chunking, embedding, dan RAG retrieval status.", `<button class="ocm-btn primary" data-add-knowledge>Tambah Source</button>`)}
    ${rows.length ? `<div class="ocm-grid-3">${rows.map((k) => `
      <section class="ocm-card"><div class="ocm-card-body">
        <div style="display:flex;justify-content:space-between;gap:8px;margin-bottom:14px"><strong>${esc(k.title)}</strong><span class="ocm-tag ${k.status === "ready" ? "success" : "warning"}">${esc(k.status)}</span></div>
        <p style="margin:0;color:var(--ocm-text-muted);font-size:.8rem">${esc(k.type)} - ${k.chunks} chunks</p>
        <div class="ocm-progress-track" style="margin-top:14px"><div class="ocm-progress-bar" style="width:${k.status === "ready" ? 100 : 54}%"></div></div>
      </div></section>
    `).join("")}</div>` : `<section class="ocm-card"><div class="ocm-card-body">${emptyState("Knowledge base kosong", "Tambahkan source agar AI dapat memakai RAG context.")}</div></section>`}
  `;
}

async function renderFlows() {
  const rows = (await api("/api/flows")).data;
  const flow = rows[0];
  document.getElementById("view").innerHTML = `
    ${sectionHead("Workflow Builder", "Canvas visual mengikuti blueprint React Flow: trigger, AI response, condition, handover, action.", `<button class="ocm-btn primary">Publish Flow</button>`)}
    <section class="ocm-card">
      <div class="ocm-card-header"><h3 class="ocm-card-title">${esc(flow.name)}</h3><span class="ocm-tag success">${flow.executions} executions</span></div>
      <div class="ocm-card-body">
        <div class="ocm-flow-canvas">
          <div class="ocm-edge" style="left:190px;top:92px;width:105px"></div>
          <div class="ocm-edge" style="left:465px;top:92px;width:105px"></div>
          <div class="ocm-edge" style="left:735px;top:92px;width:105px"></div>
          <div class="ocm-node" style="left:28px;top:54px"><strong>New Message</strong><span>Trigger WhatsApp inbound.</span></div>
          <div class="ocm-node" style="left:296px;top:54px"><strong>AI Response</strong><span>Generate answer from knowledge base.</span></div>
          <div class="ocm-node" style="left:570px;top:54px"><strong>Condition</strong><span>Confidence below threshold?</span></div>
          <div class="ocm-node" style="left:842px;top:54px"><strong>Handover</strong><span>Transfer to human agent.</span></div>
          <div class="ocm-node" style="left:570px;top:230px"><strong>End</strong><span>Resolve conversation.</span></div>
        </div>
      </div>
    </section>
  `;
}

async function renderAI() {
  document.getElementById("view").innerHTML = `
    ${sectionHead("AI Playground", "Simulasi AI response dengan provider OpenCRM dan RAG context.", `<span class="ocm-tag">hybrid mode</span>`)}
    <div class="ocm-grid-2">
      <section class="ocm-card"><div class="ocm-card-header"><h3 class="ocm-card-title">Prompt</h3></div><div class="ocm-card-body">
        <textarea class="ocm-textarea" id="aiPrompt" placeholder="Contoh: pelanggan tanya stok dan minta invoice..."></textarea>
        <button class="ocm-btn primary" style="margin-top:10px" data-ai-run>Generate Response</button>
      </div></section>
      <section class="ocm-card"><div class="ocm-card-header"><h3 class="ocm-card-title">Output</h3><span class="ocm-tag" id="aiConfidence">ready</span></div><div class="ocm-card-body"><div id="aiOutput" style="line-height:1.55;color:var(--ocm-text-muted)">Response AI akan muncul di sini.</div></div></section>
    </div>
  `;
}

async function renderOrders() {
  const orders = (await api("/api/orders")).data;
  const products = (await api("/api/products")).data;
  document.getElementById("view").innerHTML = `
    ${sectionHead("Orders & Commerce", "Order, invoice, produk, stock, dan payment context dari chat.", `<button class="ocm-btn primary">Create Invoice</button>`)}
    <div class="ocm-grid-2">
      <section class="ocm-card"><div class="ocm-card-header"><h3 class="ocm-card-title">Orders</h3></div><div class="ocm-card-body" style="padding:0"><table class="ocm-table"><thead><tr><th>Invoice</th><th>Customer</th><th>Status</th><th>Amount</th></tr></thead><tbody>${orders.length ? orders.map((o) => `<tr><td>${esc(o.invoice)}</td><td>${esc(o.customer?.name || "-")}</td><td><span class="ocm-tag ${o.status === "paid" ? "success" : "warning"}">${esc(o.status)}</span></td><td>${rupiah(o.amount)}</td></tr>`).join("") : `<tr><td colspan="4">${emptyState("Belum ada order", "Order akan muncul setelah dibuat dari conversation atau invoice.")}</td></tr>`}</tbody></table></div></section>
      <section class="ocm-card"><div class="ocm-card-header"><h3 class="ocm-card-title">Products</h3></div><div class="ocm-card-body" style="padding:0"><table class="ocm-table"><thead><tr><th>SKU</th><th>Product</th><th>Stock</th><th>Price</th></tr></thead><tbody>${products.length ? products.map((p) => `<tr><td>${esc(p.sku)}</td><td>${esc(p.name)}</td><td>${p.stock}</td><td>${rupiah(p.price)}</td></tr>`).join("") : `<tr><td colspan="4">${emptyState("Belum ada produk", "Tambahkan catalog produk agar agent bisa membuat order dari chat.")}</td></tr>`}</tbody></table></div></section>
    </div>
  `;
}

async function renderSettings() {
  const cfg = await api("/api/waba/webhook-config");
  const moon = await api("/api/moonwa/config");
  document.getElementById("view").innerHTML = `
    ${sectionHead("Settings", "Konfigurasi WhatsApp WABA, MoonWA webhook, AI mode, dan workspace.", `<button class="ocm-btn primary" data-test-moonwa>Uji Webhook MoonWA</button>`)}
    <div class="ocm-grid-2">
      <section class="ocm-card"><div class="ocm-card-header"><h3 class="ocm-card-title">MoonWA Webhook</h3><span class="ocm-tag success">ready</span></div><div class="ocm-card-body">
        <div class="ocm-field"><label>URL untuk ditempel di MoonWA Webhook</label><input class="ocm-input" readonly value="${esc(cfg.moonwa_webhook_url)}" onclick="this.select()"></div>
        <div class="ocm-field" style="margin-top:10px"><label>URL alternatif / v1</label><input class="ocm-input" readonly value="${esc(cfg.moonwa_v1_webhook_url)}" onclick="this.select()"></div>
        <div class="ocm-field" style="margin-top:10px"><label>Endpoint uji webhook</label><input class="ocm-input" readonly value="${esc(cfg.moonwa_test_url)}" onclick="this.select()"></div>
        <div class="ocm-code">MoonWA akan POST JSON seperti:
{
  "message": "halo",
  "from": "628xxxxxxxx",
  "isGroup": false,
  "isMe": false
}

OpenCRM menyimpan pesan masuk sebagai customer + conversation.
Response default: {"status":"success","data":false}</div>
      </div></section>
      <section class="ocm-card"><div class="ocm-card-header"><h3 class="ocm-card-title">MoonWA API Outbound</h3><span class="ocm-tag ${moon.data.api_key_ready ? "success" : "warning"}">${moon.data.api_key_ready ? "API key siap" : "API key kosong"}</span></div><div class="ocm-card-body">
        <div class="ocm-field"><label>OpenCRM API Kirim Text</label><input class="ocm-input" readonly value="${esc(cfg.moonwa_send_text_api)}" onclick="this.select()"></div>
        <div class="ocm-field" style="margin-top:10px"><label>OpenCRM API Kirim Media</label><input class="ocm-input" readonly value="${esc(cfg.moonwa_send_media_api)}" onclick="this.select()"></div>
        <div class="ocm-code">POST /api/moonwa/send-text
{
  "to": "628xxxxxxxx",
  "message": "Isi pesan",
  "api_key": "MOONWA_API_KEY"
}

POST /api/moonwa/send-media
{
  "to": "628xxxxxxxx",
  "url": "https://domain/file.jpg",
  "caption": "Caption opsional",
  "api_key": "MOONWA_API_KEY"
}</div>
      </div></section>
      <section class="ocm-card"><div class="ocm-card-header"><h3 class="ocm-card-title">Meta WhatsApp Webhook</h3><span class="ocm-tag ${cfg.verify_token_ready ? "success" : "warning"}">${cfg.verify_token_ready ? "ready" : "missing"}</span></div><div class="ocm-card-body">
        <div class="ocm-field"><label>Callback URL</label><input class="ocm-input" readonly value="${esc(cfg.callback_url)}" onclick="this.select()"></div>
        <div class="ocm-field" style="margin-top:10px"><label>V1 Callback URL</label><input class="ocm-input" readonly value="${esc(cfg.v1_callback_url)}" onclick="this.select()"></div>
        <div class="ocm-field" style="margin-top:10px"><label>Verify Token</label><input class="ocm-input" readonly value="${esc(cfg.verify_token)}" onclick="this.select()"></div>
      </div></section>
      <section class="ocm-card"><div class="ocm-card-header"><h3 class="ocm-card-title">WAHA Webhook</h3><span class="ocm-tag ${cfg.waha_hmac_enabled ? "success" : "warning"}">${cfg.waha_hmac_enabled ? "HMAC aktif" : "tanpa HMAC"}</span></div><div class="ocm-card-body">
        <div class="ocm-field"><label>WAHA Webhook URL</label><input class="ocm-input" readonly value="${esc(cfg.waha_webhook_url)}" onclick="this.select()"></div>
        <div class="ocm-field" style="margin-top:10px"><label>Untuk WAHA Docker lokal</label><input class="ocm-input" readonly value="${esc(cfg.waha_docker_host_url)}" onclick="this.select()"></div>
        <div class="ocm-field" style="margin-top:10px"><label>Events disarankan</label><input class="ocm-input" readonly value="message,message.any,session.status,message.ack" onclick="this.select()"></div>
        <div class="ocm-code">WHATSAPP_HOOK_URL=${esc(cfg.waha_webhook_url)}
WHATSAPP_HOOK_EVENTS=message,message.any,session.status,message.ack
WHATSAPP_HOOK_HMAC_KEY=isi-secret-opsional</div>
      </div></section>
      <section class="ocm-card"><div class="ocm-card-header"><h3 class="ocm-card-title">Checklist</h3></div><div class="ocm-card-body">
        <div class="ocm-alert success"><strong>MoonWA Receiver</strong><span>Endpoint menerima format message/from/isGroup/isMe seperti contoh panel MoonWA.</span></div>
        <div class="ocm-alert ${cfg.whatsapp_ready ? "success" : "warning"}"><strong>WhatsApp Env</strong><span>${cfg.whatsapp_ready ? "Access token dan phone number siap." : "Isi WHATSAPP_ACCESS_TOKEN dan WHATSAPP_PHONE_NUMBER_ID untuk mode live."}</span></div>
        <div class="ocm-alert success"><strong>Webhook Receiver</strong><span>GET verify dan POST inbound aktif di program standalone.</span></div>
        <div class="ocm-alert warning"><strong>Public HTTPS</strong><span>Meta perlu domain publik HTTPS. Untuk WAHA lokal di Docker, gunakan host.docker.internal. Untuk server publik, isi API_PUBLIC_URL.</span></div>
      </div></section>
    </div>
  `;
}

async function renderDeveloper() {
  const events = (await api("/api/webhook-events")).data;
  document.getElementById("view").innerHTML = `
    ${sectionHead("Developer", "API contracts, webhook logs, dan integration diagnostics.", `<button class="ocm-btn" data-refresh>Refresh</button>`)}
    <section class="ocm-card"><div class="ocm-card-header"><h3 class="ocm-card-title">Webhook Events</h3><span class="ocm-tag">${events.length}</span></div><div class="ocm-card-body" style="padding:0">
      <table class="ocm-table"><thead><tr><th>Time</th><th>Event</th><th>Summary</th></tr></thead><tbody>${events.length ? events.map((e) => `<tr><td>${shortTime(e.created_at)}</td><td>${esc(e.event)}</td><td>${esc(e.summary?.text || JSON.stringify(e.summary || {}))}</td></tr>`).join("") : `<tr><td colspan="3">${emptyState("Belum ada webhook masuk", "Tempel URL webhook OpenCRM ke WAHA/Meta lalu kirim pesan WhatsApp.")}</td></tr>`}</tbody></table>
    </div></section>
  `;
}

async function renderBroadcast() {
  document.getElementById("view").innerHTML = `
    ${sectionHead("Broadcast", "Audience targeting dan template WhatsApp compliant.", `<button class="ocm-btn primary">Schedule</button>`)}
    <div class="ocm-grid-2">
      <section class="ocm-card"><div class="ocm-card-header"><h3 class="ocm-card-title">Campaign</h3></div><div class="ocm-card-body">
        <div class="ocm-field"><label>Audience</label><select class="ocm-select"><option>VIP customers</option><option>Open conversations</option><option>New leads</option></select></div>
        <div class="ocm-field" style="margin-top:10px"><label>Template</label><textarea class="ocm-textarea" placeholder="Tulis template broadcast WhatsApp..."></textarea></div>
      </div></section>
      <section class="ocm-card"><div class="ocm-card-header"><h3 class="ocm-card-title">Preview</h3><span class="ocm-tag warning">draft</span></div><div class="ocm-card-body">${emptyState("Belum ada preview", "Isi template untuk melihat contoh pesan.")}</div></section>
    </div>
  `;
}

async function renderSimple(kind) {
  if (kind === "handover") {
    const convs = (await api("/api/conversations")).data.filter((c) => c.ai_confidence < 90 || c.status === "pending");
    document.getElementById("view").innerHTML = `${sectionHead("Handover Queue", "Percakapan yang perlu agent manusia.")}<div class="ocm-grid-3">${convs.map((c) => `<section class="ocm-card"><div class="ocm-card-body"><div style="display:flex;gap:9px">${avatar(c.customer.name)}<div><strong>${esc(c.customer.name)}</strong><p style="margin:5px 0;color:var(--ocm-text-muted);font-size:.8rem">${esc(c.last_message)}</p><span class="ocm-tag warning">AI ${c.ai_confidence}%</span></div></div></div></section>`).join("")}</div>`;
    return;
  }
  if (kind === "products" || kind === "orders") return renderOrders();
}

const renderers = {
  dashboard: renderDashboard,
  inbox: renderInbox,
  handover: () => renderSimple("handover"),
  orders: renderOrders,
  customers: renderCustomers,
  products: renderOrders,
  pipeline: renderPipeline,
  flows: renderFlows,
  ai: renderAI,
  knowledge: renderKnowledge,
  broadcast: renderBroadcast,
  settings: renderSettings,
  developer: renderDeveloper
};

async function render() {
  document.documentElement.classList.toggle("dark", state.dark);
  renderNav();
  setPageMeta();
  shellLoading();
  try {
    const fn = renderers[state.route] || renderDashboard;
    await fn();
  } catch (err) {
    document.getElementById("view").innerHTML = `<section class="ocm-card"><div class="ocm-card-body"><strong>OpenCRM error</strong><p>${esc(err.message || err)}</p></div></section>`;
  }
}

async function sendMessage(form) {
  const input = form.elements.text;
  const text = String(input.value || "").trim();
  if (!text || !state.selectedConversation) return;
  await api(`/api/conversations/${state.selectedConversation}/messages`, {
    method: "POST",
    body: JSON.stringify({ sender: "agent", text })
  });
  input.value = "";
  toast("Pesan terkirim");
  renderInbox();
}

async function testWebhook() {
  await api("/api/webhooks/whatsapp", {
    method: "POST",
    body: JSON.stringify({
      object: "whatsapp_business_account",
      entry: [{ changes: [{ value: { metadata: { phone_number_id: "demo_phone" }, contacts: [{ wa_id: "6281111111101" }], messages: [{ id: "wamid.demo", type: "text", text: { body: "Test webhook dari OpenCRM standalone" } }] } }] }]
    })
  });
  toast("Test webhook berhasil masuk");
  state.route = "developer";
  location.hash = "#/developer";
  render();
}

async function testMoonwaWebhook() {
  const out = await api("/api/webhooks/moonwa/test", {
    method: "POST",
    body: JSON.stringify({ message: "ping", from: "6280000000000" })
  });
  toast("Uji MoonWA OK: " + JSON.stringify(out.moonwa_response));
}

document.addEventListener("click", async (event) => {
  const target = event.target.closest("[data-action],[data-conv],[data-refresh],[data-ai-reply],[data-ai-run],[data-test-webhook],[data-add-customer],[data-add-knowledge]");
  if (!target) return;
  if (target.dataset.action === "theme") {
    state.dark = !state.dark;
    localStorage.setItem("opencrm_theme", state.dark ? "dark" : "light");
    render();
  }
  if (target.dataset.action === "open-sidebar") document.getElementById("sidebar").classList.add("open");
  if (target.dataset.action === "close-sidebar") document.getElementById("sidebar").classList.remove("open");
  if (target.dataset.conv) {
    state.selectedConversation = target.dataset.conv;
    renderInbox();
  }
  if ("refresh" in target.dataset) render();
  if ("testWebhook" in target.dataset) testWebhook();
  if ("testMoonwa" in target.dataset) testMoonwaWebhook();
  if ("aiReply" in target.dataset) {
    const out = await api("/api/ai/generate", { method: "POST", body: JSON.stringify({ prompt: "Buat balasan untuk conversation terpilih" }) });
    toast(out.data.text.slice(0, 80) + "...");
  }
  if ("aiRun" in target.dataset) {
    const prompt = document.getElementById("aiPrompt").value;
    const out = await api("/api/ai/generate", { method: "POST", body: JSON.stringify({ prompt }) });
    document.getElementById("aiOutput").textContent = out.data.text;
    document.getElementById("aiConfidence").textContent = `${out.data.confidence}%`;
  }
  if ("addCustomer" in target.dataset) {
    const name = prompt("Nama customer");
    if (!name) return;
    const phone = prompt("Nomor WhatsApp atau telepon") || "";
    await api("/api/customers", { method: "POST", body: JSON.stringify({ name, phone }) });
    toast("Customer ditambahkan");
    renderCustomers();
  }
  if ("addKnowledge" in target.dataset) {
    await api("/api/knowledge", { method: "POST", body: JSON.stringify({ title: "Knowledge manual baru", type: "Text" }) });
    toast("Knowledge source ditambahkan");
    renderKnowledge();
  }
});

document.addEventListener("submit", (event) => {
  if (event.target.id === "composer") {
    event.preventDefault();
    sendMessage(event.target);
  }
});

document.addEventListener("change", async (event) => {
  const dealId = event.target.dataset.deal;
  if (dealId) {
    await api(`/api/deals/${dealId}`, { method: "PATCH", body: JSON.stringify({ stage: event.target.value }) });
    toast("Stage deal diperbarui");
    renderPipeline();
  }
});

window.addEventListener("hashchange", () => {
  state.route = location.hash.replace("#/", "") || "dashboard";
  document.getElementById("sidebar").classList.remove("open");
  render();
});

api("/health").then(() => { document.getElementById("healthText").textContent = "Online"; }).catch(() => {});
render();
