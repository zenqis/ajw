function toText(value, maxChars) {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  if (!maxChars) return text;
  return text.slice(0, maxChars);
}

function toBlockLines(label, value) {
  const text = toText(value, 240);
  return text ? `${label}: ${text}` : "";
}

function buildBrandBlock(brandInfo) {
  const info = brandInfo && typeof brandInfo === "object" ? brandInfo : {};
  return [
    toBlockLines("Brand", info.name),
    toBlockLines("Category", info.productCategory),
    toBlockLines("Store Reputation", info.storeReputation),
    toBlockLines("Description", info.description)
  ]
    .filter(Boolean)
    .join("\n");
}

function limitImages(images, maxImages = 5) {
  return (Array.isArray(images) ? images : [])
    .slice(0, maxImages)
    .map((image, index) => ({
      name: toText(image && image.name ? image.name : `image-${index + 1}.png`, 120),
      dataUrl: String((image && image.dataUrl) || "").trim()
    }))
    .filter((image) => image.dataUrl.startsWith("data:"));
}

function limitHistory(items, maxItems = 8) {
  return (Array.isArray(items) ? items : [])
    .slice(-maxItems)
    .map((item) => ({
      role: toText(item && item.role ? item.role : "user", 30) || "user",
      content: String((item && item.content) || "").trim().slice(0, 1200)
    }))
    .filter((item) => item.content);
}

