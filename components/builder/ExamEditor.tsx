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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Link from 'next/link';
import {
  FileDown,
  Trash2,
  Type,
  List,
  AlignLeft,
  Image as ImageIcon,
  Save,
  Loader2,
  Wand2,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { saveAs } from 'file-saver';
import { pdf } from '@react-pdf/renderer';
import { BuilderPDFDocument } from './BuilderPDF';
import { QuestionBankDrawer, QuestionBankItem } from './QuestionBankDrawer';
// import { generateDocx } from '@/lib/docx-generator';
import { toast } from 'sonner';
// import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

import { SortableBlock, ExamBlock, BlockType } from './exam-block';
import { saveExamAction } from '@/server/actions/save-exam';
import { useTransition } from 'react';
import { ClassItem } from '@/server/actions/classes';
import { ClassMultiSelect } from './class-multi-select';
import { generateExamFromDatabaseAction } from '@/server/actions/questions';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
const useSubscription = () => ({ isPro: false });

interface UserProfile {
  name: string;
  school_name: string;
  disciplines: string[];
}

interface ExamEditorProps {
  examId?: string;
  initialTitle?: string;
  classes?: ClassItem[];
  initialClassIds?: string[];
  initialBlocks?: ExamBlock[];
  userProfile?: UserProfile;
  initialStatus?: 'draft' | 'published';
}

export function ExamEditor({
  examId: initialExamId,
  initialTitle,
  classes = [],
  initialClassIds = [],
  initialBlocks,
  userProfile,
  initialStatus = 'draft',
}: ExamEditorProps) {
  const { isPro } = useSubscription();
  const [isPending, startTransition] = useTransition();
  const [isGenerating, setIsGenerating] = useState(false);
  const [examId, setExamId] = useState<string | undefined>(initialExamId);
  const [title, setTitle] = useState(initialTitle || 'Nova Prova');
  const [status, setStatus] = useState<'draft' | 'published'>(initialStatus);
  const [isPublishDialogOpen, setIsPublishDialogOpen] = useState(false);

  // Validation Checks
  const hasSchoolConfig = !!userProfile?.school_name;
  const hasDisciplinesConfig = userProfile?.disciplines && userProfile.disciplines.length > 0;
  const hasClasses = classes && classes.length > 0;
  const isConfigMissing = !hasSchoolConfig || !hasDisciplinesConfig || !hasClasses;

  const [blocks, setBlocks] = useState<ExamBlock[]>(
    initialBlocks || [
      {
        id: 'header-1',
        type: 'header',
        content: {
          schoolName: userProfile?.school_name || 'Escola Modelo',
          teacherName: userProfile?.name || '',
          discipline: userProfile?.disciplines?.length === 1 ? userProfile.disciplines[0] : '',
          gradeLevel: classes?.length === 1 ? classes[0].name : '',
          date: new Date().toISOString().split('T')[0],
          studentNameLabel: true,
        },
      },
    ]
  );

  React.useEffect(() => {
    if (!examId) {
      setExamId(crypto.randomUUID());
    }
  }, [examId]);
  const [selectedBlock, setSelectedBlock] = useState<ExamBlock | null>(null);
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>(initialClassIds);

  const questionCount = blocks.filter(
    (b) => !['header', 'watermark', 'text'].includes(b.type)
  ).length;

  const hasRedaction = blocks.some(
    (b) => b.type === 'redaction' || b.questionData?.type === 'redaction'
  );

  const isFull = questionCount >= 10;
  const isLocked = isFull || hasRedaction;
  const lockReason = hasRedaction
    ? 'Prova de redação não permite mais questões'
    : isFull
      ? 'Limite de 10 questões atingido'
      : '';

  const hasHeader = blocks.some((b) => b.type === 'header');

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
        // Pre-fill header data if adding a header
        ...(type === 'header'
          ? {
              schoolName: userProfile?.school_name || '',
              teacherName: userProfile?.name || '',
              discipline: userProfile?.disciplines?.length === 1 ? userProfile.disciplines[0] : '',
              gradeLevel: classes?.length === 1 ? classes[0].name : '',
              date: new Date().toISOString().split('T')[0],
              studentNameLabel: true,
            }
          : {}),
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

  const handleAutoGenerate = async () => {
    const headerBlock = blocks.find((b) => b.type === 'header');
    const discipline = headerBlock?.content.discipline;

    if (!discipline) {
      toast.error('Por favor, preencha a matéria no cabeçalho antes de gerar a prova.');
      return;
    }

    if (isLocked) {
      toast.error(lockReason);
      return;
    }

    setIsGenerating(true);

    try {
      const maxToGenerate = 10 - questionCount;
      // Generate between 1 and maxToGenerate, but at least 1.
      // If maxToGenerate is large (e.g. 10), we might want a minimum of 5 like before,
      // but we must respect the remaining slots.
      // Logic: if we have 0 questions, generate 5-10.
      // If we have 8 questions, generate 1-2.
      const minQuantity = Math.min(5, maxToGenerate);
      const quantity = Math.floor(Math.random() * (maxToGenerate - minQuantity + 1)) + minQuantity;

      const result = await generateExamFromDatabaseAction({
        discipline,
        quantity,
        excludeTypes: ['essay', 'redaction'], // Exclude redaction as requested
      });

      if (!result.success || !result.questions) {
        toast.error(result.error || 'Erro ao gerar prova automática.');
        return;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const newBlocks: ExamBlock[] = (result.questions as any[]).map((q) => ({
        id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: (q.type === 'multiple_choice'
          ? 'multiple_choice'
          : q.type === 'true_false'
            ? 'true_false'
            : q.type === 'sum'
              ? 'sum'
              : q.type === 'association'
                ? 'association'
                : q.type === 'redaction'
                  ? 'redaction'
                  : q.type === 'open_ended'
                    ? 'open_ended'
                    : 'essay') as BlockType,
        content: {
          text: q.stem || 'Questão sem enunciado',
          options: q.options,
          correctAnswer: q.correct_answer,
        },
        questionData: {
          ...q,
          content: q.content || { stem: q.stem, support_texts: q.support_texts },
        },
      }));

      setBlocks((prev) => {
        const watermarkIndex = prev.findIndex((b) => b.id === 'watermark');
        if (watermarkIndex === -1) return [...prev, ...newBlocks];
        const existingBlocks = [...prev];
        existingBlocks.splice(watermarkIndex, 0, ...newBlocks);
        return existingBlocks;
      });

      toast.success(`${newBlocks.length} questões geradas automaticamente!`);
    } catch (error) {
      console.error('Error generating exam:', error);
      toast.error('Erro inesperado ao gerar prova.');
    } finally {
      setIsGenerating(false);
    }
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

  /*
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
  */

  const exportPDF = async () => {
    const blob = await pdf(<BuilderPDFDocument blocks={blocks} />).toBlob();
    saveAs(blob, `${title}.pdf`);
  };

  const handleSave = React.useCallback(async () => {
    if (!examId) return;

    startTransition(async () => {
      const result = await saveExamAction({
        examId: examId,
        blocks,
        title,
        class_ids: selectedClassIds,
        status: 'draft',
      });

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Prova salva com sucesso!');
      }
    });
  }, [examId, blocks, title, selectedClassIds]);

  const handlePublish = () => {
    setIsPublishDialogOpen(true);
  };

  const confirmPublish = React.useCallback(async () => {
    if (!examId) return;

    startTransition(async () => {
      const result = await saveExamAction({
        examId: examId,
        blocks,
        title,
        class_ids: selectedClassIds,
        status: 'published',
      });

      if (result.error) {
        toast.error(result.error);
      } else {
        setStatus('published');
        toast.success('Prova publicada com sucesso!');
        setSelectedBlock(null); // Deselect any block
      }
    });
  }, [examId, blocks, title, selectedClassIds]);

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

  if (isConfigMissing) {
    return (
      <div className="flex h-[calc(100vh-6rem)] items-center justify-center p-8">
        <Alert variant="destructive" className="max-w-2xl">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Configurações Pendentes</AlertTitle>
          <AlertDescription className="mt-2 flex flex-col gap-4">
            <p>
              Para criar provas, você precisa completar seu perfil e ter turmas cadastradas. Isso
              garante que o cabeçalho da prova seja gerado corretamente.
            </p>
            <div className="flex flex-col gap-2">
              {!hasSchoolConfig && (
                <div className="flex items-center gap-2">
                  <span className="text-sm">• Nome da Escola não configurado.</span>
                  <Link href="/settings" className="text-sm underline font-medium">
                    Configurar Perfil
                  </Link>
                </div>
              )}
              {!hasDisciplinesConfig && (
                <div className="flex items-center gap-2">
                  <span className="text-sm">• Nenhuma matéria cadastrada.</span>
                  <Link href="/settings" className="text-sm underline font-medium">
                    Configurar Perfil
                  </Link>
                </div>
              )}
              {!hasClasses && (
                <div className="flex items-center gap-2">
                  <span className="text-sm">• Nenhuma turma cadastrada.</span>
                  <Link href="/classes" className="text-sm underline font-medium">
                    Criar Turma
                  </Link>
                </div>
              )}
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-6rem)] gap-6">
      {/* Left Panel - Toolbox */}
      <div className="w-64 flex-shrink-0 space-y-4">
        {status === 'published' && (
          <Alert className="bg-green-50 border-green-200 text-green-800">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertTitle>Prova Publicada</AlertTitle>
            <AlertDescription>
              Esta prova foi publicada e não pode mais ser editada.
            </AlertDescription>
          </Alert>
        )}

        {status === 'draft' && (
          <Button
            className="w-full bg-green-600 hover:bg-green-700 text-white shadow-sm"
            onClick={handlePublish}
            disabled={isPending}
          >
            {isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle className="mr-2 h-4 w-4" />
            )}
            Publicar Prova
          </Button>
        )}

        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Ferramentas</h3>
            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
              {questionCount} questões
            </span>
          </div>
          <div className="space-y-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="w-full">
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => addBlock('header')}
                      disabled={hasHeader || status === 'published'}
                    >
                      <ImageIcon className="mr-2 h-4 w-4" /> Cabeçalho
                    </Button>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{hasHeader ? 'A prova já possui um cabeçalho' : 'Adicionar cabeçalho'}</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="w-full">
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => addBlock('multiple_choice')}
                      disabled={isLocked || status === 'published'}
                    >
                      <List className="mr-2 h-4 w-4" /> Múltipla Escolha
                    </Button>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isLocked ? lockReason : 'Adicionar questão de múltipla escolha'}</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="w-full">
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => addBlock('essay')}
                      disabled={isLocked || status === 'published'}
                    >
                      <AlignLeft className="mr-2 h-4 w-4" /> Dissertativa
                    </Button>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isLocked ? lockReason : 'Adicionar questão dissertativa'}</p>
                </TooltipContent>
              </Tooltip>

              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => addBlock('text')}
                disabled={status === 'published'}
              >
                <Type className="mr-2 h-4 w-4" /> Texto / Instrução
              </Button>

              <div className="pt-2 border-t space-y-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="w-full">
                      <Button
                        variant="default"
                        className="w-full justify-start bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700"
                        onClick={handleAutoGenerate}
                        disabled={isGenerating || isLocked || status === 'published'}
                      >
                        {isGenerating ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Wand2 className="mr-2 h-4 w-4" />
                        )}
                        Gerar Prova Automática
                      </Button>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      {isLocked
                        ? lockReason
                        : 'Gerar questões automaticamente (Consome 0.2 créditos)'}
                    </p>
                  </TooltipContent>
                </Tooltip>
                <QuestionBankDrawer
                  onAddQuestion={handleAddFromBank}
                  disabled={isLocked || status === 'published'}
                />
              </div>
            </TooltipProvider>
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="mb-4 font-semibold">Configurações</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nome da Prova</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Prova de Matemática - 1º Bimestre"
                disabled={status === 'published'}
              />
            </div>
            <div className="space-y-2">
              <Label>Vincular Turmas</Label>
              <ClassMultiSelect
                classes={classes}
                selectedClassIds={selectedClassIds}
                onChange={setSelectedClassIds}
                disabled={status === 'published'}
              />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="mb-4 font-semibold">Ações</h3>
          <div className="space-y-2">
            {status === 'draft' && (
              <Button className="w-full" onClick={handleSave} disabled={isPending}>
                {isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                {isPending ? 'Salvando...' : 'Salvar Rascunho'}
              </Button>
            )}
            <Button className="w-full" variant="secondary" disabled title="Em construção">
              <FileDown className="mr-2 h-4 w-4" /> Word (.docx)
            </Button>
            <Button className="w-full" variant="outline" onClick={exportPDF}>
              <FileDown className="mr-2 h-4 w-4" /> PDF
            </Button>
          </div>
        </Card>
      </div>

      <ConfirmDialog
        open={isPublishDialogOpen}
        onOpenChange={setIsPublishDialogOpen}
        title="Publicar Prova"
        description="Tem certeza que deseja publicar esta prova? Ela ficará disponível para correção e não poderá mais ser editada."
        onConfirm={confirmPublish}
        confirmText="Publicar"
        variant="default"
      />

      {/* Center - Canvas */}
      <div
        className="flex-1 overflow-y-auto bg-gray-100 p-8 rounded-lg shadow-inner relative"
        onClick={() => setSelectedBlock(null)}
      >
        {isGenerating && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm font-medium text-muted-foreground">Gerando prova...</p>
            </div>
          </div>
        )}
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
                  index={
                    ['header', 'watermark', 'text'].includes(block.type)
                      ? undefined
                      : blocks
                          .filter((b) => !['header', 'watermark', 'text'].includes(b.type))
                          .findIndex((b) => b.id === block.id) + 1
                  }
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
                    disabled
                    className="bg-muted"
                  />
                  <Label>Professor(a)</Label>
                  <Input
                    value={selectedBlock.content.teacherName || ''}
                    disabled
                    className="bg-muted"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label>Matéria</Label>
                      <Select
                        value={selectedBlock.content.discipline}
                        onValueChange={(value) =>
                          updateBlock(selectedBlock.id, { discipline: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          {userProfile?.disciplines.map((d) => (
                            <SelectItem key={d} value={d}>
                              {d}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Turma</Label>
                      <Select
                        value={selectedBlock.content.gradeLevel}
                        onValueChange={(value) =>
                          updateBlock(selectedBlock.id, { gradeLevel: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          {classes.map((c) => (
                            <SelectItem key={c.id} value={c.name}>
                              {c.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Label>Data</Label>
                  <div className="relative">
                    <Input
                      type="date"
                      value={selectedBlock.content.date || ''}
                      onChange={(e) => updateBlock(selectedBlock.id, { date: e.target.value })}
                    />
                  </div>
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
