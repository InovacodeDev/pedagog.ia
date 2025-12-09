import { createServerClient } from '@supabase/ssr';
import { unstable_cache } from 'next/cache';
import type { Database } from '@/types/database';

export type LandingStats = {
  showTeacherCount: boolean;
  teacherCountFormatted: string | null;
  showExamCount: boolean;
  examCountFormatted: string | null;
  showQuestionCount: boolean;
  questionCountFormatted: string | null;
};

const THRESHOLD_TEACHERS = 100;
const THRESHOLD_EXAMS = 500;
const THRESHOLD_QUESTIONS = 5000;

async function getStats() {
  // Create a client without cookie handling for static/global data fetching
  // This uses the ANON key, so it relies on RLS policies allowing public read of counts
  // or specific tables being public.
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return [];
        },
        setAll() {},
      },
    }
  );

  try {
    const [{ count: teacherCount }, { count: examCount }, { count: questionCount }] =
      await Promise.all([
        // Try to count profiles. If RLS blocks, this might return 0 or error.
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('exams').select('*', { count: 'exact', head: true }),
        supabase.from('questions').select('*', { count: 'exact', head: true }),
      ]);

    return {
      teacherCount: teacherCount || 0,
      examCount: examCount || 0,
      questionCount: questionCount || 0,
    };
  } catch (error) {
    console.error('Failed to fetch landing stats:', error);
    return { teacherCount: 0, examCount: 0, questionCount: 0 };
  }
}

export const getLandingStats = unstable_cache(
  async (): Promise<LandingStats> => {
    const stats = await getStats();

    const format = (n: number) => {
      if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M+`;
      if (n >= 1000) return `${(n / 1000).toFixed(1)}k+`;
      return `${n}+`;
    };

    return {
      showTeacherCount: stats.teacherCount > THRESHOLD_TEACHERS,
      teacherCountFormatted: format(stats.teacherCount),
      showExamCount: stats.examCount > THRESHOLD_EXAMS,
      examCountFormatted: format(stats.examCount),
      showQuestionCount: stats.questionCount > THRESHOLD_QUESTIONS,
      questionCountFormatted: format(stats.questionCount),
    };
  },
  ['landing-stats'],
  { revalidate: 3600 } // Cache for 1 hour
);
