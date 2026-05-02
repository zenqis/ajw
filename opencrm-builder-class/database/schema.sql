-- ============================================================
-- OpenCRM (Scalebiz) — Full Database Schema
-- Generated from: apps/backend/prisma/schema.prisma
-- PostgreSQL 15+ required
-- 
-- USAGE:
--   1. Create database:  CREATE DATABASE opencrm_db;
--   2. Connect:          \c opencrm_db
--   3. Run this file:    \i schema.sql
--
-- NOTE: This is a SNAPSHOT for reference/import.
--       Source of truth: apps/backend/prisma/schema.prisma
-- ============================================================

-- Required Extensions
CREATE EXTENSION IF NOT EXISTS "pgvector";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "session" (
    "id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" UUID NOT NULL,
    "activeOrganizationId" TEXT,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT,
    "logo" TEXT,
    "description" TEXT,
    "created_by" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" TEXT,
    "appId" UUID,
    "ai_credits" DECIMAL(10,2) DEFAULT 0.0,
    "ai_credit_warning_threshold" DECIMAL(10,2) DEFAULT 5.0,
    "ai_low_credit_alert_sent" BOOLEAN DEFAULT false,

    CONSTRAINT "organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "member" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'member',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invitation" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "inviterId" UUID NOT NULL,

    CONSTRAINT "invitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agent_availability" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" TEXT NOT NULL,
    "app_id" UUID NOT NULL,
    "is_available" BOOLEAN DEFAULT true,
    "max_conversations" INTEGER DEFAULT 5,
    "current_conversations" INTEGER DEFAULT 0,
    "skills" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "languages" TEXT[] DEFAULT ARRAY['en']::TEXT[],
    "last_assigned_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "agent_availability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agent_channel_accounts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" TEXT NOT NULL,
    "channel_type" VARCHAR(50) NOT NULL,
    "account_id" UUID NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "agent_channel_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agent_channels" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "channel_type" VARCHAR(50) NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "agent_channels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agent_divisions" (
    "user_id" UUID NOT NULL,
    "division_id" UUID NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "agent_divisions_pkey" PRIMARY KEY ("user_id","division_id")
);

-- CreateTable
CREATE TABLE "agent_inbox_assignments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID,
    "inbox_id" UUID,
    "is_active" BOOLEAN DEFAULT true,
    "assigned_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "assigned_by" UUID,

    CONSTRAINT "agent_inbox_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agent_presence" (
    "user_id" UUID NOT NULL,
    "status" VARCHAR(20) DEFAULT 'offline',
    "last_seen_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "agent_presence_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "agent_settings" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "app_id" UUID NOT NULL,
    "default_ticket_board_id" UUID,
    "auto_assign_agent" BOOLEAN DEFAULT false,
    "agent_can_takeover_unserved" BOOLEAN DEFAULT true,
    "agent_can_access_customers" BOOLEAN DEFAULT true,
    "agent_can_import_export_customers" BOOLEAN DEFAULT false,
    "agent_can_send_broadcast" BOOLEAN DEFAULT true,
    "agent_can_broadcast_in_service_window" BOOLEAN DEFAULT false,
    "hide_agent_status_toggle" BOOLEAN DEFAULT false,
    "hide_customer_id" BOOLEAN DEFAULT false,
    "agent_can_assign_chat" BOOLEAN DEFAULT true,
    "agent_can_add_agents_to_chat" BOOLEAN DEFAULT true,
    "agent_can_leave_chat" BOOLEAN DEFAULT true,
    "hide_handover_dialogue" BOOLEAN DEFAULT true,
    "agent_can_manage_quick_replies" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "agent_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agent_settings_overrides" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "auto_assign_agent" BOOLEAN,
    "agent_can_takeover_unserved" BOOLEAN,
    "agent_can_access_customers" BOOLEAN,
    "agent_can_import_export_customers" BOOLEAN,
    "agent_can_send_broadcast" BOOLEAN,
    "agent_can_broadcast_in_service_window" BOOLEAN,
    "hide_agent_status_toggle" BOOLEAN,
    "hide_customer_id" BOOLEAN,
    "agent_can_assign_chat" BOOLEAN,
    "agent_can_add_agents_to_chat" BOOLEAN,
    "agent_can_leave_chat" BOOLEAN,
    "hide_handover_dialogue" BOOLEAN,
    "agent_can_manage_quick_replies" BOOLEAN,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "agent_settings_overrides_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_conversation_contexts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "conversation_id" UUID NOT NULL,
    "context_summary" TEXT,
    "entities" JSONB DEFAULT '{}',
    "ai_reply_count" INTEGER DEFAULT 0,
    "last_ai_action" VARCHAR(50),
    "last_ai_action_at" TIMESTAMPTZ(6),
    "human_takeover" BOOLEAN DEFAULT false,
    "human_takeover_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_conversation_contexts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_evaluation_messages" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "evaluation_id" UUID NOT NULL,
    "role" VARCHAR(20) NOT NULL,
    "message" TEXT NOT NULL,
    "msg_id" VARCHAR(255),
    "media_url" TEXT,
    "media_type" VARCHAR(50) DEFAULT 'text',
    "conversation_id" UUID,
    "msg_created_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_evaluation_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_evaluations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "app_id" UUID NOT NULL,
    "chatbot_id" UUID NOT NULL,
    "content" TEXT,
    "type" VARCHAR(50) DEFAULT 'evaluation',
    "metadata" JSONB DEFAULT '{}',
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "ai_evaluations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_response_templates" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "app_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "template" TEXT NOT NULL,
    "variables" JSONB DEFAULT '[]',
    "category" VARCHAR(100),
    "language" VARCHAR(10) DEFAULT 'en',
    "is_active" BOOLEAN DEFAULT true,
    "usage_count" INTEGER DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_response_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_settings" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "app_id" UUID NOT NULL,
    "ai_mode" VARCHAR(50) DEFAULT 'assist',
    "model_provider" VARCHAR(50) DEFAULT 'openai',
    "model_name" VARCHAR(100) DEFAULT 'gpt-4o-mini',
    "temperature" DECIMAL(2,1) DEFAULT 0.7,
    "max_tokens" INTEGER DEFAULT 500,
    "auto_reply_confidence" DECIMAL(3,2) DEFAULT 0.85,
    "handoff_keywords" TEXT[] DEFAULT ARRAY['speak to human', 'talk to agent', 'help']::TEXT[],
    "response_tone" VARCHAR(50) DEFAULT 'professional',
    "supported_languages" TEXT[] DEFAULT ARRAY['en', 'id']::TEXT[],
    "auto_detect_language" BOOLEAN DEFAULT true,
    "max_ai_replies_per_conversation" INTEGER DEFAULT 5,
    "cooldown_after_limit_minutes" INTEGER DEFAULT 30,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "use_platform_credentials" BOOLEAN DEFAULT true,
    "api_key" TEXT,
    "api_endpoint" TEXT,
    "api_version" VARCHAR(50) DEFAULT '2024-02-15-preview',
    "deployment_name" VARCHAR(255),

    CONSTRAINT "ai_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_model_pricing" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "model_name" VARCHAR(100) NOT NULL,
    "cost_per_request" DECIMAL(10,4) NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN DEFAULT true,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_model_pricing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_response_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "app_id" UUID NOT NULL,
    "chatbot_id" UUID NOT NULL,
    "conversation_id" UUID,
    "entrypoint" VARCHAR(60) NOT NULL,
    "provider" VARCHAR(80),
    "model_name" VARCHAR(200),
    "prompt_tokens" INTEGER DEFAULT 0,
    "completion_tokens" INTEGER DEFAULT 0,
    "total_tokens" INTEGER DEFAULT 0,
    "usage_credits" DECIMAL(18,6) DEFAULT 0,
    "usage_usd" DECIMAL(18,6) DEFAULT 0,
    "usage_idr" DECIMAL(18,6) DEFAULT 0,
    "billed_credits" DECIMAL(18,6) DEFAULT 0,
    "knowledge_references" JSONB DEFAULT '[]',
    "rtk_summary" JSONB DEFAULT '{}',
    "message_ids" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" VARCHAR(50) DEFAULT 'generated',
    "retry_count" INTEGER DEFAULT 0,
    "knowledge_snapshot_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_response_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_playground_models" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "app_id" UUID NOT NULL,
    "model_key" VARCHAR(80) NOT NULL,
    "name" VARCHAR(160) NOT NULL,
    "vendor" VARCHAR(120) NOT NULL,
    "context_window" VARCHAR(32) NOT NULL,
    "price_in" DECIMAL(12,6) NOT NULL,
    "price_out" DECIMAL(12,6) NOT NULL,
    "speed" VARCHAR(20) NOT NULL,
    "tier" VARCHAR(20) NOT NULL,
    "connected" BOOLEAN DEFAULT false,
    "latency_ms" INTEGER,
    "usage_percent" INTEGER DEFAULT 0,
    "sort_order" INTEGER DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_playground_models_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_playground_routing_strategies" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "app_id" UUID NOT NULL,
    "strategy_key" VARCHAR(80) NOT NULL,
    "label" VARCHAR(120) NOT NULL,
    "description" TEXT NOT NULL,
    "routing_rules" JSONB NOT NULL DEFAULT '[]',
    "is_active" BOOLEAN DEFAULT false,
    "sort_order" INTEGER DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_playground_routing_strategies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_playground_personas" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "app_id" UUID NOT NULL,
    "persona_key" VARCHAR(80) NOT NULL,
    "label" VARCHAR(160) NOT NULL,
    "system_instruction" TEXT NOT NULL,
    "is_default" BOOLEAN DEFAULT false,
    "sort_order" INTEGER DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_playground_personas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_playground_guardrails" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "app_id" UUID NOT NULL,
    "guardrail_key" VARCHAR(80) NOT NULL,
    "label" VARCHAR(180) NOT NULL,
    "enabled" BOOLEAN DEFAULT true,
    "sort_order" INTEGER DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_playground_guardrails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_playground_metric_items" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "app_id" UUID NOT NULL,
    "metric_key" VARCHAR(80) NOT NULL,
    "label" VARCHAR(120) NOT NULL,
    "value" VARCHAR(120) NOT NULL,
    "delta" VARCHAR(120) NOT NULL,
    "trend" VARCHAR(20) NOT NULL,
    "positive_when" VARCHAR(20) NOT NULL,
    "sort_order" INTEGER DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_playground_metric_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_playground_sessions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "app_id" UUID NOT NULL,
    "selected_model_id" UUID,
    "selected_strategy_id" UUID,
    "selected_persona_id" UUID,
    "status" VARCHAR(20) DEFAULT 'active',
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_playground_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_playground_turns" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "app_id" UUID NOT NULL,
    "session_id" UUID NOT NULL,
    "role" VARCHAR(20) NOT NULL,
    "content" TEXT NOT NULL,
    "model_name" VARCHAR(160),
    "tokens_in" INTEGER,
    "tokens_out" INTEGER,
    "latency_ms" INTEGER,
    "cost_usd" DECIMAL(12,6),
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_playground_turns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "top_up_packages" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(100) NOT NULL,
    "price_usd" DECIMAL(10,2) NOT NULL,
    "credits" DECIMAL(10,2) NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN DEFAULT true,
    "sort_order" INTEGER DEFAULT 0,

    CONSTRAINT "top_up_packages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "platform_settings" (
    "key" VARCHAR(100) NOT NULL,
    "value" TEXT NOT NULL,
    "updated_by" UUID,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "platform_settings_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "app_categories" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(100) NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "icon" VARCHAR(50),
    "sort_order" INTEGER DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "app_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app_center" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(255) NOT NULL,
    "author" VARCHAR(255) NOT NULL DEFAULT 'ScaleChat',
    "caption" TEXT NOT NULL,
    "description" TEXT,
    "category_id" UUID,
    "icon_url" TEXT,
    "banner_url" TEXT,
    "version" VARCHAR(50) DEFAULT '1.0.0',
    "is_featured" BOOLEAN DEFAULT false,
    "is_active" BOOLEAN DEFAULT true,
    "pricing_type" VARCHAR(50) DEFAULT 'free',
    "price" DECIMAL(10,2) DEFAULT 0,
    "setting_url" TEXT,
    "settings_new_tab" BOOLEAN DEFAULT false,
    "webhook_url" TEXT,
    "permissions" JSONB DEFAULT '[]',
    "metadata" JSONB DEFAULT '{}',
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "is_coming_soon" BOOLEAN DEFAULT false,

    CONSTRAINT "app_center_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app_installations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "app_id" UUID NOT NULL,
    "app_id_org" VARCHAR(255) NOT NULL,
    "status" VARCHAR(50) DEFAULT 'pending',
    "is_enabled" BOOLEAN DEFAULT true,
    "installed_by" UUID,
    "settings" JSONB DEFAULT '{}',
    "installed_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "app_installations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app_usage_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "app_id" UUID,
    "endpoint" VARCHAR(255),
    "method" VARCHAR(10),
    "status_code" INTEGER,
    "response_time_ms" INTEGER,
    "ip_address" VARCHAR(45),
    "user_agent" TEXT,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "app_usage_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "apps" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "app_id" VARCHAR(64) NOT NULL,
    "app_secret_hash" VARCHAR(255),
    "app_name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN DEFAULT true,
    "allowed_origins" JSONB DEFAULT '[]',
    "rate_limit_per_minute" INTEGER DEFAULT 60,
    "last_used_at" TIMESTAMP(6),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "business_name" VARCHAR(255) NOT NULL,
    "deleted_at" TIMESTAMP(6),
    "ai_credits" DECIMAL(10,2) DEFAULT 0.0,
    "ai_credit_warning_threshold" DECIMAL(10,2) DEFAULT 5.0,
    "ai_low_credit_alert_sent" BOOLEAN DEFAULT false,

    CONSTRAINT "apps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_level_settings" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "app_id" UUID NOT NULL,
    "vip_chatbot_id" UUID,
    "premium_chatbot_id" UUID,
    "basic_chatbot_id" UUID,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "customer_level_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "credit_transactions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organization_id" TEXT,
    "app_id" UUID,
    "amount" DECIMAL(10,2) NOT NULL,
    "type" VARCHAR(20) NOT NULL,
    "description" TEXT,
    "metadata" JSONB DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reservation_id" UUID,
    "external_id" VARCHAR(255),
    "payment_status" VARCHAR(20) DEFAULT 'completed',

    CONSTRAINT "credit_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assignment_history" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "conversation_id" UUID NOT NULL,
    "assigned_to" UUID,
    "assigned_from" UUID,
    "assignment_type" VARCHAR(50),
    "auto_assign_rule_id" UUID,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "assignment_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auto_assign_rules" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "app_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "rule_type" VARCHAR(50) NOT NULL DEFAULT 'round_robin',
    "priority" INTEGER DEFAULT 0,
    "conditions" JSONB DEFAULT '{}',
    "target_type" VARCHAR(50) DEFAULT 'all',
    "target_ids" UUID[] DEFAULT ARRAY[]::UUID[],
    "fallback_action" VARCHAR(50) DEFAULT 'queue',
    "fallback_agent_id" UUID,
    "is_active" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auto_assign_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "handover_requests" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "app_id" UUID NOT NULL,
    "conversation_id" UUID NOT NULL,
    "request_type" VARCHAR(20) NOT NULL DEFAULT 'take',
    "requested_by" UUID,
    "target_agent_id" UUID,
    "status" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "request_note" TEXT,
    "approval_note" TEXT,
    "approved_by" UUID,
    "approved_at" TIMESTAMPTZ(6),
    "rejected_by" UUID,
    "rejected_at" TIMESTAMPTZ(6),
    "source_rule_id" UUID,
    "ai_reason" TEXT,
    "ai_intent" VARCHAR(255),
    "sla_due_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "handover_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auto_responder_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "rule_id" UUID,
    "conversation_id" UUID,
    "message_id" UUID,
    "triggered_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "response_sent" BOOLEAN DEFAULT false,
    "response_message_id" UUID,
    "metadata" JSONB DEFAULT '{}',

    CONSTRAINT "auto_responder_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auto_responder_rules" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "inbox_id" UUID,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "trigger_type" VARCHAR(50) NOT NULL,
    "trigger_config" JSONB DEFAULT '{}',
    "response_type" VARCHAR(50) DEFAULT 'text',
    "response_content" TEXT NOT NULL,
    "response_delay_seconds" INTEGER DEFAULT 0,
    "max_triggers_per_conversation" INTEGER DEFAULT 1,
    "cooldown_minutes" INTEGER DEFAULT 60,
    "is_active" BOOLEAN DEFAULT true,
    "priority" INTEGER DEFAULT 0,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "app_id" UUID NOT NULL,

    CONSTRAINT "auto_responder_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "automation_flows" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "app_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "nodes" JSONB DEFAULT '[]',
    "edges" JSONB DEFAULT '[]',
    "active" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "automation_flows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "automation_rules" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "account_id" UUID,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "event_name" VARCHAR(50) NOT NULL,
    "conditions" JSONB DEFAULT '[]',
    "actions" JSONB DEFAULT '[]',
    "active" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "automation_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "broadcast_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "broadcast_id" UUID,
    "contact_id" UUID,
    "message_id" UUID,
    "status" VARCHAR(50) DEFAULT 'queued',
    "error_message" TEXT,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "broadcast_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "broadcasts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "account_id" UUID,
    "title" VARCHAR(255) NOT NULL,
    "message_type" VARCHAR(50) DEFAULT 'text',
    "message_content" TEXT,
    "template_params" JSONB DEFAULT '{}',
    "target_audience" JSONB DEFAULT '{}',
    "status" VARCHAR(50) DEFAULT 'draft',
    "scheduled_at" TIMESTAMP(6),
    "total_recipients" INTEGER DEFAULT 0,
    "success_count" INTEGER DEFAULT 0,
    "failed_count" INTEGER DEFAULT 0,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "app_id" UUID,
    "deleted_at" TIMESTAMP(6),

    CONSTRAINT "broadcasts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "canned_responses" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "account_id" UUID,
    "short_code" VARCHAR(50) NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "app_id" UUID,

    CONSTRAINT "canned_responses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "channel_accounts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "app_id" UUID NOT NULL,
    "channel_type" VARCHAR(50) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "account_data" JSONB DEFAULT '{}',
    "active" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "channel_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chatbots" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "app_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "model" VARCHAR(100) DEFAULT 'gpt-4o-mini',
    "prompt" TEXT,
    "welcome_msg" TEXT,
    "agent_transfer" TEXT,
    "temperature" DECIMAL(3,2) DEFAULT 0.2,
    "history_limit" INTEGER DEFAULT 50,
    "context_limit" INTEGER DEFAULT 50,
    "message_await" INTEGER DEFAULT 30,
    "message_limit" INTEGER DEFAULT 1000,
    "is_silent_handoff_agent" BOOLEAN DEFAULT false,
    "watcher_enabled" BOOLEAN DEFAULT false,
    "session_only_memory" BOOLEAN DEFAULT false,
    "plugin_type" VARCHAR(50),
    "plugin_data" JSONB DEFAULT '{}',
    "is_hidden" BOOLEAN DEFAULT false,
    "is_deleted" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "timezone" VARCHAR(100) DEFAULT 'Asia/Jakarta',
    "label_condition" TEXT,
    "app_data" JSONB DEFAULT '{}',
    "ai_followups" JSONB DEFAULT '[]',
    "selected_labels" JSONB DEFAULT '[]',
    "max_file_read_window" INTEGER DEFAULT 3,
    "stop_after_handoff" BOOLEAN DEFAULT true,

    CONSTRAINT "chatbots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consent_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "contact_id" UUID NOT NULL,
    "status" VARCHAR(50) NOT NULL,
    "purpose" VARCHAR(100),
    "source" VARCHAR(100),
    "captured_by" UUID,
    "ip_address" VARCHAR(45),
    "user_agent" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "consent_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact_custom_fields" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "field_key" VARCHAR(100) NOT NULL,
    "field_label" VARCHAR(255) NOT NULL,
    "field_type" VARCHAR(50) NOT NULL,
    "options" JSONB DEFAULT '[]',
    "is_required" BOOLEAN DEFAULT false,
    "is_visible" BOOLEAN DEFAULT true,
    "display_order" INTEGER DEFAULT 0,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "app_id" UUID NOT NULL,

    CONSTRAINT "contact_custom_fields_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact_notes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "contact_id" UUID,
    "user_id" UUID,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contact_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact_tag_assignments" (
    "contact_id" UUID NOT NULL,
    "tag_id" UUID NOT NULL,
    "assigned_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contact_tag_assignments_pkey" PRIMARY KEY ("contact_id","tag_id")
);

-- CreateTable
CREATE TABLE "contact_tags" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "app_id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "color" VARCHAR(20) DEFAULT '#3B82F6',
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contact_tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contacts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "account_id" UUID,
    "name" VARCHAR(255),
    "email" VARCHAR(255),
    "phone_number" VARCHAR(50),
    "avatar_url" TEXT,
    "identifier" VARCHAR(100),
    "channel_type" VARCHAR(50),
    "metadata" JSONB DEFAULT '{}',
    "additional_attributes" JSONB DEFAULT '{}',
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "app_id" UUID,
    "badge_url" TEXT,
    "deleted_at" TIMESTAMP(6),
    "whatsapp_id" VARCHAR(50),
    "instagram_id" VARCHAR(50),
    "tiktok_id" VARCHAR(50),
    "instagram_igsid" VARCHAR(50),
    "first_contact_at" TIMESTAMP(6),
    "last_inbound_message_at" TIMESTAMP(6),
    "last_message_at" TIMESTAMP(6),
    "window_expires_at" TIMESTAMP(6),
    "consent_status" VARCHAR(50) DEFAULT 'NOT_CONSENTED',
    "source" VARCHAR(100),
    "custom_attributes" JSONB,
    "company" TEXT,
    "country" VARCHAR(100),
    "city" VARCHAR(100),
    "last_activity_at" TIMESTAMP(6),
    "pubsub_token" VARCHAR(255),
    "meta" JSONB,

    CONSTRAINT "contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversation_activity_log" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "conversation_id" UUID NOT NULL,
    "action" VARCHAR(50) NOT NULL,
    "actor_id" UUID,
    "actor_type" VARCHAR(20) DEFAULT 'user',
    "target_id" UUID,
    "metadata" JSONB DEFAULT '{}',
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "conversation_activity_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversation_agents" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "conversation_id" UUID NOT NULL,
    "agent_id" UUID NOT NULL,
    "assigned_by" UUID,
    "assigned_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "removed_at" TIMESTAMP(6),
    "removed_by" UUID,
    "is_primary" BOOLEAN DEFAULT false,
    "status" VARCHAR(20) DEFAULT 'active',

    CONSTRAINT "conversation_agents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversation_labels" (
    "conversation_id" UUID NOT NULL,
    "label_id" UUID NOT NULL,

    CONSTRAINT "conversation_labels_pkey" PRIMARY KEY ("conversation_id","label_id")
);

-- CreateTable
CREATE TABLE "conversation_notes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "conversation_id" UUID,
    "user_id" UUID,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "conversation_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversation_participants" (
    "conversation_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,

    CONSTRAINT "conversation_participants_pkey" PRIMARY KEY ("conversation_id","user_id")
);

-- CreateTable
CREATE TABLE "conversation_ratings" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "conversation_id" UUID NOT NULL,
    "contact_id" UUID,
    "rating" INTEGER NOT NULL,
    "feedback" TEXT,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "conversation_ratings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversation_sales" (
    "conversation_id" UUID NOT NULL,
    "pipeline_id" UUID,
    "stage_id" UUID,
    "deal_value" DECIMAL(12,2) DEFAULT 0,
    "probability_snapshot" INTEGER DEFAULT 0,
    "expected_revenue" DECIMAL(12,2) DEFAULT 0,
    "stage_entered_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "stage_history" JSONB DEFAULT '[]',
    "metadata" JSONB DEFAULT '{}',
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "conversation_sales_pkey" PRIMARY KEY ("conversation_id")
);

-- CreateTable
CREATE TABLE "conversations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "account_id" UUID,
    "inbox_id" UUID,
    "contact_id" UUID,
    "channel_type" VARCHAR(50),
    "assignee_id" UUID,
    "team_id" UUID,
    "status" VARCHAR(20) DEFAULT 'open',
    "unread_count" INTEGER DEFAULT 0,
    "priority" VARCHAR(20) DEFAULT 'low',
    "snoozed_until" TIMESTAMP(6),
    "waiting_since" TIMESTAMP(6),
    "last_message_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "custom_attributes" JSONB DEFAULT '{}',
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "app_id" UUID,
    "deleted_at" TIMESTAMP(6),
    "first_reply_at" TIMESTAMP(6),
    "resolved_at" TIMESTAMP(6),
    "sla_breach_at" TIMESTAMP(6),
    "pipeline_id" UUID,
    "stage_id" UUID,
    "tags" JSONB,
    "messaging_window_expires_at" TIMESTAMP(6),
    "messaging_window_open" BOOLEAN DEFAULT false,
    "total_messages" INTEGER DEFAULT 0,
    "agent_last_seen_at" TIMESTAMP(6),
    "contact_last_seen_at" TIMESTAMP(6),
    "additional_attributes" JSONB,
    "resolution_time_seconds" INTEGER,
    "first_response_time_seconds" INTEGER,
    "waiting_time_seconds" INTEGER,
    "last_activity_at" TIMESTAMP(6),
    "browser_info" JSONB,
    "referer" TEXT,
    "source_id" UUID,
    "identifier" VARCHAR(255),
    "meta" JSONB,
    "messaging_window_opened_at" TIMESTAMP(6),
    "is_within_messaging_window" BOOLEAN DEFAULT false,

    CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "custom_attribute_definitions" (
    "id" SERIAL NOT NULL,
    "attribute_display_name" VARCHAR(255) NOT NULL,
    "attribute_key" VARCHAR(255) NOT NULL,
    "attribute_model" VARCHAR(50) DEFAULT 'contact_attribute',
    "attribute_description" TEXT,
    "attribute_values" JSONB DEFAULT '[]',
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "custom_attribute_definitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "divisions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "parent_division_id" UUID,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "app_id" UUID NOT NULL,
    "color" VARCHAR(50) DEFAULT '#3B82F6',

    CONSTRAINT "divisions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "embeddings" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "source_id" UUID,
    "faq_id" UUID,
    "content_chunk" TEXT,
    "chunk_index" INTEGER DEFAULT 0,
    "embedding" vector,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "embeddings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "form_extraction_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "submission_id" UUID,
    "message_id" UUID,
    "raw_text" TEXT,
    "ai_response" JSONB,
    "extracted_count" INTEGER DEFAULT 0,
    "success" BOOLEAN DEFAULT true,
    "error_message" TEXT,
    "processing_time_ms" INTEGER,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "form_extraction_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "form_fields" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "form_id" UUID,
    "field_key" VARCHAR(100) NOT NULL,
    "label" VARCHAR(255) NOT NULL,
    "field_type" VARCHAR(50) NOT NULL,
    "is_required" BOOLEAN DEFAULT false,
    "order_no" INTEGER DEFAULT 0,
    "validation" JSONB DEFAULT '{}',
    "ai_aliases" JSONB DEFAULT '[]',
    "ai_context" TEXT,
    "options" JSONB DEFAULT '[]',
    "default_value" TEXT,
    "placeholder" TEXT,
    "help_text" TEXT,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "form_fields_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "form_submission_values" (
    "submission_id" UUID NOT NULL,
    "field_id" UUID NOT NULL,
    "value" TEXT,
    "normalized_value" TEXT,
    "source" VARCHAR(50) DEFAULT 'manual',
    "confidence" INTEGER DEFAULT 0,
    "extracted_from_message_id" UUID,
    "extracted_at" TIMESTAMP(6),
    "is_valid" BOOLEAN DEFAULT true,
    "validation_error" TEXT,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "form_submission_values_pkey" PRIMARY KEY ("submission_id","field_id")
);

-- CreateTable
CREATE TABLE "form_submissions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "form_id" UUID,
    "conversation_id" UUID,
    "status" VARCHAR(50) DEFAULT 'draft',
    "confidence_score" INTEGER DEFAULT 0,
    "extraction_method" VARCHAR(50) DEFAULT 'manual',
    "required_fields_count" INTEGER DEFAULT 0,
    "filled_fields_count" INTEGER DEFAULT 0,
    "completion_percentage" INTEGER DEFAULT 0,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(6),
    "verified_at" TIMESTAMP(6),
    "metadata" JSONB DEFAULT '{}',

    CONSTRAINT "form_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "form_templates" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "industry" VARCHAR(100),
    "schema" JSONB DEFAULT '{}',
    "is_public" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "form_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "forms" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "inbox_id" UUID,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "template_id" UUID,
    "is_active" BOOLEAN DEFAULT true,
    "auto_extract" BOOLEAN DEFAULT true,
    "confidence_threshold" INTEGER DEFAULT 70,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "app_id" UUID NOT NULL,

    CONSTRAINT "forms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inboxes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "account_id" UUID,
    "name" VARCHAR(255) NOT NULL,
    "channel_type" VARCHAR(50),
    "channel_config" JSONB DEFAULT '{}',
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "app_id" UUID,
    "deleted_at" TIMESTAMP(6),
    "chatbot_id" UUID,
    "is_active" BOOLEAN DEFAULT true,
    "auto_assign_enabled" BOOLEAN DEFAULT false,
    "greeting_enabled" BOOLEAN DEFAULT false,
    "greeting_message" TEXT,
    "business_hours" JSONB,
    "enable_auto_assignment" BOOLEAN DEFAULT true,
    "out_of_office_message" TEXT,
    "csat_survey_enabled" BOOLEAN DEFAULT false,
    "allow_messages_after_resolved" BOOLEAN DEFAULT true,
    "lock_to_single_conversation" BOOLEAN DEFAULT false,
    "sender_name_type" VARCHAR(50),
    "portal_id" UUID,

    CONSTRAINT "inboxes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "knowledge_categories" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "app_id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "parent_id" UUID,
    "position" INTEGER DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "chatbot_id" UUID,

    CONSTRAINT "knowledge_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "knowledge_faqs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "app_id" UUID NOT NULL,
    "category_id" UUID,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "keywords" TEXT[],
    "priority" INTEGER DEFAULT 0,
    "is_active" BOOLEAN DEFAULT true,
    "view_count" INTEGER DEFAULT 0,
    "helpful_count" INTEGER DEFAULT 0,
    "not_helpful_count" INTEGER DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "chatbot_id" UUID,

    CONSTRAINT "knowledge_faqs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "knowledge_sources" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "title" VARCHAR(255) NOT NULL,
    "content" TEXT,
    "type" VARCHAR(50) DEFAULT 'text',
    "format" VARCHAR(50) DEFAULT 'text',
    "metadata" JSONB DEFAULT '{}',
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "app_id" UUID,
    "chatbot_id" UUID,
    "category_id" UUID,
    "source_type" VARCHAR(50) DEFAULT 'manual',
    "source_url" TEXT,
    "file_name" VARCHAR(255),
    "file_size" INTEGER,
    "file_type" VARCHAR(50),
    "status" VARCHAR(50) DEFAULT 'pending',
    "error_message" TEXT,
    "chunk_count" INTEGER DEFAULT 0,
    "embedding_model" VARCHAR(100) DEFAULT 'text-embedding-3-small',
    "embedding_dimension" INTEGER DEFAULT 1536,
    "index_size_bytes" BIGINT DEFAULT 0,
    "hit_count" INTEGER DEFAULT 0,
    "last_hit_at" TIMESTAMPTZ(6),
    "active_version" INTEGER DEFAULT 1,
    "last_synced_at" TIMESTAMPTZ(6),
    "is_active" BOOLEAN DEFAULT true,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "knowledge_sources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "knowledge_source_files" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "app_id" UUID NOT NULL,
    "chatbot_id" UUID,
    "source_id" UUID NOT NULL,
    "file_name" VARCHAR(255) NOT NULL,
    "mime_type" VARCHAR(120),
    "file_size_bytes" BIGINT DEFAULT 0,
    "checksum_sha256" VARCHAR(128),
    "storage_key" VARCHAR(500),
    "storage_url" TEXT,
    "extraction_metadata" JSONB DEFAULT '{}',
    "page_count" INTEGER,
    "duration_ms" INTEGER,
    "language" VARCHAR(24),
    "status" VARCHAR(50) DEFAULT 'pending',
    "error_message" TEXT,
    "extracted_at" TIMESTAMPTZ(6),
    "is_active" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "knowledge_source_files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "knowledge_ingestion_jobs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "app_id" UUID NOT NULL,
    "chatbot_id" UUID,
    "source_id" UUID NOT NULL,
    "source_file_id" UUID,
    "trigger" VARCHAR(50) DEFAULT 'manual',
    "stage" VARCHAR(50) DEFAULT 'ingest',
    "status" VARCHAR(50) DEFAULT 'pending',
    "attempts" INTEGER DEFAULT 0,
    "started_at" TIMESTAMPTZ(6),
    "finished_at" TIMESTAMPTZ(6),
    "error_message" TEXT,
    "payload" JSONB DEFAULT '{}',
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "knowledge_ingestion_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "knowledge_chunks" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "app_id" UUID NOT NULL,
    "chatbot_id" UUID,
    "source_id" UUID NOT NULL,
    "file_id" UUID,
    "source_version" INTEGER DEFAULT 1,
    "chunk_index" INTEGER NOT NULL,
    "chunk_text" TEXT NOT NULL,
    "chunk_hash" VARCHAR(128),
    "char_count" INTEGER DEFAULT 0,
    "token_count" INTEGER DEFAULT 0,
    "locator_label" VARCHAR(255),
    "locator_json" JSONB DEFAULT '{}',
    "embedding_model" VARCHAR(100) DEFAULT 'text-embedding-3-small',
    "embedding_dimension" INTEGER DEFAULT 1536,
    "embedding" vector,
    "chunk_tsv" tsvector,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "knowledge_chunks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "knowledge_query_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "app_id" UUID NOT NULL,
    "chatbot_id" UUID,
    "channel" VARCHAR(20) DEFAULT 'live',
    "query_text" TEXT NOT NULL,
    "selected_source_ids" JSONB DEFAULT '[]',
    "top_k" INTEGER DEFAULT 5,
    "retrieval_ms" INTEGER DEFAULT 0,
    "rag_hit" BOOLEAN DEFAULT false,
    "hit_chunk_count" INTEGER DEFAULT 0,
    "avg_topk_score" DECIMAL(12,6) DEFAULT 0,
    "threshold_used" DECIMAL(8,6) DEFAULT 0.3,
    "prompt_tokens" INTEGER DEFAULT 0,
    "completion_tokens" INTEGER DEFAULT 0,
    "total_tokens" INTEGER DEFAULT 0,
    "usage_credits" DECIMAL(18,6) DEFAULT 0,
    "usage_usd" DECIMAL(18,6) DEFAULT 0,
    "usage_idr" DECIMAL(18,6) DEFAULT 0,
    "answer_text" TEXT,
    "metadata" JSONB DEFAULT '{}',
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "knowledge_query_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "knowledge_query_chunks" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "app_id" UUID NOT NULL,
    "chatbot_id" UUID,
    "query_log_id" UUID NOT NULL,
    "chunk_id" UUID,
    "source_id" UUID,
    "rank" INTEGER NOT NULL,
    "score" DECIMAL(12,6) DEFAULT 0,
    "locator_label" VARCHAR(255),
    "snippet" TEXT,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "knowledge_query_chunks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "labels" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "account_id" UUID,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "color" VARCHAR(50) DEFAULT '#1F2937',
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "app_id" UUID,
    "badge_url" TEXT,
    "deleted_at" TIMESTAMP(6),
    "is_visible" BOOLEAN DEFAULT true,
    "show_on_sidebar" BOOLEAN DEFAULT true,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "labels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media_files" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "app_id" UUID,
    "platform" VARCHAR(50) NOT NULL,
    "media_id" VARCHAR(255) NOT NULL,
    "message_id" UUID,
    "media_type" VARCHAR(50),
    "mime_type" VARCHAR(100),
    "filename" VARCHAR(255),
    "caption" TEXT,
    "file_size" BIGINT,
    "sha256" VARCHAR(64),
    "media_url" TEXT,
    "local_url" TEXT,
    "thumbnail_url" TEXT,
    "download_status" VARCHAR(50) DEFAULT 'pending',
    "downloaded_at" TIMESTAMP(6),
    "download_error" TEXT,
    "url_expires_at" TIMESTAMP(6),
    "uploaded_by" UUID,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "media_files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mentions" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER,
    "conversation_id" INTEGER,
    "message_id" INTEGER,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mentions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "message_status_history" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "message_id" UUID NOT NULL,
    "external_message_id" VARCHAR(255),
    "status" VARCHAR(50) NOT NULL,
    "previous_status" VARCHAR(50),
    "error_code" VARCHAR(50),
    "error_title" TEXT,
    "error_message" TEXT,
    "error_details" JSONB,
    "timestamp" TIMESTAMP(6) NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "webhook_payload" JSONB,

    CONSTRAINT "message_status_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "conversation_id" UUID,
    "message_type" VARCHAR(20) NOT NULL,
    "content" TEXT,
    "content_attributes" JSONB DEFAULT '{}',
    "content_type" VARCHAR(20) DEFAULT 'text',
    "sender_id" UUID,
    "sender_type" VARCHAR(50) DEFAULT 'user',
    "private" BOOLEAN DEFAULT false,
    "status" VARCHAR(20) DEFAULT 'sent',
    "external_id" VARCHAR(255),
    "metadata" JSONB DEFAULT '{}',
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "app_id" UUID,
    "deleted_at" TIMESTAMP(6),
    "type" VARCHAR(50),
    "extras" JSONB,
    "context" JSONB,
    "error" JSONB,
    "raw_payload" JSONB,
    "is_deleted" BOOLEAN DEFAULT false,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "reply_to_message_id" UUID,
    "unique_temp_id" VARCHAR(100),
    "source_id" UUID,
    "inbox_id" UUID,
    "additional_attributes" JSONB,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meta_ads_accounts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "app_id_org" VARCHAR(255) NOT NULL,
    "fb_account_id" VARCHAR(50) NOT NULL,
    "fb_account_name" VARCHAR(255) NOT NULL,
    "fb_business_name" VARCHAR(255),
    "currency" VARCHAR(10) DEFAULT 'IDR',
    "country_code" VARCHAR(5) DEFAULT 'ID',
    "access_token" TEXT NOT NULL,
    "token_expires_at" TIMESTAMPTZ(6),
    "is_active" BOOLEAN DEFAULT true,
    "last_synced_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "meta_ads_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meta_ads_campaigns" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "ads_account_id" UUID NOT NULL,
    "campaign_id" VARCHAR(50) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "objective" VARCHAR(50),
    "status" VARCHAR(20),
    "daily_budget" DECIMAL(15,2),
    "lifetime_budget" DECIMAL(15,2),
    "metadata" JSONB DEFAULT '{}',
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "meta_ads_campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meta_ads_insights" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "ads_account_id" UUID,
    "campaign_id" UUID,
    "date_start" DATE NOT NULL,
    "date_stop" DATE NOT NULL,
    "impressions" BIGINT DEFAULT 0,
    "reach" BIGINT DEFAULT 0,
    "clicks" BIGINT DEFAULT 0,
    "spend" DECIMAL(15,2) DEFAULT 0,
    "cpc" DECIMAL(15,4),
    "cpm" DECIMAL(15,4),
    "ctr" DECIMAL(15,6),
    "messaging_conversations_started" BIGINT DEFAULT 0,
    "messaging_first_reply" BIGINT DEFAULT 0,
    "actions_json" JSONB DEFAULT '[]',
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "meta_ads_insights_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "migrations" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "run_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "migrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "office_hours" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "inbox_id" UUID,
    "day_of_week" INTEGER NOT NULL,
    "open_time" TIME(6) NOT NULL,
    "close_time" TIME(6) NOT NULL,
    "is_active" BOOLEAN DEFAULT true,
    "timezone" VARCHAR(50) DEFAULT 'Asia/Jakarta',
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "app_id" UUID NOT NULL,

    CONSTRAINT "office_hours_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pipeline_stages" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "pipeline_id" UUID,
    "name" VARCHAR(255) NOT NULL,
    "stage_order" INTEGER NOT NULL,
    "stage_type" VARCHAR(20) DEFAULT 'open',
    "probability" INTEGER DEFAULT 0,
    "color" VARCHAR(20) DEFAULT '#3B82F6',
    "automation_rules" JSONB DEFAULT '{}',
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pipeline_stages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pipelines" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(255) NOT NULL,
    "pipeline_type" VARCHAR(50) DEFAULT 'retail',
    "is_default" BOOLEAN DEFAULT false,
    "settings" JSONB DEFAULT '{}',
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "app_id" UUID NOT NULL,

    CONSTRAINT "pipelines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sla_breach_events" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "conversation_id" UUID NOT NULL,
    "sla_policy_id" UUID,
    "breach_type" VARCHAR(50) NOT NULL,
    "due_at" TIMESTAMPTZ(6),
    "breached_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "notified" BOOLEAN DEFAULT false,
    "resolved" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sla_breach_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sla_policies" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "app_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "first_response_time" INTEGER NOT NULL DEFAULT 15,
    "resolution_time" INTEGER NOT NULL DEFAULT 1440,
    "conditions" JSONB DEFAULT '{}',
    "escalate_on_breach" BOOLEAN DEFAULT true,
    "escalation_agent_id" UUID,
    "business_hours" JSONB,
    "is_active" BOOLEAN DEFAULT true,
    "is_default" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sla_policies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stage_transitions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "conversation_id" UUID,
    "from_stage_id" UUID,
    "to_stage_id" UUID,
    "user_id" UUID,
    "transition_type" VARCHAR(50) DEFAULT 'manual',
    "notes" TEXT,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stage_transitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team_members" (
    "team_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,

    CONSTRAINT "team_members_pkey" PRIMARY KEY ("team_id","user_id")
);

