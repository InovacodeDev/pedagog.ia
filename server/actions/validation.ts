'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { BackgroundJobRow, ExamGradeInsert } from '@/types/app';
import { Database } from '@/types/database';

// Schema for saving grades
const SaveGradeSchema = z.object({
  job_id: z.string().uuid(),
  student_id: z.string().uuid().optional(),
  final_score: z.number().min(0).max(10),
  answers: z.array(
    z.object({
      question: z.number(),
      score: z.number(),
      correct: z.boolean(),
      confidence: z.number().optional(),
    })
  ),
});

// ...

export async function getJobForValidation(jobId: string) {
  const supabase = await createClient();

  const { data: job, error } = await supabase
    .from('background_jobs')
    .select('*')
    .eq('id', jobId)
    .single();

  if (error || !job) {
    throw new Error('Job not found');
  }

  // ...

  // Ensure job is completed and has result
  const jobRow = job as BackgroundJobRow;
  if (jobRow.status !== 'completed' || !jobRow.result) {
    throw new Error('Job is not ready for validation');
  }

  return job;
}

export async function saveExamGradeAction(data: z.infer<typeof SaveGradeSchema>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }

  const validation = SaveGradeSchema.safeParse(data);

  if (!validation.success) {
    return { success: false, error: 'Invalid data' };
  }

  const { job_id, student_id, final_score, answers } = validation.data;

  // ...

  const gradePayload: ExamGradeInsert = {
    job_id,
    student_id: student_id || null, // Handle optional student_id
    final_score,
    answers: answers as unknown as Database['public']['Tables']['exam_grades']['Insert']['answers'], // Explicit cast to match Json type
    verified_at: new Date().toISOString(),
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await supabase.from('exam_grades').insert(gradePayload as any);

  if (error) {
    console.error('Error saving grade:', error);
    return { success: false, error: 'Failed to save grade' };
  }

  revalidatePath('/exams');
  return { success: true };
}
