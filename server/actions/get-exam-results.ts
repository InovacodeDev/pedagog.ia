'use server';

import { createClient } from '@/lib/supabase/server';

interface StudentResult {
  student_id: string;
  student_name: string;
  score: number | null;
  type: 'manual' | 'ai';
  verified_at: string | null;
}

export async function getExamResultsAction(examId: string): Promise<{
  success: boolean;
  results?: StudentResult[];
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Usuário não autenticado' };
    }

    // 1. Fetch results from exam_results (manual)
    const { data: manualResults, error: manualError } = await supabase
      .from('exam_results')
      .select('student_id, score, created_at, students(name)')
      .eq('exam_id', examId);

    if (manualError) {
      console.error('[Get Exam Results] Manual error:', manualError);
    }

    // 2. Fetch results from exam_grades (AI)
    const { data: aiResults, error: aiError } = await supabase
      .from('exam_grades')
      .select('student_id, final_score, verified_at, students(name)')
      .eq('exam_id', examId);

    if (aiError) {
      console.error('[Get Exam Results] AI error:', aiError);
    }

    // 3. Combine and format
    const combinedResults: StudentResult[] = [];

    manualResults?.forEach((r) => {
      combinedResults.push({
        student_id: r.student_id || '',
        student_name: (r.students as unknown as { name: string })?.name || 'Desconhecido',
        score: r.score ? Number(r.score) : null,
        type: 'manual',
        verified_at: r.created_at,
      });
    });

    aiResults?.forEach((r) => {
      combinedResults.push({
        student_id: r.student_id || '',
        student_name: (r.students as unknown as { name: string })?.name || 'Desconhecido',
        score: r.final_score ? Number(r.final_score) : null,
        type: 'ai',
        verified_at: r.verified_at,
      });
    });

    // Sort by name
    combinedResults.sort((a, b) => a.student_name.localeCompare(b.student_name));

    return { success: true, results: combinedResults };
  } catch (error) {
    console.error('[Get Exam Results] Unexpected error:', error);
    return { success: false, error: 'Erro inesperado ao buscar resultados' };
  }
}
