# MEMORY — inbox module

## Tujuan
Catatan keputusan dan state terkini modul inbox.

## Aturan kerja
1. Source code: `apps/backend/src/modules/inbox/`
2. Blueprint modul: `./blueprint.md`
3. PRD modul: `./PRD.md`
4. Backend MEMORY (root): `../../MEMORY.md`

## Status
- Module path: `apps/backend/src/modules/inbox/`
- Total files: 3
- Total lines: 221
- Route prefix: `/api/inboxes`
- Key tables: `inboxes`

## Catatan
- Module mengikuti konvensi backend: index.ts (routes) + service.ts (logic) + model.ts (data access)
- Semua query di-scope by `app_id` untuk multi-tenant isolation
