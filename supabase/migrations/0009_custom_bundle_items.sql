alter table public.product_bundles
  add column if not exists price_per_kg integer,
  add column if not exists min_kg numeric(10,2),
  add column if not exists max_kg numeric(10,2);

do $$
begin
  if to_regclass('public.product_bundle_items') is not null
    and exists (
      select 1 from information_schema.columns
      where table_schema = 'public'
        and table_name = 'product_bundle_items'
        and column_name = 'product_id'
    )
    and exists (
      select 1 from information_schema.columns
      where table_schema = 'public'
        and table_name = 'product_bundle_items'
        and column_name = 'quantity_kg'
    ) then
    execute $migration$
      with legacy_totals as (
        select
          i.bundle_id,
          sum(i.quantity_kg)::numeric(10,2) as total_kg,
          sum(round(p.price_per_kg * i.quantity_kg))::numeric as total_price
        from public.product_bundle_items i
        join public.products p on p.id = i.product_id
        group by i.bundle_id
      )
      update public.product_bundles b
      set min_kg = coalesce(b.min_kg, t.total_kg),
          max_kg = coalesce(b.max_kg, t.total_kg),
          price_per_kg = coalesce(
            b.price_per_kg,
            round(t.total_price / nullif(t.total_kg, 0))::integer
          )
      from legacy_totals t
      where t.bundle_id = b.id
    $migration$;

    if exists (
      select 1 from information_schema.columns
      where table_schema = 'public'
        and table_name = 'product_bundle_items'
        and column_name = 'name'
    ) then
      execute $migration$
        update public.product_bundles b
        set description = concat_ws(
          E'\n',
          nullif(trim(b.description), ''),
          legacy.components
        )
        from (
          select
            i.bundle_id,
            'Өмнөх бүрэлдэхүүн: ' ||
              string_agg(p.name || ' · ' || i.quantity_kg || ' кг', ', ') as components
          from public.product_bundle_items i
          join public.products p on p.id = i.product_id
          group by i.bundle_id
        ) legacy
        where legacy.bundle_id = b.id
      $migration$;
    end if;
  elsif to_regclass('public.product_bundle_items') is not null
    and exists (
      select 1 from information_schema.columns
      where table_schema = 'public'
        and table_name = 'product_bundle_items'
        and column_name = 'quantity_kg'
    ) then
    execute $migration$
      update public.product_bundles b
      set min_kg = coalesce(b.min_kg, totals.total_kg),
          max_kg = coalesce(b.max_kg, totals.total_kg)
      from (
        select bundle_id, sum(quantity_kg)::numeric(10,2) as total_kg
        from public.product_bundle_items
        group by bundle_id
      ) totals
      where totals.bundle_id = b.id
    $migration$;
  end if;
end;
$$;

update public.product_bundles
set min_kg = coalesce(min_kg, 1),
    max_kg = coalesce(max_kg, 1),
    price_per_kg = coalesce(price_per_kg, 1),
    is_active = case
      when price_per_kg is null then false
      else is_active
    end
where min_kg is null or max_kg is null or price_per_kg is null;

alter table public.product_bundles
  alter column price_per_kg set not null,
  alter column min_kg set not null,
  alter column max_kg set not null;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'product_bundles_price_per_kg_positive') then
    alter table public.product_bundles
      add constraint product_bundles_price_per_kg_positive check (price_per_kg > 0);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'product_bundles_min_kg_positive') then
    alter table public.product_bundles
      add constraint product_bundles_min_kg_positive check (min_kg > 0);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'product_bundles_weight_range_valid') then
    alter table public.product_bundles
      add constraint product_bundles_weight_range_valid check (max_kg >= min_kg);
  end if;
end;
$$;

drop function if exists public.admin_save_product_bundle(
  uuid, text, text, text, boolean, integer, jsonb
);
drop table if exists public.product_bundle_items;

alter table public.order_items
  add column if not exists bundle_id uuid references public.product_bundles(id) on delete set null,
  add column if not exists is_bundle boolean not null default false,
  add column if not exists bundle_min_kg numeric(10,2),
  add column if not exists bundle_max_kg numeric(10,2);

-- Remove the legacy fixed bundle price column if an earlier draft of this
-- migration was applied. The current bundle price is calculated per kilogram.
alter table public.product_bundles
  drop column if exists bundle_price;

