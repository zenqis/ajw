const STORAGE_KEY = "affiliate-media-studio-settings";
const FOLDER_STORAGE_KEY = "affiliate-media-studio-folders";
const PROMPT_STORAGE_KEY = "affiliate-media-studio-prompts";
const BRAND_INFO_STORAGE_KEY = "affiliate-media-studio-brand-info";
const DEFAULT_OPENAI_IMAGE_MODEL = "gpt-image-1";
const DEFAULT_COMPAT_IMAGE_MODEL = "nano-banana-pro";
const defaultCorePrompt = "Keep the original product or subject identity unchanged. Do not alter the object's shape, materials, logo, proportions, color accuracy, construction, or key product details unless explicitly requested. Preserve realism, natural lighting logic, consistent perspective, stable geometry, clean edges, and believable textures. Keep the composition commercially usable, visually consistent, and natural. Avoid adding unrelated objects, extra hands, extra parts, duplicated products, distorted packaging, or unrealistic edits.";
const defaultBrandInfo = {
  name: "",
  logoDataUrl: "",
  productCategory: "",
  storeReputation: "",
  description: ""
};

const aplusModules = [
  "hero-shot",
  "selling-points",
  "lifestyle-scene",
  "multi-angle-view",
  "atmosphere-scene",
  "product-detail"
];

const listingTemplatePrompts = {
  premium: "Create a premium hero marketplace visual with elevated studio lighting, premium reflections, elegant typography hierarchy, space for headline overlays, and a polished high-conversion composition.",
  marketplace: "Create a clean catalog-style listing image with bright balanced lighting, sharp product clarity, trusted marketplace-safe composition, and concise commercial messaging placement.",
  affiliate: "Create an aggressive promo listing visual with bold campaign energy, discount-driven composition, conversion-focused hierarchy, urgency styling, and eye-catching product emphasis.",
  trust: "Create a bestseller trust-building listing visual with review-driven cues, premium cleanliness, reassuring composition, and subtle authority elements that feel credible and platform compliant.",
  luxury: "Create a luxury editorial fishing gear visual with dramatic mood lighting, rich material detail, refined typography space, premium brand storytelling, and upscale commercial polish.",
  detail: "Create a close-up product detail visual highlighting texture, finishing, materials, craftsmanship, and precision design details with sharp macro emphasis and premium information spacing.",
  comparison: "Create a feature comparison listing layout with clear benefit separation, structured copy hierarchy, icon-friendly negative space, and easy-to-scan product advantage storytelling.",
  lifestyle: "Create a lifestyle-driven listing visual that shows realistic product usage in a believable environment, natural aspirational mood, and product-centered storytelling for stronger buying intent."
};

const multiAngleTemplatePrompts = {
  studio: "Create clean white-background multi-angle product renders with consistent lighting, neutral shadows, centered framing, and precise product geometry.",
  catalog: "Create marketplace-safe multi-angle product images with balanced shadows, true color accuracy, clean background, and consistent catalog composition.",
  editorial: "Create premium editorial multi-angle product images with soft directional lighting, refined highlights, and luxurious but clean presentation.",
  technical: "Create precise technical angle-sheet product images with consistent distance, structured camera positions, and geometry-preserving composition."
};

