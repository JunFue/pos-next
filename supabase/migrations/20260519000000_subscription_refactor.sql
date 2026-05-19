-- ============================================================
-- Subscription Refactor: Remove Xendit, Add Manual GCash Flow
-- ============================================================

-- 1. Add plan_type column to store_subscriptions
ALTER TABLE public.store_subscriptions
  ADD COLUMN IF NOT EXISTS plan_type text DEFAULT 'monthly' CHECK (plan_type IN ('monthly', 'annual'));

-- 2. Rename xendit_invoice_id → reference_notes (repurpose for admin notes)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'store_subscriptions'
      AND column_name = 'xendit_invoice_id'
  ) THEN
    ALTER TABLE public.store_subscriptions RENAME COLUMN xendit_invoice_id TO reference_notes;
  END IF;
END $$;

-- 3. Create subscription_requests table
CREATE TABLE IF NOT EXISTS public.subscription_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES public.stores(store_id),
  requester_user_id uuid NOT NULL REFERENCES public.users(user_id),
  plan_type text NOT NULL CHECK (plan_type IN ('monthly', 'annual')),
  payment_method text NOT NULL CHECK (payment_method IN ('gcash_to_gcash', 'otc_to_gcash')),
  amount numeric NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  gcash_reference text,
  admin_notes text,
  created_at timestamptz DEFAULT now(),
  reviewed_at timestamptz,
  reviewed_by uuid REFERENCES auth.users(id)
);

-- 4. RLS for subscription_requests
ALTER TABLE public.subscription_requests ENABLE ROW LEVEL SECURITY;

-- Users can insert requests for their own store
DROP POLICY IF EXISTS "Users can insert own store requests" ON public.subscription_requests;
CREATE POLICY "Users can insert own store requests" ON public.subscription_requests
FOR INSERT TO authenticated
WITH CHECK (
  store_id IN (
    SELECT u.store_id FROM public.users u WHERE u.user_id = auth.uid()
  )
  AND requester_user_id = (SELECT u.user_id FROM public.users u WHERE u.user_id = auth.uid())
);

-- Users can view their own store's requests
DROP POLICY IF EXISTS "Users can view own store requests" ON public.subscription_requests;
CREATE POLICY "Users can view own store requests" ON public.subscription_requests
FOR SELECT TO authenticated
USING (
  store_id IN (
    SELECT u.store_id FROM public.users u WHERE u.user_id = auth.uid()
  )
);

-- 5. Create index on subscription_requests for common queries
CREATE INDEX IF NOT EXISTS idx_subscription_requests_store_id ON public.subscription_requests(store_id);
CREATE INDEX IF NOT EXISTS idx_subscription_requests_status ON public.subscription_requests(status);
CREATE INDEX IF NOT EXISTS idx_subscription_requests_created_at ON public.subscription_requests(created_at DESC);
