import Link from "next/link";
import { Brain, Mail, Phone } from "lucide-react";

export function Footer() {
  return (
    <footer
      className="border-t"
      style={{ borderColor: "var(--border)", background: "var(--card)" }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-xl"
                style={{ background: "var(--gradient-primary)" }}
              >
                <Brain className="h-5 w-5 text-white" />
              </div>
              <span
                className="text-lg font-bold"
                style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}
              >
                Zeal 2 Up
              </span>
            </div>
            <p className="text-sm max-w-sm" style={{ color: "var(--muted-foreground)" }}>
              AI-powered student counselling, psychological assessment, and behavioural evaluation
              for colleges and universities across India.
            </p>
            <div className="mt-4 space-y-2">
              <a
                href="mailto:zealcatalyst.zeca@gmail.com"
                className="flex items-center gap-2 text-sm hover:text-[var(--primary)] transition-colors"
                style={{ color: "var(--muted-foreground)" }}
              >
                <Mail className="h-4 w-4" />
                zealcatalyst.zeca@gmail.com
              </a>
              <a
                href="tel:+919790205149"
                className="flex items-center gap-2 text-sm hover:text-[var(--primary)] transition-colors"
                style={{ color: "var(--muted-foreground)" }}
              >
                <Phone className="h-4 w-4" />
                +91 97902 05149
              </a>
            </div>
          </div>

          {/* Platform */}
          <div>
            <h3
              className="text-sm font-semibold mb-4"
              style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}
            >
              Platform
            </h3>
            <ul className="space-y-2">
              {[
                { href: "/", label: "Home" },
                { href: "/about", label: "About" },
                { href: "/contact", label: "Contact" },
                { href: "/login", label: "Sign In" },
                { href: "/register", label: "Get Started" },
              ].map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm hover:text-[var(--primary)] transition-colors"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3
              className="text-sm font-semibold mb-4"
              style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}
            >
              Support
            </h3>
            <ul className="space-y-2">
              {[
                { href: "/contact", label: "Help Center" },
                { href: "/about", label: "Our Mission" },
                { href: "/contact", label: "Book a Demo" },
              ].map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="text-sm hover:text-[var(--primary)] transition-colors"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div
          className="mt-12 border-t pt-8 flex flex-col sm:flex-row justify-between items-center gap-4"
          style={{ borderColor: "var(--border)" }}
        >
          <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
            © {new Date().getFullYear()} Zeal 2 Up. All rights reserved.
          </p>
          <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
            Empowering student wellness across India 🇮🇳
          </p>
        </div>
      </div>
    </footer>
  );
}
