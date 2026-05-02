# PRD — Business Webhooks Module

## Problem
External webhook subscription management with event dispatch, retry logic, and message event formatting harus bisa diandalkan dan konsisten di seluruh sistem multi-tenant.

## Goal
Menyediakan business-webhooks layer yang reliable untuk semua tenant OpenCRM.

## User stories
- Sebagai developer, saya ingin modul business-webhooks bisa dipakai langsung via route `/api/business-webhooks`.
- Sebagai AI, saya ingin memahami setiap file dan responsibility modul ini dari blueprint.

## Requirements
- Webhook subscription CRUD per app
- Event dispatch to subscriber URLs
- Retry with exponential backoff
- Message event payload formatting
- Webhook event logging
- Replay failed deliveries

## Acceptance criteria
- Semua endpoint terregistrasi dan merespons dengan benar
- Multi-tenant isolation via `app_id` berfungsi
- Error handling mengikuti konvensi backend

## Implementation status
- [x] Semua acceptance criteria terpenuhi
- [x] Module aktif dan dipakai di production
