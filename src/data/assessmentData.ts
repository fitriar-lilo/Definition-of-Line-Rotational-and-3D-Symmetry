/**
 * IGCSE Mathematics 0580 - Topic 19: Symmetry
 * Final Assessment Bank (10 Multi-Choice Questions)
 * 
 * SCORING RULES PER SPECIFICATION:
 * - Correct on attempt 1 or 2 -> 10 points
 * - Correct on attempt 3      -> 9 points
 * - Correct on attempt 4+     -> 8 points
 * - Students can retry until correct, wrong options are disabled, and hints are provided.
 */

import { AssessmentQuestion } from '../types';

export const ASSESSMENT_QUESTIONS: AssessmentQuestion[] = [
  {
    id: 1,
    section: 'line',
    topicLabel: 'Line Symmetry',
    difficulty: 'Foundation',
    question: 'How many lines of symmetry does an equilateral triangle have?',
    diagramSvg: `
      <svg viewBox="0 0 160 140" class="w-36 h-32 mx-auto">
        <polygon points="80,15 145,125 15,125" fill="#e0f2fe" stroke="#0284c7" stroke-width="3" />
        <line x1="80" y1="15" x2="80" y2="125" stroke="#ef4444" stroke-width="2" stroke-dasharray="4" />
        <line x1="15" y1="125" x2="112" y2="70" stroke="#ef4444" stroke-width="2" stroke-dasharray="4" />
        <line x1="145" y1="125" x2="48" y2="70" stroke="#ef4444" stroke-width="2" stroke-dasharray="4" />
        <circle cx="80" cy="15" r="4" fill="#0284c7" />
        <circle cx="145" cy="125" r="4" fill="#0284c7" />
        <circle cx="15" cy="125" r="4" fill="#0284c7" />
      </svg>
    `,
    options: ['1', '2', '3', '6'],
    correctIndex: 2,
    hint: 'An equilateral triangle has 3 equal sides and 3 equal angles. You can fold it from each of its 3 corners.',
    explanation: 'An equilateral triangle has 3 lines of symmetry. Each line connects a vertex (corner) to the midpoint of the opposite side.',
    speechText: 'How many lines of symmetry does an equilateral triangle have? The answer is three.',
  },
  {
    id: 2,
    section: 'line',
    topicLabel: 'Line Symmetry',
    difficulty: 'Core',
    question: 'A regular polygon has 5 equal sides (a regular pentagon). What is the total number of lines of symmetry?',
    diagramSvg: `
      <svg viewBox="0 0 160 150" class="w-36 h-32 mx-auto">
        <polygon points="80,15 145,62 120,135 40,135 15,62" fill="#fef3c7" stroke="#d97706" stroke-width="3" />
        <line x1="80" y1="15" x2="80" y2="135" stroke="#ef4444" stroke-width="2" stroke-dasharray="4" />
        <circle cx="80" cy="85" r="3" fill="#b45309" />
      </svg>
    `,
    options: ['2', '4', '5', '10'],
    correctIndex: 2,
    hint: 'For any regular polygon, the number of lines of symmetry is equal to the number of sides.',
    explanation: 'For any regular polygon with n sides, the number of lines of symmetry is always n. A regular pentagon has 5 sides, so it has 5 lines of symmetry.',
    speechText: 'A regular pentagon has five equal sides, so it has five lines of symmetry.',
  },
  {
    id: 3,
    section: 'line',
    topicLabel: 'Line Symmetry',
    difficulty: 'Core',
    question: 'Which of the following quadrilaterals has NO lines of symmetry (0 lines)?',
    diagramSvg: `
      <svg viewBox="0 0 200 90" class="w-48 h-20 mx-auto">
        <polygon points="50,15 170,15 140,75 20,75" fill="#f1f5f9" stroke="#475569" stroke-width="3" />
        <text x="75" y="50" font-size="12" fill="#475569" font-weight="bold">Parallelogram</text>
      </svg>
    `,
    options: ['Kite', 'Isosceles trapezium', 'Rectangle', 'Parallelogram'],
    correctIndex: 3,
    hint: 'A kite has 1 line, an isosceles trapezium has 1 line, and a rectangle has 2. Which shape has slanted sides that do not match when folded?',
    explanation: 'A parallelogram has 0 lines of symmetry. If you try folding it across any line, the vertices do not overlap.',
    speechText: 'Which quadrilateral has no lines of symmetry? The parallelogram has zero lines of symmetry.',
  },
  {
    id: 4,
    section: 'line',
    topicLabel: 'Line Symmetry',
    difficulty: 'Extended',
    question: 'A student looks at a standard rectangle. They draw both diagonals. Are these diagonals lines of symmetry?',
    diagramSvg: `
      <svg viewBox="0 0 180 110" class="w-44 h-24 mx-auto">
        <rect x="25" y="20" width="130" height="70" fill="#ede9fe" stroke="#7c3aed" stroke-width="3" />
        <line x1="25" y1="20" x2="155" y2="90" stroke="#ef4444" stroke-width="2" stroke-dasharray="3" />
        <line x1="155" y1="20" x2="25" y2="90" stroke="#ef4444" stroke-width="2" stroke-dasharray="3" />
      </svg>
    `,
    options: [
      'Yes, both diagonals are lines of symmetry',
      'No, neither diagonal is a line of symmetry',
      'Only the main diagonal is a line of symmetry',
      'Yes, but only if the rectangle is larger than 10 cm'
    ],
    correctIndex: 1,
    hint: 'If you fold a paper rectangle along a diagonal, do the opposite corners meet, or do they stick out?',
    explanation: 'In a rectangle (that is not a square), the diagonals are NOT lines of symmetry. When folded along a diagonal, the opposite corners do not match. A rectangle has only 2 lines of symmetry (the vertical and horizontal midlines).',
    speechText: 'Are the diagonals of a rectangle lines of symmetry? No, neither diagonal is a line of symmetry.',
  },
  {
    id: 5,
    section: 'rotational',
    topicLabel: 'Rotational Symmetry',
    difficulty: 'Foundation',
    question: 'What is the order of rotational symmetry of a rectangle?',
    diagramSvg: `
      <svg viewBox="0 0 160 110" class="w-36 h-24 mx-auto">
        <rect x="25" y="25" width="110" height="60" fill="#ecfdf5" stroke="#059669" stroke-width="3" rx="4" />
        <circle cx="80" cy="55" r="4" fill="#ef4444" />
        <path d="M 65,45 A 18 18 0 0 1 95,45" fill="none" stroke="#059669" stroke-width="2" />
      </svg>
    `,
    options: ['1', '2', '4', '8'],
    correctIndex: 1,
    hint: 'During a full 360° rotation around its center, how many times does the rectangle fit exactly into its starting outline?',
    explanation: 'A rectangle fits onto its outline after a 180° turn and after a 360° turn. Therefore, its order of rotational symmetry is 2.',
    speechText: 'What is the order of rotational symmetry of a rectangle? The order is two.',
  },
  {
    id: 6,
    section: 'rotational',
    topicLabel: 'Rotational Symmetry',
    difficulty: 'Core',
    question: 'A regular octagon has an order of rotational symmetry of 8. What is the smallest angle in degrees through which it must be rotated to look unchanged?',
    diagramSvg: `
      <svg viewBox="0 0 140 140" class="w-32 h-32 mx-auto">
        <polygon points="45,15 95,15 125,45 125,95 95,125 45,125 15,95 15,45" fill="#f0fdf4" stroke="#16a34a" stroke-width="3" />
        <circle cx="70" cy="70" r="4" fill="#dc2626" />
      </svg>
    `,
    options: ['30°', '45°', '60°', '90°'],
    correctIndex: 1,
    hint: 'Use the IGCSE formula: Angle = 360° ÷ order of rotational symmetry.',
    explanation: 'Using the formula: Angle = 360° ÷ order = 360° ÷ 8 = 45°. So rotating by 45° fits the octagon onto itself.',
    speechText: 'Divide 360 degrees by 8. The answer is 45 degrees.',
  },
  {
    id: 7,
    section: 'rotational',
    topicLabel: 'Rotational Symmetry',
    difficulty: 'Extended',
    question: 'Which of the following capital letters has rotational symmetry of order 2, but ZERO lines of symmetry?',
    diagramSvg: `
      <svg viewBox="0 0 200 80" class="w-48 h-20 mx-auto">
        <text x="30" y="55" font-size="44" font-family="sans-serif" font-weight="bold" fill="#0369a1">H</text>
        <text x="90" y="55" font-size="44" font-family="sans-serif" font-weight="bold" fill="#047857">N</text>
        <text x="150" y="55" font-size="44" font-family="sans-serif" font-weight="bold" fill="#b45309">A</text>
      </svg>
    `,
    options: ['Letter H', 'Letter N', 'Letter A', 'Letter M'],
    correctIndex: 1,
    hint: 'Letter H has 2 lines of symmetry. Letter A has 1 line. Which letter has NO mirror lines, but looks the same upside down?',
    explanation: 'Letter N has no lines of symmetry (it cannot be folded to match). But when turned upside down (180°), it looks identical! So Letter N has rotational symmetry of order 2 and 0 lines of symmetry.',
    speechText: 'Letter N has rotational symmetry of order 2 and zero lines of symmetry.',
  },
  {
    id: 8,
    section: 'plane',
    topicLabel: 'Plane Symmetry (3D)',
    difficulty: 'Core',
    question: 'A wooden brick is a cuboid measuring 12 cm by 8 cm by 5 cm. How many planes of symmetry does it have?',
    diagramSvg: `
      <svg viewBox="0 0 180 120" class="w-40 h-28 mx-auto">
        <polygon points="30,45 100,25 150,45 80,65" fill="#fdf4ff" stroke="#a855f7" stroke-width="2" />
        <polygon points="30,45 80,65 80,105 30,85" fill="#fae8ff" stroke="#a855f7" stroke-width="2" />
        <polygon points="80,65 150,45 150,85 80,105" fill="#f5d0fe" stroke="#a855f7" stroke-width="2" />
        <line x1="55" y1="55" x2="115" y2="35" stroke="#ef4444" stroke-width="2" stroke-dasharray="3" />
        <line x1="55" y1="95" x2="115" y2="75" stroke="#ef4444" stroke-width="2" stroke-dasharray="3" />
      </svg>
    `,
    options: ['2', '3', '6', '9'],
    correctIndex: 1,
    hint: 'Since length, width, and height are all different, you can only slice midway through each pair of opposite faces.',
    explanation: 'A cuboid with three distinct dimensions has exactly 3 planes of symmetry, each cutting midway through opposite faces. (Diagonal cuts do not work unless faces are squares).',
    speechText: 'A cuboid with different dimensions has three planes of symmetry.',
  },
  {
    id: 9,
    section: 'plane',
    topicLabel: 'Plane Symmetry (3D)',
    difficulty: 'Extended',
    question: 'A solid cube has how many planes of symmetry in total?',
    diagramSvg: `
      <svg viewBox="0 0 150 130" class="w-32 h-28 mx-auto">
        <polygon points="35,40 85,20 125,40 75,60" fill="#ede9fe" stroke="#6d28d9" stroke-width="2" />
        <polygon points="35,40 75,60 75,110 35,90" fill="#ddd6fe" stroke="#6d28d9" stroke-width="2" />
        <polygon points="75,60 125,40 125,90 75,110" fill="#c4b5fd" stroke="#6d28d9" stroke-width="2" />
        <polygon points="35,40 125,40 125,90 35,90" fill="#ef4444" fill-opacity="0.25" stroke="#ef4444" stroke-dasharray="3" />
      </svg>
    `,
    options: ['3', '6', '9', '12'],
    correctIndex: 2,
    hint: 'Count planes parallel to the square faces (3) plus diagonal planes through opposite edges (6).',
    explanation: 'A cube has 9 planes of symmetry: 3 planes parallel to the faces + 6 diagonal planes connecting opposite edges.',
    speechText: 'A solid cube has nine planes of symmetry.',
  },
  {
    id: 10,
    section: 'plane',
    topicLabel: 'Plane Symmetry (3D)',
    difficulty: 'Extended',
    question: 'How many planes of symmetry does a right pyramid with a square base have?',
    diagramSvg: `
      <svg viewBox="0 0 160 140" class="w-36 h-32 mx-auto">
        <polygon points="80,15 25,95 135,95" fill="#fdf2f8" stroke="#db2777" stroke-width="2" />
        <polygon points="80,15 135,95 110,120 25,95" fill="#fce7f3" stroke="#db2777" stroke-width="2" />
        <polygon points="25,95 80,15 55,120" fill="none" stroke="#db2777" stroke-dasharray="3" />
        <circle cx="80" cy="15" r="4" fill="#db2777" />
        <text x="75" y="10" font-size="10" fill="#db2777" font-weight="bold">Apex</text>
      </svg>
    `,
    options: ['1', '2', '4', '8'],
    correctIndex: 2,
    hint: 'Think of the square base: how many lines of symmetry does a square have? The pyramid has vertical planes passing through those lines and the apex.',
    explanation: 'A square-based pyramid has 4 planes of symmetry: 2 vertical planes through the apex and opposite edge midpoints, and 2 vertical planes through the apex and opposite diagonal corners.',
    speechText: 'A right pyramid with a square base has four planes of symmetry.',
  },
];
