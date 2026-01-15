// @ts-nocheck
// =====================================================
// PEDAGOGI.AI EDGE FUNCTION: Process Job
// Runtime: Deno
// Purpose: Async processing pipeline for OCR and Exam Generation
// =====================================================

import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { encodeBase64 } from '@std/encoding/base64';

// Type Definitions
interface JobPayload {
  job_id: string;
}

interface BackgroundJob {
  id: string;
  user_id: string;
  job_type:
    | 'ocr_correction'
    | 'exam_generation'
    | 'weekly_report'
    | 'generate_questions'
    | 'generate_questions_v2';
  payload: {
    image_url?: string;
    exam_id?: string;
    topic?: string;
    quantity?: number;
    difficulty?: 'easy' | 'medium' | 'hard';
    model_tier?: 'fast' | 'quality';
    exam_exists?: boolean;
    [key: string]: unknown;
  };
  status: string;
}

interface OCRResult {
  total_questions: number;
  confidence: number;
  answers: Array<{
    question: number;
    score: number;
    correct: boolean;
    confidence: number;
  }>;
  suggested_score: number;
  exam_id?: string;
}

interface Question {
  stem: string;
  options: string[];
  correct_answer: string;
  difficulty: string;
}

// =====================================================
// HELPERS
// =====================================================

function cleanJson(text: string) {
  // Remove markdown code blocks like ```json ... ```
  let clean = text.replace(/```json/g, '').replace(/```/g, '');
  return clean.trim();
}

/**
 * PRIVACY & SECURITY: PII Scrubbing
 * Removes sensitive data before sending to AI Providers.
 * Compliance with LGPD/GDPR.
 *
 * - Masks Emails
 * - Masks CPF (Brazilian ID)
 * - Masks Phone Numbers
 * - Masks RG (Brazilian ID)
 */
function scrubPII(text: string): string {
  if (!text) return '';

  // 1. Emails
  let scrubbed = text.replace(
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    '[EMAIL_REDACTED]'
  );

  // 2. CPFs (Brazil) - Simple pattern xxx.xxx.xxx-xx
  // Uses word boundaries to avoid breaking math expressions or versions
  scrubbed = scrubbed.replace(/\b\d{3}\.\d{3}\.\d{3}-\d{2}\b/g, '[CPF_REDACTED]');

  // 3. Phone Numbers (Brazil) - (xx) 9xxxx-xxxx or (xx) xxxx-xxxx
  scrubbed = scrubbed.replace(/\(\d{2}\)\s?(?:9|)?\d{4}-\d{4}/g, '[PHONE_REDACTED]');

  // 4. RG (Simple approximation) - xx.xxx.xxx-x
  scrubbed = scrubbed.replace(/\b\d{2}\.\d{3}\.\d{3}-[\d|X|x]\b/g, '[RG_REDACTED]');

  return scrubbed;
}

// =====================================================
// PRICING LOGIC
// =====================================================

const USD_TO_BRL = 6.0;

// Gemini Flash (Per 1M Tokens)
const FLASH_INPUT_COST = 0.075;
const FLASH_OUTPUT_COST = 0.3;

// Gemini Pro (Per 1M Tokens)
const PRO_INPUT_COST = 1.25;
const PRO_OUTPUT_COST = 5.0;

function calculateProviderCost(model: string, inputTokens: number, outputTokens: number): number {
  let rateInput = 0;
  let rateOutput = 0;

  if (model.includes('flash')) {
    rateInput = FLASH_INPUT_COST;
    rateOutput = FLASH_OUTPUT_COST;
  } else if (model.includes('pro')) {
    rateInput = PRO_INPUT_COST;
    rateOutput = PRO_OUTPUT_COST;
  }

  const inputCost = (inputTokens / 1_000_000) * rateInput;
  const outputCost = (outputTokens / 1_000_000) * rateOutput;
  const totalUsd = inputCost + outputCost;

  return totalUsd * USD_TO_BRL;
}

function calculateCost(job: BackgroundJob): { cost: number; model: string } {
  const tier = (job.payload.model_tier as 'fast' | 'quality') || 'fast';
  const multiplier = tier === 'quality' ? 2 : 1;

  // Map 'quality' to pro and 'fast' to flash
  const model = tier === 'quality' ? 'gemini-1.5-pro' : 'gemini-1.5-flash';

  let baseCost = 0;

  if (job.job_type === 'generate_questions_v2') {
    const quantity = (job.payload.quantity as number) || 0;
    baseCost = 0.1 * quantity;
  } else if (job.job_type === 'ocr_correction') {
    baseCost = job.payload.exam_exists ? 0.5 : 1.0;
  }

  // Ensure floating point precision is handled (round to 2 decimals)
  const totalCost = Math.round(baseCost * multiplier * 100) / 100;

  return { cost: totalCost, model };
}

