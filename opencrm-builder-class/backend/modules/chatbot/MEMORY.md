# MEMORY — chatbot module

## Tujuan
Catatan keputusan dan state terkini modul chatbot.

## Aturan kerja
1. Source code: `apps/backend/src/modules/chatbot/`
2. Blueprint modul: `./blueprint.md`
3. PRD modul: `./PRD.md`
4. Backend MEMORY (root): `../../MEMORY.md`

## Status
- Module path: `apps/backend/src/modules/chatbot/`
- Total files: 6
- Total lines: 10454
- Route prefix: `/api/chatbots`
- Key tables: `chatbots`, `ai_conversation_contexts`, `ai_response_logs`, `ai_evaluation_messages`, `ai_evaluations`

## Catatan
- Module mengikuti konvensi backend: index.ts (routes) + service.ts (logic) + model.ts (data access)
- Semua query di-scope by `app_id` untuk multi-tenant isolation
