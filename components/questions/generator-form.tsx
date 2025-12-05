'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Wand2, Save, Upload, X, FileText } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { generateQuestionsV2Action, saveQuestionsAction } from '@/server/actions/questions';
import { ModelSelector } from '@/components/ui/model-selector';
import { GeneratedQuestion } from '@/types/questions';
import { GeneratedQuestionCard } from './generated-question-card';

const formSchema = z
  .object({
    content: z.string().optional(),
    quantity: z.number().min(1).max(10),
    types: z.array(z.string()).min(1, 'Selecione pelo menos um tipo de questão.'),
    style: z.string().min(1, 'Selecione um estilo.'),
    discipline: z.string().min(1, 'Selecione uma matéria.'),
    subject: z.string().min(1, 'Informe o assunto.'),
    grade_level: z.string().min(1, 'Selecione o ano/série.'),
    model_tier: z.enum(['fast', 'quality']).default('fast'),
    files: z
      .array(
        z.object({
          name: z.string(),
          type: z.string(),
          content: z.string(),
        })
      )
      .optional(),
  })
  .superRefine((data, ctx) => {
    const hasContent = data.content && data.content.length >= 50;
    const hasFiles = data.files && data.files.length > 0;

    if (!hasContent && !hasFiles) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Você deve fornecer um texto base (mín. 50 caracteres) ou adicionar arquivos.',
        path: ['content'],
      });
    }
  });

const QUESTION_TYPES = [
  { id: 'multiple_choice', label: 'Múltipla Escolha' },
  { id: 'true_false', label: 'Verdadeiro / Falso' },
  { id: 'open_ended', label: 'Dissertativa' },
  { id: 'sum', label: 'Somatória' },
  { id: 'essay', label: 'Redação' },
  { id: 'association', label: 'Associação' },
];

const STYLES = [
  { value: 'enem', label: 'ENEM' },
  { value: 'high_school', label: 'Ensino Médio' },
  { value: 'entrance_exam', label: 'Vestibular' },
  { value: 'civil_service', label: 'Concurso Público' },
];

const DISCIPLINES = [
  'Matemática',
  'Português',
  'História',
  'Geografia',
  'Ciências',
  'Inglês',
  'Outros',
];

const GRADE_LEVELS = ['Fundamental I', 'Fundamental II', 'Ensino Médio'];

