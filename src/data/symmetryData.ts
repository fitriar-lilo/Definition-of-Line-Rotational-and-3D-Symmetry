/**
 * IGCSE Mathematics 0580 - Topic 19: Symmetry
 * Data Store for Sections 1, 2, and 3
 * 
 * TEACHER NOTE:
 * You can easily edit or add new shapes, worked examples, and practice questions
 * in the arrays below. Keep the language simple and friendly!
 */

import { WorkedExample, PracticeQuestion } from '../types';

export interface Shape2DInfo {
  id: string;
  name: string;
  lines: number;
  rotationalOrder: number;
  description: string;
  details: string;
  svgPoints: string;
  viewBox: string;
  symmetryLines: Array<{ x1: number; y1: number; x2: number; y2: number; label: string }>;
}

export const COMMON_SHAPES_DATA: Shape2DInfo[] = [
  {
    id: 'equilateral-triangle',
    name: 'Equilateral Triangle',
    lines: 3,
    rotationalOrder: 3,
    description: '3 equal sides, 3 equal angles (60°).',
    details: 'Has 3 lines of symmetry from each corner to the opposite side midpoint.',
    svgPoints: '100,20 170,140 30,140',
    viewBox: '0 0 200 160',
    symmetryLines: [
      { x1: 100, y1: 20, x2: 100, y2: 140, label: 'Vertical' },
      { x1: 30, y1: 140, x2: 135, y2: 80, label: 'From left vertex' },
      { x1: 170, y1: 140, x2: 65, y2: 80, label: 'From right vertex' },
    ],
  },
  {
    id: 'square',
    name: 'Square',
    lines: 4,
    rotationalOrder: 4,
    description: '4 equal sides and 4 right angles (90°).',
    details: 'Has 4 lines of symmetry: 2 through opposite side midpoints, and 2 corner-to-corner diagonals.',
    svgPoints: '40,20 160,20 160,140 40,140',
    viewBox: '0 0 200 160',
    symmetryLines: [
      { x1: 100, y1: 20, x2: 100, y2: 140, label: 'Vertical' },
      { x1: 40, y1: 80, x2: 160, y2: 80, label: 'Horizontal' },
      { x1: 40, y1: 20, x2: 160, y2: 140, label: 'Diagonal 1' },
      { x1: 160, y1: 20, x2: 40, y2: 140, label: 'Diagonal 2' },
    ],
  },
  {
    id: 'rectangle',
    name: 'Rectangle',
    lines: 2,
    rotationalOrder: 2,
    description: 'Opposite sides equal, 4 right angles.',
    details: 'Has 2 lines of symmetry (horizontal and vertical). Diagonals are NOT lines of symmetry!',
    svgPoints: '30,40 170,40 170,120 30,120',
    viewBox: '0 0 200 160',
    symmetryLines: [
      { x1: 100, y1: 40, x2: 100, y2: 120, label: 'Vertical' },
      { x1: 30, y1: 80, x2: 170, y2: 80, label: 'Horizontal' },
    ],
  },
  {
    id: 'regular-pentagon',
    name: 'Regular Pentagon',
    lines: 5,
    rotationalOrder: 5,
    description: '5 equal sides and 5 equal angles.',
    details: 'Has 5 lines of symmetry, each passing through one vertex and the opposite side midpoint.',
    svgPoints: '100,20 176,75 147,150 53,150 24,75',
    viewBox: '0 0 200 170',
    symmetryLines: [
      { x1: 100, y1: 20, x2: 100, y2: 150, label: 'Line 1' },
      { x1: 176, y1: 75, x2: 38, y2: 112, label: 'Line 2' },
      { x1: 147, y1: 150, x2: 62, y2: 47, label: 'Line 3' },
      { x1: 53, y1: 150, x2: 138, y2: 47, label: 'Line 4' },
      { x1: 24, y1: 75, x2: 162, y2: 112, label: 'Line 5' },
    ],
  },
  {
    id: 'regular-hexagon',
    name: 'Regular Hexagon',
    lines: 6,
    rotationalOrder: 6,
    description: '6 equal sides and 6 equal angles.',
    details: 'Has 6 lines of symmetry: 3 through opposite vertices, and 3 through opposite side midpoints.',
    svgPoints: '100,20 169,50 169,120 100,150 31,120 31,50',
    viewBox: '0 0 200 170',
    symmetryLines: [
      { x1: 100, y1: 20, x2: 100, y2: 150, label: 'Vertical vertex-vertex' },
      { x1: 31, y1: 50, x2: 169, y2: 120, label: 'Diagonal vertex-vertex' },
      { x1: 31, y1: 120, x2: 169, y2: 50, label: 'Diagonal vertex-vertex' },
      { x1: 31, y1: 85, x2: 169, y2: 85, label: 'Horizontal side-side' },
      { x1: 65, y1: 35, x2: 135, y2: 135, label: 'Slanted side-side' },
      { x1: 135, y1: 35, x2: 65, y2: 135, label: 'Slanted side-side' },
    ],
  },
  {
    id: 'parallelogram',
    name: 'Parallelogram',
    lines: 0,
    rotationalOrder: 2,
    description: 'Opposite sides are parallel and equal length.',
    details: 'Special rule: A standard parallelogram has ZERO (0) lines of symmetry! When folded, corners do not match.',
    svgPoints: '60,35 180,35 140,125 20,125',
    viewBox: '0 0 200 160',
    symmetryLines: [],
  },
  {
    id: 'kite',
    name: 'Kite',
    lines: 1,
    rotationalOrder: 1,
    description: 'Two pairs of equal adjacent sides.',
    details: 'Has exactly 1 line of symmetry along its main vertical diagonal.',
    svgPoints: '100,20 160,70 100,150 40,70',
    viewBox: '0 0 200 170',
    symmetryLines: [
      { x1: 100, y1: 20, x2: 100, y2: 150, label: 'Main diagonal' },
    ],
  },
  {
    id: 'isosceles-trapezium',
    name: 'Isosceles Trapezium',
    lines: 1,
    rotationalOrder: 1,
    description: 'Non-parallel sides are equal in length.',
    details: 'Has exactly 1 line of symmetry through the midpoints of the parallel sides.',
    svgPoints: '50,35 150,35 180,125 20,125',
    viewBox: '0 0 200 160',
    symmetryLines: [
      { x1: 100, y1: 35, x2: 100, y2: 125, label: 'Vertical midline' },
    ],
  },
  {
    id: 'circle',
    name: 'Circle',
    lines: 999, // Infinite
    rotationalOrder: 999, // Infinite
    description: 'All points are equal distance from center.',
    details: 'A circle has an infinite number of lines of symmetry (every diameter is a line of symmetry).',
    svgPoints: 'circle',
    viewBox: '0 0 200 160',
    symmetryLines: [
      { x1: 100, y1: 10, x2: 100, y2: 150, label: 'Vertical diameter' },
      { x1: 30, y1: 80, x2: 170, y2: 80, label: 'Horizontal diameter' },
      { x1: 50, y1: 30, x2: 150, y2: 130, label: 'Diagonal 1' },
      { x1: 150, y1: 30, x2: 50, y2: 130, label: 'Diagonal 2' },
    ],
  },
];

