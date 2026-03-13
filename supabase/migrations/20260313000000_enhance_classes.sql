-- Add enhancement columns to classes table
ALTER TABLE public.classes ADD COLUMN IF NOT EXISTS passing_grade numeric DEFAULT 6.0;
ALTER TABLE public.classes ADD COLUMN IF NOT EXISTS min_frequency numeric DEFAULT 75.0;
ALTER TABLE public.classes ADD COLUMN IF NOT EXISTS exams_count integer DEFAULT 4;
ALTER TABLE public.classes ADD COLUMN IF NOT EXISTS is_archived boolean DEFAULT false;

-- Index for archived status
CREATE INDEX IF NOT EXISTS idx_classes_is_archived ON public.classes(is_archived);
