"use client";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Star, BookOpen, ArrowLeft, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getTutorProfile } from "@/services/tutors";
import { listTutorReviews } from "@/services/reviews";
import { listPublishedCourses } from "@/services/courses";
import { CourseCard } from "@/components/student/course-card";

export default function TutorProfilePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const { data: tutor, isLoading } = useQuery({
    queryKey: ["tutor", id],
    queryFn: () => getTutorProfile(id),
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ["tutorReviews", id],
    queryFn: () => listTutorReviews(id),
    enabled: !!id,
  });

  const { data: allCourses = [] } = useQuery({
    queryKey: ["courses-public"],
    queryFn: listPublishedCourses,
  });

  const tutorCourses = allCourses.filter((c) => c.expert_id === id);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: "var(--primary)" }} />
      </div>
    );
  }

  if (!tutor) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <p style={{ color: "var(--muted-foreground)" }}>Tutor not found.</p>
        <Link href="/tutors"><Button variant="outline">Back to Tutors</Button></Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <Button variant="ghost" size="sm" onClick={() => router.back()}>
        <ArrowLeft className="h-4 w-4 mr-1" /> Back
      </Button>

      {/* Profile Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card>
          <CardContent className="p-6 flex flex-col sm:flex-row gap-6">
            {tutor.profile_photo_url ? (
              <img src={tutor.profile_photo_url} alt={tutor.full_name} className="h-24 w-24 rounded-full object-cover shrink-0" />
            ) : (
              <Avatar className="h-24 w-24 shrink-0">
                <AvatarFallback className="text-2xl font-bold">
                  {tutor.full_name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            )}
            <div className="flex-1 space-y-3">
              <div>
                <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>{tutor.full_name}</h1>
                {tutor.profile_headline && (
                  <p style={{ color: "var(--muted-foreground)" }}>{tutor.profile_headline}</p>
                )}
              </div>
              <div className="flex items-center gap-4 text-sm flex-wrap">
                <span className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <strong>{tutor.rating.toFixed(1)}</strong>
                  <span style={{ color: "var(--muted-foreground)" }}>({tutor.total_reviews} reviews)</span>
                </span>
                <span style={{ color: "var(--muted-foreground)" }}>{tutor.years_experience} yrs experience</span>
                <span style={{ color: "var(--muted-foreground)" }}>{tutor.languages.join(", ")}</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {tutor.subjects.map((s) => (
                  <Badge key={s} variant="outline" style={{ borderColor: "var(--primary)", color: "var(--primary)" }}>{s}</Badge>
                ))}
              </div>
              <div className="flex items-center gap-3 pt-1">
                <p className="text-xl font-bold" style={{ color: "var(--primary)" }}>
                  {tutor.hourly_rate === 0 ? "Free" : `₹${tutor.hourly_rate}/hr`}
                </p>
                <Link href={`/counselling?expertId=${tutor.user_id}`}>
                  <Button>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Book Session
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* About */}
      {tutor.qualifications && (
        <Card>
          <CardHeader><CardTitle>About</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed" style={{ color: "var(--foreground)" }}>{tutor.qualifications}</p>
          </CardContent>
        </Card>
      )}

      {/* Courses */}
      {tutorCourses.length > 0 && (
        <section>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: "var(--foreground)" }}>
            <BookOpen className="h-5 w-5" style={{ color: "var(--primary)" }} />
            Courses by {tutor.full_name}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {tutorCourses.map((c) => (
              <CourseCard key={c.id} course={c} tutorName={tutor.full_name} tutorPhoto={tutor.profile_photo_url} />
            ))}
          </div>
        </section>
      )}

      {/* Reviews */}
      <section>
        <h2 className="text-xl font-bold mb-4" style={{ color: "var(--foreground)" }}>
          Reviews ({reviews.length})
        </h2>
        {reviews.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>No reviews yet.</p>
        ) : (
          <div className="space-y-3">
            {reviews.map((r) => (
              <Card key={r.id}>
                <CardContent className="p-4 flex gap-3">
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarFallback className="text-xs">{r.student_name.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>{r.student_name}</p>
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className="h-3.5 w-3.5"
                            style={{ fill: i < r.rating ? "#facc15" : "transparent", color: i < r.rating ? "#facc15" : "var(--border)" }}
                          />
                        ))}
                      </div>
                    </div>
                    {r.comment && <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>{r.comment}</p>}
                    <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>
                      {new Date(r.created_at).toLocaleDateString("en-IN")}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
