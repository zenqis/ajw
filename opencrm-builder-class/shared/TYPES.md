# Shared Types — OpenCRM

Generated from Prisma schema, Elysia models, and frontend API client on 2026-04-29. This is the rebuild contract for data shapes shared across backend, frontend, Socket.IO, and business webhooks.

## Source Files

| Layer | Source |
|---|---|
| Database types | `apps/backend/prisma/schema.prisma` |
| Elysia request/response schemas | `apps/backend/src/modules/*/model.ts` |
| Frontend API wrappers | `apps/frontend/src/lib/api.ts`, `apps/frontend/src/lib/organization.ts` |
| Eden Treaty type source | `apps/frontend/src/lib/server.ts`, backend export `apps/backend/src/index.ts` |

## Response Envelopes

| Pattern | Shape | Usage |
|---|---|---|
| Data envelope | `{ data: T }` | most read/write routes |
| Payload envelope | `{ success: true, payload: T }` | teams, handover, tickets, labels, settings |
| Boolean success | `{ success: true }` | deletes and side-effect acknowledgements |
| Error | `{ error: string, code?: string, follow_up_url?: string }` | API failures; frontend helper reads nested `error.message` too |
| Pagination | `{ data: T[], total, page, limit }` or module-specific `pagination` object | list endpoints |

Frontend helper type:

```ts
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  payload?: T
  error?: string
}
```

## Auth and Tenant Context

Every tenant-scoped request should carry at least one tenant context signal.

| Carrier | Header/cookie/local storage | Notes |
|---|---|---|
| User session | `Authorization: Bearer <token>` or Better Auth cookie | frontend stores `scalechat_token` and refresh token |
| Organization slug | `X-Org-Slug` | preferred new tenant context from URL/cookie |
| Legacy app id | `X-App-Id` | still sent during transition |
| Legacy app secret | `X-App-Secret` | optional compatibility auth |
| Developer API key | module-specific key auth | see developer key routes and `DEVELOPER_API_KEY_*` envs |

## Core String Enums

These are source-observed string unions. They are not Prisma enums unless future migrations add enum columns.

| Domain | Values |
|---|---|
| Conversation status | `open`, `pending`, `resolved`, `snoozed` |
| Conversation priority | free string; commonly `low`, `medium`, `high`, `urgent` |
| Channel type | `whatsapp`, `instagram`, `tiktok`, plus configured inbox channel strings |
| Sender type | `contact`, `agent`, `bot`, `system` |
| Message type | `incoming`, `outgoing`, `system` |
| Message content type | `text`, `image`, `video`, `audio`, `document`, `interactive`, `button`, `template` |
| Message status | `pending`, `sent`, `delivered`, `read`, `failed` |
| Handover status | `pending`, `approved`, `rejected` |
| Agent roster status | `online`, `offline`, `break` |
| Flow runtime status | `idle`, `running`, `completed`, `error`, `waiting_button` |
| Broadcast status | `draft`, `scheduled`, `sending`, `completed`, `failed`, mapper also supports `cancelled` |
| Knowledge source status | `pending`, `extracting`, `chunking`, `embedding`, `ready`, `failed`, `archived` |
| Knowledge ingestion job status | `pending`, `running`, `completed`, `failed` |
| Commerce journey phase | `cart`, `checkout`, `payment_pending`, `paid`, `cancelled`, `expired` |
| Order status | `pending`, `completed`, `cancelled`, `expired` |
| Invoice status | `NOT_PAID`, `PAID`, `CANCELLED`, `EXPIRED` |
| Stock reservation status | `active`, `released`, `finalized` |

## Prisma Model Snapshots

Only shared/high-traffic fields are listed; schema remains source of truth.

