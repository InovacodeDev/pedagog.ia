'use server';

import { createClient } from '@/lib/supabase/server';

interface QuestionSankey {
  questionNumber: number;
  correctCount: number;
  incorrectCount: number;
  totalCount: number;
  successRate: number;
  mostCommonError?: string;
}

interface StudentGrade {
  id: string;
  name: string;
  score: number;
  date: string;
}

export interface ExamAnalytics {
  examId: string;
  title: string;
  totalStudents: number;
  averageScore: number;
  students: StudentGrade[];
  questions: QuestionSankey[];
  isGradedOnPlatform: boolean;
}

/**
 * Fetches analytics for a specific exam.
 * Combines data from exam_results (general) and exam_grades (detailed per question).
 */
export async function getExamAnalyticsAction(examId: string): Promise<{
  success: boolean;
  analytics?: ExamAnalytics;
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    // 1. Fetch Exam details
    const { data: exam, error: examError } = await supabase
      .from('exams')
      .select('id, title, answer_key')
      .eq('id', examId)
      .single();

    if (examError || !exam) {
      return { success: false, error: 'Exam not found' };
    }

    // 2. Fetch Results (Grades)
    const { data: results, error: resultsError } = await supabase
      .from('exam_results')
      .select(`
        score,
        created_at,
        student_id,
        students!inner (
          id,
          name
        )
      `)
      .eq('exam_id', examId);

    if (resultsError) {
      return { success: false, error: resultsError.message };
    }

    // 3. Fetch Detailed Grades (for Question Analytics)
    const { data: detailedGrades } = await supabase
      .from('exam_grades')
      .select('answers, final_score')
      .eq('exam_id', examId);

    const isGradedOnPlatform: boolean = (detailedGrades?.length ?? 0) > 0;

    // 4. Process Analytics
    const students: StudentGrade[] = (results || []).map((r: {
        score: number | null;
        created_at: string;
        students: { id: string; name: string | null };
    }) => ({
      id: r.students.id,
      name: r.students.name || 'Estudante sem nome',
      score: r.score || 0,
      date: r.created_at,
    }));

    const totalStudents: number = students.length;
    const averageScore: number = totalStudents > 0 
      ? students.reduce((acc, curr) => acc + curr.score, 0) / totalStudents 
      : 0;

    let questions: QuestionSankey[] = [];

    if (isGradedOnPlatform && detailedGrades) {
      // Logic to aggregate per-question stats
      // answers structure in exam_grades: Array<{ question: number, score: number, correct: boolean, input?: string }>
      const questionStats: Record<number, { correct: number, incorrect: number, errors: Record<string, number> }> = {};

      detailedGrades.forEach((grade) => {
        const answers = grade.answers as Array<{ question: number; score: number; correct: boolean; input?: string }> | null;
        if (Array.isArray(answers)) {
          answers.forEach((ans) => {
            if (!questionStats[ans.question]) {
              questionStats[ans.question] = { correct: 0, incorrect: 0, errors: {} };
            }
            if (ans.correct) {
              questionStats[ans.question].correct++;
            } else {
              questionStats[ans.question].incorrect++;
              // Track most common incorrect answers if available
              if (ans.input) {
                questionStats[ans.question].errors[ans.input] = (questionStats[ans.question].errors[ans.input] || 0) + 1;
              }
            }
          });
        }
      });

      questions = Object.entries(questionStats).map(([qNum, stats]) => {
        const total = stats.correct + stats.incorrect;
        
        // Find most common error
        let mostCommonError: string | undefined;
        let maxErrorCount = 0;
        Object.entries(stats.errors).forEach(([err, count]) => {
          if (count > maxErrorCount) {
            maxErrorCount = count;
            mostCommonError = err;
          }
        });

        return {
          questionNumber: parseInt(qNum),
          correctCount: stats.correct,
          incorrectCount: stats.incorrect,
          totalCount: total,
          successRate: total > 0 ? (stats.correct / total) * 100 : 0,
          mostCommonError,
        };
      });

      // Sort questions by number
      questions.sort((a, b) => a.questionNumber - b.questionNumber);
    }

    const analytics: ExamAnalytics = {
      examId: exam.id,
      title: exam.title,
      totalStudents,
      averageScore,
      students,
      questions,
      isGradedOnPlatform,
    };

    return { success: true, analytics };
  } catch (error) {
    console.error('[Get Exam Analytics] Error:', error);
    return { success: false, error: 'Unexpected error' };
  }
}
