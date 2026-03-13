'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PlusCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { saveManualGradesAction } from '@/server/actions/grades';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TERM_LABELS } from '@/lib/terms';

interface Student {
  id: string;
  name: string | null;
}

interface AddManualGradesDialogProps {
  classId: string;
  students: Student[];
  schoolPeriod: string;
  disciplines: string[];
}


export function AddManualGradesDialog({
  classId,
  students,
  schoolPeriod,
  disciplines,
}: AddManualGradesDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [discipline, setDiscipline] = useState(disciplines[0] || '');

  // Filter labels based on school period type
  const filteredTermLabels = Object.fromEntries(
    Object.entries(TERM_LABELS).filter(([key]) => key.includes(schoolPeriod))
  );

  const [term, setTerm] = useState(`1_${schoolPeriod}`);
  const [grades, setGrades] = useState<Record<string, string>>({});

  const router = useRouter();

  const handleScoreChange = (studentId: string, score: string) => {
    // Basic validation for score (0-10, can have 1 decimal)
    const val = score.replace(',', '.');
    if (val === '' || (parseFloat(val) >= 0 && parseFloat(val) <= 10)) {
      setGrades((prev) => ({ ...prev, [studentId]: score }));
    }
  };

  const onSubmit = async () => {
    if (!title || !discipline) {
      toast.error('Preencha o título e a disciplina');
      return;
    }

    setIsLoading(true);

    try {
      const formattedGrades = Object.entries(grades)
        .filter(([, score]) => score !== '')

        .map(([studentId, score]) => ({
          studentId,
          score: parseFloat(score.replace(',', '.')),
        }));

      if (formattedGrades.length === 0) {
        toast.error('Adicione pelo menos uma nota');
        return;
      }

      const result = await saveManualGradesAction({
        classId,
        title,
        discipline,
        term,
        grades: formattedGrades,
      });

      if (result.success) {
        toast.success('Notas salvas com sucesso!');
        setOpen(false);
        // Reset form
        setTitle('');
        setDiscipline(disciplines[0] || '');
        setGrades({});
        router.refresh();
      } else {
        toast.error(result.error || 'Erro ao salvar notas');
      }
    } catch (err: unknown) {
      console.error('Error in onSubmit:', err);
      toast.error('Um erro inesperado ocorreu');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <PlusCircle className="h-4 w-4" />
          Lançar Notas
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[512px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Lançar Notas Manuais</DialogTitle>
          <DialogDescription>
            Insira os resultados de avaliações externas ou trabalhos realizados fora da plataforma.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4 overflow-y-auto pr-2">
          <div className="grid grid-cols-2 gap-4 pl-1">
            <div className="space-y-2">
              <Label htmlFor="title">Título da Avaliação</Label>
              <Input
                id="title"
                placeholder="Ex: Prova Mensal"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-2"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="discipline">Disciplina</Label>
              <Select value={discipline} onValueChange={setDiscipline}>
                <SelectTrigger id="discipline" className="mt-2">
                  <SelectValue placeholder="Selecione a disciplina" />
                </SelectTrigger>
                <SelectContent>
                  {disciplines.length > 0 ? (
                    disciplines.map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="Outros" disabled>
                      Nenhuma disciplina configurada
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4 pl-1">
            <Label htmlFor="term" className="mb-2">
              Período / Bimestre
            </Label>
            <Select value={term} onValueChange={setTerm}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o período" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(filteredTermLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4 pl-1">
            <Label>Notas dos Alunos</Label>
            <ScrollArea className="h-[300px] rounded-md border p-4 mt-2">
              <div className="space-y-4">
                {students.length === 0 ? (
                  <p className="text-center text-sm text-muted-foreground py-4">
                    Nenhum aluno cadastrado nesta turma.
                  </p>
                ) : (
                  students.map((student) => (
                    <div
                      key={student.id}
                      className="flex items-center justify-between gap-4 pr-1 py-1"
                    >
                      <Label htmlFor={`grade-${student.id}`} className="flex-1 truncate">
                        {student.name || 'Sem Nome'}
                      </Label>

                      <Input
                        id={`grade-${student.id}`}
                        type="text"
                        placeholder="0.0"
                        className="w-20 text-right"
                        value={grades[student.id] || ''}
                        onChange={(e) => handleScoreChange(student.id, e.target.value)}
                      />
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
            Cancelar
          </Button>
          <Button onClick={onSubmit} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Salvar Notas
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