const defaultPromptStore = {
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
    { key: "studio", title: "Studio White Product Set", content: multiAngleTemplatePrompts.studio },
    { key: "catalog", title: "Clean Marketplace Catalog", content: multiAngleTemplatePrompts.catalog },
    { key: "editorial", title: "Premium Editorial Turntable", content: multiAngleTemplatePrompts.editorial },
    { key: "technical", title: "Technical Angle Sheet", content: multiAngleTemplatePrompts.technical }
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

const els = {
  workspaceTabs: document.querySelectorAll(".workspace-tab"),
  workspacePanels: document.querySelectorAll(".workspace-panel"),
  apiStatus: document.getElementById("apiStatus"),
  gptApiKey: document.getElementById("gptApiKey"),
  gptApiBaseUrl: document.getElementById("gptApiBaseUrl"),
  backendApiBaseUrl: document.getElementById("backendApiBaseUrl"),
  testGptConnectionBtn: document.getElementById("testGptConnectionBtn"),
  gptConnectionStatus: document.getElementById("gptConnectionStatus"),
  geminiApiKey: document.getElementById("geminiApiKey"),
  geminiApiBaseUrl: document.getElementById("geminiApiBaseUrl"),
  geminiImageModel: document.getElementById("geminiImageModel"),
  testGeminiConnectionBtn: document.getElementById("testGeminiConnectionBtn"),
  geminiConnectionStatus: document.getElementById("geminiConnectionStatus"),
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
  listingLanguage: document.getElementById("listingLanguage"),
  listingSellingPoints: document.getElementById("listingSellingPoints"),
  listingTemplate: document.getElementById("listingTemplate"),
  listingPrompt: document.getElementById("listingPrompt"),
  generateListingBtn: document.getElementById("generateListingBtn"),
  listingStatus: document.getElementById("listingStatus"),
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
  multiAspectRatio: document.getElementById("multiAspectRatio"),
  multiLanguage: document.getElementById("multiLanguage"),
  multiSellingPoints: document.getElementById("multiSellingPoints"),
  multiTemplate: document.getElementById("multiTemplate"),
  multiPrompt: document.getElementById("multiPrompt"),
  multiAngleTiles: document.querySelectorAll(".multi-angle-tile"),
  multiAngleCountLabel: document.getElementById("multiAngleCountLabel"),
  multiHeroSubtitle: document.getElementById("multiHeroSubtitle"),
  multiSelectAllBtn: document.getElementById("multiSelectAllBtn"),
  multiClearBtn: document.getElementById("multiClearBtn"),
  generateMultiBtn: document.getElementById("generateMultiBtn"),
  multiStatus: document.getElementById("multiStatus"),
  multiPreviewGrid: document.getElementById("multiPreviewGrid"),
  multiDownloadBtn: document.getElementById("multiDownloadBtn"),
  bgremoveUpload: document.getElementById("bgremoveUpload"),
  bgremoveUploadBtn: document.getElementById("bgremoveUploadBtn"),
  bgremoveCount: document.getElementById("bgremoveCount"),
  bgremoveUploadList: document.getElementById("bgremoveUploadList"),
  bgremoveModel: document.getElementById("bgremoveModel"),
  bgremovePromptPreset: document.getElementById("bgremovePromptPreset"),
  bgremoveLanguage: document.getElementById("bgremoveLanguage"),
  bgremoveResolution: document.getElementById("bgremoveResolution"),
  bgremoveFormat: document.getElementById("bgremoveFormat"),
  bgremoveRefine: document.getElementById("bgremoveRefine"),
  generateBgremoveBtn: document.getElementById("generateBgremoveBtn"),
  bgremoveStatus: document.getElementById("bgremoveStatus"),
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
  aplusHeroImage: document.getElementById("aplusHeroImage"),
  aplusCard2Image: document.getElementById("aplusCard2Image"),
  aplusCard3Image: document.getElementById("aplusCard3Image"),
  aplusPreviewGrid: document.getElementById("aplusPreviewGrid"),
  promptFeature: document.getElementById("promptFeature"),
  promptCore: document.getElementById("promptCore"),
  promptTitle: document.getElementById("promptTitle"),
  promptKey: document.getElementById("promptKey"),
  promptContent: document.getElementById("promptContent"),
  promptNewBtn: document.getElementById("promptNewBtn"),
  promptSaveBtn: document.getElementById("promptSaveBtn"),
  promptDeleteBtn: document.getElementById("promptDeleteBtn"),
  promptStatus: document.getElementById("promptStatus"),
  promptCount: document.getElementById("promptCount"),
  promptList: document.getElementById("promptList")
};

const state = {
  listingProductFiles: [],
  listingResults: [],
  listingPreviewMode: "fill",
  listingAutoLayout: false,
  multiProductFiles: [],
  multiResults: [],
  bgremoveFiles: [],
  bgremoveResults: [],
  promptStore: JSON.parse(JSON.stringify(defaultPromptStore)),
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
  activeStyleMode: "trending"
};

function getSettings() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return normalizeSettings({
      gptApiKey: "",
      gptApiBaseUrl: "https://api.openai.com/v1",
      imageModel: DEFAULT_OPENAI_IMAGE_MODEL,
      geminiApiKey: "",
      geminiApiBaseUrl: "https://generativelanguage.googleapis.com/v1beta",
      geminiImageModel: "gemini-2.0-flash-preview-image-generation",
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
  const gptApiBaseUrl = (settings.gptApiBaseUrl || settings.apiBaseUrl || "https://api.openai.com/v1").replace(/\/+$/, "");
  const fallbackModel = getDefaultImageModelForBaseUrl(gptApiBaseUrl);
  const legacyModel = settings.imageModel;
  const imageModel = !legacyModel || legacyModel === "gpt-image-2"
    ? fallbackModel
    : legacyModel;

  return {
    gptApiKey: settings.gptApiKey || settings.apiKey || "",
    gptApiBaseUrl,
    imageModel,
    geminiApiKey: settings.geminiApiKey || "",
    geminiApiBaseUrl: (settings.geminiApiBaseUrl || "https://generativelanguage.googleapis.com/v1beta").replace(/\/+$/, ""),
    geminiImageModel: settings.geminiImageModel || "gemini-2.0-flash-preview-image-generation",
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
  const settings = getSettings();
  const apiKey = settings.gptApiKey || settings.apiKey;
  const apiBaseUrl = settings.gptApiBaseUrl || settings.apiBaseUrl || "https://api.openai.com/v1";
  if (!apiKey) {
    throw new Error("API key belum diisi di menu Admin.");
  }

  const response = await fetch(`${apiBaseUrl}/chat/completions`, {
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

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload?.error?.message || "Permintaan GPT gagal.");
  }

  const content = payload?.choices?.[0]?.message?.content?.trim();
  if (!content) {
    throw new Error("GPT tidak mengembalikan konten.");
  }

  return content;
}

function getBackendApiBaseUrl() {
  const settings = getSettings();
  const configured = String(settings.backendApiBaseUrl || "").trim();
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
  const anchor = els.customProviderName && els.customProviderName.closest ? els.customProviderName.closest(".gi-field") : null;
  const grid = anchor && anchor.parentElement;
  if (!grid) {
    return;
  }
  const field = document.createElement("label");
  field.className = "gi-field";
  field.innerHTML = '<span class="gi-label">Backend API Base</span><input id="backendApiBaseUrl" placeholder="http://localhost:3010">';
  grid.insertBefore(field, anchor);
  els.backendApiBaseUrl = document.getElementById("backendApiBaseUrl");
}

async function postBackendJson(path, payload, fallbackMessage) {
  const response = await fetch(`${getBackendApiBaseUrl()}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload || {})
  });
  let data = {};
  const text = await response.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = {
        __rawMessage: text.replace(/\s+/g, " ").trim().slice(0, 180)
      };
    }
  }
  if (!response.ok || data?.ok === false) {
    throw new Error(data?.error || data?.message || data?.detail || data?.__rawMessage || fallbackMessage);
  }
  return data;
}

async function serializeFilesForBackend(files, maxFiles = 5) {
  return Promise.all((files || []).slice(0, maxFiles).map(async (file) => ({
    name: file.name,
    dataUrl: await readFileAsDataUrl(file)
  })));
}

async function backendEnhanceImagePrompt(rawPrompt, contextLabel) {
  try {
    const data = await postBackendJson("/api/ai/prompt/enhance", {
      rawPrompt,
      contextLabel
    }, "Enhance prompt via backend gagal.");
    const text = String(data?.output?.text || "").trim();
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

function dataUrlToFile(dataUrl, fileName = "image.png") {
  const match = String(dataUrl || "").match(/^data:([^;]+);base64,(.+)$/);
  if (!match) {
    throw new Error(`Data URL tidak valid untuk ${fileName}`);
  }
  const mime = String(match[1] || "application/octet-stream");
  const binary = atob(match[2]);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return new File([bytes], fileName, { type: mime });
}

function buildDirectImagePrompt(feature, payload = {}) {
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
    payload.sellingPoints || ""
  ].filter(Boolean).join("\n");
}

async function directGenerateImage(feature, payload = {}) {
  const imageRequest = resolveImageRequestSettings(getSettings().imageModel);
  if (!imageRequest.apiKey) {
    throw new Error("API key gambar belum diisi dan backend tidak aktif.");
  }
  const prompt = buildDirectImagePrompt(feature, payload);
  const files = Array.isArray(payload.images) ? payload.images : [];
  if (!files.length) {
    throw new Error("Gambar referensi belum tersedia.");
  }
  const formData = new FormData();
  formData.append("model", imageRequest.model);
  formData.append("prompt", prompt);
  formData.append("quality", "high");
  const size = payload.imageSize || payload.aspectRatio;
  if (size && size !== "auto") {
    formData.append("size", size);
  }
  files.forEach((file, index) => {
    formData.append("image[]", dataUrlToFile(file.dataUrl, file.name || `image-${index + 1}.png`), file.name || `image-${index + 1}.png`);
  });
  const response = await fetch(`${imageRequest.apiBaseUrl}/images/edits`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${imageRequest.apiKey}`
    },
    body: formData
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(normalizeImageErrorMessage(data?.error?.message || "Generate image gagal."));
  }
  const base64Image = data?.data?.[0]?.b64_json;
  const imageUrl = data?.data?.[0]?.url || "";
  if (!base64Image && !imageUrl) {
    throw new Error("API gambar tidak mengembalikan hasil.");
  }
  return {
    cached: false,
    prompt,
    task: {
      provider: "direct-browser",
      model: imageRequest.model
    },
    images: [{ src: base64Image ? `data:image/png;base64,${base64Image}` : imageUrl }]
  };
}

async function backendGenerateImage(feature, payload) {
  try {
    const data = await postBackendJson("/api/ai/generate-image", {
      feature,
      ...(payload || {})
    }, "Generate image via backend gagal.");
    const images = Array.isArray(data?.output?.images) ? data.output.images : [];
    if (!images.length || !images[0].src) {
      throw new Error("Backend tidak mengembalikan hasil gambar.");
    }
    return {
      cached: !!data.cached,
      prompt: String(data?.prompt || "").trim(),
      task: data?.task || {},
      images
    };
  } catch (error) {
    return directGenerateImage(feature, payload);
  }
}

function loadSettingsIntoForm() {
  const settings = getSettings();
  els.gptApiKey.value = settings.gptApiKey || settings.apiKey || "";
  els.gptApiBaseUrl.value = settings.gptApiBaseUrl || settings.apiBaseUrl || "https://api.openai.com/v1";
  els.geminiApiKey.value = settings.geminiApiKey || "";
  els.geminiApiBaseUrl.value = settings.geminiApiBaseUrl || "https://generativelanguage.googleapis.com/v1beta";
  els.geminiImageModel.value = settings.geminiImageModel || "gemini-2.0-flash-preview-image-generation";
  if (els.backendApiBaseUrl) {
    els.backendApiBaseUrl.value = settings.backendApiBaseUrl || "http://localhost:3010";
  }
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
  const settings = getSettings();
  const hasApiKey = Boolean(settings.gptApiKey || settings.geminiApiKey || settings.customApiKey || settings.apiKey);
  els.apiStatus.textContent = hasApiKey ? "API siap digunakan" : "API belum disetel";
  els.apiStatus.classList.toggle("ready", hasApiKey);
}

function saveSettings() {
  const settings = normalizeSettings({
    gptApiKey: els.gptApiKey.value.trim(),
    gptApiBaseUrl: (els.gptApiBaseUrl.value.trim() || "https://api.openai.com/v1").replace(/\/+$/, ""),
    imageModel: getDefaultImageModelForBaseUrl(els.gptApiBaseUrl.value.trim() || "https://api.openai.com/v1"),
    geminiApiKey: els.geminiApiKey.value.trim(),
    geminiApiBaseUrl: (els.geminiApiBaseUrl.value.trim() || "https://generativelanguage.googleapis.com/v1beta").replace(/\/+$/, ""),
    geminiImageModel: els.geminiImageModel.value.trim() || "gemini-2.0-flash-preview-image-generation",
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
}

function resolveImageModel(selectedValue) {
  const settings = getSettings();
  if (selectedValue === "custom") {
    return settings.customImageModel || settings.imageModel || DEFAULT_COMPAT_IMAGE_MODEL;
  }
  if (selectedValue === "gpt-image-2") {
    return getDefaultImageModelForBaseUrl(settings.gptApiBaseUrl);
  }
  return selectedValue || settings.imageModel || getDefaultImageModelForBaseUrl(settings.gptApiBaseUrl);
}

function resolveImageRequestSettings(selectedValue) {
  const settings = getSettings();
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
  const settings = getSettings();
  if (kind === "gpt") {
    const apiBaseUrl = settings.gptApiBaseUrl || "https://api.openai.com/v1";
    const apiKey = settings.gptApiKey || "";
    if (!apiKey) {
      throw new Error("API key GPT belum diisi.");
    }
    const response = await fetch(`${apiBaseUrl}/models`, {
      headers: { Authorization: `Bearer ${apiKey}` }
    });
    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      throw new Error(payload?.error?.message || "Koneksi GPT gagal.");
    }
    return "Koneksi GPT berhasil.";
  }

  if (kind === "gemini") {
    const apiBaseUrl = settings.geminiApiBaseUrl || "https://generativelanguage.googleapis.com/v1beta";
    const apiKey = settings.geminiApiKey || "";
    if (!apiKey) {
      throw new Error("API key Gemini belum diisi.");
    }
    const response = await fetch(`${apiBaseUrl}/models?key=${encodeURIComponent(apiKey)}`);
    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      throw new Error(payload?.error?.message || "Koneksi Gemini gagal.");
    }
    return "Koneksi Gemini berhasil.";
  }

  const apiBaseUrl = settings.customApiBaseUrl || "";
  const apiKey = settings.customApiKey || "";
  if (!apiBaseUrl || !apiKey) {
    throw new Error("API custom belum lengkap.");
  }
  const response = await fetch(`${apiBaseUrl}/models`, {
    headers: { Authorization: `Bearer ${apiKey}` }
  });
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload?.error?.message || "Koneksi custom provider gagal.");
  }
  return "Koneksi custom provider berhasil.";
}

