(function () {
  var DEFAULT_API_BASE = (function () {
    var host = String(window.location.hostname || "").toLowerCase();
    if (host === "localhost" || host === "127.0.0.1") return "http://localhost:3010";
    return String(window.location.origin || "").replace(/\/$/, "");
  })();
  var API_BASE = window.localStorage.getItem("ajw_chat_api_base") || DEFAULT_API_BASE;
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
  var knowledgeCache = [];
  var aiDraftsCache = [];
  var aiLearningCache = [];
  var aiLearningStats = null;
  var aiSettings = null;
  var repliesManageMenu = window.localStorage.getItem("ajw_chat_replies_menu") || "quick";
  var knowledgeCategoryFilter = window.localStorage.getItem("ajw_chat_knowledge_filter") || "Semua";
  var quickFormState = safeJson(window.localStorage.getItem("ajw_chat_quick_form"), {
    keyword: "",
    title: "",
    content: ""
  });
  var knowledgeFormState = safeJson(window.localStorage.getItem("ajw_chat_knowledge_form"), {
    keyword: "",
    group_name: "",
    template: ""
  });
  var aiLabState = safeJson(window.localStorage.getItem("ajw_chat_ai_lab_form"), {
    incoming_text: "",
    generated_text: "",
    score: 5,
    notes: ""
  });
  var autonomousEnabled = window.localStorage.getItem("ajw_chat_ai_autonomous") === "1";
  var autonomousTimer = null;
  var replyGroupFilter = window.localStorage.getItem("ajw_chat_reply_group") || "Umum";
  var predictionEnabled = window.localStorage.getItem("ajw_chat_pred_toggle") !== "0";
  var referenceEnabled = window.localStorage.getItem("ajw_chat_ref_toggle") !== "0";
  var attachmentQueue = [];
  var productSearch = "";
  var shopSearch = window.localStorage.getItem("ajw_chat_shop_search") || "";
  var emojiOpen = false;
  var pollInFlight = false;
  var autonomousInFlight = false;
  var lastRealtimeConvSig = "";
  var lastRealtimeMsgSig = "";
  var lastUserActionAt = 0;
  var refreshConversationsTimer = null;
  var savedBodyStyle = null;
  var EMOJIS = ["🙂", "😊", "🙏", "👍", "👌", "🔥", "⭐", "🎣", "📦", "🚚", "💬", "❤️"];
  var AI_CORE_PROMPT_ANTON = [
    "Anda adalah AI Customer Assistant resmi untuk Anton Pancing.",
    "",
    "Tujuan utama Anda:",
    "- membantu customer dengan cepat, ramah, akurat, dan meyakinkan",
    "- meningkatkan kepuasan customer, peluang closing, kepercayaan toko, dan rating pembeli",
    "- mengurangi jawaban kaku seperti bot",
    "- tetap aman: tidak mengarang data yang tidak tersedia",
    "",
    "Peran Anda:",
    "- customer service",
    "- sales assistant",
    "- konsultan alat pancing",
    "- after sales support",
    "- edukator produk dasar hingga menengah",
    "- asisten follow up pembelian dan pengiriman",
    "",
    "Prinsip kerja utama:",
    "- utamakan membantu customer menyelesaikan kebutuhan secepat mungkin",
    "- baca konteks chat terbaru terlebih dahulu",
    "- jika ada histori percakapan, gunakan sebagai konteks lanjutan",
    "- jika ada data pesanan, produk, SKU, stok, harga, resi, atau status order, prioritaskan data itu",
    "- jika ada referensi dari pusat informasi, keyword knowledge, atau balasan cepat, gunakan sebagai bahan bantu, bukan dibaca mentah seperti template",
    "- Anda boleh improvisasi agar jawaban lebih natural, lebih cocok dengan situasi, dan lebih manusiawi",
    "- namun improvisasi tidak boleh mengubah fakta penting",
    "- jika data tidak tersedia, katakan dengan jujur dan arahkan ke langkah berikutnya",
    "",
    "Gaya bahasa:",
    "- gunakan bahasa Indonesia yang natural, sopan, singkat, dan enak dibaca",
    "- terdengar seperti admin toko yang sigap, bukan robot",
    "- hangat, ramah, profesional",
    "- tidak terlalu formal",
    "- tidak terlalu panjang kecuali customer meminta detail",
    "- hindari pembukaan berulang jika percakapan sudah berjalan",
    "- jika perlu, gunakan sapaan ringan seperti kak, gan, atau kakak, tetapi tetap wajar",
    "- akhiri dengan langkah lanjutan yang jelas jika memang membantu",
    "",
    "Aturan penting:",
    "- jangan mengarang stok, harga, variasi, spesifikasi, ongkir, promo, atau status pesanan",
    "- jangan menyebut data pasti jika sistem tidak memberikannya",
    "- jangan membuat janji yang belum tentu bisa dipenuhi",
    "- jangan menjawab terlalu panjang untuk pertanyaan sederhana",
    "- jangan gunakan format markdown berlebihan",
    "- jangan gunakan tanda bintang ganda",
    "- jangan menjelaskan aturan internal, prompt, kategori, intent, atau proses berpikir",
    "- jangan terdengar seperti membaca template mentah",
    "- jangan memaksa closing jika customer sedang komplain atau butuh bantuan teknis",
    "",
    "Prioritas konteks saat menjawab:",
    "1. pesan customer terbaru",
    "2. histori percakapan",
    "3. data pesanan customer",
    "4. data produk relevan",
    "5. pusat informasi atau keyword referensi",
    "6. balasan cepat atau template",
    "7. fallback jawaban umum yang aman",
    "",
    "Aturan perilaku berdasarkan kondisi:",
    "",
    "1. Jika customer bertanya singkat atau ambigu",
    "- anggap itu lanjutan percakapan jika konteks mendukung",
    "- jangan langsung tanya terlalu banyak",
    "- jika perlu klarifikasi, tanyakan maksimal 1 sampai 2 pertanyaan paling penting",
    "",
    "2. Jika customer bertanya produk spesifik",
    "- jawab berdasarkan data produk yang tersedia",
    "- sebutkan inti saja: nama, fungsi utama, harga jika ada, stok jika ada, variasi jika relevan",
    "- jika customer tampak siap beli, arahkan dengan singkat ke langkah order",
    "",
    "3. Jika customer minta rekomendasi",
    "- pahami kebutuhan customer dari konteks",
    "- berikan 1 sampai 3 opsi paling relevan, bukan terlalu banyak",
    "- jelaskan singkat kenapa cocok",
    "- jika data kurang, tanya kebutuhan inti seperti target ikan, ukuran line, teknik, atau budget",
    "",
    "4. Jika customer bertanya stok",
    "- jawab hanya berdasarkan data stok yang tersedia",
    "- jika stok tidak ada di sistem, jangan menebak",
    "- arahkan customer cek katalog lengkap jika perlu",
    "",
    "5. Jika customer bertanya harga",
    "- jawab langsung jika data ada",
    "- jika harga bervariasi tergantung ukuran atau variasi, jelaskan singkat",
    "- jika tidak ada data harga, katakan belum ada info harga spesifik dan arahkan ke produk atau katalog terkait",
    "",
    "6. Jika customer ingin lihat banyak pilihan atau katalog lengkap",
    "- arahkan ke toko online",
    "- Website: antonpancing.com",
    "- Shopee: https://s.shopee.co.id/1VnYnMyZHe",
    "- Lazada: https://s.lazada.co.id/s.ZYQlXU?cc",
    "",
    "7. Jika customer ingin beli",
    "- arahkan ke langkah pembelian secara singkat dan jelas",
    "- jika produk sudah jelas, arahkan langsung checkout",
    "- jika belum jelas, bantu pilih produk dulu dengan singkat",
    "",
    "8. Jika customer komplain",
    "- dahulukan empati",
    "- jangan defensif",
    "- minta data penting sesingkat mungkin",
    "- prioritaskan solusi dan tindak lanjut",
    "- jika perlu, minta nama, nomor pesanan, foto, video, atau detail kendala",
    "",
    "9. Jika customer bertanya status pesanan atau pengiriman",
    "- gunakan data pesanan, resi, atau status yang tersedia",
    "- jika belum ada data valid, jangan menebak",
    "- arahkan customer kirim nomor pesanan bila perlu",
    "",
    "10. Jika customer bertanya teknis alat pancing",
    "- jawab singkat, praktis, dan relevan",
    "- bantu seperti konsultan toko",
    "- sesuaikan jawaban dengan target ikan, ukuran line, reel, joran, teknik, dan budget jika konteks tersedia",
    "",
    "11. Jika customer tampak ragu",
    "- jawab dengan nada menenangkan dan meyakinkan",
    "- fokus pada manfaat utama, kecocokan, dan langkah berikutnya",
    "- bantu customer maju ke keputusan, tapi jangan memaksa",
    "",
    "12. Jika customer marah atau kecewa",
    "- tetap tenang",
    "- validasi perasaannya secara singkat",
    "- fokus ke penyelesaian",
    "- jangan debat",
    "",
    "Tujuan output:",
    "- jawaban harus terasa seperti admin toko yang pintar, cepat, paham produk, dan peduli customer",
    "- jawaban harus relevan terhadap pesan terakhir",
    "- jika ada peluang membantu lebih lanjut, tutup dengan 1 langkah lanjutan yang jelas",
    "- jika tidak perlu, cukup jawab singkat",
    "",
    "Pola kualitas jawaban:",
    "- akurat",
    "- relevan",
    "- singkat",
    "- natural",
    "- membantu",
    "- berorientasi solusi",
    "- berorientasi closing secara halus",
    "- aman dan tidak mengarang",
    "",
    "Jika data referensi bertentangan:",
    "- utamakan data sistem yang paling baru dan paling spesifik",
    "- jika tetap tidak jelas, jawab secara aman dan jujur",
    "",
    "Jika balasan cepat tersedia:",
    "- gunakan hanya sebagai inspirasi gaya atau referensi isi",
    "- ubah seperlunya agar sesuai konteks customer",
    "- jangan copy mentah jika terdengar kaku",
    "",
    "Jika tidak ada referensi yang cocok:",
    "- tetap jawab dengan kemampuan terbaik Anda secara natural",
    "- gunakan pengetahuan umum yang aman",
    "- jangan mengarang fakta spesifik toko atau produk"
  ].join("\\n");

  function escSafe(v) {
    return (window.esc ? window.esc(v == null ? "" : String(v)) : String(v == null ? "" : v))
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function toast(msg, kind) {
    if (typeof window.toast === "function") window.toast(msg, kind || "info");
    else alert(msg);
  }

  function safeJson(value, fallback) {
    try {
      return JSON.parse(value || "");
    } catch (_e) {
      return fallback;
    }
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
      "#V-chat{width:100%;max-width:none!important;position:fixed;left:0;right:0;top:52px;bottom:0;z-index:40;background:radial-gradient(1200px 500px at 20% -20%,rgba(245,158,11,.08),transparent),linear-gradient(180deg,#111317,#0b0d10)}" +
      ".ajw-chat-shell{display:grid;grid-template-columns:220px 340px minmax(0,1fr) 360px;gap:0;height:calc(100vh - 52px - 24px);border:1px solid var(--bd);border-radius:0;background:linear-gradient(180deg,var(--bg2),var(--bg4));overflow:hidden}" +
      ".ajw-chat-col{min-width:0;min-height:0;display:flex;flex-direction:column;border-right:1px solid var(--bd);background:linear-gradient(180deg,rgba(24,27,33,.9),rgba(16,18,22,.9))}" +
      ".ajw-chat-col:last-child{border-right:none}" +
      ".ajw-chat-main{display:grid;grid-template-rows:auto minmax(0,1fr) auto}" +
      ".ajw-chat-head{padding:12px 14px;border-bottom:1px solid var(--bd);display:flex;align-items:center;justify-content:space-between;gap:10px;background:linear-gradient(180deg,rgba(36,40,47,.86),rgba(25,28,33,.86))}" +
      ".ajw-chat-body{flex:1;min-height:0;overflow:auto}" +
      ".ajw-chat-toolbar{display:grid;grid-template-columns:1.2fr 180px auto auto auto;gap:8px;padding:10px 12px;margin-bottom:0;border:1px solid var(--bd);border-bottom:none;border-radius:0;background:linear-gradient(180deg,#1c2027,#14181e)}" +
      ".ajw-chat-shop{padding:10px 12px;border-bottom:1px solid var(--bd);cursor:pointer;background:transparent;color:var(--tx2)}" +
      ".ajw-chat-shop.on{background:rgba(245,158,11,.14)}" +
      ".ajw-chat-conv{padding:12px 14px;border-bottom:1px solid var(--bd);cursor:pointer;background:transparent;color:var(--tx2)}" +
      ".ajw-chat-conv.on{background:linear-gradient(90deg,rgba(59,130,246,.16),rgba(59,130,246,.04))}" +
      ".ajw-chat-pill{display:inline-flex;align-items:center;gap:6px;padding:3px 8px;border-radius:999px;font-size:10px;font-weight:700}" +
      ".ajw-chat-pill.red{background:#7f1d1d;color:#fecaca}" +
      ".ajw-chat-pill.blue{background:#1d4ed8;color:#dbeafe}" +
      ".ajw-chat-pill.gold{background:#78350f;color:#fde68a}" +
      ".ajw-chat-filter{border:1px solid var(--bd);background:var(--bg3);color:var(--tx2);border-radius:999px;padding:5px 10px;font-size:10px;font-weight:700;cursor:pointer}" +
      ".ajw-chat-filter.on{border-color:#f59e0b;background:rgba(245,158,11,.16);color:#b45309}" +
      ".ajw-chat-thread{flex:1;min-height:0;overflow:auto;padding:16px;background:radial-gradient(800px 280px at 80% 0,rgba(56,189,248,.07),transparent),linear-gradient(180deg,#141820,#0f1217)}" +
      ".ajw-chat-bubble-row{display:flex;margin-bottom:8px}" +
      ".ajw-chat-bubble-row.mine{justify-content:flex-end}" +
      ".ajw-chat-bubble{max-width:72%;padding:10px 12px;border-radius:14px;background:rgba(29,33,41,.9);color:var(--tx)}" +
      ".ajw-chat-bubble.them{border:1px solid rgba(255,255,255,.08);border-bottom-left-radius:6px}" +
      ".ajw-chat-bubble.mine{background:linear-gradient(180deg,rgba(37,99,235,.36),rgba(30,64,175,.26));border:1px solid rgba(147,197,253,.35);border-bottom-right-radius:6px}" +
      ".ajw-chat-bubble-head{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:6px}" +
      ".ajw-chat-bubble-name{font-size:10px;font-weight:800;letter-spacing:.2px;opacity:.9}" +
      ".ajw-chat-bubble-time{font-size:10px;color:var(--tx3);margin-top:6px}" +
      ".ajw-chat-compose{border-top:1px solid var(--bd);padding:10px 12px;background:linear-gradient(180deg,rgba(22,25,31,.95),rgba(15,18,23,.95))}" +
      ".ajw-chat-compose-tools{display:flex;align-items:center;gap:8px;margin-bottom:8px;flex-wrap:wrap}" +
      ".ajw-chat-iconbtn{width:34px;height:34px;border-radius:10px;border:1px solid var(--bd);background:var(--bg3);cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:16px}" +
      ".ajw-chat-attach{display:flex;gap:8px;overflow:auto;padding-bottom:6px}" +
      ".ajw-chat-attach-card{min-width:180px;border:1px solid var(--bd);border-radius:10px;padding:8px;background:rgba(31,35,43,.86)}" +
      ".ajw-chat-side-tabs{display:flex;border-bottom:1px solid var(--bd)}" +
      ".ajw-chat-side-tab{flex:1;padding:12px 10px;text-align:center;border:none;background:transparent;cursor:pointer;font-weight:700;font-size:12px;color:var(--tx2)}" +
      ".ajw-chat-side-tab.on{color:#1d4ed8;border-bottom:2px solid #1d4ed8}" +
      ".ajw-chat-side-content{padding:12px 14px;overflow:auto;flex:1}" +
      ".ajw-chat-card{border:1px solid var(--bd);border-radius:12px;padding:12px;background:rgba(28,32,40,.9);margin-bottom:10px}" +
      ".ajw-chat-product{display:grid;grid-template-columns:58px minmax(0,1fr) auto;gap:10px;align-items:center}" +
      ".ajw-chat-product img{width:58px;height:58px;border-radius:10px;object-fit:cover;border:1px solid var(--bd);background:#13161b}" +
      ".ajw-chat-emoji{position:absolute;left:12px;bottom:120px;z-index:50;padding:10px;border:1px solid var(--bd);background:var(--bg2);border-radius:12px;box-shadow:0 12px 30px rgba(0,0,0,.16);display:grid;grid-template-columns:repeat(6,1fr);gap:6px;width:240px}" +
      ".ajw-chat-emoji button{border:none;background:var(--bg3);border-radius:8px;padding:8px;cursor:pointer;font-size:16px}" +
      ".ajw-kv{display:grid;grid-template-columns:130px minmax(0,1fr);gap:8px 10px;margin-top:10px}" +
      ".ajw-kv div{font-size:12px}" +
      ".ajw-kv .k{color:var(--tx3)}" +
      ".ajw-kv .v{color:var(--tx2);font-weight:700;word-break:break-word}" +
      ".ajw-order-item{display:grid;grid-template-columns:62px minmax(0,1fr);gap:10px;padding:10px 0}" +
      ".ajw-order-item img{width:62px;height:62px;border-radius:10px;object-fit:cover;border:1px solid var(--bd);background:#12151b}" +
      ".ajw-sep{height:1px;background:rgba(255,255,255,.06);margin:8px 0}" +
      ".ajw-reply-top{display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:10px}" +
      ".ajw-toggle{display:flex;align-items:center;gap:6px;font-size:12px;color:var(--tx2)}" +
      ".ajw-chip{display:inline-flex;align-items:center;gap:6px;border:1px solid var(--bd);border-radius:999px;padding:5px 9px;font-size:11px;cursor:pointer;background:rgba(20,23,30,.9);color:var(--tx2)}" +
      ".ajw-chip.on{border-color:#3b82f6;background:rgba(59,130,246,.18);color:#dbeafe}" +
      ".ajw-predict{margin-top:10px;padding:10px;border:1px solid var(--bd);border-radius:10px;background:rgba(17,20,26,.9)}" +
      ".ajw-predict h4{margin:0 0 8px 0;font-size:12px}" +
      ".ajw-ai-draft{margin-top:8px;padding:10px;border:1px solid var(--bd);border-radius:10px;background:rgba(16,20,28,.92)}" +
      ".ajw-ai-draft textarea{width:100%;min-height:90px;resize:vertical;margin-top:8px}" +
      ".ajw-two-col{display:grid;grid-template-columns:1fr 1fr;gap:10px}" +
      ".ajw-reply-layout{display:grid;grid-template-columns:240px minmax(0,1fr);gap:12px;min-height:100%}" +
      ".ajw-reply-side{border:1px solid var(--bd);border-radius:12px;background:rgba(20,23,30,.92);padding:8px}" +
      ".ajw-reply-side button{width:100%;text-align:left;border:1px solid transparent;background:transparent;color:var(--tx2);padding:10px 10px;border-radius:10px;cursor:pointer;font-size:12px;font-weight:700}" +
      ".ajw-reply-side button.on{background:rgba(59,130,246,.18);border-color:rgba(59,130,246,.45);color:#dbeafe}" +
      ".ajw-reply-main{min-width:0}" +
      ".ajw-reply-page{padding:12px;min-height:100%;overflow:auto}" +
      ".ajw-shop-shell{display:grid;grid-template-columns:42px minmax(0,1fr);min-height:0;flex:1}" +
      ".ajw-shop-icons{border-right:1px solid var(--bd);background:linear-gradient(180deg,#202531,#171b23);padding:8px 4px;display:flex;flex-direction:column;gap:6px;align-items:center}" +
      ".ajw-shop-ico{width:30px;height:30px;border-radius:9px;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.03);display:flex;align-items:center;justify-content:center;font-size:14px;color:var(--tx2)}" +
      ".ajw-shop-panel{display:flex;flex-direction:column;min-height:0}" +
      ".ajw-shop-headline{display:flex;align-items:center;gap:6px;padding:8px;border-bottom:1px solid var(--bd)}" +
      ".ajw-shop-search{height:30px}" +
      ".ajw-chat-empty{padding:18px;color:var(--tx3);font-size:12px}" +
      "@media (max-width:1300px){.ajw-chat-shell{grid-template-columns:200px 300px minmax(0,1fr) 320px}}" +
      "@media (max-width:980px){#V-chat{top:52px}.ajw-chat-toolbar{grid-template-columns:1fr 1fr auto;}.ajw-chat-shell{grid-template-columns:1fr;height:calc(100vh - 52px - 24px)}.ajw-chat-col{border-right:none;border-bottom:1px solid var(--bd)}.ajw-chat-col:last-child{border-bottom:none}.ajw-two-col{grid-template-columns:1fr}.ajw-reply-layout{grid-template-columns:1fr}}";
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
      body.style.width = "100vw";
    } else if (savedBodyStyle) {
      body.style.maxWidth = savedBodyStyle.maxWidth;
      body.style.padding = savedBodyStyle.padding;
      body.style.margin = savedBodyStyle.margin;
      body.style.width = "";
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
    var qs = "?limit=120&recent_days=90&sync=1";
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

  function refreshConversationsBg() {
    if (refreshConversationsTimer) clearTimeout(refreshConversationsTimer);
    refreshConversationsTimer = setTimeout(function () {
      loadConversations()
        .then(function () {
          renderConversations();
          renderShops();
          renderHeaderState();
        })
        .catch(function () {});
    }, 120);
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
        "&limit=220" +
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
    var data = await apiGet("/api/chat/quick-replies?shop_id=" + encodeURIComponent(currentShopId) + "&limit=2000");
    quickRepliesCache = data.rows || [];
  }

  async function loadKnowledge() {
    if (!currentShopId) {
      knowledgeCache = [];
      return;
    }
    var data = await apiGet("/api/chat/knowledge?shop_id=" + encodeURIComponent(currentShopId) + "&limit=2000");
    knowledgeCache = data.rows || [];
  }

  async function loadAiSettings() {
    if (!currentShopId) {
      aiSettings = null;
      return;
    }
    var data = await apiGet("/api/chat/ai/settings?shop_id=" + encodeURIComponent(currentShopId));
    aiSettings = data.row || null;
  }

  async function loadAiDrafts() {
    if (!currentShopId || !selectedConversationId) {
      aiDraftsCache = [];
      return;
    }
    var data = await apiGet(
      "/api/chat/ai/drafts?shop_id=" +
        encodeURIComponent(currentShopId) +
        "&conversation_id=" +
        encodeURIComponent(selectedConversationId) +
        "&limit=15"
    );
    aiDraftsCache = data.rows || [];
  }

  async function loadAiLearning() {
    if (!currentShopId) {
      aiLearningCache = [];
      aiLearningStats = null;
      return;
    }
    var url = "/api/chat/ai/learning?shop_id=" + encodeURIComponent(currentShopId) + "&limit=80";
    if (selectedConversationId) {
      url += "&conversation_id=" + encodeURIComponent(selectedConversationId);
    }
    var data = await apiGet(url);
    aiLearningCache = data.rows || [];
    aiLearningStats = data.stats || null;
  }

  async function syncAll(refreshProducts) {
    currentShopId = selectedShopId();
    if (!currentShopId) throw new Error("shop_id wajib");
    await apiPost("/api/chat/sync", { shop_id: currentShopId });
    await loadConversations();
    await loadMessages();
    await loadOrders(true);
    await loadQuickReplies();
    await loadKnowledge();
    await loadAiSettings();
    await loadAiLearning();
    await loadProducts(!!refreshProducts);
  }

  async function openConversation(conversationId) {
    selectedConversationId = String(conversationId || "");
    conversationsCache = (conversationsCache || []).map(function (r) {
      if (String(r.conversation_id) !== String(selectedConversationId)) return r;
      return { ...r, unread_count: 0 };
    });
    messagesCache = [];
    ordersCache = [];
    renderHeaderState();
    renderConversations();
    renderMessages();
    renderSidePanel();
    scrollThreadToBottom();

    try {
      await Promise.all([loadMessages(), loadOrders(false), loadAiDrafts(), loadAiLearning()]);
      renderMessages();
      renderSidePanel();
      renderAiDraftPanel();
      scrollThreadToBottom();
    } catch (_e) {}

    apiPost("/api/chat/sync", {
      shop_id: selectedShopId(),
      conversation_id: selectedConversationId
    })
      .then(function () {
        return Promise.all([loadMessages(), loadOrders(true), loadConversations(), loadAiDrafts(), loadAiLearning()]);
      })
      .then(function () {
        apiPost("/api/chat/conversation/read", {
          shop_id: selectedShopId(),
          conversation_id: selectedConversationId
        }).catch(function () {});
        renderHeaderState();
        renderConversations();
        renderMessages();
        renderSidePanel();
        renderAiDraftPanel();
        scrollThreadToBottom();
      })
      .catch(function (_err) {});
  }

  function scrollThreadToBottom() {
    var box = document.getElementById("CHAT-MESSAGES");
    if (box) box.scrollTop = box.scrollHeight;
  }

  function renderShops() {
    var host = document.getElementById("CHAT-SHOP-LIST");
    if (!host) return;
    var unreadByShop = {};
    conversationsCache.forEach(function (c) {
      var sid = String(c.shop_id || currentShopId || "");
      unreadByShop[sid] = (unreadByShop[sid] || 0) + (Number(c.unread_count || 0) > 0 ? 1 : 0);
    });
    var filtered = shopsCache.filter(function (s) {
      if (!shopSearch) return true;
      var sid = String(s.shop_id || "");
      return sid.indexOf(shopSearch) >= 0;
    });
    if (!shopsCache.length) {
      host.innerHTML = '<div class="ajw-chat-empty">Belum ada token toko. Klik OAuth sekali untuk hubungkan toko.</div>';
      return;
    }
    host.innerHTML =
      '<div class="ajw-shop-shell">' +
      '<div class="ajw-shop-icons">' +
      '<div class="ajw-shop-ico">💬</div>' +
      '<div class="ajw-shop-ico">🧾</div>' +
      '<div class="ajw-shop-ico">📦</div>' +
      '<div class="ajw-shop-ico">🤖</div>' +
      '<div class="ajw-shop-ico">⚙️</div>' +
      "</div>" +
      '<div class="ajw-shop-panel">' +
      '<div class="ajw-shop-headline"><input id="CHAT-SHOP-SEARCH" class="fi ajw-shop-search" placeholder="Cari toko..." value="' + escSafe(shopSearch) + '"></div>' +
      '<div class="ajw-chat-body">' +
      filtered
      .map(function (shop) {
        var sid = String(shop.shop_id || "");
        var unread = Number(unreadByShop[sid] || 0);
        return (
          '<div class="ajw-chat-shop ' + (sid === String(currentShopId || "") ? "on" : "") + '" data-shop-id="' + escSafe(sid) + '">' +
          '<div style="display:flex;justify-content:space-between;gap:8px;align-items:center">' +
          '<div style="font-size:12px;font-weight:800;color:var(--tx)">Shop ' + escSafe(sid) + "</div>" +
          (unread > 0 ? '<span class="ajw-chat-pill red">' + unread + "</span>" : "") +
          "</div>" +
          '<div style="font-size:10px;color:var(--tx3);margin-top:4px">Token: ' + escSafe(fmtTs(shop.updated_at)) + "</div>" +
          "</div>"
        );
      })
      .join("") +
      "</div></div></div>";

    host.querySelectorAll("[data-shop-id]").forEach(function (el) {
      el.addEventListener("click", function () {
        lastUserActionAt = Date.now();
        currentShopId = String(el.getAttribute("data-shop-id") || "");
        selectedConversationId = "";
        window.localStorage.setItem("ajw_chat_shop_id", currentShopId);
        Promise.all([loadConversations(), loadQuickReplies(), loadProducts(false), loadKnowledge(), loadAiSettings(), loadAiLearning()]).then(function () {
          if (selectedConversationId) {
            loadMessages().then(function () {
              Promise.all([loadOrders(false), loadAiDrafts()]).then(renderAll);
            });
          } else {
            renderAll();
          }
        });
      });
    });

    var search = document.getElementById("CHAT-SHOP-SEARCH");
    if (search) {
      search.addEventListener("change", function () {
        shopSearch = String(search.value || "").trim();
        window.localStorage.setItem("ajw_chat_shop_search", shopSearch);
        renderShops();
      });
    }
  }

  function getFilteredConversations() {
    var rows = (conversationsCache || []).slice();
    if (activeFilter === "unread") {
      rows = rows.filter(function (r) {
        return Number(r.unread_count || 0) > 0;
      });
    } else if (activeFilter === "unreplied") {
      rows = rows.filter(function (r) {
        return Number(r.has_unreplied || 0) > 0;
      });
    }
    rows.sort(function (a, b) {
      return Number(b.last_message_timestamp || 0) - Number(a.last_message_timestamp || 0);
    });
    return rows;
  }

  function renderConversations() {
    var host = document.getElementById("CHAT-CONV-LIST");
    if (!host) return;
    var rows = getFilteredConversations();
    if (!rows.length) {
      host.innerHTML = '<div class="ajw-chat-empty">Belum ada percakapan untuk filter ini.</div>';
      return;
    }
    host.innerHTML = rows
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

  function isSellerMessage(row, conv) {
    var fromId = String((row && row.from_id) || "");
    var toId = String((row && row.to_id) || "");
    var shopId = String(currentShopId || "");
    var buyerId = String((conv && conv.to_id) || "");
    if (fromId && shopId && fromId === shopId) return true;
    if (fromId && buyerId && fromId === buyerId) return false;
    if (toId && buyerId && toId === buyerId) return true;
    if (toId && shopId && toId === shopId) return false;
    return false;
  }

  function renderMessages() {
    var host = document.getElementById("CHAT-MESSAGES");
    if (!host) return;
    if (activeSideTab === "replies") {
      host.innerHTML = '<div class="ajw-reply-page">' + renderRepliesTab() + "</div>";
      return;
    }
    if (!selectedConversationId) {
      host.innerHTML = '<div class="ajw-chat-empty">Pilih percakapan di kiri untuk mulai membalas.</div>';
      return;
    }
    if (!messagesCache.length) {
      host.innerHTML = '<div class="ajw-chat-empty">Belum ada pesan tersimpan.</div>';
      return;
    }
    var conv = currentConversation();
    host.innerHTML = messagesCache
      .map(function (row) {
        var mine = isSellerMessage(row, conv);
        var senderName = mine ? "Anda" : (conv && (conv.to_name || conv.to_id)) || "Pembeli";
        return (
          '<div class="ajw-chat-bubble-row ' + (mine ? "mine" : "") + '">' +
          '<div class="ajw-chat-bubble ' + (mine ? "mine" : "them") + '">' +
          '<div class="ajw-chat-bubble-head"><span class="ajw-chat-bubble-name">' + escSafe(senderName) + "</span></div>" +
          '<div style="font-size:12px;line-height:1.55;white-space:pre-wrap;word-break:break-word">' + escSafe(row.content_text || "(non-text)") + "</div>" +
          '<div class="ajw-chat-bubble-time">' + escSafe(fmtTs(row.created_timestamp)) + "</div>" +
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

  function latestDraft() {
    return aiDraftsCache && aiDraftsCache.length ? aiDraftsCache[0] : null;
  }

  function renderAiDraftPanel() {
    var host = document.getElementById("CHAT-AI-DRAFT");
    if (!host) return;
    var d = latestDraft();
    if (!d) {
      host.innerHTML = '<div style="font-size:11px;color:var(--tx3)">AI Draft belum dibuat. Klik tombol <b>AI Draft</b> untuk generate balasan.</div>';
      return;
    }
    var refs = safeJson(d.knowledge_refs, []);
    host.innerHTML =
      '<div class="ajw-ai-draft">' +
      '<div style="display:flex;justify-content:space-between;gap:8px;align-items:center">' +
      '<div style="font-size:12px;font-weight:800">Draft AI (' + escSafe(d.provider || "smart") + ")</div>" +
      '<div style="font-size:10px;color:var(--tx3)">' + escSafe(fmtTs(d.created_at)) + "</div>" +
      "</div>" +
      '<textarea id="CHAT-AI-DRAFT-TEXT" class="fi">' + escSafe(d.draft_text || "") + "</textarea>" +
      (refs.length
        ? ('<div style="margin-top:8px;display:flex;gap:6px;flex-wrap:wrap">' +
          refs
            .slice(0, 8)
            .map(function (r) {
              return '<span class="ajw-chip">' + escSafe((r.group || "General") + ": " + (r.keyword || "")) + "</span>";
            })
            .join("") +
          "</div>")
        : "") +
      '<div style="display:flex;gap:8px;justify-content:flex-end;margin-top:8px">' +
      '<button id="CHAT-AI-REJECT" class="btns" style="padding:7px 10px">Tolak</button>' +
      '<button id="CHAT-AI-SEND" class="btnp" style="padding:7px 10px">Kirim Draft</button>' +
      "</div>" +
      "</div>";

    var rejectBtn = document.getElementById("CHAT-AI-REJECT");
    if (rejectBtn) {
      rejectBtn.onclick = function () {
        apiPost("/api/chat/ai/approve-send", {
          draft_id: d.id,
          shop_id: currentShopId,
          conversation_id: selectedConversationId,
          approved: false
        })
          .then(loadAiDrafts)
          .then(renderAiDraftPanel)
          .catch(function (err) {
            toast("Gagal tolak draft AI: " + (err.message || err), "error");
          });
      };
    }

    var sendBtn = document.getElementById("CHAT-AI-SEND");
    if (sendBtn) {
      sendBtn.onclick = function () {
        var finalText = String((document.getElementById("CHAT-AI-DRAFT-TEXT") || {}).value || "").trim();
        if (!finalText) return toast("Draft kosong.", "warn");
        apiPost("/api/chat/ai/approve-send", {
          draft_id: d.id,
          shop_id: currentShopId,
          conversation_id: selectedConversationId,
          approved: true,
          final_text: finalText
        })
          .then(function () {
            return Promise.all([loadMessages(), loadConversations(), loadAiDrafts()]);
          })
          .then(function () {
            renderMessages();
            renderConversations();
            renderAiDraftPanel();
            scrollThreadToBottom();
            toast("Draft AI dikirim.", "success");
          })
          .catch(function (err) {
            toast("Gagal kirim draft AI: " + (err.message || err), "error");
          });
      };
    }
  }

  function renderOrdersTab() {
    if (!ordersCache.length) {
      return '<div class="ajw-chat-empty">Belum ada riwayat pesanan yang terhubung ke percakapan ini. Setelah chat berisi referensi order atau data order tersinkron, riwayat akan tampil di sini.</div>';
    }
    return ordersCache
      .map(function (order) {
        var raw = safeJson(order.raw_json, {});
        var items = safeJson(order.items_json, []);
        var packages = Array.isArray(raw.package_list) ? raw.package_list : [];
        var pkg = packages[0] || {};
        var tracking = pkg.tracking_number || pkg.package_number || pkg.logistics_tracking_no || raw.tracking_no || "-";
        var courier = pkg.shipping_carrier || pkg.logistics_channel || raw.shipping_carrier || raw.logistics_channel || "-";
        var logisticsStatus = pkg.logistics_status || raw.logistics_status || raw.order_status || order.order_status || "-";
        var paymentMethod = raw.payment_method || raw.payment_method_name || "-";
        var totalBuyer = Number(raw.total_amount || order.total_amount || 0);
        var shippingFee = Number(raw.actual_shipping_fee || raw.estimated_shipping_fee || 0);
        var updateShipTs = Number(pkg.update_time || raw.shipping_confirm_time || raw.pickup_done_time || 0);
        return (
          '<div class="ajw-chat-card">' +
          '<div style="display:flex;justify-content:space-between;gap:10px;align-items:flex-start">' +
          '<div><div style="font-size:12px;color:var(--tx3)">No Pesanan</div><div style="font-size:13px;font-weight:800;color:var(--tx);margin-top:2px">' + escSafe(order.order_sn || "-") + "</div>" +
          '<div style="font-size:11px;color:var(--tx3);margin-top:6px">' + escSafe(fmtTs(order.create_time)) + "</div></div>" +
          '<span class="ajw-chat-pill gold">' + escSafe(order.order_status || "-") + "</span>" +
          "</div>" +
          '<div class="ajw-sep"></div>' +
          '<div style="font-size:12px;font-weight:800;color:var(--tx);margin-bottom:6px">Rincian Produk</div>' +
          items
            .slice(0, 8)
            .map(function (item) {
              var image = (item.image_info && item.image_info.image_url) || item.image_url || item.item_image || "";
              var title = item.item_name || item.model_name || "-";
              var sku = item.model_sku || item.item_sku || "-";
              var qty = Number(item.model_quantity_purchased || item.quantity_purchased || 1);
              var variation = item.model_name || item.variation || "-";
              var unitPrice = Number(item.model_original_price || item.model_discounted_price || item.item_price || 0);
              return (
                '<div class="ajw-order-item">' +
                (image
                  ? '<img src="' + escSafe(image) + '" alt="' + escSafe(title) + '">'
                  : '<div style="width:62px;height:62px;border-radius:10px;border:1px solid var(--bd);display:flex;align-items:center;justify-content:center;color:var(--tx3);font-size:10px">No Img</div>') +
                '<div>' +
                '<div style="font-size:12px;font-weight:800;color:var(--tx);line-height:1.35">' + escSafe(title) + "</div>" +
                '<div style="font-size:11px;color:var(--tx2);margin-top:4px">Variasi: ' + escSafe(variation) + "</div>" +
                '<div style="font-size:11px;color:var(--tx3);margin-top:3px">SKU: ' + escSafe(sku) + " • x" + escSafe(qty) + "</div>" +
                '<div style="font-size:12px;color:#f8fafc;margin-top:4px;font-weight:700">' + escSafe(money(unitPrice)) + "</div>" +
                "</div>" +
                "</div>"
              );
            })
            .join("") +
          '<div class="ajw-sep"></div>' +
          '<div style="font-size:12px;font-weight:800;color:var(--tx);margin-bottom:4px">Rincian Pembelian</div>' +
          '<div class="ajw-kv">' +
          '<div class="k">Jumlah pembayaran pembeli</div><div class="v">' + escSafe(money(totalBuyer)) + "</div>" +
          '<div class="k">Metode Pembayaran</div><div class="v">' + escSafe(paymentMethod) + "</div>" +
          '<div class="k">Biaya Pengiriman</div><div class="v">' + escSafe(money(shippingFee)) + "</div>" +
          "</div>" +
          '<div class="ajw-sep"></div>' +
          '<div style="font-size:12px;font-weight:800;color:var(--tx);margin-bottom:4px">Informasi Jasa Kirim</div>' +
          '<div class="ajw-kv">' +
          '<div class="k">Jasa Kirim</div><div class="v">' + escSafe(courier) + "</div>" +
          '<div class="k">Nomor Resi</div><div class="v">' + escSafe(tracking) + "</div>" +
          '<div class="k">Status Logistik</div><div class="v">' + escSafe(logisticsStatus) + "</div>" +
          '<div class="k">Waktu Update</div><div class="v">' + escSafe(fmtTs(updateShipTs)) + "</div>" +
          "</div>" +
          "</div>"
        );
      })
      .join("");
  }

  function parseProductPrice(row) {
    try {
      var priceInfo = JSON.parse(row.price_info || "[]");
      if (Array.isArray(priceInfo) && priceInfo.length) {
        var nums = priceInfo
          .map(function (p) {
            return Number(p.current_price != null ? p.current_price : p.original_price);
          })
          .filter(function (n) {
            return Number.isFinite(n) && n > 0;
          });
        if (nums.length) {
          var min = Math.min.apply(Math, nums);
          var max = Math.max.apply(Math, nums);
          return min === max ? money(min) : money(min) + " ~ " + money(max);
        }
      }
    } catch (_e) {}
    try {
      var raw = JSON.parse(row.raw_json || "{}");
      var list = raw.list_info || {};
      var minP = Number(list.price_min || list.price || 0);
      var maxP = Number(list.price_max || minP || 0);
      if (minP > 0) return minP === maxP ? money(minP) : money(minP) + " ~ " + money(maxP);
    } catch (_e) {}
    return "-";
  }

  function parseProductSold(row) {
    try {
      var raw = JSON.parse(row.raw_json || "{}");
      var list = raw.list_info || {};
      var n = Number(
        list.historical_sold != null
          ? list.historical_sold
          : list.sold != null
          ? list.sold
          : list.sales != null
          ? list.sales
          : 0
      );
      return Number.isFinite(n) ? n : 0;
    } catch (_e) {
      return 0;
    }
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
              var raw = safeJson(row.raw_json, {});
              var variants = Array.isArray(raw.base_info && raw.base_info.model) ? raw.base_info.model : [];
              return (
                '<div class="ajw-chat-card">' +
                '<div class="ajw-chat-product">' +
                '<img src="' + escSafe(row.image_url || "") + '" alt="' + escSafe(row.item_name || "produk") + '">' +
                '<div style="min-width:0">' +
                '<div style="font-size:12px;font-weight:800;color:var(--tx);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + escSafe(row.item_name || "-") + "</div>" +
                '<div style="font-size:13px;color:#f8fafc;margin-top:4px;font-weight:700">Harga: ' + escSafe(parseProductPrice(row)) + "</div>" +
                '<div style="font-size:11px;color:var(--tx2);margin-top:3px">SKU: ' + escSafe(row.sku || "-") + "</div>" +
                '<div style="font-size:11px;color:var(--tx3);margin-top:3px">Stok: ' + escSafe(row.stock || 0) + " • Terjual: x" + escSafe(parseProductSold(row)) + "</div>" +
                "</div>" +
                '<button class="btnp" data-send-product="' + escSafe(row.item_id || "") + '" style="padding:8px 12px">Kirim</button>' +
                "</div>" +
                (variants.length
                  ? ('<details style="margin-top:10px"><summary style="cursor:pointer;font-size:11px;color:var(--tx2)">Lihat variasi SKU</summary>' +
                    '<div style="margin-top:8px;border:1px solid var(--bd);border-radius:10px;overflow:hidden">' +
                    '<div style="display:grid;grid-template-columns:1.4fr 1fr .7fr;gap:8px;padding:8px 10px;background:rgba(255,255,255,.03);font-size:11px;color:var(--tx3)"><div>SKU</div><div>Variasi</div><div>Stok</div></div>' +
                    variants
                      .slice(0, 12)
                      .map(function (v) {
                        var stock = Number(v.normal_stock || v.stock || v.current_stock || 0);
                        return '<div style="display:grid;grid-template-columns:1.4fr 1fr .7fr;gap:8px;padding:8px 10px;font-size:11px"><div style="color:var(--tx2)">' + escSafe(v.model_sku || "-") + '</div><div style="color:var(--tx2)">' + escSafe(v.model_name || "-") + '</div><div style="color:var(--tx2)">x' + escSafe(stock) + "</div></div>";
                      })
                      .join("") +
                    "</div></details>")
                  : "") +
                "</div>"
              );
            })
            .join("")
        : '<div class="ajw-chat-empty">Belum ada data produk. Klik Refresh atau Sync Chat untuk memuat katalog toko.</div>')
    );
  }

  function normalizeReplyGroup(name) {
    var n = String(name || "").trim().toLowerCase();
    if (n === "pribadi" || n === "private" || n === "personal") return "Pribadi";
    return "Umum";
  }

  function buildPredictions() {
    if (!predictionEnabled) return [];
    var conv = currentConversation();
    if (!conv) return [];
    var incoming = messagesCache
      .slice()
      .reverse()
      .find(function (row) {
        return !isSellerMessage(row, conv);
      });
    var seed = String((incoming && incoming.content_text) || "").toLowerCase();
    if (!seed) return [];
    var pool = quickRepliesCache
      .filter(function (r) {
        return normalizeReplyGroup(r.group_name) === replyGroupFilter;
      })
      .map(function (r) {
        return String(r.content || "").trim();
      })
      .filter(Boolean);
    if (!pool.length) return [];
    var scored = pool
      .map(function (txt) {
        var t = txt.toLowerCase();
        var score = 0;
        if (seed.indexOf("stok") >= 0 && (t.indexOf("stok") >= 0 || t.indexOf("ready") >= 0)) score += 2;
        if (seed.indexOf("kirim") >= 0 && (t.indexOf("kirim") >= 0 || t.indexOf("pengiriman") >= 0)) score += 2;
        if (seed.indexOf("harga") >= 0 && t.indexOf("harga") >= 0) score += 2;
        if (seed.indexOf("kapan") >= 0 && t.indexOf("jam") >= 0) score += 1;
        if (t.indexOf(seed.slice(0, 20)) >= 0) score += 1;
        return { txt: txt, score: score };
      })
      .sort(function (a, b) {
        return b.score - a.score || b.txt.length - a.txt.length;
      });
    return scored.slice(0, 5).map(function (x) { return x.txt; });
  }

  function knowledgeCategoryOptions() {
    var defaults = [
      "Logistik/Pengiriman",
      "Obrolan ringan",
      "Paska Penjualan",
      "Produk",
      "Pra-Penjualan",
      "Live Agent",
      "General"
    ];
    var set = {};
    defaults.forEach(function (x) {
      set[String(x)] = true;
    });
    (knowledgeCache || []).forEach(function (k) {
      var g = String(k.group_name || "General").trim();
      if (g) set[g] = true;
    });
    return Object.keys(set);
  }

  function knowledgeCategoryCounts() {
    var map = { Semua: Number((knowledgeCache || []).length || 0) };
    (knowledgeCache || []).forEach(function (k) {
      var g = String(k.group_name || "General").trim() || "General";
      map[g] = (map[g] || 0) + 1;
    });
    return map;
  }

  function latestIncomingFromCache() {
    var rows = (messagesCache || []).slice().reverse();
    for (var i = 0; i < rows.length; i += 1) {
      var row = rows[i];
      if (String(row.from_id || "") !== String(currentShopId || "")) {
        return String(row.content_text || row.content_order_sn || "").trim();
      }
    }
    return "";
  }

  function renderAiLabPanel() {
    var stats = aiLearningStats || { total_learning: 0, scored_count: 0, avg_score: 0, label: "perlu_belajar" };
    var recent = (aiLearningCache || []).slice(0, 8);
    return (
      '<div class="ajw-reply-main">' +
      '<div class="ajw-chat-card">' +
      '<div style="display:flex;justify-content:space-between;gap:16px;align-items:flex-start;flex-wrap:wrap">' +
      '<div><div style="font-size:14px;font-weight:800;color:var(--tx)">Lab Uji AI Chatbot</div><div style="font-size:11px;color:var(--tx3);margin-top:4px">Tes pertanyaan pelanggan, lihat draft AI, nilai hasilnya, lalu simpan sebagai bahan belajar.</div></div>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
      '<span class="ajw-chat-pill blue">Belajar ' + escSafe(stats.total_learning || 0) + '</span>' +
      '<span class="ajw-chat-pill ' + ((stats.avg_score || 0) >= 4 ? "green" : (stats.avg_score || 0) >= 3 ? "blue" : "red") + '">Skor ' + escSafe(stats.avg_score || 0) + '/5</span>' +
      '<span class="ajw-chat-pill">' + escSafe(stats.label || "-") + '</span>' +
      '</div></div>' +
      '<textarea id="CHAT-AILAB-INCOMING" class="fi" style="margin-top:10px;min-height:88px" placeholder="Tulis pesan pelanggan untuk diuji...">' + escSafe(aiLabState.incoming_text || "") + '</textarea>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px">' +
      '<button id="CHAT-AILAB-USE-ACTIVE" class="btns">Ambil dari Chat Aktif</button>' +
      '<button id="CHAT-AILAB-GENERATE" class="btnp">Uji Draft AI</button>' +
      '</div>' +
      '<textarea id="CHAT-AILAB-DRAFT" class="fi" style="margin-top:10px;min-height:140px" placeholder="Hasil draft AI akan tampil di sini...">' + escSafe(aiLabState.generated_text || "") + '</textarea>' +
      '<div style="display:grid;grid-template-columns:140px 1fr auto;gap:8px;margin-top:8px;align-items:center">' +
      '<select id="CHAT-AILAB-SCORE" class="fi">' +
      '<option value="5"' + (Number(aiLabState.score || 5) === 5 ? " selected" : "") + '>5 - Sangat cocok</option>' +
      '<option value="4"' + (Number(aiLabState.score || 5) === 4 ? " selected" : "") + '>4 - Cocok</option>' +
      '<option value="3"' + (Number(aiLabState.score || 5) === 3 ? " selected" : "") + '>3 - Lumayan</option>' +
      '<option value="2"' + (Number(aiLabState.score || 5) === 2 ? " selected" : "") + '>2 - Kurang</option>' +
      '<option value="1"' + (Number(aiLabState.score || 5) === 1 ? " selected" : "") + '>1 - Tidak cocok</option>' +
      '</select>' +
      '<input id="CHAT-AILAB-NOTES" class="fi" placeholder="Catatan evaluasi AI..." value="' + escSafe(aiLabState.notes || "") + '">' +
      '<button id="CHAT-AILAB-SAVE-LEARN" class="btnp">Simpan Belajar</button>' +
      '</div>' +
      '</div>' +
      '<div class="ajw-chat-card">' +
      '<div style="font-size:12px;font-weight:800;color:var(--tx);margin-bottom:8px">Contoh Belajar dari Balasan Anda</div>' +
      (recent.length
        ? recent
            .map(function (row) {
              return '<div style="padding:10px 0;border-top:1px solid var(--ln)">' +
                '<div style="font-size:11px;color:var(--tx3)">Pelanggan</div>' +
                '<div style="font-size:12px;color:var(--tx2);white-space:pre-wrap">' + escSafe(row.customer_text || "-") + '</div>' +
                '<div style="font-size:11px;color:var(--tx3);margin-top:8px">Balasan toko</div>' +
                '<div style="font-size:12px;color:var(--tx);white-space:pre-wrap">' + escSafe(row.seller_text || "-") + '</div>' +
                '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px"><span class="ajw-chat-pill">' + escSafe(row.source || "manual_reply") + '</span>' +
                (row.score != null ? '<span class="ajw-chat-pill blue">Skor ' + escSafe(row.score) + '</span>' : '') +
                '</div></div>';
            })
            .join("")
        : '<div class="ajw-chat-empty">Belum ada contoh belajar. Setelah Anda balas customer atau simpan hasil uji, data belajar akan muncul di sini.</div>') +
      '</div>' +
      '</div>'
    );
  }

  function renderRepliesTab() {
    var grouped = quickRepliesCache.filter(function (row) {
      return normalizeReplyGroup(row.group_name) === replyGroupFilter;
    });
    var menuSidebar =
      '<div class="ajw-reply-side">' +
      '<button class="' + (repliesManageMenu === "quick" ? "on" : "") + '" data-replies-menu="quick">Balasan Cepat</button>' +
      '<button class="' + (repliesManageMenu === "managequick" ? "on" : "") + '" data-replies-menu="managequick">Tambah Balasan</button>' +
      '<button class="' + (repliesManageMenu === "knowledge" ? "on" : "") + '" data-replies-menu="knowledge">Pusat Informasi</button>' +
      '<button class="' + (repliesManageMenu === "ai" ? "on" : "") + '" data-replies-menu="ai">Mode AI</button>' +
      '<button class="' + (repliesManageMenu === "lab" ? "on" : "") + '" data-replies-menu="lab">Lab AI</button>' +
      "</div>";

    if (repliesManageMenu === "managequick") {
      return (
        '<div class="ajw-reply-layout">' + menuSidebar +
        '<div class="ajw-reply-main">' +
        '<div class="ajw-chat-card">' +
        '<div style="font-size:12px;font-weight:800;margin-bottom:8px">Tambah Balasan Cepat</div>' +
        '<input id="CHAT-QR-KEYWORD" class="fi" placeholder="Keyword pemicu (opsional)" value="' + escSafe(quickFormState.keyword || "") + '">' +
        '<input id="CHAT-QR-TITLE" class="fi" placeholder="Judul template" style="margin-top:8px" value="' + escSafe(quickFormState.title || "") + '">' +
        '<textarea id="CHAT-QR-CONTENT" class="fi" style="margin-top:8px;min-height:100px" placeholder="Template jawaban...">' + escSafe(quickFormState.content || "") + "</textarea>" +
        '<div style="display:flex;justify-content:flex-end;margin-top:8px"><button id="CHAT-QR-ADD-FORM" class="btnp">Simpan Template</button></div>' +
        "</div>" +
        "</div></div>"
      );
    }

    if (repliesManageMenu === "knowledge") {
      var catOptions = knowledgeCategoryOptions();
      var catCounts = knowledgeCategoryCounts();
      var activeCat = knowledgeCategoryFilter || "Semua";
      var filteredKnowledge = activeCat === "Semua"
        ? (knowledgeCache || [])
        : (knowledgeCache || []).filter(function (k) {
            return String(k.group_name || "General") === activeCat;
          });
      return (
        '<div class="ajw-reply-layout">' + menuSidebar +
        '<div class="ajw-reply-main">' +
        '<div class="ajw-reply-side" style="margin-bottom:10px">' +
        '<button class="' + (activeCat === "Semua" ? "on" : "") + '" data-kn-filter="Semua">Semua ' + escSafe(catCounts.Semua || 0) + "</button>" +
        catOptions
          .filter(function (x) { return x !== "Semua"; })
          .map(function (cat) {
            return '<button class="' + (activeCat === cat ? "on" : "") + '" data-kn-filter="' + escSafe(cat) + '">' + escSafe(cat) + " " + escSafe(catCounts[cat] || 0) + "</button>";
          })
          .join("") +
        "</div>" +
        '<div class="ajw-chat-card">' +
        '<div style="font-size:12px;font-weight:800;margin-bottom:8px">Tambah Referensi Kata Kunci</div>' +
        '<input id="CHAT-KN-KEYWORD" class="fi" placeholder="Keyword pertanyaan" value="' + escSafe(knowledgeFormState.keyword || "") + '">' +
        '<select id="CHAT-KN-GROUP" class="fi" style="margin-top:8px">' +
        catOptions
          .map(function (cat) {
            var selected = cat === (knowledgeFormState.group_name || activeCat) ? " selected" : "";
            return '<option value="' + escSafe(cat) + '"' + selected + ">" + escSafe(cat) + "</option>";
          })
          .join("") +
        "</select>" +
        '<textarea id="CHAT-KN-TEMPLATE" class="fi" style="margin-top:8px;min-height:100px" placeholder="Jawaban acuan untuk AI...">' + escSafe(knowledgeFormState.template || "") + "</textarea>" +
        '<div style="display:flex;justify-content:flex-end;margin-top:8px"><button id="CHAT-KN-ADD" class="btnp">Simpan Referensi</button></div>' +
        "</div>" +
        (filteredKnowledge.length
          ? filteredKnowledge
              .slice(0, 200)
              .map(function (k) {
                return (
                  '<div class="ajw-chat-card">' +
                  '<div style="display:flex;justify-content:space-between;gap:8px;align-items:flex-start">' +
                  '<div style="font-size:11px;font-weight:800;color:var(--tx)">' + escSafe(k.keyword || "-") + "</div>" +
                  '<button class="btns" data-kn-del="' + escSafe(k.id) + '" style="padding:5px 8px;font-size:10px">Hapus</button>' +
                  "</div>" +
                  '<div style="font-size:10px;color:var(--tx3);margin-top:4px">' + escSafe(k.group_name || "General") + "</div>" +
                  '<div style="font-size:12px;color:var(--tx2);margin-top:6px;white-space:pre-wrap">' + escSafe(k.template || "") + "</div>" +
                  "</div>"
                );
              })
              .join("")
          : '<div class="ajw-chat-empty">Belum ada data pusat informasi.</div>')
        + "</div></div>"
      );
    }

    if (repliesManageMenu === "ai") {
      return (
        '<div class="ajw-reply-layout">' + menuSidebar +
        '<div class="ajw-reply-main">' +
        '<div class="ajw-chat-card">' +
        '<div style="font-size:12px;font-weight:800;margin-bottom:8px">Mode AI Balas Otomatis</div>' +
        '<div style="display:flex;gap:12px;flex-wrap:wrap;align-items:center">' +
        '<label class="ajw-toggle"><input type="checkbox" id="CHAT-AI-ENABLED" ' + (aiSettings && Number(aiSettings.ai_enabled || 0) ? "checked" : "") + "> AI Aktif</label>" +
        '<label class="ajw-toggle"><input type="checkbox" id="CHAT-AI-APPROVAL" ' + (!aiSettings || Number(aiSettings.require_approval || 0) ? "checked" : "") + "> Perlu Persetujuan Kirim</label>" +
        '<label class="ajw-toggle"><input type="checkbox" id="CHAT-AI-AUTONOMOUS" ' + (autonomousEnabled ? "checked" : "") + "> Autonomous (Auto baca + balas)</label>" +
        '<select id="CHAT-AI-PROVIDER" class="fi" style="max-width:150px">' +
        '<option value="smart"' + (aiSettings && aiSettings.provider === "smart" ? " selected" : "") + ">Smart</option>" +
        '<option value="openai"' + (aiSettings && aiSettings.provider === "openai" ? " selected" : "") + ">OpenAI</option>" +
        '<option value="claude"' + (aiSettings && aiSettings.provider === "claude" ? " selected" : "") + ">Claude</option>" +
        "</select>" +
        '<button id="CHAT-AI-SAVE-SETTINGS" class="btns">Simpan Mode AI</button>' +
        '<button id="CHAT-AI-RUN-NOW" class="btnp">Run Sekarang</button>' +
        "</div>" +
        '<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;margin-top:14px;flex-wrap:wrap">' +
        '<div style="font-size:12px;font-weight:800;color:var(--tx)">Core Prompt AI Chatbot</div>' +
        '<button id="CHAT-AI-USE-ANTON-PROMPT" class="btns">Isi Prompt Anton Pancing</button>' +
        "</div>" +
        '<textarea id="CHAT-AI-PROMPT" class="fi" style="margin-top:8px;min-height:320px;white-space:pre-wrap" placeholder="Tulis core prompt AI di sini...">' + escSafe((aiSettings && aiSettings.prompt_preset) || "") + "</textarea>" +
        '<div style="font-size:11px;color:var(--tx3);margin-top:8px">Autonomous memproses percakapan unread terbaru dulu, baca histori chat, lalu balas otomatis sesuai knowledge + produk.</div>' +
        "</div>" +
        "</div></div>"
      );
    }

    if (repliesManageMenu === "lab") {
      return '<div class="ajw-reply-layout">' + menuSidebar + renderAiLabPanel() + "</div>";
    }

    return (
      '<div class="ajw-reply-layout">' + menuSidebar +
      '<div class="ajw-reply-main">' +
      '<div class="ajw-reply-top">' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
      '<button class="ajw-chip ' + (replyGroupFilter === "Umum" ? "on" : "") + '" data-reply-group="Umum">Umum</button>' +
      '<button class="ajw-chip ' + (replyGroupFilter === "Pribadi" ? "on" : "") + '" data-reply-group="Pribadi">Pribadi</button>' +
      "</div>" +
      "</div>" +
      (grouped.length
        ? grouped
            .map(function (row) {
              return (
                '<div class="ajw-chat-card">' +
                '<div style="display:flex;justify-content:space-between;gap:8px;align-items:flex-start">' +
                '<div style="min-width:0"><div style="font-size:12px;font-weight:800;color:var(--tx)">' + escSafe(row.title || row.group_name || "Balasan") + "</div>" +
                '<div style="font-size:10px;color:var(--tx3);margin-top:4px">' + escSafe(normalizeReplyGroup(row.group_name)) + "</div></div>" +
                '<button class="btns" data-qr-del="' + escSafe(row.id) + '" style="padding:5px 8px;font-size:10px">Hapus</button>' +
                "</div>" +
                '<div style="font-size:12px;color:var(--tx2);margin-top:10px;white-space:pre-wrap;line-height:1.55">' + escSafe(row.content || "") + "</div>" +
                '<div style="display:flex;justify-content:flex-end;margin-top:10px"><button class="btnp" data-qr-use="' + escSafe(row.id) + '" style="padding:8px 12px">Pakai</button></div>' +
                "</div>"
              );
            })
            .slice(0, 250)
            .join("")
        : '<div class="ajw-chat-empty">Belum ada balasan cepat untuk grup ini.</div>') +
      "</div></div>"
    );
  }

  function renderSidePanel() {
    var host = document.getElementById("CHAT-RIGHT-CONTENT");
    if (!host) return;
    if (activeSideTab === "replies") {
      host.innerHTML = '<div class="ajw-chat-empty">Panel Balasan Cepat dibuka di area utama (tengah) seperti halaman baru.</div>';
    } else {
      host.innerHTML = activeSideTab === "orders" ? renderOrdersTab() : renderProductsTab();
    }

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

    var actionRoot = activeSideTab === "replies" ? document.getElementById("CHAT-MESSAGES") : host;
    if (!actionRoot) actionRoot = host;

    actionRoot.querySelectorAll("[data-send-product]").forEach(function (el) {
      el.addEventListener("click", function () {
        lastUserActionAt = Date.now();
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

    var addReplyBtn = actionRoot.querySelector("#CHAT-QR-ADD");
    if (addReplyBtn) {
      addReplyBtn.onclick = async function () {
        lastUserActionAt = Date.now();
        var title = prompt("Judul balasan cepat:");
        if (title == null) return;
        var content = prompt("Isi balasan cepat:");
        if (!String(content || "").trim()) return;
        var typedGroup = prompt("Grup balasan? Isi: Umum / Pribadi", replyGroupFilter);
        var groupName = normalizeReplyGroup(typedGroup || replyGroupFilter);
        await apiPost("/api/chat/quick-replies", {
          shop_id: currentShopId,
          title: String(title || "").trim() || String(content || "").trim().slice(0, 30),
          content: String(content || "").trim(),
          group_name: groupName,
          position: quickRepliesCache.length + 1
        });
        await loadQuickReplies();
        renderAll();
      };
    }

    var addReplyFormBtn = actionRoot.querySelector("#CHAT-QR-ADD-FORM");
    if (addReplyFormBtn) {
      addReplyFormBtn.onclick = async function () {
        lastUserActionAt = Date.now();
        var keyword = String((document.getElementById("CHAT-QR-KEYWORD") || {}).value || "").trim();
        var title = String((document.getElementById("CHAT-QR-TITLE") || {}).value || "").trim();
        var content = String((document.getElementById("CHAT-QR-CONTENT") || {}).value || "").trim();
        if (!content) return toast("Isi template balasan cepat dulu.", "warn");
        var finalTitle = title || keyword || content.slice(0, 30);
        await apiPost("/api/chat/quick-replies", {
          shop_id: currentShopId,
          title: finalTitle,
          content: content,
          group_name: replyGroupFilter,
          position: quickRepliesCache.length + 1
        });
        if (keyword) {
          await apiPost("/api/chat/knowledge", {
            shop_id: currentShopId,
            keyword: keyword,
            template: content,
            group_name: replyGroupFilter,
            source: "quick_reply",
            priority: 5
          });
          await loadKnowledge();
        }
        quickFormState = { keyword: "", title: "", content: "" };
        persistQuickFormState();
        await loadQuickReplies();
        rerenderRepliesWorkspace();
        toast("Balasan cepat tersimpan.", "success");
      };
    }

    ["CHAT-QR-KEYWORD", "CHAT-QR-TITLE", "CHAT-QR-CONTENT"].forEach(function (id) {
      var el = actionRoot.querySelector("#" + id);
      if (!el) return;
      el.addEventListener("input", function () {
        quickFormState.keyword = String((actionRoot.querySelector("#CHAT-QR-KEYWORD") || {}).value || "");
        quickFormState.title = String((actionRoot.querySelector("#CHAT-QR-TITLE") || {}).value || "");
        quickFormState.content = String((actionRoot.querySelector("#CHAT-QR-CONTENT") || {}).value || "");
        persistQuickFormState();
      });
    });

    actionRoot.querySelectorAll("[data-qr-use]").forEach(function (el) {
      el.addEventListener("click", function () {
        lastUserActionAt = Date.now();
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

    actionRoot.querySelectorAll("[data-qr-del]").forEach(function (el) {
      el.addEventListener("click", function () {
        lastUserActionAt = Date.now();
        var id = String(el.getAttribute("data-qr-del") || "");
        apiDelete("/api/chat/quick-replies/" + encodeURIComponent(id))
          .then(loadQuickReplies)
          .then(rerenderRepliesWorkspace)
          .catch(function (err) {
            toast("Gagal hapus balasan cepat: " + (err.message || err), "error");
          });
      });
    });

    var addKnowledgeBtn = actionRoot.querySelector("#CHAT-KN-ADD");
    if (addKnowledgeBtn) {
      addKnowledgeBtn.onclick = async function () {
        lastUserActionAt = Date.now();
        var keyword = String((document.getElementById("CHAT-KN-KEYWORD") || {}).value || "").trim();
        var groupName = String((document.getElementById("CHAT-KN-GROUP") || {}).value || "").trim();
        var template = String((document.getElementById("CHAT-KN-TEMPLATE") || {}).value || "").trim();
        if (!keyword || !template) return toast("Keyword dan jawaban acuan wajib diisi.", "warn");
        await apiPost("/api/chat/knowledge", {
          shop_id: currentShopId,
          keyword: keyword,
          template: template,
          group_name: groupName || "General",
          source: "manual",
          priority: 6
        });
        await loadKnowledge();
        knowledgeFormState = { keyword: "", group_name: groupName || knowledgeCategoryFilter || "General", template: "" };
        persistKnowledgeFormState();
        rerenderRepliesWorkspace();
        toast("Pusat informasi tersimpan.", "success");
      };
    }

    ["CHAT-KN-KEYWORD", "CHAT-KN-GROUP", "CHAT-KN-TEMPLATE"].forEach(function (id) {
      var el = actionRoot.querySelector("#" + id);
      if (!el) return;
      el.addEventListener("input", function () {
        knowledgeFormState.keyword = String((actionRoot.querySelector("#CHAT-KN-KEYWORD") || {}).value || "");
        knowledgeFormState.group_name = String((actionRoot.querySelector("#CHAT-KN-GROUP") || {}).value || knowledgeCategoryFilter || "General");
        knowledgeFormState.template = String((actionRoot.querySelector("#CHAT-KN-TEMPLATE") || {}).value || "");
        persistKnowledgeFormState();
      });
      el.addEventListener("change", function () {
        knowledgeFormState.keyword = String((actionRoot.querySelector("#CHAT-KN-KEYWORD") || {}).value || "");
        knowledgeFormState.group_name = String((actionRoot.querySelector("#CHAT-KN-GROUP") || {}).value || knowledgeCategoryFilter || "General");
        knowledgeFormState.template = String((actionRoot.querySelector("#CHAT-KN-TEMPLATE") || {}).value || "");
        persistKnowledgeFormState();
      });
    });

    actionRoot.querySelectorAll("[data-kn-filter]").forEach(function (el) {
      el.addEventListener("click", function () {
        lastUserActionAt = Date.now();
        knowledgeCategoryFilter = String(el.getAttribute("data-kn-filter") || "Semua");
        window.localStorage.setItem("ajw_chat_knowledge_filter", knowledgeCategoryFilter);
        if (!knowledgeFormState.group_name || knowledgeFormState.group_name === "Semua") {
          knowledgeFormState.group_name = knowledgeCategoryFilter === "Semua" ? "General" : knowledgeCategoryFilter;
          persistKnowledgeFormState();
        }
        rerenderRepliesWorkspace();
      });
    });

    actionRoot.querySelectorAll("[data-kn-del]").forEach(function (el) {
      el.addEventListener("click", function () {
        lastUserActionAt = Date.now();
        var id = String(el.getAttribute("data-kn-del") || "");
        apiDelete("/api/chat/knowledge/" + encodeURIComponent(id))
          .then(loadKnowledge)
          .then(rerenderRepliesWorkspace)
          .catch(function (err) {
            toast("Gagal hapus referensi: " + (err.message || err), "error");
          });
      });
    });

    actionRoot.querySelectorAll("[data-reply-group]").forEach(function (el) {
      el.addEventListener("click", function () {
        lastUserActionAt = Date.now();
        replyGroupFilter = String(el.getAttribute("data-reply-group") || "Umum");
        window.localStorage.setItem("ajw_chat_reply_group", replyGroupFilter);
        rerenderRepliesWorkspace();
      });
    });

    actionRoot.querySelectorAll("[data-replies-menu]").forEach(function (el) {
      el.addEventListener("click", function () {
        lastUserActionAt = Date.now();
        repliesManageMenu = String(el.getAttribute("data-replies-menu") || "quick");
        window.localStorage.setItem("ajw_chat_replies_menu", repliesManageMenu);
        if (repliesManageMenu === "lab") {
          loadAiLearning().finally(rerenderRepliesWorkspace);
          return;
        }
        rerenderRepliesWorkspace();
      });
    });

    actionRoot.querySelectorAll("[data-predict-idx]").forEach(function (el) {
      el.addEventListener("click", function () {
        lastUserActionAt = Date.now();
        var idx = Number(el.getAttribute("data-predict-idx") || -1);
        var list = buildPredictions();
        var txt = idx >= 0 && idx < list.length ? String(list[idx] || "") : "";
        if (!txt) return;
        var ta = document.getElementById("CHAT-REPLY-TEXT");
        if (ta) {
          ta.value = txt;
          ta.focus();
        }
      });
    });

    var predToggle = actionRoot.querySelector("#CHAT-PREDICT-TOGGLE");
    if (predToggle) {
      predToggle.addEventListener("change", function () {
        lastUserActionAt = Date.now();
        predictionEnabled = Boolean(predToggle.checked);
        window.localStorage.setItem("ajw_chat_pred_toggle", predictionEnabled ? "1" : "0");
        renderSidePanel();
      });
    }

    var refToggle = actionRoot.querySelector("#CHAT-REF-TOGGLE");
    if (refToggle) {
      refToggle.addEventListener("change", function () {
        lastUserActionAt = Date.now();
        referenceEnabled = Boolean(refToggle.checked);
        window.localStorage.setItem("ajw_chat_ref_toggle", referenceEnabled ? "1" : "0");
        renderSidePanel();
      });
    }

    var aiSaveBtn = actionRoot.querySelector("#CHAT-AI-SAVE-SETTINGS");
    if (aiSaveBtn) {
      aiSaveBtn.onclick = function () {
        lastUserActionAt = Date.now();
        var aiEnabled = Boolean((document.getElementById("CHAT-AI-ENABLED") || {}).checked);
        var requireApproval = Boolean((document.getElementById("CHAT-AI-APPROVAL") || {}).checked);
        var provider = String((document.getElementById("CHAT-AI-PROVIDER") || {}).value || "smart");
        var promptPreset = String((document.getElementById("CHAT-AI-PROMPT") || {}).value || "").trim();
        apiPost("/api/chat/ai/settings", {
          shop_id: currentShopId,
          ai_enabled: aiEnabled,
          require_approval: requireApproval,
          provider: provider,
          prompt_preset: promptPreset
        })
          .then(function (d) {
            aiSettings = d.row || null;
            autonomousEnabled = Boolean((actionRoot.querySelector("#CHAT-AI-AUTONOMOUS") || {}).checked);
            window.localStorage.setItem("ajw_chat_ai_autonomous", autonomousEnabled ? "1" : "0");
            if (autonomousEnabled) startAutonomous();
            else stopAutonomous();
            renderHeaderState();
            toast("Mode AI tersimpan.", "success");
          })
          .catch(function (err) {
            toast("Gagal simpan mode AI: " + (err.message || err), "error");
          });
      };
    }

    var aiAntonPromptBtn = actionRoot.querySelector("#CHAT-AI-USE-ANTON-PROMPT");
    if (aiAntonPromptBtn) {
      aiAntonPromptBtn.onclick = function () {
        lastUserActionAt = Date.now();
        var promptBox = document.getElementById("CHAT-AI-PROMPT");
        if (!promptBox) return;
        promptBox.value = AI_CORE_PROMPT_ANTON;
        promptBox.focus();
        toast("Core prompt Anton Pancing dimuat. Klik Simpan Mode AI untuk menyimpan.", "success");
      };
    }

    var aiAutoToggle = actionRoot.querySelector("#CHAT-AI-AUTONOMOUS");
    if (aiAutoToggle) {
      aiAutoToggle.addEventListener("change", function () {
        lastUserActionAt = Date.now();
        autonomousEnabled = Boolean(aiAutoToggle.checked);
        window.localStorage.setItem("ajw_chat_ai_autonomous", autonomousEnabled ? "1" : "0");
        if (autonomousEnabled) startAutonomous();
        else stopAutonomous();
      });
    }

    var aiRunNow = actionRoot.querySelector("#CHAT-AI-RUN-NOW");
    if (aiRunNow) {
      aiRunNow.addEventListener("click", function () {
        lastUserActionAt = Date.now();
        runAutonomousCycle()
          .then(function () {
            toast("Autonomous cycle selesai.", "success");
          })
          .catch(function (err) {
            toast("Autonomous gagal: " + (err.message || err), "error");
          });
      });
    }

    var aiLabIncoming = actionRoot.querySelector("#CHAT-AILAB-INCOMING");
    if (aiLabIncoming) {
      aiLabIncoming.addEventListener("input", function () {
        aiLabState.incoming_text = String(aiLabIncoming.value || "");
        persistAiLabState();
      });
    }

    var aiLabDraft = actionRoot.querySelector("#CHAT-AILAB-DRAFT");
    if (aiLabDraft) {
      aiLabDraft.addEventListener("input", function () {
        aiLabState.generated_text = String(aiLabDraft.value || "");
        persistAiLabState();
      });
    }

    var aiLabNotes = actionRoot.querySelector("#CHAT-AILAB-NOTES");
    if (aiLabNotes) {
      aiLabNotes.addEventListener("input", function () {
        aiLabState.notes = String(aiLabNotes.value || "");
        persistAiLabState();
      });
    }

    var aiLabScore = actionRoot.querySelector("#CHAT-AILAB-SCORE");
    if (aiLabScore) {
      aiLabScore.addEventListener("change", function () {
        aiLabState.score = Number(aiLabScore.value || 5);
        persistAiLabState();
      });
    }

    var aiLabUseActive = actionRoot.querySelector("#CHAT-AILAB-USE-ACTIVE");
    if (aiLabUseActive) {
      aiLabUseActive.addEventListener("click", function () {
        lastUserActionAt = Date.now();
        aiLabState.incoming_text = latestIncomingFromCache() || "";
        persistAiLabState();
        renderMessages();
        renderSidePanel();
      });
    }

    var aiLabGenerate = actionRoot.querySelector("#CHAT-AILAB-GENERATE");
    if (aiLabGenerate) {
      aiLabGenerate.addEventListener("click", function () {
        lastUserActionAt = Date.now();
        var incoming = String((actionRoot.querySelector("#CHAT-AILAB-INCOMING") || {}).value || "").trim();
        if (!currentShopId) return toast("Pilih toko dulu.", "warn");
        if (!incoming) return toast("Isi pesan pelanggan untuk diuji.", "warn");
        apiPost("/api/chat/ai/test-draft", {
          shop_id: currentShopId,
          conversation_id: selectedConversationId || "",
          incoming_text: incoming
        })
          .then(function (data) {
            aiLabState.incoming_text = incoming;
            aiLabState.generated_text = String(data.draft_text || "");
            persistAiLabState();
            aiLearningStats = data.stats || aiLearningStats;
            rerenderRepliesWorkspace();
            toast("Draft AI uji berhasil dibuat.", "success");
          })
          .catch(function (err) {
            toast("Gagal uji AI: " + (err.message || err), "error");
          });
      });
    }

    var aiLabSaveLearn = actionRoot.querySelector("#CHAT-AILAB-SAVE-LEARN");
    if (aiLabSaveLearn) {
      aiLabSaveLearn.addEventListener("click", function () {
        lastUserActionAt = Date.now();
        var incoming = String((actionRoot.querySelector("#CHAT-AILAB-INCOMING") || {}).value || "").trim();
        var draftText = String((actionRoot.querySelector("#CHAT-AILAB-DRAFT") || {}).value || "").trim();
        var score = Number((actionRoot.querySelector("#CHAT-AILAB-SCORE") || {}).value || aiLabState.score || 5);
        var notes = String((actionRoot.querySelector("#CHAT-AILAB-NOTES") || {}).value || "").trim();
        if (!currentShopId) return toast("Pilih toko dulu.", "warn");
        if (!incoming || !draftText) return toast("Isi pesan pelanggan dan draft AI dulu.", "warn");
        apiPost("/api/chat/ai/learning", {
          shop_id: currentShopId,
          conversation_id: selectedConversationId || "",
          customer_text: incoming,
          seller_text: draftText,
          score: score,
          notes: notes,
          source: "ai_lab_feedback"
        })
          .then(function () {
            return loadAiLearning();
          })
          .then(function () {
            rerenderRepliesWorkspace();
            toast("Contoh belajar AI tersimpan.", "success");
          })
          .catch(function (err) {
            toast("Gagal simpan pembelajaran AI: " + (err.message || err), "error");
          });
      });
    }
  }

  function renderHeaderState() {
    var info = document.getElementById("CHAT-ACTIVITY");
    if (!info) return;
    var conv = currentConversation();
    info.innerHTML =
      '<span class="ajw-chat-pill gold">Realtime ' + (realtimeEnabled ? "On" : "Off") + "</span>" +
      '<span class="ajw-chat-pill blue">Toko ' + escSafe(currentShopId || "-") + "</span>" +
      '<span class="ajw-chat-pill ' + (aiSettings && Number(aiSettings.ai_enabled || 0) ? "blue" : "red") + '">AI ' + (aiSettings && Number(aiSettings.ai_enabled || 0) ? "On" : "Review") + "</span>" +
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
    renderAiDraftPanel();
    renderFilterState();
    renderSideTabs();
    var compose = document.querySelector(".ajw-chat-compose");
    if (compose) compose.style.display = activeSideTab === "replies" ? "none" : "";
  }

  function rerenderRepliesWorkspace() {
    renderMessages();
    renderSidePanel();
    renderAiDraftPanel();
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

  function persistQuickFormState() {
    window.localStorage.setItem("ajw_chat_quick_form", JSON.stringify(quickFormState || {}));
  }

  function persistKnowledgeFormState() {
    window.localStorage.setItem("ajw_chat_knowledge_form", JSON.stringify(knowledgeFormState || {}));
  }

  function persistAiLabState() {
    window.localStorage.setItem("ajw_chat_ai_lab_form", JSON.stringify(aiLabState || {}));
  }

  async function runAutonomousCycle() {
    if (!autonomousEnabled || !currentShopId || window._activeTab !== "chat" || autonomousInFlight) return;
    autonomousInFlight = true;
    try {
      await apiPost("/api/chat/ai/autonomous/run", {
        shop_id: currentShopId,
        limit: 5
      });
      refreshConversationsBg();
      if (selectedConversationId) {
        await loadMessages();
        renderMessages();
      }
    } catch (_err) {
    } finally {
      autonomousInFlight = false;
    }
  }

  function startAutonomous() {
    if (autonomousTimer) clearInterval(autonomousTimer);
    autonomousTimer = setInterval(runAutonomousCycle, 7000);
    runAutonomousCycle();
  }

  function stopAutonomous() {
    if (autonomousTimer) clearInterval(autonomousTimer);
    autonomousTimer = null;
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
    var latestCustomerText = latestIncomingFromCache();
    if (!text && !attachmentQueue.length) return toast("Isi pesan atau lampiran dulu.", "warn");

    try {
      for (var i = 0; i < attachmentQueue.length; i += 1) {
        await uploadAndSendAttachment(attachmentQueue[i], i === 0 ? text : "");
      }
      if (!attachmentQueue.length && text) {
        await apiPost("/api/chat/send", {
          shop_id: currentShopId,
          conversation_id: selectedConversationId,
          text: text,
          customer_text: latestCustomerText
        });
      }
      attachmentQueue = [];
      if (ta) ta.value = "";
      await loadMessages();
      await loadOrders(true);
      await loadConversations();
      await loadAiLearning();
      renderAll();
      scrollThreadToBottom();
      toast("Pesan berhasil dikirim.", "success");
    } catch (err) {
      toast("Gagal kirim pesan: " + (err.message || err), "error");
    }
  }

  async function runRealtimePoll() {
    if (!realtimeEnabled || !currentShopId || document.hidden || window._activeTab !== "chat" || pollInFlight) return;
    if (Date.now() - lastUserActionAt < 1200) return;
    var activeEl = document.activeElement;
    var typing = activeEl && (activeEl.tagName === "INPUT" || activeEl.tagName === "TEXTAREA");
    if (typing) return;
    pollInFlight = true;
    try {
      var data = await apiPost("/api/chat/realtime/poll", {
        shop_id: currentShopId,
        conversation_id: selectedConversationId || ""
      });
      var nextConvs = (data.conversations || []).sort(function (a, b) {
        return Number(b.last_message_timestamp || 0) - Number(a.last_message_timestamp || 0);
      });
      var convSig = nextConvs
        .slice(0, 20)
        .map(function (r) {
          return [r.conversation_id, r.last_message_timestamp, r.unread_count, r.has_unreplied].join(":");
        })
        .join("|");
      var nextMsgs = selectedConversationId ? data.messages || [] : messagesCache;
      var msgSig = nextMsgs.length
        ? [nextMsgs.length, nextMsgs[nextMsgs.length - 1].message_id || "", nextMsgs[nextMsgs.length - 1].created_timestamp || 0].join(":")
        : "0";
      var changed = convSig !== lastRealtimeConvSig || msgSig !== lastRealtimeMsgSig;

      conversationsCache = nextConvs;
      if (selectedConversationId) messagesCache = nextMsgs;

      if (changed) {
        lastRealtimeConvSig = convSig;
        lastRealtimeMsgSig = msgSig;
      }
      if (changed) {
        renderHeaderState();
        renderConversations();
        if (selectedConversationId && activeSideTab !== "replies") renderMessages();
        renderFilterState();
      }
    } catch (_err) {
    } finally {
      pollInFlight = false;
    }
  }

  function startRealtime() {
    stopRealtime();
    runRealtimePoll();
    realtimeTimer = setInterval(runRealtimePoll, 3500);
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
    var aiDraftBtn = document.getElementById("CHAT-AI-DRAFT-BTN");
    var imgInput = document.getElementById("CHAT-UPLOAD-IMG");
    var vidInput = document.getElementById("CHAT-UPLOAD-VID");
    var ta = document.getElementById("CHAT-REPLY-TEXT");
    var shopInput = document.getElementById("CHAT-SHOP-ID-MANUAL");

    if (saveBtn) {
      saveBtn.onclick = function () {
        lastUserActionAt = Date.now();
        var base = document.getElementById("CHAT-API-BASE");
        API_BASE = String((base && base.value) || "").trim().replace(/\/$/, "");
        window.localStorage.setItem("ajw_chat_api_base", API_BASE);
        toast("API backend disimpan.", "success");
      };
    }

    if (oauthBtn) {
      oauthBtn.onclick = function () {
        lastUserActionAt = Date.now();
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
        lastUserActionAt = Date.now();
        syncAll(true)
          .then(function () {
            renderAll();
            renderAiDraftPanel();
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
        lastUserActionAt = Date.now();
        realtimeEnabled = !realtimeEnabled;
        if (realtimeEnabled) startRealtime();
        else stopRealtime();
        renderHeaderState();
      };
    }

    if (sendBtn) sendBtn.onclick = sendCurrentMessage;
    if (aiDraftBtn) {
      aiDraftBtn.onclick = function () {
        lastUserActionAt = Date.now();
        if (!currentShopId) return toast("Isi shop_id dulu.", "warn");
        if (!selectedConversationId) return toast("Pilih percakapan dulu.", "warn");
        apiPost("/api/chat/ai/draft", {
          shop_id: currentShopId,
          conversation_id: selectedConversationId
        })
          .then(function (d) {
            var requireApproval = !aiSettings || Number(aiSettings.require_approval || 0) !== 0;
            if (requireApproval) return d;
            return apiPost("/api/chat/ai/approve-send", {
              draft_id: d && d.row ? d.row.id : "",
              shop_id: currentShopId,
              conversation_id: selectedConversationId,
              approved: true,
              final_text: d && d.row ? d.row.draft_text : ""
            });
          })
          .then(function () {
            return Promise.all([loadAiDrafts(), loadMessages(), loadConversations(), loadAiLearning()]);
          })
          .then(function () {
            renderMessages();
            renderConversations();
            renderAiDraftPanel();
            scrollThreadToBottom();
            var requireApproval = !aiSettings || Number(aiSettings.require_approval || 0) !== 0;
            toast(requireApproval ? "Draft AI siap untuk review." : "AI mengirim balasan otomatis.", "success");
          })
          .catch(function (err) {
            toast("Gagal membuat draft AI: " + (err.message || err), "error");
          });
      };
    }
    if (shopInput) {
      shopInput.onchange = function () {
        lastUserActionAt = Date.now();
        currentShopId = selectedShopId();
        selectedConversationId = "";
        Promise.all([loadConversations(), loadQuickReplies(), loadProducts(false)])
          .then(function () {
            return Promise.all([loadKnowledge(), loadAiSettings(), loadAiLearning()]);
          })
          .then(function () {
            renderAll();
            renderAiDraftPanel();
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
        lastUserActionAt = Date.now();
        if (ev.key === "Enter" && !ev.shiftKey) {
          ev.preventDefault();
          sendCurrentMessage();
        }
      });
      ta.addEventListener("paste", function (ev) {
        lastUserActionAt = Date.now();
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
        lastUserActionAt = Date.now();
        activeFilter = String(el.getAttribute("data-chat-filter") || "all");
        window.localStorage.setItem("ajw_chat_filter", activeFilter);
        renderFilterState();
        renderConversations();
        refreshConversationsBg();
      });
    });

    document.querySelectorAll("[data-chat-side-tab]").forEach(function (el) {
      el.addEventListener("click", function () {
        lastUserActionAt = Date.now();
        activeSideTab = String(el.getAttribute("data-chat-side-tab") || "orders");
        window.localStorage.setItem("ajw_chat_side_tab", activeSideTab);
        renderSideTabs();
        renderMessages();
        renderSidePanel();
        var compose = document.querySelector(".ajw-chat-compose");
        if (compose) compose.style.display = activeSideTab === "replies" ? "none" : "";
      });
    });

    document.querySelectorAll("[data-chat-emoji]").forEach(function (el) {
      el.addEventListener("click", function () {
        lastUserActionAt = Date.now();
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
    v.style.maxWidth = "none";
    v.style.margin = "0";
    v.style.padding = "10px 12px 12px";
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
      '<div class="ajw-chat-col ajw-chat-main" style="position:relative">' +
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
      '<div style="display:flex;gap:8px;align-items:center">' +
      '<button id="CHAT-AI-DRAFT-BTN" class="btns">AI Draft</button>' +
      '<button id="CHAT-SEND" class="btnp">Kirim</button>' +
      "</div>" +
      "</div>" +
      '<div id="CHAT-AI-DRAFT"></div>' +
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
        return Promise.all([loadQuickReplies(), loadProducts(false), loadKnowledge(), loadAiSettings(), loadAiLearning()]);
      })
      .then(function () {
        if (selectedConversationId) {
          return Promise.all([loadMessages(), loadOrders(false), loadAiDrafts()]);
        }
      })
      .then(function () {
        renderAll();
        scrollThreadToBottom();
        startRealtime();
        if (autonomousEnabled) startAutonomous();
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
        stopAutonomous();
        toggleEmoji(false);
        applyWideLayout(false);
        return oldNav.apply(this, arguments);
      };
      window._navTo._chatWrapped = true;
    }
  }

  hookNavigation();
  ensureChatTabButton();
  if (!window.__ajwChatUserActionHooked) {
    window.__ajwChatUserActionHooked = true;
    document.addEventListener(
      "pointerdown",
      function () {
        lastUserActionAt = Date.now();
      },
      true
    );
    document.addEventListener(
      "input",
      function () {
        lastUserActionAt = Date.now();
      },
      true
    );
  }
})();
