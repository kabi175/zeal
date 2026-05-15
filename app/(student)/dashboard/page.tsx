import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/actions/auth";
import { StudentDashboard } from "@/components/student/student-dashboard";

export default async function DashboardPage() {
  const user = await getAuthUser();
  if (!user || !user.profile) redirect("/login");

  return <StudentDashboard user={user} />;
}
