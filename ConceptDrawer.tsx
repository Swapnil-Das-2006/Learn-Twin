import React from 'react';
import { X, Sparkles, BookOpen, Brain, CheckCircle, XCircle, Clock, AlertTriangle, ArrowRight, ShieldCheck, Zap, RotateCcw } from 'lucide-react';
import { Concept, ConceptMastery, StudentTwinState } from '@/types';
import { CALCULUS_CONCEPTS } from '@/data/calculusGraph';
import { calculateEbbinghausDecay } from '@/lib/twinEngine';

interface ConceptDrawerProps {
  conceptId: string | null;
  isOpen: boolean;
  onClose: () => void;
  twinState: StudentTwinState;
  onStartMicroLesson: (conceptId: string) => void;
  onStartQuiz: (conceptId: string) => void;
  onQuickPractice: (conceptId: string) => void;
}

export const ConceptDrawer: React.FC<ConceptDrawerProps> = ({
  conceptId,
  isOpen,
  onClose,
  twinState,
  onStartMicroLesson,
  onStartQuiz,
  onQuickPractice,
}) => {
  if (!isOpen || !conceptId) return null;

  const concept = CALCULUS_CONCEPTS.find(c => c.id === conceptId);
  if (!concept) return null;

  const mastery = twinState.masteries[conceptId];
  const score = mastery?.score ?? 0.25;
  const confidence = mastery?.confidence ?? 0.20;
  const stability = mastery?.stability ?? 7;
  const lastPracticed = mastery?.lastPracticedAt || new Date().toISOString();
  const decayInfo = calculateEbbinghausDecay(score, lastPracticed, stability);
  const scorePct = Math.round(score * 100);

  const isBottleneck = twinState.activeBottlenecks.some(b => b.conceptId === conceptId);
  const bottleneckData = twinState.activeBottlenecks.find(b => b.conceptId === conceptId);

  const prereqConcepts = concept.prerequisites.map(pId => CALCULUS_CONCEPTS.find(c => c.id === pId)).filter(Boolean) as Concept[];
  const isLocked = prereqConcepts.some(p => (twinState.masteries[p.id]?.score || 0) < 0.40);

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-xl bg-slate-950/95 border-l border-slate-800 shadow-2xl backdrop-blur-2xl flex flex-col transform transition-transform duration-300 ease-in-out">
      {/* Header */}
      <div className="p-6 border-b border-slate-800/80 flex items-start justify-between bg-slate-900/40">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-mono font-semibold uppercase px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              {concept.subject} • {concept.category}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Difficulty {concept.difficulty}/5
            </span>
            {isBottleneck && (
              <span className="text-xs font-bold text-rose-400 bg-rose-500/20 border border-rose-500/40 px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                <AlertTriangle className="w-3 h-3" /> Critical Bottleneck
              </span>
            )}
          </div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            {concept.name}
          </h2>
          <p className="text-xs text-slate-400 mt-1 line-clamp-2">
            {concept.description}
          </p>
        </div>

        <button
          onClick={onClose}
          className="p-2 rounded-lg bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
        {/* Bottleneck Warning Banner */}
        {isBottleneck && (
          <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-200 text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-rose-300">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              Downstream Blocking Alert
            </div>
            <p>
              Low mastery on this node is gating <strong className="text-rose-100">{bottleneckData?.downstreamImpactCount} downstream topics</strong> in the DAG ({bottleneckData?.impactedConceptIds.join(', ')}).
            </p>
          </div>
        )}

        {/* Primary Mastery & BKT State */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <div className="text-xs text-slate-400 font-mono mb-1">BKT Mastery P(L)</div>
            <div className="flex items-baseline gap-2">
              <span className={`text-3xl font-extrabold font-mono ${
                score >= 0.75 ? 'text-emerald-400' : score >= 0.4 ? 'text-amber-400' : 'text-rose-400'
              }`}>
                {scorePct}%
              </span>
              <span className="text-xs text-slate-500 font-mono">
                Decayed: {Math.round(decayInfo.decayedScore * 100)}%
              </span>
            </div>
            <div className="w-full h-2 bg-slate-950 rounded-full mt-3 overflow-hidden border border-slate-800">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  score >= 0.75 ? 'bg-emerald-500' : score >= 0.4 ? 'bg-amber-500' : 'bg-rose-500'
                }`}
                style={{ width: `${scorePct}%` }}
              />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <div className="text-xs text-slate-400 font-mono mb-1">Confidence Bounds</div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold font-mono text-cyan-400">
                {Math.round(confidence * 100)}%
              </span>
              <span className="text-xs text-slate-500 font-mono">
                ±{Math.round((1 - confidence) * 18)}%
              </span>
            </div>
            <div className="flex items-center gap-1 mt-3 text-[11px] text-slate-400 font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              {mastery?.attemptHistory.length || 0} attempts recorded
            </div>
          </div>
        </div>

        {/* BKT Engine Parameter Grid */}
        <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Brain className="w-3.5 h-3.5 text-cyan-400" />
              Bayesian Knowledge Tracing (BKT) Model
            </h4>
            <span className="text-[10px] text-slate-500 font-mono">Dynamic Parameters</span>
          </div>

          <div className="grid grid-cols-4 gap-2 text-center text-xs font-mono">
            <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800">
              <div className="text-[10px] text-slate-500">P(L₀) Prior</div>
              <div className="text-slate-200 font-semibold mt-0.5">{mastery?.bkt.pInit || 0.3}</div>
            </div>
            <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800">
              <div className="text-[10px] text-slate-500">P(T) Transit</div>
              <div className="text-emerald-400 font-semibold mt-0.5">{mastery?.bkt.pTransit || 0.15}</div>
            </div>
            <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800">
              <div className="text-[10px] text-slate-500">P(G) Guess</div>
              <div className="text-amber-400 font-semibold mt-0.5">{mastery?.bkt.pGuess || 0.2}</div>
            </div>
            <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800">
              <div className="text-[10px] text-slate-500">P(S) Slip</div>
              <div className="text-rose-400 font-semibold mt-0.5">{mastery?.bkt.pSlip || 0.1}</div>
            </div>
          </div>
        </div>

        {/* Ebbinghaus Forgetting Curve Status */}
        <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <div className="text-slate-200 font-semibold">Memory Stability & Decay</div>
              <div className="text-slate-500 text-[11px]">
                Last practiced {decayInfo.daysElapsed} days ago • Stability: {stability} days
              </div>
            </div>
          </div>
          <div className="text-right">
            <span className="text-slate-300 font-bold">{decayInfo.retentionPct}%</span>
            <div className="text-[10px] text-slate-500">Current Retention</div>
          </div>
        </div>

        {/* Inferred Misconceptions */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            Detected Error Patterns & Misconceptions
          </h4>

          {mastery?.detectedMisconceptions && mastery.detectedMisconceptions.length > 0 ? (
            <div className="space-y-2">
              {mastery.detectedMisconceptions.map((misc, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-amber-950/20 border border-amber-500/30 text-xs">
                  <div className="flex items-center justify-between text-amber-300 font-semibold mb-1">
                    <span>{misc.tag.replace(/_/g, ' ')}</span>
                    <span className="text-[10px] bg-amber-500/20 px-2 py-0.5 rounded font-mono">
                      {misc.occurrences}x observed
                    </span>
                  </div>
                  <p className="text-slate-300 text-[11px]">{misc.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-3 rounded-lg bg-slate-900/30 border border-slate-800 text-xs text-slate-400 italic">
              No active recurring misconceptions detected for this concept.
            </div>
          )}
        </div>

        {/* Prerequisites DAG Status */}
        {prereqConcepts.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
              Prerequisite Dependencies
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {prereqConcepts.map(p => {
                const pMastery = twinState.masteries[p.id];
                const pScore = pMastery ? Math.round(pMastery.score * 100) : 30;
                return (
                  <div key={p.id} className="p-2.5 rounded-lg bg-slate-900/40 border border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-medium truncate">{p.name}</span>
                    <span className={`font-mono text-[11px] font-bold ${
                      pScore >= 75 ? 'text-emerald-400' : pScore >= 40 ? 'text-amber-400' : 'text-rose-400'
                    }`}>
                      {pScore}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Attempt History */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
            Recent Attempts ({mastery?.attemptHistory.length || 0})
          </h4>
          <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
            {(mastery?.attemptHistory || []).slice(-5).reverse().map(att => (
              <div key={att.id} className="p-2.5 rounded-lg bg-slate-900/40 border border-slate-800 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {att.isCorrect ? (
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  )}
                  <span className="text-slate-300 truncate max-w-[280px]">
                    {att.questionText || 'Practice problem'}
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono shrink-0">
                  {att.timeTakenSec}s
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/80 backdrop-blur-md grid grid-cols-3 gap-2">
        <button
          onClick={() => onStartMicroLesson(conceptId)}
          className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs shadow-lg shadow-cyan-600/20 transition-all active:scale-95"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Teach Me This
        </button>

        <button
          onClick={() => onStartQuiz(conceptId)}
          className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs shadow-lg shadow-purple-600/20 transition-all active:scale-95"
        >
          <Brain className="w-3.5 h-3.5" />
          Quiz Me (5Q)
        </button>

        <button
          onClick={() => onQuickPractice(conceptId)}
          className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs border border-slate-700 transition-all active:scale-95"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Quick Drill
        </button>
      </div>
    </div>
  );
};
