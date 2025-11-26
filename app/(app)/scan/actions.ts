'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { z } from 'zod';

const generateQuestionsSchema = z.object({
  topic: z.string().min(3),
  quantity: z.number().min(1).max(20),
  difficulty: z.enum(['easy', 'medium', 'hard']),
});

export async function generateQuestionsAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  const data = {
    topic: formData.get('topic'),
    quantity: Number(formData.get('quantity')),
    difficulty: formData.get('difficulty'),
  };

  const validated = generateQuestionsSchema.parse(data);

  const { data: job, error } = (await supabase
    .from('background_jobs')
    .insert({
      user_id: user.id,
      job_type: 'generate_questions',
      payload: validated,
      status: 'pending',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)
    .select('id')
    .single()) as unknown as { data: { id: string } | null; error: unknown };

  if (error || !job) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    throw new Error((error as any)?.message || 'Failed to create job');
  }

  return { jobId: job.id };
}

interface Question {
  stem: string;
  options: string[];
  correct_answer: string;
}

interface ExamData {
  title: string;
  questions: Question[];
}

export async function saveExamAction(examData: ExamData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  // Transform questions array to answer_key map
  const answerKey = examData.questions.reduce(
    (acc: Record<string, string>, q: Question, index: number) => {
      acc[index + 1] = q.correct_answer; // Assuming correct_answer is "1", "2", etc. or "A", "B"
      return acc;
    },
    {}
  );

  const { data: exam, error } = (await supabase
    .from('exams')
    .insert({
      teacher_id: user.id,
      title: examData.title,
      status: 'published', // Or draft
      questions_list: examData.questions,
      answer_key: answerKey,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)
    .select('id')
    .single()) as unknown as { data: { id: string } | null; error: unknown };

  if (error || !exam) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    throw new Error((error as any)?.message || 'Failed to create exam');
  }

  redirect(`/scan/${exam.id}`);
}
