'use client';

import { useState } from 'react';
import amplitude from '@/lib/amplitude';
import { createClassAction } from '@/server/actions/classes';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Plus, X as CloseIcon } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { useRouter } from 'next/navigation';
import { Lock } from 'lucide-react';
import { PricingDialog } from '@/components/subscription/pricing-dialog';

interface CreateClassDialogProps {
  isPro: boolean;
  classesCount: number;
  onSuccess?: () => void;
}

export function CreateClassDialog({ isPro, classesCount, onSuccess }: CreateClassDialogProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [className, setClassName] = useState('');
  const [lessonDays, setLessonDays] = useState<number[]>([]);
  const [disciplines, setDisciplines] = useState<string[]>([]);
  const [disciplineInput, setDisciplineInput] = useState('');
  const [academicYear, setAcademicYear] = useState(new Date().getFullYear());
  const [periodType, setPeriodType] = useState<'bimestre' | 'trimestre' | 'semestre'>('bimestre');
  const [periodStarts, setPeriodStarts] = useState<string[]>(['', '', '', '']);
  const [passingGrade, setPassingGrade] = useState(6.0);
  const [minFrequency, setMinFrequency] = useState(75.0);
  const [examsConfig, setExamsConfig] = useState<Record<string, number>>({});

  const currentYear = new Date().getFullYear();
  const years = [currentYear - 1, currentYear, currentYear + 1];
  const daysOfWeek = [
    { id: 1, label: 'Segunda-feira' },
    { id: 2, label: 'Terça-feira' },
    { id: 3, label: 'Quarta-feira' },
    { id: 4, label: 'Quinta-feira' },
    { id: 5, label: 'Sexta-feira' },
    { id: 6, label: 'Sábado' },
    { id: 0, label: 'Domingo' },
  ];

  const resetForm = () => {
    setClassName('');
    setLessonDays([]);
    setDisciplines([]);
    setDisciplineInput('');
    setAcademicYear(currentYear);
    setPeriodType('bimestre');
    setPeriodStarts(['', '', '', '']);
    setPassingGrade(6.0);
    setMinFrequency(75.0);
    setExamsConfig({});
  };

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
        periodStarts.filter((d) => d !== ''),
        passingGrade,
        minFrequency,
        examsConfig
      );
      if (result.success) {
        amplitude.track('Class Created', {
          className,
          academicYear,
          periodType,
          disciplinesCount: disciplines.length,
        });
        toast.success(result.message);
        setIsOpen(false);
        resetForm();
        router.refresh();
        onSuccess?.();
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error('Erro ao criar turma.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePeriodStartChange = (index: number, value: string) => {
    const newStarts = [...periodStarts];
    newStarts[index] = value;
    setPeriodStarts(newStarts);
  };

  const toggleDay = (dayId: number) => {
    setLessonDays((prev) =>
      prev.includes(dayId) ? prev.filter((d) => d !== dayId) : [...prev, dayId]
    );
  };

  const addDiscipline = () => {
    if (disciplineInput.trim() && !disciplines.includes(disciplineInput.trim())) {
      const name = disciplineInput.trim();
      setDisciplines([...disciplines, name]);
      setExamsConfig({ ...examsConfig, [name]: 4 });
      setDisciplineInput('');
    }
  };

  const updateDisciplineExams = (name: string, count: number) => {
    setExamsConfig({ ...examsConfig, [name]: count });
  };

  const removeDiscipline = (disc: string) => {
    setDisciplines(disciplines.filter((d) => d !== disc));
    const newConfig = { ...examsConfig };
    delete newConfig[disc];
    setExamsConfig(newConfig);
  };

  if (!isPro && classesCount >= 1) {
    return (
      <>
        <Button onClick={() => setIsPricingOpen(true)}>
          <Lock className="mr-2 h-4 w-4" />
          Nova Turma
        </Button>
        <PricingDialog isOpen={isPricingOpen} onOpenChange={setIsPricingOpen} />
      </>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
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
            <div className="space-y-3">
              <Label htmlFor="name">Nome da Turma</Label>
              <Input
                id="name"
                placeholder="Ex: 6º Ano A"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
              />
            </div>
            <div className="space-y-3">
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

          <div className="grid grid-cols-2 gap-4 border p-3 rounded-lg bg-muted/30">
            <div className="space-y-3">
              <Label htmlFor="passing-grade">Média Aprovação</Label>
              <Input
                id="passing-grade"
                type="number"
                step="0.5"
                value={passingGrade}
                onChange={(e) => setPassingGrade(parseFloat(e.target.value))}
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="min-freq">Freq. Mínima (%)</Label>
              <Input
                id="min-freq"
                type="number"
                value={minFrequency}
                onChange={(e) => setMinFrequency(parseInt(e.target.value))}
              />
            </div>
          </div>

          <div className="space-y-4">
            <Label>Tipo de Período</Label>
            <Select
              value={periodType}
              onValueChange={(v) => setPeriodType(v as typeof periodType)}
            >
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

          <div className="space-y-4">
            <Label>Início dos Períodos</Label>
            <div className="grid grid-cols-2 gap-4">
              {Array.from({
                length: periodType === 'bimestre' ? 4 : periodType === 'trimestre' ? 3 : 2,
              }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Label className="text-xs text-muted-foreground">
                    {i + 1}º {periodType.charAt(0).toUpperCase() + periodType.slice(1)}
                  </Label>
                  <DatePicker
                    date={periodStarts[i] ? new Date(periodStarts[i] + 'T00:00:00') : undefined}
                    onChange={(date) =>
                      handlePeriodStartChange(i, date ? date.toISOString().split('T')[0] : '')
                    }
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <Label>Dias de Aula</Label>
            <div className="grid grid-cols-2 gap-3">
              {daysOfWeek.slice(0, 5).map((day) => (
                <div key={day.id} className="flex items-center space-x-3">
                  <Checkbox
                    id={`day-${day.id}`}
                    checked={lessonDays.includes(day.id)}
                    onCheckedChange={() => toggleDay(day.id)}
                  />
                  <Label htmlFor={`day-${day.id}`} className="text-sm font-normal cursor-pointer">
                    {day.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
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
            <div className="flex flex-col gap-3 mt-2">
              {disciplines.map((disc) => (
                <div
                  key={disc}
                  className="flex items-center justify-between p-2 rounded-md border bg-muted/20"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{disc}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Label className="text-xs text-muted-foreground whitespace-nowrap">
                        Qtd. Provas:
                      </Label>
                      <Input
                        type="number"
                        className="w-16 h-8 text-xs"
                        value={examsConfig[disc] ?? 4}
                        onChange={(e) => updateDisciplineExams(disc, parseInt(e.target.value))}
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => removeDiscipline(disc)}
                    >
                      <CloseIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleCreate} disabled={isLoading}>
            {isLoading ? 'Criando...' : 'Criar Turma'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
