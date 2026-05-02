# PRD — Orders Module

## Problem
Order management with full lifecycle tracking, invoice generation, and payment integration harus bisa diandalkan dan konsisten di seluruh sistem multi-tenant.

## Goal
Menyediakan orders layer yang reliable untuk semua tenant OpenCRM.

## User stories
- Sebagai developer, saya ingin modul orders bisa dipakai langsung via route `/api/orders`.
- Sebagai AI, saya ingin memahami setiap file dan responsibility modul ini dari blueprint.

## Requirements
- Order CRUD with full lifecycle
- Order item management
- Invoice generation
- Payment status tracking
- Order search + filtering

## Acceptance criteria
- Semua endpoint terregistrasi dan merespons dengan benar
- Multi-tenant isolation via `app_id` berfungsi
- Error handling mengikuti konvensi backend

## Implementation status
- [x] Semua acceptance criteria terpenuhi
- [x] Module aktif dan dipakai di production
