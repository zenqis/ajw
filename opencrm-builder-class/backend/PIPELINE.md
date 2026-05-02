# Backend Pipeline — Webhook → Socket → Flow Execution → Knowledge Base

Panduan lengkap alur backend OpenCRM dari inbound message sampai AI response. Ini adalah critical path yang harus direplikasi secara akurat.

---

## Pipeline Overview

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ INBOUND MESSAGE PIPELINE                                                      │
│                                                                              │
│  [WhatsApp/IG/TikTok Webhook]                                                │
│       │                                                                      │
│       ▼                                                                      │
│  [webhook/index.ts] POST /api/v1/webhooks/whatsapp                          │
│       │  validate → parse → save to webhook_events                          │
│       ▼                                                                      │
│  [webhook/service.ts] WebhookService.processWhatsAppPayload()               │
│       │  1. Identify whatsapp_channel by phone_number_id                    │
│       │  2. Lookup/create contact by sender phone                           │
│       │  3. Lookup/create conversation (app_id + contact + inbox)           │
│       │  4. Create message record in DB                                     │
│       │  5. Open messaging window (24h WA rule)                             │
│       │  6. Emit Socket.IO events                                           │
│       │  7. Queue webhook delivery (BullMQ → webhooks queue)                │
│       │  8. Queue chatbot auto-reply (BullMQ → webhooks queue)              │
│       ▼                                                                      │
│  [workers/index.ts] webhookWorker (whatsapp-inbound)                        │
│       │  WebhookService.handleWhatsAppInbound(payload)                      │
│       ▼                                                                      │
│  [webhook/service.ts] processDebouncedAutoReplyJob()                        │
│       │  Debounce: wait for multiple messages → batch process               │
│       │  Check: conversation.status !== 'resolved'                          │
│       │  Check: assigned agent override? → skip AI                          │
│       ▼                                                                      │
│  [flow/runtime-service.ts] FlowRuntimeService.executeInbound()              │
│       │  1. Load inbox → get chatbot_id                                     │
│       │  2. Load active automation_flows                                    │
│       │  3. Check persisted flow state (conversation.additional_attributes) │
│       │  4. Resolve customer level → mapped chatbot/persona                 │
│       │  5. Run DecisionEngineService.evaluateInbound()                     │
│       │  6. Build RuntimeContext with variables                             │
│       │  7. Execute flow nodes graph (start → ... → end)                    │
│       ▼                                                                      │
│  [flow/decision-engine-service.ts] DecisionEngineService.evaluateInbound()  │
│       │  AI-powered intent classification:                                  │
│       │  → intent, intent_confidence, sentiment, buying_stage               │
│       │  → route_target (chatbot|handover|agent), requires_approval         │
│       │  → recommended_action, churn_risk_score                             │
│       ▼                                                                      │
│  [Flow Node Execution Loop]                                                  │
│       │  node types: start → condition → action → ai_generate → end        │
│       │                                                                      │
│       ├── action node: send_message → BullMQ outbound-messages queue        │
│       ├── action node: assign_agent → update conversation.assignee_id       │
│       ├── action node: change_status → update conversation.status           │
│       ├── action node: add_label → create conversation_labels               │
│       ├── ai_generate node → ChatbotSimulationService                       │
│       │       │                                                              │
│       │       ▼                                                              │
│       │  [knowledge/service.ts] KnowledgeService.retrievalTest()            │
│       │       │  1. Generate embedding from query text                      │
│       │       │  2. pgvector similarity search on knowledge_source_chunks   │
│       │       │  3. Match knowledge_faqs by keywords                        │
│       │       │  4. Return ranked context chunks                            │
│       │       ▼                                                              │
│       │  [chatbot/simulation-service.ts] Generate AI response               │
│       │       │  → Build system prompt + RAG context + history              │
│       │       │  → Call AI provider (OpenAI/Azure/Growthcircle)             │
│       │       │  → Log cost/tokens to ai_response_logs                     │
│       │       │  → Return generated text                                    │
│       │       ▼                                                              │
│       │  Queue outbound message (BullMQ → outbound-messages)                │
│       │                                                                      │
│       ├── handover node → create handover_requests, set status=pending      │
│       ├── end node → mark flow completed, cleanup state                     │
│       ▼                                                                      │
│  [workers/index.ts] outboundWorker (outbound-messages)                      │
│       │  1. Acquire Redis lock per conversation                             │
│       │  2. Check if this is next pending message (FIFO ordering)           │
│       │  3. Validate media URL (HEAD + GET fallback)                        │
│       │  4. Send via Meta Graph API (WA) or IG/TikTok API                   │
│       │  5. Update message.status = 'sent'                                  │
│       │  6. Emit Socket.IO: message:created, conversation:updated           │
│       │  7. Release Redis lock                                              │
│       ▼                                                                      │
│  [Socket.IO] Real-time events to frontend                                   │
│       │  Rooms: app:{appId}, conversation:{convId}                          │
│       │  Events: message:created, conversation:updated                      │
│       ▼                                                                      │
│  [Frontend] socket.io-client receives events → update UI                    │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## Step 1: Webhook Reception

