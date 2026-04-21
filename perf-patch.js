/* ==============================================================
   AJW PERFORMANCE PATCH v2 (safe)
   Perbaikan v2: hapus hook yang mengganggu navigasi tab
   - Hapus click-guard capture-phase (penyebab tab lain tak bisa diklik)
   - Hapus content-visibility pada .body>div[id^=V-] (tab jadi aneh)
   - Hapus auto-debounce input (terlalu agresif)
   - Pertahankan optimasi CSS aman + chat append-render + scroll pause
   ============================================================== */
(function(){
  'use strict';
  if (window.__AJW_PERF_PATCHED_V2) return;
  window.__AJW_PERF_PATCHED_V2 = true;

  /* Bersihkan CSS patch lama kalau ada */
  var old = document.getElementById('AJW-PERF-CSS');
  if (old && old.parentNode) old.parentNode.removeChild(old);

  /* ---------- 1. Inject performance CSS (aman) ---------- */
  var css = [
    /* Hilangkan delay 300ms tap di HP */
    'button,.tab,.btnp,.btns,.btna,.btnsm,.pbtn,.kbtn,.sb,.adm-sub,.dash-card,input,select,textarea,a,[onclick]{touch-action:manipulation;-webkit-tap-highlight-color:transparent}',
    /* Momentum scroll iOS di area scrollable */
    '#AI-CHAT-MSGS,.preview-panel,.tabs{-webkit-overflow-scrolling:touch;overscroll-behavior:contain}',
    /* Containment ringan - hanya pada element kecil, BUKAN tab container */
    '.card,.dash-card,.swrap,.irow{contain:layout style}',
    /* GPU compositing untuk elemen sticky yang sering re-paint */
    '.toast,.topbar,.tabs{transform:translateZ(0);backface-visibility:hidden}',
    /* Matikan hover effect di perangkat touch */
    '@media(hover:none){.btnp:hover,.btna:hover,.btns:hover,.btnsm:hover,.pbtn:hover,.kbtn:hover,.sb:hover,.dash-card:hover{opacity:1;transform:none}}',
    /* Pause transisi saat user scroll */
    'body.is-scrolling .card,body.is-scrolling .dash-card,body.is-scrolling .btna,body.is-scrolling .btnp{transition:none!important}',
    /* Bubble chat: containment supaya reflow tidak menyebar */
    '#AI-CHAT-MSGS>div{contain:layout style}',
    /* Cegah iOS auto-zoom ke input saat focus (yang bikin reflow) */
    '@media(max-width:600px){input.fi,select.fi,textarea.fi{font-size:16px}}'
  ].join('\n');

  var st = document.createElement('style');
  st.id = 'AJW-PERF-CSS';
  st.textContent = css;
  (document.head || document.documentElement).appendChild(st);

  /* ---------- 2. Scroll-performance: pause transisi saat scroll ---------- */
  var scrollTimer = null;
  var scrolling = false;
  function onScroll(){
    if (!scrolling){
      document.body.classList.add('is-scrolling');
      scrolling = true;
    }
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(function(){
      document.body.classList.remove('is-scrolling');
      scrolling = false;
    }, 140);
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- 3. Optimasi render chat AI: append-only ---------- */
  function patchChatRender(){
    if (typeof window.renderAIChatMessages !== 'function') return false;
    if (window.renderAIChatMessages.__ajwPatched) return true;
    var original = window.renderAIChatMessages;
    var lastLen = 0;
    var lastEl = null;

    function fastRender(){
      try {
        var el = document.getElementById('AI-CHAT-MSGS');
        if (!el) return;
        var hist = window.aiChatHistory || [];

        /* Container baru atau history dibersihkan -> fallback ke original */
        if (el !== lastEl || hist.length < lastLen){
          lastEl = el;
          lastLen = hist.length;
          return original.apply(this, arguments);
        }

        /* Tidak ada pesan baru */
        if (hist.length === lastLen){
          el.scrollTop = el.scrollHeight;
          return;
        }

        /* Hapus placeholder "Mulai percakapan" sekali saja */
        if (lastLen === 0 && /Mulai percakapan/i.test(el.textContent||'')){
          el.innerHTML = '';
        }

        var frag = document.createDocumentFragment();
        for (var i = lastLen; i < hist.length; i++){
          var msg = hist[i];
          var wrap = document.createElement('div');
          if (msg.role === 'user'){
            wrap.style.cssText = 'display:flex;justify-content:flex-end';
            var bubble = document.createElement('div');
            bubble.style.cssText = 'background:#1565C0;color:#fff;padding:9px 13px;border-radius:13px 13px 2px 13px;max-width:80%;font-size:12px;line-height:1.5;white-space:pre-wrap;word-wrap:break-word';
            bubble.textContent = msg.content || '';
            wrap.appendChild(bubble);
          } else {
            wrap.style.cssText = 'display:flex;gap:8px';
            var avatar = document.createElement('div');
            avatar.style.cssText = 'width:28px;height:28px;border-radius:50%;background:#0D2E5A;color:#fff;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:12px';
            avatar.textContent = '\ud83e\udd16';
            var bubble2 = document.createElement('div');
            bubble2.style.cssText = 'background:var(--bg2);border:1px solid var(--bd);padding:9px 13px;border-radius:2px 13px 13px 13px;max-width:82%;font-size:12px;line-height:1.6;white-space:pre-wrap;word-wrap:break-word';
            bubble2.textContent = msg.content || '';
            wrap.appendChild(avatar); wrap.appendChild(bubble2);
          }
          frag.appendChild(wrap);
        }
        el.appendChild(frag);
        lastLen = hist.length;
        requestAnimationFrame(function(){ el.scrollTop = el.scrollHeight; });
      } catch(err){
        /* Kalau ada error apapun, fallback ke original supaya tidak rusak */
        try { original.apply(this, arguments); } catch(e2){}
      }
    }
    fastRender.__ajwPatched = true;
    window.renderAIChatMessages = fastRender;
    return true;
  }

  /* Hook SW untuk re-patch setelah tab chat dibuka (karena DOM di-reset) */
  function hookSW(){
    if (typeof window.SW !== 'function') return false;
    if (window.SW.__ajwHooked) return true;
    var origSW = window.SW;
    var wrapped = function(tab){
      var r;
      try { r = origSW.apply(this, arguments); }
      catch(e){ console.error('[AJW PERF] SW error:', e); throw e; }
      if (tab === 'aichat'){
        /* Re-patch renderAIChatMessages (DOM baru dibuat ulang) */
        setTimeout(patchChatRender, 0);
      }
      return r;
    };
    wrapped.__ajwHooked = true;
    window.SW = wrapped;
    return true;
  }

  /* Loop coba-pasang patch sampai fungsi tersedia */
  var tries = 0;
  function installPatches(){
    var a = patchChatRender();
    var b = hookSW();
    tries++;
    if ((!a || !b) && tries < 40){
      setTimeout(installPatches, 250);
    }
  }
  installPatches();

  if (window.console && console.log){
    console.log('%c[AJW PERF v2] aktif','background:#0D2E5A;color:#FFD700;padding:2px 6px;border-radius:3px');
  }
})();
