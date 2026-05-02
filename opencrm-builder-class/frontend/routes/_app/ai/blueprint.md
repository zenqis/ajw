# Blueprint — ai

**Route:** `/_app/ai`
**Source:** `apps/frontend/src/routes/_app/ai.tsx`
**Lines:** 1345 | **Size:** 41KB
**API:** `ai.getPlayground()`, `ai.runPlayground()`, `ai.updatePlaygroundSession()`, `ai.resetPlaygroundSession()`, `ai.createPlaygroundStrategy()`, `ai.getPlaygroundRunStatus()`

## Fungsi
Full AI Playground — lab uji prompt, model selection, routing strategy, persona, guardrails, simulation.

## Layout
```
┌─────────────┬──────────────────────┬───────────────────────┐
│ Connected   │ Chat Transcript      │ Metrics / Guardrails  │
│ Models      │                      │                       │
│ (sidebar)   │ [System prompt]      │ [Token usage]         │
│             │ [User messages]      │ [Latency]             │
│ • Provider  │ [AI responses]       │ [Cost]                │
│   selector  │                      │ [Guardrail toggles]   │
│ • Model     │ ──────────────────── │                       │
│   cards     │ [Prompt input]       │ Routing Strategy      │
│             │ [Run] [Reset]        │ [Strategy list]       │
└─────────────┴──────────────────────┴───────────────────────┘
```

## State (PlaygroundState)
```ts
type PlaygroundState = {
  sessionId: string
  selectedModelId: string
  selectedStrategyId: string
  selectedPersonaId: string
  models: ModelOption[]
  routingStrategies: RoutingStrategy[]
  personas: PersonaPreset[]
  metrics: MetricItem[]
  guardrails: GuardrailItem[]
  transcript: PlaygroundTurn[]
}
```

## Key behaviors
- Model selection: filter by provider → select model → sync to backend
- Simulation: prompt → `runPlayground()` → queued background → poll `getPlaygroundRunStatus()` (900ms–3s adaptive delay, 60s timeout)
- Routing strategies: create rules (provider, model, confidence range)
- Growthcircle model sanitization: `normalizeProviderKey()` for case-insensitive vendor match
