# MEMORY — webhook module

## Tujuan
Catatan keputusan dan state terkini modul webhook.

## Aturan kerja
1. Source code: `apps/backend/src/modules/webhook/`
2. Blueprint modul: `./blueprint.md`
3. PRD modul: `./PRD.md`
4. Backend MEMORY (root): `../../MEMORY.md`

## Status
- Module path: `apps/backend/src/modules/webhook/`
- Total files: 3
- Total lines: 4817
- Route prefix: `/api/v1/webhooks`
- Key tables: `webhook_events`

## Catatan
- Module mengikuti konvensi backend: index.ts (routes) + service.ts (logic) + model.ts (data access)
- Semua query di-scope by `app_id` untuk multi-tenant isolation
