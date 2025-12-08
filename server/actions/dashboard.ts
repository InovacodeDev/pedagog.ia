'use server';

import { createClient } from '@/lib/supabase/server';

export interface DashboardMetrics {
  examsCount: number;
  questionsCount: number;
  correctionsCount: number;
  timeSavedHours: number;
  recentExams: {
    id: string;
    title: string;
    status: string | null;
    created_at: string | null;
    correction_count: number | null;
  }[];
}

export async function getDashboardMetrics(): Promise<{
  success: boolean;
  data?: DashboardMetrics;
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { success: false, error: 'Unauthorized' };

    // Parallelize queries for performance
    const [examsResult, questionsResult, correctionsResult, recentExamsResult] = await Promise.all([
      // 1. Count Exams
      supabase.from('exams').select('*', { count: 'exact', head: true }).eq('user_id', user.id),

      // 2. Count Questions
      supabase.from('questions').select('*', { count: 'exact', head: true }).eq('user_id', user.id),

      // 3. Count Corrections
      supabase
        .from('background_jobs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('job_type', 'ocr_correction')
        .eq('status', 'completed'),

      // 4. Recent Exams
      supabase
        .from('exams')
        .select('id, title, status, created_at, correction_count')
        .eq('user_id', user.id)
        .neq('status', 'deleted' as unknown as 'draft')
        .order('created_at', { ascending: false })
        .limit(5),
    ]);

    const examsCount = examsResult.count || 0;
    const questionsCount = questionsResult.count || 0;
    const correctionsCount = correctionsResult.count || 0;

    // Calculate time saved: 5 minutes per correction / 60 minutes = hours
    const timeSavedHours = Math.round(((correctionsCount * 5) / 60) * 10) / 10;

    return {
      success: true,
      data: {
        examsCount,
        questionsCount,
        correctionsCount,
        timeSavedHours,
        recentExams: recentExamsResult.data || [],
      },
    };
  } catch (error) {
    console.error('[Dashboard Metrics] Error:', error);
    // Return graceful fallback
    return {
      success: false,
      data: {
        examsCount: 0,
        questionsCount: 0,
        correctionsCount: 0,
        timeSavedHours: 0,
        recentExams: [],
      },
    };
  }
}
