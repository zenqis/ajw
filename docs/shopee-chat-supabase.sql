-- Shopee Chat schema for AJW
-- Jalankan di Supabase SQL Editor lalu deploy ulang backend.

create table if not exists public.shopee_chat_tokens (
  shop_id text primary key,
  access_token text not null,
  refresh_token text,
  expire_in bigint default 0,
  updated_at timestamptz default now()
);

create table if not exists public.shopee_chat_conversations (
  conversation_id text primary key,
  shop_id text not null,
  to_id text,
  to_name text,
  to_avatar text,
  unread_count integer default 0,
  pinned integer default 0,
  latest_message_id text,
  latest_message_type text,
  latest_message_text text,
  latest_from_id text,
  has_unreplied integer default 0,
  last_message_timestamp bigint default 0,
  raw_json text,
  updated_at timestamptz default now()
);

create index if not exists idx_shopee_chat_conversations_shop_ts
on public.shopee_chat_conversations (shop_id, last_message_timestamp desc);

create table if not exists public.shopee_chat_messages (
  message_id text primary key,
  conversation_id text not null,
  shop_id text not null,
  message_type text,
  from_id text,
  to_id text,
  created_timestamp bigint default 0,
  content_text text,
  content_order_sn text,
  raw_json text,
  updated_at timestamptz default now()
);

create index if not exists idx_shopee_chat_messages_conv_ts
on public.shopee_chat_messages (conversation_id, created_timestamp desc);

create table if not exists public.shopee_chat_webhook_events (
  id text primary key,
  event_key text,
  payload text,
  created_at timestamptz default now()
);

create table if not exists public.shopee_chat_quick_replies (
  id text primary key,
  shop_id text not null,
  title text,
  content text not null,
  group_name text default 'Umum',
  position integer default 0,
  updated_at timestamptz default now()
);

create index if not exists idx_shopee_chat_quick_replies_shop_pos
on public.shopee_chat_quick_replies (shop_id, position asc);

create table if not exists public.shopee_chat_orders (
  id text primary key,
  shop_id text not null,
  conversation_id text,
  order_sn text not null,
  customer_name text,
  order_status text,
  create_time bigint default 0,
  pay_time bigint default 0,
  total_amount numeric default 0,
  item_count integer default 0,
  items_json text,
  raw_json text,
  updated_at timestamptz default now()
);

create index if not exists idx_shopee_chat_orders_conv_time
on public.shopee_chat_orders (conversation_id, create_time desc);

create table if not exists public.shopee_chat_products (
  id text primary key,
  shop_id text not null,
  item_id text not null,
  item_name text,
  sku text,
  price_info text,
  stock integer default 0,
  image_url text,
  status text,
  raw_json text,
  updated_at timestamptz default now()
);

create index if not exists idx_shopee_chat_products_shop_updated
on public.shopee_chat_products (shop_id, updated_at desc);

create table if not exists public.shopee_chat_ai_knowledge (
  id text primary key,
  shop_id text not null,
  keyword text not null,
  template text not null,
  group_name text default 'General',
  priority integer default 0,
  active integer default 1,
  position integer default 0,
  source text default 'manual',
  updated_at timestamptz default now()
);

create index if not exists idx_shopee_chat_ai_knowledge_shop_pos
on public.shopee_chat_ai_knowledge (shop_id, position asc, priority desc);

create table if not exists public.shopee_chat_ai_settings (
  shop_id text primary key,
  ai_enabled integer default 0,
  require_approval integer default 1,
  provider text default 'smart',
  model text default '',
  prompt_preset text default '',
  updated_at timestamptz default now()
);

create table if not exists public.shopee_chat_ai_drafts (
  id text primary key,
  shop_id text not null,
  conversation_id text not null,
  source_message_id text default '',
  source_text text default '',
  draft_text text not null,
  provider text default 'smart',
  model text default '',
  knowledge_refs text default '[]',
  status text default 'draft',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_shopee_chat_ai_drafts_shop_conv
on public.shopee_chat_ai_drafts (shop_id, conversation_id, created_at desc);

alter table public.shopee_chat_tokens enable row level security;
alter table public.shopee_chat_conversations enable row level security;
alter table public.shopee_chat_messages enable row level security;
alter table public.shopee_chat_webhook_events enable row level security;
alter table public.shopee_chat_quick_replies enable row level security;
alter table public.shopee_chat_orders enable row level security;
alter table public.shopee_chat_products enable row level security;
alter table public.shopee_chat_ai_knowledge enable row level security;
alter table public.shopee_chat_ai_settings enable row level security;
alter table public.shopee_chat_ai_drafts enable row level security;

drop policy if exists shopee_chat_tokens_open on public.shopee_chat_tokens;
drop policy if exists shopee_chat_conversations_open on public.shopee_chat_conversations;
drop policy if exists shopee_chat_messages_open on public.shopee_chat_messages;
drop policy if exists shopee_chat_webhook_events_open on public.shopee_chat_webhook_events;
drop policy if exists shopee_chat_quick_replies_open on public.shopee_chat_quick_replies;
drop policy if exists shopee_chat_orders_open on public.shopee_chat_orders;
drop policy if exists shopee_chat_products_open on public.shopee_chat_products;
drop policy if exists shopee_chat_ai_knowledge_open on public.shopee_chat_ai_knowledge;
drop policy if exists shopee_chat_ai_settings_open on public.shopee_chat_ai_settings;
drop policy if exists shopee_chat_ai_drafts_open on public.shopee_chat_ai_drafts;

create policy shopee_chat_tokens_open on public.shopee_chat_tokens for all using (true) with check (true);
create policy shopee_chat_conversations_open on public.shopee_chat_conversations for all using (true) with check (true);
create policy shopee_chat_messages_open on public.shopee_chat_messages for all using (true) with check (true);
create policy shopee_chat_webhook_events_open on public.shopee_chat_webhook_events for all using (true) with check (true);
create policy shopee_chat_quick_replies_open on public.shopee_chat_quick_replies for all using (true) with check (true);
create policy shopee_chat_orders_open on public.shopee_chat_orders for all using (true) with check (true);
create policy shopee_chat_products_open on public.shopee_chat_products for all using (true) with check (true);
create policy shopee_chat_ai_knowledge_open on public.shopee_chat_ai_knowledge for all using (true) with check (true);
create policy shopee_chat_ai_settings_open on public.shopee_chat_ai_settings for all using (true) with check (true);
create policy shopee_chat_ai_drafts_open on public.shopee_chat_ai_drafts for all using (true) with check (true);

insert into storage.buckets (id, name, public)
values ('chat-media', 'chat-media', true)
on conflict (id) do nothing;
