# Seed Data and Initial Setup — OpenCRM

Generated from seed scripts, package scripts, and setup docs on 2026-04-29.

## Seed Entry Points

| Command | Script | Purpose | Requires existing tenant/user? |
|---|---|---|---|
| `bun run --filter backend db:seed` | `apps/backend/prisma/seed.ts` | AI model pricing catalog | no app/user required |
| `bun run --filter backend db:seed:electronics` | `apps/backend/scripts/seed-electronics-catalog.ts` | sample electronics products, variants, stock movements | yes |
| from `apps/backend`: `bun run scripts/seed-treatment-catalog.ts` | `apps/backend/scripts/seed-treatment-catalog.ts` | treatment product catalog from JSON | yes |
| from `apps/backend`: `bun run scripts/convert-treatment-catalog-to-products.ts` | converter script | generate treatment JSON/CSV from source markdown | no DB write |
| `bun run --filter backend kb:products:md` | `apps/backend/scripts/generate-products-knowledge-md.ts` | export products as knowledge markdown | yes |
| `bun run --filter backend db:migrate-orgs` | `apps/backend/scripts/migrate-to-orgs.ts` | migrate legacy apps/users into Better Auth organizations | existing app/user data |

## Bootstrapping Order

```bash
cp .env.example .env
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.example apps/frontend/.env
bun install
createdb -U postgres opencrm_db
psql -U postgres -d opencrm_db -c "CREATE EXTENSION IF NOT EXISTS vector;"
bun run db:push
bun run db:generate
bun run --filter backend db:seed
```

Optional catalog seed after at least one user/app/organization exists:

```bash
SEED_USER_EMAIL=owner@example.com bun run --filter backend db:seed:electronics
cd apps/backend
SEED_USER_EMAIL=owner@example.com bun run scripts/seed-treatment-catalog.ts
```

## Required Initial Data

The core schema does not seed default app/user rows. They are created through auth/register/onboarding flows or migration scripts.

| Data | Required for boot? | Created by | Notes |
|---|---|---|---|
| PostgreSQL schema | yes | `bun run db:push` or migrations | pgvector extension must exist before vector columns are used |
| Better Auth user/session tables | yes for login | auth/register flow | no default account in seed |
| `apps` tenant row | yes for tenant APIs | onboarding/register or legacy migration | most domain queries require resolved app UUID |
| Better Auth `organization` and `member` | recommended | onboarding/register or `migrate-to-orgs.ts` | org slug powers `X-Org-Slug` path/context |
| AI model pricing | recommended | `prisma/seed.ts` | powers AI cost display/catalog |
| WhatsApp channel/inbox | required for live messaging | UI/API integration setup | not seeded |
| Products/variants | optional sample data | electronics/treatment seed scripts | used by commerce and product knowledge generation |
| Knowledge source/chunks | optional sample RAG | knowledge UI/API or product markdown import | indexer generates chunks/embeddings |

## AI Model Pricing Seed

`apps/backend/prisma/seed.ts` upserts `ai_model_pricing` by `model_name`.

| Family | Models/tiers |
|---|---|
| OpenAI | `gpt-4o-mini`, `gpt-4o` |
| Google | `gemini-3-flash`, `gemini-3-pro` |
| Anthropic | `claude-3-haiku`, `claude-3-sonnet`, `claude-3-opus` |
| UI tiers | `standard`, `advanced`, `standard_plus_a`, `standard_plus_b`, `standard_plus_c`, `standard_plus`, `advanced_plus`, `advanced_thinking`, `standard_vision`, `advanced_vision`, `advanced_v4`, `standard_v4` |

Behavior:

- Idempotent: uses Prisma `upsert` on `model_name`.
- Updates cost/description/is_active each run.
- Does not depend on tenant app id.

## Electronics Catalog Seed

Source: `apps/backend/scripts/seed-electronics-catalog.ts`.

| Item | Value |
|---|---|
| Target user env | `SEED_USER_EMAIL` |
| Default target user | `tech@alkindikids.com` |
| Tenant resolution | `users.app_id` -> `users.last_app_used` -> first Better Auth organization `appId` |
| Product identity | `products.sku` scoped by `app_id` |
| Variant identity | `product_variants.sku` scoped by `product_id/app_id` |
| Metadata tag | `electronics_catalog_v1` |
| Stock behavior | creates `stock_movements` with `initial`, `adjust_in`, or `adjust_out` when variant stock changes |

Seeded domains:

- `products`: name, sku, image_url, description, base_price, is_active, organization_id, metadata.
- `product_variants`: product_id, app_id, organization_id, name, sku, image_url, price, stock_on_hand, stock_reserved, attributes.
- `stock_movements`: app_id, organization_id, variant_id, movement_type, quantity, before/after, seed metadata.

## Treatment Catalog Seed

Source: `apps/backend/scripts/seed-treatment-catalog.ts`.

| Item | Value |
|---|---|
| Target user env | `SEED_USER_EMAIL` |
| Default target user | `tech@alkindikids.com` |
| Catalog path env | `TREATMENT_CATALOG_PATH` |
| Default catalog path | `apps/backend/knowledge/treatment-products.json` when run from backend cwd |
| Variant toggle | `TREATMENT_SEED_VARIANTS` default true |
| Disable existing variants when not upserting | `TREATMENT_DISABLE_EXISTING_VARIANTS` default false |
| Default variant stock | `TREATMENT_VARIANT_STOCK` default `9999` |
| Metadata tag | `treatment_catalog_apr2026_v1` |

Treatment metadata stores pricing breakdown:

```ts
type TreatmentProductMetadata = {
  seed_tag: 'treatment_catalog_apr2026_v1'
  pricing: {
    normal_non_member: number | null
    normal_member: number | null
    promo_flash_sale_new_customer: number | null
    special_non_member: number | null
    special_member: number | null
  }
  promo_label: string | null
  special_label: string | null
  unit: string | null
  treatment_sessions: number | null
}
```

## Product Knowledge Export

`apps/backend/scripts/generate-products-knowledge-md.ts` reads products for a target app and writes markdown for knowledge/RAG ingestion.

| Env | Purpose |
|---|---|
| `KB_TARGET_EMAIL` | user used to resolve app context; default `tech@alkindikids.com` |
| `KB_OUTPUT_PATH` | output markdown path; default `knowledge/products-knowledge-base.md` |

Recommended flow:

1. Seed products/variants.
2. Generate product knowledge markdown.
3. Upload/import markdown as knowledge source through Knowledge API/UI.
4. Let knowledge indexer move source `pending -> ready`.

## Test Accounts

No plaintext test account is seeded by current scripts. A rebuild should create accounts through the app's register/onboarding flow or Better Auth seed-only fixture outside production.

Recommended dev fixture shape, if a test seed is added later:

```ts
type DevAccountSeed = {
  email: string
  name: string
  role: 'owner' | 'admin' | 'agent' | 'supervisor'
  organization: { name: string; slug: string }
  app: { app_name: string; business_name?: string }
}
```

Never commit real passwords or provider tokens in seed files.

## Seed Idempotency and Safety

- Main AI pricing seed is idempotent by `model_name`.
- Catalog seeds are mostly idempotent by `app_id + sku` and update existing products/variants.
- Electronics seed writes stock movement deltas when stock differs; reruns can create movement history.
- Treatment seed can deactivate existing variants only when explicitly configured.
- Catalog seeds require an app context. If target user has no app/org appId, scripts throw instead of guessing.
