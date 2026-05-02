# Rebuild From Scratch — OpenCRM

This runbook turns the docs folder into an implementation sequence. Follow it in order to rebuild a matching OpenCRM app from an empty repository.

## 0. Acceptance Target

A rebuild is complete when:

- PostgreSQL schema matches `database/schema.sql`.
- Backend exposes every documented route in `backend/API-CONTRACTS.md`.
- Socket.IO rooms/events match `backend/SOCKET-EVENTS.md`.
- Message pipeline behavior matches `backend/PIPELINE.md`.
- Business state transitions match `backend/STATE-MACHINES.md`.
- Frontend pages call APIs listed in `frontend/PAGE-API-MAP.md`.
- UI shell and key screens match `frontend/UI-REFERENCE.md`.
- Seed and integration setup follow `database/SEED-DATA.md` and `INTEGRATIONS.md`.
- Builder class/docs stay separate from generated app code.
- PostgreSQL and Redis access are proven before backend/frontend implementation.

## 0.1 Prerequisites Gate

Do this before writing app code:

```bash
git --version
node --version
npx --version
bun --version
psql --version
createdb --version
redis-cli ping
```

Required:

- Git.
- Node.js 20+ with npm/npx.
- Bun 1.1+.
- PostgreSQL 15+ with pgvector support.
- PostgreSQL client tools: `psql`, `createdb`.
- Redis 7+.

Recommended:

- Docker, especially for `pgvector/pgvector:pg15` and `redis:7-alpine`.
- Browser for frontend verification.
- Cloudflared for public webhook callbacks during local integration testing.

Fast local infra with Docker:

```bash
docker run -d \
  --name opencrm-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=your_password \
  -e POSTGRES_DB=opencrm_db \
  -p 5432:5432 \
  pgvector/pgvector:pg15

docker run -d \
  --name opencrm-redis \
  -p 6379:6379 \
  redis:7-alpine

psql -U postgres -d opencrm_db -c "CREATE EXTENSION IF NOT EXISTS vector;"
redis-cli ping
```

## 0.2 Workspace Separation

On the OpenClaw server:

| Purpose | Path |
|---|---|
| Builder class docs/contracts | `/home/openclaw/opencrm-builder-class` |
| Generated app output | `/home/openclaw/.openclaw/workspace/opencrm-app` |

Use:

```bash
export OPENCRM_BUILDER_CLASS=/home/openclaw/opencrm-builder-class
export OPENCRM_APP=/home/openclaw/.openclaw/workspace/opencrm-app
mkdir -p "$OPENCRM_APP"
cd "$OPENCRM_APP"
```

Never generate app code inside `$OPENCRM_BUILDER_CLASS`.

## 0.3 Execution Guardrails

Do not jump to lint/build/test/dev/start before the build sequence is complete.

Blocked early:

- `bun run lint`
- `bunx biome`
- `tsc --noEmit`
- `bun run build:*`
- `vite build`
- `bun test`
- `bun run test`
- `bun run dev:*`
- `bun run start:*`
- `./run-backend.sh`
- `./run-frontend.sh`
- browser smoke tests

Allowed before final verification:

- read docs
- install prerequisites
- install dependencies
- create env files
- start Postgres/Redis
- run database setup at the database step
- generate Prisma client after schema exists
- execute core seed after schema/client are ready
- inspect source for ambiguity
- edit implementation files

Gate checklist before lint/build/run:

| Gate | Required before moving on |
|---|---|
| 1. Toolchain | Git, Node/npx, Bun, Postgres+pgvector, Redis verified |
| 2. Docs | `OPENCLAW.md` read order completed |
| 3. Scaffold | monorepo/package/app folders exist |
| 4. Env | env examples copied and required local values filled |
| 5. Infra | Postgres and Redis running |
| 6. Access | PostgreSQL and Redis access verified using `TOOLS.md` |
| 7. DB | database created, pgvector enabled, `database/schema.sql` imported |
| 8. Prisma | client generated |
| 9. Seed | core AI pricing seed executed |
| 10. Backend | API contract routes implemented |
| 11. Frontend | page/API map implemented |
| 12. Review | pipeline, socket, state machine parity reviewed |
| 13. Verify | now lint/build/test/run smoke may start |

