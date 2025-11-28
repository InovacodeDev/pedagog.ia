'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export interface ClassItem {
  id: string;
  name: string;
  user_id: string;
  created_at: string;
  students: { count: number }[];
}

export async function getClassesAction() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const { data, error } = await (supabase as any)
    .from('classes')
    .select('*, students(count)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching classes:', error);
    throw new Error('Failed to fetch classes');
  }

  return data as unknown as ClassItem[];
}

export async function getClassAction(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const { data, error } = await (supabase as any)
    .from('classes')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (error) {
    console.error('Error fetching class:', error);
    return null;
  }

  return data as ClassItem;
}

export async function createClassAction(name: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: 'Unauthorized' };
  }

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const { error } = await (supabase as any).from('classes').insert({
    name,
    user_id: user.id,
  });

  if (error) {
    console.error('Error creating class:', error);
    return { success: false, message: 'Failed to create class' };
  }

  revalidatePath('/classes');
  return { success: true, message: 'Turma criada com sucesso!' };
}

export async function updateClassAction(id: string, name: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: 'Unauthorized' };
  }

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const { error } = await (supabase as any)
    .from('classes')
    .update({ name })
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    console.error('Error updating class:', error);
    return { success: false, message: 'Failed to update class' };
  }

  revalidatePath('/classes');
  return { success: true, message: 'Turma atualizada com sucesso!' };
}

export async function deleteClassAction(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: 'Unauthorized' };
  }

  // Check for students
  const { count, error: countError } = await supabase
    .from('students')
    .select('*', { count: 'exact', head: true })
    .eq('class_id', id);

  if (countError) {
    console.error('Error checking students:', countError);
    return { success: false, message: 'Failed to check class status' };
  }

  if (count && count > 0) {
    return { success: false, message: 'A turma possui alunos. Remova-os antes de excluir.' };
  }

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const { error } = await (supabase as any)
    .from('classes')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    console.error('Error deleting class:', error);
    return { success: false, message: 'Failed to delete class' };
  }

  revalidatePath('/classes');
  return { success: true, message: 'Turma excluída com sucesso!' };
}
