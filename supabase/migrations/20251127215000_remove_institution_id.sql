-- 1. Drop the old RLS policy that depends on institution_id
DROP POLICY IF EXISTS "Users see own institution students" ON public.students;

-- 2. Drop the institution_id column
ALTER TABLE public.students DROP COLUMN IF EXISTS institution_id;

-- 3. Create a new RLS policy based on user_id
-- This allows users to manage students they own (user_id matches auth.uid())
CREATE POLICY "Users can manage their own students"
    ON public.students
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 4. Update the RPC function to remove institution_id logic and set user_id
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
BEGIN
  -- Validate secret key
  IF secret_key IS NULL OR secret_key = '' THEN
    RAISE EXCEPTION 'Encryption key must be provided';
  END IF;
  
  -- Insert encrypted student with class_id and user_id (from auth context)
  INSERT INTO public.students (user_id, encrypted_name, class_id, grade_level)
  VALUES (
    auth.uid(),
    extensions.pgp_sym_encrypt(name_text, secret_key),
    class_id_arg,
    NULL
  )
  RETURNING id INTO new_student_id;

  RETURN new_student_id;
END;
$$;
