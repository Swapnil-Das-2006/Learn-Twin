import { StudentProfile, StudentTwinState, ConceptMastery, Attempt } from '@/types';
import { CALCULUS_CONCEPTS } from './calculusGraph';

export const SEED_PROFILES: StudentProfile[] = [
  {
    id: 'student-alex',
    name: 'Alex Rivera',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    personaTag: 'Strong-but-gappy',
    learningPace: 'fast',
    preferredModality: 'worked_example',
    targetExamName: 'AP Calculus BC / Midterm Final',
    targetExamDate: '2026-09-28',
    examReadinessTarget: 0.88,
    bio: 'Fast intuitive solver who excels at single-concept algebra, but frequently misses composite inner terms on multi-step chain-rule operations.'
  },
  {
    id: 'student-maya',
    name: 'Maya Chen',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    personaTag: 'Weak-but-consistent',
    learningPace: 'deliberate',
    preferredModality: 'visual',
    targetExamName: 'University Calculus I Final',
    targetExamDate: '2026-10-10',
    examReadinessTarget: 0.82,
    bio: 'Disciplined and methodical student with steady study habits. Solid on foundations, but struggles with geometric synthesis in Related Rates & multi-part IBP.'
  },
  {
    id: 'student-new',
    name: 'Taylor Jordan',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    personaTag: 'Fresh-diagnostic',
    learningPace: 'moderate',
    preferredModality: 'socratic',
    targetExamName: 'Calculus Diagnostic Calibration',
    targetExamDate: '2026-09-30',
    examReadinessTarget: 0.80,
    bio: 'Uncalibrated new learner twin. Ready to run the 12-question maximum information-gain adaptive assessment.'
  }
];

