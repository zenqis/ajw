# API Contracts — Backend Endpoints

Generated from Elysia route objects on 2026-04-29. Source: `apps/backend/src/index.ts` plus mounted `apps/backend/src/modules/*/index.ts`.

## Contract Rules

- Base API URL: `VITE_API_URL` or `http://localhost:3010`.
- Main surface: `/api/*`.
- Mirror surface: `/api/v1/*` for most modules.
- Better Auth surface: `/auth/*` mounted at backend root; frontend login/register call this root surface, not `/api/auth/*`.
- Tenant context resolved by `appContext`: `Authorization: Bearer <token>`, `X-Org-Slug`, legacy `X-App-Id`, optional `X-App-Secret`, or `X-Business-Id` for developer/API-tool routes.
- Elysia request schemas below are exact where route files define `body`, `query`, or `params`. Many responses have no formal Elysia response schema; those rows mark source-level response envelope used by handlers.

## Coverage Summary

| Surface | Count |
|---|---:|
| Root + Better Auth + `/api` | 298 |
| `/api/v1` mirror | 273 |
| Total documented route rows | 571 |

| Source tag | Route rows |
|---|---:|
| Admin | 4 |
| Advanced | 16 |
| AI | 48 |
| API | 8 |
| API Tools | 12 |
| API v1 | 1 |
| Authority | 10 |
| Better Auth | 3 |
| Broadcast | 14 |
| Business Webhooks | 8 |
| Chatbot | 26 |
| Commerce | 44 |
| Contact | 30 |
| Conversation | 48 |
| Core | 1 |
| CRM | 10 |
| Customer | 18 |
| Developer Keys | 2 |
| Flow | 30 |
| Handover | 22 |
| Inbox | 10 |
| Knowledge | 38 |
| Label | 14 |
| Media | 4 |
| Message | 14 |
| Orders | 6 |
| Team | 14 |
| Template Variables | 6 |
| User | 58 |
| WABA | 4 |
| Webhook | 12 |
| WhatsApp | 36 |

## Standard Envelopes

| Pattern | Shape | Notes |
|---|---|---|
| Data success | `{ data: T }` | Common for Eden/Treaty-backed modules. |
| Payload success | `{ success: true, payload: T }` | Compatibility routes and some queue/status APIs. |
| Message success | `{ message: 'success', data: T }` | Commerce/order routes. |
| Boolean success | `{ success: true }` | Deletes, webhook acknowledgement, side effects. |
| Error | `{ error: string, code?: string, message?: string }` | Status set on Elysia `set.status`. |
| Auth error | `401 { error: 'Unauthorized' }` | Routes requiring user/session or app context. |

## Canonical Routes

