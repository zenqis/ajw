# Blueprint — Chatbot Module

## Objective
Chatbot instance management, AI conversation simulation, response cost tracking, follow-up scheduling, and chatbot evaluation.

## Responsibilities
- Chatbot instance CRUD (name, prompt, model, settings)
- Default chatbot resolution per app
- Conversation simulation (ChatbotSimulationService)
- AI response cost/token logging (AIResponseLogService)
- Follow-up message scheduling (ChatbotFollowupService)
- Knowledge document linking per chatbot
- Minimal context mode for intent routing
- Multi-provider support (OpenAI, Azure, Growthcircle)

## File structure
```
modules/chatbot/
  followup-service.ts (2063 lines)
  index.ts (504 lines)
  model.ts (93 lines)
  response-log-service.ts (689 lines)
  service.ts (487 lines)
  simulation-service.ts (6618 lines)
```

### File descriptions
- **`followup-service.ts`** — Specialized service: followup service. 2063 lines.
- **`index.ts`** — Elysia route plugin. Registers all HTTP endpoints under `/api/chatbots`. 504 lines.
- **`model.ts`** — Prisma query helpers and request validation models. 93 lines.
- **`response-log-service.ts`** — Specialized service: response log service. 689 lines.
- **`service.ts`** — Core business logic. 487 lines.
- **`simulation-service.ts`** — Specialized service: simulation service. 6618 lines.

## Route prefix
`/api/chatbots`

## Key tables
- `chatbots`
- `ai_conversation_contexts`
- `ai_response_logs`
- `ai_evaluation_messages`
- `ai_evaluations`

## Implementation status
### Selesai
- [x] Module structure (index.ts + service + model) — total 10454 lines
- [x] Route registration under `/api/chatbots`
- [x] Multi-tenant isolation via `app_id` context
- [x] Followup service — 2063 lines
- [x] Model — 93 lines
- [x] Response log service — 689 lines
- [x] Service — 487 lines
- [x] Simulation service — 6618 lines

### Belum / pending
- Tidak ada item pending untuk modul ini.