// =====================================================
// AI PIPELINE (Gemini)
// =====================================================

function getGeminiModel(modelName: string = 'gemini-1.5-flash') {
  const apiKey = Deno.env.get('GEMINI_API_KEY');
  if (!apiKey) throw new Error('Missing GEMINI_API_KEY');
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({ model: modelName });
}

/**
 * Vision Pipeline - OCR & Correction
 * Uses Gemini to analyze exam images and grade them against an answer key.
 */
async function runVisionPipeline(
  imageUrl: string,
  examId?: string,
  supabase?: any,
  model: string = 'gemini-1.5-flash'
): Promise<OCRResult> {
  console.log(`[Vision Pipeline] Processing image: ${imageUrl} with model: ${model}`);

  const gemini = getGeminiModel(model);
  let answerKeyInstructions = '';

  if (examId && supabase) {
    console.log(`[Vision Pipeline] Fetching Answer Key for Exam ID: ${examId}`);
    const { data: exam, error } = await supabase
      .from('exams')
      .select('answer_key')
      .eq('id', examId)
      .single();

    if (!error && exam?.answer_key) {
      answerKeyInstructions = `
        Here is the official Answer Key for grading:
        ${JSON.stringify(exam.answer_key)}

        Please compare the student's selected answers in the image against this key.
        - If the student selected the correct option, score = 1.0, correct = true.
        - If incorrect, score = 0.0, correct = false.
      `;
    }
  }

  const prompt = `
    You are an expert OCR and Exam Grading AI.
    Your task is to analyze the image of a student's exam or answer sheet.

    Identify the questions and the option selected by the student.

    ${answerKeyInstructions}

    If no answer key is provided, identify the selected answer and set score=0, correct=false (unless you can determine correctness from context marks like ticks/crosses).

    Return a valid JSON object matching this structure:
    {
      "total_questions": number,
      "confidence": number (0-1),
      "answers": [
        {
          "question": number (index 1-based),
          "score": number,
          "correct": boolean,
          "confidence": number (0-1)
        }
      ],
      "suggested_score": number
    }

    Return ONLY valid JSON. Do not use Markdown code blocks.
  `;

  // Fetch image content
  const imageResp = await fetch(imageUrl);
  if (!imageResp.ok) throw new Error(`Failed to fetch image: ${imageResp.statusText}`);
  const imageBuffer = await imageResp.arrayBuffer();

  // Convert buffer to base64
  const base64Image = btoa(
    new Uint8Array(imageBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
  );

  const result = await gemini.generateContent([
    prompt,
    {
      inlineData: {
        data: base64Image,
        mimeType: imageResp.headers.get('content-type') || 'image/jpeg',
      },
    },
  ]);

  const text = result.response.text();

  let ocrResult: OCRResult;
  try {
    ocrResult = JSON.parse(cleanJson(text));
  } catch (e) {
    console.error('Failed to parse Gemini response:', text);
    throw new Error('Invalid JSON response from AI');
  }

  ocrResult.exam_id = examId;
  return ocrResult;
}

/**
 * Question Generator - Uses Gemini to generate questions
 */
async function runQuestionGenerator(
  topic: string,
  quantity: number,
  difficulty: string,
  model: string = 'gemini-1.5-flash'
): Promise<Question[]> {
  console.log(
    `[Question Generator] Generating ${quantity} ${difficulty} questions about ${topic} with model: ${model}`
  );

  const gemini = getGeminiModel(model);

  const prompt = `
    You are an expert educational content generator.
    Generate ${quantity} multiple-choice questions about "${topic}" at "${difficulty}" level.

    Return a valid JSON object with a "questions" key containing an array of questions.
    Each question must match this structure:
    {
      "stem": "Question text...",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_answer": "Index of correct option (0-3 as string, e.g. '0')",
      "difficulty": "${difficulty}"
    }

    Return ONLY valid JSON.
  `;

  const result = await gemini.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: { responseMimeType: 'application/json' },
  });

  const text = result.response.text();
  try {
    const data = JSON.parse(cleanJson(text));
    return data.questions as Question[];
  } catch (e) {
    console.error('Failed to parse Gemini response:', text);
    throw new Error('Invalid JSON response from AI');
  }
}

/**
 * Exam Generator - Creates BNCC-based exam structure
 */
