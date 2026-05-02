# PRD — Message Module

## Problem
Message CRUD and delivery status tracking for omnichannel conversations harus bisa diandalkan dan konsisten di seluruh sistem multi-tenant.

## Goal
Menyediakan message layer yang reliable untuk semua tenant OpenCRM.

## User stories
- Sebagai developer, saya ingin modul message bisa dipakai langsung via route `/api/messages`.
- Sebagai AI, saya ingin memahami setiap file dan responsibility modul ini dari blueprint.

## Requirements
- Message creation + sending via BullMQ
- Message listing per conversation
- Message status update (sent → delivered → read → failed)
- Message deletion (soft)
- Reply-to message linking
- Media message handling

## Acceptance criteria
- Semua endpoint terregistrasi dan merespons dengan benar
- Multi-tenant isolation via `app_id` berfungsi
- Error handling mengikuti konvensi backend

## Implementation status
- [x] Semua acceptance criteria terpenuhi
- [x] Module aktif dan dipakai di production
