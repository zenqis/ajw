# Blueprint — Label Module

## Objective
Label management and conversation-label association for conversation categorization.

## Responsibilities
- Label CRUD per app (with color)
- Conversation-label association (M2M)
- Bulk label management

## File structure
```
modules/label/
  index.ts (132 lines)
  model.ts (38 lines)
  service.ts (152 lines)
```

### File descriptions
- **`index.ts`** — Elysia route plugin. Registers all HTTP endpoints under `/api/labels`. 132 lines.
- **`model.ts`** — Prisma query helpers and request validation models. 38 lines.
- **`service.ts`** — Core business logic. 152 lines.

## Route prefix
`/api/labels`

## Key tables
- `labels`
- `conversation_labels`

## Implementation status
### Selesai
- [x] Module structure (index.ts + service + model) — total 322 lines
- [x] Route registration under `/api/labels`
- [x] Multi-tenant isolation via `app_id` context
- [x] Model — 38 lines
- [x] Service — 152 lines

### Belum / pending
- Tidak ada item pending untuk modul ini.
