import { getExamAction } from '@/server/actions/get-exam';
import { getExamAnalyticsAction } from '@/server/actions/get-exam-analytics';
import { notFound, redirect } from 'next/navigation';
import { ExamDetailsClient } from '@/components/exams/exam-details-client';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ExamPage({ params }: PageProps) {
  const { id } = await params;
  
  // Fetch both exam info and analytics in parallel
  const [examResult, analyticsResult] = await Promise.all([
    getExamAction(id),
    getExamAnalyticsAction(id)
  ]);

  if (!examResult.success || !examResult.exam) {
    if (examResult.error === 'Unauthorized') {
      redirect('/login');
    }
    notFound();
  }

  if (!analyticsResult.success || !analyticsResult.analytics) {
     // If analytics fail, we might still want to show the page but with an error or empty analytics
     // But for now, let's just handle it as a serious error
     console.error('Failed to fetch analytics:', analyticsResult.error);
  }

  return (
    <ExamDetailsClient 
      exam={examResult.exam} 
      analytics={analyticsResult.analytics!} 
    />
  );
}