**File:** `modules/webhook/index.ts` (routes) + `modules/webhook/service.ts`

```ts
// POST /api/v1/webhooks/whatsapp
// Meta sends webhook payload with messages array
app.post('/whatsapp', async ({ body }) => {
  // 1. Validate Meta signature
  // 2. Save raw payload to webhook_events table
  // 3. Parse: entry[].changes[].value.messages[]
  // 4. For each message:
  //    - Identify channel by phone_number_id → whatsapp_channels
  //    - Resolve/create contact by sender phone
  //    - Resolve/create conversation
  //    - Create message record
  //    - Queue for processing
  await webhookQueue.add('whatsapp-inbound', { payload, webhookEventId })
})
```

### Key Tables Touched
```
webhook_events       → Raw payload storage + replay
whatsapp_channels    → Channel identification
contacts             → Contact resolution
conversations        → Conversation upsert
messages             → Message creation
```

---

## Step 2: Worker Processing

**File:** `workers/index.ts`

```ts
// webhookWorker processes the queued job
const webhookWorker = new Worker('webhooks', async (job) => {
  if (job.name === 'whatsapp-inbound') {
    return WebhookService.handleWhatsAppInbound(payload, webhookEventId)
  }
  if (job.name === 'chatbot-auto-reply') {
    return WebhookService.processDebouncedAutoReplyJob(payload)
  }
})
```

### Debounce Strategy
```
Multiple rapid messages from same sender:
1. First message → schedule auto-reply job with 2s delay
2. Subsequent messages within 2s → cancel previous, reschedule
3. After 2s silence → process batch with latest context
```

---

## Step 3: Socket.IO Emission

**File:** `lib/realtime-emitter.ts` + `plugins/socket.ts`

```ts
// Emit to room (app-level + conversation-level)
emitRealtimeToRoom(`app:${appId}`, 'message:created', { message, conversation })
emitRealtimeToRoom(`conversation:${conversationId}`, 'message:created', { message })

// Also emit conversation updates
emitRealtimeToRoom(`app:${appId}`, 'conversation:updated', { conversation })
```

### Socket.IO Architecture
```
Port 3011 (separate from HTTP on 3010)
Transport: WebSocket only
Adapter: Redis (for multi-process)
Rooms:
  - app:{appId}             → all events for an app
  - account:{accountId}     → user-specific events
  - conversation:{convId}   → per-conversation events
```

### Frontend Socket Listener
```ts
// lib/socket.ts (144 lines)
const socket = io(SOCKET_URL, { transports: ['websocket'] })
socket.emit('join', { appId })

// Listen for events
socket.on('message:created', ({ message, conversation }) => {
  // Update conversation list
  // If conversation is open → append message
  // Play notification sound
})

socket.on('conversation:updated', ({ conversation }) => {
  // Update conversation in list
  // Update status badge
})
```

---

## Step 4: Flow Execution Engine

**File:** `modules/flow/runtime-service.ts` (7207 lines)

### Entry Point
```ts
FlowRuntimeService.executeInbound({
  appId,
  inboxId,
  conversationId,
  channelType: 'whatsapp',
  contact: { id, name, phone_number },
  incomingMessage: { id, content, content_type, content_attributes },
})
```

### Resolution Chain
```
1. Load inbox → get chatbot_id from inbox config
2. Load whatsapp_channel → get extended_metadata
3. Load active automation_flows (sorted by updated_at desc)
4. Load conversation additional_attributes (persisted state)
5. Resolve customer level → mapped chatbot/persona
6. Select flow: persisted > configured > first active
```

