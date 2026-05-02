# Blueprint — settings

**Route:** `/_app/settings`
**Source:** `apps/frontend/src/routes/_app/settings.tsx`
**Lines:** 1194 | **Size:** 40KB

## Fungsi
Multi-tab settings hub. Tab persisted via URL `?tab=`.

## Tabs → Components
| Tab | Component |
|-----|-----------|
| `general` | Inline (profile, dark mode, compact mode) |
| `ai-models` | `<AIConfigurationManager />` |
| `pakasir` | `<PakasirSettingsManager />` |
| `labels` | Inline (label CRUD + color picker) |
| `ai-personas` | `<AIAgentPersonaManager />` + `<CustomerLevelAgentMappingManager />` |
| `whatsapp` | `<WhatsAppSettingsManager />` |
| `security` | Inline (change password) |
| `notifications` | Inline (sound + browser notification toggles) |
| `localization` | Inline (timezone, language) |
| `developer` | Inline (link to /developers) |
| `teams` | `<AgentsManagementPage />` (from team.tsx) |

## Key behaviors
- URL sync: `?tab=X` → `window.history.replaceState()`
- Theme toggle: `next-themes` + animated circular reveal (`animateThemeChange()`)
- Labels: direct `fetch()` calls to `/api/labels`
