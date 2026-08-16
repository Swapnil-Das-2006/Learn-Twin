import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { AlertTriangle, Lock, CheckCircle2, Clock, Sparkles, Zap } from 'lucide-react';
import { Concept, ConceptMastery } from '@/types';

export interface ConceptNodeData {
  concept: Concept;
  mastery?: ConceptMastery;
  isLocked: boolean;
  isBottleneck: boolean;
  onSelectNode: (conceptId: string) => void;
  [key: string]: unknown;
}

const ConceptNode = ({ data, selected }: NodeProps) => {
  const nodeData = data as unknown as ConceptNodeData;
  const { concept, mastery, isLocked, isBottleneck, onSelectNode } = nodeData;

  const score = mastery?.score ?? 0.25;
  const confidence = mastery?.confidence ?? 0.20;
  const scorePercent = Math.round(score * 100);

  // Status color logic
  let statusBg = 'bg-slate-900/90 border-slate-700/60 text-slate-300';
  let badgeColor = 'bg-slate-800 text-slate-400 border-slate-700';
  let glowStyle = '';
  let progressColor = 'bg-slate-600';
  let statusText = 'Not Started';

  if (isLocked) {
    statusBg = 'bg-slate-950/80 border-slate-800/80 text-slate-500 opacity-65';
    badgeColor = 'bg-slate-900 text-slate-500 border-slate-800';
    progressColor = 'bg-slate-700';
    statusText = 'Locked';
  } else if (isBottleneck) {
    statusBg = 'bg-rose-950/40 border-rose-500/80 text-rose-100 shadow-[0_0_25px_rgba(244,63,94,0.35)]';
    badgeColor = 'bg-rose-500/20 text-rose-300 border-rose-500/40';
    glowStyle = 'ring-2 ring-rose-500/50 animate-pulse';
    progressColor = 'bg-gradient-to-r from-rose-500 to-rose-400';
    statusText = 'Critical Bottleneck';
  } else if (score >= 0.75) {
    statusBg = 'bg-emerald-950/30 border-emerald-500/60 text-emerald-100 shadow-[0_0_20px_rgba(16,185,129,0.2)]';
    badgeColor = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    progressColor = 'bg-gradient-to-r from-emerald-500 to-teal-400';
    statusText = 'Mastered';
  } else if (score >= 0.40) {
    statusBg = 'bg-amber-950/30 border-amber-500/60 text-amber-100 shadow-[0_0_20px_rgba(245,158,11,0.2)]';
    badgeColor = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
    progressColor = 'bg-gradient-to-r from-amber-500 to-yellow-400';
    statusText = 'Developing';
  } else {
    statusBg = 'bg-rose-950/30 border-rose-500/50 text-rose-200';
    badgeColor = 'bg-rose-500/20 text-rose-300 border-rose-500/30';
    progressColor = 'bg-rose-500';
    statusText = 'Needs Practice';
  }

  // Node width & sizing based on importance
  const widthClass = concept.importance >= 4 ? 'w-72' : 'w-64';

  return (
    <div
      onClick={() => onSelectNode(concept.id)}
      className={`relative group rounded-xl border backdrop-blur-md p-3.5 transition-all duration-300 cursor-pointer select-none ${widthClass} ${statusBg} ${glowStyle} ${
        selected ? 'ring-2 ring-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.5)] scale-[1.03]' : 'hover:scale-[1.02]'
      }`}
    >
      {/* Target handle on left */}
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-cyan-500 !border-2 !border-slate-900 -ml-1.5 transition-transform group-hover:scale-125"
      />

      {/* Top row: Category badge + Difficulty / Bottleneck tag */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded-full border tracking-wider font-semibold ${badgeColor}`}>
          {concept.category}
        </span>

        <div className="flex items-center gap-1">
          {isBottleneck ? (
            <span className="flex items-center gap-1 text-[10px] font-bold text-rose-400 bg-rose-500/20 border border-rose-500/40 px-1.5 py-0.5 rounded-md animate-pulse">
              <AlertTriangle className="w-3 h-3" />
              BOTTLENECK
            </span>
          ) : isLocked ? (
            <span className="flex items-center gap-1 text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
              <Lock className="w-2.5 h-2.5" /> Locked
            </span>
          ) : score >= 0.75 ? (
            <span className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              {scorePercent}%
            </span>
          ) : (
            <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-slate-800/80 text-slate-300">
              {scorePercent}%
            </span>
          )}
        </div>
      </div>

      {/* Concept Name */}
      <div className="mb-2.5">
        <h4 className="text-sm font-bold text-slate-100 group-hover:text-cyan-300 transition-colors leading-tight line-clamp-1">
          {concept.name}
        </h4>
        <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
          {concept.description}
        </p>
      </div>

      {/* Mastery Progress Bar */}
      <div className="space-y-1">
        <div className="flex justify-between items-center text-[10px] text-slate-400">
          <span className="font-mono">BKT Mastery P(L)</span>
          <span className="font-mono font-semibold text-slate-200">
            {isLocked ? 'Prereqs Required' : `${scorePercent}%`}
          </span>
        </div>
        <div className="w-full h-1.5 bg-slate-950/80 rounded-full overflow-hidden border border-slate-800/60 p-[1px]">
          <div
            className={`h-full rounded-full transition-all duration-700 ${progressColor}`}
            style={{ width: isLocked ? '5%' : `${Math.max(8, scorePercent)}%` }}
          />
        </div>
      </div>

      {/* Bottom Metadata: Confidence & Misconceptions */}
      <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-800/60 text-[10px] text-slate-400 font-mono">
        <span className="flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-cyan-400" />
          Conf: {Math.round(confidence * 100)}%
        </span>

        {mastery?.detectedMisconceptions && mastery.detectedMisconceptions.length > 0 ? (
          <span className="flex items-center gap-1 text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">
            <Zap className="w-2.5 h-2.5" />
            {mastery.detectedMisconceptions.length} slip{mastery.detectedMisconceptions.length > 1 ? 's' : ''}
          </span>
        ) : (
          <span className="text-slate-500">
            Diff {concept.difficulty}/5
          </span>
        )}
      </div>

      {/* Source handle on right */}
      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-cyan-400 !border-2 !border-slate-900 -mr-1.5 transition-transform group-hover:scale-125"
      />
    </div>
  );
};

export default memo(ConceptNode);