export function GeneratorForm({
  isPro = false,
  onImport,
}: {
  isPro?: boolean;
  onImport?: (questions: GeneratedQuestion[]) => void;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<GeneratedQuestion[] | null>(null);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const MAX_SIZE = isPro ? 10 * 1024 * 1024 : 5 * 1024 * 1024;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const currentSize = selectedFiles.reduce((acc, file) => acc + file.size, 0);
      const newSize = newFiles.reduce((acc, file) => acc + file.size, 0);

      if (currentSize + newSize > MAX_SIZE) {
        toast.error(`O tamanho total dos arquivos excede o limite de ${isPro ? '10MB' : '5MB'}.`);
        return;
      }

      const updatedFiles = [...selectedFiles, ...newFiles];
      setSelectedFiles(updatedFiles);

      // Sync with form for validation
      form.setValue(
        'files',
        updatedFiles.map((f) => ({ name: f.name, type: f.type, content: '' })),
        { shouldValidate: true }
      );
    }
  };

  const removeFile = (index: number) => {
    const updatedFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(updatedFiles);

    // Sync with form for validation
    form.setValue(
      'files',
      updatedFiles.map((f) => ({ name: f.name, type: f.type, content: '' })),
      { shouldValidate: true }
    );
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const form = useForm<z.infer<typeof formSchema>>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      content: '',
      quantity: 5,
      types: [],
      style: '',
      discipline: '',
      subject: '',
      grade_level: '',
      model_tier: 'fast',
      files: [],
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setGeneratedQuestions(null);

    try {
      const processedFiles = await Promise.all(
        selectedFiles.map(async (file) => ({
          name: file.name,
          type: file.type,
          content: await convertFileToBase64(file),
        }))
      );

      const payload = {
        ...values,
        files: processedFiles,
      };

      const result = await generateQuestionsV2Action(payload);

      console.log({ result });
      if (!result.success || !result.questions) {
        throw new Error(result.error || 'Erro ao gerar questões.');
      }

      console.log({ questions: result.questions });
      setGeneratedQuestions(result.questions);
      setSelectedIndices(result.questions.map((_, i) => i));
      toast.success('Questões geradas com sucesso!');
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Ocorreu um erro desconhecido.');
      }
    } finally {
      setIsLoading(false);
    }
  }

  const handleSave = async () => {
    if (!generatedQuestions) return;

    const questionsToSave = generatedQuestions.filter((_, i) => selectedIndices.includes(i));

    if (questionsToSave.length === 0) {
      toast.error('Selecione pelo menos uma questão para salvar.');
      return;
    }

    if (onImport) {
      onImport(questionsToSave);
      return;
    }

    setIsSaving(true);
    try {
      const result = await saveQuestionsAction(questionsToSave);
      if (result.success) {
        toast.success('Questões salvas no Banco de Questões!');
        setGeneratedQuestions(null);
        setSelectedIndices([]);
        setSelectedFiles([]);
        form.reset();
      } else {
        toast.error(`Erro ao salvar: ${result.error}`);
      }
    } catch {
      toast.error('Erro ao salvar questões.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Form Column */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Configuração da Geração</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="model_tier"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <ModelSelector value={field.value} onValueChange={field.onChange} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="discipline"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Matéria</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {DISCIPLINES.map((d) => (
                                <SelectItem key={d} value={d}>
                                  {d}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="grade_level"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ano/Série</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {GRADE_LEVELS.map((l) => (
                                <SelectItem key={l} value={l}>
                                  {l}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Assunto</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Equação de 2º Grau" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contexto</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Cole aqui o texto base, link ou tópico..."
                            className="min-h-[150px]"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>Mínimo de 50 caracteres.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-4">
                    <FormLabel>Arquivos de Contexto (PDF, Imagens, Texto)</FormLabel>
                    <div className="flex items-center gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('file-upload')?.click()}
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        Adicionar Arquivos
                      </Button>
                      <input
                        id="file-upload"
                        type="file"
                        className="hidden"
                        multiple
                        accept=".pdf,.txt,.doc,.docx,.png,.jpg,.jpeg"
                        onChange={handleFileChange}
                      />
                      <span className="text-xs text-muted-foreground">
                        Máx: {isPro ? '10MB' : '5MB'}
                      </span>
                    </div>

                    {selectedFiles.length > 0 && (
                      <div className="space-y-2">
                        {selectedFiles.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-2 border rounded-md bg-muted/50"
                          >
                            <div className="flex items-center gap-2 overflow-hidden">
                              <FileText className="h-4 w-4 flex-shrink-0" />
                              <span className="text-sm truncate">{file.name}</span>
                              <span className="text-xs text-muted-foreground">
                                ({(file.size / 1024).toFixed(1)} KB)
                              </span>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => removeFile(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <FormField
                    control={form.control}
                    name="quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantidade: {field.value}</FormLabel>
                        <FormControl>
                          <Slider
                            min={1}
                            max={10}
                            step={1}
                            defaultValue={[field.value]}
                            onValueChange={(vals) => field.onChange(vals[0])}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="types"
                    render={() => (
                      <FormItem>
                        <FormLabel>Tipos de Questão</FormLabel>
                        <div className="grid grid-cols-2 gap-4">
                          {QUESTION_TYPES.map((type) => (
                            <FormField
                              key={type.id}
                              control={form.control}
                              name="types"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={type.id}
                                    className="flex flex-row items-start space-x-3 space-y-0"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(type.id)}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([...field.value, type.id])
                                            : field.onChange(
                                                field.value?.filter((value) => value !== type.id)
                                              );
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="font-normal">{type.label}</FormLabel>
                                  </FormItem>
                                );
                              }}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="style"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estilo</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione um estilo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {STYLES.map((style) => (
                              <SelectItem key={style.value} value={style.value}>
                                {style.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Gerando...
                      </>
                    ) : (
                      <>
                        <Wand2 className="mr-2 h-4 w-4" /> Gerar Questões
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        {/* Results Column */}
        <div className="space-y-6">
          {isLoading && (
            <div className="space-y-4">
              <Skeleton className="h-[200px] w-full rounded-xl" />
              <Skeleton className="h-[200px] w-full rounded-xl" />
              <Skeleton className="h-[200px] w-full rounded-xl" />
            </div>
          )}

          {!isLoading && generatedQuestions && (
            <>
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold">Questões Geradas</h3>
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando...
                    </>
                  ) : onImport ? (
                    <>
                      <Save className="mr-2 h-4 w-4" /> Adicionar à Prova
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" /> Salvar no Banco
                    </>
                  )}
                </Button>
              </div>
              <div className="space-y-4">
                {generatedQuestions.map((q, i) => (
                  <GeneratedQuestionCard
                    key={i}
                    question={q}
                    isSelected={selectedIndices.includes(i)}
                    onToggleSelection={(checked) => {
                      setSelectedIndices((prev) =>
                        checked ? [...prev, i] : prev.filter((index) => index !== i)
                      );
                    }}
                    onUpdate={(updatedQuestion) => {
                      setGeneratedQuestions((prev) =>
                        prev ? prev.map((item, idx) => (idx === i ? updatedQuestion : item)) : null
                      );
                    }}
                  />
                ))}
              </div>
            </>
          )}

          {!isLoading && !generatedQuestions && (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8 border-2 border-dashed rounded-xl">
              <Wand2 className="h-12 w-12 mb-4 opacity-20" />
              <p>Preencha o formulário para gerar questões.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
