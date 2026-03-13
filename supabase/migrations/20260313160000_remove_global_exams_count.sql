-- Remove exams_count column from classes as it is now per-discipline
ALTER TABLE public.classes DROP COLUMN IF EXISTS exams_count;
