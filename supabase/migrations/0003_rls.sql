-- =============================================================
-- RLS policies
-- =============================================================
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.inventory_transactions enable row level security;
alter table public.webhook_events enable row level security;
alter table public.store_settings enable row level security;

-- profiles: user sees own; admin sees all
create policy profiles_select_own on public.profiles
  for select using (id = auth.uid() or public.is_admin());
create policy profiles_update_own on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

-- public catalog: read-only for everyone
create policy categories_public_select on public.categories
  for select using (true);
create policy products_public_select on public.products
  for select using (true);
create policy settings_public_select on public.store_settings
  for select using (true);

-- admin writes on catalog
create policy categories_admin_write on public.categories
  for all using (public.is_admin()) with check (public.is_admin());
create policy products_admin_write on public.products
  for all using (public.is_admin()) with check (public.is_admin());
create policy settings_admin_write on public.store_settings
  for all using (public.is_admin()) with check (public.is_admin());

-- orders: no anon/customer access (guest order lookup happens via service role server-side)
-- admin full access
create policy orders_admin_all on public.orders
  for all using (public.is_admin()) with check (public.is_admin());
create policy order_items_admin_all on public.order_items
  for all using (public.is_admin()) with check (public.is_admin());

-- inventory: admin only
create policy inventory_admin_all on public.inventory_transactions
  for all using (public.is_admin()) with check (public.is_admin());

-- webhook events: no client access at all (service role bypasses RLS)
