import { createClient } from "@/lib/supabase/client";
import type { Enrollment, EnrollmentWithProgress } from "@/types/app";

export async function enrollStudent(studentId: string, courseId: string): Promise<Enrollment> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createClient() as any;
  const { data, error } = await supabase
    .from("enrollments")
    .insert({ student_id: studentId, course_id: courseId })
    .select()
    .single();
  if (error) throw error;
  return data as Enrollment;
}

export async function getStudentEnrollments(studentId: string): Promise<Enrollment[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createClient() as any;
  const { data, error } = await supabase
    .from("enrollments")
    .select("*")
    .eq("student_id", studentId);
  if (error) throw error;
  return (data ?? []) as Enrollment[];
}

export async function getEnrollmentWithProgress(
  studentId: string,
  courseId: string
): Promise<EnrollmentWithProgress | null> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createClient() as any;

  const { data: enrollment, error: ee } = await supabase
    .from("enrollments")
    .select("*")
    .eq("student_id", studentId)
    .eq("course_id", courseId)
    .single();
  if (ee) return null;

  const { data: progress } = await supabase
    .from("lesson_progress")
    .select("lesson_id")
    .eq("student_id", studentId);

  const { data: lessons } = await supabase
    .from("lessons")
    .select("id, module_id")
    .in(
      "module_id",
      await supabase
        .from("modules")
        .select("id")
        .eq("course_id", courseId)
        .then((r: { data: { id: string }[] | null }) => (r.data ?? []).map((m) => m.id))
    );

  return {
    ...(enrollment as Enrollment),
    completed_lessons: ((progress ?? []) as { lesson_id: string }[]).map((p) => p.lesson_id),
    total_lessons: ((lessons ?? []) as unknown[]).length,
  };
}

export async function markLessonComplete(studentId: string, lessonId: string): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createClient() as any;
  const { error } = await supabase
    .from("lesson_progress")
    .insert({ student_id: studentId, lesson_id: lessonId });
  if (error && error.code !== "23505") throw error;
}
