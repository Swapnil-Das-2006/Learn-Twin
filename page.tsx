'use client';

import React, { useState, useEffect } from 'react';
import { StudentProfile, StudentTwinState } from '@/types';
import { SEED_PROFILES } from '@/data/seedStudents';
import { CALCULUS_CONCEPTS, QUESTION_BANK } from '@/data/calculusGraph';
import {
  getStoredActiveStudentId,
  setStoredActiveStudentId,
  getStoredTwinState,
  saveTwinState,
  resetTwinState,
  getStoredGeminiApiKey,
  setStoredGeminiApiKey
} from '@/lib/storage';
import { recordAttemptAndUpdateTwin, simulateThreeWeeksOfStudy } from '@/lib/twinEngine';

import { Navbar } from '@/components/layout/Navbar';
import { SkillMapDAG } from '@/components/skill-map/SkillMapDAG';
import { ConceptDrawer } from '@/components/skill-map/ConceptDrawer';
import { DiagnosticView } from '@/components/diagnostic/DiagnosticView';
import { TwinDashboard } from '@/components/dashboard/TwinDashboard';
import { StudyPlanView } from '@/components/ai-studio/StudyPlanView';
import { AiTutorView } from '@/components/tutor/AiTutorView';
import { MicroLessonModal } from '@/components/ai-studio/MicroLessonModal';
import { TargetedQuizModal } from '@/components/ai-studio/TargetedQuizModal';
import { ApiKeyModal } from '@/components/modals/ApiKeyModal';

