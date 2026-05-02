# MEMORY — crm module

## Tujuan
Catatan keputusan dan state terkini modul crm.

## Aturan kerja
1. Source code: `apps/backend/src/modules/crm/`
2. Blueprint modul: `./blueprint.md`
3. PRD modul: `./PRD.md`
4. Backend MEMORY (root): `../../MEMORY.md`

## Status
- Module path: `apps/backend/src/modules/crm/`
- Total files: 3
- Total lines: 326
- Route prefix: `/api/crm`
- Key tables: `pipelines`, `pipeline_stages`, `conversation_sales`, `stage_transitions`

## Catatan
- Module mengikuti konvensi backend: index.ts (routes) + service.ts (logic) + model.ts (data access)
- Semua query di-scope by `app_id` untuk multi-tenant isolation
