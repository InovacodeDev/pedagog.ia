'use client';

import { useState, useMemo } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ClassItem } from '@/server/actions/classes';

interface Student {
  id: string;
  name: string;
  grade_level: string;
  created_at: string;
  class_id: string | null;
}

interface StudentsRealtimeTableProps {
  initialStudents: Student[];
  classes: ClassItem[];
}

export function StudentsRealtimeTable({ initialStudents, classes }: StudentsRealtimeTableProps) {
  const [selectedClassId, setSelectedClassId] = useState<string>('all');

  const students = useRealtimeSubscription({
    table: 'students',
    initialData: initialStudents,
    orderBy: (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  });

  const filteredStudents = useMemo(() => {
    if (selectedClassId === 'all') return students;
    return students.filter((s) => s.class_id === selectedClassId);
  }, [students, selectedClassId]);

  const getClassName = (classId: string | null) => {
    if (!classId) return '-';
    return classes.find((c) => c.id === classId)?.name || '-';
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <div className="w-[200px]">
          <Select value={selectedClassId} onValueChange={setSelectedClassId}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por turma" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as turmas</SelectItem>
              {classes.map((cls) => (
                <SelectItem key={cls.id} value={cls.id}>
                  {cls.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredStudents.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground border rounded-lg bg-muted/10">
          Nenhum aluno encontrado.
        </div>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Série</TableHead>
                <TableHead>Turma</TableHead>
                <TableHead>Data de Cadastro</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.map((student) => (
                <TableRow key={student.id}>
                  <TableCell className="font-medium">{student.name}</TableCell>
                  <TableCell>{student.grade_level}</TableCell>
                  <TableCell>{getClassName(student.class_id)}</TableCell>
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
      )}
    </div>
  );
}