-- CreateTable
CREATE TABLE "teams" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "account_id" UUID,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "allow_auto_assign" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(6),
    "app_id" UUID,

    CONSTRAINT "teams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "template_variables" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "app_id" UUID,
    "name" VARCHAR(100) NOT NULL,
    "category" VARCHAR(50) DEFAULT 'custom',
    "value" TEXT,
    "fallback_value" TEXT,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "template_variables_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "webhook_events" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "source" VARCHAR(50) NOT NULL,
    "event_type" VARCHAR(100) NOT NULL,
    "raw_payload" JSONB NOT NULL,
    "headers" JSONB,
    "status" VARCHAR(50) DEFAULT 'pending',
    "processed_at" TIMESTAMP(6),
    "error_message" TEXT,
    "retry_count" INTEGER DEFAULT 0,
    "external_id" VARCHAR(255),
    "is_duplicate" BOOLEAN DEFAULT false,
    "app_id" UUID,
    "inbox_id" UUID,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "webhook_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "webhooks" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "account_id" UUID,
    "app_id" UUID,
    "inbox_id" UUID,
    "name" VARCHAR(255) NOT NULL DEFAULT 'Webhook',
    "url" TEXT NOT NULL,
    "subscriptions" JSONB DEFAULT '[]',
    "is_active" BOOLEAN DEFAULT true,
    "secret" TEXT,
    "headers" JSONB,
    "is_hidden" BOOLEAN DEFAULT false,
    "board_id" UUID,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "webhooks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "whatsapp_channels" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "inbox_id" UUID,
    "phone_number" VARCHAR(50),
    "phone_number_id" VARCHAR(100),
    "api_key" TEXT,
    "waba_id" VARCHAR(100),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT,
    "display_phone_number" TEXT,
    "verified_name" TEXT,
    "quality_rating" TEXT,
    "messaging_limit_tier" TEXT,
    "code_verification_status" TEXT,
    "platform_type" TEXT,
    "throughput_level" TEXT,
    "profile_picture_url" TEXT,
    "about" TEXT,
    "address" TEXT,
    "description" TEXT,
    "email" TEXT,
    "websites" JSONB,
    "vertical" TEXT,
    "messaging_product" TEXT,
    "waba_name" TEXT,
    "waba_timezone_id" TEXT,
    "waba_currency" TEXT,
    "is_official_business_account" BOOLEAN DEFAULT false,
    "is_pin_enabled" BOOLEAN DEFAULT false,
    "account_mode" TEXT,
    "business_id" TEXT,
    "owner_business_info" JSONB,
    "primary_funding_id" TEXT,
    "purchase_order_number" TEXT,
    "last_synced_at" TIMESTAMP(6),
    "sync_error" TEXT,
    "is_active" BOOLEAN DEFAULT true,
    "app_id" UUID,
    "deleted_at" TIMESTAMP(6),
    "messaging_limit" TEXT,
    "business_name" TEXT,
    "timezone" TEXT DEFAULT 'UTC',
    "currency" TEXT DEFAULT 'USD',
    "business_verification_status" TEXT,
    "phone_number_status" TEXT,
    "message_template_namespace" TEXT,
    "name_status" TEXT,
    "extended_metadata" JSONB,
    "badge_url" TEXT,
    "is_on_cloud" BOOLEAN DEFAULT true,
    "is_bot_enabled" BOOLEAN DEFAULT false,
    "is_auto_responder_enabled" BOOLEAN DEFAULT false,
    "forward_enabled" BOOLEAN DEFAULT false,
    "forward_url" TEXT,
    "platform" TEXT DEFAULT 'default',
    "provider" TEXT DEFAULT 'whatsapp_cloud',
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "whatsapp_channels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "account_id" UUID,
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "password" TEXT,
    "role" VARCHAR(50) DEFAULT 'agent',
    "avatar_url" TEXT,
    "active" BOOLEAN DEFAULT true,
    "phone_number" VARCHAR(20),
    "custom_attributes" JSONB DEFAULT '{}',
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "app_id" UUID,
    "last_login_at" TIMESTAMP(6),
    "last_app_used" UUID,
    "refresh_token" TEXT,
    "timezone" VARCHAR(100) DEFAULT 'Asia/Jakarta',
    "timezone_auto_detected" BOOLEAN DEFAULT true,
    "timezone_updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(6),
    "message_signature" TEXT,
    "ui_settings" JSONB,
    "pubsub_token" VARCHAR(255),
    "supervisor_id" UUID,
    "status" VARCHAR(50) DEFAULT 'offline',
    "is_available" BOOLEAN DEFAULT true,
    "organization_name" VARCHAR(255),
    "organization_slug" VARCHAR(255),
    "webhook_app_id" VARCHAR(255),
    "webhook_app_secret_hash" VARCHAR(255),
    "webhook_configured_at" TIMESTAMP(6),
    "webhook_last_rotated_at" TIMESTAMP(6),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "app_id" UUID NOT NULL,
    "organization_id" TEXT,
    "name" VARCHAR(255) NOT NULL,
    "sku" VARCHAR(100),
    "image_url" TEXT,
    "description" TEXT,
    "base_price" DECIMAL(18,2) DEFAULT 0,
    "is_active" BOOLEAN DEFAULT true,
    "metadata" JSONB DEFAULT '{}',
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_variants" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "product_id" UUID NOT NULL,
    "app_id" UUID NOT NULL,
    "organization_id" TEXT,
    "name" VARCHAR(255) NOT NULL,
    "sku" VARCHAR(100),
    "image_url" TEXT,
    "attributes" JSONB DEFAULT '{}',
    "price" DECIMAL(18,2) DEFAULT 0,
    "stock_on_hand" INTEGER DEFAULT 0,
    "stock_reserved" INTEGER DEFAULT 0,
    "is_active" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_variants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_reservations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "app_id" UUID NOT NULL,
    "organization_id" TEXT,
    "order_id" UUID NOT NULL,
    "order_item_id" UUID,
    "variant_id" UUID NOT NULL,
    "quantity" INTEGER NOT NULL,
    "status" VARCHAR(30) DEFAULT 'active',
    "reason" VARCHAR(50) DEFAULT 'checkout',
    "expires_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stock_reservations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_movements" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "app_id" UUID NOT NULL,
    "organization_id" TEXT,
    "variant_id" UUID NOT NULL,
    "reservation_id" UUID,
    "order_id" UUID,
    "movement_type" VARCHAR(30) NOT NULL,
    "quantity" INTEGER NOT NULL,
    "stock_before" INTEGER DEFAULT 0,
    "stock_after" INTEGER DEFAULT 0,
    "note" TEXT,
    "metadata" JSONB DEFAULT '{}',
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stock_movements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organization_id" TEXT,
    "app_id" UUID,
    "contact_id" UUID,
    "conversation_id" UUID,
    "order_number" BIGSERIAL NOT NULL,
    "order_status" VARCHAR(50) DEFAULT 'pending',
    "payment_type" VARCHAR(50) DEFAULT 'one_time_payment',
    "payment_method" VARCHAR(50) DEFAULT 'custom',
    "payment_provider" VARCHAR(50),
    "journey_phase" VARCHAR(50) DEFAULT 'cart',
    "currency" VARCHAR(10) DEFAULT 'IDR',
    "external_order_id" VARCHAR(255),
    "notes" TEXT,
    "address" TEXT,
    "subtotal" DECIMAL(18,2) DEFAULT 0,
    "discount" DECIMAL(18,2) DEFAULT 0,
    "shipping_fee" DECIMAL(18,2) DEFAULT 0,
    "grand_total" DECIMAL(18,2) DEFAULT 0,
    "checkout_at" TIMESTAMPTZ(6),
    "paid_at" TIMESTAMPTZ(6),
    "cancelled_at" TIMESTAMPTZ(6),
    "expired_at" TIMESTAMPTZ(6),
    "metadata" JSONB DEFAULT '{}',
    "business_bank_account" JSONB,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_invoices" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "order_id" UUID NOT NULL,
    "amount" DECIMAL(18,2) DEFAULT 0,
    "status" VARCHAR(50) DEFAULT 'NOT_PAID',
    "provider" VARCHAR(50) DEFAULT 'custom',
    "provider_invoice_id" VARCHAR(255),
    "payment_method" VARCHAR(50),
    "payment_number" TEXT,
    "payment_link" TEXT,
    "checkout_url" TEXT,
    "pdf_link" TEXT,
    "public_token" VARCHAR(120),
    "public_expires_at" TIMESTAMPTZ(6),
    "paid_at" TIMESTAMPTZ(6),
    "verified_at" TIMESTAMPTZ(6),
    "expiry_date" TIMESTAMPTZ(6),
    "provider_payload" JSONB,
    "xendit_invoice_id" VARCHAR(255),
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_items" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "order_id" UUID NOT NULL,
    "product_id" UUID,
    "variant_id" UUID,
    "product_name" TEXT,
    "variant_name" TEXT,
    "quantity" INTEGER DEFAULT 1,
    "unit_price" DECIMAL(18,2) DEFAULT 0,
    "line_total" DECIMAL(18,2) DEFAULT 0,
    "price" DECIMAL(18,2) DEFAULT 0,
    "metadata" JSONB DEFAULT '{}',
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organization_id" TEXT,
    "app_id" UUID,
    "contact_id" UUID,
    "subscription_number" BIGSERIAL NOT NULL,
    "status" VARCHAR(50) DEFAULT 'active',
    "subscription_type" VARCHAR(50) DEFAULT 'monthly',
    "item_name" TEXT,
    "billing_amount" DECIMAL(18,2) DEFAULT 0,
    "cycles" INTEGER DEFAULT 0,
    "start_date" TIMESTAMPTZ(6),
    "next_billing" TIMESTAMPTZ(6),
    "end_date" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "session"("token");

