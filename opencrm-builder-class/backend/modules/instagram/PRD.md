# PRD — Instagram Module

## Problem
Instagram DM channel integration with OAuth login, callback handling, and channel management harus bisa diandalkan dan konsisten di seluruh sistem multi-tenant.

## Goal
Menyediakan instagram layer yang reliable untuk semua tenant OpenCRM.

## User stories
- Sebagai developer, saya ingin modul instagram bisa dipakai langsung via route `/api/instagram`.
- Sebagai AI, saya ingin memahami setiap file dan responsibility modul ini dari blueprint.

## Requirements
- Instagram OAuth login flow
- OAuth callback handling
- Instagram channel CRUD
- Instagram page listing
- Channel disconnect

## Acceptance criteria
- Semua endpoint terregistrasi dan merespons dengan benar
- Multi-tenant isolation via `app_id` berfungsi
- Error handling mengikuti konvensi backend

## Implementation status
- [x] Semua acceptance criteria terpenuhi
- [x] Module aktif dan dipakai di production
