import type { Profile } from "@/types/app";
import type { AssessmentResult } from "@/types/app";
import { getCategoryLabel } from "./assessment";

export async function generateStressReportPdf(
  student: Profile,
  result: AssessmentResult,
  assessmentId: string
): Promise<void> {
  // Dynamic import to avoid SSR issues
  const { default: jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 20;

  // ---- HEADER GRADIENT (simulated with filled rect + text) ----
  doc.setFillColor(79, 70, 229); // indigo-600
  doc.rect(0, 0, pageW, 45, "F");

  // Logo area
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(margin, 10, 28, 12, 2, 2, "F");
  doc.setFontSize(8);
  doc.setTextColor(79, 70, 229);
  doc.setFont("helvetica", "bold");
  doc.text("ZEAL 2 UP", margin + 2, 18);

  // Title
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.text("Student Stress Assessment Report", pageW / 2, 22, { align: "center" });

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(
    `Generated: ${new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}`,
    pageW / 2,
    32,
    { align: "center" }
  );
  doc.text(`Report ID: ${assessmentId.slice(0, 8).toUpperCase()}`, pageW / 2, 38, {
    align: "center",
  });

  let y = 58;

  // ---- STUDENT DETAILS ----
  doc.setFontSize(13);
  doc.setTextColor(30, 30, 60);
  doc.setFont("helvetica", "bold");
  doc.text("Student Information", margin, y);
  y += 6;

  doc.setDrawColor(79, 70, 229);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageW - margin, y);
  y += 8;

  const studentDetails = [
    ["Full Name", student.full_name],
    ["Email", student.email],
    ["Department", student.department ?? "—"],
    ["Year of Study", student.year_of_study ? `Year ${student.year_of_study}` : "—"],
    ["Phone", student.phone ?? "—"],
  ];

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(50, 50, 80);

  for (const [label, value] of studentDetails) {
    doc.setFont("helvetica", "bold");
    doc.text(`${label}:`, margin, y);
    doc.setFont("helvetica", "normal");
    doc.text(value, margin + 45, y);
    y += 7;
  }

  y += 6;

  // ---- SCORE SECTION ----
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 30, 60);
  doc.text("Assessment Results", margin, y);
  y += 6;

  doc.setDrawColor(79, 70, 229);
  doc.line(margin, y, pageW - margin, y);
  y += 8;

  // Score badge
  const categoryColors: Record<string, [number, number, number]> = {
    low:      [34, 197, 94],
    mild:     [234, 179, 8],
    moderate: [249, 115, 22],
    high:     [239, 68, 68],
    severe:   [127, 29, 29],
  };
  const [r, g, b] = categoryColors[result.category] ?? [79, 70, 229];

  // Score circle (approximated with filled rect)
  doc.setFillColor(r, g, b);
  doc.roundedRect(margin, y, 50, 24, 4, 4, "F");
  doc.setFontSize(20);
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.text(`${result.score}`, margin + 25, y + 13, { align: "center" });
  doc.setFontSize(8);
  doc.text("/ 100", margin + 25, y + 20, { align: "center" });

  // Category label
  doc.setFillColor(r, g, b);
  doc.roundedRect(margin + 56, y + 4, 60, 14, 3, 3, "F");
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.text(getCategoryLabel(result.category), margin + 86, y + 13, { align: "center" });

  y += 32;

  // ---- INTERPRETATION ----
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 30, 60);
  doc.text("Interpretation", margin, y);
  y += 6;

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(60, 60, 90);
  const interpretationLines = doc.splitTextToSize(result.interpretation, pageW - margin * 2);
  doc.text(interpretationLines, margin, y);
  y += interpretationLines.length * 5 + 6;

  // ---- COPING GUIDANCE ----
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 30, 60);
  doc.text("Coping Guidance", margin, y);
  y += 6;

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(60, 60, 90);
  const copingLines = doc.splitTextToSize(result.copingGuidance, pageW - margin * 2);
  doc.text(copingLines, margin, y);
  y += copingLines.length * 5 + 10;

  // ---- INTERVENTION STRATEGIES TABLE ----
  autoTable(doc, {
    startY: y,
    head: [["#", "Recommended Intervention Strategy"]],
    body: result.interventionStrategies.map((s, i) => [i + 1, s]),
    theme: "striped",
    headStyles: {
      fillColor: [79, 70, 229],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 10,
    },
    bodyStyles: { fontSize: 9, textColor: [50, 50, 80] },
    columnStyles: { 0: { cellWidth: 12 } },
    margin: { left: margin, right: margin },
  });

  y = (doc as any).lastAutoTable.finalY + 14;

  // ---- FOOTER ----
  if (y > pageH - 30) {
    doc.addPage();
    y = 20;
  }

  doc.setDrawColor(79, 70, 229);
  doc.setLineWidth(0.3);
  doc.line(margin, pageH - 20, pageW - margin, pageH - 20);

  doc.setFontSize(8);
  doc.setTextColor(100, 100, 140);
  doc.setFont("helvetica", "normal");
  doc.text("Zeal 2 Up — AI-Powered Student Wellness Platform", pageW / 2, pageH - 14, {
    align: "center",
  });
  doc.text(
    "Email: zealcatalyst.zeca@gmail.com  |  Phone: +91 97902 05149",
    pageW / 2,
    pageH - 9,
    { align: "center" }
  );

  // ---- SAVE ----
  const filename = `zeal2up-stress-report-${student.full_name.replace(/\s+/g, "-").toLowerCase()}-${new Date().toISOString().split("T")[0]}.pdf`;
  doc.save(filename);
}
