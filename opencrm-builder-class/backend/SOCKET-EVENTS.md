# Socket.IO Event Contracts

Generated from backend emitters and frontend socket listeners on 2026-04-29.

## Connection Setup

### Backend

- File: `apps/backend/src/plugins/socket.ts`.
- Port: `SOCKET_PORT`, default `3011`.
- Path: `SOCKET_IO_PATH`, default `/socket.io`.
- Transport: `SOCKET_IO_TRANSPORTS`, default `websocket`.
- CORS: production domains + localhost ports + `FRONTEND_URL` + `SOCKET_IO_CORS_ORIGIN`.
- Redis adapter: `REDIS_URL`; worker/scheduler emits through `@socket.io/redis-emitter` fallback.
- Current plugin does not enforce socket handshake auth. Room membership is explicit via client events.

### Frontend

- File: `apps/frontend/src/lib/socket.ts`.
- URL: `VITE_SOCKET_URL`, default `http://localhost:3011`.
- Path: `VITE_SOCKET_PATH`, default `/socket.io`.
- Transport forced to `websocket` even if polling is configured.
- Auth object sends `token` and `appId`, but backend currently does not validate it in socket middleware.

## Rooms

| Room | Join trigger | Backend handler | Leave trigger |
|---|---|---|---|
| `app:{appId}` | client emits `join` with `{ appId }` | yes; resolves public app id to internal UUID too | no explicit leave; disconnect only |
| `account:{accountId}` | client emits `join:account` | yes | no explicit leave; disconnect only |
| `conversation:{conversationId}` | client emits `join:conversation` | yes | frontend emits `leave:conversation`, but backend handler is missing |

## Event Inventory

| Event | Server emits | Frontend listens/emits | Server source | Frontend source |
|---|---|---|---|---|
| `agent:presence` | no | yes | - | apps/frontend/src/lib/socket.ts<br>apps/frontend/src/routes/_app/team.tsx |
| `ai:suggestion` | no | yes | - | apps/frontend/src/lib/socket.ts<br>apps/frontend/src/routes/_app/conversations/$conversationId.tsx |
| `conversation:assigned` | yes | no | apps/backend/src/modules/conversation/service.ts | - |
| `conversation:created` | no | yes | - | apps/frontend/src/lib/socket.ts |
| `conversation:label_added` | yes | no | apps/backend/src/modules/label/service.ts | - |
| `conversation:label_removed` | yes | no | apps/backend/src/modules/label/service.ts | - |
| `conversation:read` | yes | no | apps/backend/src/modules/conversation/service.ts | - |
| `conversation:resolved` | yes | no | apps/backend/src/modules/conversation/service.ts | - |
| `conversation:status_changed` | yes | yes | apps/backend/src/modules/conversation/service.ts | apps/frontend/src/lib/socket.ts |
| `conversation:updated` | no | yes | - | apps/frontend/src/lib/socket.ts |
| `conversation:window_expired` | yes | no | apps/backend/src/workers/index.ts | - |
| `handover:queue_updated` | no | yes | - | apps/frontend/src/routes/_app/handover.tsx |
| `handover:request_approved` | yes | yes | apps/backend/src/modules/handover/service.ts | apps/frontend/src/routes/_app/handover.tsx |
| `handover:request_created` | yes | yes | apps/backend/src/modules/handover/service.ts | apps/frontend/src/routes/_app/handover.tsx |
| `handover:request_rejected` | yes | yes | apps/backend/src/modules/handover/service.ts | apps/frontend/src/routes/_app/handover.tsx |
| `join:conversation` | no | yes | - | apps/frontend/src/lib/socket.ts<br>apps/frontend/src/routes/_app/conversations/$conversationId.tsx |
| `leave:conversation` | no | yes | - | apps/frontend/src/lib/socket.ts<br>apps/frontend/src/routes/_app/conversations/$conversationId.tsx |
| `message:created` | yes | yes | apps/backend/src/modules/conversation/index.ts<br>apps/backend/src/modules/webhook/service.ts | apps/frontend/src/lib/socket.ts<br>apps/frontend/src/routes/_app/chat.tsx<br>apps/frontend/src/routes/_app/conversations/$conversationId.tsx |
| `message:status_updated` | yes | no | apps/backend/src/modules/webhook/service.ts | - |

## Implemented Server → Client Contracts

### `message:created`

Rooms: `app:{appId}`, `conversation:{conversationId}` for inbound webhooks; currently `app:{appId}` only for outgoing agent message route.

```ts
type MessageCreated = {
  message: {
    id: string
    external_id: string | null
    content: unknown
    message_type: string
    content_type: string
    content_attributes: Record<string, unknown>
    extras: Record<string, unknown>
    status: string
    sender_type: string
    sender_id: string | null
    created_at: string | Date
    reply_to_message_id: string | null
    unique_temp_id?: string | null
  }
  conversation: {
    id: string
    app_id: string | null
    channel_type: 'whatsapp' | 'instagram' | 'tiktok' | string
    status: string
    channel_name?: string | null
    channel_badge_url?: string | null
    contacts?: unknown
  }
}
```

### `message:status_updated`

Rooms: `app:{appId}` if app exists, plus `conversation:{conversationId}`.

```ts
type MessageStatusUpdated = {
  message_id: string
  external_id: string | null
  conversation_id: string
  app_id: string | null
  status: string
  status_at: string
}
```

### `conversation:status_changed` / `conversation:resolved`

Rooms: `app:{appId}`, `conversation:{conversationId}`.

```ts
type ConversationStatusEvent = {
  conversationId: string
  status: string
}
```

### `conversation:assigned` / `conversation:read`

Rooms: `app:{appId}`, `conversation:{conversationId}`.

```ts
type ConversationAssigned = { conversationId: string; agentId: string }
type ConversationRead = { conversationId: string }
```

### `conversation:label_added` / `conversation:label_removed`

Rooms: `app:{appId}`, `conversation:{conversationId}`.

```ts
type ConversationLabelEvent = {
  conversationId: string
  labelId: string
}
```

### `conversation:window_expired`

Rooms: `app:{appId}`, `conversation:{conversationId}`. Emitted by worker through Redis emitter fallback.

```ts
type ConversationWindowExpired = { conversationId: string }
```

### `handover:request_created` / `handover:request_approved` / `handover:request_rejected`

Room: `app:{appId}`.

```ts
type HandoverRequestCreated = {
  requestId: string
  conversationId: string
  status: 'pending' | string
}
type HandoverRequestDecision = {
  requestId: string
  conversationId: string
}
```


## Declared But Not Emitted By Backend

Frontend helper/listener exists, but no backend emitter found in `apps/backend/src`:

- `conversation:created`
- `conversation:updated`
- `ai:suggestion`
- `agent:presence`
- `handover:queue_updated`

Rebuild note: either implement these emitters or remove UI expectations. Current live chat refresh mainly depends on `message:created` plus API reloads.
