# UI Reference — Frontend HTML + CSS Guide

Panduan lengkap untuk mereplikasi frontend OpenCRM secara akurat. File ini berisi exact HTML structure, CSS class patterns, dan design tokens.

---

## 1. Design System Foundation

### CSS Variables (from `styles.css`)
```css
/* Light theme */
:root {
  --background: oklch(1 0 0);                    /* white */
  --foreground: oklch(0.145 0 0);                /* near-black */
  --card: oklch(1 0 0);                          /* white */
  --card-foreground: oklch(0.145 0 0);           /* near-black */
  --primary: oklch(0.646 0.222 41.116);          /* warm orange */
  --primary-foreground: oklch(0.98 0.016 73.684); /* cream */
  --muted: oklch(0.97 0 0);                      /* very light gray */
  --muted-foreground: oklch(0.556 0 0);          /* medium gray */
  --border: oklch(0.922 0 0);                    /* light gray */
  --destructive: oklch(0.58 0.22 27);            /* red */
  --radius: 0.625rem;                            /* 10px */
}

/* Dark theme */
.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --card: oklch(0.205 0 0);
  --primary: oklch(0.705 0.213 47.604);
  --muted: oklch(0.269 0 0);
  --muted-foreground: oklch(0.708 0 0);
  --border: oklch(1 0 0 / 10%);
}
```

### Font
```css
@import "@fontsource-variable/geist";
--font-sans: "Geist Variable", sans-serif;
```

### OpenCRM Design System (`opencrm.css`)
```css
/* Shell variables */
.ocm-shell {
  --ocm-bg: var(--background);
  --ocm-surface: color-mix(in oklab, var(--card) 92%, var(--background) 8%);
  --ocm-surface-soft: color-mix(in oklab, var(--muted) 72%, var(--background) 28%);
  --ocm-line: color-mix(in oklab, var(--border) 88%, transparent);
  --ocm-text: var(--foreground);
  --ocm-text-muted: var(--muted-foreground);
  --ocm-accent: var(--primary);
  --ocm-success: oklch(0.68 0.16 148);
  --ocm-warning: oklch(0.76 0.16 78);
  --ocm-danger: oklch(0.62 0.2 26);
}

/* Key component classes */
.ocm-page     { display:flex; flex:1; flex-direction:column; gap:14px; overflow:auto; padding:18px; }
.ocm-card     { border:1px solid var(--ocm-line); background:var(--ocm-surface); border-radius:12px; box-shadow:0 8px 24px -20px rgb(0 0 0/45%); }
.ocm-btn      { height:34px; padding:0 12px; border-radius:8px; border:1px solid var(--ocm-line); background:var(--ocm-surface-soft); font-size:0.78rem; font-weight:600; }
.ocm-tag      { padding:2px 8px; border-radius:999px; font-size:0.65rem; font-weight:600; }
.ocm-table th { font-size:0.64rem; text-transform:uppercase; letter-spacing:0.1em; }
.ocm-table td { padding:10px; font-size:0.8rem; }
```

---

## 2. Login Page

**Route:** `/login`  
**File:** `src/routes/login.tsx` (200 lines)

