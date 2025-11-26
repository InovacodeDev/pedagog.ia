import { Database } from './database';

export type BackgroundJobInsert = Database['public']['Tables']['background_jobs']['Insert'];
export type BackgroundJobRow = Database['public']['Tables']['background_jobs']['Row'];
export type ExamInsert = Database['public']['Tables']['exams']['Insert'];
export type ExamGradeInsert = Database['public']['Tables']['exam_grades']['Insert'];
export type ExamRow = Database['public']['Tables']['exams']['Row'];
export type StudentRow = Database['public']['Tables']['students']['Row'];
export type ProfileRow = Database['public']['Tables']['profiles']['Row'];

export interface CreateSecureStudentParams {
  name_text: string;
  grade: string;
}

export interface GetStudentsDecryptedParams {
  p_institution_id: string;
}

export interface DecryptedStudent {
  id: string;
  name: string;
  grade_level: string;
  created_at: string;
}

export interface SubscriptionDetails {
  status: string | null;
  stripe_customer_id: string | null;
}
