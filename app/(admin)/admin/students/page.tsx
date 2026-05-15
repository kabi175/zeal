"use client";
import { useQuery } from "@tanstack/react-query";
import { Download, Loader2, Search } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getAllStudents, exportStudentsCsv } from "@/services/admin";

export default function AdminStudentsPage() {
  const [search, setSearch] = useState("");
  const { data: students = [], isLoading } = useQuery({
    queryKey: ["adminStudents"],
    queryFn: getAllStudents,
  });

  const filtered = students.filter((s: any) =>
    `${s.full_name} ${s.email} ${s.department}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-2xl font-bold"
            style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}
          >
            Student Management
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
            {students.length} students registered
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => exportStudentsCsv(students as any[])}
          disabled={isLoading || students.length === 0}
        >
          <Download className="h-4 w-4" /> Export CSV
        </Button>
      </div>

      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4"
          style={{ color: "var(--muted-foreground)" }}
        />
        <Input
          placeholder="Search by name, email, or department…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Students</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin" style={{ color: "var(--primary)" }} />
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-center py-12 text-sm" style={{ color: "var(--muted-foreground)" }}>
              No students found
            </p>
          ) : (
            <div className="space-y-2">
              {(filtered as any[]).map((s) => (
                <div
                  key={s.id}
                  className="flex items-center gap-4 rounded-xl p-3"
                  style={{ background: "var(--muted)" }}
                >
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="text-xs">
                      {s.full_name?.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
                      {s.full_name}
                    </p>
                    <p className="text-xs truncate" style={{ color: "var(--muted-foreground)" }}>
                      {s.email}
                    </p>
                  </div>
                  <div className="hidden sm:block text-xs" style={{ color: "var(--muted-foreground)" }}>
                    {s.department ?? "—"} · Yr {s.year_of_study ?? "—"}
                  </div>
                  <Badge variant="secondary" className="capitalize hidden sm:inline-flex">
                    {s.gender ?? "—"}
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
