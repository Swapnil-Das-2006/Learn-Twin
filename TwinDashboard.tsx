import React, { useState } from 'react';
import {
  StudentTwinState,
  Concept,
  TwinInsight
} from '@/types';
import { CALCULUS_CONCEPTS } from '@/data/calculusGraph';
import { simulateThreeWeeksOfStudy } from '@/lib/twinEngine';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import {
  Brain,
  Sparkles,
  Zap,
  TrendingUp,
  AlertTriangle,
  Play,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Award,
  ArrowUpRight,
  Flame,
  Calendar,
  Layers,
  ChevronRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface TwinDashboardProps {
  twinState: StudentTwinState;
  onStateUpdate: (updatedState: StudentTwinState) => void;
  onSelectConcept: (conceptId: string) => void;
  onOpenDiagnostic: () => void;
}

export const TwinDashboard: React.FC<TwinDashboardProps> = ({
  twinState,
  onStateUpdate,
  onSelectConcept,
  onOpenDiagnostic
}) => {
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simProgressDay, setSimProgressDay] = useState<number>(0);
  const [simLog, setSimLog] = useState<string[]>([]);
  const [showSimModal, setShowSimModal] = useState<boolean>(false);

  // Prepare chart data from history snapshots
  const chartData = twinState.historySnapshots.map((snap, idx) => ({
    name: snap.label || `Point ${idx + 1}`,
    mastery: Math.round(snap.overallMastery * 100),
    readiness: snap.readinessScore,
    bottlenecks: snap.activeBottleneckCount
  }));

  // Category mastery breakdown
  const categoryScores = ['foundations', 'differential', 'integral', 'applications', 'advanced'].map(cat => {
    const matching = CALCULUS_CONCEPTS.filter(c => c.category === cat);
    const avg = matching.reduce((acc, c) => acc + (twinState.masteries[c.id]?.score || 0.25), 0) / Math.max(1, matching.length);
    return {
      category: cat.toUpperCase(),
      score: Math.round(avg * 100)
    };
  });

  const handleRunSimulation = () => {
    setShowSimModal(true);
    setIsSimulating(true);
    setSimProgressDay(0);
    setSimLog([]);

    const { finalState, dailyProgression } = simulateThreeWeeksOfStudy(twinState);

    let day = 0;
    const interval = setInterval(() => {
      if (day < dailyProgression.length) {
        const item = dailyProgression[day];
        setSimProgressDay(item.day);
        setSimLog(prev => [item.description, ...prev].slice(0, 8));
        day++;
      } else {
        clearInterval(interval);
        setIsSimulating(false);
        onStateUpdate(finalState);
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.5 } });
      }
    }, 120);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Banner: Twin Diagnostics & Fast-Forward Simulator */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40 border border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center gap-1">
              <Brain className="w-3 h-3" />
              Active Knowledge Digital Twin
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Student: {twinState.student.name} ({twinState.student.personaTag})
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-100">
            Twin Diagnostic Telemetry &amp; Readiness
          </h1>
        </div>

        {/* Hero Demo Button: Fast-Forward 3 Weeks */}
        <button
          onClick={handleRunSimulation}
          disabled={isSimulating}
          className="group relative px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm shadow-xl shadow-emerald-500/25 transition-all active:scale-95 flex items-center gap-2"
        >
          <Play className="w-4 h-4 fill-current transition-transform group-hover:scale-110" />
          <span>Simulate 3 Weeks of Study (Judge Demo)</span>
          <Sparkles className="w-4 h-4" />
        </button>
      </div>

      {/* Top Stat Gauges */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Exam Readiness */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>Exam Readiness Score</span>
            <Award className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold font-mono text-cyan-400">
              {twinState.examReadinessScore}%
            </span>
            <span className="text-xs text-slate-500 font-mono">
              Target: {Math.round(twinState.student.examReadinessTarget * 100)}%
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-850">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-700"
              style={{ width: `${twinState.examReadinessScore}%` }}
            />
          </div>
        </div>

        {/* Overall Concept Mastery */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>Graph BKT Mastery</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold font-mono text-emerald-400">
              {Math.round(twinState.overallMastery * 100)}%
            </span>
            <span className="text-xs text-slate-500 font-mono">
              18 Nodes Calibrated
            </span>
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            {Object.values(twinState.masteries).filter(m => m.score >= 0.75).length} Mastered • {Object.values(twinState.masteries).filter(m => m.score >= 0.4 && m.score < 0.75).length} In Progress
          </div>
        </div>

        {/* Active Bottlenecks */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>Active DAG Bottlenecks</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-4xl font-extrabold font-mono ${
              twinState.activeBottlenecks.length > 0 ? 'text-rose-400' : 'text-emerald-400'
            }`}>
              {twinState.activeBottlenecks.length}
            </span>
            <span className="text-xs text-slate-500 font-mono">
              {twinState.activeBottlenecks.length === 0 ? 'All Cleared!' : 'Critical Gates'}
            </span>
          </div>
          <div className="text-[11px] text-slate-400 truncate font-mono">
            {twinState.activeBottlenecks.length > 0
              ? `Blocking: ${twinState.activeBottlenecks[0].conceptId}`
              : 'Flow paths fully unlocked'}
          </div>
        </div>

        {/* Pace & Modality Profile */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>Cognitive Modality</span>
            <Flame className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-lg font-bold text-slate-100 capitalize">
            {twinState.student.preferredModality.replace('_', ' ')}
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            Pace: <span className="text-amber-400 uppercase font-semibold">{twinState.student.learningPace}</span> • Exam: {twinState.student.targetExamDate}
          </div>
        </div>
      </div>

      {/* Main Grid: Charts & "Your Twin Says" Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Mastery Over Time Recharts */}
        <div className="lg:col-span-2 space-y-6">
          {/* Historical Trend Chart */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-cyan-400" />
                  Twin Mastery &amp; Exam Readiness Progression
                </h3>
                <p className="text-xs text-slate-400">
                  Bayesian trajectory as diagnostic attempts and deliberate practice accumulate.
                </p>
              </div>
              <span className="text-xs font-mono text-slate-500">Live Snapshot</span>
            </div>

            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorMastery" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorReadiness" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} fontVariant="mono" />
                  <YAxis stroke="#64748b" domain={[0, 100]} fontSize={11} fontVariant="mono" unit="%" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#090d16',
                      borderColor: '#1e293b',
                      borderRadius: '0.75rem',
                      fontSize: '12px',
                      color: '#f8fafc'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="mastery"
                    name="Concept Mastery"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorMastery)"
                  />
                  <Area
                    type="monotone"
                    dataKey="readiness"
                    name="Exam Readiness"
                    stroke="#06b6d4"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorReadiness)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Category Breakdown Bar Chart */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" />
              Mastery by Calculus Knowledge Domain
            </h3>

            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryScores} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="category" stroke="#64748b" fontSize={10} fontVariant="mono" />
                  <YAxis stroke="#64748b" domain={[0, 100]} fontSize={11} unit="%" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#090d16',
                      borderColor: '#1e293b',
                      borderRadius: '0.75rem',
                      fontSize: '12px',
                      color: '#f8fafc'
                    }}
                  />
                  <Bar dataKey="score" name="Domain Mastery %" radius={[6, 6, 0, 0]}>
                    {categoryScores.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.score >= 75 ? '#10b981' : entry.score >= 40 ? '#f59e0b' : '#ef4444'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right 1 Col: "Your Twin Says" AI Diagnostic Insights */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider font-mono flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              &quot;Your Twin Says&quot; Insights
            </h3>
            <span className="text-[10px] text-slate-500 font-mono">Cognitive Telemetry</span>
          </div>

          <div className="space-y-3">
            {twinState.twinInsights.map(insight => {
              let cardBg = 'bg-slate-900/80 border-slate-800 text-slate-300';
              let badgeColor = 'bg-slate-800 text-slate-400';

              if (insight.severity === 'critical') {
                cardBg = 'bg-rose-950/30 border-rose-500/50 text-rose-200';
                badgeColor = 'bg-rose-500/20 text-rose-300 border border-rose-500/40';
              } else if (insight.severity === 'warning') {
                cardBg = 'bg-amber-950/30 border-amber-500/50 text-amber-200';
                badgeColor = 'bg-amber-500/20 text-amber-300 border border-amber-500/40';
              } else if (insight.severity === 'success') {
                cardBg = 'bg-emerald-950/30 border-emerald-500/50 text-emerald-200';
                badgeColor = 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40';
              }

              return (
                <div
                  key={insight.id}
                  className={`p-4 rounded-2xl border shadow-lg space-y-2 transition-all hover:scale-[1.01] ${cardBg}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold font-sans text-slate-100 flex items-center gap-1.5">
                      {insight.title}
                    </span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold ${badgeColor}`}>
                      {insight.type.replace('_', ' ')}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {insight.message}
                  </p>

                  {insight.actionableStep && (
                    <div className="pt-1.5 border-t border-slate-800/60 flex items-center justify-between text-xs">
                      <span className="text-[11px] font-semibold text-cyan-300">
                        {insight.actionableStep}
                      </span>
                      {insight.targetConceptId && (
                        <button
                          onClick={() => onSelectConcept(insight.targetConceptId!)}
                          className="p-1 rounded bg-slate-800 text-cyan-400 hover:bg-slate-700 transition-colors"
                        >
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Quick Action: Take Diagnostic */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-950/40 to-slate-900 border border-cyan-500/30 space-y-3">
            <div className="text-xs font-bold text-cyan-300 font-mono flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" />
              Recalibrate Knowledge State
            </div>
            <p className="text-xs text-slate-400">
              Run the active entropy reduction diagnostic to refresh unmastered and decaying nodes.
            </p>
            <button
              onClick={onOpenDiagnostic}
              className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/30 transition-all"
            >
              Start Adaptive Diagnostic
            </button>
          </div>
        </div>
      </div>

      {/* 3-Week Simulation Modal Overlay */}
      {showSimModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-lg">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
                <Play className="w-6 h-6 fill-current animate-pulse" />
              </div>
              <h3 className="text-xl font-bold text-slate-100">
                {isSimulating ? `Simulating Day ${simProgressDay} of 21...` : '3-Week Deliberate Practice Complete!'}
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                {isSimulating ? 'Fast-forwarding deliberate retrieval and BKT transitions' : 'Skill map and exam readiness successfully transformed'}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono text-slate-400">
                <span>Progress</span>
                <span className="text-emerald-400 font-bold">{Math.round((simProgressDay / 21) * 100)}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-150"
                  style={{ width: `${(simProgressDay / 21) * 100}%` }}
                />
              </div>
            </div>

            {/* Simulation Log stream */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 max-h-40 overflow-y-auto custom-scrollbar font-mono text-[11px] text-slate-300 space-y-1">
              {simLog.map((line, idx) => (
                <div key={idx} className="text-emerald-400/90 leading-tight">
                  &gt; {line}
                </div>
              ))}
            </div>

            {!isSimulating && (
              <button
                onClick={() => setShowSimModal(false)}
                className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-xl shadow-emerald-500/25 transition-all"
              >
                Inspect Transformed Skill Map DAG
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
