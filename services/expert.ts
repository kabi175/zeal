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

  const sessionRows = sessions as Array<{ student_id: string }>;
  const studentIds = [...new Set(sessionRows.map((s) => s.student_id))];

  const results: StudentWithStats[] = [];

  type ProfileRow = { id: string; full_name: string; email: string; department: string | null; year_of_study: number | null };
  type AssessmentRow = { score: number; category: string };

  for (const studentId of studentIds) {
    const profileResult = await supabase
      .from("profiles")
      .select("id, full_name, email, department, year_of_study")
      .eq("id", studentId)
      .single();
    const profile = profileResult.data as ProfileRow | null;

    const assessmentResult = await supabase
      .from("assessments")
      .select("score, category")
      .eq("student_id", studentId)
      .order("completed_at", { ascending: false })
      .limit(1)
      .single();
    const latestAssessment = assessmentResult.data as AssessmentRow | null;

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

export async function getStudentAssessmentHistory(studentId: string): Promise<Array<{ score: number; category: string; completed_at: string }>> {
  const supabase = createClient();
  const { data } = await supabase
    .from("assessments")
    .select("score, category, completed_at")
    .eq("student_id", studentId)
    .order("completed_at", { ascending: true })
    .limit(10);
  return (data as Array<{ score: number; category: string; completed_at: string }>) ?? [];
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
