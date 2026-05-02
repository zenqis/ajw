# OpenCRM Documentation Index

This folder is optimized for OpenClaw or any AI agent that needs to rebuild OpenCRM from documentation with minimum source-code reverse engineering.

## Start Here

| File | Use |
|---|---|
| `OPENCLAW.md` | AI entrypoint: read order, source-of-truth matrix, pitfalls |
| `REBUILD-FROM-SCRATCH.md` | implementation sequence from empty repo to parity |
| `TOOLS.md` | workspace paths plus PostgreSQL/Redis connection commands |
| `MANIFEST.json` | machine-readable doc inventory |

Recommended first command for an AI agent:

```bash
cat OPENCLAW.md
```

## Required First

Before rebuild or smoke test, install Git, Node.js 20+ with npm/npx, Bun 1.1+, PostgreSQL 15+ with pgvector, PostgreSQL client tools, and Redis 7+. Docker is recommended for local infra.

Keep generated app code in `/home/openclaw/.openclaw/workspace/opencrm-app`; keep this builder class as docs/contracts only.

After install/env setup, create the database, enable pgvector, import `database/schema.sql`, and verify PostgreSQL/Redis access using `TOOLS.md`.

## Guardrail

Do not run `lint`, `build`, `test`, `dev`, `start`, `run-backend.sh`, `run-frontend.sh`, or browser smoke tests until the ordered gates in `OPENCLAW.md` and `REBUILD-FROM-SCRATCH.md` are complete.

## Critical Contracts

| Area | File |
|---|---|
| Product requirements | `PRD.md` |
| Tech stack | `TECHSTACK.md` |
| Global decisions | `MEMORY.md` |
| Local setup | `SETUP.md` |
| Integrations | `INTEGRATIONS.md` |
| Tool connections | `TOOLS.md` |
| Shared FE/BE types | `shared/TYPES.md` |
| Database schema | `database/schema.sql` |
| Database ERD | `database/ERD.md` |
| Seed data | `database/SEED-DATA.md` |
| Backend API routes | `backend/API-CONTRACTS.md` |
| Backend pipeline | `backend/PIPELINE.md` |
| Socket.IO events | `backend/SOCKET-EVENTS.md` |
| State machines | `backend/STATE-MACHINES.md` |
| Frontend page/API wiring | `frontend/PAGE-API-MAP.md` |
| Frontend visual reference | `frontend/UI-REFERENCE.md` |

## Current Docs Tree

```text

  README.md
  OPENCLAW.md
  REBUILD-FROM-SCRATCH.md
  TOOLS.md
  MANIFEST.json
  PRD.md
  TECHSTACK.md
  MEMORY.md
  SETUP.md
  INTEGRATIONS.md
  backend/
    blueprint.md
    STRUCTURE.md
    IMPLEMENTATION-STATUS.md
    MEMORY.md
    API-CONTRACTS.md
    PIPELINE.md
    SOCKET-EVENTS.md
    STATE-MACHINES.md
  database/
    blueprint.md
    PRD.md
    MEMORY.md
    schema.sql
    ERD.md
    SEED-DATA.md
  frontend/
    blueprint.md
    STRUCTURE.md
    IMPLEMENTATION-STATUS.md
    MEMORY.md
    PRD.md
    UI-REFERENCE.md
    PAGE-API-MAP.md
    components/
    hooks/
    lib/
    routes/
    types/
  shared/
    TYPES.md
```

## Fast Read Paths

| Goal | Read |
|---|---|
| Rebuild everything | `OPENCLAW.md` -> `REBUILD-FROM-SCRATCH.md` -> `TOOLS.md` -> `MANIFEST.json` |
| Implement backend | `backend/blueprint.md` -> `backend/API-CONTRACTS.md` -> `backend/PIPELINE.md` -> `backend/STATE-MACHINES.md` |
| Implement frontend | `frontend/blueprint.md` -> `frontend/UI-REFERENCE.md` -> `frontend/PAGE-API-MAP.md` -> `shared/TYPES.md` |
| Implement database | `database/schema.sql` -> `database/ERD.md` -> `database/SEED-DATA.md` |
| Implement realtime | `backend/SOCKET-EVENTS.md` -> `backend/PIPELINE.md` -> `frontend/PAGE-API-MAP.md` |
| Setup integrations | `INTEGRATIONS.md` -> `.env.example` -> `apps/backend/.env.example` -> `apps/frontend/.env.example` |

## Rebuild Acceptance

An implementation is not done until it matches:

- all tables and relationships from `database/schema.sql` and `database/ERD.md`
- all REST routes from `backend/API-CONTRACTS.md`
- all Socket.IO rooms/events from `backend/SOCKET-EVENTS.md`
- all state transitions from `backend/STATE-MACHINES.md`
- all frontend page wiring from `frontend/PAGE-API-MAP.md`
- visual shell/reference from `frontend/UI-REFERENCE.md`

## Known Gaps To Preserve As Notes

- Instagram module exists but is not mounted in the current API contract.
- Xendit env/schema compatibility exists, but current mounted commerce payment flow is Pakasir-first.
- Socket.IO auth and some frontend-expected events are documented as current gaps in `backend/SOCKET-EVENTS.md`.
