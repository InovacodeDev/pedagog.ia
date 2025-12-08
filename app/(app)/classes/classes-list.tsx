'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
import { Plus, MoreVertical, Pencil, Trash2, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ClassesListProps {
  initialClasses: ClassWithGrades[];
  currentTerm: string;
}

const TERM_LABELS: Record<string, string> = {
  '1_bimestre': '1º Bimestre',
  '2_bimestre': '2º Bimestre',
  '3_bimestre': '3º Bimestre',
  '4_bimestre': '4º Bimestre',
  '1_trimestre': '1º Trimestre',
  '2_trimestre': '2º Trimestre',
  '3_trimestre': '3º Trimestre',
  '1_semestre': '1º Semestre',
  '2_semestre': '2º Semestre',
};

export function ClassesList({ initialClasses, currentTerm }: ClassesListProps) {
  const router = useRouter();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<ClassWithGrades | null>(null);
  const [className, setClassName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleCreate = async () => {
    if (!className.trim()) return;
    setIsLoading(true);
    try {
      const result = await createClassAction(className);
      if (result.success) {
        toast.success(result.message);
        setIsCreateOpen(false);
        setClassName('');
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error('Erro ao criar turma.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedClass || !className.trim()) return;
    setIsLoading(true);
    try {
      const result = await updateClassAction(selectedClass.id, className);
      if (result.success) {
        toast.success(result.message);
        setIsEditOpen(false);
        setClassName('');
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
    setIsEditOpen(true);
  };

  const handleTermChange = (value: string) => {
    router.push(`/classes?term=${value}`);
  };

  const getGradeColor = (grade: number | null) => {
    if (grade === null) return 'text-muted-foreground';
    if (grade >= 7) return 'text-green-600';
    if (grade >= 5) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Minhas Turmas</h1>
        <div className="flex items-center gap-2">
          <Select value={currentTerm} onValueChange={handleTermChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Selecione o período" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(TERM_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setClassName('')}>
                <Plus className="mr-2 h-4 w-4" />
                Nova Turma
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nova Turma</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome da Turma</Label>
                  <Input
                    id="name"
                    placeholder="Ex: 6º Ano A"
                    value={className}
                    onChange={(e) => setClassName(e.target.value)}
                  />
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {initialClasses.map((cls) => (
          <Card key={cls.id} className="relative group hover:border-primary/50 transition-colors flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Link href={`/classes/${cls.id}`} className="hover:underline">
                <CardTitle className="text-lg font-medium">{cls.name}</CardTitle>
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Abrir menu</span>
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => openEdit(cls)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Editar Nome
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
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <div className="flex items-center space-x-2 text-2xl font-bold mb-4">
                <Users className="h-5 w-5 text-muted-foreground" />
                <span>{cls.students && cls.students.length > 0 ? cls.students[0].count : 0}</span>
                <span className="text-sm font-normal text-muted-foreground">alunos</span>
              </div>
              
              <div className="mt-auto border-t pt-4">
                 <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
                   Média Geral ({TERM_LABELS[currentTerm] || currentTerm})
                 </p>
                 <ScrollArea className="h-[200px] -mr-4 pr-4">
                   <div className="space-y-3">
                     {cls.students_with_grades && cls.students_with_grades.length > 0 ? (
                       cls.students_with_grades.map(student => (
                          <div key={student.id} className="flex justify-between items-center text-sm group/student hover:bg-muted/50 p-1 rounded transition-colors">
                              <span className="truncate font-medium text-slate-700 dark:text-slate-300">{student.name}</span>
                              <span className={cn("font-bold tabular-nums", getGradeColor(student.average))}>
                                  {student.average !== null ? student.average.toFixed(1) : '-'}
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Turma</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nome da Turma</Label>
              <Input
                id="edit-name"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
              />
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
