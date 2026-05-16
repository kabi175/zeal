import { getAuthUser } from "@/lib/actions/auth";
import { redirect } from "next/navigation";
import { CounsellingPage } from "@/components/counselling/counselling-page";

export default async function CounsellingRoute({
  searchParams,
}: {
  searchParams: Promise<{ expertId?: string }>;
}) {
  const user = await getAuthUser();
  if (!user) redirect("/login");
  const { expertId } = await searchParams;
  return <CounsellingPage user={user} preselectedExpertId={expertId} />;
}
