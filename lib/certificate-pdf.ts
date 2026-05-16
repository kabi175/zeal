export interface CertificateData {
  studentName: string;
  courseName: string;
  tutorName: string;
  issuedAt: string;
  certCode: string;
}

export async function generateCertificatePdf(data: CertificateData): Promise<void> {
  const { default: jsPDF } = await import("jspdf");

  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();

  // Background
  doc.setFillColor(245, 243, 255);
  doc.rect(0, 0, pageW, pageH, "F");

  // Outer border
  doc.setDrawColor(79, 70, 229);
  doc.setLineWidth(3);
  doc.rect(8, 8, pageW - 16, pageH - 16);

  // Inner border
  doc.setDrawColor(167, 139, 250);
  doc.setLineWidth(1);
  doc.rect(12, 12, pageW - 24, pageH - 24);

  // Header bar
  doc.setFillColor(79, 70, 229);
  doc.rect(12, 12, pageW - 24, 22, "F");

  // Logo text in header
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.text("ZEAL 2 UP", 22, 26);

  // "Certificate of Completion" title
  doc.setFontSize(28);
  doc.setTextColor(79, 70, 229);
  doc.setFont("helvetica", "bold");
  doc.text("Certificate of Completion", pageW / 2, 52, { align: "center" });

  // Divider
  doc.setDrawColor(167, 139, 250);
  doc.setLineWidth(0.5);
  doc.line(40, 58, pageW - 40, 58);

  // "This certifies that"
  doc.setFontSize(12);
  doc.setTextColor(100, 100, 120);
  doc.setFont("helvetica", "normal");
  doc.text("This certifies that", pageW / 2, 70, { align: "center" });

  // Student name
  doc.setFontSize(26);
  doc.setTextColor(30, 30, 60);
  doc.setFont("helvetica", "bold");
  doc.text(data.studentName, pageW / 2, 85, { align: "center" });

  // Underline for name
  const nameWidth = doc.getTextWidth(data.studentName);
  doc.setDrawColor(79, 70, 229);
  doc.setLineWidth(0.8);
  doc.line(pageW / 2 - nameWidth / 2, 88, pageW / 2 + nameWidth / 2, 88);

  // "has successfully completed"
  doc.setFontSize(12);
  doc.setTextColor(100, 100, 120);
  doc.setFont("helvetica", "normal");
  doc.text("has successfully completed the course", pageW / 2, 99, { align: "center" });

  // Course name
  doc.setFontSize(20);
  doc.setTextColor(79, 70, 229);
  doc.setFont("helvetica", "bold");
  doc.text(data.courseName, pageW / 2, 113, { align: "center" });

  // Tutor and date row
  doc.setFontSize(10);
  doc.setTextColor(80, 80, 100);
  doc.setFont("helvetica", "normal");

  const issuedDate = new Date(data.issuedAt).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Left: tutor
  doc.setFont("helvetica", "bold");
  doc.text("Instructor", 60, 140);
  doc.setFont("helvetica", "normal");
  doc.text(data.tutorName, 60, 147);
  doc.setDrawColor(167, 139, 250);
  doc.line(45, 150, 115, 150);

  // Right: date
  doc.setFont("helvetica", "bold");
  doc.text("Date of Issue", pageW - 120, 140);
  doc.setFont("helvetica", "normal");
  doc.text(issuedDate, pageW - 120, 147);
  doc.line(pageW - 135, 150, pageW - 45, 150);

  // Footer: cert ID
  doc.setFontSize(8);
  doc.setTextColor(130, 130, 160);
  doc.text(`Certificate ID: ${data.certCode}`, pageW / 2, pageH - 18, { align: "center" });
  doc.text("Zeal 2 Up — zealcatalyst.zeca@gmail.com  |  +91 97902 05149", pageW / 2, pageH - 12, {
    align: "center",
  });

  const filename = `zeal-certificate-${data.studentName.replace(/\s+/g, "-").toLowerCase()}-${data.certCode}.pdf`;
  doc.save(filename);
}
