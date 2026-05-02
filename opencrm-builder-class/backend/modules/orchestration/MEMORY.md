# MEMORY — orchestration module

## Tujuan
Catatan keputusan dan state terkini modul orchestration.

## Aturan kerja
1. Source code: `apps/backend/src/modules/orchestration/`
2. Blueprint modul: `./blueprint.md`
3. PRD modul: `./PRD.md`
4. Backend MEMORY (root): `../../MEMORY.md`

## Status
- Module path: `apps/backend/src/modules/orchestration/`
- Total files: 3
- Total lines: 219
- Route prefix: `/api/orchestration`
- No dedicated tables (uses shared tables)

## Catatan
- Module mengikuti konvensi backend: index.ts (routes) + service.ts (logic) + model.ts (data access)
- Semua query di-scope by `app_id` untuk multi-tenant isolation