export default function Home() {
  const [activeStudentId, setActiveStudentId] = useState<string>(SEED_PROFILES[0].id);
  const [twinState, setTwinState] = useState<StudentTwinState | null>(null);
  const [activeTab, setActiveTab] = useState<'skill-map' | 'diagnostic' | 'dashboard' | 'study-plan' | 'tutor'>('skill-map');
  const [selectedConceptId, setSelectedConceptId] = useState<string | null>('chain-rule');
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  // Modals
  const [microLessonConceptId, setMicroLessonConceptId] = useState<string | null>(null);
  const [quizConceptId, setQuizConceptId] = useState<string | null>(null);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState<boolean>(false);
  const [geminiApiKey, setGeminiApiKey] = useState<string>('');

  // Initial client hydration
  useEffect(() => {
    const studentId = getStoredActiveStudentId();
    setActiveStudentId(studentId);
    const state = getStoredTwinState(studentId);
    setTwinState(state);
    setGeminiApiKey(getStoredGeminiApiKey());
  }, []);

  // Save twinState when updated
  const handleUpdateTwinState = (newState: StudentTwinState) => {
    setTwinState(newState);
    saveTwinState(newState);
  };

  const handleStudentChange = (newStudentId: string) => {
    setActiveStudentId(newStudentId);
    setStoredActiveStudentId(newStudentId);
    const state = getStoredTwinState(newStudentId);
    setTwinState(state);
    setIsDrawerOpen(false);

    // If switching to new student, suggest diagnostic
    if (newStudentId === 'student-new') {
      setActiveTab('diagnostic');
    }
  };

  const handleResetState = () => {
    if (!twinState) return;
    const fresh = resetTwinState(twinState.student.id);
    setTwinState(fresh);
    setIsDrawerOpen(false);
  };

  const handleSelectConcept = (conceptId: string) => {
    setSelectedConceptId(conceptId);
    setIsDrawerOpen(true);
  };

  const handleQuickPractice = (conceptId: string) => {
    if (!twinState) return;
    const conceptQuestions = QUESTION_BANK.filter(q => q.conceptId === conceptId);
    const q = conceptQuestions.length > 0 ? conceptQuestions[0] : QUESTION_BANK[0];
    const correctOpt = q.options.find(o => o.isCorrect) || q.options[0];

    const updated = recordAttemptAndUpdateTwin(twinState, {
      studentId: twinState.student.id,
      conceptId,
      questionId: q.id,
      questionText: q.text,
      studentResponse: correctOpt.text,
      correctResponse: correctOpt.text,
      isCorrect: true,
      timeTakenSec: Math.floor(18 + Math.random() * 15)
    });

    handleUpdateTwinState(updated);
  };

  const handleRun3WeekSimulation = () => {
    if (!twinState) return;
    const { finalState } = simulateThreeWeeksOfStudy(twinState);
    handleUpdateTwinState(finalState);
    setActiveTab('skill-map');
  };

  if (!twinState) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#060911]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-mono text-slate-400">Initializing Digital Twin Knowledge State...</p>
        </div>
      </div>
    );
  }

  const activeStudentProfile = SEED_PROFILES.find(s => s.id === activeStudentId) || SEED_PROFILES[0];

  return (
    <div className="min-h-screen flex flex-col bg-[#060911] text-slate-100 selection:bg-cyan-500/30">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        activeStudent={activeStudentProfile}
        onStudentChange={handleStudentChange}
        twinState={twinState}
        onResetState={handleResetState}
        onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
        onRun3WeekSimulation={handleRun3WeekSimulation}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === 'skill-map' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                  <span>Interactive Concept DAG &amp; Knowledge Twin</span>
                </h1>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Real-time Bayesian state over 18 calculus concept nodes. Click any node to inspect telemetry, error tags, and launch AI interventions.
                </p>
              </div>

              {/* Student Bio Pill */}
              <div className="flex items-center gap-2.5 bg-slate-900/90 border border-slate-800 px-3.5 py-2 rounded-xl text-xs font-mono">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.6)] animate-pulse" />
                <span className="text-slate-300">
                  Twin Profile: <strong className="text-cyan-300">{twinState.student.name}</strong> ({twinState.student.personaTag})
                </span>
              </div>
            </div>

            {/* Skill Map React Flow DAG Canvas */}
            <SkillMapDAG
              twinState={twinState}
              onSelectConcept={handleSelectConcept}
              selectedConceptId={selectedConceptId}
            />
          </div>
        )}

        {activeTab === 'tutor' && (
          <AiTutorView
            twinState={twinState}
            onStateUpdate={handleUpdateTwinState}
            onOpenMicroLesson={conceptId => setMicroLessonConceptId(conceptId)}
            onOpenQuiz={conceptId => setQuizConceptId(conceptId)}
            userApiKey={geminiApiKey}
          />
        )}

        {activeTab === 'diagnostic' && (
          <DiagnosticView
            twinState={twinState}
            onDiagnosticComplete={updated => {
              handleUpdateTwinState(updated);
              setActiveTab('skill-map');
            }}
            onExit={() => setActiveTab('skill-map')}
          />
        )}

        {activeTab === 'dashboard' && (
          <TwinDashboard
            twinState={twinState}
            onStateUpdate={handleUpdateTwinState}
            onSelectConcept={conceptId => {
              setSelectedConceptId(conceptId);
              setIsDrawerOpen(true);
              setActiveTab('skill-map');
            }}
            onOpenDiagnostic={() => setActiveTab('diagnostic')}
          />
        )}

        {activeTab === 'study-plan' && (
          <StudyPlanView
            twinState={twinState}
            onSelectConcept={conceptId => {
              setSelectedConceptId(conceptId);
              setIsDrawerOpen(true);
              setActiveTab('skill-map');
            }}
            userApiKey={geminiApiKey}
          />
        )}
      </main>


      {/* Slide-over Inspection Drawer */}
      <ConceptDrawer
        conceptId={selectedConceptId}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        twinState={twinState}
        onStartMicroLesson={conceptId => setMicroLessonConceptId(conceptId)}
        onStartQuiz={conceptId => setQuizConceptId(conceptId)}
        onQuickPractice={handleQuickPractice}
      />

      {/* AI Intervention Modals */}
      <MicroLessonModal
        conceptId={microLessonConceptId}
        isOpen={!!microLessonConceptId}
        onClose={() => setMicroLessonConceptId(null)}
        twinState={twinState}
        onStateUpdate={handleUpdateTwinState}
        userApiKey={geminiApiKey}
      />

      <TargetedQuizModal
        conceptId={quizConceptId}
        isOpen={!!quizConceptId}
        onClose={() => setQuizConceptId(null)}
        twinState={twinState}
        onStateUpdate={handleUpdateTwinState}
        userApiKey={geminiApiKey}
      />

      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        onKeySaved={setGeminiApiKey}
      />
    </div>
  );
}
