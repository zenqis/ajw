# Blueprint — Contact Module

## Objective
Customer contact management with custom fields, tags, notes, merge/block capabilities, and GDPR consent tracking.

## Responsibilities
- Contact CRUD with multi-channel identifiers
- Custom field definitions + values
- Tag management + assignment
- Contact notes
- Import/export
- Merge duplicate contacts
- Block/unblock contacts
- Consent tracking (GDPR)

## File structure
```
modules/contact/
  index.ts (369 lines)
  model.ts (51 lines)
  service.ts (735 lines)
```

### File descriptions
- **`index.ts`** — Elysia route plugin. Registers all HTTP endpoints under `/api/contacts`. 369 lines.
- **`model.ts`** — Prisma query helpers and request validation models. 51 lines.
- **`service.ts`** — Core business logic. 735 lines.

## Route prefix
`/api/contacts`

## Key tables
- `contacts`
- `contact_custom_fields`
- `contact_tags`
- `contact_tag_assignments`
- `contact_notes`
- `consent_logs`

## Implementation status
### Selesai
- [x] Module structure (index.ts + service + model) — total 1155 lines
- [x] Route registration under `/api/contacts`
- [x] Multi-tenant isolation via `app_id` context
- [x] Model — 51 lines
- [x] Service — 735 lines

### Belum / pending
- Tidak ada item pending untuk modul ini.