function clearSettings() {
  localStorage.removeItem(STORAGE_KEY);
  loadSettingsIntoForm();
  updateApiStatus();
}

function loadFolderLibrary() {
  const raw = localStorage.getItem(FOLDER_STORAGE_KEY);
  if (!raw) {
    return;
  }

  try {
    const parsed = JSON.parse(raw);
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
  const raw = localStorage.getItem(BRAND_INFO_STORAGE_KEY);
  if (!raw) {
    state.brandInfo = { ...defaultBrandInfo };
    return;
  }

  try {
    const parsed = JSON.parse(raw);
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

  const logo = state.brandInfo.logoDataUrl || "";
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
    const meta = [
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
  const parts = [
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
  const raw = localStorage.getItem(PROMPT_STORAGE_KEY);
  if (!raw) {
    state.promptStore = JSON.parse(JSON.stringify(defaultPromptStore));
    state.corePrompt = defaultCorePrompt;
    return;
  }

  try {
    const parsed = JSON.parse(raw);
    state.promptStore = {
      listing: Array.isArray(parsed.listing) && parsed.listing.length ? parsed.listing : defaultPromptStore.listing,
      aplus: Array.isArray(parsed.aplus) && parsed.aplus.length ? parsed.aplus : defaultPromptStore.aplus,
      multi_angle: Array.isArray(parsed.multi_angle) && parsed.multi_angle.length ? parsed.multi_angle : defaultPromptStore.multi_angle,
      bgremove: Array.isArray(parsed.bgremove) && parsed.bgremove.length ? parsed.bgremove : defaultPromptStore.bgremove
    };
    state.corePrompt = typeof parsed.corePrompt === "string" && parsed.corePrompt.trim()
      ? parsed.corePrompt.trim()
      : defaultCorePrompt;
  } catch {
    state.promptStore = JSON.parse(JSON.stringify(defaultPromptStore));
    state.corePrompt = defaultCorePrompt;
  }
}

function isStorageQuotaError(error) {
  const name = String(error?.name || "");
  const message = String(error?.message || "");
  return name === "QuotaExceededError" || name === "NS_ERROR_DOM_QUOTA_REACHED" || /quota|exceeded/i.test(message);
}

function compactPromptStoreForStorage() {
  const compact = {};
  ["listing", "multi_angle", "aplus", "bgremove"].forEach((feature) => {
    compact[feature] = (state.promptStore[feature] || []).map((prompt) => ({
      ...prompt,
      content: String(prompt.content || "").slice(0, 12000),
      images: []
    }));
  });
  compact.corePrompt = state.corePrompt || defaultCorePrompt;
  return compact;
}

function savePromptStore() {
  try {
    localStorage.setItem(PROMPT_STORAGE_KEY, JSON.stringify({
      ...state.promptStore,
      corePrompt: state.corePrompt || defaultCorePrompt
    }));
    return true;
  } catch (error) {
    if (!isStorageQuotaError(error)) throw error;
  }
  try {
    localStorage.setItem(PROMPT_STORAGE_KEY, JSON.stringify(compactPromptStoreForStorage()));
    if (els.promptStatus) els.promptStatus.textContent = "Penyimpanan browser penuh. Prompt tersimpan tanpa thumbnail agar generate tetap berjalan.";
    return true;
  } catch (error) {
    console.warn("Prompt store could not be saved", error);
    if (els.promptStatus) els.promptStatus.textContent = "Prompt aktif tetap dipakai, tetapi riwayat prompt tidak bisa disimpan karena storage browser penuh.";
    return false;
  }
}

function getCorePrompt() {
  return (state.corePrompt || defaultCorePrompt).trim();
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

function findPromptByKey(feature, key) {
  return getPromptOptions(feature).find((item) => item.key === key);
}

function populateSelectFromPrompts(selectEl, feature, fallbackKey = "") {
  if (!selectEl) {
    return;
  }
  const prompts = getPromptOptions(feature);
  selectEl.innerHTML = prompts
    .map((prompt) => `<option value="${prompt.key}">${prompt.title}</option>`)
    .join("");

  const preferred = prompts.some((item) => item.key === fallbackKey) ? fallbackKey : prompts[0]?.key || "";
  if (preferred) {
    selectEl.value = preferred;
  }
}

function syncPromptSelectors() {
  populateSelectFromPrompts(els.listingTemplate, "listing", els.listingTemplate.value);
  populateSelectFromPrompts(els.multiTemplate, "multi_angle", els.multiTemplate.value);
  populateSelectFromPrompts(els.aplusPromptPreset, "aplus", els.aplusPromptPreset?.value || "");
  populateSelectFromPrompts(els.bgremovePromptPreset, "bgremove", els.bgremovePromptPreset?.value || "");
}

function renderPromptList() {
  const prompts = getPromptOptions(state.activePromptFeature);
  els.promptCount.textContent = `${prompts.length} preset`;
  els.promptList.innerHTML = prompts
    .map(
      (prompt) => `
        <button class="prompt-card ${prompt.key === state.activePromptKey ? "active" : ""}" data-prompt-item="${prompt.key}" type="button">
          <strong>${prompt.title}</strong>
          <span>${prompt.key}</span>
          <p>${prompt.content.slice(0, 140)}</p>
        </button>
      `
    )
    .join("");
}

function loadPromptIntoForm(feature, key) {
  state.activePromptFeature = feature;
  state.activePromptKey = key;
  const prompt = findPromptByKey(feature, key);
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
  renderPromptList();
}

function resetPromptForm(feature = state.activePromptFeature) {
  state.activePromptFeature = feature;
  state.activePromptKey = "";
  els.promptFeature.value = feature;
  els.promptCore.value = getCorePrompt();
  els.promptTitle.value = "";
  els.promptKey.value = "";
  els.promptContent.value = "";
  els.promptStatus.textContent = "Buat prompt baru atau pilih prompt yang sudah ada.";
  renderPromptList();
}

function getSelectedPromptContent(feature, key) {
  return findPromptByKey(feature, key)?.content || "";
}

function buildCorePromptBlock() {
  const blocks = [
    `Core prompt instruction:
${getCorePrompt()}`
  ];
  const brandBlock = buildBrandInformationBlock();
  if (brandBlock) {
    blocks.push(brandBlock);
  }
  return blocks.join("\n\n");
}

function savePromptFromForm() {
  const nextCorePrompt = els.promptCore.value.trim() || defaultCorePrompt;
  state.corePrompt = nextCorePrompt;
  const feature = els.promptFeature.value;
  const title = els.promptTitle.value.trim();
  const key = slugifyPromptKey(els.promptKey.value || title);
  const content = els.promptContent.value.trim();

  if (!title && !key && !content) {
    savePromptStore();
    els.promptStatus.textContent = "Prompt Core berhasil disimpan.";
    return;
  }

  if (!title || !key || !content) {
    els.promptStatus.textContent = "Untuk preset prompt, title, key, dan content wajib diisi.";
    return;
  }

  const prompts = getPromptOptions(feature);
  const existingIndex = prompts.findIndex((item) => item.key === key);
  const nextPrompt = { key, title, content };

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
  state.corePrompt = els.promptCore.value.trim() || defaultCorePrompt;
  const feature = els.promptFeature.value;
  const key = els.promptKey.value.trim();
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

  const normalized = items.map((item) => ({
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
  const merged = [...existingFiles];

  incomingFiles.forEach((file) => {
    const exists = merged.some(
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
  const settings = getSettings();
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
  const file = input.files?.[0];
  if (!file) {
    imgElement.removeAttribute("src");
    imgElement.classList.add("hidden");
    return;
  }

  const url = URL.createObjectURL(file);
  imgElement.src = url;
  imgElement.classList.remove("hidden");
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
    reader.onerror = () => reject(new Error("Gagal membaca file logo."));
    reader.readAsDataURL(file);
  });
}

function switchWorkspace(target) {
  state.activeWorkspace = target;

  els.workspaceTabs.forEach((tab) => {
    const isActive = tab.dataset.workspaceTarget === target;
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
}

function safeBind(element, eventName, handler) {
  if (!element) {
    return;
  }
  element.addEventListener(eventName, handler);
}

function renderThumbnailList(container, files) {
  if (!files.length) {
    container.innerHTML = "";
    return;
  }

  container.innerHTML = files
    .map((file, index) => {
      const url = URL.createObjectURL(file);
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
}

function renderMultiUploadList() {
  renderThumbnailList(els.multiUploadList, state.multiProductFiles);
  els.multiProductCount.textContent = `${state.multiProductFiles.length}/8`;
}

function renderBgremoveUploadList() {
  renderThumbnailList(els.bgremoveUploadList, state.bgremoveFiles);
  els.bgremoveCount.textContent = `${state.bgremoveFiles.length}/8`;
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
      const title = item.title || `Listing Variant ${index + 1}`;
      const description = item.description || "AI-generated product image preview.";
      const badges = Array.isArray(item.badges) ? item.badges : [];
      return `
      <article class="listing-card ${index === 0 ? "main" : ""}">
        <img src="${item.src}" alt="Listing image ${index + 1}">
        <div class="listing-label">${String(index + 1).padStart(2, "0")}</div>
        <div class="listing-copy">
          <strong>${title}</strong>
          <p>${description}</p>
          <div class="listing-badge-row">
            ${badges.map((badge) => `<span class="listing-badge">${badge}</span>`).join("")}
          </div>
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
  const total = els.multiAngleTiles.length;
  const selected = state.selectedAngles.size;
  const label = `${selected} angles selected`;
  if (els.multiAngleCountLabel) {
    els.multiAngleCountLabel.textContent = label;
  }
  if (els.multiHeroSubtitle) {
    els.multiHeroSubtitle.innerHTML = `Upload a product photo, <strong class="text-white">AI generates ${selected || 0} selected angle${selected === 1 ? "" : "s"} automatically</strong>`;
  }
  if (els.generateMultiBtn) {
    els.generateMultiBtn.textContent = selected ? `Generate ${selected} Angles` : "Generate Multi-Angle";
  }
}

function updateAplusCounts() {
  els.aplusProductCount.textContent = `${state.aplusProductFiles.length}/5`;
  els.aplusReferenceCount.textContent = `${state.aplusReferenceFiles.length}/5`;
  els.aplusModuleCount.textContent = `${state.selectedModules.size}/16 selected`;
  const canGenerate = state.aplusProductFiles.length > 0;
  els.aplusGenerateHint.textContent = canGenerate
    ? "Ready to generate professional A+ content images"
    : "Please upload at least one product image first";
}

function setStyleMode(mode) {
  state.activeStyleMode = mode;
  const trending = mode === "trending";
  els.styleModeTrending.classList.toggle("active", trending);
  els.styleModeReference.classList.toggle("active", !trending);
  els.styleModeTrending.classList.toggle("text-neutral-400", !trending);
  els.styleModeReference.classList.toggle("text-neutral-400", trending);
  els.trendingStylePanel.classList.toggle("hidden", !trending);
  els.referenceStylePanel.classList.toggle("hidden", trending);
}

function updatePreviewFromUploads() {
  const [hero, second, third] = state.aplusProductFiles;
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
  const selectedCards = getSelectedModuleCards();
  if (!selectedCards.length) {
    return "No module selected";
  }

  return selectedCards
    .map((card) => {
      const label = card.dataset.moduleLabel || card.querySelector("strong")?.textContent?.trim() || "Module";
      const description = card.dataset.moduleDescription || card.querySelector("span:last-child")?.textContent?.trim() || "";
      return `${label}: ${description}`;
    })
    .join("\n");
}

function renderAplusGridFromModules() {
  const selectedCards = getSelectedModuleCards().slice(0, 7);
  const uploadedUrls = state.aplusProductFiles.map((file) => URL.createObjectURL(file));
  const language = els.aplusLanguage?.value || "English";
  const fallbackImages = [
    "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=900&q=80"
  ];

  const cardsMarkup = selectedCards.map((card, index) => {
    const label = card.dataset.moduleLabel || card.querySelector("strong")?.textContent?.trim() || `Module ${index + 1}`;
    const description = card.dataset.moduleDescription || card.querySelector("span:last-child")?.textContent?.trim() || "";
    const localizedDescription = getLanguageLabel(language, {
      Indonesia: description,
      English: description,
      Chinese: description
    });
    const isImageCard = index < 3;
    const imageSrc = uploadedUrls[index % Math.max(uploadedUrls.length, 1)] || fallbackImages[index] || fallbackImages[0];
    const cardClass = index === 0 ? "aplus-card aplus-hero" : "aplus-card";

    if (isImageCard) {
      return `
        <article class="${cardClass}">
          <img src="${imageSrc}" alt="${label}">
          <div class="aplus-card-label">${String(index + 1).padStart(2, "0")}</div>
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
  const language = els.aplusLanguage?.value || "English";
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

function getSelectedAngleDefinitions() {
  const language = els.multiLanguage?.value || "English";
  return Array.from(els.multiAngleTiles)
    .filter((tile) => state.selectedAngles.has(tile.dataset.angleKey || ""))
    .map((tile) => ({
      key: tile.dataset.angleKey || "",
      name: localizeMultiAngleName(tile.dataset.angleName || "Angle", language),
      prompt: tile.dataset.anglePrompt || ""
    }));
}

function renderMultiAngleResults() {
  if (!state.multiResults.length) {
    els.multiPreviewGrid.innerHTML = `<div class="multi-empty">Belum ada hasil multi-angle yang dihasilkan.</div>`;
    return;
  }

  els.multiPreviewGrid.innerHTML = state.multiResults
    .map((item, index) => `
      <article class="multi-card ${index === 0 ? "multi-card-hero" : ""}">
        <img src="${item.src}" alt="${item.name}">
        <div class="multi-card-meta">
          <span class="multi-card-index">${String(index + 1).padStart(2, "0")}</span>
          <div class="multi-card-copy">
            <strong>${item.name}</strong>
            <span>${item.degrees}</span>
          </div>
          <div class="multi-card-actions">
            <button class="multi-card-download" data-multi-download-index="${index}" type="button">
              <span class="material-symbols-outlined text-[16px]">download</span>
              <span>Unduh</span>
            </button>
            <span class="multi-card-check material-symbols-outlined">check_circle</span>
          </div>
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

  const language = els.bgremoveLanguage?.value || "English";
  const originalLabel = getLanguageLabel(language, {
    Indonesia: "Asli",
    English: "Original",
    Chinese: "原图"
  });
  const removedLabel = getLanguageLabel(language, {
    Indonesia: "Background Dihapus",
    English: "Background Removed",
    Chinese: "已去背景"
  });
  const downloadLabel = getLanguageLabel(language, {
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
  const degrees = {
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
  const translations = {
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
    const sourceFile = state.multiProductFiles[index % state.multiProductFiles.length];
    return {
      key: angle.key,
      name: angle.name,
      degrees: buildMultiAngleDegrees(angle.key),
      src: URL.createObjectURL(sourceFile)
    };
  });
}

function buildBgremoveModelLabel(model) {
  const labels = {
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
  const labels = {
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
  const language = els.bgremoveLanguage.value;
  return state.bgremoveFiles.map((file, index) => {
    const src = URL.createObjectURL(file);
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

  const selectedAngles = getSelectedAngleDefinitions();
  if (!selectedAngles.length) {
    els.multiStatus.textContent = "Pilih minimal satu angle.";
    return;
  }

  const aspectRatio = els.multiAspectRatio.value;
  const language = els.multiLanguage.value;
  const sellingPoints = els.multiSellingPoints.value.trim();
  const templatePrompt = getSelectedPromptContent("multi_angle", els.multiTemplate.value) || multiAngleTemplatePrompts.studio;
  const customPrompt = els.multiPrompt.value.trim();
  const serializedFiles = await serializeFilesForBackend(state.multiProductFiles, 4);

  const results = [];

  for (let index = 0; index < selectedAngles.length; index += 1) {
    const angle = selectedAngles[index];
    els.multiStatus.textContent = `Generating ${angle.name} (${index + 1}/${selectedAngles.length})...`;
    const generated = await backendGenerateImage("multi_angle", {
      language,
      sellingPoints,
      basePrompt: templatePrompt,
      extraPrompt: `${angle.prompt}\n${customPrompt}`.trim(),
      angleName: angle.name,
      aspectRatio,
      brandInfo: state.brandInfo,
      images: serializedFiles
    });

    results.push({
      key: angle.key,
      name: angle.name,
      degrees: buildMultiAngleDegrees(angle.key),
      src: generated.images[0].src
    });
    state.multiResults = [...results];
    renderMultiAngleResults();
  }

  els.multiStatus.textContent = `${results.length} angle berhasil digenerate.`;
  addResultsToFolder("multi", results);
  await saveGenerationToSupabase("multi_angle", {
    aspectRatio,
    language,
    sellingPoints,
    brandInfo: state.brandInfo,
    angles: selectedAngles,
    results
  });
}

async function generateBackgroundRemoval() {
  if (!state.bgremoveFiles.length) {
    els.bgremoveStatus.textContent = "Upload at least one image first.";
    return;
  }

  const modelValue = els.bgremoveModel.value;
  const modelLabel = buildBgremoveModelLabel(modelValue);
  const language = els.bgremoveLanguage.value;
  const resolution = els.bgremoveResolution.value;
  const format = els.bgremoveFormat.value;
  const refine = els.bgremoveRefine.checked;
  const presetPrompt = getSelectedPromptContent("bgremove", els.bgremovePromptPreset.value);
  const serializedFiles = await serializeFilesForBackend(state.bgremoveFiles, 4);

  const results = [];
  for (let index = 0; index < state.bgremoveFiles.length; index += 1) {
    const file = state.bgremoveFiles[index];
    els.bgremoveStatus.textContent = `Removing background ${index + 1}/${state.bgremoveFiles.length}...`;
    const generated = await backendGenerateImage("bgremove", {
      language,
      cutoutModel: modelLabel,
      resolution,
      outputFormat: format,
      refine,
      basePrompt: presetPrompt,
      images: [serializedFiles[index]]
    });

    results.push({
      beforeSrc: URL.createObjectURL(file),
      afterSrc: generated.images[0].src,
      title: file.name.replace(/\.[^.]+$/, ""),
      modelLabel
    });
    state.bgremoveResults = [...results];
    renderBgremoveResults();
  }

  els.bgremoveStatus.textContent = `${results.length} background removal selesai diproses.`;
}

async function analyzeAplusSellingPoints() {
  const platform = els.aplusPlatform.value;
  const aspectRatio = els.aplusAspectRatio.value;
  const language = els.aplusLanguage.value;
  const currentBrief = els.aplusSellingPoints.value.trim();

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

  const quantity = Math.min(5, Math.max(1, Number(els.listingQuantity.value) || 1));
  const basePrompt = getSelectedPromptContent("listing", els.listingTemplate.value) || listingTemplatePrompts.premium;
  const extraPrompt = els.listingPrompt.value.trim();
  const sellingPoints = els.listingSellingPoints.value.trim();
  const language = els.listingLanguage.value;
  const summary = extractSellingPointSummary(sellingPoints);
  const serializedFiles = await serializeFilesForBackend(state.listingProductFiles, 4);

  const results = [];

  for (let index = 0; index < quantity; index += 1) {
    els.listingStatus.textContent = `Generating listing image ${index + 1} of ${quantity}...`;
    const generated = await backendGenerateImage("listing", {
      language,
      sellingPoints,
      basePrompt,
      extraPrompt,
      quantity,
      variation: index + 1,
      imageSize: els.listingSize.value,
      brandInfo: state.brandInfo,
      images: serializedFiles
    });

    results.push({
      src: generated.images[0].src,
      title: buildListingCardTitle(index, language, summary),
      description: buildListingCardDescription(index, sellingPoints, extraPrompt),
      badges: buildListingBadges(index, language)
    });
    state.listingResults = [...results];
    renderListingResults();
  }

  els.listingStatus.textContent = `${results.length} listing images berhasil digenerate.`;
  addResultsToFolder("listing", results);
  await saveGenerationToSupabase("listing", {
    language,
    sellingPoints,
    brandInfo: state.brandInfo,
    quantity,
    results
  });
}

function extractSellingPointSummary(text) {
  const cleanLines = text
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
  const localized = {
    Indonesia: ["Hero Utama", "Fokus Benefit", "Detail Produk", "Penggunaan Produk", "Banner Konversi"],
    English: ["Hero Cover", "Benefit Focus", "Product Detail", "Usage Scene", "Conversion Banner"],
    Chinese: ["主视觉", "核心卖点", "产品细节", "使用场景", "转化横幅"]
  };
  const set = localized[language] || localized.English;
  const titles = [
    set[0],
    set[1],
    set[2],
    set[3],
    set[4]
  ];

  return titles[index] || set[0];
}

function buildListingCardDescription(index, sellingPoints, extraPrompt) {
  const fallbackCopy = [
    "Main hero image with strong product hierarchy, premium visibility, and clear marketplace appeal.",
    "Benefit-forward layout that spotlights the biggest customer value and buying reason.",
    "Detail-focused frame highlighting craftsmanship, texture, material quality, or core function.",
    "Usage-oriented visual showing how the product fits real customer scenarios and expectations.",
    "Promotional closing frame with stronger urgency, stronger CTA space, and campaign-ready energy."
  ];

  const sourceText = extraPrompt || sellingPoints;
  if (!sourceText.trim()) {
    return fallbackCopy[index] || fallbackCopy[0];
  }

  const clean = sourceText.replace(/\s+/g, " ").trim();
  return clean.slice(0, 140);
}

function buildListingBadges(index, language) {
  const localized = {
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
  const set = localized[language] || localized.English;
  const badgeSets = [
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
    const sourceFile = state.listingProductFiles[index % state.listingProductFiles.length];
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
    const link = document.createElement("a");
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
    const link = document.createElement("a");
    link.href = item.src;
    link.download = `multi-angle-${String(index + 1).padStart(2, "0")}-${item.key}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });

  els.multiStatus.textContent = `${state.multiResults.length} multi-angle image siap diunduh.`;
}

function downloadMultiResultAt(index) {
  const item = state.multiResults[index];
  if (!item) {
    return;
  }
  const link = document.createElement("a");
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
    const link = document.createElement("a");
    link.href = item.afterSrc;
    link.download = `background-removed-${String(index + 1).padStart(2, "0")}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });

  els.bgremoveStatus.textContent = `${state.bgremoveResults.length} hasil background removal siap diunduh.`;
}

function downloadBgremoveResultAt(index) {
  const item = state.bgremoveResults[index];
  if (!item) {
    return;
  }
  const link = document.createElement("a");
  link.href = item.afterSrc;
  link.download = `background-removed-${String(index + 1).padStart(2, "0")}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function bindUploads() {
  els.listingUploadBtn.addEventListener("click", () => els.listingProductUpload.click());
  els.multiUploadBtn.addEventListener("click", () => els.multiProductUpload.click());
  els.bgremoveUploadBtn.addEventListener("click", () => els.bgremoveUpload.click());
  els.aplusUploadBtn.addEventListener("click", () => els.aplusProductUpload.click());
  els.aplusReferenceBtn.addEventListener("click", () => els.aplusReferenceUpload.click());

  els.listingProductUpload.addEventListener("change", () => {
    const incomingFiles = Array.from(els.listingProductUpload.files || []);
    state.listingProductFiles = mergeFiles(state.listingProductFiles, incomingFiles, 8);
    renderListingUploadList();
    els.listingProductUpload.value = "";
  });

  els.multiProductUpload.addEventListener("change", () => {
    const incomingFiles = Array.from(els.multiProductUpload.files || []);
    state.multiProductFiles = mergeFiles(state.multiProductFiles, incomingFiles, 8);
    renderMultiUploadList();
    els.multiProductUpload.value = "";
  });

  els.bgremoveUpload.addEventListener("change", () => {
    const incomingFiles = Array.from(els.bgremoveUpload.files || []);
    state.bgremoveFiles = mergeFiles(state.bgremoveFiles, incomingFiles, 8);
    renderBgremoveUploadList();
    els.bgremoveUpload.value = "";
  });

  els.aplusProductUpload.addEventListener("change", () => {
    state.aplusProductFiles = Array.from(els.aplusProductUpload.files || []).slice(0, 5);
    renderThumbnailList(els.aplusUploadList, state.aplusProductFiles);
    updatePreviewFromUploads();
    renderAplusGridFromModules();
    updateAplusCounts();
  });

  els.aplusReferenceUpload.addEventListener("change", () => {
    state.aplusReferenceFiles = Array.from(els.aplusReferenceUpload.files || []).slice(0, 5);
    renderThumbnailList(els.aplusReferenceList, state.aplusReferenceFiles);
    updateAplusCounts();
  });
}

function bindModuleCards() {
  els.moduleCards.forEach((card) => {
    card.addEventListener("click", () => {
      const key = card.dataset.moduleKey;
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
  els.multiAngleTiles.forEach((tile) => {
    tile.addEventListener("click", () => {
      const key = tile.dataset.angleKey;
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
      const target = tab.dataset.workspaceTarget;
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

  safeBind(els.saveSettingsBtn, "click", saveSettings);
  safeBind(els.clearSettingsBtn, "click", clearSettings);
  safeBind(els.testGptConnectionBtn, "click", async () => {
    els.gptConnectionStatus.textContent = "Menguji...";
    try {
      els.gptConnectionStatus.textContent = await testApiConnection("gpt");
    } catch (error) {
      els.gptConnectionStatus.textContent = error.message;
    }
  });
  safeBind(els.testGeminiConnectionBtn, "click", async () => {
    els.geminiConnectionStatus.textContent = "Menguji...";
    try {
      els.geminiConnectionStatus.textContent = await testApiConnection("gemini");
    } catch (error) {
      els.geminiConnectionStatus.textContent = error.message;
    }
  });
  safeBind(els.testCustomConnectionBtn, "click", async () => {
    els.customConnectionStatus.textContent = "Menguji...";
    try {
      els.customConnectionStatus.textContent = await testApiConnection("custom");
    } catch (error) {
      els.customConnectionStatus.textContent = error.message;
    }
  });
  safeBind(els.folderToggleBtn, "click", () => {
    els.folderDropdown.classList.toggle("hidden");
    els.folderToggleIcon.textContent = els.folderDropdown.classList.contains("hidden") ? "expand_more" : "expand_less";
  });
  safeBind(els.promptFeature, "change", () => {
    resetPromptForm(els.promptFeature.value);
  });
  safeBind(els.promptCore, "input", () => {
    state.corePrompt = els.promptCore.value.trim() || defaultCorePrompt;
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
    savePromptFromForm();
  });
  safeBind(els.promptDeleteBtn, "click", () => {
    deletePromptFromForm();
  });
  safeBind(els.promptList, "click", (event) => {
    const button = event.target instanceof HTMLElement ? event.target.closest("[data-prompt-item]") : null;
    if (!button) {
      return;
    }
    const key = button.getAttribute("data-prompt-item");
    if (!key) {
      return;
    }
    loadPromptIntoForm(state.activePromptFeature, key);
  });
  safeBind(els.brandLogo, "change", async () => {
    const file = els.brandLogo.files?.[0];
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
  });

  safeBind(els.trendingStyleAnalysisBtn, "click", async () => {
    setStyleMode("trending");
    const moduleSummary = buildAplusModuleSummary();
    const platform = els.aplusPlatform.value;
    const aspectRatio = els.aplusAspectRatio.value;
    const language = els.aplusLanguage.value;
    const sellingPoints = els.aplusSellingPoints.value.trim();
    const aplusPreset = getSelectedPromptContent("aplus", els.aplusPromptPreset.value);

    els.aplusGenerateHint.textContent = "Running GPT trending style analysis...";

    try {
      const content = await backendEnhanceImagePrompt(`Create a trending style analysis for A+ content.
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
    const basePrompt = getSelectedPromptContent("listing", els.listingTemplate.value) || listingTemplatePrompts.premium;
    els.listingPrompt.value = basePrompt;
  });

  safeBind(els.aplusPromptPreset, "change", () => {
    const preset = getSelectedPromptContent("aplus", els.aplusPromptPreset.value);
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

  safeBind(els.generateAplusBtn, "click", async () => {
    if (!state.aplusProductFiles.length) {
      els.aplusGenerateHint.textContent = "Please upload at least one product image first";
      return;
    }
    const platform = els.aplusPlatform.value;
    const aspectRatio = els.aplusAspectRatio.value;
    const language = els.aplusLanguage.value;
    const moduleSummary = buildAplusModuleSummary();
    const aplusPreset = getSelectedPromptContent("aplus", els.aplusPromptPreset.value);
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

Provide a short generation direction for the selected A+ grid modules.`, "A+ Generation Direction");
      } catch (error) {
        els.aplusGenerateHint.textContent = `${error.message} Preview lokal tetap dibuat.`;
      }
    }
    generateAplusPreview();
    const aplusAssets = state.aplusProductFiles.map((file, index) => ({
      src: URL.createObjectURL(file),
      title: `A+ Asset ${index + 1}`
    }));
    addResultsToFolder("aplus", aplusAssets);
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
    const originalText = els.generateListingBtn.textContent;
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
    } finally {
      els.generateListingBtn.textContent = originalText;
      els.generateListingBtn.disabled = false;
    }
  });

  safeBind(els.multiTemplate, "change", () => {
    els.multiPrompt.value = getSelectedPromptContent("multi_angle", els.multiTemplate.value) || multiAngleTemplatePrompts.studio;
  });

  safeBind(els.bgremovePromptPreset, "change", () => {
    els.bgremoveStatus.textContent = `Prompt preset aktif: ${els.bgremovePromptPreset.options[els.bgremovePromptPreset.selectedIndex]?.text || "-"}`;
  });

  safeBind(els.multiSelectAllBtn, "click", () => {
    els.multiAngleTiles.forEach((tile) => {
      const key = tile.dataset.angleKey;
      if (!key) {
        return;
      }
      state.selectedAngles.add(key);
      tile.classList.add("active");
    });
    updateMultiAngleCount();
  });

  safeBind(els.multiClearBtn, "click", () => {
    state.selectedAngles.clear();
    els.multiAngleTiles.forEach((tile) => tile.classList.remove("active"));
    updateMultiAngleCount();
  });

  safeBind(els.generateMultiBtn, "click", async () => {
    const originalText = els.generateMultiBtn.textContent;
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
      } else {
        els.multiStatus.textContent = `${error.message} Hasil AI yang sudah jadi tetap dipertahankan.`;
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
    const originalText = els.generateBgremoveBtn.textContent;
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
    } finally {
      els.generateBgremoveBtn.textContent = originalText;
      els.generateBgremoveBtn.disabled = false;
    }
  });

  safeBind(els.bgremoveDownloadBtn, "click", () => {
    downloadBgremoveResults();
  });

  safeBind(els.multiPreviewGrid, "click", (event) => {
    const button = event.target instanceof HTMLElement ? event.target.closest("[data-multi-download-index]") : null;
    if (!button) {
      return;
    }
    const index = Number(button.getAttribute("data-multi-download-index"));
    downloadMultiResultAt(index);
  });

  safeBind(els.bgremovePreviewGrid, "click", (event) => {
    const button = event.target instanceof HTMLElement ? event.target.closest("[data-bgremove-download-index]") : null;
    if (!button) {
      return;
    }
    const index = Number(button.getAttribute("data-bgremove-download-index"));
    downloadBgremoveResultAt(index);
  });
}

function init() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(getSettings()));
  loadFolderLibrary();
  loadBrandInfo();
  loadPromptStore();
  ensureBackendGatewayField();
  loadSettingsIntoForm();
  renderBrandInfo();
  updateApiStatus();
  updateFolderCounts();
  updateAplusCounts();
  setStyleMode("trending");
  switchWorkspace("listing-images");
  renderListingUploadList();
  renderMultiUploadList();
  renderBgremoveUploadList();
  updateMultiAngleCount();
  updateListingCanvasControls();
  renderListingResults();
  renderMultiAngleResults();
  renderBgremoveResults();
  renderAplusGridFromModules();
  syncPromptSelectors();
  els.promptCore.value = getCorePrompt();
  els.listingPrompt.value = getSelectedPromptContent("listing", els.listingTemplate.value) || listingTemplatePrompts.premium;
  els.multiPrompt.value = getSelectedPromptContent("multi_angle", els.multiTemplate.value) || multiAngleTemplatePrompts.studio;
  if (els.aplusPromptPreset.value) {
    els.aplusDesignRequirements.value = getSelectedPromptContent("aplus", els.aplusPromptPreset.value);
  }
  resetPromptForm("listing");
  bindEvents();
}

init();
