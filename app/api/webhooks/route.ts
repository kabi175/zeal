import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const webhookSecret = process.env.WEBHOOK_SECRET;

  if (webhookSecret && authHeader !== `Bearer ${webhookSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { event, payload } = body as { event: string; payload: Record<string, unknown> };

    const supabase = await createServiceClient();

    if (event === "user.created") {
      const { userId, email, fullName, college, department, yearOfStudy, phone, gender } =
        payload as {
          userId: string;
          email: string;
          fullName: string;
          college: string;
          department: string;
          yearOfStudy: number;
          phone: string;
          gender: string;
        };

      let collegeId: string | null = null;
      const existingCollegeResult = await supabase
        .from("colleges")
        .select("id")
        .ilike("name", college)
        .single();
      const existing = existingCollegeResult.data as { id: string } | null;

      if (existing) {
        collegeId = existing.id;
      } else {
        const { data: newCollege } = await supabase
          .from("colleges")
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .insert({ name: college } as any)
          .select("id")
          .single();
        collegeId = (newCollege as { id: string } | null)?.id ?? null;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await supabase.from("profiles").upsert({
        id: userId,
        email,
        full_name: fullName,
        phone,
        gender: gender as any,
        college_id: collegeId,
        department,
        year_of_study: yearOfStudy,
      } as any);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await supabase.from("user_roles").upsert({ user_id: userId, role: "student" } as any);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }
}
