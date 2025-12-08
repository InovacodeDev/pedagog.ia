'use server';

import { createClient } from '@/lib/supabase/server';

export async function getExamAction(examId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: 'Unauthorized' };

  const { data: exam, error } = await supabase
    .from('exams')
    .select('*, exam_classes(class_id)')
    .eq('id', examId)
    .single();

  if (error) {
    console.error('Error fetching exam:', error);
    return { success: false, error: 'Erro ao buscar a prova.' };
  }

  const classIds = exam.exam_classes
    ? exam.exam_classes.map((ec) => ec.class_id)
    : [];

  return {
    success: true,
    exam: {
      ...exam,
      class_ids: classIds,
    },
  };
}
