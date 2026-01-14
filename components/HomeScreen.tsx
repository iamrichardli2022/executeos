
import React from "react";
import { ExecutionSession, StrategicPriority, CalendarBlock } from "../types";

interface Props {
  sessions: ExecutionSession[];
  priorities: StrategicPriority[];
  blocks: CalendarBlock[];
  onStartNew: () => void;
  onStartExecution: () => void;
  onOpenStrategy: () => void;
}

export const HomeScreen: React.FC<Props> = ({ sessions, priorities, blocks, onStartNew, onStartExecution, onOpenStrategy }) => {
  const isStep1Done = priorities.length > 0;
  // Step 2 is considered "done" if we have blocks scheduled or at least one session stored
  const isStep2Done = blocks.length > 0 || sessions.length > 0;

  // Highlighting logic:
  // Step 1 active if not done.
  // Step 2 active if Step 1 is done but Step 2 is not.
  // Step 3 active only if both Step 1 and 2 are done.
  const activeStep: 1 | 2 | 3 = !isStep1Done ? 1 : !isStep2Done ? 2 : 3;

  return (
    <div className="max-w-6xl mx-auto px-12 py-16 flex flex-col h-full animate-in fade-in duration-700">
      <header className="mb-12">
        <h1 className="text-4xl font-light text-slate-800 tracking-tight mb-2">Command Centre</h1>
        <p className="text-slate-500 text-lg">Your high-fidelity alignment system.</p>
      </header>

      {/* WORKFLOW MAP */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        {/* STEP 1: STRATEGY */}
        <div className={`relative p-10 rounded-[3.5rem] border-2 transition-all flex flex-col h-full 
          ${activeStep === 1 
            ? 'bg-emerald-50 border-emerald-200 shadow-2xl shadow-emerald-100 ring-4 ring-emerald-50' 
            : 'bg-white border-slate-100 shadow-xl shadow-slate-100/50'
          }`}>
          <div className="flex justify-between items-start mb-6 shrink-0">
            <div className={`p-4 rounded-2xl transition-all ${activeStep === 1 ? 'bg-emerald-600 text-white scale-110' : 'bg-slate-50 text-slate-400'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
            </div>
            {isStep1Done && (
              <span className="bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-emerald-200">Completed</span>
            )}
          </div>
          
          <h2 className="text-2xl font-bold text-slate-800 mb-3">Step 1: Strategy Hub</h2>
          <p className="text-slate-500 mb-8 leading-relaxed flex-1 text-sm">
            Define your strategic pillars to filter out noise and anchor your calendar in intention.
          </p>
          
          <button 
            onClick={onOpenStrategy}
            className={`w-full py-4 rounded-[1.5rem] font-bold transition-all flex items-center justify-center gap-3 shrink-0 text-sm 
              ${activeStep === 1 
                ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-xl shadow-emerald-200' 
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
          >
            {isStep1Done ? 'Refine Hub' : 'Define Pillars'}
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>
        </div>

        {/* STEP 2: PLANNING SESSION */}
        <div className={`relative p-10 rounded-[3.5rem] border-2 transition-all flex flex-col h-full 
          ${activeStep === 2 
            ? 'bg-indigo-50 border-indigo-200 shadow-2xl shadow-indigo-100 ring-4 ring-indigo-50' 
            : !isStep1Done 
              ? 'bg-slate-50 border-slate-100 opacity-50 grayscale' 
              : 'bg-white border-slate-100 shadow-xl shadow-slate-100/50'
          }`}>
          <div className="flex justify-between items-start mb-6 shrink-0">
            <div className={`p-4 rounded-2xl transition-all ${activeStep === 2 ? 'bg-indigo-600 text-white scale-110' : 'bg-slate-50 text-slate-400'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </div>
            {isStep2Done && (
              <span className="bg-indigo-100 text-indigo-700 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-indigo-200">Session Ready</span>
            )}
          </div>
          
          <h2 className="text-2xl font-bold text-slate-800 mb-3">Step 2: Planning Session</h2>
          <p className="text-slate-500 mb-8 leading-relaxed flex-1 text-sm">
            Brain dump your thoughts, triage against strategy, and schedule your execution windows.
          </p>
          
          <button 
            disabled={!isStep1Done}
            onClick={onStartNew}
            className={`w-full py-4 rounded-[1.5rem] font-bold transition-all flex items-center justify-center gap-3 shrink-0 text-sm 
              ${activeStep === 2 
                ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-xl shadow-indigo-200' 
                : isStep1Done 
                  ? 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 shadow-sm' 
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
          >
            New Session
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>
        </div>

        {/* STEP 3: EXECUTION SESSION */}
        <div className={`relative p-10 rounded-[3.5rem] border-2 transition-all flex flex-col h-full 
          ${activeStep === 3 
            ? 'bg-slate-900 border-slate-900 shadow-2xl shadow-slate-200 scale-[1.02]' 
            : 'bg-slate-50 border-slate-100 opacity-40 grayscale'
          }`}>
          <div className="flex justify-between items-start mb-6 shrink-0">
            <div className={`p-4 rounded-2xl transition-all ${activeStep === 3 ? 'bg-emerald-500 text-white scale-110 shadow-lg shadow-emerald-500/20' : 'bg-slate-200 text-slate-400'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
            {activeStep === 3 && (
              <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-emerald-500/30">Active Goal</span>
            )}
          </div>
          
          <h2 className={`text-2xl font-bold mb-3 ${activeStep === 3 ? 'text-white' : 'text-slate-400'}`}>Step 3: Execution</h2>
          <p className={`mb-8 leading-relaxed flex-1 text-sm ${activeStep === 3 ? 'text-slate-400' : 'text-slate-400'}`}>
            The active session. Transform your plans into checked boxes with a focused execution-first view.
          </p>
          
          <button 
            disabled={activeStep !== 3}
            onClick={onStartExecution}
            className={`w-full py-4 rounded-[1.5rem] font-bold transition-all flex items-center justify-center gap-3 shrink-0 text-sm 
              ${activeStep === 3 
                ? 'bg-white text-slate-900 hover:bg-slate-50 shadow-xl' 
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
          >
            Launch Execution
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>
        </div>
      </div>
    </div>
  );
};
