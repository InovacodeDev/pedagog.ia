'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Loader2, Plus, Trash2, Save, Wand2 } from 'lucide-react';
import { toast } from 'sonner';
import { generateQuestionsAction, saveExamAction } from '@/app/(app)/scan/actions';
import { createClient } from '@/lib/supabase/client';

interface Question {
  stem: string;
  options: string[];
  correct_answer: string; // "0", "1", "2", "3" representing index
  difficulty: 'easy' | 'medium' | 'hard';
}

export function ExamBuilder() {
  const [step, setStep] = useState<'config' | 'generating' | 'review'>('config');
  const [jobId, setJobId] = useState<string | null>(null);
  const supabase = createClient();

  const { register, control, handleSubmit, setValue, watch } = useForm({
    defaultValues: {
      title: '',
      topic: '',
      grade: '',
      quantity: 5,
      difficulty: 'medium',
      questions: [] as Question[],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'questions',
  });

  // Poll for job completion
  useEffect(() => {
    if (!jobId || step !== 'generating') return;

    const interval = setInterval(async () => {
      const { data: job } = await supabase
        .from('background_jobs')
        .select('status, result')
        .eq('id', jobId)
        .single();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((job as any)?.status === 'completed') { // TODO: Refactor 'any' to strict type [Jules]
        clearInterval(interval);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result = (job as any).result; // TODO: Refactor 'any' to strict type [Jules]
        // Handle both direct array (v1) and wrapped object (v2)
        const rawQuestions = Array.isArray(result) ? result : result?.questions || [];

        // Normalize questions to match ExamBuilder expectations
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const questions = rawQuestions.map((q: any) => ({ // TODO: Refactor 'any' to strict type [Jules]
          stem: q.stem || '',
          options: Array.isArray(q.options) ? q.options : ['', '', '', ''],
          correct_answer: String(q.correct_answer || '0'),
          difficulty: q.difficulty || 'medium',
        }));

        setValue('questions', questions);
        setStep('review');
        toast.success('Questões geradas com sucesso!');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } else if ((job as any)?.status === 'failed') { // TODO: Refactor 'any' to strict type [Jules]
        clearInterval(interval);
        setStep('config');
        toast.error('Falha ao gerar questões. Tente novamente.');
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [jobId, step, supabase, setValue]);

  const onGenerate = async (data: { topic: string; quantity: number; difficulty: string }) => {
    setStep('generating');
    try {
      console.log({ data });
      const formData = new FormData();
      formData.append('topic', data.topic);
      formData.append('quantity', data.quantity.toString());
      formData.append('difficulty', data.difficulty);

      const result = await generateQuestionsAction(formData);
      console.log({ result });
      setJobId(result.jobId);
    } catch (error) {
      console.error(error);
      setStep('config');
      toast.error('Erro ao iniciar geração.');
    }
  };

  const onSave = async (data: { title: string; questions: Question[] }) => {
    try {
      await saveExamAction(data);
      toast.success('Prova salva com sucesso!');
    } catch (error) {
      console.error(error);
      toast.error('Erro ao salvar prova.');
    }
  };

  if (step === 'config') {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Configurar Nova Prova</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Título da Prova</Label>
            <Input {...register('title')} placeholder="Ex: Avaliação de História - 1º Bimestre" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tópico / Assunto</Label>
              <Input {...register('topic')} placeholder="Ex: Revolução Francesa" />
            </div>
            <div className="space-y-2">
              <Label>Série / Ano</Label>
              <Input {...register('grade')} placeholder="Ex: 8º Ano" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Quantidade de Questões</Label>
              <Input
                type="number"
                {...register('quantity', { valueAsNumber: true })}
                min={1}
                max={20}
              />
            </div>
            <div className="space-y-2">
              <Label>Dificuldade</Label>
              <Select
                onValueChange={(val: string) =>
                  setValue('difficulty', val as 'easy' | 'medium' | 'hard')
                }
                defaultValue="medium"
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Fácil</SelectItem>
                  <SelectItem value="medium">Médio</SelectItem>
                  <SelectItem value="hard">Difícil</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSubmit(onGenerate)} className="w-full">
            <Wand2 className="mr-2 h-4 w-4" />
            Gerar com IA
          </Button>
        </CardFooter>
      </Card>
    );
  }

  if (step === 'generating') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <h3 className="text-xl font-medium">Criando sua prova...</h3>
        <p className="text-muted-foreground text-center max-w-md">
          Nossa IA está elaborando questões baseadas no tópico solicitado. Isso pode levar alguns
          segundos.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Revisar Prova</h2>
          <p className="text-muted-foreground">
            Edite as questões, defina as respostas corretas e finalize.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() =>
              append({
                stem: '',
                options: ['', '', '', ''],
                correct_answer: '0',
                difficulty: 'medium',
              })
            }
          >
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Questão
          </Button>
          <Button onClick={handleSubmit(onSave)}>
            <Save className="mr-2 h-4 w-4" />
            Salvar Prova
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label>Título da Prova</Label>
          <Input {...register('title')} className="text-lg font-medium" />
        </div>

        {fields.map((field, index) => (
          <Card key={field.id} className="relative">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-base font-medium text-muted-foreground">
                  Questão {index + 1}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive/90"
                  onClick={() => remove(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                {...register(`questions.${index}.stem` as const)}
                placeholder="Enunciado da questão"
                className="font-medium"
              />
              <div className="grid gap-3">
                {[0, 1, 2, 3].map((optIndex) => (
                  <div key={optIndex} className="flex items-center gap-3">
                    <div className="flex items-center h-full">
                      <input
                        type="radio"
                        value={optIndex.toString()}
                        {...register(`questions.${index}.correct_answer` as const)}
                        className="h-4 w-4 text-primary border-gray-300 focus:ring-primary"
                      />
                    </div>
                    <Input
                      {...register(`questions.${index}.options.${optIndex}` as const)}
                      placeholder={`Opção ${String.fromCharCode(65 + optIndex)}`}
                      className={
                        watch(`questions.${index}.correct_answer`) === optIndex.toString()
                          ? 'border-green-500 ring-1 ring-green-500 bg-green-50/50'
                          : ''
                      }
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
