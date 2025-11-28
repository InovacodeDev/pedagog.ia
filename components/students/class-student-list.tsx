'use client';

import { useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical, Trash2, UserX } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useRealtimeSubscription } from '@/hooks/use-realtime-subscription';
import { deleteStudentAction } from '@/server/actions/students';
import { toast } from 'sonner';

interface Student {
  id: string;
  name: string | null;
  grade_level: string | null;
  created_at: string;
  class_id: string | null;
}

interface ClassStudentListProps {
  initialStudents: Student[];
  classId: string;
}

export function ClassStudentList({ initialStudents, classId }: ClassStudentListProps) {
  const students = useRealtimeSubscription({
    table: 'students',
    initialData: initialStudents,
    orderBy: (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  });

  const filteredStudents = useMemo(() => {
    return students.filter((s) => s.class_id === classId);
  }, [students, classId]);

  const handleDelete = async (studentId: string) => {
    if (!confirm('Tem certeza que deseja remover este aluno da turma?')) return;

    try {
      const result = await deleteStudentAction(studentId);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message || 'Erro ao remover aluno');
      }
    } catch {
      toast.error('Erro inesperado ao remover aluno');
    }
  };

  if (filteredStudents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center border rounded-lg bg-muted/10 border-dashed">
        <div className="bg-background p-3 rounded-full mb-4">
          <UserX className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium">Nenhum aluno nesta turma</h3>
        <p className="text-muted-foreground mt-1 max-w-sm">
          Comece adicionando o primeiro aluno para gerenciar esta turma.
        </p>
      </div>
    );
  }

  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome do Aluno</TableHead>
            <TableHead>Adicionado em</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredStudents.map((student) => (
            <TableRow key={student.id}>
              <TableCell className="font-medium">{student.name}</TableCell>
              <TableCell>
                {format(new Date(student.created_at), "d 'de' MMMM, yyyy", {
                  locale: ptBR,
                })}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Abrir menu</span>
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => handleDelete(student.id)}
                      className="text-red-600 focus:text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Remover da Turma
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
