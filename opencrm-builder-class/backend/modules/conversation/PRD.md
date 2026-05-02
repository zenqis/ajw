# PRD — Conversation Module

## Problem
Core conversation lifecycle: listing with filters, agent assignment, status management, notes, labels, multi-agent collaboration, bulk operations, and AI analytics harus bisa diandalkan dan konsisten di seluruh sistem multi-tenant.

## Goal
Menyediakan conversation layer yang reliable untuk semua tenant OpenCRM.

## User stories
- Sebagai developer, saya ingin modul conversation bisa dipakai langsung via route `/api/conversations`.
- Sebagai AI, saya ingin memahami setiap file dan responsibility modul ini dari blueprint.

## Requirements
- Conversation listing with filters (status, agent, inbox, date, labels, channel, pipeline)
- Status management (open → pending → resolved → snoozed)
- Agent assignment + takeover
- Multi-agent collaboration (conversation_agents)
- Notes CRUD
- Label association
- Activity log (audit trail)
- Bulk operations via BullMQ (status change, assign, labels)
- AI analytics (sentiment, intent, churn risk)
- Contact detail enrichment (AI summary, signals, badges)
- Real-time Socket.IO events (conversation:created, conversation:updated, etc.)

## Acceptance criteria
- Semua endpoint terregistrasi dan merespons dengan benar
- Multi-tenant isolation via `app_id` berfungsi
- Error handling mengikuti konvensi backend

## Implementation status
- [x] Semua acceptance criteria terpenuhi
- [x] Module aktif dan dipakai di production
