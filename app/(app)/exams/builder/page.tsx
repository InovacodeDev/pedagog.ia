import { ExamEditor } from '@/components/builder/ExamEditor';
import { getClassesAction } from '@/server/actions/classes';

export default async function ExamBuilderPage() {
  const classes = await getClassesAction();

  return (
    <div className="h-full">
      <ExamEditor classes={classes} />
    </div>
  );
}