-- CreateIndex
CREATE UNIQUE INDEX "organization_slug_key" ON "organization"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "organization_appId_key" ON "organization"("appId");

-- CreateIndex
CREATE INDEX "idx_agent_availability_app" ON "agent_availability"("app_id", "is_available");

-- CreateIndex
CREATE UNIQUE INDEX "agent_availability_user_id_app_id_key" ON "agent_availability"("user_id", "app_id");

-- CreateIndex
CREATE INDEX "idx_agent_channel_accounts_account" ON "agent_channel_accounts"("account_id");

-- CreateIndex
CREATE INDEX "idx_agent_channel_accounts_user" ON "agent_channel_accounts"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "agent_channel_accounts_user_id_account_id_key" ON "agent_channel_accounts"("user_id", "account_id");

-- CreateIndex
CREATE INDEX "idx_agent_channels_type" ON "agent_channels"("channel_type");

-- CreateIndex
CREATE INDEX "idx_agent_channels_user" ON "agent_channels"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "agent_channels_user_id_channel_type_key" ON "agent_channels"("user_id", "channel_type");

-- CreateIndex
CREATE INDEX "idx_agent_divisions_division" ON "agent_divisions"("division_id");

-- CreateIndex
CREATE INDEX "idx_agent_divisions_user" ON "agent_divisions"("user_id");

