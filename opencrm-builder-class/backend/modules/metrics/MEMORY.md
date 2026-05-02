# MEMORY — metrics module

## Tujuan
Catatan keputusan dan state terkini modul metrics.

## Aturan kerja
1. Source code: `apps/backend/src/modules/metrics/`
2. Blueprint modul: `./blueprint.md`
3. PRD modul: `./PRD.md`
4. Backend MEMORY (root): `../../MEMORY.md`

## Status
- Module path: `apps/backend/src/modules/metrics/`
- Total files: 3
- Total lines: 1383
- Route prefix: `/api/metrics`
- No dedicated tables (uses shared tables)

## Catatan
- Module mengikuti konvensi backend: index.ts (routes) + service.ts (logic) + model.ts (data access)
- Semua query di-scope by `app_id` untuk multi-tenant isolation
