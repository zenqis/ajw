# PRD — Database Layer

## Problem
Tanpa database layer yang terdokumentasi dengan baik, developer dan AI tidak bisa merebuild atau memahami dependencies antar modul OpenCRM. Schema 112 model tersebar di satu file Prisma besar, dan relasi antar domain (messaging, AI, e-commerce, CRM) tidak terdokumentasi di satu tempat.

## Goal
Menyediakan database layer yang:
- 100% dapat direbuild dari dokumentasi + SQL snapshot
- multi-tenant secara default via `app_id` FK
- mendukung vector search (RAG) dan full-text search
- audit-ready dengan timestamps dan activity logs
- scalable untuk omnichannel messaging volume tinggi

## User stories
- Sebagai developer baru, saya ingin bisa setup database dari nol dalam 5 menit via SQL snapshot atau Prisma push.
- Sebagai AI agent, saya ingin bisa membaca blueprint dan memahami semua tabel, relasi, dan konvensi tanpa harus parse `schema.prisma` mentah.
- Sebagai operator, saya ingin data antar tenant terisolasi sempurna lewat `app_id` FK di setiap tabel.
- Sebagai developer, saya ingin migration history yang bersih dan bisa di-replay (`prisma migrate deploy`).
- Sebagai developer AI module, saya ingin vector search via pgvector dan full-text search via tsvector tersedia di PostgreSQL tanpa service tambahan.
- Sebagai developer e-commerce, saya ingin decimal precision yang tepat untuk currency (`18,2`) dan AI cost micro-transactions (`18,6`).

## Requirements

### Data integrity
- Foreign key constraints di seluruh relasi
- Appropriate ON DELETE: Cascade untuk child ownership, SetNull untuk optional refs, NoAction untuk audit trails
- Unique constraints untuk business rules (e.g., satu `ai_settings` per `app_id`, satu `conversation_sales` per `conversation_id`)
- Composite unique constraints untuk M2M pivots

### Multi-tenancy
- Setiap tabel domain wajib punya `app_id UUID FK → apps.id`
- Backend queries wajib filter by `app_id`
- Organization hierarchy via Better Auth: `organization → member → user`
- `organization.appId` sebagai bridge ke internal `apps`

### Vector search (RAG)
- PostgreSQL extension: pgvector
- Embedding column: `knowledge_chunks.embedding` (`vector` type, 1536 dimensions)
- Full-text column: `knowledge_chunks.chunk_tsv` (`tsvector` type)
- Legacy: `embeddings.embedding` (`vector` type) — gradually migrating

### Performance
- UUID primary keys dengan B-tree indexes
- Composite indexes untuk frequent query patterns
- GIN indexes untuk array columns (`knowledge_faqs.keywords`)
- Connection pooling via `@prisma/adapter-pg`

### Scalability
- BullMQ + Redis untuk async job processing (7 named queues)
- Socket.IO Redis adapter untuk real-time multi-instance
- Future: table partitioning candidates — `messages`, `webhook_events`, `ai_response_logs` (by date)

### Audit trail
- `created_at`, `updated_at` timestamps di semua models
- Soft delete via `deleted_at` di high-value entities
- `conversation_activity_log` untuk conversation audit
- `assignment_history` untuk agent assignment tracking
- `stage_transitions` untuk CRM pipeline audit
- `ai_response_logs` untuk AI cost + usage telemetry

## Acceptance criteria
- Schema 112 models bisa di-push ke fresh PostgreSQL database tanpa error
- SQL snapshot (`schema.sql`) bisa diimport ke fresh database tanpa manual intervention
- pgvector extension aktif dan `knowledge_chunks.embedding` column bisa menyimpan vector data
- Multi-tenant isolation: query tanpa `app_id` filter harus di-review sebagai potential bug
- Semua FK relations memiliki appropriate ON DELETE behavior
- Migration history bisa di-replay sequential via `prisma migrate deploy`
- Seed script bisa populate development data

## Extensions required
| Extension | Purpose |
|-----------|---------|
| `pgvector` | Vector similarity search untuk RAG knowledge base |
| `uuid-ossp` / built-in | `gen_random_uuid()` untuk UUID PKs |

## Redis usage map
| Purpose | Details |
|---------|---------|
| BullMQ queues | `incoming-messages`, `outbound-messages`, `ai-processing`, `webhooks`, `maintenance`, `cron-jobs`, `conversation-bulk` |
| Socket.IO adapter | Real-time event distribution across instances |
| PubSub | Inter-process communication |
| Cache | Session cache, rate limiting |
| Locks | Distributed locking (conversation processing) |

## Implementation status — 2026-04-29
- [x] Seluruh acceptance criteria terpenuhi dan aktif dipakai 37+ backend modules
- [x] SQL snapshot tersedia di `docs/database/schema.sql` (3100+ baris)
- [x] pgvector aktif di `knowledge_chunks` dan `embeddings`
- [x] 21 migrations recorded, terbaru `20260424163000_customer_level_settings`
- [x] Seed scripts tersedia (`prisma/seed.ts`, `scripts/seed-electronics-catalog.ts`)
- [ ] Table partitioning belum diterapkan — belum diperlukan di scale saat ini
- [ ] Timestamp normalization (`Timestamp` vs `Timestamptz`) belum seragam
