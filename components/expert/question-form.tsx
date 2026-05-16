"use client";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Question, QuestionDifficulty } from "@/types/app";

const schema = z.object({
  question_text: z.string().min(5, "Question is too short"),
  option_a: z.string().min(1, "Required"),
  option_b: z.string().min(1, "Required"),
  option_c: z.string().min(1, "Required"),
  option_d: z.string().min(1, "Required"),
  correct_option: z.enum(["A", "B", "C", "D"]),
  difficulty: z.enum(["easy", "medium", "hard"]),
  topic_tag: z.string().optional(),
  explanation: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (values: FormValues) => Promise<void>;
  initial?: Partial<Question>;
  isPending: boolean;
}

export function QuestionForm({ open, onClose, onSave, initial, isPending }: Props) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      question_text: "",
      option_a: "",
      option_b: "",
      option_c: "",
      option_d: "",
      correct_option: "A",
      difficulty: "medium",
      topic_tag: "",
      explanation: "",
    },
  });

  useEffect(() => {
    if (initial) {
      form.reset({
        question_text: initial.question_text ?? "",
        option_a: initial.option_a ?? "",
        option_b: initial.option_b ?? "",
        option_c: initial.option_c ?? "",
        option_d: initial.option_d ?? "",
        correct_option: (initial.correct_option as "A" | "B" | "C" | "D") ?? "A",
        difficulty: (initial.difficulty as QuestionDifficulty) ?? "medium",
        topic_tag: initial.topic_tag ?? "",
        explanation: initial.explanation ?? "",
      });
    } else {
      form.reset({
        question_text: "",
        option_a: "",
        option_b: "",
        option_c: "",
        option_d: "",
        correct_option: "A",
        difficulty: "medium",
        topic_tag: "",
        explanation: "",
      });
    }
  }, [initial, open]);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initial?.id ? "Edit Question" : "New Question"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSave)} className="space-y-4 mt-2">
          <div className="space-y-1">
            <Label>Question</Label>
            <Textarea {...form.register("question_text")} rows={3} placeholder="Enter your question…" />
            {form.formState.errors.question_text && (
              <p className="text-xs text-red-500">{form.formState.errors.question_text.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            {(["A", "B", "C", "D"] as const).map((opt) => (
              <div key={opt} className="space-y-1">
                <Label>Option {opt}</Label>
                <Input
                  {...form.register(`option_${opt.toLowerCase()}` as keyof FormValues)}
                  placeholder={`Option ${opt}`}
                />
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label>Correct Answer</Label>
              <select
                {...form.register("correct_option")}
                className="w-full rounded-md border px-3 py-2 text-sm"
                style={{ background: "var(--card)", color: "var(--foreground)", borderColor: "var(--border)" }}
              >
                {["A", "B", "C", "D"].map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <Label>Difficulty</Label>
              <select
                {...form.register("difficulty")}
                className="w-full rounded-md border px-3 py-2 text-sm"
                style={{ background: "var(--card)", color: "var(--foreground)", borderColor: "var(--border)" }}
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            <div className="space-y-1">
              <Label>Topic Tag</Label>
              <Input {...form.register("topic_tag")} placeholder="e.g. Algebra" />
            </div>
          </div>

          <div className="space-y-1">
            <Label>Explanation (optional)</Label>
            <Textarea {...form.register("explanation")} rows={2} placeholder="Explain the correct answer…" />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" variant="default" disabled={isPending}>
              {isPending && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
              {initial?.id ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
