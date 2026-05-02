# Blueprint — Webhook Module

## Objective
Incoming webhook processing for WhatsApp, Instagram, and TikTok message events.

## Responsibilities
- WhatsApp webhook verification (GET)
- WhatsApp message webhook processing (POST)
- Instagram webhook processing
- TikTok webhook processing
- Event parsing + BullMQ job dispatch
- Webhook event logging

## File structure
```
modules/webhook/
  index.ts (120 lines)
  model.ts (22 lines)
  service.ts (4675 lines)
```

### File descriptions
- **`index.ts`** — Elysia route plugin. Registers all HTTP endpoints under `/api/v1/webhooks`. 120 lines.
- **`model.ts`** — Prisma query helpers and request validation models. 22 lines.
- **`service.ts`** — Core business logic. 4675 lines.

## Route prefix
`/api/v1/webhooks`

## Key tables
- `webhook_events`

## Implementation status
### Selesai
- [x] Module structure (index.ts + service + model) — total 4817 lines
- [x] Route registration under `/api/v1/webhooks`
- [x] Multi-tenant isolation via `app_id` context
- [x] Model — 22 lines
- [x] Service — 4675 lines

### Belum / pending
- Tidak ada item pending untuk modul ini.
