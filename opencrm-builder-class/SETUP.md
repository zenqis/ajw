# 🚀 OpenCRM (Scalebiz) — Local Development Setup

Panduan lengkap untuk setup development environment dari nol.

## Prerequisites

### 1. Node.js (v20+)
```bash
# macOS (Homebrew)
brew install node@20

# Atau via nvm (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash
nvm install 20
nvm use 20
```

### 2. Bun (≥1.1.0)
```bash
# macOS / Linux
curl -fsSL https://bun.sh/install | bash

# Verify
bun --version
```

### 3. PostgreSQL (with pgvector)
```bash
# macOS (Homebrew)
brew install postgresql@15
brew services start postgresql@15

# Install pgvector extension
brew install pgvector

# Atau via Docker (recommended untuk development):
docker run -d \
  --name opencrm-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=your_password \
  -e POSTGRES_DB=opencrm_db \
  -p 5432:5432 \
  pgvector/pgvector:pg15

# Verify pgvector
psql -U postgres -d opencrm_db -c "CREATE EXTENSION IF NOT EXISTS vector;"
```

### 4. Redis
```bash
# macOS (Homebrew)
brew install redis
brew services start redis

# Atau via Docker:
docker run -d \
  --name opencrm-redis \
  -p 6379:6379 \
  redis:7-alpine

# Verify
redis-cli ping  # Harus response: PONG
```

### 5. Cloudflared (Optional — untuk tunnel)
```bash
brew install cloudflare/cloudflare/cloudflared
```

---

## Quick Start (5 minutes)

```bash
# 1. Clone & masuk ke project
cd opencrm-app

# 2. Copy environment files
cp .env.example .env
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.example apps/frontend/.env

# 3. Edit .env — isi DATABASE_URL dan secrets
#    Minimal: DATABASE_URL, SESSION_SECRET, JWT_SECRET

# 4. Install dependencies
bun install

# 5. Setup database
#    a. Create database (jika belum)
createdb -U postgres opencrm_db

#    b. Enable pgvector
psql -U postgres -d opencrm_db -c "CREATE EXTENSION IF NOT EXISTS vector;"

#    c. Push schema ke database
bun run db:push

#    d. Generate Prisma client
bun run db:generate

#    e. (Optional) Seed data
bun run --filter backend db:seed

# 6. Run development servers
#    Terminal 1: Backend API + Worker
./run-backend.sh

#    Terminal 2: Frontend
bun run dev:frontend
```

---

## Architecture Overview

```
opencrm-app/                     (Bun monorepo workspace)
├── apps/
│   ├── backend/                  (Elysia.js API + BullMQ workers)
│   │   ├── prisma/schema.prisma  (Database schema — 80+ models)
│   │   └── src/
│   │       ├── index.ts          (Multi-mode entrypoint: api/worker/scheduler)
│   │       ├── modules/          (37 domain modules)
│   │       ├── workers/          (BullMQ worker definitions)
│   │       ├── plugins/          (App context, Socket.IO, OpenAPI)
│   │       └── lib/              (Prisma, Redis, S3, Queue singletons)
│   └── frontend/                 (TanStack Start + React 18 + shadcn/ui)
├── docs/                         (AI-readable documentation)
│   ├── database/                 (Schema, blueprint, PRD)
│   ├── backend/                  (Module blueprints)
│   └── frontend/                 (Component blueprints)
└── deploy/                       (Docker, K3s, Helm, VPS)
```

## Ports

| Service | Port | Description |
|---------|------|-------------|
| Backend API | 3010 | Elysia.js HTTP + Socket.IO |
| Frontend | 3005 | TanStack Start dev server |
| PostgreSQL | 5432 | Database |
| Redis | 6379 | Cache + Queue |

## NPM Scripts (Root)

```bash
bun run dev                    # Start all workspaces
bun run dev:backend            # Backend only
bun run dev:frontend           # Frontend only

bun run db:generate            # Regenerate Prisma client
bun run db:push                # Push schema to DB (dev)
bun run db:pull                # Pull schema from DB
bun run db:studio              # Open Prisma Studio

bun run format                 # Biome formatter
bun run lint                   # TypeScript + Biome linting
```

## Backend Scripts

```bash
# From apps/backend/ or via workspace filter
bun run dev:api                # API server only
bun run dev:worker             # BullMQ worker only
bun run dev:scheduler          # Scheduler only

bun run db:seed                # Seed database
bun run db:seed:electronics    # Seed product catalog
```

## Backend Modes

Backend menggunakan single entrypoint (`src/index.ts`) dengan `APP_MODE` env:

| Mode | Purpose |
|------|---------|
| `api` | HTTP server + Socket.IO (default) |
| `worker` | BullMQ workers only |
| `scheduler` | Cron/scheduler only |

`./run-backend.sh` menjalankan `api` + `worker` secara bersamaan.

---

## Database

### Schema
- Source of truth: `apps/backend/prisma/schema.prisma`
- SQL snapshot: `docs/database/schema.sql` (untuk quick import)
- Blueprint: `docs/database/blueprint.md`

### Import Fresh Database
```bash
# Create DB
createdb -U postgres opencrm_db

# Import full schema dari SQL
psql -U postgres -d opencrm_db -f docs/database/schema.sql

# Atau via Prisma (recommended)
bun run db:push
```

### Migrations
```bash
# Create migration
cd apps/backend && bunx prisma migrate dev --name description

# Apply migrations (production)
bunx prisma migrate deploy

# Reset database (destructive!)
bunx prisma migrate reset
```

---

## Troubleshooting

### pgvector not found
```bash
# macOS
brew install pgvector
# Restart PostgreSQL
brew services restart postgresql@15
```

### Port already in use
```bash
# Kill process on port
lsof -ti:3010 | xargs kill -9
lsof -ti:3005 | xargs kill -9
```

### Prisma generate fails
```bash
# Clean and regenerate
rm -rf apps/backend/src/generated
bun run db:generate
```

### Redis connection refused
```bash
# Check if Redis is running
redis-cli ping
# Start Redis
brew services start redis
```
