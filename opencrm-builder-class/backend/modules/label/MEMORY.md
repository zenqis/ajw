# MEMORY — label module

## Tujuan
Catatan keputusan dan state terkini modul label.

## Aturan kerja
1. Source code: `apps/backend/src/modules/label/`
2. Blueprint modul: `./blueprint.md`
3. PRD modul: `./PRD.md`
4. Backend MEMORY (root): `../../MEMORY.md`

## Status
- Module path: `apps/backend/src/modules/label/`
- Total files: 3
- Total lines: 322
- Route prefix: `/api/labels`
- Key tables: `labels`, `conversation_labels`

## Catatan
- Module mengikuti konvensi backend: index.ts (routes) + service.ts (logic) + model.ts (data access)
- Semua query di-scope by `app_id` untuk multi-tenant isolation
