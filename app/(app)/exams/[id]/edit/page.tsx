import { ExamEditor } from '@/components/builder/ExamEditor';
import { ExamBlock } from '@/components/builder/exam-block';
import { getClassesAction } from '@/server/actions/classes';
import { getExamAction } from '@/server/actions/get-exam';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditExamPage({ params }: PageProps) {
  const { id } = await params;
  const { exam, success, error } = await getExamAction(id);
  const classes = await getClassesAction();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!success || !exam || !user) {
    // If unauthorized or not found
    if (error === 'Unauthorized' || !user) {
      redirect('/login');
    }
    notFound();
  }

  const userProfile = {
    name: user.user_metadata?.full_name || '',
    school_name: user.user_metadata?.school_name || '',
    disciplines: user.user_metadata?.disciplines || [],
  };

  return (
    <div className="h-full">
      <ExamEditor
        examId={exam.id}
        initialTitle={exam.title}
        initialBlocks={exam.questions_list as unknown as ExamBlock[]}
        classes={classes}
        initialClassIds={exam.class_ids}
        userProfile={userProfile}
      />
    </div>
  );
}
