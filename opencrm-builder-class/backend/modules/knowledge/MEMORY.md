# MEMORY — knowledge module

## Tujuan
Catatan keputusan dan state terkini modul knowledge.

## Aturan kerja
1. Source code: `apps/backend/src/modules/knowledge/`
2. Blueprint modul: `./blueprint.md`
3. PRD modul: `./PRD.md`
4. Backend MEMORY (root): `../../MEMORY.md`

## Status
- Module path: `apps/backend/src/modules/knowledge/`
- Total files: 5
- Total lines: 4628
- Route prefix: `/api/knowledge`
- Key tables: `knowledge_sources`, `knowledge_source_files`, `knowledge_categories`, `knowledge_faqs`, `knowledge_chunks`, `knowledge_ingestion_jobs`, `knowledge_query_logs`, `knowledge_query_chunks`, `embeddings`

## Catatan
- Module mengikuti konvensi backend: index.ts (routes) + service.ts (logic) + model.ts (data access)
- Semua query di-scope by `app_id` untuk multi-tenant isolation
