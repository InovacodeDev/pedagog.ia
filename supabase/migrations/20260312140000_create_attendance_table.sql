-- Create class_attendance table
CREATE TABLE IF NOT EXISTS public.class_attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'late')),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Ensure a student only has one attendance record per day
    UNIQUE(student_id, date)
);

-- Enable RLS
ALTER TABLE public.class_attendance ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view attendance for their own classes"
    ON public.class_attendance FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert attendance for their own classes"
    ON public.class_attendance FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update attendance for their own classes"
    ON public.class_attendance FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete attendance for their own classes"
    ON public.class_attendance FOR DELETE
    USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_class_attendance_class_id ON public.class_attendance(class_id);
CREATE INDEX IF NOT EXISTS idx_class_attendance_student_id ON public.class_attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_class_attendance_date ON public.class_attendance(date);
CREATE INDEX IF NOT EXISTS idx_class_attendance_user_id ON public.class_attendance(user_id);
