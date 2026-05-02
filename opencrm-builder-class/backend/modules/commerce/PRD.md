# PRD — Commerce Module

## Problem
E-commerce operations including product catalog, orders, invoicing (Xendit/Pakasir), stock management, and checkout flow harus bisa diandalkan dan konsisten di seluruh sistem multi-tenant.

## Goal
Menyediakan commerce layer yang reliable untuk semua tenant OpenCRM.

## User stories
- Sebagai developer, saya ingin modul commerce bisa dipakai langsung via route `/api/commerce`.
- Sebagai AI, saya ingin memahami setiap file dan responsibility modul ini dari blueprint.

## Requirements
- Product catalog with variants
- Order creation + lifecycle management
- Invoice generation (Xendit/Pakasir integration)
- Stock reservation during checkout
- Stock movement tracking
- Pakasir POS client integration
- Subscription management

## Acceptance criteria
- Semua endpoint terregistrasi dan merespons dengan benar
- Multi-tenant isolation via `app_id` berfungsi
- Error handling mengikuti konvensi backend

## Implementation status
- [x] Semua acceptance criteria terpenuhi
- [x] Module aktif dan dipakai di production
