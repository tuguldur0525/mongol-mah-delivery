-- =============================================================
-- MAH Delivery — schema
-- =============================================================

create extension if not exists "pgcrypto";

-- ---------- profiles (admin role) ----------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and is_admin = true
  );
$$;

-- ---------- categories ----------
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  image_url text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- ---------- products ----------
create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  category_id uuid not null references public.categories(id) on delete restrict,
  description text,
  price_per_kg integer not null check (price_per_kg > 0),
  stock_kg numeric(10,2) not null default 0 check (stock_kg >= 0),
  low_stock_threshold numeric(10,2) not null default 5 check (low_stock_threshold >= 0),
  image_url text,
  is_available boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index products_category_idx on public.products(category_id);
create index products_available_idx on public.products(is_available);

-- ---------- orders ----------
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  customer_name text not null,
  phone text not null,
  address text not null,
  note text,
  subtotal integer not null,
  delivery_fee integer not null default 0,
  total_amount integer not null,
  currency text not null default 'MNT',
  payment_method text not null default 'wire' check (payment_method in ('wire','cash','other')),
  payment_status text not null default 'pending'
    check (payment_status in ('pending','processing','paid','failed','cancelled','refunded')),
  order_status text not null default 'pending_payment'
    check (order_status in ('pending_payment','confirmed','preparing','delivering','delivered','cancelled')),
  wire_payment_id text unique,
  payment_reference text not null unique,
  stock_deducted boolean not null default false,
  paid_at timestamptz,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index orders_payment_status_idx on public.orders(payment_status);
create index orders_order_status_idx on public.orders(order_status);
create index orders_created_at_idx on public.orders(created_at desc);

-- ---------- order_items ----------
create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name_snapshot text not null,
  quantity_kg numeric(10,2) not null check (quantity_kg > 0),
  price_per_kg integer not null check (price_per_kg > 0),
  subtotal integer not null check (subtotal > 0),
  created_at timestamptz not null default now()
);

create index order_items_order_idx on public.order_items(order_id);

-- ---------- inventory_transactions ----------
create table public.inventory_transactions (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  type text not null check (type in ('STOCK_IN','STOCK_OUT','ADJUSTMENT','RETURN')),
  quantity_kg numeric(10,2) not null,
  reference_type text,
  reference_id uuid,
  note text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create index inventory_tx_product_idx on public.inventory_transactions(product_id, created_at desc);

-- ---------- webhook_events (idempotency) ----------
create table public.webhook_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null default 'wire',
  external_event_id text not null,
  event_type text not null,
  order_id uuid references public.orders(id),
  payload_summary jsonb,
  processed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (provider, external_event_id)
);

-- ---------- store settings (single row) ----------
create table public.store_settings (
  id int primary key default 1 check (id = 1),
  store_name text not null default 'МАХ ДЕЛІВЕРІ',
  contact_phone text not null default '99112233',
  delivery_fee integer not null default 5000,
  delivery_info text,
  default_low_stock_threshold numeric(10,2) not null default 5,
  updated_at timestamptz not null default now()
);

insert into public.store_settings (id) values (1) on conflict do nothing;

-- ---------- updated_at trigger ----------
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

create trigger products_touch before update on public.products
  for each row execute function public.touch_updated_at();
create trigger orders_touch before update on public.orders
  for each row execute function public.touch_updated_at();
