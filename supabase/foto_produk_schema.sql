create extension if not exists pgcrypto;

create table if not exists public.product_folders (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.product_media (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null,
  media_type text not null check (media_type in ('image','video')),
  file_name text,
  mime_type text,
  file_size bigint default 0,
  public_url text,
  storage_path text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  folder_id uuid references public.product_folders(id) on delete set null,
  title text not null,
  description text default '',
  price numeric(14,2) not null default 0,
  sku text default '',
  notes text default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.product_media
  add constraint product_media_product_id_fkey
  foreign key (product_id) references public.products(id) on delete cascade;

create index if not exists idx_products_folder_id on public.products(folder_id);
create index if not exists idx_products_updated_at on public.products(updated_at desc);
create index if not exists idx_product_media_product_id on public.product_media(product_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_product_folders_updated_at on public.product_folders;
create trigger trg_product_folders_updated_at
before update on public.product_folders
for each row execute function public.set_updated_at();

drop trigger if exists trg_products_updated_at on public.products;
create trigger trg_products_updated_at
before update on public.products
for each row execute function public.set_updated_at();

insert into public.product_folders (name)
values ('Reel'), ('Senar')
on conflict (name) do nothing;

-- Opsional untuk Supabase Storage:
-- 1. Buat bucket bernama: product-media
-- 2. Simpan file gambar/video ke bucket itu
-- 3. Simpan URL public atau storage_path ke table public.product_media

