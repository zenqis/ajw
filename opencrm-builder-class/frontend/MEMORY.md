# MEMORY — Frontend

## Tujuan
Catatan keputusan arsitektur, konvensi kode, dan state terkini frontend OpenCRM.

## Aturan kerja
1. Source code frontend: `apps/frontend/src/`
2. Blueprint frontend: `./blueprint.md`
3. STRUCTURE frontend: `./STRUCTURE.md`
4. Root MEMORY proyek: `../MEMORY.md`
5. Tiap subdirectory punya `blueprint.md`, `PRD.md`, dan `MEMORY.md` sendiri.

## Keputusan arsitektur aktif

### Stack
- Framework: TanStack Start (Vite + React 18)
- Router: TanStack Router (file-based)
- Styling: Tailwind CSS v4
- Components: shadcn/ui + Radix UI
- API Client: Eden Treaty (@elysiajs/eden)
- Real-time: socket.io-client
- Theme: next-themes

### State management
- **No global state library** (no Redux, Zustand, etc.)
- State per-page via React `useState/useEffect`
- Auth state: localStorage (`scalechat_token`, `scalechat_user`, `scalechat_app_id`)
- Organization context: cookies + localStorage
- Chat preferences: localStorage (`lib/chat-preferences.ts`)
- Theme: next-themes (localStorage)

## Konvensi kode

### Route pattern (TanStack file-based routing)
```
routes/
├── __root.tsx         Root layout (ThemeProvider + Sonner)
├── index.tsx          Landing → redirect
├── login.tsx          Public page
├── _app.tsx           Authenticated layout wrapper
└── _app/
    ├── dashboard.tsx  Protected page
    └── flows/$flowId.tsx  Dynamic param
```

### Auth flow
1. `_app.tsx` checks `localStorage.getItem('scalechat_token')`
2. If no token → `syncOrganizationContextFromSession()` → Better Auth session check
3. If no session → redirect to `/login`
4. If session but no org → redirect to `/onboarding`
5. After login: persist token + user + org to localStorage + cookies

### Organization context storage
```
localStorage:
- scalechat_token        → Bearer token
- scalechat_refresh_token → Refresh token
- scalechat_user         → JSON user object
- scalechat_app_id       → App UUID
- scalechat_org_slug     → Org slug
- scalechat_org_id       → Org ID
- scalechat_org_name     → Org name

Cookies (30-day max-age):
- scalechat_org_slug, scalechat_app_id, scalechat_org_id, scalechat_org_name
```

### API call patterns
```ts
// Preferred: Eden Treaty (type-safe)
const data = await treatyApi.api.conversations.get({ query }).then(unwrapTreatyResponse)

// Fallback: raw fetch
const data = await apiRequest<T>('/conversations/${id}/messages', { method: 'POST' })
```

### Component convention
- Pages di `routes/` — full page components
- Components di `components/` — reusable, focused
- `ui/` components dari shadcn → jangan edit langsung, extend via wrapper
- Settings managers di `components/settings/` — satu per domain

### Socket.IO usage
```ts
const socket = connectSocket()
socket.emit('join', { appId })
onMessageCreated(({ message, conversation }) => { ... })
joinConversation(conversationId)
```

## Catatan penting

### Largest pages (by file size)
1. `team.tsx` — 74KB (team management + divisions + members)
2. `chat.tsx` — 64KB (live inbox, paling complex)
3. `products.tsx` — 58KB (product catalog + variants)
4. `broadcast.tsx` — 55KB (broadcasting + audience)
5. `ai.tsx` — 41KB (AI config + playground)
6. `settings.tsx` — 40KB (multi-tab settings)

### Post-login redirect
- `rememberPostLoginRedirect(path)` → sessionStorage
- `consumePostLoginRedirect()` → read + clear
- Handles legacy URL formats

### Vite proxy
Dev server proxies `/api` and `/auth` to backend (default `localhost:3010`).

## Status
- Total routes: 40+
- Total components: 80+
- API client: 2553 lines (~80+ endpoint wrappers)
- shadcn/ui: ~50 base components
- Settings managers: 10
- Flow builder components: 3
