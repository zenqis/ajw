var STORAGE_KEY = "affiliate-media-studio-settings";
var FOLDER_STORAGE_KEY = "affiliate-media-studio-folders";
var PROMPT_STORAGE_KEY = "affiliate-media-studio-prompts";
var BRAND_INFO_STORAGE_KEY = "affiliate-media-studio-brand-info";
var REQUEST_HISTORY_STORAGE_KEY = "affiliate-media-studio-request-history";
var DEFAULT_OPENAI_IMAGE_MODEL = "gpt-image-2";
var DEFAULT_COMPAT_IMAGE_MODEL = "nano-banana-pro";
var defaultCorePrompt = "";
var defaultBrandInfo = {
  name: "",
  logoDataUrl: "",
  productCategory: "",
  storeReputation: "",
  description: ""
};

var aplusModules = [
  "hero-shot",
  "selling-points",
  "lifestyle-scene",
  "multi-angle-view",
  "atmosphere-scene",
  "product-detail"
];

var listingTemplatePrompts = {
  premium: "Create a premium hero marketplace visual with elevated studio lighting, premium reflections, elegant typography hierarchy, space for headline overlays, and a polished high-conversion composition.",
  marketplace: "Create a clean catalog-style listing image with bright balanced lighting, sharp product clarity, trusted marketplace-safe composition, and concise commercial messaging placement.",
  affiliate: "Create an aggressive promo listing visual with bold campaign energy, discount-driven composition, conversion-focused hierarchy, urgency styling, and eye-catching product emphasis.",
  trust: "Create a bestseller trust-building listing visual with review-driven cues, premium cleanliness, reassuring composition, and subtle authority elements that feel credible and platform compliant.",
  luxury: "Create a luxury editorial fishing gear visual with dramatic mood lighting, rich material detail, refined typography space, premium brand storytelling, and upscale commercial polish.",
  detail: "Create a close-up product detail visual highlighting texture, finishing, materials, craftsmanship, and precision design details with sharp macro emphasis and premium information spacing.",
  comparison: "Create a feature comparison listing layout with clear benefit separation, structured copy hierarchy, icon-friendly negative space, and easy-to-scan product advantage storytelling.",
  lifestyle: "Create a lifestyle-driven listing visual that shows realistic product usage in a believable environment, natural aspirational mood, and product-centered storytelling for stronger buying intent."
};

var multiAngleTemplatePrompts = {
  front: "Front view product image, premium ChatGPT-style polished product photography, clean commercial lighting, refined realistic finish, finished marketplace-ready image.",
  "front-side": "Front side 45 degree product image, premium ChatGPT-style polished product photography, clean commercial lighting, refined realistic finish, finished marketplace-ready image.",
  side: "Side view product image, premium ChatGPT-style polished product photography, clean commercial lighting, refined realistic finish, finished marketplace-ready image.",
  "back-side": "Back side 135 degree product image, premium ChatGPT-style polished product photography, clean commercial lighting, refined realistic finish, finished marketplace-ready image.",
  back: "Back view product image, premium ChatGPT-style polished product photography, clean commercial lighting, refined realistic finish, finished marketplace-ready image.",
  "top-down": "Top down product image, premium ChatGPT-style polished product photography, clean commercial lighting, refined realistic finish, finished marketplace-ready image.",
  "bottom-up": "Bottom up product image, premium ChatGPT-style polished product photography, clean commercial lighting, refined realistic finish, finished marketplace-ready image.",
  "front-elevated": "Front elevated product image, premium ChatGPT-style polished product photography, clean commercial lighting, refined realistic finish, finished marketplace-ready image.",
  "front-closeup": "Front close-up product image, premium ChatGPT-style polished product photography, clean commercial lighting, refined realistic finish, finished marketplace-ready image."
};

var defaultPromptStore = {
  listing: [
    { key: "premium", title: "Premium Hero Marketplace", content: listingTemplatePrompts.premium },
    { key: "marketplace", title: "Clean Catalog Conversion", content: listingTemplatePrompts.marketplace },
    { key: "affiliate", title: "Hard Selling Promo Banner", content: listingTemplatePrompts.affiliate },
    { key: "trust", title: "Best Seller Social Proof", content: listingTemplatePrompts.trust },
    { key: "luxury", title: "Luxury Gear Editorial", content: listingTemplatePrompts.luxury },
    { key: "detail", title: "Close-Up Detail Story", content: listingTemplatePrompts.detail },
    { key: "comparison", title: "Feature Comparison Layout", content: listingTemplatePrompts.comparison },
    { key: "lifestyle", title: "Lifestyle Usage Scene", content: listingTemplatePrompts.lifestyle }
  ],
  multi_angle: [
    { key: "front", title: "Front", content: multiAngleTemplatePrompts.front },
    { key: "front-side", title: "Front Side", content: multiAngleTemplatePrompts["front-side"] },
    { key: "side", title: "Side", content: multiAngleTemplatePrompts.side },
    { key: "back-side", title: "Back Side", content: multiAngleTemplatePrompts["back-side"] },
    { key: "back", title: "Back", content: multiAngleTemplatePrompts.back },
    { key: "top-down", title: "Top Down", content: multiAngleTemplatePrompts["top-down"] },
    { key: "bottom-up", title: "Bottom Up", content: multiAngleTemplatePrompts["bottom-up"] },
    { key: "front-elevated", title: "Front Elevated", content: multiAngleTemplatePrompts["front-elevated"] },
    { key: "front-closeup", title: "Front Close-up", content: multiAngleTemplatePrompts["front-closeup"] }
  ],
  aplus: [
    { key: "premium-story", title: "Premium Brand Story", content: "Create premium A+ content with hero-led composition, strong product storytelling, clean typography hierarchy, and modular supporting sections." },
    { key: "marketplace-trust", title: "Marketplace Trust Builder", content: "Create marketplace-optimized A+ content with trust cues, strong benefit hierarchy, comparison-ready layouts, and conversion-oriented section flow." }
  ],
  bgremove: [
    { key: "clean-cutout", title: "Clean Cutout Standard", content: "Remove the background cleanly, preserve product edges, keep the subject centered, and maintain natural shadows only when useful." },
    { key: "marketplace-main", title: "Marketplace Main Image Cutout", content: "Create a sharp isolated product cutout suitable for marketplace usage, with clean edges, no remaining background clutter, and strong subject fidelity." }
  ],
  corePrompt: defaultCorePrompt
};

function normalizePromptEntry(prompt, fallback) {
  var base = fallback || {};
  return {
    key: prompt?.key || base.key || "",
    title: prompt?.title || base.title || "Untitled Prompt",
    content: prompt?.content || base.content || "",
    tag: prompt?.tag || base.tag || "",
    images: Array.isArray(prompt?.images) ? prompt.images.filter(Boolean).slice(0, 8) : (Array.isArray(base.images) ? base.images.slice(0, 8) : []),
    usageCount: Math.max(0, Number(prompt?.usageCount || base.usageCount || 0)),
    updatedAt: prompt?.updatedAt || base.updatedAt || new Date().toISOString()
  };
}

function isStorageQuotaError(error) {
  var name = String(error && error.name || "");
  var message = String(error && error.message || "");
  return name === "QuotaExceededError" || name === "NS_ERROR_DOM_QUOTA_REACHED" || /quota|exceeded/i.test(message);
}

function compactPromptImageForStorage(src, keepSmallImages) {
  if (!src || !keepSmallImages) return "";
  var value = String(src || "");
  return value.length <= 220000 ? value : "";
}

function compactPromptEntryForStorage(prompt, mode) {
  var keepSmallImages = mode === "small-images";
  var compact = normalizePromptEntry(prompt);
  compact.content = String(compact.content || "").slice(0, 12000);
  compact.images = (compact.images || [])
    .slice(0, keepSmallImages ? 2 : 0)
    .map((src) => compactPromptImageForStorage(src, keepSmallImages))
    .filter(Boolean);
  return compact;
}

function buildPromptStorePayload(mode) {
  var source = state.promptStore || {};
  var payload = {};
  ["listing", "multi_angle", "aplus", "bgremove"].forEach((feature) => {
    var list = Array.isArray(source[feature]) ? source[feature] : [];
    payload[feature] = mode
      ? list.map((prompt) => compactPromptEntryForStorage(prompt, mode))
      : list.map((prompt) => normalizePromptEntry(prompt));
  });
  return payload;
}

var els = {
  workspaceTabs: document.querySelectorAll(".workspace-tab"),
  workspacePanels: document.querySelectorAll(".workspace-panel"),
  apiStatus: document.getElementById("apiStatus"),
  gptApiKey: document.getElementById("gptApiKey"),
  gptApiBaseUrl: document.getElementById("gptApiBaseUrl"),
  testGptConnectionBtn: document.getElementById("testGptConnectionBtn"),
  gptConnectionStatus: document.getElementById("gptConnectionStatus"),
  geminiApiKey: document.getElementById("geminiApiKey"),
  geminiApiBaseUrl: document.getElementById("geminiApiBaseUrl"),
  geminiImageModel: document.getElementById("geminiImageModel"),
  testGeminiConnectionBtn: document.getElementById("testGeminiConnectionBtn"),
  geminiConnectionStatus: document.getElementById("geminiConnectionStatus"),
  falApiKey: document.getElementById("falApiKey"),
  falApiBaseUrl: document.getElementById("falApiBaseUrl"),
  falImageModel: document.getElementById("falImageModel"),
  falImageSize: document.getElementById("falImageSize"),
  falQuality: document.getElementById("falQuality"),
  testFalConnectionBtn: document.getElementById("testFalConnectionBtn"),
  falConnectionStatus: document.getElementById("falConnectionStatus"),
  backendApiBaseUrl: document.getElementById("backendApiBaseUrl"),
  customProviderName: document.getElementById("customProviderName"),
  customApiBaseUrl: document.getElementById("customApiBaseUrl"),
  customApiKey: document.getElementById("customApiKey"),
  customImageModel: document.getElementById("customImageModel"),
  testCustomConnectionBtn: document.getElementById("testCustomConnectionBtn"),
  customConnectionStatus: document.getElementById("customConnectionStatus"),
  videoModel: document.getElementById("videoModel"),
  supabaseUrl: document.getElementById("supabaseUrl"),
  supabaseAnonKey: document.getElementById("supabaseAnonKey"),
  pollInterval: document.getElementById("pollInterval"),
  saveSettingsBtn: document.getElementById("saveSettingsBtn"),
  clearSettingsBtn: document.getElementById("clearSettingsBtn"),
  brandLogo: document.getElementById("brandLogo"),
  brandLogoPreview: document.getElementById("brandLogoPreview"),
  brandName: document.getElementById("brandName"),
  brandProductCategory: document.getElementById("brandProductCategory"),
  brandStoreReputation: document.getElementById("brandStoreReputation"),
  brandDescription: document.getElementById("brandDescription"),
  brandSaveBtn: document.getElementById("brandSaveBtn"),
  brandClearBtn: document.getElementById("brandClearBtn"),
  brandStatus: document.getElementById("brandStatus"),
  brandReferenceLogo: document.getElementById("brandReferenceLogo"),
  brandReferenceLogoPlaceholder: document.getElementById("brandReferenceLogoPlaceholder"),
  brandReferenceName: document.getElementById("brandReferenceName"),
  brandReferenceMeta: document.getElementById("brandReferenceMeta"),
  brandReferencePrompt: document.getElementById("brandReferencePrompt"),
  listingProductUpload: document.getElementById("listingProductUpload"),
  listingUploadBtn: document.getElementById("listingUploadBtn"),
  listingProductCount: document.getElementById("listingProductCount"),
  listingUploadList: document.getElementById("listingUploadList"),
  listingQuantity: document.getElementById("listingQuantity"),
  listingSize: document.getElementById("listingSize"),
  listingProvider: document.getElementById("listingProvider"),
  listingImageModel: document.getElementById("listingImageModel"),
  listingLanguage: document.getElementById("listingLanguage"),
  listingSellingPoints: document.getElementById("listingSellingPoints"),
  listingTemplate: document.getElementById("listingTemplate"),
  listingPrompt: document.getElementById("listingPrompt"),
  listingWebLikeMode: document.getElementById("listingWebLikeMode"),
  listingEnhancePromptBtn: document.getElementById("listingEnhancePromptBtn"),
  listingEnhancedPrompt: document.getElementById("listingEnhancedPrompt"),
  listingEstimateBox: document.getElementById("listingEstimateBox"),
  generateListingBtn: document.getElementById("generateListingBtn"),
  listingStatus: document.getElementById("listingStatus"),
  listingProgressBox: document.getElementById("listingProgressBox"),
  listingProgressTitle: document.getElementById("listingProgressTitle"),
  listingProgressPercent: document.getElementById("listingProgressPercent"),
  listingProgressBar: document.getElementById("listingProgressBar"),
  listingProgressDetail: document.getElementById("listingProgressDetail"),
  listingPreviewGrid: document.getElementById("listingPreviewGrid"),
  listingPreviewModeBtn: document.getElementById("listingPreviewModeBtn"),
  listingAutoLayoutBtn: document.getElementById("listingAutoLayoutBtn"),
  listingDownloadBtn: document.getElementById("listingDownloadBtn"),
  folderToggleBtn: document.getElementById("folderToggleBtn"),
  folderDropdown: document.getElementById("folderDropdown"),
  folderToggleIcon: document.getElementById("folderToggleIcon"),
  folderListingCount: document.getElementById("folderListingCount"),
  folderMultiCount: document.getElementById("folderMultiCount"),
  folderAplusCount: document.getElementById("folderAplusCount"),
  multiProductUpload: document.getElementById("multiProductUpload"),
  multiUploadBtn: document.getElementById("multiUploadBtn"),
  multiProductCount: document.getElementById("multiProductCount"),
  multiUploadList: document.getElementById("multiUploadList"),
  multiProvider: document.getElementById("multiProvider"),
  multiImageModel: document.getElementById("multiImageModel"),
  multiAspectRatio: document.getElementById("multiAspectRatio"),
  multiLanguage: document.getElementById("multiLanguage"),
  multiSellingPoints: document.getElementById("multiSellingPoints"),
  multiTemplate: document.getElementById("multiTemplate"),
  multiPromptList: document.getElementById("multiPromptList"),
  multiPrompt: document.getElementById("multiPrompt"),
  multiWebLikeMode: document.getElementById("multiWebLikeMode"),
  multiEnhancePromptBtn: document.getElementById("multiEnhancePromptBtn"),
  multiClearEnhancedBtn: document.getElementById("multiClearEnhancedBtn"),
  multiEnhancedPromptOutput: document.getElementById("multiEnhancedPromptOutput"),
  multiEstimateBox: document.getElementById("multiEstimateBox"),
  multiAngleTiles: document.querySelectorAll(".multi-angle-tile"),
  multiAngleCountLabel: document.getElementById("multiAngleCountLabel"),
  multiHeroSubtitle: document.getElementById("multiHeroSubtitle"),
  multiSelectAllBtn: document.getElementById("multiSelectAllBtn"),
  multiClearBtn: document.getElementById("multiClearBtn"),
  generateMultiBtn: document.getElementById("generateMultiBtn"),
  multiStatus: document.getElementById("multiStatus"),
  multiProgressBox: document.getElementById("multiProgressBox"),
  multiProgressTitle: document.getElementById("multiProgressTitle"),
  multiProgressPercent: document.getElementById("multiProgressPercent"),
  multiProgressBar: document.getElementById("multiProgressBar"),
  multiProgressDetail: document.getElementById("multiProgressDetail"),
  multiPreviewGrid: document.getElementById("multiPreviewGrid"),
  multiDownloadBtn: document.getElementById("multiDownloadBtn"),
  bgremoveUpload: document.getElementById("bgremoveUpload"),
  bgremoveUploadBtn: document.getElementById("bgremoveUploadBtn"),
  bgremoveCount: document.getElementById("bgremoveCount"),
  bgremoveUploadList: document.getElementById("bgremoveUploadList"),
  bgremoveProvider: document.getElementById("bgremoveProvider"),
  bgremoveImageModel: document.getElementById("bgremoveImageModel"),
  bgremoveModel: document.getElementById("bgremoveModel"),
  bgremovePromptPreset: document.getElementById("bgremovePromptPreset"),
  bgremoveLanguage: document.getElementById("bgremoveLanguage"),
  bgremoveResolution: document.getElementById("bgremoveResolution"),
  bgremoveFormat: document.getElementById("bgremoveFormat"),
  bgremoveRefine: document.getElementById("bgremoveRefine"),
  bgremoveEstimateBox: document.getElementById("bgremoveEstimateBox"),
  generateBgremoveBtn: document.getElementById("generateBgremoveBtn"),
  bgremoveStatus: document.getElementById("bgremoveStatus"),
  bgremoveProgressBox: document.getElementById("bgremoveProgressBox"),
  bgremoveProgressTitle: document.getElementById("bgremoveProgressTitle"),
  bgremoveProgressPercent: document.getElementById("bgremoveProgressPercent"),
  bgremoveProgressBar: document.getElementById("bgremoveProgressBar"),
  bgremoveProgressDetail: document.getElementById("bgremoveProgressDetail"),
  bgremovePreviewGrid: document.getElementById("bgremovePreviewGrid"),
  bgremoveDownloadBtn: document.getElementById("bgremoveDownloadBtn"),
  aplusProductUpload: document.getElementById("aplusProductUpload"),
  aplusUploadBtn: document.getElementById("aplusUploadBtn"),
  aplusProductCount: document.getElementById("aplusProductCount"),
  aplusUploadList: document.getElementById("aplusUploadList"),
  aplusReferenceUpload: document.getElementById("aplusReferenceUpload"),
  aplusReferenceBtn: document.getElementById("aplusReferenceBtn"),
  aplusReferenceCount: document.getElementById("aplusReferenceCount"),
  aplusReferenceList: document.getElementById("aplusReferenceList"),
  aplusPlatform: document.getElementById("aplusPlatform"),
  aplusProvider: document.getElementById("aplusProvider"),
  aplusImageModel: document.getElementById("aplusImageModel"),
  aplusLanguage: document.getElementById("aplusLanguage"),
  aplusAspectRatio: document.getElementById("aplusAspectRatio"),
  aplusPromptPreset: document.getElementById("aplusPromptPreset"),
  aplusSellingPoints: document.getElementById("aplusSellingPoints"),
  aplusDesignRequirements: document.getElementById("aplusDesignRequirements"),
  styleModeTrending: document.getElementById("styleModeTrending"),
  styleModeReference: document.getElementById("styleModeReference"),
  trendingStylePanel: document.getElementById("trendingStylePanel"),
  referenceStylePanel: document.getElementById("referenceStylePanel"),
  oneClickAnalysisBtn: document.getElementById("oneClickAnalysisBtn"),
  generateSellingPointsBtn: document.getElementById("generateSellingPointsBtn"),
  trendingStyleAnalysisBtn: document.getElementById("trendingStyleAnalysisBtn"),
  moduleCards: document.querySelectorAll(".module-card"),
  aplusModuleCount: document.getElementById("aplusModuleCount"),
  generateAplusBtn: document.getElementById("generateAplusBtn"),
  aplusGenerateHint: document.getElementById("aplusGenerateHint"),
  aplusEstimateBox: document.getElementById("aplusEstimateBox"),
  aplusProgressBox: document.getElementById("aplusProgressBox"),
  aplusProgressTitle: document.getElementById("aplusProgressTitle"),
  aplusProgressPercent: document.getElementById("aplusProgressPercent"),
  aplusProgressBar: document.getElementById("aplusProgressBar"),
  aplusProgressDetail: document.getElementById("aplusProgressDetail"),
  aplusHeroImage: document.getElementById("aplusHeroImage"),
  aplusCard2Image: document.getElementById("aplusCard2Image"),
  aplusCard3Image: document.getElementById("aplusCard3Image"),
  aplusPreviewGrid: document.getElementById("aplusPreviewGrid"),
  promptFeature: document.getElementById("promptFeature"),
  promptCore: document.getElementById("promptCore"),
  promptTitle: document.getElementById("promptTitle"),
  promptTag: document.getElementById("promptTag"),
  promptKey: document.getElementById("promptKey"),
  promptContent: document.getElementById("promptContent"),
  promptNewBtn: document.getElementById("promptNewBtn"),
  promptSaveBtn: document.getElementById("promptSaveBtn"),
  promptDeleteBtn: document.getElementById("promptDeleteBtn"),
  promptImageUpload: document.getElementById("promptImageUpload"),
  promptImageBtn: document.getElementById("promptImageBtn"),
  promptImageCount: document.getElementById("promptImageCount"),
  promptImageList: document.getElementById("promptImageList"),
  promptPreviewBtn: document.getElementById("promptPreviewBtn"),
  promptPreviewOutput: document.getElementById("promptPreviewOutput"),
  promptStatus: document.getElementById("promptStatus"),
  promptCount: document.getElementById("promptCount"),
  promptList: document.getElementById("promptList"),
  promptMemoryList: document.getElementById("promptMemoryList"),
  requestSearch: document.getElementById("requestSearch"),
  requestStatusFilter: document.getElementById("requestStatusFilter"),
  requestShowPreview: document.getElementById("requestShowPreview"),
  requestClearHistoryBtn: document.getElementById("requestClearHistoryBtn"),
  requestHistoryList: document.getElementById("requestHistoryList"),
  requestDetailTitle: document.getElementById("requestDetailTitle"),
  requestDetailSubtitle: document.getElementById("requestDetailSubtitle"),
  requestDetailImage: document.getElementById("requestDetailImage"),
  requestShareBtn: document.getElementById("requestShareBtn"),
  requestDownloadBtn: document.getElementById("requestDownloadBtn"),
  requestCopyPromptBtn: document.getElementById("requestCopyPromptBtn"),
  requestDetailMeta: document.getElementById("requestDetailMeta"),
  requestInputBlock: document.getElementById("requestInputBlock"),
  requestOutputBlock: document.getElementById("requestOutputBlock"),
  requestCodeBlock: document.getElementById("requestCodeBlock")
};