## 1. Scaffold Repository

Create this shape:

```text
opencrm-app/
  package.json
  .env.example
  apps/
    backend/
      package.json
      prisma/
      src/
    frontend/
      package.json
      src/
  docs/
```

Root requirements:

- Bun workspace with `apps/*`.
- TypeScript everywhere.
- Root scripts: `dev`, `dev:backend`, `dev:frontend`, `build`, `build:backend`, `build:frontend`, `db:push`, `db:generate`, `db:studio`.
- Keep env examples aligned with `INTEGRATIONS.md`.
- Create this app under `$OPENCRM_APP`, not inside `$OPENCRM_BUILDER_CLASS`.

## 2. Database First

Read:

1. `database/schema.sql`
2. `database/ERD.md`
3. `database/blueprint.md`
4. `database/SEED-DATA.md`

Implement:

- PostgreSQL database with pgvector extension.
- Prisma schema equivalent to `schema.sql`.
- Multi-tenant pattern: `apps.id` is internal UUID tenant id; many domain rows carry `app_id`.
- Preserve defaults and nullable behavior for status fields.
- Preserve JSONB fields for extensibility.
- Preserve pgvector/tsvector fields for knowledge search.

Database gate commands, after dependency install and env creation:

```bash
export PGHOST=127.0.0.1
export PGPORT=5432
export PGDATABASE=opencrm_db
export PGUSER=postgres
export PGPASSWORD=your_password
export DATABASE_URL="postgresql://${PGUSER}:${PGPASSWORD}@${PGHOST}:${PGPORT}/${PGDATABASE}"

createdb -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" "$PGDATABASE"
psql "$DATABASE_URL" -c "CREATE EXTENSION IF NOT EXISTS vector;"
psql "$DATABASE_URL" -f "$OPENCRM_BUILDER_CLASS/database/schema.sql"
psql "$DATABASE_URL" -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';"
redis-cli -u "${REDIS_URL:-redis://127.0.0.1:6379}" ping
bun run db:generate
bun run --filter backend db:seed
```

If using Prisma migrations instead of SQL import, the resulting database must still match `database/schema.sql`.

## 3. Backend Core

Read:

1. `backend/blueprint.md`
2. `backend/STRUCTURE.md`
3. `backend/API-CONTRACTS.md`
4. `shared/TYPES.md`

Implement backend stack:

- Elysia app entrypoint with `APP_MODE=api|worker|scheduler`.
- Better Auth session/email auth.
- Prisma client singleton.
- Redis singleton.
- BullMQ queues.
- App/tenant context plugin that resolves org slug, app id, bearer/session, legacy app headers.
- Route mounting with both `/api` and `/api/v1` compatibility where documented.

Build order:

1. Auth and tenant context.
2. Database-backed CRUD modules.
3. Messaging/conversation modules.
4. AI/knowledge/flow modules.
5. Commerce/broadcast/handover modules.
6. Developer/business webhook modules.

Route parity check:

- Create an endpoint inventory from running server/OpenAPI.
- Compare to `backend/API-CONTRACTS.md`.
- Missing routes are blockers.

## 4. Message Pipeline

Read:

1. `backend/PIPELINE.md`
2. `backend/SOCKET-EVENTS.md`
3. `backend/STATE-MACHINES.md`

Implement pipeline:

```text
Meta/TikTok webhook
  -> webhook_events
  -> contact upsert
  -> conversation find/create
  -> message create
  -> Socket.IO message:created
  -> flow runtime
  -> knowledge/RAG
  -> AI reply decision
  -> outbound message queue
  -> provider send
  -> message status update
```

Critical behavior:

- Inbound message creates new conversation if prior thread is resolved.
- Inbound on unresolved thread sets conversation `open`.
- Outgoing agent/bot message starts `pending`.
- Worker sends provider request and sets `sent` or `failed`.
- WhatsApp status webhook can set `delivered`, `read`, or `failed`.
- Maintenance job closes expired messaging windows and emits `conversation:window_expired`.

## 5. State Machines

