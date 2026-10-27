// Web Audio API Synthesizer & Web Speech API Manager

let audioCtx: AudioContext | null = null;
let isAudioMuted = false;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function setMuteState(muted: boolean) {
  isAudioMuted = muted;
  if (muted) {
    stopSpeech();
  }
}

export function getMuteState(): boolean {
  return isAudioMuted;
}

// Gentle pleasant chime for correct answers
export function playCorrectSound() {
  if (isAudioMuted) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    // Major chord arpeggio: C5 (523.25), E5 (659.25), G5 (783.99), C6 (1046.50)
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      gain.gain.setValueAtTime(0.001, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.2, now + idx * 0.08 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.4);
    });
  } catch {
    // Ignore audio errors on restricted platforms
  }
}

// Soft gentle tone for wrong answers (not jarring or punishing)
export function playWrongSound() {
  if (isAudioMuted) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const notes = [330, 260];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.12);

      gain.gain.setValueAtTime(0.001, now + idx * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.12, now + idx * 0.12 + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.12 + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.12);
      osc.stop(now + idx * 0.12 + 0.35);
    });
  } catch {
    // Ignore audio errors
  }
}

// Convert math LaTeX and symbols into natural English for TTS
export function cleanTextForSpeech(raw: string): string {
  return raw
    .replace(/\\dfrac\{([^}]+)\}\{([^}]+)\}/g, '$1 divided by $2')
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '$1 divided by $2')
    .replace(/360\^\\circ/g, '360 degrees')
    .replace(/180\^\\circ/g, '180 degrees')
    .replace(/90\^\\circ/g, '90 degrees')
    .replace(/45\^\\circ/g, '45 degrees')
    .replace(/60\^\\circ/g, '60 degrees')
    .replace(/120\^\\circ/g, '120 degrees')
    .replace(/\^\\circ/g, ' degrees')
    .replace(/\\div/g, ' divided by ')
    .replace(/\\times/g, ' times ')
    .replace(/\\approx/g, ' approximately ')
    .replace(/\\le/g, ' less than or equal to ')
    .replace(/\\ge/g, ' greater than or equal to ')
    .replace(/\\neq/g, ' not equal to ')
    .replace(/\\pm/g, ' plus or minus ')
    .replace(/\$/g, '')
    .replace(/\\text\{([^}]+)\}/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

let activeUtterance: SpeechSynthesisUtterance | null = null;
let speechCallbacks: { onStart?: () => void; onEnd?: () => void } | null = null;

export function speakText(
  text: string,
  callbacks?: { onStart?: () => void; onEnd?: () => void; onError?: () => void }
) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  if (isAudioMuted) return;

  stopSpeech();

  const cleaned = cleanTextForSpeech(text);
  const utterance = new SpeechSynthesisUtterance(cleaned);
  utterance.rate = 0.9; // Friendly, slightly slower pace for easy understanding
  utterance.pitch = 1.05; // Warm, friendly tone
  utterance.lang = 'en-US';

  speechCallbacks = callbacks || null;

  utterance.onstart = () => {
    speechCallbacks?.onStart?.();
  };

  utterance.onend = () => {
    activeUtterance = null;
    speechCallbacks?.onEnd?.();
  };

  utterance.onerror = () => {
    activeUtterance = null;
    callbacks?.onError?.();
    speechCallbacks?.onEnd?.();
  };

  activeUtterance = utterance;
  window.speechSynthesis.speak(utterance);
}

export function pauseSpeech() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.pause();
  }
}

export function resumeSpeech() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.resume();
  }
}

export function stopSpeech() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    activeUtterance = null;
    speechCallbacks?.onEnd?.();
  }
}
