# MEMORY — Database Layer

## Tujuan
Menyimpan keputusan arsitektur, catatan progress, dan state terkini database layer OpenCRM.

## Aturan kerja
1. Semua perubahan schema dilakukan di `apps/backend/prisma/schema.prisma`.
2. Setelah edit schema → `bun run db:generate` untuk regenerate Prisma client.
3. Gunakan `bun run db:push` untuk dev, `prisma migrate dev` untuk migration formal.
4. File SQL di `docs/database/schema.sql` adalah snapshot referensi, bukan source of truth.
5. Source of truth: **`schema.prisma`** — file SQL hanya untuk quick import/review.
6. Untuk konteks database layer, keputusan penting dan ringkasan progres tulis di file ini.
7. Blueprint database ada di `./blueprint.md`.
8. PRD database ada di `./PRD.md`.

## Keputusan arsitektur aktif

### Stack
- PostgreSQL 15+ sebagai primary datastore
- Prisma v7 ORM dengan driver adapter (`@prisma/adapter-pg`)
- Redis (ioredis v5) untuk cache, queue backend (BullMQ), Socket.IO adapter
- pgvector extension untuk vector similarity search
- tsvector built-in untuk full-text search

### Multi-tenancy
- Tenant isolation via `app_id` FK di hampir semua tabel domain
- `apps` table = tenant hub — 1 org = 1 app
- Better Auth hierarchy: `organization` → `member` → `user`
- `organization.appId` links BA org ke internal `apps`

### Primary Key Strategy
- UUID (`gen_random_uuid()`) untuk semua domain models
- CUID (string) untuk Better Auth models (library convention)
- Composite keys untuk pivot tables: `team_members`, `agent_divisions`, `contact_tag_assignments`, `conversation_labels`, `conversation_participants`, `form_submission_values`
- Exceptions: `mentions` dan `custom_attribute_definitions` pakai `autoincrement()`

### Vector Search (RAG)
- Extension: pgvector
- Embedding model default: `text-embedding-3-small` (1536 dimensions)
- Storage: `knowledge_chunks.embedding` column (type: `vector`)
- Full-text: `knowledge_chunks.chunk_tsv` (tsvector + GIN index)
- Legacy: tabel `embeddings` masih ada, gradually migrated ke `knowledge_chunks`

### JSON Columns usage
- `automation_flows.nodes/edges` → React Flow serialization
- `chatbots.ai_followups` → Follow-up scheduling config
- `chatbots.plugin_data` → Plugin-specific settings
- `conversations.custom_attributes` → Flexible metadata
- `messages.metadata/context/extras` → Platform-specific payload
- `orders.business_bank_account` → Dynamic bank config
- `auto_assign_rules.conditions` → Rule matching conditions
- `ai_playground_routing_strategies.routing_rules` → Dynamic routing config

### Soft Delete
Tabel dengan `deleted_at`: `users`, `contacts`, `conversations`, `messages`, `labels`, `inboxes`, `teams`, `whatsapp_channels`, `broadcasts`

### Decimal Precision
- Currency: `Decimal(18, 2)` — orders, products, invoices
- AI cost: `Decimal(18, 6)` — high precision untuk micro-transactions
- Credits: `Decimal(10, 2)` — org balance
- Scores: `Decimal(12, 6)` — similarity scores

## Status saat ini
- Total models: **112**
- Total migrations: **21**
- Schema file: **2282 baris** (`apps/backend/prisma/schema.prisma`)
- SQL snapshot: **3100+ baris** (`docs/database/schema.sql`)
- Migration terbaru: `20260424163000_customer_level_settings`
- Prisma client output: `apps/backend/src/generated/prisma`

## Catatan penting
- `Unsupported("vector")` dan `Unsupported("tsvector")` → Prisma tidak fully support types ini. Operasi vector (insert embedding, cosine similarity query) harus memakai raw SQL via `prisma.$queryRaw`.
- Index `Gin` dipakai di `knowledge_faqs.keywords` untuk array search.
- `message_status_history` tracks WhatsApp delivery receipts (sent → delivered → read → failed).
- `conversation_sales` menggunakan `conversation_id` sebagai PK (1:1 dengan conversations).
- `orders.order_number` menggunakan `BigInt @default(autoincrement())` — serial order numbering.
- `apps.ai_credits` dan `organization.ai_credits` kedua-duanya ada — credit balance tersimpan di dua level, normalization mungkin diperlukan.
- Beberapa tabel memakai `Timestamp(6)` (without timezone) dan beberapa `Timestamptz(6)` (with timezone) — ini belum di-normalize.

## Migration history (21 migrations)
1. `20260409122500_drop_chatbots_usage_mode`
2. `20260409131352_org_credits`
3. `20260409135000_add_chatbots_additional_settings`
4. `20260409224000_business_webhooks_fields`
5. `20260410113000_orders_feature`
6. `20260410143000_add_default_ticket_board_id_to_agent_settings`
7. `20260412123000_single_active_flow_per_app`
8. `20260412161000_drop_single_active_flow_per_app_unique`
9. `20260412173500_restore_single_active_flow_per_app_unique`
10. `20260412190000_set_glm_5_1_as_default_model`
11. `20260414121500_ai_response_logs_and_knowledge_index_lifecycle`
12. `20260414190500_set_gpt_4o_mini_as_default_model`
13. `20260420174000_commerce_journey_pakasir`
14. `20260420193000_advanced_knowledge_base_rag`
15. `20260420220500_handover_requests`
16. `20260421091500_commerce_product_images`
17. `20260421113000_disconnect_all_whatsapp_and_enforce_unique_channel_assignment`
18. `20260421124500_ai_playground_dynamic`
19. `20260421143000_ai_playground_routing_rules`
20. `20260421180000_workflow_decision_engine`
21. `20260424163000_customer_level_settings`

## Urutan build yang disarankan (database perspective)
1. PostgreSQL + pgvector + uuid-ossp extensions
2. `bun run db:push` atau import `docs/database/schema.sql`
3. `bun run db:generate` untuk Prisma client
4. `bun run --filter backend db:seed` untuk development data
5. Redis untuk BullMQ + Socket.IO

## Catatan auth
- Better Auth mengelola session/account/verification/organization/member sendiri
- Password hashing: `bcryptjs` di application layer
- Session: cookie-based via Better Auth
- JWT: dipakai untuk inter-service dan WebSocket auth
