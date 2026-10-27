import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Pause, Play, Square } from 'lucide-react';
import { speakText, stopSpeech, pauseSpeech, resumeSpeech } from '../utils/audio';

interface AudioButtonProps {
  textToRead: string;
  label?: string;
  size?: 'sm' | 'md';
}

export const AudioButton: React.FC<AudioButtonProps> = ({
  textToRead,
  label = 'Listen',
  size = 'md',
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    return () => {
      // Clean up on unmount
      if (isPlaying) {
        stopSpeech();
      }
    };
  }, [isPlaying]);

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPlaying && isPaused) {
      resumeSpeech();
      setIsPaused(false);
      return;
    }

    if (isPlaying) {
      stopSpeech();
      setIsPlaying(false);
      setIsPaused(false);
      return;
    }

    setIsPlaying(true);
    setIsPaused(false);
    speakText(textToRead, {
      onStart: () => {
        setIsPlaying(true);
        setIsPaused(false);
      },
      onEnd: () => {
        setIsPlaying(false);
        setIsPaused(false);
      },
      onError: () => {
        setIsPlaying(false);
        setIsPaused(false);
      },
    });
  };

  const handlePause = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPaused) {
      resumeSpeech();
      setIsPaused(false);
    } else {
      pauseSpeech();
      setIsPaused(true);
    }
  };

  const handleStop = (e: React.MouseEvent) => {
    e.stopPropagation();
    stopSpeech();
    setIsPlaying(false);
    setIsPaused(false);
  };

  const isSmall = size === 'sm';

  return (
    <div className="inline-flex items-center gap-1.5 bg-sky-50 border border-sky-200 rounded-full px-2.5 py-1 text-sky-800 shadow-xs hover:bg-sky-100 transition-colors">
      <button
        onClick={handlePlay}
        title={isPlaying ? 'Stop voice reading' : 'Read explanation aloud'}
        aria-label="Listen to explanation"
        className="inline-flex items-center gap-1.5 font-bold text-xs sm:text-sm cursor-pointer select-none"
      >
        <Volume2 className={`${isSmall ? 'w-3.5 h-3.5' : 'w-4 h-4'} ${isPlaying ? 'text-blue-600 animate-pulse' : 'text-sky-700'}`} />
        <span>{isPlaying ? (isPaused ? 'Paused' : 'Playing...') : label}</span>
      </button>

      {isPlaying && (
        <div className="flex items-center gap-1 pl-1 border-l border-sky-200">
          <button
            onClick={handlePause}
            className="p-1 rounded-full hover:bg-sky-200 text-sky-700 transition"
            title={isPaused ? 'Resume' : 'Pause'}
            aria-label={isPaused ? 'Resume reading' : 'Pause reading'}
          >
            {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={handleStop}
            className="p-1 rounded-full hover:bg-sky-200 text-rose-600 transition"
            title="Stop"
            aria-label="Stop reading"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
          </button>
        </div>
      )}
    </div>
  );
};