### Runtime State (persisted in conversation.additional_attributes)
```ts
interface FlowRuntimeState {
  flow_id: string
  cursor_node_id: string | null     // current position in graph
  waiting_button: {                  // waiting for button selection
    node_id: string
    options: string[]
  } | null
  variables: Record<string, any>    // runtime variables
  last_error: string | null
  last_executed_at: string
  status: 'idle' | 'running' | 'completed' | 'error' | 'waiting_button'
}
```

### Flow Graph Execution Loop
```ts
// Simplified execution loop
while (iterations < MAX_ITERATIONS) {
  const node = graph.nodes.get(currentNodeId)
  
  switch (node.type) {
    case 'start':
      // Check trigger conditions
      // Move to next node
      break
      
    case 'condition':
      // Evaluate condition branches (keyword match, regex, variable check)
      // Route to matching branch
      break
      
    case 'action':
      // executeActionNode(): send_message, assign_agent, change_status, etc.
      break
      
    case 'ai_generate':
    case 'ai_classify':
      // executeAINode(): call AI provider with knowledge context
      break
      
    case 'end':
      // executeEndNode(): mark completed, send final message
      return { matched: true, skipChatbot: true }
  }
}
```

### Runtime Variables Injected
```ts
// Automatically available in all nodes:
variables['incoming.current_message']    = "Hi, I want to order..."
variables['incoming.recent_messages']    = [{role:'user', content:'...'}, ...]
variables['customer.id']                 = "uuid-..."
variables['customer.name']               = "John"
variables['customer.phone_number']       = "628123456789"
variables['customer.level_id']           = "vip-level-uuid"
variables['customer.level_label']        = "VIP"
variables['customer.total_spent']        = 5000000
variables['customer.mapped_chatbot_id']  = "chatbot-uuid"
variables['customer.mapped_persona_id']  = "persona-uuid"

// After DecisionEngine:
variables['intent.label']               = "product_inquiry"
variables['decision.intent_confidence'] = 0.92
variables['sentiment.label']            = "positive"
variables['buying_stage.label']         = "consideration"
variables['churn.risk_score']           = 0.1
variables['decision.route_target']      = "chatbot"
variables['decision.recommended_action']= "provide_info"
```

---

## Step 5: Decision Engine

**File:** `modules/flow/decision-engine-service.ts` (2285 lines)

```ts
DecisionEngineService.evaluateInbound({
  appId,
  conversationId,
  flowId,
  messageId,
  channelType: 'whatsapp',
  incomingText: "Hi, saya mau order sepatu",
  source: 'inbound',
})
```

### Output (DecisionEnvelope)
```ts
{
  intent: 'product_inquiry',
  intent_confidence: 0.92,
  sentiment_state: 'positive',
  sentiment_transition: 'neutral_to_positive',
  buying_stage: 'consideration',
  churn_risk_score: 0.1,
  confidence_band: 'high',
  recommended_action: 'provide_info',
  route_target: 'chatbot',         // or 'handover' or 'agent'
  requires_approval: false,
  persona_id: null,
  approval_reason: null,
  overall_confidence: 0.88,
  applied_policy: { ... },
}
```

### Decision Logic
```
1. AI call with minimal context (current message + 5 recent history)
2. Classify: intent, sentiment, buying stage
3. Apply routing policy:
   - High confidence + known intent → chatbot handles
   - Low confidence → handover to human
   - Agent transfer conditions → set status=pending
4. Return decision envelope → flow runtime uses as variables
```

---

## Step 6: Knowledge Base (RAG)

**File:** `modules/knowledge/service.ts` (4623 lines)

### Knowledge Retrieval Flow
```ts
KnowledgeService.retrievalTest(appId, {
  query: "sepatu running Nike size 42",
  limit: 5,
  chatbotId: "uuid-...",
})
```

### RAG Pipeline
```
1. QUERY EMBEDDING
   → Call AI provider embeddings endpoint
   → Convert query text to vector (1536 dimensions for OpenAI)

2. VECTOR SEARCH (pgvector)
   → SELECT * FROM knowledge_source_chunks
   → WHERE app_id = $1
   → ORDER BY embedding <=> $2     -- cosine distance
   → LIMIT 5

3. FAQ MATCHING (keyword-based)
   → Tokenize query → extract keywords
   → Match against knowledge_faqs.question + answer
   → Score by keyword overlap

4. CONTEXT ASSEMBLY
   → Combine vector results + FAQ matches
   → Rank by relevance score
   → Return top N chunks as context string

5. PROMPT INJECTION
   → System prompt + RAG context injected into AI call
   → "Based on the following knowledge base: ..."
```

