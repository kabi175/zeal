"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Users } from "lucide-react";
import { motion } from "framer-motion";
import { TutorCard } from "@/components/tutors/tutor-card";
import { TutorFilters } from "@/components/tutors/tutor-filters";
import { searchTutors } from "@/services/tutors";
import type { TutorSearchFilters } from "@/services/tutors";

export default function FindTutorsPage() {
  const [filters, setFilters] = useState<TutorSearchFilters>({});

  const { data: tutors = [], isLoading } = useQuery({
    queryKey: ["tutors", filters],
    queryFn: () => searchTutors(filters),
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Hero */}
      <div className="text-center space-y-2 pb-4">
        <h1
          className="text-3xl font-bold"
          style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}
        >
          Find Your Perfect Tutor
        </h1>
        <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
          Connect with expert tutors for personalized one-on-one guidance
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar filters */}
        <aside className="w-full lg:w-72 shrink-0">
          <TutorFilters filters={filters} onChange={setFilters} />
        </aside>

        {/* Results */}
        <main className="flex-1">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin" style={{ color: "var(--primary)" }} />
            </div>
          ) : tutors.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Users className="h-10 w-10" style={{ color: "var(--muted-foreground)" }} />
              <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                No tutors found. Try adjusting your filters.
              </p>
            </div>
          ) : (
            <>
              <p className="text-sm mb-4" style={{ color: "var(--muted-foreground)" }}>
                {tutors.length} tutor{tutors.length !== 1 ? "s" : ""} found
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {tutors.map((tutor, i) => (
                  <motion.div
                    key={tutor.user_id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <TutorCard tutor={tutor} />
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
