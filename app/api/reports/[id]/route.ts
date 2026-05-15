import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Assessment } from "@/types/app";

interface AssessmentWithAnswers extends Assessment {
  assessment_answers: Array<{ question_id: number; answer_value: number }>;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: assessment, error } = (await supabase
    .from("assessments")
    .select("*, assessment_answers(*)")
    .eq("id", id)
    .single()) as any as { data: AssessmentWithAnswers | null; error: unknown };

  if (error || !assessment) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const isOwner = assessment.student_id === user.id;

  if (!isOwner) {
    const roleResult = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();
    const role = (roleResult.data as { role: string } | null)?.role;

    if (role === "expert") {
      const sessionResult = await supabase
        .from("sessions")
        .select("id")
        .eq("expert_id", user.id)
        .eq("student_id", assessment.student_id)
        .limit(1)
        .single();

      if (sessionResult.error || !sessionResult.data) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    } else if (role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  return NextResponse.json(assessment);
}
