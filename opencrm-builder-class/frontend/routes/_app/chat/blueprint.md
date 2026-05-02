# Blueprint — chat

**Route:** `/_app/chat`
**Source:** `apps/frontend/src/routes/_app/chat.tsx`
**Lines:** ~2100 | **Size:** 64KB (largest page)

## Fungsi
Live agent inbox — unified omnichannel inbox untuk semua percakapan pelanggan.

## Layout
```
┌─────────────┬──────────────────┬────────────────┐
│ Conversation│  Message Panel   │ Contact Info    │
│ List        │  (ChatWindow)    │ Panel           │
│ (sidebar)   │                  │ (sidebar)       │
│             │  ┌────────────┐  │                 │
│ • Search    │  │ Messages   │  │ • AI Summary    │
│ • Filters   │  │ bubbles    │  │ • Live signals  │
│ • Conv list │  │            │  │ • Customer info │
│             │  └────────────┘  │ • Tags, notes   │
│             │  [Chat Input]    │ • Order history  │
└─────────────┴──────────────────┴────────────────┘
```

## Components used
- `ConversationList.tsx` — Left panel, searchable, filterable
- `ChatWindow.tsx` — Message display area
- `MessageItem.tsx` — Individual chat bubbles
- `ContactInfoPanel.tsx` — Right panel, contact details + AI analytics
- `ChatRoomActionsMenu.tsx` — Dropdown actions
- `TemplateSelector.tsx` — WhatsApp template picker
- `AgentAssignmentPanel.tsx` — Agent assignment UI
- `ConversationLabels.tsx`, `ConversationNotes.tsx`
- `TiptapEditor.tsx` — Rich text message input

## API calls
- `conversations.list()`, `conversations.getMessages()`, `conversations.sendMessage()`
- `conversations.assign()`, `conversations.updateStatus()`, `conversations.markAsRead()`
- `conversations.getContactDetail()`, `conversations.suggestReply()`

## Socket.IO
- Listen: `message:created`, `conversation:created`, `conversation:updated`, `conversation:status_changed`
- Emit: `join:conversation`, `leave:conversation`

## Key features
- Real-time message updates
- Conversation filtering (status, agent, inbox, date, labels, channel)
- Multi-agent collaboration
- AI reply suggestions
- Template message sending
- Media attachment (image, video, audio, document)
- Reply-to, private notes, conversation takeover
