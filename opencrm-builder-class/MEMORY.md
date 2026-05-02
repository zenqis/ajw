# MEMORY — OpenCRM (Scalebiz)

## Tujuan
Root-level memory file. Menyimpan keputusan arsitektur, konvensi global, dan state keseluruhan proyek OpenCRM.

## Aturan kerja
1. Keputusan penting dan ringkasan progres tulis di file ini.
2. Setiap subfolder (`backend/`, `frontend/`, `database/`) punya MEMORY.md sendiri.
3. Setiap module di `backend/modules/` punya blueprint.md, PRD.md, MEMORY.md sendiri.
4. Blueprint di setiap folder menjelaskan detail file-by-file.
5. Implementation status ada di setiap blueprint — harus sync antara root dan per-folder.

## Arsitektur keputusan aktif
- Monorepo workspace (Bun workspaces)
- Backend: Elysia.js v1.1 + BullMQ + Socket.IO + Prisma v7 + Better Auth
- Frontend: TanStack Start + React 18 + Tailwind v4 + shadcn/ui + Eden Treaty
- DB: PostgreSQL 15+ (pgvector, 112 models), Cache: Redis (ioredis v5), Storage: Cloudflare R2
- Auth: Better Auth (email/password, organizations)
- Deployment: Docker + K3s/Helm

## Multi-mode entrypoint
Backend punya satu entrypoint (`src/index.ts`) dengan `APP_MODE` env:
- `api` → HTTP server + Socket.IO (default)
- `worker` → BullMQ workers only
- `scheduler` → Cron/scheduler only

## Dokumentasi hierarki
```
docs/
├── MEMORY.md              ← File ini (root)
├── PRD.md                 ← Product requirements
├── SETUP.md               ← Development setup guide
├── TECHSTACK.md           ← Technology stack
├── README.md              ← Ringkasan
├── backend/
│   ├── blueprint.md       ← Backend architecture
│   ├── MEMORY.md          ← Backend decisions
│   ├── STRUCTURE.md       ← Backend file tree
│   ├── IMPLEMENTATION-STATUS.md
│   └── modules/           ← 34 module folders, each with blueprint/PRD/MEMORY
├── frontend/
│   ├── blueprint.md       ← Frontend architecture
│   ├── MEMORY.md          ← Frontend decisions
│   ├── PRD.md             ← Frontend requirements
│   ├── STRUCTURE.md       ← Frontend file tree
│   ├── IMPLEMENTATION-STATUS.md
│   ├── components/        ← 8 component group folders
│   ├── hooks/             ← Custom hooks docs
│   ├── lib/               ← Library utilities docs
│   ├── routes/            ← Route page docs
│   └── types/             ← Type definitions docs
└── database/
    ├── blueprint.md       ← Database architecture (112 models)
    ├── MEMORY.md          ← Database decisions
    ├── PRD.md             ← Database requirements
    └── schema.sql         ← SQL snapshot (importable)
```

## Urutan rebuild dari nol
1. Prerequisites install (Node, Bun, PostgreSQL + pgvector, Redis) → `SETUP.md`
2. Clone + `bun install`
3. Database setup: copy `.env.example` → `.env`, create DB, push schema → `database/blueprint.md`
4. Backend foundation (Elysia, auth, plugins, lib) → `backend/blueprint.md`
5. Frontend foundation (TanStack Start, routing, UI) → `frontend/blueprint.md`
6. Auth module → `backend/modules/auth/`
7. User & Organization modules
8. Conversation & Message modules
9. WhatsApp integration (webhook, send/receive)
10. Socket.IO real-time
11. BullMQ workers (incoming/outbound)
12. AI module (provider config, response generation)
13. Chatbot module (instances, simulation)
14. Knowledge base (sources, chunking, RAG)
15. Contact & Customer modules
16. Flow builder (React Flow canvas, runtime)
17. CRM pipeline
18. Broadcasting
19. Remaining modules (forms, metrics, labels, etc.)
20. E-commerce (orders, products, payments)
21. Deployment (Docker, K3s, Helm)

## Status proyek
- Backend modules: 37 (semua operational)
- Frontend routes: 40+ (semua operational)
- Database models: 112
- Migrations: 21
- Workers: 7 BullMQ queues
