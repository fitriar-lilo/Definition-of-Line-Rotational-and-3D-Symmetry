import React from 'react';
import { Download, Printer, X, FileText, CheckCircle2, Sparkles, ExternalLink } from 'lucide-react';

interface PdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  pdfUrl: string | null;
  filename: string;
  title: string;
  studentName: string;
  scoreText?: string;
}

export const PdfModal: React.FC<PdfModalProps> = ({
  isOpen,
  onClose,
  pdfUrl,
  filename,
  title,
  studentName,
  scoreText,
}) => {
  if (!isOpen || !pdfUrl) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 text-center relative animate-in fade-in zoom-in-95 duration-200 my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon */}
        <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-3 shadow-inner">
          <FileText className="w-7 h-7" />
        </div>

        <span className="inline-block px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-extrabold uppercase tracking-wider mb-1">
          PDF Ready to Save
        </span>

        <h3 className="text-xl sm:text-2xl font-black text-slate-900">
          {title}
        </h3>

        <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-md mx-auto">
          Candidate: <strong className="text-slate-800">{studentName}</strong>
          {scoreText ? ` • Overall Score: ${scoreText}` : ''}
        </p>

        {/* Embedded PDF Preview iframe */}
        <div className="my-4 rounded-2xl overflow-hidden border-2 border-slate-200 bg-slate-50 shadow-inner">
          <iframe
            src={pdfUrl}
            className="w-full h-64 sm:h-80"
            title="Assessment Report PDF Preview"
          />
        </div>

        {/* Instructions banner */}
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-left mb-4">
          <p className="text-xs text-amber-900 font-semibold flex items-start gap-1.5">
            <span className="text-base shrink-0 leading-none">💡</span>
            <span>
              <strong>Tip for downloading:</strong> Click <strong>"Save as PDF (Print Dialog)"</strong> below, then choose <strong>"Save as PDF"</strong> in the destination menu to save it directly to your device!
            </span>
          </p>
        </div>

        {/* Primary Action Buttons */}
        <div className="space-y-2.5">
          <button
            onClick={() => {
              try {
                window.print();
              } catch (err) {
                console.warn('Sandbox blocked print():', err);
              }
            }}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white font-extrabold text-base shadow-md hover:shadow-lg flex items-center justify-center gap-2.5 transition transform hover:-translate-y-0.5 cursor-pointer"
          >
            <Printer className="w-5 h-5 text-yellow-100" />
            <span>Save as PDF (Print Dialog)</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <a
              href={pdfUrl}
              download={filename}
              className="py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition no-underline cursor-pointer"
            >
              <Download className="w-4 h-4 text-emerald-600" />
              <span>Direct File Save</span>
            </a>

            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition no-underline cursor-pointer"
            >
              <ExternalLink className="w-4 h-4 text-sky-600" />
              <span>Open in New Tab</span>
            </a>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 text-center">
          <p className="text-[11px] text-slate-400">
            File name: <span className="font-mono text-slate-600">{filename}</span>
          </p>
          <button
            onClick={onClose}
            className="mt-2 text-xs font-bold text-slate-500 hover:text-slate-800 underline cursor-pointer"
          >
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
};
