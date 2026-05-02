# PRD — Agent Module

## Problem
Manages agent profiles, availability status, channel assignments, inbox routing, and division membership harus bisa diandalkan dan konsisten di seluruh sistem multi-tenant.

## Goal
Menyediakan agent layer yang reliable untuk semua tenant OpenCRM.

## User stories
- Sebagai developer, saya ingin modul agent bisa dipakai langsung via route `/api/agents-management`.
- Sebagai AI, saya ingin memahami setiap file dan responsibility modul ini dari blueprint.

## Requirements
- CRUD agent profiles
- Agent availability toggle + max conversation limits
- Channel type assignment per agent
- Inbox assignment management
- Division membership management
- Agent presence (online/offline status)
- Skills and language configuration

## Acceptance criteria
- Semua endpoint terregistrasi dan merespons dengan benar
- Multi-tenant isolation via `app_id` berfungsi
- Error handling mengikuti konvensi backend

## Implementation status
- [x] Semua acceptance criteria terpenuhi
- [x] Module aktif dan dipakai di production