### HTML Structure
```html
<!-- Full page wrapper - centered vertically and horizontally -->
<div class="flex min-h-svh w-full items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/5">
  <div class="mx-auto w-full max-w-md space-y-8 px-4 py-12 sm:px-6 lg:px-8">
    <div class="flex flex-col gap-6">
      
      <!-- Logo + brand -->
      <div class="flex flex-col items-center gap-2 text-center">
        <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-900 text-white shadow-md">
          <span class="text-2xl font-bold">🚀</span>
        </div>
        <div>
          <h1 class="text-2xl font-bold text-gray-900">OpenCRM</h1>
          <p class="text-sm text-gray-500">WhatsApp Messaging Platform</p>
        </div>
      </div>

      <!-- Card -->
      <div class="text-card-foreground rounded-xl bg-card/50 p-8 shadow-xl backdrop-blur-sm transition-all hover:shadow-2xl">
        <form class="flex flex-col gap-6">
          <!-- Header inside card -->
          <div class="flex flex-col items-center gap-1 text-center">
            <h1 class="text-2xl font-bold">Welcome Back</h1>
            <p class="text-muted-foreground text-sm text-balance">
              Enter your email and password to continue
            </p>
          </div>

          <!-- Email field -->
          <div> <!-- Field wrapper -->
            <label for="email">Email</label>
            <input id="email" type="email" placeholder="m@example.com" class="bg-background" />
          </div>

          <!-- Password field -->
          <div>
            <div class="flex items-center justify-between">
              <label for="password">Password</label>
              <a href="/" class="text-muted-foreground text-sm font-medium hover:underline">
                Forgot password?
              </a>
            </div>
            <input id="password" type="password" class="bg-background" />
          </div>

          <!-- Submit -->
          <button type="submit" class="w-full" size="lg">Login</button>

          <!-- Info tip -->
          <div class="rounded-md border border-amber-200/50 bg-amber-50/50 px-3 py-2 text-center text-amber-700">
            💡 Login issues? Try Ctrl+Shift+R or clear browser cache.
          </div>
        </form>
      </div>

      <!-- Footer links -->
      <p class="text-muted-foreground px-8 text-xs text-center">
        By logging in, you agree to our <a href="/terms">Terms</a> and <a href="/privacy">Privacy</a>
      </p>
      <p class="text-center text-xs text-gray-500">
        Don't have an account? <a href="/register" class="text-gray-900 font-medium">Sign up</a>
      </p>
    </div>
  </div>
</div>
```

### Key Design Patterns
- Background: subtle gradient `from-primary/5 via-background to-primary/5`
- Card: `bg-card/50 backdrop-blur-sm shadow-xl hover:shadow-2xl` (glassmorphism)
- Max width: `max-w-md` (448px)
- Logo: 48x48 rounded-xl with bg-gray-900

### Auth Logic
```
POST ${VITE_API_URL}/auth/sign-in/email
  → body: { email, password }
  → credentials: 'include'
  → On success: localStorage.setItem('scalechat_token', data.token)
  → syncOrganizationContextFromSession()
  → Navigate: /onboarding (if new) or /dashboard
```

---

## 3. Register Page

**Route:** `/register`  
**File:** `src/routes/register.tsx` (180 lines)

Same card layout as login, with additional fields:
- Full Name, Email, Password (with eye toggle), Confirm Password
- Password minimum 8 characters validation
- Eye/EyeOff icons for show/hide password

### Key Differences from Login
```html
<!-- Password toggle -->
<div class="relative">
  <input type="password" class="bg-background pr-10" />
  <button class="absolute right-1.5 top-1/2 -translate-y-1/2" variant="ghost" size="icon-sm">
    <!-- Eye or EyeOff icon -->
  </button>
</div>
```

### Auth Logic
```
POST ${VITE_API_URL}/auth/sign-up/email
  → body: { email, password, name }
  → On success: navigate to /onboarding
```

---

## 4. App Layout (Sidebar + TopBar + Content)

**Route:** `/_app.tsx` (292 lines)

### HTML Structure
```html
<div class="ocm-shell flex h-screen overflow-hidden bg-background text-foreground">
  <!-- Sidebar (desktop only) -->
  <div class="hidden lg:flex">
    <Sidebar />
  </div>

  <!-- Mobile sidebar overlay -->
  <div class="fixed inset-0 z-[120] lg:hidden" v-if="mobileOpen">
    <button class="absolute inset-0 bg-black/60" /> <!-- backdrop -->
    <div class="relative h-full w-72">
      <Sidebar />
    </div>
  </div>

  <!-- Main content area -->
  <div class="flex min-w-0 flex-1 flex-col bg-background">
    <TopBar />
    <div class="relative flex min-h-0 flex-1 pb-16 lg:pb-0">
      <!-- Page content (Outlet) -->
    </div>
    <BottomNav /> <!-- mobile only -->
  </div>
</div>
```

