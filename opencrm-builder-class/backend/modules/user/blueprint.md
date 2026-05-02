# Blueprint — User Module

## Objective
User profile management with timezone, preferences, and password updates.

## Responsibilities
- User profile retrieval
- Profile update (name, timezone)
- Password change
- User listing per app

## File structure
```
modules/user/
  index.ts (131 lines)
  model.ts (51 lines)
  service.ts (82 lines)
```

### File descriptions
- **`index.ts`** — Elysia route plugin. Registers all HTTP endpoints under `/api/user`. 131 lines.
- **`model.ts`** — Prisma query helpers and request validation models. 51 lines.
- **`service.ts`** — Core business logic. 82 lines.

## Route prefix
`/api/user`

## Key tables
- `users`

## Implementation status
### Selesai
- [x] Module structure (index.ts + service + model) — total 264 lines
- [x] Route registration under `/api/user`
- [x] Multi-tenant isolation via `app_id` context
- [x] Model — 51 lines
- [x] Service — 82 lines

### Belum / pending
- Tidak ada item pending untuk modul ini.