-- CreateIndex
CREATE INDEX "idx_agent_inbox_active" ON "agent_inbox_assignments"("is_active");

-- CreateIndex
CREATE INDEX "idx_agent_inbox_inbox" ON "agent_inbox_assignments"("inbox_id");

-- CreateIndex
CREATE INDEX "idx_agent_inbox_user" ON "agent_inbox_assignments"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "agent_inbox_assignments_user_id_inbox_id_key" ON "agent_inbox_assignments"("user_id", "inbox_id");

-- CreateIndex
CREATE UNIQUE INDEX "agent_settings_app_id_key" ON "agent_settings"("app_id");

-- CreateIndex
CREATE INDEX "idx_agent_settings_app_id" ON "agent_settings"("app_id");

-- CreateIndex
CREATE UNIQUE INDEX "agent_settings_overrides_user_id_key" ON "agent_settings_overrides"("user_id");

-- CreateIndex
CREATE INDEX "idx_agent_settings_overrides_user_id" ON "agent_settings_overrides"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "ai_conversation_contexts_conversation_id_key" ON "ai_conversation_contexts"("conversation_id");

-- CreateIndex
CREATE INDEX "idx_ai_contexts_conversation" ON "ai_conversation_contexts"("conversation_id");

-- CreateIndex
CREATE INDEX "idx_ai_eval_messages_eval" ON "ai_evaluation_messages"("evaluation_id");

