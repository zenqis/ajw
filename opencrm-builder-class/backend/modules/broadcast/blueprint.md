# Blueprint — Broadcast Module

## Objective
Campaign broadcasting with audience targeting, template merging, scheduling, and per-recipient delivery tracking.

## Responsibilities
- Broadcast CRUD (draft → scheduled → sent)
- Audience targeting with filters
- WhatsApp template parameter merging
- Scheduled broadcast dispatch via BullMQ
- Per-recipient delivery tracking (broadcast_logs)
- Success/failure counting

## File structure
```
modules/broadcast/
  index.ts (183 lines)
  model.ts (33 lines)
  service.ts (898 lines)
```

### File descriptions
- **`index.ts`** — Elysia route plugin. Registers all HTTP endpoints under `/api/broadcasts`. 183 lines.
- **`model.ts`** — Prisma query helpers and request validation models. 33 lines.
- **`service.ts`** — Core business logic. 898 lines.

## Route prefix
`/api/broadcasts`

## Key tables
- `broadcasts`
- `broadcast_logs`

## Implementation status
### Selesai
- [x] Module structure (index.ts + service + model) — total 1114 lines
- [x] Route registration under `/api/broadcasts`
- [x] Multi-tenant isolation via `app_id` context
- [x] Model — 33 lines
- [x] Service — 898 lines

### Belum / pending
- Tidak ada item pending untuk modul ini.
