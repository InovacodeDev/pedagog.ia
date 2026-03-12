'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ClassWithGrades,
  createClassAction,
  deleteClassAction,
  updateClassAction,
} from '@/server/actions/classes';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { DatePicker } from '@/components/ui/date-picker';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  Plus,
  MoreVertical,
  Settings2,
  Trash2,
  Users,
  X as CloseIcon,
  Calendar,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';

interface ClassesListProps {
  initialClasses: ClassWithGrades[];
}

export function ClassesList({ initialClasses }: ClassesListProps) {

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<ClassWithGrades | null>(null);
  const [className, setClassName] = useState('');
  const [lessonDays, setLessonDays] = useState<number[]>([]);
  const [disciplines, setDisciplines] = useState<string[]>([]);
  const [disciplineInput, setDisciplineInput] = useState('');
  const [academicYear, setAcademicYear] = useState(new Date().getFullYear());
  const [periodType, setPeriodType] = useState<'bimestre' | 'trimestre' | 'semestre'>('bimestre');
  const [periodStarts, setPeriodStarts] = useState<string[]>(['', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);

  const daysOfWeek = [
    { id: 1, label: 'Segunda-feira' },
    { id: 2, label: 'Terça-feira' },
    { id: 3, label: 'Quarta-feira' },
    { id: 4, label: 'Quinta-feira' },
    { id: 5, label: 'Sexta-feira' },
    { id: 6, label: 'Sábado' },
    { id: 0, label: 'Domingo' },
  ];

  const currentYear = new Date().getFullYear();
  const years = [currentYear - 1, currentYear, currentYear + 1];

  const handleCreate = async () => {
    if (!className.trim()) return;
    setIsLoading(true);
    try {
      const result = await createClassAction(
        className,
        lessonDays,
        disciplines,
        academicYear,
        periodType,
        periodStarts.filter((d) => d !== '')
      );
      if (result.success) {
        toast.success(result.message);
        setIsCreateOpen(false);
        resetForm();
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error('Erro ao criar turma.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setClassName('');
    setLessonDays([]);
    setDisciplines([]);
    setDisciplineInput('');
    setAcademicYear(currentYear);
    setPeriodType('bimestre');
    setPeriodStarts(['', '', '', '']);
  };

  const handleUpdate = async () => {
    if (!selectedClass || !className.trim()) return;
    setIsLoading(true);
    try {
      const result = await updateClassAction(
        selectedClass.id,
        className,
        lessonDays,
        disciplines,
        academicYear,
        periodType,
        periodStarts.filter((d) => d !== '')
      );
      if (result.success) {
        toast.success(result.message);
        setIsEditOpen(false);
        resetForm();
        setSelectedClass(null);
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error('Erro ao atualizar turma.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta turma?')) return;

    try {
      const result = await deleteClassAction(id);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error('Erro ao excluir turma.');
    }
  };

  const openEdit = (cls: ClassWithGrades) => {
    setSelectedClass(cls);
    setClassName(cls.name);
    setLessonDays(cls.lesson_days || []);
    setDisciplines(cls.disciplines || []);
    setAcademicYear(cls.academic_year || currentYear);
    setPeriodType(cls.period_type || 'bimestre');

    const starts = cls.period_starts || [];
    const newStarts = ['', '', '', ''];
    starts.forEach((s, i) => {
      if (i < 4) newStarts[i] = s;
    });
    setPeriodStarts(newStarts);

    setIsEditOpen(true);
  };

  const addDiscipline = () => {
    if (disciplineInput.trim() && !disciplines.includes(disciplineInput.trim())) {
      setDisciplines([...disciplines, disciplineInput.trim()]);
      setDisciplineInput('');
    }
  };

  const removeDiscipline = (disc: string) => {
    setDisciplines(disciplines.filter((d) => d !== disc));
  };

  const toggleDay = (dayId: number) => {
    setLessonDays((prev) =>
      prev.includes(dayId) ? prev.filter((d) => d !== dayId) : [...prev, dayId]
    );
  };


  const getGradeColor = (grade: number | null) => {
    if (grade === null) return 'text-muted-foreground';
    if (grade >= 7) return 'text-green-600';
    if (grade >= 5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const isClassFinished = (cls: ClassWithGrades) => {
    return currentYear > (cls.academic_year || 0);
  };

  const handlePeriodStartChange = (index: number, value: string) => {
    const newStarts = [...periodStarts];
    newStarts[index] = value;
    setPeriodStarts(newStarts);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Minhas Turmas</h1>
        <div className="flex items-center gap-2">
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="mr-2 h-4 w-4" />
                Nova Turma
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Nova Turma</DialogTitle>
              </DialogHeader>
              <div className="space-y-6 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome da Turma</Label>
                    <Input
                      id="name"
                      placeholder="Ex: 6º Ano A"
                      value={className}
                      onChange={(e) => setClassName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="year">Ano Letivo</Label>
                    <Select
                      value={String(academicYear)}
                      onValueChange={(v) => setAcademicYear(Number(v))}
                    >
                      <SelectTrigger id="year">
                        <SelectValue placeholder="Selecione o ano" />
                      </SelectTrigger>
                      <SelectContent>
                        {years.map((y) => (
                          <SelectItem key={y} value={String(y)}>
                            {y}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Tipo de Período</Label>
                  <Select value={periodType} onValueChange={(v) => setPeriodType(v as typeof periodType)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bimestre">Bimestre (4 por ano)</SelectItem>
                      <SelectItem value="trimestre">Trimestre (3 por ano)</SelectItem>
                      <SelectItem value="semestre">Semestre (2 por ano)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label>Início dos Períodos</Label>
                  <div className="grid grid-cols-2 gap-4">
                    {Array.from({
                      length: periodType === 'bimestre' ? 4 : periodType === 'trimestre' ? 3 : 2,
                    }).map((_, i) => (
                      <div key={i} className="space-y-1">
                        <Label className="text-xs text-muted-foreground">
                          {i + 1}º {periodType.charAt(0).toUpperCase() + periodType.slice(1)}
                        </Label>
                        <DatePicker
                          date={periodStarts[i] ? new Date(periodStarts[i] + 'T00:00:00') : undefined}
                          onChange={(date) => handlePeriodStartChange(i, date ? date.toISOString().split('T')[0] : '')}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Dias de Aula</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {daysOfWeek.slice(0, 5).map((day) => (
                      <div key={day.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`day-${day.id}`}
                          checked={lessonDays.includes(day.id)}
                          onCheckedChange={() => toggleDay(day.id)}
                        />
                        <Label
                          htmlFor={`day-${day.id}`}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {day.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Matérias/Disciplinas</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Ex: Matemática"
                      value={disciplineInput}
                      onChange={(e) => setDisciplineInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addDiscipline())}
                    />
                    <Button type="button" variant="secondary" onClick={addDiscipline}>
                      Adicionar
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {disciplines.map((disc) => (
                      <Badge key={disc} variant="secondary" className="pl-2 pr-1 py-1 gap-1">
                        {disc}
                        <button
                          onClick={() => removeDiscipline(disc)}
                          className="hover:bg-muted rounded-full p-0.5"
                        >
                          <CloseIcon className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreate} disabled={isLoading}>
                  {isLoading ? 'Criando...' : 'Criar Turma'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {initialClasses.map((cls) => (
          <Card
            key={cls.id}
            className={cn(
              'hover:shadow-lg transition-shadow flex flex-col relative overflow-hidden',
              isClassFinished(cls) && 'opacity-80 grayscale-[0.2]'
            )}
          >
            {isClassFinished(cls) && (
              <div className="absolute top-0 right-0 bg-amber-100 text-amber-800 px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-bl-lg z-10 border-l border-b border-amber-200 shadow-sm flex items-center gap-1">
                <Calendar className="h-3 w-3" /> Finalizada ({cls.academic_year})
              </div>
            )}
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <div className="space-y-1">
                <Link href={`/classes/${cls.id}`} className="hover:underline transition-all">
                  <CardTitle className="text-xl font-bold">{cls.name}</CardTitle>
                </Link>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px] h-5">
                    {cls.academic_year || currentYear}
                  </Badge>
                  <Badge variant="secondary" className="text-[10px] h-5 capitalize">
                    {cls.period_type || 'bimestre'}
                  </Badge>
                </div>
              </div>
              {!isClassFinished(cls) && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Abrir menu</span>
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => openEdit(cls)}>
                      <Settings2 className="mr-2 h-4 w-4" />
                      Configurar turma
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDelete(cls.id)}
                      className="text-red-600 focus:text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <div className="flex items-center space-x-2 text-2xl font-bold mb-4">
                <Users className="h-5 w-5 text-muted-foreground" />
                <span>{cls.students && cls.students.length > 0 ? cls.students[0].count : 0}</span>
                <span className="text-sm font-normal text-muted-foreground">alunos</span>
              </div>

              <div className="mt-auto border-t pt-4">
                <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
                  Média Geral (Período Atual)
                </p>
                <ScrollArea className="h-[200px] -mr-4 pr-4">
                  <div className="space-y-3">
                    {cls.students_with_grades && cls.students_with_grades.length > 0 ? (
                      cls.students_with_grades.map((student) => (
                        <div
                          key={student.id}
                          className="flex justify-between items-center text-sm group/student hover:bg-muted/50 p-1 rounded transition-colors"
                        >
                          <span className="truncate font-medium text-slate-700 dark:text-slate-300">
                            {student.name}
                          </span>
                          <span
                            className={cn('font-bold tabular-nums', getGradeColor(student.average))}
                          >
                            {student.average !== null ? student.average.toFixed(2) : '-'}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full py-8 text-center text-muted-foreground text-sm">
                        <p>Nenhum aluno cadastrado.</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>
            </CardContent>
          </Card>
        ))}
        {initialClasses.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center p-8 text-center border rounded-lg border-dashed">
            <p className="text-muted-foreground mb-4">Você ainda não possui turmas cadastradas.</p>
            <Button variant="outline" onClick={() => setIsCreateOpen(true)}>
              Criar primeira turma
            </Button>
          </div>
        )}
      </div>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Configurar Turma</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nome da Turma</Label>
                <Input
                  id="edit-name"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-year">Ano Letivo</Label>
                <Select
                  value={String(academicYear)}
                  onValueChange={(v) => setAcademicYear(Number(v))}
                >
                  <SelectTrigger id="edit-year">
                    <SelectValue placeholder="Selecione o ano" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((y) => (
                      <SelectItem key={y} value={String(y)}>
                        {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3">
              <Label>Tipo de Período</Label>
              <Select value={periodType} onValueChange={(v) => setPeriodType(v as typeof periodType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bimestre">Bimestre (4 por ano)</SelectItem>
                  <SelectItem value="trimestre">Trimestre (3 por ano)</SelectItem>
                  <SelectItem value="semestre">Semestre (2 por ano)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label>Início dos Períodos</Label>
              <div className="grid grid-cols-2 gap-4">
                {Array.from({
                  length: periodType === 'bimestre' ? 4 : periodType === 'trimestre' ? 3 : 2,
                }).map((_, i) => (
                  <div key={i} className="space-y-1">
                    <Label className="text-xs text-muted-foreground">
                      {i + 1}º {periodType.charAt(0).toUpperCase() + periodType.slice(1)}
                    </Label>
                    <DatePicker
                      date={periodStarts[i] ? new Date(periodStarts[i] + 'T00:00:00') : undefined}
                      onChange={(date) => handlePeriodStartChange(i, date ? date.toISOString().split('T')[0] : '')}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Label>Dias de Aula</Label>
              <div className="grid grid-cols-2 gap-3">
                {daysOfWeek.slice(0, 5).map((day) => (
                  <div key={day.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`edit-day-${day.id}`}
                      checked={lessonDays.includes(day.id)}
                      onCheckedChange={() => toggleDay(day.id)}
                    />
                    <Label
                      htmlFor={`edit-day-${day.id}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {day.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Label>Matérias/Disciplinas</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Ex: Matemática"
                  value={disciplineInput}
                  onChange={(e) => setDisciplineInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addDiscipline())}
                />
                <Button type="button" variant="secondary" onClick={addDiscipline}>
                  Adicionar
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {disciplines.map((disc) => (
                  <Badge key={disc} variant="secondary" className="pl-2 pr-1 py-1 gap-1">
                    {disc}
                    <button
                      onClick={() => removeDiscipline(disc)}
                      className="hover:bg-muted rounded-full p-0.5"
                    >
                      <CloseIcon className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleUpdate} disabled={isLoading}>
              {isLoading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