export function createInitialAlexTwin(): StudentTwinState {
  const masteries: Record<string, ConceptMastery> = {};
  const now = new Date('2026-08-16T18:00:00Z');

  // Alex: High mastery in foundations, critical bottleneck in chain-rule & implicit-diff
  const scores: Record<string, { score: number; conf: number; daysAgo: number; attempts: number; slips: number; miscs?: string[] }> = {
    'limits-foundations': { score: 0.94, conf: 0.92, daysAgo: 12, attempts: 6, slips: 0 },
    'continuity': { score: 0.89, conf: 0.88, daysAgo: 10, attempts: 5, slips: 0 },
    'derivatives-def': { score: 0.86, conf: 0.85, daysAgo: 8, attempts: 5, slips: 1 },
    'power-rule': { score: 0.96, conf: 0.95, daysAgo: 7, attempts: 8, slips: 0 },
    'product-rule': { score: 0.88, conf: 0.85, daysAgo: 5, attempts: 6, slips: 1 },
    'quotient-rule': { score: 0.76, conf: 0.78, daysAgo: 4, attempts: 5, slips: 2, miscs: ['quotient_subtraction_order_reversed'] },
    // Critical Bottleneck
    'chain-rule': { score: 0.28, conf: 0.86, daysAgo: 1, attempts: 7, slips: 5, miscs: ['forgetting_inner_derivative', 'premature_inner_evaluation'] },
    'implicit-diff': { score: 0.34, conf: 0.72, daysAgo: 2, attempts: 4, slips: 3, miscs: ['omitting_dydx_on_y_terms'] },
    'related-rates': { score: 0.22, conf: 0.65, daysAgo: 2, attempts: 3, slips: 3, miscs: ['substituting_instantaneous_values_too_early'] },
    'mvt': { score: 0.81, conf: 0.78, daysAgo: 6, attempts: 4, slips: 1 },
    'optimization': { score: 0.38, conf: 0.70, daysAgo: 2, attempts: 4, slips: 3, miscs: ['forgetting_inner_derivative'] },
    'riemann-sums': { score: 0.92, conf: 0.90, daysAgo: 14, attempts: 6, slips: 0 },
    'definite-integrals': { score: 0.89, conf: 0.88, daysAgo: 9, attempts: 5, slips: 0 },
    'ftc': { score: 0.44, conf: 0.75, daysAgo: 3, attempts: 5, slips: 3, miscs: ['ftc1_variable_upper_bound_chain_rule_miss'] },
    'u-substitution': { score: 0.35, conf: 0.70, daysAgo: 2, attempts: 4, slips: 3, miscs: ['forgetting_inner_derivative', 'missing_constant_multiplier_in_du'] },
    'integration-by-parts': { score: 0.52, conf: 0.60, daysAgo: 3, attempts: 3, slips: 1 },
    'diff-equations': { score: 0.25, conf: 0.68, daysAgo: 1, attempts: 4, slips: 3, miscs: ['premature_c_omission'] }
  };

  CALCULUS_CONCEPTS.forEach(concept => {
    const data = scores[concept.id] || { score: 0.3, conf: 0.3, daysAgo: 15, attempts: 1, slips: 1 };
    const date = new Date(now.getTime() - data.daysAgo * 24 * 60 * 60 * 1000).toISOString();
    
    // Ebbinghaus decay: R = e^(-t/S)
    const stability = 14 + data.attempts * 3;
    const decayFactor = Math.exp(-data.daysAgo / stability);
    const decayedScore = Number(Math.max(0.1, data.score * (0.85 + 0.15 * decayFactor)).toFixed(2));

    const attempts: Attempt[] = [];
    for (let i = 0; i < data.attempts; i++) {
      const isSlip = i >= (data.attempts - data.slips);
      attempts.push({
        id: `att_${concept.id}_${i}`,
        studentId: 'student-alex',
        conceptId: concept.id,
        questionId: `q_${concept.id}_${i}`,
        questionText: `Calculus Practice Problem on ${concept.name} (Step ${i + 1})`,
        studentResponse: isSlip ? 'Selected incorrect algebraic derivative' : 'Correct analytical derivation',
        correctResponse: 'Correct analytical derivation',
        isCorrect: !isSlip,
        timeTakenSec: Math.floor(14 + Math.random() * 12), // Alex is fast (14-26s)
        inferredMisconceptionTag: isSlip && data.miscs ? data.miscs[i % data.miscs.length] : undefined,
        inferredMisconceptionDesc: isSlip && data.miscs ? `Missed due to ${data.miscs[i % data.miscs.length]}` : undefined,
        timestamp: new Date(now.getTime() - (data.daysAgo + (data.attempts - i)) * 24 * 3600 * 1000).toISOString()
      });
    }

    const detectedMisconceptions = (data.miscs || []).map(tag => ({
      tag,
      description: concept.commonMisconceptions.find(m => m.tag === tag)?.description || 'Frequent procedural slip',
      occurrences: data.slips || 2,
      lastObservedAt: date
    }));

    masteries[concept.id] = {
      conceptId: concept.id,
      score: data.score,
      confidence: data.conf,
      stability,
      lastPracticedAt: date,
      decayedScore,
      bkt: {
        pInit: 0.3,
        pTransit: 0.18,
        pGuess: 0.15,
        pSlip: 0.22 // Higher slip rate for Alex
      },
      attemptHistory: attempts,
      detectedMisconceptions
    };
  });

  return {
    student: SEED_PROFILES[0],
    masteries,
    overallMastery: 0.58,
    examReadinessScore: 61,
    activeBottlenecks: [
      {
        conceptId: 'chain-rule',
        masteryScore: 0.28,
        downstreamImpactCount: 5,
        impactedConceptIds: ['implicit-diff', 'related-rates', 'optimization', 'ftc', 'diff-equations'],
        severity: 'critical'
      },
      {
        conceptId: 'implicit-diff',
        masteryScore: 0.34,
        downstreamImpactCount: 1,
        impactedConceptIds: ['related-rates'],
        severity: 'moderate'
      }
    ],
    twinInsights: [
      {
        id: 'ins_alex_1',
        type: 'cognitive_pace',
        title: 'High Velocity / Premature Exit',
        message: 'You solve fast (avg 18s per question) but slip on 71% of composite problems. Slowing down by 10s on chain-rule steps would increase accuracy by ~24%.',
        metric: '18s avg speed / 71% multi-step slip',
        impactScore: 24,
        actionableStep: 'Practice 2-stage visual decomposition for outer/inner functions before writing derivatives.',
        severity: 'warning'
      },
      {
        id: 'ins_alex_2',
        type: 'bottleneck',
        title: 'Severe Downstream Bottleneck',
        message: 'Chain Rule Composition is blocking 5 downstream topics (Implicit Diff, Related Rates, Optimization, FTC, Diff Equations). Unblocking this single node unlocks +18% overall exam readiness.',
        metric: '5 blocked topics',
        impactScore: 18,
        targetConceptId: 'chain-rule',
        actionableStep: 'Complete the targeted AI Micro-Lesson on Chain Rule Composition.',
        severity: 'critical'
      },
      {
        id: 'ins_alex_3',
        type: 'retention',
        title: 'Riemann Sums Decay Warning',
        message: 'You scored 92% on Riemann Sums 14 days ago, but retention has decayed to 84% without recent spaced retrieval.',
        metric: '-8% Ebbinghaus decay',
        targetConceptId: 'riemann-sums',
        actionableStep: 'Schedule a 5-minute quick refresh quiz.',
        severity: 'info'
      }
    ],
    historySnapshots: [
      { timestamp: 'Day -21', overallMastery: 0.35, readinessScore: 32, activeBottleneckCount: 6, label: 'Initial Diagnostic' },
      { timestamp: 'Day -14', overallMastery: 0.44, readinessScore: 45, activeBottleneckCount: 4, label: 'Differential Unit' },
      { timestamp: 'Day -7', overallMastery: 0.52, readinessScore: 54, activeBottleneckCount: 3, label: 'Integral Intro' },
      { timestamp: 'Today', overallMastery: 0.58, readinessScore: 61, activeBottleneckCount: 2, label: 'Current State' }
    ],
    learningPathQueue: [
      {
        stepNumber: 1,
        conceptId: 'chain-rule',
        conceptName: 'Chain Rule Composition',
        rationale: 'Generated because you missed 5/7 questions on inner derivative multipliers, blocking 5 downstream topics.',
        estimatedMinutes: 20,
        priority: 'high',
        isBottleneck: true,
        targetMisconceptions: ['forgetting_inner_derivative', 'premature_inner_evaluation']
      },
      {
        stepNumber: 2,
        conceptId: 'implicit-diff',
        conceptName: 'Implicit Differentiation',
        rationale: 'Builds immediately upon Chain Rule mastery to resolve omitted dy/dx factors.',
        estimatedMinutes: 20,
        priority: 'high',
        isBottleneck: true,
        targetMisconceptions: ['omitting_dydx_on_y_terms']
      },
      {
        stepNumber: 3,
        conceptId: 'ftc',
        conceptName: 'Fundamental Theorem of Calculus',
        rationale: 'Unlocks advanced integration once composite bounds are stabilized.',
        estimatedMinutes: 25,
        priority: 'medium',
        isBottleneck: false,
        targetMisconceptions: ['ftc1_variable_upper_bound_chain_rule_miss']
      }
    ]
  };
}

