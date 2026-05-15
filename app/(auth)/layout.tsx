import type { Metadata } from "next";
import Link from "next/link";
import { Brain } from "lucide-react";

export const metadata: Metadata = {
  title: "Sign In | Zeal 2 Up",
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen flex"
      style={{ background: "var(--background)" }}
    >
      {/* Left panel — hidden on mobile */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12"
        style={{ background: "var(--gradient-primary)" }}
      >
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
            <Brain className="h-6 w-6 text-white" />
          </div>
          <span className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>
            Zeal 2 Up
          </span>
        </Link>
        <div>
          <blockquote className="text-white/90 text-2xl font-medium leading-relaxed" style={{ fontFamily: "var(--font-display)" }}>
            "Your mental wellness journey starts here. Every step forward is a step toward a healthier, happier you."
          </blockquote>
          <div className="mt-6 text-white/70 text-sm">
            <p>Trusted by 50+ colleges across India</p>
            <p className="mt-1">zealcatalyst.zeca@gmail.com · +91 97902 05149</p>
          </div>
        </div>
        <div className="text-white/50 text-xs">
          © {new Date().getFullYear()} Zeal 2 Up. All rights reserved.
        </div>
      </div>

      {/* Right panel */}
      <div className="flex flex-1 flex-col justify-center items-center px-6 py-12">
        <div className="w-full max-w-md">
          <Link href="/" className="flex lg:hidden items-center gap-2 mb-8">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-xl"
              style={{ background: "var(--gradient-primary)" }}
            >
              <Brain className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>
              Zeal 2 Up
            </span>
          </Link>
          {children}
        </div>
      </div>
    </div>
  );
}
