'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { Trash2, GripVertical, Pencil } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import DOMPurify from 'isomorphic-dompurify';

export type BlockType =
  | 'header'
  | 'multiple_choice'
  | 'essay'
  | 'text'
  | 'true_false'
  | 'sum'
  | 'association'
  | 'redaction'
  | 'open_ended';

export interface ExamBlock {
  id: string;
  type: BlockType;
  content: {
    title?: string;
    text?: string;
    options?: string[];
    correctAnswer?: string;
    schoolName?: string;
    teacherName?: string;
    discipline?: string;
    gradeLevel?: string;
    date?: string;
    studentNameLabel?: boolean;
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  questionData?: any; // TODO: Refactor 'any' to strict type [Jules]
}

interface SortableBlockProps {
  block: ExamBlock;
  index?: number;
  onDelete: (id: string) => void;
  onEdit: (block: ExamBlock) => void;
}

export function SortableBlock({ block, index, onDelete, onEdit }: SortableBlockProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: block.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isWatermark = block.id === 'watermark';
  const { questionData } = block;

  // Determine the effective type.
  // If questionData exists, use its type. Otherwise fallback to block.type.
  // Note: questionData.type might be 'redaction', 'true_false', etc.
  const effectiveType = questionData?.type || block.type;

  // Helper to extract display data
  const getDisplayData = () => {
    if (questionData) {
      const qContent = questionData.content || {};
      // Handle case where content might be just a string (though unlikely with new structure)
      const stem = typeof qContent === 'string' ? qContent : qContent.stem;

      return {
        stem: stem || block.content.text || 'Sem enunciado',
        options: questionData.options || block.content.options || [],
        // Specific fields for certain types
        column_b: qContent.column_b,
        support_texts: qContent.support_texts,
        genre: qContent.genre,
      };
    }

    // Fallback for manual blocks
    return {
      stem: block.content.text || '',
      options: block.content.options || [],
      column_b: undefined,
      support_texts: undefined,
      genre: undefined,
    };
  };

  const { stem, options, column_b, support_texts, genre } = getDisplayData();

  const renderQuestionBody = () => {
    // Special handling for Header block (not a question)
    if (block.type === 'header') {
      return (
        <div className="text-center pb-4 mb-2">
          <h2 className="text-xl font-bold uppercase">
            {block.content.schoolName || 'Nome da Escola'}
          </h2>
          <div className="grid grid-cols-2 gap-2 text-sm mt-4 text-left">
            <div>
              <span className="font-semibold">Professor(a):</span>{' '}
              {block.content.teacherName || '_________________'}
            </div>
            <div className="text-right">
              <span className="font-semibold">Data:</span> {block.content.date || '___/___/___'}
            </div>
            <div>
              <span className="font-semibold">Matéria:</span>{' '}
              {block.content.discipline || '_________________'}
            </div>
            <div className="text-right">
              <span className="font-semibold">Turma:</span> {block.content.gradeLevel || '________'}
            </div>
          </div>
          {block.content.studentNameLabel !== false && (
            <div className="mt-4 text-left">
              <span className="font-semibold">Nome:</span>{' '}
              __________________________________________________________________
            </div>
          )}
        </div>
      );
    }

    // Special handling for plain Text block
    if (block.type === 'text' && !questionData) {
      return (
        <div className="prose max-w-none">
          <p>{block.content.text || 'Texto de instrução...'}</p>
        </div>
      );
    }

    // Render Question Content
    return (
      <div className="space-y-4">
        {/* Stem / Header */}
        <div className="text-lg leading-relaxed flex gap-2">
          {index !== undefined && <span className="font-bold">{index}.</span>}
          <div className="flex-1">
            {/* Support Texts for Redaction */}
            {/* Support Texts for Redaction */}
            {effectiveType === 'redaction' && support_texts && Array.isArray(support_texts) && (
              <div className="mb-4 space-y-4">
                {support_texts.map((text: string, idx: number) => (
                  <div
                    key={idx}
                    className="bg-gray-50 p-4 rounded border text-sm italic text-gray-700"
                  >
                    <p className="font-bold mb-1 not-italic">Texto Motivador {idx + 1}:</p>
                    {text}
                  </div>
                ))}
              </div>
            )}

            {/* Main Stem */}
            <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(stem) }} />
          </div>
        </div>

        {/* Body based on Type */}
        {(() => {
          switch (effectiveType) {
            case 'multiple_choice':
              return (
                <div className="space-y-2 pl-2">
                  {options.map((opt: string, idx: number) => (
                    <div key={idx} className="flex gap-2 text-base">
                      <span className="font-semibold min-w-[24px]">
                        {String.fromCharCode(97 + idx)})
                      </span>
                      <span>{opt}</span>
                    </div>
                  ))}
                </div>
              );

            case 'true_false':
              return (
                <div className="space-y-2 pl-2">
                  {options.map((opt: string, idx: number) => (
                    <div key={idx} className="flex gap-2 text-base">
                      <span className="font-mono min-w-[30px]">( )</span>
                      <span>{opt}</span>
                    </div>
                  ))}
                </div>
              );

            case 'summation':
            case 'sum': // Handle both keys if needed
              return (
                <div className="space-y-2 pl-2">
                  {options.map((opt: string, idx: number) => {
                    const value = Math.pow(2, idx).toString().padStart(2, '0');
                    return (
                      <div key={idx} className="flex gap-2 text-base items-center">
                        <Badge variant="outline" className="font-mono h-6 w-8 justify-center">
                          {value}
                        </Badge>
                        <span>{opt}</span>
                      </div>
                    );
                  })}
                </div>
              );

            case 'association':
              return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-2">
                  {/* Column A: ( ) Option */}
                  <div className="space-y-2">
                    {options.map((opt: string, idx: number) => {
                      // Strip existing ( ) if present to avoid double parens
                      const cleanOpt = opt.replace(/^\(\s*\)\s*/, '').trim();
                      return (
                        <div key={`col-a-${idx}`} className="flex gap-2 text-base">
                          <span className="font-mono min-w-[30px]">( )</span>
                          <span>{cleanOpt}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Column B: a) Definition */}
                  <div className="space-y-2">
                    {column_b &&
                      Array.isArray(column_b) &&
                      column_b.map((text: string, idx: number) => (
                        <div key={`col-b-${idx}`} className="flex gap-2 text-base">
                          <span className="font-semibold min-w-[24px]">
                            {String.fromCharCode(97 + idx)})
                          </span>
                          <span>{text}</span>
                        </div>
                      ))}
                  </div>
                </div>
              );

            case 'redaction':
              return (
                <div className="space-y-4">
                  {genre && <p className="font-semibold">Gênero Textual: {genre}</p>}
                  <div className="w-full h-64 bg-[linear-gradient(transparent_1.5rem,#e5e7eb_1.5rem)] bg-[length:100%_1.6rem] border rounded shadow-sm opacity-80" />
                </div>
              );

            case 'essay':
            case 'open_ended':
              return (
                <div className="pt-4">
                  <div className="w-full h-32 bg-[linear-gradient(transparent_1.5rem,#e5e7eb_1.5rem)] bg-[length:100%_1.6rem] border-b border-t border-dashed border-gray-300" />
                </div>
              );

            default:
              // Fallback for unknown types or standard text
              return null;
          }
        })()}
      </div>
    );
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group relative mb-6 rounded-lg border bg-white p-6 shadow-sm transition-all hover:shadow-md cursor-pointer',
        isWatermark && 'opacity-70 cursor-not-allowed bg-gray-50'
      )}
      onClick={(e) => {
        e.stopPropagation();
        onEdit(block);
      }}
    >
      {/* Actions Overlay */}
      {!isWatermark && (
        <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100 z-10">
          <Button
            variant="secondary"
            size="icon"
            className="h-8 w-8"
            onClick={() => onEdit(block)}
            title="Editar"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="destructive"
            size="icon"
            className="h-8 w-8"
            onClick={() => onDelete(block.id)}
            title="Remover"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )}

      <div className="flex items-start gap-4">
        {/* Drag Handle */}
        {!isWatermark && (
          <div
            {...attributes}
            {...listeners}
            className="mt-1 cursor-grab text-gray-300 hover:text-gray-600 active:cursor-grabbing flex-shrink-0"
          >
            <GripVertical className="h-6 w-6" />
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 min-w-0">{renderQuestionBody()}</div>
      </div>
    </div>
  );
}
