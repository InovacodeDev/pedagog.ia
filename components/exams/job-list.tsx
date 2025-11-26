'use client';

import { useEffect, useState } from 'react';
import { Database } from '@/types/database';
import { createClient } from '@/lib/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Loader2, CheckCircle2, XCircle, Clock } from 'lucide-react';

type Job = Database['public']['Tables']['background_jobs']['Row'];

export function JobList({ initialJobs }: { initialJobs: Job[] }) {
  const [jobs, setJobs] = useState<Job[]>(initialJobs);
  const supabase = createClient();

  useEffect(() => {
    const channel = supabase
      .channel('jobs-list')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'background_jobs',
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setJobs((prev) => [payload.new as Job, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setJobs((prev) =>
              prev.map((job) => (job.id === payload.new.id ? (payload.new as Job) : job))
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <Badge variant="success" className="gap-1">
            <CheckCircle2 className="w-3 h-3" /> Concluído
          </Badge>
        );
      case 'processing':
        return (
          <Badge variant="secondary" className="gap-1 animate-pulse">
            <Loader2 className="w-3 h-3 animate-spin" /> Processando
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="w-3 h-3" /> Falhou
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="gap-1">
            <Clock className="w-3 h-3" /> Pendente
          </Badge>
        );
    }
  };

  if (jobs.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground border rounded-lg bg-muted/10">
        Nenhuma prova processada ainda.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {jobs.map((job) => {
        const isCompleted = job.status === 'completed';
        const Content = (
          <Card
            className={cn(
              'p-4 flex items-center justify-between transition-colors',
              isCompleted ? 'hover:bg-muted/50 cursor-pointer' : 'opacity-80'
            )}
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">
                  {job.job_type === 'ocr_correction' ? 'Correção de Prova' : 'Geração de Prova'}
                </span>
                {getStatusBadge(job.status)}
              </div>
              <p className="text-xs text-muted-foreground">ID: {job.id.slice(0, 8)}</p>
            </div>
            <div className="text-sm text-muted-foreground">
              {formatDistanceToNow(new Date(job.created_at), {
                addSuffix: true,
                locale: ptBR,
              })}
            </div>
          </Card>
        );

        if (isCompleted) {
          return (
            <Link key={job.id} href={`/exams/${job.id}/validate`}>
              {Content}
            </Link>
          );
        }

        return <div key={job.id}>{Content}</div>;
      })}
    </div>
  );
}
