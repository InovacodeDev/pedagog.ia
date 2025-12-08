'use client';

import Link from 'next/link';
import { useState } from 'react';
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
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, Eye, FileDown, Copy, Edit, Trash2, Lock } from 'lucide-react';
import { duplicateExamAction, deleteExamAction } from '@/server/actions/exams';
import { toast } from 'sonner';
import { useRealtimeSubscription } from '@/hooks/use-realtime-subscription';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

interface Exam {
  id: string;
  title: string;
  created_at: string | null;
  status: string | null;
  questions_list: unknown;
  correction_count: number | null;
}

interface ExamsRealtimeListProps {
  initialExams: Exam[];
}

export function ExamsRealtimeList({ initialExams }: ExamsRealtimeListProps) {
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
    toast.promise(duplicateExamAction(examId), {
      loading: 'Duplicando prova...',
      success: (result) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const res = result as any;
        if (res.success) {
          return 'Prova duplicada com sucesso!';
        } else {
          throw new Error(res.error);
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
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Questões</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Criada em</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {exams.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  Nenhuma prova encontrada.
                </TableCell>
              </TableRow>
            ) : (
              exams.map((exam) => (
                <TableRow key={exam.id}>
                  <TableCell className="font-medium">{exam.title}</TableCell>
                  <TableCell>{((exam.questions_list as unknown[])?.length ?? 2) - 2}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {(exam.correction_count || 0) > 0 ? (
                        <Badge variant="destructive" className="flex gap-1 items-center">
                          <Lock className="h-3 w-3" /> Travada
                        </Badge>
                      ) : exam.status === 'published' ? (
                        <Badge className="bg-green-600">Pronta</Badge>
                      ) : (
                        <Badge variant="secondary">Rascunho</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{exam.created_at ? new Date(exam.created_at).toLocaleDateString('pt-BR') : '-'}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Abrir menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/exams/${exam.id}`}>
                            <Eye className="mr-2 h-4 w-4" /> Visualizar
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <FileDown className="mr-2 h-4 w-4" /> Exportar PDF
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicate(exam.id)}>
                          <Copy className="mr-2 h-4 w-4" /> Duplicar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          disabled={(exam.correction_count || 0) > 0}
                          className={
                            (exam.correction_count || 0) > 0
                              ? 'opacity-50 cursor-not-allowed'
                              : ''
                          }
                          asChild={(exam.correction_count || 0) === 0}
                        >
                          {(exam.correction_count || 0) === 0 ? (
                            <Link href={`/exams/${exam.id}/edit`}>
                              <Edit className="mr-2 h-4 w-4" /> Editar
                            </Link>
                          ) : (
                            <span className="flex items-center">
                              <Edit className="mr-2 h-4 w-4" /> Editar
                            </span>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => handleDelete(exam.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Deletar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
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
