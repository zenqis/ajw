# PRD — Customer Module

## Problem
Customer profiles with VIP/Premium/Basic level classification, lifetime value tracking, and level-based chatbot routing harus bisa diandalkan dan konsisten di seluruh sistem multi-tenant.

## Goal
Menyediakan customer layer yang reliable untuk semua tenant OpenCRM.

## User stories
- Sebagai developer, saya ingin modul customer bisa dipakai langsung via route `/api/customers`.
- Sebagai AI, saya ingin memahami setiap file dan responsibility modul ini dari blueprint.

## Requirements
- Customer profile aggregation from contacts
- Customer stats and metrics
- Customer level settings (VIP/Premium/Basic chatbot mapping)
- Level-based AI routing configuration

## Acceptance criteria
- Semua endpoint terregistrasi dan merespons dengan benar
- Multi-tenant isolation via `app_id` berfungsi
- Error handling mengikuti konvensi backend

## Implementation status
- [x] Semua acceptance criteria terpenuhi
- [x] Module aktif dan dipakai di production
