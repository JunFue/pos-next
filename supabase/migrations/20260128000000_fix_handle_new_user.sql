-- Update handle_new_user to skip if enrollment_id is missing (Google Auth case)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  target_store_id uuid;
  provided_enrollment_id text;
  user_role text;
BEGIN
  provided_enrollment_id := NEW.raw_user_meta_data->>'enrollment_id';

  -- 1. If no enrollment ID provided (e.g. Google Auth), skip automatic creation.
  -- The application will handle user creation/linking via the auth callback.
  IF provided_enrollment_id IS NULL OR provided_enrollment_id = '' THEN
      RETURN NEW;
  END IF;

  -- 2. Determine role and store based on Enrollment ID
  SELECT store_id INTO target_store_id
  FROM public.stores
  WHERE enrollment_id = provided_enrollment_id;

  IF target_store_id IS NULL THEN
      RAISE EXCEPTION 'Invalid Enrollment ID: %', provided_enrollment_id;
  END IF;
  user_role := 'member';

  -- 3. Single insert into public.users
  INSERT INTO public.users (
    user_id, 
    first_name, 
    last_name, 
    email, 
    role, 
    store_id,
    avatar,
    metadata
  )
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    NEW.email,
    user_role,
    target_store_id,
    NEW.raw_user_meta_data->>'avatar',
    jsonb_build_object(
        'job_title', NEW.raw_user_meta_data->>'job_title',
        'business_name', NEW.raw_user_meta_data->>'business_name'
    )
  );

  -- 4. Staff permissions (only for members)
  IF user_role = 'member' THEN
      INSERT INTO public.staff_permissions (user_id, can_backdate, can_edit_price)
      VALUES (NEW.id, false, false);
  END IF;

  RETURN NEW;
END;
$function$;
