"use client";
import { BookOpen, Star } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { Course } from "@/types/app";

interface Props {
  course: Course;
  tutorName?: string;
  tutorPhoto?: string | null;
  progressPercent?: number;
  enrolled?: boolean;
}

export function CourseCard({ course, tutorName, tutorPhoto, progressPercent, enrolled }: Props) {
  return (
    <Link href={`/courses/${course.id}`}>
      <Card className="card-hover overflow-hidden h-full flex flex-col cursor-pointer">
        {course.thumbnail_url ? (
          <img src={course.thumbnail_url} alt={course.title} className="w-full h-40 object-cover" />
        ) : (
          <div className="w-full h-40 flex items-center justify-center" style={{ background: "oklch(0.55 0.22 264 / 0.1)" }}>
            <BookOpen className="h-10 w-10" style={{ color: "var(--primary)" }} />
          </div>
        )}
        <CardContent className="p-4 flex-1 flex flex-col gap-2">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-semibold leading-snug" style={{ color: "var(--foreground)" }}>
              {course.title}
            </p>
            <Badge
              style={{
                background: course.price === 0 ? "oklch(0.6 0.17 145)" : "oklch(0.55 0.22 264)",
                color: "white",
                border: "none",
                fontSize: "0.65rem",
                whiteSpace: "nowrap",
              }}
            >
              {course.price === 0 ? "Free" : `₹${course.price}`}
            </Badge>
          </div>

          {course.subject && (
            <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{course.subject}</p>
          )}

          {tutorName && (
            <div className="flex items-center gap-2 mt-auto">
              {tutorPhoto ? (
                <img src={tutorPhoto} alt={tutorName} className="h-5 w-5 rounded-full object-cover" />
              ) : (
                <div
                  className="h-5 w-5 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ background: "oklch(0.55 0.22 264 / 0.2)", color: "var(--primary)" }}
                >
                  {tutorName[0]}
                </div>
              )}
              <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>{tutorName}</span>
            </div>
          )}

          {enrolled && progressPercent !== undefined && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs" style={{ color: "var(--muted-foreground)" }}>
                <span>Progress</span>
                <span>{progressPercent}%</span>
              </div>
              <Progress value={progressPercent} className="h-1.5" />
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
