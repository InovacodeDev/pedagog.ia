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

  // Transform exam_classes to array of IDs
  // Transform exam_classes to array of IDs
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const classIds = (exam as any).exam_classes
    ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ((exam as any).exam_classes as any[]).map((ec: any) => ec.class_id)
    : [];

  return {
    success: true,
    exam: {
      ...(exam as any),
      class_ids: classIds,
    },
  };
}
