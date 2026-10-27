/**
 * IGCSE Mathematics 0580 – Topic 19: Symmetry
 * Interactive Masterclass for Middle-to-Low Ability Students
 * 
 * Features:
 * - Line, Rotational, and 3D Plane Symmetry interactive visualizers
 * - 10-Question Final Assessment with adaptive scoring (10/10/9/8 points)
 * - TTS Voice Narration (Web Speech API) & synthesized audio effects (Web Audio API)
 * - Celebration Confetti & Mascot Praise
 * - PDF Generation for sections and report card (jsPDF & html2canvas)
 * - Persistent progress via localStorage
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { StartScreen } from './components/StartScreen';
import { SectionLineSymmetry } from './components/SectionLineSymmetry';
import { SectionRotationalSymmetry } from './components/SectionRotationalSymmetry';
import { SectionPlaneSymmetry } from './components/SectionPlaneSymmetry';
import { SectionAssessment } from './components/SectionAssessment';
import { Celebration } from './components/Celebration';
import { OfficialCertificateView } from './components/OfficialCertificateView';
import { StudentProgress } from './types';
import { ASSESSMENT_QUESTIONS } from './data/assessmentData';

const STORAGE_KEY = 'igcse_0580_symmetry_progress';

export default function App() {
  const [studentProgress, setStudentProgress] = useState<StudentProgress | null>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [celebrationActive, setCelebrationActive] = useState(false);
  const [celebrationMessage, setCelebrationMessage] = useState('');
  const [isReportView, setIsReportView] = useState(false);

  // Initial load from localStorage & URL check
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: StudentProgress = JSON.parse(saved);
        setStudentProgress(parsed);
      }
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        if (params.get('report') === 'true' || params.get('certificate') === 'true') {
          setIsReportView(true);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  // Save progress helper
  const saveProgressToStorage = (updated: StudentProgress) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setStudentProgress(updated);
    } catch (err) {
      console.warn('Could not save to localStorage:', err);
    }
  };

  const handleStartLearning = (name: string, continueFromSaved = false) => {
    if (continueFromSaved && studentProgress && studentProgress.name === name) {
      setHasStarted(true);
      return;
    }

    const newProgress: StudentProgress = {
      name,
      currentSection: 1,
      completedSections: [],
      practiceAnswers: {},
      assessmentAttempts: {},
      assessmentAnswers: {},
      assessmentScore: 0,
      assessmentCompleted: false,
      lastUpdated: new Date().toISOString(),
    };

    saveProgressToStorage(newProgress);
    setHasStarted(true);
  };

  const handleSelectSection = (secNum: number) => {
    if (!studentProgress) return;
    const updated: StudentProgress = {
      ...studentProgress,
      currentSection: secNum,
      lastUpdated: new Date().toISOString(),
    };
    saveProgressToStorage(updated);
  };

  const markSectionCompleted = (secNum: number, nextSecNum?: number) => {
    if (!studentProgress) return;
    const completedSet = new Set(studentProgress.completedSections);
    completedSet.add(secNum);

    const updated: StudentProgress = {
      ...studentProgress,
      completedSections: Array.from(completedSet),
      currentSection: nextSecNum || Math.min(4, secNum + 1),
      lastUpdated: new Date().toISOString(),
    };
    saveProgressToStorage(updated);
    triggerCelebration(`Section ${secNum} Completed! On to the next step! 🚀`);
  };

  const handleResetProgress = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    setStudentProgress(null);
    setHasStarted(false);
  };

  const triggerCelebration = (msg?: string) => {
    setCelebrationMessage(msg || '');
    setCelebrationActive(true);
  };

  const handleUpdateAssessment = (
    attempts: Record<number, number>,
    answers: Record<number, number>,
    score: number,
    completed: boolean
  ) => {
    if (!studentProgress) return;
    const completedSet = new Set(studentProgress.completedSections);
    if (completed) {
      completedSet.add(4);
    }
    const updated: StudentProgress = {
      ...studentProgress,
      assessmentAttempts: attempts,
      assessmentAnswers: answers,
      assessmentScore: score,
      assessmentCompleted: completed,
      completedSections: Array.from(completedSet),
      lastUpdated: new Date().toISOString(),
    };
    saveProgressToStorage(updated);
  };

  if (isReportView) {
    const studentName = studentProgress?.name || 'Candidate';
    const attempts = studentProgress?.assessmentAttempts || {};
    const answers = studentProgress?.assessmentAnswers || {};

    const getPoints = (att: number): number => {
      if (att <= 2) return 10;
      if (att === 3) return 9;
      return 8;
    };

    const calculatedScore = Object.keys(answers).length > 0
      ? Object.keys(answers).reduce((sum, qIdStr) => {
          const qId = parseInt(qIdStr);
          return sum + getPoints(attempts[qId] || 1);
        }, 0)
      : studentProgress?.assessmentScore || 100;

    const breakdown = {
      line: { earned: 0, total: 40 },
      rotational: { earned: 0, total: 30 },
      plane: { earned: 0, total: 30 },
    };

    ASSESSMENT_QUESTIONS.forEach((q) => {
      const att = attempts[q.id] || 1;
      const pts = getPoints(att);
      breakdown[q.section].earned += pts;
    });

    const gradeBadge = calculatedScore >= 95
      ? 'IGCSE Symmetry Master (Grade 9 / A*)'
      : calculatedScore >= 85
      ? 'High Achiever (Grade 8 / A)'
      : 'Certified Symmetry Explorer';

    const feedback = calculatedScore >= 95
      ? `Phenomenal performance, ${studentName}! You mastered every concept in Topic 19: line symmetry, rotational order, and 3D plane symmetry. You are completely ready for your IGCSE exam!`
      : calculatedScore >= 85
      ? `Fantastic achievement, ${studentName}! You have a solid grasp of 2D reflection, rotational angles, and 3D planes.`
      : `Well done on finishing all 10 exam questions, ${studentName}! You persevered and corrected every mistake.`;

    return (
      <div className="min-h-screen bg-[#f0f9ff] py-8 px-4 flex flex-col items-center justify-center">
        <OfficialCertificateView
          studentName={studentName}
          totalScore={calculatedScore}
          gradeBadge={gradeBadge}
          feedbackText={feedback}
          sectionBreakdown={breakdown}
          attemptsMap={attempts}
          isStandalone={true}
          onClose={() => {
            window.location.href = window.location.pathname;
          }}
        />
      </div>
    );
  }

  if (!hasStarted) {
    return (
      <StartScreen
        onStart={handleStartLearning}
        savedName={studentProgress?.name}
        savedSection={studentProgress?.currentSection}
      />
    );
  }

  const activeSection = studentProgress?.currentSection || 1;
  const studentName = studentProgress?.name || 'Student';

  return (
    <div className="min-h-screen bg-[#f0f9ff] text-slate-800 flex flex-col selection:bg-amber-200">
      {/* Confetti & Mascot Celebration overlay */}
      <Celebration
        active={celebrationActive}
        studentName={studentName}
        message={celebrationMessage}
        onFinished={() => setCelebrationActive(false)}
      />

      {/* Top Navbar */}
      <Navbar
        studentName={studentName}
        currentSection={activeSection}
        completedSections={studentProgress?.completedSections || []}
        onSelectSection={handleSelectSection}
        onResetProgress={handleResetProgress}
        score={studentProgress?.assessmentScore || 0}
      />

      {/* Main Learning Content Area */}
      <main className="flex-1 px-4 sm:px-6 py-6 sm:py-8">
        {activeSection === 1 && (
          <SectionLineSymmetry
            studentName={studentName}
            onComplete={() => markSectionCompleted(1, 2)}
            onSaveProgress={() => studentProgress && saveProgressToStorage(studentProgress)}
            onTriggerCelebration={triggerCelebration}
          />
        )}

        {activeSection === 2 && (
          <SectionRotationalSymmetry
            studentName={studentName}
            onComplete={() => markSectionCompleted(2, 3)}
            onSaveProgress={() => studentProgress && saveProgressToStorage(studentProgress)}
            onTriggerCelebration={triggerCelebration}
          />
        )}

        {activeSection === 3 && (
          <SectionPlaneSymmetry
            studentName={studentName}
            onComplete={() => markSectionCompleted(3, 4)}
            onSaveProgress={() => studentProgress && saveProgressToStorage(studentProgress)}
            onTriggerCelebration={triggerCelebration}
          />
        )}

        {activeSection === 4 && (
          <SectionAssessment
            studentName={studentName}
            savedAttempts={studentProgress?.assessmentAttempts || {}}
            savedAnswers={studentProgress?.assessmentAnswers || {}}
            savedScore={studentProgress?.assessmentScore || 0}
            isCompleted={studentProgress?.assessmentCompleted || false}
            onUpdateAssessmentState={handleUpdateAssessment}
            onTriggerCelebration={triggerCelebration}
          />
        )}
      </main>

      {/* Teacher Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 px-6 text-center text-xs text-slate-500 font-medium">
        <p>
          IGCSE Mathematics 0580 • Topic 19: Symmetry • Teacher: <strong>Fitria Rakhmawati</strong> • Interactive classroom & independent study suite.
        </p>
      </footer>
    </div>
  );
}
