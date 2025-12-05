import { getExamAction } from '@/server/actions/get-exam';
import { notFound, redirect } from 'next/navigation';
import { ExamViewer } from '@/components/exams/exam-viewer';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ExamPage({ params }: PageProps) {
  const { id } = await params;
  const { exam, success, error } = await getExamAction(id);

  if (!success || !exam) {
    if (error === 'Unauthorized') {
      redirect('/login');
    }
    notFound();
  }

  return (
    <div className="min-h-screen bg-background print:bg-white">
      <ExamViewer examId={exam.id} blocks={exam.questions_list} title={exam.title} />
    </div>
  );
}
