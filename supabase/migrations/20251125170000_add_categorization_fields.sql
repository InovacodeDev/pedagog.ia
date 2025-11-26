-- Add categorization fields to questions table
ALTER TABLE questions
ADD COLUMN discipline text,
ADD COLUMN subject text;

-- Create indexes for fast filtering
CREATE INDEX idx_questions_discipline ON questions(discipline);
CREATE INDEX idx_questions_subject ON questions(subject);

-- Add categorization fields to exams table
ALTER TABLE exams
ADD COLUMN discipline text,
ADD COLUMN grade_level text;
