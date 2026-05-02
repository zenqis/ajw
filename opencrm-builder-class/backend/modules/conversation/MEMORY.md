# MEMORY — conversation module

## Tujuan
Catatan keputusan dan state terkini modul conversation.

## Aturan kerja
1. Source code: `apps/backend/src/modules/conversation/`
2. Blueprint modul: `./blueprint.md`
3. PRD modul: `./PRD.md`
4. Backend MEMORY (root): `../../MEMORY.md`

## Status
- Module path: `apps/backend/src/modules/conversation/`
- Total files: 6
- Total lines: 3059
- Route prefix: `/api/conversations`
- Key tables: `conversations`, `conversation_agents`, `conversation_labels`, `conversation_notes`, `conversation_activity_log`, `conversation_participants`, `conversation_ratings`, `conversation_sales`

## Catatan
- Module mengikuti konvensi backend: index.ts (routes) + service.ts (logic) + model.ts (data access)
- Semua query di-scope by `app_id` untuk multi-tenant isolation
