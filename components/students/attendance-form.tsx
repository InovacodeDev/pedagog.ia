'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar as CalendarIcon, Check, X, Clock, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { recordAttendanceAction, getAttendanceAction } from '@/server/actions/attendance';
import { toast } from 'sonner';

interface Student {
  id: string;
  name: string | null;
}

interface AttendanceFormProps {
  classId: string;
  students: Student[];
}

type AttendanceStatus = 'present' | 'absent' | 'late';

interface AttendanceRecord {
  student_id: string;
  status: string;
}

export function AttendanceForm({ classId, students }: AttendanceFormProps) {
  const [date, setDate] = useState<Date>(new Date());
  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function loadAttendance() {
      setIsLoading(true);
      const formattedDate = format(date, 'yyyy-MM-dd');
      const res = await getAttendanceAction(classId, formattedDate);
      
      if (res.success && res.records) {
        const newAttendance: Record<string, AttendanceStatus> = {};
        (res.records as AttendanceRecord[]).forEach((record) => {
          newAttendance[record.student_id] = record.status as AttendanceStatus;
        });
        setAttendance(newAttendance);
      } else {

        // Default all to present if no records found
        const defaultAttendance: Record<string, AttendanceStatus> = {};
        students.forEach(s => {
          defaultAttendance[s.id] = 'present';
        });
        setAttendance(defaultAttendance);
      }
      setIsLoading(false);
    }
    loadAttendance();
  }, [date, classId, students]);

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setAttendance(prev => ({ ...prev, [studentId]: status }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    const records = Object.entries(attendance).map(([studentId, status]) => ({
      student_id: studentId,
      status
    }));

    const formattedDate = format(date, 'yyyy-MM-dd');
    const res = await recordAttendanceAction(classId, formattedDate, records);

    if (res.success) {
      toast.success(res.message);
    } else {
      toast.error(res.message);
    }
    setIsSaving(false);
  };

  const stats = {
    present: Object.values(attendance).filter(s => s === 'present').length,
    absent: Object.values(attendance).filter(s => s === 'absent').length,
    late: Object.values(attendance).filter(s => s === 'late').length,
  };

  return (
    <div className="space-y-6 py-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-[240px] justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP", { locale: ptBR }) : <span>Selecione uma data</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(d: Date | undefined) => d && setDate(d)}

                initialFocus
              />
            </PopoverContent>
          </Popover>

          <div className="flex items-center gap-4 text-sm font-medium">
            <span className="text-green-600">Presentes: {stats.present}</span>
            <span className="text-red-600">Ausentes: {stats.absent}</span>
            <span className="text-yellow-600">Atrasos: {stats.late}</span>
          </div>
        </div>

        <Button onClick={handleSave} disabled={isSaving || isLoading}>
          {isSaving ? (
            "Salvando..."
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Salvar Presença
            </>
          )}
        </Button>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Estudante</TableHead>
              <TableHead className="text-center w-[300px]">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((student) => (
              <TableRow key={student.id}>
                <TableCell className="font-medium">{student.name}</TableCell>
                <TableCell>
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      size="sm"
                      variant={attendance[student.id] === 'present' ? 'default' : 'outline'}
                      className={cn(
                        "h-8 px-3 transition-all",
                        attendance[student.id] === 'present' && "bg-green-600 hover:bg-green-700"
                      )}
                      onClick={() => handleStatusChange(student.id, 'present')}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Presença
                    </Button>
                    <Button
                      size="sm"
                      variant={attendance[student.id] === 'absent' ? 'default' : 'outline'}
                      className={cn(
                        "h-8 px-3 transition-all",
                        attendance[student.id] === 'absent' && "bg-red-600 hover:bg-red-700"
                      )}
                      onClick={() => handleStatusChange(student.id, 'absent')}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Falta
                    </Button>
                    <Button
                      size="sm"
                      variant={attendance[student.id] === 'late' ? 'default' : 'outline'}
                      className={cn(
                        "h-8 px-3 transition-all",
                        attendance[student.id] === 'late' && "bg-yellow-600 hover:bg-yellow-700"
                      )}
                      onClick={() => handleStatusChange(student.id, 'late')}
                    >
                      <Clock className="h-4 w-4 mr-1" />
                      Atraso
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {students.length === 0 && (
              <TableRow>
                <TableCell colSpan={2} className="text-center py-8 text-muted-foreground">
                  Nenhum aluno cadastrado nesta turma.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
