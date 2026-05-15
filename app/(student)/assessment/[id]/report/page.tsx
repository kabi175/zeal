import { redirect, notFound } from "next/navigation";
import { getAuthUser } from "@/lib/actions/auth";
import { createClient } from "@/lib/supabase/server";
import { AssessmentReport } from "@/components/assessment/assessment-report";

interface ReportPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ download?: string }>;
}

export default async function ReportPage({ params, searchParams }: ReportPageProps) {
  const [{ id }, { download }] = await Promise.all([params, searchParams]);

  const user = await getAuthUser();
  if (!user || !user.profile) redirect("/login");

  const supabase = await createClient();
  const { data: assessment, error } = await supabase
    .from("assessments")
    .select("*, assessment_answers(*)")
    .eq("id", id)
    .eq("student_id", user.id)
    .single();

  if (error || !assessment) notFound();

  return (
    <AssessmentReport
      assessment={assessment}
      profile={user.profile}
      autoDownload={download === "1"}
    />
  );
}