| Model | Fields |
|---|---|
| `users` | `id: String`<br>`account_id: String?`<br>`name: String`<br>`email: String`<br>`emailVerified: Boolean`<br>`password: String?`<br>`role: String?`<br>`avatar_url: String?`<br>`active: Boolean?`<br>`phone_number: String?`<br>`custom_attributes: Json?`<br>`created_at: DateTime?`<br>`updated_at: DateTime?`<br>`app_id: String?`<br>`last_login_at: DateTime?`<br>`last_app_used: String?`<br>`refresh_token: String?`<br>`timezone: String?`<br>`timezone_auto_detected: Boolean?`<br>`timezone_updated_at: DateTime?`<br>`deleted_at: DateTime?`<br>`message_signature: String?`<br>`ui_settings: Json?`<br>`pubsub_token: String?` |
| `contacts` | `id: String`<br>`account_id: String?`<br>`name: String?`<br>`email: String?`<br>`phone_number: String?`<br>`avatar_url: String?`<br>`identifier: String?`<br>`channel_type: String?`<br>`metadata: Json?`<br>`additional_attributes: Json?`<br>`created_at: DateTime?`<br>`updated_at: DateTime?`<br>`app_id: String?`<br>`badge_url: String?`<br>`deleted_at: DateTime?`<br>`whatsapp_id: String?`<br>`instagram_id: String?`<br>`tiktok_id: String?`<br>`instagram_igsid: String?`<br>`first_contact_at: DateTime?`<br>`last_inbound_message_at: DateTime?`<br>`last_message_at: DateTime?`<br>`window_expires_at: DateTime?`<br>`consent_status: String?` |
| `inboxes` | `id: String`<br>`account_id: String?`<br>`name: String`<br>`channel_type: String?`<br>`channel_config: Json?`<br>`created_at: DateTime?`<br>`updated_at: DateTime?`<br>`app_id: String?`<br>`deleted_at: DateTime?`<br>`chatbot_id: String?`<br>`is_active: Boolean?`<br>`auto_assign_enabled: Boolean?`<br>`greeting_enabled: Boolean?`<br>`greeting_message: String?`<br>`business_hours: Json?`<br>`enable_auto_assignment: Boolean?`<br>`out_of_office_message: String?`<br>`csat_survey_enabled: Boolean?`<br>`allow_messages_after_resolved: Boolean?`<br>`lock_to_single_conversation: Boolean?`<br>`sender_name_type: String?`<br>`portal_id: String?`<br>`conversations: conversations[]`<br>`accounts: accounts?` |
| `whatsapp_channels` | `id: String`<br>`inbox_id: String?`<br>`phone_number: String?`<br>`phone_number_id: String?`<br>`api_key: String?`<br>`waba_id: String?`<br>`created_at: DateTime?`<br>`name: String?`<br>`display_phone_number: String?`<br>`verified_name: String?`<br>`quality_rating: String?`<br>`messaging_limit_tier: String?`<br>`code_verification_status: String?`<br>`platform_type: String?`<br>`throughput_level: String?`<br>`profile_picture_url: String?`<br>`about: String?`<br>`address: String?`<br>`description: String?`<br>`email: String?`<br>`websites: Json?`<br>`vertical: String?`<br>`messaging_product: String?`<br>`waba_name: String?` |
| `conversations` | `id: String`<br>`account_id: String?`<br>`inbox_id: String?`<br>`contact_id: String?`<br>`channel_type: String?`<br>`assignee_id: String?`<br>`team_id: String?`<br>`status: String?`<br>`unread_count: Int?`<br>`priority: String?`<br>`snoozed_until: DateTime?`<br>`waiting_since: DateTime?`<br>`last_message_at: DateTime?`<br>`custom_attributes: Json?`<br>`created_at: DateTime?`<br>`updated_at: DateTime?`<br>`app_id: String?`<br>`deleted_at: DateTime?`<br>`first_reply_at: DateTime?`<br>`resolved_at: DateTime?`<br>`sla_breach_at: DateTime?`<br>`pipeline_id: String?`<br>`stage_id: String?`<br>`tags: Json?` |
| `messages` | `id: String`<br>`conversation_id: String?`<br>`message_type: String`<br>`content: String?`<br>`content_attributes: Json?`<br>`content_type: String?`<br>`sender_id: String?`<br>`sender_type: String?`<br>`private: Boolean?`<br>`status: String?`<br>`external_id: String?`<br>`metadata: Json?`<br>`created_at: DateTime?`<br>`app_id: String?`<br>`deleted_at: DateTime?`<br>`type: String?`<br>`extras: Json?`<br>`context: Json?`<br>`error: Json?`<br>`raw_payload: Json?`<br>`is_deleted: Boolean?`<br>`updated_at: DateTime?`<br>`reply_to_message_id: String?`<br>`unique_temp_id: String?` |
| `chatbots` | `id: String`<br>`app_id: String`<br>`name: String`<br>`description: String?`<br>`model: String?`<br>`prompt: String?`<br>`welcome_msg: String?`<br>`agent_transfer: String?`<br>`temperature: Decimal?`<br>`history_limit: Int?`<br>`context_limit: Int?`<br>`message_await: Int?`<br>`message_limit: Int?`<br>`is_silent_handoff_agent: Boolean?`<br>`watcher_enabled: Boolean?`<br>`session_only_memory: Boolean?`<br>`plugin_type: String?`<br>`plugin_data: Json?`<br>`is_hidden: Boolean?`<br>`is_deleted: Boolean?`<br>`created_at: DateTime?`<br>`updated_at: DateTime?`<br>`timezone: String?`<br>`label_condition: String?` |
| `automation_flows` | `id: String`<br>`app_id: String`<br>`name: String`<br>`description: String?`<br>`nodes: Json?`<br>`edges: Json?`<br>`active: Boolean?`<br>`created_at: DateTime?`<br>`updated_at: DateTime?`<br>`apps: apps` |
| `knowledge_sources` | `id: String`<br>`title: String`<br>`content: String?`<br>`type: String?`<br>`format: String?`<br>`metadata: Json?`<br>`created_at: DateTime?`<br>`app_id: String?`<br>`chatbot_id: String?`<br>`category_id: String?`<br>`source_type: String?`<br>`source_url: String?`<br>`file_name: String?`<br>`file_size: Int?`<br>`file_type: String?`<br>`status: String?`<br>`error_message: String?`<br>`chunk_count: Int?`<br>`embedding_model: String?`<br>`embedding_dimension: Int?`<br>`index_size_bytes: BigInt?`<br>`hit_count: Int?`<br>`last_hit_at: DateTime?`<br>`active_version: Int?` |
| `handover_requests` | `id: String`<br>`app_id: String`<br>`conversation_id: String`<br>`request_type: String`<br>`requested_by: String?`<br>`target_agent_id: String?`<br>`status: String`<br>`request_note: String?`<br>`approval_note: String?`<br>`approved_by: String?`<br>`approved_at: DateTime?`<br>`rejected_by: String?`<br>`rejected_at: DateTime?`<br>`source_rule_id: String?`<br>`ai_reason: String?`<br>`ai_intent: String?`<br>`sla_due_at: DateTime?`<br>`created_at: DateTime?`<br>`updated_at: DateTime?`<br>`auto_assign_rules: auto_assign_rules?`<br>`apps: apps` |
| `broadcasts` | `id: String`<br>`account_id: String?`<br>`title: String`<br>`message_type: String?`<br>`message_content: String?`<br>`template_params: Json?`<br>`target_audience: Json?`<br>`status: String?`<br>`scheduled_at: DateTime?`<br>`total_recipients: Int?`<br>`success_count: Int?`<br>`failed_count: Int?`<br>`created_at: DateTime?`<br>`updated_at: DateTime?`<br>`app_id: String?`<br>`deleted_at: DateTime?`<br>`broadcast_logs: broadcast_logs[]`<br>`accounts: accounts?` |
| `products` | `id: String`<br>`app_id: String`<br>`organization_id: String?`<br>`name: String`<br>`sku: String?`<br>`image_url: String?`<br>`description: String?`<br>`base_price: Decimal?`<br>`is_active: Boolean?`<br>`metadata: Json?`<br>`created_at: DateTime?`<br>`updated_at: DateTime?` |
| `product_variants` | `id: String`<br>`product_id: String`<br>`app_id: String`<br>`organization_id: String?`<br>`name: String`<br>`sku: String?`<br>`image_url: String?`<br>`attributes: Json?`<br>`price: Decimal?`<br>`stock_on_hand: Int?`<br>`stock_reserved: Int?`<br>`is_active: Boolean?`<br>`created_at: DateTime?`<br>`updated_at: DateTime?` |
| `orders` | `id: String`<br>`organization_id: String?`<br>`app_id: String?`<br>`contact_id: String?`<br>`conversation_id: String?`<br>`order_number: BigInt`<br>`order_status: String?`<br>`payment_type: String?`<br>`payment_method: String?`<br>`payment_provider: String?`<br>`journey_phase: String?`<br>`currency: String?`<br>`external_order_id: String?`<br>`notes: String?`<br>`address: String?`<br>`subtotal: Decimal?`<br>`discount: Decimal?`<br>`shipping_fee: Decimal?`<br>`grand_total: Decimal?`<br>`checkout_at: DateTime?`<br>`paid_at: DateTime?`<br>`cancelled_at: DateTime?`<br>`expired_at: DateTime?`<br>`metadata: Json?` |
| `order_invoices` | `id: String`<br>`order_id: String`<br>`amount: Decimal?`<br>`status: String?`<br>`provider: String?`<br>`provider_invoice_id: String?`<br>`payment_method: String?`<br>`payment_number: String?`<br>`payment_link: String?`<br>`checkout_url: String?`<br>`pdf_link: String?`<br>`public_token: String?`<br>`public_expires_at: DateTime?`<br>`paid_at: DateTime?`<br>`verified_at: DateTime?`<br>`expiry_date: DateTime?`<br>`provider_payload: Json?`<br>`xendit_invoice_id: String?`<br>`created_at: DateTime?` |

