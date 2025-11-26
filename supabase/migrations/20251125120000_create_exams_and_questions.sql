-- Create Enums
CREATE TYPE difficulty_level AS ENUM ('easy', 'medium', 'hard');
CREATE TYPE exam_status AS ENUM ('draft', 'published');

-- Create Questions Table
CREATE TABLE questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID REFERENCES auth.users(id) NOT NULL,
    topic TEXT NOT NULL,
    difficulty difficulty_level NOT NULL,
    content JSONB NOT NULL, -- { stem: "...", options: ["A", "B", "C", "D"] }
    correct_answer TEXT NOT NULL, -- Index or value of the correct option
    bncc_code TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Exams Table
CREATE TABLE exams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID REFERENCES auth.users(id) NOT NULL,
    title TEXT NOT NULL,
    status exam_status DEFAULT 'draft',
    questions_list JSONB NOT NULL DEFAULT '[]'::jsonb, -- Snapshot of questions
    answer_key JSONB NOT NULL DEFAULT '{}'::jsonb, -- { "1": "B", "2": "A" }
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Questions
CREATE POLICY "Teachers can view their own questions"
    ON questions FOR SELECT
    USING (auth.uid() = teacher_id);

CREATE POLICY "Teachers can insert their own questions"
    ON questions FOR INSERT
    WITH CHECK (auth.uid() = teacher_id);

CREATE POLICY "Teachers can update their own questions"
    ON questions FOR UPDATE
    USING (auth.uid() = teacher_id);

CREATE POLICY "Teachers can delete their own questions"
    ON questions FOR DELETE
    USING (auth.uid() = teacher_id);

-- RLS Policies for Exams
CREATE POLICY "Teachers can view their own exams"
    ON exams FOR SELECT
    USING (auth.uid() = teacher_id);

CREATE POLICY "Teachers can insert their own exams"
    ON exams FOR INSERT
    WITH CHECK (auth.uid() = teacher_id);

CREATE POLICY "Teachers can update their own exams"
    ON exams FOR UPDATE
    USING (auth.uid() = teacher_id);

CREATE POLICY "Teachers can delete their own exams"
    ON exams FOR DELETE
    USING (auth.uid() = teacher_id);

-- Indexes for performance
CREATE INDEX idx_questions_teacher_id ON questions(teacher_id);
CREATE INDEX idx_exams_teacher_id ON exams(teacher_id);
