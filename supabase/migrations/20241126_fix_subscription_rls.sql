-- Fix RLS policies for subscriptions and subscription_payments
-- Add INSERT and UPDATE policies that were missing

-- Policy to allow users to insert/update their store's subscription
CREATE POLICY "Users can manage their store subscription" ON public.subscriptions
    FOR INSERT WITH CHECK (
        store_id IN (
            SELECT store_id FROM public.members WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their store subscription" ON public.subscriptions
    FOR UPDATE USING (
        store_id IN (
            SELECT store_id FROM public.members WHERE user_id = auth.uid()
        )
    ) WITH CHECK (
        store_id IN (
            SELECT store_id FROM public.members WHERE user_id = auth.uid()
        )
    );

-- Policy to allow users to insert their store's payments
CREATE POLICY "Users can insert their store payments" ON public.subscription_payments
    FOR INSERT WITH CHECK (
        store_id IN (
            SELECT store_id FROM public.members WHERE user_id = auth.uid()
        )
    );

-- Policy to allow users to update their store's payments
CREATE POLICY "Users can update their store payments" ON public.subscription_payments
    FOR UPDATE USING (
        store_id IN (
            SELECT store_id FROM public.members WHERE user_id = auth.uid()
        )
    ) WITH CHECK (
        store_id IN (
            SELECT store_id FROM public.members WHERE user_id = auth.uid()
        )
    );
