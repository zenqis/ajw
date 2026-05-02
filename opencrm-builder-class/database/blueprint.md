# Blueprint — Database Layer

## Objective
Menyediakan layer database yang menyimpan seluruh state OpenCRM: multi-tenant SaaS data, omnichannel messaging, AI/RAG pipeline, e-commerce, CRM pipeline, dan audit trail — agar sistem bisa 100% direbuild dari dokumentasi ini.

## Responsibilities
- Schema definition via Prisma ORM
- Multi-tenant data isolation via `app_id` FK
- Vector search via pgvector extension
- Full-text search via PostgreSQL tsvector
- Migration management via Prisma Migrate
- Seed data generation
- Connection pooling via `@prisma/adapter-pg` driver adapter

## File map

### `apps/backend/prisma/schema.prisma` (2282 baris, 112 models)
Source of truth untuk seluruh database schema. Berisi:
- Generator config: `prisma-client-js` dengan output ke `../src/generated/prisma`
- Preview feature: `driverAdapters`
- Datasource: `postgresql`
- 112 model Prisma yang memetakan ke 112+ tabel PostgreSQL
- 200+ indexes (B-tree, GIN, composite)
- Foreign key relations dengan ON DELETE cascade/setNull/noAction
- Unsupported types: `vector` (pgvector), `tsvector` (PostgreSQL FTS)

### `apps/backend/prisma/seed.ts`
Seed script utama untuk data awal development. Jalankan via `bun run --filter backend db:seed`.

### `apps/backend/prisma/migrations/` (21 migration folders)
SQL migration files yang dihasilkan oleh `prisma migrate dev`. Setiap folder berisi satu `migration.sql`.

Migration terbaru:
- `20260424163000_customer_level_settings`
- `20260421180000_workflow_decision_engine`
- `20260421124500_ai_playground_dynamic`
- `20260420220500_handover_requests`
- `20260420193000_advanced_knowledge_base_rag`
- `20260420174000_commerce_journey_pakasir`

### `apps/backend/prisma.config.ts`
Prisma configuration file untuk adapter setup.

### `apps/backend/src/lib/prisma.ts`
PrismaClient singleton menggunakan `@prisma/adapter-pg` (driver adapter pattern). Diimport oleh semua modules.

### `apps/backend/src/lib/redis.ts`
ioredis v5 singleton. Dipakai untuk BullMQ, Socket.IO adapter, pub/sub, cache, dan distributed locks.

### `docs/database/schema.sql` (3100+ baris)
SQL snapshot lengkap yang dihasilkan dari `prisma migrate diff --from-empty --to-schema`. Bisa diimport langsung ke PostgreSQL fresh database. Termasuk `CREATE EXTENSION pgvector` dan `uuid-ossp`.

### `docs/database/blueprint.md` (file ini)
Arsitektur database, domain groups, konvensi, dan implementation status.

### `docs/database/MEMORY.md`
Keputusan arsitektur, catatan progress, dan state terkini database layer.

### `docs/database/PRD.md`
Product requirements untuk database layer.

## Chosen implementation
- **PostgreSQL 15+** — JSONB, multi-tenant, pgvector, tsvector, mature ecosystem
- **Prisma v7** — Type-safe ORM, migration management, schema introspection, driver adapter support
- **`@prisma/adapter-pg`** — Native PostgreSQL driver adapter (bukan Prisma default engine)
- **pgvector** — Vector similarity search untuk RAG knowledge base
- **Redis (ioredis v5)** — BullMQ queue backend, Socket.IO adapter, pub/sub, cache, distributed locks

## Architecture

```
┌─────────────────────────────────────────┐
│              PostgreSQL 15+             │
│  ┌───────────┐  ┌────────────────────┐  │
│  │ pgvector  │  │ tsvector (FTS)     │  │
│  │ extension │  │ built-in           │  │
│  └───────────┘  └────────────────────┘  │
│                                         │
│  112 models, 200+ indexes               │
│  UUID primary keys (gen_random_uuid())  │
│  Multi-tenant via app_id FK            │
└─────────────────────────────────────────┘
         │  @prisma/adapter-pg
┌─────────────────────────────────────────┐
│          Prisma v7 ORM                  │
│  output: src/generated/prisma           │
│  preview: driverAdapters                │
└─────────────────────────────────────────┘
         │
┌─────────────────────────────────────────┐
│              Redis (ioredis v5)          │
│  BullMQ (7 queues) │ Socket.IO Adapter  │
│  PubSub │ Cache │ Distributed Locks     │
└─────────────────────────────────────────┘
```

## Domain groups (112 models)

