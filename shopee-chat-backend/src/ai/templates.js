function block(label, value) {
  return `${label}:\n${String(value || "-").trim() || "-"}`;
}

function historyBlock(items) {
  const rows = (Array.isArray(items) ? items : [])
    .map((item, index) => `${index + 1}. ${String(item.role || "user").toUpperCase()}: ${String(item.content || "").trim()}`)
    .filter(Boolean);
  return rows.length ? rows.join("\n") : "-";
}

export function buildTaskPrompt(task, context) {
  switch (task.taskType) {
    case "prompt.enhance":
      return [
        "ROLE",
        "You rewrite user-visible prompts into compact production-ready prompts.",
        "",
        "RULES",
        "- Preserve intent.",
        "- Do not add unrelated objects or hidden system rules.",
        "- Keep the result concise, direct, and usable as-is.",
        "- Return only the final prompt text.",
        "",
        block("Context", context.contextLabel),
        "",
        block("Original Prompt", context.rawPrompt)
      ].join("\n");
    case "agent.run":
      return [
        "ROLE",
        "You are the backend-routed AJW operational agent.",
        "Respond concisely, actionably, and only from the provided context.",
        "",
        "RULES",
        "- Prioritize direct operational answers.",
        "- Do not invent missing facts.",
        "- If context is insufficient, say what is missing briefly.",
        "- Keep the answer compact and usable.",
        "",
        block("Execution Mode", context.modeLabel || context.mode),
        block("Core Prompt", context.corePrompt),
        block("Context Summary", context.contextSummary),
        block("User Task", context.taskText),
        block("Notes", context.notes)
      ].join("\n");
    case "text.generate":
      return [
        "ROLE",
        "You are a backend-routed AJW text assistant.",
        "Use the system prompt and recent chat history only as support for the latest user request.",
        "Return only the assistant reply.",
        "",
        block("Context", context.contextLabel),
        block("System Prompt", context.systemPrompt),
        block("Recent History", historyBlock(context.history)),
        block("Latest User Prompt", context.userPrompt)
      ].join("\n");
    case "image.generate.listing":
      return [
        "TEMPLATE_ID: listing_thumbnail_v1",
        "Keep a fixed marketplace thumbnail structure.",
        "Layout frame must stay stable: product hero, headline zone, support badge zone, clean background, conversion-first hierarchy.",
        "Only vary the content, not the composition logic.",
        "",
        block("Language", context.language),
        block("Brand", context.brandBlock),
        block("Selling Points", context.sellingPoints),
        block("Base Template", context.basePrompt),
        block("Extra Instruction", context.extraPrompt),
        block("Variation", `Variation ${context.variation} of ${context.quantity}`),
        block("Aspect Ratio", context.imageSize)
      ].join("\n");
    case "image.generate.multi_angle":
      return [
        "TEMPLATE_ID: multi_angle_sheet_v1",
        "Keep a fixed product-angle presentation.",
        "The product identity must remain unchanged. Only angle and framing change.",
        "",
        block("Language", context.language),
        block("Brand", context.brandBlock),
        block("Angle", context.angleName),
        block("Base Template", context.basePrompt),
        block("Extra Instruction", context.extraPrompt),
        block("Aspect Ratio", context.aspectRatio),
        block("Selling Points", context.sellingPoints)
      ].join("\n");
    case "image.generate.aplus":
      return [
        "TEMPLATE_ID: aplus_module_v1",
        "Keep a fixed A+ module layout with headline, sub-section structure, and premium product storytelling blocks.",
        "Do not redesign from zero. Fill the module with new content while preserving clear modular composition.",
        "",
        block("Platform", context.platform),
        block("Language", context.language),
        block("Aspect Ratio", context.aspectRatio),
        block("Brand", context.brandBlock),
        block("Selling Points", context.sellingPoints),
        block("Design Requirements", context.designRequirements),
        block("Prompt Preset", context.basePrompt),
        block("Module", context.moduleLabel)
      ].join("\n");
    case "image.generate.bgremove":
      return [
        "TEMPLATE_ID: background_cutout_v1",
        "Perform a fixed cutout workflow, not a creative redesign.",
        "Return the same product with precise edge preservation and clean isolation.",
        "",
        block("Language", context.language),
        block("Cutout Model", context.cutoutModel),
        block("Resolution", context.resolution),
        block("Output Format", context.outputFormat),
        block("Refine", context.refine),
        block("Prompt Preset", context.basePrompt)
      ].join("\n");
    default:
      throw new Error(`Template belum tersedia untuk task ${task.taskType}`);
  }
}
