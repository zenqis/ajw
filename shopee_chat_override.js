(function () {
  var API_BASE = window.localStorage.getItem("ajw_chat_api_base") || "http://localhost:3010";
  var currentShopId = window.localStorage.getItem("ajw_chat_shop_id") || "";
  var selectedConversationId = "";
  var activeFilter = window.localStorage.getItem("ajw_chat_filter") || "all";
  var autoReplyAfterSync = window.localStorage.getItem("ajw_chat_auto_sync_reply") === "1";
  var shopsCache = [];
  var conversationsCache = [];
  var messagesCache = [];
  var templatesKey = "ajw_chat_templates_v1";
  var defaultTemplates = [
    "Halo kak, terima kasih sudah chat kami. Kami bantu cek sekarang ya.",
    "Stok ready kak, silakan order varian yang diinginkan.",
    "Pesanan diproses sesuai antrean, nomor resi muncul setelah pengiriman."
  ];
  var templates = loadTemplates();

  function loadTemplates() {
    try {
      var raw = window.localStorage.getItem(templatesKey);
      if (!raw) throw new Error("no");
      var parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) throw new Error("invalid");
      return parsed.map(function (x) { return String(x || "").trim(); }).filter(Boolean);
    } catch (_e) {
      return defaultTemplates.slice();
    }
  }

  function saveTemplates() {
    window.localStorage.setItem(templatesKey, JSON.stringify(templates.slice(0, 30)));
  }

  function escSafe(v) {
    return (window.esc ? window.esc(v == null ? "" : String(v)) : String(v == null ? "" : v))
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function fmtTs(ts) {
    if (!ts) return "-";
    var n = Number(ts);
    var d = Number.isFinite(n) ? new Date(n > 9999999999 ? n : n * 1000) : new Date(String(ts));
    if (Number.isNaN(d.getTime())) return "-";
    return d.toLocaleString("id-ID", { hour12: false });
  }

  function toast(msg, kind) {
    if (typeof window.toast === "function") window.toast(msg, kind || "info");
    else alert(msg);
  }

  async function apiGet(path) {
    var res = await fetch(API_BASE + path);
    var data;
    try {
      data = await res.json();
    } catch (_e) {
      throw new Error("Response backend bukan JSON valid.");
    }
    if (!res.ok || !data.ok) throw new Error(data.error || "Request gagal");
    return data;
  }

  async function apiPost(path, body) {
    var res = await fetch(API_BASE + path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body || {})
    });
    var data;
    try {
      data = await res.json();
    } catch (_e) {
      throw new Error("Response backend bukan JSON valid.");
    }
    if (!res.ok || !data.ok) throw new Error(data.error || "Request gagal");
    return data;
  }

  function ensureChatTabButton() {
    var tabs = document.getElementById("TABS");
    if (!tabs) return;
    if (tabs.querySelector('[data-ajw-chat="1"]')) return;
    var btn = document.createElement("button");
    btn.className = "tab on";
    btn.dataset.ajwChat = "1";
    btn.textContent = "CHAT";
    btn.onclick = function () {
      if (typeof window._navTo === "function") window._navTo("chat");
    };
    tabs.appendChild(btn);
  }

  function ensureView() {
    var v = document.getElementById("V-chat");
    if (v) return v;
    v = document.createElement("div");
    v.id = "V-chat";
    v.style.display = "none";
    var body = document.querySelector(".body");
    if (body) body.appendChild(v);
    return v;
  }

  function hideOtherViews() {
    var body = document.querySelector(".body");
    if (!body) return;
    body.querySelectorAll('div[id^="V-"]').forEach(function (el) {
      el.style.display = el.id === "V-chat" ? "block" : "none";
    });
  }

  async function loadShops() {
    try {
      var data = await apiGet("/api/chat/shops");
      shopsCache = data.rows || [];
      if (!currentShopId && shopsCache[0]) {
        currentShopId = String(shopsCache[0].shop_id || "");
        window.localStorage.setItem("ajw_chat_shop_id", currentShopId);
      }
      renderShops();
    } catch (err) {
      shopsCache = [];
      var host = document.getElementById("CHAT-SHOP-LIST");
      if (host) host.innerHTML = '<div style="padding:10px;color:#ff9d9d">Gagal memuat toko: ' + escSafe(err.message || err) + "</div>";
    }
  }

  async function loadConversations() {
    var host = document.getElementById("CHAT-CONV-LIST");
    if (!host) return;
    host.innerHTML = '<div style="padding:10px;color:var(--tx3)">Memuat percakapan...</div>';
    try {
      var qs = "?limit=200";
      if (currentShopId) qs += "&shop_id=" + encodeURIComponent(currentShopId);
      if (activeFilter) qs += "&filter=" + encodeURIComponent(activeFilter);
      var data = await apiGet("/api/chat/conversations" + qs);
      conversationsCache = data.rows || [];
      renderConversations();
      if (!selectedConversationId && conversationsCache[0]) {
        await openConversation(conversationsCache[0].conversation_id);
      } else {
        renderRightPanel();
      }
    } catch (err) {
      host.innerHTML = '<div style="padding:10px;color:#ff9d9d">Gagal memuat percakapan: ' + escSafe(err.message || err) + "</div>";
    }
  }

  async function loadMessages() {
    if (!selectedConversationId) {
      messagesCache = [];
      renderMessages();
      return;
    }
    try {
      var data = await apiGet("/api/chat/messages?conversation_id=" + encodeURIComponent(selectedConversationId) + "&limit=200&order=desc");
      messagesCache = data.rows || [];
      renderMessages();
      renderRightPanel();
    } catch (err) {
      var box = document.getElementById("CHAT-MESSAGES");
      if (box) box.innerHTML = '<div style="padding:10px;color:#ff9d9d">Gagal memuat pesan: ' + escSafe(err.message || err) + "</div>";
    }
  }

  async function openConversation(conversationId) {
    selectedConversationId = String(conversationId || "");
    try {
      if (currentShopId && selectedConversationId) {
        await apiPost("/api/chat/sync", { shop_id: currentShopId, conversation_id: selectedConversationId });
      }
    } catch (err) {
      toast("Sync percakapan gagal: " + (err.message || err), "warn");
    }
    await loadMessages();
    renderConversations();
  }

  function renderShops() {
    var host = document.getElementById("CHAT-SHOP-LIST");
    if (!host) return;
    if (!shopsCache.length) {
      host.innerHTML = '<div style="padding:10px;color:var(--tx3)">Belum ada token toko. Klik OAuth untuk hubungkan toko.</div>';
      return;
    }
    host.innerHTML = shopsCache
      .map(function (s) {
        var sid = String(s.shop_id || "");
        var active = sid === String(currentShopId || "");
        return (
          '<button data-shop-id="' + escSafe(sid) + '" style="display:block;width:100%;text-align:left;border:1px solid var(--bd);background:' +
          (active ? "rgba(245,158,11,.18)" : "var(--bg2)") +
          ';border-radius:10px;padding:10px;margin-bottom:8px;cursor:pointer">' +
          '<div style="font-size:12px;font-weight:700;color:var(--tx)">Shop ' + escSafe(sid) + "</div>" +
          '<div style="font-size:10px;color:var(--tx3);margin-top:4px">Update: ' + escSafe(fmtTs(s.updated_at)) + "</div>" +
          "</button>"
        );
      })
      .join("");
    host.querySelectorAll("[data-shop-id]").forEach(function (el) {
      el.addEventListener("click", async function () {
        currentShopId = String(el.getAttribute("data-shop-id") || "");
        window.localStorage.setItem("ajw_chat_shop_id", currentShopId);
        selectedConversationId = "";
        renderShops();
        await loadConversations();
      });
    });
  }

  function renderConversations() {
    var host = document.getElementById("CHAT-CONV-LIST");
    if (!host) return;
    if (!conversationsCache.length) {
      host.innerHTML = '<div style="padding:10px;color:var(--tx3)">Belum ada percakapan untuk filter ini.</div>';
      return;
    }
    host.innerHTML = conversationsCache
      .map(function (r) {
        var active = String(r.conversation_id) === String(selectedConversationId || "");
        var unread = Number(r.unread_count || 0);
        var unreplied = Number(r.has_unreplied || 0) > 0;
        return (
          '<button data-conv-id="' + escSafe(r.conversation_id) + '" style="display:block;width:100%;text-align:left;border:none;border-bottom:1px solid var(--bd);background:' +
          (active ? "rgba(59,130,246,.16)" : "transparent") +
          ';padding:10px;cursor:pointer">' +
          '<div style="display:flex;justify-content:space-between;gap:8px">' +
          '<div style="font-size:12px;font-weight:800;color:var(--tx)">' + escSafe(r.to_name || r.to_id || r.conversation_id) + "</div>" +
          '<div style="font-size:10px;color:var(--tx3)">' + escSafe(fmtTs(r.last_message_timestamp)) + "</div>" +
          "</div>" +
          '<div style="font-size:11px;color:var(--tx2);margin-top:6px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + escSafe(r.latest_message_text || "-") + "</div>" +
          '<div style="display:flex;gap:6px;margin-top:6px">' +
          (unread > 0 ? '<span style="font-size:10px;background:#1d4ed8;color:#fff;border-radius:999px;padding:2px 7px">Unread ' + unread + "</span>" : "") +
          (unreplied ? '<span style="font-size:10px;background:#7f1d1d;color:#fecaca;border-radius:999px;padding:2px 7px">Belum dibalas</span>' : "") +
          "</div>" +
          "</button>"
        );
      })
      .join("");

    host.querySelectorAll("[data-conv-id]").forEach(function (el) {
      el.addEventListener("click", function () {
        openConversation(String(el.getAttribute("data-conv-id") || ""));
      });
    });
  }

  function renderMessages() {
    var box = document.getElementById("CHAT-MESSAGES");
    if (!box) return;
    if (!selectedConversationId) {
      box.innerHTML = '<div style="padding:14px;color:var(--tx3)">Pilih percakapan di kiri.</div>';
      return;
    }
    if (!messagesCache.length) {
      box.innerHTML = '<div style="padding:14px;color:var(--tx3)">Belum ada pesan tersimpan.</div>';
      return;
    }

    box.innerHTML = messagesCache
      .map(function (m) {
        var mine = String(m.from_id || "") === String(currentShopId || "");
        return (
          '<div style="display:flex;justify-content:' + (mine ? "flex-end" : "flex-start") + ';padding:8px 10px">' +
          '<div style="max-width:75%;border:1px solid var(--bd);background:' + (mine ? "rgba(22,163,74,.13)" : "var(--bg2)") + ';border-radius:12px;padding:9px 10px">' +
          '<div style="font-size:12px;color:var(--tx);white-space:pre-wrap;word-break:break-word">' + escSafe(m.content_text || "(non-text)") + "</div>" +
          '<div style="font-size:10px;color:var(--tx3);margin-top:5px">' + escSafe(fmtTs(m.created_timestamp)) + "</div>" +
          "</div></div>"
        );
      })
      .join("");
  }

  function renderRightPanel() {
    var panel = document.getElementById("CHAT-RIGHT");
    if (!panel) return;
    var conv = conversationsCache.find(function (x) { return String(x.conversation_id) === String(selectedConversationId || ""); });
    var latestIncoming = "";
    for (var i = 0; i < messagesCache.length; i += 1) {
      if (String(messagesCache[i].from_id || "") !== String(currentShopId || "")) {
        latestIncoming = String(messagesCache[i].content_text || "");
        break;
      }
    }
    panel.innerHTML =
      '<div style="padding:12px;border-bottom:1px solid var(--bd)">' +
      '<div style="font-size:12px;font-weight:800;color:var(--tx)">Detail Percakapan</div>' +
      '<div style="font-size:11px;color:var(--tx2);margin-top:8px">Toko: <b>' + escSafe(currentShopId || "-") + "</b></div>" +
      '<div style="font-size:11px;color:var(--tx2);margin-top:4px">Pelanggan: <b>' + escSafe((conv && (conv.to_name || conv.to_id)) || "-") + "</b></div>" +
      '<div style="font-size:11px;color:var(--tx2);margin-top:4px">Belum dibalas: <b>' + (conv && Number(conv.has_unreplied || 0) > 0 ? "Ya" : "Tidak") + "</b></div>" +
      "</div>" +
      '<div style="padding:12px;border-bottom:1px solid var(--bd)">' +
      '<div style="font-size:12px;font-weight:800;color:var(--tx);margin-bottom:8px">Template Balasan</div>' +
      '<div id="CHAT-TEMPLATE-LIST"></div>' +
      '<div style="display:flex;gap:8px;margin-top:10px">' +
      '<button id="CHAT-TPL-ADD" class="btns" style="flex:1">Tambah</button>' +
      '<button id="CHAT-TPL-RESET" class="btns" style="flex:1">Reset</button>' +
      "</div>" +
      "</div>" +
      '<div style="padding:12px">' +
      '<div style="font-size:12px;font-weight:800;color:var(--tx);margin-bottom:8px">AI Auto Reply</div>' +
      '<div style="font-size:11px;color:var(--tx2);margin-bottom:8px">Pesan terbaru pelanggan: ' + escSafe(latestIncoming || "-") + "</div>" +
      '<label style="display:flex;align-items:center;gap:8px;font-size:11px;color:var(--tx2);margin-bottom:10px">' +
      '<input id="CHAT-AUTO-AFTER-SYNC" type="checkbox" ' + (autoReplyAfterSync ? "checked" : "") + "> Auto-reply setiap selesai Sync" +
      "</label>" +
      '<button id="CHAT-AUTO-RUN" class="btnp" style="width:100%">Jalankan AI Auto Reply</button>' +
      "</div>";

    var tplHost = panel.querySelector("#CHAT-TEMPLATE-LIST");
    if (tplHost) {
      tplHost.innerHTML = templates
        .map(function (t, idx) {
          return (
            '<button data-tpl-idx="' + idx + '" style="display:block;width:100%;text-align:left;border:1px solid var(--bd);background:var(--bg2);border-radius:8px;padding:8px;margin-bottom:7px;cursor:pointer;font-size:11px;color:var(--tx2)">' +
            escSafe(t) +
            "</button>"
          );
        })
        .join("");
      tplHost.querySelectorAll("[data-tpl-idx]").forEach(function (el) {
        el.addEventListener("click", function () {
          var idx = Number(el.getAttribute("data-tpl-idx"));
          var ta = document.getElementById("CHAT-REPLY-TEXT");
          if (!ta) return;
          ta.value = templates[idx] || "";
          ta.focus();
        });
      });
    }

    var addBtn = panel.querySelector("#CHAT-TPL-ADD");
    if (addBtn) {
      addBtn.onclick = function () {
        var val = prompt("Isi template balasan baru:");
        val = String(val || "").trim();
        if (!val) return;
        templates.unshift(val);
        templates = templates.filter(Boolean).slice(0, 30);
        saveTemplates();
        renderRightPanel();
      };
    }

    var resetBtn = panel.querySelector("#CHAT-TPL-RESET");
    if (resetBtn) {
      resetBtn.onclick = function () {
        templates = defaultTemplates.slice();
        saveTemplates();
        renderRightPanel();
      };
    }

    var autoCheck = panel.querySelector("#CHAT-AUTO-AFTER-SYNC");
    if (autoCheck) {
      autoCheck.onchange = function () {
        autoReplyAfterSync = !!autoCheck.checked;
        window.localStorage.setItem("ajw_chat_auto_sync_reply", autoReplyAfterSync ? "1" : "0");
      };
    }

    var autoBtn = panel.querySelector("#CHAT-AUTO-RUN");
    if (autoBtn) {
      autoBtn.onclick = runAutoReply;
    }
  }

  async function runAutoReply() {
    currentShopId = resolveShopIdFromInput();
    if (!currentShopId) {
      toast("Pilih toko dulu.", "warn");
      return;
    }
    try {
      var r = await apiPost("/api/chat/auto-reply", {
        shop_id: currentShopId,
        limit: 15,
        templates: templates
      });
      toast("Auto-reply selesai. Terkirim: " + Number(r.count || 0), "success");
      await loadConversations();
      await loadMessages();
    } catch (err) {
      toast("Auto-reply gagal: " + (err.message || err), "error");
    }
  }

  async function sendReply() {
    var ta = document.getElementById("CHAT-REPLY-TEXT");
    if (!ta) return;
    var text = String(ta.value || "").trim();
    currentShopId = resolveShopIdFromInput();
    if (!currentShopId) return toast("Pilih toko dulu.", "warn");
    if (!selectedConversationId) return toast("Pilih percakapan dulu.", "warn");
    if (!text) return toast("Isi pesan balasan dulu.", "warn");
    try {
      await apiPost("/api/chat/send", {
        shop_id: currentShopId,
        conversation_id: selectedConversationId,
        text: text
      });
      ta.value = "";
      await openConversation(selectedConversationId);
      toast("Pesan berhasil dikirim.", "success");
    } catch (err) {
      toast("Gagal kirim pesan: " + (err.message || err), "error");
    }
  }

  async function doSyncAll() {
    currentShopId = resolveShopIdFromInput();
    if (!currentShopId) {
      toast("Pilih toko dulu.", "warn");
      return;
    }
    try {
      await apiPost("/api/chat/sync", { shop_id: currentShopId });
      if (autoReplyAfterSync) await runAutoReply();
      await loadConversations();
      await loadMessages();
      toast("Sync chat selesai.", "success");
    } catch (err) {
      toast("Sync gagal: " + (err.message || err), "error");
    }
  }

  async function openOAuth() {
    currentShopId = resolveShopIdFromInput();
    if (!currentShopId) {
      toast("Isi/pilih shop_id dulu.", "warn");
      return;
    }
    try {
      var data = await apiGet("/api/shopee/oauth/url?shop_id=" + encodeURIComponent(currentShopId));
      window.open(data.url, "_blank");
    } catch (err) {
      toast("Gagal buat URL OAuth: " + (err.message || err), "error");
    }
  }

  function bindHeaderActions() {
    var saveApiBtn = document.getElementById("CHAT-SAVE-API");
    var oauthBtn = document.getElementById("CHAT-OAUTH");
    var syncBtn = document.getElementById("CHAT-SYNC");
    var sendBtn = document.getElementById("CHAT-SEND");
    var refreshShopBtn = document.getElementById("CHAT-SHOPS-REFRESH");
    var filterEls = document.querySelectorAll("[data-chat-filter]");

    if (saveApiBtn) {
      saveApiBtn.onclick = function () {
        var val = document.getElementById("CHAT-API-BASE");
        API_BASE = String((val && val.value) || "").trim().replace(/\/$/, "");
        window.localStorage.setItem("ajw_chat_api_base", API_BASE);
        toast("API backend disimpan.", "success");
      };
    }
    if (oauthBtn) oauthBtn.onclick = openOAuth;
    if (syncBtn) syncBtn.onclick = doSyncAll;
    if (sendBtn) sendBtn.onclick = sendReply;
    if (refreshShopBtn) refreshShopBtn.onclick = loadShops;

    filterEls.forEach(function (el) {
      el.addEventListener("click", function () {
        activeFilter = String(el.getAttribute("data-chat-filter") || "all");
        window.localStorage.setItem("ajw_chat_filter", activeFilter);
        renderFilterState();
        loadConversations();
      });
    });
  }

  function resolveShopIdFromInput() {
    var manual = document.getElementById("CHAT-SHOP-ID-MANUAL");
    var sid = String((manual && manual.value) || currentShopId || "").trim();
    if (sid && sid !== currentShopId) {
      currentShopId = sid;
      window.localStorage.setItem("ajw_chat_shop_id", sid);
    }
    return sid;
  }

  function renderFilterState() {
    document.querySelectorAll("[data-chat-filter]").forEach(function (el) {
      var on = String(el.getAttribute("data-chat-filter")) === String(activeFilter);
      el.style.background = on ? "rgba(245,158,11,.18)" : "var(--bg2)";
      el.style.borderColor = on ? "#f59e0b" : "var(--bd)";
      el.style.color = on ? "#fbbf24" : "var(--tx2)";
    });
  }

  window._renderChat = function () {
    var v = ensureView();
    if (!v) return;
    hideOtherViews();
    v.style.display = "block";
    v.innerHTML =
      '<div class="card" style="margin-bottom:10px">' +
      '<div style="display:grid;grid-template-columns:1.3fr 170px auto auto auto;gap:8px;align-items:center">' +
      '<input id="CHAT-API-BASE" class="fi" placeholder="https://shopeebackend.vercel.app" value="' + escSafe(API_BASE) + '">' +
      '<input id="CHAT-SHOP-ID-MANUAL" class="fi" placeholder="shop_id aktif" value="' + escSafe(currentShopId) + '">' +
      '<button id="CHAT-SAVE-API" class="btns">Simpan API</button>' +
      '<button id="CHAT-OAUTH" class="btns">OAuth</button>' +
      '<button id="CHAT-SYNC" class="btnp">Sync Chat</button>' +
      "</div>" +
      "</div>" +
      '<div style="display:grid;grid-template-columns:230px 320px minmax(0,1fr) 320px;gap:10px;min-height:70vh">' +
      '<div class="card" style="margin:0;padding:10px;display:flex;flex-direction:column;min-height:70vh">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">' +
      '<div style="font-size:12px;font-weight:800;color:var(--tx)">Multi Toko</div>' +
      '<button id="CHAT-SHOPS-REFRESH" class="btns" style="padding:5px 8px;font-size:10px">Refresh</button>' +
      "</div>" +
      '<div id="CHAT-SHOP-LIST" style="overflow:auto;max-height:64vh"></div>' +
      "</div>" +
      '<div class="card" style="margin:0;padding:0;display:flex;flex-direction:column;min-height:70vh;overflow:hidden">' +
      '<div style="padding:10px;border-bottom:1px solid var(--bd)">' +
      '<div style="font-size:12px;font-weight:800;color:var(--tx);margin-bottom:8px">Percakapan</div>' +
      '<div style="display:flex;gap:6px">' +
      '<button data-chat-filter="all" style="border:1px solid var(--bd);background:var(--bg2);border-radius:999px;padding:5px 10px;font-size:10px;cursor:pointer">Semua</button>' +
      '<button data-chat-filter="unreplied" style="border:1px solid var(--bd);background:var(--bg2);border-radius:999px;padding:5px 10px;font-size:10px;cursor:pointer">Belum Dibalas</button>' +
      '<button data-chat-filter="unread" style="border:1px solid var(--bd);background:var(--bg2);border-radius:999px;padding:5px 10px;font-size:10px;cursor:pointer">Belum Dibaca</button>' +
      "</div></div>" +
      '<div id="CHAT-CONV-LIST" style="overflow:auto;flex:1"></div>' +
      "</div>" +
      '<div class="card" style="margin:0;padding:0;display:flex;flex-direction:column;min-height:70vh;overflow:hidden">' +
      '<div style="padding:10px;border-bottom:1px solid var(--bd);font-size:12px;font-weight:800;color:var(--tx)">Chat</div>' +
      '<div id="CHAT-MESSAGES" style="flex:1;overflow:auto;background:linear-gradient(180deg,rgba(255,255,255,.02),transparent)"></div>' +
      '<div style="border-top:1px solid var(--bd);padding:10px">' +
      '<textarea id="CHAT-REPLY-TEXT" class="fi" style="min-height:84px;resize:vertical" placeholder="Tulis balasan..."></textarea>' +
      '<div style="display:flex;justify-content:flex-end;margin-top:8px">' +
      '<button id="CHAT-SEND" class="btnp">Kirim Balasan</button>' +
      "</div></div>" +
      "</div>" +
      '<div class="card" id="CHAT-RIGHT" style="margin:0;padding:0;min-height:70vh;overflow:auto"></div>' +
      "</div>";

    bindHeaderActions();
    renderFilterState();

    var manual = document.getElementById("CHAT-SHOP-ID-MANUAL");
    if (manual) {
      manual.addEventListener("change", function () {
        var vId = String(manual.value || "").trim();
        if (!vId) return;
        currentShopId = vId;
        window.localStorage.setItem("ajw_chat_shop_id", currentShopId);
        selectedConversationId = "";
        renderShops();
        loadConversations();
      });
    }

    loadShops().then(loadConversations);
    renderMessages();
    renderRightPanel();
  };

  function hookNavigation() {
    var oldBuild = window.buildTabBar;
    if (typeof oldBuild === "function" && !oldBuild._chatWrapped) {
      window.buildTabBar = function () {
        oldBuild.apply(this, arguments);
        ensureChatTabButton();
        var btn = document.querySelector('[data-ajw-chat="1"]');
        if (btn) btn.className = "tab " + (window._activeTab === "chat" ? "act" : "on");
      };
      window.buildTabBar._chatWrapped = true;
    }

    var oldNav = window._navTo;
    if (typeof oldNav === "function" && !oldNav._chatWrapped) {
      window._navTo = function (tabId) {
        if (tabId === "chat") {
          window._activeTab = "chat";
          if (typeof window.buildTabBar === "function") window.buildTabBar();
          window._renderChat();
          window.scrollTo(0, 0);
          return;
        }
        return oldNav.apply(this, arguments);
      };
      window._navTo._chatWrapped = true;
    }
  }

  hookNavigation();
  ensureChatTabButton();
})();
