# MEMORY — whatsapp module

## Tujuan
Catatan keputusan dan state terkini modul whatsapp.

## Aturan kerja
1. Source code: `apps/backend/src/modules/whatsapp/`
2. Blueprint modul: `./blueprint.md`
3. PRD modul: `./PRD.md`
4. Backend MEMORY (root): `../../MEMORY.md`

## Status
- Module path: `apps/backend/src/modules/whatsapp/`
- Total files: 3
- Total lines: 1110
- Route prefix: `/api/whatsapp-channels`
- Key tables: `whatsapp_channels`, `inboxes`

## Catatan
- Module mengikuti konvensi backend: index.ts (routes) + service.ts (logic) + model.ts (data access)
- Semua query di-scope by `app_id` untuk multi-tenant isolation
