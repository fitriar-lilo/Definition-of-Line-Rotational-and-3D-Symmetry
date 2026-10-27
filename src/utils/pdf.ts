import jsPDF from 'jspdf';
import { COMMON_SHAPES_DATA, ROTATIONAL_SHAPES_DATA, SOLIDS_3D_DATA } from '../data/symmetryData';

export interface AssessmentReportData {
  studentName: string;
  totalScore: number;
  gradeBadge: string;
  feedbackText: string;
  sections: {
    line: { earned: number; total: number };
    rotational: { earned: number; total: number };
    plane: { earned: number; total: number };
  };
  questionsLog: Array<{
    id: number;
    topic: string;
    attempts: number;
    points: number;
  }>;
  dateStr?: string;
}

export interface GeneratedPdfResult {
  blob: Blob;
  url: string;
  filename: string;
}

/**
 * Universal safe trigger for downloading a PDF Blob across desktop, mobile, and sandboxed iframes.
 */
export function triggerPdfDownload(blob: Blob, filename: string): string {
  const url = URL.createObjectURL(blob);
  try {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      if (document.body.contains(link)) {
        document.body.removeChild(link);
      }
    }, 2000);
  } catch (err) {
    console.warn('Programmatic download anchor click notice:', err);
  }
  return url;
}

/**
 * Builds the official IGCSE 0580 Topic 19 Final Assessment Score Report and Certificate as a vector PDF.
 */
