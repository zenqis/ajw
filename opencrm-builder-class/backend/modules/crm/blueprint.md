# Blueprint — CRM Module

## Objective
Sales pipeline management with Kanban stages, deal tracking, and stage transition audit.

## Responsibilities
- Pipeline CRUD per app
- Pipeline stage management (ordered, with probabilities)
- Conversation-to-deal linking
- Stage transition tracking
- Expected revenue calculations

## File structure
```
modules/crm/
  index.ts (74 lines)
  model.ts (56 lines)
  service.ts (196 lines)
```

### File descriptions
- **`index.ts`** — Elysia route plugin. Registers all HTTP endpoints under `/api/crm`. 74 lines.
- **`model.ts`** — Prisma query helpers and request validation models. 56 lines.
- **`service.ts`** — Core business logic. 196 lines.

## Route prefix
`/api/crm`

## Key tables
- `pipelines`
- `pipeline_stages`
- `conversation_sales`
- `stage_transitions`

## Implementation status
### Selesai
- [x] Module structure (index.ts + service + model) — total 326 lines
- [x] Route registration under `/api/crm`
- [x] Multi-tenant isolation via `app_id` context
- [x] Model — 56 lines
- [x] Service — 196 lines

### Belum / pending
- Tidak ada item pending untuk modul ini.
