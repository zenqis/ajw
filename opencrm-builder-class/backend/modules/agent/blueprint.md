# Blueprint — Agent Module

## Objective
Manages agent profiles, availability status, channel assignments, inbox routing, and division membership.

## Responsibilities
- CRUD agent profiles
- Agent availability toggle + max conversation limits
- Channel type assignment per agent
- Inbox assignment management
- Division membership management
- Agent presence (online/offline status)
- Skills and language configuration

## File structure
```
modules/agent/
  index.ts (230 lines)
  model.ts (48 lines)
  service.ts (505 lines)
```

### File descriptions
- **`index.ts`** — Elysia route plugin. Registers all HTTP endpoints under `/api/agents-management`. 230 lines.
- **`model.ts`** — Prisma query helpers and request validation models. 48 lines.
- **`service.ts`** — Core business logic. 505 lines.

## Route prefix
`/api/agents-management`

## Key tables
- `agent_availability`
- `agent_presence`
- `agent_channel_accounts`
- `agent_channels`
- `agent_inbox_assignments`
- `agent_divisions`

## Implementation status
### Selesai
- [x] Module structure (index.ts + service + model) — total 783 lines
- [x] Route registration under `/api/agents-management`
- [x] Multi-tenant isolation via `app_id` context
- [x] Model — 48 lines
- [x] Service — 505 lines

### Belum / pending
- Tidak ada item pending untuk modul ini.
