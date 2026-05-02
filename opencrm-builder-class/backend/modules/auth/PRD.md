# PRD — Auth Module

## Problem
Authentication, registration, session management, organization creation, onboarding, and API key auth resolution harus bisa diandalkan dan konsisten di seluruh sistem multi-tenant.

## Goal
Menyediakan auth layer yang reliable untuk semua tenant OpenCRM.

## User stories
- Sebagai developer, saya ingin modul auth bisa dipakai langsung via route `/auth`.
- Sebagai AI, saya ingin memahami setiap file dan responsibility modul ini dari blueprint.

## Requirements
- Email/password login via Better Auth
- Session management (7-day expiry, daily renewal)
- Organization creation + onboarding flow
- User profile update (name, timezone)
- Auth context resolution for API calls
- Organization member management
- Token refresh flow

## Acceptance criteria
- Semua endpoint terregistrasi dan merespons dengan benar
- Multi-tenant isolation via `app_id` berfungsi
- Error handling mengikuti konvensi backend

## Implementation status
- [x] Semua acceptance criteria terpenuhi
- [x] Module aktif dan dipakai di production
