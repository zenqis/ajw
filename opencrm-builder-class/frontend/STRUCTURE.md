# STRUCTURE — Frontend

```
apps/frontend/
├── src/
│   ├── router.tsx                TanStack Router instance
│   ├── routeTree.gen.ts          Generated route tree (auto)
│   ├── styles.css                Global styles + Tailwind
│   ├── vite-env.d.ts
│   ├── routes/
│   │   ├── __root.tsx            Root layout (ThemeProvider, Sonner)
│   │   ├── index.tsx             Landing/redirect
│   │   ├── login.tsx             Login page
│   │   ├── register.tsx          Registration
│   │   ├── onboarding.tsx        Org setup wizard
│   │   ├── privacy.tsx           Privacy policy
│   │   ├── terms.tsx             Terms of service
│   │   ├── invoice/$token.tsx    Public invoice view
│   │   ├── payment/success.tsx   Payment confirmation
│   │   ├── _app.tsx              ★ Authenticated layout (Sidebar+TopBar+auth guard)
│   │   └── _app/                 ★ All protected pages
│   │       ├── dashboard.tsx           Dashboard KPI (16KB)
│   │       ├── chat.tsx                ★ Live agent inbox (64KB — largest page)
│   │       ├── conversations/$conversationId.tsx  Individual conversation
│   │       ├── customers/index.tsx     Customer list
│   │       ├── customers/$customerId.tsx  Customer detail
│   │       ├── ai.tsx                  AI configuration (41KB)
│   │       ├── ai-agents/$agentId.tsx  AI persona editor
│   │       ├── knowledge.tsx           Knowledge base (36KB)
│   │       ├── flows.tsx               Flow list (10KB)
│   │       ├── flows/$flowId.tsx       ★ Visual flow builder (React Flow)
│   │       ├── broadcast.tsx           Broadcasting (55KB)
│   │       ├── pipeline.tsx            CRM Kanban (19KB)
│   │       ├── analytics.tsx           Analytics dashboard (16KB)
│   │       ├── metrics.tsx             Metrics (8KB)
│   │       ├── team.tsx                ★ Team management (74KB)
│   │       ├── settings.tsx            Settings hub (40KB)
│   │       ├── templates.tsx           Message templates (15KB)
│   │       ├── orders.tsx              Orders (27KB)
│   │       ├── products.tsx            Product catalog (58KB)
│   │       ├── product-stock.tsx       Inventory (11KB)
│   │       ├── channels/
│   │       │   ├── whatsapp.tsx + whatsapp/$channelId.tsx + whatsapp/success.tsx
│   │       │   ├── instagram.tsx, facebook.tsx, telegram.tsx
│   │       │   ├── line.tsx, livechat.tsx, bot.tsx, custom.tsx
│   │       ├── developers/
│   │       │   ├── index.tsx           Developer hub
│   │       │   ├── api-documentation.tsx  API docs
│   │       │   ├── api-tools.tsx + api-tools/new.tsx
│   │       │   ├── webhooks.tsx        Webhook management
│   │       │   ├── messages-sent-by-api.tsx
│   │       │   └── -model.ts          Shared developer types
│   │       ├── apps/
│   │       │   ├── index.tsx           App center
│   │       │   ├── $appSlug.tsx        App detail
│   │       │   └── meta-ads-tracker.tsx
│   │       ├── handover.tsx            Handover queue (19KB)
│   │       ├── outbound.tsx            Outbound messaging
│   │       ├── integration.tsx         Integration hub
│   │       └── help.tsx                Help page (20KB)
│   ├── components/
│   │   ├── ui/                   shadcn/ui (~50 files)
│   │   ├── settings/             Settings managers (10 files)
│   │   ├── flows/                Flow builder (3 files)
│   │   ├── apps/                 App-specific (3 files)
│   │   ├── developers/           Developer tools (3 files)
│   │   ├── opencrm/              OpenCRM shared (shared.tsx + opencrm.css)
│   │   ├── admin/                Admin components
│   │   ├── theme-provider.tsx
│   │   └── (30+ standalone components)
│   ├── hooks/
│   │   ├── use-mobile.ts
│   │   └── useTimezone.ts
│   ├── lib/
│   │   ├── api.ts                ★ API client (2553 lines, ~80+ endpoints)
│   │   ├── api-enhanced.ts       Enhanced API helpers
│   │   ├── server.ts             Eden Treaty client instance
│   │   ├── socket.ts             Socket.IO client (144 lines)
│   │   ├── organization.ts       Org context resolution (521 lines)
│   │   ├── opencrm-navigation.ts Route path normalization
│   │   ├── role-access.ts        Role-based path guard (76 lines)
│   │   ├── agents-api.ts         Agent API calls
│   │   ├── chat-preferences.ts   Chat UI preferences (localStorage)
│   │   ├── facebook-sdk.ts       Facebook SDK loader
│   │   ├── notifications.ts      Browser notifications
│   │   ├── timezone.ts + timezones.ts  Timezone utilities
│   │   └── utils.ts              cn(), formatDate, etc.
│   └── types/
│       └── pg.d.ts
├── public/                       Static assets
├── components.json               shadcn/ui config
├── vite.config.ts                Vite + Nitro + TanStack + Tailwind
├── Dockerfile
├── package.json
└── tsconfig.json
```

## Generated files (jangan diedit manual)
| Path | Regenerate |
|------|-----------|
| `src/routeTree.gen.ts` | Auto from routes/ |
| `.tanstack/` | Auto |
| `.output/` | `bun run build:frontend` |
| `node_modules/` | `bun install` |