export function createInitialMayaTwin(): StudentTwinState {
  const masteries: Record<string, ConceptMastery> = {};
  const now = new Date('2026-08-16T18:00:00Z');

  // Maya: Solid fundamentals, thorough pace, struggles with synthesis & higher difficulty
  const scores: Record<string, { score: number; conf: number; daysAgo: number; attempts: number; slips: number; miscs?: string[] }> = {
    'limits-foundations': { score: 0.95, conf: 0.94, daysAgo: 2, attempts: 9, slips: 0 },
    'continuity': { score: 0.92, conf: 0.91, daysAgo: 3, attempts: 8, slips: 0 },
    'derivatives-def': { score: 0.88, conf: 0.87, daysAgo: 4, attempts: 7, slips: 1 },
    'power-rule': { score: 0.94, conf: 0.95, daysAgo: 3, attempts: 10, slips: 0 },
    'product-rule': { score: 0.89, conf: 0.88, daysAgo: 4, attempts: 7, slips: 1 },
    'quotient-rule': { score: 0.87, conf: 0.86, daysAgo: 3, attempts: 7, slips: 1 },
    'chain-rule': { score: 0.82, conf: 0.80, daysAgo: 2, attempts: 8, slips: 2 },
    'implicit-diff': { score: 0.74, conf: 0.76, daysAgo: 3, attempts: 6, slips: 2 },
    'related-rates': { score: 0.35, conf: 0.75, daysAgo: 1, attempts: 6, slips: 4, miscs: ['substituting_instantaneous_values_too_early'] },
    'mvt': { score: 0.78, conf: 0.79, daysAgo: 5, attempts: 5, slips: 1 },
    'optimization': { score: 0.42, conf: 0.72, daysAgo: 2, attempts: 5, slips: 3, miscs: ['neglecting_endpoint_extrema'] },
    'riemann-sums': { score: 0.90, conf: 0.88, daysAgo: 6, attempts: 7, slips: 1 },
    'definite-integrals': { score: 0.86, conf: 0.85, daysAgo: 4, attempts: 6, slips: 1 },
    'ftc': { score: 0.79, conf: 0.78, daysAgo: 3, attempts: 6, slips: 1 },
    'u-substitution': { score: 0.75, conf: 0.74, daysAgo: 2, attempts: 6, slips: 2 },
    'integration-by-parts': { score: 0.38, conf: 0.70, daysAgo: 1, attempts: 5, slips: 3, miscs: ['suboptimal_u_choice_liate'] },
    'diff-equations': { score: 0.46, conf: 0.65, daysAgo: 2, attempts: 4, slips: 2 }
  };

  CALCULUS_CONCEPTS.forEach(concept => {
    const data = scores[concept.id] || { score: 0.5, conf: 0.5, daysAgo: 5, attempts: 4, slips: 1 };
    const date = new Date(now.getTime() - data.daysAgo * 24 * 3600 * 1000).toISOString();
    const stability = 20 + data.attempts * 4;
    const decayFactor = Math.exp(-data.daysAgo / stability);
    const decayedScore = Number(Math.max(0.1, data.score * (0.90 + 0.10 * decayFactor)).toFixed(2));

    const attempts: Attempt[] = [];
    for (let i = 0; i < data.attempts; i++) {
      const isSlip = i >= (data.attempts - data.slips);
      attempts.push({
        id: `att_m_${concept.id}_${i}`,
        studentId: 'student-maya',
        conceptId: concept.id,
        questionId: `q_${concept.id}_${i}`,
        questionText: `Calculus Guided Problem on ${concept.name}`,
        studentResponse: isSlip ? 'Partial setup, misidentified constraint' : 'Complete systematic calculation',
        correctResponse: 'Complete systematic calculation',
        isCorrect: !isSlip,
        timeTakenSec: Math.floor(40 + Math.random() * 20), // Maya is deliberate (40-60s)
        inferredMisconceptionTag: isSlip && data.miscs ? data.miscs[0] : undefined,
        timestamp: new Date(now.getTime() - (data.daysAgo + (data.attempts - i)) * 24 * 3600 * 1000).toISOString()
      });
    }

    masteries[concept.id] = {
      conceptId: concept.id,
      score: data.score,
      confidence: data.conf,
      stability,
      lastPracticedAt: date,
      decayedScore,
      bkt: {
        pInit: 0.25,
        pTransit: 0.12,
        pGuess: 0.10,
        pSlip: 0.08 // Very low slip rate for Maya
      },
      attemptHistory: attempts,
      detectedMisconceptions: (data.miscs || []).map(tag => ({
        tag,
        description: concept.commonMisconceptions.find(m => m.tag === tag)?.description || 'Synthesis translation gap',
        occurrences: data.slips || 2,
        lastObservedAt: date
      }))
    };
  });

  return {
    student: SEED_PROFILES[1],
    masteries,
    overallMastery: 0.72,
    examReadinessScore: 74,
    activeBottlenecks: [
      {
        conceptId: 'related-rates',
        masteryScore: 0.35,
        downstreamImpactCount: 0,
        impactedConceptIds: [],
        severity: 'moderate'
      },
      {
        conceptId: 'integration-by-parts',
        masteryScore: 0.38,
        downstreamImpactCount: 1,
        impactedConceptIds: ['diff-equations'],
        severity: 'moderate'
      }
    ],
    twinInsights: [
      {
        id: 'ins_maya_1',
        type: 'strengths',
        title: 'High Consistency & Strong Retention',
        message: 'Excellent memory stability across foundational units. Slip rate is only 8% (well below class average of 18%).',
        metric: '8% slip rate / 92% foundational mastery',
        severity: 'success'
      },
      {
        id: 'ins_maya_2',
        type: 'misconception',
        title: 'Synthesis Modeling Gap',
        message: 'In word problems (Related Rates and Optimization), you spend 52s setting up equations but substitute instantaneous values prematurely before differentiating.',
        metric: '67% error on word problem setups',
        impactScore: 16,
        targetConceptId: 'related-rates',
        actionableStep: 'Use the 3-step geometric template: 1) Draw & label variables, 2) Write geometric formula, 3) Differentiate d/dt before plugging in numbers.',
        severity: 'warning'
      }
    ],
    historySnapshots: [
      { timestamp: 'Day -21', overallMastery: 0.48, readinessScore: 49, activeBottleneckCount: 4, label: 'Foundations Review' },
      { timestamp: 'Day -14', overallMastery: 0.58, readinessScore: 59, activeBottleneckCount: 3, label: 'Differential Unit' },
      { timestamp: 'Day -7', overallMastery: 0.67, readinessScore: 68, activeBottleneckCount: 2, label: 'Integrals' },
      { timestamp: 'Today', overallMastery: 0.72, readinessScore: 74, activeBottleneckCount: 2, label: 'Current State' }
    ],
    learningPathQueue: [
      {
        stepNumber: 1,
        conceptId: 'related-rates',
        conceptName: 'Related Rates',
        rationale: 'Generated because you missed 4/6 geometric word problems, primarily by substituting values too early.',
        estimatedMinutes: 25,
        priority: 'high',
        isBottleneck: false,
        targetMisconceptions: ['substituting_instantaneous_values_too_early']
      },
      {
        stepNumber: 2,
        conceptId: 'integration-by-parts',
        conceptName: 'Integration by Parts',
        rationale: 'Focus on LIATE priority selection to master multi-stage integrals.',
        estimatedMinutes: 30,
        priority: 'high',
        isBottleneck: true,
        targetMisconceptions: ['suboptimal_u_choice_liate']
      }
    ]
  };
}

