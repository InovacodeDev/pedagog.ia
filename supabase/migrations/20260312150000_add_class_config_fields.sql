-- Add lesson_days and disciplines to classes table
ALTER TABLE public.classes ADD COLUMN IF NOT EXISTS lesson_days integer[] DEFAULT '{}';
ALTER TABLE public.classes ADD COLUMN IF NOT EXISTS disciplines text[] DEFAULT '{}';

-- Update RLS if needed (usually columns don't need explicit RLS changes if the table already has it)