// SECTION 1: WORKED EXAMPLES
export const SECTION1_WORKED_EXAMPLES: WorkedExample[] = [
  {
    id: 's1-we1',
    title: 'Example 1: Lines of symmetry of an Isosceles Triangle',
    problem: 'Find the number of lines of symmetry for an isosceles triangle with sides 5 cm, 5 cm, and 6 cm.',
    steps: [
      {
        title: 'Step 1: Understand the shape',
        explanation: 'An isosceles triangle has two equal sides (5 cm) and one base (6 cm).',
      },
      {
        title: 'Step 2: Test folding lines',
        explanation: 'Draw a vertical line from the top corner straight down to the middle of the base.',
      },
      {
        title: 'Step 3: Check if both halves match',
        explanation: 'When folded along this vertical line, the left 5 cm side matches the right 5 cm side perfectly. Any other fold does not match.',
      },
      {
        title: 'Step 4: Final answer',
        explanation: 'An isosceles triangle has exactly 1 line of symmetry.',
      },
    ],
  },
  {
    id: 's1-we2',
    title: 'Example 2: Is the diagonal of a rectangle a mirror line?',
    problem: 'Zack says: "A rectangle has 4 lines of symmetry because you can fold along both diagonals." Is Zack correct? Explain why or why not.',
    steps: [
      {
        title: 'Step 1: Check the midlines',
        explanation: 'Folding across the horizontal midline matches top and bottom. Folding across the vertical midline matches left and right. That makes 2 lines.',
      },
      {
        title: 'Step 2: Test the diagonal fold',
        explanation: 'If you fold a paper rectangle along a diagonal corner-to-corner, the corners stick out! They do not overlap.',
      },
      {
        title: 'Step 3: Conclusion',
        explanation: 'Zack is wrong. The diagonals of an ordinary rectangle are NOT lines of symmetry. A rectangle has only 2 lines of symmetry.',
      },
    ],
  },
  {
    id: 's1-we3',
    title: 'Example 3: Regular Polygons rule',
    problem: 'How many lines of symmetry does a regular octagon (8 sides) have?',
    steps: [
      {
        title: 'Step 1: Remember the golden rule for regular shapes',
        explanation: 'For any regular polygon (where all sides and all interior angles are equal), the number of lines of symmetry equals the number of sides $n$.',
        mathFormula: '\\text{Number of lines of symmetry} = n',
      },
      {
        title: 'Step 2: Apply to an octagon',
        explanation: 'An octagon has $n = 8$ equal sides.',
        mathFormula: 'n = 8 \\implies 8 \\text{ lines of symmetry}',
      },
      {
        title: 'Step 3: Final Answer',
        explanation: 'A regular octagon has 8 lines of symmetry.',
      },
    ],
  },
];

