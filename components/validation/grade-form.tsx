'use client';

import * as React from 'react';
import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export interface QuestionResult {
  question: number;
  score: number;
  correct: boolean;
  confidence: number;
}

interface GradeFormProps {
  questions: QuestionResult[];
  onChange: (questions: QuestionResult[]) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export function GradeForm({ questions, onChange, onSubmit, isSubmitting }: GradeFormProps) {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const activeRef = React.useRef<HTMLDivElement>(null);

  // Calculate total score
  const totalScore = questions.reduce((acc, q) => acc + q.score, 0);

  // Scroll active question into view
  React.useEffect(() => {
    if (activeRef.current) {
      activeRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [activeIndex]);

  // Keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isSubmitting) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((prev) => Math.min(prev + 1, questions.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter' && e.metaKey) {
        // Cmd+Enter to submit
        e.preventDefault();
        onSubmit();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [questions.length, onSubmit, isSubmitting]);

  const toggleCorrect = (index: number) => {
    const newQuestions = [...questions];
    const q = newQuestions[index];
    q.correct = !q.correct;
    q.score = q.correct ? 1 : 0; // Simple logic: 1 point per question for now
    onChange(newQuestions);
  };

  const updateScore = (index: number, score: number) => {
    const newQuestions = [...questions];
    newQuestions[index].score = score;
    newQuestions[index].correct = score > 0;
    onChange(newQuestions);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {questions.map((q, index) => (
          <Card
            key={q.question}
            ref={index === activeIndex ? activeRef : null}
            className={cn(
              'p-4 transition-all duration-200 border-2 cursor-pointer',
              index === activeIndex
                ? 'border-primary shadow-md scale-[1.02]'
                : 'border-transparent hover:border-muted-foreground/20'
            )}
            onClick={() => setActiveIndex(index)}
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm',
                    index === activeIndex
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  )}
                >
                  {q.question}
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-medium">Questão {q.question}</div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={q.confidence > 0.8 ? 'success' : 'warning'}
                      className="text-[10px] h-5 px-1.5"
                    >
                      {Math.round(q.confidence * 100)}% confiança
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Label htmlFor={`score-${index}`} className="sr-only">
                    Pontos
                  </Label>
                  <Input
                    id={`score-${index}`}
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    className="w-16 h-9 text-center"
                    value={q.score}
                    onChange={(e) => updateScore(index, parseFloat(e.target.value) || 0)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>

                <Button
                  size="icon"
                  variant={q.correct ? 'default' : 'outline'}
                  className={cn(
                    'w-9 h-9 transition-colors',
                    q.correct
                      ? 'bg-green-500 hover:bg-green-600 border-green-600'
                      : 'text-muted-foreground'
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleCorrect(index);
                  }}
                >
                  {q.correct ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="p-4 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-muted-foreground">
            Total de Questões:{' '}
            <span className="font-medium text-foreground">{questions.length}</span>
          </div>
          <div className="text-lg font-bold">
            Nota Final: <span className="text-primary">{totalScore.toFixed(1)}</span>
          </div>
        </div>

        <Button className="w-full h-12 text-lg" onClick={onSubmit} disabled={isSubmitting}>
          {isSubmitting ? 'Salvando...' : 'Finalizar Correção (⌘+Enter)'}
        </Button>
      </div>
    </div>
  );
}
