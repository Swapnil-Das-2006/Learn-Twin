import React, { useMemo, useState, useCallback } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Panel,
  Node,
  Edge,
  MarkerType,
  useNodesState,
  useEdgesState,
  BackgroundVariant
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import dagre from 'dagre';
import { Concept, StudentTwinState } from '@/types';
import { CALCULUS_CONCEPTS } from '@/data/calculusGraph';
import ConceptNode, { ConceptNodeData } from './ConceptNode';
import { Sparkles, AlertTriangle, Layers, Filter, Eye, RefreshCw, ZoomIn } from 'lucide-react';

const nodeTypes = {
  conceptNode: ConceptNode
};

interface SkillMapDAGProps {
  twinState: StudentTwinState;
  onSelectConcept: (conceptId: string) => void;
  selectedConceptId: string | null;
}

const nodeWidth = 280;
const nodeHeight = 150;

/**
 * Dagre layout engine for the Concept DAG.
 */
function getLayoutedElements(
  concepts: Concept[],
  twinState: StudentTwinState,
  onSelectNode: (id: string) => void,
  direction = 'LR'
): { nodes: Node[]; edges: Edge[] } {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({
    rankdir: direction,
    nodesep: 50,
    ranksep: 90,
    marginx: 40,
    marginy: 40
  });

  const bottlenecks = new Set(twinState.activeBottlenecks.map(b => b.conceptId));

  // Add nodes to Dagre
  concepts.forEach(concept => {
    dagreGraph.setNode(concept.id, { width: nodeWidth, height: nodeHeight });
  });

  // Add edges to Dagre
  concepts.forEach(concept => {
    concept.prerequisites.forEach(prereqId => {
      dagreGraph.setEdge(prereqId, concept.id);
    });
  });

  dagre.layout(dagreGraph);

  const nodes: Node[] = concepts.map(concept => {
    const nodeWithPosition = dagreGraph.node(concept.id);
    const mastery = twinState.masteries[concept.id];
    
    // Check if prerequisites are locked
    const isLocked = concept.prerequisites.some(pId => (twinState.masteries[pId]?.score || 0) < 0.40);
    const isBottleneck = bottlenecks.has(concept.id);

    return {
      id: concept.id,
      type: 'conceptNode',
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2
      },
      data: {
        concept,
        mastery,
        isLocked,
        isBottleneck,
        onSelectNode
      } as unknown as Record<string, unknown>
    };
  });

  const edges: Edge[] = [];
  concepts.forEach(concept => {
    concept.prerequisites.forEach(prereqId => {
      const sourceScore = twinState.masteries[prereqId]?.score || 0.3;
      const targetScore = twinState.masteries[concept.id]?.score || 0.3;
      const isUnlockedPath = sourceScore >= 0.70;

      let edgeColor = '#475569'; // default slate
      if (isUnlockedPath && targetScore >= 0.70) {
        edgeColor = '#10b981'; // green path
      } else if (isUnlockedPath) {
        edgeColor = '#06b6d4'; // active flow
      } else if (sourceScore < 0.40) {
        edgeColor = '#f43f5e'; // red blocked prerequisite
      }

      edges.push({
        id: `e_${prereqId}_${concept.id}`,
        source: prereqId,
        target: concept.id,
        animated: isUnlockedPath,
        style: {
          stroke: edgeColor,
          strokeWidth: isUnlockedPath ? 2.5 : 1.5,
          strokeDasharray: isUnlockedPath ? '6,6' : undefined
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: edgeColor,
          width: 14,
          height: 14
        }
      });
    });
  });

  return { nodes, edges };
}

