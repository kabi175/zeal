"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

const registerSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  college: z.string().min(2, "College name is required"),
  department: z.string().min(2, "Department is required"),
  year_of_study: z.coerce.number().min(1).max(6),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
  gender: z.enum(["male", "female", "other", "prefer_not_to_say"]),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (data: RegisterForm) => {
    setServerError(null);
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

    // 2. Get or create college
    let collegeId: string | null = null;
    const { data: existingCollege } = await supabase
      .from("colleges")
      .select("id")
      .ilike("name", data.college)
      .returns<{ id: string }[]>()
      .single();

    if (existingCollege) {
      collegeId = (existingCollege as { id: string }).id;
    } else {
      const { data: newCollege } = await supabase
        .from("colleges")
        .insert({ name: data.college })
        .select("id")
        .returns<{ id: string }[]>()
        .single();
      collegeId = (newCollege as { id: string } | null)?.id ?? null;
    }

    // 3. Insert profile
    const { error: profileError } = await supabase.from("profiles").insert({
      id: userId,
      full_name: data.full_name,
      email: data.email,
      phone: data.phone,
      gender: data.gender,
      college_id: collegeId,
      department: data.department,
      year_of_study: data.year_of_study,
    });

    if (profileError) {
      setServerError("Profile creation failed: " + profileError.message);
      return;
    }

    // 4. Assign student role
    await supabase.from("user_roles").insert({
      user_id: userId,
      role: "student",
    });

    setSuccess(true);
    setTimeout(() => {
      router.push("/dashboard");
      router.refresh();
    }, 1500);
  };

  if (success) {
    return (
      <div className="text-center py-12">
        <CheckCircle
          className="h-16 w-16 mx-auto mb-4"
          style={{ color: "oklch(0.55 0.18 145)" }}
        />
        <h2
          className="text-2xl font-bold mb-2"
          style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}
        >
          Account Created!
        </h2>
        <p style={{ color: "var(--muted-foreground)" }}>
          Redirecting to your dashboard...
        </p>
      </div>
    );
  }

  const fieldError = (msg?: string) =>
    msg ? <p className="text-xs" style={{ color: "var(--destructive)" }}>{msg}</p> : null;

  return (
    <div>
      <h1
        className="text-3xl font-bold mb-2"
        style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}
      >
        Create your account
      </h1>
      <p className="text-sm mb-8" style={{ color: "var(--muted-foreground)" }}>
        Start your wellness journey today — it&apos;s free for students.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Row 1 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name</Label>
            <Input id="full_name" placeholder="Priya Sharma" {...register("full_name")} />
            {fieldError(errors.full_name?.message)}
          </div>
          <div className="space-y-2">
            <Label htmlFor="gender">Gender</Label>
            <select
              id="gender"
              {...register("gender")}
              className="flex h-10 w-full rounded-lg border bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
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

        {/* College + Department */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="college">College</Label>
            <Input id="college" placeholder="SRM Institute of Technology" {...register("college")} />
            {fieldError(errors.college?.message)}
          </div>
          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            <Input id="department" placeholder="Computer Science" {...register("department")} />
            {fieldError(errors.department?.message)}
          </div>
        </div>

        {/* Year + Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="year_of_study">Year of Study</Label>
            <select
              id="year_of_study"
              {...register("year_of_study")}
              className="flex h-10 w-full rounded-lg border bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
              style={{ borderColor: "var(--border)", color: "var(--foreground)", background: "var(--card)" }}
            >
              <option value="">Select year</option>
              {[1, 2, 3, 4, 5, 6].map((y) => (
                <option key={y} value={y}>Year {y}</option>
              ))}
            </select>
            {fieldError(errors.year_of_study?.message)}
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Mobile Number</Label>
            <Input id="phone" placeholder="9876543210" {...register("phone")} />
            {fieldError(errors.phone?.message)}
          </div>
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="priya@college.edu" {...register("email")} />
          {fieldError(errors.email?.message)}
        </div>

        {/* Password */}
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Min 8 characters"
              {...register("password")}
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

        {/* Confirm Password */}
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="••••••••"
            {...register("confirmPassword")}
          />
          {fieldError(errors.confirmPassword?.message)}
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
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          Create Account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm" style={{ color: "var(--muted-foreground)" }}>
        Already have an account?{" "}
        <Link href="/login" className="font-medium hover:underline" style={{ color: "var(--primary)" }}>
          Sign in
        </Link>
      </p>
    </div>
  );
}
