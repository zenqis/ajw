# Blueprint — Orders Module

## Objective
Order management with full lifecycle tracking, invoice generation, and payment integration.

## Responsibilities
- Order CRUD with full lifecycle
- Order item management
- Invoice generation
- Payment status tracking
- Order search + filtering

## File structure
```
modules/orders/
  index.ts (867 lines)
```

### File descriptions
- **`index.ts`** — Elysia route plugin. Registers all HTTP endpoints under `/api/orders`. 867 lines.

## Route prefix
`/api/orders`

## Key tables
- `orders`
- `order_items`
- `order_invoices`

## Implementation status
### Selesai
- [x] Module structure (index.ts + service + model) — total 867 lines
- [x] Route registration under `/api/orders`
- [x] Multi-tenant isolation via `app_id` context


### Belum / pending
- Tidak ada item pending untuk modul ini.
