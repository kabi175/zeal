"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Brain, LayoutDashboard, ClipboardList, MessageCircle,
  Video, Users, FileText, BarChart3, BookOpen, UserCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Navbar } from "./navbar";
import { Footer } from "./footer";
import type { Profile } from "@/types/app";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const STUDENT_NAV: NavItem[] = [
  { href: "/dashboard",   label: "Dashboard",   icon: <LayoutDashboard className="h-4 w-4" /> },
  { href: "/assessment",  label: "Assessment",  icon: <ClipboardList className="h-4 w-4" /> },
  { href: "/courses",     label: "Courses",     icon: <BookOpen className="h-4 w-4" /> },
  { href: "/counselling", label: "Counselling", icon: <Video className="h-4 w-4" /> },
  { href: "/chat",        label: "AI Companion",icon: <MessageCircle className="h-4 w-4" /> },
];

const EXPERT_NAV: NavItem[] = [
  { href: "/expert/dashboard", label: "Dashboard",  icon: <LayoutDashboard className="h-4 w-4" /> },
  { href: "/expert/profile",   label: "My Profile", icon: <UserCircle className="h-4 w-4" /> },
];

const ADMIN_NAV: NavItem[] = [
  { href: "/admin/dashboard", label: "Analytics",  icon: <BarChart3 className="h-4 w-4" /> },
  { href: "/admin/students",  label: "Students",   icon: <Users className="h-4 w-4" /> },
  { href: "/admin/experts",   label: "Experts",    icon: <Brain className="h-4 w-4" /> },
  { href: "/admin/reports",   label: "Reports",    icon: <FileText className="h-4 w-4" /> },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
  profile?: Profile | null;
  role?: string | null;
}

export function DashboardLayout({ children, profile, role }: DashboardLayoutProps) {
  const pathname = usePathname();
  const navItems =
    role === "expert" ? EXPERT_NAV : role === "admin" ? ADMIN_NAV : STUDENT_NAV;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--background)" }}>
      <Navbar profile={profile} role={role} />
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside
          className="hidden md:flex flex-col w-56 shrink-0 border-r pt-6 pb-4 px-3"
          style={{ borderColor: "var(--border)", background: "var(--card)" }}
        >
          <nav className="space-y-1">
            {navItems.map((item) => {
              const active = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                    active
                      ? "text-white shadow-[var(--shadow-soft)]"
                      : "hover:bg-[var(--muted)]"
                  )}
                  style={
                    active
                      ? { background: "var(--gradient-primary)", color: "white" }
                      : { color: "var(--muted-foreground)" }
                  }
                >
                  {item.icon}
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto pt-4 border-t" style={{ borderColor: "var(--border)" }}>
            <div className="text-xs px-3" style={{ color: "var(--muted-foreground)" }}>
              <p>Support</p>
              <a
                href="mailto:zealcatalyst.zeca@gmail.com"
                className="hover:text-[var(--primary)] transition-colors"
              >
                zealcatalyst.zeca@gmail.com
              </a>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
