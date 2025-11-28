-- Drop previous function signatures to avoid conflicts
DROP FUNCTION IF EXISTS public.create_secure_student(text, uuid);
DROP FUNCTION IF EXISTS public.create_secure_student(text, text);

-- Create the new function with secret_key injection
CREATE OR REPLACE FUNCTION public.create_secure_student(
  name_text text,
  class_id_arg uuid,
  secret_key text
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_student_id uuid;
  user_institution_id uuid;
BEGIN
  -- Validate secret key presence
  IF secret_key IS NULL OR secret_key = '' THEN
    RAISE EXCEPTION 'Encryption key must be provided';
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
    extensions.pgp_sym_encrypt(name_text, secret_key),
    class_id_arg,
    NULL
  )
  RETURNING id INTO new_student_id;

  RETURN new_student_id;
END;
$$;
