# Blueprint — Webhooks Module (External)

## Objective
External webhook receivers for payment providers (Pakasir, Xendit).

## Responsibilities
- Pakasir payment webhook
- Payment status update processing

## File structure
```
modules/webhooks/
  index.ts (7 lines)
  pakasir.ts (43 lines)
```

### File descriptions
- **`index.ts`** — Elysia route plugin. Registers all HTTP endpoints under `/api/webhooks`. 7 lines.
- **`pakasir.ts`** — pakasir. 43 lines.

## Route prefix
`/api/webhooks`

## Implementation status
### Selesai
- [x] Module structure (index.ts + service + model) — total 50 lines
- [x] Route registration under `/api/webhooks`
- [x] Multi-tenant isolation via `app_id` context
- [x] Pakasir — 43 lines

### Belum / pending
- Tidak ada item pending untuk modul ini.
