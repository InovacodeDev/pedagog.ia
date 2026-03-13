-- Add exams_config to store per-discipline configurations
ALTER TABLE public.classes ADD COLUMN IF NOT EXISTS exams_config JSONB DEFAULT '{}'::jsonb;
