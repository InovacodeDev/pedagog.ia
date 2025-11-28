import { getStudentsAction } from '@/server/actions/students';
import { getClassesAction } from '@/server/actions/classes';
import { StudentsRealtimeTable } from '@/components/students/students-realtime-table';
import { NewStudentDialog } from '@/components/students/new-student-dialog';
import { ShieldCheck } from 'lucide-react';

export default async function StudentsPage() {
  const [{ students }, classes] = await Promise.all([getStudentsAction(), getClassesAction()]);

  return (
    <div className="container mx-auto p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold">Alunos</h1>
          <p className="text-muted-foreground flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-green-500" />
            Gerenciamento de alunos e turmas
          </p>
        </div>
        <NewStudentDialog />
      </div>

      <StudentsRealtimeTable
        initialStudents={(students ?? []).map((s) => ({
          id: s.id,
          name: s.name ?? 'Sem nome',
          grade_level: s.grade_level,
          created_at: s.created_at,
          class_id: s.class_id,
        }))}
        classes={classes}
      />
    </div>
  );
}
