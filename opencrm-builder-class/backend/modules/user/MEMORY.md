# MEMORY — user module

## Tujuan
Catatan keputusan dan state terkini modul user.

## Aturan kerja
1. Source code: `apps/backend/src/modules/user/`
2. Blueprint modul: `./blueprint.md`
3. PRD modul: `./PRD.md`
4. Backend MEMORY (root): `../../MEMORY.md`

## Status
- Module path: `apps/backend/src/modules/user/`
- Total files: 3
- Total lines: 264
- Route prefix: `/api/user`
- Key tables: `users`

## Catatan
- Module mengikuti konvensi backend: index.ts (routes) + service.ts (logic) + model.ts (data access)
- Semua query di-scope by `app_id` untuk multi-tenant isolation
