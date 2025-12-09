'use server'

import { createClient } from "@/lib/supabase/server"

export type LandingStats = {
  exams: number
  questions: number
  corrections: number
}

export async function getLandingStats(): Promise<LandingStats> {
  const supabase = await createClient()

  const [exams, questions, corrections] = await Promise.all([
    supabase.from('exams').select('id', { count: 'exact', head: true }),
    supabase.from('questions').select('id', { count: 'exact', head: true }),
    supabase.from('exam_results').select('id', { count: 'exact', head: true }),
  ])

  return {
    exams: exams.count || 0,
    questions: questions.count || 0,
    corrections: corrections.count || 0,
  }
}
