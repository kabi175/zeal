import { createClient } from "@/lib/supabase/client";
import type { Course, Module, Lesson, CourseWithModules } from "@/types/app";

export async function listExpertCourses(expertId: string): Promise<Course[]> {
  const supabase = createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("courses")
    .select("*")
    .eq("expert_id", expertId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Course[];
}

export async function listPublishedCourses(): Promise<Course[]> {
  const supabase = createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("courses")
    .select("*")
    .eq("is_published", true)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Course[];
}

export async function getCourseWithModules(courseId: string): Promise<CourseWithModules | null> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createClient() as any;

  const { data: course, error: ce } = await supabase
    .from("courses")
    .select("*")
    .eq("id", courseId)
    .single();
  if (ce) throw ce;
  if (!course) return null;

  const { data: modules, error: me } = await supabase
    .from("modules")
    .select("*")
    .eq("course_id", courseId)
    .order("order_index");
  if (me) throw me;

  const modulesWithLessons = await Promise.all(
    ((modules ?? []) as Module[]).map(async (mod) => {
      const { data: lessons, error: le } = await supabase
        .from("lessons")
        .select("*")
        .eq("module_id", mod.id)
        .order("order_index");
      if (le) throw le;
      return { ...mod, lessons: (lessons ?? []) as Lesson[] };
    })
  );

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, avatar_url")
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
    tutor_photo:
      (expertRow as { profile_photo_url: string | null } | null)?.profile_photo_url ??
      (profile as { avatar_url: string | null } | null)?.avatar_url ??
      null,
  };
}

export async function upsertCourse(
  course: Omit<Course, "created_at" | "updated_at"> & { id?: string }
): Promise<Course> {
  const supabase = createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("courses")
    .upsert(course, { onConflict: "id" })
    .select()
    .single();
  if (error) throw error;
  return data as Course;
}

export async function deleteCourse(id: string): Promise<void> {
  const supabase = createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).from("courses").delete().eq("id", id);
  if (error) throw error;
}

export async function upsertModule(
  mod: Omit<Module, "id" | "created_at"> & { id?: string }
): Promise<Module> {
  const supabase = createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("modules")
    .upsert(mod, { onConflict: "id" })
    .select()
    .single();
  if (error) throw error;
  return data as Module;
}

export async function deleteModule(id: string): Promise<void> {
  const supabase = createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).from("modules").delete().eq("id", id);
  if (error) throw error;
}

export async function upsertLesson(
  lesson: Omit<Lesson, "id" | "created_at"> & { id?: string }
): Promise<Lesson> {
  const supabase = createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("lessons")
    .upsert({ ...lesson, id: lesson.id ?? undefined }, { onConflict: "id" })
    .select()
    .single();
  if (error) throw error;
  return data as Lesson;
}

export async function deleteLesson(id: string): Promise<void> {
  const supabase = createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).from("lessons").delete().eq("id", id);
  if (error) throw error;
}
