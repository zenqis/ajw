# PRD — Frontend

## Problem
Tanpa frontend yang terdokumentasi dengan baik, developer dan AI tidak bisa merebuild interface OpenCRM secara konsisten. 40+ halaman dengan role-based access, real-time events, dan multi-organization context perlu didokumentasikan secara detail.

## Goal
Menyediakan SPA frontend yang:
- Mendukung 3 role (agent, supervisor, admin) dengan akses terkontrol
- Real-time update via Socket.IO tanpa polling
- Type-safe API calls end-to-end via Eden Treaty
- Responsive (desktop + mobile)
- Dark/light theme support
- Multi-organization switching tanpa logout

## User stories

### Agent
- Sebagai agent, saya bisa melihat dan merespons chat customer dari berbagai channel (WhatsApp, Instagram, dll)
- Sebagai agent, saya bisa melihat informasi kontak dan riwayat percakapan
- Sebagai agent, saya bisa menggunakan template WhatsApp untuk menjawab cepat
- Sebagai agent, saya bisa meminta AI untuk suggest reply
- Sebagai agent, saya bisa menambahkan label dan catatan ke percakapan

### Supervisor
- Sebagai supervisor, saya bisa memonitor performa team (CSAT, response time)
- Sebagai supervisor, saya bisa assign/reassign chat ke agent lain
- Sebagai supervisor, saya bisa manage orders dan products

### Admin/Owner
- Sebagai admin, saya bisa configure AI models dan routing strategies
- Sebagai admin, saya bisa manage knowledge base untuk RAG
- Sebagai admin, saya bisa build visual workflow automation (flow builder)
- Sebagai admin, saya bisa broadcast messages ke ribuan customers
- Sebagai admin, saya bisa manage CRM pipeline (Kanban)
- Sebagai admin, saya bisa manage team, divisions, dan roles

## Requirements

### Feature matrix
| Feature | Agent | Supervisor | Admin |
|---------|-------|------------|-------|
| Dashboard | ✅ | ✅ | ✅ |
| Live Inbox (Chat) | ✅ | ✅ | ✅ |
| WhatsApp Channel | ✅ | ✅ | ✅ |
| Customer List | ❌ | ✅ | ✅ |
| Team Management | ❌ | ✅ | ✅ |
| Orders | ❌ | ✅ | ✅ |
| Products | ❌ | ✅ | ✅ |
| AI Playground | ❌ | ❌ | ✅ |
| Knowledge Base | ❌ | ❌ | ✅ |
| Flow Builder | ❌ | ❌ | ✅ |
| Broadcast | ❌ | ❌ | ✅ |
| CRM Pipeline | ❌ | ❌ | ✅ |
| Settings | ❌ | ❌ | ✅ |
| Developer Tools | ❌ | ❌ | ✅ |

### UX requirements
- Real-time: Socket.IO (no polling)
- Dark mode: Full support via next-themes
- Mobile responsive: Sidebar → BottomNav on mobile
- Multi-org: Switch organization tanpa logout
- Role-based UI: Path access control + conditional rendering
- Offline-first storage: Auth + org context di localStorage + cookies

### Non-functional
- First meaningful paint: < 2s (SPA with code splitting)
- 40+ routes with TanStack file-based routing
- Type-safe API calls via Eden Treaty
- Accessibility: Radix UI primitives (ARIA compliance)

## Acceptance criteria
- Semua 40+ routes accessible dan merespons dengan benar
- Role-based access control berfungsi
- Real-time events terkirim dan diterima
- Auth flow complete (login → onboarding → dashboard)
- Organization switching smooth tanpa page reload
- Dark/light theme switch instant

## Implementation status
- [x] Semua acceptance criteria terpenuhi
- [x] 40+ protected pages operational
- [x] Real-time Socket.IO events working
- [x] Role-based access control active
- [ ] PWA / offline support — planned
- [ ] Multi-language UI (i18n) — planned
