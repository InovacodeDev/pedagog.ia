'use client';

import { useState, useEffect, useMemo } from 'react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isWeekend, 
  isFuture, 
  isSameDay,
  parseISO,
  startOfDay
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Check, 
  X, 
  Clock, 
  Save,
  ChevronLeft,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { recordAttendanceAction, getMonthAttendanceAction, type AttendanceRecord } from '@/server/actions/attendance';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

interface Student {
  id: string;
  name: string | null;
}

interface AttendanceFormProps {
  classId: string;
  students: Student[];
}

type AttendanceStatus = 'present' | 'absent' | 'late';

// Map studentId -> date -> status
type MonthlyAttendance = Record<string, Record<string, AttendanceStatus>>;

export function AttendanceForm({ classId, students }: AttendanceFormProps) {
  const [currentMonth, setCurrentMonth] = useState<Date>(startOfMonth(new Date()));
  const [attendance, setAttendance] = useState<MonthlyAttendance>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Generate business days for the selected month
  const businessDays = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end }).filter(day => !isWeekend(day));
  }, [currentMonth]);

  useEffect(() => {
    async function loadMonthlyAttendance() {
      setIsLoading(true);
      const start = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
      const end = format(endOfMonth(currentMonth), 'yyyy-MM-dd');
      const res = await getMonthAttendanceAction(classId, start, end);
      
      if (res.success && res.records) {
        const newAttendance: MonthlyAttendance = {};
        
        // Initialize with default 'present' for all students and business days
        students.forEach(student => {
          newAttendance[student.id] = {};
          businessDays.forEach(day => {
            const dateStr = format(day, 'yyyy-MM-dd');
            newAttendance[student.id][dateStr] = 'present';
          });
        });

        // Overlay existing records
        res.records.forEach((record) => {
          if (newAttendance[record.student_id]) {
            newAttendance[record.student_id][record.date] = record.status as AttendanceStatus;
          }
        });

        setAttendance(newAttendance);
      } else {
        // Default all to present if no records found or error
        const defaultAttendance: MonthlyAttendance = {};
        students.forEach(student => {
          defaultAttendance[student.id] = {};
          businessDays.forEach(day => {
            const dateStr = format(day, 'yyyy-MM-dd');
            defaultAttendance[student.id][dateStr] = 'present';
          });
        });
        setAttendance(defaultAttendance);
      }
      setIsLoading(false);
    }
    loadMonthlyAttendance();
  }, [currentMonth, classId, students, businessDays]);

  const handleStatusToggle = (studentId: string, dateStr: string) => {
    const date = parseISO(dateStr);
    if (isFuture(startOfDay(date))) return;

    setAttendance(prev => {
      const currentStatus = prev[studentId]?.[dateStr] || 'present';
      let nextStatus: AttendanceStatus;
      
      if (currentStatus === 'present') nextStatus = 'absent';
      else if (currentStatus === 'absent') nextStatus = 'late';
      else nextStatus = 'present';

      return {
        ...prev,
        [studentId]: {
          ...prev[studentId],
          [dateStr]: nextStatus
        }
      };
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const dates = businessDays.map(d => format(d, 'yyyy-MM-dd'));
      const allRecords: AttendanceRecord[] = [];

      dates.forEach(dateStr => {
        // Skip future dates
        if (isFuture(startOfDay(parseISO(dateStr)))) return;
        
        students.forEach(student => {
          allRecords.push({
            student_id: student.id,
            status: attendance[student.id]?.[dateStr] || 'present',
            date: dateStr
          });
        });
      });

      if (allRecords.length === 0) {
        toast.info('Nenhuma alteração para salvar.');
        setIsSaving(false);
        return;
      }

      const res = await recordAttendanceAction(classId, allRecords);
      
      if (res.success) {
        toast.success(res.message || 'Presença do mês atualizada com sucesso!');
      } else {
        toast.error(res.message || 'Erro ao salvar presença.');
      }
    } catch (err: unknown) {
      console.error('[AttendanceForm] save error:', err);
      toast.error('Erro inesperado ao salvar.');
    } finally {
      setIsSaving(false);
    }
  };

  const changeMonth = (offset: number) => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() + offset);
    setCurrentMonth(startOfMonth(newDate));
  };

  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  if (isLoading && Object.keys(attendance).length === 0) {
    return (
      <div className="space-y-4 py-4">
        <Skeleton className="h-10 w-[300px]" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 py-4">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-muted/30 p-4 rounded-xl border border-border/50">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 bg-background border rounded-lg p-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => changeMonth(-1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <Select 
              value={currentMonth.getMonth().toString()} 
              onValueChange={(val) => {
                const newDate = new Date(currentMonth);
                newDate.setMonth(parseInt(val));
                setCurrentMonth(startOfMonth(newDate));
              }}
            >
              <SelectTrigger className="h-8 w-[130px] border-none focus:ring-0">
                <SelectValue placeholder="Mês" />
              </SelectTrigger>
              <SelectContent>
                {months.map((month, idx) => (
                  <SelectItem key={month} value={idx.toString()}>{month}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select 
              value={currentMonth.getFullYear().toString()} 
              onValueChange={(val) => {
                const newDate = new Date(currentMonth);
                newDate.setFullYear(parseInt(val));
                setCurrentMonth(startOfMonth(newDate));
              }}
            >
              <SelectTrigger className="h-8 w-[90px] border-none focus:ring-0">
                <SelectValue placeholder="Ano" />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => changeMonth(1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="hidden sm:flex items-center gap-4 px-4 border-l h-8 text-sm font-medium">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-muted-foreground">Presença</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-muted-foreground">Falta</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <span className="text-muted-foreground">Atraso</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mr-2">
            <AlertCircle className="h-3 w-3" />
            <span>Dias futuros desabilitados</span>
          </div>
          <Button onClick={handleSave} disabled={isSaving || isLoading} className="gap-2 shadow-sm">
            {isSaving ? "Salvando..." : <><Save className="h-4 w-4" /> Salvar Alterações</>}
          </Button>
        </div>
      </div>

      <div className="relative border rounded-xl overflow-hidden bg-background shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="sticky left-0 bg-muted/50 z-20 w-[200px] border-r shadow-[2px_0_5px_rgba(0,0,0,0.05)] font-bold">
                  Estudante
                </TableHead>
                {businessDays.map((day) => {
                  const isToday = isSameDay(day, new Date());
                  return (
                    <TableHead 
                      key={day.toString()} 
                      className={cn(
                        "text-center min-w-[45px] p-2 text-xs font-bold border-r last:border-r-0",
                        isToday && "bg-primary/10 text-primary"
                      )}
                    >
                      <div className="flex flex-col items-center">
                        <span className="uppercase text-[10px] opacity-70">
                          {format(day, 'eee', { locale: ptBR })}
                        </span>
                        <span className="text-sm">
                          {format(day, 'dd')}
                        </span>
                      </div>
                    </TableHead>
                  );
                })}
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student) => (
                <TableRow key={student.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="sticky left-0 bg-background z-10 font-medium border-r shadow-[2px_0_5px_rgba(0,0,0,0.02)] whitespace-nowrap">
                    {student.name}
                  </TableCell>
                  {businessDays.map((day) => {
                    const dateStr = format(day, 'yyyy-MM-dd');
                    const status = attendance[student.id]?.[dateStr] || 'present';
                    const isFut = isFuture(startOfDay(day));
                    const isToday = isSameDay(day, new Date());

                    return (
                      <TableCell 
                        key={`${student.id}-${dateStr}`}
                        className={cn(
                          "p-0 text-center border-r last:border-r-0 transition-opacity",
                          isFut && "opacity-30 bg-muted/20 cursor-not-allowed",
                          isToday && "bg-primary/5"
                        )}
                      >
                        <button
                          disabled={isFut}
                          onClick={() => handleStatusToggle(student.id, dateStr)}
                          className={cn(
                            "w-full h-12 flex items-center justify-center transition-all hover:scale-110",
                            !isFut && "cursor-pointer"
                          )}
                          title={`${student.name} - ${format(day, 'dd/MM')}: ${
                            status === 'present' ? 'Presença' : status === 'absent' ? 'Falta' : 'Atraso'
                          }`}
                        >
                          {status === 'present' && <Check className="h-5 w-5 text-green-500" strokeWidth={3} />}
                          {status === 'absent' && <X className="h-5 w-5 text-red-500" strokeWidth={3} />}
                          {status === 'late' && <Clock className="h-5 w-5 text-yellow-500" strokeWidth={3} />}
                        </button>
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
              {students.length === 0 && (
                <TableRow>
                  <TableCell colSpan={businessDays.length + 1} className="text-center py-12 text-muted-foreground italic">
                    Nenhum aluno cadastrado nesta turma.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
