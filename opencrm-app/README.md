# OpenCRM Standalone

Program OpenCRM mandiri hasil rekonstruksi dari `opencrm-builder-class`.

## Jalankan

```bash
npm start
```

Default URL:

- App: `http://localhost:3025`
- Webhook config: `http://localhost:3025/api/waba/webhook-config`
- WhatsApp webhook: `http://localhost:3025/api/webhooks/whatsapp`

## Env WhatsApp

```bash
OPENCRM_PORT=3025
META_VERIFY_TOKEN=opencrm-ajw-verify
API_PUBLIC_URL=https://domain-publik-kamu
WHATSAPP_ACCESS_TOKEN=...
WHATSAPP_PHONE_NUMBER_ID=...
WHATSAPP_WABA_ID=...
```

Untuk Meta, gunakan callback `https://domain-publik-kamu/api/webhooks/whatsapp`
atau `https://domain-publik-kamu/api/v1/webhooks/whatsapp`.
