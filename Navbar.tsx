import React, { useState } from 'react';
import { StudentProfile, StudentTwinState } from '@/types';
import { SEED_PROFILES } from '@/data/seedStudents';
import {
  Brain,
  Layers,
  Activity,
  Calendar,
  Sparkles,
  RotateCcw,
  Key,
  ShieldCheck,
  User,
  CheckCircle2,
  AlertTriangle,
  Play
} from 'lucide-react';

interface NavbarProps {
  activeTab: 'skill-map' | 'diagnostic' | 'dashboard' | 'study-plan' | 'tutor';
  onTabChange: (tab: 'skill-map' | 'diagnostic' | 'dashboard' | 'study-plan' | 'tutor') => void;
  activeStudent: StudentProfile;
  onStudentChange: (studentId: string) => void;
  twinState: StudentTwinState;
  onResetState: () => void;
  onOpenApiKeyModal: () => void;
  onRun3WeekSimulation: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  activeStudent,
  onStudentChange,
  twinState,
  onResetState,
  onOpenApiKeyModal,
  onRun3WeekSimulation
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-slate-950/85 backdrop-blur-xl border-b border-slate-800 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-emerald-400 to-teal-300 p-[1.5px] shadow-lg shadow-cyan-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Brain className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg text-slate-100 tracking-tight">
                  Learn<span className="text-cyan-400">Twin</span>
                </span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  AI Digital Twin
                </span>
              </div>
              <div className="text-[11px] text-slate-500 font-mono hidden sm:block">
                Persistent Bayesian Knowledge Model
              </div>
            </div>
          </div>

          {/* Navigation Mode Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => onTabChange('skill-map')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                activeTab === 'skill-map'
                  ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Skill Map (Hero DAG)</span>
            </button>

            <button
              onClick={() => onTabChange('tutor')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                activeTab === 'tutor'
                  ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
              <span>AI Tutor (Deep Dive)</span>
            </button>

            <button
              onClick={() => onTabChange('diagnostic')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                activeTab === 'diagnostic'
                  ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Adaptive Diagnostic</span>
            </button>

            <button
              onClick={() => onTabChange('dashboard')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Brain className="w-3.5 h-3.5" />
              <span>Twin Telemetry</span>
            </button>

            <button
              onClick={() => onTabChange('study-plan')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                activeTab === 'study-plan'
                  ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Study Plan</span>
            </button>
          </nav>


          {/* Right Controls: Student Switcher & Actions */}
          <div className="flex items-center gap-2">
            {/* Student Switcher Dropdown */}
            <div className="relative">
              <select
                value={activeStudent.id}
                onChange={e => onStudentChange(e.target.value)}
                className="bg-slate-900 border border-slate-750 text-slate-200 text-xs font-mono rounded-xl px-3 py-2 pr-7 appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-cyan-500 hover:bg-slate-850 transition-colors"
              >
                {SEED_PROFILES.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.personaTag})
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                ▼
              </div>
            </div>

            {/* Quick 3-Week Simulation CTA */}
            <button
              onClick={onRun3WeekSimulation}
              title="Fast-forward 3 weeks of deliberate study"
              className="hidden lg:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-semibold transition-colors"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>Simulate 3W</span>
            </button>

            {/* Reset State Button */}
            <button
              onClick={onResetState}
              title="Reset Twin to original seed data"
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* API Key Modal Button */}
            <button
              onClick={onOpenApiKeyModal}
              title="LLM API Key Settings (Gemini)"
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-400 border border-slate-800 transition-colors"
            >
              <Key className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
