'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ClassItem,
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
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Plus, MoreVertical, Pencil, Trash2, Users } from 'lucide-react';

interface ClassesListProps {
  initialClasses: ClassItem[];
}

export function ClassesList({ initialClasses }: ClassesListProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<ClassItem | null>(null);
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

  const openEdit = (cls: ClassItem) => {
    setSelectedClass(cls);
    setClassName(cls.name);
    setIsEditOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Minhas Turmas</h1>
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {initialClasses.map((cls) => (
          <Card key={cls.id} className="relative group hover:border-primary/50 transition-colors">
            <Link href={`/classes/${cls.id}`} className="absolute inset-0 z-0">
              <span className="sr-only">Ver detalhes da turma {cls.name}</span>
            </Link>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10 pointer-events-none">
              <CardTitle className="text-lg font-medium">{cls.name}</CardTitle>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0 pointer-events-auto">
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
            <CardContent className="relative z-0 pointer-events-none">
              <div className="flex items-center space-x-2 text-2xl font-bold">
                <Users className="h-5 w-5 text-muted-foreground" />
                <span>{cls.students[0]?.count || 0}</span>
                <span className="text-sm font-normal text-muted-foreground">alunos</span>
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
