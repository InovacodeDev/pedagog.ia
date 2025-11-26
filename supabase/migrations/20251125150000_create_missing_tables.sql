-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own questions" ON public.questions;
DROP POLICY IF EXISTS "Users can insert their own questions" ON public.questions;
DROP POLICY IF EXISTS "Users can update their own questions" ON public.questions;
DROP POLICY IF EXISTS "Users can delete their own questions" ON public.questions;

DROP POLICY IF EXISTS "Users can view their own exams" ON public.exams;
DROP POLICY IF EXISTS "Users can insert their own exams" ON public.exams;
DROP POLICY IF EXISTS "Users can update their own exams" ON public.exams;
DROP POLICY IF EXISTS "Users can delete their own exams" ON public.exams;

DROP POLICY IF EXISTS "Teachers can view their own questions" ON public.questions;
DROP POLICY IF EXISTS "Teachers can insert their own questions" ON public.questions;
DROP POLICY IF EXISTS "Teachers can update their own questions" ON public.questions;
DROP POLICY IF EXISTS "Teachers can delete their own questions" ON public.questions;

DROP POLICY IF EXISTS "Teachers can view their own exams" ON public.exams;
DROP POLICY IF EXISTS "Teachers can insert their own exams" ON public.exams;
DROP POLICY IF EXISTS "Teachers can update their own exams" ON public.exams;
DROP POLICY IF EXISTS "Teachers can delete their own exams" ON public.exams;

-- Rename teacher_id to user_id if it exists, otherwise add user_id
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'questions' AND column_name = 'teacher_id') THEN
        ALTER TABLE public.questions RENAME COLUMN teacher_id TO user_id;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'exams' AND column_name = 'teacher_id') THEN
        ALTER TABLE public.exams RENAME COLUMN teacher_id TO user_id;
    END IF;
END $$;

-- Add missing columns to questions if they don't exist
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS content TEXT;
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS structured_data JSONB;
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS type TEXT;
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS style TEXT;
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS usage_count INT DEFAULT 0;
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS bncc TEXT;

-- Add missing columns to exams if they don't exist
ALTER TABLE public.exams ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.exams ADD COLUMN IF NOT EXISTS correction_count INT DEFAULT 0;

-- Ensure user_id is not null and references auth.users
ALTER TABLE public.questions ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.exams ALTER COLUMN user_id SET NOT NULL;

-- Enable Row Level Security
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;

-- Re-create policies using user_id
CREATE POLICY "Users can view their own questions"
    ON public.questions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own questions"
    ON public.questions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own questions"
    ON public.questions FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own questions"
    ON public.questions FOR DELETE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own exams"
    ON public.exams FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own exams"
    ON public.exams FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own exams"
    ON public.exams FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own exams"
    ON public.exams FOR DELETE
    USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_questions_user_id ON public.questions(user_id);
CREATE INDEX IF NOT EXISTS idx_questions_type ON public.questions(type);
CREATE INDEX IF NOT EXISTS idx_questions_style ON public.questions(style);
CREATE INDEX IF NOT EXISTS idx_exams_user_id ON public.exams(user_id);
