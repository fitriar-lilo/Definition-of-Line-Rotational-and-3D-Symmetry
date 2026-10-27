export interface StudentProgress {
  name: string;
  currentSection: number; // 1, 2, 3, or 4
  completedSections: number[]; // e.g. [1, 2]
  practiceAnswers: Record<string, { answered: boolean; attempts: number; correct: boolean }>;
  assessmentAttempts: Record<number, number>; // questionId -> number of attempts used
  assessmentAnswers: Record<number, number>; // questionId -> chosen correct option index
  assessmentScore: number;
  assessmentCompleted: boolean;
  lastUpdated: string;
}

export interface WorkedStep {
  title: string;
  explanation: string;
  mathFormula?: string;
  diagramSvg?: string;
}

export interface WorkedExample {
  id: string;
  title: string;
  problem: string;
  diagramSvg?: string;
  steps: WorkedStep[];
}

export interface PracticeQuestion {
  id: string;
  type: 'choice' | 'number' | 'interactive';
  question: string;
  hint: string;
  diagramSvg?: string;
  mathExpression?: string;
  options?: string[];
  correctOptionIndex?: number;
  correctNumber?: number;
  explanation: string;
  speechText: string;
}

export interface AssessmentQuestion {
  id: number;
  section: 'line' | 'rotational' | 'plane';
  topicLabel: string;
  difficulty: 'Foundation' | 'Core' | 'Extended';
  question: string;
  diagramSvg?: string;
  options: string[];
  correctIndex: number;
  hint: string;
  explanation: string;
  speechText: string;
}
