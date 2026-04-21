# Shopee Chat Backend (AJW)

Backend ini menangani:
- Generate sign Shopee Open Platform (v2)
- OAuth token flow shop
- Endpoint callback Live Push
- Sinkron conversation + message chat
- Simpan data ke database SQLite

## 1) Setup

```bash
cd shopee-chat-backend
cp .env.example .env
npm install
npm run dev
```

Default API jalan di `http://localhost:3010`.

## 2) Isi kredensial `.env`

- `SHOPEE_PARTNER_ID`
- `SHOPEE_PARTNER_KEY`
- `LIVE_PUSH_PARTNER_KEY` (dari Shopee Live Push Setting)
- `APP_BASE_URL` (contoh `https://your-domain.com` kalau sudah deploy)
- `SHOPEE_REDIRECT_PATH` default `/api/shopee/oauth/callback`

## 3) Konfigurasi Shopee Console

Pada menu **Live Push Setting**:
- ON-kan `Get Live Push`
- Isi `Live Call Back URL` ke:
  - `https://your-domain.com/api/shopee/live-push`
- Pilih deployment area sesuai server Anda
- Isi/generate `Live Push Partner Key` sama dengan `.env`
- Aktifkan push category untuk chat
- Verify + Save

Untuk OAuth app:
- Redirect URL harus sama dengan:
  - `https://your-domain.com/api/shopee/oauth/callback`

## 4) OAuth Shop

Contoh:
- Buka `GET /api/shopee/oauth/url?shop_id=123456789`
- Login & authorize shop
- Callback otomatis simpan `access_token` + `refresh_token` ke DB

## 5) Sinkron chat

- Manual sync semua conversation:
  - `POST /api/chat/sync` body: `{ "shop_id": "123456789" }`
- Manual sync 1 conversation:
  - `POST /api/chat/sync` body: `{ "shop_id": "123456789", "conversation_id": "..." }`

Read API:
- `GET /api/chat/conversations?shop_id=123456789&limit=100`
- `GET /api/chat/messages?conversation_id=...&limit=200`

## 6) Integrasi tab Chat (frontend AJW)

File `shopee_chat_override.js` sudah:
- Menambah tab `CHAT`
- Menyediakan tombol OAuth + Sync
- Menampilkan list percakapan + isi pesan

Di UI tab Chat:
- Isi `API base` (default `http://localhost:3010`)
- Isi `shop_id`
- Klik `OAuth` (sekali per shop, atau saat token perlu rebind)
- Klik `Sync Chat`

## Catatan

- Signature live push antar region/versi bisa beda header. Backend ini cek header umum:
  - `x-shopee-hmac-sha256`
  - `x-shopee-signature`
  - `authorization`
- Jika di env Anda beda, sesuaikan fungsi `verifyLivePushSignature()` di `src/shopee.js`.
