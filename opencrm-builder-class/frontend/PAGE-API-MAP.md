# Page ↔ API Map — Frontend

Generated from `apps/frontend/src/routes/**/*`, `apps/frontend/src/components/**/*`, `apps/frontend/src/lib/api.ts`, and `apps/frontend/src/lib/socket.ts` on 2026-04-29.

## API Client Namespaces

| Namespace | Methods seen in `lib/api.ts` |
|---|---|
| `agents` | `list` |
| `ai` | `analyze`, `autoRespond`, `createPlaygroundPersona`, `createPlaygroundStrategy`, `deletePlaygroundPersona`, `evaluate`, `generateResponse`, `getPlayground`, `getPlaygroundPersonas`, `getPlaygroundRunStatus`, `getProviders`, `getSettings`, `getSuggestion`, `resetPlaygroundSession`, `runPlayground`, `updatePlaygroundPersona`, `updatePlaygroundSession`, `updateSettings` |
| `auth` | `login`, `logout`, `me` |
| `automationFlows` | `create`, `debugNode`, `delete`, `get`, `getDefault`, `getExecutions`, `getVersions`, `list`, `setDefault`, `testRun`, `update` |
| `broadcasts` | `create`, `delete`, `get`, `getJob`, `list`, `listJobs`, `previewAudience`, `send` |
| `chatbots` | `create`, `delete`, `documents`, `get`, `getDefault`, `list`, `update` |
| `commerce` | `addToCart`, `adjustStock`, `bulkUpsertVariants`, `cancelOrder`, `checkout`, `createProduct`, `createVariant`, `deleteProduct`, `deleteVariant`, `getConversationSummary`, `getOrderDetail`, `getPakasirSettings`, `getPublicInvoice`, `getPublicPaymentSuccess`, `listOrders`, `listProducts`, `listStockMovements`, `listStockVariants`, `sendPaymentLink`, `updatePakasirSettings`, `updateProduct`, `updateVariant` |
| `contactConversations` | `list` |
| `contacts` | `block`, `blockCall`, `get`, `list`, `merge`, `settings`, `update` |
| `conversations` | `addAgent`, `addLabel`, `addNote`, `assign`, `bulkEdit`, `deleteNote`, `get`, `getActivity`, `getAgents`, `getBulkEditJob`, `getContactDetail`, `getCounts`, `getLabels`, `getMessages`, `getNotes`, `list`, `markAsRead`, `removeAgent`, `removeLabel`, `resolve`, `sendMessage`, `suggestReply`, `takeover`, `updateStatus` |
| `customers` | `addTag`, `get`, `levels`, `list`, `removeTag`, `stats`, `update` |
| `handover` | `approveRequest`, `createRequest`, `getAnalytics`, `getConversationLogs`, `getLogs`, `getQueue`, `getRoster`, `getRules`, `rejectRequest` |
| `inboxes` | `create`, `delete`, `get`, `list`, `update` |
| `knowledge` | `add`, `analytics`, `createSource`, `deleteSource`, `list`, `query`, `retrievalTest`, `uploadSourceFile` |
| `labels` | `create`, `delete`, `list`, `update` |
| `media` | `gallery`, `upload` |
| `metrics` | `clear`, `getAI`, `getAgents`, `getDashboard`, `getRouting`, `getSummary` |
| `n8nEmbed` | `login` |
| `orders` | `list`, `listSubscriptions`, `report` |
| `routing` | `getRules`, `route` |
| `teams` | `addMember`, `create`, `delete`, `get`, `list`, `removeMember`, `update` |
| `tickets` | `getBoard`, `getConversationSummary`, `getSettings`, `setDefaultBoard` |
| `userTimezone` | `detect`, `get`, `reset`, `update` |
| `whatsappChannels` | `delete`, `getDetails`, `removeBadge`, `sync`, `update`, `uploadBadge` |
| `whatsappTemplates` | `list`, `sync` |

## Route Page Mapping

### `/`

Source: `apps/frontend/src/routes/_app.tsx`

- API client calls: -
- Direct fetch/new URL: -
- Socket events: -
- Data flow: static/layout route; no direct backend call found in route file.

### `/ai-agents/:agentId`

Source: `apps/frontend/src/routes/_app/ai-agents/$agentId.tsx`

