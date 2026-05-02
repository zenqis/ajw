# PRD — User Module

## Problem
User profile management with timezone, preferences, and password updates harus bisa diandalkan dan konsisten di seluruh sistem multi-tenant.

## Goal
Menyediakan user layer yang reliable untuk semua tenant OpenCRM.

## User stories
- Sebagai developer, saya ingin modul user bisa dipakai langsung via route `/api/user`.
- Sebagai AI, saya ingin memahami setiap file dan responsibility modul ini dari blueprint.

## Requirements
- User profile retrieval
- Profile update (name, timezone)
- Password change
- User listing per app

## Acceptance criteria
- Semua endpoint terregistrasi dan merespons dengan benar
- Multi-tenant isolation via `app_id` berfungsi
- Error handling mengikuti konvensi backend

## Implementation status
- [x] Semua acceptance criteria terpenuhi
- [x] Module aktif dan dipakai di production
