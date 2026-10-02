create table public.product_bundles (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) >= 2),
  description text,
  image_url text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.product_bundle_items (
  id uuid primary key default gen_random_uuid(),
  bundle_id uuid not null references public.product_bundles(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  quantity_kg numeric(10,2) not null check (quantity_kg > 0),
  unique (bundle_id, product_id)
);

create index product_bundles_active_sort_idx
  on public.product_bundles(is_active, sort_order);
create index product_bundle_items_bundle_idx
  on public.product_bundle_items(bundle_id);

alter table public.product_bundles enable row level security;
alter table public.product_bundle_items enable row level security;

create policy product_bundles_public_select on public.product_bundles
  for select using (is_active);
create policy product_bundles_admin_all on public.product_bundles
  for all using (public.is_admin()) with check (public.is_admin());

create policy product_bundle_items_public_select on public.product_bundle_items
  for select using (
    exists (
      select 1 from public.product_bundles b
      where b.id = bundle_id and b.is_active
    )
  );
create policy product_bundle_items_admin_all on public.product_bundle_items
  for all using (public.is_admin()) with check (public.is_admin());

create or replace function public.admin_save_product_bundle(
  p_bundle_id uuid,
  p_name text,
  p_description text,
  p_image_url text,
  p_is_active boolean,
  p_sort_order integer,
  p_items jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_bundle_id uuid;
begin
  if not public.is_admin() then
    raise exception 'NOT_ADMIN';
  end if;
  if p_name is null or char_length(trim(p_name)) < 2
    or jsonb_typeof(p_items) is distinct from 'array'
    or jsonb_array_length(p_items) < 1 then
    raise exception 'INVALID_BUNDLE';
  end if;

  if p_bundle_id is null then
    insert into product_bundles (name, description, image_url, is_active, sort_order)
    values (
      trim(p_name), nullif(trim(p_description), ''), nullif(trim(p_image_url), ''),
      p_is_active, p_sort_order
    )
    returning id into v_bundle_id;
  else
    update product_bundles
    set name = trim(p_name),
        description = nullif(trim(p_description), ''),
        image_url = nullif(trim(p_image_url), ''),
        is_active = p_is_active,
        sort_order = p_sort_order,
        updated_at = now()
    where id = p_bundle_id
    returning id into v_bundle_id;
    if v_bundle_id is null then
      raise exception 'BUNDLE_NOT_FOUND';
    end if;
  end if;

  delete from product_bundle_items where bundle_id = v_bundle_id;
  insert into product_bundle_items (bundle_id, product_id, quantity_kg)
  select v_bundle_id, (item->>'product_id')::uuid, (item->>'quantity_kg')::numeric
  from jsonb_array_elements(p_items) as item;

  return v_bundle_id;
end;
$$;

revoke all on function public.admin_save_product_bundle(
  uuid, text, text, text, boolean, integer, jsonb
) from public;
grant execute on function public.admin_save_product_bundle(
  uuid, text, text, text, boolean, integer, jsonb
) to authenticated;