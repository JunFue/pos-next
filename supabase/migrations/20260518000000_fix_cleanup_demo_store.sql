CREATE OR REPLACE FUNCTION public.cleanup_demo_store(target_user_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  store_record RECORD;
BEGIN
  -- 1. IDENTIFY AND MANUALLY STRIP ALL STORES FOR THIS USER
  FOR store_record IN 
    SELECT store_id FROM public.stores 
    WHERE user_id = target_user_id
  LOOP
    -- Delete highly dependent tables first
    DELETE FROM public.voucher_redemptions WHERE payment_id IN (SELECT id FROM public.payments WHERE store_id = store_record.store_id);
    DELETE FROM public.transactions WHERE store_id = store_record.store_id;
    DELETE FROM public.payments WHERE store_id = store_record.store_id;
    DELETE FROM public.daily_item_stats WHERE store_id = store_record.store_id;
    DELETE FROM public.daily_store_stats WHERE store_id = store_record.store_id;
    DELETE FROM public.expenses WHERE store_id = store_record.store_id;
    DELETE FROM public.stock_flow WHERE store_id = store_record.store_id;
    DELETE FROM public.quick_pick_items WHERE store_id = store_record.store_id;
    
    -- Delete base inventory/category
    DELETE FROM public.items WHERE store_id = store_record.store_id;
    DELETE FROM public.product_category WHERE store_id = store_record.store_id;
    DELETE FROM public.classification WHERE store_id = store_record.store_id;
    DELETE FROM public.vouchers WHERE store_id = store_record.store_id;
    
    -- Delete customers/groups
    DELETE FROM public.customers WHERE store_id = store_record.store_id;
    DELETE FROM public.customer_groups WHERE store_id = store_record.store_id;
    
    -- Delete isolated dependencies
    DELETE FROM public.playground_states WHERE store_id = store_record.store_id;
    DELETE FROM public.store_subscriptions WHERE store_id = store_record.store_id;
    
    -- Nullify store references in users table so we can safely delete the store
    UPDATE public.users SET store_id = NULL WHERE store_id = store_record.store_id;

    -- Finally, delete the store
    DELETE FROM public.stores WHERE store_id = store_record.store_id;
  END LOOP;

  -- 2. CLEANUP USER ORPHANED RELATIONSHIPS
  DELETE FROM public.customer_groups WHERE created_by = target_user_id;
  DELETE FROM public.expenses WHERE user_id = target_user_id;
  DELETE FROM public.invitations WHERE inviter_id = target_user_id;
  DELETE FROM public.voucher_redemptions WHERE redeemed_by = target_user_id;
  DELETE FROM public.vouchers WHERE created_by = target_user_id;
  
  -- Nullify records specifically tied to the user (Nullable foreign keys)
  UPDATE public.payments SET cashier_id = NULL WHERE cashier_id = target_user_id;
  UPDATE public.stock_flow SET user_id = NULL WHERE user_id = target_user_id;
  UPDATE public.transactions SET cashier = NULL WHERE cashier = target_user_id;
  UPDATE public.customers SET admin_id = NULL WHERE admin_id = target_user_id;
  UPDATE public.customer_groups SET admin_id = NULL WHERE admin_id = target_user_id;
  UPDATE public.items SET user_id = NULL WHERE user_id = target_user_id;
  UPDATE public.store_subscriptions SET payer_user_id = NULL WHERE payer_user_id = target_user_id;

  -- 3. REMOVE THE USER
  DELETE FROM public.staff_permissions WHERE user_id = target_user_id;
  DELETE FROM public.users WHERE user_id = target_user_id;
  DELETE FROM auth.users WHERE id = target_user_id;

END;
$function$;
