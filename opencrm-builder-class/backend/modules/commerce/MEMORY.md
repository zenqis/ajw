# MEMORY — commerce module

## Tujuan
Catatan keputusan dan state terkini modul commerce.

## Aturan kerja
1. Source code: `apps/backend/src/modules/commerce/`
2. Blueprint modul: `./blueprint.md`
3. PRD modul: `./PRD.md`
4. Backend MEMORY (root): `../../MEMORY.md`

## Status
- Module path: `apps/backend/src/modules/commerce/`
- Total files: 3
- Total lines: 6045
- Route prefix: `/api/commerce`
- Key tables: `products`, `product_variants`, `orders`, `order_items`, `order_invoices`, `stock_reservations`, `stock_movements`, `subscriptions`

## Catatan
- Module mengikuti konvensi backend: index.ts (routes) + service.ts (logic) + model.ts (data access)
- Semua query di-scope by `app_id` untuk multi-tenant isolation
