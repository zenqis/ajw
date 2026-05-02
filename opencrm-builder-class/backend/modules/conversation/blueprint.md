# Blueprint — Conversation Module

## Objective
Core conversation lifecycle: listing with filters, agent assignment, status management, notes, labels, multi-agent collaboration, bulk operations, and AI analytics.

## Responsibilities
- Conversation listing with filters (status, agent, inbox, date, labels, channel, pipeline)
- Status management (open → pending → resolved → snoozed)
- Agent assignment + takeover
- Multi-agent collaboration (conversation_agents)
- Notes CRUD
- Label association
- Activity log (audit trail)
- Bulk operations via BullMQ (status change, assign, labels)
- AI analytics (sentiment, intent, churn risk)
- Contact detail enrichment (AI summary, signals, badges)
- Real-time Socket.IO events (conversation:created, conversation:updated, etc.)

## File structure
```
modules/conversation/
  ai-analytics.ts (226 lines)
  bulk-service.ts (491 lines)
  index.ts (888 lines)
  model.ts (87 lines)
  note-service.ts (119 lines)
  service.ts (1248 lines)
```

### File descriptions
- **`ai-analytics.ts`** — ai analytics. 226 lines.
- **`bulk-service.ts`** — Specialized service: bulk service. 491 lines.
- **`index.ts`** — Elysia route plugin. Registers all HTTP endpoints under `/api/conversations`. 888 lines.
- **`model.ts`** — Prisma query helpers and request validation models. 87 lines.
- **`note-service.ts`** — Specialized service: note service. 119 lines.
- **`service.ts`** — Core business logic. 1248 lines.

## Route prefix
`/api/conversations`

## Key tables
- `conversations`
- `conversation_agents`
- `conversation_labels`
- `conversation_notes`
- `conversation_activity_log`
- `conversation_participants`
- `conversation_ratings`
- `conversation_sales`

## Implementation status
### Selesai
- [x] Module structure (index.ts + service + model) — total 3059 lines
- [x] Route registration under `/api/conversations`
- [x] Multi-tenant isolation via `app_id` context
- [x] Ai analytics — 226 lines
- [x] Bulk service — 491 lines
- [x] Model — 87 lines
- [x] Note service — 119 lines
- [x] Service — 1248 lines

### Belum / pending
- Tidak ada item pending untuk modul ini.
