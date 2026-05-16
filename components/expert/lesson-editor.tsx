"use client";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Loader2, GripVertical, Video, FileText, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { upsertLesson, deleteLesson } from "@/services/courses";
import type { Lesson, LessonContentType } from "@/types/app";

interface Props {
  moduleId: string;
  courseId: string;
  lessons: Lesson[];
}

const typeIcon: Record<LessonContentType, React.ReactNode> = {
  video: <Video className="h-3.5 w-3.5" />,
  text: <FileText className="h-3.5 w-3.5" />,
  quiz: <HelpCircle className="h-3.5 w-3.5" />,
};

export function LessonEditor({ moduleId, courseId, lessons }: Props) {
  const qc = useQueryClient();
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [contentType, setContentType] = useState<LessonContentType>("text");
  const [contentUrl, setContentUrl] = useState("");
  const [contentBody, setContentBody] = useState("");

  const { mutate: addLesson, isPending: saving } = useMutation({
    mutationFn: () =>
      upsertLesson({
        module_id: moduleId,
        title,
        content_type: contentType,
        content_url: contentUrl || null,
        content_body: contentBody || null,
        order_index: lessons.length,
        duration_secs: 0,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["course", courseId] });
      setTitle(""); setContentType("text"); setContentUrl(""); setContentBody(""); setAdding(false);
    },
  });

  const { mutate: removeLesson } = useMutation({
    mutationFn: deleteLesson,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["course", courseId] }),
  });

  return (
    <div className="space-y-2 pl-4 border-l-2" style={{ borderColor: "var(--border)" }}>
      {lessons.map((lesson) => (
        <div
          key={lesson.id}
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm"
          style={{ background: "var(--muted)" }}
        >
          <GripVertical className="h-3.5 w-3.5 shrink-0" style={{ color: "var(--muted-foreground)" }} />
          <span style={{ color: "var(--muted-foreground)" }}>{typeIcon[lesson.content_type]}</span>
          <span className="flex-1 truncate" style={{ color: "var(--foreground)" }}>{lesson.title}</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-red-500"
            onClick={() => { if (confirm("Delete lesson?")) removeLesson(lesson.id); }}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      ))}

      {adding ? (
        <div className="rounded-lg p-3 space-y-2" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Lesson title"
            className="text-sm"
          />
          <div className="flex gap-2">
            {(["text", "video", "quiz"] as LessonContentType[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setContentType(t)}
                className="flex items-center gap-1 rounded-full px-3 py-1 text-xs capitalize"
                style={{
                  background: contentType === t ? "oklch(0.55 0.22 264)" : "var(--muted)",
                  color: contentType === t ? "white" : "var(--muted-foreground)",
                }}
              >
                {typeIcon[t]} {t}
              </button>
            ))}
          </div>
          {contentType === "video" && (
            <Input value={contentUrl} onChange={(e) => setContentUrl(e.target.value)} placeholder="Video URL (YouTube embed, etc.)" className="text-sm" />
          )}
          {contentType === "text" && (
            <Textarea value={contentBody} onChange={(e) => setContentBody(e.target.value)} rows={3} placeholder="Lesson content (markdown supported)" className="text-sm" />
          )}
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" size="sm" onClick={() => setAdding(false)}>Cancel</Button>
            <Button size="sm" disabled={!title.trim() || saving} onClick={() => addLesson()}>
              {saving && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />} Save
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          className="flex items-center gap-1 text-xs px-2 py-1 rounded"
          style={{ color: "var(--primary)" }}
          onClick={() => setAdding(true)}
        >
          <Plus className="h-3.5 w-3.5" /> Add lesson
        </button>
      )}
    </div>
  );
}
