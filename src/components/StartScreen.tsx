import React, { useState } from 'react';
import { Sparkles, ArrowRight, BookOpen, RotateCw, Box, CheckCircle2, History, RotateCcw } from 'lucide-react';

interface StartScreenProps {
  onStart: (name: string, continueFromSaved?: boolean) => void;
  savedName?: string;
  savedSection?: number;
}

export const StartScreen: React.FC<StartScreenProps> = ({
  onStart,
  savedName = '',
  savedSection = 1,
}) => {
  const [name, setName] = useState(savedName);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setErrorMessage('Please enter your name so your teacher can give you credit!');
      return;
    }
    setErrorMessage('');
    onStart(trimmed, false);
  };

  const handleContinue = () => {
    if (savedName) {
      onStart(savedName, true);
    }
  };

  const getSectionName = (secNum: number) => {
    switch (secNum) {
      case 1:
        return 'Section 1: Line Symmetry';
      case 2:
        return 'Section 2: Rotational Symmetry';
      case 3:
        return 'Section 3: Plane Symmetry (3D)';
      case 4:
        return 'Section 4: Final Assessment';
      default:
        return 'Section 1';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#e0f2fe] via-[#f0f9ff] to-[#ecfdf5] flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-2xl w-full bg-white rounded-3xl shadow-xl border border-sky-100 overflow-hidden">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 p-6 sm:p-8 text-white text-center relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-xl pointer-events-none" />

          <div className="flex flex-wrap items-center justify-center gap-2 mb-3">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>IGCSE Mathematics 0580</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-amber-400/30 backdrop-blur-md border border-amber-300/40 rounded-full text-xs font-extrabold uppercase tracking-wider text-amber-100">
              <span>Teacher: Fitria Rakhmawati</span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-2">
            Topic 19: Symmetry
          </h1>
          <p className="text-sm sm:text-base text-sky-100 max-w-lg mx-auto font-medium">
            Welcome! Learn lines of symmetry, rotational symmetry, and 3D plane symmetry with interactive folding, spinning, and 3D slicing.
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8">
          {/* Returning Student prompt */}
          {savedName && (
            <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-left">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
                  <History className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-amber-900">
                    Welcome back, <span className="underline decoration-amber-400">{savedName}</span>!
                  </h4>
                  <p className="text-xs text-amber-800">
                    You were learning <strong>{getSectionName(savedSection)}</strong>.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleContinue}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-xs sm:text-sm shadow-sm transition cursor-pointer"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* New / Custom name form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="student-name-input" className="block text-sm font-bold text-slate-700 mb-1.5">
                What is your name?
              </label>
              <div className="relative">
                <input
                  id="student-name-input"
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder="e.g. Aisha, David, Ken..."
                  className="w-full px-4 py-3.5 rounded-2xl border-2 border-slate-200 focus:border-sky-500 focus:outline-hidden text-base font-semibold text-slate-800 bg-slate-50/50 transition"
                  autoFocus
                />
              </div>
              {errorMessage && (
                <p className="mt-1.5 text-xs sm:text-sm text-rose-600 font-semibold flex items-center gap-1">
                  <span>⚠️</span> {errorMessage}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-extrabold text-base sm:text-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{savedName && name === savedName ? 'Start Fresh with this Name' : 'Start Learning'}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>

          {/* Topic Highlights Overview */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 text-center sm:text-left">
              What you will discover:
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-3 rounded-2xl bg-sky-50 border border-sky-100 text-center">
                <BookOpen className="w-5 h-5 text-sky-600 mx-auto mb-1" />
                <p className="text-xs font-bold text-sky-900">Line Symmetry</p>
                <p className="text-[10px] text-sky-700">Fold & match halves</p>
              </div>

              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-100 text-center">
                <RotateCw className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                <p className="text-xs font-bold text-emerald-900">Rotational</p>
                <p className="text-[10px] text-emerald-700">Order & angles</p>
              </div>

              <div className="p-3 rounded-2xl bg-purple-50 border border-purple-100 text-center">
                <Box className="w-5 h-5 text-purple-600 mx-auto mb-1" />
                <p className="text-xs font-bold text-purple-900">3D Plane</p>
                <p className="text-[10px] text-purple-700">Interactive 3D slices</p>
              </div>

              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-100 text-center">
                <CheckCircle2 className="w-5 h-5 text-amber-600 mx-auto mb-1" />
                <p className="text-xs font-bold text-amber-900">Assessment</p>
                <p className="text-[10px] text-amber-700">10 exam questions</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
