# PRD — Label Module

## Problem
Label management and conversation-label association for conversation categorization harus bisa diandalkan dan konsisten di seluruh sistem multi-tenant.

## Goal
Menyediakan label layer yang reliable untuk semua tenant OpenCRM.

## User stories
- Sebagai developer, saya ingin modul label bisa dipakai langsung via route `/api/labels`.
- Sebagai AI, saya ingin memahami setiap file dan responsibility modul ini dari blueprint.

## Requirements
- Label CRUD per app (with color)
- Conversation-label association (M2M)
- Bulk label management

## Acceptance criteria
- Semua endpoint terregistrasi dan merespons dengan benar
- Multi-tenant isolation via `app_id` berfungsi
- Error handling mengikuti konvensi backend

## Implementation status
- [x] Semua acceptance criteria terpenuhi
- [x] Module aktif dan dipakai di production
