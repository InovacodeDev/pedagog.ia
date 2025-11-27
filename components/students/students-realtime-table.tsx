'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useRealtimeSubscription } from '@/hooks/use-realtime-subscription';

interface Student {
  id: string;
  name: string;
  grade_level: string;
  created_at: string;
}

interface StudentsRealtimeTableProps {
  initialStudents: Student[];
}

export function StudentsRealtimeTable({ initialStudents }: StudentsRealtimeTableProps) {
  const students = useRealtimeSubscription({
    table: 'students',
    initialData: initialStudents,
    orderBy: (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  });

  if (students.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground border rounded-lg bg-muted/10">
        Nenhum aluno cadastrado.
      </div>
    );
  }

  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Série</TableHead>
            <TableHead>Data de Cadastro</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.map((student) => (
            <TableRow key={student.id}>
              <TableCell className="font-medium">{student.name}</TableCell>
              <TableCell>{student.grade_level}</TableCell>
              <TableCell>
                {format(new Date(student.created_at), "d 'de' MMMM, yyyy", {
                  locale: ptBR,
                })}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
