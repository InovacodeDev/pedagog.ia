-- Create classes table
CREATE TABLE IF NOT EXISTS public.classes (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on classes
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for classes
CREATE POLICY "Users can view their own classes"
    ON public.classes FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own classes"
    ON public.classes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own classes"
    ON public.classes FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own classes"
    ON public.classes FOR DELETE
    USING (auth.uid() = user_id);

-- Update students table
-- Add user_id to link students directly to a teacher (user)
ALTER TABLE public.students
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add name column for plaintext storage (required for unique constraint)
ALTER TABLE public.students
ADD COLUMN IF NOT EXISTS name text;

-- Add class_id foreign key
ALTER TABLE public.students
ADD COLUMN IF NOT EXISTS class_id uuid REFERENCES public.classes(id) ON DELETE SET NULL;

-- Add unique constraint on (user_id, name)
-- This prevents a teacher from having two students with the exact same name
ALTER TABLE public.students
ADD CONSTRAINT students_user_id_name_key UNIQUE (user_id, name);

-- Create exam_classes junction table (Many-to-Many)
CREATE TABLE IF NOT EXISTS public.exam_classes (
    exam_id uuid REFERENCES public.exams(id) ON DELETE CASCADE,
    class_id uuid REFERENCES public.classes(id) ON DELETE CASCADE,
    PRIMARY KEY (exam_id, class_id)
);

-- Enable RLS on exam_classes
ALTER TABLE public.exam_classes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for exam_classes
-- Users can view/manage links if they own the exam
CREATE POLICY "Users can view their own exam_classes"
    ON public.exam_classes FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.exams
            WHERE exams.id = exam_classes.exam_id
            AND exams.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert their own exam_classes"
    ON public.exam_classes FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.exams
            WHERE exams.id = exam_classes.exam_id
            AND exams.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete their own exam_classes"
    ON public.exam_classes FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.exams
            WHERE exams.id = exam_classes.exam_id
            AND exams.user_id = auth.uid()
        )
    );
