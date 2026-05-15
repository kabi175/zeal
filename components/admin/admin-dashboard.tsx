"use client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Users, Brain, ClipboardList, TrendingUp, Loader2,
} from "lucide-react";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid, BarChart, Bar,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getAdminStats } from "@/services/admin";
import type { StressCategory } from "@/types/app";
import { getCategoryColor, getCategoryLabel } from "@/lib/assessment";

const CATEGORY_ORDER: StressCategory[] = ["low", "mild", "moderate", "high", "severe"];

export function AdminDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["adminStats"],
    queryFn: getAdminStats,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: "var(--primary)" }} />
      </div>
    );
  }

  if (!stats) return null;

  const pieData = CATEGORY_ORDER
    .filter((c) => stats.categoryBreakdown[c] > 0)
    .map((c) => ({
      name: getCategoryLabel(c),
      value: stats.categoryBreakdown[c],
      color: getCategoryColor(c),
    }));

  return (
    <div className="space-y-6">
      <div>
        <h1
          className="text-2xl font-bold"
          style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}
        >
          Analytics Overview
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
          College-wide wellness insights
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Students", value: stats.totalStudents, icon: <Users className="h-5 w-5" /> },
          { label: "Total Experts", value: stats.totalExperts, icon: <Brain className="h-5 w-5" /> },
          { label: "Assessments", value: stats.totalAssessments, icon: <ClipboardList className="h-5 w-5" /> },
          { label: "Avg Stress Score", value: `${stats.avgStressScore}/100`, icon: <TrendingUp className="h-5 w-5" /> },
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stress Distribution Pie */}
        <Card>
          <CardHeader>
            <CardTitle>Stress Distribution</CardTitle>
            <CardDescription>All assessments by category</CardDescription>
          </CardHeader>
          <CardContent>
            {pieData.length === 0 ? (
              <p className="text-center text-sm py-10" style={{ color: "var(--muted-foreground)" }}>
                No data yet
              </p>
            ) : (
              <div className="flex items-center gap-6">
                <ResponsiveContainer width="60%" height={200}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {pieData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: "var(--card)",
                        border: "1px solid var(--border)",
                        borderRadius: "0.75rem",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2">
                  {pieData.map((d) => (
                    <div key={d.name} className="flex items-center gap-2 text-xs">
                      <div className="h-3 w-3 rounded-full" style={{ background: d.color }} />
                      <span style={{ color: "var(--foreground)" }}>{d.name}</span>
                      <span className="font-bold" style={{ color: "var(--foreground)" }}>{d.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Weekly Engagement */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Engagement</CardTitle>
            <CardDescription>Assessments completed per week</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.weeklyEngagement.length === 0 ? (
              <p className="text-center text-sm py-10" style={{ color: "var(--muted-foreground)" }}>
                No data yet
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={stats.weeklyEngagement}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="week" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
                  <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
                  <Tooltip
                    contentStyle={{
                      background: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "0.75rem",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="oklch(0.55 0.22 264)"
                    strokeWidth={2}
                    dot={{ fill: "oklch(0.55 0.22 264)", r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Department Heatmap */}
      <Card>
        <CardHeader>
          <CardTitle>Department Stress Heatmap</CardTitle>
          <CardDescription>Average stress score by department (top 10)</CardDescription>
        </CardHeader>
        <CardContent>
          {stats.departmentHeatmap.length === 0 ? (
            <p className="text-center text-sm py-10" style={{ color: "var(--muted-foreground)" }}>
              No department data yet
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={stats.departmentHeatmap} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                  type="number"
                  domain={[0, 100]}
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                />
                <YAxis
                  type="category"
                  dataKey="department"
                  width={130}
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "0.75rem",
                  }}
                />
                <Bar dataKey="avgScore" radius={[0, 4, 4, 0]}>
                  {stats.departmentHeatmap.map((entry) => {
                    const cat =
                      entry.avgScore <= 20 ? "low" :
                      entry.avgScore <= 40 ? "mild" :
                      entry.avgScore <= 60 ? "moderate" :
                      entry.avgScore <= 80 ? "high" : "severe";
                    return (
                      <Cell
                        key={entry.department}
                        fill={getCategoryColor(cat as StressCategory)}
                      />
                    );
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
