"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Brain, Shield, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const HEADLINE_WORDS = ["Understand", "Heal", "Grow"];

export function HeroSection() {
  return (
    <section
      className="relative overflow-hidden py-20 sm:py-28 lg:py-36 mesh-bg"
      style={{ background: "var(--background)" }}
    >
      {/* Glowing orbs */}
      <div
        className="pointer-events-none absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full opacity-20 blur-3xl"
        style={{ background: "var(--gradient-primary)" }}
      />
      <div
        className="pointer-events-none absolute -bottom-40 -left-40 h-[400px] w-[400px] rounded-full opacity-15 blur-3xl"
        style={{ background: "var(--accent)" }}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium mb-6"
          style={{
            borderColor: "var(--primary)",
            background: "oklch(0.55 0.22 264 / 0.08)",
            color: "var(--primary)",
          }}
        >
          <Sparkles className="h-3.5 w-3.5" />
          AI-Powered Student Wellness
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6"
          style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}
        >
          Help Students{" "}
          <span className="gradient-text">
            {HEADLINE_WORDS.map((word, i) => (
              <motion.span
                key={word}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.15 }}
                className="inline-block mr-3"
              >
                {word}
                {i < HEADLINE_WORDS.length - 1 ? "," : ""}
              </motion.span>
            ))}
          </span>
          <br />
          <span style={{ color: "var(--foreground)" }}>& Thrive</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mx-auto max-w-2xl text-lg sm:text-xl mb-10"
          style={{ color: "var(--muted-foreground)" }}
        >
          Zeal 2 Up brings AI-powered psychological assessments, real-time counselling, and
          behavioural insights to colleges and universities — making student wellness proactive,
          accessible, and data-driven.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button variant="gradient" size="xl" asChild>
            <Link href="/register">
              Get Started Free
              <ArrowRight className="h-5 w-5" />
            </Link>
          </Button>
          <Button variant="outline" size="xl" asChild>
            <Link href="/about">Learn More</Link>
          </Button>
        </motion.div>

        {/* Trust signals */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-14 flex flex-wrap justify-center gap-8"
        >
          {[
            { icon: <Brain className="h-5 w-5" />, label: "AI-Powered Assessments" },
            { icon: <Shield className="h-5 w-5" />, label: "HIPAA-Grade Privacy" },
            { icon: <Sparkles className="h-5 w-5" />, label: "Real-Time Counselling" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2 text-sm font-medium" style={{ color: "var(--muted-foreground)" }}>
              <span style={{ color: "var(--primary)" }}>{item.icon}</span>
              {item.label}
            </div>
          ))}
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-3xl mx-auto"
        >
          {[
            { value: "50+", label: "Colleges" },
            { value: "10k+", label: "Students Helped" },
            { value: "95%", label: "Satisfaction Rate" },
            { value: "24/7", label: "AI Support" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border p-4 text-center"
              style={{ borderColor: "var(--border)", background: "var(--card)" }}
            >
              <div
                className="text-2xl font-bold gradient-text"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {stat.value}
              </div>
              <div className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