// SECTION 1: PRACTICE QUESTIONS
export const SECTION1_PRACTICE: PracticeQuestion[] = [
  {
    id: 's1-p1',
    type: 'choice',
    question: 'How many lines of symmetry does a square have?',
    hint: 'Think about folding top-to-bottom, side-to-side, and corner-to-corner.',
    options: ['2', '4', '8', 'Infinite'],
    correctOptionIndex: 1,
    explanation: 'A square has 4 lines of symmetry: 2 through the opposite side midpoints, and 2 along the diagonals.',
    speechText: 'How many lines of symmetry does a square have? A square has four lines of symmetry.',
  },
  {
    id: 's1-p2',
    type: 'number',
    question: 'How many lines of symmetry does a standard parallelogram have? Type your number below.',
    hint: 'Try folding a slanted box: do the corners meet or stick out?',
    correctNumber: 0,
    explanation: 'A parallelogram has 0 lines of symmetry. Its sides are slanted, so no folding line makes both halves match.',
    speechText: 'How many lines of symmetry does a standard parallelogram have? The answer is zero.',
  },
  {
    id: 's1-p3',
    type: 'choice',
    question: 'Which of these capital letters has BOTH a horizontal AND a vertical line of symmetry?',
    hint: 'Picture cutting the letter like a mirror top-down and left-right.',
    options: ['Letter A', 'Letter M', 'Letter H', 'Letter P'],
    correctOptionIndex: 2,
    explanation: 'Letter H has both a vertical mirror line down the middle and a horizontal mirror line across the crossbar.',
    speechText: 'Which letter has both horizontal and vertical symmetry? Letter H.',
  },
  {
    id: 's1-p4',
    type: 'number',
    question: 'A regular polygon has 9 equal sides (a regular nonagon). How many lines of symmetry does it have?',
    hint: 'For regular polygons, the number of lines of symmetry equals the number of sides.',
    correctNumber: 9,
    explanation: 'For any regular polygon with n sides, it has exactly n lines of symmetry. So a 9-sided regular polygon has 9 lines.',
    speechText: 'A regular polygon has 9 equal sides. It has 9 lines of symmetry.',
  },
  {
    id: 's1-p5',
    type: 'choice',
    question: 'Which statement about a circle is TRUE in IGCSE Mathematics?',
    hint: 'How many diameters can you draw through the center of a circle?',
    options: [
      'It has only 4 lines of symmetry',
      'It has 360 lines of symmetry',
      'It has an infinite number of lines of symmetry',
      'It has 0 lines of symmetry'
    ],
    correctOptionIndex: 2,
    explanation: 'Every straight line passing through the center of a circle (every diameter) is a line of symmetry. There are infinite diameters, so infinite lines of symmetry!',
    speechText: 'A circle has an infinite number of lines of symmetry.',
  },
];

