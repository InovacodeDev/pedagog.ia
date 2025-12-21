'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { CreateSecureStudentParams } from '@/types/app';

// =====================================================
// VALIDATION SCHEMAS
// =====================================================

const CreateStudentSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  class_id: z.string().uuid('Turma inválida'),
});

// =====================================================
// TYPES
// =====================================================

interface CreateStudentResult {
  success: boolean;
  studentId?: string;
  error?: string;
}

interface GetStudentsResult {
  success: boolean;
  students?: Array<{
    id: string;
    name: string | null;
    grade_level: string | null;
    created_at: string | null;
    class_id: string | null;
  }>;
  error?: string;
}

// =====================================================
// ACTIONS
// =====================================================

export async function createStudentAction(data: {
  name: string;
  class_id: string;
}): Promise<CreateStudentResult> {
  try {
    // 1. Validate input
    const validation = CreateStudentSchema.safeParse(data);

    if (!validation.success) {
      return {
        success: false,
        error: validation.error.issues[0]?.message || 'Dados inválidos',
      };
    }

    // 2. Get authenticated user
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Usuário não autenticado' };
    }

    // 3. Call the secure RPC function to create the initial record
    const encryptionKey = process.env.APP_ENCRYPTION_KEY;
    if (!encryptionKey) {
      console.error('SERVER CONFIG ERROR: APP_ENCRYPTION_KEY is missing');
      return { success: false, error: 'Erro de configuração do servidor' };
    }

    const rpcParams: CreateSecureStudentParams = {
      name_text: validation.data.name,
      class_id_arg: validation.data.class_id,
      secret_key: encryptionKey,
    };

    const { data: studentId, error: rpcError } = await supabase.rpc(
      'create_secure_student',
      rpcParams
    );

    if (rpcError) {
      console.error('[Create Student] RPC error:', rpcError);
      if (rpcError.message.includes('institution')) {
        return { success: false, error: 'Usuário não possui instituição associada' };
      }
      return { success: false, error: 'Erro ao criar aluno (Encryption)' };
    }

    // 4. Update the record with plaintext name (user_id and class_id are already set by RPC)
    // This is where we enforce the unique constraint (user_id, name)
    const { error: updateError } = await supabase
      .from('students')
      .update({
        name: validation.data.name,
      })
      .eq('id', studentId);

    if (updateError) {
      console.error('[Create Student] Update error:', updateError);

      // Rollback: Delete the created student if update fails
      await supabase.from('students').delete().eq('id', studentId);

      if (updateError.code === '23505') {
        return { success: false, error: 'Já existe um aluno com este nome.' };
      }

      return { success: false, error: 'Erro ao vincular aluno à turma.' };
    }

    revalidatePath('/students');
    revalidatePath(`/classes/${validation.data.class_id}`);
    return {
      success: true,
      studentId: studentId as string,
    };
  } catch (error) {
    console.error('[Create Student] Unexpected error:', error);
    return {
      success: false,
      error: 'Erro inesperado ao criar aluno',
    };
  }
}

export async function updateStudentAction(id: string, data: { class_id: string }) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('students')
    .update({ class_id: data.class_id })
    .eq('id', id);

  if (error) {
    console.error('Error updating student:', error);
    return { success: false, message: 'Failed to update student' };
  }

  revalidatePath('/students');
  return { success: true, message: 'Aluno atualizado com sucesso!' };
}

export async function getStudentsAction(classId?: string): Promise<GetStudentsResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Usuário não autenticado' };
    }

    // Fetch students directly now that we have plaintext name and user_id/class_id
    // We prioritize the plaintext 'name' column.
    let query = supabase
      .from('students')
      .select('id, name, grade_level, created_at, class_id')
      .eq('user_id', user.id) // Only fetch students for this teacher
      .order('created_at', { ascending: false });

    if (classId) {
      query = query.eq('class_id', classId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[Get Students] Error:', error);
      return { success: false, error: 'Erro ao buscar alunos' };
    }

    return {
      success: true,
      students: data || [],
    };
  } catch (error) {
    console.error('[Get Students] Unexpected error:', error);
    return {
      success: false,
      error: 'Erro inesperado ao buscar alunos',
    };
  }
}

export async function deleteStudentAction(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: 'Unauthorized' };
  }

  const { error } = await supabase
    .from('students')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    console.error('Error deleting student:', error);
    return { success: false, message: 'Failed to delete student' };
  }

  revalidatePath('/students');
  return { success: true, message: 'Aluno removido com sucesso!' };
}