async function runExamGenerator(
  payload: unknown,
  model: string = 'gemini-1.5-flash'
): Promise<unknown> {
  console.log(`[Exam Generator] Creating exam with model: ${model}...`, payload);

  const gemini = getGeminiModel(model);

  const prompt = `
    You are an expert exam creator.
    Create a structured exam based on the following requirements:
    ${JSON.stringify(payload)}

    Return a valid JSON object representing the exam.
    Include a 'questions' array with detailed questions.

    Return ONLY valid JSON.
  `;

  const result = await gemini.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: { responseMimeType: 'application/json' },
  });

  const text = result.response.text();
  try {
    const data = JSON.parse(cleanJson(text));
    return {
      ...data,
      generated_at: new Date().toISOString(),
    };
  } catch (e) {
    console.error('Failed to parse Gemini response:', text);
    throw new Error('Invalid JSON response from AI');
  }
}

// =====================================================
// MAIN HANDLER
// =====================================================

Deno.serve(async (req: Request): Promise<Response> => {
  try {
    // 1. Parse Request
    const { job_id }: JobPayload = await req.json();

    if (!job_id) {
      return new Response(JSON.stringify({ error: 'Missing job_id' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    console.log(`[Process Job] Starting job: ${job_id}`);

    // 2. Initialize Supabase Admin Client (Service Role)
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 3. Fetch Job from Database
    const { data: job, error: fetchError } = await supabase
      .from('background_jobs')
      .select('*')
      .eq('id', job_id)
      .single<BackgroundJob>();

    if (fetchError || !job) {
      console.error('[Process Job] Job not found:', fetchError);
      return new Response(JSON.stringify({ error: 'Job not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 4. Pre-Flight: Calculate Cost & Deduct Credits
    const { cost: estimatedCost, model: selectedModel } = calculateCost(job);
    console.log(`[Process Job] Estimated Cost: ${estimatedCost}, Model: ${selectedModel}`);

    if (estimatedCost > 0) {
      const { data: deductionSuccess, error: deductionError } = await supabase.rpc(
        'deduct_user_credits',
        {
          p_user_id: job.user_id,
          p_amount: estimatedCost,
        }
      );

      if (deductionError || !deductionSuccess) {
        console.error('[Process Job] Insufficient credits or deduction error:', deductionError);

        await supabase
          .from('background_jobs')
          .update({
            status: 'failed',
            error_message: 'Saldo insuficiente para realizar esta operação.',
            updated_at: new Date().toISOString(),
          })
          .eq('id', job_id);

        return new Response(JSON.stringify({ error: 'Insufficient credits' }), {
          status: 402,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    // 5. Update Status to Processing
    await supabase
      .from('background_jobs')
      .update({ status: 'processing', updated_at: new Date().toISOString() })
      .eq('id', job_id);

    console.log(`[Process Job] Job ${job_id} status: processing`);

    // 5. Route to Appropriate Pipeline
    let outputData: unknown;

    switch (job.job_type) {
      case 'ocr_correction':
        if (!job.payload.image_url) {
          throw new Error('Missing image_url in payload');
        }
        outputData = await runVisionPipeline(
          job.payload.image_url,
          job.payload.exam_id,
          supabase,
          selectedModel
        );
        break;

      case 'generate_questions':
        if (!job.payload.topic || !job.payload.quantity || !job.payload.difficulty) {
          throw new Error('Missing topic, quantity, or difficulty in payload');
        }
        outputData = await runQuestionGenerator(
          job.payload.topic,
          job.payload.quantity,
          job.payload.difficulty,
          selectedModel
        );
        break;

      case 'exam_generation':
        outputData = await runExamGenerator(job.payload, selectedModel);
        break;

      case 'weekly_report':
        // Future implementation
        outputData = { message: 'Weekly report generation not yet implemented' };
        break;

      default:
        // Handled below or falling through
        break;
    }

    // Handle generate_questions_v2 as a separate block (or refactor it to use SDK too)
    // I will refactor it to use the SDK for consistency, leveraging getGeminiModel
    if (job.job_type === 'generate_questions_v2') {
      const { content, quantity, types, style, discipline, subject, grade_level } = job.payload as {
        content?: string;
        quantity: number;
        types: string[];
        style: string;
        discipline?: string;
        subject?: string;
        grade_level?: string;
      };

      console.log(
        `Generating ${quantity} questions (v2) for topic: ${content ? content.substring(0, 50) : 'Files provided'}...`
      );

      // 1. Calculate Distribution
      const distribution: string[] = [];
      types.forEach((type) => distribution.push(type));
      const remainingSlots = quantity - types.length;
      if (remainingSlots > 0) {
        for (let i = 0; i < remainingSlots; i++) {
          const randomType = types[Math.floor(Math.random() * types.length)];
          distribution.push(randomType);
        }
      }

      // 1.5. SCRUB PII
      const safeContent = scrubPII(content || '');
      if (content && content !== safeContent) {
        console.log('[PII Protection] Sensitive data scrubbed from input prompt.');
      }

      // 2. Construct System Prompt
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
           - "correct_answer": null
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
            "explanation": "Explicação pedagógica do gabarito.",
            "bncc": "Código BNCC",
            "difficulty": "medium",
            "discipline": "${discipline}",
            "subject": "${subject}"
          }
        ]

        PARÂMETROS:
        - Quantidade: ${quantity} questões
        - Tipos Solicitados: ${types.join(', ')} (Distribua equitativamente)
        - Estilo: ${style}
        - Disciplina/Assunto: ${discipline || 'Geral'} / ${subject || 'Geral'}
        - Nível: ${grade_level || 'Geral'}

        Conteúdo Base para Geração (Sanitized):
        "${safeContent || 'Nenhum conteúdo textual identificado. Gere com base no Assunto/Disciplina informados.'}"
        
        Retorne APENAS o JSON válido, sem markdown ou explicações extras.
      `;

      // 2.5. Determine Max Tokens (Boost for Redaction/Essay)
      const hasRedaction = types.includes('essay') || types.includes('redaction');
      const maxOutputTokens = hasRedaction ? 8192 : 2048;

      // 3. Call Gemini API via SDK
      const gemini = getGeminiModel(selectedModel);

      const result = await gemini.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          maxOutputTokens: maxOutputTokens,
        },
      });

      const text = result.response.text();
      let generatedQuestions;
      try {
        generatedQuestions = JSON.parse(cleanJson(text));
      } catch (e) {
        console.error('Failed to parse Gemini response:', text);
        throw new Error('Invalid JSON response from AI');
      }

      // Update job with result
      await supabase
        .from('background_jobs')
        .update({
          status: 'completed',
          result: { questions: generatedQuestions },
          updated_at: new Date().toISOString(),
        })
        .eq('id', job.id);

      // 4. Audit Log
      const usage = result.response.usageMetadata || {
        promptTokenCount: 0,
        candidatesTokenCount: 0,
      };
      const providerCost = calculateProviderCost(
        selectedModel,
        usage.promptTokenCount || 0,
        usage.candidatesTokenCount || 0
      );

      await supabase.from('ia_cost_log').insert({
        user_id: job.user_id,
        job_id: job.id,
        feature: 'generate_questions_v2',
        model_used: selectedModel,
        input_tokens: usage.promptTokenCount || 0,
        output_tokens: usage.candidatesTokenCount || 0,
        cost_credits: estimatedCost,
        provider_cost_brl: providerCost,
      });

      return new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (
      job.job_type !== 'ocr_correction' &&
      job.job_type !== 'generate_questions' &&
      job.job_type !== 'exam_generation' &&
      job.job_type !== 'weekly_report'
    ) {
      throw new Error(`Unknown job type: ${job.job_type}`);
    }

    // 6. Update Job to Completed
    const { error: updateError } = await supabase
      .from('background_jobs')
      .update({
        status: 'completed',
        result: outputData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', job_id);

    // 7. Audit Log (For other job types)
    if (estimatedCost > 0) {
      // Note: With SDK, token usage is in the result object, but here we might not have it easily available
      // if we returned just the data.
      // Ideally runVisionPipeline etc should return usage too.
      // For now, defaulting to 0/0 usage for log but cost credits are logged.
      // This matches previous behavior for non-v2 jobs.
      await supabase.from('ia_cost_log').insert({
        user_id: job.user_id,
        job_id: job.id,
        feature: job.job_type,
        model_used: selectedModel,
        input_tokens: 0,
        output_tokens: 0,
        cost_credits: estimatedCost,
        provider_cost_brl: 0,
      });
    }

    if (updateError) {
      console.error('[Process Job] Failed to update job:', updateError);
      throw updateError;
    }

    console.log(`[Process Job] Job ${job_id} completed successfully`);

    // 7. Send Notification (Optional)
    console.log(`[Notification] Would notify user ${job.user_id} about job completion`);

    // 8. Send Email (Optional)
    if (job.job_type === 'weekly_report') {
      const resendApiKey = Deno.env.get('RESEND_API_KEY');
      if (resendApiKey) {
        const resend = new Resend(resendApiKey);
        console.log('[Email] Would send weekly report email');
      }
    }

    return new Response(JSON.stringify({ success: true, job_id, status: 'completed' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[Process Job] Error:', error);

    try {
      const { job_id } = await req.clone().json();
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      );

      await supabase
        .from('background_jobs')
        .update({
          status: 'failed',
          error_message: error instanceof Error ? error.message : 'Unknown error',
          updated_at: new Date().toISOString(),
        })
        .eq('id', job_id);
    } catch (updateError) {
      console.error('[Process Job] Failed to update error status:', updateError);
    }

    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Internal server error',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
