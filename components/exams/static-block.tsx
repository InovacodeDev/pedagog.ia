import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ExamBlock } from '@/components/builder/exam-block';
import DOMPurify from 'isomorphic-dompurify';

interface StaticBlockProps {
  block: ExamBlock;
}

export function StaticBlock({ block }: StaticBlockProps) {
  const { questionData } = block;

  // Determine the effective type.
  const effectiveType = questionData?.type || block.type;

  // Helper to extract display data
  const getDisplayData = () => {
    if (questionData) {
      const qContent = questionData.content || {};
      const stem = typeof qContent === 'string' ? qContent : qContent.stem;

      return {
        stem: stem || block.content.text || 'Sem enunciado',
        options: questionData.options || block.content.options || [],
        column_b: qContent.column_b,
        support_texts: qContent.support_texts,
        genre: qContent.genre,
      };
    }

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
    if (block.type === 'header') {
      return (
        <div className="text-center border-b-2 border-black pb-4 mb-2">
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

    if (block.type === 'text' && !questionData) {
      return (
        <div className="prose max-w-none">
          <p>{block.content.text || 'Texto de instrução...'}</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="font-serif text-lg leading-relaxed">
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

          <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(stem) }} />
        </div>

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
            case 'sum':
              return (
                <div className="space-y-2 pl-2">
                  {options.map((opt: string, idx: number) => {
                    const value = Math.pow(2, idx).toString();
                    const cleanOpt = opt.replace(/^\d+[\.\-)]\s*/, '').trim();
                    return (
                      <div key={idx} className="flex gap-2 text-base items-center">
                        <Badge variant="outline" className="font-mono h-6 w-8 justify-center">
                          {value}
                        </Badge>
                        <span>{cleanOpt}</span>
                      </div>
                    );
                  })}
                </div>
              );

            case 'association':
              return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-2">
                  <div className="space-y-2">
                    {options.map((opt: string, idx: number) => {
                      const cleanOpt = opt.replace(/^\(\s*\)\s*/, '').trim();
                      return (
                        <div key={`col-a-${idx}`} className="flex gap-2 text-base">
                          <span className="font-mono min-w-[30px]">( )</span>
                          <span>{cleanOpt}</span>
                        </div>
                      );
                    })}
                  </div>

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
              return null;
          }
        })()}
      </div>
    );
  };

  return (
    <div
      className={cn(
        'relative mb-6 p-6',
        block.id === 'watermark' && 'opacity-70 text-center text-sm text-gray-400'
      )}
    >
      {block.id === 'watermark' ? <p>{block.content.text}</p> : renderQuestionBody()}
    </div>
  );
}
