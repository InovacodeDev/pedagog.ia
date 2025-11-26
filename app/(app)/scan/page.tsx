import { getUserJobsAction } from '@/server/actions/exams';
import { ExamUpload } from '@/components/exams/exam-upload';
import { JobList } from '@/components/exams/job-list';

export default async function ExamsPage() {
  const { jobs } = await getUserJobsAction();

  return (
    <div className="container mx-auto p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold">Correção de Provas</h1>
        <p className="text-muted-foreground">
          Faça upload e acompanhe o processamento das suas provas
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[400px_1fr]">
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Novo Upload</h2>
          <ExamUpload />
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Histórico de Processamento</h2>
          <JobList initialJobs={jobs || []} />
        </div>
      </div>
    </div>
  );
}
