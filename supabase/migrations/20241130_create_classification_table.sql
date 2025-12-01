-- Create the classification table
CREATE TABLE public.classification (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  store_id uuid NOT NULL,
  admin_user_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT classification_pkey PRIMARY KEY (id),
  CONSTRAINT classification_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(store_id),
  CONSTRAINT classification_admin_user_id_fkey FOREIGN KEY (admin_user_id) REFERENCES public.admin(user_id)
);

-- Enable Row Level Security
ALTER TABLE public.classification ENABLE ROW LEVEL SECURITY;

-- Create Policies
-- 1. Select: Allow members of the store to view classifications
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

-- 2. Insert: Allow members to insert (store_id is handled by RPC/Backend usually, but for direct insert we check membership)
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

-- 3. Update: Allow members to update
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

-- 4. Delete: Allow members to delete
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

-- Create RPC for inserting new classification
-- This RPC automatically fetches the store_id and admin_user_id for the current user
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
