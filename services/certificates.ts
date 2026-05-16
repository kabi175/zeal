import { createClient } from "@/lib/supabase/client";
import type { Certificate } from "@/types/app";

export interface CertificateWithDetails extends Certificate {
  course_title: string;
  tutor_name: string;
  student_name: string;
}

export async function listStudentCertificates(studentId: string): Promise<CertificateWithDetails[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createClient() as any;
  const { data: certs, error } = await supabase
    .from("certificates")
    .select("*")
    .eq("student_id", studentId)
    .order("issued_at", { ascending: false });
  if (error) throw error;
  if (!certs || certs.length === 0) return [];

  const results: CertificateWithDetails[] = [];
  for (const cert of certs as Certificate[]) {
    const { data: course } = await supabase
      .from("courses").select("title").eq("id", cert.course_id).single();
    const { data: tutor } = await supabase
      .from("profiles").select("full_name").eq("id", cert.expert_id).single();
    const { data: student } = await supabase
      .from("profiles").select("full_name").eq("id", cert.student_id).single();
    results.push({
      ...cert,
      course_title: (course as { title: string } | null)?.title ?? "Course",
      tutor_name: (tutor as { full_name: string } | null)?.full_name ?? "Tutor",
      student_name: (student as { full_name: string } | null)?.full_name ?? "Student",
    });
  }
  return results;
}

export async function getCertificateByCertCode(certCode: string): Promise<CertificateWithDetails | null> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createClient() as any;
  const { data: cert, error } = await supabase
    .from("certificates")
    .select("*")
    .eq("cert_code", certCode)
    .single();
  if (error || !cert) return null;

  const c = cert as Certificate;
  const { data: course } = await supabase
    .from("courses").select("title").eq("id", c.course_id).single();
  const { data: tutor } = await supabase
    .from("profiles").select("full_name").eq("id", c.expert_id).single();
  const { data: student } = await supabase
    .from("profiles").select("full_name").eq("id", c.student_id).single();

  return {
    ...c,
    course_title: (course as { title: string } | null)?.title ?? "Course",
    tutor_name: (tutor as { full_name: string } | null)?.full_name ?? "Tutor",
    student_name: (student as { full_name: string } | null)?.full_name ?? "Student",
  };
}
