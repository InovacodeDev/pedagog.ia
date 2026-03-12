'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
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
import { Eye, Lock, Trash2, Loader2 } from 'lucide-react';
import { deleteExamAction } from '@/server/actions/exams';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { toast } from 'sonner';

interface Exam {
  id: string;
  title: string;
  created_at: string;
  status: string;
  questions_list: unknown[];
  correction_count: number;
  discipline?: string | null;
}

interface ClassExamsListProps {
  exams: Exam[];
}

export function ClassExamsList({ exams }: ClassExamsListProps) {
  const [isPending, startTransition] = useTransition();
  const [examToDelete, setExamToDelete] = useState<string | null>(null);
  const router = useRouter();

  const handleDelete = async () => {
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

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Título</TableHead>
            <TableHead>Matéria</TableHead>
            <TableHead>Questões</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Criada em</TableHead>
            <TableHead className="w-[100px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {exams.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                Nenhuma prova vinculada a esta turma.
              </TableCell>
            </TableRow>
          ) : (
            exams.map((exam) => {
              const isManual = !exam.questions_list || exam.questions_list.length === 0;
              
              return (
                <TableRow key={exam.id}>
                  <TableCell className="font-medium">
                    {exam.title}
                    {isManual && (
                      <Badge variant="outline" className="ml-2 text-[10px] h-4 uppercase">
                        Manual
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>{exam.discipline || '--'}</TableCell>
                  <TableCell>
                    {isManual ? '--' : (exam.questions_list.length || 2) - 2}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {exam.correction_count > 0 ? (
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
                  <TableCell>{new Date(exam.created_at).toLocaleDateString('pt-BR')}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" asChild disabled={isManual}>
                        <Link 
                          href={isManual ? '#' : `/exams/${exam.id}`}
                          className={isManual ? 'pointer-events-none opacity-50' : ''}
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => setExamToDelete(exam.id)}
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

      <ConfirmDialog
        open={!!examToDelete}
        onOpenChange={(open) => !open && setExamToDelete(null)}
        title="Excluir Prova"
        description="Tem certeza que deseja excluir esta prova? Esta ação não pode ser desfeita e removerá todas as notas associadas."
        onConfirm={handleDelete}
        confirmText="Excluir"
        variant="destructive"
      />
    </div>
  );
}

