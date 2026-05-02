# MEMORY — handover module

## Tujuan
Catatan keputusan dan state terkini modul handover.

## Aturan kerja
1. Source code: `apps/backend/src/modules/handover/`
2. Blueprint modul: `./blueprint.md`
3. PRD modul: `./PRD.md`
4. Backend MEMORY (root): `../../MEMORY.md`

## Status
- Module path: `apps/backend/src/modules/handover/`
- Total files: 2
- Total lines: 1640
- Route prefix: `/api/handover`
- Key tables: `handover_requests`

## Catatan
- Module mengikuti konvensi backend: index.ts (routes) + service.ts (logic) + model.ts (data access)
- Semua query di-scope by `app_id` untuk multi-tenant isolation
