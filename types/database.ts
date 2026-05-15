export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type AppRole = "student" | "expert" | "admin";
export type GenderType = "male" | "female" | "other" | "prefer_not_to_say";
export type SessionStatus = "scheduled" | "in_progress" | "completed" | "cancelled";
export type StressCategory = "low" | "mild" | "moderate" | "high" | "severe";
export type MessageSender = "student" | "expert" | "ai";

export interface Database {
  public: {
    Tables: {
      colleges: {
        Row: {
          id: string;
          name: string;
          address: string | null;
          city: string | null;
          state: string | null;
          country: string;
          logo_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["colleges"]["Row"], "id" | "created_at" | "updated_at"> & {
          id?: string;
        };
        Update: Partial<Database["public"]["Tables"]["colleges"]["Insert"]>;
      };
      profiles: {
        Row: {
          id: string;
          full_name: string;
          email: string;
          phone: string | null;
          gender: GenderType | null;
          college_id: string | null;
          department: string | null;
          year_of_study: number | null;
          avatar_url: string | null;
          bio: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["profiles"]["Row"], "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
      };
      user_roles: {
        Row: {
          id: string;
          user_id: string;
          role: AppRole;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["user_roles"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["user_roles"]["Insert"]>;
      };
      experts: {
        Row: {
          id: string;
          user_id: string;
          college_id: string | null;
          specialization: string[] | null;
          qualifications: string | null;
          years_experience: number;
          available_slots: Json;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["experts"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["experts"]["Insert"]>;
      };
      assessments: {
        Row: {
          id: string;
          student_id: string;
          expert_id: string | null;
          score: number;
          category: StressCategory;
          communication_score: number | null;
          teamwork_score: number | null;
          completed_at: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["assessments"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["assessments"]["Insert"]>;
      };
      assessment_answers: {
        Row: {
          id: string;
          assessment_id: string;
          question_id: number;
          answer_value: number;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["assessment_answers"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["assessment_answers"]["Insert"]>;
      };
      sessions: {
        Row: {
          id: string;
          student_id: string;
          expert_id: string;
          title: string | null;
          scheduled_at: string;
          duration_minutes: number;
          status: SessionStatus;
          meeting_url: string | null;
          notes_summary: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["sessions"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["sessions"]["Insert"]>;
      };
      messages: {
        Row: {
          id: string;
          session_id: string | null;
          sender_id: string | null;
          sender_type: MessageSender;
          content: string;
          is_read: boolean;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["messages"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["messages"]["Insert"]>;
      };
      notes: {
        Row: {
          id: string;
          expert_id: string;
          student_id: string;
          session_id: string | null;
          content: string;
          is_private: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["notes"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["notes"]["Insert"]>;
      };
    };
    Functions: {
      has_role: {
        Args: { user_uuid: string; check_role: AppRole };
        Returns: boolean;
      };
      get_my_college_id: {
        Args: Record<string, never>;
        Returns: string | null;
      };
    };
    Enums: {
      app_role: AppRole;
      gender_type: GenderType;
      session_status: SessionStatus;
      stress_category: StressCategory;
      message_sender: MessageSender;
    };
  };
}
