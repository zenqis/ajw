# MEMORY — contact module

## Tujuan
Catatan keputusan dan state terkini modul contact.

## Aturan kerja
1. Source code: `apps/backend/src/modules/contact/`
2. Blueprint modul: `./blueprint.md`
3. PRD modul: `./PRD.md`
4. Backend MEMORY (root): `../../MEMORY.md`

## Status
- Module path: `apps/backend/src/modules/contact/`
- Total files: 3
- Total lines: 1155
- Route prefix: `/api/contacts`
- Key tables: `contacts`, `contact_custom_fields`, `contact_tags`, `contact_tag_assignments`, `contact_notes`, `consent_logs`

## Catatan
- Module mengikuti konvensi backend: index.ts (routes) + service.ts (logic) + model.ts (data access)
- Semua query di-scope by `app_id` untuk multi-tenant isolation
