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
});

export async function saveExamAction(input: z.infer<typeof saveExamSchema>) {
  const result = saveExamSchema.safeParse(input);

  if (!result.success) {
    return { error: 'Dados inválidos para salvar a prova.' };
  }

  const { examId, blocks, title } = result.data;
  const supabase = await createClient();

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Usuário não autenticado.' };
  }

  // Update the exam
  const updateData: { questions_list: any[]; title?: string; updated_at: string } = {
    questions_list: blocks,
    updated_at: new Date().toISOString(),
  };

  if (title) {
    updateData.title = title;
  }

  const { error } = await supabase
    .from('exams')
    // @ts-ignore
    .update(updateData)
    .eq('id', examId)
    .eq('user_id', user.id); // Ensure user owns the exam

  if (error) {
    console.error('Error saving exam:', error);
    return { error: 'Erro ao salvar a prova no banco de dados.' };
  }

  revalidatePath(`/exams/${examId}`);
  revalidatePath('/exams');

  return { success: true };
}
