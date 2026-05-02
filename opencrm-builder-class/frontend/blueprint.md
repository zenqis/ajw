# Blueprint — Frontend (TanStack Start)

## Objective
SPA frontend untuk OpenCRM (Scalebiz) — omnichannel CRM platform. Built with TanStack Start (Vite + React 18), Tailwind CSS v4, shadcn/ui, dan Eden Treaty untuk type-safe API calls.

## Responsibilities
- Responsive web UI untuk agents, supervisors, dan admins
- Real-time chat inbox via Socket.IO
- Type-safe API calls ke backend via Eden Treaty
- Visual flow builder (React Flow)
- CRM Kanban pipeline
- Knowledge base management
- AI configuration + playground
- Multi-organization context switching
- Role-based access control
- Dark/light theme

## File map

### `src/routes/__root.tsx` — Root layout
ThemeProvider (next-themes) + Sonner toaster + global styles.

### `src/routes/_app.tsx` — Authenticated layout (★ critical)
Auth guard + organization context + role-based routing:
1. Check `scalechat_token` localStorage → fallback to Better Auth session
2. `syncOrganizationContextFromSession()` → persist org context
3. `isPathAllowedForRole(pathname, role)` → route access control
4. AppContext provider: `{ appId, agent, toggleSidebar }`

Layout: Sidebar (desktop) + TopBar + Outlet + BottomNav (mobile)

### `src/routes/_app/` — Protected pages (40+ routes)
| Page | File | Size | Purpose |
|------|------|------|---------|
| Dashboard | `dashboard.tsx` | 16KB | KPI overview with charts |
| Chat | `chat.tsx` | 64KB | ★ Live agent inbox |
| AI Config | `ai.tsx` | 41KB | Provider management + playground |
| Team | `team.tsx` | 74KB | Team + divisions + members |
| Products | `products.tsx` | 58KB | Product catalog + variants |
| Broadcast | `broadcast.tsx` | 55KB | Campaign creation + audience |
| Settings | `settings.tsx` | 40KB | Multi-tab settings hub |
| Knowledge | `knowledge.tsx` | 36KB | Knowledge base (sources, FAQs) |
| Orders | `orders.tsx` | 27KB | Order management |
| Pipeline | `pipeline.tsx` | 19KB | CRM Kanban board |
| Handover | `handover.tsx` | 19KB | Agent handover queue |
| Help | `help.tsx` | 20KB | Help page |
| Analytics | `analytics.tsx` | 16KB | Analytics dashboard |
| Templates | `templates.tsx` | 15KB | WA message templates |
| Product Stock | `product-stock.tsx` | 11KB | Inventory management |
| Flows | `flows.tsx` | 10KB | Flow list |
| Metrics | `metrics.tsx` | 8KB | Conversation metrics |

### `src/lib/api.ts` — API client (2553 lines, ~80+ endpoints)
Two patterns:
1. **Eden Treaty** (type-safe): `treatyApi.api.conversations.get(...).then(unwrapTreatyResponse)`
2. **Raw fetch** (fallback): `apiRequest('/path', { method, body })`

Auth headers: `Authorization: Bearer <token>`, `X-Org-Slug`, `X-App-Id`

### `src/lib/server.ts` — Eden Treaty setup
```ts
import { treaty } from '@elysiajs/eden'
import type { App } from 'backend'
export const api = treaty<App>(API_BASE)
```

### `src/lib/socket.ts` — Socket.IO client (144 lines)
WebSocket-only transport. Events: `conversation:created`, `conversation:updated`, `message:created`, `ai:suggestion`, `agent:presence`.

### `src/lib/organization.ts` — Org context (521 lines)
Cookie-based context: `scalechat_org_slug`, `scalechat_app_id`, `scalechat_org_id`.
`syncOrganizationContextFromSession()` + org CRUD API.

### `src/lib/role-access.ts` — Role guard (76 lines)
| Role | Allowed paths |
|------|--------------|
| `agent` | `/dashboard`, `/chat`, `/channels/whatsapp` |
| `supervisor` | + `/team`, `/orders`, `/products`, `/product-stock`, `/settings` |
| `admin`/`owner` | All paths |

### `src/components/ui/` — shadcn/ui (~50 components)
Base primitives: accordion, alert, avatar, badge, button, card, calendar, chart, checkbox, dialog, drawer, dropdown-menu, input, label, popover, progress, select, sheet, sidebar, skeleton, switch, table, tabs, textarea, toggle, tooltip, etc.

### `src/components/settings/` — Settings managers (10 files)
`AIConfigurationManager`, `AIAgentPersonaManager`, `KnowledgeManager`, `WhatsAppSettingsManager`, `AutoAssignManager`, `SLAManager`, `ContactSettingsManager`, `LabelsManager`, `CustomerLevelAgentMappingManager`, `PakasirSettingsManager`

### `src/components/flows/` — Flow builder (3 files)
`AINodeTypes.tsx`, `AINodes.tsx`, `AIConfigForm.tsx` — Custom node definitions and rendering for React Flow.

### `src/hooks/` — Custom hooks
`use-mobile.ts`, `useTimezone.ts`

### `src/types/` — Type definitions
`pg.d.ts`

## Tech stack
| Category | Library |
|----------|---------|
| Framework | TanStack Start (Vite + React 18) |
| Router | TanStack Router (file-based) |
| Styling | Tailwind CSS v4 |
| Components | shadcn/ui + Radix UI (~50 components) |
| Icons | Lucide React |
| Charts | Recharts |
| Rich Text | TipTap v3 |
| Flow Builder | @xyflow/react (React Flow v12) + dagre |
| DnD | @dnd-kit/core + sortable |
| Date | date-fns v4 + react-day-picker |
| Validation | Zod v4 |
| Toast | Sonner |
| API Client | Eden Treaty (@elysiajs/eden) |
| Socket | socket.io-client |
| Theme | next-themes (dark/light) |
| Drawer | Vaul |
| Command | cmdk |

## Implementation status

### Selesai
- [x] TanStack Start (Vite + React 18)
- [x] TanStack Router (file-based, ~40+ routes)
- [x] Tailwind CSS v4 + shadcn/ui (~50 base components)
- [x] Eden Treaty (type-safe API client)
- [x] Socket.IO client (real-time events)
- [x] Dark/light theme (next-themes)
- [x] Responsive layout (Sidebar + TopBar + BottomNav)
- [x] Role-based route access control
- [x] Organization context (cookies + localStorage)
- [x] Auth flow (login, register, onboarding)
- [x] Token refresh on 401
- [x] All 40+ protected pages — operational
- [x] 10 settings managers
- [x] 3 flow builder components
- [x] 15+ modal components
- [x] 30+ standalone components

### Belum / pending
- [ ] PWA / offline support
- [ ] Multi-language UI (i18n)
- [ ] Advanced code splitting
- [ ] Comprehensive E2E tests
- [ ] Performance optimization (virtualized lists for chat)
