import { getAuthUser } from "@/lib/actions/auth";
import { redirect } from "next/navigation";
import { AiChat } from "@/components/chat/ai-chat";

export default async function ChatPage() {
  const user = await getAuthUser();
  if (!user) redirect("/login");
  return (
    <div className="max-w-3xl mx-auto">
      <h1
        className="text-2xl font-bold mb-2"
        style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}
      >
        AI Wellness Companion
      </h1>
      <p className="text-sm mb-6" style={{ color: "var(--muted-foreground)" }}>
        A safe, supportive space to talk. Available 24/7. Not a substitute for professional care.
      </p>
      <AiChat userId={user.id} userName={user.profile?.full_name ?? "Student"} />
    </div>
  );
}
