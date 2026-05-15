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
        Insert: {
          id?: string;
          name: string;
          address?: string | null;
          city?: string | null;
          state?: string | null;
          country?: string;
          logo_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          address?: string | null;
          city?: string | null;
          state?: string | null;
          country?: string;
          logo_url?: string | null;
          updated_at?: string;
        };
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
        Insert: {
          id: string;
          full_name: string;
          email: string;
          phone?: string | null;
          gender?: GenderType | null;
          college_id?: string | null;
          department?: string | null;
          year_of_study?: number | null;
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          email?: string;
          phone?: string | null;
          gender?: GenderType | null;
          college_id?: string | null;
          department?: string | null;
          year_of_study?: number | null;
          avatar_url?: string | null;
          bio?: string | null;
          updated_at?: string;
        };
      };
      user_roles: {
        Row: {
          id: string;
          user_id: string;
          role: AppRole;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          role: AppRole;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          role?: AppRole;
        };
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
        Insert: {
          id?: string;
          user_id: string;
          college_id?: string | null;
          specialization?: string[] | null;
          qualifications?: string | null;
          years_experience?: number;
          available_slots?: Json;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          college_id?: string | null;
          specialization?: string[] | null;
          qualifications?: string | null;
          years_experience?: number;
          available_slots?: Json;
          is_active?: boolean;
          updated_at?: string;
        };
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
        Insert: {
          id?: string;
          student_id: string;
          expert_id?: string | null;
          score: number;
          category: StressCategory;
          communication_score?: number | null;
          teamwork_score?: number | null;
          completed_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          student_id?: string;
          expert_id?: string | null;
          score?: number;
          category?: StressCategory;
          communication_score?: number | null;
          teamwork_score?: number | null;
          completed_at?: string;
        };
      };
      assessment_answers: {
        Row: {
          id: string;
          assessment_id: string;
          question_id: number;
          answer_value: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          assessment_id: string;
          question_id: number;
          answer_value: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          assessment_id?: string;
          question_id?: number;
          answer_value?: number;
        };
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
        Insert: {
          id?: string;
          student_id: string;
          expert_id: string;
          title?: string | null;
          scheduled_at: string;
          duration_minutes?: number;
          status?: SessionStatus;
          meeting_url?: string | null;
          notes_summary?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          student_id?: string;
          expert_id?: string;
          title?: string | null;
          scheduled_at?: string;
          duration_minutes?: number;
          status?: SessionStatus;
          meeting_url?: string | null;
          notes_summary?: string | null;
          updated_at?: string;
        };
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
        Insert: {
          id?: string;
          session_id?: string | null;
          sender_id?: string | null;
          sender_type: MessageSender;
          content: string;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string | null;
          sender_id?: string | null;
          sender_type?: MessageSender;
          content?: string;
          is_read?: boolean;
        };
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
        Insert: {
          id?: string;
          expert_id: string;
          student_id: string;
          session_id?: string | null;
          content: string;
          is_private?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          expert_id?: string;
          student_id?: string;
          session_id?: string | null;
          content?: string;
          is_private?: boolean;
          updated_at?: string;
        };
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