export const SkillMapDAG: React.FC<SkillMapDAGProps> = ({
  twinState,
  onSelectConcept,
  selectedConceptId
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [showBottlenecksOnly, setShowBottlenecksOnly] = useState<boolean>(false);

  const filteredConcepts = useMemo(() => {
    return CALCULUS_CONCEPTS.filter(c => {
      if (filterCategory !== 'all' && c.category !== filterCategory) return false;
      if (showBottlenecksOnly && !twinState.activeBottlenecks.some(b => b.conceptId === c.id)) return false;
      return true;
    });
  }, [filterCategory, showBottlenecksOnly, twinState.activeBottlenecks]);

  const { nodes: layoutedNodes, edges: layoutedEdges } = useMemo(() => {
    return getLayoutedElements(filteredConcepts, twinState, onSelectConcept);
  }, [filteredConcepts, twinState, onSelectConcept]);

  const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges);

  // Sync nodes & edges when props change
  React.useEffect(() => {
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  }, [layoutedNodes, layoutedEdges, setNodes, setEdges]);

  return (
    <div className="relative w-full h-full min-h-[620px] bg-slate-950 rounded-2xl border border-slate-800/80 overflow-hidden shadow-2xl">
      {/* Top Filter & Legend Bar */}
      <div className="absolute top-4 left-4 z-10 flex flex-wrap items-center gap-2 bg-slate-900/90 backdrop-blur-md p-2 rounded-xl border border-slate-800 shadow-lg text-xs">
        <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-800/80 rounded-lg text-slate-300 font-mono">
          <Layers className="w-3.5 h-3.5 text-cyan-400" />
          <span>Calculus DAG ({filteredConcepts.length} Nodes)</span>
        </div>

        {/* Category Selector */}
        <div className="flex items-center gap-1">
          {['all', 'foundations', 'differential', 'integral', 'applications'].map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-2.5 py-1 rounded-lg uppercase tracking-wider font-mono text-[10px] font-semibold transition-colors ${
                filterCategory === cat
                  ? 'bg-cyan-500 text-slate-950'
                  : 'bg-slate-800/50 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="h-4 w-[1px] bg-slate-700 mx-1" />

        {/* Bottlenecks filter toggle */}
        <button
          onClick={() => setShowBottlenecksOnly(!showBottlenecksOnly)}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-mono font-semibold transition-colors ${
            showBottlenecksOnly
              ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'
              : 'bg-slate-800/50 text-rose-300 hover:bg-slate-800'
          }`}
        >
          <AlertTriangle className="w-3 h-3" />
          {showBottlenecksOnly ? 'Bottlenecks Active' : 'Filter Bottlenecks'}
        </button>
      </div>

      {/* Legend Panel on Bottom Left */}
      <div className="absolute bottom-4 left-4 z-10 bg-slate-900/90 backdrop-blur-md p-3 rounded-xl border border-slate-800 shadow-lg text-[11px] font-mono text-slate-300 space-y-2">
        <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">DAG Mastery Spectrum</div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
            <span>Mastered (≥75%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
            <span>Developing (40-74%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]" />
            <span>Needs Practice (&lt;40%)</span>
          </div>
        </div>
      </div>

      {/* React Flow Canvas */}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.2}
        maxZoom={1.8}
        proOptions={{ hideAttribution: true }}
      >
        <Background
          color="#1e293b"
          gap={24}
          size={1.5}
          variant={BackgroundVariant.Dots}
        />
        <Controls
          className="!bg-slate-900 !border-slate-800 !text-slate-300 !rounded-xl !overflow-hidden [&>button]:!bg-slate-900 [&>button]:!border-slate-800 [&>button]:!text-slate-300 hover:[&>button]:!bg-slate-800"
        />
        <MiniMap
          nodeColor={node => {
            const data = node.data as unknown as ConceptNodeData;
            if (data?.isBottleneck) return '#ef4444';
            const score = data?.mastery?.score || 0.3;
            if (score >= 0.75) return '#10b981';
            if (score >= 0.40) return '#f59e0b';
            return '#ef4444';
          }}
          maskColor="rgba(15, 23, 42, 0.7)"
          className="!bg-slate-950 !border-slate-800 !rounded-xl !overflow-hidden !m-4"
        />
      </ReactFlow>
    </div>
  );
};
