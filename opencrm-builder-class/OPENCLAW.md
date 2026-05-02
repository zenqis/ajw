# OpenClaw Entry Point — OpenCRM

Purpose: give an AI builder one small, deterministic starting point for rebuilding OpenCRM from docs without reverse-engineering the whole source tree.

## First Rule

Use docs as the product contract, then use source code only to resolve ambiguity. If source and docs conflict, prefer the newest generated contract files listed below, then record the conflict before implementing.

## Required Toolchain First

Install and verify these before scaffold/build work:

| Tool | Required | Verify | Why |
|---|---|---|---|
| Git | yes | `git --version` | clone/source control |
| Node.js 20+ with npm/npx | yes | `node --version`, `npx --version` | frontend scripts and JS ecosystem tooling |
| Bun 1.1+ | yes | `bun --version` | monorepo runtime, package manager, backend runtime |
| PostgreSQL 15+ with pgvector | yes | `psql --version`, `CREATE EXTENSION IF NOT EXISTS vector;` | primary database plus RAG vector search |
| PostgreSQL client tools | yes | `createdb --version`, `psql --version` | create/import database from docs |
| Redis 7+ | yes | `redis-cli ping` | BullMQ queues, locks, Socket.IO adapter, caches |
| Docker | recommended | `docker --version` | easiest local Postgres+pgvector and Redis |
| Browser | recommended | open `http://localhost:3005` | frontend smoke test |
| Cloudflared | optional | `cloudflared --version` | public webhook tunnel for Meta/Pakasir local testing |

Minimum local services before app smoke test:

| Service | Port |
|---|---:|
| PostgreSQL + pgvector | 5432 |
| Redis | 6379 |

## Workspace Layout

On the OpenClaw server, keep the builder class separate from generated app code.

| Purpose | Path |
|---|---|
| Builder class docs/contracts | `/home/openclaw/opencrm-builder-class` |
| Generated frontend/backend app output | `/home/openclaw/.openclaw/workspace/opencrm-app` |

Use:

```bash
export OPENCRM_BUILDER_CLASS=/home/openclaw/opencrm-builder-class
export OPENCRM_APP=/home/openclaw/.openclaw/workspace/opencrm-app
mkdir -p "$OPENCRM_APP"
```

Rules:

- Read contracts from `$OPENCRM_BUILDER_CLASS`.
- Write generated app code only under `$OPENCRM_APP`.
- Keep docs/class files and generated app files separated.
- Connection commands for PostgreSQL/Redis live in `TOOLS.md`.

## Execution Guardrails

Do not lint, build, test, start servers, or run smoke checks until the ordered setup gates are complete.

Blocked before gates are complete:

| Blocked command/action | Wait until |
|---|---|
| `bun run lint`, `bunx biome`, `tsc --noEmit` | implementation files exist and route/page/schema parity pass is complete |
| `bun run build:*`, `vite build`, `bun build` | backend + frontend scaffold and env/db setup are complete |
| `bun test`, `bun run test` | app code and test fixtures are complete |
| `bun run dev:*`, `bun run start:*`, `./run-backend.sh`, `./run-frontend.sh` | prerequisites, env files, Postgres+pgvector, Redis, DB schema, Prisma generate, and core seed are complete |
| Browser smoke test | backend API, Socket.IO, worker/scheduler, and frontend have been started intentionally after all prior gates |

Allowed early actions:

- Read docs in the documented read order.
- Inspect source only to resolve a documented ambiguity.
- Install system prerequisites.
- Create/copy env example files.
- Start local Postgres/Redis infra.
- Run DB setup commands only at the database gate.
- Patch files according to the current build stage.

Gate order:

1. Toolchain verified.
2. Docs read order completed.
3. Repository scaffolded.
4. Env examples copied and required local env filled.
5. PostgreSQL with pgvector and Redis running.
6. PostgreSQL and Redis access verified using `TOOLS.md`.
7. Database created and `database/schema.sql` imported.
8. Prisma client generated.
9. Core seed executed.
10. Backend modules implemented to API contract.
11. Frontend pages wired to page/API map.
12. Realtime/state/pipeline parity checked by code review.
13. Only then run lint/build/test/server smoke.

## Read Order

| Step | File | Why |
|---|---|---|
| 1 | `README.md` | documentation map |
| 2 | `REBUILD-FROM-SCRATCH.md` | build sequence and acceptance gates |
| 3 | `TOOLS.md` | workspace paths and PostgreSQL/Redis connection checks |
| 4 | `PRD.md` | product intent |
| 5 | `TECHSTACK.md` | required stack |
| 6 | `MEMORY.md` | global architecture decisions |
| 7 | `database/schema.sql` | database shape |
| 8 | `database/ERD.md` | relationship map |
| 9 | `database/SEED-DATA.md` | initial data and seed commands |
| 10 | `backend/blueprint.md` | backend architecture |
| 11 | `backend/API-CONTRACTS.md` | REST contract |
| 12 | `backend/PIPELINE.md` | message pipeline |
| 13 | `backend/SOCKET-EVENTS.md` | realtime contract |
| 14 | `backend/STATE-MACHINES.md` | business state transitions |
| 15 | `shared/TYPES.md` | shared FE/BE types |
| 16 | `frontend/blueprint.md` | frontend architecture |
| 17 | `frontend/UI-REFERENCE.md` | visual reference |
| 18 | `frontend/PAGE-API-MAP.md` | frontend wiring |
| 19 | `INTEGRATIONS.md` | third-party setup |

