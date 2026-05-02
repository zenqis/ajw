# Integrations Setup — OpenCRM

Generated from env examples and backend integration code on 2026-04-29. Use this as the rebuild/setup checklist for external services.

## Required Local Services

| Service | Required | Env/config | Notes |
|---|---|---|---|
| PostgreSQL + pgvector | yes | `DATABASE_URL` | vector extension needed for RAG columns |
| Redis | yes for workers/socket adapter | `REDIS_URL` or host/port vars | BullMQ queues, Socket.IO Redis adapter, caches |
| Backend public URL | yes for webhooks | `API_PUBLIC_URL`, `BACKEND_URL`, tunnel host, or request origin | used to generate webhook callback URLs |
| Frontend public URL | yes for CORS/auth redirects | `FRONTEND_URL` | comma-separated allowed origins supported |

## Meta WhatsApp Business

### Env Vars

| Variable | Purpose |
|---|---|
| `META_VERIFY_TOKEN` or `WHATSAPP_WEBHOOK_VERIFY_TOKEN` | webhook verification token |
| `WHATSAPP_ACCESS_TOKEN` | fallback Meta Graph token for WABA/phone fetches |
| `WHATSAPP_PHONE_NUMBER_ID` | optional single-channel bootstrap/default |
| `WHATSAPP_WABA_ID` | optional WABA id |
| `WHATSAPP_REDIRECT_URI` | embedded signup/oauth redirect |
| `WHATSAPP_WEBHOOK_CALLBACK_URL` | explicit webhook URL override |
| `API_PUBLIC_URL` / `BACKEND_URL` | fallback public API base for webhook URL generation |
| `FB_APP_ID`, `FB_APP_SECRET` | token exchange and app access token flows |
| `WABA_CONFIG_ID` | embedded signup config id if used by frontend/setup flow |

### Backend Endpoints

| Endpoint | Purpose |
|---|---|
| `GET /api/v1/waba/webhook-config` | returns callback URL and verify token for Meta setup UI |
| `POST /api/v1/waba/connect/manual` | sync WABA/phone channels using manual access token + WABA id |
| `POST /api/v1/whatsapp-channels/exchange-token` | exchange embedded signup code/token |
| `GET /api/v1/webhooks/whatsapp` | Meta webhook verification challenge |
| `POST /api/v1/webhooks/whatsapp` | Meta message/status webhook payload |

### Setup Steps

1. Create/select a Meta Developer app with WhatsApp product enabled.
2. Create a long-lived or system-user access token with WhatsApp Business permissions.
3. Set backend env vars: verify token, access token, app id/secret, redirect URI, public API URL.
4. Start backend API and worker/scheduler modes.
5. Open `GET /api/v1/waba/webhook-config` from an authenticated tenant to confirm callback URL.
6. In Meta dashboard, configure webhook callback to `https://<api-host>/api/v1/webhooks/whatsapp` and verify token from step 5.
7. Subscribe webhook fields for messages/statuses on the WABA/phone number.
8. Connect channel through manual WABA sync or embedded signup.
9. Send inbound test message; confirm `webhook_events`, `contacts`, `conversations`, and `messages` rows are created.

Implementation notes:

- WhatsApp verification returns the raw `hub.challenge` as `text/plain`.
- Inbound handler deduplicates by provider message id and creates a new conversation if the latest prior one is resolved.
- WhatsApp status webhooks update message status and emit `message:status_updated`.

## Meta Instagram

### Env Vars

| Variable | Purpose |
|---|---|
| `INSTAGRAM_APP_ID`, `INSTAGRAM_APP_SECRET` | Instagram app OAuth |
| `INSTAGRAM_ACCESS_TOKEN` | optional token/bootstrap |
| `IG_REDIRECT_URI` | Instagram OAuth redirect |
| `FB_APP_ID`, `FB_APP_SECRET` | fallback Facebook app credentials |
| `META_VERIFY_TOKEN` / `WHATSAPP_WEBHOOK_VERIFY_TOKEN` | webhook verification token reused by Instagram module |

Source status:

- Instagram module exists, but current API contract marks `instagram` as present but not mounted by `src/index.ts`.
- Webhook service contains Instagram inbound processing. A rebuild must mount/verify the Instagram route before depending on it.

