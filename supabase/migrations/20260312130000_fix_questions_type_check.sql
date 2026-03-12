-- 20260312130000_fix_questions_type_check.sql

-- Drop the existing constraint
ALTER TABLE public.questions DROP CONSTRAINT IF EXISTS questions_type_check;

-- Add updated constraint with 'open_ended' type included
ALTER TABLE public.questions ADD CONSTRAINT questions_type_check CHECK (type IN ('multiple_choice', 'true_false', 'essay', 'sum', 'redaction', 'association', 'open_ended'));
