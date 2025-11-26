export interface GeneratedQuestion {
  stem: string;
  options?: string[];
  correct_answer?: string;
  type: string;
  bncc?: string;
  discipline?: string;
  subject?: string;
  difficulty?: string;
}
