-- =========================================================================
-- MIGRATION: Merged Custom JWT Access Token Hook
-- =========================================================================
-- This hook runs every time a user logs in or refreshes their token.
-- It merges your existing staff_permissions logic with the newly required 
-- middleware claims (account status, subscription, etc.)
-- =========================================================================

CREATE OR REPLACE FUNCTION public.custom_access_token(event jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
DECLARE
  claims jsonb;
  app_metadata jsonb;
  u_info record;
  s_info record;
  sub_info record;
  user_permissions jsonb;
  v_status text;
BEGIN
  -- 1. Fetch user data (Merged role and deleted_at checks)
  SELECT store_id, role, deleted_at, first_name, last_name, metadata->>'job_title' as job_title 
  INTO u_info 
  FROM public.users 
  WHERE user_id = (event->>'user_id')::uuid;

  IF NOT FOUND THEN
    RETURN event;
  END IF;

  -- 2. Fetch store data and subscription
  IF u_info.store_id IS NOT NULL THEN
    SELECT drawer_mode, deleted_at INTO s_info
    FROM public.stores
    WHERE store_id = u_info.store_id;

    SELECT status, end_date INTO sub_info 
    FROM public.store_subscriptions 
    WHERE store_id = u_info.store_id;
  END IF;

  -- 3. Fetch staff permissions (From your original hook)
  SELECT jsonb_build_object(
    'can_backdate', can_backdate,
    'can_edit_price', can_edit_price,
    'can_edit_transaction', can_edit_transaction,
    'can_delete_transaction', can_delete_transaction,
    'can_manage_items', can_manage_items,
    'can_manage_categories', can_manage_categories,
    'can_manage_customers', can_manage_customers,
    'can_manage_expenses', can_manage_expenses,
    'can_manage_store', can_manage_store
  ) INTO user_permissions
  FROM public.staff_permissions
  WHERE user_id = (event->>'user_id')::uuid;

  -- 4. Calculate Account Status for Middleware Guard
  v_status := 'active';
  IF u_info.deleted_at IS NOT NULL THEN
      v_status := 'user_deleted';
  ELSE
      IF u_info.store_id IS NOT NULL THEN
          IF s_info.deleted_at IS NOT NULL THEN
              v_status := 'store_deleted';
          END IF;
      ELSE
          IF u_info.role = 'member' THEN
              v_status := 'no_store';
          END IF;
      END IF;
  END IF;

  -- 5. Inject the data into the JWT's app_metadata
  claims := event->'claims';
  app_metadata := COALESCE(claims->'app_metadata', '{}'::jsonb);

  -- Legacy injections (keeping exact names from previous hook)
  IF u_info.store_id IS NOT NULL THEN
    app_metadata := jsonb_set(app_metadata, '{store_id}', to_jsonb(u_info.store_id));
  END IF;

  IF u_info.role IS NOT NULL THEN
    app_metadata := jsonb_set(app_metadata, '{role}', to_jsonb(u_info.role));
  END IF;

  IF user_permissions IS NOT NULL THEN
    app_metadata := jsonb_set(app_metadata, '{permissions}', user_permissions);
  END IF;

  IF s_info.drawer_mode IS NOT NULL THEN
    app_metadata := jsonb_set(app_metadata, '{drawer_mode}', to_jsonb(s_info.drawer_mode));
  END IF;

  -- New injections for Middleware Guard
  app_metadata := jsonb_set(app_metadata, '{has_name}', to_jsonb(u_info.first_name IS NOT NULL AND u_info.last_name IS NOT NULL));
  app_metadata := jsonb_set(app_metadata, '{has_job_title}', to_jsonb(u_info.job_title IS NOT NULL));
  app_metadata := jsonb_set(app_metadata, '{account_status}', to_jsonb(v_status));
  
  IF sub_info IS NOT NULL THEN
      app_metadata := jsonb_set(app_metadata, '{sub_status}', to_jsonb(sub_info.status));
      app_metadata := jsonb_set(app_metadata, '{sub_end_date}', to_jsonb(sub_info.end_date));
  ELSE
      app_metadata := app_metadata - 'sub_status' - 'sub_end_date';
  END IF;

  claims := jsonb_set(claims, '{app_metadata}', app_metadata);
  RETURN jsonb_set(event, '{claims}', claims);
END;
$function$;

-- Ensure proper permissions
GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
GRANT EXECUTE ON FUNCTION public.custom_access_token TO supabase_auth_admin;
REVOKE EXECUTE ON FUNCTION public.custom_access_token FROM authenticated, anon, public;
