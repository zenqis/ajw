# Blueprint — Business Webhooks Module

## Objective
External webhook subscription management with event dispatch, retry logic, and message event formatting.

## Responsibilities
- Webhook subscription CRUD per app
- Event dispatch to subscriber URLs
- Retry with exponential backoff
- Message event payload formatting
- Webhook event logging
- Replay failed deliveries

## File structure
```
modules/business-webhooks/
  constants.ts (21 lines)
  dispatch-service.ts (362 lines)
  index.ts (169 lines)
  message-event-formatter.ts (522 lines)
  service.ts (541 lines)
```

### File descriptions
- **`constants.ts`** — Constants and configuration values. 21 lines.
- **`dispatch-service.ts`** — Specialized service: dispatch service. 362 lines.
- **`index.ts`** — Elysia route plugin. Registers all HTTP endpoints under `/api/business-webhooks`. 169 lines.
- **`message-event-formatter.ts`** — message event formatter. 522 lines.
- **`service.ts`** — Core business logic. 541 lines.

## Route prefix
`/api/business-webhooks`

## Key tables
- `webhooks`
- `webhook_events`

## Implementation status
### Selesai
- [x] Module structure (index.ts + service + model) — total 1615 lines
- [x] Route registration under `/api/business-webhooks`
- [x] Multi-tenant isolation via `app_id` context
- [x] Constants — 21 lines
- [x] Dispatch service — 362 lines
- [x] Message event formatter — 522 lines
- [x] Service — 541 lines

### Belum / pending
- Tidak ada item pending untuk modul ini.
