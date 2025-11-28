'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const saveExamSchema = z.object({
  examId: z.string().uuid(),
  // We accept any JSON array for blocks as strict typing of the complex block structure
  // is handled by the frontend and stored as JSONB
  blocks: z.array(z.any()),
  title: z.string().optional(),
  class_ids: z.array(z.string().uuid()).optional(),
});

export async function saveExamAction(input: z.infer<typeof saveExamSchema>) {
  const result = saveExamSchema.safeParse(input);

  if (!result.success) {
    return { error: 'Dados inválidos para salvar a prova.' };
  }

  const { examId, blocks, title, class_ids } = result.data;
  const supabase = await createClient();

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Usuário não autenticado.' };
  }

  // Prepare data for Upsert
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const examData: any = {
    id: examId,
    user_id: user.id,
    questions_list: blocks,
    updated_at: new Date().toISOString(),
    // Default status for new exams
    status: 'draft',
    title: title || 'Nova Prova',
  };

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const { error: upsertError } = await (supabase as any)
    .from('exams')
    .upsert(examData)
    .select()
    .single();

  if (upsertError) {
    console.error('Error saving exam:', upsertError);
    return { error: 'Erro ao salvar a prova no banco de dados.' };
  }

  // Handle Class Links (Sync)
  if (class_ids !== undefined) {
    // 1. Delete existing links
    const { error: deleteError } = await (supabase as any)
      .from('exam_classes')
      .delete()
      .eq('exam_id', examId);

    if (deleteError) {
      console.error('Error deleting exam classes:', deleteError);
      return { error: 'Erro ao atualizar vínculos de turmas.' };
    }

    // 2. Insert new links
    if (class_ids.length > 0) {
      const { error: insertError } = await (supabase as any).from('exam_classes').insert(
        class_ids.map((classId) => ({
          exam_id: examId,
          class_id: classId,
        }))
      );

      if (insertError) {
        console.error('Error inserting exam classes:', insertError);
        return { error: 'Erro ao vincular turmas.' };
      }
    }
  }

  revalidatePath(`/exams/${examId}`);
  revalidatePath('/exams');

  return { success: true };
}
