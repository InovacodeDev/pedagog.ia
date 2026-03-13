'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { getExamResultsAction } from '@/server/actions/get-exam-results';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface StudentResult {
  student_id: string;
  student_name: string;
  score: number | null;
  type: 'manual' | 'ai';
  verified_at: string | null;
}

interface ExamResultsModalProps {
  examId: string | null;
  examTitle: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ExamResultsModal({
  examId,
  examTitle,
  open,
  onOpenChange,
}: ExamResultsModalProps) {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<StudentResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  const loadResults = useCallback(async () => {
    if (!examId) return;
    setLoading(true);
    setError(null);
    try {
      const response = await getExamResultsAction(examId);
      if (response.success) {
        setResults(response.results || []);
      } else {
        setError(response.error || 'Erro ao carregar resultados');
      }
    } catch (err) {
      console.error('Error loading results:', err);
      setError('Erro inesperado ao carregar resultados');
    } finally {
      setLoading(false);
    }
  }, [examId]);

  useEffect(() => {
    if (open && examId) {
      loadResults();
    } else if (!open) {
      setResults([]);
      setError(null);
    }
  }, [open, examId, loadResults]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Notas: {examTitle}</DialogTitle>
          <DialogDescription>
            Resultados dos alunos para esta avaliação.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Carregando notas...</p>
          </div>
        ) : error ? (
          <div className="py-8 text-center text-destructive">{error}</div>
        ) : results.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            Nenhuma nota encontrada para esta prova.
          </div>
        ) : (
          <div className="rounded-md border mt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Aluno</TableHead>
                  <TableHead className="text-center">Nota</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="text-right">Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map((result) => (
                  <TableRow key={`${result.student_id}-${result.type}`}>
                    <TableCell className="font-medium">
                      {result.student_name}
                    </TableCell>
                    <TableCell className="text-center">
                      <span
                        className={cn(
                          'font-bold',
                          result.score !== null && result.score >= 6
                            ? 'text-green-600'
                            : 'text-red-500'
                        )}
                      >
                        {result.score !== null ? result.score.toFixed(1) : '--'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize text-[10px]">
                        {result.type === 'ai' ? 'IA' : 'Manual'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground text-xs">
                      {result.verified_at
                        ? format(new Date(result.verified_at), 'dd/MM/yy HH:mm', {
                            locale: ptBR,
                          })
                        : '--'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Utility to handle class names - assuming it's available globally or via @/lib/utils
import { cn } from '@/lib/utils';
