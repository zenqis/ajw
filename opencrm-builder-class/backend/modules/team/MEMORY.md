# MEMORY — team module

## Tujuan
Catatan keputusan dan state terkini modul team.

## Aturan kerja
1. Source code: `apps/backend/src/modules/team/`
2. Blueprint modul: `./blueprint.md`
3. PRD modul: `./PRD.md`
4. Backend MEMORY (root): `../../MEMORY.md`

## Status
- Module path: `apps/backend/src/modules/team/`
- Total files: 3
- Total lines: 276
- Route prefix: `/api/teams`
- Key tables: `teams`, `team_members`

## Catatan
- Module mengikuti konvensi backend: index.ts (routes) + service.ts (logic) + model.ts (data access)
- Semua query di-scope by `app_id` untuk multi-tenant isolation