var state = {
  listingProductFiles: [],
  listingResults: [],
  listingPreviewMode: "fill",
  listingAutoLayout: false,
  multiProductFiles: [],
  multiResults: [],
  selectedMultiPromptKeys: new Set(),
  selectedMultiPromptTouched: false,
  multiEnhancedPrompts: {},
  bgremoveFiles: [],
  bgremoveResults: [],
  promptStore: JSON.parse(JSON.stringify(defaultPromptStore)),
  promptPreviewFiles: [],
  corePrompt: defaultCorePrompt,
  brandInfo: { ...defaultBrandInfo },
  activePromptFeature: "listing",
  activePromptKey: "",
  folders: {
    listing: [],
    multi: [],
    aplus: []
  },
  selectedAngles: new Set([
    "front",
    "front-side",
    "side",
    "back-side",
    "back",
    "top-down",
    "bottom-up",
    "front-elevated",
    "front-closeup"
  ]),
  aplusProductFiles: [],
  aplusReferenceFiles: [],
  selectedModules: new Set(aplusModules),
  activeWorkspace: "aplus-content",
  activeStyleMode: "trending",
  requestHistory: [],
  activeRequestId: "",
  generationProgress: {
    listing: { active: false, percent: 0, title: "Menunggu generate", detail: "Progress output listing akan muncul di sini." },
    aplus: { active: false, percent: 0, title: "Menunggu generate", detail: "Progress output A+ akan muncul di sini." },
    multi: { active: false, percent: 0, title: "Menunggu generate", detail: "Progress output multi-angle akan muncul di sini." },
    bgremove: { active: false, percent: 0, title: "Menunggu proses", detail: "Progress background removal akan muncul di sini." }
  }
};

function getSettings() {
  var raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return normalizeSettings({
      gptApiKey: "",
      gptApiBaseUrl: "https://api.openai.com/v1",
      imageModel: DEFAULT_OPENAI_IMAGE_MODEL,
      geminiApiKey: "",
      geminiApiBaseUrl: "https://generativelanguage.googleapis.com/v1beta",
      geminiImageModel: "gemini-2.0-flash-preview-image-generation",
      falApiKey: "",
      falApiBaseUrl: "https://fal.run",
      falImageModel: "openai/gpt-image-2/edit",
      falImageSize: "auto",
      falQuality: "high",
      backendApiBaseUrl: "http://localhost:3010",
      customProviderName: "",
      customApiBaseUrl: "",
      customApiKey: "",
      customImageModel: "",
      videoModel: "sora-2",
      supabaseUrl: "",
      supabaseAnonKey: "",
      pollInterval: 10000
    });
  }

  try {
    return normalizeSettings(JSON.parse(raw));
  } catch {
    return normalizeSettings({
      gptApiKey: "",
      gptApiBaseUrl: "https://api.openai.com/v1",
      imageModel: DEFAULT_OPENAI_IMAGE_MODEL,
      geminiApiKey: "",
      geminiApiBaseUrl: "https://generativelanguage.googleapis.com/v1beta",
      geminiImageModel: "gemini-2.0-flash-preview-image-generation",
      falApiKey: "",
      falApiBaseUrl: "https://fal.run",
      falImageModel: "openai/gpt-image-2/edit",
      falImageSize: "auto",
      falQuality: "high",
      backendApiBaseUrl: "http://localhost:3010",
      customProviderName: "",
      customApiBaseUrl: "",
      customApiKey: "",
      customImageModel: "",
      videoModel: "sora-2",
      supabaseUrl: "",
      supabaseAnonKey: "",
      pollInterval: 10000
    });
  }
}

function isOpenAiBaseUrl(url) {
  return (url || "").toLowerCase().includes("api.openai.com");
}

function getDefaultImageModelForBaseUrl(url) {
  return isOpenAiBaseUrl(url) ? DEFAULT_OPENAI_IMAGE_MODEL : DEFAULT_COMPAT_IMAGE_MODEL;
}

function normalizeSettings(settings = {}) {
  var gptApiBaseUrl = (settings.gptApiBaseUrl || settings.apiBaseUrl || "https://api.openai.com/v1").replace(/\/+$/, "");
  var fallbackModel = getDefaultImageModelForBaseUrl(gptApiBaseUrl);
  var legacyModel = settings.imageModel;
  var imageModel = !legacyModel || legacyModel === "gpt-image-2"
    ? fallbackModel
    : legacyModel;

  return {
    gptApiKey: settings.gptApiKey || settings.apiKey || "",
    gptApiBaseUrl,
    imageModel,
    geminiApiKey: settings.geminiApiKey || "",
    geminiApiBaseUrl: (settings.geminiApiBaseUrl || "https://generativelanguage.googleapis.com/v1beta").replace(/\/+$/, ""),
    geminiImageModel: settings.geminiImageModel || "gemini-2.0-flash-preview-image-generation",
    falApiKey: settings.falApiKey || "",
    falApiBaseUrl: (settings.falApiBaseUrl || "https://fal.run").replace(/\/+$/, ""),
    falImageModel: settings.falImageModel || "openai/gpt-image-2/edit",
    falImageSize: settings.falImageSize || "auto",
    falQuality: settings.falQuality || "high",
    backendApiBaseUrl: (settings.backendApiBaseUrl || "http://localhost:3010").replace(/\/+$/, ""),
    customProviderName: settings.customProviderName || "",
    customApiBaseUrl: (settings.customApiBaseUrl || "").replace(/\/+$/, ""),
    customApiKey: settings.customApiKey || "",
    customImageModel: settings.customImageModel || "",
    videoModel: settings.videoModel || "sora-2",
    supabaseUrl: settings.supabaseUrl || "",
    supabaseAnonKey: settings.supabaseAnonKey || "",
    pollInterval: Math.max(2000, Number(settings.pollInterval) || 10000)
  };
}

async function callChatCompletion({
  systemPrompt,
  userPrompt,
  model = "gpt-4.1-mini",
  temperature = 0.7
}) {
  var settings = getSettings();
  var apiKey = settings.gptApiKey || settings.apiKey;
  var apiBaseUrl = settings.gptApiBaseUrl || settings.apiBaseUrl || "https://api.openai.com/v1";
  if (!apiKey) {
    throw new Error("API key belum diisi di menu Admin.");
  }

  var response = await fetch(`${apiBaseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      temperature,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ]
    })
  });

  var payload = await readResponsePayload(response, "Permintaan GPT gagal.");
  if (!response.ok) {
    throw new Error(getPayloadErrorMessage(payload, "Permintaan GPT gagal."));
  }

  var content = payload?.choices?.[0]?.message?.content?.trim();
  if (!content) {
    throw new Error("GPT tidak mengembalikan konten.");
  }

  return content;
}

function getBackendApiBaseUrl() {
  var settings = getSettings();
  var configured = String(settings.backendApiBaseUrl || "").trim();
  if (configured) {
    return configured.replace(/\/+$/, "");
  }
  if (window.location && /^https?:$/i.test(window.location.protocol || "")) {
    return String(window.location.origin || "").replace(/\/+$/, "");
  }
  return "http://localhost:3010";
}

function ensureBackendGatewayField() {
  if (els.backendApiBaseUrl) {
    return;
  }
  var anchor = els.customProviderName && els.customProviderName.closest ? els.customProviderName.closest(".gi-field") : null;
  var grid = anchor && anchor.parentElement;
  if (!grid) {
    return;
  }
  var field = document.createElement("label");
  field.className = "gi-field";
  field.innerHTML = '<span class="gi-label">Backend API Base</span><input id="backendApiBaseUrl" placeholder="http://localhost:3010">';
  grid.insertBefore(field, anchor);
  els.backendApiBaseUrl = document.getElementById("backendApiBaseUrl");
}

async function postBackendJson(path, payload, fallbackMessage) {
  var response = await fetch(`${getBackendApiBaseUrl()}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload || {})
  });
  var data = await readResponsePayloadOrText(response, fallbackMessage);
  if (!response.ok || data?.ok === false) {
    throw new Error(getPayloadErrorMessage(data, fallbackMessage));
  }
  return data;
}

async function serializeFilesForBackend(files, maxFiles) {
  return Promise.all((files || []).slice(0, maxFiles || 5).map(async (file) => ({
    name: file.name,
    dataUrl: await fileToDataUrl(file)
  })));
}

async function backendEnhanceImagePrompt(rawPrompt, contextLabel) {
  try {
    var data = await postBackendJson("/api/ai/prompt/enhance", {
      rawPrompt,
      contextLabel
    }, "Enhance prompt via backend gagal.");
    var text = String(data?.output?.text || "").trim();
    if (!text) {
      throw new Error("Backend tidak mengembalikan prompt akhir.");
    }
    return text;
  } catch (error) {
    return callChatCompletion({
      systemPrompt: "You rewrite prompts into concise production-ready prompts. Return only the final prompt text.",
      userPrompt: String(rawPrompt || "").trim(),
      temperature: 0.3
    });
  }
}

function dataUrlToFileForFallback(dataUrl, fileName) {
  var match = String(dataUrl || "").match(/^data:([^;]+);base64,(.+)$/);
  if (!match) {
    throw new Error(`Data URL tidak valid untuk ${fileName || "image.png"}`);
  }
  var mime = String(match[1] || "application/octet-stream");
  var binary = atob(match[2]);
  var bytes = new Uint8Array(binary.length);
  for (var index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return new File([bytes], fileName || "image.png", { type: mime });
}

function buildDirectImagePrompt(feature, payload) {
  payload = payload || {};
  if (feature === "listing") {
    return [
      `Product selling points: ${payload.sellingPoints || "-"}`,
      `Variation ${payload.variation || 1} of ${payload.quantity || 1}.`,
      `Language: ${payload.language || "Indonesia"}`,
      payload.basePrompt || "",
      payload.extraPrompt || ""
    ].filter(Boolean).join("\n");
  }
  if (feature === "multi_angle") {
    return [
      "Create a product image for this exact angle.",
      `Aspect ratio: ${payload.aspectRatio || "auto"}`,
      `Selling points: ${payload.sellingPoints || "-"}`,
      `Template direction: ${payload.basePrompt || "-"}`,
      `Angle name: ${payload.angleName || "Front"}`,
      `Custom prompt: ${payload.extraPrompt || "-"}`,
      `Language: ${payload.language || "Indonesia"}`,
      "Keep lighting, scale, background, and product proportions consistent."
    ].filter(Boolean).join("\n");
  }
  if (feature === "bgremove") {
    return [
      "Remove the background from this product image.",
      `Cutout model: ${payload.cutoutModel || "-"}`,
      `Resolution: ${payload.resolution || "-"}`,
      `Output format: ${payload.outputFormat || "-"}`,
      `Refine foreground: ${payload.refine ? "enabled" : "disabled"}`,
      `Prompt preset: ${payload.basePrompt || "-"}`,
      `Language: ${payload.language || "Indonesia"}`,
      "Return a clean isolated product with preserved edges."
    ].filter(Boolean).join("\n");
  }
  return [
    payload.basePrompt || "",
    payload.extraPrompt || "",
    payload.designRequirements || "",
    payload.sellingPoints || "",
    payload.moduleLabel ? `Module: ${payload.moduleLabel}` : ""
  ].filter(Boolean).join("\n");
}

function buildDirectImageCandidates() {
  var settings = getSettings();
  var candidates = [];
  if (settings.customApiBaseUrl && (settings.customApiKey || settings.gptApiKey || settings.apiKey)) {
    candidates.push({
      kind: "openai",
      imageRequest: resolveImageRequestSettings("custom")
    });
  }
  if (settings.gptApiKey || settings.apiKey) {
    candidates.push({
      kind: "openai",
      imageRequest: resolveImageRequestSettings(settings.imageModel)
    });
  }
  if (settings.geminiApiKey) {
    candidates.push({
      kind: "gemini",
      imageRequest: {
        apiKey: settings.geminiApiKey,
        apiBaseUrl: settings.geminiApiBaseUrl || "https://generativelanguage.googleapis.com/v1beta",
        model: settings.geminiImageModel || "gemini-2.0-flash-preview-image-generation"
      }
    });
  }
  if (settings.falApiKey) {
    candidates.push({
      kind: "fal",
      imageRequest: {
        apiKey: settings.falApiKey,
        apiBaseUrl: settings.falApiBaseUrl || "https://fal.run",
        model: settings.falImageModel || "openai/gpt-image-2/edit",
        imageSize: settings.falImageSize || "auto",
        quality: settings.falQuality || "high"
      }
    });
  }
  return candidates.filter(function(candidate, index, arr){
    return candidate.imageRequest && candidate.imageRequest.apiKey && arr.findIndex(function(other){
      return other.kind === candidate.kind
        && other.imageRequest.apiBaseUrl === candidate.imageRequest.apiBaseUrl
        && other.imageRequest.model === candidate.imageRequest.model;
    }) === index;
  });
}

async function directGenerateImage(feature, payload) {
  var prompt = buildDirectImagePrompt(feature, payload);
  var files = (Array.isArray(payload?.images) ? payload.images : []).map(function(file, index){
    return dataUrlToFileForFallback(file.dataUrl, file.name || `image-${index + 1}.png`);
  });
  if (!files.length) {
    throw new Error("Gambar referensi belum tersedia.");
  }
  var size = payload?.imageSize || payload?.aspectRatio || "auto";
  var candidates = buildDirectImageCandidates();
  if (!candidates.length) {
    throw new Error("Backend tidak aktif dan belum ada API key gambar yang siap dipakai.");
  }
  var lastError = null;
  for (var index = 0; index < candidates.length; index += 1) {
    var candidate = candidates[index];
    try {
      var src = "";
      if (candidate.kind === "gemini") {
        src = await callGeminiImageGeneration(candidate.imageRequest, prompt, files);
      } else if (candidate.kind === "fal") {
        src = await callFalGptImage2Edit(candidate.imageRequest, prompt, files, size);
      } else {
        src = await callOpenAiResponsesImageGeneration(candidate.imageRequest, prompt, files, size);
      }
      return {
        cached: false,
        prompt: prompt,
        task: {
          provider: `${candidate.kind}-direct`,
          model: candidate.imageRequest.model || ""
        },
        images: [{ src: src }]
      };
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError || new Error("Generate image gagal.");
}

async function backendGenerateImage(feature, payload) {
  try {
    var data = await postBackendJson("/api/ai/generate-image", Object.assign({
      feature
    }, payload || {}), "Generate image via backend gagal.");
    var images = Array.isArray(data?.output?.images) ? data.output.images : [];
    if (!images.length || !images[0].src) {
      throw new Error("Backend tidak mengembalikan hasil gambar.");
    }
    return {
      cached: !!data.cached,
      prompt: String(data.prompt || "").trim(),
      task: data.task || {},
      images
    };
  } catch (error) {
    return directGenerateImage(feature, payload || {});
  }
}

async function readResponsePayload(response, fallbackMessage) {
  var text = await response.text();
  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch (error) {
    var shortText = text.replace(/\s+/g, " ").trim().slice(0, 180);
    var statusText = response.status ? `HTTP ${response.status}${response.statusText ? " " + response.statusText : ""}` : "";
    throw new Error([statusText, shortText || fallbackMessage].filter(Boolean).join(": "));
  }
}

function getPayloadErrorMessage(payload, fallbackMessage) {
  return payload?.error?.message || payload?.message || payload?.detail || payload?.__rawMessage || fallbackMessage;
}

async function readResponsePayloadOrText(response, fallbackMessage) {
  var text = await response.text();
  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch (error) {
    var shortText = text.replace(/\s+/g, " ").trim().slice(0, 180);
    var statusText = response.status ? `HTTP ${response.status}${response.statusText ? " " + response.statusText : ""}` : "";
    return {
      __rawMessage: [statusText, shortText || fallbackMessage].filter(Boolean).join(": ")
    };
  }
}

function fileToGeminiPart(file) {
  return new Promise((resolve, reject) => {
    var reader = new FileReader();
    reader.onload = () => {
      var dataUrl = String(reader.result || "");
      var base64 = dataUrl.includes(",") ? dataUrl.split(",").pop() : dataUrl;
      resolve({
        inlineData: {
          mimeType: file.type || "image/png",
          data: base64
        }
      });
    };
    reader.onerror = () => reject(new Error("Gagal membaca gambar untuk Gemini."));
    reader.readAsDataURL(file);
  });
}

function extractGeminiImage(payload) {
  var parts = payload?.candidates?.flatMap((candidate) => candidate?.content?.parts || []) || [];
  var imagePart = parts.find((part) => part?.inlineData?.data || part?.inline_data?.data);
  return imagePart?.inlineData?.data || imagePart?.inline_data?.data || "";
}

async function callGeminiImageGeneration(imageRequest, prompt, files) {
  var imageParts = await Promise.all(files.map(fileToGeminiPart));
  var geminiModel = String(imageRequest.model || "").replace(/^models\//, "");
  var response = await fetch(`${imageRequest.apiBaseUrl}/models/${encodeURIComponent(geminiModel)}:generateContent?key=${encodeURIComponent(imageRequest.apiKey)}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            ...imageParts
          ]
        }
      ],
      generationConfig: {
        responseModalities: ["TEXT", "IMAGE"]
      }
    })
  });

  var payload = await readResponsePayload(response, "Generate image Gemini gagal.");
  if (!response.ok) {
    throw new Error(getPayloadErrorMessage(payload, "Generate image Gemini gagal."));
  }

  var base64Image = extractGeminiImage(payload);
  if (!base64Image) {
    throw new Error("Response Gemini tidak berisi hasil gambar.");
  }

  return `data:image/png;base64,${base64Image}`;
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    var reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Gagal membaca gambar referensi."));
    reader.readAsDataURL(file);
  });
}

function extractResponsesImage(payload) {
  var output = Array.isArray(payload?.output) ? payload.output : [];
  var direct = output.find((item) => item?.type === "image_generation_call" && item?.result);
  if (direct?.result) {
    return direct.result;
  }
  var nested = output
    .flatMap((item) => Array.isArray(item?.content) ? item.content : [])
    .find((item) => item?.type === "image_generation_call" && item?.result);
  return nested?.result || "";
}

function getResponsesTextModel() {
  return "gpt-5.5";
}

async function callOpenAiResponsesImageGeneration(imageRequest, prompt, files, size) {
  var imageUrls = await Promise.all(files.map(fileToDataUrl));
  var content = [
    { type: "input_text", text: prompt },
    ...imageUrls.map((imageUrl) => ({ type: "input_image", image_url: imageUrl }))
  ];
  var tool = {
    type: "image_generation",
    quality: "high"
  };
  if (size && size !== "auto") {
    tool.size = size;
  }
  if (imageRequest.model) {
    tool.model = imageRequest.model;
  }

  var response = await fetch(`${imageRequest.apiBaseUrl}/responses`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${imageRequest.apiKey}`
    },
    body: JSON.stringify({
      model: getResponsesTextModel(),
      input: [
        {
          role: "user",
          content
        }
      ],
      tools: [tool]
    })
  });
  var payload = await readResponsePayloadOrText(response, "Generate image Responses API gagal.");
  if (!response.ok) {
    throw new Error(getPayloadErrorMessage(payload, "Generate image Responses API gagal."));
  }
  var base64Image = extractResponsesImage(payload);
  if (!base64Image) {
    throw new Error("Responses API tidak mengembalikan image_generation_call.");
  }
  return `data:image/png;base64,${base64Image}`;
}

function mapFalImageSize(size, fallback) {
  if (fallback && fallback !== "auto") {
    return fallback;
  }
  var map = {
    "1024x1024": "square",
    "1536x1024": "landscape_4_3",
    "1024x1536": "portrait_4_3",
    auto: "auto"
  };
  return map[size] || "auto";
}

async function callFalGptImage2Edit(imageRequest, prompt, files, size) {
  var imageUrls = await Promise.all(files.map(fileToDataUrl));
  var response = await fetch(`${(imageRequest.apiBaseUrl || "https://fal.run").replace(/\/+$/, "")}/${imageRequest.model || "openai/gpt-image-2/edit"}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Key ${imageRequest.apiKey}`
    },
    body: JSON.stringify({
      prompt,
      image_urls: imageUrls,
      image_size: mapFalImageSize(size, imageRequest.imageSize),
      quality: imageRequest.quality || "high",
      num_images: 1,
      output_format: "png",
      sync_mode: false
    })
  });
  var payload = await readResponsePayloadOrText(response, "Generate image Fal.ai gagal.");
  if (!response.ok) {
    throw new Error(getPayloadErrorMessage(payload, "Generate image Fal.ai gagal."));
  }
  var url = payload?.images?.[0]?.url || payload?.image?.url || payload?.url || "";
  if (!url) {
    throw new Error("Fal.ai tidak mengembalikan URL gambar.");
  }
  try {
    var imageResponse = await fetch(url);
    if (!imageResponse.ok) {
      return url;
    }
    var blob = await imageResponse.blob();
    return URL.createObjectURL(blob);
  } catch {
    return url;
  }
}

