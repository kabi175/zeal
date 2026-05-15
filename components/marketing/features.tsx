"use client";
import { motion } from "framer-motion";
import {
  Brain, MessageCircle, BarChart3, FileText,
  Video, Shield, ClipboardList, Sparkles,
} from "lucide-react";

const FEATURES = [
  {
    icon: <ClipboardList className="h-6 w-6" />,
    title: "Stress Assessment",
    description:
      "20-question evidence-based stress assessment with instant scoring, interpretation, and personalised coping strategies.",
  },
  {
    icon: <Brain className="h-6 w-6" />,
    title: "AI Wellness Companion",
    description:
      "24/7 AI-powered chat companion offering breathing exercises, journaling prompts, and emotional support — always available.",
  },
  {
    icon: <Video className="h-6 w-6" />,
    title: "Realtime Counselling",
    description:
      "Book sessions with qualified counsellors. Secure video calls with end-to-end encryption and session notes.",
  },
  {
    icon: <BarChart3 className="h-6 w-6" />,
    title: "Analytics Dashboard",
    description:
      "Admins get college-wide insights: stress distribution, department heatmaps, and weekly engagement trends.",
  },
  {
    icon: <FileText className="h-6 w-6" />,
    title: "PDF Reports",
    description:
      "Professionally designed PDF reports with student details, scores, category badges, and intervention strategies.",
  },
  {
    icon: <MessageCircle className="h-6 w-6" />,
    title: "Expert Notes",
    description:
      "Counsellors maintain private session notes and track student progress with trend charts over time.",
  },
  {
    icon: <Shield className="h-6 w-6" />,
    title: "Privacy First",
    description:
      "Role-based access control, row-level security, and no cross-college data exposure — privacy by design.",
  },
  {
    icon: <Sparkles className="h-6 w-6" />,
    title: "Behavioural Insights",
    description:
      "Communication and teamwork scores alongside stress data give a holistic view of each student's wellness.",
  },
];

export function FeaturesSection() {
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
            Platform Features
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl sm:text-5xl font-bold"
            style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}
          >
            Everything your college needs
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-4 text-lg max-w-2xl mx-auto"
            style={{ color: "var(--muted-foreground)" }}
          >
            A complete wellness platform — from assessment to counselling to analytics.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="rounded-2xl p-6 card-hover"
              style={{
                background: "var(--card)",
                border: "1px solid var(--border)",
              }}
            >
              <div
                className="flex h-12 w-12 items-center justify-center rounded-xl mb-4"
                style={{ background: "oklch(0.55 0.22 264 / 0.1)", color: "var(--primary)" }}
              >
                {feature.icon}
              </div>
              <h3
                className="text-base font-semibold mb-2"
                style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}
              >
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
