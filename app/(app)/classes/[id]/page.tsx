import { getClassAction, getExamsByClassAction } from '@/server/actions/classes';
import { getStudentsAction } from '@/server/actions/students';
import { ClassStudentList } from '@/components/students/class-student-list';
import { AddStudentDialog } from '@/components/students/add-student-dialog';
import Link from 'next/link';
import { ChevronRight, Users } from 'lucide-react';
import { DataUnavailable } from '@/components/ui/data-unavailable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ClassExamsList } from '@/components/classes/class-exams-list';
import { ClassGradesList } from '@/components/classes/class-grades-list';
import { ClassAnalytics } from '@/components/classes/class-analytics';
import { AttendanceForm } from '@/components/students/attendance-form';




interface ClassDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default async function ClassDetailsPage({ params }: ClassDetailsPageProps) {
  const { id } = await params;
  const classData = await getClassAction(id);
  const { students, success, error } = await getStudentsAction(id);
  const exams = await getExamsByClassAction(id);
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

  if (!classData) return null; // Should not happen due to check above
  const schoolPeriod = classData.period_type || 'bimestre';
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
      <Tabs defaultValue="analytics" className="w-full">
        <TabsList>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="students">Alunos</TabsTrigger>
          <TabsTrigger value="attendance">Presença</TabsTrigger>
          <TabsTrigger value="exams">Provas</TabsTrigger>
          <TabsTrigger value="grades">Notas</TabsTrigger>
        </TabsList>
        
        <TabsContent value="analytics" className="mt-6">
          <ClassAnalytics classData={classData} />
        </TabsContent>

        <TabsContent value="students" className="mt-6">
          {!success ? (
            <DataUnavailable message={error} />
          ) : (
            <ClassStudentList initialStudents={students || []} classId={classData.id} />
          )}
        </TabsContent>

        <TabsContent value="attendance" className="mt-6">
          <AttendanceForm classId={classData.id} students={students || []} lessonDays={classData.lesson_days} />
        </TabsContent>

        <TabsContent value="exams" className="mt-6">
          <ClassExamsList exams={exams} />
        </TabsContent>

        <TabsContent value="grades" className="mt-6">
          <ClassGradesList classId={classData.id} students={students || []} schoolPeriod={schoolPeriod} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
