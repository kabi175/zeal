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

export type AppRole = Database["public"]["Enums"]["app_role"];
export type StressCategory = Database["public"]["Enums"]["stress_category"];
export type SessionStatus = Database["public"]["Enums"]["session_status"];

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
