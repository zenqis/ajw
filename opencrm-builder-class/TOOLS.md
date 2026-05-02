# Tools and Connections — OpenCRM Builder Class

Use this file before coding. It defines where the class docs live, where generated app code must go, and how to prove PostgreSQL/Redis access works.

## Workspace Separation

Do not mix builder-class docs with generated app code.

| Purpose | Path |
|---|---|
| Builder class / docs / contracts | `$OPENCRM_BUILDER_CLASS` |
| Default builder class path on OpenClaw server | `/home/openclaw/opencrm-builder-class` |
| Generated app output workspace | `$OPENCRM_APP` |
| Required app output path on OpenClaw server | `/home/openclaw/.openclaw/workspace/opencrm-app` |

Recommended shell exports:

```bash
export OPENCRM_BUILDER_CLASS=/home/openclaw/opencrm-builder-class
export OPENCRM_APP=/home/openclaw/.openclaw/workspace/opencrm-app
mkdir -p "$OPENCRM_APP"
```

Rules:

- Treat `$OPENCRM_BUILDER_CLASS` as read-mostly source-of-truth docs.
- Put all generated frontend/backend code under `$OPENCRM_APP`.
- Do not create `apps/backend` or `apps/frontend` inside the builder class.
- If docs are copied into the app repo later, keep the class copy unchanged.

## PostgreSQL Connection

Set connection values before DB setup:

```bash
export PGHOST=127.0.0.1
export PGPORT=5432
export PGDATABASE=opencrm_db
export PGUSER=postgres
export PGPASSWORD=your_password
export DATABASE_URL="postgresql://${PGUSER}:${PGPASSWORD}@${PGHOST}:${PGPORT}/${PGDATABASE}"
```

Required access checks:

```bash
pg_isready -h "$PGHOST" -p "$PGPORT" -U "$PGUSER"
psql "$DATABASE_URL" -c "SELECT current_database(), current_user;"
psql "$DATABASE_URL" -c "CREATE EXTENSION IF NOT EXISTS vector;"
psql "$DATABASE_URL" -c "SELECT extname, extversion FROM pg_extension WHERE extname = 'vector';"
```

Create database if missing:

```bash
createdb -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" "$PGDATABASE"
```

Import OpenCRM schema structure from builder class docs:

```bash
psql "$DATABASE_URL" -f "$OPENCRM_BUILDER_CLASS/database/schema.sql"
```

Verify schema import:

```bash
psql "$DATABASE_URL" -c "SELECT COUNT(*) AS tables FROM information_schema.tables WHERE table_schema = 'public';"
psql "$DATABASE_URL" -c "SELECT to_regclass('public.conversations') AS conversations, to_regclass('public.messages') AS messages, to_regclass('public.knowledge_chunks') AS knowledge_chunks;"
psql "$DATABASE_URL" -c "SELECT extname FROM pg_extension WHERE extname = 'vector';"
```

## Redis Connection

Set Redis URL:

```bash
export REDIS_URL=redis://127.0.0.1:6379
```

Required access checks:

```bash
redis-cli -u "$REDIS_URL" ping
redis-cli -u "$REDIS_URL" info server | head
redis-cli -u "$REDIS_URL" set opencrm:health ok EX 60
redis-cli -u "$REDIS_URL" get opencrm:health
```

Expected:

- `PING` returns `PONG`.
- `get opencrm:health` returns `ok`.

## App Env Writes

After app scaffold exists, write the same values into:

| File | Required values |
|---|---|
| `$OPENCRM_APP/.env` | `DATABASE_URL`, `REDIS_URL`, auth secrets, app URLs |
| `$OPENCRM_APP/apps/backend/.env` | `DATABASE_URL`, `REDIS_URL`, `APP_MODE`, socket/payment/storage env |
| `$OPENCRM_APP/apps/frontend/.env` | `VITE_API_URL`, `VITE_SOCKET_URL` |

Minimum local env:

```bash
DATABASE_URL=postgresql://postgres:your_password@127.0.0.1:5432/opencrm_db
REDIS_URL=redis://127.0.0.1:6379
PORT=3010
SOCKET_PORT=3011
FRONTEND_URL=http://localhost:3005
VITE_API_URL=http://localhost:3010
VITE_SOCKET_URL=http://localhost:3011
```

## Hard Gate

Do not continue to backend/frontend implementation until both checks pass:

```bash
psql "$DATABASE_URL" -c "SELECT 1;"
redis-cli -u "$REDIS_URL" ping
```

Do not run lint/build/test/dev/start until:

- PostgreSQL access works.
- Redis access works.
- pgvector extension exists.
- `database/schema.sql` has been imported or an equivalent Prisma migration has been applied.
