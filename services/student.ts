import { createClient } from "@/lib/supabase/client";
import type { Assessment, Session, DashboardStats } from "@/types/app";

export async function getStudentAssessments(userId: string): Promise<Assessment[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("assessments")
    .select("*")
    .eq("student_id", userId)
    .order("completed_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getStudentSessions(userId: string): Promise<Session[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("sessions")
    .select("*")
    .eq("student_id", userId)
    .gte("scheduled_at", new Date().toISOString())
    .order("scheduled_at", { ascending: true })
    .limit(5);
  if (error) throw error;
  return data ?? [];
}

export async function getDashboardStats(userId: string): Promise<DashboardStats> {
  const supabase = createClient();
  const { data: assessments } = await supabase
    .from("assessments")
    .select("score, category, communication_score, teamwork_score, completed_at")
    .eq("student_id", userId)
    .order("completed_at", { ascending: false })
    .limit(1);

  const { count: upcomingSessions } = await supabase
    .from("sessions")
    .select("id", { count: "exact" })
    .eq("student_id", userId)
    .gte("scheduled_at", new Date().toISOString())
    .eq("status", "scheduled");

  const { count: totalAssessments } = await supabase
    .from("assessments")
    .select("id", { count: "exact" })
    .eq("student_id", userId);

  const latest = assessments?.[0];
  return {
    stressScore: latest?.score ?? null,
    communicationScore: latest?.communication_score ?? null,
    teamworkScore: latest?.teamwork_score ?? null,
    totalAssessments: totalAssessments ?? 0,
    upcomingSessions: upcomingSessions ?? 0,
    lastAssessmentDate: latest?.completed_at ?? null,
  };
}

export async function saveAssessment(params: {
  studentId: string;
  score: number;
  category: string;
  answers: Record<number, number>;
}): Promise<string> {
  const supabase = createClient();

  const { data: assessment, error: assessError } = await supabase
    .from("assessments")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .insert({
      student_id: params.studentId,
      score: params.score,
      category: params.category as any,
      completed_at: new Date().toISOString(),
    } as any)
    .select("id")
    .single();

  if (assessError || !assessment) throw assessError ?? new Error("Insert failed");

  const answerRows = Object.entries(params.answers).map(([qId, val]) => ({
    assessment_id: assessment.id,
    question_id: parseInt(qId),
    answer_value: val,
  }));

  const { error: answerError } = await supabase
    .from("assessment_answers")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .insert(answerRows as any);

  if (answerError) throw answerError;
  return assessment.id;
}
