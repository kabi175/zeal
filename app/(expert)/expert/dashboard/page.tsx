import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/actions/auth";
import { ExpertDashboard } from "@/components/expert/expert-dashboard";

export default async function ExpertDashboardPage() {
  const user = await getAuthUser();
  if (!user) redirect("/login");
  return <ExpertDashboard user={user} />;
}