## Elysia Module Models

### Conversation

```ts
type Conversation = {
  id: string
  contact_id: string
  inbox_id: string
  status: string
  priority: string | null
  assigned_agent_id: string | null
  last_message_at: Date | null
  unread_count: number
  created_at: Date | null
}

type ConversationUpdateStatusRequest = {
  status: 'open' | 'resolved' | 'pending' | 'snoozed'
}

type ConversationAssignRequest = { agentId: string }
```

### Message

```ts
type Message = {
  id: string
  conversation_id: string
  sender_type: string
  sender_id: string | null
  content: string | null
  content_type: string
  external_id: string | null
  status: string | null
  created_at: Date | null
}

type SendMessageRequest = {
  conversationId: string
  content: string
  contentType?: string
  mediaIds?: string[]
}
```

### Flow

```ts
type Flow = {
  id: string
  app_id: string
  name: string
  description: string | null
  nodes: unknown
  edges: unknown
  active: boolean | null
  created_at: Date | null
  updated_at: Date | null
}
```

## Frontend API Types

The following exported interfaces are currently used by route/page API wrappers:

```ts
export interface Organization {
	id: string
	name: string
	slug: string
	logo?: string
	metadata?: Record<string, any>
	createdAt: string
	updatedAt: string
	appId?: string
}

export interface Member {
	id: string
	organizationId: string
	userId: string
	role: 'owner' | 'admin' | 'member'
	createdAt: string
	updatedAt: string
	user?: {
		id: string
		name: string
		email: string
		avatar_url?: string
	}
}

export interface Invitation {
	id: string
	organizationId: string
	email: string
	role: string
	status: 'pending' | 'accepted' | 'rejected' | 'canceled'
	expiresAt: string
	invitedById: string
	createdAt: string
}

export interface ApiResponse<T = any> {
	success: boolean
	data?: T
	payload?: T
	error?: string
}

export interface ConversationContactDetailResponse {
	conversation: {
		id: string
		contact_id: string | null
		pipeline_id: string | null
		stage_id: string | null
		status: string | null
		channel_type: string | null
	}
	customer: {
		id: string | null
		name: string | null
		email: string | null
		phone_number: string | null
		avatar_url: string | null
		is_vip: boolean
		repeat_orders: number
		lifetime_value: number
	} | null
	badges: {
		vip: boolean
		repeat_orders: number
		lifetime_value: number
	}
	ai_summary: {
		text: string
		source: 'context' | 'heuristic'
		updated_at: string
	}
	live_signals: {
		sentiment: ContactDetailSignal
		intent: ContactDetailSignal
		buying_stage: ContactDetailSignal
		churn_risk: ContactDetailSignal & {
			percent: number
		}
	}
	open_cart: Record<string, unknown> | null
	order_history: Record<string, unknown>[]
	tags: Record<string, unknown>[]
	notes: Record<string, unknown>[]
	payment_methods: Array<{
		id: string
		label: string
		provider?: string
	}>
	backend_notes: string[]
}

export interface Team {
	id: string
	name: string
	description?: string
	allow_auto_assign: boolean
	created_at: string
	members?: TeamMember[]
}

export interface TeamMember {
	id: string
	name: string
	email: string
	role: string
	active: boolean
	joined_at: string
}

export interface TicketStage {
	id: string
	name: string
	color: string
	stage_order: number
}

export interface TicketBoard {
	id: string
	board_name: string
	is_default: boolean
	created_at: string | null
	statuses: TicketStage[]
}

export interface TicketCard {
	conversation_id: string
	board_id: string
	stage_id: string | null
	stage_name?: string | null
	contact_name: string
	contact_phone: string | null
	last_message: string | null
	conversation_status: string | null
	deal_value: number
	created_at: string | null
	updated_at: string | null
}

export interface TicketsBoardResponse {
	view: 'kanban' | 'list'
	board: {
		id: string
		board_name: string
	} | null
	pagination: {
		page: number
		limit: number
		total: number
	}
	columns: TicketKanbanColumn[]
	items: TicketListItem[]
}

export interface HandoverQueueItem {
	id: string
	conversationId: string
	contactName: string
	contactPhone: string
	contactAvatar?: string
	preview: string
	reason: string
	intent: string
	aiConfidence: number
	waitingSeconds: number
	priority: 'urgent' | 'high' | 'medium'
	suggestedAgentId?: string
	suggestedAgentName?: string
	approvalState: 'pending' | 'approved' | 'rejected'
	slaDueAt?: string
	sourceRuleId?: string
	createdAt: string
}

export interface HandoverRuleItem {
	id: string
	name: string
	conditions: Record<string, unknown>
	action: string
	isActive: boolean
	triggered7d: number
	priority: number
	ruleType: string
}

export interface AgentRosterItem {
	id: string
	name: string
	email: string
	avatarUrl?: string
	role: string
	status: 'online' | 'offline' | 'break'
	activeChats: number
	capacity: number
	skills: string[]
}

export interface HandoverAnalytics {
	handoverRate: number
	avgWaitTimeSeconds: number
	slaCompliance: number
	csatPostHandover: number
	period: string
	totalRequests: number
	approvedRequests: number
	rejectedRequests: number
	pendingRequests: number
}

export type VariantDraft = {
	id?: string
	name: string
	sku: string
	image_url?: string
	price: number
	stock_on_hand?: number
	is_active: boolean
	attributes?: Record<string, unknown>
}

export type BulkVariantUpsertPayload = {
	upserts: VariantDraft[]
	deactivate_variant_ids?: string[]
}

export type StockMovementRow = {
	id: string
	variant_id: string
	product_id: string | null
	product_name: string
	product_sku: string | null
	variant_name: string
	sku: string | null
	movement_type: string
	quantity: number
	stock_before: number
	stock_after: number
	note: string | null
	order_id: string | null
	created_at: string | null
}
```