## TikTok Messaging

### Env Vars

| Variable | Purpose |
|---|---|
| `TIKTOK_CLIENT_KEY`, `TIKTOK_CLIENT_SECRET` | OAuth/client credentials |
| `TIKTOK_APP_ID`, `TIKTOK_CLIENT_ID` | app/client identifiers |
| `TIKTOK_REDIRECT_URI` | OAuth redirect |
| `TIKTOK_MESSAGE_SEND_URL` or `TIKTOK_SEND_MESSAGE_URL` | optional send API override |

Source status:

- Webhook service can process TikTok inbound and outbound worker can send TikTok messages when channel/contact config is present.
- Include TikTok in worker replay jobs through `source in ['whatsapp','instagram','tiktok']`.

## AI Providers and RAG

### Env Vars

| Variable | Purpose |
|---|---|
| `AI_ENABLED` | feature toggle in env examples |
| `AI_PROVIDER` | default provider hint for legacy/runtime code |
| `AI_MODEL` | default chat/generation model hint |
| `OPENAI_API_KEY` | OpenAI-compatible key used by chat/embedding fallback |
| `AZURE_OPENAI_API_KEY`, `AZURE_OPENAI_ENDPOINT`, `AZURE_OPENAI_DEPLOYMENT` | Azure OpenAI chat/embedding config |
| `AI_EMBEDDING_MODEL` | embedding model override; supported: `text-embedding-3-small`, `text-embedding-ada-002` |
| `AI_REQUEST_TIMEOUT_MS` | AI service request timeout |
| `KNOWLEDGE_MAX_EMBEDDING_CHUNKS` | max chunks per source, default 200 |
| `KNOWLEDGE_EMBEDDING_CHUNK_SIZE` | chunk size, default 1000 chars/tokens approximation |
| `KNOWLEDGE_EMBEDDING_CHUNK_OVERLAP` | chunk overlap, default 120 |

Provider configuration model:

- Supported AI provider keys in source: `growthcircle`, `azure`, `sumopod`.
- Provider configs are stored in system settings under `ai.provider.config.{provider}` plus active provider keys.
- Growthcircle default uses OpenAI-compatible and Anthropic-compatible channel configs in source.
- RAG indexing reads provider/API env and writes pgvector embeddings to `knowledge_chunks` and legacy `embeddings`.

Setup steps:

1. Set provider API key/env for local development or configure provider through AI settings UI/API.
2. Ensure PostgreSQL vector extension is enabled.
3. Upload/create knowledge source.
4. Let maintenance worker process `knowledge-change-event` jobs.
5. Confirm source status reaches `ready` and chunks exist.

## Cloudflare R2 or S3-Compatible Storage

### Env Vars

| Variable | Purpose |
|---|---|
| `R2_ACCOUNT_ID` | derives endpoint `https://<account>.r2.cloudflarestorage.com` |
| `R2_ENDPOINT` | explicit R2 endpoint override |
| `R2_REGION` | default `auto` |
| `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY` | static credentials |
| `R2_BUCKET_NAME` | bucket name |
| `R2_PUBLIC_URL` | public base URL used to serve uploaded media |
| `R2_PUBLIC_URL_STYLE` | `path` or `virtual` style override |
| `S3_ENDPOINT`, `S3_REGION`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`, `S3_BUCKET`, `S3_PUBLIC_URL` | S3-compatible alternatives |

Setup steps:

1. Create bucket and access key in R2/S3 provider.
2. Set endpoint, bucket, credentials, and public URL in backend env.
3. Make bucket/object path publicly readable via custom domain or public bucket policy.
4. Upload/test media through WhatsApp channel badge or inbound media persistence.
5. Confirm `buildS3PublicUrl(key)` URL loads publicly.

Implementation notes:

- Upload configured means public URL exists; if custom endpoint exists without static credentials, backend reports config error.
- Public URL can be bucket path style or virtual-hosted style.
- Inbound WhatsApp/Instagram media persistence stores provider original URL and public S3/R2 URL in message attributes/media files.

## Pakasir Payments

### Env Vars

| Variable | Purpose |
|---|---|
| `PAKASIR_BASE_URL` | API base; default `https://app.pakasir.com/api` |
| `PAKASIR_MODE` | `sandbox` or `live`; source normalizes unknown to live |
| `PAKASIR_SANDBOX_BASE_URL`, `PAKASIR_LIVE_BASE_URL` | optional mode-specific base URL overrides |
| `PAKASIR_PROJECT_SLUG` or `PAKASIR_PROJECT` | project identifier |
| `PAKASIR_API_KEY` | API key |
| `PAKASIR_REDIRECT_URL` | hosted payment redirect URL |
| `PAKASIR_PAYMENT_METHODS` or `PAYMENT_METHODS` | enabled methods CSV/JSON |

