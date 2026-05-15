"use client";
import { motion } from "framer-motion";
import { Quote } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const TESTIMONIALS = [
  {
    quote:
      "The stress assessment really helped me understand what I was going through. The AI companion was there when I needed to talk at 2am before my exams.",
    name: "Priya S.",
    role: "B.Tech Final Year, Chennai",
    initials: "PS",
  },
  {
    quote:
      "As a counsellor, I can now see my assigned students' stress trends at a glance. The session notes and report viewer save me so much time.",
    name: "Dr. Ramesh K.",
    role: "College Counsellor, Coimbatore",
    initials: "RK",
  },
  {
    quote:
      "Our college deployed Zeal 2 Up college-wide. The admin dashboard showed us that engineering students had the highest stress — we acted immediately.",
    name: "Prof. Anita M.",
    role: "Student Welfare Officer, Pune",
    initials: "AM",
  },
  {
    quote:
      "I booked my first counselling session through the platform in under two minutes. The video call was crystal clear and my counsellor was amazing.",
    name: "Arjun T.",
    role: "MBA Year 1, Bangalore",
    initials: "AT",
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-20 sm:py-28" style={{ background: "var(--muted)" }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-sm font-semibold uppercase tracking-widest mb-3"
            style={{ color: "var(--primary)" }}
          >
            Testimonials
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl sm:text-5xl font-bold"
            style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}
          >
            Trusted by students & educators
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="rounded-2xl p-6 card-hover"
              style={{ background: "var(--card)", border: "1px solid var(--border)" }}
            >
              <Quote
                className="h-8 w-8 mb-4"
                style={{ color: "var(--primary)", opacity: 0.5 }}
              />
              <p className="text-sm leading-relaxed mb-6" style={{ color: "var(--foreground)" }}>
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback>{t.initials}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                    {t.name}
                  </p>
                  <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                    {t.role}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
