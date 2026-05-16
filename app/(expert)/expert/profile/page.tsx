import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/actions/auth";
import { TutorProfileForm } from "@/components/expert/tutor-profile-form";

export default async function ExpertProfilePage() {
  const user = await getAuthUser();
  if (!user) redirect("/login");
  if (user.role !== "expert" && user.role !== "admin") redirect("/login");

  return (
    <div className="space-y-6">
      <div>
        <h1
          className="text-2xl font-bold"
          style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}
        >
          My Tutor Profile
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
          Set up your public profile so students can find and connect with you.
        </p>
      </div>
      <TutorProfileForm user={user} />
    </div>
  );
}
