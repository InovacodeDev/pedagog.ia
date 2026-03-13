// lib/analytics-events.ts

export type PlanType = 'free' | 'pro';

export interface UserProperties {
  plan_type?: PlanType;
  role?: string;
  classes_count?: number;
  exams_count?: number;
  scans_count?: number;
  credits_balance?: number;
}

export type AnalyticsEvents = {
  'User Signed Up': { Method: 'Google' | 'Email'; Origin?: string };
  'User Logged In': Record<string, never>;
  'Upgrade Modal Viewed': { Trigger_Source: string };
  'Checkout Started': { Plan_Name: string; Price: number };
  'Subscription Upgraded': { Plan_Name: string; MRR: number };
  'Class Created': { Subjects: string[] };
  'Student Added': { Method: 'Manual' | 'Batch' | 'Planilha' };
  'Questions Generation Started': {
    Subject: string;
    Quantity: number;
    Types: string[];
    With_Files: boolean;
    Use_Internet_Search: boolean;
  };
  'Questions Generation Success': {
    Subject: string;
    Quantity_Generated: number;
    With_Files: boolean;
    Use_Internet_Search: boolean;
  };
  'Questions Generation Failed': {
    Subject: string;
    Error_Reason: string;
  };
  'Exam Created': { Creation_Method: 'Manual' | 'IA'; Questions_Count: number };
  'Exam Exported': { Format: 'PDF' | 'Docx' };
  'Scan Validation Started': { Exam_ID: string; Sheets_Count: number };
  'Scan Completed': { Validation_Corrections_Made: number };
};

export type EventName = keyof AnalyticsEvents;
export type EventProperties<T extends EventName> = AnalyticsEvents[T];