### Backend Endpoints

| Endpoint | Purpose |
|---|---|
| `GET /api/v1/commerce/settings/pakasir` | read resolved settings, masked key, generated webhook URL |
| `PATCH /api/v1/commerce/settings/pakasir` | store per-tenant settings; env remains fallback |
| `POST /api/v1/webhooks/pakasir/` | public payment webhook |
| `POST /api/v1/commerce/orders/:orderId/send-payment-link` | create/send hosted payment link |
| `GET /api/v1/public/payment-success` | public success lookup after redirect |

Setup steps:

1. Add env defaults or configure per tenant via commerce settings UI/API.
2. Confirm `GET /commerce/settings/pakasir` shows `api_key_configured=true` and project configured.
3. Configure Pakasir webhook URL to `https://<api-host>/api/webhooks/pakasir` or generated URL.
4. Create order/checkout and send payment link.
5. Pay sandbox/live invoice.
6. Confirm webhook verifies transaction detail, updates invoice to `PAID`, order to paid/completed path, finalizes stock reservation, and sends success notification.

Notes:

- Pakasir webhook idempotency uses `webhook_events.source='pakasir'` and external id/reference.
- Non-paid statuses `CANCELLED` and `EXPIRED` release stock reservations and update order phase/status.

## Xendit Payments

Env examples still include Xendit keys, but current mounted payment implementation is Pakasir-first.

| Variable | Current status |
|---|---|
| `XENDIT_SECRET_KEY` | present in env example/dependency, no mounted Xendit webhook route found in API contract |
| `XENDIT_WEBHOOK_TOKEN` / `XENDIT_CALLBACK_TOKEN` | present in env examples |
| `XENDIT_WEBHOOK_URL` | present in backend env example |
| `order_invoices.xendit_invoice_id` | schema/service lookup compatibility field |

Rebuild guidance:

- Preserve DB field compatibility for old invoices.
- Do not expose an Xendit setup flow unless route/service implementation is restored.
- If restoring Xendit, add explicit API contract and webhook signature verification docs.

## Cloudflare Tunnel

| Variable | Purpose |
|---|---|
| `CLOUDFLARED_TUNNEL_TOKEN` | tunnel daemon token |
| `TUNNEL_API_HOST`, `TUNNEL_FE_HOST` | public tunnel hosts for local API/frontend |

Use tunnel when Meta/Pakasir need public callbacks during local development. Ensure callback URL matches backend route prefix and HTTPS host.

## Socket.IO and Redis Adapter

| Variable | Purpose |
|---|---|
| `SOCKET_PORT` | standalone Socket.IO port, default 3011 |
| `SOCKET_IO_PATH` | default `/socket.io` |
| `SOCKET_IO_TRANSPORTS` | default `websocket` |
| `SOCKET_IO_CORS_ORIGIN` | comma-separated frontend origins |
| `REDIS_URL` | adapter pub/sub and queue connection |
| Frontend `VITE_SOCKET_URL` | socket client base URL |
| Frontend `VITE_SOCKET_PATH` | optional socket path override |

Rooms/events are documented in `docs/backend/SOCKET-EVENTS.md`.

## Verification Checklist

| Integration | Smoke test |
|---|---|
| WhatsApp | Meta webhook verify returns challenge; inbound creates contact/conversation/message; outbound message reaches `sent` |
| R2/S3 | channel badge/media upload returns public URL; URL loads without auth |
| AI/RAG | knowledge source moves to `ready`; query returns chunks/answer |
| Pakasir | payment link created; webhook marks invoice paid/cancelled/expired |
| Socket.IO | client joins app room and receives `message:created` / status updates |
| Redis/BullMQ | pending outbound/webhook jobs process and replay jobs run |
