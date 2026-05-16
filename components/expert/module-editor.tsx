"use client";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, ChevronDown, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LessonEditor } from "./lesson-editor";
import { upsertModule, deleteModule } from "@/services/courses";
import type { Module, Lesson } from "@/types/app";

interface ModuleWithLessons extends Module { lessons: Lesson[]; }

interface Props {
  courseId: string;
  modules: ModuleWithLessons[];
}

export function ModuleEditor({ courseId, modules }: Props) {
  const qc = useQueryClient();
  const [expanded, setExpanded] = useState<string[]>([]);
  const [addingModule, setAddingModule] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  const { mutate: addModule, isPending: saving } = useMutation({
    mutationFn: () =>
      upsertModule({ course_id: courseId, title: newTitle, order_index: modules.length } as any),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["course", courseId] });
      setNewTitle(""); setAddingModule(false);
    },
  });

  const { mutate: removeModule } = useMutation({
    mutationFn: deleteModule,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["course", courseId] }),
  });

  const toggle = (id: string) =>
    setExpanded((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  return (
    <div className="space-y-2">
      {modules.map((mod, i) => (
        <div key={mod.id} className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
          <button
            type="button"
            className="w-full flex items-center gap-2 px-4 py-3 text-left"
            style={{ background: "var(--muted)" }}
            onClick={() => toggle(mod.id)}
          >
            {expanded.includes(mod.id) ? <ChevronDown className="h-4 w-4 shrink-0" /> : <ChevronRight className="h-4 w-4 shrink-0" />}
            <span className="flex-1 text-sm font-medium" style={{ color: "var(--foreground)" }}>
              Module {i + 1}: {mod.title}
            </span>
            <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>
              {mod.lessons.length} lessons
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-red-500 shrink-0"
              onClick={(e) => {
                e.stopPropagation();
                if (confirm("Delete module and all its lessons?")) removeModule(mod.id);
              }}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </button>
          {expanded.includes(mod.id) && (
            <div className="p-3">
              <LessonEditor moduleId={mod.id} courseId={courseId} lessons={mod.lessons} />
            </div>
          )}
        </div>
      ))}

      {addingModule ? (
        <div className="flex gap-2 items-center">
          <Input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Module title"
            className="text-sm"
            onKeyDown={(e) => e.key === "Enter" && newTitle.trim() && addModule()}
          />
          <Button size="sm" disabled={!newTitle.trim() || saving} onClick={() => addModule()}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add"}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setAddingModule(false)}>Cancel</Button>
        </div>
      ) : (
        <Button variant="outline" size="sm" onClick={() => setAddingModule(true)}>
          <Plus className="h-4 w-4 mr-1" /> Add Module
        </Button>
      )}
    </div>
  );
}
