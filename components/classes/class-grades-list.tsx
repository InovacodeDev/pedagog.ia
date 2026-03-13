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
import { AddManualGradesDialog } from './add-manual-grades-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ClassGradesListProps {
  classId: string;
  students: { id: string; name: string | null }[];
  schoolPeriod: string;
}

export function ClassGradesList({ classId, students: allStudents, schoolPeriod }: ClassGradesListProps) {

  const [data, setData] = useState<ClassWithGrades | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedTerm, setSelectedTerm] = useState<string>(
    schoolPeriod?.startsWith('trimestral') ? '1_trimestre' : '1_bimestre'
  );

  useEffect(() => {
    async function loadGrades() {
      setIsLoading(true);
      try {
        const classes = await getClassesWithGradesAction(selectedTerm);
        const currentClass = classes.find((c: ClassWithGrades) => c.id === classId);
        if (currentClass) {
          setData(currentClass);
        } else {
          setData(null);
        }
      } catch (error) {
        console.error('Error loading grades:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadGrades();
  }, [classId, selectedTerm, refreshKey]);

  if (isLoading) {
    return <Skeleton className="h-[400px] w-full mt-6" />;
  }

  const students = data?.students_with_grades || [];
  const disciplines = data?.disciplines || [];

  const getGradeBadge = (
    grade: number | null, 
    details?: { exam_title: string; score: number }[],
    popoverTitle: string = 'Detalhes das Provas'
  ) => {
    if (grade === null) return <span className="text-muted-foreground text-xs font-normal">-</span>;
    
    const badge = (
      <Badge 
        className={cn(
          "h-6 px-2 cursor-pointer transition-transform hover:scale-110",
          grade >= 7 ? "bg-green-600 hover:bg-green-700" :
          grade >= 5 ? "bg-yellow-600 hover:bg-yellow-700" :
          "bg-destructive hover:bg-destructive"
        )}
      >
        {grade.toFixed(2)}
        {details && details.length > 0 && <Info className="ml-1 h-3 w-3 opacity-70" />}
      </Badge>
    );

    if (!details || details.length === 0) return badge;

    return (
      <Popover>
        <PopoverTrigger asChild>
          {badge}
        </PopoverTrigger>
        <PopoverContent className="w-64 p-3">
          <div className="space-y-2">
            <h4 className="font-semibold text-sm border-b pb-1">{popoverTitle}</h4>
            <div className="space-y-1.5">
              {details.map((exam, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground truncate mr-2" title={exam.exam_title}>
                    {exam.exam_title}
                  </span>
                  <span className={cn(
                    "font-bold",
                    exam.score >= 7 ? "text-green-600" :
                    exam.score >= 5 ? "text-yellow-600" :
                    "text-red-600"
                  )}>
                    {exam.score.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
            <div className="pt-2 mt-2 border-t flex justify-between items-center text-xs font-bold">
              <span>Média Final</span>
              <span>{grade.toFixed(2)}</span>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Aprovado':
        return <Badge className="bg-green-600 hover:bg-green-700">Aprovado</Badge>;
      case 'Reprovado':
        return <Badge variant="destructive">Reprovado</Badge>;
      case 'Reprovado por Falta':
        return <Badge variant="destructive" className="bg-orange-600 hover:bg-orange-700 border-none">Reprovado por Falta</Badge>;
      default:
        return <Badge variant="secondary">Pendente</Badge>;
    }
  };

  const getFrequencyBadge = (frequency: number | null) => {
    if (frequency === null) return <span className="text-muted-foreground text-xs font-normal">-</span>;
    
    return (
      <Badge 
        variant="outline"
        className={cn(
          "h-6 px-2 font-medium",
          frequency >= (data?.min_frequency || 75) ? "text-green-600 border-green-200 bg-green-50" : "text-destructive border-destructive/20 bg-destructive/5"
        )}
      >
        {frequency.toFixed(1)}%
      </Badge>
    );
  };

  const allTerms = [
    { label: '1º Bimestre', value: '1_bimestre' },
    { label: '2º Bimestre', value: '2_bimestre' },
    { label: '3º Bimestre', value: '3_bimestre' },
    { label: '4º Bimestre', value: '4_bimestre' },
    { label: '1º Trimestre', value: '1_trimestre' },
    { label: '2º Trimestre', value: '2_trimestre' },
    { label: '3º Trimestre', value: '3_trimestre' },
    { label: '1º Semestre', value: '1_semestre' },
    { label: '2º Semestre', value: '2_semestre' },
  ];

  const filteredTerms = allTerms.filter((term: { label: string; value: string }) => {
    if (schoolPeriod === 'trimestre') {
      return term.value.includes('trimestre');
    }
    if (schoolPeriod === 'semestre') {
      return term.value.includes('semestre');
    }
    // Default to bimestral if not trimestral or semestral
    return term.value.includes('bimestre');
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-muted/30 p-4 rounded-xl border border-border/50">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">Período:</span>
          <Select value={selectedTerm} onValueChange={setSelectedTerm}>
            <SelectTrigger className="w-[180px] bg-background">
              <SelectValue placeholder="Selecione o período" />
            </SelectTrigger>
            <SelectContent>
              {filteredTerms.map((term) => (
                <SelectItem key={term.value} value={term.value}>
                  {term.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <AddManualGradesDialog 
          classId={classId} 
          students={allStudents} 
          schoolPeriod={selectedTerm} 
          disciplines={data?.disciplines || []}
          onSuccess={() => setRefreshKey(prev => prev + 1)}
        />
      </div>

      {students.length === 0 ? (
        <div className="py-12 flex flex-col items-center justify-center border rounded-xl bg-background shadow-sm">
          <DataUnavailable
            title="Nenhuma nota encontrada"
            message="Avalie as provas dos alunos ou lance notas manualmente para ver as médias aqui."
          />
        </div>
      ) : (
        <div className="relative border rounded-xl overflow-hidden bg-background shadow-sm">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="sticky left-0 bg-muted/50 z-20 w-[200px] border-r shadow-[2px_0_5px_rgba(0,0,0,0.05)] font-bold">
                    Estudante
                  </TableHead>
                  {disciplines.map(discipline => (
                    <TableHead key={discipline} className="text-center min-w-[120px] font-bold border-r">
                      {discipline}
                    </TableHead>
                  ))}
                  <TableHead className="text-center min-w-[100px] font-bold border-r">
                    Frequência
                  </TableHead>
                  <TableHead className="text-center min-w-[130px] font-bold border-r">
                    Status Final
                  </TableHead>
                  <TableHead className="text-center min-w-[120px] font-bold bg-primary/5 text-primary">
                    Média Geral
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="sticky left-0 bg-background z-10 font-medium border-r shadow-[2px_0_5px_rgba(0,0,0,0.02)] whitespace-nowrap">
                      {student.name || 'Sem Nome'}
                    </TableCell>
                    {disciplines.map(discipline => (
                      <TableCell key={discipline} className="text-center border-r">
                        {getGradeBadge(
                          student.discipline_grades[discipline] ?? null,
                          student.discipline_exam_details[discipline]
                        )}
                      </TableCell>
                    ))}
                    <TableCell className="text-center border-r">
                      {getFrequencyBadge(student.frequency)}
                    </TableCell>
                    <TableCell className="text-center border-r">
                      {getStatusBadge(student.status)}
                    </TableCell>
                    <TableCell className="text-center font-bold bg-primary/5">
                      {getGradeBadge(
                        student.average,
                        disciplines
                          .filter(d => student.discipline_grades[d] !== null)
                          .map(d => ({
                            exam_title: d,
                            score: student.discipline_grades[d] as number
                          })),
                        'Médias por Matéria'
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}
