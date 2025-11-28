import { getClassAction } from '@/server/actions/classes';
import { getStudentsAction } from '@/server/actions/students';
import { ClassStudentList } from '@/components/students/class-student-list';
import { AddStudentDialog } from '@/components/students/add-student-dialog';
import Link from 'next/link';
import { ChevronRight, Users } from 'lucide-react';
import { DataUnavailable } from '@/components/ui/data-unavailable';

interface ClassDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default async function ClassDetailsPage({ params }: ClassDetailsPageProps) {
  const { id } = await params;
  const classData = await getClassAction(id);
  const { students, success, error } = await getStudentsAction(id);

  if (!classData) {
    return (
      <div className="container mx-auto p-8">
        <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
          <h1 className="text-2xl font-bold">Turma não encontrada</h1>
          <p className="text-muted-foreground">
            A turma que você está procurando não existe ou você não tem permissão para acessá-la.
          </p>
          <Link href="/classes" className="text-primary hover:underline">
            Voltar para Minhas Turmas
          </Link>
        </div>
      </div>
    );
  }

  const studentCount = students?.length || 0;

  return (
    <div className="container mx-auto p-8 space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/classes" className="hover:text-foreground transition-colors">
            Turmas
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground font-medium">{classData.name}</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold">{classData.name}</h1>
            <div className="flex items-center gap-2 text-muted-foreground mt-1">
              <Users className="h-4 w-4" />
              <span>
                {studentCount} {studentCount === 1 ? 'Aluno Cadastrado' : 'Alunos Cadastrados'}
              </span>
            </div>
          </div>
          <AddStudentDialog classId={classData.id} />
        </div>
      </div>

      {/* Content */}
      {!success ? (
        <DataUnavailable message={error} />
      ) : (
        <ClassStudentList initialStudents={students || []} classId={classData.id} />
      )}
    </div>
  );
}
