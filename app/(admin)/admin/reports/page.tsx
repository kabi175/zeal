"use client";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Download } from "lucide-react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { getCategoryColor, getCategoryLabel } from "@/lib/assessment";
import type { StressCategory } from "@/types/app";

export default function AdminReportsPage() {
  const supabase = createClient();

  const { data: assessments = [], isLoading } = useQuery({
    queryKey: ["allAssessments"],
    queryFn: async () => {
      const { data } = await supabase
        .from("assessments")
        .select("*, profiles!student_id(full_name, email, department, year_of_study)")
        .order("completed_at", { ascending: false })
        .limit(200);
      return data ?? [];
    },
  });

  const exportCsv = () => {
    if (assessments.length === 0) return;
    const headers = ["Student", "Email", "Department", "Score", "Category", "Date"];
    const rows = (assessments as any[]).map((a) =>
      [
        a.profiles?.full_name ?? "—",
        a.profiles?.email ?? "—",
        a.profiles?.department ?? "—",
        a.score,
        a.category,
        format(new Date(a.completed_at), "yyyy-MM-dd"),
      ].join(",")
    );
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `zeal2up-reports-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-2xl font-bold"
            style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}
          >
            Assessment Reports
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
            {assessments.length} reports available
          </p>
        </div>
        <Button variant="outline" onClick={exportCsv} disabled={isLoading || assessments.length === 0}>
          <Download className="h-4 w-4" /> Export CSV
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Assessment Reports</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin" style={{ color: "var(--primary)" }} />
            </div>
          ) : assessments.length === 0 ? (
            <p className="text-center py-12 text-sm" style={{ color: "var(--muted-foreground)" }}>
              No assessments yet
            </p>
          ) : (
            <div className="space-y-2">
              {(assessments as any[]).map((a) => (
                <div
                  key={a.id}
                  className="flex items-center gap-4 rounded-xl p-3"
                  style={{ background: "var(--muted)" }}
                >
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white"
                    style={{ background: getCategoryColor(a.category as StressCategory) }}
                  >
                    {a.score}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
                      {a.profiles?.full_name ?? "—"}
                    </p>
                    <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                      {a.profiles?.department ?? "—"} ·{" "}
                      {format(new Date(a.completed_at), "MMM d, yyyy")}
                    </p>
                  </div>
                  <Badge
                    style={{
                      background: getCategoryColor(a.category as StressCategory),
                      color: "white",
                      border: "none",
                    }}
                  >
                    {getCategoryLabel(a.category as StressCategory)}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
