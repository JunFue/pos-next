-- docs/migration_discount_voucher.sql
-- Run this in Supabase SQL Editor to set up the new Discount and Voucher system

-------------------------------------------------------------------------------
-- 1. Create the `vouchers` table (Proper redeemable instruments)
-------------------------------------------------------------------------------
CREATE TABLE public.vouchers (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL,
  code text NOT NULL,                          -- Scannable/typeable code (e.g. "SUMMER2026")
  label text,                                  -- Friendly name (e.g. "Summer Sale ₱100 Off")
  voucher_type text NOT NULL DEFAULT 'fixed',  -- 'fixed' | 'percent'
  original_value numeric NOT NULL,             -- Face value (₱100 or 10%)
  remaining_balance numeric NOT NULL,          -- Tracks partial redemptions
  min_order_amount numeric DEFAULT 0,          -- Minimum order to use this voucher
  max_discount_amount numeric,                 -- Cap for % vouchers (e.g. 10% up to ₱500)
  usage_limit integer,                         -- NULL = unlimited uses
  times_used integer DEFAULT 0,
  valid_from timestamp with time zone DEFAULT now(),
  valid_until timestamp with time zone,        -- NULL = never expires
  is_active boolean DEFAULT true,
  created_by uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  
  CONSTRAINT vouchers_pkey PRIMARY KEY (id),
  CONSTRAINT vouchers_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(store_id),
  CONSTRAINT vouchers_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id),
  CONSTRAINT vouchers_code_store_unique UNIQUE (code, store_id)
);

-------------------------------------------------------------------------------
-- 2. Extend the `payments` table (Order-Level Discounts)
-------------------------------------------------------------------------------
-- We add order-level discount tracking and a reference to the voucher used.
ALTER TABLE public.payments 
  ADD COLUMN IF NOT EXISTS order_discount_type text,                 -- 'flat' | 'percent' | NULL
  ADD COLUMN IF NOT EXISTS order_discount_value numeric DEFAULT 0,   -- Raw input (10 for 10% or ₱10)
  ADD COLUMN IF NOT EXISTS order_discount_amount numeric DEFAULT 0,  -- Computed flat deduction
  ADD COLUMN IF NOT EXISTS voucher_id uuid,                          -- FK to vouchers table (NULL for manual)
  ADD COLUMN IF NOT EXISTS voucher_code text;                        -- Denormalized for receipt printing

ALTER TABLE public.payments
  ADD CONSTRAINT payments_voucher_id_fkey 
  FOREIGN KEY (voucher_id) REFERENCES public.vouchers(id);


-------------------------------------------------------------------------------
-- 3. Extend the `transactions` table (Item-Level Discounts)
-------------------------------------------------------------------------------
-- We already have `discount` (which stores the flat amount), now we need the type.
ALTER TABLE public.transactions
  ADD COLUMN IF NOT EXISTS discount_type text DEFAULT 'flat'; -- 'flat' | 'percent'


-------------------------------------------------------------------------------
-- 4. Create the `voucher_redemptions` table (Audit Trail)
-------------------------------------------------------------------------------
CREATE TABLE public.voucher_redemptions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  voucher_id uuid NOT NULL,
  payment_id uuid NOT NULL,
  amount_redeemed numeric NOT NULL,
  redeemed_at timestamp with time zone DEFAULT now(),
  redeemed_by uuid NOT NULL,
  
  CONSTRAINT voucher_redemptions_pkey PRIMARY KEY (id),
  CONSTRAINT voucher_redemptions_voucher_fkey FOREIGN KEY (voucher_id) REFERENCES public.vouchers(id),
  CONSTRAINT voucher_redemptions_payment_fkey FOREIGN KEY (payment_id) REFERENCES public.payments(id),
  CONSTRAINT voucher_redemptions_user_fkey FOREIGN KEY (redeemed_by) REFERENCES auth.users(id)
);


-------------------------------------------------------------------------------
-- 5. Update the RPC Function: insert_new_payment_and_transaction
-------------------------------------------------------------------------------
-- Note: Replace your existing RPC with this updated version in Supabase.
-- The only changes here are mapping the new properties from the `header` and `items` JSON payloads
-- into the newly created columns on `payments` and `transactions`.

