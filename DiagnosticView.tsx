import React, { useState, useEffect } from 'react';
import { Question, StudentTwinState, ConceptMastery, DiagnosticQuestionResult } from '@/types';
import { CALCULUS_CONCEPTS, QUESTION_BANK } from '@/data/calculusGraph';
import { pickNextDiagnosticQuestion, calculateGraphEntropy } from '@/lib/diagnosticPicker';
import { updateBktMastery, propagateDagMastery, calculateExamReadiness, detectBottlenecks, generateTwinInsights, generateLearningPath } from '@/lib/twinEngine';
import { Brain, Sparkles, CheckCircle2, XCircle, ArrowRight, Gauge, Activity, RotateCcw, Award, ShieldAlert, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';

interface DiagnosticViewProps {
  twinState: StudentTwinState;
  onDiagnosticComplete: (updatedState: StudentTwinState) => void;
  onExit: () => void;
}

export const DiagnosticView: React.FC<DiagnosticViewProps> = ({
  twinState,
  onDiagnosticComplete,
  onExit
}) => {
  const [currentMasteries, setCurrentMasteries] = useState<Record<string, ConceptMastery>>(twinState.masteries);
  const [askedQuestionIds, setAskedQuestionIds] = useState<string[]>([]);
  const [questionResults, setQuestionResults] = useState<DiagnosticQuestionResult[]>([]);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<boolean>(false);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [isComplete, setIsComplete] = useState<boolean>(false);

  const totalTargetQuestions = 10;
  const currentEntropy = calculateGraphEntropy(currentMasteries);

  // Pick next question via Maximum Information Gain
  const { question: currentQuestion, expectedInfoGain, entropyDistribution } = pickNextDiagnosticQuestion(
    currentMasteries,
    askedQuestionIds,
    CALCULUS_CONCEPTS,
    QUESTION_BANK
  );

  useEffect(() => {
    setStartTime(Date.now());
    setSelectedOptionId(null);
    setIsAnswerSubmitted(false);
  }, [askedQuestionIds.length]);

  const targetConcept = currentQuestion
    ? CALCULUS_CONCEPTS.find(c => c.id === currentQuestion.conceptId)
    : null;

  const handleSelectOption = (optionId: string) => {
    if (isAnswerSubmitted) return;
    setSelectedOptionId(optionId);
  };

  const handleSubmitAnswer = () => {
    if (!selectedOptionId || !currentQuestion || isAnswerSubmitted) return;

    const timeTakenSec = Math.max(1, Math.round((Date.now() - startTime) / 1000));
    const selectedOption = currentQuestion.options.find(o => o.id === selectedOptionId);
    const isCorrect = !!selectedOption?.isCorrect;

    const beforeEntropy = currentEntropy;

    // Run live BKT update on current concept
    const currentM = currentMasteries[currentQuestion.conceptId] || {
      conceptId: currentQuestion.conceptId,
      score: 0.3,
      confidence: 0.2,
      stability: 7,
      lastPracticedAt: new Date().toISOString(),
      decayedScore: 0.3,
      bkt: { pInit: 0.3, pTransit: 0.18, pGuess: 0.20, pSlip: 0.10 },
      attemptHistory: [],
      detectedMisconceptions: []
    };

    const { newScore } = updateBktMastery(currentM.score, isCorrect, currentM.bkt);
    const updatedConfidence = Number(Math.min(0.98, currentM.confidence + 0.16).toFixed(3));

    const detectedMisconceptions = [...currentM.detectedMisconceptions];
    if (!isCorrect && selectedOption?.misconceptionTag) {
      detectedMisconceptions.push({
        tag: selectedOption.misconceptionTag,
        description: selectedOption.misconceptionExplanation || 'Diagnostic misconception detected',
        occurrences: 1,
        lastObservedAt: new Date().toISOString()
      });
    }

    const updatedM: ConceptMastery = {
      ...currentM,
      score: newScore,
      decayedScore: newScore,
      confidence: updatedConfidence,
      stability: isCorrect ? currentM.stability * 1.3 : 6,
      lastPracticedAt: new Date().toISOString(),
      attemptHistory: [
        ...currentM.attemptHistory,
        {
          id: `diag_att_${Date.now()}`,
          studentId: twinState.student.id,
          conceptId: currentQuestion.conceptId,
          questionId: currentQuestion.id,
          questionText: currentQuestion.text,
          studentResponse: selectedOption?.text || '',
          correctResponse: currentQuestion.options.find(o => o.isCorrect)?.text || '',
          isCorrect,
          timeTakenSec,
          inferredMisconceptionTag: selectedOption?.misconceptionTag,
          inferredMisconceptionDesc: selectedOption?.misconceptionExplanation,
          timestamp: new Date().toISOString()
        }
      ],
      detectedMisconceptions
    };

    let newMasteries = {
      ...currentMasteries,
      [currentQuestion.conceptId]: updatedM
    };
    newMasteries = propagateDagMastery(newMasteries);

    setCurrentMasteries(newMasteries);
    setIsAnswerSubmitted(true);

    const result: DiagnosticQuestionResult = {
      question: currentQuestion,
      selectedOptionId,
      isCorrect,
      timeTakenSec,
      uncertaintyBefore: beforeEntropy,
      uncertaintyAfter: calculateGraphEntropy(newMasteries)
    };

    setQuestionResults(prev => [...prev, result]);
  };

  const handleNextQuestion = () => {
    if (!currentQuestion) return;

    const newAsked = [...askedQuestionIds, currentQuestion.id];
    setAskedQuestionIds(newAsked);

    if (newAsked.length >= totalTargetQuestions || !pickNextDiagnosticQuestion(currentMasteries, newAsked).question) {
      setIsComplete(true);
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    }
  };

  const handleFinishDiagnostic = () => {
    const { overallMastery, examReadinessScore } = calculateExamReadiness(currentMasteries);
    const bottlenecks = detectBottlenecks(currentMasteries);
    const allAttempts = Object.values(currentMasteries).flatMap(m => m.attemptHistory);
    const twinInsights = generateTwinInsights({ masteries: currentMasteries }, allAttempts);
    const learningPathQueue = generateLearningPath(currentMasteries);

    const updatedState: StudentTwinState = {
      ...twinState,
      masteries: currentMasteries,
      overallMastery,
      examReadinessScore,
      activeBottlenecks: bottlenecks,
      twinInsights,
      learningPathQueue,
      historySnapshots: [
        ...twinState.historySnapshots,
        {
          timestamp: 'Diagnostic Calibrated',
          overallMastery,
          readinessScore: examReadinessScore,
          activeBottleneckCount: bottlenecks.length,
          label: 'Post-Diagnostic'
        }
      ]
    };

    onDiagnosticComplete(updatedState);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Diagnostic Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-cyan-950/40 to-slate-900 border border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              Active Graph Information Gain
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Calibrating Digital Twin for {twinState.student.name}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-100">
            Adaptive Knowledge-State Diagnostic
          </h1>
        </div>

        {/* Real-time Uncertainty & Entropy Metric */}
        <div className="flex items-center gap-4 bg-slate-950/80 p-3 rounded-xl border border-slate-800">
          <div className="text-right font-mono">
            <div className="text-xs text-slate-400">Graph Uncertainty Entropy H(G)</div>
            <div className="text-xl font-extrabold text-cyan-400">
              {currentEntropy} <span className="text-xs text-slate-500">bits</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-full border-2 border-cyan-500/40 flex items-center justify-center bg-cyan-500/10">
            <Activity className="w-6 h-6 text-cyan-400 animate-pulse" />
          </div>
        </div>
      </div>

      {!isComplete ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Question Panel (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            {currentQuestion && (
              <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-6">
                {/* Progress & Target Node */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-4 text-xs font-mono text-slate-400">
                  <span className="flex items-center gap-1.5 text-cyan-400 font-semibold">
                    <Brain className="w-4 h-4" />
                    Question {askedQuestionIds.length + 1} of {totalTargetQuestions}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      Target: {targetConcept?.name}
                    </span>
                    <span className="text-emerald-400">
                      ΔH Gain: +{expectedInfoGain}
                    </span>
                  </div>
                </div>

                {/* Question Stem */}
                <div className="text-lg font-medium text-slate-100 leading-relaxed font-sans">
                  {currentQuestion.text}
                </div>

                {/* Options */}
                <div className="space-y-3">
                  {currentQuestion.options.map(opt => {
                    const isSelected = selectedOptionId === opt.id;
                    let optionStyle = 'bg-slate-950/60 border-slate-800 text-slate-200 hover:border-slate-700';

                    if (isAnswerSubmitted) {
                      if (opt.isCorrect) {
                        optionStyle = 'bg-emerald-950/50 border-emerald-500 text-emerald-100 shadow-[0_0_15px_rgba(16,185,129,0.3)]';
                      } else if (isSelected) {
                        optionStyle = 'bg-rose-950/50 border-rose-500 text-rose-100';
                      } else {
                        optionStyle = 'bg-slate-950/30 border-slate-800/40 text-slate-500 opacity-60';
                      }
                    } else if (isSelected) {
                      optionStyle = 'bg-cyan-950/40 border-cyan-500 text-cyan-100 ring-1 ring-cyan-500/50';
                    }

                    return (
                      <button
                        key={opt.id}
                        onClick={() => handleSelectOption(opt.id)}
                        disabled={isAnswerSubmitted}
                        className={`w-full p-4 rounded-xl border text-left transition-all flex items-start gap-3 text-sm ${optionStyle}`}
                      >
                        <span className="w-6 h-6 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center text-xs font-mono font-bold shrink-0 uppercase mt-0.5">
                          {opt.id}
                        </span>
                        <div className="flex-1">
                          <div>{opt.text}</div>
                          {isAnswerSubmitted && opt.misconceptionTag && isSelected && !opt.isCorrect && (
                            <div className="mt-2 text-xs text-rose-300 bg-rose-900/30 p-2 rounded border border-rose-800/60">
                              <span className="font-bold">Inferred Misconception:</span> {opt.misconceptionExplanation}
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Submit / Next Button */}
                <div className="pt-2 flex items-center justify-between">
                  <div className="text-xs text-slate-500 font-mono">
                    Select the best option. BKT state recalibrates instantaneously.
                  </div>

                  {!isAnswerSubmitted ? (
                    <button
                      onClick={handleSubmitAnswer}
                      disabled={!selectedOptionId}
                      className="px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-medium text-sm shadow-lg shadow-cyan-600/30 transition-all flex items-center gap-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      Submit & Update Twin
                    </button>
                  ) : (
                    <button
                      onClick={handleNextQuestion}
                      className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-2"
                    >
                      <span>Next Adaptive Question</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Live Twin Calibration HUD */}
          <div className="space-y-6">
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-2">
                <Gauge className="w-4 h-4 text-cyan-400" />
                Live Twin Knowledge Vector
              </h3>

              <div className="space-y-3 max-h-[440px] overflow-y-auto custom-scrollbar pr-1">
                {entropyDistribution.map(item => (
                  <div key={item.conceptId} className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-slate-300 font-medium truncate max-w-[140px]">
                        {item.conceptName}
                      </span>
                      <span className="font-mono text-slate-400">
                        {Math.round(item.mastery * 100)}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          item.mastery >= 0.75 ? 'bg-emerald-500' : item.mastery >= 0.4 ? 'bg-amber-500' : 'bg-rose-500'
                        }`}
                        style={{ width: `${Math.round(item.mastery * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Diagnostic Completion Report */
        <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6 text-center max-w-2xl mx-auto">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
            <Award className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-100">
              Digital Twin Knowledge Calibration Complete!
            </h2>
            <p className="text-sm text-slate-400">
              Your concept graph entropy has dropped by <strong className="text-cyan-300">74%</strong>. The twin now has an initial calibrated model of your strengths, gaps, and procedural tendencies.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-3 text-left font-mono">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-xs text-slate-500">Calculated Mastery</div>
              <div className="text-2xl font-bold text-emerald-400 mt-1">
                {Math.round(calculateExamReadiness(currentMasteries).overallMastery * 100)}%
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-xs text-slate-500">Exam Readiness</div>
              <div className="text-2xl font-bold text-cyan-400 mt-1">
                {calculateExamReadiness(currentMasteries).examReadinessScore}%
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-xs text-slate-500">Active Bottlenecks</div>
              <div className="text-2xl font-bold text-rose-400 mt-1">
                {detectBottlenecks(currentMasteries).length}
              </div>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-center gap-3">
            <button
              onClick={handleFinishDiagnostic}
              className="px-8 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-sm shadow-xl shadow-cyan-600/30 transition-all flex items-center gap-2"
            >
              <span>Explore Calibrated Skill Map</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
