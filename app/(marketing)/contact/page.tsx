"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, Phone, MessageSquare, ChevronDown, ChevronUp, Loader2, CheckCircle } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const contactSchema = z.object({
  name: z.string().min(2, "Name required"),
  email: z.string().email("Valid email required"),
  college: z.string().min(2, "College name required"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});
type ContactForm = z.infer<typeof contactSchema>;

const FAQS = [
  {
    q: "Is Zeal 2 Up free for students?",
    a: "Yes, Zeal 2 Up is completely free for students. Colleges subscribe to the platform on behalf of their students.",
  },
  {
    q: "How is student data protected?",
    a: "All data is encrypted at rest and in transit. We use row-level security so students only ever see their own data. Counsellors only see students assigned to them. Admins only see students within their college.",
  },
  {
    q: "Can we integrate Zeal 2 Up with our existing systems?",
    a: "Yes, we provide webhooks and an API for integration with college ERPs and student information systems. Contact us for custom integration support.",
  },
  {
    q: "How long does the stress assessment take?",
    a: "The 20-question assessment typically takes 5–8 minutes to complete. Results and recommendations are instant.",
  },
  {
    q: "Can students access the platform from mobile?",
    a: "Absolutely. Zeal 2 Up is fully responsive and works beautifully on all devices — phones, tablets, and desktops.",
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{ borderColor: "var(--border)" }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-center p-4 text-left transition-colors hover:bg-[var(--muted)]"
        style={{ color: "var(--foreground)" }}
      >
        <span className="font-medium text-sm">{q}</span>
        {open ? <ChevronUp className="h-4 w-4 shrink-0" /> : <ChevronDown className="h-4 w-4 shrink-0" />}
      </button>
      {open && (
        <div className="px-4 pb-4 text-sm" style={{ color: "var(--muted-foreground)" }}>
          {a}
        </div>
      )}
    </div>
  );
}

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ContactForm>({ resolver: zodResolver(contactSchema) });

  const onSubmit = async (_data: ContactForm) => {
    // In production: send to API route or email service
    await new Promise((r) => setTimeout(r, 1000));
    setSubmitted(true);
    reset();
  };

  return (
    <div style={{ background: "var(--background)" }}>
      {/* Hero */}
      <section className="py-20 text-center px-4" style={{ background: "var(--gradient-hero)" }}>
        <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--primary)" }}>
          Get In Touch
        </p>
        <h1
          className="text-5xl font-bold mb-4"
          style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}
        >
          We&apos;d love to hear from you
        </h1>
        <p className="text-lg max-w-xl mx-auto" style={{ color: "var(--muted-foreground)" }}>
          Have questions about deploying Zeal 2 Up at your college? Want to book a demo? We&apos;re here to help.
        </p>
      </section>

      {/* Content */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div>
            <h2
              className="text-2xl font-bold mb-6"
              style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}
            >
              Contact Information
            </h2>
            {[
              {
                icon: <Mail className="h-5 w-5" />,
                label: "Email",
                value: "zealcatalyst.zeca@gmail.com",
                href: "mailto:zealcatalyst.zeca@gmail.com",
              },
              {
                icon: <Phone className="h-5 w-5" />,
                label: "Phone",
                value: "+91 97902 05149",
                href: "tel:+919790205149",
              },
              {
                icon: <MessageSquare className="h-5 w-5" />,
                label: "Response Time",
                value: "We reply within 24 hours on business days.",
                href: null,
              },
            ].map((item) => (
              <div key={item.label} className="flex gap-4 mb-6">
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                  style={{ background: "oklch(0.55 0.22 264 / 0.1)", color: "var(--primary)" }}
                >
                  {item.icon}
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest mb-0.5" style={{ color: "var(--muted-foreground)" }}>
                    {item.label}
                  </p>
                  {item.href ? (
                    <a href={item.href} className="text-sm font-medium hover:text-[var(--primary)] transition-colors" style={{ color: "var(--foreground)" }}>
                      {item.value}
                    </a>
                  ) : (
                    <p className="text-sm" style={{ color: "var(--foreground)" }}>{item.value}</p>
                  )}
                </div>
              </div>
            ))}

            {/* FAQ */}
            <h2
              className="text-2xl font-bold mb-6 mt-12"
              style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}
            >
              Frequently Asked Questions
            </h2>
            <div className="space-y-3">
              {FAQS.map((faq) => (
                <FaqItem key={faq.q} q={faq.q} a={faq.a} />
              ))}
            </div>
          </div>

          {/* Form */}
          <div
            className="rounded-2xl p-8"
            style={{ background: "var(--card)", border: "1px solid var(--border)" }}
          >
            <h2
              className="text-2xl font-bold mb-6"
              style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}
            >
              Send us a message
            </h2>

            {submitted ? (
              <div className="text-center py-12">
                <CheckCircle className="h-14 w-14 mx-auto mb-4" style={{ color: "oklch(0.55 0.18 145)" }} />
                <h3 className="text-xl font-semibold mb-2" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>
                  Message Sent!
                </h3>
                <p style={{ color: "var(--muted-foreground)" }}>
                  We&apos;ll get back to you within 24 hours.
                </p>
                <Button variant="outline" className="mt-6" onClick={() => setSubmitted(false)}>
                  Send Another
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Your Name</Label>
                    <Input id="name" placeholder="Priya Sharma" {...register("name")} />
                    {errors.name && <p className="text-xs" style={{ color: "var(--destructive)" }}>{errors.name.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="you@college.edu" {...register("email")} />
                    {errors.email && <p className="text-xs" style={{ color: "var(--destructive)" }}>{errors.email.message}</p>}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="college">College / Institution</Label>
                  <Input id="college" placeholder="SRM Institute of Technology" {...register("college")} />
                  {errors.college && <p className="text-xs" style={{ color: "var(--destructive)" }}>{errors.college.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea id="message" placeholder="Tell us about your college and how we can help..." rows={5} {...register("message")} />
                  {errors.message && <p className="text-xs" style={{ color: "var(--destructive)" }}>{errors.message.message}</p>}
                </div>
                <Button type="submit" variant="gradient" size="lg" className="w-full" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  Send Message
                </Button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