### A. Auth & Organization — 7 models
| Model | Table | PK | Tenant |
|-------|-------|----|--------|
| `session` | `session` | String (cuid) | userId FK |
| `account` | `account` | String (cuid) | userId FK |
| `verification` | `verification` | String (cuid) | — |
| `organization` | `organization` | String (cuid) | self |
| `member` | `member` | String (cuid) | organizationId |
| `invitation` | `invitation` | String (cuid) | organizationId |
| `users` | `users` | UUID | app_id FK |

### B. Core Business — 6 models
| Model | Tujuan |
|-------|--------|
| `apps` | Tenant hub, hub FK ke semua domain (60+ relasi keluar) |
| `accounts` | Legacy account model (Chatwoot compat) |
| `contacts` | Customer/contact profiles dengan multi-channel identifiers (whatsapp_id, instagram_id, tiktok_id) |
| `conversations` | Omnichannel conversations dengan status tracking, SLA, messaging window |
| `messages` | Chat messages (text, media, system) dengan delivery status tracking |
| `inboxes` | Channel inboxes dengan chatbot binding dan auto-assign config |

### C. Messaging Channels — 4 models
`whatsapp_channels`, `channel_accounts`, `agent_channel_accounts`, `agent_channels`

### D. Agent & Team Management — 10 models
`teams`, `team_members`, `agent_availability`, `agent_presence`, `agent_settings`, `agent_settings_overrides`, `agent_channels`, `agent_inbox_assignments`, `agent_divisions`, `divisions`

### E. Conversation Enrichment — 7 models
`conversation_labels`, `conversation_notes`, `conversation_agents`, `conversation_participants`, `conversation_ratings`, `conversation_activity_log`, `conversation_sales`

### F. AI & Chatbot — 9 models
`chatbots`, `ai_settings`, `ai_conversation_contexts`, `ai_response_logs`, `ai_response_templates`, `ai_evaluations`, `ai_evaluation_messages`, `ai_model_pricing`, `customer_level_settings`

### G. AI Playground — 7 models
`ai_playground_models`, `ai_playground_routing_strategies`, `ai_playground_personas`, `ai_playground_guardrails`, `ai_playground_metric_items`, `ai_playground_sessions`, `ai_playground_turns`

### H. Knowledge Base (RAG) — 9 models
`knowledge_sources`, `knowledge_source_files`, `knowledge_categories`, `knowledge_faqs`, `knowledge_chunks` (dengan `vector` + `tsvector` columns), `knowledge_ingestion_jobs`, `knowledge_query_logs`, `knowledge_query_chunks`, `embeddings` (legacy)

### I. Automation & Flow — 7 models
`automation_flows`, `automation_rules`, `auto_assign_rules`, `auto_responder_rules`, `auto_responder_logs`, `assignment_history`, `handover_requests`

### J. CRM Pipeline — 4 models
`pipelines`, `pipeline_stages`, `conversation_sales`, `stage_transitions`

### K. Broadcasting — 2 models
`broadcasts`, `broadcast_logs`

### L. E-Commerce — 8 models
`products`, `product_variants`, `orders`, `order_items`, `order_invoices`, `stock_reservations`, `stock_movements`, `subscriptions`

### M. Forms (AI-assisted) — 6 models
`forms`, `form_fields`, `form_templates`, `form_submissions`, `form_submission_values`, `form_extraction_logs`

### N. Platform & App Center — 7 models
`platform_settings`, `top_up_packages`, `credit_transactions`, `app_categories`, `app_center`, `app_installations`, `app_usage_logs`

### O. Meta Ads — 3 models
`meta_ads_accounts`, `meta_ads_campaigns`, `meta_ads_insights`

### P. Webhooks & Events — 2 models
`webhooks`, `webhook_events`

### Q. Misc — 12 models
`labels`, `canned_responses`, `template_variables`, `media_files`, `mentions`, `message_status_history`, `office_hours`, `sla_policies`, `sla_breach_events`, `consent_logs`, `contact_custom_fields`, `contact_notes`, `contact_tags`, `contact_tag_assignments`, `custom_attribute_definitions`, `migrations`

## Conventions

### Primary Keys
- Domain models: `UUID` via `gen_random_uuid()`
- Better Auth: `String` (cuid) — generated oleh library
- Legacy exceptions: `mentions`, `custom_attribute_definitions` pakai `autoincrement()`
- Composite PKs: `team_members`, `agent_divisions`, `contact_tag_assignments`, `conversation_labels`, `conversation_participants`, `form_submission_values`

### Multi-Tenancy
- Isolasi via `app_id UUID FK → apps.id`
- Setiap query backend wajib filter by `app_id`
- `organization.appId` links Better Auth org ke internal `apps`

