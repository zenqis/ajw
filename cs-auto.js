/* ==============================================================
   AJW CS AUTO v2 — Autonomous Chat System (Shopee backend)
   - Integrasi penuh ke https://shopeebackend.vercel.app
   - Shop ID default: 441416281
   - Mengganti mock-data dengan API call nyata
   - UI 3-panel: Daftar Chat | Pesan + Composer | Panel Info (Pesanan,
     Produk, Balasan Cepat, Pusat Informasi, Mode AI, Lab AI)
   - AI Draft dari /api/chat/ai/draft (tidak lagi panggil OpenAI langsung)
   - Realtime polling /api/chat/realtime/poll
   - Mode AUTO / APPROVAL / MANUAL
   ============================================================== */
(function(){
  'use strict';
  if (window.__AJW_CSAUTO_V2) return;
  window.__AJW_CSAUTO_V2 = true;

  /* ---------- 0. Konstanta ---------- */
  var DEFAULT_BACKEND = 'https://shopeebackend.vercel.app';
  var DEFAULT_SHOP_ID = '441416281';
  var LS_PREFIX = 'ajw_csauto_';
  var KNOWLEDGE_CATEGORIES = [
    'Logistik/Pengiriman',
    'Obrolan ringan',
    'Paska Penjualan',
    'Produk',
    'Pra-Penjualan',
    'Live Agent',
    'General'
  ];

  /* ---------- 1. LocalStorage helpers (hanya untuk setting lokal) ---------- */
  var LS = {
    get: function(k, def){
      try {
        var v = localStorage.getItem(LS_PREFIX + k);
        if (v == null) return def;
        if (v === 'true') return true;
        if (v === 'false') return false;
        try { return JSON.parse(v); } catch(e){ return v; }
      } catch(e){ return def; }
    },
    set: function(k, v){
      try {
        var s = (typeof v === 'string') ? v : JSON.stringify(v);
        localStorage.setItem(LS_PREFIX + k, s);
      } catch(e){}
    }
  };

  /* ---------- 2. State ---------- */
  var S = {
    backendUrl: LS.get('backendUrl', DEFAULT_BACKEND),
    shopId: LS.get('shopId', DEFAULT_SHOP_ID),
    filter: LS.get('filter', 'all'),        /* all | unreplied | unread */
    sideTab: LS.get('sideTab', 'orders'),    /* orders|products|quick|knowledge|ai|lab */
    realtime: LS.get('realtime', false),
    mode: LS.get('mode', 'approval'),        /* auto | approval | manual */
    activeConvId: null,
    conversations: [],
    messages: [],
    orders: [],
    products: [],
    quickReplies: [],
    knowledge: [],
    aiSettings: null,
    aiCredStatus: null,
    aiDrafts: [],
    aiLearning: [],
    aiDraftCurrent: null,
    loadingChats: false,
    loadingMsgs: false,
    lastConvSig: '',
    lastMsgSig: '',
    pollTimer: null
  };

  /* ---------- 3. HTTP helper ---------- */
  function apiUrl(path){
    var base = (S.backendUrl || DEFAULT_BACKEND).replace(/\/+$/,'');
    return base + path;
  }
  function api(path, opts){
    opts = opts || {};
    var headers = { 'Content-Type':'application/json' };
    if (opts.headers) for (var k in opts.headers) headers[k] = opts.headers[k];
    var body = opts.body;
    if (body && typeof body !== 'string' && !(body instanceof FormData)) {
      body = JSON.stringify(body);
    }
    if (body instanceof FormData) delete headers['Content-Type'];
    return fetch(apiUrl(path), {
      method: opts.method || (body ? 'POST' : 'GET'),
      headers: headers,
      body: body
    }).then(function(r){
      return r.text().then(function(t){
        var data;
        try { data = t ? JSON.parse(t) : null; } catch(e){ data = { raw: t }; }
        if (!r.ok) {
          var err = new Error((data && (data.error || data.message)) || ('HTTP '+r.status));
          err.status = r.status; err.data = data; throw err;
        }
        return data;
      });
    });
  }

  /* ---------- 4. Toast ---------- */
  function toast(msg, kind){
    var t = document.createElement('div');
    var bg = kind === 'err' ? '#C62828' : (kind === 'ok' ? '#1B5E20' : '#0D2E5A');
    t.style.cssText = 'position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:'+bg+';color:#fff;padding:9px 16px;border-radius:6px;font:13px Arial;z-index:99999;box-shadow:0 4px 18px rgba(0,0,0,.35);max-width:80%';
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(function(){ try { t.parentNode.removeChild(t); } catch(e){} }, 2600);
  }

  /* ---------- 5. CSS ---------- */
  function injectCSS(){
    if (document.getElementById('CSAUTO-CSS')) return;
    var css = [
      '.cs-wrap{display:flex;flex-direction:column;height:calc(100vh - 120px);min-height:500px;gap:8px;font-family:Arial,sans-serif}',
      '.cs-top{display:flex;flex-wrap:wrap;gap:6px;align-items:center;padding:8px 10px;background:var(--bg2,#fff);border:1px solid var(--bd,#e0e0e0);border-radius:8px}',
      '.cs-top input,.cs-top select{padding:5px 8px;border:1px solid var(--bd,#ccc);border-radius:5px;font:12px Arial;background:var(--bg1,#fff);color:var(--fg,#222)}',
      '.cs-top .lbl{font:11px Arial;color:var(--mut,#666);margin-right:2px}',
      '.cs-btn{padding:5px 10px;border:1px solid #0D2E5A;background:#0D2E5A;color:#fff;border-radius:5px;font:12px Arial;cursor:pointer}',
      '.cs-btn:hover{opacity:.9}',
      '.cs-btn.g{background:#1B5E20;border-color:#1B5E20}',
      '.cs-btn.r{background:#C62828;border-color:#C62828}',
      '.cs-btn.o{background:#E65100;border-color:#E65100}',
      '.cs-btn.y{background:#f5f5f5;color:#222;border-color:#ccc}',
      '.cs-btn.sm{padding:3px 7px;font-size:11px}',
      '.cs-main{display:grid;grid-template-columns:290px 1fr 320px;gap:8px;flex:1;min-height:0}',
      '@media(max-width:1100px){.cs-main{grid-template-columns:250px 1fr}.cs-main .cs-col-r{display:none}}',
      '@media(max-width:700px){.cs-main{grid-template-columns:1fr}.cs-main .cs-col-l{display:none}}',
      '.cs-col{background:var(--bg2,#fff);border:1px solid var(--bd,#e0e0e0);border-radius:8px;display:flex;flex-direction:column;overflow:hidden;min-height:0}',
      '.cs-col-head{padding:8px 10px;border-bottom:1px solid var(--bd,#e0e0e0);font:bold 12px Arial;background:var(--bg3,#fafafa);display:flex;gap:6px;align-items:center;flex-wrap:wrap}',
      '.cs-col-body{flex:1;overflow-y:auto;min-height:0}',
      '.cs-list .cs-item{padding:9px 11px;border-bottom:1px solid var(--bd,#eee);cursor:pointer;display:flex;gap:9px;align-items:flex-start}',
      '.cs-list .cs-item:hover{background:var(--bg3,#f5f5f5)}',
      '.cs-list .cs-item.active{background:#e3f2fd;border-left:3px solid #1565C0;padding-left:8px}',
      '.cs-list .cs-ava{width:34px;height:34px;border-radius:50%;background:#0D2E5A;color:#fff;display:flex;align-items:center;justify-content:center;font:bold 12px Arial;flex-shrink:0;overflow:hidden}',
      '.cs-list .cs-ava img{width:100%;height:100%;object-fit:cover}',
      '.cs-list .cs-inf{flex:1;min-width:0}',
      '.cs-list .cs-nm{font:bold 12px Arial;display:flex;justify-content:space-between;gap:6px;color:var(--fg,#222)}',
      '.cs-list .cs-tm{font:10px Arial;color:var(--mut,#888);flex-shrink:0}',
      '.cs-list .cs-pv{font:11px Arial;color:var(--mut,#666);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
      '.cs-badge{background:#E65100;color:#fff;font:bold 9px Arial;padding:1px 6px;border-radius:9px;margin-left:4px}',
      '.cs-chat-hdr{padding:9px 12px;border-bottom:1px solid var(--bd,#e0e0e0);display:flex;align-items:center;gap:9px;background:var(--bg3,#fafafa)}',
      '.cs-chat-hdr .cs-ava{width:32px;height:32px;border-radius:50%;background:#0D2E5A;color:#fff;display:flex;align-items:center;justify-content:center;font:bold 12px Arial}',
      '.cs-msgs{flex:1;overflow-y:auto;padding:10px;display:flex;flex-direction:column;gap:7px;background:var(--bg1,#fff);min-height:0}',
      '.cs-msgs .cs-msg{display:block;max-width:75%;padding:8px 11px;border-radius:11px;font:12px Arial;line-height:1.45;word-wrap:break-word;white-space:pre-wrap;letter-spacing:.01em}',
      '.cs-msgs .cs-msg.inc{background:#1f232b;color:#E9EEF8;align-self:flex-start;border:1px solid #2d3442;border-radius:11px 11px 11px 2px}',
      '.cs-msgs .cs-msg.out{background:#1565C0;color:#fff;align-self:flex-end;border-radius:11px 11px 2px 11px}',
      '.cs-msgs .cs-msg.ai{background:#2E7D32;color:#fff;align-self:flex-end;border-radius:11px 11px 2px 11px}',
      '.cs-msgs .cs-msg .cs-mt{font:10px Arial;opacity:.8;margin-top:4px;color:rgba(255,255,255,.72)}',
      '.cs-comp{border-top:1px solid var(--bd,#e0e0e0);padding:7px 9px;display:flex;flex-direction:column;gap:5px;background:var(--bg2,#fff)}',
      '.cs-comp .cs-row{display:flex;gap:5px;align-items:center;flex-wrap:wrap}',
      '.cs-comp textarea{flex:1;min-height:44px;max-height:140px;padding:6px 9px;border:1px solid var(--bd,#ccc);border-radius:6px;font:12px Arial;background:var(--bg1,#fff);color:var(--fg,#222);resize:vertical}',
      '.cs-draft{background:#FFF8E1;border:1px solid #FFC107;border-radius:6px;padding:7px 9px;font:12px Arial;color:#3E2723;display:flex;flex-direction:column;gap:5px}',
      '.cs-draft b{color:#E65100}',
      '.cs-tabbar{display:flex;overflow-x:auto;border-bottom:1px solid var(--bd,#eee);background:var(--bg3,#fafafa);flex-shrink:0}',
      '.cs-tabbar button{padding:7px 10px;border:0;background:transparent;color:var(--fg,#333);font:bold 11px Arial;cursor:pointer;white-space:nowrap;border-bottom:2px solid transparent}',
      '.cs-tabbar button.act{color:#1565C0;border-bottom-color:#1565C0}',
      '.cs-side-body{padding:8px;overflow-y:auto;flex:1;min-height:0}',
      '.cs-side-body h4{font:bold 11px Arial;margin:10px 0 5px;color:var(--mut,#555);text-transform:uppercase;letter-spacing:.3px}',
      '.cs-qr-item,.cs-kw-item,.cs-ord,.cs-prd,.cs-learn-item{padding:7px 9px;border:1px solid var(--bd,#e0e0e0);border-radius:5px;margin-bottom:5px;font:11px Arial;background:var(--bg1,#fff);cursor:pointer}',
      '.cs-qr-item:hover,.cs-kw-item:hover,.cs-ord:hover,.cs-prd:hover{background:#e3f2fd;border-color:#1565C0}',
      '.cs-qr-item b,.cs-kw-item b{color:#0D2E5A;display:block;margin-bottom:2px}',
      '.cs-qr-item .cs-row,.cs-kw-item .cs-row{display:flex;justify-content:space-between;gap:5px;margin-top:4px}',
      '.cs-empty{padding:14px;text-align:center;color:var(--mut,#888);font:12px Arial}',
      '.cs-form{display:flex;flex-direction:column;gap:5px;padding:8px;background:var(--bg3,#fafafa);border:1px dashed var(--bd,#ccc);border-radius:5px;margin-bottom:8px}',
      '.cs-form input,.cs-form select,.cs-form textarea{padding:5px 8px;border:1px solid var(--bd,#ccc);border-radius:4px;font:11px Arial;background:var(--bg1,#fff);color:var(--fg,#222)}',
      '.cs-form textarea{min-height:55px;resize:vertical}',
      '.cs-mode-box{display:flex;flex-direction:column;gap:6px;padding:8px;border:1px solid var(--bd,#e0e0e0);border-radius:5px;margin-bottom:7px}',
      '.cs-mode-box label{font:11px Arial;display:flex;gap:6px;align-items:flex-start;cursor:pointer}',
      '.cs-pill{display:inline-block;padding:1px 6px;border-radius:8px;font:9px Arial;background:#e0e0e0;color:#333;margin-left:4px}',
      '.cs-pill.ok{background:#C8E6C9;color:#1B5E20}',
      '.cs-pill.warn{background:#FFE0B2;color:#E65100}',
      '.cs-pill.err{background:#FFCDD2;color:#C62828}',
      '.cs-link{color:#1565C0;cursor:pointer;text-decoration:underline;font-size:11px}',
      '.cs-dot{display:inline-block;width:7px;height:7px;border-radius:50%;background:#bbb;margin-right:4px}',
      '.cs-dot.on{background:#4CAF50;box-shadow:0 0 4px #4CAF50}'
    ].join('\n');
    var st = document.createElement('style');
    st.id = 'CSAUTO-CSS';
    st.textContent = css;
    document.head.appendChild(st);
  }

  /* ---------- 6. Utils ---------- */
  function esc(s){ return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];}); }
  function initials(name){ name = String(name||'?').trim(); if(!name) return '?'; var p = name.split(/\s+/); return (p[0][0]||'').toUpperCase() + ((p[1]||'')[0]||'').toUpperCase(); }
  function fmtTime(ts){
    if (!ts) return '';
    var d = (typeof ts === 'number' && ts < 1e12) ? new Date(ts*1000) : new Date(ts);
    if (isNaN(d.getTime())) return '';
    var now = new Date();
    var sameDay = d.toDateString() === now.toDateString();
    if (sameDay) return d.toLocaleTimeString('id-ID', { hour:'2-digit', minute:'2-digit'});
    return d.toLocaleDateString('id-ID', { day:'2-digit', month:'short'});
  }
  function debounce(fn, ms){
    var t;
    return function(){
      var a = arguments, c = this;
      clearTimeout(t);
      t = setTimeout(function(){ fn.apply(c,a); }, ms);
    };
  }

  function decodeHtmlEntities(s){
    if (!s) return '';
    var txt = String(s);
    return txt
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");
  }

  function stripHtml(s){
    if (!s) return '';
    var txt = String(s);
    txt = txt.replace(/<br\s*\/?>/gi, '\n');
    txt = txt.replace(/<\/div>/gi, '\n');
    txt = txt.replace(/<div[^>]*>/gi, '');
    txt = txt.replace(/<[^>]+>/g, '');
    return decodeHtmlEntities(txt);
  }

  function normalizeText(s){
    var txt = stripHtml(s || '');
    txt = txt.replace(/\r/g, '');
    txt = txt.replace(/\n{3,}/g, '\n\n');
    return txt.trim();
  }

  function parseRaw(raw){
    if (!raw) return null;
    if (typeof raw === 'object') return raw;
    try { return JSON.parse(raw); } catch(e){ return null; }
  }

  function extractMessageText(m){
    if (!m) return '';
    var t = '';
    if (m.content_text) t = m.content_text;
    if (!t && m.content && typeof m.content === 'object') t = m.content.text || m.content.item_name || '';
    if (!t && m.message) t = m.message;
    if (!t && m.text) t = m.text;
    if (!t && m.latest_message_text) t = m.latest_message_text;
    if (!t && m.latest_message_content && typeof m.latest_message_content === 'object') t = m.latest_message_content.text || '';

    if (!t) {
      var r = parseRaw(m.raw_json);
      if (r && r.content) {
        if (typeof r.content === 'string') t = r.content;
        else if (typeof r.content === 'object') t = r.content.text || r.content.item_name || r.content.notification_for_sender || r.content.notification_for_receiver || '';
      }
      if (!t && r && r.latest_message_content && typeof r.latest_message_content === 'object') t = r.latest_message_content.text || '';
    }

    t = normalizeText(t);
    if (!t) {
      if (m.message_type === 'item') return '[Produk]';
      if (m.message_type === 'bundle_message') return '[Bundle]';
      if (m.message_type === 'rating_card') return '[Rating]';
      if (m.message_type === 'notification') return '[Notifikasi]';
      return '[' + String(m.message_type || 'pesan') + ']';
    }
    return t;
  }

  function previewText(m){
    var t = extractMessageText(m);
    if (!t) return '-';
    return t.replace(/\s+/g, ' ').trim();
  }

  function pickList(payload){
    if (!payload) return [];
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload.rows)) return payload.rows;
    if (Array.isArray(payload.conversations)) return payload.conversations;
    if (Array.isArray(payload.messages)) return payload.messages;
    if (Array.isArray(payload.orders)) return payload.orders;
    if (Array.isArray(payload.products)) return payload.products;
    if (Array.isArray(payload.items)) return payload.items;
    if (Array.isArray(payload.list)) return payload.list;
    if (Array.isArray(payload.data)) return payload.data;
    return [];
  }

  function toTs(v){
    if (v == null) return 0;
    if (typeof v === 'number') {
      if (!isFinite(v)) return 0;
      return v < 1e12 ? (v * 1000) : v;
    }
    if (typeof v === 'string') {
      if (/^\d+$/.test(v)) {
        var n = Number(v);
        return n < 1e12 ? (n * 1000) : n;
      }
      var d = Date.parse(v);
      return isNaN(d) ? 0 : d;
    }
    return 0;
  }

  /* ---------- 7. API wrappers ---------- */
  var API = {
    conversations: function(){
      return api('/api/chat/conversations?shop_id='+encodeURIComponent(S.shopId)+'&filter='+encodeURIComponent(S.filter)+'&limit=120&sync=1');
    },
    messages: function(cid){
      return api('/api/chat/messages?conversation_id='+encodeURIComponent(cid)+'&shop_id='+encodeURIComponent(S.shopId)+'&limit=200&order=asc');
    },
    sync: function(){
      return api('/api/chat/sync', { body: { shop_id: S.shopId } });
    },
    markRead: function(cid){
      return api('/api/chat/conversation/read', { body: { conversation_id: cid, shop_id: S.shopId } });
    },
    send: function(cid, text){
      return api('/api/chat/send', { body: { conversation_id: cid, shop_id: S.shopId, text: text } });
    },
    orders: function(){ return api('/api/chat/orders?shop_id='+encodeURIComponent(S.shopId)); },
    products: function(){ return api('/api/chat/products?shop_id='+encodeURIComponent(S.shopId)); },
    quickList: function(){ return api('/api/chat/quick-replies?shop_id='+encodeURIComponent(S.shopId)+'&limit=2000'); },
    quickAdd: function(p){ return api('/api/chat/quick-replies', { body: Object.assign({ shop_id:S.shopId }, p) }); },
    quickDel: function(id){ return api('/api/chat/quick-replies/'+encodeURIComponent(id), { method:'DELETE' }); },
    knowList: function(){ return api('/api/chat/knowledge?shop_id='+encodeURIComponent(S.shopId)+'&limit=2000'); },
    knowAdd: function(p){ return api('/api/chat/knowledge', { body: Object.assign({ shop_id:S.shopId }, p) }); },
    knowDel: function(id){ return api('/api/chat/knowledge/'+encodeURIComponent(id), { method:'DELETE' }); },
    aiSettingsGet: function(){ return api('/api/chat/ai/settings?shop_id='+encodeURIComponent(S.shopId)); },
    aiSettingsSet: function(p){ return api('/api/chat/ai/settings', { body: Object.assign({ shop_id:S.shopId }, p) }); },
    aiCredStatus: function(){ return api('/api/chat/ai/credentials/status?shop_id='+encodeURIComponent(S.shopId)); },
    aiCredSet: function(p){ return api('/api/chat/ai/credentials', { body: Object.assign({ shop_id:S.shopId }, p) }); },
    aiDraft: function(cid, history){
      return api('/api/chat/ai/draft', { body: { conversation_id: cid, shop_id: S.shopId, message_history: history || [] } });
    },
    aiDrafts: function(){ return api('/api/chat/ai/drafts?shop_id='+encodeURIComponent(S.shopId)); },
    aiApprove: function(cid, draft_id, text){ return api('/api/chat/ai/approve-send', { body: { conversation_id: cid, shop_id:S.shopId, draft_id: draft_id, text: text } }); },
    aiLearnList: function(){ return api('/api/chat/ai/learning?shop_id='+encodeURIComponent(S.shopId)+'&limit=80'); },
    aiLearnAdd: function(p){ return api('/api/chat/ai/learning', { body: Object.assign({ shop_id:S.shopId }, p) }); },
    aiAutoRun: function(){ return api('/api/chat/ai/autonomous/run', { body: { shop_id: S.shopId } }); },
    realtimePoll: function(){ return api('/api/chat/realtime/poll', { body: { shop_id:S.shopId, last_conv_sig:S.lastConvSig, last_msg_sig:S.lastMsgSig } }); }
  };

  /* ---------- 8. Tab integration ---------- */
  function ensureView(){
    var bodyHost = document.querySelector('.body');
    if (bodyHost && !document.getElementById('V-csauto')) {
      var v = document.createElement('div');
      v.id = 'V-csauto';
      v.style.display = 'none';
      bodyHost.appendChild(v);
    }
    return document.getElementById('V-csauto');
  }

  function ensureCSAutoTabButton(){
    /* Sistem AJW memakai #TABS (bukan .tabs) + buildTabBar yang di-rewrite
       oleh analytics_override_v1.js. Pola yang benar: append ke #TABS
       sesudah buildTabBar() dipanggil, sama seperti shopee_chat_override. */
    var tabs = document.getElementById('TABS');
    if (!tabs) return;
    var existing = tabs.querySelector('[data-ajw-csauto="1"]');
    if (existing){
      existing.className = 'tab ' + (window._activeTab === 'csauto' ? 'act' : 'on');
      return;
    }
    var btn = document.createElement('button');
    btn.className = 'tab ' + (window._activeTab === 'csauto' ? 'act' : 'on');
    btn.dataset.ajwCsauto = '1';
    btn.textContent = 'CS AUTO';
    btn.onclick = function(){
      if (typeof window._navTo === 'function') window._navTo('csauto');
      else if (typeof window.SW === 'function') window.SW('csauto');
    };
    tabs.appendChild(btn);
  }

  function hideOtherViews(){
    var body = document.querySelector('.body');
    if (!body) return;
    var nodes = body.querySelectorAll('div[id^="V-"]');
    for (var i=0; i<nodes.length; i++){
      nodes[i].style.display = (nodes[i].id === 'V-csauto') ? 'block' : 'none';
    }
  }

  function ensureTabRegistered(){
    ensureView();
    ensureCSAutoTabButton();
  }

  /* ---------- 9. Top bar render ---------- */
  function renderTop(){
    var realtimeDot = '<span class="cs-dot'+(S.realtime?' on':'')+'"></span>';
    return (
      '<div class="cs-top">'+
        '<span class="lbl">Backend</span>'+
        '<input id="cs-backend" style="width:220px" value="'+esc(S.backendUrl)+'" placeholder="https://...">'+
        '<span class="lbl">Shop ID</span>'+
        '<input id="cs-shop" style="width:110px" value="'+esc(S.shopId)+'">'+
        '<span class="lbl">Filter</span>'+
        '<select id="cs-filter">'+
          '<option value="all"'+(S.filter==='all'?' selected':'')+'>Semua</option>'+
          '<option value="unreplied"'+(S.filter==='unreplied'?' selected':'')+'>Belum dibalas</option>'+
          '<option value="unread"'+(S.filter==='unread'?' selected':'')+'>Belum dibaca</option>'+
        '</select>'+
        '<button class="cs-btn" id="cs-sync">Sync Shopee</button>'+
        '<button class="cs-btn y" id="cs-refresh">Refresh</button>'+
        '<button class="cs-btn o" id="cs-rt">'+realtimeDot+'Realtime: '+(S.realtime?'ON':'OFF')+'</button>'+
        '<span class="lbl">Mode</span>'+
        '<select id="cs-mode">'+
          '<option value="auto"'+(S.mode==='auto'?' selected':'')+'>AUTO (kirim otomatis)</option>'+
          '<option value="approval"'+(S.mode==='approval'?' selected':'')+'>APPROVAL (draft AI)</option>'+
          '<option value="manual"'+(S.mode==='manual'?' selected':'')+'>MANUAL</option>'+
        '</select>'+
        '<button class="cs-btn g" id="cs-run-auto">Jalankan AI Auto</button>'+
      '</div>'
    );
  }

  function bindTop(root){
    var $ = function(s){ return root.querySelector(s); };
    $('#cs-backend').onchange = function(){ S.backendUrl = this.value.trim() || DEFAULT_BACKEND; LS.set('backendUrl', S.backendUrl); toast('Backend disimpan'); loadAll(); };
    $('#cs-shop').onchange = function(){ S.shopId = this.value.trim() || DEFAULT_SHOP_ID; LS.set('shopId', S.shopId); toast('Shop ID disimpan'); loadAll(); };
    $('#cs-filter').onchange = function(){ S.filter = this.value; LS.set('filter', S.filter); loadConversations(); };
    $('#cs-sync').onclick = function(){
      this.disabled = true; this.textContent = 'Sync...';
      API.sync().then(function(){ toast('Sync selesai','ok'); loadAll(); }).catch(function(e){ toast('Sync gagal: '+e.message,'err'); })
      .then(function(){ var b=$('#cs-sync'); if(b){ b.disabled=false; b.textContent='Sync Shopee'; } });
    };
    $('#cs-refresh').onclick = function(){ loadAll(); };
    $('#cs-rt').onclick = function(){ S.realtime = !S.realtime; LS.set('realtime', S.realtime); render(); if (S.realtime) startPolling(); else stopPolling(); };
    $('#cs-mode').onchange = function(){
      S.mode = this.value; LS.set('mode', S.mode);
      if (S.aiSettings){
        API.aiSettingsSet({ ai_enabled: (S.mode!=='manual'), require_approval: (S.mode==='approval'), provider: S.aiSettings.provider, prompt_preset: S.aiSettings.prompt_preset }).then(function(r){ S.aiSettings = r && (r.settings||r) || S.aiSettings; toast('Mode AI: '+S.mode,'ok'); if (S.sideTab==='ai') renderSide(); }).catch(function(e){ toast('Gagal set mode: '+e.message,'err'); });
      }
    };
    $('#cs-run-auto').onclick = function(){
      this.disabled = true; this.textContent = 'Running...';
      API.aiAutoRun().then(function(r){ toast('AI Auto: '+(r && (r.processed||0))+' diproses','ok'); loadConversations(); if (S.activeConvId) loadMessages(S.activeConvId); })
      .catch(function(e){ toast('Auto gagal: '+e.message,'err'); })
      .then(function(){ var b=$('#cs-run-auto'); if(b){ b.disabled=false; b.textContent='Jalankan AI Auto'; } });
    };
  }

  /* ---------- 10. Conversation list ---------- */
  function renderConvList(){
    var html = '';
    if (S.loadingChats) return '<div class="cs-empty">Memuat...</div>';
    if (!S.conversations.length) return '<div class="cs-empty">Tidak ada percakapan.<br><span class="cs-link" id="cs-try-sync">Sync Shopee sekarang</span></div>';
    for (var i=0; i<S.conversations.length; i++){
      var c = S.conversations[i];
      var id = c.conversation_id || c.id;
      var name = c.to_name || c.username || c.name || id;
      var avatar = c.to_avatar || c.avatar;
      var preview = c.latest_message_text || c.last_preview || c.last_message || previewText(c);
      var ts = c.last_message_timestamp || c.last_message_time || c.updated_at;
      var unread = c.unread_count || 0;
      var active = (id === S.activeConvId) ? ' active' : '';
      html += '<div class="cs-item'+active+'" data-id="'+esc(id)+'">'+
        '<div class="cs-ava">'+(avatar?'<img src="'+esc(avatar)+'" onerror="this.replaceWith(document.createTextNode(\''+initials(name)+'\'))">':esc(initials(name)))+'</div>'+
        '<div class="cs-inf">'+
          '<div class="cs-nm"><span>'+esc(name)+(unread?'<span class="cs-badge">'+unread+'</span>':'')+'</span><span class="cs-tm">'+esc(fmtTime(ts))+'</span></div>'+
          '<div class="cs-pv">'+esc(String(preview).slice(0,100))+'</div>'+
        '</div>'+
      '</div>';
    }
    return html;
  }

  function bindConvList(root){
    var items = root.querySelectorAll('.cs-list .cs-item');
    for (var i=0; i<items.length; i++){
      items[i].onclick = (function(id){ return function(){ openConv(id); }; })(items[i].getAttribute('data-id'));
    }
    var ts = root.querySelector('#cs-try-sync');
    if (ts) ts.onclick = function(){ API.sync().then(function(){ toast('Sync OK','ok'); loadAll(); }).catch(function(e){ toast(e.message,'err'); }); };
  }

  /* ---------- 11. Messages panel ---------- */
  function renderMessages(){
    if (!S.activeConvId) return '<div class="cs-empty" style="margin:auto">Pilih percakapan untuk melihat pesan.</div>';
    if (S.loadingMsgs) return '<div class="cs-empty">Memuat pesan...</div>';
    if (!S.messages.length) return '<div class="cs-empty">Belum ada pesan.</div>';
    var html = '';
    for (var i=0; i<S.messages.length; i++){
      var m = S.messages[i];
      var fromShop = m.from_shop_id != null ? String(m.from_shop_id) : '';
      var fromId = m.from_id != null ? String(m.from_id) : '';
      var sellerId = String(S.shopId || '');
      var isSeller = false;
      if (fromShop) isSeller = fromShop === sellerId;
      else if (fromId) isSeller = fromId === sellerId;
      var inc = !isSeller;
      var cls = inc ? 'inc' : (m.source === 'ai' || m.by_ai ? 'ai' : 'out');
      var text = extractMessageText(m);
      var ts = m.created_timestamp || m.timestamp || m.created_at;
      html += '<div class="cs-msg '+cls+'">'+esc(text)+'<div class="cs-mt">'+esc(fmtTime(ts))+(cls==='ai'?' • AI':'')+'</div></div>';
    }
    return html;
  }

  function renderChatHeader(){
    if (!S.activeConvId) return '<div class="cs-chat-hdr"><div style="color:#888">Tidak ada chat dipilih</div></div>';
    var conv = null;
    for (var i=0; i<S.conversations.length; i++){ if ((S.conversations[i].conversation_id||S.conversations[i].id) === S.activeConvId){ conv = S.conversations[i]; break; } }
    var name = (conv && (conv.to_name || conv.username || conv.name)) || S.activeConvId;
    var avatar = conv && (conv.to_avatar || conv.avatar);
    return '<div class="cs-chat-hdr">'+
      '<div class="cs-ava">'+(avatar?'<img src="'+esc(avatar)+'" style="width:100%;height:100%;object-fit:cover;border-radius:50%" onerror="this.replaceWith(document.createTextNode(\''+initials(name)+'\'))">':esc(initials(name)))+'</div>'+
      '<div style="flex:1"><div style="font:bold 13px Arial">'+esc(name)+'</div><div style="font:10px Arial;color:#888">ID: '+esc(S.activeConvId)+'</div></div>'+
      '<button class="cs-btn sm y" id="cs-draft-btn">Minta Draft AI</button>'+
    '</div>';
  }

  function renderComposer(){
    if (!S.activeConvId) return '';
    var draftHtml = '';
    if (S.aiDraftCurrent){
      draftHtml = '<div class="cs-draft"><b>Draft AI</b> (mode: '+esc(S.mode)+')<div>'+esc(S.aiDraftCurrent.text||'')+'</div>'+
        '<div class="cs-row">'+
          '<button class="cs-btn g sm" id="cs-draft-send">Kirim</button>'+
          '<button class="cs-btn y sm" id="cs-draft-edit">Edit di kotak</button>'+
          '<button class="cs-btn r sm" id="cs-draft-reject">Tolak</button>'+
        '</div></div>';
    }
    return '<div class="cs-comp">'+
      draftHtml+
      '<div class="cs-row"><textarea id="cs-input" placeholder="Tulis balasan..."></textarea></div>'+
      '<div class="cs-row">'+
        '<button class="cs-btn" id="cs-send">Kirim</button>'+
        '<button class="cs-btn y sm" id="cs-qr-pick">Balasan Cepat</button>'+
        '<span class="lbl" style="margin-left:auto">Tekan Ctrl+Enter untuk kirim</span>'+
      '</div>'+
    '</div>';
  }

  function bindMiddle(root){
    var $ = function(s){ return root.querySelector(s); };
    var btnSend = $('#cs-send');
    if (btnSend){
      btnSend.onclick = function(){ sendReply(); };
    }
    var ta = $('#cs-input');
    if (ta){
      ta.addEventListener('keydown', function(e){ if ((e.ctrlKey||e.metaKey) && e.key === 'Enter') sendReply(); });
    }
    var qb = $('#cs-qr-pick');
    if (qb){
      qb.onclick = function(){
        S.sideTab = 'quick'; LS.set('sideTab','quick'); renderSide();
        toast('Pilih balasan cepat di panel kanan','ok');
      };
    }
    var db = $('#cs-draft-btn');
    if (db){
      db.onclick = function(){ requestDraft(); };
    }
    if (S.aiDraftCurrent){
      var dSend = $('#cs-draft-send');
      if (dSend) dSend.onclick = function(){ approveDraft(); };
      var dEdit = $('#cs-draft-edit');
      if (dEdit) dEdit.onclick = function(){ var t = $('#cs-input'); if(t){ t.value = S.aiDraftCurrent.text || ''; t.focus(); } S.aiDraftCurrent = null; renderMiddleOnly(); };
      var dRej = $('#cs-draft-reject');
      if (dRej) dRej.onclick = function(){ S.aiDraftCurrent = null; renderMiddleOnly(); };
    }
  }

  /* ---------- 12. Side panel (tab pesanan/produk/qr/knowledge/ai/lab) ---------- */
  function renderSideTabs(){
    var tabs = [
      ['orders','Pesanan'],
      ['products','Produk'],
      ['quick','Balasan Cepat'],
      ['knowledge','Pusat Info'],
      ['ai','Mode AI'],
      ['lab','Lab AI']
    ];
    var html = '<div class="cs-tabbar">';
    for (var i=0; i<tabs.length; i++){
      html += '<button data-tab="'+tabs[i][0]+'" class="'+(S.sideTab===tabs[i][0]?'act':'')+'">'+tabs[i][1]+'</button>';
    }
    html += '</div>';
    return html;
  }

  function renderSideContent(){
    switch(S.sideTab){
      case 'orders': return renderOrders();
      case 'products': return renderProducts();
      case 'quick': return renderQuick();
      case 'knowledge': return renderKnowledge();
      case 'ai': return renderAIPanel();
      case 'lab': return renderLab();
      default: return '';
    }
  }

  function renderOrders(){
    if (!S.orders.length) return '<div class="cs-empty">Belum ada data pesanan.<br><span class="cs-link" id="cs-ord-refresh">Muat ulang</span></div>';
    var html = '';
    for (var i=0; i<Math.min(S.orders.length, 80); i++){
      var o = S.orders[i];
      var sn = o.order_sn || o.order_id || '-';
      var status = o.order_status || o.status || '';
      var total = o.total_amount || o.price || '';
      html += '<div class="cs-ord"><b>'+esc(sn)+'</b>'+
        '<div style="color:#555">Status: '+esc(status)+' &middot; Total: '+esc(total)+'</div>'+
      '</div>';
    }
    return html;
  }

  function renderProducts(){
    if (!S.products.length) return '<div class="cs-empty">Belum ada data produk.</div>';
    var html = '';
    for (var i=0; i<Math.min(S.products.length, 80); i++){
      var p = S.products[i];
      var name = p.item_name || p.name || p.title || ('Item '+p.item_id);
      var price = p.price || p.current_price || '';
      var stock = p.stock || p.normal_stock || '';
      html += '<div class="cs-prd"><b>'+esc(name)+'</b><div style="color:#555">Harga: '+esc(price)+' &middot; Stok: '+esc(stock)+'</div></div>';
    }
    return html;
  }

  function renderQuick(){
    var html = '<div class="cs-form">'+
      '<b style="font:bold 11px Arial;color:#0D2E5A">Tambah Balasan Cepat</b>'+
      '<input id="qr-title" placeholder="Judul (opsional)">'+
      '<input id="qr-group" placeholder="Grup (opsional)">'+
      '<textarea id="qr-content" placeholder="Isi balasan"></textarea>'+
      '<button class="cs-btn sm g" id="qr-save">Simpan</button>'+
    '</div>';
    if (!S.quickReplies.length) html += '<div class="cs-empty">Belum ada balasan cepat.</div>';
    var byGroup = {};
    for (var i=0; i<S.quickReplies.length; i++){
      var q = S.quickReplies[i];
      var g = q.group_name || 'Umum';
      if (!byGroup[g]) byGroup[g] = [];
      byGroup[g].push(q);
    }
    for (var g in byGroup){
      html += '<h4>'+esc(g)+'</h4>';
      for (var j=0; j<byGroup[g].length; j++){
        var q2 = byGroup[g][j];
        html += '<div class="cs-qr-item" data-id="'+esc(q2.id)+'" data-content="'+esc(q2.content||'')+'">'+
          (q2.title ? '<b>'+esc(q2.title)+'</b>' : '')+
          esc((q2.content||'').slice(0,120))+
          '<div class="cs-row"><span class="cs-link qr-use" data-id="'+esc(q2.id)+'">Gunakan</span><span class="cs-link qr-del" data-id="'+esc(q2.id)+'" style="color:#C62828">Hapus</span></div>'+
        '</div>';
      }
    }
    return html;
  }

  function renderKnowledge(){
    var catOpt = '';
    for (var i=0; i<KNOWLEDGE_CATEGORIES.length; i++) catOpt += '<option>'+esc(KNOWLEDGE_CATEGORIES[i])+'</option>';
    var html = '<div class="cs-form">'+
      '<b style="font:bold 11px Arial;color:#0D2E5A">Tambah Pengetahuan</b>'+
      '<select id="kw-cat">'+catOpt+'</select>'+
      '<input id="kw-keyword" placeholder="Kata kunci / pertanyaan">'+
      '<textarea id="kw-template" placeholder="Jawaban / template"></textarea>'+
      '<button class="cs-btn sm g" id="kw-save">Simpan</button>'+
    '</div>';
    if (!S.knowledge.length) return html + '<div class="cs-empty">Belum ada pengetahuan.</div>';
    var byCat = {};
    for (var k=0; k<S.knowledge.length; k++){
      var it = S.knowledge[k];
      var c = it.group_name || 'General';
      if (!byCat[c]) byCat[c] = [];
      byCat[c].push(it);
    }
    for (var c in byCat){
      html += '<h4>'+esc(c)+'</h4>';
      for (var kk=0; kk<byCat[c].length; kk++){
        var it2 = byCat[c][kk];
        html += '<div class="cs-kw-item"><b>'+esc(it2.keyword||'')+'</b>'+
          esc((it2.template||'').slice(0,160))+
          '<div class="cs-row"><span class="cs-link kw-use" data-id="'+esc(it2.id)+'" data-tpl="'+esc(it2.template||'')+'">Gunakan</span><span class="cs-link kw-del" data-id="'+esc(it2.id)+'" style="color:#C62828">Hapus</span></div>'+
        '</div>';
      }
    }
    return html;
  }

  function renderAIPanel(){
    var s = S.aiSettings || {};
    var cred = S.aiCredStatus || {};
    var credPill = cred.configured ? '<span class="cs-pill ok">Konfigurasi OK</span>' : '<span class="cs-pill err">Belum di-set</span>';
    var presets = [
      ['default','Default (ramah, tegas)'],
      ['friendly','Ramah & cepat'],
      ['formal','Formal / resmi'],
      ['short','Singkat & padat'],
      ['detailed','Detail & informatif']
    ];
    var presetOpt = '';
    for (var i=0; i<presets.length; i++){
      presetOpt += '<option value="'+presets[i][0]+'"'+(s.prompt_preset===presets[i][0]?' selected':'')+'>'+presets[i][1]+'</option>';
    }
    var providers = ['openai','anthropic','gemini'];
    var provOpt = '';
    for (var j=0; j<providers.length; j++){
      provOpt += '<option value="'+providers[j]+'"'+(s.provider===providers[j]?' selected':'')+'>'+providers[j]+'</option>';
    }

    return (
      '<div class="cs-mode-box">'+
        '<b style="font:bold 11px Arial;color:#0D2E5A">Status AI</b>'+
        '<div>AI aktif: '+(s.ai_enabled?'<span class="cs-pill ok">Ya</span>':'<span class="cs-pill">Tidak</span>')+'</div>'+
        '<div>Butuh approval: '+(s.require_approval?'<span class="cs-pill warn">Ya</span>':'<span class="cs-pill">Tidak</span>')+'</div>'+
        '<div>Provider: '+esc(s.provider||'-')+' '+credPill+'</div>'+
      '</div>'+
      '<div class="cs-form">'+
        '<b style="font:bold 11px Arial;color:#0D2E5A">Pengaturan AI</b>'+
        '<label style="font:11px Arial"><input type="checkbox" id="ai-enabled"'+(s.ai_enabled?' checked':'')+'> AI Aktif</label>'+
        '<label style="font:11px Arial"><input type="checkbox" id="ai-approval"'+(s.require_approval?' checked':'')+'> Butuh approval sebelum kirim</label>'+
        '<select id="ai-provider">'+provOpt+'</select>'+
        '<select id="ai-preset">'+presetOpt+'</select>'+
        '<button class="cs-btn sm g" id="ai-save">Simpan Setting</button>'+
      '</div>'+
      '<div class="cs-form">'+
        '<b style="font:bold 11px Arial;color:#0D2E5A">Kredensial AI</b>'+
        '<div style="font:11px Arial;color:#666">Key tidak ditampilkan ulang. Kirim ulang jika ingin ganti.</div>'+
        '<select id="ai-cred-prov">'+provOpt.replace(/selected/g,'')+'</select>'+
        '<input id="ai-cred-key" placeholder="API key" type="password">'+
        '<input id="ai-cred-model" placeholder="Model (cth: gpt-4o-mini)" value="gpt-4o-mini">'+
        '<button class="cs-btn sm" id="ai-cred-save">Simpan Kredensial</button>'+
      '</div>'
    );
  }

  function renderLab(){
    var html = '<div class="cs-form">'+
      '<b style="font:bold 11px Arial;color:#0D2E5A">Tambah Sampel Pembelajaran</b>'+
      '<textarea id="lab-cust" placeholder="Pesan pelanggan (input)"></textarea>'+
      '<textarea id="lab-sell" placeholder="Balasan ideal penjual (output)"></textarea>'+
      '<button class="cs-btn sm g" id="lab-save">Simpan Sampel</button>'+
    '</div>';
    html += '<div class="cs-form">'+
      '<b style="font:bold 11px Arial;color:#0D2E5A">Uji Draft AI</b>'+
      '<textarea id="lab-test" placeholder="Pesan pelanggan untuk diuji"></textarea>'+
      '<button class="cs-btn sm" id="lab-test-btn">Uji</button>'+
      '<div id="lab-test-out" style="font:11px Arial;color:#333;white-space:pre-wrap"></div>'+
    '</div>';
    if (!S.aiLearning.length) return html + '<div class="cs-empty">Belum ada sampel.</div>';
    html += '<h4>Sampel Terbaru</h4>';
    for (var i=0; i<S.aiLearning.length; i++){
      var l = S.aiLearning[i];
      html += '<div class="cs-learn-item"><div style="color:#555">CUST: '+esc((l.customer_text||'').slice(0,120))+'</div><div>SELLER: '+esc((l.seller_text||'').slice(0,160))+'</div></div>';
    }
    return html;
  }

  function bindSide(root){
    var $ = function(s){ return root.querySelector(s); };

    /* Tab switch */
    var btns = root.querySelectorAll('.cs-tabbar button');
    for (var i=0; i<btns.length; i++){
      btns[i].onclick = (function(tab){ return function(){ S.sideTab = tab; LS.set('sideTab', tab); renderSide(); loadSideData(); }; })(btns[i].getAttribute('data-tab'));
    }

    /* Quick reply actions */
    var qrUses = root.querySelectorAll('.qr-use');
    for (var a=0; a<qrUses.length; a++){
      qrUses[a].onclick = (function(id){ return function(){ useQuickReply(id); }; })(qrUses[a].getAttribute('data-id'));
    }
    var qrDels = root.querySelectorAll('.qr-del');
    for (var b=0; b<qrDels.length; b++){
      qrDels[b].onclick = (function(id){ return function(){
        if(!confirm('Hapus balasan ini?'))return;
        API.quickDel(id).then(function(){ toast('Dihapus','ok'); loadQuickReplies(); }).catch(function(e){ toast(e.message,'err'); });
      }; })(qrDels[b].getAttribute('data-id'));
    }
    var qrSave = $('#qr-save');
    if (qrSave) qrSave.onclick = function(){
      var content = $('#qr-content').value.trim();
      if (!content) return toast('Isi balasan kosong','err');
      API.quickAdd({ title: $('#qr-title').value.trim(), content: content, group_name: $('#qr-group').value.trim() }).then(function(){ toast('Tersimpan','ok'); loadQuickReplies(); }).catch(function(e){ toast(e.message,'err'); });
    };

    /* Knowledge actions */
    var kwUses = root.querySelectorAll('.kw-use');
    for (var c=0; c<kwUses.length; c++){
      kwUses[c].onclick = (function(tpl){ return function(){ insertToInput(tpl); }; })(kwUses[c].getAttribute('data-tpl'));
    }
    var kwDels = root.querySelectorAll('.kw-del');
    for (var d=0; d<kwDels.length; d++){
      kwDels[d].onclick = (function(id){ return function(){
        if(!confirm('Hapus pengetahuan ini?'))return;
        API.knowDel(id).then(function(){ toast('Dihapus','ok'); loadKnowledge(); }).catch(function(e){ toast(e.message,'err'); });
      }; })(kwDels[d].getAttribute('data-id'));
    }
    var kwSave = $('#kw-save');
    if (kwSave) kwSave.onclick = function(){
      var kw = $('#kw-keyword').value.trim();
      var tpl = $('#kw-template').value.trim();
      var cat = $('#kw-cat').value;
      if (!kw || !tpl) return toast('Keyword & template wajib','err');
      API.knowAdd({ keyword: kw, template: tpl, group_name: cat }).then(function(){ toast('Tersimpan','ok'); loadKnowledge(); }).catch(function(e){ toast(e.message,'err'); });
    };

    /* AI settings */
    var aiSave = $('#ai-save');
    if (aiSave) aiSave.onclick = function(){
      var payload = {
        ai_enabled: $('#ai-enabled').checked,
        require_approval: $('#ai-approval').checked,
        provider: $('#ai-provider').value,
        prompt_preset: $('#ai-preset').value
      };
      API.aiSettingsSet(payload).then(function(r){ toast('Setting AI disimpan','ok'); S.aiSettings = (r && (r.settings||r)) || payload; renderSide(); }).catch(function(e){ toast(e.message,'err'); });
    };
    var credSave = $('#ai-cred-save');
    if (credSave) credSave.onclick = function(){
      var key = $('#ai-cred-key').value;
      if (!key) return toast('API key kosong','err');
      API.aiCredSet({ provider: $('#ai-cred-prov').value, api_key: key, model: $('#ai-cred-model').value.trim() }).then(function(){ toast('Kredensial disimpan','ok'); $('#ai-cred-key').value=''; loadAICredStatus(); }).catch(function(e){ toast(e.message,'err'); });
    };

    /* Lab */
    var labSave = $('#lab-save');
    if (labSave) labSave.onclick = function(){
      var cust = $('#lab-cust').value.trim();
      var sell = $('#lab-sell').value.trim();
      if (!cust || !sell) return toast('CUST & SELLER wajib','err');
      API.aiLearnAdd({ customer_text: cust, seller_text: sell }).then(function(){ toast('Sampel tersimpan','ok'); $('#lab-cust').value=''; $('#lab-sell').value=''; loadLearning(); }).catch(function(e){ toast(e.message,'err'); });
    };
    var labTest = $('#lab-test-btn');
    if (labTest) labTest.onclick = function(){
      var msg = $('#lab-test').value.trim();
      if (!msg) return;
      this.disabled = true; this.textContent = 'Menguji...';
      api('/api/chat/ai/test-draft', { body: { shop_id: S.shopId, customer_text: msg } }).then(function(r){
        $('#lab-test-out').textContent = r && (r.text || r.draft || JSON.stringify(r)) || '(kosong)';
      }).catch(function(e){ $('#lab-test-out').textContent = 'Error: '+e.message; })
      .then(function(){ var b=$('#lab-test-btn'); if(b){ b.disabled=false; b.textContent='Uji'; } });
    };

    /* Orders refresh */
    var or = $('#cs-ord-refresh');
    if (or) or.onclick = function(){ loadOrders(); };
  }

  /* ---------- 13. Main render ---------- */
  function render(){
    injectCSS();
    ensureTabRegistered();
    var mount = document.getElementById('V-csauto');
    if (!mount) return;
    mount.innerHTML = (
      '<div class="cs-wrap">'+
        renderTop()+
        '<div class="cs-main">'+
          '<div class="cs-col cs-col-l">'+
            '<div class="cs-col-head">Daftar Chat <span class="cs-pill" id="cs-cnt">'+S.conversations.length+'</span></div>'+
            '<div class="cs-col-body cs-list" id="cs-list">'+renderConvList()+'</div>'+
          '</div>'+
          '<div class="cs-col cs-col-m">'+
            renderChatHeader()+
            '<div class="cs-msgs" id="cs-msgs">'+renderMessages()+'</div>'+
            renderComposer()+
          '</div>'+
          '<div class="cs-col cs-col-r">'+
            renderSideTabs()+
            '<div class="cs-side-body" id="cs-side">'+renderSideContent()+'</div>'+
          '</div>'+
        '</div>'+
      '</div>'
    );
    bindTop(mount);
    bindConvList(mount);
    bindMiddle(mount);
    bindSide(mount);
    /* Auto-scroll messages ke bawah */
    var msgBox = mount.querySelector('#cs-msgs');
    if (msgBox) msgBox.scrollTop = msgBox.scrollHeight;
  }

  function renderMiddleOnly(){
    var mount = document.getElementById('V-csauto');
    if (!mount) return render();
    var mid = mount.querySelector('.cs-col-m');
    if (!mid) return render();
    mid.innerHTML = renderChatHeader() + '<div class="cs-msgs" id="cs-msgs">'+renderMessages()+'</div>' + renderComposer();
    bindMiddle(mount);
    var msgBox = mount.querySelector('#cs-msgs');
    if (msgBox) msgBox.scrollTop = msgBox.scrollHeight;
  }

  function renderListOnly(){
    var mount = document.getElementById('V-csauto');
    if (!mount) return;
    var list = mount.querySelector('#cs-list');
    if (list) list.innerHTML = renderConvList();
    var cnt = mount.querySelector('#cs-cnt');
    if (cnt) cnt.textContent = S.conversations.length;
    bindConvList(mount);
  }

  function renderSide(){
    var mount = document.getElementById('V-csauto');
    if (!mount) return;
    var col = mount.querySelector('.cs-col-r');
    if (!col) return render();
    col.innerHTML = renderSideTabs() + '<div class="cs-side-body" id="cs-side">'+renderSideContent()+'</div>';
    bindSide(mount);
  }

  /* ---------- 14. Actions ---------- */
  function openConv(id){
    S.activeConvId = id;
    S.aiDraftCurrent = null;
    S.messages = [];
    renderListOnly();
    renderMiddleOnly();
    loadMessages(id);
    /* Mark read */
    API.markRead(id).catch(function(){});
  }

  function sendReply(){
    var ta = document.querySelector('#V-csauto #cs-input');
    if (!ta) return;
    var text = (ta.value||'').trim();
    if (!text) return toast('Pesan kosong','err');
    if (!S.activeConvId) return toast('Pilih chat dulu','err');
    var btn = document.querySelector('#V-csauto #cs-send');
    if (btn) btn.disabled = true;
    API.send(S.activeConvId, text).then(function(){
      ta.value = '';
      S.aiDraftCurrent = null;
      loadMessages(S.activeConvId);
      toast('Terkirim','ok');
    }).catch(function(e){ toast(e.message,'err'); })
    .then(function(){ if (btn) btn.disabled = false; });
  }

  function requestDraft(){
    if (!S.activeConvId) return toast('Pilih chat dulu','err');
    var btn = document.querySelector('#V-csauto #cs-draft-btn');
    if (btn) { btn.disabled = true; btn.textContent = 'Memikirkan...'; }
    var hist = S.messages.slice(-10).map(function(m){
      var text = (m.content && (m.content.text||m.content.item_name)) || m.message || m.text || '';
      var role = m.from_shop_id ? 'seller' : 'customer';
      return { role: role, content: typeof text === 'string' ? text : JSON.stringify(text) };
    });
    API.aiDraft(S.activeConvId, hist).then(function(r){
      var text = r && (r.text || r.draft || (r.draft_obj && r.draft_obj.text)) || '';
      var id = r && (r.draft_id || (r.draft_obj && r.draft_obj.id)) || null;
      if (!text) throw new Error('Draft kosong');
      S.aiDraftCurrent = { id: id, text: text };
      renderMiddleOnly();
    }).catch(function(e){ toast('Draft gagal: '+e.message,'err'); })
    .then(function(){ var b=document.querySelector('#V-csauto #cs-draft-btn'); if(b){ b.disabled=false; b.textContent='Minta Draft AI'; } });
  }

  function approveDraft(){
    if (!S.activeConvId || !S.aiDraftCurrent) return;
    var d = S.aiDraftCurrent;
    API.aiApprove(S.activeConvId, d.id, d.text).then(function(){
      S.aiDraftCurrent = null;
      toast('Terkirim (via AI)','ok');
      loadMessages(S.activeConvId);
    }).catch(function(e){
      /* Fallback: pakai send biasa kalau approve endpoint gagal */
      API.send(S.activeConvId, d.text).then(function(){ S.aiDraftCurrent = null; toast('Terkirim','ok'); loadMessages(S.activeConvId); }).catch(function(e2){ toast(e2.message,'err'); });
    });
  }

  function useQuickReply(id){
    var item = null;
    for (var i=0; i<S.quickReplies.length; i++){ if (String(S.quickReplies[i].id) === String(id)){ item = S.quickReplies[i]; break; } }
    if (!item) return;
    insertToInput(item.content || '');
  }

  function insertToInput(text){
    if (!S.activeConvId) return toast('Pilih chat dulu','err');
    var ta = document.querySelector('#V-csauto #cs-input');
    if (!ta) return;
    ta.value = (ta.value ? ta.value + '\n' : '') + text;
    ta.focus();
  }

  /* ---------- 15. Loaders ---------- */
  function loadConversations(){
    S.loadingChats = true;
    renderListOnly();
    return API.conversations().then(function(r){
      S.lastConvSig = (r && r.last_conv_sig) || S.lastConvSig;
      S.lastMsgSig = (r && r.last_msg_sig) || S.lastMsgSig;
      var list = pickList(r);
      S.conversations = (Array.isArray(list) ? list : []).sort(function(a,b){
        var aTs = toTs(a.last_message_timestamp || a.last_message_time || a.updated_at || a.last_message_timestamp_raw);
        var bTs = toTs(b.last_message_timestamp || b.last_message_time || b.updated_at || b.last_message_timestamp_raw);
        return bTs - aTs;
      });
      if (S.activeConvId && !S.conversations.some(function(c){ return String(c.conversation_id||c.id)===String(S.activeConvId); })) {
        S.activeConvId = null;
        S.messages = [];
      }
      S.loadingChats = false;
      renderListOnly();
    }).catch(function(e){
      S.loadingChats = false;
      S.conversations = [];
      renderListOnly();
      toast('Gagal ambil chat: '+e.message,'err');
    });
  }

  function loadMessages(cid){
    if (!cid) return Promise.resolve();
    S.loadingMsgs = true;
    var mount = document.getElementById('V-csauto');
    var box = mount && mount.querySelector('#cs-msgs');
    if (box) box.innerHTML = '<div class="cs-empty">Memuat pesan...</div>';
    return API.messages(cid).then(function(r){
      S.lastMsgSig = (r && r.last_msg_sig) || S.lastMsgSig;
      var list = pickList(r);
      S.messages = Array.isArray(list) ? list : [];
      S.loadingMsgs = false;
      renderMiddleOnly();
    }).catch(function(e){
      S.loadingMsgs = false;
      renderMiddleOnly();
      toast('Gagal ambil pesan: '+e.message,'err');
    });
  }

  function loadOrders(){ return API.orders().then(function(r){ S.orders = pickList(r); if (S.sideTab==='orders') renderSide(); }).catch(function(){}); }
  function loadProducts(){ return API.products().then(function(r){ S.products = pickList(r); if (S.sideTab==='products') renderSide(); }).catch(function(){}); }
  function loadQuickReplies(){ return API.quickList().then(function(r){ S.quickReplies = pickList(r); if (S.sideTab==='quick') renderSide(); }).catch(function(){}); }
  function loadKnowledge(){ return API.knowList().then(function(r){ S.knowledge = pickList(r); if (S.sideTab==='knowledge') renderSide(); }).catch(function(){}); }
  function loadAISettings(){ return API.aiSettingsGet().then(function(r){ S.aiSettings = (r && (r.settings||r)) || {}; /* Sync mode select */ syncModeFromSettings(); if (S.sideTab==='ai') renderSide(); }).catch(function(){}); }
  function loadAICredStatus(){ return API.aiCredStatus().then(function(r){ S.aiCredStatus = r || {}; if (S.sideTab==='ai') renderSide(); }).catch(function(){}); }
  function loadLearning(){ return API.aiLearnList().then(function(r){ S.aiLearning = pickList(r); if (S.sideTab==='lab') renderSide(); }).catch(function(){}); }

  function syncModeFromSettings(){
    if (!S.aiSettings) return;
    var newMode = 'manual';
    if (S.aiSettings.ai_enabled){
      newMode = S.aiSettings.require_approval ? 'approval' : 'auto';
    }
    if (newMode !== S.mode){
      S.mode = newMode; LS.set('mode', newMode);
      var sel = document.querySelector('#V-csauto #cs-mode');
      if (sel) sel.value = newMode;
    }
  }

  function loadSideData(){
    switch(S.sideTab){
      case 'orders': return loadOrders();
      case 'products': return loadProducts();
      case 'quick': return loadQuickReplies();
      case 'knowledge': return loadKnowledge();
      case 'ai': loadAISettings(); return loadAICredStatus();
      case 'lab': return loadLearning();
    }
  }

  function loadAll(){
    render();
    loadConversations();
    loadAISettings();
    loadAICredStatus();
    loadSideData();
  }

  /* ---------- 16. Realtime polling ---------- */
  function startPolling(){
    stopPolling();
    var tick = function(){
      if (!S.realtime) return;
      API.realtimePoll().then(function(r){
        if (!r) return;
        var convChanged = r.conv_changed || (r.last_conv_sig && r.last_conv_sig !== S.lastConvSig);
        var msgChanged = r.msg_changed || (r.last_msg_sig && r.last_msg_sig !== S.lastMsgSig);
        if (r.last_conv_sig) S.lastConvSig = r.last_conv_sig;
        if (r.last_msg_sig) S.lastMsgSig = r.last_msg_sig;
        if (convChanged) loadConversations();
        if (msgChanged && S.activeConvId) loadMessages(S.activeConvId);
      }).catch(function(){});
    };
    S.pollTimer = setInterval(tick, 3000);
  }
  function stopPolling(){
    if (S.pollTimer){ clearInterval(S.pollTimer); S.pollTimer = null; }
  }

  /* ---------- 17. Tab integration: hook buildTabBar & _navTo ---------- */
  function activateCSAuto(){
    ensureView();
    hideOtherViews();
    window._activeTab = 'csauto';
    try { if (typeof window.buildTabBar === 'function') window.buildTabBar(); } catch(e){}
    ensureCSAutoTabButton();
    var host = document.getElementById('V-csauto');
    if (!host) return;
    if (!host.__csautoMounted){
      loadAll();
      host.__csautoMounted = true;
      if (S.realtime) startPolling();
    } else {
      render();
      loadConversations();
      loadSideData();
    }
  }

  function hookNavigation(){
    if (typeof window.buildTabBar === 'function' && !window.buildTabBar.__csautoWrapped){
      var oldBuild = window.buildTabBar;
      window.buildTabBar = function(){
        var r = oldBuild.apply(this, arguments);
        try { ensureCSAutoTabButton(); } catch(e){}
        return r;
      };
      window.buildTabBar.__csautoWrapped = true;
    }
    if (typeof window._navTo === 'function' && !window._navTo.__csautoWrapped){
      var oldNav = window._navTo;
      window._navTo = function(tabId){
        if (tabId === 'csauto'){ activateCSAuto(); return; }
        if (window._activeTab === 'csauto') stopPolling();
        return oldNav.apply(this, arguments);
      };
      window._navTo.__csautoWrapped = true;
    }
    if (typeof window.SW === 'function' && !window.SW.__csautoWrapped){
      var oldSW = window.SW;
      window.SW = function(tab){
        if (tab === 'csauto'){ activateCSAuto(); return; }
        if (window._activeTab === 'csauto') stopPolling();
        return oldSW.apply(this, arguments);
      };
      window.SW.__csautoWrapped = true;
    }
  }

  var tries = 0;
  function install(){
    try {
      ensureView();
      ensureCSAutoTabButton();
      hookNavigation();
    } catch(e){}
    tries++;
    if (tries < 40) setTimeout(install, 300);
  }
  install();

  if (window.MutationObserver){
    try {
      var obs = new MutationObserver(function(){
        try { ensureCSAutoTabButton(); } catch(e){}
      });
      var tryObserve = function(){
        var el = document.getElementById('TABS');
        if (el){ obs.observe(el, { childList: true }); return true; }
        return false;
      };
      if (!tryObserve()){
        var n = 0;
        var tid = setInterval(function(){
          if (tryObserve() || ++n > 40) clearInterval(tid);
        }, 300);
      }
    } catch(e){}
  }

  window.CS_AUTO = { state: S, api: API, render: render, loadAll: loadAll, activate: activateCSAuto, version: 'v2-backend' };

  if (window.console && console.log){
    console.log('%c[CS AUTO v2] Shopee backend active','background:#0D2E5A;color:#FFD700;padding:2px 6px;border-radius:3px');
  }
})();