async function callBestOpenAiImageGeneration(imageRequest, prompt, files, size, preferWebLike) {
  if (imageRequest.provider === "fal") {
    return callFalGptImage2Edit(imageRequest, prompt, files, size);
  }
  if (preferWebLike && imageRequest.provider === "gpt" && isOpenAiBaseUrl(imageRequest.apiBaseUrl)) {
    try {
      return await callOpenAiResponsesImageGeneration(imageRequest, prompt, files, size);
    } catch (error) {
      console.warn("Responses image_generation fallback to Image API:", error);
    }
  }
  return callOpenAiCompatibleImageEdit(imageRequest, prompt, files, size);
}

async function callOpenAiCompatibleImageEdit(imageRequest, prompt, files, size) {
  async function sendEditRequest(imageFieldName, includeQuality) {
    var formData = new FormData();
    formData.append("model", imageRequest.model);
    formData.append("prompt", prompt);
    if (includeQuality) {
      formData.append("quality", "high");
      formData.append("input_fidelity", "high");
    }
    if (size && size !== "auto") {
      formData.append("size", size);
    }

    files.forEach((file) => {
      formData.append(imageFieldName, file, file.name);
    });

    var response = await fetch(`${imageRequest.apiBaseUrl}/images/edits`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${imageRequest.apiKey}`
      },
      body: formData
    });

    var payload = await readResponsePayloadOrText(response, "Generate image gagal.");
    return { response, payload };
  }

  var result = await sendEditRequest("image[]", true);
  if (!result.response.ok) {
    var retryResult = await sendEditRequest("image", false);
    if (retryResult.response.ok) {
      result = retryResult;
    } else {
      var firstMessage = getPayloadErrorMessage(result.payload, "Generate image gagal.");
      var retryMessage = getPayloadErrorMessage(retryResult.payload, "Generate image gagal.");
      throw new Error(normalizeImageErrorMessage(`Generate image gagal. Format utama: ${firstMessage}. Retry image field: ${retryMessage}`));
    }
  }

  var base64Image = result.payload?.data?.[0]?.b64_json;
  if (!base64Image) {
    throw new Error("Response tidak berisi hasil gambar.");
  }

  return `data:image/png;base64,${base64Image}`;
}

function loadSettingsIntoForm() {
  var settings = getSettings();
  els.gptApiKey.value = settings.gptApiKey || settings.apiKey || "";
  els.gptApiBaseUrl.value = settings.gptApiBaseUrl || settings.apiBaseUrl || "https://api.openai.com/v1";
  els.geminiApiKey.value = settings.geminiApiKey || "";
  els.geminiApiBaseUrl.value = settings.geminiApiBaseUrl || "https://generativelanguage.googleapis.com/v1beta";
  els.geminiImageModel.value = settings.geminiImageModel || "gemini-2.0-flash-preview-image-generation";
  if (els.falApiKey) els.falApiKey.value = settings.falApiKey || "";
  if (els.falApiBaseUrl) els.falApiBaseUrl.value = settings.falApiBaseUrl || "https://fal.run";
  if (els.falImageModel) els.falImageModel.value = settings.falImageModel || "openai/gpt-image-2/edit";
  if (els.falImageSize) els.falImageSize.value = settings.falImageSize || "auto";
  if (els.falQuality) els.falQuality.value = settings.falQuality || "high";
  if (els.backendApiBaseUrl) els.backendApiBaseUrl.value = settings.backendApiBaseUrl || "http://localhost:3010";
  els.customProviderName.value = settings.customProviderName || "";
  els.customApiBaseUrl.value = settings.customApiBaseUrl || "";
  els.customApiKey.value = settings.customApiKey || "";
  els.customImageModel.value = settings.customImageModel || "";
  els.videoModel.value = settings.videoModel || "sora-2";
  els.supabaseUrl.value = settings.supabaseUrl || "";
  els.supabaseAnonKey.value = settings.supabaseAnonKey || "";
  els.pollInterval.value = settings.pollInterval || 10000;
}

function updateApiStatus() {
  var settings = getSettings();
  var hasApiKey = Boolean(settings.gptApiKey || settings.geminiApiKey || settings.falApiKey || settings.customApiKey || settings.apiKey);
  els.apiStatus.textContent = hasApiKey ? "API siap digunakan" : "API belum disetel";
  els.apiStatus.classList.toggle("ready", hasApiKey);
}

function saveSettings() {
  var settings = normalizeSettings({
    gptApiKey: els.gptApiKey.value.trim(),
    gptApiBaseUrl: (els.gptApiBaseUrl.value.trim() || "https://api.openai.com/v1").replace(/\/+$/, ""),
    imageModel: els.customApiBaseUrl.value.trim() && els.customApiKey.value.trim() ? "custom" : getDefaultImageModelForBaseUrl(els.gptApiBaseUrl.value.trim() || "https://api.openai.com/v1"),
    geminiApiKey: els.geminiApiKey.value.trim(),
    geminiApiBaseUrl: (els.geminiApiBaseUrl.value.trim() || "https://generativelanguage.googleapis.com/v1beta").replace(/\/+$/, ""),
    geminiImageModel: els.geminiImageModel.value.trim() || "gemini-2.0-flash-preview-image-generation",
    falApiKey: els.falApiKey?.value.trim() || "",
    falApiBaseUrl: (els.falApiBaseUrl?.value.trim() || "https://fal.run").replace(/\/+$/, ""),
    falImageModel: els.falImageModel?.value.trim() || "openai/gpt-image-2/edit",
    falImageSize: els.falImageSize?.value || "auto",
    falQuality: els.falQuality?.value || "high",
    backendApiBaseUrl: (els.backendApiBaseUrl?.value.trim() || "http://localhost:3010").replace(/\/+$/, ""),
    customProviderName: els.customProviderName.value.trim(),
    customApiBaseUrl: els.customApiBaseUrl.value.trim().replace(/\/+$/, ""),
    customApiKey: els.customApiKey.value.trim(),
    customImageModel: els.customImageModel.value.trim(),
    videoModel: els.videoModel.value.trim() || "sora-2",
    supabaseUrl: els.supabaseUrl.value.trim(),
    supabaseAnonKey: els.supabaseAnonKey.value.trim(),
    pollInterval: Math.max(2000, Number(els.pollInterval.value) || 10000)
  });

  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  updateApiStatus();
  syncAllImageControls();
  updateAllEstimateBadges();
}

function resolveImageModel(selectedValue) {
  var settings = getSettings();
  if (selectedValue === "custom") {
    return settings.customImageModel || settings.imageModel || DEFAULT_COMPAT_IMAGE_MODEL;
  }
  if (selectedValue === "gpt-image-2") {
    return getDefaultImageModelForBaseUrl(settings.gptApiBaseUrl);
  }
  if (selectedValue === "gpt-4o") {
    return DEFAULT_OPENAI_IMAGE_MODEL;
  }
  return selectedValue || settings.imageModel || getDefaultImageModelForBaseUrl(settings.gptApiBaseUrl);
}

function resolveImageRequestSettings(selectedValue) {
  var settings = getSettings();
  if (selectedValue === "custom") {
    return {
      apiKey: settings.customApiKey || settings.gptApiKey || settings.apiKey || "",
      apiBaseUrl: settings.customApiBaseUrl || settings.gptApiBaseUrl || settings.apiBaseUrl || "https://api.openai.com/v1",
      model: resolveImageModel(selectedValue)
    };
  }

  return {
    apiKey: settings.gptApiKey || settings.apiKey || "",
    apiBaseUrl: settings.gptApiBaseUrl || settings.apiBaseUrl || "https://api.openai.com/v1",
    model: resolveImageModel(selectedValue)
  };
}

function imageModelOptions(provider) {
  var settings = getSettings();
  if (provider === "gpt") {
    return [
      { value: "gpt-image-2", label: "GPT Image 2 / ChatGPT-like" },
      { value: "gpt-image-1.5", label: "GPT Image 1.5" },
      { value: "gpt-image-1", label: "GPT Image 1" },
      { value: "gpt-image-1-mini", label: "GPT Image 1 Mini" },
      { value: "dall-e-3", label: "DALL-E 3" },
      { value: "dall-e-2", label: "DALL-E 2" }
    ];
  }
  if (provider === "gemini") {
    var geminiModel = settings.geminiImageModel || "gemini-2.0-flash-preview-image-generation";
    return [
      { value: geminiModel, label: geminiModel + " (Gemini default)" },
      { value: "gemini-2.0-flash-preview-image-generation", label: "gemini-2.0-flash-preview-image-generation" },
      { value: "gemini-2.5-flash-image-preview", label: "gemini-2.5-flash-image-preview" }
    ].filter(function(item, index, arr){
      return arr.findIndex(function(other){ return other.value === item.value; }) === index;
    });
  }
  if (provider === "fal") {
    var falModel = settings.falImageModel || "openai/gpt-image-2/edit";
    return [
      { value: falModel, label: falModel + " (Fal default)" },
      { value: "openai/gpt-image-2/edit", label: "openai/gpt-image-2/edit" }
    ].filter(function(item, index, arr){
      return arr.findIndex(function(other){ return other.value === item.value; }) === index;
    });
  }
  var customModel = settings.customImageModel || DEFAULT_COMPAT_IMAGE_MODEL;
  return [
    { value: customModel, label: customModel + " (Custom default)" },
    { value: "cx/gpt-5.5", label: "cx/gpt-5.5" },
    { value: "nano-banana-pro", label: "nano-banana-pro" },
    { value: DEFAULT_COMPAT_IMAGE_MODEL, label: DEFAULT_COMPAT_IMAGE_MODEL }
  ].filter(function(item, index, arr){
    return arr.findIndex(function(other){ return other.value === item.value; }) === index;
  });
}

function syncListingImageControls() {
  syncImageControls(els.listingProvider, els.listingImageModel);
}

function syncImageControls(providerEl, modelEl) {
  if (!providerEl || !modelEl) {
    return;
  }
  var settings = getSettings();
  var preferredProvider = settings.customApiBaseUrl && settings.customApiKey ? "custom" : (settings.gptApiKey || settings.apiKey ? "gpt" : "gemini");
  if (!providerEl.value) {
    providerEl.value = preferredProvider;
  }
  var provider = providerEl.value || preferredProvider;
  var previous = modelEl.value || settings.customImageModel || settings.geminiImageModel || settings.imageModel || "";
  var options = imageModelOptions(provider);
  modelEl.innerHTML = options.map(function(item){
    return '<option value="'+item.value+'">'+item.label+'</option>';
  }).join("");
  var preferred = options.some(function(item){ return item.value === previous; }) ? previous : options[0].value;
  modelEl.value = preferred;
}

function syncAllImageControls() {
  syncImageControls(els.listingProvider, els.listingImageModel);
  syncImageControls(els.aplusProvider, els.aplusImageModel);
  syncImageControls(els.multiProvider, els.multiImageModel);
  syncImageControls(els.bgremoveProvider, els.bgremoveImageModel);
}

function resolveListingImageRequestSettings() {
  return resolveFeatureImageRequestSettings(els.listingProvider, els.listingImageModel);
}

function resolveFeatureImageRequestSettings(providerEl, modelEl) {
  var settings = getSettings();
  var provider = providerEl ? (providerEl.value || "custom") : "custom";
  var model = modelEl ? modelEl.value : "";
  if (provider === "gpt") {
    return {
      provider,
      apiKey: settings.gptApiKey || settings.apiKey || "",
      apiBaseUrl: settings.gptApiBaseUrl || settings.apiBaseUrl || "https://api.openai.com/v1",
      model: model || settings.imageModel || DEFAULT_OPENAI_IMAGE_MODEL
    };
  }
  if (provider === "gemini") {
    return {
      provider,
      apiKey: settings.geminiApiKey || "",
      apiBaseUrl: settings.geminiApiBaseUrl || "https://generativelanguage.googleapis.com/v1beta",
      model: model || settings.geminiImageModel || "gemini-2.0-flash-preview-image-generation"
    };
  }
  if (provider === "fal") {
    return {
      provider,
      apiKey: settings.falApiKey || "",
      apiBaseUrl: settings.falApiBaseUrl || "https://fal.run",
      model: model || settings.falImageModel || "openai/gpt-image-2/edit",
      imageSize: settings.falImageSize || "auto",
      quality: settings.falQuality || "high"
    };
  }
  return {
    provider,
    apiKey: settings.customApiKey || settings.gptApiKey || settings.apiKey || "",
    apiBaseUrl: settings.customApiBaseUrl || settings.gptApiBaseUrl || settings.apiBaseUrl || "https://api.openai.com/v1",
    model: model || settings.customImageModel || settings.imageModel || DEFAULT_COMPAT_IMAGE_MODEL
  };
}

function normalizeImageErrorMessage(message) {
  if (!message) {
    return "Generate image gagal.";
  }

  if (message.toLowerCase().includes("organization must be verified")) {
    return "Model sebelumnya membutuhkan organisasi OpenAI yang sudah diverifikasi. Sistem sudah dialihkan ke model gambar default yang lebih aman. Silakan generate ulang.";
  }

  return message;
}

async function testApiConnection(kind) {
  var settings = getSettings();
  if (kind === "gpt") {
    var apiBaseUrl = settings.gptApiBaseUrl || "https://api.openai.com/v1";
    var apiKey = settings.gptApiKey || "";
    if (!apiKey) {
      throw new Error("API key GPT belum diisi.");
    }
    var response = await fetch(`${apiBaseUrl}/models`, {
      headers: { Authorization: `Bearer ${apiKey}` }
    });
    if (!response.ok) {
      var payload = await readResponsePayload(response, "Koneksi GPT gagal.");
      throw new Error("Gagal: " + getPayloadErrorMessage(payload, "Koneksi GPT gagal."));
    }
    return "Sukses: Koneksi GPT berhasil.";
  }

  if (kind === "gemini") {
    var apiBaseUrl = settings.geminiApiBaseUrl || "https://generativelanguage.googleapis.com/v1beta";
    var apiKey = settings.geminiApiKey || "";
    if (!apiKey) {
      throw new Error("API key Gemini belum diisi.");
    }
    var response = await fetch(`${apiBaseUrl}/models?key=${encodeURIComponent(apiKey)}`);
    if (!response.ok) {
      var payload = await readResponsePayload(response, "Koneksi Gemini gagal.");
      throw new Error("Gagal: " + getPayloadErrorMessage(payload, "Koneksi Gemini gagal."));
    }
    return "Sukses: Koneksi Gemini berhasil.";
  }

  if (kind === "fal") {
    var falBaseUrl = settings.falApiBaseUrl || "https://fal.run";
    var falKey = settings.falApiKey || "";
    if (!falKey) {
      throw new Error("API key Fal.ai belum diisi.");
    }
    return "Fal.ai key tersimpan. Test generate dilakukan saat menjalankan model openai/gpt-image-2/edit.";
  }

  var apiBaseUrl = settings.customApiBaseUrl || "";
  var apiKey = settings.customApiKey || "";
  if (!apiBaseUrl || !apiKey) {
    throw new Error("API custom belum lengkap.");
  }
  var response = await fetch(`${apiBaseUrl}/models`, {
    headers: { Authorization: `Bearer ${apiKey}` }
  });
  if (!response.ok) {
    var payload = await readResponsePayload(response, "Koneksi custom provider gagal.");
    throw new Error("Gagal: " + getPayloadErrorMessage(payload, "Koneksi custom provider gagal."));
  }
  return "Sukses: Koneksi custom provider berhasil.";
}

function clearSettings() {
  localStorage.removeItem(STORAGE_KEY);
  loadSettingsIntoForm();
  updateApiStatus();
  syncAllImageControls();
}

function loadFolderLibrary() {
  var raw = localStorage.getItem(FOLDER_STORAGE_KEY);
  if (!raw) {
    return;
  }

  try {
    var parsed = JSON.parse(raw);
    state.folders.listing = Array.isArray(parsed.listing)
      ? parsed.listing.map((item) => ({
          ...item,
          src: item?.src?.startsWith("data:") ? "" : item?.src || ""
        }))
      : [];
    state.folders.multi = Array.isArray(parsed.multi)
      ? parsed.multi.map((item) => ({
          ...item,
          src: item?.src?.startsWith("data:") ? "" : item?.src || ""
        }))
      : [];
    state.folders.aplus = Array.isArray(parsed.aplus)
      ? parsed.aplus.map((item) => ({
          ...item,
          src: item?.src?.startsWith("data:") ? "" : item?.src || ""
        }))
      : [];
    saveFolderLibrary();
  } catch {
    state.folders = { listing: [], multi: [], aplus: [] };
  }
}

function saveFolderLibrary() {
  localStorage.setItem(FOLDER_STORAGE_KEY, JSON.stringify(state.folders));
}

function loadBrandInfo() {
  var raw = localStorage.getItem(BRAND_INFO_STORAGE_KEY);
  if (!raw) {
    state.brandInfo = { ...defaultBrandInfo };
    return;
  }

  try {
    var parsed = JSON.parse(raw);
    state.brandInfo = {
      name: parsed.name || "",
      logoDataUrl: parsed.logoDataUrl || "",
      productCategory: parsed.productCategory || "",
      storeReputation: parsed.storeReputation || "",
      description: parsed.description || ""
    };
  } catch {
    state.brandInfo = { ...defaultBrandInfo };
  }
}

function saveBrandInfo() {
  localStorage.setItem(BRAND_INFO_STORAGE_KEY, JSON.stringify(state.brandInfo));
}

function renderBrandInfo() {
  if (els.brandName) {
    els.brandName.value = state.brandInfo.name || "";
  }
  if (els.brandProductCategory) {
    els.brandProductCategory.value = state.brandInfo.productCategory || "";
  }
  if (els.brandStoreReputation) {
    els.brandStoreReputation.value = state.brandInfo.storeReputation || "";
  }
  if (els.brandDescription) {
    els.brandDescription.value = state.brandInfo.description || "";
  }

  var logo = state.brandInfo.logoDataUrl || "";
  if (els.brandLogoPreview) {
    if (logo) {
      els.brandLogoPreview.src = logo;
      els.brandLogoPreview.classList.remove("hidden");
    } else {
      els.brandLogoPreview.removeAttribute("src");
      els.brandLogoPreview.classList.add("hidden");
    }
  }

  if (els.brandReferenceLogo && els.brandReferenceLogoPlaceholder) {
    if (logo) {
      els.brandReferenceLogo.src = logo;
      els.brandReferenceLogo.classList.remove("hidden");
      els.brandReferenceLogoPlaceholder.classList.add("hidden");
    } else {
      els.brandReferenceLogo.removeAttribute("src");
      els.brandReferenceLogo.classList.add("hidden");
      els.brandReferenceLogoPlaceholder.classList.remove("hidden");
    }
  }

  if (els.brandReferenceName) {
    els.brandReferenceName.textContent = state.brandInfo.name || "Belum ada nama brand";
  }

  if (els.brandReferenceMeta) {
    var meta = [
      state.brandInfo.productCategory ? `Kategori: ${state.brandInfo.productCategory}` : "",
      state.brandInfo.storeReputation ? `Reputasi: ${state.brandInfo.storeReputation}` : ""
    ].filter(Boolean).join(" • ");
    els.brandReferenceMeta.textContent = meta || "Tambahkan kategori produk dan reputasi toko untuk memperkaya konteks generate.";
  }

  if (els.brandReferencePrompt) {
    els.brandReferencePrompt.textContent = buildBrandInformationBlock() || "Brand context belum diisi.";
  }
}

function collectBrandInfoFromForm() {
  state.brandInfo = {
    ...state.brandInfo,
    name: els.brandName?.value.trim() || "",
    productCategory: els.brandProductCategory?.value.trim() || "",
    storeReputation: els.brandStoreReputation?.value.trim() || "",
    description: els.brandDescription?.value.trim() || ""
  };
}

function buildBrandInformationBlock() {
  var parts = [
    state.brandInfo.name ? `Brand name: ${state.brandInfo.name}` : "",
    state.brandInfo.productCategory ? `Product category: ${state.brandInfo.productCategory}` : "",
    state.brandInfo.storeReputation ? `Store reputation: ${state.brandInfo.storeReputation}` : "",
    state.brandInfo.description ? `Additional brand description: ${state.brandInfo.description}` : ""
  ].filter(Boolean);

  if (!parts.length) {
    return "";
  }

  return `Brand information reference:
${parts.join("\n")}`;
}

function clearBrandInfo() {
  state.brandInfo = { ...defaultBrandInfo };
  saveBrandInfo();
  renderBrandInfo();
  if (els.brandLogo) {
    els.brandLogo.value = "";
  }
  if (els.brandStatus) {
    els.brandStatus.textContent = "Brand information direset.";
  }
}

function loadPromptStore() {
  var raw = localStorage.getItem(PROMPT_STORAGE_KEY);
  if (!raw) {
    state.promptStore = {
      listing: defaultPromptStore.listing.map((item) => normalizePromptEntry(item)),
      aplus: defaultPromptStore.aplus.map((item) => normalizePromptEntry(item)),
      multi_angle: defaultPromptStore.multi_angle.map((item) => normalizePromptEntry(item)),
      bgremove: defaultPromptStore.bgremove.map((item) => normalizePromptEntry(item))
    };
    state.corePrompt = "";
    return;
  }

  try {
    var parsed = JSON.parse(raw);
    state.promptStore = {
      listing: (Array.isArray(parsed.listing) && parsed.listing.length ? parsed.listing : defaultPromptStore.listing).map((item, index) => normalizePromptEntry(item, defaultPromptStore.listing[index])),
      aplus: (Array.isArray(parsed.aplus) && parsed.aplus.length ? parsed.aplus : defaultPromptStore.aplus).map((item, index) => normalizePromptEntry(item, defaultPromptStore.aplus[index])),
      multi_angle: (Array.isArray(parsed.multi_angle) && parsed.multi_angle.length ? parsed.multi_angle : defaultPromptStore.multi_angle).map((item, index) => normalizePromptEntry(item, defaultPromptStore.multi_angle[index])),
      bgremove: (Array.isArray(parsed.bgremove) && parsed.bgremove.length ? parsed.bgremove : defaultPromptStore.bgremove).map((item, index) => normalizePromptEntry(item, defaultPromptStore.bgremove[index]))
    };
    state.promptStore.multi_angle = mergeDefaultAnglePrompts(state.promptStore.multi_angle);
    state.corePrompt = "";
  } catch {
    state.promptStore = {
      listing: defaultPromptStore.listing.map((item) => normalizePromptEntry(item)),
      aplus: defaultPromptStore.aplus.map((item) => normalizePromptEntry(item)),
      multi_angle: defaultPromptStore.multi_angle.map((item) => normalizePromptEntry(item)),
      bgremove: defaultPromptStore.bgremove.map((item) => normalizePromptEntry(item))
    };
    state.corePrompt = "";
  }
}

function mergeDefaultAnglePrompts(prompts) {
  var current = Array.isArray(prompts) ? prompts : [];
  var currentKeys = new Set(current.map((prompt) => prompt.key));
  var missingDefaults = defaultPromptStore.multi_angle.filter((prompt) => !currentKeys.has(prompt.key)).map((prompt) => normalizePromptEntry(prompt));
  return [...current, ...missingDefaults];
}

function savePromptStore() {
  var notice = "";
  try {
    localStorage.setItem(PROMPT_STORAGE_KEY, JSON.stringify(buildPromptStorePayload()));
    return true;
  } catch (error) {
    if (!isStorageQuotaError(error)) throw error;
    notice = "Penyimpanan browser penuh. Thumbnail prompt diperkecil otomatis.";
  }
  try {
    localStorage.setItem(PROMPT_STORAGE_KEY, JSON.stringify(buildPromptStorePayload("small-images")));
    if (els.promptStatus && notice) els.promptStatus.textContent = notice;
    return true;
  } catch (error) {
    if (!isStorageQuotaError(error)) throw error;
  }
  try {
    localStorage.setItem(PROMPT_STORAGE_KEY, JSON.stringify(buildPromptStorePayload("no-images")));
    if (els.promptStatus) els.promptStatus.textContent = "Penyimpanan browser penuh. Prompt tersimpan tanpa thumbnail agar generate tetap berjalan.";
    return true;
  } catch (error) {
    console.warn("Prompt store could not be saved", error);
    if (els.promptStatus) els.promptStatus.textContent = "Prompt aktif tetap dipakai, tetapi riwayat prompt tidak bisa disimpan karena storage browser penuh.";
    return false;
  }
}

function getCorePrompt() {
  return "";
}

function slugifyPromptKey(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function getPromptOptions(feature) {
  return state.promptStore[feature] || [];
}

function getAllPromptOptions() {
  return ["listing", "multi_angle", "aplus"].flatMap((feature) => {
    return getPromptOptions(feature).map((prompt) => ({
      ...prompt,
      feature,
      key: `${feature}:${prompt.key}`,
      sourceKey: prompt.key
    }));
  });
}

function getAnglePromptOptions() {
  return getPromptOptions("multi_angle").map((prompt) => ({
    ...prompt,
    feature: "multi_angle",
    key: `angle:${prompt.key}`,
    sourceKey: prompt.key
  }));
}

function getMultiPromptMode() {
  return els.multiTemplate?.value || "angle";
}

function getCurrentMultiPromptOptions() {
  var mode = getMultiPromptMode();
  if (mode === "custom") {
    var content = els.multiPrompt?.value.trim() || "";
    return content ? [{
      key: "custom:prompt",
      sourceKey: "custom",
      feature: "custom",
      title: "Custom Prompt",
      content
    }] : [];
  }
  return mode === "all" ? getAllPromptOptions() : getAnglePromptOptions();
}

function findPromptByKey(feature, key) {
  return getPromptOptions(feature).find((item) => item.key === key);
}

function populateSelectFromPrompts(selectEl, feature, fallbackKey = "") {
  if (!selectEl) {
    return;
  }
  var prompts = getPromptOptions(feature);
  selectEl.innerHTML = prompts
    .map((prompt) => `<option value="${prompt.key}">${prompt.title}</option>`)
    .join("");

  var preferred = prompts.some((item) => item.key === fallbackKey) ? fallbackKey : prompts[0]?.key || "";
  if (preferred) {
    selectEl.value = preferred;
  }
}

function syncPromptSelectors() {
  populateSelectFromPrompts(els.listingTemplate, "listing", els.listingTemplate.value);
  populateSelectFromPrompts(els.aplusPromptPreset, "aplus", els.aplusPromptPreset?.value || "");
  populateSelectFromPrompts(els.bgremovePromptPreset, "bgremove", els.bgremovePromptPreset?.value || "");
  renderMultiPromptList();
}

function renderMultiPromptList() {
  if (!els.multiPromptList) {
    return;
  }
  var mode = getMultiPromptMode();
  if (els.multiPrompt) {
    var wrap = els.multiPrompt.closest(".gi-field");
    if (wrap) {
      wrap.style.display = mode === "custom" ? "grid" : "none";
    }
  }
  var options = getCurrentMultiPromptOptions();
  if (mode === "custom") {
    state.selectedMultiPromptKeys = new Set(options.length ? ["custom:prompt"] : []);
    els.multiPromptList.innerHTML = options.length ? '<div class="gi-muted">Custom prompt siap dipakai sebagai 1 output.</div>' : '<div class="gi-muted">Isi custom prompt untuk membuat 1 output.</div>';
    updateMultiAngleCount();
    return;
  }
  if (!state.selectedMultiPromptTouched && !state.selectedMultiPromptKeys.size) {
    options.slice(0, 9).forEach((prompt) => state.selectedMultiPromptKeys.add(prompt.key));
  }
  var validKeys = new Set(options.map((prompt) => prompt.key));
  state.selectedMultiPromptKeys = new Set(Array.from(state.selectedMultiPromptKeys).filter((key) => validKeys.has(key)));
  els.multiPromptList.innerHTML = options.map((prompt) => {
    var checked = state.selectedMultiPromptKeys.has(prompt.key) ? " checked" : "";
    var sourceLabel = getMultiPromptMode() === "all" ? `${prompt.feature} / ${prompt.sourceKey}` : prompt.sourceKey;
    return `<label class="multi-prompt-chip ${checked ? "active" : ""}" title="${(prompt.content || "").replace(/"/g, "&quot;").slice(0, 240)}"><input type="checkbox" data-multi-prompt-key="${prompt.key}"${checked}> <strong>${prompt.title}</strong><span>${sourceLabel}</span></label>`;
  }).join("");
  updateMultiAngleCount();
  updateAllEstimateBadges();
}

