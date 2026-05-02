# Blueprint — AI Module

## Objective
AI provider configuration, model management, AI playground with sessions/turns, routing strategies, personas, and guardrails.

## Responsibilities
- AI settings CRUD per app (provider, model, temperature, etc.)
- AI playground: sessions, turns, model comparison
- Routing strategies management
- Persona management (system instructions)
- Guardrail configuration
- Model pricing reference
- AI playground metric items

## File structure
```
modules/ai/
  index.ts (479 lines)
  model.ts (182 lines)
  service.ts (5845 lines)
```

### File descriptions
- **`index.ts`** — Elysia route plugin. Registers all HTTP endpoints under `/api/ai`. 479 lines.
- **`model.ts`** — Prisma query helpers and request validation models. 182 lines.
- **`service.ts`** — Core business logic. 5845 lines.

## Route prefix
`/api/ai`

## Key tables
- `ai_settings`
- `ai_model_pricing`
- `ai_playground_models`
- `ai_playground_routing_strategies`
- `ai_playground_personas`
- `ai_playground_guardrails`
- `ai_playground_metric_items`
- `ai_playground_sessions`
- `ai_playground_turns`

## Implementation status
### Selesai
- [x] Module structure (index.ts + service + model) — total 6506 lines
- [x] Route registration under `/api/ai`
- [x] Multi-tenant isolation via `app_id` context
- [x] Model — 182 lines
- [x] Service — 5845 lines

### Belum / pending
- Tidak ada item pending untuk modul ini.
