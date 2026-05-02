# Blueprint — Template Variables Module

## Objective
Dynamic variable definitions for WhatsApp message templates.

## Responsibilities
- Variable definition CRUD
- Variable type management
- Template parameter mapping

## File structure
```
modules/template-variables/
  index.ts (43 lines)
  model.ts (26 lines)
  service.ts (32 lines)
```

### File descriptions
- **`index.ts`** — Elysia route plugin. Registers all HTTP endpoints under `/api/template-variables`. 43 lines.
- **`model.ts`** — Prisma query helpers and request validation models. 26 lines.
- **`service.ts`** — Core business logic. 32 lines.

## Route prefix
`/api/template-variables`

## Key tables
- `template_variables`

## Implementation status
### Selesai
- [x] Module structure (index.ts + service + model) — total 101 lines
- [x] Route registration under `/api/template-variables`
- [x] Multi-tenant isolation via `app_id` context
- [x] Model — 26 lines
- [x] Service — 32 lines

### Belum / pending
- Tidak ada item pending untuk modul ini.