// SECTION 2: ROTATIONAL SYMMETRY DATA
export const ROTATIONAL_SHAPES_DATA = [
  {
    id: 'equilateral-triangle',
    name: 'Equilateral Triangle',
    order: 3,
    angle: 120,
    formula: '360° ÷ 3 = 120°',
    description: 'Fits onto itself 3 times during a full 360° turn. Every 120°, it looks identical.',
  },
  {
    id: 'square',
    name: 'Square',
    order: 4,
    angle: 90,
    formula: '360° ÷ 4 = 90°',
    description: 'Fits onto itself 4 times. Every 90° turn (quarter turn), it matches the original.',
  },
  {
    id: 'rectangle',
    name: 'Rectangle',
    order: 2,
    angle: 180,
    formula: '360° ÷ 2 = 180°',
    description: 'After 90° it stands tall, but after 180° (half turn) it matches! Order is 2.',
  },
  {
    id: 'parallelogram',
    name: 'Parallelogram',
    order: 2,
    angle: 180,
    formula: '360° ÷ 2 = 180°',
    description: 'Although it has 0 lines of symmetry, turning it 180° matches perfectly! Order is 2.',
  },
  {
    id: 'regular-hexagon',
    name: 'Regular Hexagon',
    order: 6,
    angle: 60,
    formula: '360° ÷ 6 = 60°',
    description: 'Fits onto itself 6 times. Turn it by 60° and it matches.',
  },
  {
    id: 'letter-s',
    name: 'Letter S',
    order: 2,
    angle: 180,
    formula: '360° ÷ 2 = 180°',
    description: 'When turned upside down (180°), the letter S looks just like an S again! Order 2.',
  },
  {
    id: 'letter-z',
    name: 'Letter Z',
    order: 2,
    angle: 180,
    formula: '360° ÷ 2 = 180°',
    description: 'Turn Z by 180° and it becomes a Z again. Order 2.',
  },
  {
    id: 'scalene-triangle',
    name: 'Scalene Triangle',
    order: 1,
    angle: 360,
    formula: '360° ÷ 1 = 360°',
    description: 'Only matches when turned a complete 360° back to the start. In IGCSE, order 1 means NO rotational symmetry.',
  },
];

