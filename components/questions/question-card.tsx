'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Question, QuestionContent } from '@/types/questions';
import { QuestionDetailsDialog } from './question-details-dialog';

// Helper: Type Mapping (Taxonomy)
const TYPE_MAP = {
  multiple_choice: {
    label: 'Múltipla Escolha',
    color: 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200',
  },
  true_false: {
    label: 'Verdadeiro/Falso',
    color: 'bg-cyan-100 text-cyan-800 border-cyan-200 hover:bg-cyan-200',
  },
  open_ended: {
    label: 'Dissertativa',
    color: 'bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-200',
  },
  essay: {
    label: 'Redação',
    color: 'bg-pink-100 text-pink-800 border-pink-200 hover:bg-pink-200',
  },
  association: {
    label: 'Associação',
    color: 'bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200',
  },
  sum: {
    label: 'Somatória',
    color: 'bg-indigo-100 text-indigo-800 border-indigo-200 hover:bg-indigo-200',
  },
  default: {
    label: 'Questão',
    color: 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200',
  },
};

// Helper to extract stem from content
const getStem = (question: Question): string => {
  if (typeof question.content === 'object' && question.content !== null) {
    const content = question.content as unknown as QuestionContent;
    if (typeof content.stem === 'string') return content.stem;
    if (typeof content.text === 'string') return content.text;
  }
  return 'Sem enunciado disponível';
};

interface QuestionCardProps {
  question: Question;
  usageCount?: number;
  onDelete?: (id: string) => void;
}

export function QuestionCard({ question, onDelete }: QuestionCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const typeConfig = TYPE_MAP[question.type as keyof typeof TYPE_MAP] || TYPE_MAP.default;
  const stem = getStem(question);

  const optionsPreview = (() => {
    if (question.type === 'essay') {
      const content = question.content as unknown as QuestionContent;
      const genre = content?.genre;
      return (
        <div className="mt-2 flex flex-col items-start gap-2">
          {genre && (
            <Badge
              variant="outline"
              className="text-[10px] bg-pink-50 text-pink-700 border-pink-200"
            >
              {typeof genre === 'string' ? genre : 'Gênero'}
            </Badge>
          )}
          <p className="text-xs text-muted-foreground italic">
            [Ver detalhes para textos de apoio]
          </p>
        </div>
      );
    }

    if (['open_ended', 'association'].includes(question.type || '')) {
      return (
        <p className="text-xs text-muted-foreground italic mt-2">
          [Ver detalhes para conteúdo completo]
        </p>
      );
    }

    if (Array.isArray(question.options)) {
      return (
        <ul className="space-y-1 mt-3">
          {question.options.slice(0, 4).map((opt: unknown, idx: number) => {
            const text =
              typeof opt === 'string' ? opt : (opt as { text: string }).text || JSON.stringify(opt);
            return (
              <li
                key={idx}
                className="text-xs text-muted-foreground truncate flex items-start gap-2"
              >
                <span className="shrink-0 text-muted-foreground/50">•</span>
                <span className="truncate">{text}</span>
              </li>
            );
          })}
          {question.options.length > 4 && (
            <li className="text-xs text-muted-foreground italic pl-3 pt-1">
              + {question.options.length - 4} opções...
            </li>
          )}
        </ul>
      );
    }
    return null;
  })();

  return (
    <>
      <div
        className="group relative flex flex-col justify-between rounded-xl border bg-card p-5 shadow-sm transition-all duration-200 hover:shadow-md hover:border-primary/50 cursor-pointer h-auto min-h-[200px]"
        onClick={() => setIsDialogOpen(true)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsDialogOpen(true);
          }
        }}
      >
        {/* Delete Action */}
        {onDelete && (
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity z-10">
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(question.id);
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Top: Badges */}
        <div className="mb-3">
          <Badge
            variant="secondary"
            className={cn('text-[10px] font-medium px-2 py-0.5', typeConfig.color)}
          >
            {typeConfig.label}
          </Badge>
        </div>

        {/* Middle: Content */}
        <div className="flex-grow mb-4">
          <p className="text-sm font-medium text-foreground line-clamp-4 leading-relaxed">{stem}</p>
          {optionsPreview}
        </div>

        {/* Bottom: Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-border/50 mt-auto">
          <div className="flex flex-col gap-1 w-full">
            {question.subject && (
              <Badge
                variant="outline"
                className="text-[10px] text-muted-foreground max-w-full truncate w-fit font-normal border-border/60"
              >
                {question.discipline ? `${question.discipline} • ` : ''}
                {question.subject}
              </Badge>
            )}
            {question.topic && (
              <span className="text-[10px] text-muted-foreground/70 truncate w-full pl-0.5">
                {question.topic}
              </span>
            )}
          </div>
        </div>
      </div>

      <QuestionDetailsDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} data={question} />
    </>
  );
}
