-- Drop dependencies first
DROP POLICY IF EXISTS "Users see own institution students" ON public.students;
DROP FUNCTION IF EXISTS public.create_secure_student;
DROP FUNCTION IF EXISTS public.get_students_decrypted;

-- Drop the table
DROP TABLE IF EXISTS public.profiles;