export function createFreshStudentTwin(): StudentTwinState {
  const masteries: Record<string, ConceptMastery> = {};
  const now = new Date('2026-08-16T18:00:00Z').toISOString();

  CALCULUS_CONCEPTS.forEach(concept => {
    masteries[concept.id] = {
      conceptId: concept.id,
      score: 0.25,
      confidence: 0.15, // High uncertainty prior
      stability: 7,
      lastPracticedAt: now,
      decayedScore: 0.25,
      bkt: {
        pInit: 0.25,
        pTransit: 0.15,
        pGuess: 0.20,
        pSlip: 0.10
      },
      attemptHistory: [],
      detectedMisconceptions: []
    };
  });

  return {
    student: SEED_PROFILES[2],
    masteries,
    overallMastery: 0.25,
    examReadinessScore: 24,
    activeBottlenecks: [],
    twinInsights: [
      {
        id: 'ins_new_1',
        type: 'cognitive_pace',
        title: 'Awaiting Diagnostic Calibration',
        message: 'Your Digital Twin is uncalibrated. Take the 10-12 question adaptive assessment to establish your knowledge vector with maximum information gain.',
        severity: 'info',
        actionableStep: 'Start Adaptive Diagnostic Assessment'
      }
    ],
    historySnapshots: [
      { timestamp: 'Initial', overallMastery: 0.25, readinessScore: 24, activeBottleneckCount: 0, label: 'Uncalibrated' }
    ],
    learningPathQueue: []
  };
}
