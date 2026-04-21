(function () {
  if (window.__AJW_CROSS_BROWSER_PATCH__) return;
  window.__AJW_CROSS_BROWSER_PATCH__ = true;

  function safeGetCfg() {
    try {
      return typeof window.getCfg === "function" ? window.getCfg() || {} : JSON.parse(localStorage.getItem("ajw_cfg") || "{}");
    } catch (e) {
      return {};
    }
  }

  function safeSaveCfg(cfg) {
    try {
      if (typeof window.saveCfg === "function") window.saveCfg(cfg);
      else localStorage.setItem("ajw_cfg", JSON.stringify(cfg));
    } catch (e) {}
  }

  function ensureStableConfig() {
    var cfg = safeGetCfg();
    var changed = false;

    if (cfg.theme !== "light" && cfg.theme !== "dark") {
      cfg.theme = "light";
      changed = true;
    }
    if (cfg.fontMode !== "default" && cfg.fontMode !== "theme") {
      cfg.fontMode = "default";
      changed = true;
    }
    if (changed) safeSaveCfg(cfg);

    try {
      if (typeof window.applyTheme === "function") window.applyTheme();
      if (typeof window.applyFontMode === "function") window.applyFontMode();
    } catch (e) {}
  }

  function setViewportUnit() {
    var vh = (window.innerHeight || document.documentElement.clientHeight || 0) * 0.01;
    document.documentElement.style.setProperty("--app-vh", vh + "px");
  }

  function injectConsistencyStyle() {
    if (document.getElementById("AJW-CROSS-BROWSER-STYLE")) return;
    var st = document.createElement("style");
    st.id = "AJW-CROSS-BROWSER-STYLE";
    st.textContent = [
      "html{",
      "  -webkit-text-size-adjust:100%;",
      "  text-size-adjust:100%;",
      "  font-synthesis-weight:none;",
      "}",
      "*,*::before,*::after{box-sizing:border-box;}",
      "html,body{margin:0;padding:0;width:100%;}",
      "body{",
      "  min-height:calc(var(--app-vh,1vh) * 100);",
      "  text-rendering:optimizeLegibility;",
      "  -webkit-font-smoothing:antialiased;",
      "  -moz-osx-font-smoothing:grayscale;",
      "}",
      "@supports (min-height:100dvh){",
      "  body{min-height:100dvh;}",
      "}",
      "img,svg,canvas,video{max-width:100%;height:auto;display:block;}",
      "button,input,select,textarea{font:inherit;line-height:1.4;letter-spacing:normal;}",
      "button,input,select,textarea{border-radius:0;}",
      "button,input[type=button],input[type=submit]{appearance:none;-webkit-appearance:none;}",
      "input[type=checkbox],input[type=radio]{appearance:auto;-webkit-appearance:auto;}",
      ".body{",
      "  width:min(1280px, calc(100% - 24px)) !important;",
      "  max-width:1280px !important;",
      "  margin:0 auto !important;",
      "  overflow-x:clip;",
      "}",
      ".tabs{overflow-x:auto;overflow-y:hidden;}",
      ".card,.tbl td,.tbl th{overflow-wrap:anywhere;word-break:break-word;}",
      "table{border-collapse:collapse;}",
      "textarea{resize:vertical;}"
    ].join("");
    document.head.appendChild(st);
  }

  function run() {
    ensureStableConfig();
    setViewportUnit();
    injectConsistencyStyle();
  }

  run();
  window.addEventListener("resize", setViewportUnit, { passive: true });
  window.addEventListener("orientationchange", setViewportUnit, { passive: true });
})();
