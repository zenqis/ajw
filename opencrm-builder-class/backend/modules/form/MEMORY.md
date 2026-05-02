# MEMORY — form module

## Tujuan
Catatan keputusan dan state terkini modul form.

## Aturan kerja
1. Source code: `apps/backend/src/modules/form/`
2. Blueprint modul: `./blueprint.md`
3. PRD modul: `./PRD.md`
4. Backend MEMORY (root): `../../MEMORY.md`

## Status
- Module path: `apps/backend/src/modules/form/`
- Total files: 3
- Total lines: 209
- Route prefix: `/api/forms`
- Key tables: `forms`, `form_fields`, `form_templates`, `form_submissions`, `form_submission_values`, `form_extraction_logs`

## Catatan
- Module mengikuti konvensi backend: index.ts (routes) + service.ts (logic) + model.ts (data access)
- Semua query di-scope by `app_id` untuk multi-tenant isolation
