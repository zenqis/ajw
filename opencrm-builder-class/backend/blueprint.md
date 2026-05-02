# Blueprint — Backend (Elysia.js)

## Objective
Backend API server untuk OpenCRM (Scalebiz) — omnichannel CRM platform. Dibangun di atas **Elysia.js v1.1** (Bun runtime), arsitektur **modular monolith**, dengan 37 domain modules, BullMQ workers, dan Socket.IO real-time.

## Responsibilities
- HTTP API server (REST) untuk semua domain OpenCRM
- Real-time WebSocket events via Socket.IO
- Background job processing via BullMQ (7 queues)
- Multi-provider AI integration (OpenAI, Azure, Growthcircle)
- Omnichannel message processing (WhatsApp, Instagram, TikTok)
- Multi-tenant data isolation via `app_id` context
- Type-safe API contract export via Eden Treaty

## File map

### `src/index.ts` — Entrypoint (multi-mode)
Single entrypoint yang mendukung 3 mode operasi via `APP_MODE` env:
| APP_MODE | Fungsi |
|----------|--------|
| `api` (default) | HTTP server (port 3010) + Socket.IO (port 3011) |
| `worker` | BullMQ job processors only |
| `scheduler` | Cron-based recurring jobs |

App setup flow (mode `api`):
1. `new Elysia({ name: 'scalebiz' })`
2. `.use(cors({ ... }))` → Multi-origin CORS
3. `.use(appContext)` → Global derive: userId, appUuid, orgSlug
4. `.use(openApiPlugin)` → Swagger/OpenAPI at `/docs`
5. `.use(socketPlugin)` → Socket.IO + Redis adapter
6. `.group('/auth', ...)` → Better Auth routes
7. `.group('/api', ...)` → All 37 module routes
8. `.listen(PORT)`

Exports `type App` yang dipakai frontend via Eden Treaty.

### `src/auth.ts` — Better Auth configuration
Better Auth setup:
- Database: Prisma adapter
- Session: 7-day expiry, daily renewal
- UUID generation: `crypto.randomUUID()`
- Plugins: organization
- Trusted origins from env `TRUSTED_ORIGINS` + defaults

### `src/plugins/app-context.ts` — Global auth context (384 lines)
Pada setiap request, resolve:
1. Bearer token → `session` table → userId
2. Better Auth cookie → session → userId
3. userId → `users.app_id` → `apps` record → appUuid + orgSlug
4. Fallback: `x-app-id` / `x-api-key` / `x-app-secret` headers
5. API key auth via `DeveloperKeysService.resolveBusinessIdByApiKey()`

### `src/plugins/socket.ts` — Socket.IO server (134 lines)
- Standalone Socket.IO di port 3011
- Redis adapter untuk multi-process pub/sub
- Rooms: `app:{appId}`, `account:{accountId}`, `conversation:{conversationId}`

### `src/plugins/openapi.ts` — Swagger
Auto-generated API documentation di `/docs`.

### `src/lib/prisma.ts` — PrismaClient singleton
`@prisma/adapter-pg` + `pg.Pool` driver adapter pattern.

### `src/lib/redis.ts` — Redis singleton
ioredis v5 client. Dipakai oleh BullMQ, Socket.IO, cache, locks.

### `src/lib/queue.ts` — BullMQ definitions
7 named queues + `addJob()` helper:
- `incoming-messages` — Inbound message processing
- `outbound-messages` — Message sending with conversation locking
- `ai-processing` — AI response generation
- `webhooks` — External webhook delivery
- `maintenance` — Knowledge indexing, cleanup
- `cron-jobs` — Follow-up dispatch
- `conversation-bulk` — Bulk operations

### `src/lib/s3.ts` — S3/R2 client (127 lines)
S3-compatible storage client + `buildS3PublicUrl()` + path/virtual-hosted detection.

### `src/lib/meta-api.ts` — Meta Graph API
WhatsApp + Instagram message sending via Meta Graph API.

### `src/lib/tiktok-api.ts` — TikTok API
TikTok Business message sending.

### `src/lib/realtime.ts` + `realtime-emitter.ts`
Socket.IO instance holder + `emitRealtimeToRoom()` helper.

### `src/lib/organization-app.ts`
`ensureOrganizationAppLink()` — auto-create apps record for organization.

### `src/lib/utils.ts`
`resolveAppId()` — normalize app_id to UUID.

