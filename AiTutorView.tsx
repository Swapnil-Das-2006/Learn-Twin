import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, StudentTwinState, Concept } from '@/types';
import { CALCULUS_CONCEPTS } from '@/data/calculusGraph';
import { generateTutorChatResponse } from '@/lib/aiService';
import { recordAttemptAndUpdateTwin } from '@/lib/twinEngine';
import {
  Brain,
  Sparkles,
  Send,
  Bot,
  User,
  Lightbulb,
  BookOpen,
  ArrowRight,
  RotateCcw,
  Zap,
  ShieldCheck,
  ChevronDown,
  Layers,
  AlertTriangle,
  Flame,
  CheckCircle2
} from 'lucide-react';

interface AiTutorViewProps {
  twinState: StudentTwinState;
  onStateUpdate: (updatedState: StudentTwinState) => void;
  onOpenMicroLesson: (conceptId: string) => void;
  onOpenQuiz: (conceptId: string) => void;
  userApiKey?: string;
}

export const AiTutorView: React.FC<AiTutorViewProps> = ({
  twinState,
  onStateUpdate,
  onOpenMicroLesson,
  onOpenQuiz,
  userApiKey
}) => {
  const [selectedConceptId, setSelectedConceptId] = useState<string>(
    twinState.activeBottlenecks.length > 0 ? twinState.activeBottlenecks[0].conceptId : 'chain-rule'
  );
  const [inputQuery, setInputQuery] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeConcept = CALCULUS_CONCEPTS.find(c => c.id === selectedConceptId) || CALCULUS_CONCEPTS[0];
  const conceptMastery = twinState.masteries[activeConcept.id];
  const conceptScore = conceptMastery ? Math.round(conceptMastery.score * 100) : 30;

  // Initialize greeting on mount or student change only if empty
  useEffect(() => {
    const isBottleneck = twinState.activeBottlenecks.some(b => b.conceptId === activeConcept.id);
    const misconceptions = conceptMastery?.detectedMisconceptions || [];

    const greeting: ChatMessage = {
      id: `msg_init_${Date.now()}`,
      role: 'assistant',
      content: `Hello **${twinState.student.name}**! 👋 I am your **LearnTwin AI Cognitive Tutor**.\n\nI have loaded your real-time knowledge twin state for **${activeConcept.name}** (Current BKT Mastery: **${conceptScore}%**).\n\n${
        isBottleneck
          ? `⚠️ **Bottleneck Alert:** My telemetry shows this node is currently blocking downstream progress in the DAG${misconceptions.length > 0 ? ` (notably due to \`${misconceptions[0].tag}\`)` : ''}.`
          : `We can do a deep dive, break down intuitive derivations, or walk through step-by-step worked examples.`
      }\n\nWhat would you like to explore?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      conceptContextId: activeConcept.id,
      suggestedPrompts: [
        `Deep dive into the core intuition of ${activeConcept.name}`,
        `Walk me through a step-by-step worked example`,
        `Why do students commonly slip on this topic?`,
        `How does this connect to my exam readiness?`
      ]
    };

    setMessages([greeting]);
  }, [twinState.student.id]);

  const handleConceptChange = (newConceptId: string) => {
    setSelectedConceptId(newConceptId);
    const newConcept = CALCULUS_CONCEPTS.find(c => c.id === newConceptId);
    if (newConcept) {
      const switchScore = Math.round((twinState.masteries[newConcept.id]?.score || 0.3) * 100);
      const isBt = twinState.activeBottlenecks.some(b => b.conceptId === newConcept.id);
      const switchMsg: ChatMessage = {
        id: `msg_switch_${Date.now()}`,
        role: 'assistant',
        content: `Switched focus to **${newConcept.name}** (${newConcept.category.toUpperCase()}). Current BKT mastery: **${switchScore}%**.\n\n${
          isBt ? `⚠️ *This concept is an active bottleneck in your DAG.*` : `Prerequisites are verified.`
        }\n\nWhat would you like to explore?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        conceptContextId: newConcept.id,
        suggestedPrompts: [
          `Explain the core intuition of ${newConcept.name}`,
          `Walk me through a worked example of ${newConcept.name}`,
          `Test my understanding with a problem`
        ]
      };
      setMessages(prev => [...prev, switchMsg]);
    }
  };

  const handleClearChat = () => {
    const greeting: ChatMessage = {
      id: `msg_reset_${Date.now()}`,
      role: 'assistant',
      content: `Chat session refreshed! Ready to explore **${activeConcept.name}** or any topic in your Calculus DAG.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      conceptContextId: activeConcept.id,
      suggestedPrompts: [
        `Deep dive into the core intuition of ${activeConcept.name}`,
        `Walk me through a step-by-step worked example`,
        `What are my biggest bottleneck concepts right now?`
      ]
    };
    setMessages([greeting]);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputQuery).trim();
    if (!query || isTyping) return;

    const userMsg: ChatMessage = {
      id: `msg_u_${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const currentHistory = [...messages, userMsg];
    setMessages(currentHistory);
    if (!textToSend) setInputQuery('');
    setIsTyping(true);

    const historyForAi = currentHistory.map(m => ({
      role: m.role as 'user' | 'assistant',
      content: m.content
    }));

    try {
      const response = await generateTutorChatResponse(
        query,
        historyForAi,
        selectedConceptId,
        twinState,
        userApiKey
      );

      const botMsg: ChatMessage = {
        id: `msg_a_${Date.now()}`,
        role: 'assistant',
        content: response.content,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedPrompts: response.suggestedPrompts,
        inferredMisconceptionAddressed: response.addressedMisconception
      };

      setMessages(prev => [...prev, botMsg]);
    } catch {
      const errorMsg: ChatMessage = {
        id: `msg_err_${Date.now()}`,
        role: 'assistant',
        content: `I ran into a momentary hiccup generating the explanation. Let's try again!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };


  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Banner & Topic Selector */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40 border border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center gap-1">
              <Bot className="w-3.5 h-3.5" />
              Interactive AI Tutor
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Grounded Cognitive Explainer
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-100">
            Deep-Dive AI Cognitive Tutor
          </h1>
        </div>

        {/* Controls: Concept Selector + Clear Chat */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-slate-950/80 p-1.5 rounded-xl border border-slate-800">
            <Layers className="w-4 h-4 text-cyan-400 ml-2" />
            <span className="text-xs font-mono text-slate-400">Focus Concept:</span>
            <select
              value={selectedConceptId}
              onChange={e => handleConceptChange(e.target.value)}
              className="bg-slate-900 border border-slate-750 text-slate-200 text-xs font-mono rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-cyan-500 cursor-pointer"
            >
              {CALCULUS_CONCEPTS.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} ({Math.round((twinState.masteries[c.id]?.score || 0.3) * 100)}%)
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleClearChat}
            title="Start new conversation"
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 text-xs font-mono flex items-center gap-1 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Chat</span>
          </button>
        </div>

      </div>

      {/* Main Chat Interface + Sidebar Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-[620px]">
        {/* Left 3 Cols: Chat Window */}
        <div className="lg:col-span-3 flex flex-col bg-slate-900/80 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
          {/* Chat Messages Stream */}
          <div className="flex-1 p-6 overflow-y-auto space-y-6 custom-scrollbar max-h-[520px]">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex gap-3 text-sm ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div className={`max-w-[85%] space-y-2 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`p-4 rounded-2xl leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-cyan-600 text-white rounded-tr-sm shadow-md'
                        : 'bg-slate-950/80 border border-slate-800 text-slate-200 rounded-tl-sm shadow-lg'
                    }`}
                  >
                    {/* Render message with line breaks and formatting */}
                    <div className="prose prose-invert prose-sm max-w-none space-y-2 whitespace-pre-wrap">
                      {msg.content}
                    </div>
                  </div>

                  {/* Suggested Quick Prompt Chips from Assistant */}
                  {msg.role === 'assistant' && msg.suggestedPrompts && msg.suggestedPrompts.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {msg.suggestedPrompts.map((prompt, pIdx) => (
                        <button
                          key={pIdx}
                          onClick={() => handleSendMessage(prompt)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-cyan-300 border border-slate-700 text-[11px] font-mono transition-all text-left"
                        >
                          💬 {prompt}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="text-[10px] font-mono text-slate-500 px-1">
                    {msg.timestamp}
                  </div>
                </div>

                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-3 text-slate-400 text-xs font-mono">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.4s]" />
                  <span className="ml-1 text-slate-400">Synthesizing deep-dive cognitive explanation...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Bar & Input Box */}
          <div className="p-4 border-t border-slate-800 bg-slate-950/90 space-y-3">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={inputQuery}
                onChange={e => setInputQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Ask AI Tutor anything about ${activeConcept.name}...`}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-cyan-500 placeholder:text-slate-500 font-sans"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputQuery.trim() || isTyping}
                className="px-5 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold text-sm shadow-lg shadow-cyan-600/30 transition-all flex items-center gap-1.5"
              >
                <Send className="w-4 h-4" />
                <span>Ask</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Grounded Digital Twin Context HUD */}
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Brain className="w-4 h-4 text-cyan-400" />
                Twin Grounded State
              </h3>
              <span className="text-[10px] text-emerald-400 font-mono font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                Active
              </span>
            </div>

            {/* Target Concept Card */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] uppercase font-mono text-cyan-400 font-semibold">
                    {activeConcept.category}
                  </span>
                  <h4 className="text-sm font-bold text-slate-100">{activeConcept.name}</h4>
                </div>
                <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                  conceptScore >= 75 ? 'text-emerald-400 bg-emerald-500/10' : conceptScore >= 40 ? 'text-amber-400 bg-amber-500/10' : 'text-rose-400 bg-rose-500/10'
                }`}>
                  {conceptScore}%
                </span>
              </div>

              <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    conceptScore >= 75 ? 'bg-emerald-500' : conceptScore >= 40 ? 'bg-amber-500' : 'bg-rose-500'
                  }`}
                  style={{ width: `${conceptScore}%` }}
                />
              </div>
            </div>

            {/* Student Profile Overview */}
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs font-mono space-y-1.5 text-slate-400">
              <div className="flex justify-between">
                <span>Learner:</span>
                <span className="text-slate-200 font-semibold">{twinState.student.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Modality:</span>
                <span className="text-cyan-300 font-semibold capitalize">{twinState.student.preferredModality.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between">
                <span>Pace:</span>
                <span className="text-amber-300 font-semibold uppercase">{twinState.student.learningPace}</span>
              </div>
              <div className="flex justify-between">
                <span>Exam Target:</span>
                <span className="text-emerald-300 font-semibold">{Math.round(twinState.student.examReadinessTarget * 100)}%</span>
              </div>
            </div>

            {/* Inferred Misconceptions */}
            <div className="space-y-2">
              <div className="text-[11px] uppercase font-mono font-bold text-slate-400 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                Active Misconceptions
              </div>
              {conceptMastery?.detectedMisconceptions && conceptMastery.detectedMisconceptions.length > 0 ? (
                <div className="space-y-1.5">
                  {conceptMastery.detectedMisconceptions.map((m, idx) => (
                    <div key={idx} className="p-2 rounded-lg bg-amber-950/20 border border-amber-500/30 text-[11px] text-amber-300">
                      • {m.tag.replace(/_/g, ' ')} ({m.occurrences}x)
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-2 rounded-lg bg-slate-950 text-[11px] text-slate-500 italic">
                  No active misconceptions for this concept.
                </div>
              )}
            </div>

            {/* Quick Action Interventions */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => onOpenMicroLesson(activeConcept.id)}
                className="w-full py-2 px-3 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 text-xs font-mono font-semibold transition-colors flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Open AI Micro-Lesson
              </button>

              <button
                onClick={() => onOpenQuiz(activeConcept.id)}
                className="w-full py-2 px-3 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/40 text-xs font-mono font-semibold transition-colors flex items-center justify-center gap-1.5"
              >
                <Brain className="w-3.5 h-3.5" />
                Start 5Q Adaptive Quiz
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