function getSelectedMultiPrompts() {
  var options = getCurrentMultiPromptOptions();
  return options.filter((prompt) => state.selectedMultiPromptKeys.has(prompt.key));
}

function buildVisibleEnhancerInstruction(rawPrompt, contextLabel) {
  return [
    "Rewrite this image-generation prompt into a polished final prompt for GPT image generation.",
    "The result must be a single production-ready prompt that can be shown to the user and sent directly to the image API.",
    "Keep the user's intent. Do not add unrelated objects, hidden brand rules, or secret system instructions.",
    "Improve visual finish so the output feels like ChatGPT web image generation: polished, complete, commercial, realistic, refined lighting, clean composition, not raw.",
    "Return only the final prompt text, no markdown, no explanation.",
    "",
    `Context: ${contextLabel}`,
    "",
    "Original prompt:",
    rawPrompt
  ].join("\n");
}

async function enhanceImagePrompt(rawPrompt, contextLabel) {
  if (!rawPrompt.trim()) {
    throw new Error("Prompt kosong.");
  }
  return backendEnhanceImagePrompt(buildVisibleEnhancerInstruction(rawPrompt, contextLabel), contextLabel);
}

function serializeEnhancedMultiPrompts(entries) {
  return entries.map((entry) => `[${entry.key}] ${entry.title}\n${entry.content}`).join("\n\n---\n\n");
}

function parseEnhancedMultiPromptText(text) {
  var map = {};
  String(text || "")
    .split(/\n---\n/g)
    .map((part) => part.trim())
    .filter(Boolean)
    .forEach((part) => {
      var match = part.match(/^\[([^\]]+)\]\s*([^\n]*)\n([\s\S]*)$/);
      if (match) {
        map[match[1]] = match[3].trim();
      }
    });
  return map;
}

function renderPromptList() {
  var prompts = getPromptOptions(state.activePromptFeature);
  els.promptCount.textContent = `${prompts.length} preset`;
  els.promptList.innerHTML = prompts
    .map((prompt) => {
      var thumb = Array.isArray(prompt.images) && prompt.images[0]
        ? `<img src="${escapeHtml(prompt.images[0])}" alt="${escapeHtml(prompt.title)}">`
        : `<span>No Thumbnail</span>`;
      var tags = String(prompt.tag || "").split(",").map((item) => item.trim()).filter(Boolean).slice(0, 4);
      return `
        <button class="prompt-card ${prompt.key === state.activePromptKey ? "active" : ""}" data-prompt-item="${prompt.key}" type="button">
          <div class="prompt-card-media">${thumb}</div>
          <div class="prompt-card-body">
            <div class="prompt-card-head">
              <div>
                <div class="prompt-card-title">${escapeHtml(prompt.title)}</div>
                <div class="prompt-card-key">${escapeHtml(prompt.key)}</div>
              </div>
              <span class="chip">${Math.max(0, Number(prompt.usageCount) || 0)}x</span>
            </div>
            <div class="prompt-tag-row">${tags.length ? tags.map((tag) => `<span class="prompt-tag">${escapeHtml(tag)}</span>`).join("") : '<span class="prompt-tag">untagged</span>'}</div>
            <div class="prompt-card-copy">${escapeHtml((prompt.content || "").slice(0, 220))}</div>
          </div>
        </button>
      `;
    })
    .join("");
  renderPromptMemory();
}

function renderPromptMemory() {
  if (!els.promptMemoryList) {
    return;
  }
  var featureMap = { listing: "Listing Image", aplus: "A+ Content", multi_angle: "Multi-Angle", bgremove: "Background Removal" };
  var featureLabel = featureMap[state.activePromptFeature] || state.activePromptFeature;
  var memoryRows = state.requestHistory
    .filter((record) => record.status === "success" && String(record.feature || "").toLowerCase().includes(featureLabel.toLowerCase().split(" ")[0]))
    .slice(0, 6);
  if (!memoryRows.length) {
    els.promptMemoryList.innerHTML = `<div class="prompt-memory-item"><strong>Belum ada memory</strong><p>History generate sukses untuk feature ini akan otomatis dipakai sebagai referensi gaya dan prompt.</p></div>`;
    return;
  }
  els.promptMemoryList.innerHTML = memoryRows.map((record) => `
    <div class="prompt-memory-item">
      <strong>${escapeHtml(record.title || record.feature || "Generate")}</strong>
      <p>${escapeHtml((record.prompt || "").slice(0, 220))}</p>
    </div>
  `).join("");
}

function loadPromptIntoForm(feature, key) {
  state.activePromptFeature = feature;
  state.activePromptKey = key;
  var prompt = findPromptByKey(feature, key);
  if (!prompt) {
    els.promptTitle.value = "";
    els.promptKey.value = "";
    els.promptContent.value = "";
    renderPromptList();
    return;
  }

  els.promptFeature.value = feature;
  els.promptTitle.value = prompt.title;
  els.promptKey.value = prompt.key;
  els.promptContent.value = prompt.content;
  if (els.promptTag) {
    els.promptTag.value = prompt.tag || "";
  }
  state.promptPreviewFiles = [];
  renderPromptImageList();
  if (els.promptImageList && Array.isArray(prompt.images) && prompt.images.length) {
    els.promptImageList.innerHTML = prompt.images.map((src, index) => `<div class="relative aspect-square overflow-hidden rounded-lg border border-[#2a2a2a] bg-[#1b1b1b]"><img class="h-full w-full object-cover" src="${escapeHtml(src)}" alt="Prompt ${index + 1}"><div class="absolute left-1 top-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-bold text-white">${index + 1}</div></div>`).join("");
    els.promptImageCount.textContent = `${prompt.images.length}/8`;
  }
  renderPromptList();
}

function resetPromptForm(feature = state.activePromptFeature) {
  state.activePromptFeature = feature;
  state.activePromptKey = "";
  els.promptFeature.value = feature;
  els.promptTitle.value = "";
  els.promptKey.value = "";
  els.promptContent.value = "";
  if (els.promptTag) {
    els.promptTag.value = "";
  }
  state.promptPreviewFiles = [];
  renderPromptImageList();
  els.promptStatus.textContent = "Buat prompt baru atau pilih prompt yang sudah ada.";
  renderPromptList();
}

function getSelectedPromptContent(feature, key) {
  return findPromptByKey(feature, key)?.content || "";
}

function buildCorePromptBlock() {
  return "";
}

function buildFeatureMemoryBlock(feature) {
  var labelMap = {
    listing: "Listing Image",
    aplus: "A+ Content",
    multi_angle: "Multi-Angle",
    bgremove: "Background Removal"
  };
  var token = (labelMap[feature] || feature || "").toLowerCase().split(" ")[0];
  var memories = state.requestHistory
    .filter((record) => record.status === "success" && String(record.feature || "").toLowerCase().includes(token))
    .slice(0, 3)
    .map((record) => `- ${record.title || record.feature}: ${(record.prompt || "").replace(/\s+/g, " ").slice(0, 180)}`);
  return memories.length ? `Reference memory from previous successful generations:\n${memories.join("\n")}` : "";
}

function incrementPromptUsage(feature, key) {
  if (!feature || !key) {
    return;
  }
  var prompts = getPromptOptions(feature);
  var index = prompts.findIndex((item) => item.key === key);
  if (index < 0) {
    return;
  }
  prompts[index] = normalizePromptEntry({
    ...prompts[index],
    usageCount: (Number(prompts[index].usageCount) || 0) + 1,
    updatedAt: new Date().toISOString()
  });
  state.promptStore[feature] = [...prompts];
  savePromptStore();
}

async function savePromptFromForm() {
  var feature = els.promptFeature.value;
  var title = els.promptTitle.value.trim();
  var key = slugifyPromptKey(els.promptKey.value || title);
  var content = els.promptContent.value.trim();
  var tag = els.promptTag?.value.trim() || "";

  if (!title && !key && !content) {
    els.promptStatus.textContent = "Isi judul dan prompt terlebih dahulu.";
    return;
  }

  if (!title || !key || !content) {
    els.promptStatus.textContent = "Untuk preset prompt, title, key, dan content wajib diisi.";
    return;
  }

  var prompts = getPromptOptions(feature);
  var existingIndex = prompts.findIndex((item) => item.key === key);
  var existingPrompt = existingIndex >= 0 ? prompts[existingIndex] : null;
  var uploadedImages = await Promise.all((state.promptPreviewFiles || []).slice(0, 8).map(readFileAsDataUrl));
  var nextPrompt = normalizePromptEntry({
    key,
    title,
    content,
    tag,
    images: uploadedImages.length ? uploadedImages : (existingPrompt?.images || []),
    usageCount: existingPrompt?.usageCount || 0,
    updatedAt: new Date().toISOString()
  });

  if (existingIndex >= 0) {
    prompts[existingIndex] = nextPrompt;
  } else {
    prompts.push(nextPrompt);
  }

  state.promptStore[feature] = [...prompts];
  state.activePromptFeature = feature;
  state.activePromptKey = key;
  savePromptStore();
  syncPromptSelectors();
  renderPromptList();
  els.promptKey.value = key;
  els.promptStatus.textContent = "Prompt berhasil disimpan dan terintegrasi ke elemen terkait.";
}

function deletePromptFromForm() {
  var feature = els.promptFeature.value;
  var key = els.promptKey.value.trim();
  if (!key) {
    els.promptStatus.textContent = "Pilih prompt yang ingin dihapus.";
    return;
  }

  state.promptStore[feature] = getPromptOptions(feature).filter((item) => item.key !== key);
  if (!state.promptStore[feature].length) {
    state.promptStore[feature] = JSON.parse(JSON.stringify(defaultPromptStore[feature]));
  }

  savePromptStore();
  syncPromptSelectors();
  resetPromptForm(feature);
  els.promptStatus.textContent = "Prompt berhasil dihapus.";
}

function updateFolderCounts() {
  if (els.folderListingCount) {
    els.folderListingCount.textContent = `Listing Images: ${state.folders.listing.length}`;
  }
  if (els.folderMultiCount) {
    els.folderMultiCount.textContent = `Multi-Angle: ${state.folders.multi.length}`;
  }
  if (els.folderAplusCount) {
    els.folderAplusCount.textContent = `A+ Content: ${state.folders.aplus.length}`;
  }
}

function addResultsToFolder(type, items) {
  if (!items.length) {
    return;
  }

  var normalized = items.map((item) => ({
    src: item.src?.startsWith("data:") ? "" : item.src,
    title: item.title || item.name || "Generated Asset",
    previewType: item.src?.startsWith("data:") ? "generated" : "reference",
    createdAt: new Date().toISOString()
  }));

  state.folders[type] = [...normalized, ...state.folders[type]].slice(0, 50);
  try {
    saveFolderLibrary();
  } catch {
    state.folders[type] = state.folders[type].slice(0, 12);
    saveFolderLibrary();
  }
  updateFolderCounts();
}

function mergeFiles(existingFiles, incomingFiles, maxFiles) {
  var merged = [...existingFiles];

  incomingFiles.forEach((file) => {
    var exists = merged.some(
      (current) =>
        current.name === file.name &&
        current.size === file.size &&
        current.lastModified === file.lastModified
    );

    if (!exists && merged.length < maxFiles) {
      merged.push(file);
    }
  });

  return merged.slice(0, maxFiles);
}

async function saveGenerationToSupabase(type, payload) {
  var settings = getSettings();
  if (!settings.supabaseUrl || !settings.supabaseAnonKey) {
    return;
  }

  await fetch(`${settings.supabaseUrl.replace(/\/+$/, "")}/rest/v1/generation_jobs`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: settings.supabaseAnonKey,
      Authorization: `Bearer ${settings.supabaseAnonKey}`,
      Prefer: "return=minimal"
    },
    body: JSON.stringify({
      tool_type: type,
      payload
    })
  }).catch(() => {});
}

function previewFileInput(input, imgElement) {
  var file = input.files?.[0];
  if (!file) {
    imgElement.removeAttribute("src");
    imgElement.classList.add("hidden");
    return;
  }

  var url = URL.createObjectURL(file);
  imgElement.src = url;
  imgElement.classList.remove("hidden");
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[char]));
}

function safeJson(value) {
  try {
    return JSON.stringify(value ?? {}, null, 2);
  } catch {
    return JSON.stringify({ error: "Tidak bisa menampilkan JSON" }, null, 2);
  }
}

