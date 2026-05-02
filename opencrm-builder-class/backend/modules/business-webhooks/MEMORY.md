# MEMORY — business-webhooks module

## Tujuan
Catatan keputusan dan state terkini modul business-webhooks.

## Aturan kerja
1. Source code: `apps/backend/src/modules/business-webhooks/`
2. Blueprint modul: `./blueprint.md`
3. PRD modul: `./PRD.md`
4. Backend MEMORY (root): `../../MEMORY.md`

## Status
- Module path: `apps/backend/src/modules/business-webhooks/`
- Total files: 5
- Total lines: 1615
- Route prefix: `/api/business-webhooks`
- Key tables: `webhooks`, `webhook_events`

## Catatan
- Module mengikuti konvensi backend: index.ts (routes) + service.ts (logic) + model.ts (data access)
- Semua query di-scope by `app_id` untuk multi-tenant isolation
