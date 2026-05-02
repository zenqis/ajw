# Blueprint — Message Module

## Objective
Message CRUD and delivery status tracking for omnichannel conversations.

## Responsibilities
- Message creation + sending via BullMQ
- Message listing per conversation
- Message status update (sent → delivered → read → failed)
- Message deletion (soft)
- Reply-to message linking
- Media message handling

## File structure
```
modules/message/
  index.ts (84 lines)
  model.ts (51 lines)
  service.ts (173 lines)
```

### File descriptions
- **`index.ts`** — Elysia route plugin. Registers all HTTP endpoints under `/api/messages`. 84 lines.
- **`model.ts`** — Prisma query helpers and request validation models. 51 lines.
- **`service.ts`** — Core business logic. 173 lines.

## Route prefix
`/api/messages`

## Key tables
- `messages`
- `message_status_history`

## Implementation status
### Selesai
- [x] Module structure (index.ts + service + model) — total 308 lines
- [x] Route registration under `/api/messages`
- [x] Multi-tenant isolation via `app_id` context
- [x] Model — 51 lines
- [x] Service — 173 lines

### Belum / pending
- Tidak ada item pending untuk modul ini.
