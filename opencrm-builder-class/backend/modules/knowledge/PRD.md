# PRD — Knowledge Module (RAG)

## Problem
Knowledge base RAG pipeline: source management, file upload, content extraction, text chunking, vector embedding, and similarity search harus bisa diandalkan dan konsisten di seluruh sistem multi-tenant.

## Goal
Menyediakan knowledge layer yang reliable untuk semua tenant OpenCRM.

## User stories
- Sebagai developer, saya ingin modul knowledge bisa dipakai langsung via route `/api/knowledge`.
- Sebagai AI, saya ingin memahami setiap file dan responsibility modul ini dari blueprint.

## Requirements
- Knowledge source CRUD (text, URL, file types)
- File upload + storage (S3/R2)
- Content extraction from files (ExtractionService — 1065 lines)
- Text chunking with token counting
- Vector embedding generation (IndexingService — 1144 lines)
- pgvector similarity search for RAG
- Full-text search fallback (tsvector)
- FAQ management per chatbot
- Category organization
- Ingestion job pipeline (queued, running, completed, failed)
- Query logging + chunk hit tracking

## Acceptance criteria
- Semua endpoint terregistrasi dan merespons dengan benar
- Multi-tenant isolation via `app_id` berfungsi
- Error handling mengikuti konvensi backend

## Implementation status
- [x] Semua acceptance criteria terpenuhi
- [x] Module aktif dan dipakai di production
