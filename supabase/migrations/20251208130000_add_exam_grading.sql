-- Add term column to exams if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'exams' AND column_name = 'term') THEN
        ALTER TABLE public.exams ADD COLUMN term text DEFAULT '1_bimestre';
    END IF;
END $$;

-- Create exam_results table
CREATE TABLE IF NOT EXISTS public.exam_results (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    exam_id uuid REFERENCES public.exams(id) ON DELETE CASCADE,
    student_id uuid REFERENCES public.students(id) ON DELETE CASCADE,
    score numeric(5,2),
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.exam_results ENABLE ROW LEVEL SECURITY;

-- Policies for exam_results
DROP POLICY IF EXISTS "Users can view results for their exams" ON public.exam_results;
CREATE POLICY "Users can view results for their exams"
    ON public.exam_results FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.exams
            WHERE exams.id = exam_results.exam_id
            AND exams.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can insert results for their exams" ON public.exam_results;
CREATE POLICY "Users can insert results for their exams"
    ON public.exam_results FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.exams
            WHERE exams.id = exam_results.exam_id
            AND exams.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can update results for their exams" ON public.exam_results;
CREATE POLICY "Users can update results for their exams"
    ON public.exam_results FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.exams
            WHERE exams.id = exam_results.exam_id
            AND exams.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can delete results for their exams" ON public.exam_results;
CREATE POLICY "Users can delete results for their exams"
    ON public.exam_results FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.exams
            WHERE exams.id = exam_results.exam_id
            AND exams.user_id = auth.uid()
        )
    );
