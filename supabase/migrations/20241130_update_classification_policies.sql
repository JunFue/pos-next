-- Update RLS policies for classification table
-- This updates existing policies without recreating the table

-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for store members" ON public.classification;
DROP POLICY IF EXISTS "Enable insert for store members" ON public.classification;
DROP POLICY IF EXISTS "Enable update for store members" ON public.classification;
DROP POLICY IF EXISTS "Enable delete for store members" ON public.classification;

-- Recreate policies with correct auth.uid() syntax
CREATE POLICY "Enable read access for store members" ON public.classification
  FOR SELECT
  USING (
    (SELECT auth.uid()) IN (
      SELECT user_id FROM public.members WHERE store_id = classification.store_id
    )
    OR
    (SELECT auth.uid()) IN (
      SELECT user_id FROM public.admin WHERE user_id = classification.admin_user_id
    )
  );

CREATE POLICY "Enable insert for store members" ON public.classification
  FOR INSERT
  WITH CHECK (
    (SELECT auth.uid()) IN (
      SELECT user_id FROM public.members WHERE store_id = classification.store_id
    )
    OR
    (SELECT auth.uid()) IN (
      SELECT user_id FROM public.admin WHERE user_id = classification.admin_user_id
    )
  );

CREATE POLICY "Enable update for store members" ON public.classification
  FOR UPDATE
  USING (
    (SELECT auth.uid()) IN (
      SELECT user_id FROM public.members WHERE store_id = classification.store_id
    )
    OR
    (SELECT auth.uid()) IN (
      SELECT user_id FROM public.admin WHERE user_id = classification.admin_user_id
    )
  );

CREATE POLICY "Enable delete for store members" ON public.classification
  FOR DELETE
  USING (
    (SELECT auth.uid()) IN (
      SELECT user_id FROM public.members WHERE store_id = classification.store_id
    )
    OR
    (SELECT auth.uid()) IN (
      SELECT user_id FROM public.admin WHERE user_id = classification.admin_user_id
    )
  );

-- Update RPC function to handle both admin and member users
CREATE OR REPLACE FUNCTION public.insert_new_classification(name_in text)
RETURNS void
LANGUAGE plpgsql
AS $function$
DECLARE
  current_user_id uuid;
  fetched_store_id uuid;
  fetched_admin_id uuid;
BEGIN
  -- Get current user ID
  current_user_id := auth.uid();

  -- First, try to find store and admin IDs from members table
  SELECT
    store_id,
    admin_user_id
  INTO
    fetched_store_id,
    fetched_admin_id
  FROM
    public.members
  WHERE
    user_id = current_user_id;

  -- If not found in members, check if user is an admin
  IF fetched_store_id IS NULL THEN
    SELECT
      s.store_id,
      a.user_id
    INTO
      fetched_store_id,
      fetched_admin_id
    FROM
      public.admin a
      JOIN public.stores s ON s.user_id = a.user_id
    WHERE
      a.user_id = current_user_id;
  END IF;

  -- Validation
  IF fetched_store_id IS NULL THEN
    RAISE EXCEPTION 'User % is not a registered member or admin of any store.', current_user_id;
  END IF;

  -- Insert
  INSERT INTO public.classification (
    name,
    store_id,
    admin_user_id
  )
  VALUES (
    name_in,
    fetched_store_id,
    fetched_admin_id
  );
END;
$function$;
