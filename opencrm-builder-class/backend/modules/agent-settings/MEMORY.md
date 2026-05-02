# MEMORY — agent-settings module

## Tujuan
Catatan keputusan dan state terkini modul agent-settings.

## Aturan kerja
1. Source code: `apps/backend/src/modules/agent-settings/`
2. Blueprint modul: `./blueprint.md`
3. PRD modul: `./PRD.md`
4. Backend MEMORY (root): `../../MEMORY.md`

## Status
- Module path: `apps/backend/src/modules/agent-settings/`
- Total files: 3
- Total lines: 302
- Route prefix: `/api/agent-settings`
- Key tables: `agent_settings`, `agent_settings_overrides`

## Catatan
- Module mengikuti konvensi backend: index.ts (routes) + service.ts (logic) + model.ts (data access)
- Semua query di-scope by `app_id` untuk multi-tenant isolation
