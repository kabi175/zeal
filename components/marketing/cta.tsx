"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CtaSection() {
  return (
    <section className="py-20 sm:py-28" style={{ background: "var(--background)" }}>
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-3xl p-10 sm:p-14"
          style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-glow)" }}
        >
          <h2
            className="text-4xl sm:text-5xl font-bold text-white mb-4"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Ready to support your students?
          </h2>
          <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
            Join 50+ colleges already using Zeal 2 Up to build healthier, more resilient student
            communities.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="xl"
              asChild
              className="bg-white hover:bg-white/90"
              style={{ color: "var(--primary)" }}
            >
              <Link href="/register">
                Get Started Free
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="xl"
              variant="outline"
              asChild
              className="border-white/30 text-white hover:bg-white/10"
            >
              <Link href="/contact">Contact Us</Link>
            </Button>
          </div>
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-6 text-white/70 text-sm">
            <a href="mailto:zealcatalyst.zeca@gmail.com" className="flex items-center gap-2 hover:text-white transition-colors">
              <Mail className="h-4 w-4" /> zealcatalyst.zeca@gmail.com
            </a>
            <a href="tel:+919790205149" className="flex items-center gap-2 hover:text-white transition-colors">
              <Phone className="h-4 w-4" /> +91 97902 05149
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
