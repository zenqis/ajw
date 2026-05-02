# PRD — CRM Module

## Problem
Sales pipeline management with Kanban stages, deal tracking, and stage transition audit harus bisa diandalkan dan konsisten di seluruh sistem multi-tenant.

## Goal
Menyediakan crm layer yang reliable untuk semua tenant OpenCRM.

## User stories
- Sebagai developer, saya ingin modul crm bisa dipakai langsung via route `/api/crm`.
- Sebagai AI, saya ingin memahami setiap file dan responsibility modul ini dari blueprint.

## Requirements
- Pipeline CRUD per app
- Pipeline stage management (ordered, with probabilities)
- Conversation-to-deal linking
- Stage transition tracking
- Expected revenue calculations

## Acceptance criteria
- Semua endpoint terregistrasi dan merespons dengan benar
- Multi-tenant isolation via `app_id` berfungsi
- Error handling mengikuti konvensi backend

## Implementation status
- [x] Semua acceptance criteria terpenuhi
- [x] Module aktif dan dipakai di production
