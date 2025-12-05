'use server';

import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { extractTextFromFile } from '@/lib/file-processing';
import { GeneratedQuestion } from '@/types/questions';
import { Database } from '@/types/database';

function cleanJson(text: string) {
  // Remove markdown code blocks like ```json ... ```
  const clean = text.replace(/```json/g, '').replace(/```/g, '');
  return clean.trim();
}

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

import { GoogleGenerativeAI } from '@google/generative-ai';

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
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      throw new Error('Missing GEMINI_API_KEY');
    }

    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const modelTier = data.model_tier || 'fast';
    const modelName = modelTier === 'quality' ? 'gemini-2.5-pro' : 'gemini-2.5-flash';
    const model = genAI.getGenerativeModel({ model: modelName });

    const prompt = `
        Você é um especialista em avaliação educacional brasileira (ENEM/Vestibular).
        Sua tarefa é criar um array JSON de questões baseadas no conteúdo fornecido.

        REGRAS ESTRUTURAIS ESTRITAS (JSON):
        Para cada tipo de questão, siga OBRIGATORIAMENTE esta estrutura de objetos:

        1. TIPO: "multiple_choice"
           - "options": Array de 5 strings (A, B, C, D, E).
           - "correct_answer": O índice numérico da correta (0 a 4).

        2. TIPO: "true_false"
           - "options": Array de EXATAMENTE 5 afirmações.
           - "correct_answer": Uma string com a sequência de V e F (ex: "V-F-V-V-F").

        3. TIPO: "sum" (Somatória)
           - "options": Array de 4 a 7 proposições (Texto apenas).
           - "correct_answer": A SOMA numérica dos valores das proposições corretas.
           - REGRA MATEMÁTICA: Considere que a 1ª opção vale 01, a 2ª vale 02, a 3ª vale 04, a 4ª vale 08, etc.
           - CRÍTICO: A soma das corretas NÃO PODE EXCEDER 99. Selecione proposições corretas de modo que a soma fique <= 99.

        4. TIPO: "association" (Associação de Colunas)
           - "options": Array de strings (Coluna da Esquerda/Parênteses).
           - "content": { "column_b": ["Item A", "Item B", "Item C", "Item D", "Item E"] } (Coluna da Direita).
           - "correct_answer": A sequência de letras que preenche a Coluna da Esquerda (ex: "C-A-B-E-D").

        5. TIPO: "essay" (Redação)
           - "stem": O Tema da redação.
           - "content": {
               "genre": "Gênero textual (Dissertação, Carta, Crônica...)",
               "support_texts": ["Texto motivador 1...", "Texto motivador 2..."]
             }
           - "options": null
           - "correct_answer": Uma redação modelo nota 10, escrita em português perfeito, seguindo os critérios de correção.
           - "correction_criteria": Array de strings com competências avaliativas.

        6. TIPO: "open_ended" (Discursiva)
           - "stem": A pergunta aberta.
           - "options": null
           - "correct_answer": Um gabarito/modelo de resposta ideal.
           - "correction_criteria": Array de strings com pontos chave que o aluno deve citar.

        FORMATO DE SAÍDA (Array JSON Puro):
        [
          {
            "stem": "Texto do enunciado...",
            "type": "tipo_da_questao",
            "options": [...],
            "content": { ...extras como column_b ou support_texts... },
            "correct_answer": "...",
            "correction_criteria": [...],
            "explanation": "Explicação pedagógica do gabarito.",
            "bncc": "Código BNCC",
            "difficulty": "medium" | "hard" | "easy",
            "discipline": "${discipline}",
            "subject": "${subject}"
          }
        ]

        PARÂMETROS:
        - Quantidade: ${quantity} questões
        - Tipos Solicitados: ${types.join(', ')}
        - REGRA DE DISTRIBUIÇÃO: Se apenas um tipo foi solicitado, gere todas as questões desse tipo. Se múltiplos tipos foram solicitados, você DEVE gerar pelo menos UMA questão de CADA tipo solicitado.
        - Estilo: ${style}
        - Disciplina/Assunto: ${discipline || 'Geral'} / ${subject || 'Geral'}
        - Nível: ${grade_level || 'Geral'}

        Conteúdo Base para Geração:
        "${combinedContent || 'Nenhum conteúdo textual identificado. Gere com base no Assunto/Disciplina informados.'}"
        
        Retorne APENAS o JSON válido, sem markdown ou explicações extras.
      `;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
      },
    });

    const response = result.response;
    const text = response.text();
    let generatedQuestions: GeneratedQuestion[];

    try {
      generatedQuestions = JSON.parse(cleanJson(text));
    } catch {
      console.error('Failed to parse Gemini response:', text);
      return { success: false, error: 'Erro ao processar resposta da IA.' };
    }

    // Calculate Cost
    const tier = data.model_tier || 'fast';
    const multiplier = tier === 'quality' ? 2 : 1;
    const quantityNum = quantity || 0;
    // Ensure floating point precision is handled (round to 2 decimals)
    const estimatedCost = Math.round(0.1 * quantityNum * multiplier * 100) / 100;

    // Deduct Credits
    if (estimatedCost > 0) {
      const { data: deductionSuccess, error: deductionError } = await supabase.rpc(
        'deduct_user_credits',
        {
          p_user_id: user.id,
          p_amount: estimatedCost,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any
      );

      if (deductionError || !deductionSuccess) {
        console.error('Credit deduction failed:', deductionError);
        // We log the error but return the questions since they were already generated.
        // In a stricter system, we might want to fail the request or handle this differently.
      } else {
        // Log Usage
        const usage = result.response.usageMetadata || {
          promptTokenCount: 0,
          candidatesTokenCount: 0,
        };

        const USD_TO_BRL = 6.0;
        // Gemini Flash (Per 1M Tokens)
        const FLASH_INPUT_COST = 0.075;
        const FLASH_OUTPUT_COST = 0.3;
        // Gemini Pro (Per 1M Tokens)
        const PRO_INPUT_COST = 1.25;
        const PRO_OUTPUT_COST = 5.0;

        let rateInput = 0;
        let rateOutput = 0;

        if (modelName.includes('flash')) {
          rateInput = FLASH_INPUT_COST;
          rateOutput = FLASH_OUTPUT_COST;
        } else if (modelName.includes('pro')) {
          rateInput = PRO_INPUT_COST;
          rateOutput = PRO_OUTPUT_COST;
        }

        const inputTokens = usage.promptTokenCount || 0;
        const outputTokens = usage.candidatesTokenCount || 0;

        const inputCost = (inputTokens / 1_000_000) * rateInput;
        const outputCost = (outputTokens / 1_000_000) * rateOutput;
        const totalUsd = inputCost + outputCost;
        const providerCostBrl = totalUsd * USD_TO_BRL;

        await supabase.from('ia_cost_log').insert({
          user_id: user.id,
          feature: 'generate_questions_v2',
          model_used: modelName,
          input_tokens: inputTokens,
          output_tokens: outputTokens,
          cost_credits: estimatedCost,
          provider_cost_brl: providerCostBrl,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any);
      }
    }

    return { success: true, questions: generatedQuestions };
  } catch (error) {
    console.error('Unexpected Error:', error);
    return {
      success: false,
      error: 'Erro inesperado ao gerar questões.',
    };
  }
}

