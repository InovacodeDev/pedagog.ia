import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { DownloadPDFButton } from '@/components/exams/DownloadPDFButton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface ExamPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ExamPage({ params }: ExamPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: exam, error } = await supabase.from('exams').select('*').eq('id', id).single();

  if (error || !exam) {
    notFound();
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/scan">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{exam.title}</h1>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant={exam.status === 'published' ? 'default' : 'secondary'}>
                {exam.status === 'published' ? 'Publicada' : 'Rascunho'}
              </Badge>
              <span className="text-sm text-muted-foreground">
                Criada em {new Date(exam.created_at).toLocaleDateString('pt-BR')}
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <DownloadPDFButton exam={exam} />
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Questões ({exam.questions_list.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {exam.questions_list.map((question: any, index: number) => (
              <div key={index} className="border-b last:border-0 pb-4 last:pb-0">
                <p className="font-medium mb-2">
                  {index + 1}. {question.stem}
                </p>
                <div className="grid gap-2 pl-4">
                  {question.options.map((option: string, optIndex: number) => (
                    <div
                      key={optIndex}
                      className={`text-sm p-2 rounded ${
                        question.correct_answer === optIndex.toString()
                          ? 'bg-green-50 text-green-700 font-medium'
                          : 'text-muted-foreground'
                      }`}
                    >
                      {String.fromCharCode(65 + optIndex)}) {option}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
