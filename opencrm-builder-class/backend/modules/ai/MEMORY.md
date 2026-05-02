# MEMORY — ai module

## Tujuan
Catatan keputusan dan state terkini modul ai.

## Aturan kerja
1. Source code: `apps/backend/src/modules/ai/`
2. Blueprint modul: `./blueprint.md`
3. PRD modul: `./PRD.md`
4. Backend MEMORY (root): `../../MEMORY.md`

## Status
- Module path: `apps/backend/src/modules/ai/`
- Total files: 3
- Total lines: 6506
- Route prefix: `/api/ai`
- Key tables: `ai_settings`, `ai_model_pricing`, `ai_playground_models`, `ai_playground_routing_strategies`, `ai_playground_personas`, `ai_playground_guardrails`, `ai_playground_metric_items`, `ai_playground_sessions`, `ai_playground_turns`

## Catatan
- Module mengikuti konvensi backend: index.ts (routes) + service.ts (logic) + model.ts (data access)
- Semua query di-scope by `app_id` untuk multi-tenant isolation
