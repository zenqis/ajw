# Blueprint — Commerce Module

## Objective
E-commerce operations including product catalog, orders, invoicing (Xendit/Pakasir), stock management, and checkout flow.

## Responsibilities
- Product catalog with variants
- Order creation + lifecycle management
- Invoice generation (Xendit/Pakasir integration)
- Stock reservation during checkout
- Stock movement tracking
- Pakasir POS client integration
- Subscription management

## File structure
```
modules/commerce/
  index.ts (517 lines)
  pakasir-client.ts (479 lines)
  service.ts (5049 lines)
```

### File descriptions
- **`index.ts`** — Elysia route plugin. Registers all HTTP endpoints under `/api/commerce`. 517 lines.
- **`pakasir-client.ts`** — pakasir client. 479 lines.
- **`service.ts`** — Core business logic. 5049 lines.

## Route prefix
`/api/commerce`

## Key tables
- `products`
- `product_variants`
- `orders`
- `order_items`
- `order_invoices`
- `stock_reservations`
- `stock_movements`
- `subscriptions`

## Implementation status
### Selesai
- [x] Module structure (index.ts + service + model) — total 6045 lines
- [x] Route registration under `/api/commerce`
- [x] Multi-tenant isolation via `app_id` context
- [x] Pakasir client — 479 lines
- [x] Service — 5049 lines

### Belum / pending
- Tidak ada item pending untuk modul ini.
