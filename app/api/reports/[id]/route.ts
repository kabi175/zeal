import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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

  const { data: assessment, error } = await supabase
    .from("assessments")
    .select("*, assessment_answers(*)")
    .eq("id", id)
    .single();

  if (error || !assessment) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Check access: student owns it, or expert has session with student, or admin
  const isOwner = assessment.student_id === user.id;

  if (!isOwner) {
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    const role = roleData?.role;

    if (role === "expert") {
      const { data: session } = await supabase
        .from("sessions")
        .select("id")
        .eq("expert_id", user.id)
        .eq("student_id", assessment.student_id)
        .limit(1)
        .single();

      if (!session) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    } else if (role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  return NextResponse.json(assessment);
}