export function createAssessmentReportPdf(data: AssessmentReportData): GeneratedPdfResult {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const dateStr = data.dateStr || new Date().toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const filename = `IGCSE-0580-Symmetry-Report-${(data.studentName || 'Student').replace(/\s+/g, '_')}.pdf`;

  // --- OFFICIAL CERTIFICATE & SCORE REPORT ---
  // Outer decorative border
  pdf.setDrawColor(217, 119, 6); // amber-600
  pdf.setLineWidth(1.5);
  pdf.roundedRect(8, 8, pageWidth - 16, pageHeight - 16, 4, 4, 'S');

  pdf.setDrawColor(30, 64, 175); // blue-800
  pdf.setLineWidth(0.6);
  pdf.roundedRect(10, 10, pageWidth - 20, pageHeight - 20, 3, 3, 'S');

  // Top Title Banner
  pdf.setFillColor(240, 249, 255);
  pdf.roundedRect(12, 12, pageWidth - 24, 28, 2, 2, 'F');

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(16);
  pdf.setTextColor(30, 58, 138); // blue-900
  pdf.text('CAMBRIDGE IGCSE MATHEMATICS (0580)', pageWidth / 2, 21, { align: 'center' });

  pdf.setFontSize(12);
  pdf.setTextColor(2, 132, 199); // sky-600
  pdf.text('Topic 19: Symmetry — Mastery Assessment Report', pageWidth / 2, 28, { align: 'center' });

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8.5);
  pdf.setTextColor(100, 116, 139);
  pdf.text(`Teacher: Fitria Rakhmawati  |  Date: ${dateStr}  |  Verification: 0580-SYM-${Date.now().toString().slice(-6)}`, pageWidth / 2, 35, { align: 'center' });

  // Presentment Line
  pdf.setFont('helvetica', 'italic');
  pdf.setFontSize(11);
  pdf.setTextColor(71, 85, 105);
  pdf.text('This official certificate is proudly presented to candidate', pageWidth / 2, 48, { align: 'center' });

  // Student Name
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(22);
  pdf.setTextColor(15, 23, 42);
  pdf.text(data.studentName || 'Student', pageWidth / 2, 58, { align: 'center' });

  // Underline
  pdf.setDrawColor(245, 158, 11);
  pdf.setLineWidth(1.2);
  const nameWidth = pdf.getTextWidth(data.studentName || 'Student');
  pdf.line(pageWidth / 2 - nameWidth / 2 - 10, 61, pageWidth / 2 + nameWidth / 2 + 10, 61);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9.5);
  pdf.setTextColor(71, 85, 105);
  pdf.text('for successfully finishing all 10 examination problems on Line, Rotational, and 3D Plane Symmetry.', pageWidth / 2, 68, { align: 'center' });

  // Score Box
  pdf.setFillColor(254, 243, 199);
  pdf.setDrawColor(245, 158, 11);
  pdf.setLineWidth(0.8);
  pdf.roundedRect(18, 74, pageWidth - 36, 30, 3, 3, 'FD');

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10.5);
  pdf.setTextColor(146, 64, 14);
  pdf.text('FINAL OVERALL SCORE', pageWidth / 2, 82, { align: 'center' });

  pdf.setFontSize(22);
  pdf.setTextColor(180, 83, 9);
  pdf.text(`${data.totalScore} / 100`, pageWidth / 2 - 28, 94, { align: 'center' });

  pdf.setFontSize(13);
  pdf.setTextColor(15, 23, 42);
  pdf.text(`(${data.totalScore}%)`, pageWidth / 2 + 2, 94);

  pdf.setFontSize(11);
  pdf.setTextColor(4, 120, 87);
  pdf.text(data.gradeBadge, pageWidth / 2 + 30, 94, { align: 'left' });

  // Section Breakdown 3 Cards
  const boxY = 110;
  const boxW = (pageWidth - 36 - 8) / 3;

  // Box 1: Line Symmetry
  pdf.setFillColor(240, 249, 255);
  pdf.setDrawColor(186, 230, 253);
  pdf.roundedRect(18, boxY, boxW, 23, 2, 2, 'FD');
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9);
  pdf.setTextColor(3, 105, 161);
  pdf.text('Line Symmetry (2D)', 18 + boxW / 2, boxY + 6.5, { align: 'center' });
  pdf.setFontSize(13);
  pdf.setTextColor(15, 23, 42);
  pdf.text(`${data.sections.line.earned} / ${data.sections.line.total}`, 18 + boxW / 2, boxY + 15, { align: 'center' });
  pdf.setFontSize(7.5);
  pdf.setTextColor(100, 116, 139);
  pdf.text('4 Questions • Max 40 pts', 18 + boxW / 2, boxY + 20, { align: 'center' });

  // Box 2: Rotational Symmetry
  pdf.setFillColor(236, 253, 245);
  pdf.setDrawColor(167, 243, 208);
  pdf.roundedRect(18 + boxW + 4, boxY, boxW, 23, 2, 2, 'FD');
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9);
  pdf.setTextColor(4, 120, 87);
  pdf.text('Rotational Symmetry', 18 + boxW + 4 + boxW / 2, boxY + 6.5, { align: 'center' });
  pdf.setFontSize(13);
  pdf.setTextColor(15, 23, 42);
  pdf.text(`${data.sections.rotational.earned} / ${data.sections.rotational.total}`, 18 + boxW + 4 + boxW / 2, boxY + 15, { align: 'center' });
  pdf.setFontSize(7.5);
  pdf.setTextColor(100, 116, 139);
  pdf.text('3 Questions • Max 30 pts', 18 + boxW + 4 + boxW / 2, boxY + 20, { align: 'center' });

  // Box 3: 3D Plane Symmetry
  pdf.setFillColor(245, 243, 255);
  pdf.setDrawColor(221, 214, 254);
  pdf.roundedRect(18 + (boxW + 4) * 2, boxY, boxW, 23, 2, 2, 'FD');
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9);
  pdf.setTextColor(109, 40, 217);
  pdf.text('Plane Symmetry (3D)', 18 + (boxW + 4) * 2 + boxW / 2, boxY + 6.5, { align: 'center' });
  pdf.setFontSize(13);
  pdf.setTextColor(15, 23, 42);
  pdf.text(`${data.sections.plane.earned} / ${data.sections.plane.total}`, 18 + (boxW + 4) * 2 + boxW / 2, boxY + 15, { align: 'center' });
  pdf.setFontSize(7.5);
  pdf.setTextColor(100, 116, 139);
  pdf.text('3 Questions • Max 30 pts', 18 + (boxW + 4) * 2 + boxW / 2, boxY + 20, { align: 'center' });

  // Table of 10 Questions
  const tableStartY = 139;
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.setTextColor(30, 41, 59);
  pdf.text('DETAILED ASSESSMENT QUESTIONS & ATTEMPTS LOG', 18, tableStartY);

  pdf.setFillColor(241, 245, 249);
  pdf.rect(18, tableStartY + 2.5, pageWidth - 36, 6.5, 'F');
  pdf.setFontSize(8);
  pdf.setTextColor(71, 85, 105);
  pdf.text('Q#', 22, tableStartY + 7);
  pdf.text('Topic Domain', 35, tableStartY + 7);
  pdf.text('Attempts Taken', 95, tableStartY + 7);
  pdf.text('Scoring Standard', 130, tableStartY + 7);
  pdf.text('Points Awarded', pageWidth - 22, tableStartY + 7, { align: 'right' });

  let currentY = tableStartY + 9;
  data.questionsLog.forEach((q, idx) => {
    currentY += 6.5;
    if (idx % 2 === 1) {
      pdf.setFillColor(248, 250, 252);
      pdf.rect(18, currentY - 4.5, pageWidth - 36, 6.5, 'F');
    }

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8);
    pdf.setTextColor(15, 23, 42);
    pdf.text(`Q${q.id}`, 22, currentY);

    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(51, 65, 85);
    pdf.text(q.topic, 35, currentY);

    pdf.text(`${q.attempts} attempt${q.attempts === 1 ? '' : 's'}`, 95, currentY);

    const standardText = q.attempts <= 2 ? 'Attempt 1-2 (Full)' : q.attempts === 3 ? 'Attempt 3 (-1 pt)' : 'Attempt 4+ (-2 pts)';
    pdf.setTextColor(100, 116, 139);
    pdf.text(standardText, 130, currentY);

    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(217, 119, 6);
    pdf.text(`${q.points} / 10 pts`, pageWidth - 22, currentY, { align: 'right' });
  });

  // Teacher Remarks
  const teacherY = currentY + 10;
  pdf.setFillColor(254, 252, 232);
  pdf.setDrawColor(254, 240, 138);
  pdf.roundedRect(18, teacherY, pageWidth - 36, 19, 2, 2, 'FD');

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8.5);
  pdf.setTextColor(133, 77, 14);
  pdf.text('TEACHER EVALUATION & REMARKS — Fitria Rakhmawati:', 22, teacherY + 5.5);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.setTextColor(113, 63, 18);
  const splitFeedback = pdf.splitTextToSize(data.feedbackText, pageWidth - 44);
  pdf.text(splitFeedback, 22, teacherY + 11);

  // Footer
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8);
  pdf.setTextColor(100, 116, 139);
  pdf.text('Teacher: Fitria Rakhmawati  •  Status: Completed & Verified', 22, pageHeight - 16);
  pdf.text('Authorized by IGCSE Mathematics Learning Suite', pageWidth - 22, pageHeight - 16, { align: 'right' });

  const blob = pdf.output('blob');
  const url = triggerPdfDownload(blob, filename);

  return { blob, url, filename };
}

