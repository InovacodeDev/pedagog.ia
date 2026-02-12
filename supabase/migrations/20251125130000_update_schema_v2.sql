-- 20251125130000_update_schema_v2.sql

-- 1. Update questions table
ALTER TABLE public.questions
ADD COLUMN type text CHECK (type IN ('multiple_choice', 'true_false', 'essay', 'sum', 'redaction', 'association')),
ADD COLUMN style text CHECK (style IN ('enem', 'high_school', 'entrance_exam', 'civil_service')),
ADD COLUMN usage_count integer DEFAULT 0;

-- 2. Update exams table
ALTER TABLE public.exams
ADD COLUMN correction_count integer DEFAULT 0;

-- 3. Create index for faster filtering
CREATE INDEX idx_questions_type ON public.questions(type);
CREATE INDEX idx_questions_style ON public.questions(style);
CREATE INDEX idx_questions_usage_count ON public.questions(usage_count);
