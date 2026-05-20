-- ============================================================
-- Support for Trial Subscriptions
-- ============================================================

DO $$
DECLARE
    rec RECORD;
BEGIN
    -- Drop existing constraints on store_subscriptions
    FOR rec IN (
        SELECT conname
        FROM pg_constraint
        WHERE conrelid = 'public.store_subscriptions'::regclass
            AND contype = 'c'
            AND pg_get_constraintdef(oid) LIKE '%plan_type%'
    ) LOOP
        EXECUTE 'ALTER TABLE public.store_subscriptions DROP CONSTRAINT IF EXISTS ' || quote_ident(rec.conname);
    END LOOP;

    -- Drop existing constraints on subscription_requests
    FOR rec IN (
        SELECT conname
        FROM pg_constraint
        WHERE conrelid = 'public.subscription_requests'::regclass
            AND contype = 'c'
            AND (pg_get_constraintdef(oid) LIKE '%plan_type%' OR pg_get_constraintdef(oid) LIKE '%payment_method%')
    ) LOOP
        EXECUTE 'ALTER TABLE public.subscription_requests DROP CONSTRAINT IF EXISTS ' || quote_ident(rec.conname);
    END LOOP;
END $$;

-- Add new constraints that include 'trial' and 'none'
ALTER TABLE public.store_subscriptions
  ADD CONSTRAINT store_subscriptions_plan_type_check CHECK (plan_type IN ('monthly', 'annual', 'trial'));

ALTER TABLE public.subscription_requests
  ADD CONSTRAINT subscription_requests_plan_type_check CHECK (plan_type IN ('monthly', 'annual', 'trial'));

ALTER TABLE public.subscription_requests
  ADD CONSTRAINT subscription_requests_payment_method_check CHECK (payment_method IN ('gcash_to_gcash', 'otc_to_gcash', 'none'));
