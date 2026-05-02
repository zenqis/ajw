# PRD — OpenCRM (Scalebiz)

## 1. Ringkasan produk
Platform CRM omnichannel all-in-one untuk bisnis yang ingin mengelola seluruh komunikasi pelanggan, AI chatbot, workflow automation, dan e-commerce dari satu dashboard.

Produk ini ditujukan sebagai **SaaS multi-tenant**, dengan setiap organization sebagai tenant terisolasi.

## 2. Masalah yang ingin diselesaikan
- Komunikasi pelanggan tersebar di banyak platform (WA, IG, email)
- Tidak ada satu dashboard untuk semua percakapan
- AI chatbot sulit dikonfigurasi dan tidak terintegrasi dengan knowledge base bisnis
- Workflow manual dan tidak bisa diautomasi
- Tidak ada tracking pipeline penjualan dari percakapan
- Customer data tersebar dan sulit diakses

## 3. Goals
1. Menyatukan semua channel komunikasi pelanggan dalam satu inbox
2. AI chatbot yang belajar dari knowledge base bisnis dan menjawab otomatis
3. Visual workflow builder untuk automasi proses bisnis tanpa coding
4. CRM pipeline langsung dari percakapan pelanggan
5. Broadcasting dan template messaging yang compliant
6. Analytics yang actionable
7. E-commerce flow (orders, payment, products) langsung dari chat

## 4. Non-goals fase saat ini
- Native mobile app (fokus di responsive web)
- Email marketing automation
- Social media posting/scheduling
- Full ERP system

## 5. Primary users
| User | Kebutuhan |
|------|-----------|
| **Business owner** | Monitor performa tim dan bisnis |
| **CS Agent** | Handle percakapan pelanggan real-time |
| **Supervisor/Admin** | Konfigurasi AI, workflow, knowledge base, team |
| **Developer** | Integrasi via API dan webhooks |

## 6. Functional requirements

### A. Authentication & Organization
- Registration dan login (email/password)
- Organization creation dengan onboarding wizard
- Multi-member organization, role-based access (admin, agent, supervisor)
- API key management untuk external integrations

### B. Omnichannel Inbox
- Unified inbox multi-channel (WA, IG, TikTok, LiveChat)
- Real-time updates via WebSocket
- Assignment ke agents/teams, auto-assign rules
- Status management (open, pending, resolved)
- Labels, notes, activity log, bulk operations
- Media attachment support

### C. WhatsApp Integration
- WABA connection, incoming/outgoing messages
- Template message + dynamic variables
- Media validation + sending, multi-number support

### D. AI Chatbot
- Multi-provider (OpenAI, Growthcircle, custom)
- Knowledge base integration (RAG), intent routing
- Simulation/testing mode, response logging + cost tracking
- Follow-up scheduling

### E. Knowledge Base
- Sources (URL, text, file upload), FAQs
- Extraction → chunking → embedding → RAG retrieval
- Category organization, ingestion job tracking

### F. Visual Flow Builder
- React Flow canvas, node types (trigger, condition, action, AI decision)
- Flow execution runtime, decision engine
- Testing/simulation, auto-layout

### G. CRM Pipeline
- Custom pipelines, draggable stages
- Conversation-to-deal linking, stage transitions

### H. Broadcasting
- Audience targeting, template selection
- Scheduled broadcasts, per-recipient tracking

### I. Customer Management
- Contact profiles + custom fields
- VIP status, conversation history, merge, AI insights

### J. E-commerce
- Product catalog + variants, stock management
- Orders, invoices, payments (Xendit, Pakasir)

### K. Analytics & Metrics
- Conversation, agent performance, SLA, AI response analytics

### L. Developer Tools
- API keys, webhook subscriptions, API documentation

## 7. Non-functional requirements
- Real-time message delivery < 1 second
- API response time < 500ms untuk CRUD
- Queue-based processing untuk reliability
- Multi-tenant data isolation
- Type-safe contracts (Eden Treaty)
- Mobile-responsive + dark/light theme

## 8. Dependencies external
- Meta Graph API (WhatsApp/Instagram)
- TikTok Business API
- OpenAI / Growthcircle API
- Xendit + Pakasir (payment)
- Cloudflare R2 (storage)
- Redis, PostgreSQL

## 9. Implementation status — 2026-04-29

### Selesai
- [x] A. Authentication & Organization — Better Auth, multi-org, API keys
- [x] B. Omnichannel Inbox — WhatsApp, Instagram, TikTok, real-time Socket.IO
- [x] C. WhatsApp Integration — WABA, templates, media, multi-number
- [x] D. AI Chatbot — Multi-provider, RAG, simulation, cost tracking, follow-ups
- [x] E. Knowledge Base — Sources, FAQs, extraction, chunking, embedding, RAG
- [x] F. Visual Flow Builder — React Flow, runtime engine, decision engine
- [x] G. CRM Pipeline — Pipelines, stages, deals, transitions
- [x] H. Broadcasting — Audience targeting, template merging, scheduling
- [x] I. Customer Management — Contacts, custom fields, tags, VIP, merge
- [x] J. E-commerce — Products, variants, orders, invoices, stock, Pakasir
- [x] K. Analytics & Metrics — Conversation, agent, SLA analytics
- [x] L. Developer Tools — API keys, webhooks, API docs

### Belum / pending
- [ ] Email channel integration
- [ ] Telegram / LINE channel
- [ ] Native mobile app (PWA planned)
- [ ] Multi-language UI (i18n)
- [ ] Comprehensive E2E test suite
