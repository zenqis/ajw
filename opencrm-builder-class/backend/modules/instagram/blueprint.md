# Blueprint — Instagram Module

## Objective
Instagram DM channel integration with OAuth login, callback handling, and channel management.

## Responsibilities
- Instagram OAuth login flow
- OAuth callback handling
- Instagram channel CRUD
- Instagram page listing
- Channel disconnect

## File structure
```
modules/instagram/
  index.ts (249 lines)
  model.ts (22 lines)
  service.ts (319 lines)
```

### File descriptions
- **`index.ts`** — Elysia route plugin. Registers all HTTP endpoints under `/api/instagram`. 249 lines.
- **`model.ts`** — Prisma query helpers and request validation models. 22 lines.
- **`service.ts`** — Core business logic. 319 lines.

## Route prefix
`/api/instagram`

## Key tables
- `channel_accounts`

## Implementation status
### Selesai
- [x] Module structure (index.ts + service + model) — total 590 lines
- [x] Route registration under `/api/instagram`
- [x] Multi-tenant isolation via `app_id` context
- [x] Model — 22 lines
- [x] Service — 319 lines

### Belum / pending
- Tidak ada item pending untuk modul ini.
