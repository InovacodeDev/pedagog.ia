'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const ManualGradesSchema = z.object({
  classId: z.string().uuid(),
  title: z.string().min(2, 'O título deve ter pelo menos 2 caracteres'),
  discipline: z.string().min(2, 'A disciplina deve ter pelo menos 2 caracteres'),
  term: z.string(),
  grades: z.array(z.object({
    studentId: z.string().uuid(),
    score: z.number().min(0).max(10),
  })),
});

export type ManualGradesInput = z.infer<typeof ManualGradesSchema>;

/**
 * Saves manual grades for a class.
 * Creates a "manual" exam record and links it to students' results.
 */
export async function saveManualGradesAction(data: ManualGradesInput) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Usuário não autenticado' };
    }

    const validation = ManualGradesSchema.safeParse(data);
    if (!validation.success) {
      return { success: false, error: validation.error.issues[0].message };
    }

    const { classId, title, discipline, term, grades } = validation.data;

    // 1. Create a "manual" exam record
    const { data: exam, error: examError } = await (supabase as unknown as { 
      from: (t: string) => { 
        insert: (d: unknown) => { 
          select: (s: string) => { 
            single: () => Promise<{ data: { id: string } | null; error: unknown }> 
          } 
        } 
      } 
    })
      .from('exams')
      .insert({
        title,
        discipline,
        term,
        user_id: user.id,
        status: 'published',
        questions_list: [], // No questions for manual exams
        answer_key: {},
        correction_count: grades.length,
      })
      .select('id')
      .single();

    if (examError || !exam) {
      console.error('[Save Manual Grades] Exam creation error:', examError);
      return { success: false, error: 'Erro ao criar registro da avaliação' };
    }

    // 2. Link exam to class
    const { error: linkError } = await (supabase as unknown as { 
      from: (t: string) => { 
        insert: (d: unknown) => Promise<{ error: unknown }> 
      } 
    })
      .from('exam_classes')
      .insert({
        exam_id: exam.id,
        class_id: classId,
      });

    if (linkError) {
      console.error('[Save Manual Grades] Linking error:', linkError);
      return { success: false, error: 'Erro ao vincular avaliação à turma' };
    }

    // 3. Insert results
    const resultsData = grades.map(g => ({
      exam_id: exam.id,
      student_id: g.studentId,
      score: g.score,
    }));

    const { error: resultsError } = await (supabase as unknown as { 
      from: (t: string) => { 
        insert: (d: unknown) => Promise<{ error: unknown }> 
      } 
    })
      .from('exam_results')
      .insert(resultsData);


    if (resultsError) {
      console.error('[Save Manual Grades] Results error:', resultsError);
      return { success: false, error: 'Erro ao salvar notas dos alunos' };
    }

    revalidatePath(`/classes/${classId}`);
    return { success: true };
  } catch (error) {
    console.error('[Save Manual Grades] Unexpected error:', error);
    return { success: false, error: 'Erro inesperado ao salvar notas' };
  }
}
