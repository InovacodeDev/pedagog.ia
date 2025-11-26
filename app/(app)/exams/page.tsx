import { getExamsAction } from '@/server/actions/exams';
import { ExamList } from '@/components/exams/exam-list';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { DataUnavailable } from '@/components/ui/data-unavailable';

export default async function ExamsPage() {
  const { exams, success, error } = await getExamsAction();

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold">Banco de Provas</h1>
          <p className="text-muted-foreground">
            Gerencie suas provas, duplique modelos e exporte para PDF.
          </p>
        </div>
        <Button asChild>
          <Link href="/exams/builder">
            <Plus className="mr-2 h-4 w-4" /> Nova Prova
          </Link>
        </Button>
      </div>

      {!success ? <DataUnavailable message={error} /> : <ExamList initialExams={exams || []} />}
    </div>
  );
}
