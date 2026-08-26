-- Wire payment attempts and RPC permissions.

alter table public.orders
  add column if not exists payment_attempt_id text;

create unique index if not exists orders_payment_attempt_idx
  on public.orders(payment_attempt_id)
  where payment_attempt_id is not null;

revoke execute on function public.process_paid_order(uuid, integer, text, text)
  from public, anon, authenticated;
grant execute on function public.process_paid_order(uuid, integer, text, text)
  to service_role;

revoke execute on function public.restore_paid_order_stock(uuid)
  from public, anon, authenticated;
grant execute on function public.restore_paid_order_stock(uuid)
  to service_role;