import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCourseWithModules } from "@/services/courses-server";
import { CourseDetailClient } from "@/components/student/course-detail-client";

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const course = await getCourseWithModules(courseId);
  if (!course) redirect("/courses");

  return <CourseDetailClient course={course} studentId={user.id} />;
}