/**
 * Creates clean study guide PDF for Section 1 (Line Symmetry)
 */
export function createSection1Pdf(studentName: string): GeneratedPdfResult {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const filename = `IGCSE-0580-Section1-Line-Symmetry-${(studentName || 'Student').replace(/\s+/g, '_')}.pdf`;

  pdf.setFillColor(240, 249, 255);
  pdf.rect(0, 0, pageWidth, 28, 'F');
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(16);
  pdf.setTextColor(30, 58, 138);
  pdf.text('IGCSE MATHEMATICS 0580 — TOPIC 19: SYMMETRY', 14, 13);
  pdf.setFontSize(11);
  pdf.setTextColor(2, 132, 199);
  pdf.text('Section 1 Study Guide: Line Symmetry (Reflection)', 14, 21);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  pdf.setTextColor(71, 85, 105);
  pdf.text(`Student: ${studentName || 'Student'}  |  Teacher: Fitria Rakhmawati  |  Date: ${new Date().toLocaleDateString()}`, pageWidth - 14, 21, { align: 'right' });

  let y = 36;
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(12);
  pdf.setTextColor(15, 23, 42);
  pdf.text('1. Core Definition', 14, y);

  y += 6;
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9.5);
  pdf.setTextColor(51, 65, 85);
  const def = 'A line of symmetry (mirror line) divides a 2D shape into two identical halves. If you fold the shape along the line of symmetry, both halves match each other exactly. Each half is the mirror reflection of the other.';
  pdf.text(pdf.splitTextToSize(def, pageWidth - 28), 14, y);

  y += 18;
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(12);
  pdf.setTextColor(15, 23, 42);
  pdf.text('2. Common 2D Shapes and Lines of Symmetry Table', 14, y);

  y += 5;
  pdf.setFillColor(241, 245, 249);
  pdf.rect(14, y, pageWidth - 28, 7, 'F');
  pdf.setFontSize(8.5);
  pdf.setTextColor(71, 85, 105);
  pdf.text('Shape Name', 18, y + 5);
  pdf.text('Lines of Symmetry', 80, y + 5);
  pdf.text('Exam Rule & Details', 125, y + 5);

  COMMON_SHAPES_DATA.forEach((s) => {
    y += 8;
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8.5);
    pdf.setTextColor(15, 23, 42);
    pdf.text(s.name, 18, y + 4);

    pdf.setTextColor(2, 132, 199);
    pdf.text(s.lines === 999 ? 'Infinite' : `${s.lines}`, 80, y + 4);

    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(71, 85, 105);
    pdf.text(pdf.splitTextToSize(s.details, 70), 125, y + 3);
  });

  y += 24;
  pdf.setFillColor(254, 243, 199);
  pdf.roundedRect(14, y, pageWidth - 28, 22, 2, 2, 'F');
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9.5);
  pdf.setTextColor(146, 64, 14);
  pdf.text('REMEMBER THIS FOR EXAMS:', 18, y + 6);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8.5);
  pdf.setTextColor(113, 63, 18);
  pdf.text('• Any regular polygon with n sides has exactly n lines of symmetry.', 18, y + 12);
  pdf.text('• A rectangle has only 2 lines of symmetry; diagonals are NOT lines of symmetry.', 18, y + 17);
  pdf.text('• An ordinary parallelogram has 0 lines of symmetry.', 18, y + 21);

  const blob = pdf.output('blob');
  const url = triggerPdfDownload(blob, filename);
  return { blob, url, filename };
}

