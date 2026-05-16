"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Brain, LogOut, Menu, Moon, Sun, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTheme } from "@/components/theme-provider";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types/app";

interface NavbarProps {
  profile?: Profile | null;
  role?: string | null;
}

export function Navbar({ profile, role }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const navLinks = profile
    ? []
    : [
        { href: "/", label: "Home" },
        { href: "/about", label: "About" },
        { href: "/tutors", label: "Find Tutors" },
        { href: "/contact", label: "Contact" },
      ];

  return (
    <header
      className="sticky top-0 z-50 w-full glass border-b"
      style={{ borderColor: "var(--border)" }}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href={profile ? "/dashboard" : "/"} className="flex items-center gap-2">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-xl"
            style={{ background: "var(--gradient-primary)" }}
          >
            <Brain className="h-5 w-5 text-white" />
          </div>
          <span
            className="text-lg font-bold leading-none"
            style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}
          >
            Zeal 2 Up
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm font-medium transition-colors hover:text-[var(--primary)]"
              style={{ color: "var(--muted-foreground)" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          {profile ? (
            <div className="flex items-center gap-3">
              <div className="hidden md:flex flex-col items-end">
                <span className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
                  {profile.full_name}
                </span>
                <span className="text-xs capitalize" style={{ color: "var(--muted-foreground)" }}>
                  {role}
                </span>
              </div>
              <Avatar className="h-8 w-8">
                <AvatarImage src={profile.avatar_url ?? undefined} />
                <AvatarFallback>
                  {profile.full_name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <Button variant="ghost" size="icon" onClick={handleSignOut} aria-label="Sign out">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="hidden md:flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href="/tutor/register">Become a Tutor</Link>
              </Button>
              <Button variant="gradient" size="sm" asChild>
                <Link href="/register">Get Started</Link>
              </Button>
            </div>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          className="md:hidden border-t px-4 py-4 space-y-3"
          style={{ borderColor: "var(--border)", background: "var(--card)" }}
        >
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="block text-sm font-medium py-2"
              style={{ color: "var(--foreground)" }}
              onClick={() => setMenuOpen(false)}
            >
              {l.label}
            </Link>
          ))}
          {!profile && (
            <div className="flex flex-col gap-2 pt-2">
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild className="flex-1">
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button variant="gradient" size="sm" asChild className="flex-1">
                  <Link href="/register">Get Started</Link>
                </Button>
              </div>
              <Button variant="outline" size="sm" asChild className="w-full">
                <Link href="/tutor/register">Become a Tutor</Link>
              </Button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