-- Drop potential conflicting signatures to prevent ambiguous function call errors
DROP FUNCTION IF EXISTS public.insert_new_payment_and_transaction(jsonb, jsonb[]);
DROP FUNCTION IF EXISTS public.insert_new_payment_and_transaction(jsonb, jsonb);

CREATE OR REPLACE FUNCTION public.insert_new_payment_and_transaction(
  header jsonb,
  items jsonb
) RETURNS jsonb AS $$
DECLARE
  new_payment_id uuid;
  new_invoice_no text;
  idx integer;
  item jsonb;
  v_customer_id uuid;
  v_transaction_time timestamp with time zone;
  v_cashier_name text;
  v_store_id uuid;
  v_category_id uuid;
BEGIN
  -- 1. Extract values or fall back to defaults
  v_customer_id := (header->>'customer_id')::uuid;
  
  IF header ? 'transaction_time' AND header->>'transaction_time' IS NOT NULL THEN
    v_transaction_time := (header->>'transaction_time')::timestamp with time zone;
  ELSE
    v_transaction_time := now();
  END IF;

  -- 2. Validate Data
  IF jsonb_array_length(items) = 0 THEN
    RAISE EXCEPTION 'Items array cannot be empty';
  END IF;

  -- 3. Get Auth Details
  v_cashier_name := auth.uid();
  IF v_cashier_name IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT store_id INTO v_store_id FROM users WHERE user_id = v_cashier_name::uuid;
  IF v_store_id IS NULL THEN
    RAISE EXCEPTION 'Store not found for user';
  END IF;

  -- 4. Generate Invoice No
  new_invoice_no := 'INV-' || to_char(now(), 'YYYYMMDD-HH24MISS') || '-' || substring(md5(random()::text) from 1 for 4);

  -- 5. Insert Payment
  INSERT INTO public.payments (
    invoice_no, 
    customer_name, 
    amount_rendered, 
    voucher, 
    amount_paid, 
    change, 
    transaction_no, 
    transaction_time, 
    customer_id, 
    cashier_id, 
    store_id,
    -- [NEW FIELDS]
    order_discount_type,
    order_discount_value,
    order_discount_amount,
    voucher_id,
    voucher_code
  ) VALUES (
    new_invoice_no,
    header->>'customer_name',
    COALESCE((header->>'amount_rendered')::numeric, 0),
    COALESCE((header->>'voucher')::numeric, 0),
    COALESCE((header->>'grand_total')::numeric, 0),
    COALESCE((header->>'change')::numeric, 0),
    new_invoice_no,
    v_transaction_time,
    v_customer_id,
    v_cashier_name::uuid,
    v_store_id,
    -- [NEW FIELDS]
    header->>'order_discount_type',
    COALESCE((header->>'order_discount_value')::numeric, 0),
    COALESCE((header->>'order_discount_amount')::numeric, 0),
    (header->>'voucher_id')::uuid,
    header->>'voucher_code'
  ) RETURNING id INTO new_payment_id;

  -- 6. Insert Transactions (Items)
  FOR item IN SELECT * FROM jsonb_array_elements(items) LOOP

    -- Validation
    IF item->>'sku' IS NULL OR item->>'item_name' IS NULL THEN
      RAISE EXCEPTION 'SKU and item_name are required';
    END IF;

    -- Look up category_id based on SKU and store_id
    SELECT category_id INTO v_category_id
    FROM public.items
    WHERE sku = item->>'sku' AND store_id = v_store_id
    LIMIT 1;

    INSERT INTO public.transactions (
      sku, 
      item_name, 
      sales_price, 
      total_price, 
      discount, 
      quantity, 
      invoice_no, 
      transaction_time, 
      payment_id, 
      cashier, 
      store_id,
      category_id,
      -- [NEW FIELD]
      discount_type
    ) VALUES (
      item->>'sku',
      item->>'item_name',
      COALESCE((item->>'sales_price')::numeric, 0),
      COALESCE((item->>'total_price')::numeric, 0),
      COALESCE((item->>'discount')::numeric, 0),
      COALESCE((item->>'quantity')::numeric, 0),
      new_invoice_no,
      v_transaction_time,
      new_payment_id,
      v_cashier_name::uuid,
      v_store_id,
      v_category_id,
      -- [NEW FIELD]
      COALESCE(item->>'discount_type', 'flat')
    );
  END LOOP;

  -- 7. Update Customer Metrics (if applicable)
  IF v_customer_id IS NOT NULL THEN
     UPDATE customers 
     SET 
       total_spent = total_spent + COALESCE((header->>'grand_total')::numeric, 0),
       visit_count = visit_count + 1,
       last_visit_at = v_transaction_time
     WHERE id = v_customer_id;
  END IF;

  RETURN jsonb_build_object('success', true, 'invoice_no', new_invoice_no, 'payment_id', new_payment_id);