### `src/workers/index.ts` — BullMQ workers (2312 lines)
Single file registering all BullMQ worker processors. Key patterns:
- **Outbound message ordering**: Redis lock per conversation → check oldest pending → send → release
- **Conversation locking**: `SET lock:outbound:conversation:{id} {token} PX 120000 NX`
- **Lock auto-renew**: every 10s during processing

### `src/modules/` — 37 domain modules
Each module follows convention:
```
modules/<name>/
├── index.ts      → Elysia route plugin
├── service.ts    → Business logic (static class methods)
├── model.ts      → Prisma query helpers (optional)
└── *-service.ts  → Specialized services (optional)
```

## Module list (37 modules)
| Module | Route prefix | Total lines | Key service |
|--------|-------------|-------------|-------------|
| auth | `/auth` | 618 | Better Auth integration |
| user | `/api/user` | 261 | Profile management |
| agent | `/api/agents-management` | 2103 | Availability, channels, divisions |
| agent-settings | `/api/agent-settings` | 380 | App-level + per-user config |
| team | `/api/teams` | 273 | Team + members |
| conversation | `/api/conversations` | 3053 | Lifecycle, assign, bulk, AI analytics |
| message | `/api/messages` | 305 | CRUD, status tracking |
| contact | `/api/contacts` | 1152 | Custom fields, tags, notes |
| customer | `/api/customers` | 1518 | VIP/Premium/Basic routing |
| inbox | `/api/inboxes` | 218 | Channel routing, chatbot binding |
| whatsapp | `/api/whatsapp-channels` | 1107 | WABA OAuth, channel setup |
| whatsapp-templates | `/api/whatsapp-templates` | 203 | Meta template sync |
| waba | `/api/waba` | 150 | Embedded signup |
| webhook | `/api/v1/webhooks` | 4814 | WA/IG/TikTok inbound |
| webhooks | `/api/webhooks` | 48 | Pakasir payment webhooks |
| business-webhooks | `/api/business-webhooks` | 1610 | External webhook dispatch |
| instagram | `/api/instagram` | 587 | IG OAuth, DM integration |
| ai | `/api/ai` | 6503 | Provider config, playground |
| chatbot | `/api/chatbots` | 10448 | Simulation, follow-ups, logging |
| knowledge | `/api/knowledge` | 4623 | RAG pipeline, embedding |
| flow | `/api/flows` | 10817 | Runtime engine, decision engine |
| orchestration | `/api/orchestration` | 216 | Cross-module coordination |
| crm | `/api/crm` | 323 | Pipelines, stages |
| broadcast | `/api/broadcasts` | 1111 | Campaign broadcast |
| label | `/api/labels` | 319 | Label CRUD |
| form | `/api/forms` | 206 | AI-assisted forms |
| media | `/api/media` | 227 | S3 upload/download |
| metrics | `/api/metrics` | 1380 | Analytics, KPIs |
| orders | `/api/orders` | 866 | Order management |
| commerce | `/api/commerce` | 6042 | Pakasir POS, products |
| canned-response | `/api/canned-responses` | 91 | Quick replies |
| handover | `/api/handover` | 1638 | AI→human transfer |
| template-variables | `/api/template-variables` | 98 | Dynamic vars |
| developer-keys | `/api/developer-keys` | 816 | API key management |
| api-tools | `/api/api-tools` | 631 | External API tools |

## Implementation status

### Selesai
- [x] Elysia.js app skeleton (multi-mode: api/worker/scheduler)
- [x] Better Auth (email/password, sessions, organizations)
- [x] Prisma ORM v7 (@prisma/adapter-pg)
- [x] Redis (ioredis), BullMQ (7 queues)
- [x] Socket.IO + Redis adapter
- [x] S3/R2 storage client
- [x] CORS, OpenAPI/Swagger
- [x] App context plugin (multi-path auth resolution)
- [x] Health check endpoint
- [x] 37 domain modules — all operational
- [x] All 7 BullMQ workers — incoming, outbound, AI, webhooks, broadcasts, maintenance, cron
- [x] Conversation locking pattern (Redis)
- [x] Eden Treaty type export for frontend
- [x] Seed scripts (prisma/seed.ts, scripts/seed-electronics-catalog.ts)

### Belum / pending
- [ ] Email channel integration
- [ ] Telegram backend handler
- [ ] LINE backend handler
- [ ] Comprehensive test suite
- [ ] Rate limiting per-endpoint
- [ ] API versioning strategy
