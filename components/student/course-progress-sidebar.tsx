"use client";
import { CheckCircle2, Circle, ChevronDown, ChevronRight, Video, FileText, HelpCircle } from "lucide-react";
import type { CourseWithModules, LessonContentType } from "@/types/app";

interface Props {
  course: CourseWithModules;
  completedLessons: string[];
  activeLessonId: string | null;
  onSelectLesson: (lessonId: string) => void;
}

const typeIcon: Record<LessonContentType, React.ReactNode> = {
  video: <Video className="h-3.5 w-3.5 shrink-0" />,
  text: <FileText className="h-3.5 w-3.5 shrink-0" />,
  quiz: <HelpCircle className="h-3.5 w-3.5 shrink-0" />,
};

export function CourseProgressSidebar({ course, completedLessons, activeLessonId, onSelectLesson }: Props) {
  const totalLessons = course.modules.reduce((sum, m) => sum + m.lessons.length, 0);
  const doneLessons = completedLessons.length;
  const pct = totalLessons > 0 ? Math.round((doneLessons / totalLessons) * 100) : 0;

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>{course.title}</p>
        <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
          {doneLessons}/{totalLessons} lessons · {pct}%
        </p>
        <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--muted)" }}>
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${pct}%`, background: "oklch(0.55 0.22 264)" }}
          />
        </div>
      </div>

      <div className="space-y-2">
        {course.modules.map((mod, mi) => (
          <details key={mod.id} open className="group">
            <summary className="flex items-center gap-2 cursor-pointer px-2 py-1.5 rounded-lg select-none" style={{ background: "var(--muted)" }}>
              <ChevronDown className="h-3.5 w-3.5 shrink-0 group-open:rotate-0 -rotate-90 transition-transform" />
              <span className="text-xs font-medium flex-1" style={{ color: "var(--foreground)" }}>
                {mi + 1}. {mod.title}
              </span>
            </summary>
            <div className="mt-1 space-y-0.5">
              {mod.lessons.map((lesson) => {
                const done = completedLessons.includes(lesson.id);
                const active = lesson.id === activeLessonId;
                return (
                  <button
                    key={lesson.id}
                    onClick={() => onSelectLesson(lesson.id)}
                    className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-left text-xs transition-colors"
                    style={{
                      background: active ? "oklch(0.55 0.22 264 / 0.15)" : "transparent",
                      color: active ? "var(--primary)" : "var(--foreground)",
                    }}
                  >
                    {done ? (
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0" style={{ color: "oklch(0.6 0.17 145)" }} />
                    ) : (
                      <Circle className="h-3.5 w-3.5 shrink-0" style={{ color: "var(--muted-foreground)" }} />
                    )}
                    <span style={{ color: "var(--muted-foreground)" }}>{typeIcon[lesson.content_type]}</span>
                    <span className="truncate">{lesson.title}</span>
                  </button>
                );
              })}
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