-- CreateIndex
CREATE INDEX "idx_ai_evaluations_app" ON "ai_evaluations"("app_id");

-- CreateIndex
CREATE INDEX "idx_ai_evaluations_chatbot" ON "ai_evaluations"("chatbot_id");

-- CreateIndex
CREATE UNIQUE INDEX "ai_settings_app_id_key" ON "ai_settings"("app_id");

-- CreateIndex
CREATE UNIQUE INDEX "ai_model_pricing_model_name_key" ON "ai_model_pricing"("model_name");

-- CreateIndex
CREATE INDEX "idx_ai_model_pricing_name" ON "ai_model_pricing"("model_name");

-- CreateIndex
CREATE INDEX "idx_ai_model_pricing_is_active" ON "ai_model_pricing"("is_active");

-- CreateIndex
CREATE INDEX "idx_ai_response_logs_app" ON "ai_response_logs"("app_id");

-- CreateIndex
CREATE INDEX "idx_ai_response_logs_chatbot" ON "ai_response_logs"("chatbot_id");

-- CreateIndex
CREATE INDEX "idx_ai_response_logs_conversation" ON "ai_response_logs"("conversation_id");

-- CreateIndex
CREATE INDEX "idx_ai_response_logs_entrypoint" ON "ai_response_logs"("entrypoint");

-- CreateIndex
CREATE INDEX "idx_ai_response_logs_created" ON "ai_response_logs"("created_at");

-- CreateIndex
CREATE INDEX "idx_ai_playground_models_app_sort" ON "ai_playground_models"("app_id", "sort_order");

-- CreateIndex
CREATE INDEX "idx_ai_playground_models_app_connected" ON "ai_playground_models"("app_id", "connected");

-- CreateIndex
CREATE UNIQUE INDEX "uq_ai_playground_models_app_key" ON "ai_playground_models"("app_id", "model_key");

-- CreateIndex
CREATE INDEX "idx_ai_playground_routing_app_sort" ON "ai_playground_routing_strategies"("app_id", "sort_order");