| Method | Path | Auth | Params | Query | Body | Response | Source |
|---|---|---|---|---|---|---|---|
| `POST` | `/auth/sign-in/email` | Public Better Auth | `-` | `-` | `{ email: string; password: string }` | `{ user, token?, redirect? } \| { error }` | Better Auth |
| `POST` | `/auth/sign-up/email` | Public Better Auth | `-` | `-` | `{ email: string; password: string; name?: string }` | `{ user, token?, redirect? } \| { error }` | Better Auth |
| `ALL` | `/auth/*` | Mixed Better Auth | `- ` | `- ` | `Better Auth endpoint-specific JSON` | `Better Auth session/user/error payload` | Better Auth |
| `GET` | `/health` | Public | `-` | `-` | `-` | `{ status, timestamp, version }` | Core |
| `POST` | `/api/auth/login` | Public legacy login | `-` | `-` | `{ email: string; password: string; app_id?: string }` | `{ success?, data?, token?, user?, error? }` | Authority |
| `GET` | `/api/auth/context` | Session cookie/Bearer | `-` | `-` | `-` | `{ success?, data?, token?, user?, error? }` | Authority |
| `POST` | `/api/auth/onboarding` | Session cookie/Bearer | `-` | `-` | `{ companyName: string; slug?: string }` | `{ success?, data?, token?, user?, error? }` | Authority |
| `GET` | `/api/auth/me` | Session cookie/Bearer | `-` | `-` | `-` | `{ success?, data?, token?, user?, error? }` | Authority |
| `POST` | `/api/auth/logout` | Session cookie/Bearer | `-` | `-` | `-` | `{ success?, data?, token?, user?, error? }` | Authority |
| `GET` | `/api/user/` | Session/Bearer + tenant context | `-` | `{ accountId: string }` | `-` | `any` | User |
| `GET` | `/api/user/:id` | Session/Bearer + tenant context | `{ id: string }` | `-` | `-` | `{ data\|payload\|success? } \| { error }` | User |
| `PATCH` | `/api/user/:id` | Session/Bearer + tenant context | `{ id: string }` | `-` | `{ name?: string; avatar_url?: string; phone?: string }` | `{ data\|payload\|success? } \| { error }` | User |
| `GET` | `/api/user/:id/presence` | Session/Bearer + tenant context | `{ id: string }` | `-` | `-` | `{ data\|payload\|success? } \| { error }` | User |
| `POST` | `/api/user/:id/presence` | Session/Bearer + tenant context | `{ id: string }` | `-` | `{ status: string }` | `{ data\|payload\|success? } \| { error }` | User |
| `GET` | `/api/user/timezone` | Session/Bearer + tenant context | `-` | `-` | `-` | `{ data\|payload\|success? } \| { error }` | User |
| `PUT` | `/api/user/timezone` | Session/Bearer + tenant context | `-` | `-` | `{ timezone: string }` | `{ data\|payload\|success? } \| { error }` | User |
| `POST` | `/api/user/timezone/detect` | Session/Bearer + tenant context | `-` | `-` | `{ detected_timezone?: string }` | `{ data\|payload\|success? } \| { error }` | User |
| `POST` | `/api/user/timezone/reset` | Session/Bearer + tenant context | `-` | `-` | `-` | `{ data\|payload\|success? } \| { error }` | User |
| `GET` | `/api/conversations/counts` | Session/Bearer + tenant context | `-` | `{ accountId?: string; appId?: string }` | `-` | `{ data\|payload\|success? } \| { error }` | Conversation |
| `GET` | `/api/conversations/` | Session/Bearer + tenant context | `-` | `{ accountId?: string; appId?: string; status?: string; inboxId?: string; agentId?: string; priority?: string; page?: string; limit?: string; dateFrom?: string; dateTo?: string; labelIds?: string; resolvedBy?: string; aiAgentId?: string; pipelineStageId?: string; channelType?: string }` | `-` | `{ data\|payload\|success? } \| { error }` | Conversation |
| `POST` | `/api/conversations/bulk-edit` | Session/Bearer + tenant context | `-` | `-` | `{ conversationIds: string[]; collaboratorIds?: string[]; handledById?: string; labelId?: string; pipelineStageId?: string; resolveStatus?: "open" \| "pending" \| "resolved" }` | `{ data\|payload\|success? } \| { error }` | Conversation |
| `GET` | `/api/conversations/bulk-edit/:jobId` | Session/Bearer + tenant context | `{ jobId: string }` | `-` | `-` | `{ data\|payload\|success? } \| { error }` | Conversation |
| `GET` | `/api/conversations/:id/contact-detail` | Session/Bearer + tenant context | `{ id: string }` | `-` | `-` | `{ data\|payload\|success? } \| { error }` | Conversation |
| `GET` | `/api/conversations/:id` | Session/Bearer + tenant context | `{ id: string }` | `-` | `-` | `{ data\|payload\|success? } \| { error }` | Conversation |
| `PATCH` | `/api/conversations/:id/status` | Session/Bearer + tenant context | `{ id: string }` | `-` | `{ status: string }` | `{ data\|payload\|success? } \| { error }` | Conversation |
| `POST` | `/api/conversations/:id/status` | Session/Bearer + tenant context | `{ id: string }` | `-` | `{ status: string }` | `{ data\|payload\|success? } \| { error }` | Conversation |
| `POST` | `/api/conversations/:id/resolve` | Session/Bearer + tenant context | `{ id: string }` | `-` | `-` | `{ data\|payload\|success? } \| { error }` | Conversation |
| `POST` | `/api/conversations/:id/assign` | Session/Bearer + tenant context | `{ id: string }` | `-` | `{ agentId: string }` | `{ data\|payload\|success? } \| { error }` | Conversation |
| `POST` | `/api/conversations/:id/takeover` | Session/Bearer + tenant context | `{ id: string }` | `-` | `{ agentId?: string; agent_id?: string }` | `{ data\|payload\|success? } \| { error }` | Conversation |
| `POST` | `/api/conversations/:id/read` | Session/Bearer + tenant context | `{ id: string }` | `-` | `-` | `{ data\|payload\|success? } \| { error }` | Conversation |
| `GET` | `/api/conversations/:id/messages` | Session/Bearer + tenant context | `{ id: string }` | `{ limit?: string; before?: string }` | `-` | `{ data\|payload\|success? } \| { error }` | Conversation |
| `POST` | `/api/conversations/:id/messages` | Session/Bearer + tenant context | `{ id: string }` | `-` | `{ content: any; senderId?: string; sender_type?: "agent" \| "system"; type?: string; content_type?: string; content_attributes?: {  }; media?: any; mediaIds?: string[]; unique_temp_id?: string; reply_to_message_id?: string }` | `{ data\|payload\|success? } \| { error }` | Conversation |
| `GET` | `/api/conversations/:id/labels` | Session/Bearer + tenant context | `{ id: string }` | `-` | `-` | `{ data\|payload\|success? } \| { error }` | Conversation |
| `POST` | `/api/conversations/:id/labels` | Session/Bearer + tenant context | `{ id: string }` | `-` | `{ labelId: string }` | `{ data\|payload\|success? } \| { error }` | Conversation |
| `DELETE` | `/api/conversations/:id/labels/:labelId` | Session/Bearer + tenant context | `{ id: string; labelId: string }` | `-` | `-` | `{ success } \| { error }` | Conversation |
| `GET` | `/api/conversations/:id/notes` | Session/Bearer + tenant context | `{ id: string }` | `-` | `-` | `{ data\|payload\|success? } \| { error }` | Conversation |
| `POST` | `/api/conversations/:id/notes` | Session/Bearer + tenant context | `{ id: string }` | `-` | `{ content: string }` | `{ data\|payload\|success? } \| { error }` | Conversation |
| `PATCH` | `/api/conversations/:id/notes/:noteId` | Session/Bearer + tenant context | `{ id: string; noteId: string }` | `-` | `{ content: string }` | `{ data\|payload\|success? } \| { error }` | Conversation |
| `GET` | `/api/conversations/:id/activity` | Session/Bearer + tenant context | `{ id: string }` | `-` | `-` | `{ data\|payload\|success? } \| { error }` | Conversation |
| `POST` | `/api/conversations/:id/agents` | Session/Bearer + tenant context | `{ id: string }` | `-` | `{ agentId?: string; agent_id?: string }` | `{ data\|payload\|success? } \| { error }` | Conversation |
| `GET` | `/api/conversations/:id/agents` | Session/Bearer + tenant context | `{ id: string }` | `-` | `-` | `{ data\|payload\|success? } \| { error }` | Conversation |
| `DELETE` | `/api/conversations/:id/agents/:agentId` | Session/Bearer + tenant context | `{ id: string; agentId: string }` | `-` | `-` | `{ success } \| { error }` | Conversation |
| `POST` | `/api/messages/` | Session/Bearer + tenant context | `-` | `-` | `{ conversationId: string; senderId?: string; content: string; contentType?: string; mediaIds?: string[] }` | `{ data\|payload\|success? } \| { error }` | Message |
| `GET` | `/api/messages/:id` | Session/Bearer + tenant context | `{ id: string }` | `-` | `-` | `{ data\|payload\|success? } \| { error }` | Message |
| `PATCH` | `/api/messages/:id/status` | Session/Bearer + tenant context | `{ id: string }` | `-` | `{ status: string; externalId?: string }` | `{ data\|payload\|success? } \| { error }` | Message |
| `DELETE` | `/api/messages/:id` | Session/Bearer + tenant context | `{ id: string }` | `-` | `-` | `{ success } \| { error }` | Message |
| `GET` | `/api/contacts/settings` | Session/Bearer + tenant context | `-` | `{ appId?: string }` | `-` | `{ data\|payload\|success? } \| { error }` | Contact |
| `POST` | `/api/contacts/settings/stages` | Session/Bearer + tenant context | `-` | `-` | `{ name: string; color?: string; isDefault?: boolean }` | `{ data\|payload\|success? } \| { error }` | Contact |
| `PATCH` | `/api/contacts/settings/stages/reorder` | Session/Bearer + tenant context | `-` | `-` | `{ stageIds: string[] }` | `{ data\|payload\|success? } \| { error }` | Contact |
| `PATCH` | `/api/contacts/settings/stages/:id` | Session/Bearer + tenant context | `{ id: string }` | `-` | `{ name?: string; color?: string; isDefault?: boolean }` | `{ data\|payload\|success? } \| { error }` | Contact |
| `DELETE` | `/api/contacts/settings/stages/:id` | Session/Bearer + tenant context | `{ id: string }` | `-` | `-` | `{ success } \| { error }` | Contact |
| `POST` | `/api/contacts/settings/fields` | Session/Bearer + tenant context | `-` | `-` | `{ fieldKey?: string; fieldLabel: string; fieldType: string; options?: any[]; isRequired?: boolean; isVisible?: boolean }` | `{ data\|payload\|success? } \| { error }` | Contact |
| `PATCH` | `/api/contacts/settings/fields/reorder` | Session/Bearer + tenant context | `-` | `-` | `{ fieldIds: string[] }` | `{ data\|payload\|success? } \| { error }` | Contact |
| `PATCH` | `/api/contacts/settings/fields/:id` | Session/Bearer + tenant context | `{ id: string }` | `-` | `{ fieldKey?: string; fieldLabel?: string; fieldType?: string; options?: any[]; isRequired?: boolean; isVisible?: boolean }` | `{ data\|payload\|success? } \| { error }` | Contact |
| `DELETE` | `/api/contacts/settings/fields/:id` | Session/Bearer + tenant context | `{ id: string }` | `-` | `-` | `{ success } \| { error }` | Contact |
| `GET` | `/api/contacts/` | Session/Bearer + tenant context | `-` | `{ appId?: string; accountId?: string; q?: string }` | `-` | `{ data\|payload\|success? } \| { error }` | Contact |
| `GET` | `/api/contacts/:id` | Session/Bearer + tenant context | `{ id: string }` | `-` | `-` | `{ data\|payload\|success? } \| { error }` | Contact |
| `POST` | `/api/contacts/` | Session/Bearer + tenant context | `-` | `-` | `{ accountId: string; appId?: string; name?: string; phone?: string; phone_number?: string; email?: string; avatarUrl?: string; avatar_url?: string; identifier?: string; customAttributes?: any }` | `{ data\|payload\|success? } \| { error }` | Contact |
| `PATCH` | `/api/contacts/:id` | Session/Bearer + tenant context | `{ id: string }` | `-` | `{ name?: string; phone?: string; phone_number?: string; email?: string; avatarUrl?: string; avatar_url?: string; customAttributes?: any }` | `{ data\|payload\|success? } \| { error }` | Contact |
| `DELETE` | `/api/contacts/:id` | Session/Bearer + tenant context | `{ id: string }` | `-` | `-` | `{ success } \| { error }` | Contact |
| `GET` | `/api/contacts/:id/conversations` | Session/Bearer + tenant context | `{ id: string }` | `-` | `-` | `{ data\|payload\|success? } \| { error }` | Contact |
| `GET` | `/api/customers/` | Session/Bearer + tenant context | `-` | `{ page?: string; per_page?: string; search?: string; q?: string; pipeline_stage_id?: string; consent_status?: string; tag_id?: string; channel?: string; sort?: string; order?: string }` | `-` | `{ data\|payload\|success? } \| { error }` | Customer |
| `GET` | `/api/customers/stats` | Session/Bearer + tenant context | `-` | `-` | `-` | `{ data\|payload\|success? } \| { error }` | Customer |
| `GET` | `/api/customers/levels/settings` | Session/Bearer + tenant context | `-` | `-` | `-` | `{ data\|payload\|success? } \| { error }` | Customer |
| `PUT` | `/api/customers/levels/settings` | Session/Bearer + tenant context | `-` | `-` | `{ vip?: string \| null; premium?: string \| null; basic?: string \| null }` | `{ data\|payload\|success? } \| { error }` | Customer |
| `GET` | `/api/customers/levels/preview` | Session/Bearer + tenant context | `-` | `{ limit?: string }` | `-` | `{ data\|payload\|success? } \| { error }` | Customer |
| `GET` | `/api/customers/:id` | Session/Bearer + tenant context | `{ id: string }` | `-` | `-` | `{ data\|payload\|success? } \| { error }` | Customer |
| `PUT` | `/api/customers/:id` | Session/Bearer + tenant context | `{ id: string }` | `-` | `{ name?: string; email?: string; phone_number?: string; notes?: string; lead_score?: number; pipeline_stage_id?: string; consent_status?: string; consent_purpose?: string; consent_source?: string; custom_attributes?: any }` | `{ data\|payload\|success? } \| { error }` | Customer |
| `POST` | `/api/customers/:id/tags` | Session/Bearer + tenant context | `{ id: string }` | `-` | `{ tag_id?: string; tag_name?: string }` | `{ data\|payload\|success? } \| { error }` | Customer |
| `DELETE` | `/api/customers/:id/tags/:tagId` | Session/Bearer + tenant context | `{ id: string; tagId: string }` | `-` | `-` | `{ success } \| { error }` | Customer |
| `GET` | `/api/whatsapp-channels/` | Session/Bearer + tenant context | `-` | `{ appId?: string; accountId?: string; search?: string }` | `-` | `{ data\|payload\|success? } \| { error }` | WhatsApp |
| `GET` | `/api/whatsapp-channels/:id/details` | Session/Bearer + tenant context | `{ id: string }` | `-` | `-` | `{ data\|payload\|success? } \| { error }` | WhatsApp |
| `POST` | `/api/whatsapp-channels/:id/badge` | Session/Bearer + tenant context | `{ id: string }` | `-` | `{ badge: string }` | `{ data\|payload\|success? } \| { error }` | WhatsApp |
| `DELETE` | `/api/whatsapp-channels/:id/badge` | Session/Bearer + tenant context | `{ id: string }` | `-` | `-` | `{ success } \| { error }` | WhatsApp |
| `GET` | `/api/whatsapp-channels/:id` | Session/Bearer + tenant context | `{ id: string }` | `-` | `-` | `{ data\|payload\|success? } \| { error }` | WhatsApp |
| `POST` | `/api/whatsapp-channels/` | Session/Bearer + tenant context | `-` | `-` | `{ name: string; phone_number: string; phone_number_id: string; waba_id: string; business_name?: string; inbox_id?: string; provider?: string; api_key?: string }` | `{ data\|payload\|success? } \| { error }` | WhatsApp |
| `PATCH` | `/api/whatsapp-channels/:id` | Session/Bearer + tenant context | `{ id: string }` | `-` | `{ name?: string; phone_number?: string; is_active?: boolean; business_name?: string; tags?: string[]; default_chatbot_id?: string \| null; default_flow_id?: string \| null; default_team_ids?: string[]; default_agent_ids?: string[]; distribution_method?: string }` | `{ data\|payload\|success? } \| { error }` | WhatsApp |
| `DELETE` | `/api/whatsapp-channels/:id` | Session/Bearer + tenant context | `{ id: string }` | `-` | `-` | `{ success } \| { error }` | WhatsApp |
| `POST` | `/api/whatsapp-channels/exchange-token` | Session/Bearer + tenant context | `-` | `-` | `{ code: string }` | `{ data\|payload\|success? } \| { error }` | WhatsApp |
| `POST` | `/api/whatsapp-channels/init-signup` | Session/Bearer + tenant context | `-` | `-` | `-` | `{ data\|payload\|success? } \| { error }` | WhatsApp |
| `GET` | `/api/waba/webhook-config` | Session/Bearer + tenant context | `-` | `-` | `-` | `{ data\|payload\|success? } \| { error }` | WABA |
| `POST` | `/api/waba/connect/manual` | Session/Bearer + tenant context | `-` | `-` | `{ accessToken: string; wabaId: string }` | `{ data\|payload\|success? } \| { error }` | WABA |
| `GET` | `/api/webhooks/whatsapp` | Public webhook token/signature | `-` | `{ hub.mode?: string; hub.verify_token?: string; hub.challenge?: string }` | `-` | `Meta challenge text \| 403` | Webhook |
| `GET` | `/api/webhooks/whatsapp/media/:messageId` | Public webhook token/signature | `{ messageId: string }` | `-` | `-` | `Meta challenge text \| 403` | Webhook |
| `POST` | `/api/webhooks/whatsapp` | Public webhook token/signature | `-` | `-` | `-` | `{ success }` | Webhook |
| `GET` | `/api/webhooks/` | Session/Bearer + tenant context | `-` | `{ accountId?: string }` | `-` | `{ data\|payload\|success? } \| { error }` | Webhook |
| `POST` | `/api/webhooks/` | Session/Bearer + tenant context | `-` | `{ accountId?: string }` | `{ url: string; name?: string; events?: string[] }` | `{ data\|payload\|success? } \| { error }` | Webhook |
| `DELETE` | `/api/webhooks/:id` | Session/Bearer + tenant context | `{ id: string }` | `-` | `-` | `{ success } \| { error }` | Webhook |
| `GET` | `/api/business_webhooks/` | App context or X-Business-Id | `-` | `{ business_id?: string }` | `-` | `{ data\|payload\|success? } \| { error }` | Business Webhooks |
| `POST` | `/api/business_webhooks/` | App context or X-Business-Id | `-` | `{ business_id?: string }` | `any` | `{ data\|payload\|success? } \| { error }` | Business Webhooks |
| `PATCH` | `/api/business_webhooks/:id` | App context or X-Business-Id | `{ id: string }` | `{ business_id?: string }` | `any` | `{ data\|payload\|success? } \| { error }` | Business Webhooks |
| `DELETE` | `/api/business_webhooks/:id` | App context or X-Business-Id | `{ id: string }` | `{ business_id?: string }` | `-` | `{ success } \| { error }` | Business Webhooks |
| `POST` | `/api/webhooks/pakasir/` | Public payment webhook | `-` | `-` | `any` | `{ data\|payload\|success? } \| { error }` | API |
| `POST` | `/api/media/upload` | Session/Bearer + tenant context | `-` | `-` | `{ file: string; platform?: string }` | `any` | Media |
| `GET` | `/api/media/gallery` | Session/Bearer + tenant context | `-` | `{ type?: string; take?: string; cursor?: string }` | `-` | `any` | Media |
| `GET` | `/api/ai/settings` | Session/Bearer + tenant context | `-` | `{ appId?: string }` | `-` | `{ data\|payload, success? } \| { error }` | AI |
| `PATCH` | `/api/ai/settings` | Session/Bearer + tenant context | `-` | `{ appId?: string }` | `{ ai_mode?: "assist" \| "hybrid" \| "auto" \| "off"; model_provider?: "growthcircle" \| "openai" \| "azure" \| "sumopod" \| "local"; model_name?: string; temperature?: number; max_tokens?: number; auto_reply_confidence?: number; handoff_keywords?: string[]; response_tone?: string; supported_languages?: string[]; auto_detect_language?: boolean; use_platform_credentials?: boolean; api_key?: string; api_endpoint?: string; api_version?: string; deployment_name?: string; system_prompt?: string; is_active?: boolean }` | `{ data\|payload, success? } \| { error }` | AI |
| `GET` | `/api/ai/providers` | Session/Bearer + tenant context | `-` | `-` | `-` | `{ data\|payload, success? } \| { error }` | AI |
| `PUT` | `/api/ai/providers/:provider` | Session/Bearer + tenant context | `{ provider: "growthcircle" \| "azure" \| "sumopod" }` | `-` | `{ base_url: string; api_key?: string; model_name?: string; api_version?: string; deployment_name?: string; temperature?: number; max_tokens?: number; default_protocol?: "openai" \| "anthropic"; channels?: { openai?: { base_url: string; path?: string; auth_header?: object \| object; auth_scheme?: object \| object }; anthropic?: { base_url: string; path?: string; auth_header?: object \| object; auth_scheme?: object \| object } }; models?: { id: string; name: string; vendor: string; context_window: string; max_output: string }[] }` | `{ data\|payload, success? } \| { error }` | AI |
| `POST` | `/api/ai/providers/:provider/test` | Session/Bearer + tenant context | `{ provider: "growthcircle" \| "azure" \| "sumopod" }` | `-` | `{ modelId?: string; message?: string; maxTokens?: number; protocol?: "openai" \| "anthropic"; apiKey?: string }` | `{ data\|payload, success? } \| { error }` | AI |
| `PATCH` | `/api/ai/providers/active` | Session/Bearer + tenant context | `-` | `-` | `{ provider: "growthcircle" \| "azure" \| "sumopod" }` | `{ data\|payload, success? } \| { error }` | AI |
| `PATCH` | `/api/ai/providers/embedding-active` | Session/Bearer + tenant context | `-` | `-` | `{ provider: "growthcircle" \| "azure" \| "sumopod" }` | `{ data\|payload, success? } \| { error }` | AI |
| `GET` | `/api/ai/playground` | Session/Bearer + tenant context | `-` | `{ appId?: string; sessionId?: string }` | `-` | `{ data\|payload, success? } \| { error }` | AI |
| `POST` | `/api/ai/playground/session` | Session/Bearer + tenant context | `-` | `{ appId?: string }` | `{ sessionId?: string; modelId?: string; strategyId?: string; personaId?: string }` | `{ data\|payload, success? } \| { error }` | AI |
| `POST` | `/api/ai/playground/strategy` | Session/Bearer + tenant context | `-` | `{ appId?: string }` | `{ label: string; description?: string; activate?: boolean; rules?: { name?: string; provider?: string; modelId?: string; minConfidence?: number; maxConfidence?: number }[] }` | `{ data\|payload, success? } \| { error }` | AI |
| `GET` | `/api/ai/playground/personas` | Session/Bearer + tenant context | `-` | `{ appId?: string }` | `-` | `{ data\|payload, success? } \| { error }` | AI |
| `POST` | `/api/ai/playground/personas` | Session/Bearer + tenant context | `-` | `{ appId?: string }` | `{ label: string; systemInstruction: string; agentType: "ai_sales" \| "ai_support" \| "ai_general"; setAsDefaultForType?: boolean; setAsGlobalDefault?: boolean }` | `{ data\|payload, success? } \| { error }` | AI |
| `PATCH` | `/api/ai/playground/personas/:personaId` | Session/Bearer + tenant context | `{ personaId: string }` | `{ appId?: string }` | `{ label?: string; systemInstruction?: string; agentType?: "ai_sales" \| "ai_support" \| "ai_general"; setAsDefaultForType?: boolean; setAsGlobalDefault?: boolean }` | `{ data\|payload, success? } \| { error }` | AI |
| `DELETE` | `/api/ai/playground/personas/:personaId` | Session/Bearer + tenant context | `{ personaId: string }` | `{ appId?: string }` | `-` | `{ success } \| { error }` | AI |
| `PATCH` | `/api/ai/playground/session/:sessionId` | Session/Bearer + tenant context | `{ sessionId: string }` | `{ appId?: string }` | `{ modelId?: string; strategyId?: string; personaId?: string }` | `{ data\|payload, success? } \| { error }` | AI |
| `POST` | `/api/ai/playground/run` | Session/Bearer + tenant context | `-` | `{ appId?: string }` | `{ sessionId: string; message: string; modelId?: string; strategyId?: string; personaId?: string; selectedSourceIds?: string[]; ragTopK?: number; enqueue?: boolean }` | `{ data\|payload, success? } \| { error }` | AI |
| `GET` | `/api/ai/playground/run/:jobId` | Session/Bearer + tenant context | `{ jobId: string }` | `{ appId?: string }` | `-` | `{ data\|payload, success? } \| { error }` | AI |
| `GET` | `/api/ai/suggest/:conversationId` | Session/Bearer + tenant context | `{ conversationId: string }` | `{ appId?: string }` | `-` | `{ data\|payload, success? } \| { error }` | AI |
| `POST` | `/api/ai/generate` | Session/Bearer + tenant context | `-` | `{ appId?: string }` | `{ message: string; conversationId?: string }` | `{ data\|payload, success? } \| { error }` | AI |
| `POST` | `/api/ai/evaluate` | Session/Bearer + tenant context | `-` | `{ appId?: string }` | `{ appId?: string; conversationId: string; score: number; feedback?: string }` | `{ data\|payload, success? } \| { error }` | AI |
| `GET` | `/api/ai_tools/` | App context or X-Business-Id | `-` | `{ business_id?: string }` | `-` | `{ data\|payload\|success? } \| { error }` | API Tools |
| `PUT` | `/api/ai_tools/` | App context or X-Business-Id | `-` | `{ business_id?: string }` | `any` | `{ data\|payload\|success? } \| { error }` | API Tools |
| `POST` | `/api/ai_tools/` | App context or X-Business-Id | `-` | `{ business_id?: string }` | `any` | `{ data\|payload\|success? } \| { error }` | API Tools |
| `POST` | `/api/ai_tools/execute` | App context or X-Business-Id | `-` | `{ business_id?: string }` | `any` | `{ data\|payload\|success? } \| { error }` | API Tools |
| `PATCH` | `/api/ai_tools/:id` | App context or X-Business-Id | `{ id: string }` | `{ business_id?: string }` | `any` | `{ data\|payload\|success? } \| { error }` | API Tools |
| `DELETE` | `/api/ai_tools/:id` | App context or X-Business-Id | `{ id: string }` | `{ business_id?: string }` | `-` | `{ success } \| { error }` | API Tools |
| `GET` | `/api/chatbots/` | Session/Bearer + tenant context | `-` | `-` | `-` | `{ data\|payload, success? } \| { error }` | Chatbot |
| `GET` | `/api/chatbots/default` | Session/Bearer + tenant context | `-` | `-` | `-` | `{ data\|payload, success? } \| { error }` | Chatbot |
| `GET` | `/api/chatbots/model-pricing` | Session/Bearer + tenant context | `-` | `-` | `-` | `{ data\|payload, success? } \| { error }` | Chatbot |
| `GET` | `/api/chatbots/:id` | Session/Bearer + tenant context | `{ id: string }` | `-` | `-` | `{ data\|payload, success? } \| { error }` | Chatbot |
| `POST` | `/api/chatbots/` | Session/Bearer + tenant context | `-` | `-` | `{ app_id?: string; name: string; description?: string; model?: string; prompt?: string; welcome_msg?: string; agent_transfer?: string; temperature?: number \| string; history_limit?: number \| string; context_limit?: number \| string; message_await?: number \| string; message_limit?: number \| string; max_file_read_window?: number \| string; is_silent_handoff_agent?: boolean \| string; watcher_enabled?: boolean \| string; session_only_memory?: boolean \| string; stop_after_handoff?: boolean \| string; usage_mode?: string; timezone?: string; label_condition?: string; selected_labels?: string[] \| string; app_data?: any; ai_followups?: any[] \| string; plugin_data?: any }` | `{ data\|payload, success? } \| { error }` | Chatbot |
| `PATCH` | `/api/chatbots/:id` | Session/Bearer + tenant context | `{ id: string }` | `-` | `{ app_id?: string; name?: string; description?: string; model?: string; prompt?: string; welcome_msg?: string; agent_transfer?: string; temperature?: number \| string; history_limit?: number \| string; context_limit?: number \| string; message_await?: number \| string; message_limit?: number \| string; max_file_read_window?: number \| string; is_silent_handoff_agent?: boolean \| string; watcher_enabled?: boolean \| string; session_only_memory?: boolean \| string; stop_after_handoff?: boolean \| string; usage_mode?: string; timezone?: string; label_condition?: string; selected_labels?: string[] \| string; app_data?: any; ai_followups?: any[] \| string; plugin_data?: any }` | `{ data\|payload, success? } \| { error }` | Chatbot |
| `PUT` | `/api/chatbots/:id` | Session/Bearer + tenant context | `{ id: string }` | `-` | `{ app_id?: string; name?: string; description?: string; model?: string; prompt?: string; welcome_msg?: string; agent_transfer?: string; temperature?: number \| string; history_limit?: number \| string; context_limit?: number \| string; message_await?: number \| string; message_limit?: number \| string; max_file_read_window?: number \| string; is_silent_handoff_agent?: boolean \| string; watcher_enabled?: boolean \| string; session_only_memory?: boolean \| string; stop_after_handoff?: boolean \| string; usage_mode?: string; timezone?: string; label_condition?: string; selected_labels?: string[] \| string; app_data?: any; ai_followups?: any[] \| string; plugin_data?: any }` | `{ data\|payload, success? } \| { error }` | Chatbot |
| `DELETE` | `/api/chatbots/:id` | Session/Bearer + tenant context | `{ id: string }` | `-` | `-` | `{ success } \| { error }` | Chatbot |
| `POST` | `/api/chatbots/:id/simulate` | Session/Bearer + tenant context | `{ id: string }` | `-` | `{ message?: string; history?: { role: string; content: string }[]; execute_tools?: boolean; ai_agent_id?: string; messages?: { id?: object \| object; message?: string; content?: string; role?: string; sent_by_type?: string; sent_by?: string; sent_by_name?: string; created_at?: string }[]; chat_data?: any; conversation_id?: string }` | `{ data\|payload, success? } \| { error }` | Chatbot |
| `GET` | `/api/chatbots/:id/documents` | Session/Bearer + tenant context | `{ id: string }` | `-` | `-` | `{ data\|payload, success? } \| { error }` | Chatbot |
| `POST` | `/api/chatbots/:id/documents` | Session/Bearer + tenant context | `{ id: string }` | `-` | `{ title: string; content: string; type?: string }` | `{ data\|payload, success? } \| { error }` | Chatbot |
| `PATCH` | `/api/chatbots/:id/documents/:docId` | Session/Bearer + tenant context | `{ id: string; docId: string }` | `-` | `{ title?: string; content?: string; type?: string; metadata?: any }` | `{ data\|payload, success? } \| { error }` | Chatbot |
| `DELETE` | `/api/chatbots/:id/documents/:docId` | Session/Bearer + tenant context | `{ id: string; docId: string }` | `-` | `-` | `{ success } \| { error }` | Chatbot |
| `GET` | `/api/knowledge/` | Session/Bearer + tenant context | `-` | `{ appId?: string; categoryId?: string; q?: string; limit?: string }` | `-` | `{ data\|payload, success? } \| { error }` | Knowledge |
| `POST` | `/api/knowledge/` | Session/Bearer + tenant context | `-` | `-` | `{ title: string; content?: string; type?: string; format?: string; embedding_model?: string; metadata?: any; source_type?: string; source_url?: string; file_name?: string; file_size?: number; file_type?: string; category_id?: string; files?: { file_name: string; mime_type?: string; file_size_bytes?: number; checksum_sha256?: string; storage_key?: string; storage_url?: string; language?: string; page_count?: number; duration_ms?: number; extraction_metadata?: any }[] }` | `{ data\|payload, success? } \| { error }` | Knowledge |
| `POST` | `/api/knowledge/query` | Session/Bearer + tenant context | `-` | `-` | `{ query: string; topK?: number; selectedSourceIds?: string[]; modelId?: string; provider?: string }` | `{ data\|payload, success? } \| { error }` | Knowledge |
| `GET` | `/api/knowledge/categories` | Session/Bearer + tenant context | `-` | `{ appId?: string }` | `-` | `{ data\|payload, success? } \| { error }` | Knowledge |
| `POST` | `/api/knowledge/categories` | Session/Bearer + tenant context | `-` | `-` | `{ name: string; description?: string; parent_id?: string }` | `{ data\|payload, success? } \| { error }` | Knowledge |
| `DELETE` | `/api/knowledge/categories/:id` | Session/Bearer + tenant context | `{ id: string }` | `-` | `-` | `{ success } \| { error }` | Knowledge |
| `GET` | `/api/knowledge/sources` | Session/Bearer + tenant context | `-` | `{ appId?: string; categoryId?: string; q?: string; limit?: string }` | `-` | `{ data\|payload, success? } \| { error }` | Knowledge |
| `POST` | `/api/knowledge/sources` | Session/Bearer + tenant context | `-` | `-` | `{ title: string; content?: string; type?: string; format?: string; embedding_model?: string; metadata?: any; source_type?: string; source_url?: string; file_name?: string; file_size?: number; file_type?: string; category_id?: string; files?: { file_name: string; mime_type?: string; file_size_bytes?: number; checksum_sha256?: string; storage_key?: string; storage_url?: string; language?: string; page_count?: number; duration_ms?: number; extraction_metadata?: any }[] }` | `{ data\|payload, success? } \| { error }` | Knowledge |
| `POST` | `/api/knowledge/sources/upload` | Session/Bearer + tenant context | `-` | `-` | `{ file: string; embeddingModel?: string; title?: string; isPrivate?: boolean; tags?: string[] }` | `{ data\|payload } \| { error }` | Knowledge |
| `PATCH` | `/api/knowledge/sources/:id` | Session/Bearer + tenant context | `{ id: string }` | `-` | `{ title?: string; content?: string; type?: string; format?: string; embedding_model?: string; metadata?: any; source_type?: string; source_url?: string; file_name?: string; file_size?: number; file_type?: string; category_id?: string; files?: { file_name: string; mime_type?: string; file_size_bytes?: number; checksum_sha256?: string; storage_key?: string; storage_url?: string; language?: string; page_count?: number; duration_ms?: number; extraction_metadata?: any }[] }` | `{ data\|payload, success? } \| { error }` | Knowledge |
| `DELETE` | `/api/knowledge/sources/:id` | Session/Bearer + tenant context | `{ id: string }` | `-` | `-` | `{ success } \| { error }` | Knowledge |
| `POST` | `/api/knowledge/retrieval/test` | Session/Bearer + tenant context | `-` | `-` | `{ query: string; topK?: number; selectedSourceIds?: string[]; modelId?: string; provider?: string }` | `{ data\|payload, success? } \| { error }` | Knowledge |
| `GET` | `/api/knowledge/analytics` | Session/Bearer + tenant context | `-` | `{ appId?: string; window?: string; channel?: string }` | `-` | `{ data\|payload, success? } \| { error }` | Knowledge |
| `POST` | `/api/knowledge/reindex` | Session/Bearer + tenant context | `-` | `-` | `{  }` | `{ data\|payload, success? } \| { error }` | Knowledge |
| `GET` | `/api/knowledge/faqs` | Session/Bearer + tenant context | `-` | `{ appId?: string; categoryId?: string; q?: string }` | `-` | `{ data\|payload, success? } \| { error }` | Knowledge |
| `POST` | `/api/knowledge/faqs` | Session/Bearer + tenant context | `-` | `-` | `{ question: string; answer: string; category_id?: string; priority?: number }` | `{ data\|payload, success? } \| { error }` | Knowledge |
| `PATCH` | `/api/knowledge/faqs/:id` | Session/Bearer + tenant context | `{ id: string }` | `-` | `{ question?: string; answer?: string; category_id?: string; priority?: number; is_active?: boolean }` | `{ data\|payload, success? } \| { error }` | Knowledge |
| `DELETE` | `/api/knowledge/faqs/:id` | Session/Bearer + tenant context | `{ id: string }` | `-` | `-` | `{ success } \| { error }` | Knowledge |
| `GET` | `/api/knowledge/stats` | Session/Bearer + tenant context | `-` | `{ appId?: string }` | `-` | `{ data\|payload, success? } \| { error }` | Knowledge |
| `GET` | `/api/flows/` | Session/Bearer + tenant context | `-` | `{ appId?: string }` | `-` | `{ data\|payload, success? } \| { error }` | Flow |
| `GET` | `/api/flows/decision-policy` | Session/Bearer + tenant context | `-` | `{ appId?: string; flowId?: string }` | `-` | `{ data\|payload, success? } \| { error }` | Flow |
| `GET` | `/api/flows/decision-evaluation` | Session/Bearer + tenant context | `-` | `{ appId?: string; flowId?: string; from?: string; to?: string; limit?: string }` | `-` | `{ data\|payload, success? } \| { error }` | Flow |
| `PUT` | `/api/flows/decision-policy` | Session/Bearer + tenant context | `-` | `{ appId?: string; flowId?: string }` | `any` | `{ data\|payload, success? } \| { error }` | Flow |
| `GET` | `/api/flows/conversations/:conversationId/ai-signals` | Session/Bearer + tenant context | `{ conversationId: string }` | `{ appId?: string; limit?: string }` | `-` | `{ data\|payload, success? } \| { error }` | Flow |
| `GET` | `/api/flows/default` | Session/Bearer + tenant context | `-` | `{ appId?: string }` | `-` | `{ data\|payload, success? } \| { error }` | Flow |
| `GET` | `/api/flows/:id` | Session/Bearer + tenant context | `{ id: string }` | `{ appId?: string }` | `-` | `{ data\|payload, success? } \| { error }` | Flow |
| `GET` | `/api/flows/:id/executions` | Session/Bearer + tenant context | `{ id: string }` | `{ appId?: string; conversationId?: string; executionId?: string }` | `-` | `{ data\|payload, success? } \| { error }` | Flow |
| `GET` | `/api/flows/:id/versions` | Session/Bearer + tenant context | `{ id: string }` | `{ appId?: string }` | `-` | `{ data\|payload, success? } \| { error }` | Flow |
| `POST` | `/api/flows/` | Session/Bearer + tenant context | `-` | `{ appId?: string }` | `{ name: string; description?: string; trigger_type?: string; nodes?: any; edges?: any; active?: boolean; is_active?: boolean }` | `{ data\|payload, success? } \| { error }` | Flow |
| `POST` | `/api/flows/:id/test-run` | Session/Bearer + tenant context | `{ id: string }` | `{ appId?: string }` | `any` | `{ data\|payload, success? } \| { error }` | Flow |
| `POST` | `/api/flows/:id/debug-node` | Session/Bearer + tenant context | `{ id: string }` | `{ appId?: string }` | `{ nodeId: string; input: any }` | `{ data\|payload, success? } \| { error }` | Flow |
| `POST` | `/api/flows/:id/default` | Session/Bearer + tenant context | `{ id: string }` | `{ appId?: string }` | `any` | `{ data\|payload, success? } \| { error }` | Flow |
| `PATCH` | `/api/flows/:id` | Session/Bearer + tenant context | `{ id: string }` | `{ appId?: string }` | `{ name?: string; description?: string; nodes?: any; edges?: any; active?: boolean }` | `{ data\|payload, success? } \| { error }` | Flow |
| `DELETE` | `/api/flows/:id` | Session/Bearer + tenant context | `{ id: string }` | `{ appId?: string }` | `-` | `{ success } \| { error }` | Flow |
| `POST` | `/api/orchestration/decide` | Session/Bearer + tenant context | `-` | `-` | `{ appId: string; conversationId: string; messageId: string; messageContent: string; customerLanguage?: string; conversationHistory?: any[]; currentAgentId?: string }` | `{ data\|payload, success? } \| { error }` | AI |
| `GET` | `/api/orchestration/agents` | Session/Bearer + tenant context | `-` | `{ appId?: string }` | `-` | `{ data\|payload, success? } \| { error }` | AI |
| `POST` | `/api/orchestration/handoff` | Session/Bearer + tenant context | `-` | `-` | `{ conversationId: string; fromAgentId?: string; toAgentId: string; reason?: string }` | `{ data\|payload, success? } \| { error }` | AI |
| `GET` | `/api/orchestration/handoffs/:conversationId` | Session/Bearer + tenant context | `{ conversationId: string }` | `-` | `-` | `{ data\|payload, success? } \| { error }` | AI |
| `GET` | `/api/crm/pipelines` | Session/Bearer + tenant context | `-` | `{ appId?: string }` | `-` | `{ data\|payload\|success? } \| { error }` | CRM |
| `POST` | `/api/crm/pipelines` | Session/Bearer + tenant context | `-` | `{ appId?: string }` | `{ name: string; pipelineType?: string; stages?: { name: string; color?: string; order?: number }[] }` | `{ data\|payload\|success? } \| { error }` | CRM |
| `DELETE` | `/api/crm/pipelines/:id` | Session/Bearer + tenant context | `{ id: string }` | `-` | `-` | `{ success } \| { error }` | CRM |
| `GET` | `/api/crm/deals/:conversationId` | Session/Bearer + tenant context | `{ conversationId: string }` | `-` | `-` | `{ data\|payload\|success? } \| { error }` | CRM |
| `PATCH` | `/api/crm/deals/:conversationId` | Session/Bearer + tenant context | `{ conversationId: string }` | `-` | `{ pipeline_id?: string; stage_id?: string; deal_value?: number; notes?: string }` | `{ data\|payload\|success? } \| { error }` | CRM |
| `GET` | `/api/teams/` | Session/Bearer + tenant context | `-` | `{ appId?: string; accountId?: string }` | `-` | `{ data\|payload\|success? } \| { error }` | Team |
| `GET` | `/api/teams/:id` | Session/Bearer + tenant context | `{ id: string }` | `{ appId?: string; accountId?: string }` | `-` | `{ data\|payload\|success? } \| { error }` | Team |
| `POST` | `/api/teams/` | Session/Bearer + tenant context | `-` | `{ appId?: string; accountId?: string }` | `{ name: string; description?: string; allow_auto_assign?: boolean }` | `{ data\|payload\|success? } \| { error }` | Team |
| `PATCH` | `/api/teams/:id` | Session/Bearer + tenant context | `{ id: string }` | `{ appId?: string; accountId?: string }` | `{ name?: string; description?: string; allow_auto_assign?: boolean }` | `{ data\|payload\|success? } \| { error }` | Team |
| `DELETE` | `/api/teams/:id` | Session/Bearer + tenant context | `{ id: string }` | `{ appId?: string; accountId?: string }` | `-` | `{ success } \| { error }` | Team |
| `POST` | `/api/teams/:id/members` | Session/Bearer + tenant context | `{ id: string }` | `-` | `{ userId: string }` | `{ data\|payload\|success? } \| { error }` | Team |
| `DELETE` | `/api/teams/:id/members/:userId` | Session/Bearer + tenant context | `{ id: string; userId: string }` | `-` | `-` | `{ success } \| { error }` | Team |
| `GET` | `/api/inboxes/` | Session/Bearer + tenant context | `-` | `{ appId?: string; accountId?: string }` | `-` | `{ data\|payload\|success? } \| { error }` | Inbox |
| `GET` | `/api/inboxes/:id` | Session/Bearer + tenant context | `{ id: string }` | `{ accountId?: string }` | `-` | `{ data\|payload\|success? } \| { error }` | Inbox |
| `POST` | `/api/inboxes/` | Session/Bearer + tenant context | `-` | `{ accountId?: string }` | `{ name: string; channel_type: string; channel_config?: any }` | `{ data\|payload\|success? } \| { error }` | Inbox |
| `PATCH` | `/api/inboxes/:id` | Session/Bearer + tenant context | `{ id: string }` | `{ accountId?: string }` | `{ name?: string; channel_config?: any; chatbot_id?: string \| null }` | `{ data\|payload\|success? } \| { error }` | Inbox |
| `DELETE` | `/api/inboxes/:id` | Session/Bearer + tenant context | `{ id: string }` | `{ accountId?: string }` | `-` | `{ success } \| { error }` | Inbox |
| `GET` | `/api/agents-management/` | Session/Bearer + tenant context | `-` | `{ appId?: string; q?: string }` | `-` | `{ data\|payload\|success? } \| { error }` | User |
| `POST` | `/api/agents-management/` | Session/Bearer + tenant context | `-` | `{ appId?: string }` | `{ name: string; email: string; password: string; phone_number?: string; role?: string; supervisor_id?: string \| null; divisions?: string[]; channels?: string[] }` | `{ data\|payload\|success? } \| { error }` | User |
| `GET` | `/api/agents-management/login-link` | Session/Bearer + tenant context | `-` | `-` | `-` | `{ data\|payload\|success? } \| { error }` | User |
| `PATCH` | `/api/agents-management/:id` | Session/Bearer + tenant context | `{ id: string }` | `{ appId?: string }` | `{ name?: string; email?: string; password?: string; phone_number?: string; role?: string; status?: string; is_available?: boolean; active?: boolean; supervisor_id?: string \| null; divisions?: string[]; channels?: string[] }` | `{ data\|payload\|success? } \| { error }` | User |
| `PUT` | `/api/agents-management/:id` | Session/Bearer + tenant context | `{ id: string }` | `{ appId?: string }` | `{ name?: string; email?: string; password?: string; phone_number?: string; role?: string; status?: string; is_available?: boolean; active?: boolean; supervisor_id?: string \| null; divisions?: string[]; channels?: string[] }` | `{ data\|payload\|success? } \| { error }` | User |
| `DELETE` | `/api/agents-management/:id` | Session/Bearer + tenant context | `{ id: string }` | `-` | `-` | `{ success } \| { error }` | User |
| `GET` | `/api/agents-management/divisions` | Session/Bearer + tenant context | `-` | `{ appId?: string }` | `-` | `{ data\|payload\|success? } \| { error }` | User |
| `POST` | `/api/agents-management/divisions` | Session/Bearer + tenant context | `-` | `{ appId?: string }` | `{ name: string; description?: string; color?: string }` | `{ data\|payload\|success? } \| { error }` | User |
| `PUT` | `/api/agents-management/divisions/:id` | Session/Bearer + tenant context | `{ id: string }` | `{ appId?: string }` | `{ name?: string; description?: string; color?: string; parent_division_id?: string \| null }` | `{ data\|payload\|success? } \| { error }` | User |
| `DELETE` | `/api/agents-management/divisions/:id` | Session/Bearer + tenant context | `{ id: string }` | `{ appId?: string }` | `-` | `{ success } \| { error }` | User |
| `GET` | `/api/agents/` | Session/Bearer + tenant context | `-` | `{ appId?: string; q?: string }` | `-` | `{ data\|payload\|success? } \| { error }` | User |
| `POST` | `/api/agents/` | Session/Bearer + tenant context | `-` | `{ appId?: string }` | `{ name: string; email: string; password: string; phone_number?: string; role?: string; supervisor_id?: string \| null; divisions?: string[]; channels?: string[] }` | `{ data\|payload\|success? } \| { error }` | User |
| `GET` | `/api/agents/login-link` | Session/Bearer + tenant context | `-` | `-` | `-` | `{ data\|payload\|success? } \| { error }` | User |
| `PATCH` | `/api/agents/:id` | Session/Bearer + tenant context | `{ id: string }` | `{ appId?: string }` | `{ name?: string; email?: string; password?: string; phone_number?: string; role?: string; status?: string; is_available?: boolean; active?: boolean; supervisor_id?: string \| null; divisions?: string[]; channels?: string[] }` | `{ data\|payload\|success? } \| { error }` | User |
| `PUT` | `/api/agents/:id` | Session/Bearer + tenant context | `{ id: string }` | `{ appId?: string }` | `{ name?: string; email?: string; password?: string; phone_number?: string; role?: string; status?: string; is_available?: boolean; active?: boolean; supervisor_id?: string \| null; divisions?: string[]; channels?: string[] }` | `{ data\|payload\|success? } \| { error }` | User |
| `DELETE` | `/api/agents/:id` | Session/Bearer + tenant context | `{ id: string }` | `-` | `-` | `{ success } \| { error }` | User |
| `GET` | `/api/agents/divisions` | Session/Bearer + tenant context | `-` | `{ appId?: string }` | `-` | `{ data\|payload\|success? } \| { error }` | User |
| `POST` | `/api/agents/divisions` | Session/Bearer + tenant context | `-` | `{ appId?: string }` | `{ name: string; description?: string; color?: string }` | `{ data\|payload\|success? } \| { error }` | User |
| `PUT` | `/api/agents/divisions/:id` | Session/Bearer + tenant context | `{ id: string }` | `{ appId?: string }` | `{ name?: string; description?: string; color?: string; parent_division_id?: string \| null }` | `{ data\|payload\|success? } \| { error }` | User |
| `DELETE` | `/api/agents/divisions/:id` | Session/Bearer + tenant context | `{ id: string }` | `{ appId?: string }` | `-` | `{ success } \| { error }` | User |
| `GET` | `/api/labels/` | Session/Bearer + tenant context | `-` | `{ appId?: string }` | `-` | `{ data\|payload\|success? } \| { error }` | Label |
| `POST` | `/api/labels/` | Session/Bearer + tenant context | `-` | `{ appId?: string }` | `{ title?: string; name?: string; description?: string; color?: string }` | `{ data\|payload\|success? } \| { error }` | Label |
| `PATCH` | `/api/labels/:id` | Session/Bearer + tenant context | `{ id: string }` | `{ appId?: string }` | `{ title?: string; name?: string; description?: string; color?: string }` | `{ data\|payload\|success? } \| { error }` | Label |
| `DELETE` | `/api/labels/:id` | Session/Bearer + tenant context | `{ id: string }` | `{ appId?: string }` | `-` | `{ success } \| { error }` | Label |
| `GET` | `/api/labels/conversation/:id` | Session/Bearer + tenant context | `{ id: string }` | `-` | `-` | `{ data\|payload\|success? } \| { error }` | Label |
| `POST` | `/api/labels/conversation/:id` | Session/Bearer + tenant context | `{ id: string }` | `-` | `{ labelId: string }` | `{ data\|payload\|success? } \| { error }` | Label |
| `DELETE` | `/api/labels/conversation/:id/:labelId` | Session/Bearer + tenant context | `{ id: string; labelId: string }` | `-` | `-` | `{ success } \| { error }` | Label |
| `GET` | `/api/broadcasts/` | Session/Bearer + tenant context | `-` | `{ appId?: string }` | `-` | `{ data\|payload, success? } \| { error }` | Broadcast |
| `GET` | `/api/broadcasts/jobs` | Session/Bearer + tenant context | `-` | `{ appId?: string; page?: string; limit?: string; status?: string \| string[]; statuses?: string \| string[] }` | `-` | `{ data\|payload, success? } \| { error }` | Broadcast |
| `GET` | `/api/broadcasts/jobs/:id` | Session/Bearer + tenant context | `{ id: string }` | `{ appId?: string }` | `-` | `{ data\|payload, success? } \| { error }` | Broadcast |
| `POST` | `/api/broadcasts/audience/preview` | Session/Bearer + tenant context | `-` | `{ appId?: string }` | `{ filters?: any }` | `{ data\|payload, success? } \| { error }` | Broadcast |
| `GET` | `/api/broadcasts/:id` | Session/Bearer + tenant context | `{ id: string }` | `{ appId?: string }` | `-` | `{ data\|payload, success? } \| { error }` | Broadcast |
| `POST` | `/api/broadcasts/` | Session/Bearer + tenant context | `-` | `{ appId?: string }` | `{ title: string; message_type?: "text" \| "template"; message_content?: string; template_name?: string; template_language?: string; template_params?: any; target_audience?: any; scheduled_at?: string }` | `{ data\|payload, success? } \| { error }` | Broadcast |
| `POST` | `/api/broadcasts/:id/send` | Session/Bearer + tenant context | `{ id: string }` | `{ appId?: string }` | `-` | `{ data\|payload, success? } \| { error }` | Broadcast |
| `GET` | `/api/handover/queue` | Session/Bearer + tenant context | `-` | `{ appId?: string }` | `-` | `{ data\|payload\|success? } \| { error }` | Handover |
| `GET` | `/api/handover/rules` | Session/Bearer + tenant context | `-` | `{ appId?: string }` | `-` | `{ data\|payload\|success? } \| { error }` | Handover |
| `GET` | `/api/handover/roster` | Session/Bearer + tenant context | `-` | `{ appId?: string }` | `-` | `{ data\|payload\|success? } \| { error }` | Handover |
| `GET` | `/api/handover/logs` | Session/Bearer + tenant context | `-` | `{ appId?: string; conversationId?: string; limit?: string; period?: string }` | `-` | `{ data\|payload\|success? } \| { error }` | Handover |
| `GET` | `/api/handover/analytics` | Session/Bearer + tenant context | `-` | `{ appId?: string; period?: string }` | `-` | `{ data\|payload\|success? } \| { error }` | Handover |
| `POST` | `/api/handover/requests` | Session/Bearer + tenant context | `-` | `-` | `{ conversationId: string; requestType?: "take" \| "reassign"; targetAgentId?: string; requestNote?: string; sourceRuleId?: string }` | `{ data\|payload\|success? } \| { error }` | Handover |
| `POST` | `/api/handover/requests/:id/approve` | Session/Bearer + tenant context | `{ id: string }` | `-` | `{ approvalNote?: string }` | `{ data\|payload\|success? } \| { error }` | Handover |
| `POST` | `/api/handover/requests/:id/reject` | Session/Bearer + tenant context | `{ id: string }` | `-` | `{ rejectionNote?: string }` | `{ data\|payload\|success? } \| { error }` | Handover |
| `GET` | `/api/handover/requests/:id/status` | Session/Bearer + tenant context | `{ id: string }` | `{ appId?: string }` | `-` | `{ data\|payload\|success? } \| { error }` | Handover |
| `POST` | `/api/handover/escalations/run` | Session/Bearer + tenant context | `-` | `{ appId?: string }` | `-` | `{ data\|payload\|success? } \| { error }` | Handover |
| `GET` | `/api/handover/conversation/:conversationId/logs` | Session/Bearer + tenant context | `{ conversationId: string }` | `-` | `-` | `{ data\|payload\|success? } \| { error }` | Handover |
| `GET` | `/api/forms/` | Session/Bearer + tenant context | `-` | `{ appId: string }` | `-` | `{ data\|payload\|success? } \| { error }` | Advanced |
| `GET` | `/api/forms/:id` | Session/Bearer + tenant context | `{ id: string }` | `-` | `-` | `{ data\|payload\|success? } \| { error }` | Advanced |
| `POST` | `/api/forms/` | Session/Bearer + tenant context | `-` | `{ appId: string }` | `{ name: string; description?: string; fields: { field_key: string; label: string; field_type: string; is_required: boolean }[] }` | `{ data\|payload\|success? } \| { error }` | Advanced |
| `GET` | `/api/forms/conversation/:id` | Session/Bearer + tenant context | `{ id: string }` | `-` | `-` | `{ data\|payload\|success? } \| { error }` | Advanced |
| `POST` | `/api/forms/conversation/:id/extract` | Session/Bearer + tenant context | `{ id: string }` | `-` | `-` | `{ data\|payload\|success? } \| { error }` | Advanced |
| `GET` | `/api/metrics/summary` | Session/Bearer + tenant context | `-` | `{ appId?: string; period?: string }` | `-` | `{ data\|payload\|success? } \| { error }` | Advanced |
| `GET` | `/api/metrics/dashboard` | Session/Bearer + tenant context | `-` | `{ appId?: string; period?: "today" \| "7d" \| "30d" }` | `-` | `{ data\|payload\|success? } \| { error }` | Advanced |
| `GET` | `/api/metrics/ai` | Session/Bearer + tenant context | `-` | `{ appId?: string }` | `-` | `{ data\|payload\|success? } \| { error }` | Advanced |
| `GET` | `/api/orders/` | Session/Bearer + tenant context | `-` | `{ page?: string; limit?: string; payment_type?: string; order_status?: string; inbox_id?: string; search?: string; sort_field?: string; sort_direction?: string; include_conv?: string }` | `-` | `{ data\|payload, success? } \| { error }` | Orders |
| `GET` | `/api/orders/report` | Session/Bearer + tenant context | `-` | `{ startDate?: string; endDate?: string }` | `-` | `{ data\|payload, success? } \| { error }` | Orders |
| `GET` | `/api/orders/subscriptions` | Session/Bearer + tenant context | `-` | `{ page?: string; limit?: string; search?: string; sort_field?: string; sort_direction?: string }` | `-` | `{ data\|payload, success? } \| { error }` | Orders |
| `GET` | `/api/commerce/products` | Session/Bearer + tenant context | `-` | `-` | `-` | `{ data\|payload, success? } \| { error }` | Commerce |
| `POST` | `/api/commerce/products` | Session/Bearer + tenant context | `-` | `-` | `any` | `{ data\|payload, success? } \| { error }` | Commerce |
| `PATCH` | `/api/commerce/products/:id` | Session/Bearer + tenant context | `{ id: string }` | `-` | `any` | `{ data\|payload, success? } \| { error }` | Commerce |
| `DELETE` | `/api/commerce/products/:id` | Session/Bearer + tenant context | `{ id: string }` | `-` | `-` | `{ success } \| { error }` | Commerce |
| `POST` | `/api/commerce/products/:id/variants` | Session/Bearer + tenant context | `{ id: string }` | `-` | `any` | `{ data\|payload, success? } \| { error }` | Commerce |
| `POST` | `/api/commerce/products/:id/variants/bulk-upsert` | Session/Bearer + tenant context | `{ id: string }` | `-` | `any` | `{ data\|payload, success? } \| { error }` | Commerce |
| `PATCH` | `/api/commerce/variants/:id` | Session/Bearer + tenant context | `{ id: string }` | `-` | `any` | `{ data\|payload, success? } \| { error }` | Commerce |
| `DELETE` | `/api/commerce/variants/:id` | Session/Bearer + tenant context | `{ id: string }` | `-` | `-` | `{ success } \| { error }` | Commerce |
| `POST` | `/api/commerce/variants/:id/stock-adjust` | Session/Bearer + tenant context | `{ id: string }` | `-` | `any` | `{ data\|payload, success? } \| { error }` | Commerce |
| `GET` | `/api/commerce/stock/variants` | Session/Bearer + tenant context | `-` | `any` | `-` | `{ data\|payload, success? } \| { error }` | Commerce |
| `GET` | `/api/commerce/stock/movements` | Session/Bearer + tenant context | `-` | `any` | `-` | `{ data\|payload, success? } \| { error }` | Commerce |
| `GET` | `/api/commerce/orders` | Session/Bearer + tenant context | `-` | `any` | `-` | `{ data\|payload, success? } \| { error }` | Commerce |
| `GET` | `/api/commerce/orders/:orderId` | Session/Bearer + tenant context | `{ orderId: string }` | `-` | `-` | `{ data\|payload, success? } \| { error }` | Commerce |
| `GET` | `/api/commerce/conversations/:conversationId/summary` | Session/Bearer + tenant context | `{ conversationId: string }` | `-` | `-` | `{ data\|payload, success? } \| { error }` | Commerce |
| `POST` | `/api/commerce/orders/add-to-cart` | Session/Bearer + tenant context | `-` | `-` | `any` | `{ data\|payload, success? } \| { error }` | Commerce |
| `POST` | `/api/commerce/orders/:orderId/checkout` | Session/Bearer + tenant context | `{ orderId: string }` | `-` | `any` | `{ data\|payload, success? } \| { error }` | Commerce |
| `POST` | `/api/commerce/orders/:orderId/send-payment-link` | Session/Bearer + tenant context | `{ orderId: string }` | `-` | `any` | `{ data\|payload, success? } \| { error }` | Commerce |
| `POST` | `/api/commerce/orders/:orderId/cancel` | Session/Bearer + tenant context | `{ orderId: string }` | `-` | `any` | `{ data\|payload, success? } \| { error }` | Commerce |
| `GET` | `/api/commerce/settings/pakasir` | Session/Bearer + tenant context | `-` | `-` | `-` | `{ data\|payload, success? } \| { error }` | Commerce |
| `PATCH` | `/api/commerce/settings/pakasir` | Session/Bearer + tenant context | `-` | `-` | `any` | `{ data\|payload, success? } \| { error }` | Commerce |
| `GET` | `/api/public/invoices/:token` | Session/Bearer + tenant context | `{ token: string }` | `-` | `-` | `{ data\|payload, success? } \| { error }` | Commerce |
| `GET` | `/api/public/payment-success` | Session/Bearer + tenant context | `-` | `any` | `-` | `{ data\|payload, success? } \| { error }` | Commerce |
| `GET` | `/api/canned-responses/` | Session/Bearer + tenant context | `-` | `{ accountId: string }` | `-` | `{ data\|payload\|success? } \| { error }` | Message |
| `POST` | `/api/canned-responses/` | Session/Bearer + tenant context | `-` | `{ accountId: string }` | `{ short_code: string; content: string }` | `{ data\|payload\|success? } \| { error }` | Message |
| `DELETE` | `/api/canned-responses/:id` | Session/Bearer + tenant context | `{ id: string }` | `{ accountId: string }` | `-` | `{ success } \| { error }` | Message |
| `GET` | `/api/agent-settings/` | Session/Bearer + tenant context | `-` | `{ appId?: string }` | `-` | `{ data\|payload\|success? } \| { error }` | Admin |
| `PUT` | `/api/agent-settings/` | Session/Bearer + tenant context | `-` | `{ appId?: string }` | `{ default_ticket_board_id?: string \| null; auto_assign_agent?: boolean; agent_can_takeover_unserved?: boolean; agent_can_access_customers?: boolean; agent_can_import_export_customers?: boolean; agent_can_send_broadcast?: boolean; agent_can_broadcast_in_service_window?: boolean; hide_agent_status_toggle?: boolean; hide_customer_id?: boolean; agent_can_assign_chat?: boolean; agent_can_add_agents_to_chat?: boolean; agent_can_leave_chat?: boolean; hide_handover_dialogue?: boolean; agent_can_manage_quick_replies?: boolean }` | `{ data\|payload\|success? } \| { error }` | Admin |
| `GET` | `/api/templates` | Session/Bearer + tenant context | `-` | `{ appId?: string; limit?: string; status?: string; category?: string; search?: string; channelId?: string }` | `-` | `{ data\|payload\|success? } \| { error }` | WhatsApp |
| `POST` | `/api/templates/sync` | Session/Bearer + tenant context | `-` | `-` | `{ channelId?: string }` | `{ data\|payload\|success? } \| { error }` | WhatsApp |
| `GET` | `/api/template-variables/` | Session/Bearer + tenant context | `-` | `-` | `-` | `{ data\|payload\|success? } \| { error }` | Template Variables |
| `POST` | `/api/template-variables/` | Session/Bearer + tenant context | `-` | `-` | `{ app_id?: string; name: string; category?: string; value: string; fallback_value?: string }` | `{ data\|payload\|success? } \| { error }` | Template Variables |
| `DELETE` | `/api/template-variables/:id` | Session/Bearer + tenant context | `{ id: string }` | `-` | `-` | `{ success } \| { error }` | Template Variables |
| `GET` | `/api/developer_keys/` | Session/Bearer + tenant context | `-` | `{ business_id?: string }` | `-` | `{ data\|payload\|success? } \| { error }` | Developer Keys |
| `POST` | `/api/developer_keys/regenerate` | Session/Bearer + tenant context | `-` | `{ business_id?: string }` | `-` | `{ data\|payload\|success? } \| { error }` | Developer Keys |
| `GET` | `/api/ai-settings` | Session/Bearer + tenant context | `-` | `-` | `-` | `{ data\|payload\|success? } \| { error }` | API |
| `PUT` | `/api/ai-settings` | Session/Bearer + tenant context | `-` | `-` | `-` | `{ data\|payload\|success? } \| { error }` | API |
| `GET` | `/api/ai-providers` | Session/Bearer + tenant context | `-` | `-` | `-` | `{ data\|payload\|success? } \| { error }` | API |
| `PUT` | `/api/ai-providers/:provider` | Session/Bearer + tenant context | `-` | `-` | `-` | `{ data\|payload\|success? } \| { error }` | API |
| `POST` | `/api/ai-providers/:provider/test` | Session/Bearer + tenant context | `-` | `-` | `-` | `{ data\|payload\|success? } \| { error }` | API |
| `PATCH` | `/api/ai-providers/active` | Session/Bearer + tenant context | `-` | `-` | `-` | `{ data\|payload\|success? } \| { error }` | API |
| `PATCH` | `/api/ai-providers/embedding-active` | Session/Bearer + tenant context | `-` | `-` | `-` | `{ data\|payload\|success? } \| { error }` | API |
| `GET` | `/api/whatsapp/templates` | Session/Bearer + tenant context | `-` | `{ appId?: string; limit?: string; status?: string; category?: string; search?: string; channelId?: string }` | `-` | `{ data\|payload\|success? } \| { error }` | WhatsApp |
| `POST` | `/api/whatsapp/templates/sync` | Session/Bearer + tenant context | `-` | `-` | `{ channelId?: string }` | `{ data\|payload\|success? } \| { error }` | WhatsApp |
| `GET` | `/api/whatsapp/` | Session/Bearer + tenant context | `-` | `{ appId?: string; accountId?: string; search?: string }` | `-` | `{ data\|payload\|success? } \| { error }` | WhatsApp |
| `GET` | `/api/whatsapp/:id/details` | Session/Bearer + tenant context | `{ id: string }` | `-` | `-` | `{ data\|payload\|success? } \| { error }` | WhatsApp |
| `POST` | `/api/whatsapp/:id/badge` | Session/Bearer + tenant context | `{ id: string }` | `-` | `{ badge: string }` | `{ data\|payload\|success? } \| { error }` | WhatsApp |
| `DELETE` | `/api/whatsapp/:id/badge` | Session/Bearer + tenant context | `{ id: string }` | `-` | `-` | `{ success } \| { error }` | WhatsApp |
| `GET` | `/api/whatsapp/:id` | Session/Bearer + tenant context | `{ id: string }` | `-` | `-` | `{ data\|payload\|success? } \| { error }` | WhatsApp |
| `POST` | `/api/whatsapp/` | Session/Bearer + tenant context | `-` | `-` | `{ name: string; phone_number: string; phone_number_id: string; waba_id: string; business_name?: string; inbox_id?: string; provider?: string; api_key?: string }` | `{ data\|payload\|success? } \| { error }` | WhatsApp |
| `PATCH` | `/api/whatsapp/:id` | Session/Bearer + tenant context | `{ id: string }` | `-` | `{ name?: string; phone_number?: string; is_active?: boolean; business_name?: string; tags?: string[]; default_chatbot_id?: string \| null; default_flow_id?: string \| null; default_team_ids?: string[]; default_agent_ids?: string[]; distribution_method?: string }` | `{ data\|payload\|success? } \| { error }` | WhatsApp |
| `DELETE` | `/api/whatsapp/:id` | Session/Bearer + tenant context | `{ id: string }` | `-` | `-` | `{ success } \| { error }` | WhatsApp |
| `POST` | `/api/whatsapp/exchange-token` | Session/Bearer + tenant context | `-` | `-` | `{ code: string }` | `{ data\|payload\|success? } \| { error }` | WhatsApp |
| `POST` | `/api/whatsapp/init-signup` | Session/Bearer + tenant context | `-` | `-` | `-` | `{ data\|payload\|success? } \| { error }` | WhatsApp |

