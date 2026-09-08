-- Enable PostgreSQL Logical Replication (WAL) for Supabase Realtime
-- This ensures Supabase emits websocket change events to connected clients when rows are inserted or updated.

-- 1. Ensure supabase_realtime publication exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime'
  ) THEN
    CREATE PUBLICATION supabase_realtime;
  END IF;
END $$;

-- 2. Add tables to supabase_realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.payments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.expenses;

-- 3. Set REPLICA IDENTITY FULL so UPDATE and DELETE events send complete record payloads
ALTER TABLE public.payments REPLICA IDENTITY FULL;
ALTER TABLE public.transactions REPLICA IDENTITY FULL;
ALTER TABLE public.expenses REPLICA IDENTITY FULL;