Read `backend/STATE-MACHINES.md`.

Implement side effects, not only status strings:

- Conversation status emits realtime events.
- Assignment writes history, updates `conversation_agents`, emits `conversation:assigned`, dispatches business webhook.
- Handover approval can assign best agent.
- Broadcast worker writes broadcast logs and final aggregate counts.
- Knowledge source indexing updates source, file, and ingestion job statuses.
- Pakasir webhook is idempotent and updates invoice/order/stock.

## 6. Realtime

Read `backend/SOCKET-EVENTS.md`.

Implement:

- Standalone Socket.IO server on port 3011.
- Redis adapter.
- Rooms: `app:{appId}` and `conversation:{conversationId}`.
- Client join events for app/conversation rooms.
- Emit contracts exactly as documented.

Parity check:

- Trigger inbound message and verify `message:created`.
- Resolve conversation and verify `conversation:resolved`.
- Send WhatsApp status payload and verify `message:status_updated`.

## 7. Frontend Shell

Read:

1. `frontend/blueprint.md`
2. `frontend/STRUCTURE.md`
3. `frontend/UI-REFERENCE.md`
4. `frontend/PAGE-API-MAP.md`

Implement:

- TanStack Start + file-based routes.
- Auth pages and app layout.
- Sidebar/navigation.
- API client with auth headers, org slug, legacy app id/app secret.
- Socket client with app/conversation joins.
- Shared UI components and design patterns.

Do not make a marketing landing page. First screen after auth should be the usable app surface.

## 8. Frontend Pages

Use `frontend/PAGE-API-MAP.md` as wiring checklist.

For every page:

- Create route.
- Implement data loader/API calls.
- Implement user actions -> API mutations.
- Listen to documented Socket.IO events where relevant.
- Update local state/cache after response/event.
- Match UI reference and component conventions.

Minimum parity groups:

| Group | Pages/features |
|---|---|
| Auth | login, register, org context |
| Inbox | conversations, messages, contact detail, labels, notes, handover |
| AI | agents, playground/settings, knowledge |
| Flow | visual flow builder, runtime config |
| Commerce | products, variants, orders, invoices/payment links |
| Broadcast | create, schedule, history |
| Settings | WhatsApp/WABA, Pakasir, labels, teams, agents |
| Developers | API keys, webhooks, tools |

## 9. Seeds

Read `database/SEED-DATA.md`.

Implement:

- Main AI model pricing seed.
- Optional electronics catalog seed.
- Optional treatment catalog seed.
- Product knowledge markdown export.

Do not seed real passwords or provider credentials.

## 10. Integrations

Read `INTEGRATIONS.md`.

Implement setup screens and env support for:

- Meta WhatsApp Business.
- R2/S3 media storage.
- AI provider config and RAG embeddings.
- Pakasir payments.
- Socket.IO/Redis.
- Optional Instagram/TikTok.

Preserve Xendit compatibility fields, but do not expose Xendit as active unless routes are rebuilt.

## 11. Verification Gates

Run static checks:

```bash
bun run build:backend
bun run build:frontend
bun run lint
```

Run smoke checks:

```bash
./run-backend.sh
bun run dev:frontend
```

Manual acceptance:

| Check | Expected |
|---|---|
| Login/register | creates session and tenant context |
| API docs inventory | matches `API-CONTRACTS.md` |
| DB schema | matches `schema.sql` |
| Inbound webhook | creates contact/conversation/message |
| Socket event | frontend receives `message:created` |
| Flow runtime | can execute or fail open per state machine |
| Knowledge source | reaches `ready` after index job |
| Outbound message | moves `pending -> sent` or `failed` |
| Conversation resolve | emits `conversation:resolved` |
| Payment link | Pakasir link stored and webhook updates invoice |
| Frontend pages | API calls match `PAGE-API-MAP.md` |

## 12. Final Parity Report

When rebuild finishes, produce:

- Route count vs `API-CONTRACTS.md`.
- Page count vs `PAGE-API-MAP.md`.
- DB table count vs `ERD.md/schema.sql`.
- Socket event coverage vs `SOCKET-EVENTS.md`.
- Known deviations and exact files causing them.