## API v1 Mirror Routes

These routes mirror the core module stack under `/api/v1`. Compatibility-only `/api/ai-settings`, `/api/ai-providers*`, and developer keys are not mounted under `/api/v1` in `src/index.ts`.

| Method | Path | Auth | Params | Query | Body | Response | Source |
|---|---|---|---|---|---|---|---|
| `POST` | `/api/v1/auth/login` | Public legacy login | `-` | `-` | `{ email: string; password: string; app_id?: string }` | `{ success?, data?, token?, user?, error? }` | Authority |
| `GET` | `/api/v1/auth/context` | Session cookie/Bearer | `-` | `-` | `-` | `{ success?, data?, token?, user?, error? }` | Authority |
| `POST` | `/api/v1/auth/onboarding` | Session cookie/Bearer | `-` | `-` | `{ companyName: string; slug?: string }` | `{ success?, data?, token?, user?, error? }` | Authority |
| `GET` | `/api/v1/auth/me` | Session cookie/Bearer | `-` | `-` | `-` | `{ success?, data?, token?, user?, error? }` | Authority |
| `POST` | `/api/v1/auth/logout` | Session cookie/Bearer | `-` | `-` | `-` | `{ success?, data?, token?, user?, error? }` | Authority |
| `GET` | `/api/v1/user/` | Session/Bearer + tenant context | `-` | `{ accountId: string }` | `-` | `any` | User |
| `GET` | `/api/v1/user/:id` | Session/Bearer + tenant context | `{ id: string }` | `-` | `-` | `{ data\|payload\|success? } \| { error }` | User |
| `PATCH` | `/api/v1/user/:id` | Session/Bearer + tenant context | `{ id: string }` | `-` | `{ name?: string; avatar_url?: string; phone?: string }` | `{ data\|payload\|success? } \| { error }` | User |
| `GET` | `/api/v1/user/:id/presence` | Session/Bearer + tenant context | `{ id: string }` | `-` | `-` | `{ data\|payload\|success? } \| { error }` | User |
| `POST` | `/api/v1/user/:id/presence` | Session/Bearer + tenant context | `{ id: string }` | `-` | `{ status: string }` | `{ data\|payload\|success? } \| { error }` | User |
| `GET` | `/api/v1/user/timezone` | Session/Bearer + tenant context | `-` | `-` | `-` | `{ data\|payload\|success? } \| { error }` | User |
| `PUT` | `/api/v1/user/timezone` | Session/Bearer + tenant context | `-` | `-` | `{ timezone: string }` | `{ data\|payload\|success? } \| { error }` | User |
| `POST` | `/api/v1/user/timezone/detect` | Session/Bearer + tenant context | `-` | `-` | `{ detected_timezone?: string }` | `{ data\|payload\|success? } \| { error }` | User |
| `POST` | `/api/v1/user/timezone/reset` | Session/Bearer + tenant context | `-` | `-` | `-` | `{ data\|payload\|success? } \| { error }` | User |
| `GET` | `/api/v1/conversations/counts` | Session/Bearer + tenant context | `-` | `{ accountId?: string; appId?: string }` | `-` | `{ data\|payload\|success? } \| { error }` | Conversation |
| `GET` | `/api/v1/conversations/` | Session/Bearer + tenant context | `-` | `{ accountId?: string; appId?: string; status?: string; inboxId?: string; agentId?: string; priority?: string; page?: string; limit?: string; dateFrom?: string; dateTo?: string; labelIds?: string; resolvedBy?: string; aiAgentId?: string; pipelineStageId?: string; channelType?: string }` | `-` | `{ data\|payload\|success? } \| { error }` | Conversation |
| `POST` | `/api/v1/conversations/bulk-edit` | Session/Bearer + tenant context | `-` | `-` | `{ conversationIds: string[]; collaboratorIds?: string[]; handledById?: string; labelId?: string; pipelineStageId?: string; resolveStatus?: "open" \| "pending" \| "resolved" }` | `{ data\|payload\|success? } \| { error }` | Conversation |
| `GET` | `/api/v1/conversations/bulk-edit/:jobId` | Session/Bearer + tenant context | `{ jobId: string }` | `-` | `-` | `{ data\|payload\|success? } \| { error }` | Conversation |
| `GET` | `/api/v1/conversations/:id/contact-detail` | Session/Bearer + tenant context | `{ id: string }` | `-` | `-` | `{ data\|payload\|success? } \| { error }` | Conversation |
| `GET` | `/api/v1/conversations/:id` | Session/Bearer + tenant context | `{ id: string }` | `-` | `-` | `{ data\|payload\|success? } \| { error }` | Conversation |
| `PATCH` | `/api/v1/conversations/:id/status` | Session/Bearer + tenant context | `{ id: string }` | `-` | `{ status: string }` | `{ data\|payload\|success? } \| { error }` | Conversation |
| `POST` | `/api/v1/conversations/:id/status` | Session/Bearer + tenant context | `{ id: string }` | `-` | `{ status: string }` | `{ data\|payload\|success? } \| { error }` | Conversation |
| `POST` | `/api/v1/conversations/:id/resolve` | Session/Bearer + tenant context | `{ id: string }` | `-` | `-` | `{ data\|payload\|success? } \| { error }` | Conversation |
| `POST` | `/api/v1/conversations/:id/assign` | Session/Bearer + tenant context | `{ id: string }` | `-` | `{ agentId: string }` | `{ data\|payload\|success? } \| { error }` | Conversation |
| `POST` | `/api/v1/conversations/:id/takeover` | Session/Bearer + tenant context | `{ id: string }` | `-` | `{ agentId?: string; agent_id?: string }` | `{ data\|payload\|success? } \| { error }` | Conversation |
| `POST` | `/api/v1/conversations/:id/read` | Session/Bearer + tenant context | `{ id: string }` | `-` | `-` | `{ data\|payload\|success? } \| { error }` | Conversation |
| `GET` | `/api/v1/conversations/:id/messages` | Session/Bearer + tenant context | `{ id: string }` | `{ limit?: string; before?: string }` | `-` | `{ data\|payload\|success? } \| { error }` | Conversation |
| `POST` | `/api/v1/conversations/:id/messages` | Session/Bearer + tenant context | `{ id: string }` | `-` | `{ content: any; senderId?: string; sender_type?: "agent" \| "system"; type?: string; content_type?: string; content_attributes?: {  }; media?: any; mediaIds?: string[]; unique_temp_id?: string; reply_to_message_id?: string }` | `{ data\|payload\|success? } \| { error }` | Conversation |
| `GET` | `/api/v1/conversations/:id/labels` | Session/Bearer + tenant context | `{ id: string }` | `-` | `-` | `{ data\|payload\|success? } \| { error }` | Conversation |
| `POST` | `/api/v1/conversations/:id/labels` | Session/Bearer + tenant context | `{ id: string }` | `-` | `{ labelId: string }` | `{ data\|payload\|success? } \| { error }` | Conversation |
| `DELETE` | `/api/v1/conversations/:id/labels/:labelId` | Session/Bearer + tenant context | `{ id: string; labelId: string }` | `-` | `-` | `{ success } \| { error }` | Conversation |
| `GET` | `/api/v1/conversations/:id/notes` | Session/Bearer + tenant context | `{ id: string }` | `-` | `-` | `{ data\|payload\|success? } \| { error }` | Conversation |
| `POST` | `/api/v1/conversations/:id/notes` | Session/Bearer + tenant context | `{ id: string }` | `-` | `{ content: string }` | `{ data\|payload\|success? } \| { error }` | Conversation |
| `PATCH` | `/api/v1/conversations/:id/notes/:noteId` | Session/Bearer + tenant context | `{ id: string; noteId: string }` | `-` | `{ content: string }` | `{ data\|payload\|success? } \| { error }` | Conversation |
| `GET` | `/api/v1/conversations/:id/activity` | Session/Bearer + tenant context | `{ id: string }` | `-` | `-` | `{ data\|payload\|success? } \| { error }` | Conversation |
| `POST` | `/api/v1/conversations/:id/agents` | Session/Bearer + tenant context | `{ id: string }` | `-` | `{ agentId?: string; agent_id?: string }` | `{ data\|payload\|success? } \| { error }` | Conversation |
| `GET` | `/api/v1/conversations/:id/agents` | Session/Bearer + tenant context | `{ id: string }` | `-` | `-` | `{ data\|payload\|success? } \| { error }` | Conversation |
| `DELETE` | `/api/v1/conversations/:id/agents/:agentId` | Session/Bearer + tenant context | `{ id: string; agentId: string }` | `-` | `-` | `{ success } \| { error }` | Conversation |
| `POST` | `/api/v1/messages/` | Session/Bearer + tenant context | `-` | `-` | `{ conversationId: string; senderId?: string; content: string; contentType?: string; mediaIds?: string[] }` | `{ data\|payload\|success? } \| { error }` | Message |
| `GET` | `/api/v1/messages/:id` | Session/Bearer + tenant context | `{ id: string }` | `-` | `-` | `{ data\|payload\|success? } \| { error }` | Message |
| `PATCH` | `/api/v1/messages/:id/status` | Session/Bearer + tenant context | `{ id: string }` | `-` | `{ status: string; externalId?: string }` | `{ data\|payload\|success? } \| { error }` | Message |
| `DELETE` | `/api/v1/messages/:id` | Session/Bearer + tenant context | `{ id: string }` | `-` | `-` | `{ success } \| { error }` | Message |
| `GET` | `/api/v1/contacts/settings` | Session/Bearer + tenant context | `-` | `{ appId?: string }` | `-` | `{ data\|payload\|success? } \| { error }` | Contact |
| `POST` | `/api/v1/contacts/settings/stages` | Session/Bearer + tenant context | `-` | `-` | `{ name: string; color?: string; isDefault?: boolean }` | `{ data\|payload\|success? } \| { error }` | Contact |
| `PATCH` | `/api/v1/contacts/settings/stages/reorder` | Session/Bearer + tenant context | `-` | `-` | `{ stageIds: string[] }` | `{ data\|payload\|success? } \| { error }` | Contact |
| `PATCH` | `/api/v1/contacts/settings/stages/:id` | Session/Bearer + tenant context | `{ id: string }` | `-` | `{ name?: string; color?: string; isDefault?: boolean }` | `{ data\|payload\|success? } \| { error }` | Contact |
| `DELETE` | `/api/v1/contacts/settings/stages/:id` | Session/Bearer + tenant context | `{ id: string }` | `-` | `-` | `{ success } \| { error }` | Contact |
| `POST` | `/api/v1/contacts/settings/fields` | Session/Bearer + tenant context | `-` | `-` | `{ fieldKey?: string; fieldLabel: string; fieldType: string; options?: any[]; isRequired?: boolean; isVisible?: boolean }` | `{ data\|payload\|success? } \| { error }` | Contact |
| `PATCH` | `/api/v1/contacts/settings/fields/reorder` | Session/Bearer + tenant context | `-` | `-` | `{ fieldIds: string[] }` | `{ data\|payload\|success? } \| { error }` | Contact |
| `PATCH` | `/api/v1/contacts/settings/fields/:id` | Session/Bearer + tenant context | `{ id: string }` | `-` | `{ fieldKey?: string; fieldLabel?: string; fieldType?: string; options?: any[]; isRequired?: boolean; isVisible?: boolean }` | `{ data\|payload\|success? } \| { error }` | Contact |
| `DELETE` | `/api/v1/contacts/settings/fields/:id` | Session/Bearer + tenant context | `{ id: string }` | `-` | `-` | `{ success } \| { error }` | Contact |
| `GET` | `/api/v1/contacts/` | Session/Bearer + tenant context | `-` | `{ appId?: string; accountId?: string; q?: string }` | `-` | `{ data\|payload\|success? } \| { error }` | Contact |
| `GET` | `/api/v1/contacts/:id` | Session/Bearer + tenant context | `{ id: string }` | `-` | `-` | `{ data\|payload\|success? } \| { error }` | Contact |
| `POST` | `/api/v1/contacts/` | Session/Bearer + tenant context | `-` | `-` | `{ accountId: string; appId?: string; name?: string; phone?: string; phone_number?: string; email?: string; avatarUrl?: string; avatar_url?: string; identifier?: string; customAttributes?: any }` | `{ data\|payload\|success? } \| { error }` | Contact |
| `PATCH` | `/api/v1/contacts/:id` | Session/Bearer + tenant context | `{ id: string }` | `-` | `{ name?: string; phone?: string; phone_number?: string; email?: string; avatarUrl?: string; avatar_url?: string; customAttributes?: any }` | `{ data\|payload\|success? } \| { error }` | Contact |
| `DELETE` | `/api/v1/contacts/:id` | Session/Bearer + tenant context | `{ id: string }` | `-` | `-` | `{ success } \| { error }` | Contact |
| `GET` | `/api/v1/contacts/:id/conversations` | Session/Bearer + tenant context | `{ id: string }` | `-` | `-` | `{ data\|payload\|success? } \| { error }` | Contact |
| `GET` | `/api/v1/customers/` | Session/Bearer + tenant context | `-` | `{ page?: string; per_page?: string; search?: string; q?: string; pipeline_stage_id?: string; consent_status?: string; tag_id?: string; channel?: string; sort?: string; order?: string }` | `-` | `{ data\|payload\|success? } \| { error }` | Customer |
| `GET` | `/api/v1/customers/stats` | Session/Bearer + tenant context | `-` | `-` | `-` | `{ data\|payload\|success? } \| { error }` | Customer |
| `GET` | `/api/v1/customers/levels/settings` | Session/Bearer + tenant context | `-` | `-` | `-` | `{ data\|payload\|success? } \| { error }` | Customer |
| `PUT` | `/api/v1/customers/levels/settings` | Session/Bearer + tenant context | `-` | `-` | `{ vip?: string \| null; premium?: string \| null; basic?: string \| null }` | `{ data\|payload\|success? } \| { error }` | Customer |
| `GET` | `/api/v1/customers/levels/preview` | Session/Bearer + tenant context | `-` | `{ limit?: string }` | `-` | `{ data\|payload\|success? } \| { error }` | Customer |
| `GET` | `/api/v1/customers/:id` | Session/Bearer + tenant context | `{ id: string }` | `-` | `-` | `{ data\|payload\|success? } \| { error }` | Customer |
| `PUT` | `/api/v1/customers/:id` | Session/Bearer + tenant context | `{ id: string }` | `-` | `{ name?: string; email?: string; phone_number?: string; notes?: string; lead_score?: number; pipeline_stage_id?: string; consent_status?: string; consent_purpose?: string; consent_source?: string; custom_attributes?: any }` | `{ data\|payload\|success? } \| { error }` | Customer |
| `POST` | `/api/v1/customers/:id/tags` | Session/Bearer + tenant context | `{ id: string }` | `-` | `{ tag_id?: string; tag_name?: string }` | `{ data\|payload\|success? } \| { error }` | Customer |
| `DELETE` | `/api/v1/customers/:id/tags/:tagId` | Session/Bearer + tenant context | `{ id: string; tagId: string }` | `-` | `-` | `{ success } \| { error }` | Customer |
| `GET` | `/api/v1/whatsapp-channels/` | Session/Bearer + tenant context | `-` | `{ appId?: string; accountId?: string; search?: string }` | `-` | `{ data\|payload\|success? } \| { error }` | WhatsApp |
| `GET` | `/api/v1/whatsapp-channels/:id/details` | Session/Bearer + tenant context | `{ id: string }` | `-` | `-` | `{ data\|payload\|success? } \| { error }` | WhatsApp |
| `POST` | `/api/v1/whatsapp-channels/:id/badge` | Session/Bearer + tenant context | `{ id: string }` | `-` | `{ badge: string }` | `{ data\|payload\|success? } \| { error }` | WhatsApp |
| `DELETE` | `/api/v1/whatsapp-channels/:id/badge` | Session/Bearer + tenant context | `{ id: string }` | `-` | `-` | `{ success } \| { error }` | WhatsApp |
| `GET` | `/api/v1/whatsapp-channels/:id` | Session/Bearer + tenant context | `{ id: string }` | `-` | `-` | `{ data\|payload\|success? } \| { error }` | WhatsApp |
| `POST` | `/api/v1/whatsapp-channels/` | Session/Bearer + tenant context | `-` | `-` | `{ name: string; phone_number: string; phone_number_id: string; waba_id: string; business_name?: string; inbox_id?: string; provider?: string; api_key?: string }` | `{ data\|payload\|success? } \| { error }` | WhatsApp |
| `PATCH` | `/api/v1/whatsapp-channels/:id` | Session/Bearer + tenant context | `{ id: string }` | `-` | `{ name?: string; phone_number?: string; is_active?: boolean; business_name?: string; tags?: string[]; default_chatbot_id?: string \| null; default_flow_id?: string \| null; default_team_ids?: string[]; default_agent_ids?: string[]; distribution_method?: string }` | `{ data\|payload\|success? } \| { error }` | WhatsApp |
| `DELETE` | `/api/v1/whatsapp-channels/:id` | Session/Bearer + tenant context | `{ id: string }` | `-` | `-` | `{ success } \| { error }` | WhatsApp |
| `POST` | `/api/v1/whatsapp-channels/exchange-token` | Session/Bearer + tenant context | `-` | `-` | `{ code: string }` | `{ data\|payload\|success? } \| { error }` | WhatsApp |
| `POST` | `/api/v1/whatsapp-channels/init-signup` | Session/Bearer + tenant context | `-` | `-` | `-` | `{ data\|payload\|success? } \| { error }` | WhatsApp |
| `GET` | `/api/v1/waba/webhook-config` | Session/Bearer + tenant context | `-` | `-` | `-` | `{ data\|payload\|success? } \| { error }` | WABA |
| `POST` | `/api/v1/waba/connect/manual` | Session/Bearer + tenant context | `-` | `-` | `{ accessToken: string; wabaId: string }` | `{ data\|payload\|success? } \| { error }` | WABA |
| `GET` | `/api/v1/webhooks/whatsapp` | Public webhook token/signature | `-` | `{ hub.mode?: string; hub.verify_token?: string; hub.challenge?: string }` | `-` | `Meta challenge text \| 403` | Webhook |
| `GET` | `/api/v1/webhooks/whatsapp/media/:messageId` | Public webhook token/signature | `{ messageId: string }` | `-` | `-` | `Meta challenge text \| 403` | Webhook |
| `POST` | `/api/v1/webhooks/whatsapp` | Public webhook token/signature | `-` | `-` | `-` | `{ success }` | Webhook |
| `GET` | `/api/v1/webhooks/` | Session/Bearer + tenant context | `-` | `{ accountId?: string }` | `-` | `{ data\|payload\|success? } \| { error }` | Webhook |
| `POST` | `/api/v1/webhooks/` | Session/Bearer + tenant context | `-` | `{ accountId?: string }` | `{ url: string; name?: string; events?: string[] }` | `{ data\|payload\|success? } \| { error }` | Webhook |
| `DELETE` | `/api/v1/webhooks/:id` | Session/Bearer + tenant context | `{ id: string }` | `-` | `-` | `{ success } \| { error }` | Webhook |
| `GET` | `/api/v1/business_webhooks/` | App context or X-Business-Id | `-` | `{ business_id?: string }` | `-` | `{ data\|payload\|success? } \| { error }` | Business Webhooks |
| `POST` | `/api/v1/business_webhooks/` | App context or X-Business-Id | `-` | `{ business_id?: string }` | `any` | `{ data\|payload\|success? } \| { error }` | Business Webhooks |
| `PATCH` | `/api/v1/business_webhooks/:id` | App context or X-Business-Id | `{ id: string }` | `{ business_id?: string }` | `any` | `{ data\|payload\|success? } \| { error }` | Business Webhooks |
| `DELETE` | `/api/v1/business_webhooks/:id` | App context or X-Business-Id | `{ id: string }` | `{ business_id?: string }` | `-` | `{ success } \| { error }` | Business Webhooks |
| `POST` | `/api/v1/webhooks/pakasir/` | Public payment webhook | `-` | `-` | `any` | `{ data\|payload\|success? } \| { error }` | API v1 |
| `POST` | `/api/v1/media/upload` | Session/Bearer + tenant context | `-` | `-` | `{ file: string; platform?: string }` | `any` | Media |
| `GET` | `/api/v1/media/gallery` | Session/Bearer + tenant context | `-` | `{ type?: string; take?: string; cursor?: string }` | `-` | `any` | Media |
| `GET` | `/api/v1/ai/settings` | Session/Bearer + tenant context | `-` | `{ appId?: string }` | `-` | `{ data\|payload, success? } \| { error }` | AI |
| `PATCH` | `/api/v1/ai/settings` | Session/Bearer + tenant context | `-` | `{ appId?: string }` | `{ ai_mode?: "assist" \| "hybrid" \| "auto" \| "off"; model_provider?: "growthcircle" \| "openai" \| "azure" \| "sumopod" \| "local"; model_name?: string; temperature?: number; max_tokens?: number; auto_reply_confidence?: number; handoff_keywords?: string[]; response_tone?: string; supported_languages?: string[]; auto_detect_language?: boolean; use_platform_credentials?: boolean; api_key?: string; api_endpoint?: string; api_version?: string; deployment_name?: string; system_prompt?: string; is_active?: boolean }` | `{ data\|payload, success? } \| { error }` | AI |
| `GET` | `/api/v1/ai/providers` | Session/Bearer + tenant context | `-` | `-` | `-` | `{ data\|payload, success? } \| { error }` | AI |
| `PUT` | `/api/v1/ai/providers/:provider` | Session/Bearer + tenant context | `{ provider: "growthcircle" \| "azure" \| "sumopod" }` | `-` | `{ base_url: string; api_key?: string; model_name?: string; api_version?: string; deployment_name?: string; temperature?: number; max_tokens?: number; default_protocol?: "openai" \| "anthropic"; channels?: { openai?: { base_url: string; path?: string; auth_header?: object \| object; auth_scheme?: object \| object }; anthropic?: { base_url: string; path?: string; auth_header?: object \| object; auth_scheme?: object \| object } }; models?: { id: string; name: string; vendor: string; context_window: string; max_output: string }[] }` | `{ data\|payload, success? } \| { error }` | AI |
| `POST` | `/api/v1/ai/providers/:provider/test` | Session/Bearer + tenant context | `{ provider: "growthcircle" \| "azure" \| "sumopod" }` | `-` | `{ modelId?: string; message?: string; maxTokens?: number; protocol?: "openai" \| "anthropic"; apiKey?: string }` | `{ data\|payload, success? } \| { error }` | AI |
| `PATCH` | `/api/v1/ai/providers/active` | Session/Bearer + tenant context | `-` | `-` | `{ provider: "growthcircle" \| "azure" \| "sumopod" }` | `{ data\|payload, success? } \| { error }` | AI |
| `PATCH` | `/api/v1/ai/providers/embedding-active` | Session/Bearer + tenant context | `-` | `-` | `{ provider: "growthcircle" \| "azure" \| "sumopod" }` | `{ data\|payload, success? } \| { error }` | AI |
| `GET` | `/api/v1/ai/playground` | Session/Bearer + tenant context | `-` | `{ appId?: string; sessionId?: string }` | `-` | `{ data\|payload, success? } \| { error }` | AI |
| `POST` | `/api/v1/ai/playground/session` | Session/Bearer + tenant context | `-` | `{ appId?: string }` | `{ sessionId?: string; modelId?: string; strategyId?: string; personaId?: string }` | `{ data\|payload, success? } \| { error }` | AI |
| `POST` | `/api/v1/ai/playground/strategy` | Session/Bearer + tenant context | `-` | `{ appId?: string }` | `{ label: string; description?: string; activate?: boolean; rules?: { name?: string; provider?: string; modelId?: string; minConfidence?: number; maxConfidence?: number }[] }` | `{ data\|payload, success? } \| { error }` | AI |
| `GET` | `/api/v1/ai/playground/personas` | Session/Bearer + tenant context | `-` | `{ appId?: string }` | `-` | `{ data\|payload, success? } \| { error }` | AI |
| `POST` | `/api/v1/ai/playground/personas` | Session/Bearer + tenant context | `-` | `{ appId?: string }` | `{ label: string; systemInstruction: string; agentType: "ai_sales" \| "ai_support" \| "ai_general"; setAsDefaultForType?: boolean; setAsGlobalDefault?: boolean }` | `{ data\|payload, success? } \| { error }` | AI |
| `PATCH` | `/api/v1/ai/playground/personas/:personaId` | Session/Bearer + tenant context | `{ personaId: string }` | `{ appId?: string }` | `{ label?: string; systemInstruction?: string; agentType?: "ai_sales" \| "ai_support" \| "ai_general"; setAsDefaultForType?: boolean; setAsGlobalDefault?: boolean }` | `{ data\|payload, success? } \| { error }` | AI |
| `DELETE` | `/api/v1/ai/playground/personas/:personaId` | Session/Bearer + tenant context | `{ personaId: string }` | `{ appId?: string }` | `-` | `{ success } \| { error }` | AI |
| `PATCH` | `/api/v1/ai/playground/session/:sessionId` | Session/Bearer + tenant context | `{ sessionId: string }` | `{ appId?: string }` | `{ modelId?: string; strategyId?: string; personaId?: string }` | `{ data\|payload, success? } \| { error }` | AI |
| `POST` | `/api/v1/ai/playground/run` | Session/Bearer + tenant context | `-` | `{ appId?: string }` | `{ sessionId: string; message: string; modelId?: string; strategyId?: string; personaId?: string; selectedSourceIds?: string[]; ragTopK?: number; enqueue?: boolean }` | `{ data\|payload, success? } \| { error }` | AI |
| `GET` | `/api/v1/ai/playground/run/:jobId` | Session/Bearer + tenant context | `{ jobId: string }` | `{ appId?: string }` | `-` | `{ data\|payload, success? } \| { error }` | AI |
| `GET` | `/api/v1/ai/suggest/:conversationId` | Session/Bearer + tenant context | `{ conversationId: string }` | `{ appId?: string }` | `-` | `{ data\|payload, success? } \| { error }` | AI |
| `POST` | `/api/v1/ai/generate` | Session/Bearer + tenant context | `-` | `{ appId?: string }` | `{ message: string; conversationId?: string }` | `{ data\|payload, success? } \| { error }` | AI |
| `POST` | `/api/v1/ai/evaluate` | Session/Bearer + tenant context | `-` | `{ appId?: string }` | `{ appId?: string; conversationId: string; score: number; feedback?: string }` | `{ data\|payload, success? } \| { error }` | AI |
| `GET` | `/api/v1/ai_tools/` | App context or X-Business-Id | `-` | `{ business_id?: string }` | `-` | `{ data\|payload\|success? } \| { error }` | API Tools |
| `PUT` | `/api/v1/ai_tools/` | App context or X-Business-Id | `-` | `{ business_id?: string }` | `any` | `{ data\|payload\|success? } \| { error }` | API Tools |
| `POST` | `/api/v1/ai_tools/` | App context or X-Business-Id | `-` | `{ business_id?: string }` | `any` | `{ data\|payload\|success? } \| { error }` | API Tools |
| `POST` | `/api/v1/ai_tools/execute` | App context or X-Business-Id | `-` | `{ business_id?: string }` | `any` | `{ data\|payload\|success? } \| { error }` | API Tools |
| `PATCH` | `/api/v1/ai_tools/:id` | App context or X-Business-Id | `{ id: string }` | `{ business_id?: string }` | `any` | `{ data\|payload\|success? } \| { error }` | API Tools |
| `DELETE` | `/api/v1/ai_tools/:id` | App context or X-Business-Id | `{ id: string }` | `{ business_id?: string }` | `-` | `{ success } \| { error }` | API Tools |
| `GET` | `/api/v1/chatbots/` | Session/Bearer + tenant context | `-` | `-` | `-` | `{ data\|payload, success? } \| { error }` | Chatbot |
| `GET` | `/api/v1/chatbots/default` | Session/Bearer + tenant context | `-` | `-` | `-` | `{ data\|payload, success? } \| { error }` | Chatbot |
| `GET` | `/api/v1/chatbots/model-pricing` | Session/Bearer + tenant context | `-` | `-` | `-` | `{ data\|payload, success? } \| { error }` | Chatbot |
| `GET` | `/api/v1/chatbots/:id` | Session/Bearer + tenant context | `{ id: string }` | `-` | `-` | `{ data\|payload, success? } \| { error }` | Chatbot |
| `POST` | `/api/v1/chatbots/` | Session/Bearer + tenant context | `-` | `-` | `{ app_id?: string; name: string; description?: string; model?: string; prompt?: string; welcome_msg?: string; agent_transfer?: string; temperature?: number \| string; history_limit?: number \| string; context_limit?: number \| string; message_await?: number \| string; message_limit?: number \| string; max_file_read_window?: number \| string; is_silent_handoff_agent?: boolean \| string; watcher_enabled?: boolean \| string; session_only_memory?: boolean \| string; stop_after_handoff?: boolean \| string; usage_mode?: string; timezone?: string; label_condition?: string; selected_labels?: string[] \| string; app_data?: any; ai_followups?: any[] \| string; plugin_data?: any }` | `{ data\|payload, success? } \| { error }` | Chatbot |
| `PATCH` | `/api/v1/chatbots/:id` | Session/Bearer + tenant context | `{ id: string }` | `-` | `{ app_id?: string; name?: string; description?: string; model?: string; prompt?: string; welcome_msg?: string; agent_transfer?: string; temperature?: number \| string; history_limit?: number \| string; context_limit?: number \| string; message_await?: number \| string; message_limit?: number \| string; max_file_read_window?: number \| string; is_silent_handoff_agent?: boolean \| string; watcher_enabled?: boolean \| string; session_only_memory?: boolean \| string; stop_after_handoff?: boolean \| string; usage_mode?: string; timezone?: string; label_condition?: string; selected_labels?: string[] \| string; app_data?: any; ai_followups?: any[] \| string; plugin_data?: any }` | `{ data\|payload, success? } \| { error }` | Chatbot |
| `PUT` | `/api/v1/chatbots/:id` | Session/Bearer + tenant context | `{ id: string }` | `-` | `{ app_id?: string; name?: string; description?: string; model?: string; prompt?: string; welcome_msg?: string; agent_transfer?: string; temperature?: number \| string; history_limit?: number \| string; context_limit?: number \| string; message_await?: number \| string; message_limit?: number \| string; max_file_read_window?: number \| string; is_silent_handoff_agent?: boolean \| string; watcher_enabled?: boolean \| string; session_only_memory?: boolean \| string; stop_after_handoff?: boolean \| string; usage_mode?: string; timezone?: string; label_condition?: string; selected_labels?: string[] \| string; app_data?: any; ai_followups?: any[] \| string; plugin_data?: any }` | `{ data\|payload, success? } \| { error }` | Chatbot |
| `DELETE` | `/api/v1/chatbots/:id` | Session/Bearer + tenant context | `{ id: string }` | `-` | `-` | `{ success } \| { error }` | Chatbot |
| `POST` | `/api/v1/chatbots/:id/simulate` | Session/Bearer + tenant context | `{ id: string }` | `-` | `{ message?: string; history?: { role: string; content: string }[]; execute_tools?: boolean; ai_agent_id?: string; messages?: { id?: object \| object; message?: string; content?: string; role?: string; sent_by_type?: string; sent_by?: string; sent_by_name?: string; created_at?: string }[]; chat_data?: any; conversation_id?: string }` | `{ data\|payload, success? } \| { error }` | Chatbot |
| `GET` | `/api/v1/chatbots/:id/documents` | Session/Bearer + tenant context | `{ id: string }` | `-` | `-` | `{ data\|payload, success? } \| { error }` | Chatbot |
| `POST` | `/api/v1/chatbots/:id/documents` | Session/Bearer + tenant context | `{ id: string }` | `-` | `{ title: string; content: string; type?: string }` | `{ data\|payload, success? } \| { error }` | Chatbot |
| `PATCH` | `/api/v1/chatbots/:id/documents/:docId` | Session/Bearer + tenant context | `{ id: string; docId: string }` | `-` | `{ title?: string; content?: string; type?: string; metadata?: any }` | `{ data\|payload, success? } \| { error }` | Chatbot |
| `DELETE` | `/api/v1/chatbots/:id/documents/:docId` | Session/Bearer + tenant context | `{ id: string; docId: string }` | `-` | `-` | `{ success } \| { error }` | Chatbot |
| `GET` | `/api/v1/knowledge/` | Session/Bearer + tenant context | `-` | `{ appId?: string; categoryId?: string; q?: string; limit?: string }` | `-` | `{ data\|payload, success? } \| { error }` | Knowledge |
| `POST` | `/api/v1/knowledge/` | Session/Bearer + tenant context | `-` | `-` | `{ title: string; content?: string; type?: string; format?: string; embedding_model?: string; metadata?: any; source_type?: string; source_url?: string; file_name?: string; file_size?: number; file_type?: string; category_id?: string; files?: { file_name: string; mime_type?: string; file_size_bytes?: number; checksum_sha256?: string; storage_key?: string; storage_url?: string; language?: string; page_count?: number; duration_ms?: number; extraction_metadata?: any }[] }` | `{ data\|payload, success? } \| { error }` | Knowledge |
| `POST` | `/api/v1/knowledge/query` | Session/Bearer + tenant context | `-` | `-` | `{ query: string; topK?: number; selectedSourceIds?: string[]; modelId?: string; provider?: string }` | `{ data\|payload, success? } \| { error }` | Knowledge |
| `GET` | `/api/v1/knowledge/categories` | Session/Bearer + tenant context | `-` | `{ appId?: string }` | `-` | `{ data\|payload, success? } \| { error }` | Knowledge |
| `POST` | `/api/v1/knowledge/categories` | Session/Bearer + tenant context | `-` | `-` | `{ name: string; description?: string; parent_id?: string }` | `{ data\|payload, success? } \| { error }` | Knowledge |
| `DELETE` | `/api/v1/knowledge/categories/:id` | Session/Bearer + tenant context | `{ id: string }` | `-` | `-` | `{ success } \| { error }` | Knowledge |
| `GET` | `/api/v1/knowledge/sources` | Session/Bearer + tenant context | `-` | `{ appId?: string; categoryId?: string; q?: string; limit?: string }` | `-` | `{ data\|payload, success? } \| { error }` | Knowledge |
| `POST` | `/api/v1/knowledge/sources` | Session/Bearer + tenant context | `-` | `-` | `{ title: string; content?: string; type?: string; format?: string; embedding_model?: string; metadata?: any; source_type?: string; source_url?: string; file_name?: string; file_size?: number; file_type?: string; category_id?: string; files?: { file_name: string; mime_type?: string; file_size_bytes?: number; checksum_sha256?: string; storage_key?: string; storage_url?: string; language?: string; page_count?: number; duration_ms?: number; extraction_metadata?: any }[] }` | `{ data\|payload, success? } \| { error }` | Knowledge |
| `POST` | `/api/v1/knowledge/sources/upload` | Session/Bearer + tenant context | `-` | `-` | `{ file: string; embeddingModel?: string; title?: string; isPrivate?: boolean; tags?: string[] }` | `{ data\|payload } \| { error }` | Knowledge |
| `PATCH` | `/api/v1/knowledge/sources/:id` | Session/Bearer + tenant context | `{ id: string }` | `-` | `{ title?: string; content?: string; type?: string; format?: string; embedding_model?: string; metadata?: any; source_type?: string; source_url?: string; file_name?: string; file_size?: number; file_type?: string; category_id?: string; files?: { file_name: string; mime_type?: string; file_size_bytes?: number; checksum_sha256?: string; storage_key?: string; storage_url?: string; language?: string; page_count?: number; duration_ms?: number; extraction_metadata?: any }[] }` | `{ data\|payload, success? } \| { error }` | Knowledge |
| `DELETE` | `/api/v1/knowledge/sources/:id` | Session/Bearer + tenant context | `{ id: string }` | `-` | `-` | `{ success } \| { error }` | Knowledge |
| `POST` | `/api/v1/knowledge/retrieval/test` | Session/Bearer + tenant context | `-` | `-` | `{ query: string; topK?: number; selectedSourceIds?: string[]; modelId?: string; provider?: string }` | `{ data\|payload, success? } \| { error }` | Knowledge |
| `GET` | `/api/v1/knowledge/analytics` | Session/Bearer + tenant context | `-` | `{ appId?: string; window?: string; channel?: string }` | `-` | `{ data\|payload, success? } \| { error }` | Knowledge |
| `POST` | `/api/v1/knowledge/reindex` | Session/Bearer + tenant context | `-` | `-` | `{  }` | `{ data\|payload, success? } \| { error }` | Knowledge |
| `GET` | `/api/v1/knowledge/faqs` | Session/Bearer + tenant context | `-` | `{ appId?: string; categoryId?: string; q?: string }` | `-` | `{ data\|payload, success? } \| { error }` | Knowledge |
| `POST` | `/api/v1/knowledge/faqs` | Session/Bearer + tenant context | `-` | `-` | `{ question: string; answer: string; category_id?: string; priority?: number }` | `{ data\|payload, success? } \| { error }` | Knowledge |
| `PATCH` | `/api/v1/knowledge/faqs/:id` | Session/Bearer + tenant context | `{ id: string }` | `-` | `{ question?: string; answer?: string; category_id?: string; priority?: number; is_active?: boolean }` | `{ data\|payload, success? } \| { error }` | Knowledge |
| `DELETE` | `/api/v1/knowledge/faqs/:id` | Session/Bearer + tenant context | `{ id: string }` | `-` | `-` | `{ success } \| { error }` | Knowledge |
| `GET` | `/api/v1/knowledge/stats` | Session/Bearer + tenant context | `-` | `{ appId?: string }` | `-` | `{ data\|payload, success? } \| { error }` | Knowledge |
| `GET` | `/api/v1/flows/` | Session/Bearer + tenant context | `-` | `{ appId?: string }` | `-` | `{ data\|payload, success? } \| { error }` | Flow |
| `GET` | `/api/v1/flows/decision-policy` | Session/Bearer + tenant context | `-` | `{ appId?: string; flowId?: string }` | `-` | `{ data\|payload, success? } \| { error }` | Flow |
| `GET` | `/api/v1/flows/decision-evaluation` | Session/Bearer + tenant context | `-` | `{ appId?: string; flowId?: string; from?: string; to?: string; limit?: string }` | `-` | `{ data\|payload, success? } \| { error }` | Flow |
| `PUT` | `/api/v1/flows/decision-policy` | Session/Bearer + tenant context | `-` | `{ appId?: string; flowId?: string }` | `any` | `{ data\|payload, success? } \| { error }` | Flow |
| `GET` | `/api/v1/flows/conversations/:conversationId/ai-signals` | Session/Bearer + tenant context | `{ conversationId: string }` | `{ appId?: string; limit?: string }` | `-` | `{ data\|payload, success? } \| { error }` | Flow |
| `GET` | `/api/v1/flows/default` | Session/Bearer + tenant context | `-` | `{ appId?: string }` | `-` | `{ data\|payload, success? } \| { error }` | Flow |
| `GET` | `/api/v1/flows/:id` | Session/Bearer + tenant context | `{ id: string }` | `{ appId?: string }` | `-` | `{ data\|payload, success? } \| { error }` | Flow |
| `GET` | `/api/v1/flows/:id/executions` | Session/Bearer + tenant context | `{ id: string }` | `{ appId?: string; conversationId?: string; executionId?: string }` | `-` | `{ data\|payload, success? } \| { error }` | Flow |
| `GET` | `/api/v1/flows/:id/versions` | Session/Bearer + tenant context | `{ id: string }` | `{ appId?: string }` | `-` | `{ data\|payload, success? } \| { error }` | Flow |
| `POST` | `/api/v1/flows/` | Session/Bearer + tenant context | `-` | `{ appId?: string }` | `{ name: string; description?: string; trigger_type?: string; nodes?: any; edges?: any; active?: boolean; is_active?: boolean }` | `{ data\|payload, success? } \| { error }` | Flow |
| `POST` | `/api/v1/flows/:id/test-run` | Session/Bearer + tenant context | `{ id: string }` | `{ appId?: string }` | `any` | `{ data\|payload, success? } \| { error }` | Flow |
| `POST` | `/api/v1/flows/:id/debug-node` | Session/Bearer + tenant context | `{ id: string }` | `{ appId?: string }` | `{ nodeId: string; input: any }` | `{ data\|payload, success? } \| { error }` | Flow |
| `POST` | `/api/v1/flows/:id/default` | Session/Bearer + tenant context | `{ id: string }` | `{ appId?: string }` | `any` | `{ data\|payload, success? } \| { error }` | Flow |
| `PATCH` | `/api/v1/flows/:id` | Session/Bearer + tenant context | `{ id: string }` | `{ appId?: string }` | `{ name?: string; description?: string; nodes?: any; edges?: any; active?: boolean }` | `{ data\|payload, success? } \| { error }` | Flow |
| `DELETE` | `/api/v1/flows/:id` | Session/Bearer + tenant context | `{ id: string }` | `{ appId?: string }` | `-` | `{ success } \| { error }` | Flow |
| `POST` | `/api/v1/orchestration/decide` | Session/Bearer + tenant context | `-` | `-` | `{ appId: string; conversationId: string; messageId: string; messageContent: string; customerLanguage?: string; conversationHistory?: any[]; currentAgentId?: string }` | `{ data\|payload, success? } \| { error }` | AI |
| `GET` | `/api/v1/orchestration/agents` | Session/Bearer + tenant context | `-` | `{ appId?: string }` | `-` | `{ data\|payload, success? } \| { error }` | AI |
| `POST` | `/api/v1/orchestration/handoff` | Session/Bearer + tenant context | `-` | `-` | `{ conversationId: string; fromAgentId?: string; toAgentId: string; reason?: string }` | `{ data\|payload, success? } \| { error }` | AI |
| `GET` | `/api/v1/orchestration/handoffs/:conversationId` | Session/Bearer + tenant context | `{ conversationId: string }` | `-` | `-` | `{ data\|payload, success? } \| { error }` | AI |
| `GET` | `/api/v1/crm/pipelines` | Session/Bearer + tenant context | `-` | `{ appId?: string }` | `-` | `{ data\|payload\|success? } \| { error }` | CRM |
| `POST` | `/api/v1/crm/pipelines` | Session/Bearer + tenant context | `-` | `{ appId?: string }` | `{ name: string; pipelineType?: string; stages?: { name: string; color?: string; order?: number }[] }` | `{ data\|payload\|success? } \| { error }` | CRM |
| `DELETE` | `/api/v1/crm/pipelines/:id` | Session/Bearer + tenant context | `{ id: string }` | `-` | `-` | `{ success } \| { error }` | CRM |
| `GET` | `/api/v1/crm/deals/:conversationId` | Session/Bearer + tenant context | `{ conversationId: string }` | `-` | `-` | `{ data\|payload\|success? } \| { error }` | CRM |
| `PATCH` | `/api/v1/crm/deals/:conversationId` | Session/Bearer + tenant context | `{ conversationId: string }` | `-` | `{ pipeline_id?: string; stage_id?: string; deal_value?: number; notes?: string }` | `{ data\|payload\|success? } \| { error }` | CRM |
| `GET` | `/api/v1/teams/` | Session/Bearer + tenant context | `-` | `{ appId?: string; accountId?: string }` | `-` | `{ data\|payload\|success? } \| { error }` | Team |
| `GET` | `/api/v1/teams/:id` | Session/Bearer + tenant context | `{ id: string }` | `{ appId?: string; accountId?: string }` | `-` | `{ data\|payload\|success? } \| { error }` | Team |
| `POST` | `/api/v1/teams/` | Session/Bearer + tenant context | `-` | `{ appId?: string; accountId?: string }` | `{ name: string; description?: string; allow_auto_assign?: boolean }` | `{ data\|payload\|success? } \| { error }` | Team |
| `PATCH` | `/api/v1/teams/:id` | Session/Bearer + tenant context | `{ id: string }` | `{ appId?: string; accountId?: string }` | `{ name?: string; description?: string; allow_auto_assign?: boolean }` | `{ data\|payload\|success? } \| { error }` | Team |
| `DELETE` | `/api/v1/teams/:id` | Session/Bearer + tenant context | `{ id: string }` | `{ appId?: string; accountId?: string }` | `-` | `{ success } \| { error }` | Team |
| `POST` | `/api/v1/teams/:id/members` | Session/Bearer + tenant context | `{ id: string }` | `-` | `{ userId: string }` | `{ data\|payload\|success? } \| { error }` | Team |
| `DELETE` | `/api/v1/teams/:id/members/:userId` | Session/Bearer + tenant context | `{ id: string; userId: string }` | `-` | `-` | `{ success } \| { error }` | Team |
| `GET` | `/api/v1/inboxes/` | Session/Bearer + tenant context | `-` | `{ appId?: string; accountId?: string }` | `-` | `{ data\|payload\|success? } \| { error }` | Inbox |
| `GET` | `/api/v1/inboxes/:id` | Session/Bearer + tenant context | `{ id: string }` | `{ accountId?: string }` | `-` | `{ data\|payload\|success? } \| { error }` | Inbox |
| `POST` | `/api/v1/inboxes/` | Session/Bearer + tenant context | `-` | `{ accountId?: string }` | `{ name: string; channel_type: string; channel_config?: any }` | `{ data\|payload\|success? } \| { error }` | Inbox |
| `PATCH` | `/api/v1/inboxes/:id` | Session/Bearer + tenant context | `{ id: string }` | `{ accountId?: string }` | `{ name?: string; channel_config?: any; chatbot_id?: string \| null }` | `{ data\|payload\|success? } \| { error }` | Inbox |
| `DELETE` | `/api/v1/inboxes/:id` | Session/Bearer + tenant context | `{ id: string }` | `{ accountId?: string }` | `-` | `{ success } \| { error }` | Inbox |
| `GET` | `/api/v1/agents-management/` | Session/Bearer + tenant context | `-` | `{ appId?: string; q?: string }` | `-` | `{ data\|payload\|success? } \| { error }` | User |
| `POST` | `/api/v1/agents-management/` | Session/Bearer + tenant context | `-` | `{ appId?: string }` | `{ name: string; email: string; password: string; phone_number?: string; role?: string; supervisor_id?: string \| null; divisions?: string[]; channels?: string[] }` | `{ data\|payload\|success? } \| { error }` | User |
| `GET` | `/api/v1/agents-management/login-link` | Session/Bearer + tenant context | `-` | `-` | `-` | `{ data\|payload\|success? } \| { error }` | User |
| `PATCH` | `/api/v1/agents-management/:id` | Session/Bearer + tenant context | `{ id: string }` | `{ appId?: string }` | `{ name?: string; email?: string; password?: string; phone_number?: string; role?: string; status?: string; is_available?: boolean; active?: boolean; supervisor_id?: string \| null; divisions?: string[]; channels?: string[] }` | `{ data\|payload\|success? } \| { error }` | User |
| `PUT` | `/api/v1/agents-management/:id` | Session/Bearer + tenant context | `{ id: string }` | `{ appId?: string }` | `{ name?: string; email?: string; password?: string; phone_number?: string; role?: string; status?: string; is_available?: boolean; active?: boolean; supervisor_id?: string \| null; divisions?: string[]; channels?: string[] }` | `{ data\|payload\|success? } \| { error }` | User |
| `DELETE` | `/api/v1/agents-management/:id` | Session/Bearer + tenant context | `{ id: string }` | `-` | `-` | `{ success } \| { error }` | User |
| `GET` | `/api/v1/agents-management/divisions` | Session/Bearer + tenant context | `-` | `{ appId?: string }` | `-` | `{ data\|payload\|success? } \| { error }` | User |
| `POST` | `/api/v1/agents-management/divisions` | Session/Bearer + tenant context | `-` | `{ appId?: string }` | `{ name: string; description?: string; color?: string }` | `{ data\|payload\|success? } \| { error }` | User |
| `PUT` | `/api/v1/agents-management/divisions/:id` | Session/Bearer + tenant context | `{ id: string }` | `{ appId?: string }` | `{ name?: string; description?: string; color?: string; parent_division_id?: string \| null }` | `{ data\|payload\|success? } \| { error }` | User |
| `DELETE` | `/api/v1/agents-management/divisions/:id` | Session/Bearer + tenant context | `{ id: string }` | `{ appId?: string }` | `-` | `{ success } \| { error }` | User |
| `GET` | `/api/v1/agents/` | Session/Bearer + tenant context | `-` | `{ appId?: string; q?: string }` | `-` | `{ data\|payload\|success? } \| { error }` | User |
| `POST` | `/api/v1/agents/` | Session/Bearer + tenant context | `-` | `{ appId?: string }` | `{ name: string; email: string; password: string; phone_number?: string; role?: string; supervisor_id?: string \| null; divisions?: string[]; channels?: string[] }` | `{ data\|payload\|success? } \| { error }` | User |
| `GET` | `/api/v1/agents/login-link` | Session/Bearer + tenant context | `-` | `-` | `-` | `{ data\|payload\|success? } \| { error }` | User |
| `PATCH` | `/api/v1/agents/:id` | Session/Bearer + tenant context | `{ id: string }` | `{ appId?: string }` | `{ name?: string; email?: string; password?: string; phone_number?: string; role?: string; status?: string; is_available?: boolean; active?: boolean; supervisor_id?: string \| null; divisions?: string[]; channels?: string[] }` | `{ data\|payload\|success? } \| { error }` | User |
| `PUT` | `/api/v1/agents/:id` | Session/Bearer + tenant context | `{ id: string }` | `{ appId?: string }` | `{ name?: string; email?: string; password?: string; phone_number?: string; role?: string; status?: string; is_available?: boolean; active?: boolean; supervisor_id?: string \| null; divisions?: string[]; channels?: string[] }` | `{ data\|payload\|success? } \| { error }` | User |
| `DELETE` | `/api/v1/agents/:id` | Session/Bearer + tenant context | `{ id: string }` | `-` | `-` | `{ success } \| { error }` | User |
| `GET` | `/api/v1/agents/divisions` | Session/Bearer + tenant context | `-` | `{ appId?: string }` | `-` | `{ data\|payload\|success? } \| { error }` | User |
| `POST` | `/api/v1/agents/divisions` | Session/Bearer + tenant context | `-` | `{ appId?: string }` | `{ name: string; description?: string; color?: string }` | `{ data\|payload\|success? } \| { error }` | User |
| `PUT` | `/api/v1/agents/divisions/:id` | Session/Bearer + tenant context | `{ id: string }` | `{ appId?: string }` | `{ name?: string; description?: string; color?: string; parent_division_id?: string \| null }` | `{ data\|payload\|success? } \| { error }` | User |
| `DELETE` | `/api/v1/agents/divisions/:id` | Session/Bearer + tenant context | `{ id: string }` | `{ appId?: string }` | `-` | `{ success } \| { error }` | User |
| `GET` | `/api/v1/labels/` | Session/Bearer + tenant context | `-` | `{ appId?: string }` | `-` | `{ data\|payload\|success? } \| { error }` | Label |
| `POST` | `/api/v1/labels/` | Session/Bearer + tenant context | `-` | `{ appId?: string }` | `{ title?: string; name?: string; description?: string; color?: string }` | `{ data\|payload\|success? } \| { error }` | Label |
| `PATCH` | `/api/v1/labels/:id` | Session/Bearer + tenant context | `{ id: string }` | `{ appId?: string }` | `{ title?: string; name?: string; description?: string; color?: string }` | `{ data\|payload\|success? } \| { error }` | Label |
| `DELETE` | `/api/v1/labels/:id` | Session/Bearer + tenant context | `{ id: string }` | `{ appId?: string }` | `-` | `{ success } \| { error }` | Label |
| `GET` | `/api/v1/labels/conversation/:id` | Session/Bearer + tenant context | `{ id: string }` | `-` | `-` | `{ data\|payload\|success? } \| { error }` | Label |
| `POST` | `/api/v1/labels/conversation/:id` | Session/Bearer + tenant context | `{ id: string }` | `-` | `{ labelId: string }` | `{ data\|payload\|success? } \| { error }` | Label |
| `DELETE` | `/api/v1/labels/conversation/:id/:labelId` | Session/Bearer + tenant context | `{ id: string; labelId: string }` | `-` | `-` | `{ success } \| { error }` | Label |
| `GET` | `/api/v1/broadcasts/` | Session/Bearer + tenant context | `-` | `{ appId?: string }` | `-` | `{ data\|payload, success? } \| { error }` | Broadcast |
| `GET` | `/api/v1/broadcasts/jobs` | Session/Bearer + tenant context | `-` | `{ appId?: string; page?: string; limit?: string; status?: string \| string[]; statuses?: string \| string[] }` | `-` | `{ data\|payload, success? } \| { error }` | Broadcast |
| `GET` | `/api/v1/broadcasts/jobs/:id` | Session/Bearer + tenant context | `{ id: string }` | `{ appId?: string }` | `-` | `{ data\|payload, success? } \| { error }` | Broadcast |
| `POST` | `/api/v1/broadcasts/audience/preview` | Session/Bearer + tenant context | `-` | `{ appId?: string }` | `{ filters?: any }` | `{ data\|payload, success? } \| { error }` | Broadcast |
| `GET` | `/api/v1/broadcasts/:id` | Session/Bearer + tenant context | `{ id: string }` | `{ appId?: string }` | `-` | `{ data\|payload, success? } \| { error }` | Broadcast |
| `POST` | `/api/v1/broadcasts/` | Session/Bearer + tenant context | `-` | `{ appId?: string }` | `{ title: string; message_type?: "text" \| "template"; message_content?: string; template_name?: string; template_language?: string; template_params?: any; target_audience?: any; scheduled_at?: string }` | `{ data\|payload, success? } \| { error }` | Broadcast |
| `POST` | `/api/v1/broadcasts/:id/send` | Session/Bearer + tenant context | `{ id: string }` | `{ appId?: string }` | `-` | `{ data\|payload, success? } \| { error }` | Broadcast |
| `GET` | `/api/v1/handover/queue` | Session/Bearer + tenant context | `-` | `{ appId?: string }` | `-` | `{ data\|payload\|success? } \| { error }` | Handover |
| `GET` | `/api/v1/handover/rules` | Session/Bearer + tenant context | `-` | `{ appId?: string }` | `-` | `{ data\|payload\|success? } \| { error }` | Handover |
| `GET` | `/api/v1/handover/roster` | Session/Bearer + tenant context | `-` | `{ appId?: string }` | `-` | `{ data\|payload\|success? } \| { error }` | Handover |
| `GET` | `/api/v1/handover/logs` | Session/Bearer + tenant context | `-` | `{ appId?: string; conversationId?: string; limit?: string; period?: string }` | `-` | `{ data\|payload\|success? } \| { error }` | Handover |
| `GET` | `/api/v1/handover/analytics` | Session/Bearer + tenant context | `-` | `{ appId?: string; period?: string }` | `-` | `{ data\|payload\|success? } \| { error }` | Handover |
| `POST` | `/api/v1/handover/requests` | Session/Bearer + tenant context | `-` | `-` | `{ conversationId: string; requestType?: "take" \| "reassign"; targetAgentId?: string; requestNote?: string; sourceRuleId?: string }` | `{ data\|payload\|success? } \| { error }` | Handover |
| `POST` | `/api/v1/handover/requests/:id/approve` | Session/Bearer + tenant context | `{ id: string }` | `-` | `{ approvalNote?: string }` | `{ data\|payload\|success? } \| { error }` | Handover |
| `POST` | `/api/v1/handover/requests/:id/reject` | Session/Bearer + tenant context | `{ id: string }` | `-` | `{ rejectionNote?: string }` | `{ data\|payload\|success? } \| { error }` | Handover |
| `GET` | `/api/v1/handover/requests/:id/status` | Session/Bearer + tenant context | `{ id: string }` | `{ appId?: string }` | `-` | `{ data\|payload\|success? } \| { error }` | Handover |
| `POST` | `/api/v1/handover/escalations/run` | Session/Bearer + tenant context | `-` | `{ appId?: string }` | `-` | `{ data\|payload\|success? } \| { error }` | Handover |
| `GET` | `/api/v1/handover/conversation/:conversationId/logs` | Session/Bearer + tenant context | `{ conversationId: string }` | `-` | `-` | `{ data\|payload\|success? } \| { error }` | Handover |
| `GET` | `/api/v1/forms/` | Session/Bearer + tenant context | `-` | `{ appId: string }` | `-` | `{ data\|payload\|success? } \| { error }` | Advanced |
| `GET` | `/api/v1/forms/:id` | Session/Bearer + tenant context | `{ id: string }` | `-` | `-` | `{ data\|payload\|success? } \| { error }` | Advanced |
| `POST` | `/api/v1/forms/` | Session/Bearer + tenant context | `-` | `{ appId: string }` | `{ name: string; description?: string; fields: { field_key: string; label: string; field_type: string; is_required: boolean }[] }` | `{ data\|payload\|success? } \| { error }` | Advanced |
| `GET` | `/api/v1/forms/conversation/:id` | Session/Bearer + tenant context | `{ id: string }` | `-` | `-` | `{ data\|payload\|success? } \| { error }` | Advanced |
| `POST` | `/api/v1/forms/conversation/:id/extract` | Session/Bearer + tenant context | `{ id: string }` | `-` | `-` | `{ data\|payload\|success? } \| { error }` | Advanced |
| `GET` | `/api/v1/metrics/summary` | Session/Bearer + tenant context | `-` | `{ appId?: string; period?: string }` | `-` | `{ data\|payload\|success? } \| { error }` | Advanced |
| `GET` | `/api/v1/metrics/dashboard` | Session/Bearer + tenant context | `-` | `{ appId?: string; period?: "today" \| "7d" \| "30d" }` | `-` | `{ data\|payload\|success? } \| { error }` | Advanced |
| `GET` | `/api/v1/metrics/ai` | Session/Bearer + tenant context | `-` | `{ appId?: string }` | `-` | `{ data\|payload\|success? } \| { error }` | Advanced |
| `GET` | `/api/v1/orders/` | Session/Bearer + tenant context | `-` | `{ page?: string; limit?: string; payment_type?: string; order_status?: string; inbox_id?: string; search?: string; sort_field?: string; sort_direction?: string; include_conv?: string }` | `-` | `{ data\|payload, success? } \| { error }` | Orders |
| `GET` | `/api/v1/orders/report` | Session/Bearer + tenant context | `-` | `{ startDate?: string; endDate?: string }` | `-` | `{ data\|payload, success? } \| { error }` | Orders |
| `GET` | `/api/v1/orders/subscriptions` | Session/Bearer + tenant context | `-` | `{ page?: string; limit?: string; search?: string; sort_field?: string; sort_direction?: string }` | `-` | `{ data\|payload, success? } \| { error }` | Orders |
| `GET` | `/api/v1/commerce/products` | Session/Bearer + tenant context | `-` | `-` | `-` | `{ data\|payload, success? } \| { error }` | Commerce |
| `POST` | `/api/v1/commerce/products` | Session/Bearer + tenant context | `-` | `-` | `any` | `{ data\|payload, success? } \| { error }` | Commerce |
| `PATCH` | `/api/v1/commerce/products/:id` | Session/Bearer + tenant context | `{ id: string }` | `-` | `any` | `{ data\|payload, success? } \| { error }` | Commerce |
| `DELETE` | `/api/v1/commerce/products/:id` | Session/Bearer + tenant context | `{ id: string }` | `-` | `-` | `{ success } \| { error }` | Commerce |
| `POST` | `/api/v1/commerce/products/:id/variants` | Session/Bearer + tenant context | `{ id: string }` | `-` | `any` | `{ data\|payload, success? } \| { error }` | Commerce |
| `POST` | `/api/v1/commerce/products/:id/variants/bulk-upsert` | Session/Bearer + tenant context | `{ id: string }` | `-` | `any` | `{ data\|payload, success? } \| { error }` | Commerce |
| `PATCH` | `/api/v1/commerce/variants/:id` | Session/Bearer + tenant context | `{ id: string }` | `-` | `any` | `{ data\|payload, success? } \| { error }` | Commerce |
| `DELETE` | `/api/v1/commerce/variants/:id` | Session/Bearer + tenant context | `{ id: string }` | `-` | `-` | `{ success } \| { error }` | Commerce |
| `POST` | `/api/v1/commerce/variants/:id/stock-adjust` | Session/Bearer + tenant context | `{ id: string }` | `-` | `any` | `{ data\|payload, success? } \| { error }` | Commerce |
| `GET` | `/api/v1/commerce/stock/variants` | Session/Bearer + tenant context | `-` | `any` | `-` | `{ data\|payload, success? } \| { error }` | Commerce |
| `GET` | `/api/v1/commerce/stock/movements` | Session/Bearer + tenant context | `-` | `any` | `-` | `{ data\|payload, success? } \| { error }` | Commerce |
| `GET` | `/api/v1/commerce/orders` | Session/Bearer + tenant context | `-` | `any` | `-` | `{ data\|payload, success? } \| { error }` | Commerce |
| `GET` | `/api/v1/commerce/orders/:orderId` | Session/Bearer + tenant context | `{ orderId: string }` | `-` | `-` | `{ data\|payload, success? } \| { error }` | Commerce |
| `GET` | `/api/v1/commerce/conversations/:conversationId/summary` | Session/Bearer + tenant context | `{ conversationId: string }` | `-` | `-` | `{ data\|payload, success? } \| { error }` | Commerce |
| `POST` | `/api/v1/commerce/orders/add-to-cart` | Session/Bearer + tenant context | `-` | `-` | `any` | `{ data\|payload, success? } \| { error }` | Commerce |
| `POST` | `/api/v1/commerce/orders/:orderId/checkout` | Session/Bearer + tenant context | `{ orderId: string }` | `-` | `any` | `{ data\|payload, success? } \| { error }` | Commerce |
| `POST` | `/api/v1/commerce/orders/:orderId/send-payment-link` | Session/Bearer + tenant context | `{ orderId: string }` | `-` | `any` | `{ data\|payload, success? } \| { error }` | Commerce |
| `POST` | `/api/v1/commerce/orders/:orderId/cancel` | Session/Bearer + tenant context | `{ orderId: string }` | `-` | `any` | `{ data\|payload, success? } \| { error }` | Commerce |
| `GET` | `/api/v1/commerce/settings/pakasir` | Session/Bearer + tenant context | `-` | `-` | `-` | `{ data\|payload, success? } \| { error }` | Commerce |
| `PATCH` | `/api/v1/commerce/settings/pakasir` | Session/Bearer + tenant context | `-` | `-` | `any` | `{ data\|payload, success? } \| { error }` | Commerce |
| `GET` | `/api/v1/public/invoices/:token` | Session/Bearer + tenant context | `{ token: string }` | `-` | `-` | `{ data\|payload, success? } \| { error }` | Commerce |
| `GET` | `/api/v1/public/payment-success` | Session/Bearer + tenant context | `-` | `any` | `-` | `{ data\|payload, success? } \| { error }` | Commerce |
| `GET` | `/api/v1/canned-responses/` | Session/Bearer + tenant context | `-` | `{ accountId: string }` | `-` | `{ data\|payload\|success? } \| { error }` | Message |
| `POST` | `/api/v1/canned-responses/` | Session/Bearer + tenant context | `-` | `{ accountId: string }` | `{ short_code: string; content: string }` | `{ data\|payload\|success? } \| { error }` | Message |
| `DELETE` | `/api/v1/canned-responses/:id` | Session/Bearer + tenant context | `{ id: string }` | `{ accountId: string }` | `-` | `{ success } \| { error }` | Message |
| `GET` | `/api/v1/agent-settings/` | Session/Bearer + tenant context | `-` | `{ appId?: string }` | `-` | `{ data\|payload\|success? } \| { error }` | Admin |
| `PUT` | `/api/v1/agent-settings/` | Session/Bearer + tenant context | `-` | `{ appId?: string }` | `{ default_ticket_board_id?: string \| null; auto_assign_agent?: boolean; agent_can_takeover_unserved?: boolean; agent_can_access_customers?: boolean; agent_can_import_export_customers?: boolean; agent_can_send_broadcast?: boolean; agent_can_broadcast_in_service_window?: boolean; hide_agent_status_toggle?: boolean; hide_customer_id?: boolean; agent_can_assign_chat?: boolean; agent_can_add_agents_to_chat?: boolean; agent_can_leave_chat?: boolean; hide_handover_dialogue?: boolean; agent_can_manage_quick_replies?: boolean }` | `{ data\|payload\|success? } \| { error }` | Admin |
| `GET` | `/api/v1/templates` | Session/Bearer + tenant context | `-` | `{ appId?: string; limit?: string; status?: string; category?: string; search?: string; channelId?: string }` | `-` | `{ data\|payload\|success? } \| { error }` | WhatsApp |
| `POST` | `/api/v1/templates/sync` | Session/Bearer + tenant context | `-` | `-` | `{ channelId?: string }` | `{ data\|payload\|success? } \| { error }` | WhatsApp |
| `GET` | `/api/v1/template-variables/` | Session/Bearer + tenant context | `-` | `-` | `-` | `{ data\|payload\|success? } \| { error }` | Template Variables |
| `POST` | `/api/v1/template-variables/` | Session/Bearer + tenant context | `-` | `-` | `{ app_id?: string; name: string; category?: string; value: string; fallback_value?: string }` | `{ data\|payload\|success? } \| { error }` | Template Variables |
| `DELETE` | `/api/v1/template-variables/:id` | Session/Bearer + tenant context | `{ id: string }` | `-` | `-` | `{ success } \| { error }` | Template Variables |

## Mounted vs Present Source Modules

Mounted from root: auth, user, conversation, message, contact, customer, whatsapp, waba, webhook, business_webhooks, webhooks, media, ai, ai_tools, chatbot, knowledge, flows, orchestration, crm, teams, inboxes, agents-management, agents, labels, broadcasts, handover, forms, metrics, orders, commerce, canned-responses, agent-settings, whatsapp templates, template variables, developer keys, compatibility AI provider routes.

Present but not mounted by `src/index.ts`: `instagram`, `organization`, `scalebiz-compat`. Do not depend on those endpoints unless root mounting is added.
