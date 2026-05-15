"use client";
import { motion } from "framer-motion";
import { UserPlus, ClipboardList, MessageCircle, TrendingUp } from "lucide-react";

const STEPS = [
  {
    step: "01",
    icon: <UserPlus className="h-6 w-6" />,
    title: "Register",
    description: "Students sign up with their college email and complete a brief profile.",
  },
  {
    step: "02",
    icon: <ClipboardList className="h-6 w-6" />,
    title: "Take Assessment",
    description: "Complete a 20-question stress assessment. Get an instant score and personalised report.",
  },
  {
    step: "03",
    icon: <MessageCircle className="h-6 w-6" />,
    title: "Get Support",
    description: "Chat with our AI companion 24/7 or book a session with a qualified counsellor.",
  },
  {
    step: "04",
    icon: <TrendingUp className="h-6 w-6" />,
    title: "Track Growth",
    description: "Monitor wellness over time. Admins see college-wide trends and take action early.",
  },
];

export function HowItWorks() {
  return (
    <section className="py-20 sm:py-28" style={{ background: "var(--background)" }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-sm font-semibold uppercase tracking-widest mb-3"
            style={{ color: "var(--primary)" }}
          >
            How It Works
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl sm:text-5xl font-bold"
            style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}
          >
            Simple. Supportive. Effective.
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative text-center"
            >
              {/* Connector line (not last) */}
              {i < STEPS.length - 1 && (
                <div
                  className="hidden lg:block absolute top-8 left-[calc(50%+2.5rem)] w-[calc(100%-5rem)] h-[1px]"
                  style={{ background: "var(--border)" }}
                />
              )}

              <div
                className="inline-flex h-16 w-16 items-center justify-center rounded-2xl mb-4 shadow-[var(--shadow-soft)]"
                style={{ background: "var(--gradient-primary)", color: "white" }}
              >
                {step.icon}
              </div>
              <div
                className="text-xs font-bold mb-1"
                style={{ color: "var(--primary)" }}
              >
                {step.step}
              </div>
              <h3
                className="text-lg font-semibold mb-2"
                style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}
              >
                {step.title}
              </h3>
              <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
