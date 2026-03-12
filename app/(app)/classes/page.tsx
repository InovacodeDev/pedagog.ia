

import { ClassesList } from './classes-list';
import { getClassesWithGradesAction } from '@/server/actions/classes';
import { getSchoolPeriodAction } from '@/server/actions/settings';

export const metadata = {
  title: 'Minhas Turmas | Pedagog.IA',
  description: 'Gerencie suas turmas e alunos.',
};

export default async function ClassesPage() {
  const schoolPeriod = await getSchoolPeriodAction();
  // Map school_period type to a default term if necessary
  const currentTerm = schoolPeriod === 'bimestre' ? '1_bimestre' : 
                     schoolPeriod === 'trimestre' ? '1_trimestre' : 
                     schoolPeriod === 'semestre' ? '1_semestre' : '1_bimestre';
                     
  const classes = await getClassesWithGradesAction(currentTerm);

  return (
    <div className="container py-8">
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-display font-bold">Turmas</h1>
          <p className="text-muted-foreground">
            Gerencie seus alunos, provas e acompanhe o desempenho através de analytics.
          </p>
        </div>

        <ClassesList initialClasses={classes || []} currentTerm={currentTerm} schoolPeriod={schoolPeriod} />
      </div>
    </div>
  );
}



