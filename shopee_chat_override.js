(function () {
  var API_BASE = window.localStorage.getItem("ajw_chat_api_base") || "http://localhost:3010";
  var currentShopId = window.localStorage.getItem("ajw_chat_shop_id") || "";
  var selectedConversationId = "";

  function escSafe(v) {
    return (window.esc ? window.esc(v == null ? "" : String(v)) : String(v == null ? "" : v))
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function fmtTs(ts) {
    if (!ts) return "-";
    var d = new Date(Number(ts) * 1000);
    return d.toLocaleString("id-ID");
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

  async function apiGet(path) {
    var res = await fetch(API_BASE + path);
    var data = await res.json();
    if (!res.ok || !data.ok) throw new Error(data.error || "Request gagal");
    return data;
  }

  async function apiPost(path, body) {
    var res = await fetch(API_BASE + path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body || {})
    });
    var data = await res.json();
    if (!res.ok || !data.ok) throw new Error(data.error || "Request gagal");
    return data;
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

  async function renderMessages(conversationId) {
    selectedConversationId = conversationId;
    var box = document.getElementById("CHAT-MESSAGES");
    if (!box) return;
    box.innerHTML = '<div style="padding:12px;color:var(--tx3)">Memuat pesan...</div>';
    try {
      var data = await apiGet("/api/chat/messages?conversation_id=" + encodeURIComponent(conversationId) + "&limit=200");
      var rows = data.rows || [];
      if (!rows.length) {
        box.innerHTML = '<div style="padding:12px;color:var(--tx3)">Belum ada pesan tersimpan.</div>';
        return;
      }
      box.innerHTML = rows
        .map(function (m) {
          return (
            '<div style="padding:9px 10px;border-bottom:1px solid var(--bd)">' +
            '<div style="font-size:10px;color:var(--tx3);margin-bottom:4px">' +
            escSafe("[" + (m.message_type || "-") + "] " + fmtTs(m.created_timestamp)) +
            "</div>" +
            '<div style="font-size:12px;color:var(--tx)">' +
            escSafe(m.content_text || "(non-text)") +
            "</div>" +
            "</div>"
          );
        })
        .join("");
      box.scrollTop = box.scrollHeight;
    } catch (err) {
      box.innerHTML = '<div style="padding:12px;color:#ff9d9d">Gagal memuat pesan: ' + escSafe(err.message || err) + "</div>";
    }
  }

  async function renderConversations() {
    var listEl = document.getElementById("CHAT-CONV-LIST");
    if (!listEl) return;
    listEl.innerHTML = '<div style="padding:12px;color:var(--tx3)">Memuat percakapan...</div>';
    try {
      var qs = currentShopId ? "?shop_id=" + encodeURIComponent(currentShopId) + "&limit=100" : "?limit=100";
      var data = await apiGet("/api/chat/conversations" + qs);
      var rows = data.rows || [];
      if (!rows.length) {
        listEl.innerHTML = '<div style="padding:12px;color:var(--tx3)">Belum ada percakapan. Klik "Sync Chat".</div>';
        return;
      }
      listEl.innerHTML = rows
        .map(function (r) {
          var active = selectedConversationId === r.conversation_id;
          return (
            '<button style="display:block;width:100%;text-align:left;padding:10px;border:none;border-bottom:1px solid var(--bd);background:' +
            (active ? "var(--bg3)" : "var(--bg2)") +
            ';cursor:pointer" onclick="window._chatOpenConv(\'' +
            escSafe(r.conversation_id) +
            "')\">" +
            '<div style="font-size:12px;font-weight:700;color:var(--tx)">' +
            escSafe(r.to_name || r.to_id || r.conversation_id) +
            "</div>" +
            '<div style="font-size:10px;color:var(--tx3);margin-top:4px">' +
            escSafe((r.latest_message_text || "-") + " • " + fmtTs(r.last_message_timestamp)) +
            "</div>" +
            "</button>"
          );
        })
        .join("");
      if (!selectedConversationId && rows[0]) renderMessages(rows[0].conversation_id);
    } catch (err) {
      listEl.innerHTML = '<div style="padding:12px;color:#ff9d9d">Gagal memuat percakapan: ' + escSafe(err.message || err) + "</div>";
    }
  }

  window._chatOpenConv = function (id) {
    renderMessages(id);
    setTimeout(renderConversations, 30);
  };

  window._chatSync = async function () {
    var shopInput = document.getElementById("CHAT-SHOP-ID");
    var shopId = String((shopInput && shopInput.value) || "").trim();
    if (!shopId) {
      alert("Isi shop_id dulu.");
      return;
    }
    currentShopId = shopId;
    window.localStorage.setItem("ajw_chat_shop_id", shopId);
    try {
      await apiPost("/api/chat/sync", { shop_id: shopId });
      if (window.toast) window.toast("Sync chat selesai", "success");
      renderConversations();
    } catch (err) {
      if (window.toast) window.toast("Sync gagal: " + (err.message || err), "error");
    }
  };

  window._chatOpenOAuth = async function () {
    var shopInput = document.getElementById("CHAT-SHOP-ID");
    var shopId = String((shopInput && shopInput.value) || "").trim();
    if (!shopId) {
      alert("Isi shop_id dulu.");
      return;
    }
    try {
      var data = await apiGet("/api/shopee/oauth/url?shop_id=" + encodeURIComponent(shopId));
      window.open(data.url, "_blank");
    } catch (err) {
      alert("Gagal buat URL OAuth: " + (err.message || err));
    }
  };

  window._renderChat = function () {
    var v = ensureView();
    if (!v) return;
    hideOtherViews();
    v.style.display = "block";
    v.innerHTML =
      '<div class="card" style="margin-bottom:12px">' +
      '<div style="font-size:16px;font-weight:800;color:var(--tx);margin-bottom:4px">Shopee Chat</div>' +
      '<div style="font-size:11px;color:var(--tx2)">Sinkron data chat pelanggan dari backend Shopee.</div>' +
      '<div style="display:grid;grid-template-columns:1.1fr 1fr 1fr auto auto;gap:8px;margin-top:10px">' +
      '<input id="CHAT-API-BASE" class="fi" placeholder="API base" value="' +
      escSafe(API_BASE) +
      '">' +
      '<input id="CHAT-SHOP-ID" class="fi" placeholder="shop_id" value="' +
      escSafe(currentShopId) +
      '">' +
      '<button class="btns" onclick="window.localStorage.setItem(\'ajw_chat_api_base\',document.getElementById(\'CHAT-API-BASE\').value.trim());location.reload()">Simpan API</button>' +
      '<button class="btns" onclick="_chatOpenOAuth()">OAuth</button>' +
      '<button class="btnp" onclick="_chatSync()">Sync Chat</button>' +
      "</div>" +
      "</div>" +
      '<div style="display:grid;grid-template-columns:360px minmax(0,1fr);gap:10px">' +
      '<div class="card" style="margin-bottom:0;padding:0;overflow:hidden">' +
      '<div style="padding:10px 12px;font-size:12px;font-weight:800;border-bottom:1px solid var(--bd)">Percakapan</div>' +
      '<div id="CHAT-CONV-LIST" style="max-height:70vh;overflow:auto"></div>' +
      "</div>" +
      '<div class="card" style="margin-bottom:0;padding:0;overflow:hidden">' +
      '<div style="padding:10px 12px;font-size:12px;font-weight:800;border-bottom:1px solid var(--bd)">Pesan</div>' +
      '<div id="CHAT-MESSAGES" style="max-height:70vh;overflow:auto"></div>' +
      "</div>" +
      "</div>";
    renderConversations();
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
