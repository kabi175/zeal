import { createClient } from "@/lib/supabase/client";
import type { TutorReview } from "@/types/app";

export interface ReviewWithStudent extends TutorReview {
  student_name: string;
  student_avatar: string | null;
}

export async function listTutorReviews(expertUserId: string): Promise<ReviewWithStudent[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createClient() as any;
  const { data, error } = await supabase
    .from("tutor_reviews")
    .select("*, profiles!tutor_reviews_student_id_fkey(full_name, avatar_url)")
    .eq("expert_id", expertUserId)
    .order("created_at", { ascending: false });
  if (error) throw error;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return ((data ?? []) as any[]).map((row) => ({
    ...row,
    student_name: row.profiles?.full_name ?? "Student",
    student_avatar: row.profiles?.avatar_url ?? null,
  }));
}

export async function submitReview(params: {
  expertId: string;
  studentId: string;
  rating: number;
  comment?: string;
}): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createClient() as any;
  const { error } = await supabase.from("tutor_reviews").upsert(
    {
      expert_id: params.expertId,
      student_id: params.studentId,
      rating: params.rating,
      comment: params.comment ?? null,
    },
    { onConflict: "expert_id,student_id" }
  );
  if (error) throw error;
}
