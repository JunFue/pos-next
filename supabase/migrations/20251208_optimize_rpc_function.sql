-- Optimize insert_new_payment_and_transaction to use JOINs instead of subqueries
-- This reduces the number of table lookups from 3N to 1N (where N is number of items)

CREATE OR REPLACE FUNCTION public.insert_new_payment_and_transaction(header jsonb, items jsonb)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
DECLARE
  _store_id UUID;
  _cashier_id UUID;
BEGIN
  -- A. Extract Cashier ID
  _cashier_id := (header->>'cashier_name')::UUID;

  -- B. INTERNAL LOOKUP: Find Store
  SELECT store_id
  INTO _store_id
  FROM public.members
  WHERE user_id = _cashier_id;

  -- C. Validation
  IF _store_id IS NULL THEN
    RAISE EXCEPTION 'User % is not linked to any store.', _cashier_id;
  END IF;

  -- D. Insert Payment Header
  INSERT INTO public.payments (
    invoice_no,
    customer_name,
    amount_rendered,
    voucher,
    grand_total,
    change,
    transaction_no,
    cashier_id,
    store_id
  ) VALUES (
    header->>'invoice_no',
    header->>'customer_name',
    (header->>'amount_rendered')::numeric,
    (header->>'voucher')::numeric,
    (header->>'grand_total')::numeric,
    (header->>'change')::numeric,
    header->>'transaction_no',
    _cashier_id,
    _store_id
  );

  -- E. Insert Line Items (Optimized with JOINs)
  INSERT INTO public.transactions (
    sku,
    item_name,
    category,
    cost_price,
    total_price,
    discount,
    quantity,
    cashier,
    store_id,
    invoice_no,
    category_id
  )
  SELECT
    (x->>'sku')::text,
    (x->>'item_name')::text,
    pc.category,
    i.cost_price,
    (x->>'total_price')::numeric,
    (x->>'discount')::numeric,
    (x->>'quantity')::numeric,
    _cashier_id,
    _store_id,
    header->>'invoice_no',
    i.category_id
  FROM jsonb_array_elements(items) AS x
  -- Single efficient lookup for Item details
  JOIN public.items i ON i.sku = (x->>'sku')::text AND i.store_id = _store_id
  -- Single efficient lookup for Category details
  LEFT JOIN public.product_category pc ON i.category_id = pc.id;

END;
$function$;
