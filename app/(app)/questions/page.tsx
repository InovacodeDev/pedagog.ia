import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { QuestionsTable } from '@/components/questions/questions-table';
import { getQuestionsAction } from '@/server/actions/questions';
import { DataUnavailable } from '@/components/ui/data-unavailable';

export default async function QuestionsPage() {
  const { questions, success, error } = await getQuestionsAction();

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold">Banco de Questões</h1>
          <p className="text-muted-foreground">
            Gerencie, filtre e organize suas questões geradas.
          </p>
        </div>
        <Button asChild>
          <Link href="/questions/generator">
            <Plus className="mr-2 h-4 w-4" /> Gerar Novas Questões
          </Link>
        </Button>
      </div>

      {!success ? (
        <DataUnavailable message={error} />
      ) : (
        <QuestionsTable initialQuestions={questions || []} />
      )}
    </div>
  );
}
