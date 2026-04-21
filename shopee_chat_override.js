(function () {
  var API_BASE = window.localStorage.getItem("ajw_chat_api_base") || "http://localhost:3010";
  var currentShopId = window.localStorage.getItem("ajw_chat_shop_id") || "";
  var selectedConversationId = "";
  var activeFilter = window.localStorage.getItem("ajw_chat_filter") || "all";
  var activeSideTab = window.localStorage.getItem("ajw_chat_side_tab") || "orders";
  var realtimeEnabled = true;
  var realtimeTimer = null;
  var shopsCache = [];
  var conversationsCache = [];
  var messagesCache = [];
  var ordersCache = [];
  var productsCache = [];
  var quickRepliesCache = [];
  var attachmentQueue = [];
  var productSearch = "";
  var emojiOpen = false;
  var savedBodyStyle = null;
  var EMOJIS = ["🙂", "😊", "🙏", "👍", "👌", "🔥", "⭐", "🎣", "📦", "🚚", "💬", "❤️"];

  function escSafe(v) {
    return (window.esc ? window.esc(v == null ? "" : String(v)) : String(v == null ? "" : v))
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function toast(msg, kind) {
    if (typeof window.toast === "function") window.toast(msg, kind || "info");
    else alert(msg);
  }

  function fmtTs(ts) {
    if (!ts) return "-";
    var n = Number(ts);
    var d = Number.isFinite(n) ? new Date(n > 9999999999 ? n : n * 1000) : new Date(String(ts));
    if (Number.isNaN(d.getTime())) return "-";
    return d.toLocaleString("id-ID", { hour12: false });
  }

  function money(v) {
    var n = Number(v || 0);
    if (!Number.isFinite(n)) return "Rp 0";
    return "Rp " + n.toLocaleString("id-ID");
  }

  function ensureStyles() {
    if (document.getElementById("AJW-CHAT-STYLES")) return;
    var style = document.createElement("style");
    style.id = "AJW-CHAT-STYLES";
    style.textContent =
      "#V-chat{width:100%}" +
      ".ajw-chat-shell{display:grid;grid-template-columns:220px 340px minmax(0,1fr) 360px;gap:0;min-height:calc(100vh - 110px);border:1px solid var(--bd);border-radius:0;background:linear-gradient(180deg,var(--bg2),var(--bg4));overflow:hidden}" +
      ".ajw-chat-col{min-width:0;display:flex;flex-direction:column;border-right:1px solid var(--bd);background:var(--bg2)}" +
      ".ajw-chat-col:last-child{border-right:none}" +
      ".ajw-chat-head{padding:12px 14px;border-bottom:1px solid var(--bd);display:flex;align-items:center;justify-content:space-between;gap:10px;background:rgba(255,255,255,.5)}" +
      ".ajw-chat-body{flex:1;min-height:0;overflow:auto}" +
      ".ajw-chat-toolbar{display:grid;grid-template-columns:1.2fr 180px auto auto auto;gap:8px;padding:10px 12px;margin-bottom:0;border:1px solid var(--bd);border-bottom:none;border-radius:0;background:var(--bg2)}" +
      ".ajw-chat-shop{padding:10px 12px;border-bottom:1px solid var(--bd);cursor:pointer;background:transparent}" +
      ".ajw-chat-shop.on{background:rgba(245,158,11,.14)}" +
      ".ajw-chat-conv{padding:12px 14px;border-bottom:1px solid var(--bd);cursor:pointer;background:transparent}" +
      ".ajw-chat-conv.on{background:rgba(59,130,246,.12)}" +
      ".ajw-chat-pill{display:inline-flex;align-items:center;gap:6px;padding:3px 8px;border-radius:999px;font-size:10px;font-weight:700}" +
      ".ajw-chat-pill.red{background:#7f1d1d;color:#fecaca}" +
      ".ajw-chat-pill.blue{background:#1d4ed8;color:#dbeafe}" +
      ".ajw-chat-pill.gold{background:#78350f;color:#fde68a}" +
      ".ajw-chat-filter{border:1px solid var(--bd);background:var(--bg3);color:var(--tx2);border-radius:999px;padding:5px 10px;font-size:10px;font-weight:700;cursor:pointer}" +
      ".ajw-chat-filter.on{border-color:#f59e0b;background:rgba(245,158,11,.16);color:#b45309}" +
      ".ajw-chat-thread{flex:1;overflow:auto;padding:16px;background:linear-gradient(180deg,#f9fafb,var(--bg4))}" +
      ".ajw-chat-bubble-row{display:flex;margin-bottom:10px}" +
      ".ajw-chat-bubble-row.mine{justify-content:flex-end}" +
      ".ajw-chat-bubble{max-width:76%;padding:10px 12px;border-radius:14px;border:1px solid var(--bd);background:#fff;color:var(--tx)}" +
      ".ajw-chat-bubble.mine{background:#e0f2fe;border-color:#bae6fd}" +
      ".ajw-chat-compose{border-top:1px solid var(--bd);padding:10px 12px;background:var(--bg2)}" +
      ".ajw-chat-compose-tools{display:flex;align-items:center;gap:8px;margin-bottom:8px;flex-wrap:wrap}" +
      ".ajw-chat-iconbtn{width:34px;height:34px;border-radius:10px;border:1px solid var(--bd);background:var(--bg3);cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:16px}" +
      ".ajw-chat-attach{display:flex;gap:8px;overflow:auto;padding-bottom:6px}" +
      ".ajw-chat-attach-card{min-width:180px;border:1px solid var(--bd);border-radius:10px;padding:8px;background:var(--bg3)}" +
      ".ajw-chat-side-tabs{display:flex;border-bottom:1px solid var(--bd)}" +
      ".ajw-chat-side-tab{flex:1;padding:12px 10px;text-align:center;border:none;background:transparent;cursor:pointer;font-weight:700;font-size:12px;color:var(--tx2)}" +
      ".ajw-chat-side-tab.on{color:#1d4ed8;border-bottom:2px solid #1d4ed8}" +
      ".ajw-chat-side-content{padding:12px 14px;overflow:auto;flex:1}" +
      ".ajw-chat-card{border:1px solid var(--bd);border-radius:12px;padding:12px;background:var(--bg3);margin-bottom:10px}" +
      ".ajw-chat-product{display:grid;grid-template-columns:58px minmax(0,1fr) auto;gap:10px;align-items:center}" +
      ".ajw-chat-product img{width:58px;height:58px;border-radius:10px;object-fit:cover;border:1px solid var(--bd);background:#fff}" +
      ".ajw-chat-emoji{position:absolute;left:12px;bottom:120px;z-index:50;padding:10px;border:1px solid var(--bd);background:var(--bg2);border-radius:12px;box-shadow:0 12px 30px rgba(0,0,0,.16);display:grid;grid-template-columns:repeat(6,1fr);gap:6px;width:240px}" +
      ".ajw-chat-emoji button{border:none;background:var(--bg3);border-radius:8px;padding:8px;cursor:pointer;font-size:16px}" +
      ".ajw-chat-empty{padding:18px;color:var(--tx3);font-size:12px}" +
      "@media (max-width:1300px){.ajw-chat-shell{grid-template-columns:200px 300px minmax(0,1fr) 320px}}" +
      "@media (max-width:980px){.ajw-chat-toolbar{grid-template-columns:1fr 1fr auto;}.ajw-chat-shell{grid-template-columns:1fr;min-height:auto}.ajw-chat-col{border-right:none;border-bottom:1px solid var(--bd)}.ajw-chat-col:last-child{border-bottom:none}}";
    document.head.appendChild(style);
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

  function applyWideLayout(active) {
    var body = document.querySelector(".body");
    if (!body) return;
    if (active) {
      if (!savedBodyStyle) {
        savedBodyStyle = {
          maxWidth: body.style.maxWidth || "",
          padding: body.style.padding || "",
          margin: body.style.margin || ""
        };
      }
      body.style.maxWidth = "none";
      body.style.padding = "0";
      body.style.margin = "0";
    } else if (savedBodyStyle) {
      body.style.maxWidth = savedBodyStyle.maxWidth;
      body.style.padding = savedBodyStyle.padding;
      body.style.margin = savedBodyStyle.margin;
    }
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

  async function apiDelete(path) {
    var res = await fetch(API_BASE + path, { method: "DELETE" });
    var data;
    try {
      data = await res.json();
    } catch (_e) {
      throw new Error("Response backend bukan JSON valid.");
    }
    if (!res.ok || !data.ok) throw new Error(data.error || "Request gagal");
    return data;
  }

  function currentConversation() {
    return conversationsCache.find(function (r) {
      return String(r.conversation_id) === String(selectedConversationId || "");
    }) || null;
  }

  function selectedShopId() {
    var input = document.getElementById("CHAT-SHOP-ID-MANUAL");
    var value = String((input && input.value) || currentShopId || "").trim();
    if (value && value !== currentShopId) {
      currentShopId = value;
      window.localStorage.setItem("ajw_chat_shop_id", value);
    }
    return value;
  }

  async function loadShops() {
    var data = await apiGet("/api/chat/shops");
    shopsCache = data.rows || [];
    if (!currentShopId && shopsCache[0]) currentShopId = String(shopsCache[0].shop_id || "");
    window.localStorage.setItem("ajw_chat_shop_id", currentShopId || "");
  }

  async function loadConversations() {
    var qs = "?limit=120";
    if (currentShopId) qs += "&shop_id=" + encodeURIComponent(currentShopId);
    if (activeFilter) qs += "&filter=" + encodeURIComponent(activeFilter);
    var data = await apiGet("/api/chat/conversations" + qs);
    conversationsCache = (data.rows || []).sort(function (a, b) {
      return Number(b.last_message_timestamp || 0) - Number(a.last_message_timestamp || 0);
    });
    if (!selectedConversationId && conversationsCache[0]) selectedConversationId = conversationsCache[0].conversation_id;
    if (selectedConversationId && !conversationsCache.some(function (r) { return String(r.conversation_id) === String(selectedConversationId); })) {
      selectedConversationId = conversationsCache[0] ? conversationsCache[0].conversation_id : "";
    }
  }

  async function loadMessages() {
    if (!selectedConversationId) {
      messagesCache = [];
      return;
    }
    var data = await apiGet("/api/chat/messages?conversation_id=" + encodeURIComponent(selectedConversationId) + "&limit=200&order=asc");
    messagesCache = data.rows || [];
  }

  async function loadOrders(refresh) {
    if (!currentShopId || !selectedConversationId) {
      ordersCache = [];
      return;
    }
    var data = await apiGet(
      "/api/chat/orders?shop_id=" +
        encodeURIComponent(currentShopId) +
        "&conversation_id=" +
        encodeURIComponent(selectedConversationId) +
        (refresh ? "&refresh=1" : "")
    );
    ordersCache = data.rows || [];
  }

  async function loadProducts(refresh) {
    if (!currentShopId) {
      productsCache = [];
      return;
    }
    var data = await apiGet(
      "/api/chat/products?shop_id=" +
        encodeURIComponent(currentShopId) +
        (productSearch ? "&search=" + encodeURIComponent(productSearch) : "") +
        (refresh ? "&refresh=1" : "")
    );
    productsCache = data.rows || [];
  }

  async function loadQuickReplies() {
    if (!currentShopId) {
      quickRepliesCache = [];
      return;
    }
    var data = await apiGet("/api/chat/quick-replies?shop_id=" + encodeURIComponent(currentShopId));
    quickRepliesCache = data.rows || [];
  }

  async function syncAll(refreshProducts) {
    currentShopId = selectedShopId();
    if (!currentShopId) throw new Error("shop_id wajib");
    await apiPost("/api/chat/sync", { shop_id: currentShopId });
    await loadConversations();
    await loadMessages();
    await loadOrders(true);
    await loadQuickReplies();
    await loadProducts(!!refreshProducts);
  }

  async function openConversation(conversationId) {
    selectedConversationId = String(conversationId || "");
    await apiPost("/api/chat/sync", {
      shop_id: selectedShopId(),
      conversation_id: selectedConversationId
    });
    await loadMessages();
    await loadOrders(true);
    await loadConversations();
    renderAll();
    scrollThreadToBottom();
  }

  function scrollThreadToBottom() {
    var box = document.getElementById("CHAT-MESSAGES");
    if (box) box.scrollTop = box.scrollHeight;
  }

  function renderShops() {
    var host = document.getElementById("CHAT-SHOP-LIST");
    if (!host) return;
    if (!shopsCache.length) {
      host.innerHTML = '<div class="ajw-chat-empty">Belum ada token toko. Klik OAuth sekali untuk hubungkan toko.</div>';
      return;
    }
    host.innerHTML = shopsCache
      .map(function (shop) {
        var sid = String(shop.shop_id || "");
        return (
          '<div class="ajw-chat-shop ' + (sid === String(currentShopId || "") ? "on" : "") + '" data-shop-id="' + escSafe(sid) + '">' +
          '<div style="font-size:12px;font-weight:800;color:var(--tx)">Shop ' + escSafe(sid) + "</div>" +
          '<div style="font-size:10px;color:var(--tx3);margin-top:4px">Token update: ' + escSafe(fmtTs(shop.updated_at)) + "</div>" +
          "</div>"
        );
      })
      .join("");

    host.querySelectorAll("[data-shop-id]").forEach(function (el) {
      el.addEventListener("click", function () {
        currentShopId = String(el.getAttribute("data-shop-id") || "");
        selectedConversationId = "";
        window.localStorage.setItem("ajw_chat_shop_id", currentShopId);
        Promise.all([loadConversations(), loadQuickReplies(), loadProducts(false)]).then(function () {
          if (selectedConversationId) {
            loadMessages().then(function () {
              loadOrders(false).then(renderAll);
            });
          } else {
            renderAll();
          }
        });
      });
    });
  }

  function renderConversations() {
    var host = document.getElementById("CHAT-CONV-LIST");
    if (!host) return;
    if (!conversationsCache.length) {
      host.innerHTML = '<div class="ajw-chat-empty">Belum ada percakapan untuk filter ini.</div>';
      return;
    }
    host.innerHTML = conversationsCache
      .map(function (row) {
        var unread = Number(row.unread_count || 0);
        var unreplied = Number(row.has_unreplied || 0) > 0;
        return (
          '<div class="ajw-chat-conv ' + (String(row.conversation_id) === String(selectedConversationId || "") ? "on" : "") + '" data-conv-id="' + escSafe(row.conversation_id) + '">' +
          '<div style="display:flex;justify-content:space-between;gap:10px;align-items:flex-start">' +
          '<div style="min-width:0">' +
          '<div style="font-size:12px;font-weight:800;color:var(--tx)">' + escSafe(row.to_name || row.to_id || row.conversation_id) + "</div>" +
          '<div style="font-size:11px;color:var(--tx2);margin-top:5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + escSafe(row.latest_message_text || "-") + "</div>" +
          "</div>" +
          '<div style="font-size:10px;color:var(--tx3);white-space:nowrap">' + escSafe(fmtTs(row.last_message_timestamp)) + "</div>" +
          "</div>" +
          '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:8px">' +
          (unread > 0 ? '<span class="ajw-chat-pill blue">Unread ' + unread + "</span>" : "") +
          (unreplied ? '<span class="ajw-chat-pill red">Belum dibalas</span>' : "") +
          "</div>" +
          "</div>"
        );
      })
      .join("");

    host.querySelectorAll("[data-conv-id]").forEach(function (el) {
      el.addEventListener("click", function () {
        openConversation(el.getAttribute("data-conv-id") || "");
      });
    });
  }

  function renderMessages() {
    var host = document.getElementById("CHAT-MESSAGES");
    if (!host) return;
    if (!selectedConversationId) {
      host.innerHTML = '<div class="ajw-chat-empty">Pilih percakapan di kiri untuk mulai membalas.</div>';
      return;
    }
    if (!messagesCache.length) {
      host.innerHTML = '<div class="ajw-chat-empty">Belum ada pesan tersimpan.</div>';
      return;
    }
    host.innerHTML = messagesCache
      .map(function (row) {
        var mine = String(row.from_id || "") === String(currentShopId || "");
        return (
          '<div class="ajw-chat-bubble-row ' + (mine ? "mine" : "") + '">' +
          '<div class="ajw-chat-bubble ' + (mine ? "mine" : "") + '">' +
          '<div style="font-size:12px;line-height:1.55;white-space:pre-wrap;word-break:break-word">' + escSafe(row.content_text || "(non-text)") + "</div>" +
          '<div style="font-size:10px;color:var(--tx3);margin-top:6px">' + escSafe(fmtTs(row.created_timestamp)) + "</div>" +
          "</div></div>"
        );
      })
      .join("");
  }

  function renderAttachments() {
    var host = document.getElementById("CHAT-ATTACHMENTS");
    if (!host) return;
    if (!attachmentQueue.length) {
      host.innerHTML = "";
      return;
    }
    host.innerHTML = attachmentQueue
      .map(function (file, idx) {
        return (
          '<div class="ajw-chat-attach-card">' +
          '<div style="display:flex;justify-content:space-between;gap:10px;margin-bottom:6px">' +
          '<div style="font-size:11px;font-weight:700;color:var(--tx)">' + escSafe(file.name) + "</div>" +
          '<button class="btns" data-att-rm="' + idx + '" style="padding:4px 8px;font-size:10px">Hapus</button>' +
          "</div>" +
          (file.kind === "image"
            ? '<img src="' + escSafe(file.dataUrl) + '" style="width:100%;height:90px;object-fit:cover;border-radius:8px;border:1px solid var(--bd);background:#fff">'
            : '<div style="height:90px;border:1px solid var(--bd);border-radius:8px;display:flex;align-items:center;justify-content:center;background:#111;color:#fff;font-size:12px">Video Siap Kirim</div>') +
          '<div style="font-size:10px;color:var(--tx3);margin-top:6px">' + escSafe(file.kind.toUpperCase()) + "</div>" +
          "</div>"
        );
      })
      .join("");

    host.querySelectorAll("[data-att-rm]").forEach(function (el) {
      el.addEventListener("click", function () {
        attachmentQueue.splice(Number(el.getAttribute("data-att-rm")), 1);
        renderAttachments();
      });
    });
  }

  function renderOrdersTab() {
    if (!ordersCache.length) {
      return '<div class="ajw-chat-empty">Belum ada riwayat pesanan yang terhubung ke percakapan ini. Setelah chat berisi referensi order atau data order tersinkron, riwayat akan tampil di sini.</div>';
    }
    return ordersCache
      .map(function (order) {
        var items = [];
        try {
          items = JSON.parse(order.items_json || "[]");
        } catch (_e) {}
        return (
          '<div class="ajw-chat-card">' +
          '<div style="display:flex;justify-content:space-between;gap:10px;align-items:flex-start">' +
          '<div><div style="font-size:12px;font-weight:800;color:var(--tx)">' + escSafe(order.order_sn || "-") + "</div>" +
          '<div style="font-size:10px;color:var(--tx3);margin-top:4px">' + escSafe(fmtTs(order.create_time)) + "</div></div>" +
          '<span class="ajw-chat-pill gold">' + escSafe(order.order_status || "-") + "</span>" +
          "</div>" +
          '<div style="font-size:12px;color:var(--tx2);margin-top:10px">Total: <b>' + escSafe(money(order.total_amount)) + "</b></div>" +
          '<div style="margin-top:10px">' +
          items
            .slice(0, 8)
            .map(function (item) {
              return (
                '<div style="padding:8px 0;border-top:1px solid var(--bd)">' +
                '<div style="font-size:12px;font-weight:700;color:var(--tx)">' + escSafe(item.item_name || item.model_name || "-") + "</div>" +
                '<div style="font-size:10px;color:var(--tx3);margin-top:4px">SKU: ' + escSafe(item.model_sku || item.item_sku || "-") + " • x" + escSafe(item.model_quantity_purchased || item.quantity_purchased || 1) + "</div>" +
                "</div>"
              );
            })
            .join("") +
          "</div></div>"
        );
      })
      .join("");
  }

  function parseProductPrice(row) {
    try {
      var priceInfo = JSON.parse(row.price_info || "[]");
      if (Array.isArray(priceInfo) && priceInfo[0] && priceInfo[0].current_price != null) return money(priceInfo[0].current_price);
    } catch (_e) {}
    return "-";
  }

  function renderProductsTab() {
    return (
      '<div style="display:flex;gap:8px;margin-bottom:10px">' +
      '<input id="CHAT-PRODUCT-SEARCH" class="fi" placeholder="Cari nama produk / SKU" value="' + escSafe(productSearch) + '">' +
      '<button id="CHAT-PRODUCT-REFRESH" class="btns">Refresh</button>' +
      "</div>" +
      (productsCache.length
        ? productsCache
            .map(function (row) {
              return (
                '<div class="ajw-chat-card">' +
                '<div class="ajw-chat-product">' +
                '<img src="' + escSafe(row.image_url || "") + '" alt="' + escSafe(row.item_name || "produk") + '">' +
                '<div style="min-width:0">' +
                '<div style="font-size:12px;font-weight:800;color:var(--tx);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + escSafe(row.item_name || "-") + "</div>" +
                '<div style="font-size:11px;color:var(--tx2);margin-top:4px">SKU: ' + escSafe(row.sku || "-") + "</div>" +
                '<div style="font-size:11px;color:var(--tx2);margin-top:4px">Harga: ' + escSafe(parseProductPrice(row)) + " • Stok: " + escSafe(row.stock || 0) + "</div>" +
                "</div>" +
                '<button class="btnp" data-send-product="' + escSafe(row.item_id || "") + '" style="padding:8px 12px">Kirim</button>' +
                "</div></div>"
              );
            })
            .join("")
        : '<div class="ajw-chat-empty">Belum ada data produk. Klik Refresh atau Sync Chat untuk memuat katalog toko.</div>')
    );
  }

  function renderRepliesTab() {
    return (
      '<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:10px">' +
      '<div style="font-size:12px;font-weight:800;color:var(--tx)">Balasan Cepat</div>' +
      '<button id="CHAT-QR-ADD" class="btnp" style="padding:8px 12px">Tambah</button>' +
      "</div>" +
      (quickRepliesCache.length
        ? quickRepliesCache
            .map(function (row) {
              return (
                '<div class="ajw-chat-card">' +
                '<div style="display:flex;justify-content:space-between;gap:8px;align-items:flex-start">' +
                '<div style="min-width:0"><div style="font-size:12px;font-weight:800;color:var(--tx)">' + escSafe(row.title || row.group_name || "Balasan") + "</div>" +
                '<div style="font-size:10px;color:var(--tx3);margin-top:4px">' + escSafe(row.group_name || "Umum") + "</div></div>" +
                '<button class="btns" data-qr-del="' + escSafe(row.id) + '" style="padding:5px 8px;font-size:10px">Hapus</button>' +
                "</div>" +
                '<div style="font-size:12px;color:var(--tx2);margin-top:10px;white-space:pre-wrap;line-height:1.55">' + escSafe(row.content || "") + "</div>" +
                '<div style="display:flex;justify-content:flex-end;margin-top:10px"><button class="btnp" data-qr-use="' + escSafe(row.id) + '" style="padding:8px 12px">Pakai</button></div>' +
                "</div>"
              );
            })
            .join("")
        : '<div class="ajw-chat-empty">Belum ada balasan cepat untuk toko ini.</div>')
    );
  }

  function renderSidePanel() {
    var host = document.getElementById("CHAT-RIGHT-CONTENT");
    if (!host) return;
    host.innerHTML =
      activeSideTab === "orders"
        ? renderOrdersTab()
        : activeSideTab === "products"
        ? renderProductsTab()
        : renderRepliesTab();

    var searchInput = document.getElementById("CHAT-PRODUCT-SEARCH");
    if (searchInput) {
      searchInput.addEventListener("change", function () {
        productSearch = String(searchInput.value || "").trim();
        loadProducts(false).then(renderAll);
      });
    }

    var refreshBtn = document.getElementById("CHAT-PRODUCT-REFRESH");
    if (refreshBtn) {
      refreshBtn.onclick = function () {
        loadProducts(true).then(renderAll);
      };
    }

    host.querySelectorAll("[data-send-product]").forEach(function (el) {
      el.addEventListener("click", function () {
        var itemId = String(el.getAttribute("data-send-product") || "");
        var row = productsCache.find(function (r) { return String(r.item_id) === itemId; });
        if (!row) return;
        var text =
          "Produk rekomendasi:\n" +
          row.item_name +
          "\nSKU: " +
          (row.sku || "-") +
          "\nHarga: " +
          parseProductPrice(row) +
          "\n" +
          (row.image_url || "");
        var ta = document.getElementById("CHAT-REPLY-TEXT");
        if (ta) {
          ta.value = text;
          ta.focus();
        }
      });
    });

    var addReplyBtn = document.getElementById("CHAT-QR-ADD");
    if (addReplyBtn) {
      addReplyBtn.onclick = async function () {
        var title = prompt("Judul balasan cepat:");
        if (title == null) return;
        var content = prompt("Isi balasan cepat:");
        if (!String(content || "").trim()) return;
        await apiPost("/api/chat/quick-replies", {
          shop_id: currentShopId,
          title: String(title || "").trim() || String(content || "").trim().slice(0, 30),
          content: String(content || "").trim(),
          group_name: "Umum",
          position: quickRepliesCache.length + 1
        });
        await loadQuickReplies();
        renderAll();
      };
    }

    host.querySelectorAll("[data-qr-use]").forEach(function (el) {
      el.addEventListener("click", function () {
        var id = String(el.getAttribute("data-qr-use") || "");
        var row = quickRepliesCache.find(function (r) { return String(r.id) === id; });
        if (!row) return;
        var ta = document.getElementById("CHAT-REPLY-TEXT");
        if (ta) {
          ta.value = row.content || "";
          ta.focus();
        }
      });
    });

    host.querySelectorAll("[data-qr-del]").forEach(function (el) {
      el.addEventListener("click", function () {
        var id = String(el.getAttribute("data-qr-del") || "");
        apiDelete("/api/chat/quick-replies/" + encodeURIComponent(id))
          .then(loadQuickReplies)
          .then(renderAll)
          .catch(function (err) {
            toast("Gagal hapus balasan cepat: " + (err.message || err), "error");
          });
      });
    });
  }

  function renderHeaderState() {
    var info = document.getElementById("CHAT-ACTIVITY");
    if (!info) return;
    var conv = currentConversation();
    info.innerHTML =
      '<span class="ajw-chat-pill gold">Realtime ' + (realtimeEnabled ? "On" : "Off") + "</span>" +
      '<span class="ajw-chat-pill blue">Toko ' + escSafe(currentShopId || "-") + "</span>" +
      (conv ? '<span class="ajw-chat-pill red">Pelanggan ' + escSafe(conv.to_name || conv.to_id || "-") + "</span>" : "");
    var realtimeBtn = document.getElementById("CHAT-REALTIME");
    if (realtimeBtn) realtimeBtn.textContent = realtimeEnabled ? "Realtime On" : "Realtime Off";
  }

  function renderAll() {
    renderHeaderState();
    renderShops();
    renderConversations();
    renderMessages();
    renderAttachments();
    renderSidePanel();
    renderFilterState();
    renderSideTabs();
  }

  function renderFilterState() {
    document.querySelectorAll("[data-chat-filter]").forEach(function (el) {
      var on = String(el.getAttribute("data-chat-filter")) === String(activeFilter);
      el.className = "ajw-chat-filter" + (on ? " on" : "");
    });
  }

  function renderSideTabs() {
    document.querySelectorAll("[data-chat-side-tab]").forEach(function (el) {
      var on = String(el.getAttribute("data-chat-side-tab")) === String(activeSideTab);
      el.className = "ajw-chat-side-tab" + (on ? " on" : "");
    });
  }

  function toggleEmoji(open) {
    emojiOpen = open == null ? !emojiOpen : !!open;
    var picker = document.getElementById("CHAT-EMOJI");
    if (picker) picker.style.display = emojiOpen ? "grid" : "none";
  }

  function readFileAsDataUrl(file) {
    return new Promise(function (resolve, reject) {
      var fr = new FileReader();
      fr.onload = function () {
        resolve(fr.result);
      };
      fr.onerror = reject;
      fr.readAsDataURL(file);
    });
  }

  async function enqueueFile(file) {
    if (!file) return;
    var kind = String(file.type || "").toLowerCase().indexOf("video/") === 0 ? "video" : "image";
    var dataUrl = await readFileAsDataUrl(file);
    attachmentQueue.push({
      kind: kind,
      name: file.name || (kind === "video" ? "video.mp4" : "image.png"),
      mime: file.type || (kind === "video" ? "video/mp4" : "image/png"),
      dataUrl: dataUrl
    });
    renderAttachments();
  }

  async function uploadAndSendAttachment(file, caption) {
    var upload = await apiPost("/api/chat/upload-media", {
      shop_id: currentShopId,
      conversation_id: selectedConversationId,
      data_url: file.dataUrl,
      filename: file.name,
      mime: file.mime
    });
    await apiPost("/api/chat/send-media", {
      shop_id: currentShopId,
      conversation_id: selectedConversationId,
      media_url: upload.row.public_url,
      caption: caption || "",
      media_type: file.kind,
      mime: file.mime
    });
  }

  async function sendCurrentMessage() {
    currentShopId = selectedShopId();
    if (!currentShopId) return toast("Pilih toko dulu.", "warn");
    if (!selectedConversationId) return toast("Pilih percakapan dulu.", "warn");
    var ta = document.getElementById("CHAT-REPLY-TEXT");
    var text = String((ta && ta.value) || "").trim();
    if (!text && !attachmentQueue.length) return toast("Isi pesan atau lampiran dulu.", "warn");

    try {
      for (var i = 0; i < attachmentQueue.length; i += 1) {
        await uploadAndSendAttachment(attachmentQueue[i], i === 0 ? text : "");
      }
      if (!attachmentQueue.length && text) {
        await apiPost("/api/chat/send", {
          shop_id: currentShopId,
          conversation_id: selectedConversationId,
          text: text
        });
      }
      attachmentQueue = [];
      if (ta) ta.value = "";
      await loadMessages();
      await loadOrders(true);
      await loadConversations();
      renderAll();
      scrollThreadToBottom();
      toast("Pesan berhasil dikirim.", "success");
    } catch (err) {
      toast("Gagal kirim pesan: " + (err.message || err), "error");
    }
  }

  async function runRealtimePoll() {
    if (!realtimeEnabled || !currentShopId || document.hidden || window._activeTab !== "chat") return;
    try {
      var data = await apiPost("/api/chat/realtime/poll", {
        shop_id: currentShopId,
        conversation_id: selectedConversationId || ""
      });
      conversationsCache = (data.conversations || []).sort(function (a, b) {
        return Number(b.last_message_timestamp || 0) - Number(a.last_message_timestamp || 0);
      });
      if (selectedConversationId) messagesCache = data.messages || [];
      renderAll();
    } catch (_err) {}
  }

  function startRealtime() {
    stopRealtime();
    realtimeTimer = setInterval(runRealtimePoll, 8000);
  }

  function stopRealtime() {
    if (realtimeTimer) clearInterval(realtimeTimer);
    realtimeTimer = null;
  }

  function bindComposer() {
    var sendBtn = document.getElementById("CHAT-SEND");
    var oauthBtn = document.getElementById("CHAT-OAUTH");
    var syncBtn = document.getElementById("CHAT-SYNC");
    var saveBtn = document.getElementById("CHAT-SAVE-API");
    var realtimeBtn = document.getElementById("CHAT-REALTIME");
    var imgInput = document.getElementById("CHAT-UPLOAD-IMG");
    var vidInput = document.getElementById("CHAT-UPLOAD-VID");
    var ta = document.getElementById("CHAT-REPLY-TEXT");
    var shopInput = document.getElementById("CHAT-SHOP-ID-MANUAL");

    if (saveBtn) {
      saveBtn.onclick = function () {
        var base = document.getElementById("CHAT-API-BASE");
        API_BASE = String((base && base.value) || "").trim().replace(/\/$/, "");
        window.localStorage.setItem("ajw_chat_api_base", API_BASE);
        toast("API backend disimpan.", "success");
      };
    }

    if (oauthBtn) {
      oauthBtn.onclick = function () {
        currentShopId = selectedShopId();
        if (!currentShopId) return toast("Isi shop_id dulu.", "warn");
        apiGet("/api/shopee/oauth/url?shop_id=" + encodeURIComponent(currentShopId))
          .then(function (data) {
            window.open(data.url, "_blank");
          })
          .catch(function (err) {
            toast("Gagal buka OAuth: " + (err.message || err), "error");
          });
      };
    }

    if (syncBtn) {
      syncBtn.onclick = function () {
        syncAll(true)
          .then(function () {
            renderAll();
            scrollThreadToBottom();
            toast("Chat, produk, dan context pelanggan berhasil disinkron.", "success");
          })
          .catch(function (err) {
            toast("Sync gagal: " + (err.message || err), "error");
          });
      };
    }

    if (realtimeBtn) {
      realtimeBtn.onclick = function () {
        realtimeEnabled = !realtimeEnabled;
        if (realtimeEnabled) startRealtime();
        else stopRealtime();
        renderHeaderState();
      };
    }

    if (sendBtn) sendBtn.onclick = sendCurrentMessage;
    if (shopInput) {
      shopInput.onchange = function () {
        currentShopId = selectedShopId();
        selectedConversationId = "";
        Promise.all([loadConversations(), loadQuickReplies(), loadProducts(false)])
          .then(function () {
            renderAll();
          })
          .catch(function (err) {
            toast("Gagal pindah toko: " + (err.message || err), "error");
          });
      };
    }
    if (imgInput) {
      imgInput.onchange = function () {
        if (imgInput.files && imgInput.files[0]) enqueueFile(imgInput.files[0]);
        imgInput.value = "";
      };
    }
    if (vidInput) {
      vidInput.onchange = function () {
        if (vidInput.files && vidInput.files[0]) enqueueFile(vidInput.files[0]);
        vidInput.value = "";
      };
    }
    if (ta) {
      ta.addEventListener("keydown", function (ev) {
        if (ev.key === "Enter" && !ev.shiftKey) {
          ev.preventDefault();
          sendCurrentMessage();
        }
      });
      ta.addEventListener("paste", function (ev) {
        var items = ev.clipboardData && ev.clipboardData.items ? ev.clipboardData.items : [];
        for (var i = 0; i < items.length; i += 1) {
          if (items[i].kind === "file") {
            var file = items[i].getAsFile();
            if (file) {
              enqueueFile(file);
              ev.preventDefault();
              return;
            }
          }
        }
      });
    }

    document.querySelectorAll("[data-chat-filter]").forEach(function (el) {
      el.addEventListener("click", function () {
        activeFilter = String(el.getAttribute("data-chat-filter") || "all");
        window.localStorage.setItem("ajw_chat_filter", activeFilter);
        loadConversations().then(renderAll);
      });
    });

    document.querySelectorAll("[data-chat-side-tab]").forEach(function (el) {
      el.addEventListener("click", function () {
        activeSideTab = String(el.getAttribute("data-chat-side-tab") || "orders");
        window.localStorage.setItem("ajw_chat_side_tab", activeSideTab);
        renderAll();
      });
    });

    document.querySelectorAll("[data-chat-emoji]").forEach(function (el) {
      el.addEventListener("click", function () {
        toggleEmoji();
      });
    });

    document.querySelectorAll("[data-chat-media='image']").forEach(function (el) {
      el.addEventListener("click", function () {
        document.getElementById("CHAT-UPLOAD-IMG").click();
      });
    });

    document.querySelectorAll("[data-chat-media='video']").forEach(function (el) {
      el.addEventListener("click", function () {
        document.getElementById("CHAT-UPLOAD-VID").click();
      });
    });

    var picker = document.getElementById("CHAT-EMOJI");
    if (picker) {
      picker.innerHTML = EMOJIS.map(function (emoji) {
        return '<button type="button" data-pick-emoji="' + escSafe(emoji) + '">' + escSafe(emoji) + "</button>";
      }).join("");
      picker.querySelectorAll("[data-pick-emoji]").forEach(function (el) {
        el.addEventListener("click", function () {
          var val = el.getAttribute("data-pick-emoji") || "";
          var field = document.getElementById("CHAT-REPLY-TEXT");
          if (field) field.value = (field.value || "") + val;
          toggleEmoji(false);
        });
      });
    }
  }

  function mountChatShell() {
    var v = ensureView();
    ensureStyles();
    applyWideLayout(true);
    hideOtherViews();
    v.style.display = "block";
    v.innerHTML =
      '<div class="ajw-chat-toolbar">' +
      '<input id="CHAT-API-BASE" class="fi" placeholder="https://shopeebackend.vercel.app" value="' + escSafe(API_BASE) + '">' +
      '<input id="CHAT-SHOP-ID-MANUAL" class="fi" placeholder="shop_id aktif" value="' + escSafe(currentShopId) + '">' +
      '<button id="CHAT-SAVE-API" class="btns">Simpan API</button>' +
      '<button id="CHAT-OAUTH" class="btns">OAuth</button>' +
      '<button id="CHAT-SYNC" class="btnp">Sync Chat</button>' +
      "</div>" +
      '<div class="ajw-chat-shell">' +
      '<div class="ajw-chat-col">' +
      '<div class="ajw-chat-head"><div style="font-size:12px;font-weight:800;color:var(--tx)">Toko</div><div id="CHAT-ACTIVITY" style="display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end"></div></div>' +
      '<div id="CHAT-SHOP-LIST" class="ajw-chat-body"></div>' +
      "</div>" +
      '<div class="ajw-chat-col">' +
      '<div class="ajw-chat-head"><div style="font-size:12px;font-weight:800;color:var(--tx)">Percakapan Terbaru</div><div style="display:flex;gap:6px"><button id="CHAT-REALTIME" class="btns" style="padding:6px 10px;font-size:10px">Realtime</button></div></div>' +
      '<div style="padding:10px 12px;border-bottom:1px solid var(--bd);display:flex;gap:6px;flex-wrap:wrap">' +
      '<button data-chat-filter="all" class="ajw-chat-filter">Semua</button>' +
      '<button data-chat-filter="unreplied" class="ajw-chat-filter">Belum Dibalas</button>' +
      '<button data-chat-filter="unread" class="ajw-chat-filter">Belum Dibaca</button>' +
      "</div>" +
      '<div id="CHAT-CONV-LIST" class="ajw-chat-body"></div>' +
      "</div>" +
      '<div class="ajw-chat-col" style="position:relative">' +
      '<div class="ajw-chat-head"><div style="font-size:13px;font-weight:800;color:var(--tx)">Chat</div><div style="font-size:11px;color:var(--tx3)">Live panel</div></div>' +
      '<div id="CHAT-MESSAGES" class="ajw-chat-thread"></div>' +
      '<div class="ajw-chat-compose">' +
      '<div class="ajw-chat-compose-tools">' +
      '<button type="button" class="ajw-chat-iconbtn" data-chat-emoji="1" title="Emoji">😊</button>' +
      '<button type="button" class="ajw-chat-iconbtn" data-chat-media="image" title="Upload gambar">🖼️</button>' +
      '<button type="button" class="ajw-chat-iconbtn" data-chat-media="video" title="Upload video">🎬</button>' +
      '<span style="font-size:11px;color:var(--tx3)">Paste gambar langsung juga bisa.</span>' +
      '<input id="CHAT-UPLOAD-IMG" type="file" accept="image/*" style="display:none">' +
      '<input id="CHAT-UPLOAD-VID" type="file" accept="video/*" style="display:none">' +
      "</div>" +
      '<div id="CHAT-ATTACHMENTS" class="ajw-chat-attach"></div>' +
      '<textarea id="CHAT-REPLY-TEXT" class="fi" style="min-height:110px;resize:vertical" placeholder="Tulis balasan, kirim emoji, paste gambar, atau lampirkan video..."></textarea>' +
      '<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;margin-top:8px">' +
      '<div style="font-size:11px;color:var(--tx3)">Realtime aktif, percakapan disegarkan berkala.</div>' +
      '<button id="CHAT-SEND" class="btnp">Kirim</button>' +
      "</div>" +
      '<div id="CHAT-EMOJI" class="ajw-chat-emoji" style="display:none"></div>' +
      "</div>" +
      "</div>" +
      '<div class="ajw-chat-col">' +
      '<div class="ajw-chat-side-tabs">' +
      '<button class="ajw-chat-side-tab" data-chat-side-tab="orders">Pesanan</button>' +
      '<button class="ajw-chat-side-tab" data-chat-side-tab="products">Rincian Produk</button>' +
      '<button class="ajw-chat-side-tab" data-chat-side-tab="replies">Balasan Cepat</button>' +
      "</div>" +
      '<div id="CHAT-RIGHT-CONTENT" class="ajw-chat-side-content"></div>' +
      "</div>" +
      "</div>";

    bindComposer();
  }

  window._renderChat = function () {
    mountChatShell();
    loadShops()
      .then(function () {
        return loadConversations();
      })
      .then(function () {
        return Promise.all([loadQuickReplies(), loadProducts(false)]);
      })
      .then(function () {
        if (selectedConversationId) {
          return Promise.all([loadMessages(), loadOrders(false)]);
        }
      })
      .then(function () {
        renderAll();
        scrollThreadToBottom();
        startRealtime();
      })
      .catch(function (err) {
        renderAll();
        toast("Gagal memuat chat: " + (err.message || err), "error");
      });
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
        stopRealtime();
        toggleEmoji(false);
        applyWideLayout(false);
        return oldNav.apply(this, arguments);
      };
      window._navTo._chatWrapped = true;
    }
  }

  hookNavigation();
  ensureChatTabButton();
})();