// Helper to format options based on question type
// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    (q) => {
      // Base content mapping
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let dbContent: any = {
        stem: q.stem,
        support_texts: q.support_texts || undefined,
      };

      // Handle Essay specific fields
      if (q.type === 'essay') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const rawGenre = (q.content as any)?.genre || (q as any).genre;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const rawSupportTexts =
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (q.content as any)?.support_texts || q.support_texts || (q as any).support_texts;

        const genre = typeof rawGenre === 'string' ? rawGenre : 'Gênero não especificado';

        const support_texts = Array.isArray(rawSupportTexts)
          ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
            rawSupportTexts.map((t: any) => (typeof t === 'string' ? t : JSON.stringify(t)))
          : [];

        dbContent = {
          ...dbContent,
          genre,
          support_texts,
        };
      }

      // Handle Association specific fields
      if (q.type === 'association') {
        dbContent = {
          ...dbContent,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          column_b: (q.content as any)?.column_b || (q as any).column_b,
        };
      }

      return {
        user_id: user.id,
        content: dbContent, // Pass as object
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
      };
    }
  );

  const { data, error } = await supabase
    .from('questions')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

const GenerateExamFromDbSchema = z.object({
  discipline: z.string().min(1, 'Selecione uma matéria.'),
  subject: z.string().optional(),
  quantity: z.number().min(1).max(50),
  excludeTypes: z.array(z.string()).optional(),
});

export async function generateExamFromDatabaseAction(
  input: z.infer<typeof GenerateExamFromDbSchema>
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: 'Unauthorized' };

  const validation = GenerateExamFromDbSchema.safeParse(input);
  if (!validation.success) {
    return { success: false, error: validation.error.errors[0].message };
  }

  const { discipline, subject, quantity, excludeTypes } = validation.data;
  const COST = 0.2;

  // 1. Check and Deduct Credits first
  const { data: deductionSuccess, error: deductionError } = await supabase.rpc(
    'deduct_user_credits',
    {
      p_user_id: user.id,
      p_amount: COST,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any
  );

  if (deductionError || !deductionSuccess) {
    console.error('Credit deduction failed:', deductionError);
    return { success: false, error: 'Créditos insuficientes para gerar a prova.' };
  }

  // 2. Fetch Questions
  let queryBuilder = supabase
    .from('questions')
    .select('*')
    .eq('user_id', user.id)
    .eq('discipline', discipline);

  if (subject) {
    queryBuilder = queryBuilder.ilike('subject', `%${subject}%`);
  }

  if (excludeTypes && excludeTypes.length > 0) {
    queryBuilder = queryBuilder.not(
      'type',
      'in',
      `(${excludeTypes.map((t) => `"${t}"`).join(',')})`
    );
  }

  const { data: questions, error: fetchError } = await queryBuilder;

  if (fetchError) {
    console.error('Error fetching questions:', fetchError);
    return { success: false, error: 'Erro ao buscar questões no banco de dados.' };
  }

  if (!questions || questions.length === 0) {
    return { success: false, error: 'Nenhuma questão encontrada para os critérios selecionados.' };
  }

  // 3. Random Selection
  const shuffled = questions.sort(() => 0.5 - Math.random());
  const selectedQuestions = shuffled.slice(0, quantity);

  // 4. Log Usage
  await supabase.from('ia_cost_log').insert({
    user_id: user.id,
    feature: 'generate_exam_db',
    model_used: 'db_selection',
    input_tokens: 0,
    output_tokens: 0,
    cost_credits: COST,
    provider_cost_brl: 0,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any);

  return { success: true, questions: selectedQuestions };
}