-- CreateIndex
CREATE INDEX "idx_ai_playground_routing_app_active" ON "ai_playground_routing_strategies"("app_id", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "uq_ai_playground_routing_app_key" ON "ai_playground_routing_strategies"("app_id", "strategy_key");

-- CreateIndex
CREATE INDEX "idx_ai_playground_personas_app_sort" ON "ai_playground_personas"("app_id", "sort_order");

-- CreateIndex
CREATE INDEX "idx_ai_playground_personas_app_default" ON "ai_playground_personas"("app_id", "is_default");

-- CreateIndex
CREATE UNIQUE INDEX "uq_ai_playground_personas_app_key" ON "ai_playground_personas"("app_id", "persona_key");

-- CreateIndex
CREATE INDEX "idx_ai_playground_guardrails_app_sort" ON "ai_playground_guardrails"("app_id", "sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "uq_ai_playground_guardrails_app_key" ON "ai_playground_guardrails"("app_id", "guardrail_key");

-- CreateIndex
CREATE INDEX "idx_ai_playground_metrics_app_sort" ON "ai_playground_metric_items"("app_id", "sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "uq_ai_playground_metrics_app_key" ON "ai_playground_metric_items"("app_id", "metric_key");

-- CreateIndex
CREATE INDEX "idx_ai_playground_sessions_app_updated" ON "ai_playground_sessions"("app_id", "updated_at");

-- CreateIndex
CREATE INDEX "idx_ai_playground_sessions_app_status" ON "ai_playground_sessions"("app_id", "status");

-- CreateIndex
CREATE INDEX "idx_ai_playground_turns_session_sort" ON "ai_playground_turns"("session_id", "sort_order");

-- CreateIndex
CREATE INDEX "idx_ai_playground_turns_app_created" ON "ai_playground_turns"("app_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "top_up_packages_name_key" ON "top_up_packages"("name");

-- CreateIndex
CREATE INDEX "idx_top_up_packages_active" ON "top_up_packages"("is_active");

-- CreateIndex
CREATE INDEX "idx_top_up_packages_order" ON "top_up_packages"("sort_order");

-- CreateIndex
CREATE INDEX "idx_platform_settings_key" ON "platform_settings"("key");

-- CreateIndex
CREATE UNIQUE INDEX "app_categories_slug_key" ON "app_categories"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "app_center_slug_key" ON "app_center"("slug");

-- CreateIndex
CREATE INDEX "idx_app_center_active" ON "app_center"("is_active");

-- CreateIndex
CREATE INDEX "idx_app_center_category" ON "app_center"("category_id");

-- CreateIndex
CREATE INDEX "idx_app_center_featured" ON "app_center"("is_featured");

-- CreateIndex
CREATE INDEX "idx_app_center_slug" ON "app_center"("slug");

-- CreateIndex
CREATE INDEX "idx_app_installations_app" ON "app_installations"("app_id");

-- CreateIndex
CREATE INDEX "idx_app_installations_org" ON "app_installations"("app_id_org");

-- CreateIndex
CREATE INDEX "idx_app_installations_status" ON "app_installations"("status");

-- CreateIndex
CREATE UNIQUE INDEX "app_installations_app_id_app_id_org_key" ON "app_installations"("app_id", "app_id_org");

-- CreateIndex
CREATE INDEX "idx_app_usage_app" ON "app_usage_logs"("app_id");

-- CreateIndex
CREATE INDEX "idx_app_usage_created" ON "app_usage_logs"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "apps_app_id_key" ON "apps"("app_id");

-- CreateIndex
CREATE INDEX "idx_apps_active" ON "apps"("is_active");

-- CreateIndex
CREATE INDEX "idx_apps_app_id" ON "apps"("app_id");

-- CreateIndex
CREATE UNIQUE INDEX "customer_level_settings_app_id_key" ON "customer_level_settings"("app_id");

-- CreateIndex
CREATE INDEX "idx_customer_level_settings_app_id" ON "customer_level_settings"("app_id");

-- CreateIndex
CREATE INDEX "idx_credit_transactions_org" ON "credit_transactions"("organization_id");

-- CreateIndex
CREATE INDEX "idx_credit_transactions_app" ON "credit_transactions"("app_id");

-- CreateIndex
CREATE INDEX "idx_credit_transactions_external" ON "credit_transactions"("external_id");

-- CreateIndex
CREATE INDEX "idx_credit_transactions_status" ON "credit_transactions"("payment_status");

-- CreateIndex
CREATE INDEX "idx_assignment_history_conv" ON "assignment_history"("conversation_id");

-- CreateIndex
CREATE INDEX "idx_handover_requests_app_created" ON "handover_requests"("app_id", "created_at");

-- CreateIndex
CREATE INDEX "idx_handover_requests_app_status" ON "handover_requests"("app_id", "status");

-- CreateIndex
CREATE INDEX "idx_handover_requests_conversation" ON "handover_requests"("conversation_id", "created_at");

-- CreateIndex
CREATE INDEX "idx_handover_requests_rule_created" ON "handover_requests"("source_rule_id", "created_at");

-- CreateIndex
CREATE INDEX "idx_handover_requests_target_agent" ON "handover_requests"("target_agent_id", "created_at");

-- CreateIndex
CREATE INDEX "idx_responder_logs_conversation" ON "auto_responder_logs"("conversation_id");

-- CreateIndex
CREATE INDEX "idx_responder_logs_rule" ON "auto_responder_logs"("rule_id");

-- CreateIndex
CREATE INDEX "idx_responder_logs_triggered" ON "auto_responder_logs"("triggered_at");

-- CreateIndex
CREATE INDEX "idx_auto_responder_active" ON "auto_responder_rules"("is_active");

-- CreateIndex
CREATE INDEX "idx_auto_responder_inbox" ON "auto_responder_rules"("inbox_id");

-- CreateIndex
CREATE INDEX "idx_auto_responder_rules_app" ON "auto_responder_rules"("app_id");

-- CreateIndex
CREATE INDEX "idx_auto_responder_trigger" ON "auto_responder_rules"("trigger_type");

-- CreateIndex
CREATE INDEX "idx_automation_flows_active" ON "automation_flows"("active");

-- CreateIndex
CREATE INDEX "idx_automation_flows_app" ON "automation_flows"("app_id");

-- CreateIndex
CREATE INDEX "idx_channel_accounts_app" ON "channel_accounts"("app_id");

-- CreateIndex
CREATE INDEX "idx_channel_accounts_type" ON "channel_accounts"("channel_type");

-- CreateIndex
CREATE INDEX "idx_chatbots_app" ON "chatbots"("app_id");

-- CreateIndex
CREATE INDEX "idx_consent_logs_contact" ON "consent_logs"("contact_id");

-- CreateIndex
CREATE INDEX "idx_contact_custom_fields_app" ON "contact_custom_fields"("app_id");

-- CreateIndex
CREATE INDEX "idx_contact_notes_contact" ON "contact_notes"("contact_id");

-- CreateIndex
CREATE INDEX "idx_contact_notes_user" ON "contact_notes"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "contact_tags_app_id_name_key" ON "contact_tags"("app_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "contacts_identifier_key" ON "contacts"("identifier");

-- CreateIndex
CREATE INDEX "idx_conv_activity_action" ON "conversation_activity_log"("action");

-- CreateIndex
CREATE INDEX "idx_conv_activity_conversation" ON "conversation_activity_log"("conversation_id");

-- CreateIndex
CREATE INDEX "idx_conv_activity_created" ON "conversation_activity_log"("created_at");

-- CreateIndex
CREATE INDEX "idx_conv_agents_agent" ON "conversation_agents"("agent_id");

-- CreateIndex
CREATE INDEX "idx_conv_agents_conversation" ON "conversation_agents"("conversation_id");

-- CreateIndex
CREATE INDEX "idx_conv_agents_status" ON "conversation_agents"("status");

-- CreateIndex
CREATE UNIQUE INDEX "conversation_agents_conversation_id_agent_id_assigned_at_key" ON "conversation_agents"("conversation_id", "agent_id", "assigned_at");

-- CreateIndex
CREATE INDEX "idx_conversation_notes_conversation" ON "conversation_notes"("conversation_id");

-- CreateIndex
CREATE INDEX "idx_conversation_notes_user" ON "conversation_notes"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "conversation_ratings_conversation_id_key" ON "conversation_ratings"("conversation_id");

-- CreateIndex
CREATE INDEX "idx_conversation_ratings_conversation" ON "conversation_ratings"("conversation_id");

-- CreateIndex
CREATE INDEX "idx_conversation_ratings_created" ON "conversation_ratings"("created_at");

-- CreateIndex
CREATE INDEX "idx_conversation_ratings_rating" ON "conversation_ratings"("rating");

-- CreateIndex
CREATE INDEX "idx_conversation_sales_pipeline" ON "conversation_sales"("pipeline_id");

-- CreateIndex
CREATE INDEX "idx_conversation_sales_stage" ON "conversation_sales"("stage_id");

-- CreateIndex
CREATE INDEX "idx_conversation_sales_value" ON "conversation_sales"("deal_value");

-- CreateIndex
CREATE INDEX "idx_divisions_app" ON "divisions"("app_id");

-- CreateIndex
CREATE INDEX "idx_divisions_parent" ON "divisions"("parent_division_id");

-- CreateIndex
CREATE INDEX "idx_embeddings_source" ON "embeddings"("source_id");

-- CreateIndex
CREATE INDEX "idx_embeddings_faq" ON "embeddings"("faq_id");

-- CreateIndex
CREATE INDEX "idx_extraction_logs_created" ON "form_extraction_logs"("created_at");

-- CreateIndex
CREATE INDEX "idx_extraction_logs_submission" ON "form_extraction_logs"("submission_id");

-- CreateIndex
CREATE INDEX "idx_form_fields_form" ON "form_fields"("form_id");

-- CreateIndex
CREATE INDEX "idx_form_fields_order" ON "form_fields"("form_id", "order_no");

-- CreateIndex
CREATE UNIQUE INDEX "form_fields_form_id_field_key_key" ON "form_fields"("form_id", "field_key");

-- CreateIndex
CREATE INDEX "idx_submission_values_confidence" ON "form_submission_values"("confidence");

-- CreateIndex
CREATE INDEX "idx_submission_values_source" ON "form_submission_values"("source");

-- CreateIndex
CREATE INDEX "idx_submission_values_submission" ON "form_submission_values"("submission_id");

-- CreateIndex
CREATE INDEX "idx_form_submissions_completion" ON "form_submissions"("completion_percentage");

-- CreateIndex
CREATE INDEX "idx_form_submissions_conversation" ON "form_submissions"("conversation_id");

-- CreateIndex
CREATE INDEX "idx_form_submissions_form" ON "form_submissions"("form_id");

-- CreateIndex
CREATE INDEX "idx_form_submissions_status" ON "form_submissions"("status");

-- CreateIndex
CREATE UNIQUE INDEX "form_submissions_conversation_id_form_id_key" ON "form_submissions"("conversation_id", "form_id");

-- CreateIndex
CREATE INDEX "idx_form_templates_industry" ON "form_templates"("industry");

-- CreateIndex
CREATE INDEX "idx_forms_app" ON "forms"("app_id");

-- CreateIndex
CREATE INDEX "idx_forms_inbox" ON "forms"("inbox_id");

-- CreateIndex
CREATE INDEX "idx_knowledge_categories_app" ON "knowledge_categories"("app_id");

-- CreateIndex
CREATE INDEX "idx_knowledge_faqs_chatbot" ON "knowledge_faqs"("chatbot_id");

-- CreateIndex
CREATE INDEX "idx_knowledge_faqs_keywords" ON "knowledge_faqs" USING GIN ("keywords");

-- CreateIndex
CREATE INDEX "idx_knowledge_sources_chatbot" ON "knowledge_sources"("chatbot_id");

-- CreateIndex
CREATE INDEX "idx_knowledge_sources_app" ON "knowledge_sources"("app_id");

-- CreateIndex
CREATE INDEX "idx_knowledge_sources_status" ON "knowledge_sources"("status");

-- CreateIndex
CREATE INDEX "idx_knowledge_source_files_app" ON "knowledge_source_files"("app_id");

-- CreateIndex
CREATE INDEX "idx_knowledge_source_files_chatbot" ON "knowledge_source_files"("chatbot_id");

-- CreateIndex
CREATE INDEX "idx_knowledge_source_files_source" ON "knowledge_source_files"("source_id");

-- CreateIndex
CREATE INDEX "idx_knowledge_source_files_status" ON "knowledge_source_files"("status");

-- CreateIndex
CREATE INDEX "idx_knowledge_ingestion_jobs_app" ON "knowledge_ingestion_jobs"("app_id");

-- CreateIndex
CREATE INDEX "idx_knowledge_ingestion_jobs_chatbot" ON "knowledge_ingestion_jobs"("chatbot_id");

-- CreateIndex
CREATE INDEX "idx_knowledge_ingestion_jobs_source" ON "knowledge_ingestion_jobs"("source_id");

-- CreateIndex
CREATE INDEX "idx_knowledge_ingestion_jobs_stage" ON "knowledge_ingestion_jobs"("stage");

-- CreateIndex
CREATE INDEX "idx_knowledge_ingestion_jobs_status" ON "knowledge_ingestion_jobs"("status");

-- CreateIndex
CREATE INDEX "idx_knowledge_ingestion_jobs_created" ON "knowledge_ingestion_jobs"("created_at");

-- CreateIndex
CREATE INDEX "idx_knowledge_chunks_scope" ON "knowledge_chunks"("app_id", "chatbot_id", "source_id", "source_version", "chunk_index");

-- CreateIndex
CREATE INDEX "idx_knowledge_chunks_source_version" ON "knowledge_chunks"("source_id", "source_version");

-- CreateIndex
CREATE INDEX "idx_knowledge_chunks_file" ON "knowledge_chunks"("file_id");

-- CreateIndex
CREATE INDEX "idx_knowledge_query_logs_scope_created" ON "knowledge_query_logs"("app_id", "chatbot_id", "created_at");

-- CreateIndex
CREATE INDEX "idx_knowledge_query_logs_channel" ON "knowledge_query_logs"("channel");

-- CreateIndex
CREATE INDEX "idx_knowledge_query_logs_rag_hit" ON "knowledge_query_logs"("rag_hit");

-- CreateIndex
CREATE INDEX "idx_knowledge_query_chunks_log_rank" ON "knowledge_query_chunks"("query_log_id", "rank");

-- CreateIndex
CREATE INDEX "idx_knowledge_query_chunks_source" ON "knowledge_query_chunks"("source_id");

-- CreateIndex
CREATE INDEX "idx_knowledge_query_chunks_chunk" ON "knowledge_query_chunks"("chunk_id");

-- CreateIndex
CREATE INDEX "idx_media_files_app_id" ON "media_files"("app_id");

-- CreateIndex
CREATE INDEX "idx_media_files_download_status" ON "media_files"("download_status");

-- CreateIndex
CREATE INDEX "idx_media_files_media_id" ON "media_files"("media_id");

-- CreateIndex
CREATE INDEX "idx_media_files_message_id" ON "media_files"("message_id");

-- CreateIndex
CREATE INDEX "idx_media_files_platform" ON "media_files"("platform");

-- CreateIndex
CREATE INDEX "idx_msg_status_external_id" ON "message_status_history"("external_message_id");

-- CreateIndex
CREATE INDEX "idx_msg_status_message_id" ON "message_status_history"("message_id");

-- CreateIndex
CREATE INDEX "idx_msg_status_status" ON "message_status_history"("status");

-- CreateIndex
CREATE INDEX "idx_msg_status_timestamp" ON "message_status_history"("timestamp");

-- CreateIndex
CREATE INDEX "idx_meta_ads_accounts_org" ON "meta_ads_accounts"("app_id_org");

-- CreateIndex
CREATE UNIQUE INDEX "meta_ads_accounts_app_id_org_fb_account_id_key" ON "meta_ads_accounts"("app_id_org", "fb_account_id");

-- CreateIndex
CREATE INDEX "idx_meta_ads_campaigns_acc" ON "meta_ads_campaigns"("ads_account_id");

-- CreateIndex
CREATE UNIQUE INDEX "meta_ads_campaigns_ads_account_id_campaign_id_key" ON "meta_ads_campaigns"("ads_account_id", "campaign_id");

-- CreateIndex
CREATE INDEX "idx_meta_ads_insights_camp" ON "meta_ads_insights"("campaign_id");

-- CreateIndex
CREATE INDEX "idx_meta_ads_insights_date" ON "meta_ads_insights"("date_start", "date_stop");

-- CreateIndex
CREATE UNIQUE INDEX "meta_ads_insights_ads_account_id_campaign_id_date_start_dat_key" ON "meta_ads_insights"("ads_account_id", "campaign_id", "date_start", "date_stop");

-- CreateIndex
CREATE UNIQUE INDEX "migrations_name_key" ON "migrations"("name");

-- CreateIndex
CREATE INDEX "idx_office_hours_app" ON "office_hours"("app_id");

-- CreateIndex
CREATE INDEX "idx_office_hours_inbox" ON "office_hours"("inbox_id");

-- CreateIndex
CREATE UNIQUE INDEX "office_hours_inbox_id_day_of_week_key" ON "office_hours"("inbox_id", "day_of_week");

-- CreateIndex
CREATE INDEX "idx_stages_order" ON "pipeline_stages"("pipeline_id", "stage_order");

-- CreateIndex
CREATE INDEX "idx_stages_pipeline" ON "pipeline_stages"("pipeline_id");

-- CreateIndex
CREATE UNIQUE INDEX "pipeline_stages_pipeline_id_stage_order_key" ON "pipeline_stages"("pipeline_id", "stage_order");

-- CreateIndex
CREATE INDEX "idx_pipelines_app" ON "pipelines"("app_id");

-- CreateIndex
CREATE INDEX "idx_sla_breach_events_conv" ON "sla_breach_events"("conversation_id");

-- CreateIndex
CREATE INDEX "idx_stage_transitions_conversation" ON "stage_transitions"("conversation_id");

-- CreateIndex
CREATE INDEX "idx_stage_transitions_date" ON "stage_transitions"("created_at");

-- CreateIndex
CREATE INDEX "idx_teams_app" ON "teams"("app_id");

-- CreateIndex
CREATE INDEX "idx_template_variables_app" ON "template_variables"("app_id");

-- CreateIndex
CREATE INDEX "idx_webhook_events_app_id" ON "webhook_events"("app_id");

-- CreateIndex
CREATE INDEX "idx_webhook_events_created_at" ON "webhook_events"("created_at");

-- CreateIndex
CREATE INDEX "idx_webhook_events_external_id" ON "webhook_events"("external_id");

-- CreateIndex
CREATE INDEX "idx_webhook_events_inbox_id" ON "webhook_events"("inbox_id");

-- CreateIndex
CREATE INDEX "idx_webhook_events_source" ON "webhook_events"("source");

-- CreateIndex
CREATE INDEX "idx_webhook_events_status" ON "webhook_events"("status");

-- CreateIndex
CREATE UNIQUE INDEX "webhook_events_source_external_id_key" ON "webhook_events"("source", "external_id");

-- CreateIndex
CREATE INDEX "idx_webhooks_app_id" ON "webhooks"("app_id");

-- CreateIndex
CREATE INDEX "idx_webhooks_inbox_id" ON "webhooks"("inbox_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "idx_products_app_id" ON "products"("app_id");

-- CreateIndex
CREATE INDEX "idx_products_organization_id" ON "products"("organization_id");

-- CreateIndex
CREATE INDEX "idx_products_is_active" ON "products"("is_active");

-- CreateIndex
CREATE INDEX "idx_product_variants_app_id" ON "product_variants"("app_id");

-- CreateIndex
CREATE INDEX "idx_product_variants_product_id" ON "product_variants"("product_id");

-- CreateIndex
CREATE INDEX "idx_product_variants_organization_id" ON "product_variants"("organization_id");

-- CreateIndex
CREATE INDEX "idx_product_variants_is_active" ON "product_variants"("is_active");

-- CreateIndex
CREATE INDEX "idx_stock_reservations_app_id" ON "stock_reservations"("app_id");

-- CreateIndex
CREATE INDEX "idx_stock_reservations_organization_id" ON "stock_reservations"("organization_id");

-- CreateIndex
CREATE INDEX "idx_stock_reservations_order_id" ON "stock_reservations"("order_id");

-- CreateIndex
CREATE INDEX "idx_stock_reservations_variant_id" ON "stock_reservations"("variant_id");

-- CreateIndex
CREATE INDEX "idx_stock_reservations_status" ON "stock_reservations"("status");

-- CreateIndex
CREATE INDEX "idx_stock_movements_app_id" ON "stock_movements"("app_id");

-- CreateIndex
CREATE INDEX "idx_stock_movements_organization_id" ON "stock_movements"("organization_id");

-- CreateIndex
CREATE INDEX "idx_stock_movements_variant_id" ON "stock_movements"("variant_id");

-- CreateIndex
CREATE INDEX "idx_stock_movements_order_id" ON "stock_movements"("order_id");

-- CreateIndex
CREATE INDEX "idx_stock_movements_type" ON "stock_movements"("movement_type");

-- CreateIndex
CREATE INDEX "idx_orders_app_id" ON "orders"("app_id");

-- CreateIndex
CREATE INDEX "idx_orders_organization_id" ON "orders"("organization_id");

-- CreateIndex
CREATE INDEX "idx_orders_contact_id" ON "orders"("contact_id");

-- CreateIndex
CREATE INDEX "idx_orders_conversation_id" ON "orders"("conversation_id");

-- CreateIndex
CREATE INDEX "idx_orders_created_at" ON "orders"("created_at");

-- CreateIndex
CREATE INDEX "idx_orders_order_status" ON "orders"("order_status");

-- CreateIndex
CREATE INDEX "idx_orders_payment_type" ON "orders"("payment_type");

-- CreateIndex
CREATE INDEX "idx_orders_journey_phase" ON "orders"("journey_phase");

-- CreateIndex
CREATE INDEX "idx_orders_external_order_id" ON "orders"("external_order_id");

-- CreateIndex
CREATE INDEX "idx_order_invoices_order_id" ON "order_invoices"("order_id");

-- CreateIndex
CREATE INDEX "idx_order_invoices_status" ON "order_invoices"("status");

-- CreateIndex
CREATE INDEX "idx_order_invoices_provider" ON "order_invoices"("provider");

-- CreateIndex
CREATE INDEX "idx_order_invoices_public_token" ON "order_invoices"("public_token");

-- CreateIndex
CREATE INDEX "idx_order_invoices_provider_invoice_id" ON "order_invoices"("provider_invoice_id");

-- CreateIndex
CREATE INDEX "idx_order_items_order_id" ON "order_items"("order_id");

-- CreateIndex
CREATE INDEX "idx_order_items_variant_id" ON "order_items"("variant_id");

-- CreateIndex
CREATE INDEX "idx_subscriptions_app_id" ON "subscriptions"("app_id");

-- CreateIndex
CREATE INDEX "idx_subscriptions_organization_id" ON "subscriptions"("organization_id");

-- CreateIndex
CREATE INDEX "idx_subscriptions_contact_id" ON "subscriptions"("contact_id");

-- CreateIndex
CREATE INDEX "idx_subscriptions_created_at" ON "subscriptions"("created_at");

-- CreateIndex
CREATE INDEX "idx_subscriptions_status" ON "subscriptions"("status");

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization" ADD CONSTRAINT "organization_appId_fkey" FOREIGN KEY ("appId") REFERENCES "apps"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member" ADD CONSTRAINT "member_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member" ADD CONSTRAINT "member_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_inviterId_fkey" FOREIGN KEY ("inviterId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_availability" ADD CONSTRAINT "agent_availability_app_id_fkey" FOREIGN KEY ("app_id") REFERENCES "apps"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "agent_channel_accounts" ADD CONSTRAINT "agent_channel_accounts_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "channel_accounts"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "agent_divisions" ADD CONSTRAINT "agent_divisions_division_id_fkey" FOREIGN KEY ("division_id") REFERENCES "divisions"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "agent_settings" ADD CONSTRAINT "agent_settings_app_id_fkey" FOREIGN KEY ("app_id") REFERENCES "apps"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ai_evaluation_messages" ADD CONSTRAINT "ai_evaluation_messages_evaluation_id_fkey" FOREIGN KEY ("evaluation_id") REFERENCES "ai_evaluations"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ai_evaluations" ADD CONSTRAINT "ai_evaluations_app_id_fkey" FOREIGN KEY ("app_id") REFERENCES "apps"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ai_evaluations" ADD CONSTRAINT "ai_evaluations_chatbot_id_fkey" FOREIGN KEY ("chatbot_id") REFERENCES "chatbots"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ai_response_templates" ADD CONSTRAINT "ai_response_templates_app_id_fkey" FOREIGN KEY ("app_id") REFERENCES "apps"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ai_settings" ADD CONSTRAINT "ai_settings_app_id_fkey" FOREIGN KEY ("app_id") REFERENCES "apps"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ai_playground_models" ADD CONSTRAINT "ai_playground_models_app_id_fkey" FOREIGN KEY ("app_id") REFERENCES "apps"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ai_playground_routing_strategies" ADD CONSTRAINT "ai_playground_routing_strategies_app_id_fkey" FOREIGN KEY ("app_id") REFERENCES "apps"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ai_playground_personas" ADD CONSTRAINT "ai_playground_personas_app_id_fkey" FOREIGN KEY ("app_id") REFERENCES "apps"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ai_playground_guardrails" ADD CONSTRAINT "ai_playground_guardrails_app_id_fkey" FOREIGN KEY ("app_id") REFERENCES "apps"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ai_playground_metric_items" ADD CONSTRAINT "ai_playground_metric_items_app_id_fkey" FOREIGN KEY ("app_id") REFERENCES "apps"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ai_playground_sessions" ADD CONSTRAINT "ai_playground_sessions_app_id_fkey" FOREIGN KEY ("app_id") REFERENCES "apps"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ai_playground_sessions" ADD CONSTRAINT "ai_playground_sessions_selected_model_id_fkey" FOREIGN KEY ("selected_model_id") REFERENCES "ai_playground_models"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ai_playground_sessions" ADD CONSTRAINT "ai_playground_sessions_selected_strategy_id_fkey" FOREIGN KEY ("selected_strategy_id") REFERENCES "ai_playground_routing_strategies"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ai_playground_sessions" ADD CONSTRAINT "ai_playground_sessions_selected_persona_id_fkey" FOREIGN KEY ("selected_persona_id") REFERENCES "ai_playground_personas"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ai_playground_turns" ADD CONSTRAINT "ai_playground_turns_app_id_fkey" FOREIGN KEY ("app_id") REFERENCES "apps"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ai_playground_turns" ADD CONSTRAINT "ai_playground_turns_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "ai_playground_sessions"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "app_center" ADD CONSTRAINT "app_center_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "app_categories"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "app_installations" ADD CONSTRAINT "app_installations_app_id_fkey" FOREIGN KEY ("app_id") REFERENCES "app_center"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "app_usage_logs" ADD CONSTRAINT "app_usage_logs_app_id_fkey" FOREIGN KEY ("app_id") REFERENCES "apps"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "customer_level_settings" ADD CONSTRAINT "customer_level_settings_app_id_fkey" FOREIGN KEY ("app_id") REFERENCES "apps"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "credit_transactions" ADD CONSTRAINT "credit_transactions_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_transactions" ADD CONSTRAINT "credit_transactions_app_id_fkey" FOREIGN KEY ("app_id") REFERENCES "apps"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignment_history" ADD CONSTRAINT "assignment_history_auto_assign_rule_id_fkey" FOREIGN KEY ("auto_assign_rule_id") REFERENCES "auto_assign_rules"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "auto_assign_rules" ADD CONSTRAINT "auto_assign_rules_app_id_fkey" FOREIGN KEY ("app_id") REFERENCES "apps"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "handover_requests" ADD CONSTRAINT "handover_requests_source_rule_id_fkey" FOREIGN KEY ("source_rule_id") REFERENCES "auto_assign_rules"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "handover_requests" ADD CONSTRAINT "handover_requests_app_id_fkey" FOREIGN KEY ("app_id") REFERENCES "apps"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "auto_responder_logs" ADD CONSTRAINT "auto_responder_logs_rule_id_fkey" FOREIGN KEY ("rule_id") REFERENCES "auto_responder_rules"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "auto_responder_rules" ADD CONSTRAINT "fk_auto_responder_rules_app" FOREIGN KEY ("app_id") REFERENCES "apps"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "automation_flows" ADD CONSTRAINT "automation_flows_app_id_fkey" FOREIGN KEY ("app_id") REFERENCES "apps"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "automation_rules" ADD CONSTRAINT "automation_rules_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "broadcast_logs" ADD CONSTRAINT "broadcast_logs_broadcast_id_fkey" FOREIGN KEY ("broadcast_id") REFERENCES "broadcasts"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "broadcast_logs" ADD CONSTRAINT "broadcast_logs_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "contacts"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "broadcast_logs" ADD CONSTRAINT "broadcast_logs_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "messages"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "broadcasts" ADD CONSTRAINT "broadcasts_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "canned_responses" ADD CONSTRAINT "canned_responses_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "channel_accounts" ADD CONSTRAINT "channel_accounts_app_id_fkey" FOREIGN KEY ("app_id") REFERENCES "apps"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "chatbots" ADD CONSTRAINT "chatbots_app_id_fkey" FOREIGN KEY ("app_id") REFERENCES "apps"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "contact_custom_fields" ADD CONSTRAINT "fk_contact_custom_fields_app" FOREIGN KEY ("app_id") REFERENCES "apps"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "contact_tag_assignments" ADD CONSTRAINT "contact_tag_assignments_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "contact_tags"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "contact_tags" ADD CONSTRAINT "contact_tags_app_id_fkey" FOREIGN KEY ("app_id") REFERENCES "apps"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "conversation_labels" ADD CONSTRAINT "conversation_labels_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "conversation_labels" ADD CONSTRAINT "conversation_labels_label_id_fkey" FOREIGN KEY ("label_id") REFERENCES "labels"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "conversation_participants" ADD CONSTRAINT "conversation_participants_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "conversation_sales" ADD CONSTRAINT "conversation_sales_pipeline_id_fkey" FOREIGN KEY ("pipeline_id") REFERENCES "pipelines"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "conversation_sales" ADD CONSTRAINT "conversation_sales_stage_id_fkey" FOREIGN KEY ("stage_id") REFERENCES "pipeline_stages"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "contacts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_inbox_id_fkey" FOREIGN KEY ("inbox_id") REFERENCES "inboxes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "divisions" ADD CONSTRAINT "divisions_parent_division_id_fkey" FOREIGN KEY ("parent_division_id") REFERENCES "divisions"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "divisions" ADD CONSTRAINT "fk_divisions_app" FOREIGN KEY ("app_id") REFERENCES "apps"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "embeddings" ADD CONSTRAINT "embeddings_source_id_fkey" FOREIGN KEY ("source_id") REFERENCES "knowledge_sources"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "embeddings" ADD CONSTRAINT "embeddings_faq_id_fkey" FOREIGN KEY ("faq_id") REFERENCES "knowledge_faqs"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "form_extraction_logs" ADD CONSTRAINT "form_extraction_logs_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "form_submissions"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "form_fields" ADD CONSTRAINT "form_fields_form_id_fkey" FOREIGN KEY ("form_id") REFERENCES "forms"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "form_submission_values" ADD CONSTRAINT "form_submission_values_field_id_fkey" FOREIGN KEY ("field_id") REFERENCES "form_fields"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "form_submission_values" ADD CONSTRAINT "form_submission_values_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "form_submissions"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "form_submissions" ADD CONSTRAINT "form_submissions_form_id_fkey" FOREIGN KEY ("form_id") REFERENCES "forms"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "forms" ADD CONSTRAINT "fk_forms_app" FOREIGN KEY ("app_id") REFERENCES "apps"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "forms" ADD CONSTRAINT "forms_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "form_templates"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "inboxes" ADD CONSTRAINT "inboxes_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "knowledge_categories" ADD CONSTRAINT "knowledge_categories_app_id_fkey" FOREIGN KEY ("app_id") REFERENCES "apps"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "knowledge_categories" ADD CONSTRAINT "knowledge_categories_chatbot_id_fkey" FOREIGN KEY ("chatbot_id") REFERENCES "chatbots"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "knowledge_categories" ADD CONSTRAINT "knowledge_categories_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "knowledge_categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "knowledge_faqs" ADD CONSTRAINT "knowledge_faqs_app_id_fkey" FOREIGN KEY ("app_id") REFERENCES "apps"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "knowledge_faqs" ADD CONSTRAINT "knowledge_faqs_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "knowledge_categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "knowledge_faqs" ADD CONSTRAINT "knowledge_faqs_chatbot_id_fkey" FOREIGN KEY ("chatbot_id") REFERENCES "chatbots"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "knowledge_sources" ADD CONSTRAINT "knowledge_sources_app_id_fkey" FOREIGN KEY ("app_id") REFERENCES "apps"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "knowledge_sources" ADD CONSTRAINT "knowledge_sources_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "knowledge_categories"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "knowledge_sources" ADD CONSTRAINT "knowledge_sources_chatbot_id_fkey" FOREIGN KEY ("chatbot_id") REFERENCES "chatbots"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "knowledge_source_files" ADD CONSTRAINT "knowledge_source_files_app_id_fkey" FOREIGN KEY ("app_id") REFERENCES "apps"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "knowledge_source_files" ADD CONSTRAINT "knowledge_source_files_chatbot_id_fkey" FOREIGN KEY ("chatbot_id") REFERENCES "chatbots"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "knowledge_source_files" ADD CONSTRAINT "knowledge_source_files_source_id_fkey" FOREIGN KEY ("source_id") REFERENCES "knowledge_sources"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "knowledge_ingestion_jobs" ADD CONSTRAINT "knowledge_ingestion_jobs_app_id_fkey" FOREIGN KEY ("app_id") REFERENCES "apps"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "knowledge_ingestion_jobs" ADD CONSTRAINT "knowledge_ingestion_jobs_chatbot_id_fkey" FOREIGN KEY ("chatbot_id") REFERENCES "chatbots"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "knowledge_ingestion_jobs" ADD CONSTRAINT "knowledge_ingestion_jobs_source_id_fkey" FOREIGN KEY ("source_id") REFERENCES "knowledge_sources"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "knowledge_ingestion_jobs" ADD CONSTRAINT "knowledge_ingestion_jobs_source_file_id_fkey" FOREIGN KEY ("source_file_id") REFERENCES "knowledge_source_files"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "knowledge_chunks" ADD CONSTRAINT "knowledge_chunks_app_id_fkey" FOREIGN KEY ("app_id") REFERENCES "apps"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "knowledge_chunks" ADD CONSTRAINT "knowledge_chunks_chatbot_id_fkey" FOREIGN KEY ("chatbot_id") REFERENCES "chatbots"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "knowledge_chunks" ADD CONSTRAINT "knowledge_chunks_source_id_fkey" FOREIGN KEY ("source_id") REFERENCES "knowledge_sources"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "knowledge_chunks" ADD CONSTRAINT "knowledge_chunks_file_id_fkey" FOREIGN KEY ("file_id") REFERENCES "knowledge_source_files"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "knowledge_query_logs" ADD CONSTRAINT "knowledge_query_logs_app_id_fkey" FOREIGN KEY ("app_id") REFERENCES "apps"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "knowledge_query_logs" ADD CONSTRAINT "knowledge_query_logs_chatbot_id_fkey" FOREIGN KEY ("chatbot_id") REFERENCES "chatbots"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "knowledge_query_chunks" ADD CONSTRAINT "knowledge_query_chunks_app_id_fkey" FOREIGN KEY ("app_id") REFERENCES "apps"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "knowledge_query_chunks" ADD CONSTRAINT "knowledge_query_chunks_chatbot_id_fkey" FOREIGN KEY ("chatbot_id") REFERENCES "chatbots"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "knowledge_query_chunks" ADD CONSTRAINT "knowledge_query_chunks_query_log_id_fkey" FOREIGN KEY ("query_log_id") REFERENCES "knowledge_query_logs"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "knowledge_query_chunks" ADD CONSTRAINT "knowledge_query_chunks_chunk_id_fkey" FOREIGN KEY ("chunk_id") REFERENCES "knowledge_chunks"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "knowledge_query_chunks" ADD CONSTRAINT "knowledge_query_chunks_source_id_fkey" FOREIGN KEY ("source_id") REFERENCES "knowledge_sources"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "labels" ADD CONSTRAINT "labels_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "meta_ads_campaigns" ADD CONSTRAINT "meta_ads_campaigns_ads_account_id_fkey" FOREIGN KEY ("ads_account_id") REFERENCES "meta_ads_accounts"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "meta_ads_insights" ADD CONSTRAINT "meta_ads_insights_ads_account_id_fkey" FOREIGN KEY ("ads_account_id") REFERENCES "meta_ads_accounts"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "meta_ads_insights" ADD CONSTRAINT "meta_ads_insights_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "meta_ads_campaigns"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "office_hours" ADD CONSTRAINT "fk_office_hours_app" FOREIGN KEY ("app_id") REFERENCES "apps"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "pipeline_stages" ADD CONSTRAINT "pipeline_stages_pipeline_id_fkey" FOREIGN KEY ("pipeline_id") REFERENCES "pipelines"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "pipelines" ADD CONSTRAINT "fk_pipelines_app" FOREIGN KEY ("app_id") REFERENCES "apps"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "sla_breach_events" ADD CONSTRAINT "sla_breach_events_sla_policy_id_fkey" FOREIGN KEY ("sla_policy_id") REFERENCES "sla_policies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "sla_policies" ADD CONSTRAINT "sla_policies_app_id_fkey" FOREIGN KEY ("app_id") REFERENCES "apps"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "stage_transitions" ADD CONSTRAINT "stage_transitions_from_stage_id_fkey" FOREIGN KEY ("from_stage_id") REFERENCES "pipeline_stages"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "stage_transitions" ADD CONSTRAINT "stage_transitions_to_stage_id_fkey" FOREIGN KEY ("to_stage_id") REFERENCES "pipeline_stages"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "teams" ADD CONSTRAINT "teams_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "template_variables" ADD CONSTRAINT "template_variables_app_id_fkey" FOREIGN KEY ("app_id") REFERENCES "apps"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "webhooks" ADD CONSTRAINT "webhooks_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "webhooks" ADD CONSTRAINT "webhooks_app_id_fkey" FOREIGN KEY ("app_id") REFERENCES "apps"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "webhooks" ADD CONSTRAINT "webhooks_inbox_id_fkey" FOREIGN KEY ("inbox_id") REFERENCES "inboxes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "whatsapp_channels" ADD CONSTRAINT "whatsapp_channels_inbox_id_fkey" FOREIGN KEY ("inbox_id") REFERENCES "inboxes"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

