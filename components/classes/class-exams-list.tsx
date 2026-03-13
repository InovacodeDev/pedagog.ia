'use client';

import { useState, useTransition, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lock, Trash2, Loader2, Filter } from 'lucide-react';
import { deleteExamAction } from '@/server/actions/exams';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { getTermLabel } from '@/lib/terms';
import { toast } from 'sonner';
import { Json } from '@/types/database';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useRealtimeSubscription } from '@/hooks/use-realtime-subscription';

interface Exam {
  id: string;
  title: string | null;
  created_at: string | null;
  status: string | null;
  questions_list?: Json;
  correction_count: number | null;
  discipline?: string | null;
  term?: string | null;
  class_id?: string | null;
}

interface ClassExamsListProps {
  exams: Exam[];
  classId: string;
}

export function ClassExamsList({ exams: initialExams, classId }: ClassExamsListProps) {
  const router = useRouter();
  
  const exams = useRealtimeSubscription({
    table: 'exams',
    initialData: initialExams,
    filter: `class_id=eq.${classId}`,
    orderBy: (a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime(),
  });

  const [isPending, startTransition] = useTransition();
  const [examToDelete, setExamToDelete] = useState<string | null>(null);
  const [termFilter, setTermFilter] = useState<string>('all');

  const handleRowClick = (examId: string) => {
    router.push(`/exams/${examId}`);
  };

  const handleDelete = async (e: React.MouseEvent, examId: string) => {
    e.stopPropagation();
    setExamToDelete(examId);
  };

  const confirmDelete = async () => {
    if (!examToDelete) return;

    startTransition(async () => {
      try {
        const result = await deleteExamAction(examToDelete);
        if (result.success) {
          toast.success('Prova excluída com sucesso!');
          router.refresh();
        } else {
          toast.error(result.error || 'Erro ao excluir prova');
        }
      } catch (error) {
        console.error('Error deleting exam:', error);
        toast.error('Ocorreu um erro ao excluir a prova.');
      } finally {
        setExamToDelete(null);
      }
    });
  };

  const terms = useMemo(() => {
    const uniqueTerms = new Set(exams.map((e) => e.term).filter(Boolean));
    return Array.from(uniqueTerms).sort();
  }, [exams]);

  const filteredExams = useMemo(() => {
    if (termFilter === 'all') return exams;
    return exams.filter((e) => e.term === termFilter);
  }, [exams, termFilter]);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filtrar por Período:</span>
        </div>
        <Select value={termFilter} onValueChange={setTermFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Todos os períodos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os períodos</SelectItem>
            {terms.map((term) => (
              <SelectItem key={term} value={term!}>
                {getTermLabel(term)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Matéria</TableHead>
              <TableHead>Questões</TableHead>
              <TableHead>Período</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Criada em</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredExams.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                  Nenhuma prova encontrada para este período.
                </TableCell>
              </TableRow>
            ) : (
              filteredExams.map((exam) => {
                const questionsList = Array.isArray(exam.questions_list)
                  ? (exam.questions_list as unknown[])
                  : [];
                const isPlatformGenerated = questionsList.length > 0;

                return (
                  <TableRow
                    key={exam.id}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handleRowClick(exam.id)}
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {exam.title || 'Sem título'}
                        {!isPlatformGenerated && (
                          <Badge
                            variant="outline"
                            className="text-[10px] h-4 uppercase bg-muted/50"
                          >
                            Manual
                          </Badge>
                        )}
                        {(exam.correction_count || 0) > 0 && (
                          <Badge variant="secondary" className="text-[10px] h-4 gap-1">
                            <Lock className="h-2 w-2" /> Travada
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{exam.discipline || '--'}</TableCell>
                    <TableCell>{isPlatformGenerated ? questionsList.length : '--'}</TableCell>
                    <TableCell>{getTermLabel(exam.term)}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          exam.status === 'published' || exam.status === 'completed'
                            ? 'default'
                            : exam.status === 'processing'
                              ? 'secondary'
                              : 'outline'
                        }
                      >
                        {exam.status === 'published' || exam.status === 'completed'
                          ? 'Pronta'
                          : exam.status === 'processing'
                            ? 'Processando'
                            : exam.status === 'manual'
                              ? 'Manual'
                              : 'Erro'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {exam.created_at
                        ? new Date(exam.created_at).toLocaleDateString('pt-BR')
                        : '--'}
                    </TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => handleDelete(e, exam.id)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          disabled={isPending}
                        >
                          {isPending && examToDelete === exam.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <ConfirmDialog
        open={!!examToDelete}
        onOpenChange={(open) => !open && setExamToDelete(null)}
        title="Excluir Prova"
        description="Tem certeza que deseja excluir esta prova? Esta ação não pode ser desfeita e removerá todas as notas associadas."
        onConfirm={confirmDelete}
        confirmText="Excluir"
        variant="destructive"
      />
    </div>
  );
}
