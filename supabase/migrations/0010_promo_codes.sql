create table public.promo_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code ~ '^[A-Z0-9_-]{3,32}$'),
  discount_per_kg integer not null check (discount_per_kg > 0),
  minimum_kg numeric(10,2) not null default 50 check (minimum_kg > 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index promo_codes_active_code_idx on public.promo_codes(code) where is_active;

alter table public.promo_codes enable row level security;

create policy promo_codes_public_select_active on public.promo_codes
  for select using (is_active);
create policy promo_codes_admin_all on public.promo_codes
  for all using (public.is_admin()) with check (public.is_admin());

create trigger promo_codes_touch before update on public.promo_codes
  for each row execute function public.touch_updated_at();

alter table public.orders
  add column promo_code text,
  add column discount_amount integer not null default 0 check (discount_amount >= 0);
