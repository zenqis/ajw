# PRD — Flow Module (Visual Workflow Builder)

## Problem
Visual workflow automation with React Flow serialization, runtime execution engine, and AI-powered decision routing harus bisa diandalkan dan konsisten di seluruh sistem multi-tenant.

## Goal
Menyediakan flow layer yang reliable untuk semua tenant OpenCRM.

## User stories
- Sebagai developer, saya ingin modul flow bisa dipakai langsung via route `/api/flows`.
- Sebagai AI, saya ingin memahami setiap file dan responsibility modul ini dari blueprint.

## Requirements
- Flow CRUD (nodes/edges JSON serialization from React Flow)
- Flow runtime execution (FlowRuntimeService — 7206 lines)
- Decision engine for AI-powered intent routing (DecisionEngineService — 2284 lines)
- Node types: trigger, condition, action, AI response, handover, delay, etc.
- Flow activation/deactivation per app
- Execution logging + debugging
- Flow template management
- Single active flow enforcement per app

## Acceptance criteria
- Semua endpoint terregistrasi dan merespons dengan benar
- Multi-tenant isolation via `app_id` berfungsi
- Error handling mengikuti konvensi backend

## Implementation status
- [x] Semua acceptance criteria terpenuhi
- [x] Module aktif dan dipakai di production
