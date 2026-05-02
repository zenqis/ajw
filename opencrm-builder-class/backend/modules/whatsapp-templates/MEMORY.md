# MEMORY — whatsapp-templates module

## Tujuan
Catatan keputusan dan state terkini modul whatsapp-templates.

## Aturan kerja
1. Source code: `apps/backend/src/modules/whatsapp-templates/`
2. Blueprint modul: `./blueprint.md`
3. PRD modul: `./PRD.md`
4. Backend MEMORY (root): `../../MEMORY.md`

## Status
- Module path: `apps/backend/src/modules/whatsapp-templates/`
- Total files: 1
- Total lines: 204
- Route prefix: `/api/whatsapp-templates`
- No dedicated tables (uses shared tables)

## Catatan
- Module mengikuti konvensi backend: index.ts (routes) + service.ts (logic) + model.ts (data access)
- Semua query di-scope by `app_id` untuk multi-tenant isolation
