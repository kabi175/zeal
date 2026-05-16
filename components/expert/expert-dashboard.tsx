"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { motion } from "framer-motion";
import {
  Users, Calendar, FileText, TrendingUp, Brain, Loader2, BookOpen, HelpCircle,
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { QuestionBank } from "./question-bank";
import { CourseList } from "./course-list";
import {
  getAssignedStudents,
  getExpertSessions,
  getStudentAssessmentHistory,
  saveNote,
} from "@/services/expert";
import { getCategoryColor, getCategoryLabel } from "@/lib/assessment";
import type { AuthUser, StressCategory } from "@/types/app";

interface ExpertDashboardProps {
  user: AuthUser;
}

export function ExpertDashboard({ user }: ExpertDashboardProps) {
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [noteContent, setNoteContent] = useState("");
  const [isPrivate, setIsPrivate] = useState(true);
  const qc = useQueryClient();

  const { data: students = [], isLoading: studentsLoading } = useQuery({
    queryKey: ["assignedStudents", user.id],
    queryFn: () => getAssignedStudents(user.id),
  });

  const { data: sessions = [] } = useQuery({
    queryKey: ["expertSessions", user.id],
    queryFn: () => getExpertSessions(user.id),
  });

  const { data: studentHistory = [] } = useQuery({
    queryKey: ["studentHistory", selectedStudentId],
    queryFn: () => getStudentAssessmentHistory(selectedStudentId!),
    enabled: !!selectedStudentId,
  });

  const { mutate: saveNoteMutation, isPending: savingNote } = useMutation({
    mutationFn: saveNote,
    onSuccess: () => {
      setNoteContent("");
      qc.invalidateQueries({ queryKey: ["expertSessions", user.id] });
    },
  });

  const selectedStudent = students.find((s) => s.id === selectedStudentId);
  const upcomingSessions = sessions.filter(
    (s) => new Date(s.scheduled_at) >= new Date() && s.status === "scheduled"
  );

  const chartData = studentHistory.map((h) => ({
    date: format(new Date(h.completed_at), "MMM d"),
    score: h.score,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1
          className="text-2xl font-bold"
          style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}
        >
          Expert Dashboard
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
          Manage your assigned students and sessions
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Assigned Students", value: students.length, icon: <Users className="h-5 w-5" /> },
          { label: "Upcoming Sessions", value: upcomingSessions.length, icon: <Calendar className="h-5 w-5" /> },
          { label: "Total Sessions", value: sessions.length, icon: <FileText className="h-5 w-5" /> },
          {
            label: "Avg Stress Score",
            value: students.length
              ? Math.round(students.reduce((sum, s) => sum + (s.latest_score ?? 0), 0) / students.length)
              : "—",
            icon: <Brain className="h-5 w-5" />,
          },
        ].map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="card-hover">
              <CardContent className="pt-6">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl mb-3"
                  style={{ background: "oklch(0.55 0.22 264 / 0.1)", color: "var(--primary)" }}
                >
                  {kpi.icon}
                </div>
                <p
                  className="text-2xl font-bold"
                  style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}
                >
                  {kpi.value}
                </p>
                <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                  {kpi.label}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Tabs defaultValue="students">
        <TabsList className="mb-6">
          <TabsTrigger value="students">
            <Users className="h-4 w-4 mr-1.5" /> Students
          </TabsTrigger>
          <TabsTrigger value="courses">
            <BookOpen className="h-4 w-4 mr-1.5" /> Courses
          </TabsTrigger>
          <TabsTrigger value="questions">
            <HelpCircle className="h-4 w-4 mr-1.5" /> Questions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="courses">
          <CourseList expertId={user.id} />
        </TabsContent>

        <TabsContent value="questions">
          <QuestionBank expertId={user.id} />
        </TabsContent>

        <TabsContent value="students">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Student List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Assigned Students</CardTitle>
          </CardHeader>
          <CardContent>
            {studentsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" style={{ color: "var(--primary)" }} />
              </div>
            ) : students.length === 0 ? (
              <p className="text-sm text-center py-8" style={{ color: "var(--muted-foreground)" }}>
                No students assigned yet
              </p>
            ) : (
              <div className="space-y-2">
                {students.map((s) => {
                  const cat = s.latest_category as StressCategory | null;
                  const color = cat ? getCategoryColor(cat) : "var(--muted-foreground)";
                  return (
                    <button
                      key={s.id}
                      onClick={() => setSelectedStudentId(s.id)}
                      className="w-full flex items-center gap-3 rounded-xl p-3 text-left transition-colors"
                      style={{
                        background:
                          selectedStudentId === s.id
                            ? "oklch(0.55 0.22 264 / 0.1)"
                            : "var(--muted)",
                        border: selectedStudentId === s.id ? "1px solid var(--primary)" : "1px solid transparent",
                      }}
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {s.full_name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-sm font-medium truncate"
                          style={{ color: "var(--foreground)" }}
                        >
                          {s.full_name}
                        </p>
                        <p className="text-xs truncate" style={{ color: "var(--muted-foreground)" }}>
                          {s.department} · Yr {s.year_of_study}
                        </p>
                      </div>
                      {cat && (
                        <div
                          className="h-2.5 w-2.5 rounded-full shrink-0"
                          style={{ background: color }}
                          title={getCategoryLabel(cat)}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Student Detail Panel */}
        <div className="lg:col-span-2 space-y-4">
          {selectedStudent ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>{selectedStudent.full_name}</CardTitle>
                  <CardDescription>
                    {selectedStudent.department} · Year {selectedStudent.year_of_study} ·{" "}
                    {selectedStudent.total_assessments} assessments
                    {selectedStudent.latest_score != null && (
                      <Badge
                        className="ml-2"
                        style={{
                          background: getCategoryColor(selectedStudent.latest_category as StressCategory),
                          color: "white",
                          border: "none",
                        }}
                      >
                        Score: {selectedStudent.latest_score} ·{" "}
                        {getCategoryLabel(selectedStudent.latest_category as StressCategory)}
                      </Badge>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Trend chart */}
                  {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={160}>
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                        <XAxis dataKey="date" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
                        <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
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
                          dot={{ fill: "oklch(0.55 0.22 264)", r: 3 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-sm text-center py-6" style={{ color: "var(--muted-foreground)" }}>
                      No assessment history yet
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Notes editor */}
              <Card>
                <CardHeader>
                  <CardTitle>Session Notes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Textarea
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    placeholder="Write your session notes here…"
                    rows={5}
                  />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Switch
                        id="private"
                        checked={isPrivate}
                        onCheckedChange={setIsPrivate}
                      />
                      <Label htmlFor="private" className="text-sm">
                        Private note
                      </Label>
                    </div>
                    <Button
                      variant="gradient"
                      size="sm"
                      disabled={!noteContent.trim() || savingNote}
                      onClick={() =>
                        saveNoteMutation({
                          expertId: user.id,
                          studentId: selectedStudent.id,
                          content: noteContent,
                          isPrivate,
                        })
                      }
                    >
                      {savingNote ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                      Save Note
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="pt-16 pb-16 text-center">
                <Users className="h-10 w-10 mx-auto mb-3" style={{ color: "var(--muted-foreground)" }} />
                <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                  Select a student to view their details and trend chart
                </p>
              </CardContent>
            </Card>
          )}

          {/* Upcoming sessions */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingSessions.length === 0 ? (
                <p className="text-sm text-center py-6" style={{ color: "var(--muted-foreground)" }}>
                  No upcoming sessions
                </p>
              ) : (
                <div className="space-y-2">
                  {upcomingSessions.slice(0, 5).map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center justify-between rounded-xl p-3"
                      style={{ background: "var(--muted)" }}
                    >
                      <div>
                        <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
                          {s.title ?? "Counselling Session"}
                        </p>
                        <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                          {format(new Date(s.scheduled_at), "EEE, MMM d · h:mm a")}
                        </p>
                      </div>
                      <Badge variant="default">{s.duration_minutes} min</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
