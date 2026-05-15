import { createClient } from "@/lib/supabase/client";
import type { AdminStats } from "@/types/app";

export async function getAdminStats(): Promise<AdminStats> {
  const supabase = createClient();

  const [
    { count: totalStudents },
    { count: totalExperts },
    { count: totalAssessments },
    { data: assessments },
  ] = await Promise.all([
    supabase.from("user_roles").select("id", { count: "exact" }).eq("role", "student"),
    supabase.from("user_roles").select("id", { count: "exact" }).eq("role", "expert"),
    supabase.from("assessments").select("id", { count: "exact" }),
    supabase
      .from("assessments")
      .select("score, category, completed_at, profiles!student_id(department)")
      .order("completed_at", { ascending: false })
      .limit(500),
  ]);

  const allAssessments = assessments ?? [];

  const avgStressScore = allAssessments.length
    ? Math.round(
        allAssessments.reduce((sum, a) => sum + a.score, 0) / allAssessments.length
      )
    : 0;

  const categoryBreakdown = { low: 0, mild: 0, moderate: 0, high: 0, severe: 0 };
  allAssessments.forEach((a) => {
    if (a.category in categoryBreakdown) {
      categoryBreakdown[a.category as keyof typeof categoryBreakdown]++;
    }
  });

  // Weekly engagement — last 8 weeks
  const weeklyMap: Record<string, number> = {};
  allAssessments.forEach((a) => {
    const date = new Date(a.completed_at);
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay());
    const key = weekStart.toISOString().split("T")[0];
    weeklyMap[key] = (weeklyMap[key] ?? 0) + 1;
  });
  const weeklyEngagement = Object.entries(weeklyMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-8)
    .map(([week, count]) => ({ week: week.slice(5), count }));

  // Department heatmap
  const deptMap: Record<string, { sum: number; count: number }> = {};
  allAssessments.forEach((a) => {
    const dept = (a.profiles as any)?.department ?? "Unknown";
    if (!deptMap[dept]) deptMap[dept] = { sum: 0, count: 0 };
    deptMap[dept].sum += a.score;
    deptMap[dept].count++;
  });
  const departmentHeatmap = Object.entries(deptMap)
    .map(([department, { sum, count }]) => ({
      department,
      avgScore: Math.round(sum / count),
      count,
    }))
    .sort((a, b) => b.avgScore - a.avgScore)
    .slice(0, 10);

  return {
    totalStudents: totalStudents ?? 0,
    totalExperts: totalExperts ?? 0,
    totalAssessments: totalAssessments ?? 0,
    avgStressScore,
    categoryBreakdown,
    weeklyEngagement,
    departmentHeatmap,
  };
}

export async function getAllStudents() {
  const supabase = createClient();
  const { data } = await supabase
    .from("profiles")
    .select("*, user_roles!id(role)")
    .order("full_name");
  return data ?? [];
}

export async function getAllExperts() {
  const supabase = createClient();
  const { data } = await supabase
    .from("experts")
    .select("*, profiles!user_id(full_name, email, department)")
    .eq("is_active", true);
  return data ?? [];
}

export function exportStudentsCsv(students: Array<Record<string, unknown>>): void {
  if (students.length === 0) return;
  const headers = ["Name", "Email", "Department", "Year"];
  const rows = students.map((s) =>
    [s.full_name, s.email, s.department, s.year_of_study].map(String).join(",")
  );
  const csv = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `zeal2up-students-${new Date().toISOString().split("T")[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
