# Blueprint — Team Module

## Objective
Team management with member assignment and auto-assign rule integration.

## Responsibilities
- Team CRUD per app
- Team member management (add/remove)
- Auto-assign rule integration

## File structure
```
modules/team/
  index.ts (121 lines)
  model.ts (34 lines)
  service.ts (121 lines)
```

### File descriptions
- **`index.ts`** — Elysia route plugin. Registers all HTTP endpoints under `/api/teams`. 121 lines.
- **`model.ts`** — Prisma query helpers and request validation models. 34 lines.
- **`service.ts`** — Core business logic. 121 lines.

## Route prefix
`/api/teams`

## Key tables
- `teams`
- `team_members`

## Implementation status
### Selesai
- [x] Module structure (index.ts + service + model) — total 276 lines
- [x] Route registration under `/api/teams`
- [x] Multi-tenant isolation via `app_id` context
- [x] Model — 34 lines
- [x] Service — 121 lines

### Belum / pending
- Tidak ada item pending untuk modul ini.
