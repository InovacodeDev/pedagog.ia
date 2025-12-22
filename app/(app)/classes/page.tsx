import { getClassesWithGradesAction } from '@/server/actions/classes';
import { ClassesList } from './classes-list';

export const metadata = {
  title: 'Minhas Turmas | Pedagog.IA',
  description: 'Gerencie suas turmas e alunos.',
};

interface ClassesPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ClassesPage({ searchParams }: ClassesPageProps) {
  const resolvedSearchParams = await searchParams;
  const term =
    typeof resolvedSearchParams.term === 'string' ? resolvedSearchParams.term : '1_bimestre';

  const classes = await getClassesWithGradesAction(term);

  return (
    <div className="container py-8">
      <ClassesList initialClasses={classes} currentTerm={term} />
    </div>
  );
}
