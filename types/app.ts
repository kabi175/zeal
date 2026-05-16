import type { Database, MessageSender } from "./database";

export type { MessageSender };

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type College = Database["public"]["Tables"]["colleges"]["Row"];
export type Expert = Database["public"]["Tables"]["experts"]["Row"];
export type Assessment = Database["public"]["Tables"]["assessments"]["Row"];
export type AssessmentAnswer = Database["public"]["Tables"]["assessment_answers"]["Row"];
export type Session = Database["public"]["Tables"]["sessions"]["Row"];
export type Message = Database["public"]["Tables"]["messages"]["Row"];
export type Note = Database["public"]["Tables"]["notes"]["Row"];
export type UserRole = Database["public"]["Tables"]["user_roles"]["Row"];
export type Course = Database["public"]["Tables"]["courses"]["Row"];
export type Module = Database["public"]["Tables"]["modules"]["Row"];
export type Lesson = Database["public"]["Tables"]["lessons"]["Row"];
export type Question = Database["public"]["Tables"]["questions"]["Row"];
export type Enrollment = Database["public"]["Tables"]["enrollments"]["Row"];
export type LessonProgress = Database["public"]["Tables"]["lesson_progress"]["Row"];
export type Certificate = Database["public"]["Tables"]["certificates"]["Row"];
export type TutorReview = Database["public"]["Tables"]["tutor_reviews"]["Row"];

export type AppRole = Database["public"]["Enums"]["app_role"];
export type StressCategory = Database["public"]["Enums"]["stress_category"];
export type SessionStatus = Database["public"]["Enums"]["session_status"];
export type QuestionDifficulty = Database["public"]["Enums"]["question_difficulty"];
export type LessonContentType = Database["public"]["Enums"]["lesson_content_type"];
export type EnrollmentStatus = Database["public"]["Enums"]["enrollment_status"];

export interface TutorPublicProfile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  bio: string | null;
  profile_headline: string | null;
  profile_photo_url: string | null;
  subjects: string[];
  languages: string[];
  hourly_rate: number;
  rating: number;
  total_reviews: number;
  years_experience: number;
  qualifications: string | null;
  is_public: boolean;
}

export interface CourseWithModules extends Course {
  modules: Array<Module & { lessons: Lesson[] }>;
  tutor_name: string;
  tutor_photo: string | null;
}

export interface EnrollmentWithProgress extends Enrollment {
  completed_lessons: string[];
  total_lessons: number;
}

export interface AuthUser {
  id: string;
  email: string;
  profile: Profile | null;
  role: AppRole | null;
}

export interface AssessmentQuestion {
  id: number;
  text: string;
  reversed: boolean;
}

export interface AssessmentResult {
  score: number;
  category: StressCategory;
  interpretation: string;
  interventionStrategies: string[];
  copingGuidance: string;
  answers: Record<number, number>;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface WebRTCSignal {
  type: "offer" | "answer" | "ice-candidate";
  payload: RTCSessionDescriptionInit | RTCIceCandidateInit;
  from: string;
  to: string;
}

export interface DashboardStats {
  stressScore: number | null;
  communicationScore: number | null;
  teamworkScore: number | null;
  totalAssessments: number;
  upcomingSessions: number;
  lastAssessmentDate: string | null;
}

export interface AdminStats {
  totalStudents: number;
  totalExperts: number;
  totalAssessments: number;
  avgStressScore: number;
  categoryBreakdown: Record<StressCategory, number>;
  weeklyEngagement: Array<{ week: string; count: number }>;
  departmentHeatmap: Array<{ department: string; avgScore: number; count: number }>;
}
