'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function updateSchoolPeriodAction(period: string) {
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    data: { school_period: period },
  });

  if (error) {
    console.error('Error updating school period:', error);
    return { success: false, message: 'Erro ao atualizar período.' };
  }

  revalidatePath('/settings');
  return { success: true, message: 'Período atualizado com sucesso.' };
}

export async function resetClassesAction() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: 'Usuário não autenticado.' };
  }

  try {
    // 1. Fetch Data for Snapshot
    const { data: classes } = await supabase.from('classes').select('*').eq('user_id', user.id);
    const { data: students } = await supabase.from('students').select('*').eq('user_id', user.id);
    const { data: exams } = await supabase.from('exams').select('*').eq('user_id', user.id);

    // Fetch results linked to user's exams
    const { data: results } = await supabase
      .from('exam_results')
      .select('*, exams!inner(user_id)')
      .eq('exams.user_id', user.id);

    // Fetch exam_classes junction
    const { data: examClasses } = await supabase
      .from('exam_classes')
      .select('*, exams!inner(user_id)')
      .eq('exams.user_id', user.id);

    const snapshot = {
      classes: classes || [],
      students: students || [],
      exams: exams || [],
      results: results || [],
      examClasses: examClasses || [],
      timestamp: new Date().toISOString(),
      school_period: user.user_metadata?.school_period || 'bimestre',
    };

    // 2. Save Snapshot
    const { error: histError } = await supabase.from('class_histories').insert({
      user_id: user.id,
      snapshot_data: snapshot,
      description: `Período Letivo encerrado em ${new Date().toLocaleDateString('pt-BR')}`,
    });

    if (histError) {
      console.error('Snapshot error', histError);
      return { success: false, message: 'Erro ao salvar histórico.' };
    }

    // 3. Delete Data
    // Delete classes (Users can delete their own classes)
    const { error: classError } = await supabase.from('classes').delete().eq('user_id', user.id);
    if (classError) {
      console.error('Class delete error', classError);
      return { success: false, message: 'Erro ao deletar turmas.' };
    }

    // Delete exams (Users can delete their own exams)
    // This will cascade delete exam_results and exam_classes
    const { error: examError } = await supabase.from('exams').delete().eq('user_id', user.id);
    if (examError) {
      console.error('Exam delete error', examError);
      return { success: false, message: 'Erro ao deletar avaliações.' };
    }

    revalidatePath('/', 'layout');
    return { success: true, message: 'Turmas zeradas e histórico salvo com sucesso.' };
  } catch (error) {
    console.error('Unexpected error in resetClassesAction:', error);
    return { success: false, message: 'Ocorreu um erro inesperado.' };
  }
}
