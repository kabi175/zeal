"use client";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Award, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { listStudentCertificates } from "@/services/certificates";
import { generateCertificatePdf } from "@/lib/certificate-pdf";
import { useAuth } from "@/hooks/use-auth";

export default function CertificatePage() {
  const { courseId } = useParams<{ courseId: string }>();
  const { user } = useAuth();

  const { data: certs = [], isLoading } = useQuery({
    queryKey: ["certificates", user?.id],
    queryFn: () => listStudentCertificates(user!.id),
    enabled: !!user,
  });

  const cert = certs.find((c) => c.course_id === courseId);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: "var(--primary)" }} />
      </div>
    );
  }

  if (!cert) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
          Certificate not yet issued. Complete all lessons to earn it.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <Award className="h-16 w-16 mx-auto" style={{ color: "oklch(0.7 0.22 80)" }} />
        <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>
          Certificate of Completion
        </h1>
      </div>

      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            {[
              ["Student", cert.student_name],
              ["Course", cert.course_title],
              ["Instructor", cert.tutor_name],
              ["Issued", new Date(cert.issued_at).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })],
              ["Certificate ID", cert.cert_code],
            ].map(([label, value]) => (
              <div key={label}>
                <p className="text-xs font-medium" style={{ color: "var(--muted-foreground)" }}>{label}</p>
                <p className="font-semibold mt-0.5" style={{ color: "var(--foreground)" }}>{value}</p>
              </div>
            ))}
          </div>

          <Button
            className="w-full"
            onClick={() =>
              generateCertificatePdf({
                studentName: cert.student_name,
                courseName: cert.course_title,
                tutorName: cert.tutor_name,
                issuedAt: cert.issued_at,
                certCode: cert.cert_code,
              })
            }
          >
            <Download className="h-4 w-4 mr-2" />
            Download PDF Certificate
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
