# PRD — Team Module

## Problem
Team management with member assignment and auto-assign rule integration harus bisa diandalkan dan konsisten di seluruh sistem multi-tenant.

## Goal
Menyediakan team layer yang reliable untuk semua tenant OpenCRM.

## User stories
- Sebagai developer, saya ingin modul team bisa dipakai langsung via route `/api/teams`.
- Sebagai AI, saya ingin memahami setiap file dan responsibility modul ini dari blueprint.

## Requirements
- Team CRUD per app
- Team member management (add/remove)
- Auto-assign rule integration

## Acceptance criteria
- Semua endpoint terregistrasi dan merespons dengan benar
- Multi-tenant isolation via `app_id` berfungsi
- Error handling mengikuti konvensi backend

## Implementation status
- [x] Semua acceptance criteria terpenuhi
- [x] Module aktif dan dipakai di production
