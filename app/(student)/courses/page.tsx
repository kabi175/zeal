import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CourseCard } from "@/components/student/course-card";
import { listPublishedCourses } from "@/services/courses";
import { getStudentEnrollments } from "@/services/enrollments";

export default async function CoursesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [allCourses, enrollments] = await Promise.all([
    listPublishedCourses(),
    getStudentEnrollments(user.id),
  ]);

  const enrolledIds = new Set(enrollments.map((e) => e.course_id));
  const enrolledCourses = allCourses.filter((c) => enrolledIds.has(c.id));
  const availableCourses = allCourses.filter((c) => !enrolledIds.has(c.id));

  return (
    <div className="space-y-8 p-6">
      {enrolledCourses.length > 0 && (
        <section>
          <h2 className="text-xl font-bold mb-4" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>
            My Courses
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {enrolledCourses.map((c) => (
              <CourseCard key={c.id} course={c} enrolled />
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-xl font-bold mb-4" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>
          {enrolledCourses.length > 0 ? "Explore More Courses" : "All Courses"}
        </h2>
        {availableCourses.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>No courses available yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableCourses.map((c) => (
              <CourseCard key={c.id} course={c} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
