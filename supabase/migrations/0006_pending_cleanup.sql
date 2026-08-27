-- Auto-cleanup for abandoned Wire payments
-- Pending orders where user quit the gateway cannot be resumed (Wire session expired),
-- so we remove them after 10 minutes to keep DB clean.

-- Function to delete expired pending orders (idempotent)
create or replace function public.cleanup_expired_pending_orders()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_deleted integer := 0;
begin
  -- Delete orders that are still pending_payment/pending after 10 minutes
  -- order_items are cascade-deleted via FK
  with deleted as (
    delete from public.orders
    where payment_status = 'pending'
      and order_status = 'pending_payment'
      and stock_deducted = false
      and created_at < now() - interval '10 minutes'
    returning id
  )
  select count(*) into v_deleted from deleted;

  return v_deleted;
end $$;

-- Only service_role can execute (called from cron via service key)
revoke execute on function public.cleanup_expired_pending_orders() from public, anon, authenticated;
grant execute on function public.cleanup_expired_pending_orders() to service_role;

-- Helpful index for cleanup query
create index if not exists orders_pending_cleanup_idx
  on public.orders (created_at)
  where payment_status = 'pending' and order_status = 'pending_payment' and stock_deducted = false;

-- Optional pg_cron schedule (if pg_cron available). Safe to ignore if extension not enabled.
-- To enable on Supabase: create extension if not exists pg_cron;
-- Then schedule every 5 minutes.
do $cleanup$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    -- make idempotent: remove existing schedule if present
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
