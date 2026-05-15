import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/actions/auth";
import { AdminDashboard } from "@/components/admin/admin-dashboard";

export default async function AdminDashboardPage() {
  const user = await getAuthUser();
  if (!user || user.role !== "admin") redirect("/login");
  return <AdminDashboard />;
}
