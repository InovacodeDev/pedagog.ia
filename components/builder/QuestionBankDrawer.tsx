'use client';

import { useState, useEffect } from 'react';
import { Search, Plus, Loader2, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { searchQuestionsAction } from '@/server/actions/questions';
import { useDebounce } from '@/hooks/use-debounce';
import { toast } from 'sonner';
import { Json } from '@/types/database';
import { QuestionContent } from '@/types/questions';

export interface QuestionBankItem {
  id: string;
  content: Json;
  type: string | null;
  options?: Json;
  correct_answer?: string | null;
  discipline?: string | null;
  subject?: string | null;
}

interface QuestionBankDrawerProps {
  onAddQuestion: (question: QuestionBankItem) => void;
  disabled?: boolean;
}

const DISCIPLINES = [
  'Matemática',
  'Português',
  'História',
  'Geografia',
  'Ciências',
  'Inglês',
  'Outros',
];

const QUESTION_TYPES = [
  { id: 'multiple_choice', label: 'Múltipla Escolha' },
  { id: 'essay', label: 'Dissertativa' },
  { id: 'true_false', label: 'V/F' },
];

export function QuestionBankDrawer({ onAddQuestion, disabled }: QuestionBankDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [questions, setQuestions] = useState<QuestionBankItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [discipline, setDiscipline] = useState('all');
  const [type, setType] = useState('all');

  const debouncedSearch = useDebounce(searchQuery, 500);

  useEffect(() => {
    async function fetchQuestions() {
      setIsLoading(true);
      try {
        const result = await searchQuestionsAction({
          query: debouncedSearch,
          discipline,
          type,
        });

        if (result.success && result.questions) {
          setQuestions(result.questions);
        } else {
          toast.error('Erro ao buscar questões.');
        }
      } catch {
        toast.error('Erro de conexão.');
      } finally {
        setIsLoading(false);
      }
    }

    if (isOpen) {
      fetchQuestions();
    }
  }, [isOpen, debouncedSearch, discipline, type]);

  const handleAdd = (question: QuestionBankItem) => {
    onAddQuestion(question);
    toast.success('Questão adicionada à prova!');
  };

  const getStem = (question: QuestionBankItem) => {
    if (typeof question.content === 'object' && question.content !== null && !Array.isArray(question.content)) {
      const content = question.content as QuestionContent;
      return content.stem || 'Questão sem enunciado';
    }
    return typeof question.content === 'string' ? question.content : 'Questão sem enunciado';
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="w-full justify-start" disabled={disabled}>
          <Search className="mr-2 h-4 w-4" /> Adicionar do Banco
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px] flex flex-col h-full">
        <SheetHeader>
          <SheetTitle>Banco de Questões</SheetTitle>
          <SheetDescription>
            Pesquise e adicione questões previamente geradas ou salvas.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-4 py-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por conteúdo..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Select value={discipline} onValueChange={setDiscipline}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Matéria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Matérias</SelectItem>
                {DISCIPLINES.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Tipos</SelectItem>
                {QUESTION_TYPES.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex-1 overflow-hidden -mx-6 px-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : questions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground space-y-4">
              <Filter className="h-12 w-12 opacity-20" />
              <p>Nenhuma questão encontrada.</p>
              <Button variant="link" asChild>
                <a href="/questions/generator" target="_blank">
                  Gerar nova questão com IA
                </a>
              </Button>
            </div>
          ) : (
            <ScrollArea className="h-full pr-4">
              <div className="space-y-4 pb-4">
                {questions.map((q) => (
                  <div
                    key={q.id}
                    className="flex flex-col gap-2 rounded-lg border p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <p className="text-sm font-medium line-clamp-2">{getStem(q)}</p>
                      <Button size="sm" variant="ghost" onClick={() => handleAdd(q)}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {QUESTION_TYPES.find((t) => t.id === q.type)?.label || q.type}
                      </Badge>
                      {q.discipline && (
                        <Badge variant="outline" className="text-xs">
                          {q.discipline}
                        </Badge>
                      )}
                      {q.subject && (
                        <Badge variant="outline" className="text-xs">
                          {q.subject}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
