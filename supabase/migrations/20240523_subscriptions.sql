-- Create subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    store_id uuid NOT NULL,
    status text NOT NULL DEFAULT 'inactive',
    current_period_start timestamp with time zone,
    current_period_end timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT subscriptions_pkey PRIMARY KEY (id),
    CONSTRAINT subscriptions_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(store_id),
    CONSTRAINT subscriptions_store_id_key UNIQUE (store_id)
);

-- Create subscription_payments table
CREATE TABLE IF NOT EXISTS public.subscription_payments (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    subscription_id uuid NOT NULL,
    store_id uuid NOT NULL,
    amount numeric NOT NULL,
    currency text NOT NULL DEFAULT 'PHP',
    status text NOT NULL,
    payment_method text,
    transaction_id text,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT subscription_payments_pkey PRIMARY KEY (id),
    CONSTRAINT subscription_payments_subscription_id_fkey FOREIGN KEY (subscription_id) REFERENCES public.subscriptions(id),
    CONSTRAINT subscription_payments_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(store_id)
);

-- Add RLS policies (Optional, but good practice)
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_payments ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to view their store's subscription
CREATE POLICY "Users can view their store subscription" ON public.subscriptions
    FOR SELECT USING (
        store_id IN (
            SELECT store_id FROM public.members WHERE user_id = auth.uid()
            UNION
            SELECT store_id FROM public.stores WHERE user_id = (SELECT user_id FROM public.admin WHERE user_id = auth.uid())
        )
    );

-- Policy to allow users to view their store's payments
CREATE POLICY "Users can view their store payments" ON public.subscription_payments
    FOR SELECT USING (
        store_id IN (
            SELECT store_id FROM public.members WHERE user_id = auth.uid()
            UNION
            SELECT store_id FROM public.stores WHERE user_id = (SELECT user_id FROM public.admin WHERE user_id = auth.uid())
        )
    );