- API client calls: -
- Direct fetch/new URL: ``${API_URL}/api/chatbots/${agentId}/documents/${editingTextDoc.id}``; ``${API_URL}/api/chatbots/${agentId}/documents/${id}``; ``${API_URL}/api/chatbots/${agentId}/documents``; ``${API_URL}/api/chatbots/${agentId}/evaluations/${evalId}``; ``${API_URL}/api/chatbots/${agentId}/evaluations?page=${evaluationPage}``; ``${API_URL}/api/chatbots/${agentId}/evaluations``; ``${API_URL}/api/chatbots/${agentId}/simulate``; ``${API_URL}/api/chatbots/${agentId}``; ``${API_URL}/api/chatbots/model-pricing``; ``${API_URL}/api/crm/pipelines``; ``${API_URL}/api/inboxes/${inboxId}``; ``${API_URL}/api/inboxes``; ``${API_URL}/api/knowledge/categories/${id}``; ``${API_URL}/api/knowledge/categories?chatbot_id=${agentId}``; ``${API_URL}/api/knowledge/faqs/${id}``; ``${API_URL}/api/knowledge/faqs?chatbot_id=${agentId}``; ``${API_URL}/api/knowledge?chatbot_id=${agentId}``; ``${API_URL}/api/knowledge``; ``${API_URL}/api/labels``; ``${API_URL}/api/media/upload-knowledge``; ``${import.meta.env.VITE_API_URL || '/api'}/knowledge/collect-links``; `new URL(`${API_URL}/api/ai_tools`)`
- Socket events: -
- Data flow: mount/param change -> call API client/direct fetch -> normalize response -> set React state -> render; user action repeats call and refreshes affected state.

### `/ai`

Source: `apps/frontend/src/routes/_app/ai.tsx`

- API client calls: `ai`: `createPlaygroundStrategy`, `getPlayground`, `getPlaygroundRunStatus`, `resetPlaygroundSession`, `runPlayground`, `updatePlaygroundSession`
- Direct fetch/new URL: -
- Socket events: -
- Data flow: mount/param change -> call API client/direct fetch -> normalize response -> set React state -> render; user action repeats call and refreshes affected state.

### `/analytics`

Source: `apps/frontend/src/routes/_app/analytics.tsx`

- API client calls: `metrics`: `getDashboard`
- Direct fetch/new URL: -
- Socket events: -
- Data flow: mount/param change -> call API client/direct fetch -> normalize response -> set React state -> render; user action repeats call and refreshes affected state.

### `/apps/:appSlug`

Source: `apps/frontend/src/routes/_app/apps/$appSlug.tsx`

- API client calls: -
- Direct fetch/new URL: ``${API_BASE}/app-center/apps/${appSlug}``; ``${API_BASE}/app-center/install``; ``${API_BASE}/app-center/installed``; ``${API_BASE}/app-center/toggle/${installation.installation_id}``; ``${API_BASE}/app-center/uninstall/${installation.installation_id}``
- Socket events: -
- Data flow: mount/param change -> call API client/direct fetch -> normalize response -> set React state -> render; user action repeats call and refreshes affected state.

### `/apps`

Source: `apps/frontend/src/routes/_app/apps/index.tsx`

