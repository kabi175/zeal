"use client";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { TutorSearchFilters } from "@/services/tutors";

interface Props {
  filters: TutorSearchFilters;
  onChange: (f: TutorSearchFilters) => void;
}

const COMMON_SUBJECTS = ["Mathematics", "Physics", "Chemistry", "Biology", "English", "Computer Science", "History", "Economics"];

export function TutorFilters({ filters, onChange }: Props) {
  return (
    <div className="rounded-2xl p-5 space-y-5" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "var(--muted-foreground)" }} />
        <Input
          value={filters.search ?? ""}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          placeholder="Search tutors or subjects…"
          className="pl-9"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium">Subject</Label>
        <select
          value={filters.subject ?? ""}
          onChange={(e) => onChange({ ...filters, subject: e.target.value || undefined })}
          className="w-full rounded-md border px-3 py-2 text-sm"
          style={{ background: "var(--card)", color: "var(--foreground)", borderColor: "var(--border)" }}
        >
          <option value="">All subjects</option>
          {COMMON_SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium">Min Rating</Label>
        <div className="flex gap-2">
          {[0, 3, 4, 4.5].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => onChange({ ...filters, minRating: r === 0 ? undefined : r })}
              className="px-3 py-1 rounded-full text-xs"
              style={{
                background: (filters.minRating ?? 0) === r ? "oklch(0.55 0.22 264)" : "var(--muted)",
                color: (filters.minRating ?? 0) === r ? "white" : "var(--muted-foreground)",
              }}
            >
              {r === 0 ? "Any" : `${r}+★`}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium">Max Hourly Rate (₹)</Label>
        <div className="flex gap-2">
          {[0, 500, 1000, 2000].map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => onChange({ ...filters, maxPrice: p === 0 ? undefined : p })}
              className="px-3 py-1 rounded-full text-xs"
              style={{
                background: (filters.maxPrice ?? 0) === p ? "oklch(0.55 0.22 264)" : "var(--muted)",
                color: (filters.maxPrice ?? 0) === p ? "white" : "var(--muted-foreground)",
              }}
            >
              {p === 0 ? "Any" : `≤₹${p}`}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
