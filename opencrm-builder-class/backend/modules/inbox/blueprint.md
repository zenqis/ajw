# Blueprint — Inbox Module

## Objective
Channel inbox configuration with chatbot binding, auto-assign setup, and greeting messages.

## Responsibilities
- Inbox CRUD per app
- Chatbot binding per inbox
- Auto-assign configuration
- Greeting/away message setup
- Channel routing

## File structure
```
modules/inbox/
  index.ts (87 lines)
  model.ts (37 lines)
  service.ts (97 lines)
```

### File descriptions
- **`index.ts`** — Elysia route plugin. Registers all HTTP endpoints under `/api/inboxes`. 87 lines.
- **`model.ts`** — Prisma query helpers and request validation models. 37 lines.
- **`service.ts`** — Core business logic. 97 lines.

## Route prefix
`/api/inboxes`

## Key tables
- `inboxes`

## Implementation status
### Selesai
- [x] Module structure (index.ts + service + model) — total 221 lines
- [x] Route registration under `/api/inboxes`
- [x] Multi-tenant isolation via `app_id` context
- [x] Model — 37 lines
- [x] Service — 97 lines

### Belum / pending
- Tidak ada item pending untuk modul ini.
