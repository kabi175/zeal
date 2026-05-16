import { createClient } from "@/lib/supabase/client";
import type { Question } from "@/types/app";

export async function listQuestions(expertId: string): Promise<Question[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createClient() as any;
  const { data, error } = await supabase
    .from("questions")
    .select("*")
    .eq("expert_id", expertId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Question[];
}

export async function upsertQuestion(
  q: Omit<Question, "created_at" | "updated_at"> & { id?: string }
): Promise<Question> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createClient() as any;
  const { data, error } = await supabase
    .from("questions")
    .upsert(q, { onConflict: "id" })
    .select()
    .single();
  if (error) throw error;
  return data as Question;
}

export async function deleteQuestion(id: string): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createClient() as any;
  const { error } = await supabase.from("questions").delete().eq("id", id);
  if (error) throw error;
}
