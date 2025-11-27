'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Database, CheckCircle, Clock } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface DashboardMetrics {
  examsCount: number;
  questionsCount: number;
  correctionsCount: number;
  timeSavedHours: number;
  recentExams: any[];
}

interface DashboardRealtimeMetricsProps {
  initialMetrics: DashboardMetrics;
}

export function DashboardRealtimeMetrics({ initialMetrics }: DashboardRealtimeMetricsProps) {
  const [metrics, setMetrics] = useState<DashboardMetrics>(initialMetrics);
  const supabase = createClient();

  useEffect(() => {
    // Channel for Exams
    const examsChannel = supabase
      .channel('dashboard-exams')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'exams' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setMetrics((prev) => ({ ...prev, examsCount: prev.examsCount + 1 }));
        } else if (payload.eventType === 'DELETE') {
          setMetrics((prev) => ({ ...prev, examsCount: Math.max(0, prev.examsCount - 1) }));
        }
      })
      .subscribe();

    // Channel for Questions
    const questionsChannel = supabase
      .channel('dashboard-questions')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'questions' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setMetrics((prev) => ({ ...prev, questionsCount: prev.questionsCount + 1 }));
        } else if (payload.eventType === 'DELETE') {
          setMetrics((prev) => ({ ...prev, questionsCount: Math.max(0, prev.questionsCount - 1) }));
        }
      })
      .subscribe();

    // Channel for Background Jobs (Corrections)
    // Assuming 'ocr_correction' jobs count as corrections when completed
    const jobsChannel = supabase
      .channel('dashboard-jobs')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'background_jobs',
          filter: 'status=eq.completed',
        },
        (payload) => {
          // We only want to increment if it wasn't completed before, but UPDATE trigger only fires on change.
          // However, to be safe, we might just increment if we see a completion.
          // Ideally we check payload.old.status !== 'completed' but payload.old is sometimes empty depending on replica identity.
          // For a simple counter, we'll assume any update to completed is a new completion event we care about,
          // or we could refine if we had more data.
          // Let's assume job_type is 'ocr_correction' for corrections count.
          const newJob = payload.new as { job_type: string };
          if (newJob.job_type === 'ocr_correction') {
            setMetrics((prev) => ({
              ...prev,
              correctionsCount: prev.correctionsCount + 1,
              timeSavedHours: prev.timeSavedHours + 0.08, // +5 mins approx
            }));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(examsChannel);
      supabase.removeChannel(questionsChannel);
      supabase.removeChannel(jobsChannel);
    };
  }, [supabase]);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Provas Criadas</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.examsCount}</div>
          <p className="text-xs text-muted-foreground">Total de avaliações geradas</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Banco de Questões</CardTitle>
          <Database className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.questionsCount}</div>
          <p className="text-xs text-muted-foreground">Questões disponíveis</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Correções</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.correctionsCount}</div>
          <p className="text-xs text-muted-foreground">Provas corrigidas via IA</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tempo Economizado</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.timeSavedHours.toFixed(1)}h</div>
          <p className="text-xs text-muted-foreground">Estimado (5min/prova)</p>
        </CardContent>
      </Card>
    </div>
  );
}
