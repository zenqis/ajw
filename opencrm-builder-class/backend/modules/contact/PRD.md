# PRD — Contact Module

## Problem
Customer contact management with custom fields, tags, notes, merge/block capabilities, and GDPR consent tracking harus bisa diandalkan dan konsisten di seluruh sistem multi-tenant.

## Goal
Menyediakan contact layer yang reliable untuk semua tenant OpenCRM.

## User stories
- Sebagai developer, saya ingin modul contact bisa dipakai langsung via route `/api/contacts`.
- Sebagai AI, saya ingin memahami setiap file dan responsibility modul ini dari blueprint.

## Requirements
- Contact CRUD with multi-channel identifiers
- Custom field definitions + values
- Tag management + assignment
- Contact notes
- Import/export
- Merge duplicate contacts
- Block/unblock contacts
- Consent tracking (GDPR)

## Acceptance criteria
- Semua endpoint terregistrasi dan merespons dengan benar
- Multi-tenant isolation via `app_id` berfungsi
- Error handling mengikuti konvensi backend

## Implementation status
- [x] Semua acceptance criteria terpenuhi
- [x] Module aktif dan dipakai di production
