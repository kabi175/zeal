"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Download, Printer, ArrowLeft, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  getCategoryColor,
  getCategoryLabel,
} from "@/lib/assessment";
import type { Profile, StressCategory } from "@/types/app";

interface AssessmentWithAnswers {
  id: string;
  score: number;
  category: StressCategory;
  completed_at: string;
  assessment_answers: Array<{ question_id: number; answer_value: number }>;
}

interface AssessmentReportProps {
  assessment: AssessmentWithAnswers;
  profile: Profile;
  autoDownload: boolean;
}

// Category details inlined for display
const CATEGORY_DETAILS: Record<StressCategory, { interpretation: string; strategies: string[]; coping: string }> = {
  low: {
    interpretation: "You appear to be managing academic and personal pressures very well.",
    strategies: [
      "Continue your current wellness practices",
      "Share your strategies with peers who may be struggling",
      "Set growth goals to maintain positive momentum",
    ],
    coping: "Maintain your current routine. Journal your successes to stay motivated.",
  },
  mild: {
    interpretation: "You experience occasional stress that is manageable with minor adjustments.",
    strategies: [
      "Practice daily 5-minute mindfulness or breathing exercises",
      "Create a structured weekly schedule with buffer time",
      "Connect with a peer or mentor for regular check-ins",
    ],
    coping: "Try the 4-7-8 breathing technique whenever tension rises.",
  },
  moderate: {
    interpretation: "You are experiencing notable stress that may affect your daily functioning.",
    strategies: [
      "Schedule a session with a college counsellor",
      "Break large tasks into smaller, daily achievable goals",
      "Establish a consistent sleep schedule (7–9 hours)",
    ],
    coping: "Keep a stress journal to identify triggers and patterns.",
  },
  high: {
    interpretation: "Your stress levels are significantly elevated and affecting your wellbeing.",
    strategies: [
      "Book an urgent counselling session today",
      "Speak to your academic advisor about workload adjustments",
      "Contact family or close friends for emotional support",
    ],
    coping: "You do not have to manage this alone. Reach out — it is a sign of strength.",
  },
  severe: {
    interpretation: "You are experiencing severe stress that requires immediate professional attention.",
    strategies: [
      "Contact our counselling team: +91 97902 05149",
      "Speak to a trusted person right now",
      "If feeling unsafe, contact iCall: 9152987821",
    ],
    coping: "Please reach out immediately. Email: zealcatalyst.zeca@gmail.com",
  },
};

export function AssessmentReport({ assessment, profile, autoDownload }: AssessmentReportProps) {
  const details = CATEGORY_DETAILS[assessment.category];
  const categoryColor = getCategoryColor(assessment.category);

  useEffect(() => {
    if (autoDownload) {
      handleDownload();
    }
  }, [autoDownload]);

  const handleDownload = async () => {
    const { generateStressReportPdf } = await import("@/lib/report-pdf");
    const result = {
      score: assessment.score,
      category: assessment.category,
      interpretation: details.interpretation,
      interventionStrategies: details.strategies,
      copingGuidance: details.coping,
      answers: Object.fromEntries(
        assessment.assessment_answers.map((a) => [a.question_id, a.answer_value])
      ),
    };
    await generateStressReportPdf(profile, result, assessment.id);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back + Actions */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Link>
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="h-4 w-4" /> Print
          </Button>
          <Button variant="gradient" size="sm" onClick={handleDownload}>
            <Download className="h-4 w-4" /> Download PDF
          </Button>
        </div>
      </div>

      {/* Score Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl p-8 text-center"
        style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-glow)" }}
      >
        <p className="text-white/80 text-sm mb-3">Stress Assessment Report</p>
        <div className="inline-flex flex-col items-center">
          <span
            className="text-7xl font-bold text-white"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {assessment.score}
          </span>
          <span className="text-white/70 text-sm">out of 100</span>
        </div>
        <div className="mt-4">
          <Badge
            className="text-base px-4 py-1.5 font-semibold"
            style={{
              background: "rgba(255,255,255,0.2)",
              color: "white",
              border: "1px solid rgba(255,255,255,0.3)",
            }}
          >
            {getCategoryLabel(assessment.category)}
          </Badge>
        </div>
        <p className="mt-3 text-white/70 text-xs">
          Completed {format(new Date(assessment.completed_at), "MMMM d, yyyy 'at' h:mm a")}
        </p>
      </motion.div>

      {/* Score bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between text-xs mb-2" style={{ color: "var(--muted-foreground)" }}>
            <span>0 — Low</span>
            <span>100 — Severe</span>
          </div>
          <Progress value={assessment.score} />
          <div className="flex justify-between text-xs mt-2" style={{ color: "var(--muted-foreground)" }}>
            {(["low","mild","moderate","high","severe"] as StressCategory[]).map((cat) => (
              <span
                key={cat}
                className="capitalize font-medium"
                style={{ color: cat === assessment.category ? categoryColor : undefined }}
              >
                {cat}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Interpretation */}
      <Card>
        <CardHeader>
          <CardTitle>Interpretation</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
            {details.interpretation}
          </p>
        </CardContent>
      </Card>

      {/* Strategies */}
      <Card>
        <CardHeader>
          <CardTitle>Recommended Strategies</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {details.strategies.map((s) => (
              <li key={s} className="flex gap-3 text-sm">
                <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" style={{ color: categoryColor }} />
                <span style={{ color: "var(--foreground)" }}>{s}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Coping */}
      <Card>
        <CardContent className="pt-6">
          <p
            className="text-sm font-semibold mb-2"
            style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}
          >
            Coping Guidance
          </p>
          <p className="text-sm leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
            {details.coping}
          </p>
        </CardContent>
      </Card>

      {/* CTA */}
      <Card>
        <CardContent className="pt-6 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div>
            <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
              Need to talk to someone?
            </p>
            <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
              Book a session with one of our qualified counsellors.
            </p>
          </div>
          <Button variant="gradient" asChild>
            <Link href="/counselling">Book Counselling</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
