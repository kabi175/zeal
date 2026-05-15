import { createClient } from "@/lib/supabase/client";
import type { Session } from "@/types/app";

export interface StudentWithStats {
  id: string;
  full_name: string;
  email: string;
  department: string | null;
  year_of_study: number | null;
  latest_score: number | null;
  latest_category: string | null;
  total_assessments: number;
}

export async function getAssignedStudents(expertUserId: string): Promise<StudentWithStats[]> {
  const supabase = createClient();

  const { data: sessions } = await supabase
    .from("sessions")
    .select("student_id")
    .eq("expert_id", expertUserId);

  if (!sessions || sessions.length === 0) return [];

  const studentIds = [...new Set(sessions.map((s) => s.student_id))];

  const results: StudentWithStats[] = [];

  for (const studentId of studentIds) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, full_name, email, department, year_of_study")
      .eq("id", studentId)
      .single();

    const { data: latestAssessment } = await supabase
      .from("assessments")
      .select("score, category")
      .eq("student_id", studentId)
      .order("completed_at", { ascending: false })
      .limit(1)
      .single();

    const { count } = await supabase
      .from("assessments")
      .select("id", { count: "exact" })
      .eq("student_id", studentId);

    if (profile) {
      results.push({
        id: profile.id,
        full_name: profile.full_name,
        email: profile.email,
        department: profile.department,
        year_of_study: profile.year_of_study,
        latest_score: latestAssessment?.score ?? null,
        latest_category: latestAssessment?.category ?? null,
        total_assessments: count ?? 0,
      });
    }
  }

  return results;
}

export async function getExpertSessions(expertUserId: string): Promise<Session[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("sessions")
    .select("*")
    .eq("expert_id", expertUserId)
    .order("scheduled_at", { ascending: false });
  return data ?? [];
}

export async function getStudentAssessmentHistory(studentId: string) {
  const supabase = createClient();
  const { data } = await supabase
    .from("assessments")
    .select("score, category, completed_at")
    .eq("student_id", studentId)
    .order("completed_at", { ascending: true })
    .limit(10);
  return data ?? [];
}

export async function saveNote(params: {
  expertId: string;
  studentId: string;
  sessionId?: string;
  content: string;
  isPrivate: boolean;
}) {
  const supabase = createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await supabase.from("notes").insert({
    expert_id: params.expertId,
    student_id: params.studentId,
    session_id: params.sessionId ?? null,
    content: params.content,
    is_private: params.isPrivate,
  } as any);
  if (error) throw error;
}
