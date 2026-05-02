# MEMORY — orders module

## Tujuan
Catatan keputusan dan state terkini modul orders.

## Aturan kerja
1. Source code: `apps/backend/src/modules/orders/`
2. Blueprint modul: `./blueprint.md`
3. PRD modul: `./PRD.md`
4. Backend MEMORY (root): `../../MEMORY.md`

## Status
- Module path: `apps/backend/src/modules/orders/`
- Total files: 1
- Total lines: 867
- Route prefix: `/api/orders`
- Key tables: `orders`, `order_items`, `order_invoices`

## Catatan
- Module mengikuti konvensi backend: index.ts (routes) + service.ts (logic) + model.ts (data access)
- Semua query di-scope by `app_id` untuk multi-tenant isolation