function createRequestId() {
  if (window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }
  return `req-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function formatRequestTime(dateValue) {
  var date = new Date(dateValue || Date.now());
  var diff = Math.max(0, Date.now() - date.getTime());
  var minute = Math.floor(diff / 60000);
  if (minute < 1) return "Baru saja";
  if (minute < 60) return `${minute} menit lalu`;
  var hour = Math.floor(minute / 60);
  if (hour < 24) return `${hour} jam lalu`;
  return date.toLocaleString("id-ID");
}

function compactRequestForStorage(record) {
  var clone = { ...record };
  clone.images = (record.images || []).map((image) => {
    if (image.src && image.src.length > 450000) {
      return { ...image, src: "", note: "Image terlalu besar untuk disimpan di browser." };
    }
    return image;
  });
  return clone;
}

function saveRequestHistory() {
  try {
    localStorage.setItem(REQUEST_HISTORY_STORAGE_KEY, JSON.stringify(state.requestHistory.slice(0, 80).map(compactRequestForStorage)));
  } catch {
    try {
      var compact = state.requestHistory.slice(0, 40).map((record) => ({ ...compactRequestForStorage(record), images: (record.images || []).map((image) => ({ ...image, src: image.src?.startsWith("http") ? image.src : "" })) }));
      localStorage.setItem(REQUEST_HISTORY_STORAGE_KEY, JSON.stringify(compact));
    } catch {}
  }
}

function loadRequestHistory() {
  try {
    var raw = localStorage.getItem(REQUEST_HISTORY_STORAGE_KEY);
    state.requestHistory = raw ? JSON.parse(raw) : [];
  } catch {
    state.requestHistory = [];
  }
}

function buildRequestCode(record) {
  var input = record.input || {};
  if (record.provider === "fal") {
    return `import { fal } from "@fal-ai/client";\n\nconst result = await fal.subscribe("${record.model || "openai/gpt-image-2/edit"}", {\n  input: ${safeJson(input)}\n});`;
  }
  if (record.provider === "gemini") {
    return `// Gemini image request\nconst input = ${safeJson(input)};\n// Kirim input ini ke model ${record.model || "gemini image model"}.`;
  }
  return `const response = await fetch("${record.apiBaseUrl || "https://api.openai.com/v1"}/images/edits", {\n  method: "POST",\n  headers: { Authorization: "Bearer YOUR_API_KEY" },\n  body: formData // prompt/model/image sesuai Input di atas\n});\n\nconst result = await response.json();`;
}

function createGenerationRequest(data) {
  var now = new Date().toISOString();
  var record = {
    id: createRequestId(),
    createdAt: now,
    updatedAt: now,
    status: "processing",
    progress: 12,
    durationMs: 0,
    feature: data.feature || "Generate Image",
    provider: data.provider || "local",
    model: data.model || "",
    apiBaseUrl: data.apiBaseUrl || "",
    title: data.title || data.feature || "Request",
    prompt: data.prompt || "",
    input: data.input || {},
    output: data.output || {},
    code: data.code || "",
    images: data.images || [],
    error: ""
  };
  state.requestHistory = [record, ...state.requestHistory].slice(0, 100);
  state.activeRequestId = record.id;
  saveRequestHistory();
  renderRequestHistory();
  renderRequestDetail(record.id);
  return record.id;
}

function updateGenerationRequest(id, patch) {
  var record = state.requestHistory.find((item) => item.id === id);
  if (!record) return;
  Object.assign(record, patch, { updatedAt: new Date().toISOString() });
  if (record.createdAt) {
    record.durationMs = Math.max(0, Date.now() - new Date(record.createdAt).getTime());
  }
  if (!record.code) {
    record.code = buildRequestCode(record);
  }
  saveRequestHistory();
  renderRequestHistory();
  if (state.activeRequestId === id) {
    renderRequestDetail(id);
  }
}

function finishGenerationRequest(id, patch) {
  updateGenerationRequest(id, { progress: patch.status === "error" ? 100 : 100, ...patch });
}

function getFilteredRequests() {
  var search = (els.requestSearch?.value || "").toLowerCase().trim();
  var status = els.requestStatusFilter?.value || "all";
  return state.requestHistory.filter((record) => {
    if (status !== "all" && record.status !== status) return false;
    if (!search) return true;
    return [record.id, record.feature, record.provider, record.model, record.prompt, record.title]
      .join(" ").toLowerCase().includes(search);
  });
}

function renderRequestHistory() {
  if (!els.requestHistoryList) return;
  var requests = getFilteredRequests();
  if (!requests.length) {
    els.requestHistoryList.innerHTML = `<div class="request-empty">Belum ada request yang cocok.</div>`;
    return;
  }
  var showPreview = els.requestShowPreview?.checked !== false;
  els.requestHistoryList.innerHTML = requests.map((record) => {
    var image = (record.images || [])[0];
    var preview = showPreview && image?.src ? `<img src="${escapeHtml(image.src)}" alt="${escapeHtml(record.title)}">` : "Preview hidden";
    var active = record.id === state.activeRequestId ? " active" : "";
    var duration = record.durationMs ? `${(record.durationMs / 1000).toFixed(1)}s` : "n/a";
    return `<button class="request-item${active}" data-request-id="${escapeHtml(record.id)}" type="button"><div><div class="request-meta"><strong>${escapeHtml(formatRequestTime(record.createdAt))}</strong><span>${escapeHtml(duration)}</span><span class="request-status ${escapeHtml(record.status)}">${escapeHtml(record.status)}</span></div><div class="request-title">${escapeHtml(record.feature)} · ${escapeHtml(record.provider)} · ${escapeHtml(record.model || "local")}</div><div class="gi-muted">${escapeHtml(record.id)}</div><div class="request-prompt">${escapeHtml(record.prompt || "No prompt")}</div><div class="request-progress"><span style="width:${Math.max(0, Math.min(100, Number(record.progress) || 0))}%"></span></div></div><div class="request-preview">${preview}</div></button>`;
  }).join("");
}

function renderRequestDetail(id) {
  var record = state.requestHistory.find((item) => item.id === id) || state.requestHistory[0];
  if (!record || !els.requestDetailTitle) return;
  state.activeRequestId = record.id;
  var image = (record.images || [])[0];
  els.requestDetailTitle.textContent = record.feature || "Request";
  els.requestDetailSubtitle.textContent = `${record.id} · ${record.status}`;
  els.requestDetailImage.innerHTML = image?.src ? `<img src="${escapeHtml(image.src)}" alt="${escapeHtml(record.title)}">` : "No image saved";
  els.requestDetailMeta.innerHTML = [
    ["Status", record.status],
    ["Provider", record.provider],
    ["Model", record.model || "-"],
    ["Created", new Date(record.createdAt).toLocaleString("id-ID")],
    ["Duration", record.durationMs ? `${(record.durationMs / 1000).toFixed(2)}s` : "n/a"],
    ["Images", String((record.images || []).length)]
  ].map(([key, value]) => `<span>${escapeHtml(key)}</span><strong>${escapeHtml(value)}</strong>`).join("");
  els.requestInputBlock.textContent = safeJson(record.input || { prompt: record.prompt });
  els.requestOutputBlock.textContent = safeJson(record.output || {});
  els.requestCodeBlock.textContent = record.code || buildRequestCode(record);
  renderRequestHistory();
}

function copyTextToClipboard(text) {
  if (navigator.clipboard?.writeText) {
    return navigator.clipboard.writeText(text || "");
  }
  var area = document.createElement("textarea");
  area.value = text || "";
  document.body.appendChild(area);
  area.select();
  document.execCommand("copy");
  area.remove();
  return Promise.resolve();
}

function getActiveRequest() {
  return state.requestHistory.find((item) => item.id === state.activeRequestId) || state.requestHistory[0];
}

function bindRequestEvents() {
  safeBind(els.requestSearch, "input", renderRequestHistory);
  safeBind(els.requestStatusFilter, "change", renderRequestHistory);
  safeBind(els.requestShowPreview, "change", renderRequestHistory);
  safeBind(els.requestHistoryList, "click", (event) => {
    var button = event.target instanceof HTMLElement ? event.target.closest("[data-request-id]") : null;
    if (button) renderRequestDetail(button.getAttribute("data-request-id"));
  });
  safeBind(els.requestClearHistoryBtn, "click", () => {
    state.requestHistory = [];
    state.activeRequestId = "";
    saveRequestHistory();
    renderRequestHistory();
    if (els.requestDetailTitle) {
      els.requestDetailTitle.textContent = "Pilih request";
      els.requestDetailSubtitle.textContent = "Detail request akan muncul di sini.";
      els.requestDetailImage.textContent = "No image selected";
      els.requestDetailMeta.innerHTML = "";
      els.requestInputBlock.textContent = "{}";
      els.requestOutputBlock.textContent = "{}";
      els.requestCodeBlock.textContent = "// code akan muncul setelah request dipilih";
    }
  });
  safeBind(els.requestCopyPromptBtn, "click", async () => {
    var record = getActiveRequest();
    if (record) await copyTextToClipboard(record.prompt || "");
  });
  safeBind(els.requestShareBtn, "click", async () => {
    var record = getActiveRequest();
    var url = record?.images?.[0]?.src || "";
    if (!record || !url) return;
    if (navigator.share && url.startsWith("http")) {
      await navigator.share({ title: record.title || "Generated image", text: record.prompt || "", url });
    } else {
      await copyTextToClipboard(url);
    }
  });
  safeBind(els.requestDownloadBtn, "click", () => {
    var record = getActiveRequest();
    var url = record?.images?.[0]?.src || "";
    if (!url) return;
    var link = document.createElement("a");
    link.href = url;
    link.download = `${(record.feature || "request").toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${record.id}.png`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  });
}
function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    var reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
    reader.onerror = () => reject(new Error("Gagal membaca file logo."));
    reader.readAsDataURL(file);
  });
}

function switchWorkspace(target) {
  state.activeWorkspace = target;

  els.workspaceTabs.forEach((tab) => {
    var isActive = tab.dataset.workspaceTarget === target;
    tab.classList.toggle("active", isActive);

    if (tab.closest("header")) {
      tab.classList.toggle("border-b-2", isActive);
      tab.classList.toggle("border-white", isActive);
      tab.classList.toggle("text-white", isActive);
      tab.classList.toggle("text-neutral-500", !isActive);
    }
  });

  els.workspacePanels.forEach((panel) => {
    panel.classList.toggle("hidden", panel.id !== target);
  });
  if (target === "requests-tab") {
    renderRequestHistory();
    if (state.activeRequestId) {
      renderRequestDetail(state.activeRequestId);
    }
  }
  updateAllEstimateBadges();
}

function safeBind(element, eventName, handler) {
  if (!element) {
    return;
  }
  element.addEventListener(eventName, handler);
}

function ceilCostToCent(value) {
  return Math.ceil(Math.max(0, Number(value) || 0) * 100) / 100;
}

function formatUsd(value) {
  return `$${ceilCostToCent(value).toFixed(2)}`;
}

function estimateTextTokens(text) {
  return Math.max(0, Math.ceil(String(text || "").trim().length / 4));
}

function getFalQualityMultiplier(quality) {
  var map = { low: 0.68, medium: 0.84, high: 1 };
  return map[String(quality || "high").toLowerCase()] || 1;
}

function getFalSizeDimensions(size, fallback) {
  var key = size && size !== "auto" ? size : (fallback || "auto");
  var map = {
    auto: { width: 1024, height: 1024, label: "auto" },
    square: { width: 1024, height: 1024, label: "1:1" },
    square_hd: { width: 1536, height: 1536, label: "1:1 HD" },
    portrait_4_3: { width: 1024, height: 1365, label: "4:3 portrait" },
    portrait_16_9: { width: 1024, height: 1820, label: "16:9 portrait" },
    landscape_4_3: { width: 1536, height: 1024, label: "4:3 landscape" },
    landscape_16_9: { width: 1820, height: 1024, label: "16:9 landscape" },
    "1024x1024": { width: 1024, height: 1024, label: "1:1" },
    "1536x1024": { width: 1536, height: 1024, label: "16:9" },
    "1024x1536": { width: 1024, height: 1536, label: "2:3" },
    "1:1 Square": { width: 1024, height: 1024, label: "1:1 square" },
    "4:5 Portrait": { width: 1024, height: 1280, label: "4:5 portrait" },
    "16:9 Landscape": { width: 1536, height: 1024, label: "16:9 landscape" },
    "3:4 Story Layout": { width: 1024, height: 1365, label: "3:4 story" }
  };
  return map[key] || map.auto;
}

function estimateFalImageTokens(size, quality, count) {
  var dims = getFalSizeDimensions(size, getSettings().falImageSize);
  var megapixels = (dims.width * dims.height) / 1000000;
  var baseTokens = Math.ceil(megapixels * 4096 * getFalQualityMultiplier(quality || getSettings().falQuality));
  return Math.max(0, baseTokens * Math.max(1, Number(count) || 1));
}

function truncatePromptPreview(text) {
  var clean = String(text || "").trim();
  if (!clean) return "Belum ada prompt aktif.";
  return clean.length > 320 ? `${clean.slice(0, 320)}...` : clean;
}

function buildListingActivePrompt(index) {
  var basePrompt = getSelectedPromptContent("listing", els.listingTemplate?.value) || listingTemplatePrompts.premium;
  var extraPrompt = els.listingPrompt?.value.trim() || "";
  var sellingPoints = els.listingSellingPoints?.value.trim() || "";
  var language = els.listingLanguage?.value || "English";
  return `Product selling points: ${sellingPoints}\nVariation ${index} of ${Math.min(5, Math.max(1, Number(els.listingQuantity?.value) || 1))}.\nLanguage instruction: ${buildLanguageInstruction(language)}\n${buildCorePromptBlock()}\n${buildFeatureMemoryBlock("listing")}\n${basePrompt}\n${extraPrompt}`.trim();
}

function buildMultiPromptEstimateText() {
  var selected = getSelectedAngleDefinitions();
  if (!selected.length) {
    return "";
  }
  return selected.map(function(item, index) {
    return `[${index + 1}] ${item.name}\n${item.prompt || ""}`.trim();
  }).join("\n\n");
}

function buildAplusEstimatePrompt() {
  var selectedCards = getSelectedModuleCards().slice(0, 7);
  if (!selectedCards.length) {
    return "";
  }
  var label = selectedCards[0].dataset.moduleLabel || "A+ Module";
  var description = selectedCards[0].dataset.moduleDescription || "";
  var platform = els.aplusPlatform?.value || "Amazon";
  var aspectRatio = els.aplusAspectRatio?.value || "1:1 Square";
  var preset = getSelectedPromptContent("aplus", els.aplusPromptPreset?.value || "");
  var sellingPoints = els.aplusSellingPoints?.value.trim() || "";
  var requirements = els.aplusDesignRequirements?.value.trim() || "";
  return [
    `Create a polished A+ content image module for ${platform}.`,
    `Module: ${label}.`,
    description ? `Module direction: ${description}.` : "",
    `Aspect ratio: ${aspectRatio}.`,
    sellingPoints ? `Selling points: ${sellingPoints}` : "",
    preset ? `Prompt preset: ${preset}` : "",
    requirements ? `Design requirements: ${requirements}` : ""
  ].filter(Boolean).join("\n");
}

function buildBgremoveEstimatePrompt() {
  var modelLabel = buildBgremoveModelLabel(els.bgremoveModel?.value || "quick");
  var language = els.bgremoveLanguage?.value || "English";
  var resolution = els.bgremoveResolution?.value || "High";
  var format = els.bgremoveFormat?.value || "PNG transparent";
  var refine = els.bgremoveRefine?.checked ? "enabled" : "disabled";
  var presetPrompt = getSelectedPromptContent("bgremove", els.bgremovePromptPreset?.value || "");
  return `Remove the background from this product image.\nCutout model: ${modelLabel}\nResolution: ${resolution}\nOutput format: ${format}\nRefine foreground: ${refine}\nPrompt preset: ${presetPrompt}\nLanguage instruction: ${buildLanguageInstruction(language)}\n${buildCorePromptBlock()}\n${buildFeatureMemoryBlock("bgremove")}\nReturn a clean isolated product with transparent or plain removed background and preserve product edges accurately.`;
}

function renderEstimateBox(container, payload) {
  if (!container) {
    return;
  }
  if (!payload.isFal) {
    container.innerHTML = `<div class="gi-estimator-head"><div><div class="gi-estimator-sub">Estimasi Fal.ai</div><div class="gi-estimator-title">Aktif saat provider Fal.ai GPT Image 2 dipilih</div></div></div><div class="gi-muted">Pilih provider <b>Fal.ai GPT Image 2</b> pada tab ini untuk melihat estimasi token, prompt aktif, dan biaya otomatis.</div>`;
    return;
  }
  container.innerHTML = `<div class="gi-estimator-head"><div><div class="gi-estimator-sub">Estimasi Fal.ai GPT Image 2</div><div class="gi-estimator-title">${payload.title}</div></div><div class="chip">${payload.sizeLabel} • ${payload.quality}</div></div><div class="gi-estimator-grid"><div class="gi-estimator-badge"><div class="k">Prompt</div><div class="v">${payload.promptTokens.toLocaleString("id-ID")} tok</div></div><div class="gi-estimator-badge"><div class="k">Image In</div><div class="v">${payload.imageInputTokens.toLocaleString("id-ID")} tok</div></div><div class="gi-estimator-badge"><div class="k">Image Out</div><div class="v">${payload.imageOutputTokens.toLocaleString("id-ID")} tok</div></div><div class="gi-estimator-badge"><div class="k">Biaya</div><div class="v">${payload.totalCostLabel}</div></div></div><div class="gi-muted" style="margin-top:10px">Prompt dipakai: ${payload.promptCountLabel} • ${payload.imageCountLabel} • biaya dibulatkan naik ke cent terdekat.</div><div class="gi-estimator-prompt">${escapeHtml(truncatePromptPreview(payload.promptPreview))}</div>`;
}

function updateFeatureProgress(feature, patch) {
  var current = state.generationProgress[feature] || { active: false, percent: 0, title: "", detail: "" };
  state.generationProgress[feature] = { ...current, ...patch };
  var prefix = feature === "aplus" ? "aplus" : (feature === "bgremove" ? "bgremove" : feature);
  var box = els[`${prefix}ProgressBox`];
  var title = els[`${prefix}ProgressTitle`];
  var percent = els[`${prefix}ProgressPercent`];
  var bar = els[`${prefix}ProgressBar`];
  var detail = els[`${prefix}ProgressDetail`];
  if (!box || !title || !percent || !bar || !detail) {
    return;
  }
  var next = state.generationProgress[feature];
  box.classList.toggle("hidden", !next.active);
  title.textContent = next.title || "Memproses";
  percent.textContent = `${Math.max(0, Math.min(100, Math.round(Number(next.percent) || 0)))}%`;
  bar.style.width = `${Math.max(0, Math.min(100, Number(next.percent) || 0))}%`;
  detail.textContent = next.detail || "";
}

function resetFeatureProgress(feature) {
  var defaults = {
    listing: { title: "Menunggu generate", detail: "Progress output listing akan muncul di sini." },
    aplus: { title: "Menunggu generate", detail: "Progress output A+ akan muncul di sini." },
    multi: { title: "Menunggu generate", detail: "Progress output multi-angle akan muncul di sini." },
    bgremove: { title: "Menunggu proses", detail: "Progress background removal akan muncul di sini." }
  };
  updateFeatureProgress(feature, { active: false, percent: 0, ...defaults[feature] });
}

function updateAllEstimateBadges() {
  var falQuality = getSettings().falQuality || "high";
  renderEstimateBox(els.listingEstimateBox, (function() {
    var isFal = (els.listingProvider?.value || "") === "fal";
    var quantity = Math.min(5, Math.max(1, Number(els.listingQuantity?.value) || 1));
    var size = els.listingSize?.value || "auto";
    var prompt = buildListingActivePrompt(1);
    var promptTokens = estimateTextTokens(prompt);
    var imageInputTokens = estimateFalImageTokens(size, falQuality, state.listingProductFiles.length || 1);
    var imageOutputTokens = estimateFalImageTokens(size, falQuality, quantity);
    var totalCost = ceilCostToCent((promptTokens / 1000000) * 5 + (imageInputTokens / 1000000) * 8 + (imageOutputTokens / 1000000) * 30);
    return { isFal, title: "Listing Images", sizeLabel: getFalSizeDimensions(size, getSettings().falImageSize).label, quality: falQuality, promptTokens, imageInputTokens, imageOutputTokens, totalCostLabel: formatUsd(totalCost), promptPreview: prompt, promptCountLabel: `${quantity} output`, imageCountLabel: `${state.listingProductFiles.length || 0} gambar input` };
  })());
  renderEstimateBox(els.multiEstimateBox, (function() {
    var isFal = (els.multiProvider?.value || "") === "fal";
    var selected = getSelectedAngleDefinitions();
    var size = els.multiAspectRatio?.value || "auto";
    var prompt = buildMultiPromptEstimateText();
    var promptTokens = estimateTextTokens(prompt);
    var imageInputTokens = estimateFalImageTokens(size, falQuality, state.multiProductFiles.length || 1);
    var imageOutputTokens = estimateFalImageTokens(size, falQuality, selected.length || 1);
    var totalCost = ceilCostToCent((promptTokens / 1000000) * 5 + (imageInputTokens / 1000000) * 8 + (imageOutputTokens / 1000000) * 30);
    return { isFal, title: "Multi-Angle", sizeLabel: getFalSizeDimensions(size, getSettings().falImageSize).label, quality: falQuality, promptTokens, imageInputTokens, imageOutputTokens, totalCostLabel: formatUsd(totalCost), promptPreview: prompt, promptCountLabel: `${selected.length || 0} prompt`, imageCountLabel: `${state.multiProductFiles.length || 0} gambar input` };
  })());
  renderEstimateBox(els.aplusEstimateBox, (function() {
    var isFal = (els.aplusProvider?.value || "") === "fal";
    var outputs = Math.max(1, getSelectedModuleCards().slice(0, 7).length);
    var size = els.aplusAspectRatio?.value || "1:1 Square";
    var prompt = buildAplusEstimatePrompt();
    var promptTokens = estimateTextTokens(prompt);
    var imageInputTokens = estimateFalImageTokens(size, falQuality, state.aplusProductFiles.length || 1);
    var imageOutputTokens = estimateFalImageTokens(size, falQuality, outputs);
    var totalCost = ceilCostToCent((promptTokens / 1000000) * 5 + (imageInputTokens / 1000000) * 8 + (imageOutputTokens / 1000000) * 30);
    return { isFal, title: "A+ Content", sizeLabel: getFalSizeDimensions(size, getSettings().falImageSize).label, quality: falQuality, promptTokens, imageInputTokens, imageOutputTokens, totalCostLabel: formatUsd(totalCost), promptPreview: prompt, promptCountLabel: `${outputs} module output`, imageCountLabel: `${state.aplusProductFiles.length || 0} gambar input` };
  })());
  renderEstimateBox(els.bgremoveEstimateBox, (function() {
    var isFal = (els.bgremoveProvider?.value || "") === "fal";
    var outputs = Math.max(1, state.bgremoveFiles.length || 1);
    var size = getSettings().falImageSize || "auto";
    var prompt = buildBgremoveEstimatePrompt();
    var promptTokens = estimateTextTokens(prompt);
    var imageInputTokens = estimateFalImageTokens(size, falQuality, outputs);
    var imageOutputTokens = estimateFalImageTokens(size, falQuality, outputs);
    var totalCost = ceilCostToCent((promptTokens / 1000000) * 5 + (imageInputTokens / 1000000) * 8 + (imageOutputTokens / 1000000) * 30);
    return { isFal, title: "Background Removal", sizeLabel: getFalSizeDimensions(size, getSettings().falImageSize).label, quality: falQuality, promptTokens, imageInputTokens, imageOutputTokens, totalCostLabel: formatUsd(totalCost), promptPreview: prompt, promptCountLabel: `${outputs} output`, imageCountLabel: `${state.bgremoveFiles.length || 0} gambar input` };
  })());
}