### Timestamps
- `created_at`, `updated_at` → `@default(now())`
- Soft delete: `deleted_at` (nullable timestamp) — di users, contacts, conversations, messages, labels, inboxes, teams, whatsapp_channels, broadcasts
- Mix types: `@db.Timestamp(6)` (without tz) dan `@db.Timestamptz(6)` (with tz)

### JSON Columns
- Default: `@default("{}")` atau `@default("[]")`
- Use cases: metadata, conditions, nodes/edges (React Flow), settings, custom_attributes, raw_payload

### Indexes
- Naming: `idx_{table}_{column}` atau `idx_{table}_{column1}_{column2}`
- GIN index: `knowledge_faqs.keywords`
- Composite: frequent multi-column query patterns

### Vector & Full-Text
- `knowledge_chunks.embedding` → `Unsupported("vector")` (pgvector, 1536 dimensions)
- `knowledge_chunks.chunk_tsv` → `Unsupported("tsvector")`
- `embeddings.embedding` → `Unsupported("vector")` (legacy table)

### Decimal Precision
- Currency: `Decimal(18, 2)` — orders, products, invoices
- AI cost: `Decimal(18, 6)` — micro-transactions
- Credits: `Decimal(10, 2)` — org balance
- Scores: `Decimal(12, 6)` — similarity scores

## Commands

```bash
# Generate Prisma client
bun run db:generate

# Push schema to DB (dev — no migration file)
bun run db:push

# Pull schema from DB
bun run db:pull

# Create migration
cd apps/backend && bunx prisma migrate dev --name description

# Apply migrations (production)
bunx prisma migrate deploy

# Open Prisma Studio
bun run db:studio

# Seed database
bun run --filter backend db:seed

# Import SQL snapshot ke fresh DB
psql -U postgres -d opencrm_db -f docs/database/schema.sql
```

## Implementation status

### Selesai
- [x] PostgreSQL schema: 112 models, 200+ indexes, FK constraints, composite keys
- [x] Prisma v7 dengan driver adapter (`@prisma/adapter-pg`)
- [x] PrismaClient singleton (`src/lib/prisma.ts`)
- [x] Redis singleton (`src/lib/redis.ts`) dengan ioredis v5
- [x] pgvector extension untuk vector search (knowledge_chunks, embeddings)
- [x] tsvector untuk full-text search (knowledge_chunks.chunk_tsv)
- [x] Better Auth integration (session, account, verification, organization, member, invitation)
- [x] Multi-tenant isolation via `app_id` FK di seluruh domain models
- [x] BullMQ 7 queues: incoming-messages, outbound-messages, ai-processing, webhooks, maintenance, cron-jobs, conversation-bulk
- [x] Socket.IO Redis adapter untuk real-time scaling
- [x] 21 Prisma migrations recorded
- [x] Seed script (`prisma/seed.ts`) + electronics catalog seed (`scripts/seed-electronics-catalog.ts`)
- [x] SQL snapshot (`docs/database/schema.sql`) — importable langsung
- [x] Auth & Organization (Better Auth + users + org + member)
- [x] Conversation & Messages dengan delivery tracking
- [x] WhatsApp channels + channel accounts + agent assignments
- [x] Agent management (availability, presence, settings, overrides, divisions)
- [x] AI settings + chatbot instances + response logging + cost tracking
- [x] AI Playground (models, strategies, personas, guardrails, sessions, turns)
- [x] Knowledge base RAG pipeline (sources, files, categories, FAQs, chunks, ingestion jobs, query logs)
- [x] Automation flows (React Flow JSON) + auto-assign + auto-responder + handover
- [x] CRM pipelines + stages + conversation sales + stage transitions
- [x] Broadcasting + per-recipient logs
- [x] E-commerce (products, variants, orders, items, invoices, stock, subscriptions)
- [x] Forms (AI-assisted extraction, submissions, field values)
- [x] App center marketplace + installations
- [x] Credit transactions + top-up packages
- [x] Meta Ads integration (accounts, campaigns, insights)
- [x] Webhooks + webhook events
- [x] SLA policies + breach events
- [x] Media files + message status history
- [x] Contact management (custom fields, tags, notes, consent logs)

### Belum / pending
- [ ] Table partitioning untuk high-volume tables (messages, webhook_events, ai_response_logs) — belum diperlukan di scale saat ini
- [ ] Read replicas — belum diperlukan
- [ ] Encryption at rest untuk sensitive columns (api_key, access_token) — saat ini plain text, encrypt di app layer
- [ ] Consolidation `Timestamp(6)` vs `Timestamptz(6)` — ada mix di schema, belum di-normalize
- [ ] Migration dari legacy `embeddings` table ke `knowledge_chunks` — gradual, kedua tabel masih aktif
