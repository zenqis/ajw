# PRD — Broadcast Module

## Problem
Campaign broadcasting with audience targeting, template merging, scheduling, and per-recipient delivery tracking harus bisa diandalkan dan konsisten di seluruh sistem multi-tenant.

## Goal
Menyediakan broadcast layer yang reliable untuk semua tenant OpenCRM.

## User stories
- Sebagai developer, saya ingin modul broadcast bisa dipakai langsung via route `/api/broadcasts`.
- Sebagai AI, saya ingin memahami setiap file dan responsibility modul ini dari blueprint.

## Requirements
- Broadcast CRUD (draft → scheduled → sent)
- Audience targeting with filters
- WhatsApp template parameter merging
- Scheduled broadcast dispatch via BullMQ
- Per-recipient delivery tracking (broadcast_logs)
- Success/failure counting

## Acceptance criteria
- Semua endpoint terregistrasi dan merespons dengan benar
- Multi-tenant isolation via `app_id` berfungsi
- Error handling mengikuti konvensi backend

## Implementation status
- [x] Semua acceptance criteria terpenuhi
- [x] Module aktif dan dipakai di production
