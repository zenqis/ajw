# PRD — Inbox Module

## Problem
Channel inbox configuration with chatbot binding, auto-assign setup, and greeting messages harus bisa diandalkan dan konsisten di seluruh sistem multi-tenant.

## Goal
Menyediakan inbox layer yang reliable untuk semua tenant OpenCRM.

## User stories
- Sebagai developer, saya ingin modul inbox bisa dipakai langsung via route `/api/inboxes`.
- Sebagai AI, saya ingin memahami setiap file dan responsibility modul ini dari blueprint.

## Requirements
- Inbox CRUD per app
- Chatbot binding per inbox
- Auto-assign configuration
- Greeting/away message setup
- Channel routing

## Acceptance criteria
- Semua endpoint terregistrasi dan merespons dengan benar
- Multi-tenant isolation via `app_id` berfungsi
- Error handling mengikuti konvensi backend

## Implementation status
- [x] Semua acceptance criteria terpenuhi
- [x] Module aktif dan dipakai di production
