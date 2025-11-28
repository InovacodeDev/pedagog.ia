import { getClassesAction } from '@/server/actions/classes';
import { ClassesList } from './classes-list';

export const metadata = {
  title: 'Minhas Turmas | Pedagogi.ai',
  description: 'Gerencie suas turmas e alunos.',
};

export default async function ClassesPage() {
  const classes = await getClassesAction();

  return (
    <div className="container py-8">
      <ClassesList initialClasses={classes} />
    </div>
  );
}
