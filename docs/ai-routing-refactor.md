# AI Routing Refactor

## Target

Semua request AI masuk lewat backend agar UI tidak lagi:

- memilih model sendiri
- membawa context besar yang tidak relevan
- menyimpan log/history sebagai pseudo-context
- memanggil vendor model langsung dari browser

## Flow

`UI -> /api/ai/* -> task router -> context builder -> template builder -> cache -> model adapter`

## Task Types

- `prompt.enhance`
- `image.generate.listing`
- `image.generate.multi_angle`
- `image.generate.aplus`
- `image.generate.bgremove`

## Token Discipline

- Context diambil per task, bukan global snapshot penuh.
- Prompt memakai template tetap per task.
- Cache key dibangun dari `task + model + template + normalized context`.
- UI hanya mengirim file yang relevan untuk task aktif.

## Backend Files

- `shopee-chat-backend/src/ai/router.js`
- `shopee-chat-backend/src/ai/contextBuilder.js`
- `shopee-chat-backend/src/ai/templates.js`
- `shopee-chat-backend/src/ai/cache.js`
- `shopee-chat-backend/src/ai/adapters.js`
- `shopee-chat-backend/src/ai/controller.js`

## Environment

Minimal:

- `OPENAI_API_KEY`

Opsional:

- `OPENAI_BASE_URL`
- `AI_PROMPT_MODEL`
- `AI_IMAGE_MODEL`
- `AI_IMAGE_PROVIDER`
- `AI_CACHE_PATH`

## Note

Field provider lama di UI masih ada untuk kompatibilitas visual, tetapi generate utama sekarang diarahkan ke backend gateway.
