import { getAuthUser } from "@/lib/actions/auth";
import { redirect } from "next/navigation";
import { CounsellingPage } from "@/components/counselling/counselling-page";

export default async function CounsellingRoute() {
  const user = await getAuthUser();
  if (!user) redirect("/login");
  return <CounsellingPage user={user} />;
}
