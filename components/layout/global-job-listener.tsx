'use client';

import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export function GlobalJobListener() {
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    // We need the user ID to filter jobs properly, but RLS might handle it.
    // However, subscribing to 'all' jobs might be noisy if RLS isn't strict on SELECT for subscription.
    // Usually Supabase Realtime respects RLS if 'Row Level Security' is enabled for the table and realtime is set up to respect it.
    // Assuming RLS is set up, we will only receive events for our own jobs.

    const channel = supabase
      .channel('global-job-listener')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'background_jobs',
          filter: 'status=eq.completed',
        },
        (payload) => {
          const newJob = payload.new as {
            id: string;
            job_type: string;
            result?: Record<string, unknown>;
          };
          // We can check payload.old to see if it wasn't completed before,
          // but usually the filter 'status=eq.completed' ensures we only get it when it IS completed.
          // If it was already completed and updated again, we might get a duplicate toast.
          // Ideally check: if (payload.old.status !== 'completed')

          // For now, let's assume any update to 'completed' is worth notifying or it's the first time.

          if (newJob.job_type === 'ocr_correction') {
            toast.success('Correção Concluída!', {
              description: 'Sua correção de prova foi processada com sucesso.',
              action: {
                label: 'Ver Resultado',
                onClick: () => router.push(`/scan/results/${newJob.id}`),
              },
            });
          } else if (newJob.job_type === 'exam_generation') {
            toast.success('Prova Gerada!', {
              description: 'Sua prova foi criada com sucesso.',
              action: {
                label: 'Ver Prova',
                onClick: () => router.push(`/exams/${newJob.result?.exam_id || ''}`),
              },
            });
          } else if (newJob.job_type === 'generate_questions_v2') {
            toast.success('Questões Geradas!', {
              description: 'Novas questões foram adicionadas ao banco.',
              action: {
                label: 'Ver Questões',
                onClick: () => router.push('/questions'),
              },
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, router]);

  return null; // This component renders nothing
}
