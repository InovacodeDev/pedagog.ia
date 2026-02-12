'use client';

import { useState, useEffect } from 'react';
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
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { generateQuestionsV2Action, saveQuestionsAction } from '@/server/actions/questions';
import { ModelSelector } from '@/components/ui/model-selector';
import { GeneratedQuestion } from '@/types/questions';
import { GeneratedQuestionCard } from './generated-question-card';

const formSchema = z
  .object({
    quantity: z.number().min(1).max(10),
    types: z.array(z.string()).min(1, 'Selecione pelo menos um tipo de questão.'),
    style: z.string().min(1, 'Selecione um estilo.'),
    discipline: z.string().min(1, 'Selecione uma matéria.'),
    subject: z.string().min(1, 'Informe o assunto.'),
    grade_level: z.string().optional(),
    subtypes: z.record(z.string(), z.string()).optional(),
    style_subtype: z.string().optional(),
    model_tier: z.enum(['fast', 'quality']).default('fast'),
    files: z
      .array(
        z.object({
          name: z.string(),
          type: z.string(),
          content: z.string(),
        })
      )
      .optional(), // Make files optional since internet search can now be used
    use_internet_search: z.boolean().default(false),
  })
  .superRefine((data, ctx) => {
    // Require either files or internet search
    if ((!data.files || data.files.length === 0) && !data.use_internet_search) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Adicione arquivos de contexto ou ative a busca na internet.',
        path: ['files'],
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
  { value: 'high_school', label: 'Colégio' },
  { value: 'entrance_exam', label: 'Vestibular' },
  { value: 'civil_service', label: 'Concurso Público' },
];

const STYLE_RULES: Record<string, { allowedTypes: string[]; label: string }> = {
  enem: {
    label: 'ENEM',
    allowedTypes: ['multiple_choice', 'essay'],
  },
  high_school: {
    label: 'Colégio',
    allowedTypes: ['multiple_choice', 'true_false', 'open_ended', 'essay', 'association', 'sum'],
  },
  entrance_exam: {
    label: 'Vestibular',
    allowedTypes: ['multiple_choice', 'open_ended', 'essay', 'sum'],
  },
  civil_service: {
    label: 'Concurso Público',
    allowedTypes: ['multiple_choice', 'true_false', 'open_ended', 'essay'],
  },
};

const SUBTYPE_RULES: Record<string, { allowedTypes: string[]; label: string }> = {
  // --- VESTIBULARES ---
  fuvest: {
    label: 'FUVEST',
    allowedTypes: ['multiple_choice', 'open_ended', 'essay'],
  },
  unicamp: {
    label: 'UNICAMP',
    allowedTypes: ['multiple_choice', 'open_ended', 'essay'],
  },
  vunesp: {
    label: 'VUNESP',
    allowedTypes: ['multiple_choice', 'open_ended', 'essay'],
  },
  ufsc: {
    label: 'UFSC',
    allowedTypes: ['sum', 'open_ended', 'essay'],
  },
  ufrgs: {
    label: 'UFRGS',
    allowedTypes: ['multiple_choice', 'essay'],
  },
  acafe: {
    label: 'ACAFE',
    allowedTypes: ['multiple_choice', 'essay'],
  },
  ita_ime: {
    label: 'ITA/IME',
    allowedTypes: ['multiple_choice', 'open_ended'],
  },
  puc_mackenzie: {
    label: 'PUC/Mackenzie',
    allowedTypes: ['multiple_choice', 'essay'],
  },
  val_general: {
    label: 'Vestibular Geral',
    allowedTypes: ['multiple_choice', 'open_ended', 'essay'],
  },

  // --- CONCURSOS ---
  cebraspe: {
    label: 'CEBRASPE',
    allowedTypes: ['true_false', 'multiple_choice', 'essay', 'open_ended'],
  },
  fgv: {
    label: 'FGV',
    allowedTypes: ['multiple_choice', 'open_ended', 'essay'],
  },
  fcc: {
    label: 'FCC',
    allowedTypes: ['multiple_choice', 'essay'],
  },
  vunesp_concursos: {
    label: 'VUNESP (Concursos)',
    allowedTypes: ['multiple_choice', 'open_ended', 'essay'],
  },
  cesgranrio: {
    label: 'Cesgranrio',
    allowedTypes: ['multiple_choice', 'essay', 'open_ended'],
  },
  cs_general: {
    label: 'Concurso Geral',
    allowedTypes: ['multiple_choice', 'true_false', 'open_ended', 'essay'],
  },
};

const STYLE_SUBTYPES: Record<string, { label: string; value: string }[]> = {
  entrance_exam: [
    { value: 'fuvest', label: 'FUVEST (USP) - Conteudista/Analítica' },
    { value: 'unicamp', label: 'UNICAMP - Crítica/Interdisciplinar' },
    { value: 'vunesp', label: 'VUNESP (UNESP) - Conteúdo Direto' },
    { value: 'ufsc', label: 'UFSC - Somatória/Proposições' },
    { value: 'ufrgs', label: 'UFRGS - Tradicional/Conteudista' },
    { value: 'acafe', label: 'ACAFE - Medicina/Objetiva' },
    { value: 'ita_ime', label: 'ITA/IME - Altíssima Complexidade (Exatas)' },
    { value: 'puc_mackenzie', label: 'Particulares (PUC/Mackenzie)' },
    { value: 'general', label: 'Padrão Geral / Outros' },
  ],
  civil_service: [
    { value: 'cebraspe', label: 'CEBRASPE (Cespe) - Interpretativa' },
    { value: 'fgv', label: 'FGV - Complexa/Casos Práticos' },
    { value: 'fcc', label: 'FCC - Letra da Lei/Direta' },
    { value: 'vunesp_concursos', label: 'VUNESP - Prefeituras/TJ' },
    { value: 'cesgranrio', label: 'Cesgranrio - Bancária/Petróleo' },
    { value: 'general', label: 'Padrão Geral / Outros' },
  ],
};

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

const QUESTION_SUBTYPES: Record<string, { label: string; value: string }[]> = {
  multiple_choice: [
    { value: 'direct_interrogation', label: 'Interrogação Direta (O que é...?)' },
    { value: 'incomplete_statement', label: 'Afirmação Incompleta (Completa a frase)' },
    { value: 'interpretation', label: 'Interpretação/Situação-Problema' },
    { value: 'assertion_reason', label: 'Asserção e Razão (Porque...)' },
    { value: 'negative_focus', label: 'Foco Negativo (Exceto/Incorreta)' },
  ],
  true_false: [
    { value: 'standard', label: 'Padrão (V/F Independente)' },
    { value: 'grouped', label: 'Agrupamento (Julgue os itens I, II, III)' },
  ],
  essay: [
    { value: 'dissertativo_argumentativo', label: 'Dissertativo-Argumentativo' },
    { value: 'narrative', label: 'Narrativo' },
    { value: 'descriptive', label: 'Descritivo' },
    { value: 'opinion_article', label: 'Artigo de Opinião' },
  ],
  open_ended: [
    { value: 'conceptual', label: 'Conceitual (Defina/Explique)' },
    { value: 'analytical', label: 'Analítica (Justifique/Relacione)' },
    { value: 'calculation', label: 'Cálculo/Demonstração' },
  ],
  association: [
    { value: 'concepts_definitions', label: 'Conceitos x Definições' },
    { value: 'events_dates', label: 'Eventos x Datas/Autores' },
  ],
  sum: [{ value: 'standard', label: 'Padrão (Soma)' }],
};

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
      quantity: 5,
      types: [],
      style: '',
      discipline: '',
      subject: '',
      grade_level: '',
      subtypes: {},
      style_subtype: '',
      model_tier: 'fast',
      files: [],
      use_internet_search: false,
    },
  });

  const selectedStyle = form.watch('style');
  const selectedTypes = form.watch('types');
  const selectedSubtype = form.watch('style_subtype');

  // Derived State
  const activeRules =
    (selectedSubtype && SUBTYPE_RULES[selectedSubtype]) || STYLE_RULES[selectedStyle] || null;

  useEffect(() => {
    // ENEM Lock for Essay in Subtypes
    if (selectedStyle === 'enem' && selectedTypes?.includes('essay')) {
      const currentSubtypes = form.getValues('subtypes') || {};
      if (currentSubtypes.essay !== 'dissertativo_argumentativo') {
        form.setValue('subtypes', {
          ...currentSubtypes,
          essay: 'dissertativo_argumentativo',
        });
      }
    }
  }, [selectedStyle, selectedTypes, form]);

  useEffect(() => {
    // Reset style_subtype when style changes
    form.setValue('style_subtype', '');
  }, [selectedStyle, form]);

  useEffect(() => {
    if (activeRules) {
      const validTypes = selectedTypes.filter((t) => activeRules.allowedTypes.includes(t));
      if (validTypes.length !== selectedTypes.length) {
        form.setValue('types', validTypes);
        toast.info(
          `Tipos de questão incompatíveis com ${activeRules.label} foram removidos automaticamente.`
        );
      }
    }
  }, [selectedStyle, selectedSubtype, form]); // eslint-disable-line react-hooks/exhaustive-deps

  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log('onSubmit');
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
      if (!result.success || !result.questions) {
        throw new Error(result.error || 'Erro ao gerar questões.');
      }

      console.log({ questions: result.questions });
      setGeneratedQuestions(result.questions);
      setSelectedIndices(result.questions.map((_, i) => i));
      toast.success('Questões geradas com sucesso!');
    } catch (error: unknown) {
      console.log({ error });
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
                <form
                  onSubmit={form.handleSubmit(onSubmit, (errors) => {
                    console.error('Form Errors:', errors);
                    toast.error('Existem erros no formulário. Verifique os campos destacados.');
                  })}
                  className="space-y-6"
                >
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

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
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
                      name="style"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estilo</FormLabel>
                          <Select
                            onValueChange={(val) => {
                              field.onChange(val);
                              // Clear grade_level if style doesn't require it
                              if (['enem', 'entrance_exam', 'civil_service'].includes(val)) {
                                form.setValue('grade_level', '');
                              }
                            }}
                            defaultValue={field.value}
                          >
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

                    {/* Conditional Slot: Grade Level OR Banca */}
                    {STYLE_SUBTYPES[selectedStyle] ? (
                      <FormField
                        control={form.control}
                        name="style_subtype"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Banca / Instituição</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger className="text-left">
                                  <SelectValue placeholder="Selecione a banca..." />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {STYLE_SUBTYPES[selectedStyle].map((subtype) => (
                                  <SelectItem key={subtype.value} value={subtype.value}>
                                    {subtype.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    ) : (
                      <FormField
                        control={form.control}
                        name="grade_level"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Ano/Série</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                              disabled={selectedStyle === 'enem'}
                            >
                              <FormControl>
                                <SelectTrigger className="text-left">
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
                    )}

                    {/* Subtypes Logic: Render one select per selected type if applicable */}
                    {selectedTypes.length > 0 && (
                      <div className="col-span-1 lg:col-span-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2 border-t pt-4">
                        {selectedTypes.map((typeId) => {
                          const options = QUESTION_SUBTYPES[typeId];
                          const typeLabel =
                            QUESTION_TYPES.find((t) => t.id === typeId)?.label || typeId;
                          if (!options) return null;

                          const isEnemEssay = selectedStyle === 'enem' && typeId === 'essay';

                          return (
                            <FormField
                              key={typeId}
                              control={form.control}
                              name={`subtypes.${typeId}`}
                              render={({ field }) => (
                                <FormItem className="col-span-1">
                                  <FormLabel
                                    className="truncate block"
                                    title={`Formato (${typeLabel})`}
                                  >
                                    Formato ({typeLabel})
                                  </FormLabel>
                                  <Select
                                    value={
                                      isEnemEssay
                                        ? 'dissertativo_argumentativo'
                                        : (field.value as string) || ''
                                    }
                                    disabled={isEnemEssay}
                                    onValueChange={field.onChange}
                                  >
                                    <FormControl>
                                      <SelectTrigger className="text-left">
                                        <SelectValue placeholder="Selecione um formato..." />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {options.map((opt) => (
                                        <SelectItem key={opt.value} value={opt.value}>
                                          {opt.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          );
                        })}
                      </div>
                    )}
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
                    {form.formState.errors.files && (
                      <p className="text-sm font-medium text-destructive">
                        {form.formState.errors.files.message}
                      </p>
                    )}

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

                    <FormField
                      control={form.control}
                      name="use_internet_search"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Buscar conteúdo na internet</FormLabel>
                            <div className="text-sm text-muted-foreground">
                              Utilize a IA para pesquisar e complementar o conteúdo. (Custo
                              adicional: 5 créditos)
                            </div>
                          </div>
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={(checked) => {
                                field.onChange(checked);
                                form.trigger('files');
                              }}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
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
                                const isAllowed =
                                  !activeRules || activeRules.allowedTypes.includes(type.id);

                                const CheckboxElement = (
                                  <div
                                    className={`flex flex-row items-start space-x-3 space-y-0 ${
                                      !isAllowed ? 'opacity-50 cursor-not-allowed' : ''
                                    }`}
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(type.id)}
                                        disabled={!isAllowed}
                                        onCheckedChange={(checked) => {
                                          if (checked) {
                                            return field.onChange([...field.value, type.id]);
                                          } else {
                                            // Clear subtype value and errors when type is deselected
                                            form.setValue(`subtypes.${type.id}`, '');
                                            form.clearErrors(`subtypes.${type.id}`);
                                            return field.onChange(
                                              field.value?.filter((value) => value !== type.id)
                                            );
                                          }
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="font-normal cursor-pointer">
                                      {type.label}
                                    </FormLabel>
                                  </div>
                                );

                                if (!isAllowed) {
                                  return (
                                    <FormItem key={type.id}>
                                      <TooltipProvider>
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            {/* Wrap in div because disabled inputs don't fire events */}
                                            <div>{CheckboxElement}</div>
                                          </TooltipTrigger>
                                          <TooltipContent>
                                            <p>
                                              Tipo não disponível para o estilo{' '}
                                              {activeRules?.label || 'selecionado'}
                                            </p>
                                          </TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>
                                    </FormItem>
                                  );
                                }

                                return (
                                  <FormItem key={type.id} className="items-start space-y-0">
                                    {CheckboxElement}
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

                  <Button type="submit" className="w-full cursor-pointer" disabled={isLoading}>
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
