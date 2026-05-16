import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Certificate } from "@/types/app";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = (await createClient()) as any;

  const { data: cert, error } = await supabase
    .from("certificates")
    .select("*")
    .eq("cert_code", id.toUpperCase())
    .single();

  if (error || !cert) {
    return NextResponse.json({ valid: false }, { status: 404 });
  }

  const c = cert as Certificate;
  const [courseRes, tutorRes, studentRes] = await Promise.all([
    supabase.from("courses").select("title").eq("id", c.course_id).single(),
    supabase.from("profiles").select("full_name").eq("id", c.expert_id).single(),
    supabase.from("profiles").select("full_name").eq("id", c.student_id).single(),
  ]);

  return NextResponse.json({
    valid: true,
    cert_code: c.cert_code,
    student_name: (studentRes.data as { full_name: string } | null)?.full_name ?? "Student",
    course_title: (courseRes.data as { title: string } | null)?.title ?? "Course",
    tutor_name: (tutorRes.data as { full_name: string } | null)?.full_name ?? "Tutor",
    issued_at: c.issued_at,
  });
}
