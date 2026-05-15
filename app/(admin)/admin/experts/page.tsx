"use client";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Brain } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getAllExperts } from "@/services/admin";

export default function AdminExpertsPage() {
  const { data: experts = [], isLoading } = useQuery({
    queryKey: ["adminExperts"],
    queryFn: getAllExperts,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1
          className="text-2xl font-bold"
          style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}
        >
          Expert Management
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
          {experts.length} active counsellors
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Experts</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin" style={{ color: "var(--primary)" }} />
            </div>
          ) : experts.length === 0 ? (
            <div className="flex flex-col items-center py-12 gap-3">
              <Brain className="h-10 w-10" style={{ color: "var(--muted-foreground)" }} />
              <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                No experts registered yet
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {(experts as any[]).map((e) => (
                <div
                  key={e.id}
                  className="flex items-center gap-4 rounded-xl p-4"
                  style={{ background: "var(--muted)" }}
                >
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>
                      {e.profiles?.full_name?.slice(0, 2).toUpperCase() ?? "EX"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
                      {e.profiles?.full_name ?? "—"}
                    </p>
                    <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                      {e.profiles?.email ?? "—"} · {e.years_experience}y exp
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {e.specialization?.slice(0, 2).map((s: string) => (
                      <Badge key={s} variant="secondary" className="text-xs">
                        {s}
                      </Badge>
                    ))}
                  </div>
                  <Badge variant={e.is_active ? "success" : "secondary"}>
                    {e.is_active ? "Active" : "Inactive"}
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
