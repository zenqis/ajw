# Blueprint — team

**Route:** `/_app/team` (redirects to `/settings?tab=teams`)
**Source:** `apps/frontend/src/routes/_app/team.tsx`
**Lines:** 2452 | **Size:** 74KB (largest page)
**Exported:** `AgentsManagementPage` (reused in settings)

## Fungsi
Full team management — agents, supervisors, divisions, teams, settings.

## Tabs: [Agents] [Supervisors] [Divisions] [Teams] [Settings]

## Agent data model
```ts
interface Agent {
  id: string; name: string; email: string; phone_number?: string
  role: 'admin' | 'agent' | 'supervisor'
  active: boolean; status?: 'online' | 'offline' | 'busy' | 'away'
  divisions: Array<{ id, name, color }>
  channels: string[]; supervisor?: { id, name }
  created_at: string
}
```

## Key behaviors
- Real-time presence: Socket.IO `agent:presence` → live status dot
- Table: sort any column, toggle visibility, select rows, paginate, search
- CSV export: `escapeCsvValue()` for proper quoting
- Login link: `agentsManagement.getLoginLink()` → clipboard + localStorage cache
- Channel icons: custom SVGs (WhatsApp, Instagram, TikTok, Messenger)
- Route redirect: `beforeLoad` → `/settings?tab=teams`

## API: `agentsManagement.list/create/update/delete`, `agentsManagement.divisions.list()`, `teamsApi.list/create`
## Components: `DivisionManagement`, `AgentSettings`, `PageHeader`, `Button`, `Checkbox`, `DropdownMenu`
