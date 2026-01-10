import { Database } from './database';

export type Question = Database['public']['Tables']['questions']['Row'];

export interface QuestionContent {
  stem?: string;
  support_texts?: string[];
  genre?: string;
  column_b?: string[];
  [key: string]: unknown;
}

export interface GeneratedQuestion {
  stem: string;
  type: 'multiple_choice' | 'true_false' | 'sum' | 'association' | 'open_ended' | 'essay';
  support_texts?: string[] | null;
  options?: string[] | null;
  correct_answer: string;
  explanation?: string;
  correction_criteria?: string[] | null;
  bncc?: string;
  discipline?: string;
  subject?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  style?: string;
  content?: QuestionContent | string;
  source_tag?: string;
}
