import type { Metadata } from "next";
import { Heart, Target, Users, Brain } from "lucide-react";

export const metadata: Metadata = {
  title: "About | Zeal 2 Up",
  description: "Our mission: make student mental wellness proactive, accessible, and data-driven for every college in India.",
};

export default function AboutPage() {
  return (
    <div style={{ background: "var(--background)" }}>
      {/* Hero */}
      <section className="py-20 sm:py-28 text-center px-4" style={{ background: "var(--gradient-hero)" }}>
        <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--primary)" }}>
          About Zeal 2 Up
        </p>
        <h1
          className="text-5xl sm:text-6xl font-bold mb-6"
          style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}
        >
          Built for student <span className="gradient-text">wellbeing</span>
        </h1>
        <p className="mx-auto max-w-2xl text-lg" style={{ color: "var(--muted-foreground)" }}>
          Zeal 2 Up was created by educators, counsellors, and technologists who believe every student
          deserves access to mental wellness support — regardless of college size or budget.
        </p>
      </section>

      {/* Mission + Vision */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {[
            {
              icon: <Target className="h-6 w-6" />,
              title: "Our Mission",
              body:
                "To make psychological assessment and counselling proactive, accessible, and stigma-free for every college student in India. We believe data-driven wellness is the future of student support.",
            },
            {
              icon: <Brain className="h-6 w-6" />,
              title: "Our Vision",
              body:
                "A world where no student silently struggles alone. Where colleges have the tools to identify stress early, connect students to the right support, and measure the impact of their wellness programmes.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-2xl p-8"
              style={{ background: "var(--card)", border: "1px solid var(--border)" }}
            >
              <div
                className="flex h-12 w-12 items-center justify-center rounded-xl mb-4"
                style={{ background: "oklch(0.55 0.22 264 / 0.1)", color: "var(--primary)" }}
              >
                {item.icon}
              </div>
              <h2
                className="text-xl font-bold mb-3"
                style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}
              >
                {item.title}
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Why student mental wellness matters */}
      <section className="py-20" style={{ background: "var(--muted)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2
              className="text-4xl font-bold"
              style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}
            >
              Why student mental wellness matters
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              { stat: "1 in 3", label: "Indian college students experiences significant stress", icon: <Heart className="h-6 w-6" /> },
              { stat: "71%", label: "Students never seek help due to stigma and lack of access", icon: <Users className="h-6 w-6" /> },
              { stat: "3x", label: "More likely to drop out when mental health goes unaddressed", icon: <Brain className="h-6 w-6" /> },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-2xl p-8 text-center"
                style={{ background: "var(--card)", border: "1px solid var(--border)" }}
              >
                <div
                  className="inline-flex h-12 w-12 items-center justify-center rounded-xl mb-4"
                  style={{ background: "oklch(0.55 0.22 264 / 0.1)", color: "var(--primary)" }}
                >
                  {item.icon}
                </div>
                <div
                  className="text-4xl font-bold mb-2 gradient-text"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {item.stat}
                </div>
                <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
