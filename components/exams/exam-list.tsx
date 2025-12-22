'use client';

import { useState } from 'react';
import Link from 'next/link';
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

interface Exam {
  id: string;
  title: string;
  created_at: string;
  status: string;
  questions_list: unknown[];
  correction_count: number;
}

interface ExamListProps {
  initialExams: Exam[];
}

export function ExamList({ initialExams }: ExamListProps) {
  const [exams, setExams] = useState<Exam[]>(initialExams);

  const handleDuplicate = async (examId: string) => {
    toast.promise(duplicateExamAction(examId), {
      loading: 'Duplicando prova...',
      success: (result) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const res = result as any;
        if (res.success && res.exam) {
          setExams([res.exam, ...exams]);
          return 'Prova duplicada com sucesso!';
        } else {
          throw new Error(res.error);
        }
      },
      error: (err) => `Erro ao duplicar: ${err.message}`,
    });
  };

  const handleDelete = async (examId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta prova?')) return;

    toast.promise(deleteExamAction(examId), {
      loading: 'Excluindo prova...',
      success: (result) => {
        if (result.success) {
          setExams(exams.filter((e) => e.id !== examId));
          return 'Prova excluída com sucesso!';
        } else {
          throw new Error(result.error);
        }
      },
      error: (err) => `Erro ao excluir: ${err.message}`,
    });
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Título</TableHead>
            <TableHead>Questões</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Criada em</TableHead>
            <TableHead className="w-12"></TableHead>
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
                <TableCell>{exam.questions_list?.length || 0}</TableCell>
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
                        disabled={exam.correction_count > 0}
                        className={exam.correction_count > 0 ? 'opacity-50 cursor-not-allowed' : ''}
                        asChild={exam.correction_count === 0}
                      >
                        {exam.correction_count === 0 ? (
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
  );
}
