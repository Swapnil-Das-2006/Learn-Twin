import React, { useState, useEffect } from 'react';
import { MicroLesson, StudentTwinState } from '@/types';
import { generateMicroLesson } from '@/lib/aiService';
import { recordAttemptAndUpdateTwin } from '@/lib/twinEngine';
import { Sparkles, Brain, X, CheckCircle, XCircle, ArrowRight, BookOpen, AlertTriangle, Lightbulb, Check } from 'lucide-react';
import confetti from 'canvas-confetti';

interface MicroLessonModalProps {
  conceptId: string | null;
  isOpen: boolean;
  onClose: () => void;
  twinState: StudentTwinState;
  onStateUpdate: (updatedState: StudentTwinState) => void;
  userApiKey?: string;
}

export const MicroLessonModal: React.FC<MicroLessonModalProps> = ({
  conceptId,
  isOpen,
  onClose,
  twinState,
  onStateUpdate,
  userApiKey
}) => {
  const [lesson, setLesson] = useState<MicroLesson | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedCheckOption, setSelectedCheckOption] = useState<number | null>(null);
  const [isCheckSubmitted, setIsCheckSubmitted] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen || !conceptId) return;

    let isMounted = true;
    setIsLoading(true);
    setSelectedCheckOption(null);
    setIsCheckSubmitted(false);

    generateMicroLesson(conceptId, twinState, userApiKey).then(res => {
      if (isMounted) {
        setLesson(res);
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [isOpen, conceptId, twinState, userApiKey]);

  if (!isOpen || !conceptId) return null;

  const handleCheckAnswer = () => {
    if (selectedCheckOption === null || !lesson || isCheckSubmitted) return;

    const isCorrect = selectedCheckOption === lesson.instantConceptCheck.correctIndex;
    setIsCheckSubmitted(true);

    if (isCorrect) {
      confetti({ particleCount: 50, spread: 60 });
    }

    // Record attempt and update twin
    const updated = recordAttemptAndUpdateTwin(twinState, {
      studentId: twinState.student.id,
      conceptId: lesson.conceptId,
      questionId: `micro_check_${lesson.conceptId}`,
      questionText: lesson.instantConceptCheck.question,
      studentResponse: lesson.instantConceptCheck.options[selectedCheckOption],
      correctResponse: lesson.instantConceptCheck.options[lesson.instantConceptCheck.correctIndex],
      isCorrect,
      timeTakenSec: 25,
      inferredMisconceptionTag: isCorrect ? undefined : 'concept_check_slip'
    });

    onStateUpdate(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-start justify-between bg-slate-950/60">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                <Sparkles className="w-3 h-3" />
                Adaptive AI Micro-Lesson
              </span>
              <span className="text-xs font-mono text-slate-400 capitalize">
                Modality: {twinState.student.preferredModality.replace('_', ' ')}
              </span>
            </div>
            <h2 className="text-2xl font-bold text-slate-100">
              {lesson?.conceptName || 'Generating Targeted Lesson...'}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {isLoading ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-10 h-10 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm font-mono text-slate-400">
                Grounding lesson in your Twin&apos;s error vector &amp; cognitive modality...
              </p>
            </div>
          ) : lesson ? (
            <>
              {/* Reasoning Banner */}
              <div className="p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-500/40 text-xs text-cyan-200 flex items-center gap-2.5">
                <Lightbulb className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>
                  <strong className="font-semibold text-cyan-100">Reasoning Context:</strong> {lesson.generatedForReason}
                </span>
              </div>

              {/* Tailored Explanation */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold uppercase font-mono tracking-wider text-slate-300 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-cyan-400" />
                  Core Intuition &amp; Concept Breakdown
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                  {lesson.tailoredExplanation}
                </p>
              </div>

              {/* Worked Example */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold uppercase font-mono tracking-wider text-slate-300 flex items-center gap-2">
                  <Brain className="w-4 h-4 text-purple-400" />
                  Step-by-Step Worked Example
                </h3>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
                  <div className="text-sm font-mono text-amber-300 font-semibold">
                    Problem: {lesson.workedExample.problem}
                  </div>

                  <div className="space-y-3 border-t border-slate-850 pt-3">
                    {lesson.workedExample.steps.map(s => (
                      <div key={s.step} className="text-xs space-y-1 bg-slate-900/60 p-3 rounded-lg border border-slate-800/80">
                        <div className="text-slate-300 font-medium">
                          Step {s.step}: {s.explanation}
                        </div>
                        <div className="font-mono text-cyan-300 bg-slate-950/80 p-2 rounded border border-slate-800 text-[13px]">
                          {s.math}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-500/30 text-xs font-mono text-emerald-300">
                    <span className="font-bold">Final Verified Answer:</span> {lesson.workedExample.finalAnswer}
                  </div>
                </div>
              </div>

              {/* Common Traps Callout */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold uppercase font-mono tracking-wider text-slate-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  Common Traps To Avoid
                </h3>

                <div className="space-y-2">
                  {lesson.commonTraps.map((trap, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-rose-950/20 border border-rose-500/30 text-xs space-y-1">
                      <div className="font-bold text-rose-300">{trap.trap}</div>
                      <div className="text-slate-400 text-[11px]">{trap.whyItHappens}</div>
                      <div className="text-emerald-400 text-[11px] font-semibold">Remedy: {trap.howToAvoid}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Instant Concept Check */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-950 to-slate-900 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase font-bold text-cyan-400 tracking-wider">
                    Instant Mastery Verification
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">
                    Direct BKT Feedback
                  </span>
                </div>

                <div className="text-sm text-slate-200 font-medium">
                  {lesson.instantConceptCheck.question}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {lesson.instantConceptCheck.options.map((opt, idx) => {
                    const isSelected = selectedCheckOption === idx;
                    const isCorrectOption = idx === lesson.instantConceptCheck.correctIndex;

                    let optClass = 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-300';
                    if (isCheckSubmitted) {
                      if (isCorrectOption) optClass = 'bg-emerald-950 border-emerald-500 text-emerald-200';
                      else if (isSelected) optClass = 'bg-rose-950 border-rose-500 text-rose-200';
                      else optClass = 'opacity-40 border-slate-800 text-slate-500';
                    } else if (isSelected) {
                      optClass = 'bg-cyan-950 border-cyan-500 text-cyan-200';
                    }

                    return (
                      <button
                        key={idx}
                        onClick={() => !isCheckSubmitted && setSelectedCheckOption(idx)}
                        disabled={isCheckSubmitted}
                        className={`p-3 rounded-xl border text-left text-xs font-mono transition-all ${optClass}`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>

                {!isCheckSubmitted ? (
                  <button
                    onClick={handleCheckAnswer}
                    disabled={selectedCheckOption === null}
                    className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-cyan-600/20 transition-all"
                  >
                    Verify Answer &amp; Update BKT State
                  </button>
                ) : (
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
                    <div className="font-bold text-slate-200 mb-1">Explanation:</div>
                    {lesson.instantConceptCheck.explanation}
                  </div>
                )}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};
