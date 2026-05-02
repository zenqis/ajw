# MEMORY — canned-response module

## Tujuan
Catatan keputusan dan state terkini modul canned-response.

## Aturan kerja
1. Source code: `apps/backend/src/modules/canned-response/`
2. Blueprint modul: `./blueprint.md`
3. PRD modul: `./PRD.md`
4. Backend MEMORY (root): `../../MEMORY.md`

## Status
- Module path: `apps/backend/src/modules/canned-response/`
- Total files: 3
- Total lines: 94
- Route prefix: `/api/canned-responses`
- Key tables: `canned_responses`

## Catatan
- Module mengikuti konvensi backend: index.ts (routes) + service.ts (logic) + model.ts (data access)
- Semua query di-scope by `app_id` untuk multi-tenant isolation
