# MEMORY — webhooks module

## Tujuan
Catatan keputusan dan state terkini modul webhooks.

## Aturan kerja
1. Source code: `apps/backend/src/modules/webhooks/`
2. Blueprint modul: `./blueprint.md`
3. PRD modul: `./PRD.md`
4. Backend MEMORY (root): `../../MEMORY.md`

## Status
- Module path: `apps/backend/src/modules/webhooks/`
- Total files: 2
- Total lines: 50
- Route prefix: `/api/webhooks`
- No dedicated tables (uses shared tables)

## Catatan
- Module mengikuti konvensi backend: index.ts (routes) + service.ts (logic) + model.ts (data access)
- Semua query di-scope by `app_id` untuk multi-tenant isolation