create or replace function public.admin_save_product_bundle(
  p_bundle_id uuid,
  p_name text,
  p_description text,
  p_image_url text,
  p_price_per_kg integer,
  p_min_kg numeric,
  p_max_kg numeric,
  p_is_active boolean,
  p_sort_order integer
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
    or p_price_per_kg is null or p_price_per_kg <= 0
    or p_min_kg is null or p_min_kg <= 0 or p_min_kg > 1000
    or p_max_kg is null or p_max_kg < p_min_kg or p_max_kg > 1000
    or p_min_kg <> round(p_min_kg, 2)
    or p_max_kg <> round(p_max_kg, 2)
    or p_sort_order is null or p_sort_order < 0 then
    raise exception 'INVALID_BUNDLE';
  end if;

  if p_bundle_id is null then
    insert into product_bundles (
      name, description, image_url, price_per_kg, min_kg, max_kg,
      is_active, sort_order
    )
    values (
      trim(p_name), nullif(trim(p_description), ''), nullif(trim(p_image_url), ''),
      p_price_per_kg, p_min_kg, p_max_kg, p_is_active, p_sort_order
    )
    returning id into v_bundle_id;
  else
    update product_bundles
    set name = trim(p_name),
        description = nullif(trim(p_description), ''),
        image_url = nullif(trim(p_image_url), ''),
        price_per_kg = p_price_per_kg,
        min_kg = p_min_kg,
        max_kg = p_max_kg,
        is_active = p_is_active,
        sort_order = p_sort_order,
        updated_at = now()
    where id = p_bundle_id
    returning id into v_bundle_id;
    if v_bundle_id is null then
      raise exception 'BUNDLE_NOT_FOUND';
    end if;
  end if;

  return v_bundle_id;
end;
$$;

revoke all on function public.admin_save_product_bundle(
  uuid, text, text, text, integer, numeric, numeric, boolean, integer
) from public;
grant execute on function public.admin_save_product_bundle(
  uuid, text, text, text, integer, numeric, numeric, boolean, integer
) to authenticated;

create or replace function public.process_paid_order(
  p_order_id uuid,
  p_amount integer,
  p_currency text,
  p_wire_payment_id text
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order orders;
  v_item record;
begin
  select * into v_order from orders where id = p_order_id for update;
  if not found then
    raise exception 'ORDER_NOT_FOUND';
  end if;
  if v_order.payment_status = 'paid' and v_order.stock_deducted then
    return true;
  end if;
  if v_order.total_amount <> p_amount or v_order.currency <> p_currency then
    raise exception 'AMOUNT_MISMATCH';
  end if;
  if v_order.payment_status = 'refunded' or v_order.order_status = 'cancelled' then
    raise exception 'ORDER_NOT_PAYABLE';
  end if;
  if exists (
    select 1
    from order_items oi
    join products p on p.id = oi.product_id
    where oi.order_id = p_order_id
      and (p.stock_kg < oi.quantity_kg or p.is_available = false)
  ) then
    raise exception 'INSUFFICIENT_STOCK';
  end if;

  update orders
  set payment_status = 'paid',
      order_status = case when order_status = 'pending_payment' then 'confirmed' else order_status end,
      wire_payment_id = coalesce(p_wire_payment_id, wire_payment_id),
      paid_at = now()
  where id = p_order_id;

  for v_item in
    select oi.product_id, oi.quantity_kg
    from order_items oi
    where oi.order_id = p_order_id and oi.product_id is not null
  loop
    update products
    set stock_kg = stock_kg - v_item.quantity_kg
    where id = v_item.product_id;

    insert into inventory_transactions (
      product_id, type, quantity_kg, reference_type, reference_id, note
    )
    values (
      v_item.product_id,
      'STOCK_OUT',
      -v_item.quantity_kg,
      'order',
      p_order_id,
      'Захиалга #' || (select order_number from orders where id = p_order_id)
    );
  end loop;

  update orders set stock_deducted = true where id = p_order_id;
  return true;
end;
$$;

create or replace function public.restore_paid_order_stock(p_order_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order orders;
  v_item record;
begin
  select * into v_order from orders where id = p_order_id for update;
  if not found then
    raise exception 'ORDER_NOT_FOUND';
  end if;
  if not v_order.stock_deducted then
    return true;
  end if;

  for v_item in
    select oi.product_id, oi.quantity_kg
    from order_items oi
    where oi.order_id = p_order_id and oi.product_id is not null
  loop
    update products
    set stock_kg = stock_kg + v_item.quantity_kg
    where id = v_item.product_id;

    insert into inventory_transactions (
      product_id, type, quantity_kg, reference_type, reference_id, note
    )
    values (
      v_item.product_id,
      'RETURN',
      v_item.quantity_kg,
      'order',
      p_order_id,
      'Захиалга #' || v_order.order_number || ' цуцлагдсан/буцаагдсан'
    );
  end loop;

  update orders set stock_deducted = false where id = p_order_id;
  return true;
end;
$$;
