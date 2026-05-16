"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { QuestionForm } from "./question-form";
import { listQuestions, upsertQuestion, deleteQuestion } from "@/services/questions";
import type { Question } from "@/types/app";

interface Props { expertId: string; }

const diffColor: Record<string, string> = {
  easy: "oklch(0.6 0.17 145)",
  medium: "oklch(0.65 0.2 55)",
  hard: "oklch(0.55 0.22 27)",
};

export function QuestionBank({ expertId }: Props) {
  const qc = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<Question> | undefined>();

  const { data: questions = [], isLoading } = useQuery({
    queryKey: ["questions", expertId],
    queryFn: () => listQuestions(expertId),
  });

  const { mutateAsync: saveQ, isPending: saving } = useMutation({
    mutationFn: (vals: Omit<Question, "created_at" | "updated_at">) =>
      upsertQuestion({ ...vals, expert_id: expertId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["questions", expertId] });
      setFormOpen(false);
      setEditing(undefined);
    },
  });

  const { mutate: removeQ } = useMutation({
    mutationFn: deleteQuestion,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["questions", expertId] }),
  });

  const openEdit = (q: Question) => { setEditing(q); setFormOpen(true); };
  const openNew = () => { setEditing(undefined); setFormOpen(true); };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold" style={{ color: "var(--foreground)" }}>Question Bank</h2>
          <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{questions.length} questions</p>
        </div>
        <Button variant="default" size="sm" onClick={openNew}>
          <Plus className="h-4 w-4 mr-1" /> Add Question
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin" style={{ color: "var(--primary)" }} />
        </div>
      ) : questions.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>No questions yet. Add your first question.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {questions.map((q, i) => (
            <motion.div
              key={q.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <Card className="card-hover">
                <CardContent className="py-3 px-4 flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
                      {i + 1}. {q.question_text}
                    </p>
                    <div className="flex gap-2 mt-1 flex-wrap">
                      <Badge
                        style={{
                          background: diffColor[q.difficulty] ?? "var(--muted)",
                          color: "white",
                          border: "none",
                          fontSize: "0.65rem",
                        }}
                      >
                        {q.difficulty}
                      </Badge>
                      {q.topic_tag && (
                        <Badge variant="outline" className="text-xs">{q.topic_tag}</Badge>
                      )}
                      <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                        Answer: {q.correct_option}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(q)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-red-500 hover:text-red-600"
                      onClick={() => {
                        if (confirm("Delete this question?")) removeQ(q.id);
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <QuestionForm
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditing(undefined); }}
        onSave={(vals) => saveQ({ ...editing, ...vals, expert_id: expertId } as any).then(() => {})}
        initial={editing}
        isPending={saving}
      />
    </div>
  );
}
