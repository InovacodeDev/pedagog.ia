export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '13.0.5';
  };
  public: {
    Tables: {
      background_jobs: {
        Row: {
          created_at: string | null;
          error_message: string | null;
          id: string;
          job_type: string;
          payload: Json;
          result: Json | null;
          status: string | null;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          error_message?: string | null;
          id?: string;
          job_type: string;
          payload: Json;
          result?: Json | null;
          status?: string | null;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          error_message?: string | null;
          id?: string;
          job_type?: string;
          payload?: Json;
          result?: Json | null;
          status?: string | null;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      exam_grades: {
        Row: {
          answers: Json;
          created_at: string | null;
          exam_id: string | null;
          final_score: number;
          id: string;
          job_id: string;
          student_id: string | null;
          verified_at: string | null;
        };
        Insert: {
          answers: Json;
          created_at?: string | null;
          exam_id?: string | null;
          final_score: number;
          id?: string;
          job_id: string;
          student_id?: string | null;
          verified_at?: string | null;
        };
        Update: {
          answers?: Json;
          created_at?: string | null;
          exam_id?: string | null;
          final_score?: number;
          id?: string;
          job_id?: string;
          student_id?: string | null;
          verified_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'exam_grades_job_id_fkey';
            columns: ['job_id'];
            isOneToOne: false;
            referencedRelation: 'background_jobs';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'exam_grades_student_id_fkey';
            columns: ['student_id'];
            isOneToOne: false;
            referencedRelation: 'students';
            referencedColumns: ['id'];
          },
        ];
      };
      exams: {
        Row: {
          answer_key: Json;
          correction_count: number | null;
          created_at: string | null;
          description: string | null;
          discipline: string | null;
          grade_level: string | null;
          id: string;
          questions_list: Json;
          status: Database['public']['Enums']['exam_status'] | null;
          title: string;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          answer_key?: Json;
          correction_count?: number | null;
          created_at?: string | null;
          description?: string | null;
          discipline?: string | null;
          grade_level?: string | null;
          id?: string;
          questions_list?: Json;
          status?: Database['public']['Enums']['exam_status'] | null;
          title: string;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          answer_key?: Json;
          correction_count?: number | null;
          created_at?: string | null;
          description?: string | null;
          discipline?: string | null;
          grade_level?: string | null;
          id?: string;
          questions_list?: Json;
          status?: Database['public']['Enums']['exam_status'] | null;
          title?: string;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          full_name: string | null;
          id: string;
          institution_id: string | null;
          updated_at: string | null;
          username: string | null;
          website: string | null;
        };
        Insert: {
          avatar_url?: string | null;
          full_name?: string | null;
          id: string;
          institution_id?: string | null;
          updated_at?: string | null;
          username?: string | null;
          website?: string | null;
        };
        Update: {
          avatar_url?: string | null;
          full_name?: string | null;
          id?: string;
          institution_id?: string | null;
          updated_at?: string | null;
          username?: string | null;
          website?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'profiles_id_fkey';
            columns: ['id'];
            isOneToOne: true;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      questions: {
        Row: {
          bncc: string | null;
          bncc_code: string | null;
          content: Json;
          correct_answer: string;
          created_at: string | null;
          difficulty: Database['public']['Enums']['difficulty_level'];
          discipline: string | null;
          explanation: string | null;
          id: string;
          options: Json | null;
          structured_data: Json | null;
          style: string | null;
          subject: string | null;
          topic: string;
          type: string | null;
          updated_at: string | null;
          usage_count: number | null;
          user_id: string;
        };
        Insert: {
          bncc?: string | null;
          bncc_code?: string | null;
          content: Json;
          correct_answer: string;
          created_at?: string | null;
          difficulty: Database['public']['Enums']['difficulty_level'];
          discipline?: string | null;
          explanation?: string | null;
          id?: string;
          options?: Json | null;
          structured_data?: Json | null;
          style?: string | null;
          subject?: string | null;
          topic: string;
          type?: string | null;
          updated_at?: string | null;
          usage_count?: number | null;
          user_id: string;
        };
        Update: {
          bncc?: string | null;
          bncc_code?: string | null;
          content?: Json;
          correct_answer?: string;
          created_at?: string | null;
          difficulty?: Database['public']['Enums']['difficulty_level'];
          discipline?: string | null;
          explanation?: string | null;
          id?: string;
          options?: Json | null;
          structured_data?: Json | null;
          style?: string | null;
          subject?: string | null;
          topic?: string;
          type?: string | null;
          updated_at?: string | null;
          usage_count?: number | null;
          user_id?: string;
        };
        Relationships: [];
      };
      students: {
        Row: {
          created_at: string | null;
          encrypted_name: string;
          grade_level: string;
          id: string;
          institution_id: string;
        };
        Insert: {
          created_at?: string | null;
          encrypted_name: string;
          grade_level: string;
          id?: string;
          institution_id: string;
        };
        Update: {
          created_at?: string | null;
          encrypted_name?: string;
          grade_level?: string;
          id?: string;
          institution_id?: string;
        };
        Relationships: [];
      };
      subscriptions: {
        Row: {
          created_at: string | null;
          status: string | null;
          stripe_current_period_end: string | null;
          stripe_customer_id: string | null;
          stripe_price_id: string | null;
          stripe_subscription_id: string | null;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          status?: string | null;
          stripe_current_period_end?: string | null;
          stripe_customer_id?: string | null;
          stripe_price_id?: string | null;
          stripe_subscription_id?: string | null;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          status?: string | null;
          stripe_current_period_end?: string | null;
          stripe_customer_id?: string | null;
          stripe_price_id?: string | null;
          stripe_subscription_id?: string | null;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      difficulty_level: 'easy' | 'medium' | 'hard';
      exam_status: 'draft' | 'published';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      difficulty_level: ['easy', 'medium', 'hard'],
      exam_status: ['draft', 'published'],
    },
  },
} as const;
