import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Lightbulb, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Question } from '@/types/questions';

// 1. Helper: Type Mapping (Taxonomy) - Copied from QuestionCard
const TYPE_MAP = {
  multiple_choice: {
    label: 'Múltipla Escolha',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  true_false: {
    label: 'Verdadeiro/Falso',
    color: 'bg-cyan-100 text-cyan-800 border-cyan-200',
  },
  open_ended: {
    label: 'Dissertativa',
    color: 'bg-orange-100 text-orange-800 border-orange-200',
  },
  essay: {
    label: 'Redação',
    color: 'bg-pink-100 text-pink-800 border-pink-200',
  },
  association: {
    label: 'Associação',
    color: 'bg-purple-100 text-purple-800 border-purple-200',
  },
  sum: {
    label: 'Somatória',
    color: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  },
  default: {
    label: 'Questão',
    color: 'bg-gray-100 text-gray-800 border-gray-200',
  },
};

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

interface QuestionDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: Question;
}

export function QuestionDetailsDialog({
  open,
  onOpenChange,
  data: question,
}: QuestionDetailsDialogProps) {
  const typeConfig = TYPE_MAP[question.type as keyof typeof TYPE_MAP] || TYPE_MAP.default;

  const associationData =
    question.type === 'association'
      ? {
          sequence: question.correct_answer.split('-').map((s) => s.trim()),
          colA: (question.options as string[]) || [],
          colB: (question.content as { column_b?: string[] })?.column_b || [],
        }
      : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0 gap-0">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between mr-8">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className={cn(typeConfig.color)}>
                {typeConfig.label}
              </Badge>
              {question.subject && (
                <Badge variant="outline" className="text-muted-foreground">
                  {question.discipline ? `${question.discipline} • ` : ''}
                  {question.subject}
                </Badge>
              )}
            </div>
          </div>
          <DialogTitle className="sr-only">Detalhes da Questão</DialogTitle>
          <DialogDescription className="flex items-center gap-3 text-xs mt-2">
            {question.bncc_code && (
              <span className="font-mono bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                {question.bncc_code}
              </span>
            )}
            <span className="text-muted-foreground">
              {question.usage_count && question.usage_count > 0
                ? `Usada ${question.usage_count} vezes`
                : 'Nunca usada'}
            </span>
          </DialogDescription>
        </DialogHeader>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Section 1: The Question (Stem) */}
          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Enunciado
            </h3>
            <div className="bg-muted/30 p-6 rounded-lg border border-border/50">
              {/* Material de Apoio (Support Texts) */}
              {question.content &&
                typeof question.content === 'object' &&
                'support_texts' in question.content &&
                Array.isArray((question.content as { support_texts: string[] }).support_texts) &&
                (question.content as { support_texts: string[] }).support_texts.length > 0 && (
                  <div className="w-full mb-8 space-y-4">
                    <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      <span className="bg-primary/10 text-primary px-2 py-1 rounded">
                        Material de Apoio
                      </span>
                    </div>
                    <div className="grid gap-4">
                      {(question.content as { support_texts: string[] }).support_texts.map(
                        (text: string, idx: number) => (
                          <div
                            key={idx}
                            className="bg-background p-5 rounded-md text-sm leading-relaxed text-foreground/90 border border-border shadow-sm relative overflow-hidden"
                          >
                            <div className="absolute top-0 left-0 w-1 h-full bg-primary/20" />
                            {text}
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

              <p className="text-lg font-medium leading-relaxed text-foreground">
                {getStem(question)}
              </p>
            </div>
          </section>

          {/* Section 2: The Answer Key */}
          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Gabarito & Resposta
            </h3>
            <div className="bg-card rounded-lg border p-6 shadow-sm">
              {question.type === 'sum' ? (
                <div className="space-y-3">
                  {Array.isArray(question.options) &&
                    question.options.map((option: unknown, index: number) => {
                      if (typeof option !== 'object' || option === null || !('value' in option))
                        return null;
                      const opt = option as { value: number; text: string };
                      const isCorrect = (Number(question.correct_answer) & opt.value) === opt.value;

                      return (
                        <div
                          key={index}
                          className={cn(
                            'p-3 rounded-md border text-sm transition-colors flex items-center gap-3',
                            isCorrect
                              ? 'bg-green-50 border-green-500 text-green-900 ring-1 ring-green-500 dark:bg-green-900/30 dark:text-green-100'
                              : 'opacity-70 border-border bg-muted/30'
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
                            <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                          )}
                        </div>
                      );
                    })}
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md flex items-center justify-between">
                    <span className="text-sm font-bold text-green-800 uppercase">Soma Correta</span>
                    <span className="text-2xl font-mono font-bold text-green-900">
                      {String(question.correct_answer).padStart(2, '0')}
                    </span>
                  </div>
                </div>
              ) : question.type === 'true_false' ? (
                <div className="space-y-3">
                  {Array.isArray(question.options) &&
                    question.options.map((option: unknown, index: number) => {
                      const optionText =
                        typeof option === 'string'
                          ? option
                          : (option as { text: string }).text || JSON.stringify(option);

                      const correctSequence = question.correct_answer.split('-');
                      const isTrue = correctSequence[index] === 'V';

                      return (
                        <div
                          key={index}
                          className="p-3 rounded-md border text-sm flex items-start gap-3 bg-muted/30"
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
              ) : question.type === 'association' && associationData ? (
                <div className="space-y-6">
                  <div className="space-y-3">
                    <h4 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-2">
                      <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                        Pares Corretos
                      </span>
                      (Associação Semântica)
                    </h4>
                    {associationData.colA.map((itemA, idx) => {
                      const letter = associationData.sequence[idx]; // e.g., "C"
                      // Convert letter to index: A=0, B=1, C=2...
                      const targetIndex = letter ? letter.charCodeAt(0) - 65 : -1;
                      const itemB =
                        targetIndex >= 0 && targetIndex < associationData.colB.length
                          ? associationData.colB[targetIndex]
                          : '???';

                      return (
                        <div
                          key={idx}
                          className="p-3 border rounded-md bg-muted/20 flex flex-col sm:flex-row sm:items-center gap-3"
                        >
                          <div className="flex-1 text-sm font-medium text-foreground/80">
                            {itemA}
                          </div>
                          <div className="hidden sm:flex shrink-0 text-muted-foreground">→</div>
                          <div className="flex-1 flex items-center gap-2">
                            <Badge variant="outline" className="font-mono">
                              {letter}
                            </Badge>
                            <span className="text-sm text-foreground">{itemB}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="p-4 bg-green-50 border border-green-200 rounded-md flex items-center justify-between">
                    <span className="text-sm font-bold text-green-800 uppercase">Sequência</span>
                    <span className="text-lg font-mono font-bold text-green-900 tracking-widest">
                      {question.correct_answer}
                    </span>
                  </div>
                </div>
              ) : question.type === 'multiple_choice' ? (
                <div className="space-y-3">
                  {Array.isArray(question.options) &&
                    question.options.map((option: unknown, index: number) => {
                      const optionText =
                        typeof option === 'string'
                          ? option
                          : (option as { text: string }).text || JSON.stringify(option);

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
                              : 'opacity-70 border-border bg-muted/30'
                          )}
                        >
                          <div
                            className={cn(
                              'mt-0.5 h-5 w-5 rounded-full border flex items-center justify-center shrink-0',
                              isCorrect
                                ? 'border-green-600 bg-green-600 text-white dark:border-green-400 dark:bg-green-500'
                                : 'border-muted-foreground/30'
                            )}
                          >
                            {isCorrect && <CheckCircle2 className="h-3.5 w-3.5" />}
                          </div>
                          <span className="leading-relaxed">{optionText}</span>
                        </div>
                      );
                    })}
                </div>
              ) : question.type === 'open_ended' || question.type === 'essay' ? (
                <div className="space-y-6">
                  {/* Essay Specifics: Genre & Support Texts */}
                  {question.type === 'essay' && (
                    <div className="space-y-4">
                      {/* Genre Badge */}
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      {(question.content as any)?.genre && (
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className="bg-pink-50 text-pink-700 border-pink-200 font-medium"
                          >
                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                            Gênero: {(question.content as any).genre}
                          </Badge>
                        </div>
                      )}

                      {/* Support Texts - Defensive Rendering */}
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      {Array.isArray((question.content as any)?.support_texts) &&
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        (question.content as any).support_texts.length > 0 && (
                          <div className="space-y-3 p-4 bg-muted/30 rounded-md border border-muted">
                            <h4 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                              <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded text-xs">
                                Contexto
                              </span>
                              Textos de Apoio
                            </h4>
                            <div className="space-y-3">
                              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                              {(question.content as any).support_texts?.map(
                                (text: string, idx: number) => (
                                  <div
                                    key={idx}
                                    className="text-sm text-foreground/80 italic border-l-2 border-primary/20 pl-3 py-1"
                                  >
                                    &quot;{text}&quot;
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        )}
                    </div>
                  )}

                  {/* Section A: Model Answer */}
                  <div className="bg-green-50/50 dark:bg-green-900/10 border border-green-200 dark:border-green-900/30 rounded-lg p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                      <h4 className="text-sm font-bold text-green-800 dark:text-green-300 uppercase tracking-wide">
                        {question.type === 'essay'
                          ? 'Tema / Abordagem Esperada'
                          : 'Gabarito / Modelo Ideal'}
                      </h4>
                    </div>
                    <div className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
                      {question.correct_answer || 'Modelo de resposta não disponível.'}
                    </div>
                  </div>

                  {/* Section B: Correction Criteria (Rubric) */}
                  {question.structured_data &&
                    typeof question.structured_data === 'object' &&
                    'correction_criteria' in question.structured_data &&
                    Array.isArray(
                      (question.structured_data as { correction_criteria: string[] })
                        .correction_criteria
                    ) && (
                      <div className="space-y-4 pt-2">
                        <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                          <span className="bg-muted px-2 py-0.5 rounded text-xs">Rubrica</span>
                          Critérios de Avaliação
                        </h4>
                        <div className="grid gap-3">
                          {(
                            question.structured_data as {
                              correction_criteria: string[];
                            }
                          ).correction_criteria.map((criteria: string, idx: number) => (
                            <div
                              key={idx}
                              className="flex items-start gap-3 p-3 rounded-md border bg-card hover:bg-muted/50 transition-colors"
                            >
                              <div className="mt-0.5 h-5 w-5 rounded border-2 border-primary/30 flex items-center justify-center shrink-0 text-primary">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                              </div>
                              <span className="text-sm text-foreground/80">{criteria}</span>
                            </div>
                          ))}
                        </div>
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
          </section>

          {/* Section 3: Explanation (Pedagogical) */}
          {question.explanation && (
            <section className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-yellow-500" />
                Explicação Pedagógica
              </h3>
              <div className="bg-yellow-50/50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-900/30 p-6 rounded-lg">
                <p className="text-sm text-foreground/90 leading-relaxed">{question.explanation}</p>
              </div>
            </section>
          )}
        </div>

        {/* Footer */}
        <DialogFooter className="px-6 py-4 border-t bg-muted/10">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            <X className="mr-2 h-4 w-4" />
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
