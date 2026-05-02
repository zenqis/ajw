# Blueprint — Media Module

## Objective
File upload/download via S3/R2 with public URL generation.

## Responsibilities
- File upload to S3/R2
- File download + streaming
- Public URL generation
- Media type validation

## File structure
```
modules/media/
  index.ts (76 lines)
  model.ts (23 lines)
  service.ts (131 lines)
```

### File descriptions
- **`index.ts`** — Elysia route plugin. Registers all HTTP endpoints under `/api/media`. 76 lines.
- **`model.ts`** — Prisma query helpers and request validation models. 23 lines.
- **`service.ts`** — Core business logic. 131 lines.

## Route prefix
`/api/media`

## Key tables
- `media_files`

## Implementation status
### Selesai
- [x] Module structure (index.ts + service + model) — total 230 lines
- [x] Route registration under `/api/media`
- [x] Multi-tenant isolation via `app_id` context
- [x] Model — 23 lines
- [x] Service — 131 lines

### Belum / pending
- Tidak ada item pending untuk modul ini.
