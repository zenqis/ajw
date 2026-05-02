# PRD — Chatbot Module

## Problem
Chatbot instance management, AI conversation simulation, response cost tracking, follow-up scheduling, and chatbot evaluation harus bisa diandalkan dan konsisten di seluruh sistem multi-tenant.

## Goal
Menyediakan chatbot layer yang reliable untuk semua tenant OpenCRM.

## User stories
- Sebagai developer, saya ingin modul chatbot bisa dipakai langsung via route `/api/chatbots`.
- Sebagai AI, saya ingin memahami setiap file dan responsibility modul ini dari blueprint.

## Requirements
- Chatbot instance CRUD (name, prompt, model, settings)
- Default chatbot resolution per app
- Conversation simulation (ChatbotSimulationService)
- AI response cost/token logging (AIResponseLogService)
- Follow-up message scheduling (ChatbotFollowupService)
- Knowledge document linking per chatbot
- Minimal context mode for intent routing
- Multi-provider support (OpenAI, Azure, Growthcircle)

## Acceptance criteria
- Semua endpoint terregistrasi dan merespons dengan benar
- Multi-tenant isolation via `app_id` berfungsi
- Error handling mengikuti konvensi backend

## Implementation status
- [x] Semua acceptance criteria terpenuhi
- [x] Module aktif dan dipakai di production
