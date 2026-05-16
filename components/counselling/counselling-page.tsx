"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, addDays, startOfWeek, isSameDay } from "date-fns";
import { Calendar, Video, MessageCircle, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createClient } from "@/lib/supabase/client";
import type { AuthUser, Session } from "@/types/app";
import { RealtimeChat } from "./realtime-chat";

const TIME_SLOTS = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00"];

interface CounsellingPageProps {
  user: AuthUser;
  preselectedExpertId?: string;
}

export function CounsellingPage({ user, preselectedExpertId }: CounsellingPageProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [bookingOpen, setBookingOpen] = useState(!!preselectedExpertId);
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [booking, setBooking] = useState(false);

  const supabase = createClient();

  const { data: sessions = [], refetch } = useQuery({
    queryKey: ["mySessions", user.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("sessions")
        .select("*")
        .eq("student_id", user.id)
        .order("scheduled_at", { ascending: false });
      return (data as Session[]) ?? [];
    },
  });

  const { data: experts = [] } = useQuery({
    queryKey: ["experts"],
    queryFn: async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sb = supabase as any;
      const { data: expertRows } = await sb
        .from("experts")
        .select("*")
        .eq("is_active", true)
        .limit(10);
      if (!expertRows?.length) return [];
      const userIds = expertRows.map((e: any) => e.user_id);
      const { data: profiles } = await sb
        .from("profiles")
        .select("id, full_name, email")
        .in("id", userIds);
      const profileMap: Record<string, any> = {};
      (profiles ?? []).forEach((p: any) => { profileMap[p.id] = p; });
      return expertRows.map((e: any) => ({ ...e, profiles: profileMap[e.user_id] ?? null }));
    },
  });

  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const handleBook = async () => {
    if (!selectedDate || !selectedTime || experts.length === 0) return;
    setBooking(true);

    const [h, m] = selectedTime.split(":").map(Number);
    const scheduledAt = new Date(selectedDate);
    scheduledAt.setHours(h, m, 0, 0);

    // Use preselected expert if available, otherwise first active expert
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const expert = (preselectedExpertId ? experts.find((e: any) => e.user_id === preselectedExpertId) : null) ?? experts[0];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: insertError } = await supabase.from("sessions").insert({
      student_id: user.id,
      expert_id: expert.user_id,
      scheduled_at: scheduledAt.toISOString(),
      status: "scheduled",
    } as any);
    if (insertError) console.error("SESSION INSERT ERROR:", insertError);

    setBooking(false);
    setBookingOpen(false);
    setSelectedDate(null);
    setSelectedTime(null);
    refetch();
  };

  if (activeSession) {
    return (
      <div className="space-y-4">
        <Button variant="outline" size="sm" onClick={() => setActiveSession(null)}>
          ← Back to Sessions
        </Button>
        <RealtimeChat session={activeSession} userId={user.id} userRole="student" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1
          className="text-2xl font-bold"
          style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}
        >
          Counselling
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
          Book sessions and connect with your counsellor
        </p>
      </div>

      <Button variant="gradient" onClick={() => setBookingOpen(true)}>
        <Calendar className="h-4 w-4" />
        Book a Session
      </Button>

      {/* Sessions list */}
      <Tabs defaultValue="upcoming">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming">
          <div className="space-y-3 mt-4">
            {sessions.filter((s) => new Date(s.scheduled_at) >= new Date() && s.status === "scheduled").length === 0 ? (
              <Card>
                <CardContent className="pt-10 pb-10 text-center">
                  <Calendar className="h-10 w-10 mx-auto mb-3" style={{ color: "var(--muted-foreground)" }} />
                  <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>No upcoming sessions</p>
                </CardContent>
              </Card>
            ) : (
              sessions
                .filter((s) => new Date(s.scheduled_at) >= new Date() && s.status === "scheduled")
                .map((session) => (
                  <SessionCard
                    key={session.id}
                    session={session}
                    onJoin={() => setActiveSession(session)}
                  />
                ))
            )}
          </div>
        </TabsContent>
        <TabsContent value="past">
          <div className="space-y-3 mt-4">
            {sessions
              .filter((s) => new Date(s.scheduled_at) < new Date() || s.status === "completed")
              .map((session) => (
                <SessionCard
                  key={session.id}
                  session={session}
                  onJoin={() => setActiveSession(session)}
                />
              ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Booking dialog */}
      <Dialog open={bookingOpen} onOpenChange={setBookingOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Book a Counselling Session</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Calendar */}
            <div>
              <p className="text-sm font-medium mb-2" style={{ color: "var(--foreground)" }}>
                Select a day
              </p>
              <div className="grid grid-cols-7 gap-1">
                {weekDays.map((day) => {
                  const past = day < new Date();
                  const selected = selectedDate && isSameDay(day, selectedDate);
                  return (
                    <button
                      key={day.toISOString()}
                      disabled={past}
                      onClick={() => setSelectedDate(day)}
                      className="flex flex-col items-center rounded-lg p-2 text-xs transition-colors disabled:opacity-40"
                      style={{
                        background: selected ? "var(--primary)" : "var(--muted)",
                        color: selected ? "white" : "var(--foreground)",
                      }}
                    >
                      <span className="font-medium">{format(day, "EEE")}</span>
                      <span>{format(day, "d")}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time slots */}
            {selectedDate && (
              <div>
                <p className="text-sm font-medium mb-2" style={{ color: "var(--foreground)" }}>
                  Select a time
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {TIME_SLOTS.map((t) => (
                    <button
                      key={t}
                      onClick={() => setSelectedTime(t)}
                      className="rounded-lg p-2 text-sm transition-colors"
                      style={{
                        background: selectedTime === t ? "var(--primary)" : "var(--muted)",
                        color: selectedTime === t ? "white" : "var(--foreground)",
                      }}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setBookingOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="gradient"
              onClick={handleBook}
              disabled={!selectedDate || !selectedTime || booking}
            >
              {booking ? "Booking…" : "Confirm Booking"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SessionCard({ session, onJoin }: { session: Session; onJoin: () => void }) {
  const isPast = new Date(session.scheduled_at) < new Date();
  return (
    <Card>
      <CardContent className="pt-4 pb-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{ background: "oklch(0.55 0.22 264 / 0.1)", color: "var(--primary)" }}
          >
            <Video className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
              {session.title ?? "Counselling Session"}
            </p>
            <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
              <Clock className="h-3 w-3 inline mr-1" />
              {format(new Date(session.scheduled_at), "EEE, MMM d · h:mm a")}{(session as any).duration_minutes ? ` · ${(session as any).duration_minutes}min` : ""}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={session.status === "completed" ? "secondary" : "default"}>
            {session.status}
          </Badge>
          {!isPast && session.status === "scheduled" && (
            <Button variant="gradient" size="sm" onClick={onJoin}>
              <MessageCircle className="h-4 w-4" /> Join
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
