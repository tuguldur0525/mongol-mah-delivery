-- Keep cancelled/pending transaction history for 24 hours (was 10 minutes)
-- Replaces 0006 function with 24h retention

create or replace function public.cleanup_expired_pending_orders()
returns integer
language plpgsql
security definer
set search_path = public
as $func$
declare
  v_deleted integer := 0;
  v_pending integer := 0;
  v_cancelled integer := 0;
begin
  -- 1) Abandoned pending (never paid, gateway quit) -> 24 hours
  with deleted_pending as (
    delete from public.orders
    where payment_status = 'pending'
      and order_status = 'pending_payment'
      and stock_deducted = false
      and created_at < now() - interval '24 hours'
    returning id
  )
  select count(*) into v_pending from deleted_pending;

  -- 2) Cancelled/failed (user cancelled or declined) -> keep 24 hours then clean
  with deleted_cancelled as (
    delete from public.orders
    where payment_status in ('cancelled', 'failed')
      and created_at < now() - interval '24 hours'
    returning id
  )
  select count(*) into v_cancelled from deleted_cancelled;

  v_deleted := v_pending + v_cancelled;
  return v_deleted;
end $func$;

revoke execute on function public.cleanup_expired_pending_orders() from public, anon, authenticated;
grant execute on function public.cleanup_expired_pending_orders() to service_role;

-- Update index to cover both cases (pending and cancelled/failed)
drop index if exists orders_pending_cleanup_idx;
create index if not exists orders_pending_cleanup_idx
  on public.orders (created_at)
  where payment_status in ('pending', 'cancelled', 'failed') and stock_deducted = false;

-- Reschedule pg_cron if enabled (keep 5 min checks, deletes only 24h+ old)
do $cleanup$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    if exists (select 1 from cron.job where jobname = 'cleanup-expired-pending-orders') then
      perform cron.unschedule('cleanup-expired-pending-orders');
    end if;
    perform cron.schedule(
      'cleanup-expired-pending-orders',
      '*/5 * * * *',
      'select public.cleanup_expired_pending_orders();'
    );
  end if;
end $cleanup$;
