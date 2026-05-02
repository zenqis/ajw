# PRD — Media Module

## Problem
File upload/download via S3/R2 with public URL generation harus bisa diandalkan dan konsisten di seluruh sistem multi-tenant.

## Goal
Menyediakan media layer yang reliable untuk semua tenant OpenCRM.

## User stories
- Sebagai developer, saya ingin modul media bisa dipakai langsung via route `/api/media`.
- Sebagai AI, saya ingin memahami setiap file dan responsibility modul ini dari blueprint.

## Requirements
- File upload to S3/R2
- File download + streaming
- Public URL generation
- Media type validation

## Acceptance criteria
- Semua endpoint terregistrasi dan merespons dengan benar
- Multi-tenant isolation via `app_id` berfungsi
- Error handling mengikuti konvensi backend

## Implementation status
- [x] Semua acceptance criteria terpenuhi
- [x] Module aktif dan dipakai di production
