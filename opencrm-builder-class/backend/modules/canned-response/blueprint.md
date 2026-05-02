# Blueprint — Canned Response Module

## Objective
Quick reply template management with shortcodes for agent efficiency.

## Responsibilities
- CRUD quick reply templates
- Shortcode-based lookup
- Per-app scoping

## File structure
```
modules/canned-response/
  index.ts (49 lines)
  model.ts (19 lines)
  service.ts (26 lines)
```

### File descriptions
- **`index.ts`** — Elysia route plugin. Registers all HTTP endpoints under `/api/canned-responses`. 49 lines.
- **`model.ts`** — Prisma query helpers and request validation models. 19 lines.
- **`service.ts`** — Core business logic. 26 lines.

## Route prefix
`/api/canned-responses`

## Key tables
- `canned_responses`

## Implementation status
### Selesai
- [x] Module structure (index.ts + service + model) — total 94 lines
- [x] Route registration under `/api/canned-responses`
- [x] Multi-tenant isolation via `app_id` context
- [x] Model — 19 lines
- [x] Service — 26 lines

### Belum / pending
- Tidak ada item pending untuk modul ini.
