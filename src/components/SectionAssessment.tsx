import React, { useState } from 'react';
import { 
  Trophy, CheckCircle, AlertCircle, ArrowRight, ArrowLeft, RefreshCw, 
  Download, Award, Sparkles, Star, Lightbulb, BookOpen, Layers 
} from 'lucide-react';
import { ASSESSMENT_QUESTIONS } from '../data/assessmentData';
import { MathView } from './MathView';
import { AudioButton } from './AudioButton';
import { playCorrectSound, playWrongSound } from '../utils/audio';
import { createAssessmentReportPdf } from '../utils/pdf';
import { PdfModal } from './PdfModal';
import { OfficialCertificateView } from './OfficialCertificateView';

interface SectionAssessmentProps {
  studentName: string;
  savedAttempts: Record<number, number>;
  savedAnswers: Record<number, number>;
  savedScore: number;
  isCompleted: boolean;
  onUpdateAssessmentState: (
    attempts: Record<number, number>,
    answers: Record<number, number>,
    totalScore: number,
    completed: boolean
  ) => void;
  onTriggerCelebration: (msg?: string) => void;
}

export const SectionAssessment: React.FC<SectionAssessmentProps> = ({
  studentName,
  savedAttempts,
  savedAnswers,
  savedScore,
  isCompleted: initialCompleted,
  onUpdateAssessmentState,
  onTriggerCelebration,
}) => {
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [attemptsMap, setAttemptsMap] = useState<Record<number, number>>(savedAttempts || {});
  const [answersMap, setAnswersMap] = useState<Record<number, number>>(savedAnswers || {});
  const [disabledOptionsMap, setDisabledOptionsMap] = useState<Record<number, number[]>>({});
  const [hintsMap, setHintsMap] = useState<Record<number, boolean>>({});
  const [isAssessmentDone, setIsAssessmentDone] = useState(initialCompleted || false);

  const currentQ = ASSESSMENT_QUESTIONS[currentQIndex];
  const qAttempts = attemptsMap[currentQ.id] || 0;
  const isQAnsweredCorrectly = answersMap[currentQ.id] !== undefined;

  // Calculate score for a given question based on attempts:
  // 1 or 2 attempts -> 10 pts
  // 3 attempts      -> 9 pts
  // 4+ attempts     -> 8 pts
  const getPointsForAttempts = (attempts: number): number => {
    if (attempts <= 2) return 10;
    if (attempts === 3) return 9;
    return 8;
  };

  // Calculate current total score
  const totalScore = Object.keys(answersMap).reduce((sum, qIdStr) => {
    const qId = parseInt(qIdStr);
    const att = attemptsMap[qId] || 1;
    return sum + getPointsForAttempts(att);
  }, 0);

  // Section breakdown scores
  const sectionBreakdown = (() => {
    const res = {
      line: { earned: 0, total: 40, count: 0 },
      rotational: { earned: 0, total: 30, count: 0 },
      plane: { earned: 0, total: 30, count: 0 },
    };

    ASSESSMENT_QUESTIONS.forEach((q) => {
      if (answersMap[q.id] !== undefined) {
        const pts = getPointsForAttempts(attemptsMap[q.id] || 1);
        res[q.section].earned += pts;
        res[q.section].count += 1;
      }
    });

    return res;
  })();

  const handleSelectOption = (optionIndex: number) => {
    if (isQAnsweredCorrectly) return;

    const nextAttempts = qAttempts + 1;
    const newAttemptsMap = { ...attemptsMap, [currentQ.id]: nextAttempts };
    setAttemptsMap(newAttemptsMap);

    if (optionIndex === currentQ.correctIndex) {
      // Correct!
      const newAnswersMap = { ...answersMap, [currentQ.id]: optionIndex };
      setAnswersMap(newAnswersMap);
      playCorrectSound();

      const earnedPts = getPointsForAttempts(nextAttempts);
      onTriggerCelebration(`+${earnedPts} points! Great job, ${studentName}! 🏆`);

      const allDone = Object.keys(newAnswersMap).length === ASSESSMENT_QUESTIONS.length;
      if (allDone) {
        setIsAssessmentDone(true);
      }

      const newTotal = Object.keys(newAnswersMap).reduce((sum, idStr) => {
        const id = parseInt(idStr);
        return sum + getPointsForAttempts(newAttemptsMap[id] || 1);
      }, 0);

      onUpdateAssessmentState(newAttemptsMap, newAnswersMap, newTotal, allDone);
    } else {
      // Incorrect: disable this option button, show hint
      playWrongSound();
      setDisabledOptionsMap((prev) => ({
        ...prev,
        [currentQ.id]: [...(prev[currentQ.id] || []), optionIndex],
      }));
      setHintsMap((prev) => ({ ...prev, [currentQ.id]: true }));
      onUpdateAssessmentState(newAttemptsMap, answersMap, totalScore, false);
    }
  };

  const handleRestartAssessment = () => {
    setAttemptsMap({});
    setAnswersMap({});
    setDisabledOptionsMap({});
    setHintsMap({});
    setCurrentQIndex(0);
    setIsAssessmentDone(false);
    onUpdateAssessmentState({}, {}, 0, false);
  };

  const optionLetters = ['A', 'B', 'C', 'D'];

  // Final Grade and Feedback Message
  const getTeacherFeedback = (score: number) => {
    if (score >= 95) {
      return {
        badge: 'IGCSE Symmetry Master (Grade 9 / A*)',
        text: `Phenomenal performance, ${studentName}! You mastered every concept in Topic 19: line symmetry, rotational order, and 3D plane symmetry. You are completely ready for your IGCSE exam!`,
        color: 'from-amber-500 to-yellow-500',
      };
    }
    if (score >= 85) {
      return {
        badge: 'High Achiever (Grade 8 / A)',
        text: `Fantastic achievement, ${studentName}! You have a solid grasp of 2D reflection, rotational angles, and 3D planes. A quick review of any multi-attempt question will make you unbeatable!`,
        color: 'from-emerald-500 to-teal-600',
      };
    }
    return {
      badge: 'Certified Symmetry Explorer',
      text: `Well done on finishing all 10 exam questions, ${studentName}! You persevered and corrected every mistake. Keep practicing and reviewing the worked examples to build even faster confidence!`,
      color: 'from-sky-500 to-blue-600',
    };
  };

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

  // Official Vector PDF Report Generator
  const handleDownloadVectorPdf = () => {
    const feedback = getTeacherFeedback(totalScore);
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
      gradeBadge: feedback.badge,
      feedbackText: feedback.text,
      sections: {
        line: { earned: sectionBreakdown.line.earned, total: sectionBreakdown.line.total },
        rotational: { earned: sectionBreakdown.rotational.earned, total: sectionBreakdown.rotational.total },
        plane: { earned: sectionBreakdown.plane.earned, total: sectionBreakdown.plane.total },
      },
      questionsLog,
    });

    setPdfModal({
      isOpen: true,
      url: result.url,
      filename: result.filename,
      title: 'IGCSE Symmetry Final Assessment Report',
    });
  };

  return (
    <div id="section-assessment-content" className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Assessment Hero Banner (hidden on print) */}
      <div className="no-print bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
              <span>Section 4 of 4 • Final Assessment</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              IGCSE 0580 Symmetry Assessment
            </h2>
            <p className="text-amber-100 text-sm sm:text-base mt-1 max-w-xl">
              10 exam-style multiple-choice questions. Retry until you succeed! Earn <strong>10 pts</strong> (attempt 1–2), <strong>9 pts</strong> (attempt 3), or <strong>8 pts</strong> (attempt 4+).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-2xl text-center">
              <span className="text-xs uppercase font-extrabold text-amber-200 block">Score</span>
              <span className="text-2xl font-black">{totalScore} / 100</span>
            </div>
          </div>
        </div>
      </div>

      {/* IF ALL 10 QUESTIONS ARE COMPLETED: SHOW REPORT CARD & CERTIFICATE */}
      {isAssessmentDone ? (
        <OfficialCertificateView
          studentName={studentName}
          totalScore={totalScore}
          gradeBadge={getTeacherFeedback(totalScore).badge}
          feedbackText={getTeacherFeedback(totalScore).text}
          sectionBreakdown={sectionBreakdown}
          attemptsMap={attemptsMap}
          onRetake={handleRestartAssessment}
        />
      ) : (
        /* ACTIVE QUESTION CARD VIEW */
        <div className="space-y-6">
          {/* Question Nav Strip */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {ASSESSMENT_QUESTIONS.map((q, idx) => {
              const isDone = answersMap[q.id] !== undefined;
              const isCurrent = currentQIndex === idx;

              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentQIndex(idx)}
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center transition cursor-pointer shrink-0 border ${
                    isCurrent
                      ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                      : isDone
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {q.id}
                </button>
              );
            })}
          </div>

          {/* Active Question Box */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            {/* Header: Question Number + Difficulty + Attempt Counter */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 font-extrabold flex items-center justify-center text-sm">
                  Q{currentQ.id}
                </span>
                <div>
                  <h3 className="text-base font-extrabold text-slate-800">
                    Question {currentQ.id} of {ASSESSMENT_QUESTIONS.length}
                  </h3>
                  <span className="text-xs font-semibold text-slate-400">
                    Topic: {currentQ.topicLabel} • Level: {currentQ.difficulty}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700">
                  Current attempt: <strong className="text-amber-700">{qAttempts + (isQAnsweredCorrectly ? 0 : 1)}</strong>
                </span>
                <AudioButton textToRead={currentQ.speechText} size="sm" />
              </div>
            </div>

            {/* Question Text */}
            <p className="text-base sm:text-lg font-bold text-slate-800 leading-relaxed">
              {currentQ.question}
            </p>

            {/* Optional SVG Diagram */}
            {currentQ.diagramSvg && (
              <div
                className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-center"
                dangerouslySetInnerHTML={{ __html: currentQ.diagramSvg }}
              />
            )}

            {/* 4 Multi-Choice Option Buttons (A - D) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentQ.options.map((opt, oIdx) => {
                const isChosen = answersMap[currentQ.id] === oIdx;
                const isDisabled = disabledOptionsMap[currentQ.id]?.includes(oIdx);
                const isCorrectOption = oIdx === currentQ.correctIndex;

                return (
                  <button
                    key={oIdx}
                    onClick={() => handleSelectOption(oIdx)}
                    disabled={isQAnsweredCorrectly || isDisabled}
                    className={`p-4 rounded-2xl text-left font-bold text-sm sm:text-base transition-all flex items-center gap-3 border ${
                      isQAnsweredCorrectly && isCorrectOption
                        ? 'bg-emerald-500 text-white border-emerald-600 shadow-sm'
                        : isDisabled
                        ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed line-through opacity-60'
                        : 'bg-white text-slate-800 border-slate-200 hover:bg-amber-50/50 hover:border-amber-300 cursor-pointer'
                    }`}
                  >
                    <span
                      className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-extrabold shrink-0 ${
                        isQAnsweredCorrectly && isCorrectOption
                          ? 'bg-white text-emerald-700'
                          : isDisabled
                          ? 'bg-slate-200 text-slate-400'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {optionLetters[oIdx]}
                    </span>
                    <span>{opt}</span>
                  </button>
                );
              })}
            </div>

            {/* Feedback & Hint block */}
            <div className="pt-2">
              {isQAnsweredCorrectly && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-1 animate-in fade-in">
                  <div className="flex items-center gap-2 font-extrabold text-sm text-emerald-800">
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                    <span>Correct! +{getPointsForAttempts(qAttempts)} Points Earned!</span>
                  </div>
                  <p className="text-xs sm:text-sm font-medium">{currentQ.explanation}</p>
                </div>
              )}

              {!isQAnsweredCorrectly && hintsMap[currentQ.id] && (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 space-y-1 animate-in fade-in">
                  <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-amber-800">
                    <Lightbulb className="w-4 h-4 text-amber-600" />
                    <span>Teacher Hint (Try another option!):</span>
                  </div>
                  <p className="text-xs sm:text-sm font-medium">{currentQ.hint}</p>
                </div>
              )}
            </div>

            {/* Bottom Step Navigation */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                onClick={() => setCurrentQIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentQIndex === 0}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs sm:text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition cursor-pointer flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <button
                onClick={() =>
                  setCurrentQIndex((prev) =>
                    Math.min(ASSESSMENT_QUESTIONS.length - 1, prev + 1)
                  )
                }
                disabled={currentQIndex === ASSESSMENT_QUESTIONS.length - 1}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs sm:text-sm shadow-xs disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer flex items-center gap-1.5"
              >
                <span>Next Question</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PDF Ready Download Modal */}
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
