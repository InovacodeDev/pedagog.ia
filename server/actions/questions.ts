'use server';

import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { extractTextFromFile } from '@/lib/file-processing';
import { GeneratedQuestion } from '@/types/questions';
import { Database } from '@/types/database';
import { GoogleGenerativeAI } from '@google/generative-ai';

// ==========================================
// CONSTANTS & SCHEMAS
// ==========================================

const GenerateQuestionsSchema = z
  .object({
    content: z.string().optional(), // Now ignored logic-wise, just for form compatibility
    quantity: z.number().min(1).max(10),
    types: z.array(z.string()).min(1, 'Selecione pelo menos um tipo de questão.'),
    style: z.string().min(1, 'Selecione um estilo.'),
    discipline: z.string().min(1, 'Selecione uma matéria.'),
    subject: z.string().min(1, 'Informe o assunto.'),
    grade_level: z.string().optional().or(z.literal('')),
    subtypes: z.record(z.string(), z.string()).optional(),
    style_subtype: z.string().optional(),
    files: z
      .array(
        z.object({
          name: z.string(),
          type: z.string(),
          content: z.string(), // base64
        })
      )
      .min(1, 'Você deve adicionar pelo menos um arquivo de contexto.'),
  })
  .superRefine((data) => {
    // files are already checked by min(1) above
    if (data.types.includes('essay') && data.style === 'high_school' && !data.subtypes?.essay) {
      // Optional: enforce subtype for High School Essays if needed
    }
  });

const GenerateExamFromDbSchema = z.object({
  discipline: z.string().min(1, 'Selecione uma matéria.'),
  subject: z.string().optional(),
  quantity: z.number().min(1).max(50),
  excludeTypes: z.array(z.string()).optional(),
});

// ==========================================
// UTILS
// ==========================================

