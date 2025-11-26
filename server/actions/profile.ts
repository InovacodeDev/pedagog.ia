'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const profileSchema = z.object({
  name: z.string().min(2, {
    message: 'Nome deve ter pelo menos 2 caracteres.',
  }),
});

export async function updateProfileAction(formData: FormData) {
  const supabase = await createClient();

  const rawData = {
    name: formData.get('name'),
  };

  const validatedFields = profileSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      success: false,
      message: 'Dados inválidos. Verifique os campos e tente novamente.',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { name } = validatedFields.data;

  try {
    const { error } = await supabase.auth.updateUser({
      data: { full_name: name },
    });

    if (error) {
      console.error('Error updating profile:', error);
      return { success: false, message: 'Erro ao atualizar perfil.' };
    }

    revalidatePath('/settings');
    return { success: true, message: 'Perfil atualizado!' };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { success: false, message: 'Ocorreu um erro inesperado.' };
  }
}
