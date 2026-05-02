# MEMORY — Backend

## Tujuan
Menyimpan keputusan arsitektur, konvensi kode, dan catatan penting backend OpenCRM.

## Aturan kerja
1. Source code backend: `apps/backend/src/`
2. Blueprint backend: `./blueprint.md`
3. STRUCTURE backend: `./STRUCTURE.md`
4. Tiap module punya `blueprint.md`, `PRD.md`, dan `MEMORY.md` sendiri di `./modules/<name>/`
5. Root MEMORY proyek: `../MEMORY.md`

## Keputusan arsitektur aktif

### Stack
- Runtime: Bun ≥1.1
- Framework: Elysia.js v1.1
- ORM: Prisma v7 (`@prisma/adapter-pg`)
- Queue: BullMQ (7 queues)
- Cache/PubSub: Redis (ioredis v5)
- Real-time: Socket.IO + Redis adapter
- Auth: Better Auth + Prisma adapter
- Storage: S3/R2 (Cloudflare R2)

### Konvensi kode

#### Module pattern
```ts
// modules/<name>/index.ts
export const moduleRoutes = new Elysia()
  .group('/<prefix>', (app) =>
    app
      .get('/', handler)
      .post('/', handler)
  )
```

#### Service pattern
```ts
// modules/<name>/service.ts
export class SomeService {
  static async list(appId: string) { ... }
  static async create(appId: string, data: T) { ... }
}
```

#### Model pattern
```ts
// modules/<name>/model.ts
export const SomeModel = {
  findByAppId: (appId: string) =>
    prisma.someTable.findMany({ where: { app_id: appId } })
}
```

#### App context (dari plugin)
```ts
({ appUuid, userId, orgSlug, integrationAuthError }) => {
  if (!appUuid) return error(401, 'Unauthorized')
}
```

## Catatan penting

### Prisma adapter
Prisma TIDAK pakai built-in connection. Pakai `@prisma/adapter-pg` + `pg.Pool`:
```ts
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })
```

### Eden Treaty type export
```ts
// Backend: src/index.ts
export type App = typeof app

// Frontend: lib/server.ts
import type { App } from 'backend'
const api = treaty<App>(baseUrl)
```

### Conversation locking (Redis)
```
SET lock:outbound:conversation:{id} {token} PX 120000 NX
```
- Lock TTL: 120 seconds
- Auto-renew: setiap 10 seconds
- Release: Lua script (atomic check-and-delete)

### Socket.IO rooms
```
app:{appId}              → App-level events
account:{accountId}      → Account-level events
conversation:{convId}    → Per-conversation events
```

### Webhook retry
- Max retries: 10
- Cooldown: 60s between retries
- Replay window: 24 hours

### Media URL validation
Sebelum WhatsApp media send:
1. HEAD request ke URL
2. Check HTTP 200 + content-type match
3. Fallback: GET with `Range: bytes=0-0`
4. Skip untuk trusted hosts

## Status
- Total modules: 37
- Total source lines (modules only): ~60,000+
- Workers: 1 file (2312 lines), 7 queues
- Largest modules: flow (10817), chatbot (10448), ai (6503), commerce (6042)