export function buildTaskContext(task, payload) {
  const body = payload && typeof payload === "object" ? payload : {};
  const brandBlock = buildBrandBlock(body.brandInfo);

  if (task.taskType === "prompt.enhance") {
    return {
      rawPrompt: String(body.rawPrompt || "").trim().slice(0, 5000),
      contextLabel: toText(body.contextLabel, 120),
      cacheInput: {
        rawPrompt: toText(body.rawPrompt, 5000),
        contextLabel: toText(body.contextLabel, 120)
      }
    };
  }

  if (task.taskType === "agent.run") {
    return {
      mode: toText(body.mode || body.requested_mode, 60) || "analysis",
      modeLabel: toText(body.mode_label, 120) || "Analisa Operasional",
      taskText: String(body.task || body.prompt || body.input || body.instruction || "").trim().slice(0, 4000),
      corePrompt: String(body.core_prompt || body.system_prompt || "").trim().slice(0, 4000),
      contextSummary: String(body.context_summary || body.context || body.ajw_context || "").trim().slice(0, 5000),
      notes: String(body.notes || "").trim().slice(0, 1200),
      cacheInput: {
        mode: toText(body.mode || body.requested_mode, 60),
        taskText: toText(body.task || body.prompt || body.input || body.instruction, 4000),
        corePrompt: toText(body.core_prompt || body.system_prompt, 4000),
        contextSummary: toText(body.context_summary || body.context || body.ajw_context, 5000),
        notes: toText(body.notes, 1200)
      }
    };
  }

  if (task.taskType === "text.generate") {
    return {
      contextLabel: toText(body.contextLabel, 120) || "General Text",
      systemPrompt: String(body.systemPrompt || "").trim().slice(0, 3000),
      userPrompt: String(body.userPrompt || body.prompt || "").trim().slice(0, 4000),
      history: limitHistory(body.history, 8),
      cacheInput: {
        contextLabel: toText(body.contextLabel, 120),
        systemPrompt: toText(body.systemPrompt, 3000),
        userPrompt: toText(body.userPrompt || body.prompt, 4000),
        history: limitHistory(body.history, 8)
      }
    };
  }

  if (task.taskType === "image.generate.listing") {
    return {
      language: toText(body.language, 40) || "Indonesia",
      brandBlock,
      sellingPoints: String(body.sellingPoints || "").trim().slice(0, 1400),
      basePrompt: String(body.basePrompt || "").trim().slice(0, 900),
      extraPrompt: String(body.extraPrompt || "").trim().slice(0, 900),
      quantity: Math.max(1, Math.min(5, Number(body.quantity) || 1)),
      variation: Math.max(1, Math.min(5, Number(body.variation) || 1)),
      imageSize: toText(body.imageSize, 30) || "auto",
      images: limitImages(body.images, 4),
      cacheInput: {
        language: toText(body.language, 40),
        brandBlock,
        sellingPoints: toText(body.sellingPoints, 1400),
        basePrompt: toText(body.basePrompt, 900),
        extraPrompt: toText(body.extraPrompt, 900),
        quantity: Math.max(1, Math.min(5, Number(body.quantity) || 1)),
        variation: Math.max(1, Math.min(5, Number(body.variation) || 1)),
        imageSize: toText(body.imageSize, 30),
        imageNames: limitImages(body.images, 4).map((item) => item.name)
      }
    };
  }

  if (task.taskType === "image.generate.multi_angle") {
    return {
      language: toText(body.language, 40) || "Indonesia",
      brandBlock,
      sellingPoints: String(body.sellingPoints || "").trim().slice(0, 1200),
      basePrompt: String(body.basePrompt || "").trim().slice(0, 900),
      extraPrompt: String(body.extraPrompt || "").trim().slice(0, 900),
      angleName: toText(body.angleName, 80) || "Front",
      aspectRatio: toText(body.aspectRatio, 40) || "auto",
      images: limitImages(body.images, 4),
      cacheInput: {
        language: toText(body.language, 40),
        brandBlock,
        sellingPoints: toText(body.sellingPoints, 1200),
        basePrompt: toText(body.basePrompt, 900),
        extraPrompt: toText(body.extraPrompt, 900),
        angleName: toText(body.angleName, 80),
        aspectRatio: toText(body.aspectRatio, 40),
        imageNames: limitImages(body.images, 4).map((item) => item.name)
      }
    };
  }

  if (task.taskType === "image.generate.aplus") {
    return {
      platform: toText(body.platform, 60) || "Marketplace",
      language: toText(body.language, 40) || "Indonesia",
      aspectRatio: toText(body.aspectRatio, 40) || "1:1",
      brandBlock,
      sellingPoints: String(body.sellingPoints || "").trim().slice(0, 1600),
      designRequirements: String(body.designRequirements || "").trim().slice(0, 1200),
      basePrompt: String(body.basePrompt || "").trim().slice(0, 900),
      moduleLabel: toText(body.moduleLabel, 120) || "Hero Shot",
      images: limitImages(body.images, 5),
      cacheInput: {
        platform: toText(body.platform, 60),
        language: toText(body.language, 40),
        aspectRatio: toText(body.aspectRatio, 40),
        brandBlock,
        sellingPoints: toText(body.sellingPoints, 1600),
        designRequirements: toText(body.designRequirements, 1200),
        basePrompt: toText(body.basePrompt, 900),
        moduleLabel: toText(body.moduleLabel, 120),
        imageNames: limitImages(body.images, 5).map((item) => item.name)
      }
    };
  }

  if (task.taskType === "image.generate.bgremove") {
    return {
      language: toText(body.language, 40) || "Indonesia",
      cutoutModel: toText(body.cutoutModel, 80) || "Standard",
      resolution: toText(body.resolution, 80) || "High",
      outputFormat: toText(body.outputFormat, 80) || "PNG transparent",
      refine: body.refine ? "enabled" : "disabled",
      basePrompt: String(body.basePrompt || "").trim().slice(0, 600),
      images: limitImages(body.images, 4),
      cacheInput: {
        language: toText(body.language, 40),
        cutoutModel: toText(body.cutoutModel, 80),
        resolution: toText(body.resolution, 80),
        outputFormat: toText(body.outputFormat, 80),
        refine: body.refine ? "enabled" : "disabled",
        basePrompt: toText(body.basePrompt, 600),
        imageNames: limitImages(body.images, 4).map((item) => item.name)
      }
    };
  }

  throw new Error(`Context builder belum tersedia untuk task ${task.taskType}`);
}
