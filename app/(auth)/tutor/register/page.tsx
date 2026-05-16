"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Loader2, CheckCircle, Brain, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";

const schema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
  gender: z.enum(["male", "female", "other", "prefer_not_to_say"]),
  qualifications: z.string().min(5, "Briefly describe your qualifications"),
  years_experience: z.coerce.number().min(0).max(50),
  hourly_rate: z.coerce.number().min(0),
  bio: z.string().optional(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type FormValues = z.infer<typeof schema>;

const COMMON_SUBJECTS = [
  "Mathematics", "Physics", "Chemistry", "Biology", "English",
  "Computer Science", "History", "Economics", "Accounts", "Commerce",
];

export default function TutorRegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [newSubject, setNewSubject] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const addSubject = (val: string) => {
    const trimmed = val.trim();
    if (trimmed && !subjects.includes(trimmed)) setSubjects((p) => [...p, trimmed]);
    setNewSubject("");
  };

  const onSubmit = async (data: FormValues) => {
    setServerError(null);
    if (subjects.length === 0) {
      setServerError("Please add at least one subject you teach.");
      return;
    }

    const supabase = createClient();

    // 1. Create auth user
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
    });

    if (signUpError || !authData.user) {
      setServerError(signUpError?.message ?? "Registration failed. Please try again.");
      return;
    }

    const userId = authData.user.id;

    // 2. Insert profile
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: profileError } = await supabase.from("profiles").insert({
      id: userId,
      full_name: data.full_name,
      email: data.email,
      phone: data.phone,
      gender: data.gender,
      bio: data.bio ?? null,
    } as any);

    if (profileError) {
      setServerError("Profile creation failed: " + profileError.message);
      return;
    }

    // 3. Assign expert role
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await supabase.from("user_roles").insert({ user_id: userId, role: "expert" } as any);

    // 4. Create experts row with tutor profile fields
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from("experts").insert({
      user_id: userId,
      qualifications: data.qualifications,
      years_experience: data.years_experience,
      hourly_rate: data.hourly_rate,
      subjects,
      languages: ["English"],
      is_active: true,
      is_public: false,
    });

    setSuccess(true);
    setTimeout(() => {
      router.push("/expert/dashboard");
      router.refresh();
    }, 1500);
  };

  const fieldError = (msg?: string) =>
    msg ? <p className="text-xs mt-1" style={{ color: "var(--destructive)" }}>{msg}</p> : null;

  if (success) {
    return (
      <div className="text-center py-12">
        <CheckCircle className="h-16 w-16 mx-auto mb-4" style={{ color: "oklch(0.55 0.18 145)" }} />
        <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>
          Tutor Account Created!
        </h2>
        <p style={{ color: "var(--muted-foreground)" }}>Redirecting to your dashboard…</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <div
          className="flex h-9 w-9 items-center justify-center rounded-xl"
          style={{ background: "var(--gradient-primary)" }}
        >
          <Brain className="h-5 w-5 text-white" />
        </div>
        <span className="text-lg font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>
          Zeal 2 Up
        </span>
      </div>

      <h1 className="text-3xl font-bold mb-1" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>
        Register as a Tutor
      </h1>
      <p className="text-sm mb-8" style={{ color: "var(--muted-foreground)" }}>
        Join Zeal Catalyst and connect with students who need your expertise.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

        {/* Name + Gender */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label>Full Name</Label>
            <Input {...register("full_name")} placeholder="Dr. Arjun Kumar" />
            {fieldError(errors.full_name?.message)}
          </div>
          <div className="space-y-1">
            <Label>Gender</Label>
            <select
              {...register("gender")}
              className="flex h-10 w-full rounded-lg border px-3 py-2 text-sm"
              style={{ borderColor: "var(--border)", color: "var(--foreground)", background: "var(--card)" }}
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
              <option value="prefer_not_to_say">Prefer not to say</option>
            </select>
            {fieldError(errors.gender?.message)}
          </div>
        </div>

        {/* Email + Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label>Email</Label>
            <Input {...register("email")} type="email" placeholder="tutor@example.com" />
            {fieldError(errors.email?.message)}
          </div>
          <div className="space-y-1">
            <Label>Mobile Number</Label>
            <Input {...register("phone")} placeholder="9876543210" />
            {fieldError(errors.phone?.message)}
          </div>
        </div>

        {/* Qualifications */}
        <div className="space-y-1">
          <Label>Qualifications</Label>
          <Textarea
            {...register("qualifications")}
            rows={2}
            placeholder="e.g. M.Sc Mathematics, 5 years teaching experience at IIT coaching centres"
          />
          {fieldError(errors.qualifications?.message)}
        </div>

        {/* Bio */}
        <div className="space-y-1">
          <Label>Bio <span style={{ color: "var(--muted-foreground)" }}>(optional)</span></Label>
          <Textarea
            {...register("bio")}
            rows={2}
            placeholder="Tell students about your teaching style and approach…"
          />
        </div>

        {/* Years experience + Hourly rate */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label>Years of Experience</Label>
            <Input {...register("years_experience")} type="number" min={0} placeholder="3" />
            {fieldError(errors.years_experience?.message)}
          </div>
          <div className="space-y-1">
            <Label>Hourly Rate (₹)</Label>
            <Input {...register("hourly_rate")} type="number" min={0} placeholder="500" />
            {fieldError(errors.hourly_rate?.message)}
          </div>
        </div>

        {/* Subjects */}
        <div className="space-y-2">
          <Label>Subjects You Teach</Label>
          {/* Quick pick chips */}
          <div className="flex flex-wrap gap-1.5">
            {COMMON_SUBJECTS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => addSubject(s)}
                className="rounded-full px-3 py-1 text-xs border transition-colors"
                style={{
                  background: subjects.includes(s) ? "oklch(0.55 0.22 264)" : "var(--muted)",
                  color: subjects.includes(s) ? "white" : "var(--muted-foreground)",
                  borderColor: subjects.includes(s) ? "oklch(0.55 0.22 264)" : "var(--border)",
                }}
              >
                {s}
              </button>
            ))}
          </div>
          {/* Selected tags */}
          {subjects.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-1">
              {subjects.map((s) => (
                <span
                  key={s}
                  className="flex items-center gap-1 rounded-full px-3 py-1 text-xs"
                  style={{ background: "oklch(0.55 0.22 264 / 0.15)", color: "var(--primary)" }}
                >
                  {s}
                  <button type="button" onClick={() => setSubjects((p) => p.filter((x) => x !== s))}>
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
          {/* Custom subject input */}
          <div className="flex gap-2 mt-1">
            <Input
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
              placeholder="Add a custom subject"
              className="text-sm"
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSubject(newSubject); } }}
            />
            <Button type="button" variant="outline" size="sm" onClick={() => addSubject(newSubject)}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Password */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label>Password</Label>
            <div className="relative">
              <Input
                {...register("password")}
                type={showPassword ? "text" : "password"}
                placeholder="Min 8 characters"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: "var(--muted-foreground)" }}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {fieldError(errors.password?.message)}
          </div>
          <div className="space-y-1">
            <Label>Confirm Password</Label>
            <Input {...register("confirmPassword")} type="password" placeholder="••••••••" />
            {fieldError(errors.confirmPassword?.message)}
          </div>
        </div>

        {serverError && (
          <div
            className="rounded-lg border px-4 py-3 text-sm"
            style={{
              borderColor: "var(--destructive)",
              background: "oklch(0.55 0.22 20 / 0.08)",
              color: "var(--destructive)",
            }}
          >
            {serverError}
          </div>
        )}

        <Button type="submit" variant="gradient" size="lg" className="w-full" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          Create Tutor Account
        </Button>
      </form>

      <div className="mt-6 text-center space-y-2 text-sm" style={{ color: "var(--muted-foreground)" }}>
        <p>
          Already have an account?{" "}
          <Link href="/login" className="font-medium hover:underline" style={{ color: "var(--primary)" }}>
            Sign in
          </Link>
        </p>
        <p>
          Registering as a student?{" "}
          <Link href="/register" className="font-medium hover:underline" style={{ color: "var(--primary)" }}>
            Student registration
          </Link>
        </p>
      </div>
    </div>
  );
}
