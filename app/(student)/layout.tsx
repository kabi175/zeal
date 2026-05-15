import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/actions/auth";
import { DashboardLayout } from "@/components/layout/dashboard-layout";

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const user = await getAuthUser();
  if (!user) redirect("/login");
  if (user.role !== "student") redirect("/login");

  return (
    <DashboardLayout profile={user.profile} role={user.role}>
      {children}
    </DashboardLayout>
  );
}
