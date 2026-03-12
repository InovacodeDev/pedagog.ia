-- Add period configuration and academic year fields to classes table
ALTER TABLE public.classes ADD COLUMN IF NOT EXISTS academic_year integer DEFAULT extract(year from now());
ALTER TABLE public.classes ADD COLUMN IF NOT EXISTS period_type text DEFAULT 'bimestre';
ALTER TABLE public.classes ADD COLUMN IF NOT EXISTS period_starts jsonb DEFAULT '[]';
