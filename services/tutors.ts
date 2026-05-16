import { createClient } from "@/lib/supabase/client";
import type { TutorPublicProfile, Expert } from "@/types/app";

export interface TutorSearchFilters {
  subject?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  search?: string;
}

export async function searchTutors(filters: TutorSearchFilters = {}): Promise<TutorPublicProfile[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createClient() as any;

  let query = supabase
    .from("experts")
    .select("id, user_id, hourly_rate, subjects, languages, profile_headline, rating, total_reviews, years_experience, qualifications, profile_photo_url, is_public")
    .eq("is_public", true);

  if (filters.subject) query = query.contains("subjects", [filters.subject]);
  if (filters.minPrice !== undefined) query = query.gte("hourly_rate", filters.minPrice);
  if (filters.maxPrice !== undefined) query = query.lte("hourly_rate", filters.maxPrice);
  if (filters.minRating !== undefined) query = query.gte("rating", filters.minRating);

  const { data, error } = await query;
  if (error) throw error;
  if (!data?.length) return [];

  const userIds = data.map((r: any) => r.user_id);
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .in("id", userIds);
  const profileMap: Record<string, any> = {};
  (profiles ?? []).forEach((p: any) => { profileMap[p.id] = p; });

  let results: TutorPublicProfile[] = data.map((row: any) => ({
    id: row.id,
    user_id: row.user_id,
    full_name: profileMap[row.user_id]?.full_name ?? "",
    email: profileMap[row.user_id]?.email ?? "",
    avatar_url: null,
    bio: null,
    profile_headline: row.profile_headline,
    profile_photo_url: row.profile_photo_url,
    subjects: row.subjects ?? [],
    languages: row.languages ?? [],
    hourly_rate: row.hourly_rate ?? 0,
    rating: row.rating ?? 0,
    total_reviews: row.total_reviews ?? 0,
    years_experience: row.years_experience ?? 0,
    qualifications: row.qualifications ?? null,
    is_public: row.is_public,
  }));

  if (filters.search) {
    const q = filters.search.toLowerCase();
    results = results.filter(
      (t) =>
        t.full_name.toLowerCase().includes(q) ||
        t.subjects.some((s) => s.toLowerCase().includes(q)) ||
        (t.profile_headline ?? "").toLowerCase().includes(q)
    );
  }

  return results;
}

export async function getTutorProfile(userId: string): Promise<TutorPublicProfile | null> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createClient() as any;
  const { data, error } = await supabase
    .from("experts")
    .select("id, user_id, hourly_rate, subjects, languages, profile_headline, rating, total_reviews, years_experience, qualifications, profile_photo_url, is_public")
    .eq("user_id", userId)
    .single();
  if (error || !data) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email")
    .eq("id", userId)
    .single();

  return {
    id: data.id,
    user_id: data.user_id,
    full_name: profile?.full_name ?? "",
    email: profile?.email ?? "",
    avatar_url: null,
    bio: null,
    profile_headline: data.profile_headline,
    profile_photo_url: data.profile_photo_url,
    subjects: data.subjects ?? [],
    languages: data.languages ?? [],
    hourly_rate: data.hourly_rate ?? 0,
    rating: data.rating ?? 0,
    total_reviews: data.total_reviews ?? 0,
    years_experience: data.years_experience ?? 0,
    qualifications: data.qualifications ?? null,
    is_public: data.is_public,
  };
}

export async function upsertTutorProfile(
  userId: string,
  updates: Partial<Pick<Expert, "hourly_rate" | "subjects" | "languages" | "profile_headline" | "profile_photo_url" | "is_public" | "qualifications" | "years_experience">>
): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createClient() as any;
  const { error } = await supabase
    .from("experts")
    .upsert({ user_id: userId, ...updates }, { onConflict: "user_id" });
  if (error) throw error;
}
