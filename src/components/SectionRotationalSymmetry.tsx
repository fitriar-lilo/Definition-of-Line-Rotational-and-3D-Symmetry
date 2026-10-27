import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, ArrowRight, ArrowLeft, Lightbulb, Check, Download, Save, 
  RotateCw, Play, Pause, RefreshCw, Layers 
} from 'lucide-react';
import { MathView } from './MathView';
import { AudioButton } from './AudioButton';
import { ROTATIONAL_SHAPES_DATA, SECTION2_WORKED_EXAMPLES, SECTION2_PRACTICE } from '../data/symmetryData';
import { playCorrectSound, playWrongSound } from '../utils/audio';
import { createSection2Pdf } from '../utils/pdf';
import { PdfModal } from './PdfModal';

interface Section2Props {
  studentName: string;
  onComplete: () => void;
  onSaveProgress: () => void;
  onTriggerCelebration: (msg?: string) => void;
}

export const SectionRotationalSymmetry: React.FC<Section2Props> = ({
  studentName,
  onComplete,
  onSaveProgress,
  onTriggerCelebration,
}) => {
  // --- Rotational Interactive Animation State ---
  const [selectedShapeIndex, setSelectedShapeIndex] = useState(0);
  const [currentAngle, setCurrentAngle] = useState(0);
  const [isAutoSpinning, setIsAutoSpinning] = useState(false);

  // --- Worked Examples State ---
  const [activeExampleIndex, setActiveExampleIndex] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const [answersState, setAnswersState] = useState<
    Record<string, { selected?: number; numInput?: string; isCorrect?: boolean; showHint?: boolean; attempts: number }>
  >({});

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

  const handleDownloadSectionPdf = () => {
    const res = createSection2Pdf(studentName);
    setPdfModal({
      isOpen: true,
      url: res.url,
      filename: res.filename,
      title: 'Section 2: Rotational Symmetry Study Guide',
    });
  };

  const shape = ROTATIONAL_SHAPES_DATA[selectedShapeIndex];

  // Auto-spin animation
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isAutoSpinning) {
      interval = setInterval(() => {
        setCurrentAngle((prev) => {
          const next = (prev + 5) % 360;
          return next;
        });
      }, 40);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAutoSpinning]);

  // Count matches so far during rotation:
  // An angle matches if (angle % shape.angle) is within ±3 degrees or at 0
  const isCurrentlyMatching = (() => {
    if (shape.order === 1) {
      return currentAngle === 0 || currentAngle === 360;
    }
    const rem = currentAngle % shape.angle;
    return rem <= 3 || rem >= shape.angle - 3;
  })();

  // How many times does it match up to currentAngle?
  const matchCount = (() => {
    if (shape.order === 1) return currentAngle >= 357 ? 1 : 0;
    let count = 0;
    for (let a = shape.angle; a <= currentAngle + 2; a += shape.angle) {
      if (a <= 360) count++;
    }
    return count;
  })();

  const handleStepTurn = () => {
    const next = (currentAngle + shape.angle) % 360;
    setCurrentAngle(next === 0 && currentAngle !== 0 ? 360 : next);
    playCorrectSound();
  };

  const handleFullTurn = () => {
    setCurrentAngle(0);
    setIsAutoSpinning(true);
    setTimeout(() => {
      setIsAutoSpinning(false);
      setCurrentAngle(360);
      playCorrectSound();
      onTriggerCelebration(`Completed one full 360° turn for ${shape.name}! 🎯`);
    }, 2880);
  };

  // Practice Choice Submit
  const handleOptionSelect = (qId: string, optionIndex: number, correctIndex: number) => {
    const prev = answersState[qId] || { attempts: 0 };
    if (prev.isCorrect) return;

    const isCorrect = optionIndex === correctIndex;
    const nextAttempts = prev.attempts + 1;

    setAnswersState((s) => ({
      ...s,
      [qId]: { ...prev, selected: optionIndex, isCorrect, attempts: nextAttempts },
    }));

    if (isCorrect) {
      playCorrectSound();
      onTriggerCelebration(`Spot on, ${studentName}! 🌟`);
    } else {
      playWrongSound();
    }
  };

  // Practice Number Submit
  const handleNumberSubmit = (qId: string, correctNum: number) => {
    const prev = answersState[qId] || { attempts: 0 };
    if (prev.isCorrect) return;

    const entered = parseFloat(prev.numInput || '');
    const isCorrect = entered === correctNum;
    const nextAttempts = prev.attempts + 1;

    setAnswersState((s) => ({
      ...s,
      [qId]: { ...prev, isCorrect, attempts: nextAttempts },
    }));

    if (isCorrect) {
      playCorrectSound();
      onTriggerCelebration(`Great math calculation, ${studentName}! 🎉`);
    } else {
      playWrongSound();
    }
  };

  const correctPracticeCount = SECTION2_PRACTICE.filter((q) => answersState[q.id]?.isCorrect).length;

  return (
    <div id="section-2-content" className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Hero Header Card */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
              <span>Section 2 of 4</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Rotational Symmetry
            </h2>
            <p className="text-emerald-100 text-sm sm:text-base mt-1 max-w-xl">
              Turn a shape around its <strong>centre of rotation</strong> and count how many times it looks identical in one full turn!
            </p>
          </div>
          <div className="flex items-center gap-2">
            <AudioButton
              textToRead="Section 2: Rotational Symmetry. A shape has rotational symmetry if it fits onto its original outline more than once during a full turn of 360 degrees."
              label="Listen to Section"
            />
          </div>
        </div>
      </div>

      {/* a) LEARNING GOALS */}
      <div className="bg-white rounded-3xl p-6 border border-emerald-100 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center text-sm font-bold">a</span>
            <span>My Learning Goals</span>
          </h3>
          <AudioButton
            textToRead="By the end of this section, I can explain the centre of rotation and order of rotational symmetry, calculate the angle of rotation using 360 divided by order, and compare line symmetry with rotational symmetry."
            size="sm"
          />
        </div>
        <div className="grid sm:grid-cols-3 gap-3">
          <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-emerald-50/60 border border-emerald-100">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <p className="text-xs sm:text-sm font-semibold text-slate-700">
              I can define the <strong>centre of rotation</strong> and <strong>order of rotational symmetry</strong>.
            </p>
          </div>
          <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-emerald-50/60 border border-emerald-100">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <p className="text-xs sm:text-sm font-semibold text-slate-700">
              I can calculate the <strong>angle of rotation</strong> using <MathView math="\dfrac{360^\circ}{\text{order}}" />.
            </p>
          </div>
          <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-emerald-50/60 border border-emerald-100">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <p className="text-xs sm:text-sm font-semibold text-slate-700">
              I understand that an order of 1 means <strong>no rotational symmetry</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* b) DEFINITION IN SIMPLE WORDS + REAL-LIFE EXAMPLES */}
      <div className="bg-white rounded-3xl p-6 border border-emerald-100 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center text-sm font-bold">b</span>
            <span>Definition in Simple Words</span>
          </h3>
          <AudioButton
            textToRead="The centre of rotation is the fixed point around which the shape turns. The order of rotational symmetry is the number of times the shape fits onto itself during one full turn of 360 degrees. To find the angle between each match, divide 360 degrees by the order."
            size="sm"
          />
        </div>

        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
          <p className="text-base text-slate-800 leading-relaxed">
            Imagine putting a pin right through the middle of a shape. This fixed point is the <strong className="text-emerald-800">centre of rotation</strong>.
          </p>
          <p className="text-base text-slate-800 leading-relaxed">
            Now rotate the shape one full turn (<MathView math="360^\circ" />).
            The <strong className="text-emerald-800">order of rotational symmetry</strong> is the number of times the shape fits exactly onto its starting outline!
          </p>
          <div className="p-3 bg-white rounded-xl border border-emerald-200 mt-2 text-center">
            <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">IGCSE Key Formula</p>
            <MathView math="\text{Angle of Rotation} = \dfrac{360^\circ}{\text{Order of Rotational Symmetry}}" block />
          </div>
        </div>

        <div>
          <h4 className="text-sm font-bold text-slate-600 uppercase tracking-wider mb-2.5">
            Everyday Examples of Rotational Symmetry:
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-center">
              <span className="text-2xl block mb-1">🎡</span>
              <p className="text-xs font-bold text-slate-800">Ferris Wheel</p>
              <p className="text-[11px] text-slate-500">Order = number of carriages</p>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-center">
              <span className="text-2xl block mb-1">💨</span>
              <p className="text-xs font-bold text-slate-800">Windmill</p>
              <p className="text-[11px] text-slate-500">4 blades = Order 4</p>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-center">
              <span className="text-2xl block mb-1">🚗</span>
              <p className="text-xs font-bold text-slate-800">Car Wheel Alloy</p>
              <p className="text-[11px] text-slate-500">5 spokes = Order 5</p>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-center">
              <span className="text-2xl block mb-1">🔠</span>
              <p className="text-xs font-bold text-slate-800">Letters S, N, Z</p>
              <p className="text-[11px] text-slate-500">Order 2 (turn 180°)</p>
            </div>
          </div>
        </div>
      </div>

      {/* c) INTERACTIVE ANIMATION: ROTATING SHAPE CANVAS */}
      <div className="bg-white rounded-3xl p-6 border border-emerald-100 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center text-sm font-bold">c</span>
            <span>Interactive Tool: Spin the Shape & Count Matches</span>
          </h3>
          <AudioButton
            textToRead="Use the slider or the turn buttons to rotate the shape around its center pin. Watch the counter tick up every time the shape fits onto the ghost outline."
            size="sm"
          />
        </div>

        {/* Shape selector buttons */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <span className="text-xs font-bold text-slate-500">Select Shape:</span>
          {ROTATIONAL_SHAPES_DATA.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => {
                setSelectedShapeIndex(idx);
                setCurrentAngle(0);
                setIsAutoSpinning(false);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition ${
                selectedShapeIndex === idx
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {s.name} (Order {s.order})
            </button>
          ))}
        </div>

        {/* Rotation Controls: Slider + Buttons */}
        <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 space-y-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <label htmlFor="rotation-slider" className="text-xs font-bold text-slate-600 whitespace-nowrap">
                Angle: <strong className="text-emerald-700 text-sm">{currentAngle}°</strong>
              </label>
              <input
                id="rotation-slider"
                type="range"
                min="0"
                max="360"
                value={currentAngle}
                onChange={(e) => {
                  setCurrentAngle(parseInt(e.target.value));
                  setIsAutoSpinning(false);
                }}
                className="w-full sm:w-48 accent-emerald-600 cursor-pointer"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handleStepTurn}
                className="px-3 py-1.5 rounded-xl bg-white border border-emerald-200 text-emerald-800 hover:bg-emerald-50 text-xs font-bold shadow-2xs transition cursor-pointer flex items-center gap-1"
              >
                <RotateCw className="w-3.5 h-3.5 text-emerald-600" />
                <span>Turn 1 Step (+{shape.angle}°)</span>
              </button>

              <button
                onClick={handleFullTurn}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition cursor-pointer flex items-center gap-1"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Full 360° Spin</span>
              </button>

              <button
                onClick={() => {
                  setCurrentAngle(0);
                  setIsAutoSpinning(false);
                }}
                className="p-1.5 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-slate-800 transition cursor-pointer"
                title="Reset angle to 0°"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Visual Rotating Canvas */}
        <div className="relative bg-slate-50 rounded-2xl border border-slate-200 p-6 flex flex-col items-center justify-center min-h-[300px]">
          {/* Status indicators */}
          <div className="absolute top-4 left-4 flex flex-col gap-1">
            <span className="px-3 py-1 rounded-full bg-white border border-slate-200 text-xs font-extrabold text-slate-700 shadow-2xs">
              Angle: {currentAngle}° / 360°
            </span>
            <span className="px-3 py-1 rounded-full bg-emerald-100 border border-emerald-200 text-xs font-extrabold text-emerald-800">
              Matches so far: {matchCount} of {shape.order}
            </span>
          </div>

          <div className="absolute top-4 right-4">
            {isCurrentlyMatching ? (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500 text-white text-xs font-extrabold shadow-sm animate-pulse">
                <Check className="w-3.5 h-3.5" />
                <span>MATCH!</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-200 text-slate-600 text-xs font-bold">
                Rotating...
              </span>
            )}
          </div>

          {/* SVG Canvas with Center Pin and Ghost Outline */}
          <div className="relative w-64 h-64 flex items-center justify-center my-4">
            <svg viewBox="0 0 200 200" className="w-full h-full overflow-visible">
              {/* Ghost Outline of starting shape at 0° */}
              <g opacity="0.35" strokeDasharray="4" stroke="#475569" strokeWidth="2" fill="none">
                {shape.id === 'equilateral-triangle' && (
                  <polygon points="100,30 165,145 35,145" />
                )}
                {shape.id === 'square' && (
                  <rect x="50" y="50" width="100" height="100" rx="2" />
                )}
                {shape.id === 'rectangle' && (
                  <rect x="35" y="65" width="130" height="70" rx="2" />
                )}
                {shape.id === 'parallelogram' && (
                  <polygon points="50,65 170,65 150,135 30,135" />
                )}
                {shape.id === 'regular-hexagon' && (
                  <polygon points="100,35 152,65 152,135 100,165 48,135 48,65" />
                )}
                {shape.id === 'letter-s' && (
                  <text x="100" y="145" fontSize="130" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle">S</text>
                )}
                {shape.id === 'letter-z' && (
                  <text x="100" y="145" fontSize="130" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle">Z</text>
                )}
                {shape.id === 'scalene-triangle' && (
                  <polygon points="40,150 170,130 90,40" />
                )}
              </g>

              {/* The Active Rotating Shape */}
              <g
                style={{
                  transformOrigin: '100px 100px',
                  transform: `rotate(${currentAngle}deg)`,
                  transition: isAutoSpinning ? 'none' : 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                {shape.id === 'equilateral-triangle' && (
                  <polygon
                    points="100,30 165,145 35,145"
                    fill={isCurrentlyMatching ? '#34d399' : '#a7f3d0'}
                    stroke="#059669"
                    strokeWidth="3"
                  />
                )}
                {shape.id === 'square' && (
                  <rect
                    x="50"
                    y="50"
                    width="100"
                    height="100"
                    rx="2"
                    fill={isCurrentlyMatching ? '#34d399' : '#a7f3d0'}
                    stroke="#059669"
                    strokeWidth="3"
                  />
                )}
                {shape.id === 'rectangle' && (
                  <rect
                    x="35"
                    y="65"
                    width="130"
                    height="70"
                    rx="2"
                    fill={isCurrentlyMatching ? '#34d399' : '#a7f3d0'}
                    stroke="#059669"
                    strokeWidth="3"
                  />
                )}
                {shape.id === 'parallelogram' && (
                  <polygon
                    points="50,65 170,65 150,135 30,135"
                    fill={isCurrentlyMatching ? '#34d399' : '#a7f3d0'}
                    stroke="#059669"
                    strokeWidth="3"
                  />
                )}
                {shape.id === 'regular-hexagon' && (
                  <polygon
                    points="100,35 152,65 152,135 100,165 48,135 48,65"
                    fill={isCurrentlyMatching ? '#34d399' : '#a7f3d0'}
                    stroke="#059669"
                    strokeWidth="3"
                  />
                )}
                {shape.id === 'letter-s' && (
                  <text
                    x="100"
                    y="145"
                    fontSize="130"
                    fontWeight="bold"
                    fontFamily="sans-serif"
                    textAnchor="middle"
                    fill={isCurrentlyMatching ? '#059669' : '#10b981'}
                  >
                    S
                  </text>
                )}
                {shape.id === 'letter-z' && (
                  <text
                    x="100"
                    y="145"
                    fontSize="130"
                    fontWeight="bold"
                    fontFamily="sans-serif"
                    textAnchor="middle"
                    fill={isCurrentlyMatching ? '#059669' : '#10b981'}
                  >
                    Z
                  </text>
                )}
                {shape.id === 'scalene-triangle' && (
                  <polygon
                    points="40,150 170,130 90,40"
                    fill={isCurrentlyMatching ? '#34d399' : '#a7f3d0'}
                    stroke="#059669"
                    strokeWidth="3"
                  />
                )}

                {/* Marker dot on one vertex so students can track rotation progress */}
                <circle cx="100" cy="30" r="5" fill="#dc2626" />
              </g>

              {/* Centre of rotation pin */}
              <circle cx="100" cy="100" r="6" fill="#1e293b" />
              <circle cx="100" cy="100" r="3" fill="#ffffff" />
            </svg>
          </div>

          {/* Explanation Footer */}
          <div className="w-full text-center max-w-lg mt-2">
            <p className="text-xs sm:text-sm text-slate-700 font-bold">
              {shape.name}: Order of Rotational Symmetry = <span className="text-emerald-700 text-base">{shape.order}</span>
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              Angle between matches: <MathView math={`\\dfrac{360^\\circ}{${shape.order}} = ${shape.angle}^\\circ`} />. {shape.description}
            </p>
          </div>
        </div>

        {/* COMPARISON TABLE: LINE SYMMETRY VS ROTATIONAL SYMMETRY */}
        <div className="mt-8 pt-6 border-t border-slate-100 space-y-3">
          <h4 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-600" />
            <span>Comparison Table: Lines of Symmetry vs Rotational Order</span>
          </h4>
          <p className="text-xs text-slate-500">
            Exam tip: Always read questions carefully! Some ask for <em>lines</em> of symmetry, others ask for <em>order of rotational</em> symmetry.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm border-collapse bg-white rounded-2xl overflow-hidden shadow-2xs border border-slate-200">
              <thead>
                <tr className="bg-emerald-50 text-emerald-950 border-b border-emerald-100">
                  <th className="p-3 font-extrabold">2D Shape</th>
                  <th className="p-3 font-extrabold text-sky-700">Lines of Symmetry</th>
                  <th className="p-3 font-extrabold text-emerald-700">Rotational Order</th>
                  <th className="p-3 font-extrabold text-slate-600">Key Takeaway</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-semibold">
                <tr className="hover:bg-slate-50">
                  <td className="p-3 font-bold text-slate-900">Equilateral Triangle</td>
                  <td className="p-3 text-sky-700 font-bold">3</td>
                  <td className="p-3 text-emerald-700 font-bold">3</td>
                  <td className="p-3 text-xs text-slate-500">Regular shape: lines = order = sides</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="p-3 font-bold text-slate-900">Square</td>
                  <td className="p-3 text-sky-700 font-bold">4</td>
                  <td className="p-3 text-emerald-700 font-bold">4</td>
                  <td className="p-3 text-xs text-slate-500">Regular 4-sided polygon</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="p-3 font-bold text-slate-900">Rectangle</td>
                  <td className="p-3 text-sky-700 font-bold">2</td>
                  <td className="p-3 text-emerald-700 font-bold">2</td>
                  <td className="p-3 text-xs text-slate-500">Matches at 180° and 360°</td>
                </tr>
                <tr className="hover:bg-amber-50/50 bg-amber-50/20">
                  <td className="p-3 font-bold text-slate-900">Parallelogram ⭐</td>
                  <td className="p-3 text-rose-600 font-extrabold">0</td>
                  <td className="p-3 text-emerald-700 font-extrabold">2</td>
                  <td className="p-3 text-xs text-amber-800 font-bold">Zero mirror lines, but order is 2!</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="p-3 font-bold text-slate-900">Kite</td>
                  <td className="p-3 text-sky-700 font-bold">1</td>
                  <td className="p-3 text-slate-500 font-bold">1 (None)</td>
                  <td className="p-3 text-xs text-slate-500">Has mirror line, but no rotation</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="p-3 font-bold text-slate-900">Circle</td>
                  <td className="p-3 text-sky-700 font-bold">Infinite</td>
                  <td className="p-3 text-emerald-700 font-bold">Infinite</td>
                  <td className="p-3 text-xs text-slate-500">Matches at every single angle</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* d) WORKED EXAMPLES */}
      <div className="bg-white rounded-3xl p-6 border border-emerald-100 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center text-sm font-bold">d</span>
            <span>Step-by-Step Worked Examples</span>
          </h3>
          <AudioButton
            textToRead={`Worked Example: ${SECTION2_WORKED_EXAMPLES[activeExampleIndex].title}. Problem: ${SECTION2_WORKED_EXAMPLES[activeExampleIndex].problem}. Step: ${SECTION2_WORKED_EXAMPLES[activeExampleIndex].steps[currentStepIndex].title}. ${SECTION2_WORKED_EXAMPLES[activeExampleIndex].steps[currentStepIndex].explanation}`}
            size="sm"
          />
        </div>

        {/* Tab selection */}
        <div className="flex flex-wrap gap-2">
          {SECTION2_WORKED_EXAMPLES.map((ex, idx) => (
            <button
              key={ex.id}
              onClick={() => {
                setActiveExampleIndex(idx);
                setCurrentStepIndex(0);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeExampleIndex === idx
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Example {idx + 1}
            </button>
          ))}
        </div>

        {/* Active Example Card */}
        {(() => {
          const ex = SECTION2_WORKED_EXAMPLES[activeExampleIndex];
          const step = ex.steps[currentStepIndex];

          return (
            <div className="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-200/80 space-y-4">
              <div>
                <h4 className="text-base font-extrabold text-emerald-950">{ex.title}</h4>
                <p className="text-sm text-slate-700 mt-1 font-medium bg-white p-3 rounded-xl border border-emerald-100">
                  <strong>Question:</strong> {ex.problem}
                </p>
              </div>

              {/* Step indicator */}
              <div className="flex items-center gap-1.5">
                {ex.steps.map((_, i) => (
                  <div
                    key={i}
                    className={`h-2 flex-1 rounded-full transition-all ${
                      i <= currentStepIndex ? 'bg-emerald-500' : 'bg-slate-200'
                    }`}
                  />
                ))}
              </div>

              {/* Step Body */}
              <div className="p-4 rounded-xl bg-white border border-emerald-100 shadow-2xs space-y-2">
                <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                  Step {currentStepIndex + 1} of {ex.steps.length}: {step.title}
                </span>
                <p className="text-sm text-slate-700 leading-relaxed font-medium whitespace-pre-line">
                  {step.explanation}
                </p>
                {step.mathFormula && (
                  <div className="p-2 bg-slate-50 rounded-lg text-center">
                    <MathView math={step.mathFormula} block />
                  </div>
                )}
              </div>

              {/* Navigation buttons */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => setCurrentStepIndex((prev) => Math.max(0, prev - 1))}
                  disabled={currentStepIndex === 0}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white transition cursor-pointer flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Previous step</span>
                </button>

                <button
                  onClick={() =>
                    setCurrentStepIndex((prev) => Math.min(ex.steps.length - 1, prev + 1))
                  }
                  disabled={currentStepIndex === ex.steps.length - 1}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-xs disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer flex items-center gap-1"
                >
                  <span>Next step</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })()}
      </div>

      {/* e) PRACTICE EXERCISES (5 QUESTIONS) */}
      <div className="bg-white rounded-3xl p-6 border border-emerald-100 shadow-xs space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center text-sm font-bold">e</span>
              <span>Practice Exercises (5 Questions)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Instant feedback • Hints available • Try until you get it right!
            </p>
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs">
            {correctPracticeCount} / {SECTION2_PRACTICE.length} Correct
          </span>
        </div>

        <div className="space-y-6">
          {SECTION2_PRACTICE.map((q, idx) => {
            const state = answersState[q.id] || { attempts: 0 };

            return (
              <div
                key={q.id}
                className={`p-5 rounded-2xl border transition-all ${
                  state.isCorrect
                    ? 'bg-emerald-50/50 border-emerald-300'
                    : state.attempts > 0
                    ? 'bg-rose-50/30 border-rose-200'
                    : 'bg-slate-50/60 border-slate-200'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h4 className="text-sm font-bold text-slate-800">
                    Question {idx + 1}: {q.question}
                  </h4>
                  <AudioButton textToRead={q.speechText} size="sm" />
                </div>

                {/* Multiple choice options */}
                {q.type === 'choice' && q.options && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
                    {q.options.map((opt, oIdx) => {
                      const isChosen = state.selected === oIdx;
                      const isOptionCorrect = oIdx === q.correctOptionIndex;

                      return (
                        <button
                          key={oIdx}
                          onClick={() => handleOptionSelect(q.id, oIdx, q.correctOptionIndex!)}
                          disabled={state.isCorrect}
                          className={`p-3 rounded-xl text-left text-xs sm:text-sm font-semibold transition cursor-pointer border ${
                            state.isCorrect && isOptionCorrect
                              ? 'bg-emerald-500 text-white border-emerald-600 font-bold'
                              : isChosen && !state.isCorrect
                              ? 'bg-rose-100 text-rose-800 border-rose-300'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-emerald-50 hover:border-emerald-300'
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Number input type */}
                {q.type === 'number' && (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleNumberSubmit(q.id, q.correctNumber!);
                    }}
                    className="flex items-center gap-2 mt-3"
                  >
                    <input
                      type="number"
                      step="any"
                      placeholder="Type number..."
                      value={state.numInput || ''}
                      onChange={(e) =>
                        setAnswersState((s) => ({
                          ...s,
                          [q.id]: { ...(s[q.id] || { attempts: 0 }), numInput: e.target.value },
                        }))
                      }
                      disabled={state.isCorrect}
                      className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-sm font-bold w-36 focus:outline-hidden focus:border-emerald-500"
                    />
                    <button
                      type="submit"
                      disabled={state.isCorrect || !state.numInput}
                      className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm disabled:opacity-40 transition cursor-pointer"
                    >
                      Check Answer
                    </button>
                  </form>
                )}

                {/* Feedback & Hint */}
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/60">
                  <div>
                    {state.isCorrect && (
                      <p className="text-xs sm:text-sm font-bold text-emerald-700 flex items-center gap-1.5">
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span>{q.explanation}</span>
                      </p>
                    )}
                    {!state.isCorrect && state.attempts > 0 && (
                      <p className="text-xs sm:text-sm font-bold text-rose-600">
                        Not quite right yet. Try again!
                      </p>
                    )}
                  </div>

                  {!state.isCorrect && (
                    <button
                      onClick={() =>
                        setAnswersState((s) => ({
                          ...s,
                          [q.id]: { ...(s[q.id] || { attempts: 0 }), showHint: !s[q.id]?.showHint },
                        }))
                      }
                      className="text-xs font-bold text-amber-700 hover:text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 transition cursor-pointer flex items-center gap-1"
                    >
                      <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                      <span>{state.showHint ? 'Hide Hint' : 'Show Hint'}</span>
                    </button>
                  )}
                </div>

                {state.showHint && !state.isCorrect && (
                  <div className="mt-2 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 font-medium">
                    💡 <strong>Hint:</strong> {q.hint}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* f) SHORT SUMMARY BOX ("Remember this!") */}
      <div className="bg-emerald-50 rounded-3xl p-6 border-2 border-emerald-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-extrabold text-emerald-950 flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-emerald-200 text-emerald-800 flex items-center justify-center text-sm font-bold">f</span>
            <span>Remember this! (Rotational Symmetry Rules)</span>
          </h3>
          <AudioButton
            textToRead="Remember this! Formula: Angle of rotation equals 360 degrees divided by order. If a shape only fits onto itself after 360 degrees, its order is 1, which means it has no rotational symmetry. Parallelogram has order 2."
            size="sm"
          />
        </div>

        <ul className="space-y-2 text-xs sm:text-sm text-emerald-900 font-semibold list-disc list-inside">
          <li>
            <strong>Angle of Rotation Formula:</strong> <MathView math="\text{Angle} = \dfrac{360^\circ}{\text{Order}}" />. (Example: Order 4 has angle <MathView math="\dfrac{360^\circ}{4} = 90^\circ" />).
          </li>
          <li>
            <strong>Order 1 meaning:</strong> In IGCSE 0580, an order of 1 means the shape has <strong>NO rotational symmetry</strong>. (There is no such thing as "order 0").
          </li>
          <li>
            <strong>Letters S, N, Z:</strong> These three capital letters have rotational symmetry of order 2, but 0 lines of symmetry!
          </li>
          <li>
            <strong>Parallelogram:</strong> Order 2 (it matches when rotated by 180°).
          </li>
        </ul>
      </div>

      {/* g) ACTION BUTTONS: SAVE & PDF DOWNLOAD & NEXT SECTION */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              onSaveProgress();
              onTriggerCelebration(`Progress saved for ${studentName}! 💾`);
            }}
            className="px-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs sm:text-sm shadow-xs flex items-center gap-2 transition cursor-pointer"
          >
            <Save className="w-4 h-4 text-emerald-600" />
            <span>Save Progress</span>
          </button>

          <button
            onClick={handleDownloadSectionPdf}
            className="px-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs sm:text-sm shadow-xs flex items-center gap-2 transition cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Download Section as PDF</span>
          </button>
        </div>

        <button
          onClick={onComplete}
          className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-extrabold text-sm shadow-md transition flex items-center gap-2 cursor-pointer"
        >
          <span>Continue to Section 3: 3D Plane Symmetry</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <PdfModal
        isOpen={pdfModal.isOpen}
        onClose={() => setPdfModal((prev) => ({ ...prev, isOpen: false }))}
        pdfUrl={pdfModal.url}
        filename={pdfModal.filename}
        title={pdfModal.title}
        studentName={studentName}
      />
    </div>
  );
};
