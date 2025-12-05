import { ExamEditor } from '@/components/builder/ExamEditor';
import { getClassesAction } from '@/server/actions/classes';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function ExamBuilderPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const classes = await getClassesAction();

  const userProfile = {
    name: user.user_metadata?.full_name || '',
    school_name: user.user_metadata?.school_name || '',
    disciplines: user.user_metadata?.disciplines || [],
  };

  return (
    <div className="h-full">
      <ExamEditor classes={classes} userProfile={userProfile} />
    </div>
  );
}