/**
 * Creates clean study guide PDF for Section 2 (Rotational Symmetry)
 */
export function createSection2Pdf(studentName: string): GeneratedPdfResult {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const filename = `IGCSE-0580-Section2-Rotational-Symmetry-${(studentName || 'Student').replace(/\s+/g, '_')}.pdf`;

  pdf.setFillColor(236, 253, 245);
  pdf.rect(0, 0, pageWidth, 28, 'F');
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(16);
  pdf.setTextColor(6, 78, 59);
  pdf.text('IGCSE MATHEMATICS 0580 — TOPIC 19: SYMMETRY', 14, 13);
  pdf.setFontSize(11);
  pdf.setTextColor(5, 150, 105);
  pdf.text('Section 2 Study Guide: Rotational Symmetry & Order', 14, 21);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  pdf.setTextColor(71, 85, 105);
  pdf.text(`Student: ${studentName || 'Student'}  |  Teacher: Fitria Rakhmawati  |  Date: ${new Date().toLocaleDateString()}`, pageWidth - 14, 21, { align: 'right' });

  let y = 36;
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(12);
  pdf.setTextColor(15, 23, 42);
  pdf.text('1. Definitions and Key Formula', 14, y);

  y += 6;
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9.5);
  pdf.setTextColor(51, 65, 85);
  const def = 'The centre of rotation is the fixed point around which a shape turns. The order of rotational symmetry is the number of times the shape fits onto its original outline in one full turn of 360 degrees.';
  pdf.text(pdf.splitTextToSize(def, pageWidth - 28), 14, y);

  y += 14;
  pdf.setFillColor(241, 245, 249);
  pdf.roundedRect(14, y, pageWidth - 28, 14, 2, 2, 'F');
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.setTextColor(4, 120, 87);
  pdf.text('Angle of Rotation Formula = 360° ÷ Order of Rotational Symmetry', pageWidth / 2, y + 9, { align: 'center' });

  y += 22;
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(12);
  pdf.setTextColor(15, 23, 42);
  pdf.text('2. Shapes and Order of Rotational Symmetry', 14, y);

  y += 5;
  pdf.setFillColor(241, 245, 249);
  pdf.rect(14, y, pageWidth - 28, 7, 'F');
  pdf.setFontSize(8.5);
  pdf.setTextColor(71, 85, 105);
  pdf.text('Shape / Letter', 18, y + 5);
  pdf.text('Order', 75, y + 5);
  pdf.text('Angle', 105, y + 5);
  pdf.text('Description', 135, y + 5);

  ROTATIONAL_SHAPES_DATA.forEach((s) => {
    y += 8;
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8.5);
    pdf.setTextColor(15, 23, 42);
    pdf.text(s.name, 18, y + 4);

    pdf.setTextColor(5, 150, 105);
    pdf.text(`${s.order}`, 75, y + 4);

    pdf.setTextColor(71, 85, 105);
    pdf.text(`${s.angle}°`, 105, y + 4);

    pdf.setFont('helvetica', 'normal');
    pdf.text(pdf.splitTextToSize(s.description, 60), 135, y + 3);
  });

  const blob = pdf.output('blob');
  const url = triggerPdfDownload(blob, filename);
  return { blob, url, filename };
}

