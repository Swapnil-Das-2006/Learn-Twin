import React, { useState, useEffect } from 'react';
import { WeeklyStudyPlan, StudentTwinState } from '@/types';
import { generateWeeklyStudyPlan } from '@/lib/aiService';
import { Calendar, Clock, Sparkles, AlertTriangle, ArrowRight, BookOpen, CheckCircle, Target, RefreshCw } from 'lucide-react';

interface StudyPlanViewProps {
  twinState: StudentTwinState;
  onSelectConcept: (conceptId: string) => void;
  userApiKey?: string;
}

export const StudyPlanView: React.FC<StudyPlanViewProps> = ({
  twinState,
  onSelectConcept,
  userApiKey
}) => {
  const [plan, setPlan] = useState<WeeklyStudyPlan | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchPlan = () => {
    setIsLoading(true);
    generateWeeklyStudyPlan(twinState, userApiKey).then(res => {
      setPlan(res);
      setIsLoading(false);
    });
  };

  useEffect(() => {
    fetchPlan();
  }, [twinState.student.id, twinState.activeBottlenecks.length]);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-purple-950/30 to-slate-900 border border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Grounded AI Generator
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Target Exam: {twinState.student.targetExamName}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-100">
            Personalized Weekly Study Architecture
          </h1>
        </div>

        <button
          onClick={fetchPlan}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-medium border border-slate-700 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          Regenerate Plan
        </button>
      </div>

      {isLoading ? (
        <div className="p-16 text-center space-y-3 bg-slate-900/60 rounded-2xl border border-slate-800">
          <div className="w-10 h-10 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-mono text-slate-400">
            Synthesizing graph bottlenecks, forgetting curves, and exam deadline...
          </p>
        </div>
      ) : plan ? (
        <div className="space-y-6">
          {/* Strategy Rationale Box */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-purple-400">
              <Target className="w-4 h-4" />
              Twin Strategic Diagnosis &amp; Rationale
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              {plan.overallStrategyRationale}
            </p>
          </div>

          {/* Daily Schedule Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {plan.days.map((day, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg flex flex-col justify-between space-y-4 hover:border-slate-700 transition-colors"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold font-mono text-cyan-400 bg-cyan-500/10 px-2.5 py-0.5 rounded-full border border-cyan-500/30">
                      {day.dayName}
                    </span>
                    <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      {day.plannedMinutes}m
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-100">
                    {day.focusConceptName}
                  </h3>

                  <div className="text-xs text-slate-300 font-medium">
                    Goal: {day.sessionGoal}
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-850 text-[11px] text-slate-400 space-y-1">
                    <div className="text-[10px] uppercase font-mono text-purple-400 font-semibold">Why this today?</div>
                    <div>{day.whyThisToday}</div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                    {day.recommendedActivity}
                  </span>

                  {day.focusConceptId !== 'all-unlocked' && (
                    <button
                      onClick={() => onSelectConcept(day.focusConceptId)}
                      className="text-xs text-cyan-400 hover:text-cyan-300 font-mono font-semibold flex items-center gap-1 transition-colors"
                    >
                      <span>Study</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
};