## Realtime Payload Types

Socket.IO event contracts are documented in `docs/backend/SOCKET-EVENTS.md`. Minimal shared payloads:

```ts
type MessageCreatedEvent = {
  message: {
    id: string
    external_id: string | null
    content: string | null
    message_type: string | null
    content_type: string | null
    content_attributes: Record<string, unknown>
    extras: Record<string, unknown>
    status: string | null
    sender_type: string | null
    sender_id: string | null
    created_at: string | Date | null
    reply_to_message_id?: string | null
    unique_temp_id?: string | null
  }
  conversation: {
    id: string
    app_id: string | null
    channel_type: string | null
    status: string | null
    channel_name?: string | null
    contacts?: unknown
  }
}

type ConversationStatusEvent = {
  conversationId: string
  status: string
}

type MessageStatusUpdatedEvent = {
  message_id: string
  external_id: string | null
  conversation_id: string
  app_id: string | null
  status: 'sent' | 'delivered' | 'read' | 'failed'
  status_at: string
}
```

## Business Webhook Payload Hints

Internal dispatches use event names like:

| Event | Trigger |
|---|---|
| `conversation.created` | inbound message created a new lead/thread |
| `conversation.handled_by_updated` | assignee changed |
| `message.received` | inbound channel message stored |
| `message.sent` | outbound worker delivered request to channel provider |
| `order.payment_link_sent` | Pakasir payment link sent |
| `order.payment_paid` / payment success variants | Pakasir paid webhook confirmed invoice |

A rebuild should preserve event names and include tenant fields `app_id`, `inbox_id`, `conversation.id`, and provider references wherever available.

## Type Hygiene Rules

- Treat database IDs as UUID strings unless the field is legacy public `apps.app_id` or slug.
- Treat timestamps from API responses as ISO strings on frontend, even if backend Elysia model says `Date`.
- Use `Decimal`/number carefully for currency fields; DB uses decimal precision while frontend usually receives JSON numbers/strings depending Prisma serialization.
- Do not rely on Prisma enum generation; most status fields are strings with source-level normalization.
