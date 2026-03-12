'use client';

import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { DataUnavailable } from '@/components/ui/data-unavailable';
import { getClassesWithGradesAction, ClassWithGrades } from '@/server/actions/classes';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { AddManualGradesDialog } from './add-manual-grades-dialog';

interface ClassGradesListProps {
  classId: string;
  students: { id: string; name: string | null }[];
  schoolPeriod: string;
}

export function ClassGradesList({ classId, students: allStudents, schoolPeriod }: ClassGradesListProps) {

  const [data, setData] = useState<ClassWithGrades | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadGrades() {
      setIsLoading(true);
      try {
        const classes = await getClassesWithGradesAction('1_trimestre');
        const currentClass = classes.find((c: ClassWithGrades) => c.id === classId);
        if (currentClass) {
          setData(currentClass);
        }
      } catch (error) {
        console.error('Error loading grades:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadGrades();
  }, [classId]);

  if (isLoading) {
    return <Skeleton className="h-[400px] w-full mt-6" />;
  }

  const students = data?.students_with_grades || [];

  const getGradeBadge = (average: number | null) => {
    if (average === null) return <Badge variant="secondary">-</Badge>;
    if (average >= 7)
      return <Badge className="bg-green-600 hover:bg-green-700">{average.toFixed(1)}</Badge>;
    if (average >= 5)
      return <Badge className="bg-yellow-600 hover:bg-yellow-700">{average.toFixed(1)}</Badge>;
    return <Badge variant="destructive">{average.toFixed(1)}</Badge>;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <AddManualGradesDialog classId={classId} students={allStudents} schoolPeriod={schoolPeriod} />
      </div>


      {students.length === 0 ? (
        <div className="py-8">
          <DataUnavailable
            title="Nenhuma nota encontrada"
            message="Avalie as provas dos alunos ou lance notas manualmente para ver as médias aqui."
          />
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Estudante</TableHead>
                <TableHead className="text-center">Média Geral (Período Atual)</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student) => (
                <TableRow key={student.id}>
                  <TableCell className="font-medium">{student.name || 'Sem Nome'}</TableCell>

                  <TableCell className="text-center font-bold">
                    {getGradeBadge(student.average)}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={cn(
                      "text-xs font-semibold px-2 py-1 rounded-full",
                      student.average === null ? "bg-slate-100 text-slate-500" :
                      student.average >= 6 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    )}>
                      {student.average === null ? "S/ NOTA" : student.average >= 6 ? "APROVADO" : "RECUPERAÇÃO"}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