function renderThumbnailList(container, files) {
  if (!files.length) {
    container.innerHTML = "";
    return;
  }

  container.innerHTML = files
    .map((file, index) => {
      var url = URL.createObjectURL(file);
      return `
        <div class="relative aspect-square overflow-hidden rounded-lg border border-[#2a2a2a] bg-[#1b1b1b]">
          <img class="h-full w-full object-cover" src="${url}" alt="Upload ${index + 1}">
          <div class="absolute left-1 top-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-bold text-white">${index + 1}</div>
        </div>
      `;
    })
    .join("");
}

function renderListingUploadList() {
  renderThumbnailList(els.listingUploadList, state.listingProductFiles);
  els.listingProductCount.textContent = `${state.listingProductFiles.length}/8`;
  updateAllEstimateBadges();
}

function renderMultiUploadList() {
  renderThumbnailList(els.multiUploadList, state.multiProductFiles);
  els.multiProductCount.textContent = `${state.multiProductFiles.length}/8`;
  updateAllEstimateBadges();
}

function renderBgremoveUploadList() {
  if (!els.bgremoveUploadList || !els.bgremoveCount) {
    return;
  }
  renderThumbnailList(els.bgremoveUploadList, state.bgremoveFiles);
  els.bgremoveCount.textContent = `${state.bgremoveFiles.length}/8`;
  updateAllEstimateBadges();
}

function renderPromptImageList() {
  if (!els.promptImageList || !els.promptImageCount) {
    return;
  }
  renderThumbnailList(els.promptImageList, state.promptPreviewFiles);
  els.promptImageCount.textContent = `${state.promptPreviewFiles.length}/8`;
}

function previewPromptFromForm() {
  if (!els.promptPreviewOutput) {
    return;
  }
  var title = els.promptTitle?.value.trim() || "Untitled prompt";
  var key = slugifyPromptKey(els.promptKey?.value || title) || "-";
  var feature = els.promptFeature?.value || "listing";
  var tag = els.promptTag?.value.trim() || "-";
  var content = els.promptContent?.value.trim() || getSelectedPromptContent(feature, key) || "";
  var imageNames = state.promptPreviewFiles.map((file, index) => `${index + 1}. ${file.name}`).join("\n");
  els.promptPreviewOutput.textContent = [
    `Feature: ${feature}`,
    `Key: ${key}`,
    `Title: ${title}`,
    `Tag: ${tag}`,
    "",
    content || "Prompt masih kosong.",
    "",
    imageNames ? `Preview image references:\n${imageNames}` : "Preview image references: belum ada",
    "",
    "Catatan: gambar yang diupload di tab ini hanya untuk preview/referensi hasil, tidak ikut tersimpan ke prompt dan tidak otomatis dikirim saat generate."
  ].join("\n");
  if (els.promptStatus) {
    els.promptStatus.textContent = "Preview prompt murni dari form dan gambar referensi sudah dibuat.";
  }
}

function renderListingResults() {
  if (!state.listingResults.length) {
    els.listingPreviewGrid.innerHTML = `<div class="listing-empty">Belum ada listing image yang dihasilkan.</div>`;
    els.listingPreviewGrid.classList.remove("preview-fit", "preview-fill", "auto-layout-compact");
    return;
  }

  els.listingPreviewGrid.classList.toggle("preview-fit", state.listingPreviewMode === "fit");
  els.listingPreviewGrid.classList.toggle("preview-fill", state.listingPreviewMode !== "fit");
  els.listingPreviewGrid.classList.toggle("auto-layout-compact", state.listingAutoLayout);

  els.listingPreviewGrid.innerHTML = state.listingResults
    .map((item, index) => {
      return `
      <article class="gi-result-card listing-card ${index === 0 ? "main" : ""}">
        <div class="gi-result-frame">
          <img src="${item.src}" alt="Listing image ${index + 1}">
        </div>
      </article>
    `;
    })
    .join("");
}

function updateListingCanvasControls() {
  if (els.listingPreviewModeBtn) {
    els.listingPreviewModeBtn.textContent = state.listingPreviewMode === "fit" ? "Preview Fit" : "Preview Fill";
    els.listingPreviewModeBtn.classList.add("active");
  }

  if (els.listingAutoLayoutBtn) {
    els.listingAutoLayoutBtn.classList.toggle("active", state.listingAutoLayout);
    els.listingAutoLayoutBtn.textContent = state.listingAutoLayout ? "Auto Layout On" : "Auto Layout Off";
  }
}

function updateMultiAngleCount() {
  var selected = getSelectedMultiPrompts().length;
  var label = `${selected} prompt selected`;
  if (els.multiAngleCountLabel) {
    els.multiAngleCountLabel.textContent = label;
  }
  if (els.multiHeroSubtitle) {
    els.multiHeroSubtitle.innerHTML = `AI generates <strong class="text-white">${selected || 0} output image${selected === 1 ? "" : "s"}</strong> from selected prompts only`;
  }
  if (els.generateMultiBtn) {
    els.generateMultiBtn.textContent = selected ? `Generate ${selected} Images` : "Generate Multi-Angle";
  }
}

function updateAplusCounts() {
  els.aplusProductCount.textContent = `${state.aplusProductFiles.length}/5`;
  els.aplusReferenceCount.textContent = `${state.aplusReferenceFiles.length}/5`;
  els.aplusModuleCount.textContent = `${state.selectedModules.size}/16 selected`;
  var canGenerate = state.aplusProductFiles.length > 0;
  els.aplusGenerateHint.textContent = canGenerate
    ? "Ready to generate professional A+ content images"
    : "Please upload at least one product image first";
  updateAllEstimateBadges();
}

function setStyleMode(mode) {
  state.activeStyleMode = mode;
  var trending = mode === "trending";
  els.styleModeTrending.classList.toggle("active", trending);
  els.styleModeReference.classList.toggle("active", !trending);
  els.styleModeTrending.classList.toggle("text-neutral-400", !trending);
  els.styleModeReference.classList.toggle("text-neutral-400", trending);
  els.trendingStylePanel.classList.toggle("hidden", !trending);
  els.referenceStylePanel.classList.toggle("hidden", trending);
}

function updatePreviewFromUploads() {
  var [hero, second, third] = state.aplusProductFiles;
  if (hero) {
    els.aplusHeroImage.src = URL.createObjectURL(hero);
  }
  if (second) {
    els.aplusCard2Image.src = URL.createObjectURL(second);
  }
  if (third) {
    els.aplusCard3Image.src = URL.createObjectURL(third);
  }
}

function getSelectedModuleCards() {
  return Array.from(els.moduleCards).filter((card) => state.selectedModules.has(card.dataset.moduleKey || ""));
}

function buildAplusModuleSummary() {
  var selectedCards = getSelectedModuleCards();
  if (!selectedCards.length) {
    return "No module selected";
  }

  return selectedCards
    .map((card) => {
      var label = card.dataset.moduleLabel || card.querySelector("strong")?.textContent?.trim() || "Module";
      var description = card.dataset.moduleDescription || card.querySelector("span:last-child")?.textContent?.trim() || "";
      return `${label}: ${description}`;
    })
    .join("\n");
}

function renderAplusGridFromModules() {
  var selectedCards = getSelectedModuleCards().slice(0, 7);
  var uploadedUrls = state.aplusProductFiles.map((file) => URL.createObjectURL(file));
  var language = els.aplusLanguage?.value || "English";
  var fallbackImages = [
    "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=900&q=80"
  ];

  var cardsMarkup = selectedCards.map((card, index) => {
    var label = card.dataset.moduleLabel || card.querySelector("strong")?.textContent?.trim() || `Module ${index + 1}`;
    var description = card.dataset.moduleDescription || card.querySelector("span:last-child")?.textContent?.trim() || "";
    var localizedDescription = getLanguageLabel(language, {
      Indonesia: description,
      English: description,
      Chinese: description
    });
    var isImageCard = index < 3;
    var imageSrc = uploadedUrls[index % Math.max(uploadedUrls.length, 1)] || fallbackImages[index] || fallbackImages[0];
    var cardClass = index === 0 ? "aplus-card aplus-hero" : "aplus-card";

    if (isImageCard) {
      return `
        <article class="${cardClass}">
          <img src="${imageSrc}" alt="${label}">
        </article>
      `;
    }

    return `
      <article class="aplus-card light-card">
        <div class="aplus-card-label dark-text">${String(index + 1).padStart(2, "0")}</div>
        <div class="aplus-placeholder-content">
          <h3>${label}</h3>
          <p>${localizedDescription}</p>
        </div>
      </article>
    `;
  });

  els.aplusPreviewGrid.innerHTML = cardsMarkup.join("");
}

function generateAplusPreview() {
  renderAplusGridFromModules();
  var language = els.aplusLanguage?.value || "English";
  els.aplusGenerateHint.textContent = state.aplusProductFiles.length
    ? getLanguageLabel(language, {
      Indonesia: "Preview A+ content diperbarui dari gambar produk dan modul prompt yang dipilih",
      English: "A+ content preview refreshed from uploaded product images and selected prompt modules",
      Chinese: "A+ 内容预览已根据上传的产品图片和所选提示模块更新"
    })
    : getLanguageLabel(language, {
      Indonesia: "Silakan upload minimal satu gambar produk terlebih dahulu",
      English: "Please upload at least one product image first",
      Chinese: "请先上传至少一张产品图片"
    });
}

function renderAplusGeneratedResults(results) {
  if (!results.length) {
    renderAplusGridFromModules();
    return;
  }
  els.aplusPreviewGrid.innerHTML = results.map((item, index) => `
    <article class="aplus-card ${index === 0 ? "aplus-hero" : ""}">
      <img src="${item.src}" alt="${item.title}">
    </article>
  `).join("");
}

async function generateAplusImagesWithProvider() {
  if (!state.aplusProductFiles.length) {
    els.aplusGenerateHint.textContent = "Please upload at least one product image first";
    return false;
  }
  updateFeatureProgress("aplus", { active: true, percent: 8, title: "Menyiapkan generate A+", detail: "Memeriksa gambar produk, modul, dan provider aktif." });
  var selectedCards = getSelectedModuleCards().slice(0, 7);
  if (!selectedCards.length) {
    els.aplusGenerateHint.textContent = "Pilih minimal satu module A+.";
    return false;
  }
  var platform = els.aplusPlatform.value;
  var aspectRatio = els.aplusAspectRatio.value;
  var preset = getSelectedPromptContent("aplus", els.aplusPromptPreset.value);
  var sellingPoints = els.aplusSellingPoints.value.trim();
  var requirements = els.aplusDesignRequirements.value.trim();
  var serializedFiles = await serializeFilesForBackend(state.aplusProductFiles.concat(state.aplusReferenceFiles || []), 5);
  var results = [];
  for (var index = 0; index < selectedCards.length; index += 1) {
    var card = selectedCards[index];
    var label = card.dataset.moduleLabel || card.querySelector("strong")?.textContent?.trim() || `A+ Module ${index + 1}`;
    var description = card.dataset.moduleDescription || "";
    els.aplusGenerateHint.textContent = `Generating A+ ${label} (${index + 1}/${selectedCards.length})...`;
    updateFeatureProgress("aplus", { active: true, percent: Math.round(20 + ((index / selectedCards.length) * 70)), title: `Generating ${label}`, detail: `Memproses modul ${index + 1} dari ${selectedCards.length}.` });
    var prompt = [
      `Create a polished A+ content image module for ${platform}.`,
      `Module: ${label}.`,
      description ? `Module direction: ${description}.` : "",
      `Aspect ratio: ${aspectRatio}.`,
      sellingPoints ? `Selling points: ${sellingPoints}` : "",
      buildFeatureMemoryBlock("aplus"),
      preset ? `Prompt preset: ${preset}` : "",
      requirements ? `Design requirements: ${requirements}` : ""
    ].filter(Boolean).join("\n");
    var requestId = createGenerationRequest({
      feature: "A+ Content",
      provider: "backend-router",
      model: "backend-managed",
      apiBaseUrl: getBackendApiBaseUrl(),
      title: label,
      prompt,
      input: {
        prompt,
        feature: "aplus_content",
        module: label,
        platform,
        aspect_ratio: aspectRatio,
        image_files: state.aplusProductFiles.map((file) => file.name),
        num_images: 1
      }
    });
    try {
      updateGenerationRequest(requestId, { progress: 45 });
      var generated = await backendGenerateImage("aplus", {
        platform,
        language: els.aplusLanguage.value,
        aspectRatio,
        sellingPoints,
        designRequirements: requirements ? `${requirements}\n${description}` : description,
        basePrompt: preset,
        moduleLabel: label,
        brandInfo: state.brandInfo,
        images: serializedFiles
      });
      var src = generated.images[0].src;
      updateGenerationRequest(requestId, {
        progress: 72,
        prompt: generated.prompt || prompt,
        provider: generated.task?.provider || "backend-router",
        model: generated.task?.model || "backend-managed"
      });
      finishGenerationRequest(requestId, {
        status: "success",
        images: [{ src, title: label }],
        output: { images: [{ url: src, title: label }] }
      });
      results.push({ src, title: label });
    } catch (error) {
      finishGenerationRequest(requestId, { status: "error", error: error.message, output: { error: error.message } });
      throw error;
    }
    renderAplusGeneratedResults(results);
  }
  addResultsToFolder("aplus", results);
  els.aplusGenerateHint.textContent = `${results.length} A+ image berhasil digenerate.`;
  incrementPromptUsage("aplus", els.aplusPromptPreset.value);
  updateFeatureProgress("aplus", { active: true, percent: 100, title: "Generate A+ selesai", detail: `${results.length} output berhasil dibuat.` });
  return true;
}

function getSelectedAngleDefinitions() {
  var language = els.multiLanguage?.value || "English";
  var enhancedMap = els.multiWebLikeMode?.checked
    ? { ...state.multiEnhancedPrompts, ...parseEnhancedMultiPromptText(els.multiEnhancedPromptOutput?.value || "") }
    : {};
  return getSelectedMultiPrompts().map((prompt) => ({
    key: prompt.sourceKey || prompt.key,
    name: localizeMultiAngleName(prompt.title || "Prompt", language),
    prompt: `${enhancedMap[prompt.key] || prompt.content || ""}\n${buildFeatureMemoryBlock("multi_angle")}`.trim(),
    promptTitle: prompt.title || "Prompt"
  }));
}

function renderMultiAngleResults() {
  if (!state.multiResults.length) {
    els.multiPreviewGrid.innerHTML = `<div class="multi-empty">Belum ada hasil multi-angle yang dihasilkan.</div>`;
    return;
  }

  els.multiPreviewGrid.innerHTML = state.multiResults
    .map((item, index) => `
      <article class="gi-result-card multi-card ${index === 0 ? "multi-card-hero" : ""}">
        <div class="gi-result-frame">
          <img src="${item.src}" alt="${item.name}">
        </div>
      </article>
    `)
    .join("");
}

function renderBgremoveResults() {
  if (!state.bgremoveResults.length) {
    els.bgremovePreviewGrid.innerHTML = `<div class="bgremove-empty">Belum ada hasil background removal.</div>`;
    return;
  }

  var language = els.bgremoveLanguage?.value || "English";
  var originalLabel = getLanguageLabel(language, {
    Indonesia: "Asli",
    English: "Original",
    Chinese: "原图"
  });
  var removedLabel = getLanguageLabel(language, {
    Indonesia: "Background Dihapus",
    English: "Background Removed",
    Chinese: "已去背景"
  });
  var downloadLabel = getLanguageLabel(language, {
    Indonesia: "Unduh",
    English: "Download",
    Chinese: "下载"
  });

  els.bgremovePreviewGrid.innerHTML = state.bgremoveResults
    .map((item, index) => `
      <article class="bgremove-card">
        <div class="bgremove-pair">
          <div class="bgremove-pane">
            <span class="bgremove-badge">${originalLabel}</span>
            <img src="${item.beforeSrc}" alt="Original ${index + 1}">
          </div>
          <div class="bgremove-pane checkerboard">
            <span class="bgremove-badge">${removedLabel}</span>
            <img src="${item.afterSrc}" alt="Removed ${index + 1}">
          </div>
        </div>
        <div class="bgremove-card-footer">
          <div>
            <strong>${item.title}</strong>
            <span>${item.modelLabel}</span>
          </div>
          <button class="multi-card-download" data-bgremove-download-index="${index}" type="button">
            <span class="material-symbols-outlined text-[16px]">download</span>
            <span>${downloadLabel}</span>
          </button>
        </div>
      </article>
    `)
    .join("");
}

function buildMultiAngleDegrees(angleKey) {
  var degrees = {
    front: "0°",
    "front-side": "45°",
    side: "90°",
    "back-side": "135°",
    back: "180°",
    "top-down": "0° / 55°",
    "bottom-up": "0° / -40°",
    "front-elevated": "45° / 35°",
    "front-closeup": "0° / 10° / 1.6x"
  };
  return degrees[angleKey] || "";
}

function localizeMultiAngleName(angleName, language) {
  var translations = {
    Front: { Indonesia: "Depan", English: "Front", Chinese: "正面" },
    "Front Side": { Indonesia: "Depan Samping", English: "Front Side", Chinese: "前侧" },
    Side: { Indonesia: "Samping", English: "Side", Chinese: "侧面" },
    "Back Side": { Indonesia: "Belakang Samping", English: "Back Side", Chinese: "后侧" },
    Back: { Indonesia: "Belakang", English: "Back", Chinese: "背面" },
    "Top Down": { Indonesia: "Atas", English: "Top Down", Chinese: "俯视" },
    "Bottom Up": { Indonesia: "Bawah", English: "Bottom Up", Chinese: "仰视" },
    "Front Elevated": { Indonesia: "Depan Atas", English: "Front Elevated", Chinese: "前上方" },
    "Front Close-up": { Indonesia: "Close-up Depan", English: "Front Close-up", Chinese: "正面特写" }
  };

  return translations[angleName]?.[language] || angleName;
}

function buildMultiAngleFallbackResults(selectedAngles) {
  return selectedAngles.map((angle, index) => {
    var sourceFile = state.multiProductFiles[index % state.multiProductFiles.length];
    return {
      key: angle.key,
      name: angle.name,
      degrees: buildMultiAngleDegrees(angle.key),
      src: URL.createObjectURL(sourceFile)
    };
  });
}

function buildBgremoveModelLabel(model) {
  var labels = {
    quick: "Quick Remove (Default)",
    "quick-hd": "Quick Remove (HD)",
    fine: "Fine Remove",
    hair: "Hair Detail",
    portrait: "Model Portrait",
    adaptive: "Adaptive Size"
  };
  return labels[model] || "Quick Remove (Default)";
}

function buildLanguageInstruction(language) {
  var labels = {
    Indonesia: "Use Indonesian language for all visible copy, labels, and generated text.",
    English: "Use English language for all visible copy, labels, and generated text.",
    Chinese: "Use Simplified Chinese language for all visible copy, labels, and generated text."
  };
  return labels[language] || labels.English;
}

function getLanguageLabel(language, variants) {
  return variants[language] || variants.English;
}

