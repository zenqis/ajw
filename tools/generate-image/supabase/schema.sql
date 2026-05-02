create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
begin
  if not exists (
    select 1
    from pg_type
    where typname = 'generate_tool_type'
  ) then
    create type public.generate_tool_type as enum (
      'listing',
      'multi_angle',
      'aplus_content',
      'bgremove',
      'prompt_library',
      'brand_info'
    );
  end if;
end $$;

create table if not exists public.generate_image_workspaces (
  id uuid primary key default gen_random_uuid(),
  workspace_key text not null unique,
  workspace_name text not null,
  description text not null default '',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.generate_image_brands (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references public.generate_image_workspaces(id) on delete cascade,
  brand_name text not null,
  product_category text not null default '',
  store_reputation text not null default '',
  description text not null default '',
  logo_url text,
  logo_path text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.generate_image_prompts (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references public.generate_image_workspaces(id) on delete cascade,
  feature public.generate_tool_type not null,
  prompt_key text not null,
  title text not null,
  tag text not null default '',
  content text not null,
  usage_count integer not null default 0,
  is_default boolean not null default false,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint generate_image_prompts_workspace_key_unique unique (workspace_id, feature, prompt_key)
);

create table if not exists public.generate_image_prompt_assets (
  id uuid primary key default gen_random_uuid(),
  prompt_id uuid not null references public.generate_image_prompts(id) on delete cascade,
  asset_type text not null default 'thumbnail',
  asset_url text,
  asset_path text,
  file_name text not null default '',
  sort_order integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.generation_jobs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references public.generate_image_workspaces(id) on delete set null,
  tool_type public.generate_tool_type not null,
  prompt_id uuid references public.generate_image_prompts(id) on delete set null,
  brand_id uuid references public.generate_image_brands(id) on delete set null,
  request_title text not null default '',
  provider text not null default '',
  model text not null default '',
  status text not null default 'success' check (status in ('queued', 'processing', 'success', 'error', 'cancelled')),
  prompt_text text not null default '',
  input_summary text not null default '',
  output_summary text not null default '',
  cost_estimate numeric(12, 4) not null default 0,
  input_tokens integer not null default 0,
  cached_tokens integer not null default 0,
  output_tokens integer not null default 0,
  duration_ms integer not null default 0,
  error_message text not null default '',
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.generated_assets (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.generation_jobs(id) on delete cascade,
  tool_type public.generate_tool_type not null,
  asset_role text not null default 'output',
  asset_title text not null default '',
  asset_url text,
  asset_path text,
  mime_type text not null default '',
  width integer,
  height integer,
  file_size bigint,
  sort_order integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.generate_image_memories (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references public.generate_image_workspaces(id) on delete cascade,
  source_job_id uuid references public.generation_jobs(id) on delete set null,
  feature public.generate_tool_type not null,
  memory_title text not null,
  memory_text text not null,
  memory_tags text[] not null default '{}'::text[],
  rating numeric(5, 2) not null default 0,
  use_count integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.generate_image_app_settings (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references public.generate_image_workspaces(id) on delete cascade,
  setting_group text not null,
  setting_key text not null,
  setting_value jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint generate_image_app_settings_unique unique (workspace_id, setting_group, setting_key)
);

insert into public.generate_image_workspaces (workspace_key, workspace_name, description)
values ('default', 'Generate Image Default Workspace', 'Workspace default untuk tab Generate Image AJW.')
on conflict (workspace_key) do nothing;

create index if not exists generation_jobs_tool_type_idx
  on public.generation_jobs(tool_type, created_at desc);

create index if not exists generation_jobs_workspace_idx
  on public.generation_jobs(workspace_id, created_at desc);

create index if not exists generated_assets_job_idx
  on public.generated_assets(job_id, sort_order);

create index if not exists generate_image_prompts_feature_idx
  on public.generate_image_prompts(feature, is_active, updated_at desc);

create index if not exists generate_image_prompt_assets_prompt_idx
  on public.generate_image_prompt_assets(prompt_id, sort_order);

create index if not exists generate_image_memories_feature_idx
  on public.generate_image_memories(feature, rating desc, created_at desc);

create index if not exists generate_image_app_settings_workspace_idx
  on public.generate_image_app_settings(workspace_id, setting_group);

drop trigger if exists trg_generate_image_workspaces_updated_at on public.generate_image_workspaces;
create trigger trg_generate_image_workspaces_updated_at
before update on public.generate_image_workspaces
for each row
execute function public.set_updated_at();

drop trigger if exists trg_generate_image_brands_updated_at on public.generate_image_brands;
create trigger trg_generate_image_brands_updated_at
before update on public.generate_image_brands
for each row
execute function public.set_updated_at();

drop trigger if exists trg_generate_image_prompts_updated_at on public.generate_image_prompts;
create trigger trg_generate_image_prompts_updated_at
before update on public.generate_image_prompts
for each row
execute function public.set_updated_at();

drop trigger if exists trg_generation_jobs_updated_at on public.generation_jobs;
create trigger trg_generation_jobs_updated_at
before update on public.generation_jobs
for each row
execute function public.set_updated_at();

drop trigger if exists trg_generate_image_memories_updated_at on public.generate_image_memories;
create trigger trg_generate_image_memories_updated_at
before update on public.generate_image_memories
for each row
execute function public.set_updated_at();

drop trigger if exists trg_generate_image_app_settings_updated_at on public.generate_image_app_settings;
create trigger trg_generate_image_app_settings_updated_at
before update on public.generate_image_app_settings
for each row
execute function public.set_updated_at();

create or replace view public.generate_image_prompt_library_view as
select
  p.id,
  p.workspace_id,
  p.feature,
  p.prompt_key,
  p.title,
  p.tag,
  p.content,
  p.usage_count,
  p.is_default,
  p.is_active,
  p.sort_order,
  p.metadata,
  p.created_at,
  p.updated_at,
  coalesce(
    jsonb_agg(
      jsonb_build_object(
        'id', a.id,
        'asset_type', a.asset_type,
        'asset_url', a.asset_url,
        'asset_path', a.asset_path,
        'file_name', a.file_name,
        'sort_order', a.sort_order,
        'metadata', a.metadata
      )
      order by a.sort_order, a.created_at
    ) filter (where a.id is not null),
    '[]'::jsonb
  ) as assets
from public.generate_image_prompts p
left join public.generate_image_prompt_assets a on a.prompt_id = p.id
group by p.id;

alter table public.generate_image_workspaces enable row level security;
alter table public.generate_image_brands enable row level security;
alter table public.generate_image_prompts enable row level security;
alter table public.generate_image_prompt_assets enable row level security;
alter table public.generation_jobs enable row level security;
alter table public.generated_assets enable row level security;
alter table public.generate_image_memories enable row level security;
alter table public.generate_image_app_settings enable row level security;

drop policy if exists "Allow public read generate_image_workspaces" on public.generate_image_workspaces;
create policy "Allow public read generate_image_workspaces"
on public.generate_image_workspaces
for select
to anon, authenticated
using (true);

drop policy if exists "Allow public write generate_image_workspaces" on public.generate_image_workspaces;
create policy "Allow public write generate_image_workspaces"
on public.generate_image_workspaces
for all
to anon, authenticated
using (true)
with check (true);

drop policy if exists "Allow public read generate_image_brands" on public.generate_image_brands;
create policy "Allow public read generate_image_brands"
on public.generate_image_brands
for select
to anon, authenticated
using (true);

drop policy if exists "Allow public write generate_image_brands" on public.generate_image_brands;
create policy "Allow public write generate_image_brands"
on public.generate_image_brands
for all
to anon, authenticated
using (true)
with check (true);

drop policy if exists "Allow public read generate_image_prompts" on public.generate_image_prompts;
create policy "Allow public read generate_image_prompts"
on public.generate_image_prompts
for select
to anon, authenticated
using (true);

drop policy if exists "Allow public write generate_image_prompts" on public.generate_image_prompts;
create policy "Allow public write generate_image_prompts"
on public.generate_image_prompts
for all
to anon, authenticated
using (true)
with check (true);

drop policy if exists "Allow public read generate_image_prompt_assets" on public.generate_image_prompt_assets;
create policy "Allow public read generate_image_prompt_assets"
on public.generate_image_prompt_assets
for select
to anon, authenticated
using (true);

drop policy if exists "Allow public write generate_image_prompt_assets" on public.generate_image_prompt_assets;
create policy "Allow public write generate_image_prompt_assets"
on public.generate_image_prompt_assets
for all
to anon, authenticated
using (true)
with check (true);

drop policy if exists "Allow public read generation_jobs" on public.generation_jobs;
create policy "Allow public read generation_jobs"
on public.generation_jobs
for select
to anon, authenticated
using (true);

drop policy if exists "Allow public write generation_jobs" on public.generation_jobs;
create policy "Allow public write generation_jobs"
on public.generation_jobs
for all
to anon, authenticated
using (true)
with check (true);

drop policy if exists "Allow public read generated_assets" on public.generated_assets;
create policy "Allow public read generated_assets"
on public.generated_assets
for select
to anon, authenticated
using (true);

drop policy if exists "Allow public write generated_assets" on public.generated_assets;
create policy "Allow public write generated_assets"
on public.generated_assets
for all
to anon, authenticated
using (true)
with check (true);

drop policy if exists "Allow public read generate_image_memories" on public.generate_image_memories;
create policy "Allow public read generate_image_memories"
on public.generate_image_memories
for select
to anon, authenticated
using (true);

drop policy if exists "Allow public write generate_image_memories" on public.generate_image_memories;
create policy "Allow public write generate_image_memories"
on public.generate_image_memories
for all
to anon, authenticated
using (true)
with check (true);

drop policy if exists "Allow public read generate_image_app_settings" on public.generate_image_app_settings;
create policy "Allow public read generate_image_app_settings"
on public.generate_image_app_settings
for select
to anon, authenticated
using (true);

drop policy if exists "Allow public write generate_image_app_settings" on public.generate_image_app_settings;
create policy "Allow public write generate_image_app_settings"
on public.generate_image_app_settings
for all
to anon, authenticated
using (true)
with check (true);
