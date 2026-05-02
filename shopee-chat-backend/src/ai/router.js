const defaultPromptModel = String(process.env.AI_PROMPT_MODEL || "gpt-4.1-mini").trim();
const defaultAgentModel = String(process.env.AI_AGENT_MODEL || defaultPromptModel).trim();
const defaultImageProvider = String(process.env.AI_IMAGE_PROVIDER || "openai").trim().toLowerCase();
const defaultImageModel = String(process.env.AI_IMAGE_MODEL || "gpt-image-1").trim();

const TASKS = {
  "prompt.enhance": {
    taskType: "prompt.enhance",
    kind: "text",
    provider: "openai-chat",
    model: defaultPromptModel,
    template: "prompt_enhancer_v2",
    inputBudget: 1600,
    outputBudget: 600,
    cacheTtlMs: 1000 * 60 * 60 * 24 * 7
  },
  "agent.run": {
    taskType: "agent.run",
    kind: "text",
    provider: "openai-chat",
    model: defaultAgentModel,
    template: "agent_router_v1",
    inputBudget: 4200,
    outputBudget: 1200,
    cacheTtlMs: 1000 * 60 * 30
  },
  "text.generate": {
    taskType: "text.generate",
    kind: "text",
    provider: "openai-chat",
    model: defaultPromptModel,
    template: "text_generate_v1",
    inputBudget: 2600,
    outputBudget: 900,
    cacheTtlMs: 1000 * 60 * 60 * 6
  },
  "image.generate.listing": {
    taskType: "image.generate.listing",
    kind: "image",
    provider: defaultImageProvider,
    model: defaultImageModel,
    template: "listing_thumbnail_v1",
    inputBudget: 2800,
    outputBudget: 800,
    cacheTtlMs: 1000 * 60 * 60 * 24 * 14
  },
  "image.generate.multi_angle": {
    taskType: "image.generate.multi_angle",
    kind: "image",
    provider: defaultImageProvider,
    model: defaultImageModel,
    template: "multi_angle_sheet_v1",
    inputBudget: 2400,
    outputBudget: 700,
    cacheTtlMs: 1000 * 60 * 60 * 24 * 14
  },
  "image.generate.aplus": {
    taskType: "image.generate.aplus",
    kind: "image",
    provider: defaultImageProvider,
    model: defaultImageModel,
    template: "aplus_module_v1",
    inputBudget: 3200,
    outputBudget: 900,
    cacheTtlMs: 1000 * 60 * 60 * 24 * 14
  },
  "image.generate.bgremove": {
    taskType: "image.generate.bgremove",
    kind: "image",
    provider: defaultImageProvider,
    model: defaultImageModel,
    template: "background_cutout_v1",
    inputBudget: 1800,
    outputBudget: 500,
    cacheTtlMs: 1000 * 60 * 60 * 24 * 14
  }
};

export function resolveTaskConfig(taskType) {
  const key = String(taskType || "").trim().toLowerCase();
  const task = TASKS[key];
  if (!task) {
    throw new Error(`Task AI tidak dikenal: ${taskType || "-"}`);
  }
  return { ...task };
}

export function listTaskConfigs() {
  return Object.values(TASKS).map((task) => ({ ...task }));
}
