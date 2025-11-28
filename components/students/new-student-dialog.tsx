'use client';

import * as React from 'react';
import { Plus, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createStudentAction } from '@/server/actions/students';
import { getClassesAction, ClassItem } from '@/server/actions/classes';
import { toast } from 'sonner';

interface NewStudentDialogProps {
  defaultClassId?: string;
}

export function NewStudentDialog({ defaultClassId }: NewStudentDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [name, setName] = React.useState('');
  const [classId, setClassId] = React.useState(defaultClassId || '');
  const [classes, setClasses] = React.useState<ClassItem[]>([]);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (open && !defaultClassId) {
      getClassesAction()
        .then((data) => setClasses(data))
        .catch(() => toast.error('Erro ao carregar turmas'));
    }
  }, [open, defaultClassId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const targetClassId = defaultClassId || classId;

    if (!targetClassId) {
      setError('Selecione uma turma');
      setIsLoading(false);
      return;
    }

    try {
      const result = await createStudentAction({
        name,
        class_id: targetClassId,
      });

      if (result.success) {
        toast.success('Aluno criado com sucesso!');
        setOpen(false);
        setName('');
        if (!defaultClassId) setClassId('');
      } else {
        setError(result.error || 'Erro ao criar aluno');
        toast.error(result.error || 'Erro ao criar aluno');
      }
    } catch {
      setError('Erro inesperado');
      toast.error('Erro inesperado');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Novo Aluno
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar Novo Aluno</DialogTitle>
          <DialogDescription>
            Preencha os dados do aluno para adicioná-lo à sua lista.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="name">Nome Completo</Label>
            <Input
              id="name"
              placeholder="Ex: João da Silva"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {!defaultClassId && (
            <div className="space-y-2">
              <Label htmlFor="class">Turma</Label>
              <Select value={classId} onValueChange={setClassId} required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma turma" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Adicionar Aluno
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
