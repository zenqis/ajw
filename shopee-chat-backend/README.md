# Shopee Chat Backend (AJW)

Backend ini menangani:
- Generate sign Shopee Open Platform (v2)
- OAuth token flow shop
- Endpoint callback Live Push
- Sinkron conversation + message chat
- Simpan data ke file JSON lokal (tanpa dependency native)

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

## Catatan runtime

- Backend ini sengaja tidak memakai `better-sqlite3`, jadi aman dijalankan di Node 24 tanpa Visual Studio Build Tools.
- Data tersimpan di path `DB_PATH` (default `./data/shopee_chat.json`).

## Deploy ke Vercel (siap pakai)

Struktur serverless sudah disiapkan:
- `api/index.js` sebagai entry Vercel Function
- `src/app.js` sebagai Express app
- `vercel.json` sudah route semua request ke backend

Langkah:
1. Push folder `shopee-chat-backend` ke GitHub.
2. Di Vercel: New Project -> pilih repo -> Root Directory: `shopee-chat-backend`.
3. Tambahkan Environment Variables di Vercel:
   - `SHOPEE_PARTNER_ID`
   - `SHOPEE_PARTNER_KEY`
   - `SHOPEE_REDIRECT_PATH=/api/shopee/oauth/callback`
   - `SHOPEE_ENV=live`
   - `APP_BASE_URL=https://<domain-backend-anda>`
   - `LIVE_PUSH_PARTNER_KEY` (opsional live push)
4. Deploy.
5. Uji endpoint:
   - `https://<domain-backend-anda>/health`

Penting:
- Di Vercel, file lokal default tersimpan di `/tmp/shopee_chat.json` (ephemeral). Untuk produksi jangka panjang, pindahkan ke database cloud.
- Redirect URL domain di Shopee Open Platform wajib sama dengan `APP_BASE_URL` Anda.

## Catatan

- Signature live push antar region/versi bisa beda header. Backend ini cek header umum:
  - `x-shopee-hmac-sha256`
  - `x-shopee-signature`
  - `authorization`
- Jika di env Anda beda, sesuaikan fungsi `verifyLivePushSignature()` di `src/shopee.js`.
