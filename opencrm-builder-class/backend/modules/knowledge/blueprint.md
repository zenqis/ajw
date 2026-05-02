# Blueprint — Knowledge Module (RAG)

## Objective
Knowledge base RAG pipeline: source management, file upload, content extraction, text chunking, vector embedding, and similarity search.

## Responsibilities
- Knowledge source CRUD (text, URL, file types)
- File upload + storage (S3/R2)
- Content extraction from files (ExtractionService — 1065 lines)
- Text chunking with token counting
- Vector embedding generation (IndexingService — 1144 lines)
- pgvector similarity search for RAG
- Full-text search fallback (tsvector)
- FAQ management per chatbot
- Category organization
- Ingestion job pipeline (queued, running, completed, failed)
- Query logging + chunk hit tracking

## File structure
```
modules/knowledge/
  extraction-service.ts (1066 lines)
  index.ts (609 lines)
  indexing-service.ts (1145 lines)
  model.ts (59 lines)
  service.ts (1749 lines)
```

### File descriptions
- **`extraction-service.ts`** — Specialized service: extraction service. 1066 lines.
- **`index.ts`** — Elysia route plugin. Registers all HTTP endpoints under `/api/knowledge`. 609 lines.
- **`indexing-service.ts`** — Specialized service: indexing service. 1145 lines.
- **`model.ts`** — Prisma query helpers and request validation models. 59 lines.
- **`service.ts`** — Core business logic. 1749 lines.

## Route prefix
`/api/knowledge`

## Key tables
- `knowledge_sources`
- `knowledge_source_files`
- `knowledge_categories`
- `knowledge_faqs`
- `knowledge_chunks`
- `knowledge_ingestion_jobs`
- `knowledge_query_logs`
- `knowledge_query_chunks`
- `embeddings`

## Implementation status
### Selesai
- [x] Module structure (index.ts + service + model) — total 4628 lines
- [x] Route registration under `/api/knowledge`
- [x] Multi-tenant isolation via `app_id` context
- [x] Extraction service — 1066 lines
- [x] Indexing service — 1145 lines
- [x] Model — 59 lines
- [x] Service — 1749 lines

### Belum / pending
- Tidak ada item pending untuk modul ini.