- API client calls: -
- Direct fetch/new URL: ``${API_BASE}/app-center/apps?${params.toString(`; ``${API_BASE}/app-center/categories``; ``${API_BASE}/app-center/install``; ``${API_BASE}/app-center/installed``
- Socket events: -
- Data flow: mount/param change -> call API client/direct fetch -> normalize response -> set React state -> render; user action repeats call and refreshes affected state.

### `/apps/meta-ads-tracker`

Source: `apps/frontend/src/routes/_app/apps/meta-ads-tracker.tsx`

- API client calls: -
- Direct fetch/new URL: -
- Socket events: -
- Data flow: static/layout route; no direct backend call found in route file.

### `/broadcast`

Source: `apps/frontend/src/routes/_app/broadcast.tsx`

- API client calls: `broadcasts`: `create`, `listJobs`, `previewAudience`, `send`; `customers`: `list`; `whatsappTemplates`: `list`
- Direct fetch/new URL: -
- Socket events: -
- Data flow: mount/param change -> call API client/direct fetch -> normalize response -> set React state -> render; user action repeats call and refreshes affected state.

### `/channels/bot`

Source: `apps/frontend/src/routes/_app/channels/bot.tsx`

- API client calls: -
- Direct fetch/new URL: -
- Socket events: -
- Data flow: static/layout route; no direct backend call found in route file.

### `/channels/custom`

Source: `apps/frontend/src/routes/_app/channels/custom.tsx`

- API client calls: -
- Direct fetch/new URL: -
- Socket events: -
- Data flow: static/layout route; no direct backend call found in route file.

### `/channels/facebook`

Source: `apps/frontend/src/routes/_app/channels/facebook.tsx`

- API client calls: -
- Direct fetch/new URL: -
- Socket events: -
- Data flow: static/layout route; no direct backend call found in route file.

### `/channels/line`

Source: `apps/frontend/src/routes/_app/channels/line.tsx`

- API client calls: -
- Direct fetch/new URL: -
- Socket events: -
- Data flow: static/layout route; no direct backend call found in route file.

### `/channels/livechat`

Source: `apps/frontend/src/routes/_app/channels/livechat.tsx`

- API client calls: -
- Direct fetch/new URL: -
- Socket events: -
- Data flow: static/layout route; no direct backend call found in route file.

### `/channels/telegram`

Source: `apps/frontend/src/routes/_app/channels/telegram.tsx`

- API client calls: -
- Direct fetch/new URL: -
- Socket events: -
- Data flow: static/layout route; no direct backend call found in route file.

### `/channels/whatsapp`

Source: `apps/frontend/src/routes/_app/channels/whatsapp.tsx`

- API client calls: -
- Direct fetch/new URL: ``${API_BASE}/waba/connect/manual``; ``${API_BASE}/whatsapp-channels/${id}/toggle``; ``${API_BASE}/whatsapp-channels``
- Socket events: -
- Data flow: mount/param change -> call API client/direct fetch -> normalize response -> set React state -> render; user action repeats call and refreshes affected state.

### `/channels/whatsapp/:channelId`

Source: `apps/frontend/src/routes/_app/channels/whatsapp/$channelId.tsx`

- API client calls: `whatsappChannels`: `delete`, `getDetails`, `removeBadge`, `sync`, `update`, `uploadBadge`; `whatsappTemplates`: `list`, `sync`; `teams`: `list`; `chatbots`: `list`; `agents`: `list`; `automationFlows`: `list`
- Direct fetch/new URL: -
- Socket events: -
- Data flow: mount/param change -> call API client/direct fetch -> normalize response -> set React state -> render; user action repeats call and refreshes affected state.

### `/channels/whatsapp/success`

Source: `apps/frontend/src/routes/_app/channels/whatsapp/success.tsx`

- API client calls: -
- Direct fetch/new URL: -
- Socket events: -
- Data flow: static/layout route; no direct backend call found in route file.

### `/chat`

Source: `apps/frontend/src/routes/_app/chat.tsx`

- API client calls: `commerce`: `checkout`, `sendPaymentLink`; `conversations`: `getContactDetail`, `getMessages`, `list`, `sendMessage`, `updateStatus`; `media`: `upload`
- Direct fetch/new URL: -
- Socket events: `connect`, `emit:join`, `listen:connect`, `listen:message:created`
- Data flow: mount/param change -> load API state -> join socket room -> realtime event mutates local state -> render; user action -> API call -> optimistic/toast update.

### `/conversations/:conversationId`

Source: `apps/frontend/src/routes/_app/conversations/$conversationId.tsx`

- API client calls: `conversations`: `get`, `getMessages`, `sendMessage`; `ai`: `getSuggestion`; `routing`: `route`
- Direct fetch/new URL: -
- Socket events: `connect`, `emit:join:conversation`, `emit:leave:conversation`, `listen:ai:suggestion`, `listen:message:created`
- Data flow: mount/param change -> load API state -> join socket room -> realtime event mutates local state -> render; user action -> API call -> optimistic/toast update.

### `/customers/:customerId`

Source: `apps/frontend/src/routes/_app/customers/$customerId.tsx`

- API client calls: `customers`: `get`, `update`; `contactConversations`: `list`
- Direct fetch/new URL: -
- Socket events: -
- Data flow: mount/param change -> call API client/direct fetch -> normalize response -> set React state -> render; user action repeats call and refreshes affected state.

### `/customers`

Source: `apps/frontend/src/routes/_app/customers/index.tsx`

- API client calls: `customers` as `customersApi`: `list`, `stats`
- Direct fetch/new URL: -
- Socket events: -
- Data flow: mount/param change -> call API client/direct fetch -> normalize response -> set React state -> render; user action repeats call and refreshes affected state.

### `/dashboard`

Source: `apps/frontend/src/routes/_app/dashboard.tsx`

- API client calls: `metrics`: `getDashboard`
- Direct fetch/new URL: -
- Socket events: -
- Data flow: mount/param change -> call API client/direct fetch -> normalize response -> set React state -> render; user action repeats call and refreshes affected state.

### `/developers/api-documentation`

Source: `apps/frontend/src/routes/_app/developers/api-documentation.tsx`

- API client calls: -
- Direct fetch/new URL: -
- Socket events: -
- Data flow: static/layout route; no direct backend call found in route file.

### `/developers/api-tools`

Source: `apps/frontend/src/routes/_app/developers/api-tools.tsx`

- API client calls: -
- Direct fetch/new URL: `new URL(`${API_URL}/api/ai_tools/${selectedTool.id}`)`; `new URL(`${API_URL}/api/ai_tools/execute`)`; `new URL(`${API_URL}/api/ai_tools`)`
- Socket events: -
- Data flow: mount/param change -> call API client/direct fetch -> normalize response -> set React state -> render; user action repeats call and refreshes affected state.

### `/developers/api-tools/new`

Source: `apps/frontend/src/routes/_app/developers/api-tools/new.tsx`

- API client calls: -
- Direct fetch/new URL: `new URL(`${API_URL}/api/ai_tools`)`
- Socket events: -
- Data flow: mount/param change -> call API client/direct fetch -> normalize response -> set React state -> render; user action repeats call and refreshes affected state.

### `/developers`

Source: `apps/frontend/src/routes/_app/developers/index.tsx`

- API client calls: -
- Direct fetch/new URL: `new URL(`${API_URL}${path}`)`
- Socket events: -
- Data flow: mount/param change -> call API client/direct fetch -> normalize response -> set React state -> render; user action repeats call and refreshes affected state.

### `/developers/messages-sent-by-api`

Source: `apps/frontend/src/routes/_app/developers/messages-sent-by-api.tsx`

- API client calls: -
- Direct fetch/new URL: -
- Socket events: -
- Data flow: static/layout route; no direct backend call found in route file.

### `/developers/webhooks`

Source: `apps/frontend/src/routes/_app/developers/webhooks.tsx`

- API client calls: -
- Direct fetch/new URL: ``${API_URL}/api/inboxes``; `new URL(`${API_URL}/api/business_webhooks/${String(selectedWebhook?.id || '')`; `new URL(`${API_URL}/api/business_webhooks/${webhook.id}`)`; `new URL(`${API_URL}/api/business_webhooks`)`
- Socket events: -
- Data flow: mount/param change -> call API client/direct fetch -> normalize response -> set React state -> render; user action repeats call and refreshes affected state.

### `/flows`

Source: `apps/frontend/src/routes/_app/flows.tsx`

- API client calls: `automationFlows`: `delete`, `list`
- Direct fetch/new URL: -
- Socket events: -
- Data flow: mount/param change -> call API client/direct fetch -> normalize response -> set React state -> render; user action repeats call and refreshes affected state.

### `/flows/:flowId`

Source: `apps/frontend/src/routes/_app/flows/$flowId.tsx`

- API client calls: `ai`: `getSettings`; `automationFlows`: `create`, `debugNode`, `get`, `getDefault`, `getExecutions`, `getVersions`, `list`, `setDefault`, `testRun`, `update`; `inboxes`: `list`; `knowledge`: `list`
- Direct fetch/new URL: -
- Socket events: -
- Data flow: mount/param change -> call API client/direct fetch -> normalize response -> set React state -> render; user action repeats call and refreshes affected state.

### `/handover`

Source: `apps/frontend/src/routes/_app/handover.tsx`

- API client calls: `handover`: `approveRequest`, `createRequest`, `getAnalytics`, `getLogs`, `getQueue`, `getRoster`, `getRules`, `rejectRequest`
- Direct fetch/new URL: -
- Socket events: `connect`, `listen:connect`, `listen:disconnect`, `listen:handover:queue_updated`, `listen:handover:request_approved`, `listen:handover:request_created`, `listen:handover:request_rejected`
- Data flow: mount/param change -> call API client/direct fetch -> normalize response -> set React state -> render; user action repeats call and refreshes affected state.

### `/help`

Source: `apps/frontend/src/routes/_app/help.tsx`

- API client calls: -
- Direct fetch/new URL: -
- Socket events: -
- Data flow: static/layout route; no direct backend call found in route file.

### `/integration`

Source: `apps/frontend/src/routes/_app/integration.tsx`

- API client calls: -
- Direct fetch/new URL: -
- Socket events: -
- Data flow: static/layout route; no direct backend call found in route file.

### `/knowledge`

Source: `apps/frontend/src/routes/_app/knowledge.tsx`

- API client calls: `ai`: `getProviders`; `knowledge`: `createSource`, `deleteSource`, `list`, `retrievalTest`, `uploadSourceFile`
- Direct fetch/new URL: -
- Socket events: -
- Data flow: mount/param change -> call API client/direct fetch -> normalize response -> set React state -> render; user action repeats call and refreshes affected state.

### `/metrics`

Source: `apps/frontend/src/routes/_app/metrics.tsx`

- API client calls: `metrics`: `getSummary`
- Direct fetch/new URL: -
- Socket events: -
- Data flow: mount/param change -> call API client/direct fetch -> normalize response -> set React state -> render; user action repeats call and refreshes affected state.

### `/orders`

Source: `apps/frontend/src/routes/_app/orders.tsx`

- API client calls: `commerce`: `cancelOrder`, `getOrderDetail`, `listOrders`, `sendPaymentLink`
- Direct fetch/new URL: -
- Socket events: -
- Data flow: mount/param change -> call API client/direct fetch -> normalize response -> set React state -> render; user action repeats call and refreshes affected state.

### `/outbound`

Source: `apps/frontend/src/routes/_app/outbound.tsx`

- API client calls: -
- Direct fetch/new URL: -
- Socket events: -
- Data flow: static/layout route; no direct backend call found in route file.

### `/pipeline`

Source: `apps/frontend/src/routes/_app/pipeline.tsx`

- API client calls: -
- Direct fetch/new URL: ``${API_URL}/api/v1/crm/custom-fields``; ``${API_URL}/api/v1/crm/deals/${active.id}``; ``${API_URL}/api/v1/crm/deals?pipelineId=${pipelineId}``; ``${API_URL}/api/v1/crm/pipelines/${id}``; ``${API_URL}/api/v1/crm/pipelines``
- Socket events: -
- Data flow: mount/param change -> call API client/direct fetch -> normalize response -> set React state -> render; user action repeats call and refreshes affected state.

### `/product-stock`

Source: `apps/frontend/src/routes/_app/product-stock.tsx`

- API client calls: `commerce`: `adjustStock`, `listStockVariants`
- Direct fetch/new URL: -
- Socket events: -
- Data flow: mount/param change -> call API client/direct fetch -> normalize response -> set React state -> render; user action repeats call and refreshes affected state.

### `/products`

Source: `apps/frontend/src/routes/_app/products.tsx`

- API client calls: `commerce`: `adjustStock`, `bulkUpsertVariants`, `createProduct`, `deleteProduct`, `listProducts`, `listStockMovements`, `listStockVariants`, `updateProduct`; `media`: `upload`
- Direct fetch/new URL: -
- Socket events: -
- Data flow: mount/param change -> call API client/direct fetch -> normalize response -> set React state -> render; user action repeats call and refreshes affected state.

### `/settings`

Source: `apps/frontend/src/routes/_app/settings.tsx`

- API client calls: -
- Direct fetch/new URL: ``${API_BASE}/api/labels/${deletingLabel.id}``; ``${API_BASE}/api/labels``
- Socket events: -
- Data flow: mount/param change -> call API client/direct fetch -> normalize response -> set React state -> render; user action repeats call and refreshes affected state.

### `/team`

Source: `apps/frontend/src/routes/_app/team.tsx`

- API client calls: `teams` as `teamsApi`: `addMember`, `create`, `delete`, `get`, `list`, `removeMember`, `update`; `inboxes` as `inboxesApi`: `list`
- Direct fetch/new URL: -
- Socket events: `connect`, `disconnect`, `listen:agent:presence`
- Data flow: mount/param change -> call API client/direct fetch -> normalize response -> set React state -> render; user action repeats call and refreshes affected state.

### `/templates`

Source: `apps/frontend/src/routes/_app/templates.tsx`

- API client calls: -
- Direct fetch/new URL: ``${API_URL}/api/template-variables/${id}``; ``${API_URL}/api/template-variables``; ``${API_URL}/api/whatsapp/templates?limit=50``; ``${API_URL}/api/whatsapp/templates?name=${name}``
- Socket events: -
- Data flow: mount/param change -> call API client/direct fetch -> normalize response -> set React state -> render; user action repeats call and refreshes affected state.

### `/`

Source: `apps/frontend/src/routes/index.tsx`

- API client calls: -
- Direct fetch/new URL: -
- Socket events: -
- Data flow: static/layout route; no direct backend call found in route file.

### `/invoice/:token`

Source: `apps/frontend/src/routes/invoice/$token.tsx`

- API client calls: `commerce`: `getPublicInvoice`
- Direct fetch/new URL: -
- Socket events: -
- Data flow: mount/param change -> call API client/direct fetch -> normalize response -> set React state -> render; user action repeats call and refreshes affected state.

### `/login`

Source: `apps/frontend/src/routes/login.tsx`

- API client calls: -
- Direct fetch/new URL: ``${AUTH_BASE}/sign-in/email``
- Socket events: -
- Data flow: mount/param change -> call API client/direct fetch -> normalize response -> set React state -> render; user action repeats call and refreshes affected state.

### `/onboarding`

Source: `apps/frontend/src/routes/onboarding.tsx`

- API client calls: -
- Direct fetch/new URL: -
- Socket events: -
- Data flow: static/layout route; no direct backend call found in route file.

### `/payment/success`

Source: `apps/frontend/src/routes/payment/success.tsx`

- API client calls: `commerce`: `getPublicPaymentSuccess`
- Direct fetch/new URL: -
- Socket events: -
- Data flow: mount/param change -> call API client/direct fetch -> normalize response -> set React state -> render; user action repeats call and refreshes affected state.

### `/privacy`

Source: `apps/frontend/src/routes/privacy.tsx`

- API client calls: -
- Direct fetch/new URL: -
- Socket events: -
- Data flow: static/layout route; no direct backend call found in route file.

### `/register`

Source: `apps/frontend/src/routes/register.tsx`

- API client calls: -
- Direct fetch/new URL: ``${AUTH_BASE}/sign-up/email``
- Socket events: -
- Data flow: mount/param change -> call API client/direct fetch -> normalize response -> set React state -> render; user action repeats call and refreshes affected state.

### `/terms`

Source: `apps/frontend/src/routes/terms.tsx`

- API client calls: -
- Direct fetch/new URL: -
- Socket events: -
- Data flow: static/layout route; no direct backend call found in route file.


## Shared Component API Calls

These components can add API calls to any page that renders them.

| Component | API client calls | Direct fetch/new URL | Socket |
|---|---|---|---|
| `apps/frontend/src/components/ChatWindow.tsx` | conversations.getMessages\|sendMessage\|suggestReply | - | - |
| `apps/frontend/src/components/ConversationLabels.tsx` | conversations as conversationsApi.addLabel\|getLabels\|removeLabel, labels as labelsApi.create\|list | - | - |
| `apps/frontend/src/components/ConversationNotes.tsx` | conversations as conversationsApi.addNote\|deleteNote\|getNotes | - | - |
| `apps/frontend/src/components/CreateBroadcastModal.tsx` | broadcasts as broadcastsApi.create, whatsappTemplates.list | - | - |
| `apps/frontend/src/components/CreateTemplateModal.tsx` | - | \`${API_URL}/api/whatsapp/templates\` | - |
| `apps/frontend/src/components/CreateVariableModal.tsx` | - | \`${API_URL}/api/template-variables\` | - |
| `apps/frontend/src/components/EditCustomerModal.tsx` | contacts.settings | - | - |
| `apps/frontend/src/components/ExportChatModal.tsx` | - | \`${API_BASE}/conversations/${conversationId}/export?format=${format}\` | - |
| `apps/frontend/src/components/ManageLabelsModal.tsx` | labels as labelsApi.list, conversations as conversationsApi.addLabel\|getLabels\|removeLabel | - | - |
| `apps/frontend/src/components/MediaGalleryModal.tsx` | media.gallery | - | - |
| `apps/frontend/src/components/MergeCustomerModal.tsx` | contacts.list\|merge | - | - |
| `apps/frontend/src/components/PipelineModals.tsx` | - | \`${API_URL}/api/v1/crm/custom-fields\` | - |
| `apps/frontend/src/components/ReportIssueModal.tsx` | - | \`${API_BASE}/conversations/${conversationId}/report\` | - |
| `apps/frontend/src/components/Sidebar.tsx` | - | \`${API_BASE}/auth/logout\` | - |
| `apps/frontend/src/components/TemplateSelector.tsx` | whatsappTemplates.list | - | - |
| `apps/frontend/src/components/TiptapEditor.tsx` | - | \`${API_URL}/api/media/upload\` | - |
| `apps/frontend/src/components/ViewHistoryModal.tsx` | contactConversations.list | - | - |
| `apps/frontend/src/components/apps/meta-ads-tracker/ads-performance.tsx` | - | \`${API_BASE}/meta-ads/accounts\`<br>\`${API_BASE}/meta-ads/campaigns?account_id=${selectedAccount}\`<br>\`${API_BASE}/meta-ads/sync\` | - |
| `apps/frontend/src/components/apps/meta-ads-tracker/integration.tsx` | - | \`${API_BASE}/meta-ads/accounts\`<br>\`${API_BASE}/meta-ads/config\`<br>\`${API_BASE}/meta-ads/connect\` | - |
| `apps/frontend/src/components/apps/meta-ads-tracker/webhook-log.tsx` | - | \`${API_BASE}/meta-ads/webhooks/logs\` | - |
| `apps/frontend/src/components/developers/webhooks-expandable-panel.tsx` | - | \`${API_URL}/api/inboxes\`<br>new URL(\`${API_URL}/api/business_webhooks/${webhook.id}\`)<br>new URL(\`${API_URL}/api/business_webhooks\`) | - |
| `apps/frontend/src/components/settings/AIAgentPersonaManager.tsx` | ai.createPlaygroundPersona\|deletePlaygroundPersona\|getPlaygroundPersonas\|updatePlaygroundPersona | - | - |
| `apps/frontend/src/components/settings/ContactSettingsManager.tsx` | contacts.settings | - | - |
| `apps/frontend/src/components/settings/CustomerLevelAgentMappingManager.tsx` | ai.getPlaygroundPersonas, customers.levels | - | - |
| `apps/frontend/src/components/settings/LabelsManager.tsx` | - | \`${API_BASE}/api/labels/${labelToDelete.id}\`<br>\`${API_BASE}/api/labels\` | - |
| `apps/frontend/src/components/settings/PakasirSettingsManager.tsx` | commerce.getPakasirSettings\|updatePakasirSettings | - | - |
| `apps/frontend/src/components/settings/WhatsAppSettingsManager.tsx` | - | \`${API_BASE}/waba/connect/manual\`<br>\`${API_BASE}/whatsapp-channels/${id}/toggle\`<br>\`${API_BASE}/whatsapp-channels\` | - |

## Notes For Rebuild Agents

- Treat route-file mapping as page-level wiring. Shared component table must be merged into parent pages when those components render.
- Most app pages use `lib/api.ts`, which injects `Authorization`, `X-Org-Slug`, legacy `X-App-Id`, and optional `X-App-Secret`.
- Login/register use root Better Auth `/auth/sign-in/email` and `/auth/sign-up/email`; post-login organization context uses `/api/auth/context`.
- Socket usage is concentrated in chat, conversation detail, handover, and team presence UI.
