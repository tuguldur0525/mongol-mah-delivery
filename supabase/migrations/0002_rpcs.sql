-- =============================================================
-- Atomic inventory + payment fulfillment RPCs
-- =============================================================

-- Mark order paid + deduct stock atomically. Idempotent.
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

  -- already processed -> idempotent no-op
  if v_order.payment_status = 'paid' and v_order.stock_deducted then
    return true;
  end if;

  -- amount/currency validation
  if v_order.total_amount <> p_amount or v_order.currency <> p_currency then
    raise exception 'AMOUNT_MISMATCH';
  end if;

  -- order must still be payable
  if v_order.payment_status in ('refunded') or v_order.order_status in ('cancelled') then
    raise exception 'ORDER_NOT_PAYABLE';
  end if;

  -- verify stock for all items before mutating anything
  if exists (
    select 1
    from order_items oi
    join products p on p.id = oi.product_id
    where oi.order_id = p_order_id
      and (p.stock_kg < oi.quantity_kg or p.is_available = false)
  ) then
    raise exception 'INSUFFICIENT_STOCK';
  end if;

  -- mark paid
  update orders
  set payment_status = 'paid',
      order_status = case when order_status = 'pending_payment' then 'confirmed' else order_status end,
      wire_payment_id = coalesce(p_wire_payment_id, wire_payment_id),
      paid_at = now()
  where id = p_order_id;

  -- deduct stock + transactions
  for v_item in
    select oi.product_id, oi.quantity_kg, oi.product_name_snapshot
    from order_items oi where oi.order_id = p_order_id
  loop
    update products
    set stock_kg = stock_kg - v_item.quantity_kg
    where id = v_item.product_id;

    insert into inventory_transactions (product_id, type, quantity_kg, reference_type, reference_id, note)
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
end $$;

-- Restore stock for a cancelled/refunded paid order. Idempotent.
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
    return true; -- nothing to restore
  end if;

  for v_item in
    select oi.product_id, oi.quantity_kg
    from order_items oi where oi.order_id = p_order_id
  loop
    update products
    set stock_kg = stock_kg + v_item.quantity_kg
    where id = v_item.product_id;

    insert into inventory_transactions (product_id, type, quantity_kg, reference_type, reference_id, note)
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
end $$;

-- Admin-controlled stock change (STOCK_IN / ADJUSTMENT). Atomic + locked.
create or replace function public.admin_stock_change(
  p_product_id uuid,
  p_delta numeric,
  p_type text,
  p_note text
)
returns numeric
language plpgsql
security definer
set search_path = public
as $$
declare
  v_new_stock numeric(10,2);
begin
  if not public.is_admin() then
    raise exception 'FORBIDDEN';
  end if;

  if p_type not in ('STOCK_IN','ADJUSTMENT') then
    raise exception 'INVALID_TYPE';
  end if;

  select stock_kg into v_new_stock from products where id = p_product_id for update;
  if not found then
    raise exception 'PRODUCT_NOT_FOUND';
  end if;

  v_new_stock = v_new_stock + p_delta;

  if v_new_stock < 0 then
    raise exception 'INSUFFICIENT_STOCK';
  end if;

  update products set stock_kg = v_new_stock where id = p_product_id;

  insert into inventory_transactions (product_id, type, quantity_kg, reference_type, note, created_by)
  values (p_product_id, p_type, p_delta, 'manual', p_note, auth.uid());

  return v_new_stock;
end $$;
