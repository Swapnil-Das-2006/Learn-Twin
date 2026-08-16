import React, { useState } from 'react';
import { Key, Sparkles, X, CheckCircle2, ShieldAlert } from 'lucide-react';
import { getStoredGeminiApiKey, setStoredGeminiApiKey } from '@/lib/storage';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeySaved: (key: string) => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  onKeySaved
}) => {
  const [apiKey, setApiKey] = useState<string>(getStoredGeminiApiKey());
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSave = () => {
    setStoredGeminiApiKey(apiKey.trim());
    onKeySaved(apiKey.trim());
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100">LLM Generation Settings</h3>
              <p className="text-xs text-slate-400">Google Gemini 2.0 API Integration</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 space-y-1.5 leading-relaxed">
          <div className="flex items-center gap-1.5 text-cyan-400 font-semibold font-mono">
            <Sparkles className="w-3.5 h-3.5" />
            Zero-Config Ready Out of the Box
          </div>
          <p>
            LearnTwin includes an embedded high-fidelity mathematical AI engine that generates grounded micro-lessons, quizzes, and study plans instantly.
          </p>
          <p className="text-slate-400 text-[11px]">
            You can optionally paste a live <strong>Gemini API Key</strong> below to stream real-time Google Gemini 2.0 Flash completions.
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-mono text-slate-300 font-semibold">
            Gemini API Key (Optional)
          </label>
          <input
            type="password"
            value={apiKey}
            onChange={e => setApiKey(e.target.value)}
            placeholder="AIzaSy..."
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500 placeholder:text-slate-600"
          />
        </div>

        <div className="pt-2 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/30 transition-all flex items-center gap-1.5"
          >
            {savedSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                <span>Saved!</span>
              </>
            ) : (
              <span>Save Key</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
