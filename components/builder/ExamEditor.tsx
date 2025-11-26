'use client';

import React, { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  FileDown,
  GripVertical,
  Trash2,
  Type,
  List,
  AlignLeft,
  Image as ImageIcon,
} from 'lucide-react';
import { saveAs } from 'file-saver';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { pdf } from '@react-pdf/renderer';
import { BuilderPDFDocument } from './BuilderPDF';
import { QuestionBankDrawer } from './QuestionBankDrawer';

// Types
export type BlockType = 'header' | 'multiple_choice' | 'essay' | 'text';

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
}

// Mock Hook
const useSubscription = () => ({ isPro: false });

// Sortable Item Component
function SortableBlock({
  block,
  onDelete,
  onEdit,
}: {
  block: ExamBlock;
  onDelete: (id: string) => void;
  onEdit: (block: ExamBlock) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: block.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isWatermark = block.id === 'watermark';

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative mb-4 rounded-lg border bg-white p-4 shadow-sm transition-shadow hover:shadow-md ${
        isWatermark ? 'opacity-70 cursor-not-allowed bg-gray-50' : ''
      }`}
    >
      {!isWatermark && (
        <div className="absolute right-2 top-2 flex opacity-0 transition-opacity group-hover:opacity-100">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive"
            onClick={() => onDelete(block.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )}

      <div className="flex items-start gap-3">
        {!isWatermark && (
          <div
            {...attributes}
            {...listeners}
            className="mt-1 cursor-grab text-gray-400 hover:text-gray-600 active:cursor-grabbing"
          >
            <GripVertical className="h-5 w-5" />
          </div>
        )}

        <div className="flex-1" onClick={() => !isWatermark && onEdit(block)}>
          {/* Render Block Content */}
          {block.type === 'header' && (
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
                  <span className="font-semibold">Turma:</span>{' '}
                  {block.content.gradeLevel || '________'}
                </div>
              </div>
              {block.content.studentNameLabel !== false && (
                <div className="mt-4 text-left">
                  <span className="font-semibold">Nome:</span>{' '}
                  __________________________________________________________________
                </div>
              )}
            </div>
          )}

          {block.type === 'text' && (
            <div className="prose max-w-none">
              <p>{block.content.text || 'Texto de instrução...'}</p>
            </div>
          )}

          {block.type === 'multiple_choice' && (
            <div>
              <p className="font-medium mb-2">{block.content.text || 'Enunciado da questão...'}</p>
              <ul className="space-y-1 pl-4">
                {block.content.options?.map((opt, idx) => (
                  <li key={idx} className="list-[upper-alpha] list-outside text-sm">
                    {opt || `Opção ${idx + 1}`}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {block.type === 'essay' && (
            <div>
              <p className="font-medium mb-4">
                {block.content.text || 'Enunciado da questão dissertativa...'}
              </p>
              <div className="h-24 border-b border-t border-dashed border-gray-200"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function ExamEditor() {
  const { isPro } = useSubscription();
  const [blocks, setBlocks] = useState<ExamBlock[]>([
    {
      id: 'header-1',
      type: 'header',
      content: {
        schoolName: 'Escola Modelo',
        teacherName: '',
        discipline: '',
        gradeLevel: '',
        date: '',
        studentNameLabel: true,
      },
    },
  ]);
  const [selectedBlock, setSelectedBlock] = useState<ExamBlock | null>(null);

  // Ensure watermark exists if not pro
  React.useEffect(() => {
    if (!isPro) {
      setBlocks((prev) => {
        if (prev.find((b) => b.id === 'watermark')) return prev;
        return [
          ...prev,
          {
            id: 'watermark',
            type: 'text',
            content: { text: 'Prova criada com Pedagogi.ai - Otimize seu tempo.' },
          },
        ];
      });
    }
  }, [isPro]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setBlocks((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);

        // Prevent moving watermark
        if (items[oldIndex].id === 'watermark' || items[newIndex].id === 'watermark') {
          return items;
        }

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const addBlock = (type: BlockType) => {
    const newBlock: ExamBlock = {
      id: `block-${Date.now()}`,
      type,
      content: {
        text: type === 'multiple_choice' ? 'Nova Questão' : type === 'text' ? 'Instruções' : '',
        options:
          type === 'multiple_choice' ? ['Opção A', 'Opção B', 'Opção C', 'Opção D'] : undefined,
      },
    };

    // Insert before watermark
    setBlocks((prev) => {
      const watermarkIndex = prev.findIndex((b) => b.id === 'watermark');
      if (watermarkIndex === -1) return [...prev, newBlock];
      const newBlocks = [...prev];
      newBlocks.splice(watermarkIndex, 0, newBlock);
      return newBlocks;
    });

    setSelectedBlock(newBlock);
  };

  const handleAddFromBank = (question: any) => {
    const newBlock: ExamBlock = {
      id: `block-${Date.now()}`,
      type: question.type === 'multiple_choice' ? 'multiple_choice' : 'essay',
      content: {
        text: question.stem,
        options: question.options,
        correctAnswer: question.correct_answer,
      },
    };

    setBlocks((prev) => {
      const watermarkIndex = prev.findIndex((b) => b.id === 'watermark');
      if (watermarkIndex === -1) return [...prev, newBlock];
      const newBlocks = [...prev];
      newBlocks.splice(watermarkIndex, 0, newBlock);
      return newBlocks;
    });

    setSelectedBlock(newBlock);
  };

  const updateBlock = (id: string, content: any) => {
    setBlocks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, content: { ...b.content, ...content } } : b))
    );
    // Update selected block reference to keep UI in sync
    setSelectedBlock((prev) =>
      prev?.id === id ? { ...prev, content: { ...prev.content, ...content } } : prev
    );
  };

  const deleteBlock = (id: string) => {
    if (id === 'watermark') return;
    setBlocks((prev) => prev.filter((b) => b.id !== id));
    if (selectedBlock?.id === id) setSelectedBlock(null);
  };

  const exportWord = async () => {
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: blocks.map((block) => {
            if (block.type === 'header') {
              return new Paragraph({
                children: [
                  new TextRun({ text: block.content.schoolName || '', bold: true, size: 28 }),
                  new TextRun({ text: '\nAluno: _________________________________', break: 1 }),
                ],
                spacing: { after: 400 },
              });
            }
            if (block.type === 'multiple_choice') {
              return new Paragraph({
                children: [
                  new TextRun({ text: block.content.text || '', bold: true }),
                  ...(block.content.options || []).map(
                    (opt) => new TextRun({ text: `\n( ) ${opt}`, break: 1 })
                  ),
                ],
                spacing: { after: 200 },
              });
            }
            return new Paragraph({
              children: [new TextRun(block.content.text || '')],
              spacing: { after: 200 },
            });
          }),
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, 'prova-pedagogi.docx');
  };

  const exportPDF = async () => {
    const blob = await pdf(<BuilderPDFDocument blocks={blocks} />).toBlob();
    saveAs(blob, 'prova-pedagogi.pdf');
  };

  return (
    <div className="flex h-[calc(100vh-6rem)] gap-6">
      {/* Left Panel - Toolbox */}
      <div className="w-64 flex-shrink-0 space-y-4">
        <Card className="p-4">
          <h3 className="mb-4 font-semibold">Ferramentas</h3>
          <div className="space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => addBlock('header')}
            >
              <ImageIcon className="mr-2 h-4 w-4" /> Cabeçalho
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => addBlock('multiple_choice')}
            >
              <List className="mr-2 h-4 w-4" /> Múltipla Escolha
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => addBlock('essay')}
            >
              <AlignLeft className="mr-2 h-4 w-4" /> Dissertativa
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => addBlock('text')}
            >
              <Type className="mr-2 h-4 w-4" /> Texto / Instrução
            </Button>

            <div className="pt-2 border-t">
              <QuestionBankDrawer onAddQuestion={handleAddFromBank} />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="mb-4 font-semibold">Exportar</h3>
          <div className="space-y-2">
            <Button className="w-full" variant="secondary" onClick={exportWord}>
              <FileDown className="mr-2 h-4 w-4" /> Word (.docx)
            </Button>
            <Button className="w-full" onClick={exportPDF}>
              <FileDown className="mr-2 h-4 w-4" /> PDF
            </Button>
          </div>
        </Card>
      </div>

      {/* Center - Canvas */}
      <div className="flex-1 overflow-y-auto bg-gray-100 p-8 rounded-lg shadow-inner">
        <div className="mx-auto min-h-[29.7cm] w-[21cm] bg-white text-black p-[2cm] shadow-lg">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={blocks} strategy={verticalListSortingStrategy}>
              {blocks.map((block) => (
                <SortableBlock
                  key={block.id}
                  block={block}
                  onDelete={deleteBlock}
                  onEdit={setSelectedBlock}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>
      </div>

      {/* Right Panel - Properties */}
      {selectedBlock && selectedBlock.id !== 'watermark' && (
        <div className="w-80 flex-shrink-0">
          <Card className="p-4 sticky top-4">
            <h3 className="mb-4 font-semibold">Propriedades</h3>
            <div className="space-y-4">
              {selectedBlock.type === 'header' && (
                <div className="space-y-2">
                  <Label>Nome da Escola</Label>
                  <Input
                    value={selectedBlock.content.schoolName || ''}
                    onChange={(e) => updateBlock(selectedBlock.id, { schoolName: e.target.value })}
                  />
                  <Label>Professor(a)</Label>
                  <Input
                    value={selectedBlock.content.teacherName || ''}
                    onChange={(e) => updateBlock(selectedBlock.id, { teacherName: e.target.value })}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label>Matéria</Label>
                      <Input
                        value={selectedBlock.content.discipline || ''}
                        onChange={(e) =>
                          updateBlock(selectedBlock.id, { discipline: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label>Turma</Label>
                      <Input
                        value={selectedBlock.content.gradeLevel || ''}
                        onChange={(e) =>
                          updateBlock(selectedBlock.id, { gradeLevel: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <Label>Data</Label>
                  <Input
                    value={selectedBlock.content.date || ''}
                    onChange={(e) => updateBlock(selectedBlock.id, { date: e.target.value })}
                  />
                  <div className="flex items-center space-x-2 pt-2">
                    <input
                      type="checkbox"
                      id="studentNameLabel"
                      checked={selectedBlock.content.studentNameLabel !== false}
                      onChange={(e) =>
                        updateBlock(selectedBlock.id, { studentNameLabel: e.target.checked })
                      }
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <Label htmlFor="studentNameLabel">
                      Incluir campo &quot;Nome do Aluno&quot;
                    </Label>
                  </div>
                </div>
              )}

              {(selectedBlock.type === 'multiple_choice' ||
                selectedBlock.type === 'essay' ||
                selectedBlock.type === 'text') && (
                <div className="space-y-2">
                  <Label>Texto / Enunciado</Label>
                  <Textarea
                    value={selectedBlock.content.text || ''}
                    onChange={(e) => updateBlock(selectedBlock.id, { text: e.target.value })}
                    rows={4}
                  />
                </div>
              )}

              {selectedBlock.type === 'multiple_choice' && (
                <div className="space-y-2">
                  <Label>Opções</Label>
                  {selectedBlock.content.options?.map((opt, idx) => (
                    <div key={idx} className="flex gap-2">
                      <Input
                        value={opt}
                        onChange={(e) => {
                          const newOptions = [...(selectedBlock.content.options || [])];
                          newOptions[idx] = e.target.value;
                          updateBlock(selectedBlock.id, { options: newOptions });
                        }}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          const newOptions = selectedBlock.content.options?.filter(
                            (_, i) => i !== idx
                          );
                          updateBlock(selectedBlock.id, { options: newOptions });
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      const newOptions = [...(selectedBlock.content.options || []), `Nova Opção`];
                      updateBlock(selectedBlock.id, { options: newOptions });
                    }}
                  >
                    Adicionar Opção
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
