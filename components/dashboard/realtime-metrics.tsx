'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Database, CheckCircle, Clock } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

import { getDashboardMetrics } from '@/server/actions/dashboard';
import { useRouter } from 'next/navigation';

interface DashboardMetrics {
  examsCount: number;
  questionsCount: number;
  correctionsCount: number;
  timeSavedHours: number;
  recentExams: unknown[];
}

interface DashboardRealtimeMetricsProps {
  initialMetrics: DashboardMetrics;
}

export function DashboardRealtimeMetrics({ initialMetrics }: DashboardRealtimeMetricsProps) {
  const [metrics, setMetrics] = useState<DashboardMetrics>(initialMetrics);
  const supabase = createClient();
  const router = useRouter();

  const refreshMetrics = async () => {
    const { data } = await getDashboardMetrics();
    if (data) {
      setMetrics(data);
      router.refresh(); // Also refresh server components if needed
    }
  };

  useEffect(() => {
    // Channel for Exams
    const channel = supabase
      .channel('dashboard-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'exams' }, () => {
        refreshMetrics();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'questions' }, () => {
        refreshMetrics();
      })
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'background_jobs',
          filter: 'status=eq.completed',
        },
        () => {
          refreshMetrics();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
