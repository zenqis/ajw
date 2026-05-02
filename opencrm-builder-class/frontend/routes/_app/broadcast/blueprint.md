# Blueprint — broadcast

**Route:** `/_app/broadcast`
**Source:** `apps/frontend/src/routes/_app/broadcast.tsx`
**Lines:** 1703 | **Size:** 55KB
**API:** `broadcasts.listJobs()`, `broadcasts.create()`, `broadcasts.previewAudience()`, `whatsappTemplates.list()`, `customers.list()`

## Fungsi
Bulk WhatsApp messaging — create campaigns, select templates, define audience (4 methods), configure variables, schedule/send, track delivery.

## Tabs: [Create] [Active] [History]

## Create flow (4 steps)
1. **Template** — Pick approved WhatsApp template + preview body text
2. **Audience** — 4 modes: `customers` (pick list), `csv` (upload), `manual` (paste), `target` (filters)
3. **Variables** — Map defaults for `{{1}}`, `{{2}}`; per-recipient overrides from CSV
4. **Schedule** — Delay per message, schedule datetime, estimated cost/duration

## Key behaviors
- CSV parsing: custom `parseCsvLine()` with quoted fields, BOM stripping
- Phone normalization: strip non-digits, min 8 digits
- Audience preview: debounced 250ms → `broadcasts.previewAudience()`
- Estimated cost: `recipientCount × 50` (Rupiah)
- Estimated duration: `recipientCount / 120` minutes
- Deduplication by normalized phone number