/**
 * Creates clean study guide PDF for Section 3 (3D Plane Symmetry)
 */
export function createSection3Pdf(studentName: string): GeneratedPdfResult {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const filename = `IGCSE-0580-Section3-Plane-Symmetry-${(studentName || 'Student').replace(/\s+/g, '_')}.pdf`;

  pdf.setFillColor(245, 243, 255);
  pdf.rect(0, 0, pageWidth, 28, 'F');
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(16);
  pdf.setTextColor(76, 29, 149);
  pdf.text('IGCSE MATHEMATICS 0580 — TOPIC 19: SYMMETRY', 14, 13);
  pdf.setFontSize(11);
  pdf.setTextColor(124, 58, 237);
  pdf.text('Section 3 Study Guide: Plane Symmetry in 3D Solids', 14, 21);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  pdf.setTextColor(71, 85, 105);
  pdf.text(`Student: ${studentName || 'Student'}  |  Teacher: Fitria Rakhmawati  |  Date: ${new Date().toLocaleDateString()}`, pageWidth - 14, 21, { align: 'right' });

  let y = 36;
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(12);
  pdf.setTextColor(15, 23, 42);
  pdf.text('1. Definition of a Plane of Symmetry', 14, y);

  y += 6;
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9.5);
  pdf.setTextColor(51, 65, 85);
  const def = 'A plane of symmetry is an imaginary flat mirror that cuts through a 3D solid, dividing it into two identical halves that are exact mirror reflections of each other across the plane.';
  pdf.text(pdf.splitTextToSize(def, pageWidth - 28), 14, y);

  y += 18;
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(12);
  pdf.setTextColor(15, 23, 42);
  pdf.text('2. Common 3D Solids & Number of Planes of Symmetry', 14, y);

  y += 5;
  pdf.setFillColor(241, 245, 249);
  pdf.rect(14, y, pageWidth - 28, 7, 'F');
  pdf.setFontSize(8.5);
  pdf.setTextColor(71, 85, 105);
  pdf.text('3D Solid', 18, y + 5);
  pdf.text('Planes of Symmetry', 75, y + 5);
  pdf.text('Planes Breakdown & Exam Notes', 125, y + 5);

  SOLIDS_3D_DATA.forEach((s) => {
    y += 8.5;
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8.5);
    pdf.setTextColor(15, 23, 42);
    pdf.text(s.name, 18, y + 4);

    pdf.setTextColor(124, 58, 237);
    pdf.text(s.planes === 999 ? 'Infinite' : `${s.planes}`, 75, y + 4);

    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(71, 85, 105);
    pdf.text(pdf.splitTextToSize(s.planesBreakdown.join('; '), 70), 125, y + 3);
  });

  const blob = pdf.output('blob');
  const url = triggerPdfDownload(blob, filename);
  return { blob, url, filename };
}
