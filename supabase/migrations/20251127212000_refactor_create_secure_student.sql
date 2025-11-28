-- Drop the old function signature to avoid confusion/overloading
DROP FUNCTION IF EXISTS public.create_secure_student(text, text);

-- Create the new function with class_id support
CREATE OR REPLACE FUNCTION public.create_secure_student(
  name_text text,
  class_id_arg uuid
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  app_key text;
  new_student_id uuid;
  user_institution_id uuid;
BEGIN
  -- Get encryption key
  app_key := current_setting('app.settings.encryption_key', true);
  
  IF app_key IS NULL OR app_key = '' THEN
    RAISE EXCEPTION 'Encryption key not configured';
  END IF;

  -- Get user's institution
  SELECT institution_id INTO user_institution_id
  FROM public.profiles
  WHERE id = auth.uid();

  IF user_institution_id IS NULL THEN
    RAISE EXCEPTION 'User has no institution assigned';
  END IF;
  
  -- Insert encrypted student with class_id
  INSERT INTO public.students (institution_id, encrypted_name, class_id, grade_level)
  VALUES (
    user_institution_id,
    extensions.pgp_sym_encrypt(name_text, app_key),
    class_id_arg,
    NULL -- grade_level is now optional
  )
  RETURNING id INTO new_student_id;

  RETURN new_student_id;
END;
$$;
