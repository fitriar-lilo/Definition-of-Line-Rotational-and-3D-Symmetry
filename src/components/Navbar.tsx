import React, { useState } from 'react';
import { Volume2, VolumeX, CheckCircle, RotateCcw, Award, Sparkles, BookOpen } from 'lucide-react';
import { setMuteState, getMuteState } from '../utils/audio';

interface NavbarProps {
  studentName: string;
  currentSection: number;
  completedSections: number[];
  onSelectSection: (sectionNumber: number) => void;
  onResetProgress: () => void;
  score: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  studentName,
  currentSection,
  completedSections,
  onSelectSection,
  onResetProgress,
  score,
}) => {
  const [isMuted, setIsMuted] = useState(getMuteState());
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    setMuteState(next);
  };

  const sections = [
    { id: 1, label: '1. Line Symmetry', color: 'sky' },
    { id: 2, label: '2. Rotational', color: 'emerald' },
    { id: 3, label: '3. 3D Plane', color: 'purple' },
    { id: 4, label: '4. Assessment', color: 'amber' },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-sky-100 shadow-xs">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 py-2.5">
          {/* Top row: Brand + Student + Actions */}
          <div className="flex items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center text-white shadow-xs">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-sm sm:text-base font-extrabold text-slate-800 leading-tight">
                  IGCSE Math 0580 <span className="text-sky-600">Topic 19: Symmetry</span>
                </h1>
                <p className="text-xs text-slate-500 hidden sm:block">
                  Teacher: <strong className="text-slate-700">Fitria Rakhmawati</strong> • Interactive symmetry lessons
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Student pill */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200/80 rounded-full text-xs sm:text-sm font-bold text-amber-900">
                <span>👋 Hi, <span className="text-amber-700 underline decoration-amber-300 decoration-2">{studentName}</span>!</span>
              </div>

              {/* Assessment score pill if completed or started */}
              {completedSections.includes(4) ? (
                <button
                  onClick={() => onSelectSection(4)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-full text-xs font-extrabold transition shadow-xs cursor-pointer"
                  title="View and Download Final Score Report"
                >
                  <Award className="w-3.5 h-3.5 text-yellow-200" />
                  <span>Report: {score}/100 📄</span>
                </button>
              ) : score > 0 ? (
                <div className="hidden md:inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 border border-emerald-200 rounded-full text-xs font-bold text-emerald-800">
                  <Award className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{score} pts</span>
                </div>
              ) : null}

              {/* Audio Mute toggle */}
              <button
                onClick={toggleMute}
                title={isMuted ? 'Unmute sounds & voice' : 'Mute sounds & voice'}
                aria-label="Toggle mute"
                className={`p-2 rounded-xl transition cursor-pointer border ${
                  isMuted
                    ? 'bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>

              {/* Reset progress */}
              <button
                onClick={() => setShowConfirmReset(true)}
                title="Reset my progress"
                aria-label="Reset progress"
                className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Navigation tabs */}
          <nav aria-label="Sections navigation" className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 scrollbar-none">
            {sections.map((sec) => {
              const isCurrent = currentSection === sec.id;
              const isCompleted = completedSections.includes(sec.id);

              return (
                <button
                  key={sec.id}
                  onClick={() => onSelectSection(sec.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer select-none border ${
                    isCurrent
                      ? 'bg-sky-600 text-white border-sky-600 shadow-sm'
                      : isCompleted
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {isCompleted && (
                    <CheckCircle className={`w-3.5 h-3.5 ${isCurrent ? 'text-emerald-200' : 'text-emerald-600'}`} />
                  )}
                  <span>{sec.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Confirmation Modal for Reset */}
      {showConfirmReset && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <RotateCcw className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">Reset your progress?</h3>
            <p className="text-sm text-slate-500 mb-5">
              This will clear your saved answers, practice score, and assessment score for {studentName}.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowConfirmReset(false)}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowConfirmReset(false);
                  onResetProgress();
                }}
                className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 text-white font-bold hover:bg-rose-700 transition shadow-sm cursor-pointer"
              >
                Yes, Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
