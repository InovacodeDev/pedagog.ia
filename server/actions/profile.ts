'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const profileSchema = z.object({
  name: z.string().min(2, {
    message: 'Nome deve ter pelo menos 2 caracteres.',
  }),
  school_name: z.string().optional(),
  disciplines: z.string().optional(), // Received as comma-separated string
});

export async function updateProfileAction(formData: FormData) {
  const supabase = await createClient();

  const rawData = {
    name: formData.get('name'),
    school_name: formData.get('school_name'),
    disciplines: formData.get('disciplines'),
  };

  const validatedFields = profileSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      success: false,
      message: 'Dados inválidos. Verifique os campos e tente novamente.',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { name, school_name, disciplines } = validatedFields.data;

  // Convert comma-separated string to array
  const disciplinesArray = disciplines
    ? disciplines
        .split(',')
        .map((d) => d.trim())
        .filter(Boolean)
    : [];

  try {
    const { error } = await supabase.auth.updateUser({
      data: {
        full_name: name,
        school_name: school_name,
        disciplines: disciplinesArray,
      },
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