function buildBgremoveFallbackResults() {
  var language = els.bgremoveLanguage.value;
  return state.bgremoveFiles.map((file, index) => {
    var src = URL.createObjectURL(file);
    return {
      beforeSrc: src,
      afterSrc: src,
      title: `${getLanguageLabel(language, {
        Indonesia: "Hapus Background",
        English: "Background Removal",
        Chinese: "背景移除"
      })} ${index + 1}`,
      modelLabel: buildBgremoveModelLabel(els.bgremoveModel.value)
    };
  });
}

async function generateMultiAngleImages() {
  if (!state.multiProductFiles.length) {
    els.multiStatus.textContent = "Upload at least one product image first.";
    return;
  }
  updateFeatureProgress("multi", { active: true, percent: 8, title: "Menyiapkan multi-angle", detail: "Memeriksa gambar produk dan prompt terpilih." });

  var selectedAngles = getSelectedAngleDefinitions();
  if (!selectedAngles.length) {
    els.multiStatus.textContent = "Pilih minimal satu prompt atau isi custom prompt.";
    return;
  }

  var aspectRatio = els.multiAspectRatio.value;
  var serializedFiles = await serializeFilesForBackend(state.multiProductFiles, 4);

  var results = [];

  for (var index = 0; index < selectedAngles.length; index += 1) {
    var angle = selectedAngles[index];
    els.multiStatus.textContent = `Generating ${angle.name} (${index + 1}/${selectedAngles.length})...`;
    updateFeatureProgress("multi", { active: true, percent: Math.round(18 + ((index / selectedAngles.length) * 72)), title: `Generating ${angle.name}`, detail: `Memproses sudut ${index + 1} dari ${selectedAngles.length}.` });
    var prompt = angle.prompt;
    var requestId = createGenerationRequest({
      feature: "Multi-Angle",
      provider: "backend-router",
      model: "backend-managed",
      apiBaseUrl: getBackendApiBaseUrl(),
      title: angle.name,
      prompt,
      input: {
        prompt,
        feature: "multi_angle",
        angle: angle.name,
        angle_key: angle.key,
        image_files: state.multiProductFiles.map((file) => file.name),
        aspect_ratio: aspectRatio,
        num_images: 1
      }
    });
    try {
      updateGenerationRequest(requestId, { progress: 45 });
      var generated = await backendGenerateImage("multi_angle", {
        language: els.multiLanguage?.value || "Indonesia",
        sellingPoints: els.multiSellingPoints?.value.trim() || "",
        basePrompt: prompt,
        extraPrompt: els.multiPrompt?.value.trim() || "",
        angleName: angle.name,
        aspectRatio,
        brandInfo: state.brandInfo,
        images: serializedFiles
      });
      var src = generated.images[0].src;
      updateGenerationRequest(requestId, {
        progress: 72,
        prompt: generated.prompt || prompt,
        provider: generated.task?.provider || "backend-router",
        model: generated.task?.model || "backend-managed"
      });
      finishGenerationRequest(requestId, {
        status: "success",
        images: [{ src, title: angle.name }],
        output: { images: [{ url: src, title: angle.name }] }
      });
      results.push({
        key: angle.key,
        name: angle.name,
        degrees: buildMultiAngleDegrees(angle.key),
        src
      });
    } catch (error) {
      finishGenerationRequest(requestId, { status: "error", error: error.message, output: { error: error.message } });
      throw error;
    }
    state.multiResults = [...results];
    renderMultiAngleResults();
  }

  els.multiStatus.textContent = `${results.length} image berhasil digenerate dari prompt terpilih.`;
  getSelectedMultiPrompts().forEach((prompt) => {
    if (prompt.feature === "multi_angle" && prompt.sourceKey) {
      incrementPromptUsage("multi_angle", prompt.sourceKey);
    }
  });
  addResultsToFolder("multi", results);
  updateFeatureProgress("multi", { active: true, percent: 100, title: "Generate multi-angle selesai", detail: `${results.length} output berhasil dibuat.` });
  await saveGenerationToSupabase("multi_angle", {
    aspectRatio,
    angles: selectedAngles,
    results
  });
}

async function enhanceSelectedMultiPrompts() {
  var selected = getSelectedMultiPrompts();
  if (!selected.length) {
    els.multiStatus.textContent = "Pilih minimal satu prompt untuk di-enhance.";
    return;
  }
  if (!getSettings().gptApiKey && !getSettings().apiKey) {
    els.multiStatus.textContent = "Isi GPT API Key di Admin untuk Enhance Prompt.";
    return;
  }
  var enhancedEntries = [];
  for (var index = 0; index < selected.length; index += 1) {
    var item = selected[index];
    els.multiStatus.textContent = `Enhancing prompt ${index + 1}/${selected.length}...`;
    var enhanced = await enhanceImagePrompt(item.content || "", `Multi-Angle: ${item.title}`);
    state.multiEnhancedPrompts[item.key] = enhanced;
    enhancedEntries.push({
      key: item.key,
      title: item.title,
      content: enhanced
    });
  }
  if (els.multiEnhancedPromptOutput) {
    els.multiEnhancedPromptOutput.value = serializeEnhancedMultiPrompts(enhancedEntries);
  }
  if (els.multiWebLikeMode) {
    els.multiWebLikeMode.checked = true;
  }
  els.multiStatus.textContent = `${enhancedEntries.length} prompt final siap dipakai dan bisa diedit.`;
}

async function enhanceListingPrompt() {
  var basePrompt = getSelectedPromptContent("listing", els.listingTemplate.value) || listingTemplatePrompts.premium;
  var raw = [
    els.listingSellingPoints.value.trim() ? `Product selling points:\n${els.listingSellingPoints.value.trim()}` : "",
    basePrompt,
    els.listingPrompt.value.trim()
  ].filter(Boolean).join("\n\n");
  if (!raw.trim()) {
    els.listingStatus.textContent = "Prompt listing kosong.";
    return;
  }
  if (!getSettings().gptApiKey && !getSettings().apiKey) {
    els.listingStatus.textContent = "Isi GPT API Key di Admin untuk Enhance Prompt.";
    return;
  }
  els.listingStatus.textContent = "Enhancing listing prompt...";
  var enhanced = await enhanceImagePrompt(raw, "Listing Images");
  if (els.listingEnhancedPrompt) {
    els.listingEnhancedPrompt.value = enhanced;
  }
  if (els.listingWebLikeMode) {
    els.listingWebLikeMode.checked = true;
  }
  els.listingStatus.textContent = "Prompt final listing siap dipakai dan bisa diedit.";
}

async function generateBackgroundRemoval() {
  if (!state.bgremoveFiles.length) {
    els.bgremoveStatus.textContent = "Upload at least one image first.";
    return;
  }
  updateFeatureProgress("bgremove", { active: true, percent: 8, title: "Menyiapkan background removal", detail: "Memeriksa file input dan mode output." });
  var modelValue = els.bgremoveModel.value;
  var modelLabel = buildBgremoveModelLabel(modelValue);
  var language = els.bgremoveLanguage.value;
  var resolution = els.bgremoveResolution.value;
  var format = els.bgremoveFormat.value;
  var refine = els.bgremoveRefine.checked;
  var presetPrompt = getSelectedPromptContent("bgremove", els.bgremovePromptPreset.value);
  var serializedFiles = await serializeFilesForBackend(state.bgremoveFiles, 4);

  var results = [];
  for (var index = 0; index < state.bgremoveFiles.length; index += 1) {
    var file = state.bgremoveFiles[index];
    els.bgremoveStatus.textContent = `Removing background ${index + 1}/${state.bgremoveFiles.length}...`;
    updateFeatureProgress("bgremove", { active: true, percent: Math.round(18 + ((index / state.bgremoveFiles.length) * 72)), title: `Removing background ${index + 1}/${state.bgremoveFiles.length}`, detail: `Memproses ${file.name}.` });
    var generated = await backendGenerateImage("bgremove", {
      language,
      cutoutModel: modelLabel,
      resolution,
      outputFormat: format,
      refine,
      basePrompt: presetPrompt,
      images: [serializedFiles[index]]
    });
    var src = generated.images[0].src;

    results.push({
      beforeSrc: URL.createObjectURL(file),
      afterSrc: src,
      title: file.name.replace(/\.[^.]+$/, ""),
      modelLabel
    });
    state.bgremoveResults = [...results];
    renderBgremoveResults();
  }

  els.bgremoveStatus.textContent = `${results.length} background removal selesai diproses.`;
  incrementPromptUsage("bgremove", els.bgremovePromptPreset.value);
  updateFeatureProgress("bgremove", { active: true, percent: 100, title: "Background removal selesai", detail: `${results.length} output berhasil dibuat.` });
}

async function analyzeAplusSellingPoints() {
  var platform = els.aplusPlatform.value;
  var aspectRatio = els.aplusAspectRatio.value;
  var language = els.aplusLanguage.value;
  var currentBrief = els.aplusSellingPoints.value.trim();

  return backendEnhanceImagePrompt(`Create structured A+ selling points for this product.
Platform: ${platform}
Aspect ratio: ${aspectRatio}
Language instruction: ${buildLanguageInstruction(language)}
Current brief:
${currentBrief || "-"}

Return in this format:
Product name:
Core selling points:
Target audience:
Expected scenes:
Size parameters:
Brand tone:`, "A+ Selling Points");
}

async function generateListingImages() {
  if (!state.listingProductFiles.length) {
    els.listingStatus.textContent = "Upload at least one product image first.";
    return;
  }
  updateFeatureProgress("listing", { active: true, percent: 8, title: "Menyiapkan listing image", detail: "Memeriksa gambar produk, quantity, dan prompt aktif." });

  var quantity = Math.min(5, Math.max(1, Number(els.listingQuantity.value) || 1));
  var basePrompt = getSelectedPromptContent("listing", els.listingTemplate.value) || listingTemplatePrompts.premium;
  var extraPrompt = els.listingPrompt.value.trim();
  var sellingPoints = els.listingSellingPoints.value.trim();
  var language = els.listingLanguage.value;
  var summary = extractSellingPointSummary(sellingPoints);
  var serializedFiles = await serializeFilesForBackend(state.listingProductFiles, 4);

  var results = [];

  for (var index = 0; index < quantity; index += 1) {
    els.listingStatus.textContent = `Generating listing image ${index + 1} of ${quantity}...`;
    updateFeatureProgress("listing", { active: true, percent: Math.round(18 + ((index / quantity) * 72)), title: `Generating listing ${index + 1}/${quantity}`, detail: `Menyusun output ${index + 1} dari ${quantity}.` });
    var prompt = els.listingWebLikeMode?.checked && els.listingEnhancedPrompt?.value.trim()
      ? `${els.listingEnhancedPrompt.value.trim()}
Variation ${index + 1} of ${quantity}.`
      : `${basePrompt}
${extraPrompt}`.trim();
    var requestTitle = buildListingCardTitle(index, language, summary);
    var requestId = createGenerationRequest({
      feature: "Listing Image",
      provider: "backend-router",
      model: "backend-managed",
      apiBaseUrl: getBackendApiBaseUrl(),
      title: requestTitle,
      prompt,
      input: {
        prompt,
        feature: "listing",
        language,
        selling_points: sellingPoints,
        variation: index + 1,
        image_size: els.listingSize.value,
        image_files: state.listingProductFiles.map((file) => file.name),
        num_images: 1
      }
    });
    try {
      updateGenerationRequest(requestId, { progress: 45 });
      var generated = await backendGenerateImage("listing", {
        language,
        sellingPoints,
        basePrompt,
        extraPrompt: prompt,
        quantity,
        variation: index + 1,
        imageSize: els.listingSize.value,
        brandInfo: state.brandInfo,
        images: serializedFiles
      });
      var src = generated.images[0].src;
      updateGenerationRequest(requestId, {
        progress: 72,
        prompt: generated.prompt || prompt,
        provider: generated.task?.provider || "backend-router",
        model: generated.task?.model || "backend-managed"
      });
      finishGenerationRequest(requestId, {
        status: "success",
        images: [{ src, title: requestTitle }],
        output: { images: [{ url: src, title: requestTitle }] }
      });
      results.push({
        src,
        title: requestTitle,
        description: buildListingCardDescription(index, sellingPoints, extraPrompt),
        badges: buildListingBadges(index, language)
      });
    } catch (error) {
      finishGenerationRequest(requestId, { status: "error", error: error.message, output: { error: error.message } });
      throw error;
    }
    state.listingResults = [...results];
    renderListingResults();
  }

  els.listingStatus.textContent = `${results.length} listing images berhasil digenerate.`;
  incrementPromptUsage("listing", els.listingTemplate.value);
  addResultsToFolder("listing", results);
  updateFeatureProgress("listing", { active: true, percent: 100, title: "Generate listing selesai", detail: `${results.length} output berhasil dibuat.` });
  await saveGenerationToSupabase("listing", {
    language,
    sellingPoints,
    brandInfo: state.brandInfo,
    quantity,
    results
  });
}

function extractSellingPointSummary(text) {
  var cleanLines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.replace(/^[\-\d\.\:•\s]+/, ""));

  if (!cleanLines.length) {
    return "Premium product storytelling";
  }

  return cleanLines[0].slice(0, 70);
}

function buildListingCardTitle(index, language, summary) {
  var localized = {
    Indonesia: ["Hero Utama", "Fokus Benefit", "Detail Produk", "Penggunaan Produk", "Banner Konversi"],
    English: ["Hero Cover", "Benefit Focus", "Product Detail", "Usage Scene", "Conversion Banner"],
    Chinese: ["主视觉", "核心卖点", "产品细节", "使用场景", "转化横幅"]
  };
  var set = localized[language] || localized.English;
  var titles = [
    set[0],
    set[1],
    set[2],
    set[3],
    set[4]
  ];

  return titles[index] || set[0];
}

function buildListingCardDescription(index, sellingPoints, extraPrompt) {
  var fallbackCopy = [
    "Main hero image with strong product hierarchy, premium visibility, and clear marketplace appeal.",
    "Benefit-forward layout that spotlights the biggest customer value and buying reason.",
    "Detail-focused frame highlighting craftsmanship, texture, material quality, or core function.",
    "Usage-oriented visual showing how the product fits real customer scenarios and expectations.",
    "Promotional closing frame with stronger urgency, stronger CTA space, and campaign-ready energy."
  ];

  var sourceText = extraPrompt || sellingPoints;
  if (!sourceText.trim()) {
    return fallbackCopy[index] || fallbackCopy[0];
  }

  var clean = sourceText.replace(/\s+/g, " ").trim();
  return clean.slice(0, 140);
}

function buildListingBadges(index, language) {
  var localized = {
    Indonesia: [
      ["Hero", "Tinggi CTR", "Visual Utama"],
      ["Benefit", "Marketplace", "Jualan"],
      ["Detail", "Zoom", "Produk"],
      ["Lifestyle", "Trust", "Scene"],
      ["Promo", "Affiliate", "Konversi"]
    ],
    English: [
      ["Hero", "High CTR", "Primary Visual"],
      ["Benefits", "Marketplace", "Sales"],
      ["Detail", "Zoom Ready", "Product"],
      ["Lifestyle", "Trust", "Scene"],
      ["Promo", "Affiliate", "Conversion"]
    ],
    Chinese: [
      ["主图", "高点击", "核心视觉"],
      ["卖点", "平台适配", "转化"],
      ["细节", "可放大", "产品"],
      ["场景", "信任感", "展示"],
      ["促销", "联盟", "转化"]
    ]
  };
  var set = localized[language] || localized.English;
  var badgeSets = [
    set[0],
    set[1],
    set[2],
    set[3],
    set[4]
  ];

  return badgeSets[index] || set[0];
}

function buildListingFallbackResults({ quantity, language, sellingPoints, extraPrompt, summary }) {
  return Array.from({ length: quantity }, (_, index) => {
    var sourceFile = state.listingProductFiles[index % state.listingProductFiles.length];
    return {
      src: URL.createObjectURL(sourceFile),
      title: buildListingCardTitle(index, language, summary),
      description: buildListingCardDescription(index, sellingPoints, extraPrompt),
      badges: buildListingBadges(index, language)
    };
  });
}

function downloadListingResults() {
  if (!state.listingResults.length) {
    els.listingStatus.textContent = "Belum ada hasil image untuk diunduh.";
    return;
  }

  state.listingResults.forEach((item, index) => {
    var link = document.createElement("a");
    link.href = item.src;
    link.download = `listing-image-${index + 1}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });

  els.listingStatus.textContent = `${state.listingResults.length} image berhasil dipersiapkan untuk diunduh.`;
}

function downloadMultiResults() {
  if (!state.multiResults.length) {
    els.multiStatus.textContent = "Belum ada hasil multi-angle untuk diunduh.";
    return;
  }

  state.multiResults.forEach((item, index) => {
    var link = document.createElement("a");
    link.href = item.src;
    link.download = `multi-angle-${String(index + 1).padStart(2, "0")}-${item.key}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });

  els.multiStatus.textContent = `${state.multiResults.length} multi-angle image siap diunduh.`;
}

function downloadMultiResultAt(index) {
  var item = state.multiResults[index];
  if (!item) {
    return;
  }
  var link = document.createElement("a");
  link.href = item.src;
  link.download = `multi-angle-${String(index + 1).padStart(2, "0")}-${item.key}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function downloadBgremoveResults() {
  if (!state.bgremoveResults.length) {
    els.bgremoveStatus.textContent = "Belum ada hasil background removal untuk diunduh.";
    return;
  }

  state.bgremoveResults.forEach((item, index) => {
    var link = document.createElement("a");
    link.href = item.afterSrc;
    link.download = `background-removed-${String(index + 1).padStart(2, "0")}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });

  els.bgremoveStatus.textContent = `${state.bgremoveResults.length} hasil background removal siap diunduh.`;
}

