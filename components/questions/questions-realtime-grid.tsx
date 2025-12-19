'use client';

import { useState } from 'react';
import { QuestionCard } from '@/components/questions/question-card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

import { Question } from '@/types/questions';
import { useRealtimeSubscription } from '@/hooks/use-realtime-subscription';
import { deleteQuestionAction } from '@/server/actions/questions';

interface QuestionsRealtimeGridProps {
  initialQuestions: Question[];
}

export function QuestionsRealtimeGrid({ initialQuestions }: QuestionsRealtimeGridProps) {
  const questions = useRealtimeSubscription({
    table: 'questions',
    initialData: initialQuestions,
    orderBy: (a, b) =>
      new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime(),
  });

  const [showUnusedOnly, setShowUnusedOnly] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStyle, setFilterStyle] = useState<string>('all');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filteredQuestions = questions.filter((q) => {
    if (showUnusedOnly && (q.usage_count || 0) > 0) return false;
    if (filterType !== 'all' && q.type !== filterType) return false;
    if (filterStyle !== 'all' && q.style !== filterStyle) return false;
    return true;
  });

  const handleDelete = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;

    // Call server action here - TODO: Implement server action
    // Note: The realtime subscription will automatically update the list when the deletion happens on the server
    toast.info('Solicitação de exclusão enviada...');

    const result = await deleteQuestionAction(deleteId);

    if (!result.success) {
      toast.error(result.error || 'Erro ao excluir a questão.');
    } else {
      toast.success('Questão excluída com sucesso.');
    }
    setDeleteId(null);
  };

  return (
    <div className="space-y-6">
      {/* Filters Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-end sm:items-center bg-card p-4 rounded-lg border shadow-sm">
        <div className="flex items-center space-x-2">
          <Switch id="unused-mode" checked={showUnusedOnly} onCheckedChange={setShowUnusedOnly} />
          <Label htmlFor="unused-mode" className="cursor-pointer">
            Apenas Nunca Usadas
          </Label>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Tipos</SelectItem>
              <SelectItem value="multiple_choice">Múltipla Escolha</SelectItem>
              <SelectItem value="true_false">V/F</SelectItem>
              <SelectItem value="essay">Dissertativa</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterStyle} onValueChange={setFilterStyle}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por Estilo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Estilos</SelectItem>
              <SelectItem value="enem">ENEM</SelectItem>
              <SelectItem value="high_school">Ensino Médio</SelectItem>
              <SelectItem value="entrance_exam">Vestibular</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Grid of Cards */}
      {filteredQuestions.length === 0 ? (
        <div className="text-center py-16 bg-muted/20 rounded-lg border border-dashed">
          <p className="text-muted-foreground text-lg">
            Nenhuma questão encontrada com os filtros atuais.
          </p>
          <Button
            variant="link"
            onClick={() => {
              setFilterType('all');
              setFilterStyle('all');
              setShowUnusedOnly(false);
            }}
          >
            Limpar filtros
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredQuestions.map((q) => (
            <QuestionCard
              key={q.id}
              question={q}
              usageCount={q.usage_count || 0}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Excluir Questão"
        description="Tem certeza que deseja excluir esta questão? Esta ação não pode ser desfeita."
        onConfirm={confirmDelete}
        variant="destructive"
        confirmText="Excluir"
      />
    </div>
  );
}
