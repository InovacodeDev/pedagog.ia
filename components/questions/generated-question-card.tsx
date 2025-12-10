'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, ChevronDown, ChevronUp, Eye, EyeOff, Pencil, Save, X } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { GeneratedQuestion } from '@/types/questions';

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

interface GeneratedQuestionCardProps {
  question: GeneratedQuestion;
  isSelected: boolean;
  onToggleSelection: (checked: boolean) => void;
  onUpdate?: (updatedQuestion: GeneratedQuestion) => void;
}

export function GeneratedQuestionCard({
  question,
  isSelected,
  onToggleSelection,
  onUpdate,
}: GeneratedQuestionCardProps) {
  const [showAnswer, setShowAnswer] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedAnswer, setEditedAnswer] = useState(question.correct_answer);

  const handleSaveEdit = () => {
    if (onUpdate) {
      onUpdate({ ...question, correct_answer: editedAnswer });
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditedAnswer(question.correct_answer);
    setIsEditing(false);
  };
  const typeConfig = TYPE_MAP[question.type as keyof typeof TYPE_MAP] || TYPE_MAP.default;

  // Helper to handle association data
  const associationData =
    question.type === 'association'
      ? {
          sequence: question.correct_answer.split('-').map((s) => s.trim()),
          colA: (question.options as string[]) || [],
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          colB: (question.content as any)?.column_b || [],
        }
      : null;

  return (
    <Card>
      <CardHeader className="flex flex-row items-start space-y-0 gap-4 pb-2">
        <Checkbox
          checked={isSelected}
          onCheckedChange={(checked) => onToggleSelection(!!checked)}
          className="mt-1"
        />
        <div className="flex-1">
          <CardTitle className="text-base font-medium leading-none flex items-start justify-between gap-4">
            <span className="leading-relaxed">{question.stem}</span>
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {/* Options Preview (Always visible for some types) */}
        {question.options && question.type !== 'association' && question.type !== 'sum' && (
          <ul className="space-y-2 mb-4">
            {question.options.map((opt: string, idx: number) => (
              <li key={idx} className="text-sm text-muted-foreground">
                {String.fromCharCode(65 + idx)}) {opt}
              </li>
            ))}
          </ul>
        )}

        {/* Metadata Badges */}
        <div className="flex flex-wrap gap-2 text-xs mb-4">
          <span className={cn('px-2 py-1 rounded font-medium border', typeConfig.color)}>
            {typeConfig.label}
          </span>
          <span className="px-2 py-1 bg-muted rounded text-muted-foreground border">
            BNCC: {question.bncc}
          </span>
          {question.discipline && (
            <span className="px-2 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded">
              {question.discipline}
            </span>
          )}
          {question.subject && (
            <span className="px-2 py-1 bg-green-50 text-green-700 border border-green-200 rounded">
              {question.subject}
            </span>
          )}
          {question.source_tag && (
            <span className="px-2 py-1 bg-yellow-50 text-yellow-700 border border-yellow-200 rounded font-bold">
              {question.source_tag}
            </span>
          )}
        </div>

        {/* View Answer Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowAnswer(!showAnswer)}
          className="w-full flex items-center justify-center gap-2 h-8 text-muted-foreground hover:text-foreground bg-muted/30 hover:bg-muted/50 border border-transparent hover:border-border"
        >
          {showAnswer ? (
            <>
              <EyeOff className="h-4 w-4" /> Ocultar Gabarito <ChevronUp className="h-3 w-3" />
            </>
          ) : (
            <>
              <Eye className="h-4 w-4" /> Ver Gabarito <ChevronDown className="h-3 w-3" />
            </>
          )}
        </Button>

        {/* Answer Section */}
        {showAnswer && (
          <div className="mt-4 pt-4 border-t animate-in fade-in slide-in-from-top-2 duration-200">
            {question.type === 'sum' ? (
              <div className="space-y-3">
                {Array.isArray(question.options) &&
                  question.options.map((option: unknown, idx: number) => {
                    // Handle both string options (generated) and object options (if any)
                    // The generator usually returns strings for options in 'sum' initially,
                    // but the prompt says: "options": Array de 4 a 7 proposições (Texto apenas).
                    // The `formatOptionsByType` in server action converts them to objects {value, text}.
                    // But here we are dealing with the raw `GeneratedQuestion` returned by the AI (before saving).
                    // The AI returns strings in `options`.
                    // So we need to calculate values on the fly: 2^idx.
                    const text = typeof option === 'string' ? option : JSON.stringify(option);
                    const value = Math.pow(2, idx);
                    const isCorrect = (Number(question.correct_answer) & value) === value;

                    return (
                      <div
                        key={idx}
                        className={cn(
                          'p-3 rounded-md border text-sm transition-colors flex items-center gap-3',
                          isCorrect
                            ? 'bg-green-50 border-green-500 text-green-900 ring-1 ring-green-500'
                            : 'opacity-70 border-border bg-muted/30'
                        )}
                      >
                        <div
                          className={cn(
                            'flex items-center justify-center w-8 h-8 rounded-md border font-mono text-xs shrink-0',
                            isCorrect
                              ? 'bg-green-600 text-white border-green-600'
                              : 'bg-muted text-muted-foreground border-muted-foreground/30'
                          )}
                        >
                          {String(value).padStart(2, '0')}
                        </div>
                        <span className="flex-grow">{text}</span>
                        {isCorrect && <CheckCircle2 className="h-5 w-5 text-green-600" />}
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
                  question.options.map((option: string, idx: number) => {
                    const correctSequence = question.correct_answer.split('-');
                    // Handle potential mismatch in length or format
                    const isTrue = correctSequence[idx]?.toUpperCase().includes('V');

                    return (
                      <div
                        key={idx}
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
                        <span className="flex-grow">{option}</span>
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
                  </h4>
                  {associationData.colA.map((itemA, idx) => {
                    const letter = associationData.sequence[idx];
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
                        <div className="flex-1 text-sm font-medium text-foreground/80">{itemA}</div>
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
                  question.options.map((option: string, idx: number) => {
                    const isCorrectIndex = String(question.correct_answer) === String(idx);
                    const isCorrectLetter =
                      String(question.correct_answer).toUpperCase() ===
                      String.fromCharCode(65 + idx);
                    // Sometimes AI returns the text of the answer
                    const isCorrectText = question.correct_answer === option;

                    const isCorrect = isCorrectIndex || isCorrectLetter || isCorrectText;

                    return (
                      <div
                        key={idx}
                        className={cn(
                          'p-3 rounded-md border text-sm transition-colors flex items-start gap-3',
                          isCorrect
                            ? 'bg-green-100 border-green-500 text-green-900 ring-1 ring-green-500'
                            : 'opacity-70 border-border bg-muted/30'
                        )}
                      >
                        <div
                          className={cn(
                            'mt-0.5 h-5 w-5 rounded-full border flex items-center justify-center shrink-0',
                            isCorrect
                              ? 'border-green-600 bg-green-600 text-white'
                              : 'border-muted-foreground/30'
                          )}
                        >
                          {isCorrect && <CheckCircle2 className="h-3.5 w-3.5" />}
                        </div>
                        <span className="leading-relaxed">{option}</span>
                      </div>
                    );
                  })}
              </div>
            ) : (
              // Open Ended / Essay / Default
              <div className="space-y-4">
                <div className="bg-green-50/50 border border-green-200 rounded-lg p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <h4 className="text-sm font-bold text-green-800 uppercase tracking-wide">
                        {question.type === 'essay'
                          ? 'Tema / Abordagem Esperada'
                          : 'Gabarito / Modelo Ideal'}
                      </h4>
                    </div>
                    {!isEditing && onUpdate && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditedAnswer(question.correct_answer);
                          setIsEditing(true);
                        }}
                        className="h-6 w-6 p-0 hover:bg-green-200 text-green-700"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>

                  {isEditing ? (
                    <div className="space-y-3">
                      <Textarea
                        value={editedAnswer}
                        onChange={(e) => setEditedAnswer(e.target.value)}
                        className="min-h-[150px] bg-white"
                        placeholder="Edite o gabarito..."
                      />
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleCancelEdit}
                          className="h-8 text-muted-foreground"
                        >
                          <X className="mr-2 h-3.5 w-3.5" /> Cancelar
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleSaveEdit}
                          className="h-8 bg-green-600 hover:bg-green-700 text-white"
                        >
                          <Save className="mr-2 h-3.5 w-3.5" /> Salvar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
                      {question.correct_answer || 'Modelo de resposta não disponível.'}
                    </div>
                  )}
                </div>

                {/* Correction Criteria for Essay/Open Ended */}
                {question.correction_criteria && question.correction_criteria.length > 0 && (
                  <div className="space-y-4 pt-2">
                    <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                      <span className="bg-muted px-2 py-0.5 rounded text-xs">Rubrica</span>
                      Critérios de Avaliação
                    </h4>
                    <div className="grid gap-3">
                      {question.correction_criteria.map((criteria: string, idx: number) => (
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
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
