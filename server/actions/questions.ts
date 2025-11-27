'use server';

import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { geminiModel } from '@/lib/gemini';

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

export async function generateQuestionsV2Action(data: z.infer<typeof GenerateQuestionsSchema>) {
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

  try {
    const prompt = `
      Você é um especialista em educação e avaliação. Sua tarefa é criar questões de alta qualidade baseadas no conteúdo fornecido.
      
      Detalhes da solicitação:
      - Quantidade: ${quantity} questões
      - Tipos permitidos: ${types.join(', ')}
      - Estilo: ${style}
      - Disciplina: ${discipline}
      - Assunto: ${subject}
      - Nível: ${grade_level}

      Instruções Obrigatórias:
      1. Retorne APENAS um array JSON válido. Não use markdown (como \`\`\`json), não inclua texto antes ou depois.
      2. O JSON deve seguir estritamente este formato para cada questão:
         {
           "stem": "Enunciado da questão...",
           "options": ["Alternativa A", "Alternativa B", "Alternativa C", "Alternativa D", "Alternativa E"], // Apenas para múltipla escolha. Para dissertativa, use null ou array vazio.
           "correct_answer": "Índice da resposta correta (0-4) para múltipla escolha, ou o texto da resposta esperada para dissertativa.",
           "type": "multiple_choice" | "essay" | "true_false", // Use um dos tipos solicitados
           "bncc": "Código da habilidade BNCC relacionada (ex: EM13LGG102)",
           "explanation": "Explicação detalhada de por que a resposta está correta.",
           "discipline": "${discipline}",
           "subject": "${subject}"
         }
      3. Se houver arquivos anexados, use o conteúdo deles como base principal. Se houver texto e arquivos, combine as informações.
      4. Certifique-se de que as questões sejam desafiadoras e adequadas ao nível solicitado.

      Conteúdo de Texto (se houver):
      ${content || 'Nenhum texto fornecido, baseie-se nos arquivos.'}
    `;

    const parts: { text?: string; inlineData?: { mimeType: string; data: string } }[] = [
      { text: prompt },
    ];

    if (files && files.length > 0) {
      files.forEach((file) => {
        // file.content is a data URL: "data:application/pdf;base64,JVBERi..."
        // We need to extract the mime type and the base64 data
        const matches = file.content.match(/^data:(.+);base64,(.+)$/);
        if (matches) {
          const mimeType = matches[1];
          const data = matches[2];
          parts.push({
            inlineData: {
              mimeType,
              data,
            },
          });
        }
      });
    }

    const result = await geminiModel.generateContent(parts);
    const response = await result.response;
    const text = response.text();

    // Clean up the response if it contains markdown code blocks
    const cleanedText = text
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    const questions = JSON.parse(cleanedText);

    return { success: true, questions };
  } catch (error) {
    console.error('Gemini Generation Error:', error);
    return {
      success: false,
      error: 'Erro ao gerar questões com IA. Tente novamente ou verifique os arquivos.',
    };
  }
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
