# Blueprint — dashboard

**Route:** `/_app/dashboard`
**Source:** `apps/frontend/src/routes/_app/dashboard.tsx`
**Lines:** 592 | **Size:** 16KB
**API:** `metrics.getDashboard(range)`

## Fungsi
Main KPI dashboard — overview performa bisnis dan tim CS.

## Layout
```
┌────────────────────────────────────────────────┐
│ Header: "Dashboard" + Range selector + Refresh │
├────────────────────────────────────────────────┤
│ [Chat masuk] [AI resolved] [Avg response] [Revenue] │  ← 4 stat cards
├──────────────────────┬─────────────────────────┤
│ Chat Volume          │ Funnel Penjualan        │
│ (bar chart per day)  │ (drop % per step)       │
├──────────────────────┬─────────────────────────┤
│ CS Performance Table │ Operational Alerts       │
│ (Agent, Chats, CSAT) │ (success/warning/danger) │
└──────────────────────┴─────────────────────────┘
```

## Data model
```ts
type DashboardRange = 'today' | '7d' | '30d'

type DashboardUiData = {
  cards: {
    incomingChats: MetricValue
    aiResolvedRate: MetricValue     // target 75%
    avgResponseSeconds: MetricValue
    revenue: MetricValue            // Rupiah
  }
  volume: Array<{ date, day, ai, cs, handover, total }>
  funnel: Array<{ label, value, pct }>
  agents: Array<{ id, name, chats, csat, revenue, online }>
  alerts: Array<{ id, tone, title, description }>
}
```

## Key behaviors
- Range selector: today / 7d / 30d → re-fetch
- Context guard: `syncOrganizationContextFromSession()` → redirect if needed
- Indonesian locale formatting (`id-ID`), Rupiah currency
- Delta color: green=positive, red=negative; response time inverse

## Components
- `OpenCrmSectionHeader`, `OpenCrmStatCard`, `OpenCrmAvatar`
- CSS: `ocm-page`, `ocm-grid-4`, `ocm-grid-2`, `ocm-card`, `ocm-progress-track`, `ocm-table`
