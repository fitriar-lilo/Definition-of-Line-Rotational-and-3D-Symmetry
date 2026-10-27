import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, Trophy, Star } from 'lucide-react';

interface CelebrationProps {
  active: boolean;
  studentName?: string;
  message?: string;
  onFinished?: () => void;
}

export const triggerConfetti = () => {
  if (typeof window !== 'undefined') {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#38bdf8', '#34d399', '#fbbf24', '#f472b6', '#a78bfa'],
      });
    } catch {
      // ignore
    }
  }
};

export const Celebration: React.FC<CelebrationProps> = ({
  active,
  studentName = 'Student',
  message,
  onFinished,
}) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (active) {
      setVisible(true);
      triggerConfetti();
      const timer = setTimeout(() => {
        setVisible(false);
        onFinished?.();
      }, 1600);
      return () => clearTimeout(timer);
    }
  }, [active, onFinished]);

  if (!visible) return null;

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none transition-all duration-300 animate-bounce">
      <div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 text-white font-bold shadow-xl border-2 border-white/80">
        <div className="p-1.5 bg-white/20 rounded-full">
          <Star className="w-5 h-5 text-yellow-100 fill-yellow-200" />
        </div>
        <div>
          <p className="text-base font-extrabold tracking-wide drop-shadow-sm">
            {message || `Brilliant job, ${studentName}!`}
          </p>
        </div>
        <Sparkles className="w-5 h-5 text-yellow-200 animate-pulse" />
      </div>
    </div>
  );
};
