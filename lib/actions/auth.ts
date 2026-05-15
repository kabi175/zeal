"use server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { AuthUser, Profile, AppRole } from "@/types/app";

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function getAuthUser(): Promise<AuthUser | null> {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) return null;

  const profileResult = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const roleResult = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  return {
    id: user.id,
    email: user.email ?? "",
    profile: (profileResult.data as Profile | null) ?? null,
    role: ((roleResult.data as { role: AppRole } | null)?.role) ?? null,
  };
}