EXCEPTION 
  WHEN OTHERS THEN
    -- Log the error internally (optional) and re-raise or return error
    RAISE EXCEPTION 'Failed to insert payment and transactions: %', SQLERRM;
END;
$$ LANGUAGE plpgsql;

-------------------------------------------------------------------------------
-- 6. Row Level Security (RLS) Policies
-------------------------------------------------------------------------------

-- Enable RLS
ALTER TABLE public.vouchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voucher_redemptions ENABLE ROW LEVEL SECURITY;

-- Drop previous policies if they exist (for safe re-runs)
DROP POLICY IF EXISTS "Users can view vouchers for their store" ON public.vouchers;
DROP POLICY IF EXISTS "Users can insert vouchers for their store" ON public.vouchers;
DROP POLICY IF EXISTS "Users can update vouchers for their store" ON public.vouchers;
DROP POLICY IF EXISTS "Users can delete vouchers for their store" ON public.vouchers;
DROP POLICY IF EXISTS "Users can view redemptions for their store vouchers" ON public.voucher_redemptions;
DROP POLICY IF EXISTS "Users can insert redemptions for their store vouchers" ON public.voucher_redemptions;

-- Vouchers Policies
CREATE POLICY "View Vouchers (JWT)" ON public.vouchers
  FOR SELECT USING (
    store_id = ((auth.jwt() -> 'app_metadata'::text) ->> 'store_id'::text)::uuid
  );

CREATE POLICY "Insert Vouchers (JWT)" ON public.vouchers
  FOR INSERT WITH CHECK (
    store_id = ((auth.jwt() -> 'app_metadata'::text) ->> 'store_id'::text)::uuid
  );

CREATE POLICY "Update Vouchers (JWT)" ON public.vouchers
  FOR UPDATE USING (
    (store_id = ((auth.jwt() -> 'app_metadata'::text) ->> 'store_id'::text)::uuid) 
    AND ((((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'admin'::text) OR (((auth.jwt() -> 'app_metadata'::text) -> 'permissions'::text) ->> 'can_manage_store'::text)::boolean = true)
  );

CREATE POLICY "Delete Vouchers (JWT)" ON public.vouchers
  FOR DELETE USING (
    (store_id = ((auth.jwt() -> 'app_metadata'::text) ->> 'store_id'::text)::uuid) 
    AND (((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'admin'::text)
  );

CREATE POLICY "Vouchers co_admin_full_access" ON public.vouchers
  FOR ALL USING (
    store_id IN (SELECT stores.store_id FROM stores WHERE (SELECT auth.uid()) = ANY(stores.co_admins))
  );

-- Voucher Redemptions Policies
CREATE POLICY "View Voucher Redemptions (JWT)" ON public.voucher_redemptions
  FOR SELECT USING (
    voucher_id IN (SELECT id FROM public.vouchers WHERE store_id = ((auth.jwt() -> 'app_metadata'::text) ->> 'store_id'::text)::uuid)
  );

CREATE POLICY "Insert Voucher Redemptions (JWT)" ON public.voucher_redemptions
  FOR INSERT WITH CHECK (
    voucher_id IN (SELECT id FROM public.vouchers WHERE store_id = ((auth.jwt() -> 'app_metadata'::text) ->> 'store_id'::text)::uuid)
  );

CREATE POLICY "Voucher Redemptions co_admin_full_access" ON public.voucher_redemptions
  FOR ALL USING (
    voucher_id IN (
      SELECT id FROM public.vouchers WHERE store_id IN (
        SELECT stores.store_id FROM stores WHERE (SELECT auth.uid()) = ANY(stores.co_admins)
      )
    )
  );
