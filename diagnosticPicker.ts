import { Concept, Question, ConceptMastery } from '@/types';
import { CALCULUS_CONCEPTS, QUESTION_BANK } from '@/data/calculusGraph';
import { updateBktMastery, propagateDagMastery } from './twinEngine';

/**
 * Calculates binary entropy H(p) = -p*log2(p) - (1-p)*log2(1-p)
 */
export function binaryEntropy(p: number): number {
  if (p <= 0.001 || p >= 0.999) return 0;
  return -p * Math.log2(p) - (1 - p) * Math.log2(1 - p);
}

/**
 * Computes total weighted uncertainty (entropy) of the concept graph.
 */
export function calculateGraphEntropy(
  masteries: Record<string, ConceptMastery>,
  concepts: Concept[] = CALCULUS_CONCEPTS
): number {
  let totalEntropy = 0;
  let totalWeight = 0;

  concepts.forEach(concept => {
    const m = masteries[concept.id];
    const score = m ? m.score : 0.3;
    const weight = concept.importance;
    totalWeight += weight;

    const entropy = binaryEntropy(score);
    totalEntropy += entropy * weight;
  });

  return Number((totalEntropy / Math.max(1, totalWeight)).toFixed(4));
}

/**
 * Predicts the next best question by Maximum Information Gain over the DAG.
 */
export function pickNextDiagnosticQuestion(
  currentMasteries: Record<string, ConceptMastery>,
  askedQuestionIds: string[],
  concepts: Concept[] = CALCULUS_CONCEPTS,
  questions: Question[] = QUESTION_BANK
): {
  question: Question | null;
  expectedInfoGain: number;
  currentEntropy: number;
  entropyDistribution: { conceptId: string; conceptName: string; entropy: number; mastery: number }[];
} {
  const currentEntropy = calculateGraphEntropy(currentMasteries, concepts);

  const entropyDistribution = concepts.map(c => {
    const m = currentMasteries[c.id];
    const score = m ? m.score : 0.3;
    return {
      conceptId: c.id,
      conceptName: c.name,
      entropy: Number(binaryEntropy(score).toFixed(3)),
      mastery: Number(score.toFixed(3))
    };
  });

  const availableQuestions = questions.filter(q => !askedQuestionIds.includes(q.id));
  if (availableQuestions.length === 0) {
    return { question: null, expectedInfoGain: 0, currentEntropy, entropyDistribution };
  }

  let bestQuestion: Question = availableQuestions[0];
  let maxInfoGain = -Infinity;

  availableQuestions.forEach(candidate => {
    const concept = concepts.find(c => c.id === candidate.conceptId);
    if (!concept) return;

    const currentM = currentMasteries[candidate.conceptId] || {
      conceptId: candidate.conceptId,
      score: 0.3,
      confidence: 0.2,
      stability: 7,
      lastPracticedAt: new Date().toISOString(),
      decayedScore: 0.3,
      bkt: { pInit: 0.3, pTransit: 0.15, pGuess: 0.20, pSlip: 0.10 },
      attemptHistory: [],
      detectedMisconceptions: []
    };

    const pL = currentM.score;
    const pCorrect = pL * (1 - currentM.bkt.pSlip) + (1 - pL) * currentM.bkt.pGuess;

    // Simulate outcome 1: Correct
    const updatedCorrect = updateBktMastery(pL, true, currentM.bkt);
    let simMasteriesCorrect = {
      ...currentMasteries,
      [candidate.conceptId]: { ...currentM, score: updatedCorrect.newScore }
    };
    simMasteriesCorrect = propagateDagMastery(simMasteriesCorrect, concepts);
    const entropyIfCorrect = calculateGraphEntropy(simMasteriesCorrect, concepts);

    // Simulate outcome 2: Incorrect
    const updatedIncorrect = updateBktMastery(pL, false, currentM.bkt);
    let simMasteriesIncorrect = {
      ...currentMasteries,
      [candidate.conceptId]: { ...currentM, score: updatedIncorrect.newScore }
    };
    simMasteriesIncorrect = propagateDagMastery(simMasteriesIncorrect, concepts);
    const entropyIfIncorrect = calculateGraphEntropy(simMasteriesIncorrect, concepts);

    // Expected entropy after asking this candidate
    const expectedEntropy = pCorrect * entropyIfCorrect + (1 - pCorrect) * entropyIfIncorrect;
    const infoGain = currentEntropy - expectedEntropy;

    // Bonus for foundational/central concepts with many unasked dependents
    const centralityBonus = concept.importance * 0.03;
    const totalGain = infoGain + centralityBonus;

    if (totalGain > maxInfoGain) {
      maxInfoGain = totalGain;
      bestQuestion = candidate;
    }
  });

  return {
    question: bestQuestion,
    expectedInfoGain: Number(Math.max(0.01, maxInfoGain).toFixed(4)),
    currentEntropy,
    entropyDistribution
  };
}
