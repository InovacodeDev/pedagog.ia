'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

import { CheckCircle2, Trash2, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// 1. Helper: Type Mapping (Taxonomy)
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

import { Question } from '@/types/questions';

// Helper to extract stem from content
const getStem = (question: Question): string => {
  if (typeof question.content === 'object' && question.content !== null) {
    if ('stem' in question.content) {
      return (question.content as { stem: string }).stem;
    }
    if ('text' in question.content) {
      return (question.content as { text: string }).text;
    }
  }
  return 'Sem enunciado disponível';
};

interface QuestionCardProps {
  question: Question;
  usageCount?: number;
  onDelete?: (id: string) => void;
}

export function QuestionCard({ question, usageCount = 0, onDelete }: QuestionCardProps) {
  // 2. Interaction Logic (The 3D Flip)
  const [isFlipped, setIsFlipped] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleFlip = () => {
    if (!isAnimating) {
      setIsFlipped(!isFlipped);
      setIsAnimating(true);
    }
  };

  const typeConfig = TYPE_MAP[question.type as keyof typeof TYPE_MAP] || TYPE_MAP.default;

  return (
    <div
      className="group h-[400px] w-full cursor-pointer"
      style={{ perspective: '1000px' }}
      onClick={handleFlip}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleFlip();
        }
      }}
    >
      <motion.div
        className="relative h-full w-full transition-all duration-500"
        style={{ transformStyle: 'preserve-3d' }}
        initial={false}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6 }}
        onAnimationComplete={() => setIsAnimating(false)}
      >
        {/* 3. The "Front" Face (Question) */}
        <div
          className="absolute inset-0 h-full w-full rounded-xl border bg-card p-6 shadow-sm flex flex-col justify-between"
          style={{ backfaceVisibility: 'hidden' }}
        >
          {/* Header */}
          <div className="flex justify-between items-start mb-4 gap-2">
            <div className="flex gap-2 items-center">
              <Badge variant="secondary" className={cn(typeConfig.color)}>
                {typeConfig.label}
              </Badge>
              {question.subject && (
                <Badge variant="outline" className="text-muted-foreground truncate max-w-[150px]">
                  {question.discipline ? `${question.discipline} • ` : ''}
                  {question.subject}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              {usageCount === 0 ? (
                <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                  Nunca Usada
                </Badge>
              ) : (
                <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50">
                  Usada {usageCount}x
                </Badge>
              )}
            </div>
          </div>

          {/* Delete Action - Visible on Hover */}
          {onDelete && (
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity z-10">
              <Button
                size="icon"
                variant="destructive"
                className="h-8 w-8 rounded-full shadow-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(question.id);
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Body (The Hero) */}
          <div className="flex-grow flex flex-col items-center justify-center my-4 overflow-y-auto custom-scrollbar w-full">
            {/* Support Texts (Redaction/Essay) */}
            {question.content &&
              typeof question.content === 'object' &&
              'support_texts' in question.content &&
              Array.isArray((question.content as { support_texts: string[] }).support_texts) && (
                <div className="w-full mb-4 space-y-2">
                  {(question.content as { support_texts: string[] }).support_texts.map(
                    (text: string, idx: number) => (
                      <div
                        key={idx}
                        className="bg-muted/50 p-3 rounded-md text-xs italic text-muted-foreground border border-border/50"
                      >
                        &quot;{text}&quot;
                      </div>
                    )
                  )}
                </div>
              )}

            <p className="text-lg font-medium text-center text-foreground leading-relaxed">
              {getStem(question)}
            </p>
          </div>

          {/* Footer */}
          <div className="mt-4 text-center">
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider group-hover:text-primary transition-colors">
              Clique para ver resposta
            </span>
          </div>
        </div>

        {/* 4. The "Back" Face (Answer Key) */}
        <div
          className="absolute inset-0 h-full w-full rounded-xl border bg-muted/30 p-6 shadow-sm flex flex-col overflow-y-auto custom-scrollbar"
          style={{
            transform: 'rotateY(180deg)',
            backfaceVisibility: 'hidden',
          }}
        >
          {/* Top (Context) */}
          <div className="mb-4">
            <p className="text-sm text-foreground/80 mb-4 font-medium border-l-2 border-primary pl-3">
              {getStem(question)}
            </p>
          </div>

          {/* Middle (The Answer Key) */}
          <div className="flex-grow space-y-2">
            {question.type === 'sum' ? (
              <div className="space-y-2">
                {Array.isArray(question.options) &&
                  question.options.map((option: unknown, index: number) => {
                    // Safety check for Summation object structure
                    if (typeof option !== 'object' || option === null || !('value' in option))
                      return null;
                    const opt = option as { value: number; text: string };

                    const isCorrect = (Number(question.correct_answer) & opt.value) === opt.value;

                    return (
                      <div
                        key={index}
                        className={cn(
                          'p-2 rounded-md border text-sm transition-colors flex items-center gap-3',
                          isCorrect
                            ? 'bg-green-50 border-green-500 text-green-900 ring-1 ring-green-500 dark:bg-green-900/30 dark:text-green-100'
                            : 'opacity-70 border-border bg-card'
                        )}
                      >
                        <div
                          className={cn(
                            'flex items-center justify-center w-8 h-8 rounded-md border font-mono text-xs shrink-0',
                            isCorrect
                              ? 'bg-green-600 text-white border-green-600 dark:bg-green-500'
                              : 'bg-muted text-muted-foreground border-muted-foreground/30'
                          )}
                        >
                          {String(opt.value).padStart(2, '0')}
                        </div>
                        <span className="flex-grow">{opt.text}</span>
                        {isCorrect && (
                          <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                        )}
                      </div>
                    );
                  })}
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md text-center">
                  <span className="text-xs font-bold text-green-800 uppercase block mb-1">
                    Soma Correta
                  </span>
                  <span className="text-lg font-mono font-bold text-green-900">
                    {String(question.correct_answer).padStart(2, '0')}
                  </span>
                </div>
              </div>
            ) : question.type === 'true_false' ? (
              <div className="space-y-2">
                {Array.isArray(question.options) &&
                  question.options.map((option: unknown, index: number) => {
                    const optionText =
                      typeof option === 'string'
                        ? option
                        : (option as { text: string }).text || JSON.stringify(option);

                    // Parse V-F-V sequence
                    const correctSequence = question.correct_answer.split('-');
                    const isTrue = correctSequence[index] === 'V';

                    return (
                      <div
                        key={index}
                        className={cn(
                          'p-3 rounded-md border text-sm transition-colors flex items-start gap-3 bg-card opacity-90'
                        )}
                      >
                        <div
                          className={cn(
                            'mt-0.5 font-mono font-bold text-xs shrink-0 w-6 h-6 flex items-center justify-center rounded border',
                            isTrue
                              ? 'text-green-700 bg-green-100 border-green-300'
                              : 'text-red-700 bg-red-100 border-red-300'
                          )}
                        >
                          {isTrue ? 'V' : 'F'}
                        </div>
                        <span className="flex-grow">{optionText}</span>
                      </div>
                    );
                  })}
              </div>
            ) : question.type === 'association' ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {/* Column A (Letters) */}
                  <div className="space-y-2">
                    {Array.isArray(question.options) &&
                      (question.options as string[])
                        .filter((opt) => typeof opt === 'string' && /^[A-Z]/.test(opt))
                        .map((opt, idx) => (
                          <div key={idx} className="p-2 text-xs border rounded bg-muted/30">
                            {opt}
                          </div>
                        ))}
                  </div>
                  {/* Column B (Numbers) */}
                  <div className="space-y-2">
                    {Array.isArray(question.options) &&
                      (question.options as string[])
                        .filter((opt) => typeof opt === 'string' && /^\d/.test(opt))
                        .map((opt, idx) => (
                          <div key={idx} className="p-2 text-xs border rounded bg-muted/30">
                            {opt}
                          </div>
                        ))}
                  </div>
                </div>
                <div className="p-3 bg-green-50 border border-green-200 rounded-md text-center">
                  <span className="text-xs font-bold text-green-800 uppercase block mb-1">
                    Resposta Correta
                  </span>
                  <span className="text-sm font-mono text-green-900">
                    {question.correct_answer}
                  </span>
                </div>
              </div>
            ) : question.type === 'multiple_choice' ? (
              <div className="space-y-2">
                {Array.isArray(question.options) &&
                  question.options.map((option: unknown, index: number) => {
                    // Handle both string[] and object[] (fallback)
                    const optionText =
                      typeof option === 'string'
                        ? option
                        : (option as { text: string }).text || JSON.stringify(option);

                    // Highlight Logic
                    const isCorrectIndex = String(question.correct_answer) === String(index);
                    const isCorrectLetter =
                      String(question.correct_answer).toUpperCase() ===
                      String.fromCharCode(65 + index);
                    const isCorrectText = question.correct_answer === optionText;

                    const isCorrect = isCorrectIndex || isCorrectLetter || isCorrectText;

                    return (
                      <div
                        key={index}
                        className={cn(
                          'p-3 rounded-md border text-sm transition-colors flex items-start gap-3',
                          isCorrect
                            ? 'bg-green-100 border-green-500 text-green-900 ring-1 ring-green-500 dark:bg-green-900/30 dark:text-green-100'
                            : 'opacity-70 border-border bg-card'
                        )}
                      >
                        <div
                          className={cn(
                            'mt-0.5 h-4 w-4 rounded-full border flex items-center justify-center shrink-0',
                            isCorrect
                              ? 'border-green-600 bg-green-600 text-white dark:border-green-400 dark:bg-green-500'
                              : 'border-muted-foreground/30'
                          )}
                        >
                          {isCorrect && <CheckCircle2 className="h-3 w-3" />}
                        </div>
                        <span>{optionText}</span>
                      </div>
                    );
                  })}
              </div>
            ) : question.type === 'open_ended' || question.type === 'essay' ? (
              <div className="space-y-4">
                {/* Model Answer */}
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    {question.type === 'essay'
                      ? 'Tema / Abordagem Esperada'
                      : 'Resposta Esperada / Modelo'}
                  </span>
                  <div className="p-3 bg-muted rounded-md text-sm italic text-foreground/90 border border-border/50 max-h-[200px] overflow-y-auto custom-scrollbar">
                    {question.correct_answer || 'Modelo de resposta não disponível.'}
                  </div>
                </div>

                {/* Correction Criteria (Rubric) */}
                {question.structured_data &&
                  typeof question.structured_data === 'object' &&
                  'correction_criteria' in question.structured_data &&
                  Array.isArray(
                    (question.structured_data as { correction_criteria: string[] })
                      .correction_criteria
                  ) && (
                    <div className="space-y-1.5">
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Critérios de Avaliação (IA)
                      </span>
                      <ul className="space-y-2">
                        {(
                          question.structured_data as { correction_criteria: string[] }
                        ).correction_criteria.map((criteria: string, idx: number) => (
                          <li
                            key={idx}
                            className="flex items-start gap-2 text-sm text-foreground/80"
                          >
                            <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                            <span>{criteria}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 rounded-md bg-muted/30 border border-muted">
                  <p className="text-sm text-foreground whitespace-pre-wrap">
                    {question.correct_answer || 'Resposta não disponível.'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Bottom (Explanation Tooltip) */}
          {question.explanation && (
            <div className="mt-4 pt-2 border-t flex justify-end">
              <TooltipProvider>
                <Tooltip delayDuration={300}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs text-muted-foreground hover:text-yellow-600 hover:bg-yellow-50 gap-2 h-8"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Lightbulb className="h-3.5 w-3.5 text-yellow-500" />
                      Ver Explicação
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent
                    side="top"
                    align="end"
                    collisionPadding={16}
                    className="max-w-[280px] bg-secondary text-secondary-foreground p-3 text-xs rounded-md shadow-lg border-none break-words"
                  >
                    <p>{question.explanation}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
