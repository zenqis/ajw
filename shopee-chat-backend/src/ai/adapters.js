const openAiBaseUrl = String(process.env.OPENAI_BASE_URL || "https://api.openai.com/v1").replace(/\/+$/, "");
const openAiKey = String(process.env.OPENAI_API_KEY || "").trim();

function ensureOpenAiReady() {
  if (!openAiKey) {
    throw new Error("OPENAI_API_KEY belum diatur di backend.");
  }
}

async function readJson(response, fallback) {
  const text = await response.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(fallback || text);
  }
}

async function runPromptEnhancer(task, prompt) {
  ensureOpenAiReady();
  const response = await fetch(`${openAiBaseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${openAiKey}`
    },
    body: JSON.stringify({
      model: task.model,
      temperature: task.temperature ?? 0.3,
      messages: [{ role: "user", content: prompt }]
    })
  });
  const payload = await readJson(response, "Prompt enhance gagal.");
  if (!response.ok) {
    throw new Error(payload?.error?.message || payload?.message || "Prompt enhance gagal.");
  }
  return {
    text: String(payload?.choices?.[0]?.message?.content || "").trim()
  };
}

function dataUrlToBlob(image) {
  const match = String(image.dataUrl || "").match(/^data:([^;]+);base64,(.+)$/);
  if (!match) throw new Error(`Data URL tidak valid untuk ${image.name || "image"}`);
  const mime = String(match[1] || "application/octet-stream");
  const buffer = Buffer.from(match[2], "base64");
  return { mime, buffer };
}

async function runImageEdit(task, prompt, context) {
  ensureOpenAiReady();
  if (!Array.isArray(context.images) || !context.images.length) {
    throw new Error("Task image memerlukan minimal satu gambar referensi.");
  }

  const form = new FormData();
  form.append("model", task.model);
  form.append("prompt", prompt);
  if (context.imageSize && context.imageSize !== "auto") {
    form.append("size", context.imageSize);
  }
  form.append("quality", "high");

  context.images.forEach((image) => {
    const blobInfo = dataUrlToBlob(image);
    form.append("image", new Blob([blobInfo.buffer], { type: blobInfo.mime }), image.name || "image.png");
  });

  const response = await fetch(`${openAiBaseUrl}/images/edits`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${openAiKey}`
    },
    body: form
  });
  const payload = await readJson(response, "Generate image gagal.");
  if (!response.ok) {
    throw new Error(payload?.error?.message || payload?.message || "Generate image gagal.");
  }
  const base64 = payload?.data?.[0]?.b64_json;
  const url = payload?.data?.[0]?.url || "";
  if (!base64 && !url) {
    throw new Error("Model tidak mengembalikan hasil gambar.");
  }
  return {
    images: [
      {
        src: base64 ? `data:image/png;base64,${base64}` : url,
        title: context.moduleLabel || context.angleName || "Generated Image"
      }
    ]
  };
}

export async function executeAiTask(task, { prompt, context }) {
  if (task.kind === "text") {
    return runPromptEnhancer(task, prompt, context);
  }
  if (task.kind === "image") {
    return runImageEdit(task, prompt, context);
  }
  throw new Error(`Executor belum tersedia untuk kind ${task.kind}`);
}
