# MEMORY — message module

## Tujuan
Catatan keputusan dan state terkini modul message.

## Aturan kerja
1. Source code: `apps/backend/src/modules/message/`
2. Blueprint modul: `./blueprint.md`
3. PRD modul: `./PRD.md`
4. Backend MEMORY (root): `../../MEMORY.md`

## Status
- Module path: `apps/backend/src/modules/message/`
- Total files: 3
- Total lines: 308
- Route prefix: `/api/messages`
- Key tables: `messages`, `message_status_history`

## Catatan
- Module mengikuti konvensi backend: index.ts (routes) + service.ts (logic) + model.ts (data access)
- Semua query di-scope by `app_id` untuk multi-tenant isolation
