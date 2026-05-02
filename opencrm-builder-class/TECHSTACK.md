# TECHSTACK — OpenCRM (Scalebiz)

## Monorepo
- **Bun** (≥1.1.0) — Runtime + package manager + bundler
- **TypeScript 5** — Seluruh codebase
- **Bun workspaces** — `apps/backend` + `apps/frontend`
- **Biome v2.4** — Linter + formatter

## Backend
| Category | Choice | Alasan |
|----------|--------|--------|
| Framework | **Elysia.js v1.1** | End-to-end type safety, Eden Treaty, performa tinggi di Bun |
| Database | **PostgreSQL** | JSONB, multi-tenant, mature |
| ORM | **Prisma v7** (`@prisma/adapter-pg`) | Type-safe, migrations, schema introspection |
| Queue | **BullMQ v5** | Production-proven, retry/delay/priority |
| Cache/PubSub | **Redis** (ioredis v5) | Queue backend, socket adapter, locks |
| Real-time | **Socket.IO v4** + Redis adapter | Bi-directional, rooms, scaling |
| Auth | **Better Auth v1.4** | Prisma adapter, email/password, sessions |
| Storage | **@aws-sdk/client-s3** | S3/R2 compatible |
| API docs | **@elysiajs/swagger** | Auto-generated OpenAPI |
| Payment | **Xendit** + **Pakasir** | Payment gateway + POS |

## Frontend
| Category | Choice | Alasan |
|----------|--------|--------|
| Framework | **TanStack Start** (Vite + React 18) | File-based routing, SSR, type-safe |
| Router | **TanStack Router** | Type-safe, file-based |
| Styling | **Tailwind CSS v4** | Utility-first |
| UI Components | **shadcn/ui** + Radix UI | Customizable, accessible |
| Icons | **Lucide React** | Consistent icon set |
| Charts | **Recharts** | Analytics visualizations |
| Rich Text | **TipTap v3** | Extensible editor |
| Flow Builder | **@xyflow/react** (React Flow v12) + dagre | Visual workflow canvas |
| DnD | **@dnd-kit/core** + sortable | Pipeline kanban |
| Date | **date-fns v4** + react-day-picker | Date formatting + picker |
| Form Validation | **Zod v4** | Schema validation |
| Toast | **Sonner** | Notifications |
| API Client | **Eden Treaty** (@elysiajs/eden) | Type-safe FE→BE calls |
| Socket | **socket.io-client** | Real-time events |
| Theme | **next-themes** | Dark/light mode |

## BullMQ Queues
| Queue | Purpose |
|-------|---------|
| `incoming-messages` | Inbound WA/IG/TikTok processing |
| `outbound-messages` | Outgoing message sending + conversation locking |
| `ai-processing` | AI response generation |
| `webhooks` | Webhook delivery + retry |
| `maintenance` | Cleanup, reconciliation |
| `cron-jobs` | Scheduled tasks |
| `conversation-bulk` | Bulk operations |

## Database (80+ Prisma models)
Lihat detail di `backend/STRUCTURE.md`.

## Deployment
- Docker + K3s/Helm + Cloudflare Tunnel
- Cloudflare R2 untuk media storage
