'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { BackgroundJobInsert, ExamInsert, ExamRow } from '@/types/app';

// =====================================================
// VALIDATION SCHEMAS
// =====================================================

const UploadExamSchema = z.object({
  file: z
    .instanceof(File)
    .refine(
      (file) => file.size <= 10 * 1024 * 1024, // 10MB max
      'File size must be less than 10MB'
    )
    .refine(
      (file) => ['image/jpeg', 'image/png', 'image/webp'].includes(file.type),
      'File must be an image (JPEG, PNG, or WebP)'
    ),
});

// =====================================================
// TYPES
// =====================================================

interface UploadExamResult {
  success: boolean;
  jobId?: string;
  error?: string;
}

// =====================================================
// ACTIONS
// =====================================================

/**
 * Upload an exam image and create a background job for OCR processing.
 *
 * Flow:
 * 1. Validate user authentication
 * 2. Upload image to Supabase Storage
 * 3. Create background_job record (triggers Edge Function via database trigger)
 * 4. Return job ID for real-time monitoring
 */
export async function uploadExamAction(formData: FormData): Promise<UploadExamResult> {
  try {
    // 1. Get authenticated user
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Usuário não autenticado' };
    }

    // 2. Validate form data
    const file = formData.get('exam_image') as File;
    const examId = formData.get('exam_id') as string | null;

    if (!file) {
      return { success: false, error: 'Nenhum arquivo foi enviado' };
    }

    const validation = UploadExamSchema.safeParse({ file });

    if (!validation.success) {
      return {
        success: false,
        error: validation.error.errors[0]?.message || 'Arquivo inválido',
      };
    }

    // 3. Upload to Supabase Storage
    const fileName = `${user.id}/${Date.now()}-${file.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('exams')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('[Upload Exam] Storage error:', uploadError);
      return { success: false, error: 'Erro ao fazer upload da imagem' };
    }

    // 4. Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from('exams').getPublicUrl(uploadData.path);

    // 5. Create background job (this triggers the Edge Function via database trigger)
    const jobPayload: BackgroundJobInsert = {
      user_id: user.id,
      job_type: 'ocr_correction',
      payload: {
        image_url: publicUrl,
        file_name: file.name,
        uploaded_at: new Date().toISOString(),
        exam_id: examId || undefined,
      },
      status: 'pending',
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: jobData, error } = (await supabase
      .from('background_jobs')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .insert(jobPayload as any)
      .select('id')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .single()) as any;

    if (error) {
      console.error('[Upload Exam] Job creation error:', error);

      // Clean up uploaded file
      await supabase.storage.from('exams').remove([uploadData.path]);

      return { success: false, error: 'Erro ao criar tarefa de processamento' };
    }

    // 6. Revalidate the exams page
    revalidatePath('/dashboard/exams');

    return {
      success: true,
      jobId: jobData.id,
    };
  } catch (error) {
    console.error('[Upload Exam] Unexpected error:', error);
    return {
      success: false,
      error: 'Erro inesperado ao processar upload',
    };
  }
}

/**
 * Get all jobs for the current user
 */
export async function getUserJobsAction(): Promise<{
  success: boolean;
  jobs?: import('@/types/database').Database['public']['Tables']['background_jobs']['Row'][];
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Usuário não autenticado' };
    }

    const { data: jobs, error: jobsError } = await supabase
      .from('background_jobs')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (jobsError) {
      console.error('[Get Jobs] Error:', jobsError);
      return { success: false, error: 'Erro ao buscar tarefas' };
    }

    return { success: true, jobs: jobs || [] };
  } catch (error) {
    console.error('[Get Jobs] Unexpected error:', error);
    return { success: false, error: 'Erro inesperado' };
  }
}

/**
 * Get all exams for the current user
 */
export async function getExamsAction() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: 'Unauthorized' };

  const { data: exams, error } = await supabase
    .from('exams')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) return { success: false, error: error.message };

  return { success: true, exams };
}

/**
 * Duplicate an exam
 */
export async function duplicateExamAction(examId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: 'Unauthorized' };

  // 1. Fetch original exam

  const { data: originalExam, error } = await supabase
    .from('exams')
    .select('*')
    .eq('id', examId)
    .single();

  if (error || !originalExam) {
    return { success: false, error: 'Exam not found' };
  }

  const exam = originalExam as unknown as ExamRow; // 2. Create new exam record
  const newExamData: ExamInsert = {
    user_id: user.id,
    title: `Cópia de ${exam.title}`,
    description: exam.description,
    status: 'draft',
    questions_list: exam.questions_list, // Copy JSONB questions directly
    correction_count: 0, // Reset correction count
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: newExam, error: createError } = await supabase
    .from('exams')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .insert(newExamData as any)
    .select()
    .single();

  if (createError) return { success: false, error: createError.message };

  revalidatePath('/exams');
  return { success: true, exam: newExam };
}

/**
 * Delete an exam
 */
export async function deleteExamAction(examId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: 'Unauthorized' };

  const { error } = await supabase.from('exams').delete().eq('id', examId).eq('user_id', user.id);

  if (error) return { success: false, error: error.message };

  revalidatePath('/exams');
  return { success: true };
}
