import React, { useState } from 'react';
import { 
  Award, Download, Printer, ExternalLink, Copy, Check, 
  RotateCcw, Star, CheckCircle, ArrowLeft, ShieldCheck
} from 'lucide-react';
import { ASSESSMENT_QUESTIONS } from '../data/assessmentData';
import { createAssessmentReportPdf } from '../utils/pdf';
import { PdfModal } from './PdfModal';

interface SectionBreakdownData {
  earned: number;
  total: number;
  count?: number;
}

interface OfficialCertificateViewProps {
  studentName: string;
  totalScore: number;
  gradeBadge: string;
  feedbackText: string;
  sectionBreakdown: {
    line: SectionBreakdownData;
    rotational: SectionBreakdownData;
    plane: SectionBreakdownData;
  };
  attemptsMap: Record<number, number>;
  isStandalone?: boolean;
  onClose?: () => void;
  onRetake?: () => void;
}

export const OfficialCertificateView: React.FC<OfficialCertificateViewProps> = ({
  studentName,
  totalScore,
  gradeBadge,
  feedbackText,
  sectionBreakdown,
  attemptsMap,
  isStandalone = false,
  onClose,
  onRetake,
}) => {
  const [copied, setCopied] = useState(false);
  const [printErrorNotice, setPrintErrorNotice] = useState(false);
  const [pdfModal, setPdfModal] = useState<{
    isOpen: boolean;
    url: string | null;
    filename: string;
    title: string;
  }>({
    isOpen: false,
    url: null,
    filename: '',
    title: '',
  });

  const getPointsForAttempts = (attempts: number): number => {
    if (attempts <= 2) return 10;
    if (attempts === 3) return 9;
    return 8;
  };

  const currentDate = new Date().toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const verificationCode = `0580-SYM-${Math.abs(
    studentName.split('').reduce((acc, char) => (acc << 5) - acc + char.charCodeAt(0), 0)
  ).toString().slice(0, 6).padStart(6, '7')}`;

  const handlePrint = () => {
    try {
      const inIframe = typeof window !== 'undefined' && window.self !== window.top;
      window.print();
      if (inIframe) {
        setPrintErrorNotice(true);
        setTimeout(() => setPrintErrorNotice(false), 8000);
      }
    } catch (err) {
      console.warn('Browser sandbox prevented window.print():', err);
      setPrintErrorNotice(true);
      setTimeout(() => setPrintErrorNotice(false), 8000);
    }
  };

  const handleGeneratePdf = () => {
    const questionsLog = ASSESSMENT_QUESTIONS.map((q) => {
      const attempts = attemptsMap[q.id] || 1;
      const points = getPointsForAttempts(attempts);
      return {
        id: q.id,
        topic: q.topicLabel,
        attempts,
        points,
      };
    });

    const result = createAssessmentReportPdf({
      studentName,
      totalScore,
      gradeBadge,
      feedbackText,
      sections: {
        line: { earned: sectionBreakdown.line.earned, total: sectionBreakdown.line.total },
        rotational: { earned: sectionBreakdown.rotational.earned, total: sectionBreakdown.rotational.total },
        plane: { earned: sectionBreakdown.plane.earned, total: sectionBreakdown.plane.total },
      },
      questionsLog,
      dateStr: currentDate,
    });

    setPdfModal({
      isOpen: true,
      url: result.url,
      filename: result.filename,
      title: 'IGCSE Symmetry Final Assessment Report',
    });
  };

  const handleCopySummary = async () => {
    const logSummary = ASSESSMENT_QUESTIONS.map((q) => {
      const att = attemptsMap[q.id] || 1;
      const pts = getPointsForAttempts(att);
      return `  • Q${q.id} (${q.topicLabel}): ${att} attempt${att === 1 ? '' : 's'} -> ${pts}/10 pts`;
    }).join('\n');

    const textToCopy = `=========================================
CAMBRIDGE IGCSE MATHEMATICS (0580)
TOPIC 19: SYMMETRY - MASTERY ASSESSMENT REPORT
=========================================
Candidate Name : ${studentName}
Teacher        : Fitria Rakhmawati
Date           : ${currentDate}
Verification   : ${verificationCode}
Total Score    : ${totalScore} / 100 (${totalScore}%)
Status & Grade : ${gradeBadge}

SECTION BREAKDOWN:
  1. Line Symmetry (2D)       : ${sectionBreakdown.line.earned} / ${sectionBreakdown.line.total} pts
  2. Rotational Symmetry      : ${sectionBreakdown.rotational.earned} / ${sectionBreakdown.rotational.total} pts
  3. Plane Symmetry (3D Solids): ${sectionBreakdown.plane.earned} / ${sectionBreakdown.plane.total} pts

QUESTION ATTEMPTS LOG:
${logSummary}

TEACHER REMARKS:
"${feedbackText}"
=========================================`;

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = textToCopy;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const standaloneUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname}?report=true`
    : '?report=true';

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="no-print bg-white/95 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-amber-200 shadow-md">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-black uppercase tracking-wider text-emerald-800">
                Assessment Completed & Verified
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-slate-800 mt-0.5">
              Save or Print Your Official Score Certificate
            </h3>
            <p className="text-xs text-slate-500">
              Download as high-res PDF, open printable view in a new tab, or print directly.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2.5">
            <a
              href={standaloneUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-700 hover:to-blue-800 text-white font-black text-xs sm:text-sm shadow-sm flex items-center gap-1.5 transition no-underline cursor-pointer"
              title="Opens certificate in full browser tab for unrestricted PDF download and printing"
            >
              <ExternalLink className="w-4 h-4 text-sky-200" />
              <span>Open in New Tab (Print/PDF)</span>
            </a>

            <button
              onClick={handleGeneratePdf}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-xs sm:text-sm shadow-sm flex items-center gap-1.5 transition cursor-pointer"
              title="Generate vector PDF file"
            >
              <Download className="w-4 h-4 text-amber-100" />
              <span>Download PDF File</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3.5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm flex items-center gap-1.5 transition cursor-pointer"
              title="Print document or Save as PDF via browser print dialog"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              <span>Print</span>
            </button>

            <button
              onClick={handleCopySummary}
              className="px-3.5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm flex items-center gap-1.5 transition cursor-pointer"
              title="Copy text score card to clipboard"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700 font-extrabold">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-500" />
                  <span>Copy Score</span>
                </>
              )}
            </button>

            {onRetake && (
              <button
                onClick={onRetake}
                className="px-3 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 font-semibold text-xs flex items-center gap-1 transition cursor-pointer"
                title="Restart assessment from Question 1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retake</span>
              </button>
            )}

            {isStandalone && onClose && (
              <button
                onClick={onClose}
                className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Lessons</span>
              </button>
            )}
          </div>
        </div>

        {printErrorNotice && (
          <div className="mt-3 p-3 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-900 flex items-start gap-2">
            <span className="text-base shrink-0">💡</span>
            <div>
              <p className="font-bold">
                If the print dialog didn't open automatically:
              </p>
              <p className="mt-0.5">
                Preview environments restrict popup dialogs. Click <strong>"Open in New Tab (Print/PDF)"</strong> above or <strong>"Download PDF File"</strong> to immediately save your PDF!
              </p>
            </div>
          </div>
        )}
      </div>

      <div 
        id="official-certificate-document"
        className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl border-4 border-double border-amber-400 relative overflow-hidden text-slate-900 print:shadow-none print:border-2 print:border-slate-800 print:p-6"
      >
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-amber-100/40 pointer-events-none -z-0"></div>
        <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full bg-sky-100/40 pointer-events-none -z-0"></div>

        <div className="text-center relative z-10 space-y-2 border-b-2 border-slate-100 pb-6 print:pb-4">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-black uppercase tracking-widest">
            <ShieldCheck className="w-4 h-4 text-amber-600" />
            <span>Cambridge Assessment International Education</span>
          </div>

          <h1 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight pt-1">
            CAMBRIDGE IGCSE® MATHEMATICS (0580)
          </h1>
          <h2 className="text-base sm:text-xl font-extrabold text-sky-700 tracking-tight">
            Topic 19: Symmetry — Official Examination Report Card
          </h2>

          <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-slate-500 font-semibold pt-1">
            <span>Date: <strong className="text-slate-700">{currentDate}</strong></span>
            <span>•</span>
            <span>Verification: <strong className="font-mono text-amber-700">{verificationCode}</strong></span>
            <span>•</span>
            <span className="text-emerald-700 font-extrabold">STATUS: 100% COMPLETED</span>
          </div>
        </div>

        <div className="text-center my-6 space-y-2 relative z-10">
          <p className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-slate-500">
            This certifies that the candidate
          </p>

          <div className="inline-block relative">
            <h3 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight py-1">
              {studentName}
            </h3>
            <div className="h-1 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 rounded-full mx-auto w-3/4"></div>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 font-medium max-w-xl mx-auto pt-1 leading-relaxed">
            has completed all 10 examination-style assessment problems with full accuracy across Line Symmetry, Rotational Symmetry, and 3D Plane Symmetry.
          </p>
        </div>

        <div className="my-6 p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-amber-50 via-orange-50 to-amber-100 border-2 border-amber-300 relative z-10 shadow-sm print:bg-white print:border-slate-300">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left space-y-1">
              <span className="text-xs font-black uppercase tracking-wider text-amber-900 block">
                Final Assessment Overall Score
              </span>
              <div className="flex items-baseline justify-center sm:justify-start gap-2">
                <span className="text-4xl sm:text-5xl font-black text-amber-700">
                  {totalScore}
                </span>
                <span className="text-xl sm:text-2xl font-black text-slate-500">
                  / 100
                </span>
                <span className="text-sm sm:text-base font-extrabold text-slate-700 ml-1">
                  ({totalScore}%)
                </span>
              </div>
            </div>

            <div className="text-center sm:text-right">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500 text-white text-xs font-black uppercase tracking-wider">
                <Star className="w-3.5 h-3.5 fill-yellow-200 text-yellow-200" />
                <span>Classification</span>
              </div>
              <p className="text-base sm:text-lg font-black text-slate-900 mt-1">
                {gradeBadge}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 my-6 relative z-10">
          <div className="p-4 rounded-2xl bg-sky-50/80 border border-sky-200 text-center">
            <span className="text-xs font-black text-sky-800 uppercase tracking-wider block">
              1. Line Symmetry (2D)
            </span>
            <span className="text-2xl font-black text-sky-950 my-1 block">
              {sectionBreakdown.line.earned} / {sectionBreakdown.line.total}
            </span>
            <span className="text-[11px] text-sky-700 font-semibold">
              4 Questions • Max 40 pts
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-center">
            <span className="text-xs font-black text-emerald-800 uppercase tracking-wider block">
              2. Rotational Symmetry
            </span>
            <span className="text-2xl font-black text-emerald-950 my-1 block">
              {sectionBreakdown.rotational.earned} / {sectionBreakdown.rotational.total}
            </span>
            <span className="text-[11px] text-emerald-700 font-semibold">
              3 Questions • Max 30 pts
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-purple-50/80 border border-purple-200 text-center">
            <span className="text-xs font-black text-purple-800 uppercase tracking-wider block">
              3. Plane Symmetry (3D)
            </span>
            <span className="text-2xl font-black text-purple-950 my-1 block">
              {sectionBreakdown.plane.earned} / {sectionBreakdown.plane.total}
            </span>
            <span className="text-[11px] text-purple-700 font-semibold">
              3 Questions • Max 30 pts
            </span>
          </div>
        </div>

        <div className="my-6 space-y-2 relative z-10">
          <div className="flex items-center justify-between">
            <h4 className="text-xs sm:text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-600" />
              <span>Assessment Log & Attempt History</span>
            </h4>
            <span className="text-[11px] text-slate-500 font-medium">
              10 pts (att 1–2) • 9 pts (att 3) • 8 pts (att 4+)
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-slate-50/50">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <th className="p-2.5">Q#</th>
                  <th className="p-2.5">Concept Domain</th>
                  <th className="p-2.5 text-center">Attempts Used</th>
                  <th className="p-2.5 text-right">Points Earned</th>
                  <th className="p-2.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-800 font-medium">
                {ASSESSMENT_QUESTIONS.map((q) => {
                  const attempts = attemptsMap[q.id] || 1;
                  const pts = getPointsForAttempts(attempts);
                  return (
                    <tr key={q.id} className="hover:bg-white">
                      <td className="p-2.5 font-black text-slate-900">Q{q.id}</td>
                      <td className="p-2.5">{q.topicLabel}</td>
                      <td className="p-2.5 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-bold ${
                            attempts <= 2
                              ? 'bg-emerald-100 text-emerald-800'
                              : attempts === 3
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {attempts} {attempts === 1 ? 'attempt' : 'attempts'}
                        </span>
                      </td>
                      <td className="p-2.5 text-right font-black text-amber-700">
                        {pts} / 10 pts
                      </td>
                      <td className="p-2.5 text-center">
                        <span className="text-emerald-600 font-bold inline-flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Solved</span>
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="my-6 p-4 rounded-2xl bg-amber-50/70 border border-amber-200 relative z-10">
          <span className="text-xs font-black uppercase tracking-wider text-amber-900 block mb-1">
            Teacher Evaluation & Remarks — Fitria Rakhmawati
          </span>
          <p className="text-xs sm:text-sm text-amber-950 font-medium leading-relaxed">
            "{feedbackText}"
          </p>
        </div>

        <div className="pt-6 border-t border-slate-200 grid grid-cols-2 sm:grid-cols-3 gap-4 items-end text-center relative z-10">
          <div>
            <div className="border-b border-slate-400 pb-1 mb-1 font-serif italic text-sm sm:text-base font-bold text-slate-800">
              Fitria Rakhmawati
            </div>
            <p className="text-[10px] uppercase font-bold text-slate-500">
              IGCSE Mathematics Teacher
            </p>
          </div>

          <div className="hidden sm:block">
            <div className="w-16 h-16 rounded-full border-2 border-amber-500 border-dashed mx-auto flex items-center justify-center p-1 bg-amber-50">
              <span className="text-[9px] font-black text-amber-800 uppercase tracking-tighter text-center leading-none">
                0580<br />SYMMETRY<br />VERIFIED
              </span>
            </div>
          </div>

          <div>
            <div className="border-b border-slate-400 pb-1 mb-1 font-mono text-xs text-slate-700">
              {currentDate}
            </div>
            <p className="text-[10px] uppercase font-bold text-slate-500">
              Verification & Certification Date
            </p>
          </div>
        </div>
      </div>

      <PdfModal
        isOpen={pdfModal.isOpen}
        onClose={() => setPdfModal((prev) => ({ ...prev, isOpen: false }))}
        pdfUrl={pdfModal.url}
        filename={pdfModal.filename}
        title={pdfModal.title}
        studentName={studentName}
        scoreText={`${totalScore}/100`}
      />
    </div>
  );
};
