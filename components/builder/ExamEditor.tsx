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
} from '@dnd-kit/sortable';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  FileDown,
  Trash2,
  Type,
  List,
  AlignLeft,
  Image as ImageIcon,
  Save,
  Loader2,
} from 'lucide-react';
import { saveAs } from 'file-saver';
import { pdf } from '@react-pdf/renderer';
import { BuilderPDFDocument } from './BuilderPDF';
import { QuestionBankDrawer, QuestionBankItem } from './QuestionBankDrawer';
import { generateDocx } from '@/lib/docx-generator';
import { toast } from 'sonner';

import { SortableBlock, ExamBlock, BlockType } from './exam-block';
import { saveExamAction } from '@/server/actions/save-exam';
import { useTransition } from 'react';
import { ClassItem } from '@/server/actions/classes';
import { ClassMultiSelect } from './class-multi-select';

// Mock Hook
const useSubscription = () => ({ isPro: false });

interface ExamEditorProps {
  examId?: string;
  initialTitle?: string;
  classes?: ClassItem[];
  initialClassIds?: string[];
}

export function ExamEditor({
  examId: initialExamId,
  initialTitle,
  classes = [],
  initialClassIds = [],
}: ExamEditorProps) {
  const { isPro } = useSubscription();
  const [isPending, startTransition] = useTransition();
  const [examId, setExamId] = useState<string | undefined>(initialExamId);
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

  React.useEffect(() => {
    if (!examId) {
      setExamId(crypto.randomUUID());
    }
  }, [examId]);
  const [selectedBlock, setSelectedBlock] = useState<ExamBlock | null>(null);
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>(initialClassIds);

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
          type === 'multiple_choice'
            ? ['Opção A', 'Opção B', 'Opção C', 'Opção D', 'Opção E']
            : undefined,
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

  const handleAddFromBank = (question: QuestionBankItem) => {
    const stem =
      typeof question.content === 'object' && question.content !== null
        ? question.content.stem
        : question.content;

    const newBlock: ExamBlock = {
      id: `block-${Date.now()}`,
      type: question.type === 'multiple_choice' ? 'multiple_choice' : 'essay',
      content: {
        text: stem || 'Questão sem enunciado',
        options: question.options,
        correctAnswer: question.correct_answer,
      },
      questionData: question,
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

  const updateBlock = (id: string, content: Partial<ExamBlock['content']>) => {
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
    try {
      const blob = await generateDocx(blocks);
      saveAs(blob, 'prova-pedagog-ia.docx');
      toast.success('Prova exportada para Word!');
    } catch (error) {
      console.error('Erro ao exportar Word:', error);
      toast.error('Erro ao exportar para Word.');
    }
  };

  const exportPDF = async () => {
    const blob = await pdf(<BuilderPDFDocument blocks={blocks} />).toBlob();
    saveAs(blob, 'prova-pedagog-ia.pdf');
  };

  const handleSave = React.useCallback(() => {
    if (!examId) {
      toast.error('Erro: ID da prova não encontrado.');
      return;
    }

    startTransition(async () => {
      const result = await saveExamAction({
        examId,
        blocks,
        title: initialTitle, // Or current title state if editable
        class_ids: selectedClassIds,
      });

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Prova salva com sucesso!');
      }
    });
  }, [examId, blocks, initialTitle, selectedClassIds]);

  // Keyboard shortcut for saving
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSave]);

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
          <h3 className="mb-4 font-semibold">Configurações</h3>
          <div className="space-y-2">
            <Label>Vincular Turmas</Label>
            <ClassMultiSelect
              classes={classes}
              selectedClassIds={selectedClassIds}
              onChange={setSelectedClassIds}
            />
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="mb-4 font-semibold">Ações</h3>
          <div className="space-y-2">
            <Button className="w-full" onClick={handleSave} disabled={isPending}>
              {isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              {isPending ? 'Salvando...' : 'Salvar Prova'}
            </Button>
            <Button className="w-full" variant="secondary" onClick={exportWord}>
              <FileDown className="mr-2 h-4 w-4" /> Word (.docx)
            </Button>
            <Button className="w-full" variant="outline" onClick={exportPDF}>
              <FileDown className="mr-2 h-4 w-4" /> PDF
            </Button>
          </div>
        </Card>
      </div>

      {/* Center - Canvas */}
      <div
        className="flex-1 overflow-y-auto bg-gray-100 p-8 rounded-lg shadow-inner"
        onClick={() => setSelectedBlock(null)}
      >
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
          <Card className="p-4 sticky top-4 min-h-[200px]">
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
