-- Add unsubscribe reason (safe to re-run)
alter table public.subscribers
  add column if not exists unsubscribe_reason text;
