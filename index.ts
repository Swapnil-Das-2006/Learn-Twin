export type ConceptCategory = 
  | 'foundations'
  | 'differential'
  | 'integral'
  | 'applications'
  | 'advanced';

export interface Concept {
  id: string;
  name: string;
  subject: string;
  difficulty: number; // 1 to 5
  category: ConceptCategory;
  prerequisites: string[]; // Concept IDs forming the DAG
  description: string;
  importance: number; // 1 to 5, determines node size & centrality
  estimatedLearningMinutes: number;
  coreFormulas?: string[];
  commonMisconceptions: {
    tag: string;
    description: string;
    remedy: string;
  }[];
}

export interface BktParameters {
  pInit: number;      // P(L_0) - initial mastery probability
  pTransit: number;   // P(T) - transition/learning probability per attempt
  pGuess: number;     // P(G) - probability of guessing correctly when unmastered
  pSlip: number;      // P(S) - probability of slipping/erring when mastered
}

export interface MisconceptionOccurrence {
  tag: string;
  description: string;
  occurrences: number;
  lastObservedAt: string;
}

export interface Attempt {
  id: string;
  studentId: string;
  conceptId: string;
  questionId: string;
  questionText: string;
  studentResponse: string;
  correctResponse: string;
  isCorrect: boolean;
  timeTakenSec: number;
  inferredMisconceptionTag?: string;
  inferredMisconceptionDesc?: string;
  timestamp: string;
}

export interface ConceptMastery {
  conceptId: string;
  score: number; // 0 to 1 (Bayesian P(L))
  confidence: number; // 0 to 1 (estimation certainty)
  stability: number; // Memory stability in days for forgetting curve
  lastPracticedAt: string; // ISO date
  decayedScore: number; // Current score after applying Ebbinghaus decay
  bkt: BktParameters;
  attemptHistory: Attempt[];
  detectedMisconceptions: MisconceptionOccurrence[];
}

export interface StudentProfile {
  id: string;
  name: string;
  avatar: string;
  personaTag: 'Strong-but-gappy' | 'Weak-but-consistent' | 'Fresh-diagnostic';
  learningPace: 'fast' | 'moderate' | 'deliberate';
  preferredModality: 'visual' | 'socratic' | 'worked_example';
  targetExamName: string;
  targetExamDate: string; // e.g. "2026-09-15"
  examReadinessTarget: number; // e.g. 0.85
  bio: string;
}

export interface StudentTwinState {
  student: StudentProfile;
  masteries: Record<string, ConceptMastery>; // conceptId -> ConceptMastery
  overallMastery: number; // 0 to 1
  examReadinessScore: number; // 0 to 100
  activeBottlenecks: {
    conceptId: string;
    masteryScore: number;
    downstreamImpactCount: number;
    impactedConceptIds: string[];
    severity: 'critical' | 'moderate';
  }[];
  twinInsights: TwinInsight[];
  historySnapshots: {
    timestamp: string;
    overallMastery: number;
    readinessScore: number;
    activeBottleneckCount: number;
    label?: string;
  }[];
  learningPathQueue: LearningPathStep[];
}

export interface TwinInsight {
  id: string;
  type: 'cognitive_pace' | 'bottleneck' | 'misconception' | 'retention' | 'strengths';
  title: string;
  message: string;
  metric?: string;
  impactScore?: number;
  actionableStep?: string;
  targetConceptId?: string;
  severity: 'info' | 'warning' | 'critical' | 'success';
}

export interface LearningPathStep {
  stepNumber: number;
  conceptId: string;
  conceptName: string;
  rationale: string;
  estimatedMinutes: number;
  priority: 'high' | 'medium' | 'low';
  isBottleneck: boolean;
  targetMisconceptions: string[];
}

export interface Question {
  id: string;
  conceptId: string;
  text: string;
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
    misconceptionTag?: string;
    misconceptionExplanation?: string;
  }[];
  explanation: string;
  difficulty: number; // 1 to 5
}

export interface DiagnosticQuestionResult {
  question: Question;
  selectedOptionId: string;
  isCorrect: boolean;
  timeTakenSec: number;
  uncertaintyBefore: number;
  uncertaintyAfter: number;
}

export interface MicroLesson {
  conceptId: string;
  conceptName: string;
  generatedForReason: string;
  modality: 'visual' | 'socratic' | 'worked_example';
  tailoredExplanation: string;
  coreIntuition: string;
  workedExample: {
    problem: string;
    steps: {
      step: number;
      explanation: string;
      math: string;
    }[];
    finalAnswer: string;
  };
  commonTraps: {
    trap: string;
    whyItHappens: string;
    howToAvoid: string;
  }[];
  instantConceptCheck: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
}

export interface TargetedQuiz {
  conceptId: string;
  conceptName: string;
  reasoning: string;
  targetedMisconceptions: string[];
  questions: Question[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  conceptContextId?: string;
  mathSteps?: string[];
  suggestedPrompts?: string[];
  inferredMisconceptionAddressed?: string;
}

export interface WeeklyStudyPlan {
  studentName: string;
  generatedDate: string;
  targetExam: string;
  overallStrategyRationale: string;
  weeklyTargetHours: number;
  days: {
    dayName: string;
    focusConceptId: string;
    focusConceptName: string;
    sessionGoal: string;
    plannedMinutes: number;
    whyThisToday: string;
    recommendedActivity: 'Micro-lesson + Drill' | 'Synthesis Problems' | 'Diagnostic Refresh' | 'Review & Recall';
  }[];
}

