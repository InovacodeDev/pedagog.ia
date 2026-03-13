

import { ClassesList } from './classes-list';
import { getClassesWithGradesAction } from '@/server/actions/classes';
import { getSubscriptionPlan } from '@/lib/subscription';
import { CreateClassDialog } from '@/components/classes/create-class-dialog';


export const metadata = {
  title: 'Minhas Turmas | Pedagog.IA',
  description: 'Gerencie suas turmas e alunos.',
};

export default async function ClassesPage() {
  const classes = await getClassesWithGradesAction();
  const { isPro } = await getSubscriptionPlan();

  return (
    <div className="container py-8">
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold">Turmas</h1>
            <p className="text-muted-foreground">
              Gerencie seus alunos, provas e acompanhe o desempenho através de analytics.
            </p>
          </div>
          <CreateClassDialog isPro={!!isPro} classesCount={classes?.length || 0} />
        </div>

        <ClassesList initialClasses={classes || []} />
      </div>
    </div>
  );
}




