'use server';

import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { extractTextFromFile } from '@/lib/file-processing';
import { GeneratedQuestion } from '@/types/questions';
import { Database } from '@/types/database';

const GenerateQuestionsSchema = z
  .object({
    content: z.string().optional(),
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
  })
  .superRefine((data, ctx) => {
    const hasContent = data.content && data.content.length >= 50;
    const hasFiles = data.files && data.files.length > 0;

    if (!hasContent && !hasFiles) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Você deve fornecer um texto base (mín. 50 caracteres) ou adicionar arquivos.',
        path: ['content'],
      });
    }
  });

export async function generateQuestionsV2Action(
  data: z.infer<typeof GenerateQuestionsSchema> & { model_tier?: 'fast' | 'quality' }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: 'Unauthorized' };

  const validation = GenerateQuestionsSchema.safeParse(data);
  if (!validation.success) {
    return { success: false, error: validation.error.errors[0].message };
  }

  const { content, quantity, types, style, discipline, subject, grade_level, files } =
    validation.data;

  let combinedContent = content || '';

  if (files && files.length > 0) {
    const fileTexts = await Promise.all(
      files.map(async (file) => {
        // Extract mime type from base64 string if not provided in file.type
        let mimeType = file.type;
        if (!mimeType && file.content.startsWith('data:')) {
          const matches = file.content.match(/^data:(.+);base64,/);
          if (matches) mimeType = matches[1];
        }

        // Skip images
        if (mimeType.startsWith('image/')) {
          return '';
        }

        const text = await extractTextFromFile(file.content, mimeType);
        return text ? `\n--- Conteúdo do arquivo ${file.name} ---\n${text}` : '';
      })
    );
    combinedContent += fileTexts.join('\n');
  }

  try {
    // Create background job
    const { data: jobData, error } = await supabase
      .from('background_jobs')
      .insert({
        user_id: user.id,
        job_type: 'generate_questions_v2',
        payload: {
          content: combinedContent,
          quantity,
          types,
          style,
          discipline,
          subject,
          grade_level,
          model_tier: data.model_tier || 'fast',
        },
        status: 'pending',
      } as any)
      .select('id')
      .single();

    const job = jobData as { id: string } | null;

    if (error || !job) {
      console.error('Job Creation Error:', error);
      return { success: false, error: 'Erro ao criar tarefa de geração.' };
    }

    return { success: true, jobId: job.id };
  } catch (error) {
    console.error('Unexpected Error:', error);
    return {
      success: false,
      error: 'Erro inesperado ao iniciar geração.',
    };
  }
}

// Helper to format options based on question type
function formatOptionsByType(type: string, options: string[] | undefined): any {
  if (!options) return null;

  if (type === 'sum') {
    return options.map((text, index) => ({
      value: Math.pow(2, index),
      text: text,
    }));
  }

  if (type === 'association') {
    // For now, keep as string array, or implement specific pair logic if needed
    return options;
  }

  // Default for multiple_choice, true_false, etc.
  return options;
}

export async function saveQuestionsAction(questions: GeneratedQuestion[]) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: 'Unauthorized' };

  const questionsToInsert: Database['public']['Tables']['questions']['Insert'][] = questions.map(
    (q) => ({
      user_id: user.id,
      content: {
        stem: q.stem,
        support_texts: q.support_texts || undefined,
      }, // Pass as object
      options: formatOptionsByType(q.type, q.options || undefined), // Pass as object/array
      correct_answer: q.correct_answer || '',
      type: q.type,
      bncc: q.bncc || null,
      explanation: q.explanation || null,
      discipline: q.discipline || null,
      subject: q.subject || null,
      topic: q.subject || '',
      difficulty: (q.difficulty as Database['public']['Enums']['difficulty_level']) || 'medium',
      style: q.style || null,
      structured_data: q.correction_criteria
        ? { correction_criteria: q.correction_criteria }
        : null,
    })
  );

  const { data, error } = await supabase
    .from('questions')
    .insert(questionsToInsert as any)
    .select();

  if (error) {
    console.error('Error saving questions:', error);
    return { success: false, error: error.message };
  }

  return { success: true, data };
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