### AppContext Provider
```ts
interface AppContextType {
  appId: string
  agent: Agent | null
  toggleSidebar: () => void
}
```

### Auth Guard Flow
```
1. Check localStorage 'scalechat_token'
2. If no token → syncOrganizationContextFromSession()
3. If not authenticated → redirect /login
4. If onboardingRequired → redirect /onboarding
5. Role guard: isPathAllowedForRole(pathname, agent.role)
```

---

## 5. Sidebar

**File:** `src/components/Sidebar.tsx` (210 lines)

### HTML Structure
```html
<aside class="flex h-full w-72 flex-col border-r border-border bg-card text-card-foreground">
  <!-- Header -->
  <div class="flex items-center justify-between border-b border-border px-4 py-4">
    <div class="flex min-w-0 items-center gap-3">
      <div class="grid h-9 w-9 place-items-center rounded-lg bg-primary font-bold text-primary-foreground">
        O
      </div>
      <div class="min-w-0">
        <p class="truncate text-sm font-semibold">OpenCRM</p>
        <p class="truncate text-[11px] text-muted-foreground">WhatsApp Workspace</p>
      </div>
    </div>
    <!-- Close button (mobile only) -->
    <button class="rounded-md p-2 text-muted-foreground hover:bg-muted lg:hidden">
      <X size={18} />
    </button>
  </div>

  <!-- Navigation -->
  <nav class="flex-1 space-y-4 overflow-y-auto px-3 py-4">
    <!-- Group label -->
    <div>
      <p class="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        Operasional
      </p>
      <div class="space-y-1">
        <!-- Nav item (active) -->
        <a class="group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium bg-primary/15 text-primary">
          <Icon size={16} />
          <span>Dashboard</span>
        </a>
        <!-- Nav item (inactive) -->
        <a class="group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground">
          <Icon size={16} />
          <span>Inbox</span>
        </a>
      </div>
    </div>
  </nav>

  <!-- User footer -->
  <div class="border-t border-border p-3">
    <div class="mb-3 flex items-center gap-3 rounded-lg border border-border bg-muted/40 px-3 py-2">
      <Avatar name={name} online size={30} />
      <div class="min-w-0 flex-1">
        <p class="truncate text-sm font-semibold">{name}</p>
        <p class="truncate text-xs text-muted-foreground">{role}</p>
      </div>
    </div>
    <button class="flex w-full items-center justify-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm font-semibold text-red-500 hover:bg-red-500/15">
      <LogOut size={15} />
      Logout
    </button>
  </div>
</aside>
```

### Navigation Groups & Items
```ts
const NAV_GROUPS = {
  operasional: ['Dashboard', 'Inbox', 'Handover', 'Orders'],
  data: ['Pelanggan', 'Products'],
  outreach: ['Broadcast'],
  otomasi: ['Workflow', 'AI Playground', 'Knowledge Base', 'Settings'],
}
```

### Role-Based Visibility
```ts
agent:      ['/dashboard', '/chat', '/channels/whatsapp']
supervisor: agent + ['/team', '/orders', '/products', '/product-stock', '/settings']
admin:      all paths (unrestricted)
```

### Avatar Component
```tsx
// Gradient avatar from name hash
function OpenCrmAvatar({ name, size = 30, online = false }) {
  const palette = [
    ['#d97706', '#7c2d12'], ['#0f766e', '#164e63'], ['#9333ea', '#4c1d95'],
    ['#dc2626', '#7f1d1d'], ['#0369a1', '#1e3a8a'], ['#65a30d', '#3f6212'],
    ['#c026d3', '#701a75'],
  ]
  // hash name → pick gradient pair → show initials
  // online = green dot at bottom-right
}
```

---

## 6. Dashboard

**Route:** `/dashboard`  
**File:** `src/routes/_app/dashboard.tsx` (592 lines)

