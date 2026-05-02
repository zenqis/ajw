# Blueprint — Customer Module

## Objective
Customer profiles with VIP/Premium/Basic level classification, lifetime value tracking, and level-based chatbot routing.

## Responsibilities
- Customer profile aggregation from contacts
- Customer stats and metrics
- Customer level settings (VIP/Premium/Basic chatbot mapping)
- Level-based AI routing configuration

## File structure
```
modules/customer/
  index.ts (231 lines)
  service.ts (1289 lines)
```

### File descriptions
- **`index.ts`** — Elysia route plugin. Registers all HTTP endpoints under `/api/customers`. 231 lines.
- **`service.ts`** — Core business logic. 1289 lines.

## Route prefix
`/api/customers`

## Key tables
- `contacts`
- `customer_level_settings`

## Implementation status
### Selesai
- [x] Module structure (index.ts + service + model) — total 1520 lines
- [x] Route registration under `/api/customers`
- [x] Multi-tenant isolation via `app_id` context
- [x] Service — 1289 lines

### Belum / pending
- Tidak ada item pending untuk modul ini.
