# MEMORY — customer module

## Tujuan
Catatan keputusan dan state terkini modul customer.

## Aturan kerja
1. Source code: `apps/backend/src/modules/customer/`
2. Blueprint modul: `./blueprint.md`
3. PRD modul: `./PRD.md`
4. Backend MEMORY (root): `../../MEMORY.md`

## Status
- Module path: `apps/backend/src/modules/customer/`
- Total files: 2
- Total lines: 1520
- Route prefix: `/api/customers`
- Key tables: `contacts`, `customer_level_settings`

## Catatan
- Module mengikuti konvensi backend: index.ts (routes) + service.ts (logic) + model.ts (data access)
- Semua query di-scope by `app_id` untuk multi-tenant isolation