function downloadBgremoveResultAt(index) {
  var item = state.bgremoveResults[index];
  if (!item) {
    return;
  }
  var link = document.createElement("a");
  link.href = item.afterSrc;
  link.download = `background-removed-${String(index + 1).padStart(2, "0")}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function bindUploads() {
  safeBind(els.listingUploadBtn, "click", () => els.listingProductUpload.click());
  safeBind(els.multiUploadBtn, "click", () => els.multiProductUpload.click());
  safeBind(els.bgremoveUploadBtn, "click", () => els.bgremoveUpload.click());
  safeBind(els.aplusUploadBtn, "click", () => els.aplusProductUpload.click());
  safeBind(els.aplusReferenceBtn, "click", () => els.aplusReferenceUpload.click());
  safeBind(els.promptImageBtn, "click", () => els.promptImageUpload.click());

  safeBind(els.listingProductUpload, "change", () => {
    var incomingFiles = Array.from(els.listingProductUpload.files || []);
    state.listingProductFiles = mergeFiles(state.listingProductFiles, incomingFiles, 8);
    renderListingUploadList();
    els.listingProductUpload.value = "";
  });

  safeBind(els.multiProductUpload, "change", () => {
    var incomingFiles = Array.from(els.multiProductUpload.files || []);
    state.multiProductFiles = mergeFiles(state.multiProductFiles, incomingFiles, 8);
    renderMultiUploadList();
    els.multiProductUpload.value = "";
  });

  safeBind(els.bgremoveUpload, "change", () => {
    var incomingFiles = Array.from(els.bgremoveUpload.files || []);
    state.bgremoveFiles = mergeFiles(state.bgremoveFiles, incomingFiles, 8);
    renderBgremoveUploadList();
    els.bgremoveUpload.value = "";
  });

  safeBind(els.aplusProductUpload, "change", () => {
    state.aplusProductFiles = Array.from(els.aplusProductUpload.files || []).slice(0, 5);
    renderThumbnailList(els.aplusUploadList, state.aplusProductFiles);
    updatePreviewFromUploads();
    renderAplusGridFromModules();
    updateAplusCounts();
  });

  safeBind(els.aplusReferenceUpload, "change", () => {
    state.aplusReferenceFiles = Array.from(els.aplusReferenceUpload.files || []).slice(0, 5);
    renderThumbnailList(els.aplusReferenceList, state.aplusReferenceFiles);
    updateAplusCounts();
  });

  safeBind(els.promptImageUpload, "change", () => {
    var incomingFiles = Array.from(els.promptImageUpload.files || []);
    state.promptPreviewFiles = mergeFiles(state.promptPreviewFiles, incomingFiles, 8);
    renderPromptImageList();
    els.promptImageUpload.value = "";
  });
}

function bindModuleCards() {
  els.moduleCards.forEach((card) => {
    card.addEventListener("click", () => {
      var key = card.dataset.moduleKey;
      if (!key) {
        return;
      }

      if (state.selectedModules.has(key)) {
        state.selectedModules.delete(key);
        card.classList.remove("active");
      } else {
        state.selectedModules.add(key);
        card.classList.add("active");
      }

      renderAplusGridFromModules();
      updateAplusCounts();
    });
  });
}

function bindMultiAngleTiles() {
  safeBind(els.multiPromptList, "change", (event) => {
    var input = event.target instanceof HTMLElement ? event.target.closest("[data-multi-prompt-key]") : null;
    if (!input) {
      return;
    }
    var key = input.getAttribute("data-multi-prompt-key");
    if (!key) {
      return;
    }
    state.selectedMultiPromptTouched = true;
    if (input.checked) {
      state.selectedMultiPromptKeys.add(key);
    } else {
      state.selectedMultiPromptKeys.delete(key);
    }
    renderMultiPromptList();
  });

  els.multiAngleTiles.forEach((tile) => {
    tile.addEventListener("click", () => {
      var key = tile.dataset.angleKey;
      if (!key) {
        return;
      }

      if (state.selectedAngles.has(key)) {
        state.selectedAngles.delete(key);
        tile.classList.remove("active");
      } else {
        state.selectedAngles.add(key);
        tile.classList.add("active");
      }

      updateMultiAngleCount();
    });
  });
}

function bindWorkspaceTabs() {
  els.workspaceTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      var target = tab.dataset.workspaceTarget;
      if (target) {
        switchWorkspace(target);
      }
    });
  });
}

function bindEvents() {
  bindWorkspaceTabs();
  bindUploads();
  bindModuleCards();
  bindMultiAngleTiles();
  bindRequestEvents();

  safeBind(els.saveSettingsBtn, "click", saveSettings);
  safeBind(els.clearSettingsBtn, "click", clearSettings);
  safeBind(els.testGptConnectionBtn, "click", async () => {
    els.gptConnectionStatus.textContent = "Menguji...";
    try {
      els.gptConnectionStatus.textContent = await testApiConnection("gpt");
    } catch (error) {
      els.gptConnectionStatus.textContent = error.message.startsWith("Gagal:") ? error.message : `Gagal: ${error.message}`;
    }
  });
  safeBind(els.testGeminiConnectionBtn, "click", async () => {
    els.geminiConnectionStatus.textContent = "Menguji...";
    try {
      els.geminiConnectionStatus.textContent = await testApiConnection("gemini");
    } catch (error) {
      els.geminiConnectionStatus.textContent = error.message.startsWith("Gagal:") ? error.message : `Gagal: ${error.message}`;
    }
  });
  safeBind(els.testFalConnectionBtn, "click", async () => {
    els.falConnectionStatus.textContent = "Menguji...";
    try {
      els.falConnectionStatus.textContent = await testApiConnection("fal");
    } catch (error) {
      els.falConnectionStatus.textContent = error.message.startsWith("Gagal:") ? error.message : `Gagal: ${error.message}`;
    }
  });
  safeBind(els.testCustomConnectionBtn, "click", async () => {
    els.customConnectionStatus.textContent = "Menguji...";
    try {
      els.customConnectionStatus.textContent = await testApiConnection("custom");
    } catch (error) {
      els.customConnectionStatus.textContent = error.message.startsWith("Gagal:") ? error.message : `Gagal: ${error.message}`;
    }
  });
  safeBind(els.folderToggleBtn, "click", () => {
    els.folderDropdown.classList.toggle("hidden");
    els.folderToggleIcon.textContent = els.folderDropdown.classList.contains("hidden") ? "expand_more" : "expand_less";
  });
  [
    els.listingProvider, els.listingImageModel, els.listingQuantity, els.listingSize, els.listingLanguage, els.listingSellingPoints, els.listingTemplate, els.listingPrompt,
    els.multiProvider, els.multiImageModel, els.multiAspectRatio, els.multiTemplate, els.multiPrompt,
    els.aplusProvider, els.aplusImageModel, els.aplusPlatform, els.aplusLanguage, els.aplusAspectRatio, els.aplusPromptPreset, els.aplusSellingPoints, els.aplusDesignRequirements,
    els.bgremoveProvider, els.bgremoveImageModel, els.bgremoveModel, els.bgremovePromptPreset, els.bgremoveLanguage, els.bgremoveResolution, els.bgremoveFormat, els.bgremoveRefine,
    els.falImageSize, els.falQuality
  ].forEach((element) => {
    safeBind(element, "input", updateAllEstimateBadges);
    safeBind(element, "change", updateAllEstimateBadges);
  });
  safeBind(els.promptFeature, "change", () => {
    resetPromptForm(els.promptFeature.value);
  });
  safeBind(els.promptTitle, "input", () => {
    if (!els.promptKey.value.trim() || !state.activePromptKey) {
      els.promptKey.value = slugifyPromptKey(els.promptTitle.value);
    }
  });
  safeBind(els.promptNewBtn, "click", () => {
    resetPromptForm(els.promptFeature.value);
  });
  safeBind(els.promptSaveBtn, "click", () => {
    savePromptFromForm().catch((error) => {
      els.promptStatus.textContent = error.message || "Prompt gagal disimpan.";
    });
  });
  safeBind(els.promptDeleteBtn, "click", () => {
    deletePromptFromForm();
  });
  safeBind(els.promptPreviewBtn, "click", () => {
    previewPromptFromForm();
  });
  safeBind(els.promptList, "click", (event) => {
    var button = event.target instanceof HTMLElement ? event.target.closest("[data-prompt-item]") : null;
    if (!button) {
      return;
    }
    var key = button.getAttribute("data-prompt-item");
    if (!key) {
      return;
    }
    loadPromptIntoForm(state.activePromptFeature, key);
  });
  safeBind(els.brandLogo, "change", async () => {
    var file = els.brandLogo.files?.[0];
    if (!file) {
      state.brandInfo.logoDataUrl = "";
      renderBrandInfo();
      return;
    }

    try {
      state.brandInfo.logoDataUrl = await readFileAsDataUrl(file);
      renderBrandInfo();
      if (els.brandStatus) {
        els.brandStatus.textContent = "Logo brand berhasil dimuat. Klik Simpan Brand Info untuk menyimpan permanen.";
      }
    } catch (error) {
      if (els.brandStatus) {
        els.brandStatus.textContent = error.message;
      }
    }
  });
  safeBind(els.brandSaveBtn, "click", () => {
    collectBrandInfoFromForm();
    saveBrandInfo();
    renderBrandInfo();
    if (els.brandStatus) {
      els.brandStatus.textContent = "Brand information berhasil disimpan dan siap dipakai sebagai acuan generate.";
    }
  });
  safeBind(els.brandClearBtn, "click", () => {
    clearBrandInfo();
  });
  ["input", "change"].forEach((eventName) => {
    safeBind(els.brandName, eventName, () => {
      collectBrandInfoFromForm();
      renderBrandInfo();
    });
    safeBind(els.brandProductCategory, eventName, () => {
      collectBrandInfoFromForm();
      renderBrandInfo();
    });
    safeBind(els.brandStoreReputation, eventName, () => {
      collectBrandInfoFromForm();
      renderBrandInfo();
    });
    safeBind(els.brandDescription, eventName, () => {
      collectBrandInfoFromForm();
      renderBrandInfo();
    });
  });

  safeBind(els.styleModeTrending, "click", () => setStyleMode("trending"));
  safeBind(els.styleModeReference, "click", () => setStyleMode("reference"));

  safeBind(els.oneClickAnalysisBtn, "click", async () => {
    els.aplusGenerateHint.textContent = "Analyzing product brief with GPT...";
    try {
      els.aplusSellingPoints.value = await analyzeAplusSellingPoints();
      els.aplusGenerateHint.textContent = "Product brief berhasil dianalisis dari API Admin.";
    } catch (error) {
      els.aplusSellingPoints.value = `Product name: Premium fashion top
Core selling points: modern silhouette, refined collar contrast, stretch comfort, polished styling
Target audience: women age 20-35
Expected scenes: office, city walk, casual chic lifestyle
Size parameters: S, M, L, XL`;
      els.aplusGenerateHint.textContent = `${error.message} Fallback brief digunakan.`;
    }
    updateAllEstimateBadges();
  });

  safeBind(els.generateSellingPointsBtn, "click", async () => {
    els.aplusGenerateHint.textContent = "Generating selling points with GPT...";
    try {
      els.aplusSellingPoints.value = await analyzeAplusSellingPoints();
      els.aplusGenerateHint.textContent = "Selling points berhasil dibuat dari API Admin.";
    } catch (error) {
      if (!els.aplusSellingPoints.value.trim()) {
        els.aplusSellingPoints.value = `Product name:
Core selling points:
Target audience:
Expected scenes:
Size parameters:`;
      } else {
        els.aplusSellingPoints.value += `\nAdditional value: premium visual storytelling`;
      }
      els.aplusGenerateHint.textContent = `${error.message} Template lokal digunakan.`;
    }
    updateAllEstimateBadges();
  });

  safeBind(els.trendingStyleAnalysisBtn, "click", async () => {
    setStyleMode("trending");
    var moduleSummary = buildAplusModuleSummary();
    var platform = els.aplusPlatform.value;
    var aspectRatio = els.aplusAspectRatio.value;
    var language = els.aplusLanguage.value;
    var sellingPoints = els.aplusSellingPoints.value.trim();
    var aplusPreset = getSelectedPromptContent("aplus", els.aplusPromptPreset.value);

    els.aplusGenerateHint.textContent = "Running GPT trending style analysis...";

    try {
      var content = await backendEnhanceImagePrompt(`Create a trending style analysis for A+ content.
Platform: ${platform}
Aspect ratio: ${aspectRatio}
Language instruction: ${buildLanguageInstruction(language)}
Selling points:
${sellingPoints || "-"}
Prompt preset:
${aplusPreset || "-"}

Include modules as prompt references:
${moduleSummary}

Return a concise style direction, layout guidance, typography cue, color cue, and composition strategy.`, "A+ Trending Style");

      els.aplusDesignRequirements.value = content;
      els.aplusGenerateHint.textContent = "Trending style analysis from GPT berhasil dimuat.";
    } catch (error) {
      els.aplusDesignRequirements.value = `Fallback style direction:
- Platform: ${platform}
- Aspect Ratio: ${aspectRatio}
- Language: ${language}
- Mood: premium clean commercial image
- Composition: hero-led layout with supporting module blocks
- Module reference:
${moduleSummary}`;
      els.aplusGenerateHint.textContent = `${error.message} Fallback style direction digunakan.`;
    }
  });

  safeBind(els.listingTemplate, "change", () => {
    var basePrompt = getSelectedPromptContent("listing", els.listingTemplate.value) || listingTemplatePrompts.premium;
    els.listingPrompt.value = basePrompt;
  });
  safeBind(els.listingProvider, "change", () => {
    syncImageControls(els.listingProvider, els.listingImageModel);
  });
  safeBind(els.aplusProvider, "change", () => {
    syncImageControls(els.aplusProvider, els.aplusImageModel);
  });
  safeBind(els.multiProvider, "change", () => {
    syncImageControls(els.multiProvider, els.multiImageModel);
  });
  safeBind(els.bgremoveProvider, "change", () => {
    syncImageControls(els.bgremoveProvider, els.bgremoveImageModel);
  });

  safeBind(els.aplusPromptPreset, "change", () => {
    var preset = getSelectedPromptContent("aplus", els.aplusPromptPreset.value);
    if (!els.aplusDesignRequirements.value.trim()) {
      els.aplusDesignRequirements.value = preset;
    }
  });

  safeBind(els.listingPreviewModeBtn, "click", () => {
    state.listingPreviewMode = state.listingPreviewMode === "fit" ? "fill" : "fit";
    updateListingCanvasControls();
    renderListingResults();
  });

  safeBind(els.listingAutoLayoutBtn, "click", () => {
    state.listingAutoLayout = !state.listingAutoLayout;
    updateListingCanvasControls();
    renderListingResults();
  });

  safeBind(els.listingDownloadBtn, "click", () => {
    downloadListingResults();
  });
  safeBind(els.listingEnhancePromptBtn, "click", async () => {
    var originalText = els.listingEnhancePromptBtn.textContent;
    els.listingEnhancePromptBtn.textContent = "Enhancing...";
    els.listingEnhancePromptBtn.disabled = true;
    try {
      await enhanceListingPrompt();
    } catch (error) {
      els.listingStatus.textContent = error.message;
    } finally {
      els.listingEnhancePromptBtn.textContent = originalText;
      els.listingEnhancePromptBtn.disabled = false;
    }
  });

  safeBind(els.generateAplusBtn, "click", async () => {
    if (!state.aplusProductFiles.length) {
      els.aplusGenerateHint.textContent = "Please upload at least one product image first";
      return;
    }
    try {
      var generated = await generateAplusImagesWithProvider();
      if (generated) {
        return;
      }
    } catch (error) {
      els.aplusGenerateHint.textContent = `${error.message} Preview lokal tetap dibuat.`;
      updateFeatureProgress("aplus", { active: true, percent: 100, title: "Fallback preview aktif", detail: error.message });
    }
    var platform = els.aplusPlatform.value;
    var aspectRatio = els.aplusAspectRatio.value;
    var language = els.aplusLanguage.value;
    var moduleSummary = buildAplusModuleSummary();
    var aplusPreset = getSelectedPromptContent("aplus", els.aplusPromptPreset.value);
    if (!els.aplusDesignRequirements.value.trim()) {
      try {
        els.aplusDesignRequirements.value = await backendEnhanceImagePrompt(`Build concise A+ generation direction.
Platform: ${platform}
Aspect ratio: ${aspectRatio}
Language instruction: ${buildLanguageInstruction(language)}
Selling points:
${els.aplusSellingPoints.value.trim() || "-"}
Prompt preset:
${aplusPreset || "-"}

Selected modules:
${moduleSummary}

Provide a short generation direction for the selected A+ grid modules.`, "A+ Design Direction");
      } catch (error) {
        els.aplusGenerateHint.textContent = `${error.message} Preview lokal tetap dibuat.`;
      }
    }
    generateAplusPreview();
    var aplusAssets = state.aplusProductFiles.map((file, index) => ({
      src: URL.createObjectURL(file),
      title: `A+ Asset ${index + 1}`
    }));
    addResultsToFolder("aplus", aplusAssets);
    updateFeatureProgress("aplus", { active: true, percent: 100, title: "Preview A+ selesai", detail: `${aplusAssets.length} asset preview sudah ditampilkan.` });
    await saveGenerationToSupabase("aplus_content", {
      platform,
      aspectRatio,
      language,
      brandInfo: state.brandInfo,
      modules: Array.from(state.selectedModules),
      designRequirements: els.aplusDesignRequirements.value.trim()
    });
  });

  safeBind(els.generateListingBtn, "click", async () => {
    var originalText = els.generateListingBtn.textContent;
    els.generateListingBtn.textContent = "Generating...";
    els.generateListingBtn.disabled = true;
    try {
      await generateListingImages();
    } catch (error) {
      state.listingResults = buildListingFallbackResults({
        quantity: Math.min(5, Math.max(1, Number(els.listingQuantity.value) || 1)),
        language: els.listingLanguage.value,
        sellingPoints: els.listingSellingPoints.value.trim(),
        extraPrompt: els.listingPrompt.value.trim(),
        summary: extractSellingPointSummary(els.listingSellingPoints.value.trim())
      });
      renderListingResults();
      addResultsToFolder("listing", state.listingResults.map((item) => ({
        ...item,
        title: item.title
      })));
      els.listingStatus.textContent = `${error.message} Preview lokal ditampilkan sebagai fallback.`;
      updateFeatureProgress("listing", { active: true, percent: 100, title: "Fallback preview aktif", detail: error.message });
    } finally {
      els.generateListingBtn.textContent = originalText;
      els.generateListingBtn.disabled = false;
    }
  });

  safeBind(els.multiTemplate, "change", () => {
    state.selectedMultiPromptKeys.clear();
    state.selectedMultiPromptTouched = false;
    renderMultiPromptList();
    els.multiStatus.textContent = `List prompt aktif: ${els.multiTemplate.options[els.multiTemplate.selectedIndex]?.text || "-"}`;
  });
  safeBind(els.multiPrompt, "input", () => {
    renderMultiPromptList();
  });

  safeBind(els.bgremovePromptPreset, "change", () => {
    els.bgremoveStatus.textContent = `Prompt preset aktif: ${els.bgremovePromptPreset.options[els.bgremovePromptPreset.selectedIndex]?.text || "-"}`;
  });

  safeBind(els.multiSelectAllBtn, "click", () => {
    state.selectedMultiPromptTouched = true;
    getCurrentMultiPromptOptions().forEach((prompt) => state.selectedMultiPromptKeys.add(prompt.key));
    renderMultiPromptList();
  });

  safeBind(els.multiClearBtn, "click", () => {
    state.selectedMultiPromptTouched = true;
    state.selectedMultiPromptKeys.clear();
    renderMultiPromptList();
  });
  safeBind(els.multiEnhancePromptBtn, "click", async () => {
    var originalText = els.multiEnhancePromptBtn.textContent;
    els.multiEnhancePromptBtn.textContent = "Enhancing...";
    els.multiEnhancePromptBtn.disabled = true;
    try {
      await enhanceSelectedMultiPrompts();
    } catch (error) {
      els.multiStatus.textContent = error.message;
    } finally {
      els.multiEnhancePromptBtn.textContent = originalText;
      els.multiEnhancePromptBtn.disabled = false;
    }
  });
  safeBind(els.multiClearEnhancedBtn, "click", () => {
    state.multiEnhancedPrompts = {};
    if (els.multiEnhancedPromptOutput) {
      els.multiEnhancedPromptOutput.value = "";
    }
    els.multiStatus.textContent = "Enhanced prompt dibersihkan.";
  });

  safeBind(els.generateMultiBtn, "click", async () => {
    var originalText = els.generateMultiBtn.textContent;
    els.generateMultiBtn.textContent = "Generating...";
    els.generateMultiBtn.disabled = true;
    try {
      await generateMultiAngleImages();
    } catch (error) {
      if (!state.multiResults.length) {
        state.multiResults = buildMultiAngleFallbackResults(getSelectedAngleDefinitions());
        renderMultiAngleResults();
        addResultsToFolder("multi", state.multiResults);
        els.multiStatus.textContent = `${error.message} Preview lokal multi-angle ditampilkan sebagai fallback.`;
        updateFeatureProgress("multi", { active: true, percent: 100, title: "Fallback preview aktif", detail: error.message });
      } else {
        els.multiStatus.textContent = `${error.message} Hasil AI yang sudah jadi tetap dipertahankan.`;
        updateFeatureProgress("multi", { active: true, percent: 100, title: "Generate multi-angle selesai dengan kendala", detail: error.message });
      }
    } finally {
      els.generateMultiBtn.textContent = originalText;
      els.generateMultiBtn.disabled = false;
    }
  });

  safeBind(els.multiDownloadBtn, "click", () => {
    downloadMultiResults();
  });

  safeBind(els.generateBgremoveBtn, "click", async () => {
    var originalText = els.generateBgremoveBtn.textContent;
    els.generateBgremoveBtn.textContent = "Processing...";
    els.generateBgremoveBtn.disabled = true;
    try {
      await generateBackgroundRemoval();
    } catch (error) {
      if (!state.bgremoveResults.length) {
        state.bgremoveResults = buildBgremoveFallbackResults();
        renderBgremoveResults();
      }
      els.bgremoveStatus.textContent = `${error.message} Preview lokal before/after ditampilkan sebagai fallback.`;
      updateFeatureProgress("bgremove", { active: true, percent: 100, title: "Fallback preview aktif", detail: error.message });
    } finally {
      els.generateBgremoveBtn.textContent = originalText;
      els.generateBgremoveBtn.disabled = false;
    }
  });

  safeBind(els.bgremoveDownloadBtn, "click", () => {
    downloadBgremoveResults();
  });

  safeBind(els.multiPreviewGrid, "click", (event) => {
    var button = event.target instanceof HTMLElement ? event.target.closest("[data-multi-download-index]") : null;
    if (!button) {
      return;
    }
    var index = Number(button.getAttribute("data-multi-download-index"));
    downloadMultiResultAt(index);
  });

  safeBind(els.bgremovePreviewGrid, "click", (event) => {
    var button = event.target instanceof HTMLElement ? event.target.closest("[data-bgremove-download-index]") : null;
    if (!button) {
      return;
    }
    var index = Number(button.getAttribute("data-bgremove-download-index"));
    downloadBgremoveResultAt(index);
  });
}

function init() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(getSettings()));
  ensureBackendGatewayField();
  loadFolderLibrary();
  loadBrandInfo();
  loadPromptStore();
  loadRequestHistory();
  loadSettingsIntoForm();
  syncAllImageControls();
  renderBrandInfo();
  updateApiStatus();
  updateFolderCounts();
  updateAplusCounts();
  setStyleMode("trending");
  switchWorkspace("listing-images");
  renderListingUploadList();
  renderMultiUploadList();
  renderBgremoveUploadList();
  renderMultiPromptList();
  updateMultiAngleCount();
  updateListingCanvasControls();
  renderListingResults();
  renderMultiAngleResults();
  renderBgremoveResults();
  renderAplusGridFromModules();
  syncPromptSelectors();
  els.listingPrompt.value = getSelectedPromptContent("listing", els.listingTemplate.value) || listingTemplatePrompts.premium;
  if (els.aplusPromptPreset.value) {
    els.aplusDesignRequirements.value = getSelectedPromptContent("aplus", els.aplusPromptPreset.value);
  }
  renderPromptImageList();
  renderRequestHistory();
  resetFeatureProgress("listing");
  resetFeatureProgress("aplus");
  resetFeatureProgress("multi");
  resetFeatureProgress("bgremove");
  updateAllEstimateBadges();
  if (state.requestHistory.length) {
    renderRequestDetail(state.activeRequestId || state.requestHistory[0].id);
  }
  resetPromptForm("listing");
  bindEvents();
}

init();

