import { getClassAction, getExamsByClassAction } from '@/server/actions/classes';
import { getStudentsAction } from '@/server/actions/students';
import { ClassStudentList } from '@/components/students/class-student-list';
import { AddStudentDialog } from '@/components/students/add-student-dialog';
import Link from 'next/link';
import { ChevronRight, Users, Lock } from 'lucide-react';
import { DataUnavailable } from '@/components/ui/data-unavailable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ClassExamsList } from '@/components/classes/class-exams-list';
import { ClassGradesList } from '@/components/classes/class-grades-list';
import { ClassAnalytics } from '@/components/classes/class-analytics';
import { AttendanceForm } from '@/components/students/attendance-form';
import { getSubscriptionPlan } from '@/lib/subscription';
import { Button } from '@/components/ui/button';
import { PricingDialog } from '@/components/subscription/pricing-dialog';

interface ClassDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default async function ClassDetailsPage({ params }: ClassDetailsPageProps) {
  const { id } = await params;
  const classData = await getClassAction(id);
  const { students, success, error } = await getStudentsAction(id);
  const exams = await getExamsByClassAction(id);
  const { isPro } = await getSubscriptionPlan();

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
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            Analytics {!isPro && <Lock className="h-3 w-3" />}
          </TabsTrigger>
          <TabsTrigger value="students">Alunos</TabsTrigger>
          <TabsTrigger value="attendance">Presença</TabsTrigger>
          <TabsTrigger value="exams">Provas</TabsTrigger>
          <TabsTrigger value="grades">Notas</TabsTrigger>
        </TabsList>
        
        <TabsContent value="analytics" className="mt-6">
          {isPro ? (
            <ClassAnalytics classData={classData} />
          ) : (
            <div className="flex flex-col items-center justify-center p-12 text-center border rounded-lg bg-muted/30 space-y-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                <Lock className="w-6 h-6 text-indigo-600" />
              </div>
              <div className="space-y-2 max-w-md">
                <h3 className="text-xl font-bold">Analytics de Turmas é um recurso Pro</h3>
                <p className="text-muted-foreground">
                  Acompanhe o desempenho detalhado de seus alunos, médias por disciplina e muito mais com o plano Pro.
                </p>
              </div>
              <PricingDialog 
                trigger={
                  <Button className="bg-indigo-600 hover:bg-indigo-700">
                    Fazer Upgrade Agora
                  </Button>
                }
              />
            </div>
          )}
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

