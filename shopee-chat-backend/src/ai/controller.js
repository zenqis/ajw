import { getCachedValue, setCachedValue, createCacheKey } from "./cache.js";
import { buildTaskContext } from "./contextBuilder.js";
import { executeAiTask } from "./adapters.js";
import { resolveTaskConfig, listTaskConfigs } from "./router.js";
import { buildTaskPrompt } from "./templates.js";

function normalizeTaskType(body) {
  const feature = String(body.feature || "").trim().toLowerCase();
  if (!feature) throw new Error("feature wajib diisi.");
  return `image.generate.${feature}`;
}

async function handleTask(taskType, body) {
  const task = resolveTaskConfig(taskType);
  const context = buildTaskContext(task, body || {});
  const prompt = buildTaskPrompt(task, context);
  const cacheKey = createCacheKey({
    taskType: task.taskType,
    model: task.model,
    template: task.template,
    context: context.cacheInput || {}
  });

  if (!body?.skipCache) {
    const cached = getCachedValue(cacheKey);
    if (cached) {
      return {
        ok: true,
        cached: true,
        cache_key: cacheKey,
        task: {
          taskType: task.taskType,
          model: task.model,
          provider: task.provider,
          template: task.template
        },
        prompt,
        output: cached.value
      };
    }
  }

  const output = await executeAiTask(task, { prompt, context });
  setCachedValue(cacheKey, output, {
    ttlMs: task.cacheTtlMs,
    meta: {
      taskType: task.taskType,
      model: task.model,
      template: task.template
    }
  });

  return {
    ok: true,
    cached: false,
    cache_key: cacheKey,
    task: {
      taskType: task.taskType,
      model: task.model,
      provider: task.provider,
      template: task.template
    },
    prompt,
    output
  };
}

export function registerAiGatewayRoutes(app) {
  app.get("/api/ai/router/health", (_req, res) => {
    res.json({
      ok: true,
      tasks: listTaskConfigs()
    });
  });

  app.post("/api/ai/prompt/enhance", async (req, res) => {
    try {
      const result = await handleTask("prompt.enhance", req.body || {});
      res.json(result);
    } catch (err) {
      res.status(400).json({ ok: false, error: String(err.message || err) });
    }
  });

  app.post("/api/ai/agent/run", async (req, res) => {
    try {
      const result = await handleTask("agent.run", req.body || {});
      res.json(result);
    } catch (err) {
      res.status(400).json({ ok: false, error: String(err.message || err) });
    }
  });

  app.post("/api/ai/text/run", async (req, res) => {
    try {
      const result = await handleTask("text.generate", req.body || {});
      res.json(result);
    } catch (err) {
      res.status(400).json({ ok: false, error: String(err.message || err) });
    }
  });

  app.post("/api/ai/generate-image", async (req, res) => {
    try {
      const taskType = normalizeTaskType(req.body || {});
      const result = await handleTask(taskType, req.body || {});
      res.json(result);
    } catch (err) {
      res.status(400).json({ ok: false, error: String(err.message || err) });
    }
  });
}
