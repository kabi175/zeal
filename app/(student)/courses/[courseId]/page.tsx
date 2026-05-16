"use client";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CourseProgressSidebar } from "@/components/student/course-progress-sidebar";
import { LessonViewer } from "@/components/student/lesson-viewer";
import { getCourseWithModules } from "@/services/courses";
import { useCourseProgress, useEnrollMutation, useMarkLessonComplete } from "@/hooks/use-course-progress";
import { useAuth } from "@/hooks/use-auth";

export default function CourseDetailPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);

  const { data: course, isLoading: courseLoading } = useQuery({
    queryKey: ["course", courseId],
    queryFn: () => getCourseWithModules(courseId),
    enabled: !!courseId,
  });

  const { data: progress, refetch: refetchProgress } = useCourseProgress(user?.id ?? "", courseId);
  const { mutate: enroll, isPending: enrolling } = useEnrollMutation(user?.id ?? "", courseId);
  const { mutate: markComplete } = useMarkLessonComplete(user?.id ?? "", courseId);

  const activeLesson = course?.modules
    .flatMap((m) => m.lessons)
    .find((l) => l.id === activeLessonId) ?? null;

  const isEnrolled = !!progress;
  const completedLessons = progress?.completed_lessons ?? [];
  const allLessons = course?.modules.flatMap((m) => m.lessons) ?? [];
  const isCompleted = progress?.status === "completed";

  if (courseLoading || !course) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: "var(--primary)" }} />
      </div>
    );
  }

  if (isCompleted) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <Award className="h-16 w-16" style={{ color: "oklch(0.7 0.22 80)" }} />
        <p className="text-xl font-bold" style={{ color: "var(--foreground)" }}>Course Completed!</p>
        <Button onClick={() => router.push(`/courses/${courseId}/certificate`)}>
          View Certificate
        </Button>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-[calc(100vh-4rem)]">
      {/* Sidebar */}
      <aside
        className="w-72 shrink-0 overflow-y-auto p-4 hidden md:block"
        style={{ borderRight: "1px solid var(--border)", background: "var(--card)" }}
      >
        <CourseProgressSidebar
          course={course}
          completedLessons={completedLessons}
          activeLessonId={activeLessonId}
          onSelectLesson={setActiveLessonId}
        />
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-6">
        {!isEnrolled ? (
          <div className="flex flex-col items-center justify-center h-full gap-6 text-center">
            {course.thumbnail_url && (
              <img src={course.thumbnail_url} alt={course.title} className="w-full max-w-md rounded-xl object-cover h-48" />
            )}
            <div>
              <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>{course.title}</h1>
              {course.description && (
                <p className="text-sm mt-2 max-w-lg" style={{ color: "var(--muted-foreground)" }}>{course.description}</p>
              )}
            </div>
            <p className="text-lg font-bold" style={{ color: "var(--primary)" }}>
              {course.price === 0 ? "Free" : `₹${course.price}`}
            </p>
            <Button size="lg" disabled={enrolling} onClick={() => enroll()}>
              {enrolling && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Enroll Now
            </Button>
          </div>
        ) : activeLesson ? (
          <LessonViewer
            lesson={activeLesson}
            studentId={user?.id ?? ""}
            courseId={courseId}
            isCompleted={completedLessons.includes(activeLesson.id)}
            onCompleted={() => {
              markComplete(activeLesson.id, {
                onSuccess: () => {
                  refetchProgress();
                  // Auto-advance to next lesson
                  const idx = allLessons.findIndex((l) => l.id === activeLesson.id);
                  const next = allLessons[idx + 1];
                  if (next) setActiveLessonId(next.id);
                },
              });
            }}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
              Select a lesson from the sidebar to begin.
            </p>
            {allLessons.length > 0 && (
              <Button variant="outline" onClick={() => setActiveLessonId(allLessons[0].id)}>
                Start First Lesson
              </Button>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
