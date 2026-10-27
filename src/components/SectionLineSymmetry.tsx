import React, { useState } from 'react';
import { 
  CheckCircle, ArrowRight, ArrowLeft, Lightbulb, Check, X, Download, Save, 
  HelpCircle, Sparkles, RefreshCw, Layers, Grid 
} from 'lucide-react';
import { MathView } from './MathView';
import { AudioButton } from './AudioButton';
import { COMMON_SHAPES_DATA, SECTION1_WORKED_EXAMPLES, SECTION1_PRACTICE, Shape2DInfo } from '../data/symmetryData';
import { playCorrectSound, playWrongSound } from '../utils/audio';
import { createSection1Pdf } from '../utils/pdf';
import { PdfModal } from './PdfModal';

interface Section1Props {
  studentName: string;
  onComplete: () => void;
  onSaveProgress: () => void;
  onTriggerCelebration: (msg?: string) => void;
}

export const SectionLineSymmetry: React.FC<Section1Props> = ({
  studentName,
  onComplete,
  onSaveProgress,
  onTriggerCelebration,
}) => {
  // --- Shape Folding Animation State ---
  const [selectedShapeId, setSelectedShapeId] = useState('butterfly');
  const [selectedLineType, setSelectedLineType] = useState<'vertical' | 'horizontal' | 'diagonal'>('vertical');
  const [isFolded, setIsFolded] = useState(false);

  // --- Clickable Table Selected Shape ---
  const [tableShape, setTableShape] = useState<Shape2DInfo>(COMMON_SHAPES_DATA[0]);
  const [showSymmetryLines, setShowSymmetryLines] = useState(true);

  // --- Grid Symmetry Mini-Game State ---
  // A 6x6 grid. Column 0,1,2 is left side; column 3,4,5 is right side (mirrored).
  // Initial left pattern: 4 shaded cells: (1,1), (2,1), (2,2), (3,1)
  const initialLeftCells = new Set(['1-1', '2-1', '2-2', '3-1', '4-2']);
  // Mirror counterpart for column c is: 5 - c
  // e.g. (1, 1) -> (1, 4), (2, 1) -> (2, 4), (2, 2) -> (2, 3), (3, 1) -> (3, 4), (4, 2) -> (4, 3)
  const expectedRightCells = new Set(['1-4', '2-4', '2-3', '3-4', '4-3']);
  const [userRightCells, setUserRightCells] = useState<Set<string>>(new Set());
  const [gridCompleted, setGridCompleted] = useState(false);

  // --- Worked Examples State ---
  const [activeExampleIndex, setActiveExampleIndex] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // --- Practice Questions State ---
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
    const res = createSection1Pdf(studentName);
    setPdfModal({
      isOpen: true,
      url: res.url,
      filename: res.filename,
      title: 'Section 1: Line Symmetry Study Guide',
    });
  };

  // Folding shapes definitions
  const foldingShapes = [
    { id: 'butterfly', name: 'Butterfly', validLines: ['vertical'] },
    { id: 'letter-a', name: 'Letter A', validLines: ['vertical'] },
    { id: 'rectangle', name: 'Rectangle', validLines: ['vertical', 'horizontal'] },
    { id: 'square', name: 'Square', validLines: ['vertical', 'horizontal', 'diagonal'] },
    { id: 'isosceles-triangle', name: 'Isosceles Triangle', validLines: ['vertical'] },
  ];

  const currentFoldingShape = foldingShapes.find((s) => s.id === selectedShapeId) || foldingShapes[0];
  const isLineSymmetric = currentFoldingShape.validLines.includes(selectedLineType);

  // Handle Practice Answer Choice
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
      onTriggerCelebration(`Spot on, ${studentName}! ⭐`);
    } else {
      playWrongSound();
    }
  };

  // Handle Practice Number Submit
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
      onTriggerCelebration(`Excellent number work, ${studentName}! 🎉`);
    } else {
      playWrongSound();
    }
  };

  // Grid cell toggle
  const toggleGridCell = (r: number, c: number) => {
    if (c < 3) return; // Only allow clicking right side (mirror side)
    const key = `${r}-${c}`;
    const next = new Set(userRightCells);
    if (next.has(key)) {
      next.delete(key);
    } else {
      next.add(key);
    }
    setUserRightCells(next);

    // Check if correct
    if (next.size === expectedRightCells.size) {
      let allMatch = true;
      next.forEach((item) => {
        if (!expectedRightCells.has(item)) allMatch = false;
      });
      if (allMatch) {
        setGridCompleted(true);
        playCorrectSound();
        onTriggerCelebration(`Super reflection on the grid, ${studentName}! 🌟`);
      } else {
        setGridCompleted(false);
      }
    } else {
      setGridCompleted(false);
    }
  };

  const resetGrid = () => {
    setUserRightCells(new Set());
    setGridCompleted(false);
  };

  // Check how many practice questions are correct
  const correctPracticeCount = SECTION1_PRACTICE.filter((q) => answersState[q.id]?.isCorrect).length;

  return (
    <div id="section-1-content" className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Hero / Header Card */}
      <div className="bg-gradient-to-r from-sky-500 to-blue-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
              <span>Section 1 of 4</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Line Symmetry (Reflection)
            </h2>
            <p className="text-sky-100 text-sm sm:text-base mt-1 max-w-xl">
              Learn how a <strong>mirror line</strong> folds a shape so both halves fit together like magic.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <AudioButton
              textToRead="Section 1: Line Symmetry. In this section, you will learn what a line of symmetry is, how folding along a mirror line matches two halves, and how to count the lines of symmetry for common shapes."
              label="Listen to Section"
            />
          </div>
        </div>
      </div>

      {/* a) LEARNING GOALS */}
      <div className="bg-white rounded-3xl p-6 border border-sky-100 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center text-sm font-bold">a</span>
            <span>My Learning Goals</span>
          </h3>
          <AudioButton
            textToRead="By the end of this section, I can identify a line of symmetry by folding, I can count the number of lines of symmetry in common two-dimensional shapes, and I can complete a symmetric figure on a grid."
            size="sm"
          />
        </div>
        <div className="grid sm:grid-cols-3 gap-3">
          <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-sky-50/60 border border-sky-100">
            <CheckCircle className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
            <p className="text-xs sm:text-sm font-semibold text-slate-700">
              I can explain what a <strong>line of symmetry</strong> (mirror line) is.
            </p>
          </div>
          <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-sky-50/60 border border-sky-100">
            <CheckCircle className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
            <p className="text-xs sm:text-sm font-semibold text-slate-700">
              I can count lines of symmetry in triangles, quadrilaterals, and regular polygons.
            </p>
          </div>
          <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-sky-50/60 border border-sky-100">
            <CheckCircle className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
            <p className="text-xs sm:text-sm font-semibold text-slate-700">
              I can complete a symmetric pattern across a mirror line on a grid.
            </p>
          </div>
        </div>
      </div>

      {/* b) DEFINITIONS & REAL-LIFE EXAMPLES */}
      <div className="bg-white rounded-3xl p-6 border border-sky-100 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center text-sm font-bold">b</span>
            <span>Definition in Simple Words</span>
          </h3>
          <AudioButton
            textToRead="A line of symmetry is an imaginary mirror line that divides a shape into two equal halves. If you fold the shape along the line of symmetry, both halves match each other exactly. Each half is the mirror image of the other."
            size="sm"
          />
        </div>

        <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200">
          <p className="text-base text-slate-800 leading-relaxed">
            A <strong className="text-sky-800">line of symmetry</strong> (also called a <strong>mirror line</strong>) is an imaginary line that cuts a shape into two halves.
            When you fold the shape along this line, <strong>both halves match each other perfectly</strong>.
            One half is the <strong>mirror image</strong> of the other half.
          </p>
        </div>

        <div>
          <h4 className="text-sm font-bold text-slate-600 uppercase tracking-wider mb-2.5">
            Everyday Examples of Line Symmetry:
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-center">
              <span className="text-2xl block mb-1">🦋</span>
              <p className="text-xs font-bold text-slate-800">Butterfly</p>
              <p className="text-[11px] text-slate-500">1 vertical mirror line</p>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-center">
              <span className="text-2xl block mb-1">🔤</span>
              <p className="text-xs font-bold text-slate-800">Letter H</p>
              <p className="text-[11px] text-slate-500">2 lines (vertical & horizontal)</p>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-center">
              <span className="text-2xl block mb-1">😊</span>
              <p className="text-xs font-bold text-slate-800">Human Face</p>
              <p className="text-[11px] text-slate-500">1 vertical line of symmetry</p>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-center">
              <span className="text-2xl block mb-1">🏛️</span>
              <p className="text-xs font-bold text-slate-800">Architecture</p>
              <p className="text-[11px] text-slate-500">Taj Mahal & buildings</p>
            </div>
          </div>
        </div>
      </div>

      {/* c) INTERACTIVE ANIMATION: FOLDING ALONG MIRROR LINE */}
      <div className="bg-white rounded-3xl p-6 border border-sky-100 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center text-sm font-bold">c</span>
            <span>Interactive Tool: Fold & Test Mirror Lines</span>
          </h3>
          <AudioButton
            textToRead="Pick a shape, select a mirror line, and click the fold button. Watch whether both halves fit on top of each other!"
            size="sm"
          />
        </div>

        <p className="text-xs sm:text-sm text-slate-600">
          Choose a shape and a test line. Then click <strong>"Fold Shape"</strong> to see if the two halves match!
        </p>

        {/* Controls: Select Shape & Line */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-500">Shape:</span>
          {foldingShapes.map((shape) => (
            <button
              key={shape.id}
              onClick={() => {
                setSelectedShapeId(shape.id);
                setIsFolded(false);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition ${
                selectedShapeId === shape.id
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {shape.name}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-500">Test Line:</span>
          {(['vertical', 'horizontal', 'diagonal'] as const).map((line) => (
            <button
              key={line}
              onClick={() => {
                setSelectedLineType(line);
                setIsFolded(false);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize cursor-pointer transition ${
                selectedLineType === line
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {line} line
            </button>
          ))}

          <button
            onClick={() => setIsFolded(!isFolded)}
            className="ml-auto px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs sm:text-sm shadow-sm transition flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isFolded ? 'rotate-180' : ''} transition-transform duration-300`} />
            <span>{isFolded ? 'Unfold Shape' : 'Fold Shape Along Line'}</span>
          </button>
        </div>

        {/* Folding Canvas Visual */}
        <div className="relative bg-slate-50 rounded-2xl border border-slate-200 p-6 flex flex-col items-center justify-center min-h-[260px]">
          <svg viewBox="0 0 240 180" className="w-56 h-44 overflow-visible">
            {/* Base Shape */}
            {selectedShapeId === 'butterfly' && (
              <g className={`transition-all duration-700 ${isFolded ? 'opacity-80' : 'opacity-100'}`}>
                {/* Left wing */}
                <path
                  d="M 120,90 Q 60,30 50,60 Q 40,90 80,105 Q 50,140 75,150 Q 110,140 120,95 Z"
                  fill="#7dd3fc"
                  stroke="#0284c7"
                  strokeWidth="2.5"
                />
                {/* Right wing or folded wing */}
                <path
                  d="M 120,90 Q 180,30 190,60 Q 200,90 160,105 Q 190,140 165,150 Q 130,140 120,95 Z"
                  fill="#38bdf8"
                  stroke="#0284c7"
                  strokeWidth="2.5"
                  style={{
                    transformOrigin: selectedLineType === 'vertical' ? '120px 90px' : 'center',
                    transform: isFolded
                      ? selectedLineType === 'vertical'
                        ? 'scaleX(-1)'
                        : selectedLineType === 'horizontal'
                        ? 'scaleY(-1)'
                        : 'rotate(90deg)'
                      : 'none',
                    transition: 'transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                />
                {/* Center body */}
                <ellipse cx="120" cy="95" rx="5" ry="30" fill="#0369a1" />
                <circle cx="120" cy="60" r="7" fill="#0369a1" />
              </g>
            )}

            {selectedShapeId === 'letter-a' && (
              <g className="transition-all duration-700">
                <text
                  x="120"
                  y="135"
                  fontSize="120"
                  fontWeight="bold"
                  fontFamily="sans-serif"
                  textAnchor="middle"
                  fill="#60a5fa"
                  stroke="#1d4ed8"
                  strokeWidth="2"
                >
                  A
                </text>
              </g>
            )}

            {selectedShapeId === 'rectangle' && (
              <g>
                <rect
                  x="40"
                  y="45"
                  width="160"
                  height="90"
                  fill="#bae6fd"
                  stroke="#0284c7"
                  strokeWidth="3"
                  rx="4"
                />
              </g>
            )}

            {selectedShapeId === 'square' && (
              <g>
                <rect
                  x="65"
                  y="35"
                  width="110"
                  height="110"
                  fill="#bae6fd"
                  stroke="#0284c7"
                  strokeWidth="3"
                  rx="2"
                />
              </g>
            )}

            {selectedShapeId === 'isosceles-triangle' && (
              <g>
                <polygon
                  points="120,30 190,145 50,145"
                  fill="#bae6fd"
                  stroke="#0284c7"
                  strokeWidth="3"
                />
              </g>
            )}

            {/* Test Line overlay */}
            {selectedLineType === 'vertical' && (
              <line
                x1="120"
                y1="10"
                x2="120"
                y2="170"
                stroke="#dc2626"
                strokeWidth="2.5"
                strokeDasharray="6"
              />
            )}
            {selectedLineType === 'horizontal' && (
              <line
                x1="20"
                y1="90"
                x2="220"
                y2="90"
                stroke="#dc2626"
                strokeWidth="2.5"
                strokeDasharray="6"
              />
            )}
            {selectedLineType === 'diagonal' && (
              <line
                x1="40"
                y1="25"
                x2="200"
                y2="155"
                stroke="#dc2626"
                strokeWidth="2.5"
                strokeDasharray="6"
              />
            )}
          </svg>

          {/* Result Banner */}
          <div className="mt-3">
            {isFolded ? (
              isLineSymmetric ? (
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-800 font-bold text-xs sm:text-sm animate-in fade-in">
                  <Check className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>✔ Perfect match! Both halves fit exactly. This is a LINE OF SYMMETRY!</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-100 border border-rose-300 text-rose-800 font-bold text-xs sm:text-sm animate-in fade-in">
                  <X className="w-5 h-5 text-rose-600 shrink-0" />
                  <span>✘ The halves stick out and do NOT match. This is NOT a line of symmetry.</span>
                </div>
              )
            ) : (
              <p className="text-xs text-slate-500 font-medium">
                Click "Fold Shape Along Line" above to test the fold!
              </p>
            )}
          </div>
        </div>

        {/* CLICKABLE 2D SHAPE SYMMETRY TABLE */}
        <div className="mt-8 pt-6 border-t border-slate-100 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
              <Layers className="w-5 h-5 text-sky-600" />
              <span>Interactive Shape Explorer: Number of Lines of Symmetry</span>
            </h4>
            <button
              onClick={() => setShowSymmetryLines(!showSymmetryLines)}
              className="text-xs font-bold text-sky-700 bg-sky-50 px-3 py-1 rounded-full border border-sky-200 hover:bg-sky-100 transition cursor-pointer"
            >
              {showSymmetryLines ? 'Hide Symmetry Lines' : 'Show Symmetry Lines'}
            </button>
          </div>

          <p className="text-xs text-slate-500">
            Click any shape button below to view its symmetry lines and read its exam rule:
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {COMMON_SHAPES_DATA.map((s) => (
              <button
                key={s.id}
                onClick={() => setTableShape(s)}
                className={`p-2.5 rounded-xl text-left border transition cursor-pointer ${
                  tableShape.id === s.id
                    ? 'bg-sky-50 border-sky-500 ring-2 ring-sky-300'
                    : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
              >
                <p className="text-xs font-bold text-slate-800 truncate">{s.name}</p>
                <p className="text-[11px] font-semibold text-sky-600">
                  {s.lines === 999 ? 'Infinite lines' : `${s.lines} line${s.lines === 1 ? '' : 's'}`}
                </p>
              </button>
            ))}
          </div>

          {/* Active Shape Detail Card */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center gap-6">
            <div className="w-48 h-36 bg-white rounded-xl border border-slate-200 flex items-center justify-center p-2 shrink-0 shadow-2xs">
              <svg viewBox={tableShape.viewBox} className="w-full h-full">
                {tableShape.svgPoints === 'circle' ? (
                  <circle cx="100" cy="80" r="60" fill="#e0f2fe" stroke="#0284c7" strokeWidth="2.5" />
                ) : (
                  <polygon points={tableShape.svgPoints} fill="#e0f2fe" stroke="#0284c7" strokeWidth="2.5" />
                )}

                {showSymmetryLines &&
                  tableShape.symmetryLines.map((l, i) => (
                    <line
                      key={i}
                      x1={l.x1}
                      y1={l.y1}
                      x2={l.x2}
                      y2={l.y2}
                      stroke="#ef4444"
                      strokeWidth="2"
                      strokeDasharray="4"
                    />
                  ))}
              </svg>
            </div>

            <div className="space-y-1.5 text-left w-full">
              <div className="flex items-center justify-between">
                <h5 className="text-base font-extrabold text-slate-800">{tableShape.name}</h5>
                <span className="px-3 py-1 rounded-full bg-sky-100 text-sky-800 text-xs font-extrabold">
                  {tableShape.lines === 999 ? 'Infinite Lines' : `${tableShape.lines} Lines of Symmetry`}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600">{tableShape.description}</p>
              <p className="text-xs text-sky-800 font-semibold bg-sky-50/80 p-2.5 rounded-xl border border-sky-100">
                💡 <strong>Exam Note:</strong> {tableShape.details}
              </p>
            </div>
          </div>
        </div>

        {/* COMPLETING A SYMMETRIC FIGURE ON A GRID MINI-GAME */}
        <div className="mt-8 pt-6 border-t border-slate-100 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
              <Grid className="w-5 h-5 text-indigo-600" />
              <span>Mini-Game: Complete the Symmetric Figure on the Grid</span>
            </h4>
            <button
              onClick={resetGrid}
              className="text-xs font-bold text-slate-500 hover:text-slate-700 bg-slate-100 px-3 py-1 rounded-full transition cursor-pointer"
            >
              Reset Grid
            </button>
          </div>

          <p className="text-xs sm:text-sm text-slate-600">
            The red dashed line is the mirror line. <strong>Click the squares on the right side</strong> to reflect the blue pattern!
          </p>

          <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="relative inline-block border-2 border-slate-400 bg-white shadow-xs rounded-lg p-1">
              <div className="grid grid-cols-6 gap-1 w-64 h-64 sm:w-72 sm:h-72">
                {[0, 1, 2, 3, 4, 5].map((r) =>
                  [0, 1, 2, 3, 4, 5].map((c) => {
                    const isLeft = c < 3;
                    const cellKey = `${r}-${c}`;
                    const isLeftShaded = initialLeftCells.has(cellKey);
                    const isRightUserShaded = userRightCells.has(cellKey);

                    return (
                      <button
                        key={cellKey}
                        onClick={() => toggleGridCell(r, c)}
                        disabled={isLeft}
                        aria-label={`Grid cell row ${r} column ${c}`}
                        className={`w-full h-full rounded transition-all cursor-pointer ${
                          isLeft
                            ? isLeftShaded
                              ? 'bg-sky-500 cursor-not-allowed shadow-inner'
                              : 'bg-slate-100 cursor-not-allowed'
                            : isRightUserShaded
                            ? 'bg-indigo-500 shadow-sm'
                            : 'bg-white hover:bg-indigo-50 border border-dashed border-slate-300'
                        }`}
                      />
                    );
                  })
                )}
              </div>

              {/* Red Mirror Line in the middle */}
              <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-0.5 border-r-2 border-dashed border-rose-500 pointer-events-none" />
            </div>

            {gridCompleted ? (
              <div className="mt-3 px-4 py-2 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-800 font-bold text-xs sm:text-sm flex items-center gap-2 animate-bounce">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>Brilliant, {studentName}! You correctly completed the symmetric figure!</span>
              </div>
            ) : (
              <p className="mt-2 text-xs text-slate-500">
                {userRightCells.size} of {expectedRightCells.size} mirrored squares placed.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* d) WORKED EXAMPLES */}
      <div className="bg-white rounded-3xl p-6 border border-sky-100 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center text-sm font-bold">d</span>
            <span>Step-by-Step Worked Examples</span>
          </h3>
          <AudioButton
            textToRead={`Worked Example: ${SECTION1_WORKED_EXAMPLES[activeExampleIndex].title}. Problem: ${SECTION1_WORKED_EXAMPLES[activeExampleIndex].problem}. Step: ${SECTION1_WORKED_EXAMPLES[activeExampleIndex].steps[currentStepIndex].title}. ${SECTION1_WORKED_EXAMPLES[activeExampleIndex].steps[currentStepIndex].explanation}`}
            size="sm"
          />
        </div>

        {/* Tab selection for examples */}
        <div className="flex flex-wrap gap-2">
          {SECTION1_WORKED_EXAMPLES.map((ex, idx) => (
            <button
              key={ex.id}
              onClick={() => {
                setActiveExampleIndex(idx);
                setCurrentStepIndex(0);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeExampleIndex === idx
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Example {idx + 1}
            </button>
          ))}
        </div>

        {/* Active Example Card */}
        {(() => {
          const ex = SECTION1_WORKED_EXAMPLES[activeExampleIndex];
          const step = ex.steps[currentStepIndex];

          return (
            <div className="p-5 rounded-2xl bg-sky-50/50 border border-sky-200/80 space-y-4">
              <div>
                <h4 className="text-base font-extrabold text-sky-950">{ex.title}</h4>
                <p className="text-sm text-slate-700 mt-1 font-medium bg-white p-3 rounded-xl border border-sky-100">
                  <strong>Question:</strong> {ex.problem}
                </p>
              </div>

              {/* Progress bar of steps */}
              <div className="flex items-center gap-1.5">
                {ex.steps.map((_, i) => (
                  <div
                    key={i}
                    className={`h-2 flex-1 rounded-full transition-all ${
                      i <= currentStepIndex ? 'bg-sky-500' : 'bg-slate-200'
                    }`}
                  />
                ))}
              </div>

              {/* Step Content */}
              <div className="p-4 rounded-xl bg-white border border-sky-100 shadow-2xs space-y-2">
                <span className="text-xs font-bold text-sky-600 uppercase tracking-wider">
                  Step {currentStepIndex + 1} of {ex.steps.length}: {step.title}
                </span>
                <p className="text-sm text-slate-700 leading-relaxed font-medium">
                  {step.explanation}
                </p>
                {step.mathFormula && (
                  <div className="p-2 bg-slate-50 rounded-lg text-center">
                    <MathView math={step.mathFormula} block />
                  </div>
                )}
              </div>

              {/* Step Navigation Buttons */}
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
                  className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs sm:text-sm shadow-xs disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer flex items-center gap-1"
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
      <div className="bg-white rounded-3xl p-6 border border-sky-100 shadow-xs space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center text-sm font-bold">e</span>
              <span>Practice Exercises (5 Questions)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Instant feedback • Hints available • Try until you get it right!
            </p>
          </div>
          <span className="px-3 py-1 rounded-full bg-sky-100 text-sky-800 font-bold text-xs">
            {correctPracticeCount} / {SECTION1_PRACTICE.length} Correct
          </span>
        </div>

        <div className="space-y-6">
          {SECTION1_PRACTICE.map((q, idx) => {
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
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-sky-50 hover:border-sky-300'
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
                      className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-sm font-bold w-36 focus:outline-hidden focus:border-sky-500"
                    />
                    <button
                      type="submit"
                      disabled={state.isCorrect || !state.numInput}
                      className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs sm:text-sm disabled:opacity-40 transition cursor-pointer"
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
      <div className="bg-amber-50 rounded-3xl p-6 border-2 border-amber-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-extrabold text-amber-950 flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-amber-200 text-amber-800 flex items-center justify-center text-sm font-bold">f</span>
            <span>Remember this! (Exam Golden Rules)</span>
          </h3>
          <AudioButton
            textToRead="Remember this! Golden Rule 1: A regular polygon with n sides always has n lines of symmetry. Golden Rule 2: A rectangle has only 2 lines of symmetry, its diagonals are NOT lines of symmetry. Golden Rule 3: A standard parallelogram has zero lines of symmetry."
            size="sm"
          />
        </div>

        <ul className="space-y-2 text-xs sm:text-sm text-amber-900 font-semibold list-disc list-inside">
          <li>
            <strong>Regular Polygons Rule:</strong> Any regular polygon with <MathView math="n" /> sides has exactly <MathView math="n" /> lines of symmetry (e.g. Equilateral triangle = 3, Square = 4, Regular Pentagon = 5, Regular Hexagon = 6).
          </li>
          <li>
            <strong>Rectangle Diagonals Warning:</strong> In a rectangle, diagonals are <em>never</em> lines of symmetry! Folding across them leaves corners sticking out.
          </li>
          <li>
            <strong>Parallelogram Trap:</strong> An ordinary parallelogram has <strong>0 lines of symmetry</strong>.
          </li>
          <li>
            <strong>Circle:</strong> A circle has an <strong>infinite number</strong> of lines of symmetry (any diameter).
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
            <Save className="w-4 h-4 text-sky-600" />
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
          className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white font-extrabold text-sm shadow-md transition flex items-center gap-2 cursor-pointer"
        >
          <span>Continue to Section 2: Rotational Symmetry</span>
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
