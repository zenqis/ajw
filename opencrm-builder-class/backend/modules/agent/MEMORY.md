# MEMORY — agent module

## Tujuan
Catatan keputusan dan state terkini modul agent.

## Aturan kerja
1. Source code: `apps/backend/src/modules/agent/`
2. Blueprint modul: `./blueprint.md`
3. PRD modul: `./PRD.md`
4. Backend MEMORY (root): `../../MEMORY.md`

## Status
- Module path: `apps/backend/src/modules/agent/`
- Total files: 3
- Total lines: 783
- Route prefix: `/api/agents-management`
- Key tables: `agent_availability`, `agent_presence`, `agent_channel_accounts`, `agent_channels`, `agent_inbox_assignments`, `agent_divisions`

## Catatan
- Module mengikuti konvensi backend: index.ts (routes) + service.ts (logic) + model.ts (data access)
- Semua query di-scope by `app_id` untuk multi-tenant isolation
