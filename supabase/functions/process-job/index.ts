// =====================================================
// PEDAGOGI.AI EDGE FUNCTION: Process Job
// Runtime: Deno
// Purpose: Async processing pipeline for OCR and Exam Generation
// =====================================================

import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

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
// MOCK AI PIPELINE (Replace with real OpenAI/Anthropic)
// =====================================================

/**
 * Mock Vision Pipeline - Simulates OCR processing
 * In production, this would call OpenAI GPT-4 Vision or Anthropic Claude
 */
async function runVisionPipeline(
  imageUrl: string,
  examId?: string,
  supabase?: any
): Promise<OCRResult> {
  console.log(`[Vision Pipeline] Processing image: ${imageUrl}`);
  if (examId) {
    console.log(`[Vision Pipeline] Using Answer Key from Exam ID: ${examId}`);
    // In a real implementation, we would fetch the answer key here
    // const { data: exam } = await supabase.from('exams').select('answer_key').eq('id', examId).single();
  }

  // Simulate AI processing delay
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Mock result (replace with actual AI call)
  const mockResult: OCRResult = {
    total_questions: 10,
    confidence: 0.92,
    answers: Array.from({ length: 10 }, (_, i) => ({
      question: i + 1,
      score: Math.random() > 0.3 ? 1.0 : 0.0,
      correct: Math.random() > 0.3,
      confidence: 0.85 + Math.random() * 0.15,
    })),
    suggested_score: 0,
    exam_id: examId,
  };

  // Calculate suggested score
  mockResult.suggested_score = mockResult.answers.reduce((sum, a) => sum + a.score, 0);

  return mockResult;
}

/**
 * Mock Question Generator - Simulates LLM Question Generation
 */
async function runQuestionGenerator(
  topic: string,
  quantity: number,
  difficulty: string
): Promise<Question[]> {
  console.log(`[Question Generator] Generating ${quantity} ${difficulty} questions about ${topic}`);

  await new Promise((resolve) => setTimeout(resolve, 3000));

  // Mock generated questions
  const questions: Question[] = Array.from({ length: quantity }, (_, i) => ({
    stem: `Questão ${i + 1} sobre ${topic} (${difficulty}) - Qual é a resposta correta?`,
    options: [
      `Opção A (Incorreta)`,
      `Opção B (Correta)`,
      `Opção C (Incorreta)`,
      `Opção D (Incorreta)`,
    ],
    correct_answer: '1', // Index 1 is Option B
    difficulty: difficulty,
  }));

  return questions;
}

/**
 * Mock Exam Generator - Simulates BNCC-based exam creation
 */
async function runExamGenerator(payload: unknown): Promise<unknown> {
  console.log('[Exam Generator] Creating exam...', payload);

  await new Promise((resolve) => setTimeout(resolve, 3000));

  return {
    exam_id: crypto.randomUUID(),
    questions: [
      { id: 1, text: 'Qual é a capital do Brasil?', type: 'multiple_choice' },
      { id: 2, text: 'Resolva: 2 + 2 = ?', type: 'numeric' },
    ],
    generated_at: new Date().toISOString(),
  };
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

    // 4. Update Status to Processing
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
        outputData = await runVisionPipeline(job.payload.image_url, job.payload.exam_id, supabase);
        break;

      case 'generate_questions':
        if (!job.payload.topic || !job.payload.quantity || !job.payload.difficulty) {
          throw new Error('Missing topic, quantity, or difficulty in payload');
        }
        outputData = await runQuestionGenerator(
          job.payload.topic,
          job.payload.quantity,
          job.payload.difficulty
        );
        break;

      case 'exam_generation':
        outputData = await runExamGenerator(job.payload);
        break;

      case 'weekly_report':
        // Future implementation
        outputData = { message: 'Weekly report generation not yet implemented' };
        break;

      default:
        // If it's not a known job type that sets outputData, we'll handle it below
        // This default case will only be hit if a new job type is added that doesn't
        // have a specific case above and isn't handled by the subsequent if blocks.
        // For now, we'll let the if blocks handle new types.
        break;
    }

    // Handle generate_questions_v2 as a separate block since it updates the job and returns early
    if (job.job_type === 'generate_questions_v2') {
      const { content, quantity, types, style, discipline, subject } = job.payload as {
        content: string;
        quantity: number;
        types: string[];
        style: string;
        discipline?: string;
        subject?: string;
      };

      // Mock AI Generation for V2
      console.log(
        `Generating ${quantity} questions (v2) for topic: ${content.substring(0, 50)}...`
      );
      console.log(
        `Types: ${types.join(', ')}, Style: ${style}, Discipline: ${discipline}, Subject: ${subject}`
      );

      await new Promise((resolve) => setTimeout(resolve, 3000)); // Simulate delay

      const generatedQuestions = Array.from({ length: quantity }).map((_, i) => {
        const type = types[i % types.length]; // Distribute types
        const isMultipleChoice = type === 'multiple_choice';

        return {
          stem: `(Questão ${i + 1} - ${style.toUpperCase()}) Baseado no texto: "${content.substring(0, 20)}..." - Gere uma questão sobre este tópico.`,
          options: isMultipleChoice
            ? ['Alternativa A', 'Alternativa B', 'Alternativa C', 'Alternativa D']
            : undefined,
          correct_answer: isMultipleChoice ? '0' : 'Resposta esperada...',
          type: type,
          bncc: 'EM13LGG102',
          explanation: 'Explicação detalhada da resposta correta.',
          discipline: discipline || 'Geral',
          subject: subject || 'Geral',
        };
      });

      // Update job with result
      await supabase
        .from('background_jobs')
        .update({
          status: 'completed',
          result: { questions: generatedQuestions },
          updated_at: new Date().toISOString(),
        })
        .eq('id', job.id);

      return new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // If outputData was not set by a specific case, it means the job type was not handled
    // by the switch statement, and also not by the generate_questions_v2 block.
    // This implies an unknown job type that should have been caught by the default case
    // if it was placed there, or now needs to be explicitly checked.
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

    if (updateError) {
      console.error('[Process Job] Failed to update job:', updateError);
      throw updateError;
    }

    console.log(`[Process Job] Job ${job_id} completed successfully`);

    // 7. Send Notification (Optional - Web Push would go here)
    // In production, fetch user's push subscription and send notification
    // For now, we'll just log it
    console.log(`[Notification] Would notify user ${job.user_id} about job completion`);

    // 8. Send Email (Optional - for weekly reports)
    if (job.job_type === 'weekly_report') {
      const resendApiKey = Deno.env.get('RESEND_API_KEY');
      if (resendApiKey) {
        const resend = new Resend(resendApiKey);
        // Email sending logic would go here
        console.log('[Email] Would send weekly report email');
      }
    }

    return new Response(JSON.stringify({ success: true, job_id, status: 'completed' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[Process Job] Error:', error);

    // Try to update job status to failed
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
