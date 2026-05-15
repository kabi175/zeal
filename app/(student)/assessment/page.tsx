"use client";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ASSESSMENT_QUESTIONS,
  LIKERT_LABELS,
  generateResult,
  cacheAssessmentResult,
} from "@/lib/assessment";
import { saveAssessment } from "@/services/student";
import { createClient } from "@/lib/supabase/client";

const MOTIVATIONAL_NUDGES: Record<number, string> = {
  5: "You're doing great — 25% complete. Every answer helps us understand you better.",
  10: "Halfway there! Your honesty makes this report meaningful.",
  15: "Almost done — just 5 more questions. You're doing brilliantly.",
  19: "Final question! This will be really insightful.",
};

export default function AssessmentPage() {
  const router = useRouter();
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const question = ASSESSMENT_QUESTIONS[currentQ];
  const progress = Math.round((Object.keys(answers).length / ASSESSMENT_QUESTIONS.length) * 100);
  const currentAnswer = answers[question.id];
  const isLast = currentQ === ASSESSMENT_QUESTIONS.length - 1;

  const handleAnswer = useCallback((value: number) => {
    setAnswers((prev) => ({ ...prev, [question.id]: value }));
  }, [question.id]);

  const goNext = () => {
    if (currentQ < ASSESSMENT_QUESTIONS.length - 1) {
      setCurrentQ((q) => q + 1);
    }
  };

  const goPrev = () => {
    if (currentQ > 0) setCurrentQ((q) => q - 1);
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length < ASSESSMENT_QUESTIONS.length) {
      setError("Please answer all questions before submitting.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const result = generateResult(answers);
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const id = await saveAssessment({
        studentId: user.id,
        score: result.score,
        category: result.category,
        answers,
      });

      cacheAssessmentResult(user.id, result);
      router.push(`/assessment/${id}/report`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Submission failed. Please try again.");
      setSubmitting(false);
    }
  };

  const nudge = MOTIVATIONAL_NUDGES[currentQ];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1
          className="text-2xl font-bold"
          style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}
        >
          Stress Assessment
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
          Question {currentQ + 1} of {ASSESSMENT_QUESTIONS.length}
        </p>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <Progress value={progress} />
        <p className="text-xs text-right" style={{ color: "var(--muted-foreground)" }}>
          {progress}% complete
        </p>
      </div>

      {/* Nudge */}
      <AnimatePresence mode="wait">
        {nudge && (
          <motion.div
            key={`nudge-${currentQ}`}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-xl px-4 py-3 text-sm"
            style={{
              background: "oklch(0.55 0.22 264 / 0.08)",
              border: "1px solid oklch(0.55 0.22 264 / 0.2)",
              color: "var(--primary)",
            }}
          >
            ✨ {nudge}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Question card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`q-${currentQ}`}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium leading-relaxed">
                {question.text}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className="grid grid-cols-5 gap-2"
                role="radiogroup"
                aria-label={question.text}
              >
                {[1, 2, 3, 4, 5].map((val) => (
                  <button
                    key={val}
                    onClick={() => handleAnswer(val)}
                    role="radio"
                    aria-checked={currentAnswer === val}
                    className="flex flex-col items-center gap-2 rounded-xl border p-3 transition-all focus-visible:outline-none focus-visible:ring-2"
                    style={{
                      borderColor: currentAnswer === val ? "var(--primary)" : "var(--border)",
                      background:
                        currentAnswer === val
                          ? "oklch(0.55 0.22 264 / 0.1)"
                          : "var(--card)",
                      color: currentAnswer === val ? "var(--primary)" : "var(--foreground)",
                      fontWeight: currentAnswer === val ? "600" : "400",
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") handleAnswer(val);
                    }}
                  >
                    <span className="text-lg font-bold">{val}</span>
                    <span className="text-[10px] text-center leading-tight">
                      {LIKERT_LABELS[val]}
                    </span>
                  </button>
                ))}
              </div>

              {/* Keyboard hint */}
              <p className="text-xs mt-4 text-center" style={{ color: "var(--muted-foreground)" }}>
                Press 1–5 to answer quickly
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={goPrev} disabled={currentQ === 0}>
          <ChevronLeft className="h-4 w-4" /> Previous
        </Button>

        {error && (
          <p className="text-xs text-center" style={{ color: "var(--destructive)" }}>
            {error}
          </p>
        )}

        {isLast ? (
          <Button
            variant="gradient"
            onClick={handleSubmit}
            disabled={submitting || !currentAnswer}
          >
            {submitting ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Submitting…</>
            ) : (
              <><CheckCircle className="h-4 w-4" /> Submit Assessment</>
            )}
          </Button>
        ) : (
          <Button variant="default" onClick={goNext} disabled={!currentAnswer}>
            Next <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Answer overview */}
      <div className="flex flex-wrap gap-1.5">
        {ASSESSMENT_QUESTIONS.map((q, i) => (
          <button
            key={q.id}
            onClick={() => setCurrentQ(i)}
            className="h-7 w-7 rounded-md text-xs font-medium transition-colors"
            style={{
              background:
                i === currentQ
                  ? "var(--primary)"
                  : answers[q.id]
                  ? "oklch(0.55 0.22 264 / 0.2)"
                  : "var(--muted)",
              color: i === currentQ ? "white" : "var(--foreground)",
            }}
            title={`Question ${i + 1}`}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
}
