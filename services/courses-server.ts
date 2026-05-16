import { createClient } from "@/lib/supabase/server";
import type { Course, Module, Lesson, CourseWithModules } from "@/types/app";

export async function getCourseWithModules(courseId: string): Promise<CourseWithModules | null> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = (await createClient()) as any;

  const { data: course, error: ce } = await supabase
    .from("courses")
    .select("*")
    .eq("id", courseId)
    .single();
  if (ce || !course) return null;

  const { data: modules } = await supabase
    .from("modules")
    .select("*")
    .eq("course_id", courseId)
    .order("order_index");

  const modulesWithLessons = await Promise.all(
    ((modules ?? []) as Module[]).map(async (mod) => {
      const { data: lessons } = await supabase
        .from("lessons")
        .select("*")
        .eq("module_id", mod.id)
        .order("order_index");
      return { ...mod, lessons: (lessons ?? []) as Lesson[] };
    })
  );

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", (course as Course).expert_id)
    .single();

  const { data: expertRow } = await supabase
    .from("experts")
    .select("profile_photo_url")
    .eq("user_id", (course as Course).expert_id)
    .single();

  return {
    ...(course as Course),
    modules: modulesWithLessons,
    tutor_name: (profile as { full_name: string } | null)?.full_name ?? "Tutor",
    tutor_photo: (expertRow as { profile_photo_url: string | null } | null)?.profile_photo_url ?? null,
  };
}
