# Blueprint — Form Module

## Objective
Dynamic form builder with AI-assisted data extraction from conversations.

## Responsibilities
- Form definition CRUD
- Field schema management
- Template management
- Submission tracking per conversation
- AI extraction from conversation messages

## File structure
```
modules/form/
  index.ts (58 lines)
  model.ts (50 lines)
  service.ts (101 lines)
```

### File descriptions
- **`index.ts`** — Elysia route plugin. Registers all HTTP endpoints under `/api/forms`. 58 lines.
- **`model.ts`** — Prisma query helpers and request validation models. 50 lines.
- **`service.ts`** — Core business logic. 101 lines.

## Route prefix
`/api/forms`

## Key tables
- `forms`
- `form_fields`
- `form_templates`
- `form_submissions`
- `form_submission_values`
- `form_extraction_logs`

## Implementation status
### Selesai
- [x] Module structure (index.ts + service + model) — total 209 lines
- [x] Route registration under `/api/forms`
- [x] Multi-tenant isolation via `app_id` context
- [x] Model — 50 lines
- [x] Service — 101 lines

### Belum / pending
- Tidak ada item pending untuk modul ini.
