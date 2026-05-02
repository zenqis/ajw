# Blueprint — Auth Module

## Objective
Authentication, registration, session management, organization creation, onboarding, and API key auth resolution.

## Responsibilities
- Email/password login via Better Auth
- Session management (7-day expiry, daily renewal)
- Organization creation + onboarding flow
- User profile update (name, timezone)
- Auth context resolution for API calls
- Organization member management
- Token refresh flow

## File structure
```
modules/auth/
  index.ts (619 lines)
```

### File descriptions
- **`index.ts`** — Elysia route plugin. Registers all HTTP endpoints under `/auth`. 619 lines.

## Route prefix
`/auth`

## Key tables
- `session`
- `account`
- `verification`
- `organization`
- `member`
- `invitation`
- `users`

## Implementation status
### Selesai
- [x] Module structure (index.ts + service + model) — total 619 lines
- [x] Route registration under `/auth`
- [x] Multi-tenant isolation via `app_id` context


### Belum / pending
- Tidak ada item pending untuk modul ini.