function cleanJson(text: string) {
  // Remove markdown code blocks like ```json ... ```
  const clean = text.replace(/```json/g, '').replace(/```/g, '');
  return clean.trim();
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

// ==========================================
// PROMPT ENGINE (Logic Extraction)
// ==========================================

function getGradeContext(style: string, grade_level?: string | null): string {
  switch (style) {
    case 'enem':
      return 'NÍVEL: Ensino Médio Completo (Matriz de Referência ENEM).';
    case 'entrance_exam':
      return 'NÍVEL: Pré-Vestibular / Alta Performance.';
    case 'civil_service':
      return 'NÍVEL: Concurso Público / Seleção Profissional.';
    case 'high_school':
      return `NÍVEL DE ENSINO: ${grade_level || 'Geral'} (BNCC).`;
    default:
      return 'NÍVEL: Geral / Adaptativo.';
  }
}

function getContextInstruction(style: string, grade_level?: string | null): string {
  switch (style) {
    case 'enem':
      return `MODO ENEM ATIVO:
        - Priorize a contextualização e situações-problema.
        - As questões devem cobrar COMPETÊNCIAS e HABILIDADES, não apenas memorização.
        - Para Humanas/Linguagens: Textos base são obrigatórios.
        - Para Exatas: Aplicação prática do conceito.`;
    case 'entrance_exam':
      return `MODO VESTIBULAR ATIVO (Padrão FUVEST/UNICAMP):
        - Elevado rigor conceitual e profundidade teórica.
        - Evite trivialidades. O foco é selecionar a elite acadêmica.
        - Questões devem exigir análise crítica e correlação de conceitos.`;
    case 'civil_service':
      return `MODO CONCURSO PÚBLICO ATIVO (Padrão Cebraspe/FGV):
        - Linguagem técnica, impessoal e direta.
        - Se for Direito/Legislação: Foco na letra da lei e jurisprudência consolidada.
        - Se for Português: Foco em gramática normativa e interpretação textual técnica.
        - Evite ambiguidades. O gabarito deve ser incontestável.`;
    case 'high_school':
      return `MODO COLÉGIO: Aja como professor titular. Respeite estritamente a BNCC para a série ${grade_level}.`;
    default:
      return 'Gere questões didáticas e claras sobre o tema.';
  }
}

function getBancaInstruction(style: string, style_subtype?: string | null): string {
  if (!style_subtype) return '';

  if (style === 'entrance_exam') {
    switch (style_subtype) {
      case 'fuvest':
        return 'BANCA FUVEST: Exige precisão conceitual absoluta. Linguagem culta e acadêmica. Em Humanas, cobre autores clássicos. Em Exatas, questões com múltiplas etapas de resolução.';
      case 'unicamp':
        return 'BANCA UNICAMP: Foco em interpretação de fenômenos e gráficos. Valorize a capacidade de relacionar conceitos de áreas diferentes (Interdisciplinaridade).';
      case 'ufsc':
        return 'BANCA UFSC: Estilo conteudista com foco em detalhes específicos. Em Humanas, valorize o contexto de Santa Catarina. Dificuldade: Alta. SE O TIPO FOR SOMATÓRIA, ATENTE-SE AOS VALORES.';
      case 'ufrgs':
        return 'BANCA UFRGS: Estilo clássico e conteudista. Exige conhecimento enciclopédico. Em Literatura, foco estrito nas leituras obrigatórias. Em Humanas, cronologia e fatos históricos precisos.';
      case 'acafe':
        return 'BANCA ACAFE: Foco em seleção para Medicina. Questões de Biologia e Química com profundidade técnica elevada. Enunciados diretos e alternativas com distratores bem elaborados.';
      case 'ita_ime':
        return 'BANCA ITA/IME: Nível EXTREMO. Questões devem desafiar até alunos olímpicos. Use conceitos avançados e cálculos complexos. Distratores devem ser erros conceituais sutis.';
      case 'vunesp':
        return 'BANCA VUNESP: Enunciados diretos e objetivos. Em Humanas, textos de apoio curtos e perguntas conteudistas.';
      case 'puc_mackenzie':
        return 'BANCA PARTICULAR (PUC/MACK): Foco no conteúdo programático do Ensino Médio, com nível médio-alto de dificuldade.';
    }
  }

  if (style === 'civil_service') {
    switch (style_subtype) {
      case 'cebraspe':
        return "BANCA CEBRASPE: Foco total em interpretação de texto e 'pegadinhas' semânticas. Uma palavra muda o sentido da questão. SE O TIPO FOR CERTO/ERRADO, A ASSERTIVA DEVE SER CATEGÓRICA.";
      case 'fgv':
        return 'BANCA FGV: Use textos longos e casos práticos/hipotéticos. A resposta exige aplicação do conhecimento a uma situação nova, não apenas memória.';
      case 'fcc':
        return 'BANCA FCC: Foco na literalidade (lei seca/conceito puro). Questões diretas e objetivas.';
      case 'vunesp_concursos':
        return 'BANCA VUNESP (CONCURSOS): Contextualização moderada, foco na letra da lei e súmulas (para Direito) ou gramática normativa (Português).';
      case 'cesgranrio':
        return 'BANCA CESGRANRIO: Questões de nível médio, bem distribuídas. Textos de apoio relevantes.';
    }
  }

  return '';
}

function getFormattingInstruction(style_subtype?: string | null): string {
  let instruction = '';

  // 1. Handling Option Counts (4 vs 5)
  if (['unicamp', 'acafe', 'puc_mackenzie'].includes(style_subtype || '')) {
    instruction +=
      '\n   - REGRA DE ALTERNATIVAS: Para questões de Múltipla Escolha, gere EXATAMENTE 4 opções (A, B, C, D). Não gere a opção E.';
  } else {
    // Default is usually 5 for ENEM, FUVEST, etc.
    instruction +=
      '\n   - REGRA DE ALTERNATIVAS: Para questões de Múltipla Escolha, gere 5 opções (A, B, C, D, E), exceto se especificado diferente.';
  }

  // 2. Handling UFSC Summation
  if (style_subtype === 'ufsc') {
    instruction += `
   - REGRA SOMATÓRIA (UFSC):
     1. As proposições devem ser afirmações factuais independentes.
     2. Os valores devem ser potências de 2 (01, 02, 04, 08, 16, 32).
     3. A soma correta deve ser um número entre 01 e 99.
     4. Evite somas óbvias. Crie distratores plausíveis nas proposições falsas.`;
  }

  // 3. Handling CEBRASPE (Certo/Errado)
  if (style_subtype === 'cebraspe') {
    instruction += `
   - REGRA CERTO/ERRADO (CEBRASPE):
     1. Se o tipo for 'true_false', o enunciado deve ser uma afirmação assertiva.
     2. A "opção" deve ser uma análise de julgamento (Certo ou Errado).`;
  }

  return instruction;
}

function getSpecificInstructions(subtypes?: Record<string, string> | null): string {
  if (!subtypes) return '';
  let specificInstructions = '';

  Object.entries(subtypes).forEach(([type, subtypeValue]) => {
    const subtypeUpper = (subtypeValue as string).toUpperCase();
    specificInstructions += `\n   - PARA QUESTÕES DO TIPO '${type.toUpperCase()}': Adote estritamente o formato '${subtypeUpper}'.`;

    // Inject specific structural rules based on the subtypeValue
    if (type === 'multiple_choice') {
      if (subtypeValue === 'assertion_reason') {
        specificInstructions +=
          " (Estrutura: O enunciado deve apresentar duas afirmações conectadas pela palavra PORQUE. As opções devem ser: 'As duas são verdadeiras e a segunda justifica a primeira', 'As duas são verdadeiras mas...', etc).";
      }
      if (subtypeValue === 'negative_focus') {
        specificInstructions +=
          " (O enunciado DEVE destacar em CAIXA ALTA termos como 'INCORRETO', 'EXCETO', 'NÃO').";
      }
      if (subtypeValue === 'interpretation') {
        specificInstructions +=
          ' (Obrigatório fornecer um texto/imagem base extraído dos arquivos).';
      }
    }

    if (type === 'true_false') {
      if (subtypeValue === 'grouped') {
        specificInstructions +=
          " (O enunciado apresenta afirmações I, II, III. As opções de resposta devem ser: 'Apenas I está correta', 'I e II estão corretas', etc).";
      }
    }

    if (type === 'open_ended') {
      if (subtypeValue === 'analytical') {
        specificInstructions +=
          ' (A questão deve exigir o uso de conectivos lógicos ("Portanto", "Contudo") na resposta esperada).';
      }
      if (subtypeValue === 'calculation') {
        specificInstructions +=
          ' (O gabarito deve conter o passo-a-passo do cálculo, não apenas o resultado).';
      }
    }

    if (type === 'essay') {
      if (subtypeValue === 'dissertativo_argumentativo') {
        specificInstructions += ' (Estrutura rígida de introdução, desenvolvimento e conclusão).';
      }
    }
  });

  return specificInstructions;
}

/**
 * Builds the final system prompt for the AI
 */
function buildSystemPrompt(params: {
  style: string;
  style_subtype?: string | null;
  grade_level?: string | null;
  discipline: string;
  subject: string;
  types: string[];
  subtypes?: Record<string, string> | null;
  quantity: number;
  combinedContent: string;
}): string {
  const {
    style,
    style_subtype,
    grade_level,
    discipline,
    subject,
    types,
    subtypes,
    quantity,
    combinedContent,
  } = params;

  const gradeContext = getGradeContext(style, grade_level);
  const contextInstruction = getContextInstruction(style, grade_level);
  const bancaInstruction = getBancaInstruction(style, style_subtype);
  const formattingInstruction = getFormattingInstruction(style_subtype);
  const specificInstructions = getSpecificInstructions(subtypes);

  return `
        ATUE COMO: Especialista Sênior em Avaliação Educacional (INEP/Bancas).
        OBJETIVO: Criar questões de "Excelência Acadêmica" (Nota Máxima) baseadas EXCLUSIVAMENTE nos arquivos fornecidos.

        REGRAS DE OURO (MEC/BNCC):
        1. FIDELIDADE: Não invente informações. Use apenas os textos/dados dos arquivos anexos.
        2. PLAUSIBILIDADE: As alternativas incorretas (distratores) devem fazer sentido superficialmente, exigindo raciocínio do aluno para descartá-las.
        3. CONTEXTUALIZAÇÃO: Nenhuma questão deve ser "seca". Sempre forneça um micro-texto ou situação problema baseada nos arquivos.

        CONFIGURAÇÃO ATUAL:
        - Estilo: ${style} (Siga rigorosamente o manual de estilo desta banca).
        - Banca/Instituição: ${style_subtype || 'Padrão'}
        - ${gradeContext}

        DIRETRIZES DA BANCA (PERSONA):
        ${bancaInstruction || 'Siga o padrão geral para este nível de ensino.'}

        DIRETRIZES TÉCNICAS E DE FORMATAÇÃO:
        ${formattingInstruction}

        DIRETRIZES DE FORMATO POR TIPO:${specificInstructions || ' Padrão livre.'}

        - Contexto Pedagógico: ${contextInstruction}
        - Disciplina: ${discipline}
        - Assunto: ${subject}

        REGRAS ESTRUTURAIS ESTRITAS (JSON):
        Atenção: O campo "type" no JSON de saída deve ser EXATAMENTE um dos tipos solicitados (${types.join(
          ', '
        )}).
        PRIORIDADE MÁXIMA: Se a Diretriz da Banca sugerir um formato (ex: Somatória) mas o usuário solicitou outro (ex: Múltipla Escolha), VOCÊ DEVE OBEDECER O TIPO SOLICITADO PELO USUÁRIO. O formato da questão prevalece sobre o estilo da banca.

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
               "subtype": "Gênero textual (Dissertação, Carta, Crônica...)",
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

        ESPECIFICIDADES POR TIPO:
        ESPECIFICIDADES POR TIPO:
        - Se REDAÇÃO (${subtypes?.essay || 'Livre'}): Forneça textos motivadores (extraídos dos arquivos) e critérios de correção detalhados (ex: Competências 1-5 para ENEM se aplicável, ou critérios do gênero).
        - Se MÚLTIPLA ESCOLHA: O gabarito deve ser incontestável.
        
        Conteúdo Base para Geração (USAR EXCLUSIVAMENTE):
        "${combinedContent || 'ERRO CRÍTICO: Nenhum conteúdo extraído. Aborte.'}"
        
        Retorne APENAS o JSON válido, sem markdown ou explicações extras.
      `;
}

// ==========================================
// USAGE & COST LOGIC
// ==========================================

/**
 * Calculates estimated costs, deducts credits, and logs usage
 */
async function calculateAndLogCost(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  user: any,
  input: {
    modelName: string;
    modelTier: string;
    quantity: number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    usageMetadata: any;
    feature: string;
  }
) {
  const { modelName, modelTier, quantity, usageMetadata, feature } = input;

  // 1. Calculate Estimated Cost (Credits)
  const multiplier = modelTier === 'quality' ? 2 : 1;
  const quantityNum = quantity || 0;
  // Ensure floating point precision is handled (round to 2 decimals)
  const estimatedCreditsCost = Math.round(0.5 * quantityNum * multiplier * 100) / 100;

  // 2. Deduct Credits
  if (estimatedCreditsCost > 0) {
    const { data: deductionSuccess, error: deductionError } = await supabase.rpc(
      'deduct_user_credits',
      {
        p_user_id: user.id,
        p_amount: estimatedCreditsCost,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any
    );

    if (deductionError || !deductionSuccess) {
      console.error('Credit deduction failed:', deductionError);
      // We log the error but do not throw, as generation already succeeded
      return;
    }
  }

  // 3. Log System Usage (BRL Cost)
  const usage = usageMetadata || { promptTokenCount: 0, candidatesTokenCount: 0 };
  const USD_TO_BRL = 6.0;

  // Pricing (Per 1M Tokens)
  const FLASH_INPUT_COST = 0.075;
  const FLASH_OUTPUT_COST = 0.3;
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
    feature: feature,
    model_used: modelName,
    input_tokens: inputTokens,
    output_tokens: outputTokens,
    cost_credits: estimatedCreditsCost,
    provider_cost_brl: providerCostBrl,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any);
}

// ==========================================
// MAIN ACTIONS
// ==========================================

export async function generateQuestionsV2Action(
  data: z.infer<typeof GenerateQuestionsSchema> & { model_tier?: 'fast' | 'quality' }
) {
  // 1. Auth & Validation
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: 'Unauthorized' };

  const validation = GenerateQuestionsSchema.safeParse(data);
  if (!validation.success) {
    return { success: false, error: validation.error.issues[0].message };
  }

  const {
    quantity,
    types,
    style,
    discipline,
    subject,
    grade_level,
    subtypes,
    files,
    style_subtype,
  } = validation.data;

  // 2. Process Files
  let combinedContent = '';
  if (files && files.length > 0) {
    const fileTexts = await Promise.all(
      files.map(async (file) => {
        let mimeType = file.type;
        if (!mimeType && file.content.startsWith('data:')) {
          const matches = file.content.match(/^data:(.+);base64,/);
          if (matches) mimeType = matches[1];
        }
        if (mimeType.startsWith('image/')) return ''; // Skip images for text extraction

        const text = await extractTextFromFile(file.content, mimeType);
        return text ? `\n--- Conteúdo do arquivo ${file.name} ---\n${text}` : '';
      })
    );
    combinedContent += fileTexts.join('\n');
  }

  try {
    // 3. Initialize AI
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) throw new Error('Missing GEMINI_API_KEY');

    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const modelTier = data.model_tier || 'fast';
    const modelName = modelTier === 'quality' ? 'gemini-2.5-pro' : 'gemini-2.5-flash';
    const model = genAI.getGenerativeModel({ model: modelName });

    // 4. Build Prompt
    const prompt = buildSystemPrompt({
      style,
      style_subtype,
      grade_level,
      discipline,
      subject,
      types,
      subtypes,
      quantity,
      combinedContent,
    });

    // 5. Call AI
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json' },
    });

    // 6. Parse Response
    const responseText = result.response.text();
    let generatedQuestions: GeneratedQuestion[];

    try {
      generatedQuestions = JSON.parse(cleanJson(responseText));
    } catch {
      console.error('Failed to parse Gemini response:', responseText);
      return { success: false, error: 'Erro ao processar resposta da IA.' };
    }

    // 7. Costs & Logs
    await calculateAndLogCost(supabase, user, {
      modelName,
      modelTier,
      quantity,
      usageMetadata: result.response.usageMetadata,
      feature: 'generate_questions_v2',
    });

    return { success: true, questions: generatedQuestions };
  } catch (error) {
    console.error('Unexpected Error:', error);
    return { success: false, error: 'Erro inesperado ao gerar questões.' };
  }
}

