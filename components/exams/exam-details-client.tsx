'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  Copy, 
  Edit, 
  LayoutDashboard, 
  Eye, 
  MoreVertical,
  ChevronLeft,
  EyeOff
} from 'lucide-react';
import { Json } from '@/types/database';
import { getTermLabel } from '@/lib/terms';
import { ExamBlock } from '@/components/builder/exam-block';
import { ExamAnalyticsComponent } from './exam-analytics';
import { ExamViewer } from './exam-viewer';
import { DownloadPDFButton, Exam as DownloadableExam } from './DownloadPDFButton';
import { ExamAnalytics } from '@/server/actions/get-exam-analytics';
import { duplicateExamAction } from '@/server/actions/exams';
import { toast } from 'sonner';
import amplitude from '@/lib/amplitude';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';

interface ExamDetails {
  id: string;
  title: string;
  discipline?: string | null;
  term?: string | null;
  questions_list?: Json;
  correction_count?: number | null;
  status?: string | null;
  created_at?: string | null;
}

interface ExamDetailsClientProps {
  exam: ExamDetails;
  analytics: ExamAnalytics;
}

export function ExamDetailsClient({ exam, analytics }: ExamDetailsClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState('analytics');

  // Business rules:
  // - Platform generated: questions_list exists and has items
  const questionsList = Array.isArray(exam.questions_list) 
    ? (exam.questions_list as unknown[]) 
    : [];
  const isPlatformGenerated = questionsList.length > 0;
  
  // - Editable: Platform generated AND no students took it yet (correction_count === 0)
  const isEditable = isPlatformGenerated && (exam.correction_count || 0) === 0;

  const handleDuplicate = async () => {
    amplitude.track('Exam Duplicated', { examId: exam.id, source: 'details_page' });
    
    startTransition(async () => {
      toast.promise(
        duplicateExamAction(exam.id),
        {
          loading: 'Duplicando prova...',
          success: (data) => {
            if (data.success && data.exam?.id) {
              router.push(`/exams/${data.exam.id}`);
            }
            return 'Prova duplicada com sucesso!';
          },
          error: (error) => error.message || 'Erro ao duplicar prova',
        }
      );
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-background pb-10">
      {/* Page Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background before:absolute before:inset-x-0 before:bottom-full before:h-screen before:bg-background">
        <div className="container px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="h-8 w-8"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold tracking-tight">{exam.title}</h1>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{exam.discipline || 'Geral'}</span>
                <span>•</span>
                <span>{getTermLabel(exam.term)}</span>
              </div>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2">
             {isPlatformGenerated && (
              <>
                <DownloadPDFButton exam={exam as unknown as DownloadableExam} />
                <Button variant="outline" onClick={handleDuplicate} disabled={isPending}>
                  <Copy className="mr-2 h-4 w-4" />
                  Duplicar
                </Button>
              </>
            )}
            
            <Button 
              size="default" 
              disabled={!isEditable}
              variant={isEditable ? 'default' : 'secondary'}
              asChild={!!isEditable}
            >
              {isEditable ? (
                <Link href={`/exams/${exam.id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </Link>
              ) : (
                <div className="flex items-center opacity-50 cursor-not-allowed">
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </div>
              )}
            </Button>
          </div>

          {/* Mobile Actions */}
          <div className="md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                 {isPlatformGenerated && (
                  <>
                    <DropdownMenuItem asChild>
                        <div className="w-full">
                           <DownloadPDFButton exam={exam as unknown as DownloadableExam} />
                        </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleDuplicate} disabled={isPending}>
                      <Copy className="mr-2 h-4 w-4" /> Duplicar
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuItem disabled={!isEditable} asChild={!!isEditable}>
                   {isEditable ? (
                    <Link href={`/exams/${exam.id}/edit`}>
                        <Edit className="mr-2 h-4 w-4" /> Editar
                    </Link>
                  ) : (
                    <div className="flex items-center opacity-50">
                        <Edit className="mr-2 h-4 w-4" /> Editar
                    </div>
                  )}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="container px-4 py-6 flex-1">
        <Tabs defaultValue="analytics" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Visualização
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analytics" className="space-y-4">
            <ExamAnalyticsComponent analytics={analytics} />
          </TabsContent>

          <TabsContent value="preview" className="space-y-4">
            {isPlatformGenerated ? (
              <div className="rounded-lg border bg-white p-4 shadow-sm overflow-hidden">
                <ExamViewer 
                  examId={exam.id} 
                  blocks={questionsList as ExamBlock[]} 
                  title={exam.title}
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-12 border rounded-lg bg-muted/20 text-center space-y-4 h-[400px]">
                <div className="p-4 rounded-full bg-muted">
                    <EyeOff className="h-8 w-8 text-muted-foreground" />
                </div>
                <div className="max-w-[400px] space-y-2">
                    <h3 className="text-lg font-semibold">Visualização indisponível</h3>
                    <p className="text-sm text-muted-foreground">
                    Esta é uma prova manual (apenas notas). O conteúdo da prova não foi cadastrado na plataforma, por isso não é possível visualizá-la no momento.
                    </p>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
