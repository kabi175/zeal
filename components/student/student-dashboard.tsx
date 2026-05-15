"use client";
import { motion } from "framer-motion";
import {
  Brain, TrendingUp, MessageCircle, Calendar,
  ClipboardList, Download, Sparkles,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useDashboardStats, useStudentAssessments, useStudentSessions } from "@/hooks/use-student-data";
import { getCategoryColor, getCategoryLabel } from "@/lib/assessment";
import type { AuthUser } from "@/types/app";

const QUOTES = [
  "You are stronger than you think. Every step forward, no matter how small, is progress.",
  "Your mental health matters. Taking care of yourself is not selfish — it is necessary.",
  "Difficult roads often lead to beautiful destinations. Keep going.",
  "You have survived 100% of your hard days so far. You can do this.",
];

const TIPS = [
  "Try the 4-7-8 breathing technique before bed: inhale 4 counts, hold 7, exhale 8.",
  "Write 3 things you are grateful for each morning — it rewires your brain for positivity.",
  "A 20-minute walk in natural light can reduce anxiety by up to 40%.",
  "Limit screen time 1 hour before sleep. Your brain needs time to wind down.",
];

interface StudentDashboardProps {
  user: AuthUser;
}

export function StudentDashboard({ user }: StudentDashboardProps) {
  const userId = user.id;
  const { data: stats, isLoading: statsLoading } = useDashboardStats(userId);
  const { data: assessments = [] } = useStudentAssessments(userId);
  const { data: sessions = [] } = useStudentSessions(userId);

  const quote = QUOTES[new Date().getDay() % QUOTES.length];
  const tip = TIPS[new Date().getDay() % TIPS.length];

  const chartData = assessments
    .slice(0, 8)
    .reverse()
    .map((a) => ({
      date: format(new Date(a.completed_at), "MMM d"),
      score: a.score,
    }));

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-6"
        style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-glow)" }}
      >
        <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>
          Welcome back, {user.profile?.full_name?.split(" ")[0]} 👋
        </h1>
        <p className="mt-1 text-white/80 text-sm">
          {format(new Date(), "EEEE, MMMM d, yyyy")} · {user.profile?.department ?? "—"}
        </p>
        <p className="mt-4 text-white/90 text-sm italic">&ldquo;{quote}&rdquo;</p>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Stress Score",
            value: statsLoading ? "…" : stats?.stressScore != null ? `${stats.stressScore}/100` : "—",
            icon: <Brain className="h-5 w-5" />,
            sublabel: stats?.stressScore != null ? getCategoryLabel(
              stats.stressScore <= 20 ? "low" :
              stats.stressScore <= 40 ? "mild" :
              stats.stressScore <= 60 ? "moderate" :
              stats.stressScore <= 80 ? "high" : "severe"
            ) : "Not assessed",
          },
          {
            label: "Communication",
            value: statsLoading ? "…" : stats?.communicationScore != null ? `${stats.communicationScore}%` : "—",
            icon: <MessageCircle className="h-5 w-5" />,
            sublabel: "Behavioural score",
          },
          {
            label: "Teamwork",
            value: statsLoading ? "…" : stats?.teamworkScore != null ? `${stats.teamworkScore}%` : "—",
            icon: <TrendingUp className="h-5 w-5" />,
            sublabel: "Collaboration score",
          },
          {
            label: "Assessments",
            value: statsLoading ? "…" : String(stats?.totalAssessments ?? 0),
            icon: <ClipboardList className="h-5 w-5" />,
            sublabel: `${stats?.upcomingSessions ?? 0} upcoming sessions`,
          },
        ].map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.05 }}
          >
            <Card className="card-hover">
              <CardContent className="pt-6">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl mb-3"
                  style={{ background: "oklch(0.55 0.22 264 / 0.1)", color: "var(--primary)" }}
                >
                  {card.icon}
                </div>
                <p className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>
                  {card.value}
                </p>
                <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                  {card.label}
                </p>
                <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>
                  {card.sublabel}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Growth chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Stress Score Trend</CardTitle>
            <CardDescription>Your last {chartData.length} assessments</CardDescription>
          </CardHeader>
          <CardContent>
            {chartData.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 gap-3">
                <ClipboardList className="h-10 w-10" style={{ color: "var(--muted-foreground)" }} />
                <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                  No assessments yet.{" "}
                  <Link href="/assessment" className="underline" style={{ color: "var(--primary)" }}>
                    Take your first one
                  </Link>
                </p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="date" tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} />
                  <Tooltip
                    contentStyle={{
                      background: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "0.75rem",
                      color: "var(--foreground)",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="oklch(0.55 0.22 264)"
                    strokeWidth={2}
                    dot={{ fill: "oklch(0.55 0.22 264)", r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Upcoming sessions */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            {sessions.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 gap-3">
                <Calendar className="h-8 w-8" style={{ color: "var(--muted-foreground)" }} />
                <p className="text-sm text-center" style={{ color: "var(--muted-foreground)" }}>
                  No upcoming sessions
                </p>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/counselling">Book a session</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {sessions.slice(0, 3).map((s) => (
                  <div
                    key={s.id}
                    className="rounded-xl p-3"
                    style={{ background: "var(--muted)" }}
                  >
                    <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
                      {s.title ?? "Counselling Session"}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                      {format(new Date(s.scheduled_at), "EEE, MMM d · h:mm a")}
                    </p>
                    <Badge variant="secondary" className="mt-1.5 text-xs">
                      {s.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Assessment History */}
      <Card>
        <CardHeader>
          <CardTitle>Assessment History</CardTitle>
          <CardDescription>All completed stress assessments</CardDescription>
        </CardHeader>
        <CardContent>
          {assessments.length === 0 ? (
            <div className="text-center py-10">
              <Brain className="h-10 w-10 mx-auto mb-3" style={{ color: "var(--muted-foreground)" }} />
              <p className="text-sm mb-4" style={{ color: "var(--muted-foreground)" }}>
                You haven&apos;t taken any assessments yet.
              </p>
              <Button variant="gradient" asChild>
                <Link href="/assessment">
                  <ClipboardList className="h-4 w-4" />
                  Take Assessment
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {assessments.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center justify-between rounded-xl p-4"
                  style={{ background: "var(--muted)" }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold text-white"
                      style={{ background: getCategoryColor(a.category) }}
                    >
                      {a.score}
                    </div>
                    <div>
                      <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
                        {getCategoryLabel(a.category)}
                      </p>
                      <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                        {format(new Date(a.completed_at), "MMM d, yyyy · h:mm a")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/assessment/${a.id}/report`}>View</Link>
                    </Button>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/assessment/${a.id}/report?download=1`}>
                        <Download className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Wellness tip */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
              style={{ background: "oklch(0.55 0.22 264 / 0.1)", color: "var(--primary)" }}
            >
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold mb-1" style={{ color: "var(--foreground)" }}>
                Daily Wellness Tip
              </p>
              <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>{tip}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
