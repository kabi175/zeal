"use client";
import Link from "next/link";
import { Star, BookOpen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { TutorPublicProfile } from "@/types/app";

interface Props { tutor: TutorPublicProfile; }

export function TutorCard({ tutor }: Props) {
  return (
    <Card className="card-hover overflow-hidden h-full flex flex-col">
      <CardContent className="p-5 flex flex-col gap-4 h-full">
        {/* Header */}
        <div className="flex items-start gap-3">
          {tutor.profile_photo_url ? (
            <img src={tutor.profile_photo_url} alt={tutor.full_name} className="h-14 w-14 rounded-full object-cover shrink-0" />
          ) : (
            <Avatar className="h-14 w-14 shrink-0">
              <AvatarFallback className="text-lg font-bold">
                {tutor.full_name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          )}
          <div className="min-w-0">
            <p className="font-semibold leading-tight" style={{ color: "var(--foreground)" }}>{tutor.full_name}</p>
            {tutor.profile_headline && (
              <p className="text-xs mt-0.5 line-clamp-2" style={{ color: "var(--muted-foreground)" }}>{tutor.profile_headline}</p>
            )}
            <div className="flex items-center gap-1 mt-1">
              <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
              <span className="text-xs font-medium" style={{ color: "var(--foreground)" }}>
                {tutor.rating.toFixed(1)}
              </span>
              <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                ({tutor.total_reviews} reviews)
              </span>
            </div>
          </div>
        </div>

        {/* Subjects */}
        {tutor.subjects.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {tutor.subjects.slice(0, 4).map((s) => (
              <Badge
                key={s}
                variant="outline"
                className="text-xs"
                style={{ borderColor: "var(--primary)", color: "var(--primary)" }}
              >
                {s}
              </Badge>
            ))}
            {tutor.subjects.length > 4 && (
              <Badge variant="outline" className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                +{tutor.subjects.length - 4} more
              </Badge>
            )}
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center gap-4 text-xs" style={{ color: "var(--muted-foreground)" }}>
          <span>{tutor.years_experience} yrs exp</span>
          <span className="flex items-center gap-1"><BookOpen className="h-3.5 w-3.5" /> {tutor.languages.join(", ")}</span>
        </div>

        {/* Footer */}
        <div className="mt-auto flex items-center justify-between pt-2" style={{ borderTop: "1px solid var(--border)" }}>
          <p className="font-bold" style={{ color: "var(--primary)" }}>
            {tutor.hourly_rate === 0 ? "Free" : `₹${tutor.hourly_rate}/hr`}
          </p>
          <Link href={`/tutors/${tutor.user_id}`}>
            <Button size="sm">View Profile</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
