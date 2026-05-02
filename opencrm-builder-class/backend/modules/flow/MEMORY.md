# MEMORY — flow module

## Tujuan
Catatan keputusan dan state terkini modul flow.

## Aturan kerja
1. Source code: `apps/backend/src/modules/flow/`
2. Blueprint modul: `./blueprint.md`
3. PRD modul: `./PRD.md`
4. Backend MEMORY (root): `../../MEMORY.md`

## Status
- Module path: `apps/backend/src/modules/flow/`
- Total files: 5
- Total lines: 10822
- Route prefix: `/api/flows`
- Key tables: `automation_flows`

## Catatan
- Module mengikuti konvensi backend: index.ts (routes) + service.ts (logic) + model.ts (data access)
- Semua query di-scope by `app_id` untuk multi-tenant isolation
