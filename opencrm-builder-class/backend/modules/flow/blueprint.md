# Blueprint — Flow Module (Visual Workflow Builder)

## Objective
Visual workflow automation with React Flow serialization, runtime execution engine, and AI-powered decision routing.

## Responsibilities
- Flow CRUD (nodes/edges JSON serialization from React Flow)
- Flow runtime execution (FlowRuntimeService — 7206 lines)
- Decision engine for AI-powered intent routing (DecisionEngineService — 2284 lines)
- Node types: trigger, condition, action, AI response, handover, delay, etc.
- Flow activation/deactivation per app
- Execution logging + debugging
- Flow template management
- Single active flow enforcement per app

## File structure
```
modules/flow/
  decision-engine-service.ts (2285 lines)
  index.ts (326 lines)
  model.ts (44 lines)
  runtime-service.ts (7207 lines)
  service.ts (960 lines)
```

### File descriptions
- **`decision-engine-service.ts`** — Specialized service: decision engine service. 2285 lines.
- **`index.ts`** — Elysia route plugin. Registers all HTTP endpoints under `/api/flows`. 326 lines.
- **`model.ts`** — Prisma query helpers and request validation models. 44 lines.
- **`runtime-service.ts`** — Specialized service: runtime service. 7207 lines.
- **`service.ts`** — Core business logic. 960 lines.

## Route prefix
`/api/flows`

## Key tables
- `automation_flows`

## Implementation status
### Selesai
- [x] Module structure (index.ts + service + model) — total 10822 lines
- [x] Route registration under `/api/flows`
- [x] Multi-tenant isolation via `app_id` context
- [x] Decision engine service — 2285 lines
- [x] Model — 44 lines
- [x] Runtime service — 7207 lines
- [x] Service — 960 lines

### Belum / pending
- Tidak ada item pending untuk modul ini.
