# MEMORY — auth module

## Tujuan
Catatan keputusan dan state terkini modul auth.

## Aturan kerja
1. Source code: `apps/backend/src/modules/auth/`
2. Blueprint modul: `./blueprint.md`
3. PRD modul: `./PRD.md`
4. Backend MEMORY (root): `../../MEMORY.md`

## Status
- Module path: `apps/backend/src/modules/auth/`
- Total files: 1
- Total lines: 619
- Route prefix: `/auth`
- Key tables: `session`, `account`, `verification`, `organization`, `member`, `invitation`, `users`

## Catatan
- Module mengikuti konvensi backend: index.ts (routes) + service.ts (logic) + model.ts (data access)
- Semua query di-scope by `app_id` untuk multi-tenant isolation
