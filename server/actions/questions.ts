'use server';

import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { TablesInsert, Json, Database } from '@/types/database';
import { SupabaseClient } from '@supabase/supabase-js';

const GenerateQuestionsSchema = z.object({
  content: z.string().min(50, 'O texto base deve ter pelo menos 50 caracteres.'),
  quantity: z.number().min(1).max(10),
  types: z.array(z.string()).min(1, 'Selecione pelo menos um tipo de questão.'),
  style: z.string().min(1, 'Selecione um estilo.'),
  discipline: z.string().min(1, 'Selecione uma matéria.'),
  subject: z.string().min(1, 'Informe o assunto.'),
  grade_level: z.string().min(1, 'Selecione o ano/série.'),
  files: z
    .array(
      z.object({
        name: z.string(),
        type: z.string(),
        content: z.string(), // base64
      })
    )
    .optional(),
});

export async function generateQuestionsV2Action(data: z.infer<typeof GenerateQuestionsSchema>) {
  const supabase = (await createClient()) as unknown as SupabaseClient<Database, 'public'>;
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: 'Unauthorized' };

  const validation = GenerateQuestionsSchema.safeParse(data);
  if (!validation.success) {
    return { success: false, error: validation.error.errors[0].message };
  }

  // Create background job
  const jobPayload: TablesInsert<'background_jobs'> = {
    user_id: user.id,
    job_type: 'generate_questions_v2',
    payload: data as unknown as Json, // Cast to Json compatible type
    status: 'pending',
  };

  const { data: job, error } = await supabase
    .from('background_jobs')
    .insert(jobPayload)
    .select()
    .single();

  if (error) return { success: false, error: error.message };

  return { success: true, jobId: job.id };
}

export async function getQuestionsAction() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: 'Unauthorized' };

  const { data: questions, error } = await supabase
    .from('questions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) return { success: false, error: error.message };

  return { success: true, questions };
}

export async function searchQuestionsAction(filters: {
  query?: string;
  discipline?: string;
  subject?: string;
  type?: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: 'Unauthorized' };

  let queryBuilder = supabase
    .from('questions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (filters.query) {
    queryBuilder = queryBuilder.ilike('stem', `%${filters.query}%`);
  }

  if (filters.discipline && filters.discipline !== 'all') {
    queryBuilder = queryBuilder.eq('discipline', filters.discipline);
  }

  if (filters.subject) {
    queryBuilder = queryBuilder.ilike('subject', `%${filters.subject}%`);
  }

  if (filters.type && filters.type !== 'all') {
    queryBuilder = queryBuilder.eq('type', filters.type);
  }

  const { data: questions, error } = await queryBuilder;

  if (error) return { success: false, error: error.message };

  return { success: true, questions };
}
