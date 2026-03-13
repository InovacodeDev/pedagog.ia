'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Json } from '@/types/database';
import { getTermLabel } from '@/lib/terms';
import {
  MoreVertical,
  Eye,
  Copy,
  Edit,
  Trash2,
  Lock,
} from 'lucide-react';
import { duplicateExamAction, deleteExamAction } from '@/server/actions/exams';
import { toast } from 'sonner';
import { useRealtimeSubscription } from '@/hooks/use-realtime-subscription';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import amplitude from '@/lib/amplitude';

interface Exam {
  id: string;
  title: string;
  created_at: string | null;
  status: string | null;
  questions_list: Json;
  correction_count: number | null;
  discipline?: string | null;
  term?: string | null;
}

interface ExamsRealtimeListProps {
  initialExams: Exam[];
}

export function ExamsRealtimeList({ initialExams }: ExamsRealtimeListProps) {
  const router = useRouter();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [examToDelete, setExamToDelete] = useState<string | null>(null);

  const exams = useRealtimeSubscription({
    table: 'exams',
    initialData: initialExams,
    orderBy: (a, b) => {
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return dateB - dateA;
    },
  });

  const handleDuplicate = async (examId: string) => {
    amplitude.track('Exam Duplicated', { examId });
    toast.promise(duplicateExamAction(examId), {
      loading: 'Duplicando prova...',
      success: (result: { success: boolean; error?: string }) => {
        if (result.success) {
          return 'Prova duplicada com sucesso!';
        } else {
          throw new Error(result.error);
        }
      },
      error: (err) => `Erro ao duplicar: ${err.message}`,
    });
  };

  const handleDelete = (examId: string) => {
    setExamToDelete(examId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!examToDelete) return;

    amplitude.track('Exam Deleted', { examId: examToDelete });
    toast.promise(deleteExamAction(examToDelete), {
      loading: 'Excluindo prova...',
      success: (result) => {
        if (result.success) {
          return 'Prova excluída com sucesso!';
        } else {
          throw new Error(result.error);
        }
      },
      error: (err) => `Erro ao excluir: ${err.message}`,
    });
    setExamToDelete(null);
  };

  return (
    <>
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Matéria</TableHead>
              <TableHead>Questões</TableHead>
              <TableHead>Período</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Data</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {exams.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                  Nenhuma prova encontrada.
                </TableCell>
              </TableRow>
            ) : (
              exams.map((exam) => {
                const isPlatformGenerated = Array.isArray(exam.questions_list) && exam.questions_list.length > 0;
                const questionsList = Array.isArray(exam.questions_list)
                  ? (exam.questions_list as unknown[])
                  : [];
                const isEditable = isPlatformGenerated && (exam.correction_count || 0) === 0;

                return (
                  <TableRow
                    key={exam.id}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => router.push(`/exams/${exam.id}`)}
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {exam.title}
                        {!isPlatformGenerated && (
                          <Badge variant="outline" className="text-[10px] h-4 uppercase bg-muted/50">
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
                    <TableCell>
                      {isPlatformGenerated
                        ? questionsList.length
                        : '--'}
                    </TableCell>
                    <TableCell>{getTermLabel(exam.term)}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          exam.status === 'completed' || exam.status === 'published'
                            ? 'default'
                            : exam.status === 'processing'
                              ? 'secondary'
                              : 'outline'
                        }
                      >
                        {exam.status === 'completed' || exam.status === 'published'
                          ? 'Concluída'
                          : exam.status === 'processing'
                            ? 'Processando'
                            : exam.status === 'manual' ? 'Manual' : 'Erro'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {exam.created_at
                        ? new Date(exam.created_at).toLocaleDateString('pt-BR')
                        : '-'}
                    </TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link 
                                href={`/exams/${exam.id}`}
                                onClick={() => amplitude.track('Exam Details Viewed', { examId: exam.id })}
                            >
                              <Eye className="mr-2 h-4 w-4" /> Detalhes
                            </Link>
                          </DropdownMenuItem>

                          {isPlatformGenerated && (
                            <>
                              <DropdownMenuItem onClick={() => handleDuplicate(exam.id)}>
                                <Copy className="mr-2 h-4 w-4" /> Duplicar
                              </DropdownMenuItem>
                            </>
                          )}

                          <DropdownMenuItem
                            disabled={!isEditable}
                            className={!isEditable ? 'opacity-50 cursor-not-allowed' : ''}
                            asChild={isEditable}
                            onClick={() => {
                              if (isEditable) {
                                amplitude.track('Exam Edit Started', { examId: exam.id });
                              }
                            }}
                          >
                            {isEditable ? (
                              <Link href={`/exams/${exam.id}/edit`}>
                                <Edit className="mr-2 h-4 w-4" /> Editar
                              </Link>
                            ) : (
                              <span className="flex items-center">
                                <Edit className="mr-2 h-4 w-4" /> Editar
                              </span>
                            )}
                          </DropdownMenuItem>
                          
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => handleDelete(exam.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Excluir Prova"
        description="Tem certeza que deseja excluir esta prova? Esta ação não pode ser desfeita."
        onConfirm={confirmDelete}
        confirmText="Excluir"
        variant="destructive"
      />
    </>
  );
}