export async function saveQuestionsAction(questions: GeneratedQuestion[]) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: 'Unauthorized' };

  const questionsToInsert: Database['public']['Tables']['questions']['Insert'][] = questions.map(
    (q) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let dbContent: any = {
        stem: q.stem,
        support_texts: q.support_texts || undefined,
      };

      // Essay handling
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

        dbContent = { ...dbContent, genre, support_texts };
      }

      // Association handling
      if (q.type === 'association') {
        dbContent = {
          ...dbContent,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          column_b: (q.content as any)?.column_b || (q as any).column_b,
        };
      }

      return {
        user_id: user.id,
        content: dbContent,
        options: formatOptionsByType(q.type, q.options || undefined),
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
    return { success: false, error: validation.error.issues[0].message };
  }

  const { discipline, subject, quantity, excludeTypes } = validation.data;

  // 1. Fetch Questions
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

  // 2. Random Selection (No cost for DB generation now)
  const shuffled = questions.sort(() => 0.5 - Math.random());
  const selectedQuestions = shuffled.slice(0, quantity);

  // 3. Log Usage (Zero Cost)
  await calculateAndLogCost(supabase, user, {
    modelName: 'db_selection',
    modelTier: 'fast', // doesn't matter for cost 0
    quantity: 0, // 0 cost
    usageMetadata: null, // No tokens
    feature: 'generate_exam_db',
  });

  return { success: true, questions: selectedQuestions };
}