### Layout
```html
<main class="ocm-page">
  <!-- Header with range selector -->
  <OpenCrmSectionHeader title="Dashboard" subtitle="..." actions={...} />

  <!-- 4 stat cards -->
  <div class="ocm-grid-4">
    <OpenCrmStatCard label="Chat masuk" value="123" delta="+12.5%" icon={<Inbox />} />
    <OpenCrmStatCard label="AI resolved" value="85.3%" delta="+5.2pp" />
    <OpenCrmStatCard label="Avg response" value="2.3s" delta="-1.2s" />
    <OpenCrmStatCard label="Revenue 7D" value="Rp 15,000,000" delta="+Rp 2,500,000" />
  </div>

  <!-- 2-column: Chat Volume + Sales Funnel -->
  <div class="ocm-grid-2">
    <section class="ocm-card">
      <div class="ocm-card-header">
        <h2 class="ocm-card-title">Chat Volume</h2>
        <div class="flex items-center gap-1 text-[11px]">
          <span class="ocm-tag">AI</span>
          <span class="ocm-tag">CS</span>
          <span class="ocm-tag">Handover</span>
        </div>
      </div>
      <div class="ocm-card-body space-y-3">
        <!-- Progress bars per day -->
        <div>
          <div class="mb-1 flex items-center justify-between text-xs">
            <span class="font-semibold">Senin</span>
            <span class="text-muted-foreground">145</span>
          </div>
          <div class="ocm-progress-track">
            <div class="ocm-progress-bar" style="width: 78%"></div>
          </div>
        </div>
      </div>
    </section>
    
    <section class="ocm-card">
      <!-- Sales funnel with step progression -->
    </section>
  </div>

  <!-- 2-column: Agent Performance Table + Alerts -->
  <div class="ocm-grid-2">
    <section class="ocm-card">
      <table class="ocm-table">
        <thead><tr><th>Agent</th><th>Chats</th><th>CSAT</th><th>Revenue</th></tr></thead>
        <tbody>
          <tr>
            <td>
              <div class="flex items-center gap-2">
                <OpenCrmAvatar name="Agent 1" online size={24} />
                <span>Agent 1</span>
              </div>
            </td>
            <td>45</td><td>4.8</td><td>Rp 5,000,000</td>
          </tr>
        </tbody>
      </table>
    </section>
    
    <section class="ocm-card">
      <!-- Operational alerts with color-coded borders -->
      <div class="rounded-lg border p-3 border-emerald-500/25 bg-emerald-500/10 text-emerald-500">
        <p class="font-semibold">Alert title</p>
        <p class="text-xs text-muted-foreground">Description</p>
      </div>
    </section>
  </div>
</main>
```

### Dashboard API
```ts
GET /api/metrics/dashboard?range=7d
→ Response: {
  cards: { incomingChats, aiResolvedRate, avgResponseSeconds, revenue },
  volume: [{ date, day, ai, cs, handover, total }],
  funnel: [{ label, value, pct }],
  agents: [{ id, name, chats, csat, revenue, online }],
  alerts: [{ id, tone, title, description }]
}
```

---

## 7. Flow Builder

**Route:** `/flows/:flowId`  
**File:** `src/routes/_app/flows/$flowId.tsx`

Uses React Flow (@xyflow/react v12) with dagre auto-layout.

### Key Components
- `components/flows/AINodeTypes.tsx` — Node type registration
- `components/flows/AINodes.tsx` — Custom node rendering
- `components/flows/AIConfigForm.tsx` — Node configuration sidebar

### Node Types
```
start → trigger (WhatsApp message received)
condition → branching (if/else)
ai_response → AI chatbot response
handover → Transfer to human agent
delay → Wait timer
action → Custom action (send message, update status)
end → Flow termination
```

### Flow Data Model
```json
{
  "nodes": [
    { "id": "1", "type": "start", "position": { "x": 0, "y": 0 }, "data": { "label": "New Message" } }
  ],
  "edges": [
    { "id": "e1-2", "source": "1", "target": "2" }
  ]
}
```

---