### Knowledge Tables
```sql
knowledge_sources          → Sources (URL, file, text)
knowledge_source_chunks    → Chunked text + embeddings (pgvector)
knowledge_faqs             → FAQ pairs (question → answer)
knowledge_categories       → Category organization
knowledge_ingestion_jobs   → Extraction job tracking
```

### Indexing Pipeline (Maintenance Worker)
```
1. knowledge-change-event → triggers on source CRUD
2. sync-knowledge-index:
   a. Extract text from source (URL scrape, PDF parse, etc.)
   b. Chunk text (overlapping windows, ~500 tokens each)
   c. Generate embeddings per chunk
   d. Upsert to knowledge_source_chunks with pgvector
3. purge-knowledge-index → cleanup deleted sources
```

---

## Step 7: AI Response Generation

**File:** `modules/chatbot/simulation-service.ts` (6618 lines)

### Prompt Assembly
```
[System Prompt]
You are {chatbot_name}, a customer service AI for {business_name}.
{persona_instruction}              ← from AI agent persona
{knowledge_context}                ← from RAG retrieval
{product_catalog_context}          ← if e-commerce enabled
{conversation_history}             ← last 5-10 messages

[User Message]
{incoming_text}
```

### AI Provider Call
```ts
// Multi-provider support
switch (provider) {
  case 'openai':
    // OpenAI Chat Completions API
    break
  case 'azure':
    // Azure OpenAI Service
    break
  case 'growthcircle':
    // Growthcircle Gateway API
    break
}
```

### Response Logging
```ts
// Every AI response is logged
AIResponseLogService.create({
  app_id,
  chatbot_id,
  conversation_id,
  message_id,
  provider,
  model,
  prompt_tokens,
  completion_tokens,
  total_tokens,
  cost_usd,
  response_time_ms,
  knowledge_chunks_used,
})
```

---

## Step 8: Outbound Message Sending

**File:** `workers/index.ts` (outbound worker section)

### Redis Conversation Lock
```ts
// Ensure message ordering within a conversation
const lock = await tryAcquireOutboundConversationLock(conversationId)
// Key: lock:outbound:conversation:{id}
// TTL: 120 seconds
// Auto-renew: every 10 seconds
// Release: Lua atomic check-and-delete

if (!lock) {
  // Wait up to 15 seconds, polling every 200ms
  lock = await waitForOutboundConversationLock(conversationId, messageId)
}

// Check FIFO ordering
if (!await isNextPendingOutboundMessage(conversationId, messageId)) {
  // Requeue with delay
  await requeueOutboundMessage(messageId)
  return
}

// Send via channel API
await sendWhatsAppMessage(channel, recipient, content, mediaUrl)

// Update status
await prisma.messages.update({ status: 'sent' })

// Emit real-time
emitRealtimeToRoom(`app:${appId}`, 'message:created', { message })

// Release lock
await releaseOutboundConversationLock(lock)
```

### Media URL Validation
```ts
// Before sending media to WhatsApp
1. HEAD request to media URL
2. Check HTTP 200 + content-type matches media type
3. Fallback: GET with Range: bytes=0-0
4. Skip validation for trusted hosts (e.g., files.cekat.ai)
```

---

## Key Environment Variables

```bash
# Webhook
WEBHOOK_MAX_RETRIES=10
WEBHOOK_RETRY_COOLDOWN_MS=60000
WEBHOOK_REPLAY_WINDOW_HOURS=24

# Outbound
OUTBOUND_CONVERSATION_LOCK_TTL_MS=120000
OUTBOUND_CONVERSATION_LOCK_WAIT_MS=15000
OUTBOUND_CONVERSATION_LOCK_POLL_MS=200
OUTBOUND_CONVERSATION_LOCK_RENEW_MS=10000
OUTBOUND_DEFER_DELAY_MS=750

# Media
WHATSAPP_MEDIA_URL_VALIDATION_TIMEOUT_MS=7000
WHATSAPP_MEDIA_TRUSTED_HOSTS=files.cekat.ai

# Follow-ups
CHATBOT_FOLLOWUP_DISPATCH_BATCH_LIMIT=100
```
