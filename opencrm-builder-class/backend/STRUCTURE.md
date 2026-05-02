# STRUCTURE — Backend

```
apps/backend/
├── src/
│   ├── index.ts                  Entrypoint — multi-mode (api/worker/scheduler)
│   ├── auth.ts                   Better Auth + Prisma adapter
│   ├── generated/                Prisma generated client (gitignored)
│   ├── plugins/
│   │   ├── index.ts              Plugin barrel
│   │   ├── app-context.ts        Global derive: userId, appUuid, orgSlug (384 lines)
│   │   ├── socket.ts             Socket.IO + Redis adapter (134 lines)
│   │   └── openapi.ts            Swagger plugin
│   ├── lib/
│   │   ├── prisma.ts             PrismaClient singleton (PrismaPg adapter)
│   │   ├── redis.ts              ioredis singleton
│   │   ├── queue.ts              7 BullMQ queues + addJob() helper
│   │   ├── s3.ts                 S3/R2 client + public URL builder (127 lines)
│   │   ├── meta-api.ts           Meta Graph API (WA/IG sending)
│   │   ├── tiktok-api.ts         TikTok API
│   │   ├── realtime.ts           Socket.IO instance holder
│   │   ├── realtime-emitter.ts   emitRealtimeToRoom() helper
│   │   ├── organization-app.ts   Org ↔ App linking
│   │   ├── organization-membership.ts
│   │   ├── agent-channel-access.ts
│   │   ├── better-auth-credentials.ts
│   │   ├── seed.ts               Seeding utilities
│   │   └── utils.ts              resolveAppId(), etc.
│   ├── modules/                  37 domain modules (see blueprint.md)
│   │   ├── index.ts              Module registration barrel
│   │   ├── auth/index.ts
│   │   ├── conversation/         index.ts, model.ts, service.ts, bulk-service.ts, note-service.ts, ai-analytics.ts
│   │   ├── message/              index.ts, model.ts, service.ts
│   │   ├── ai/                   index.ts, model.ts, service.ts
│   │   ├── chatbot/              index.ts, model.ts, service.ts, simulation-service.ts, response-log-service.ts, followup-service.ts
│   │   ├── knowledge/            index.ts, model.ts, service.ts, extraction-service.ts, indexing-service.ts
│   │   ├── flow/                 index.ts, model.ts, service.ts, runtime-service.ts, decision-engine-service.ts
│   │   ├── whatsapp/             index.ts, model.ts, service.ts
│   │   ├── broadcast/            index.ts, model.ts, service.ts
│   │   ├── crm/                  index.ts, model.ts, service.ts
│   │   ├── contact/              index.ts, model.ts, service.ts
│   │   ├── customer/             index.ts, service.ts
│   │   ├── inbox/                index.ts, model.ts, service.ts
│   │   ├── agent/                index.ts, model.ts, service.ts
│   │   ├── agent-settings/       index.ts, model.ts, service.ts
│   │   ├── team/                 index.ts, model.ts, service.ts
│   │   ├── media/                index.ts, model.ts, service.ts
│   │   ├── metrics/              index.ts, model.ts, service.ts
│   │   ├── orders/               index.ts
│   │   ├── commerce/             index.ts, pakasir-client.ts, service.ts
│   │   ├── form/                 index.ts, model.ts, service.ts
│   │   ├── label/                index.ts, model.ts, service.ts
│   │   ├── webhook/              index.ts, model.ts, service.ts
│   │   ├── webhooks/             index.ts, pakasir.ts
│   │   ├── business-webhooks/    index.ts, constants.ts, dispatch-service.ts, message-event-formatter.ts, service.ts
│   │   ├── developer-keys/       index.ts, service.ts
│   │   ├── api-tools/            index.ts, service.ts
│   │   ├── canned-response/      index.ts, model.ts, service.ts
│   │   ├── handover/             index.ts, service.ts
│   │   ├── template-variables/   index.ts, model.ts, service.ts
│   │   ├── instagram/            index.ts, model.ts, service.ts
│   │   ├── user/                 index.ts, model.ts, service.ts
│   │   ├── whatsapp-templates/   index.ts
│   │   ├── waba/                 index.ts
│   │   ├── orchestration/        index.ts, model.ts, service.ts
│   │   ├── organization.ts       (standalone)
│   │   └── scalebiz-compat/      index.ts
│   ├── workers/
│   │   └── index.ts              BullMQ worker definitions (2312 lines, ALL queues)
│   ├── routes/
│   │   └── codemap.md
│   └── types/
│       └── pg.d.ts
├── prisma/
│   ├── schema.prisma             Database schema (2282 lines, ~80+ models)
│   ├── seed.ts                   Seed script
│   └── migrations/               SQL migrations
├── knowledge/                    Static knowledge base files
│   ├── products-knowledge-base.md
│   └── treatment-*.{csv,json,md}
├── scripts/                      Utility scripts
├── test/                         Tests
├── prisma.config.ts
├── Dockerfile
├── package.json                  name: "backend"
├── tsconfig.json
└── .env.example                  66 lines, all env vars
```

## Database models (~80+)
Utama: `users`, `organization`, `apps`, `conversations`, `messages`, `contacts`, `chatbots`,
`knowledge_sources`, `knowledge_chunks`, `embeddings`, `automation_flows`, `pipelines`,
`pipeline_stages`, `broadcasts`, `orders`, `products`, `whatsapp_channels`, `ai_settings`,
`ai_response_logs`, `webhooks`, `webhook_events`, `teams`, `labels`, `forms`, `media_files`,
`sla_policies`, `agent_settings`, `handover_requests`, `canned_responses`, dll.

## Generated files (jangan diedit manual)
| Path | Regenerate |
|------|-----------|
| `src/generated/` | `bun run db:generate` |
| `node_modules/` | `bun install` |
| `dist/` | `bun run build:backend` |