// SECTION 2: WORKED EXAMPLES
export const SECTION2_WORKED_EXAMPLES: WorkedExample[] = [
  {
    id: 's2-we1',
    title: 'Example 1: Finding the Order of Rotational Symmetry',
    problem: 'A ceiling fan has 4 identical blades equally spaced around its center. Find its order of rotational symmetry and the smallest angle of rotation.',
    steps: [
      {
        title: 'Step 1: Count how many times it fits onto itself',
        explanation: 'Because there are 4 identical blades equally spaced, turning the fan brings each blade to the next blade position 4 times in one full turn of 360°.',
      },
      {
        title: 'Step 2: State the order',
        explanation: 'The order of rotational symmetry is 4.',
      },
      {
        title: 'Step 3: Calculate the smallest angle of rotation',
        explanation: 'Use the IGCSE formula: $\\text{Angle} = \\dfrac{360^\\circ}{\\text{Order}}$.',
        mathFormula: '\\text{Angle} = \\dfrac{360^\\circ}{4} = 90^\\circ',
      },
    ],
  },
  {
    id: 's2-we2',
    title: 'Example 2: The Parallelogram Trap',
    problem: 'Exam Question: Write down (a) the number of lines of symmetry and (b) the order of rotational symmetry of a parallelogram.',
    steps: [
      {
        title: 'Step 1: Check lines of symmetry',
        explanation: 'A parallelogram has NO mirror lines because opposite corners do not match when folded. Number of lines = 0.',
      },
      {
        title: 'Step 2: Check rotational symmetry',
        explanation: 'Put a pin in the centre. Rotate by 180° (half turn). The shape fits onto its outline! After 360°, it fits again.',
      },
      {
        title: 'Step 3: Final Answer',
        explanation: '(a) Lines of symmetry = 0. (b) Order of rotational symmetry = 2. Always remember this common exam question!',
      },
    ],
  },
  {
    id: 's2-we3',
    title: 'Example 3: Letters with Rotational Symmetry',
    problem: 'Which of the following capital letters have rotational symmetry of order 2? Letters: [A, B, H, N, M]',
    steps: [
      {
        title: 'Step 1: Turn each letter upside down (180°)',
        explanation: 'Letter A upside down looks like an inverted V. (Not order 2)\nLetter B upside down is not identical. (Not order 2)\nLetter H upside down is still H! (Yes)\nLetter N upside down is still N! (Yes)\nLetter M upside down looks like W. (Not order 2)',
      },
      {
        title: 'Step 2: Final Answer',
        explanation: 'The letters with rotational symmetry of order 2 are H and N.',
      },
    ],
  },
];

// SECTION 2: PRACTICE QUESTIONS
export const SECTION2_PRACTICE: PracticeQuestion[] = [
  {
    id: 's2-p1',
    type: 'choice',
    question: 'What is the order of rotational symmetry of a regular hexagon?',
    hint: 'How many sides does a regular hexagon have?',
    options: ['2', '3', '6', '12'],
    correctOptionIndex: 2,
    explanation: 'A regular hexagon has 6 equal sides and angles. It fits on itself 6 times in 360°, so its order of rotational symmetry is 6.',
    speechText: 'What is the order of rotational symmetry of a regular hexagon? The order is six.',
  },
  {
    id: 's2-p2',
    type: 'number',
    question: 'A shape has an order of rotational symmetry of 5. What is the smallest angle (in degrees) to rotate it onto itself?',
    hint: 'Divide 360 by 5.',
    correctNumber: 72,
    explanation: 'Angle = 360° ÷ 5 = 72°.',
    speechText: 'Divide 360 by 5 to get 72 degrees.',
  },
  {
    id: 's2-p3',
    type: 'choice',
    question: 'Which of these letters has rotational symmetry of order 2?',
    hint: 'Turn the screen upside down (180°): which letter looks the same?',
    options: ['E', 'Z', 'C', 'L'],
    correctOptionIndex: 1,
    explanation: 'Letter Z upside down looks like Z again. Its order of rotational symmetry is 2.',
    speechText: 'Letter Z has rotational symmetry of order two.',
  },
  {
    id: 's2-p4',
    type: 'choice',
    question: 'In IGCSE Mathematics, if a shape only fits onto itself after a full 360° turn, what do we say about its rotational symmetry?',
    hint: 'Does it have any rotational symmetry if order is 1?',
    options: [
      'It has order 1 (which means it has NO rotational symmetry)',
      'It has order 0',
      'It has infinite rotational symmetry',
      'It cannot be determined'
    ],
    correctOptionIndex: 0,
    explanation: 'Every shape matches itself after 360°. So an order of 1 means it has no rotational symmetry.',
    speechText: 'An order of one means the shape has no rotational symmetry.',
  },
  {
    id: 's2-p5',
    type: 'number',
    question: 'A rectangle has length 8 cm and width 5 cm. What is its order of rotational symmetry?',
    hint: 'It matches after 180° and after 360°.',
    correctNumber: 2,
    explanation: 'A rectangle has order of rotational symmetry 2 (matches at 180° and 360°).',
    speechText: 'A rectangle has order of rotational symmetry two.',
  },
];