Machine-readable version: `MANIFEST.json`.

## Source of Truth Matrix

| Need | Primary doc | Secondary doc/source |
|---|---|---|
| Install and run locally | `SETUP.md` | `package.json`, `apps/*/package.json` |
| Workspace paths and DB/Redis connections | `TOOLS.md` | server shell/env |
| DB tables and relations | `database/schema.sql` | `database/ERD.md`, `apps/backend/prisma/schema.prisma` |
| API routes | `backend/API-CONTRACTS.md` | `apps/backend/src/modules/**/index.ts` |
| API request/response shapes | `backend/API-CONTRACTS.md` | `apps/backend/src/modules/**/model.ts` |
| Realtime rooms/events | `backend/SOCKET-EVENTS.md` | `apps/backend/src/plugins/socket.ts`, `apps/frontend/src/lib/socket.ts` |
| Pipeline behavior | `backend/PIPELINE.md` | `apps/backend/src/modules/webhook/service.ts`, `apps/backend/src/workers/index.ts` |
| Status rules | `backend/STATE-MACHINES.md` | module services |
| Shared types | `shared/TYPES.md` | Prisma schema, frontend API client |
| Frontend routes | `frontend/PAGE-API-MAP.md` | `apps/frontend/src/routes/**` |
| Visual parity | `frontend/UI-REFERENCE.md` | existing frontend components |
| Seeds | `database/SEED-DATA.md` | `apps/backend/prisma/seed.ts`, `apps/backend/scripts/*seed*.ts` |
| Integrations | `INTEGRATIONS.md` | `.env.example`, `apps/backend/.env.example`, integration services |

## Build Target

OpenCRM must rebuild as:

- Bun monorepo with `apps/backend` and `apps/frontend`.
- Backend: Elysia, Prisma 7, PostgreSQL with pgvector, BullMQ, Redis, Better Auth, Socket.IO.
- Frontend: TanStack Start/Router, React 18, Tailwind CSS v4, shadcn/Radix patterns, Eden Treaty, Socket.IO client.
- Multi-tenant by app/organization context.
- Core domains: auth, conversations, messages, contacts, WhatsApp/WABA, chatbot/AI, knowledge/RAG, flow runtime, broadcast, handover, commerce, tickets/pipeline, metrics.

## Non-Negotiable Parity Checks

| Area | Must match |
|---|---|
| Database | all tables, FKs, indexes, defaults, pgvector columns from `schema.sql` |
| API | all routes in `API-CONTRACTS.md`, including `/api` and `/api/v1` mirrors |
| Frontend | all pages in `PAGE-API-MAP.md` wired to documented APIs |
| Realtime | rooms and events from `SOCKET-EVENTS.md` |
| Pipeline | webhook -> DB -> socket -> flow -> KB/RAG -> AI -> outbound |
| State | statuses and side effects in `STATE-MACHINES.md` |
| UI | login/sidebar/dashboard and component conventions in `UI-REFERENCE.md` |
| Seeds | AI model pricing seed plus optional catalogs from `SEED-DATA.md` |
| Integrations | WhatsApp, R2/S3, AI, Pakasir setup from `INTEGRATIONS.md` |

## Known Pitfalls

- Do not reopen a resolved conversation on inbound message. Source creates a new conversation row.
- Do not document or implement handover `expired` as a persisted status. Timeout escalates/triages while request remains `pending`.
- Do not assume Xendit is active just because env vars exist. Current mounted commerce flow is Pakasir-first.
- Do not rely on Prisma enum generation for statuses. Most statuses are strings with service-level normalization.
- Do not invent Socket.IO auth unless implementing it explicitly. Current socket contract notes gaps.
- Do not skip `/api/v1` route mirrors. API contract includes both prefixes where mounted.

## Minimal Local Verification

```bash
bun install
psql "$DATABASE_URL" -f "$OPENCRM_BUILDER_CLASS/database/schema.sql"
bun run db:generate
bun run --filter backend db:seed
bun run build:backend
bun run build:frontend
```

Runtime smoke:

```bash
./run-backend.sh
bun run dev:frontend
```

Expected ports:

| Service | Port |
|---|---:|
| Backend API | 3010 |
| Socket.IO | 3011 |
| Frontend | 3005 |
| PostgreSQL | 5432 |
| Redis | 6379 |

## If Context Is Limited

Read only these first:

1. `OPENCLAW.md`
2. `REBUILD-FROM-SCRATCH.md`
3. `TOOLS.md`
4. `backend/API-CONTRACTS.md`
5. `frontend/PAGE-API-MAP.md`
6. `database/ERD.md`
7. `backend/STATE-MACHINES.md`

Then pull details from `MANIFEST.json` by category.
