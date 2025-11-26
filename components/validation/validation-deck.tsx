'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ExamViewer } from './exam-viewer';
import { GradeForm, QuestionResult } from './grade-form';
import { saveExamGradeAction } from '@/server/actions/validation';
import { Database } from '@/types/database';

type Job = Database['public']['Tables']['background_jobs']['Row'];

interface ValidationDeckProps {
  job: Job;
}

export function ValidationDeck({ job }: ValidationDeckProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Parse initial questions from job result
  const initialQuestions = React.useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = job.result as any;
    if (result && Array.isArray(result.answers)) {
      return result.answers as QuestionResult[];
    }
    return [];
  }, [job.result]);

  const [questions, setQuestions] = React.useState<QuestionResult[]>(initialQuestions);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const finalScore = questions.reduce((acc, q) => acc + q.score, 0);

      const result = await saveExamGradeAction({
        job_id: job.id,
        final_score: finalScore,
        answers: questions,
      });

      if (result.success) {
        toast.success('Correção salva com sucesso!');
        router.push('/exams');
      } else {
        toast.error('Erro ao salvar correção', {
          description: result.error,
        });
      }
    } catch {
      toast.error('Erro inesperado');
    } finally {
      setIsSubmitting(false);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const imageUrl = (job.payload as any)?.image_url;

  if (!imageUrl) {
    return <div>Erro: Imagem da prova não encontrada.</div>;
  }

  return (
    <div className="grid h-[calc(100vh-4rem)] lg:grid-cols-[1fr_400px] gap-4 p-4">
      <div className="h-full min-h-0">
        <ExamViewer imageUrl={imageUrl} />
      </div>
      <div className="h-full min-h-0 border rounded-lg bg-background shadow-sm flex flex-col">
        <div className="p-4 border-b">
          <h2 className="font-semibold">Validação de Respostas</h2>
          <p className="text-xs text-muted-foreground">
            Revise as sugestões da IA e ajuste conforme necessário.
          </p>
        </div>
        <div className="flex-1 min-h-0">
          <GradeForm
            questions={questions}
            onChange={setQuestions}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        </div>
      </div>
    </div>
  );
}