// SECTION 3: 3D PLANE SYMMETRY DATA
export interface Solid3DInfo {
  id: string;
  name: string;
  planes: number;
  description: string;
  planesBreakdown: string[];
  sampleImage: string;
}

export const SOLIDS_3D_DATA: Solid3DInfo[] = [
  {
    id: 'cube',
    name: 'Cube',
    planes: 9,
    description: 'All 6 faces are identical squares.',
    planesBreakdown: [
      '3 planes parallel to the faces (cutting halfway through front-back, top-bottom, left-right)',
      '6 diagonal planes connecting opposite edges',
      'Total: 3 + 6 = 9 planes of symmetry',
    ],
    sampleImage: 'cube',
  },
  {
    id: 'cuboid',
    name: 'Cuboid (Rectangular Box)',
    planes: 3,
    description: 'Different length, width, and height.',
    planesBreakdown: [
      '1 horizontal plane cutting through mid-height',
      '1 vertical plane cutting through mid-length',
      '1 vertical plane cutting through mid-width',
      'Note: Diagonals do NOT form planes of symmetry unless faces are squares!',
      'Total: 3 planes of symmetry',
    ],
    sampleImage: 'cuboid',
  },
  {
    id: 'square-pyramid',
    name: 'Square-based Pyramid',
    planes: 4,
    description: 'Square base with 4 triangular faces meeting at an apex.',
    planesBreakdown: [
      '2 vertical planes through the apex and opposite base edge midpoints',
      '2 vertical planes through the apex and opposite base diagonal corners',
      'Total: 4 planes of symmetry',
    ],
    sampleImage: 'pyramid',
  },
  {
    id: 'triangular-prism',
    name: 'Equilateral Triangular Prism',
    planes: 4,
    description: 'Two equilateral triangle ends joined by 3 rectangular faces.',
    planesBreakdown: [
      '1 plane cutting through the middle parallel to the triangular faces',
      '3 vertical planes passing through the mid-line of the triangular faces',
      'Total: 1 + 3 = 4 planes of symmetry',
    ],
    sampleImage: 'prism',
  },
  {
    id: 'cylinder',
    name: 'Cylinder',
    planes: 999, // Infinite
    description: 'Circular top and bottom with curved surface.',
    planesBreakdown: [
      '1 horizontal plane through the middle of its height',
      'Infinite vertical planes containing the central vertical axis',
      'Total: Infinite planes of symmetry',
    ],
    sampleImage: 'cylinder',
  },
  {
    id: 'sphere',
    name: 'Sphere (Ball)',
    planes: 999, // Infinite
    description: 'Completely round 3D solid.',
    planesBreakdown: [
      'Every flat plane passing through the centre of the sphere is a plane of symmetry.',
      'Total: Infinite planes of symmetry',
    ],
    sampleImage: 'sphere',
  },
];

