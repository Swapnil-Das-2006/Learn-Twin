import React, { useState, useEffect } from 'react';
import { TargetedQuiz, Question, StudentTwinState } from '@/types';
import { generateTargetedQuiz } from '@/lib/aiService';
import { recordAttemptAndUpdateTwin } from '@/lib/twinEngine';
import { Brain, Sparkles, X, CheckCircle, XCircle, ArrowRight, Award, Zap, AlertTriangle } from 'lucide-react';
import confetti from 'canvas-confetti';

interface TargetedQuizModalProps {
  conceptId: string | null;
  isOpen: boolean;
  onClose: () => void;
  twinState: StudentTwinState;
  onStateUpdate: (updatedState: StudentTwinState) => void;
  userApiKey?: string;
}

export const TargetedQuizModal: React.FC<TargetedQuizModalProps> = ({
  conceptId,
  isOpen,
  onClose,
  twinState,
  onStateUpdate,
  userApiKey
}) => {
  const [quiz, setQuiz] = useState<TargetedQuiz | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<boolean>(false);
  const [scoreCount, setScoreCount] = useState<number>(0);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [currentState, setCurrentState] = useState<StudentTwinState>(twinState);

  useEffect(() => {
    if (!isOpen || !conceptId) return;

    let isMounted = true;
    setIsLoading(true);
    setCurrentIndex(0);
    setSelectedOptionId(null);
    setIsAnswerSubmitted(false);
    setScoreCount(0);
    setIsFinished(false);
    setCurrentState(twinState);

    generateTargetedQuiz(conceptId, twinState, userApiKey).then(res => {
      if (isMounted) {
        setQuiz(res);
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [isOpen, conceptId, twinState, userApiKey]);

  if (!isOpen || !conceptId) return null;

  const currentQ: Question | undefined = quiz?.questions[currentIndex];

  const handleSubmitOption = () => {
    if (!currentQ || !selectedOptionId || isAnswerSubmitted) return;

    const opt = currentQ.options.find(o => o.id === selectedOptionId);
    const isCorrect = !!opt?.isCorrect;

    if (isCorrect) setScoreCount(prev => prev + 1);

    // Update twin state
    const updated = recordAttemptAndUpdateTwin(currentState, {
      studentId: twinState.student.id,
      conceptId: currentQ.conceptId,
      questionId: currentQ.id,
      questionText: currentQ.text,
      studentResponse: opt?.text || '',
      correctResponse: currentQ.options.find(o => o.isCorrect)?.text || '',
      isCorrect,
      timeTakenSec: 22,
      inferredMisconceptionTag: opt?.misconceptionTag,
      inferredMisconceptionDesc: opt?.misconceptionExplanation
    });

    setCurrentState(updated);
    setIsAnswerSubmitted(true);
  };

  const handleNext = () => {
    if (!quiz) return;
    if (currentIndex + 1 < quiz.questions.length) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOptionId(null);
      setIsAnswerSubmitted(false);
    } else {
      setIsFinished(true);
      onStateUpdate(currentState);
      confetti({ particleCount: 70, spread: 60 });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-start justify-between bg-slate-950/60">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/30">
                <Brain className="w-3 h-3" />
                Targeted 5-Question Adaptive Quiz
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-100">
              {quiz?.conceptName || 'Preparing Quiz...'}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {isLoading ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-10 h-10 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm font-mono text-slate-400">
                Calibrating targeted problems targeting your error tags...
              </p>
            </div>
          ) : !isFinished && currentQ ? (
            <div className="space-y-6">
              {/* Rationale Banner */}
              <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-500/30 text-xs text-purple-200 flex items-center gap-2">
                <Zap className="w-4 h-4 text-purple-400 shrink-0" />
                <span>{quiz?.reasoning}</span>
              </div>

              {/* Progress */}
              <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                <span>Question {currentIndex + 1} of {quiz?.questions.length}</span>
                <span className="text-emerald-400 font-bold">Current Score: {scoreCount} Correct</span>
              </div>

              {/* Question Stem */}
              <div className="text-base font-semibold text-slate-100">
                {currentQ.text}
              </div>

              {/* Options */}
              <div className="space-y-3">
                {currentQ.options.map(opt => {
                  const isSelected = selectedOptionId === opt.id;
                  let optStyle = 'bg-slate-950/60 border-slate-800 text-slate-200 hover:border-slate-700';

                  if (isAnswerSubmitted) {
                    if (opt.isCorrect) {
                      optStyle = 'bg-emerald-950/60 border-emerald-500 text-emerald-100';
                    } else if (isSelected) {
                      optStyle = 'bg-rose-950/60 border-rose-500 text-rose-100';
                    } else {
                      optStyle = 'opacity-40 border-slate-850 text-slate-500';
                    }
                  } else if (isSelected) {
                    optStyle = 'bg-purple-950/40 border-purple-500 text-purple-100';
                  }

                  return (
                    <button
                      key={opt.id}
                      onClick={() => !isAnswerSubmitted && setSelectedOptionId(opt.id)}
                      disabled={isAnswerSubmitted}
                      className={`w-full p-3.5 rounded-xl border text-left text-xs font-mono transition-all flex items-start gap-3 ${optStyle}`}
                    >
                      <span className="w-5 h-5 rounded bg-slate-900 border border-slate-700 flex items-center justify-center text-xs font-bold uppercase shrink-0">
                        {opt.id}
                      </span>
                      <div className="flex-1">
                        <div>{opt.text}</div>
                        {isAnswerSubmitted && isSelected && !opt.isCorrect && opt.misconceptionTag && (
                          <div className="mt-1.5 text-[11px] text-rose-300">
                            Misconception: {opt.misconceptionExplanation}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Buttons */}
              <div className="pt-2 flex justify-end">
                {!isAnswerSubmitted ? (
                  <button
                    onClick={handleSubmitOption}
                    disabled={!selectedOptionId}
                    className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all"
                  >
                    Submit Answer
                  </button>
                ) : (
                  <button
                    onClick={handleNext}
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-2"
                  >
                    <span>{currentIndex + 1 < (quiz?.questions.length || 5) ? 'Next Question' : 'Complete Quiz'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* Quiz Completed View */
            <div className="text-center py-6 space-y-5">
              <div className="w-14 h-14 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 flex items-center justify-center mx-auto">
                <Award className="w-7 h-7" />
              </div>

              <div className="space-y-1">
                <h3 className="text-xl font-bold text-slate-100">Targeted Drill Finished!</h3>
                <p className="text-xs text-slate-400">
                  You answered <strong className="text-purple-300">{scoreCount} out of {quiz?.questions.length}</strong> correctly.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 max-w-sm mx-auto text-xs font-mono text-left space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Updated BKT Mastery:</span>
                  <span className="text-emerald-400 font-bold">
                    {Math.round((currentState.masteries[conceptId]?.score || 0.5) * 100)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Exam Readiness:</span>
                  <span className="text-cyan-400 font-bold">
                    {currentState.examReadinessScore}%
                  </span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700"
              >
                Close &amp; View Updated Skill Map
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
