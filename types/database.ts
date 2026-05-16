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
export type QuestionDifficulty = "easy" | "medium" | "hard";
export type LessonContentType = "video" | "text" | "quiz";
export type EnrollmentStatus = "active" | "completed" | "dropped";

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
          hourly_rate: number;
          subjects: string[];
          languages: string[];
          profile_headline: string | null;
          rating: number;
          total_reviews: number;
          availability_json: Json;
          profile_photo_url: string | null;
          is_public: boolean;
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
          hourly_rate?: number;
          subjects?: string[];
          languages?: string[];
          profile_headline?: string | null;
          rating?: number;
          total_reviews?: number;
          availability_json?: Json;
          profile_photo_url?: string | null;
          is_public?: boolean;
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
          hourly_rate?: number;
          subjects?: string[];
          languages?: string[];
          profile_headline?: string | null;
          rating?: number;
          total_reviews?: number;
          availability_json?: Json;
          profile_photo_url?: string | null;
          is_public?: boolean;
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
      courses: {
        Row: {
          id: string;
          expert_id: string;
          title: string;
          description: string | null;
          subject: string | null;
          thumbnail_url: string | null;
          price: number;
          is_published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          expert_id: string;
          title: string;
          description?: string | null;
          subject?: string | null;
          thumbnail_url?: string | null;
          price?: number;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          expert_id?: string;
          title?: string;
          description?: string | null;
          subject?: string | null;
          thumbnail_url?: string | null;
          price?: number;
          is_published?: boolean;
          updated_at?: string;
        };
      };
      modules: {
        Row: {
          id: string;
          course_id: string;
          title: string;
          order_index: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          course_id: string;
          title: string;
          order_index?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          course_id?: string;
          title?: string;
          order_index?: number;
        };
      };
      lessons: {
        Row: {
          id: string;
          module_id: string;
          title: string;
          content_type: LessonContentType;
          content_url: string | null;
          content_body: string | null;
          order_index: number;
          duration_secs: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          module_id: string;
          title: string;
          content_type?: LessonContentType;
          content_url?: string | null;
          content_body?: string | null;
          order_index?: number;
          duration_secs?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          module_id?: string;
          title?: string;
          content_type?: LessonContentType;
          content_url?: string | null;
          content_body?: string | null;
          order_index?: number;
          duration_secs?: number;
        };
      };
      questions: {
        Row: {
          id: string;
          expert_id: string;
          course_id: string | null;
          topic_tag: string | null;
          difficulty: QuestionDifficulty;
          question_text: string;
          option_a: string;
          option_b: string;
          option_c: string;
          option_d: string;
          correct_option: string;
          explanation: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          expert_id: string;
          course_id?: string | null;
          topic_tag?: string | null;
          difficulty?: QuestionDifficulty;
          question_text: string;
          option_a: string;
          option_b: string;
          option_c: string;
          option_d: string;
          correct_option: string;
          explanation?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          expert_id?: string;
          course_id?: string | null;
          topic_tag?: string | null;
          difficulty?: QuestionDifficulty;
          question_text?: string;
          option_a?: string;
          option_b?: string;
          option_c?: string;
          option_d?: string;
          correct_option?: string;
          explanation?: string | null;
          updated_at?: string;
        };
      };
      lesson_questions: {
        Row: {
          lesson_id: string;
          question_id: string;
          order_index: number;
        };
        Insert: {
          lesson_id: string;
          question_id: string;
          order_index?: number;
        };
        Update: {
          lesson_id?: string;
          question_id?: string;
          order_index?: number;
        };
      };
      enrollments: {
        Row: {
          id: string;
          student_id: string;
          course_id: string;
          status: EnrollmentStatus;
          enrolled_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          student_id: string;
          course_id: string;
          status?: EnrollmentStatus;
          enrolled_at?: string;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          student_id?: string;
          course_id?: string;
          status?: EnrollmentStatus;
          enrolled_at?: string;
          completed_at?: string | null;
        };
      };
      lesson_progress: {
        Row: {
          id: string;
          student_id: string;
          lesson_id: string;
          completed_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          lesson_id: string;
          completed_at?: string;
        };
        Update: {
          id?: string;
          student_id?: string;
          lesson_id?: string;
          completed_at?: string;
        };
      };
      certificates: {
        Row: {
          id: string;
          cert_code: string;
          student_id: string;
          course_id: string;
          expert_id: string;
          issued_at: string;
        };
        Insert: {
          id?: string;
          cert_code?: string;
          student_id: string;
          course_id: string;
          expert_id: string;
          issued_at?: string;
        };
        Update: {
          id?: string;
          cert_code?: string;
          student_id?: string;
          course_id?: string;
          expert_id?: string;
          issued_at?: string;
        };
      };
      tutor_reviews: {
        Row: {
          id: string;
          expert_id: string;
          student_id: string;
          rating: number;
          comment: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          expert_id: string;
          student_id: string;
          rating: number;
          comment?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          expert_id?: string;
          student_id?: string;
          rating?: number;
          comment?: string | null;
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
      question_difficulty: QuestionDifficulty;
      lesson_content_type: LessonContentType;
      enrollment_status: EnrollmentStatus;
    };
  };
}