// SECTION 3: WORKED EXAMPLES
export const SECTION3_WORKED_EXAMPLES: WorkedExample[] = [
  {
    id: 's3-we1',
    title: 'Example 1: Planes of Symmetry in a Cuboid',
    problem: 'A cereal box measures 20 cm by 15 cm by 6 cm. How many planes of symmetry does this box have? Why not 9 like a cube?',
    steps: [
      {
        title: 'Step 1: Understand the dimensions',
        explanation: 'All three dimensions (length, width, height) are different, so none of the faces are squares.',
      },
      {
        title: 'Step 2: Find the planes through the faces',
        explanation: 'You can slice it through the middle in 3 directions: parallel to the front face, parallel to the side face, and parallel to the top face.',
      },
      {
        title: 'Step 3: Test diagonal slices',
        explanation: 'Because the faces are rectangles (not squares), diagonal slices do NOT create mirror halves. The corners stick out!',
      },
      {
        title: 'Step 4: Final Answer',
        explanation: 'A cuboid where all sides are different has exactly 3 planes of symmetry.',
      },
    ],
  },
  {
    id: 's3-we2',
    title: 'Example 2: Planes of Symmetry in a Cube',
    problem: 'Explain why a cube has 9 planes of symmetry.',
    steps: [
      {
        title: 'Step 1: Count face-parallel planes',
        explanation: 'There are 3 planes passing midway between opposite square faces (cutting the cube into two equal rectangular blocks).',
      },
      {
        title: 'Step 2: Count diagonal planes',
        explanation: 'Because every face of a cube is a square, you can also slice diagonally across opposite edges. A cube has 6 pairs of opposite edges, giving 6 diagonal planes.',
      },
      {
        title: 'Step 3: Add them up',
        explanation: '3 (parallel to faces) + 6 (diagonal) = 9 planes of symmetry.',
        mathFormula: '3 + 6 = 9 \\text{ planes}',
      },
    ],
  },
];

// SECTION 3: PRACTICE QUESTIONS
export const SECTION3_PRACTICE: PracticeQuestion[] = [
  {
    id: 's3-p1',
    type: 'choice',
    question: 'What is a "plane of symmetry"?',
    hint: 'Think of an imaginary flat sheet or mirror cutting a 3D solid.',
    options: [
      'A curved line drawn around a solid',
      'An imaginary flat mirror that cuts a solid into two matching mirror halves',
      'The shadow of a 3D object on the floor',
      'The volume of a 3D shape'
    ],
    correctOptionIndex: 1,
    explanation: 'A plane of symmetry is an imaginary flat sheet/mirror that divides a 3D solid into two halves that are exact mirror reflections of each other.',
    speechText: 'A plane of symmetry is an imaginary flat mirror that cuts a solid into two matching mirror halves.',
  },
  {
    id: 's3-p2',
    type: 'number',
    question: 'How many planes of symmetry does a solid cube have? Type the number.',
    hint: '3 parallel to faces + 6 diagonal planes.',
    correctNumber: 9,
    explanation: 'A cube has 9 planes of symmetry (3 parallel to faces and 6 through diagonally opposite edges).',
    speechText: 'A solid cube has 9 planes of symmetry.',
  },
  {
    id: 's3-p3',
    type: 'number',
    question: 'How many planes of symmetry does a cuboid with dimensions 4 cm × 7 cm × 9 cm have?',
    hint: 'Since all dimensions are different, it only has planes parallel to its faces.',
    correctNumber: 3,
    explanation: 'A cuboid with three different dimensions has exactly 3 planes of symmetry.',
    speechText: 'A cuboid with different dimensions has 3 planes of symmetry.',
  },
  {
    id: 's3-p4',
    type: 'choice',
    question: 'How many planes of symmetry does a pyramid with a square base have?',
    hint: '2 cut through the opposite faces, and 2 cut diagonally through opposite corners.',
    options: ['1', '2', '4', '8'],
    correctOptionIndex: 2,
    explanation: 'A square-based pyramid has 4 planes of symmetry: 2 through the midpoints of opposite base edges, and 2 through the opposite diagonal corners.',
    speechText: 'A pyramid with a square base has 4 planes of symmetry.',
  },
  {
    id: 's3-p5',
    type: 'choice',
    question: 'How many planes of symmetry does a solid cylinder have?',
    hint: 'Think of how many vertical slices you can make through its round circular top.',
    options: ['1', '2', '3', 'Infinite'],
    correctOptionIndex: 3,
    explanation: 'A cylinder has 1 horizontal plane through the middle, plus an infinite number of vertical planes passing through the central circular axis. So it has an infinite number of planes!',
    speechText: 'A cylinder has an infinite number of planes of symmetry.',
  },
];
