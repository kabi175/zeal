"use client";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { markLessonComplete } from "@/services/enrollments";
import type { Lesson } from "@/types/app";

interface Props {
  lesson: Lesson;
  studentId: string;
  courseId: string;
  isCompleted: boolean;
  onCompleted: () => void;
}

export function LessonViewer({ lesson, studentId, courseId, isCompleted, onCompleted }: Props) {
  const { mutate: complete, isPending } = useMutation({
    mutationFn: () => markLessonComplete(studentId, lesson.id),
    onSuccess: onCompleted,
  });

  const getYouTubeEmbedUrl = (url: string) => {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([^&?/]+)/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : url;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold" style={{ color: "var(--foreground)" }}>{lesson.title}</h2>
        <p className="text-xs mt-1 capitalize" style={{ color: "var(--muted-foreground)" }}>{lesson.content_type} lesson</p>
      </div>

      {lesson.content_type === "video" && lesson.content_url && (
        <div className="aspect-video rounded-xl overflow-hidden" style={{ background: "#000" }}>
          <iframe
            src={getYouTubeEmbedUrl(lesson.content_url)}
            className="w-full h-full"
            allowFullScreen
            title={lesson.title}
          />
        </div>
      )}

      {lesson.content_type === "text" && lesson.content_body && (
        <div
          className="rounded-xl p-6 prose prose-sm max-w-none"
          style={{ background: "var(--card)", border: "1px solid var(--border)", color: "var(--foreground)" }}
        >
          <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">{lesson.content_body}</pre>
        </div>
      )}

      {lesson.content_type === "quiz" && (
        <div
          className="rounded-xl p-6 text-center"
          style={{ background: "var(--card)", border: "1px solid var(--border)" }}
        >
          <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>Quiz content will appear here.</p>
        </div>
      )}

      <div className="flex justify-end">
        {isCompleted ? (
          <div className="flex items-center gap-2 text-sm" style={{ color: "oklch(0.6 0.17 145)" }}>
            <CheckCircle2 className="h-5 w-5" />
            Completed
          </div>
        ) : (
          <Button onClick={() => complete()} disabled={isPending}>
            {isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Mark as Complete
          </Button>
        )}
      </div>
    </div>
  );
}
