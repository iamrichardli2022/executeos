
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
  const isStep2Done = blocks.length > 0 || sessions.length > 0;
  const activeStep: 1 | 2 | 3 = !isStep1Done ? 1 : !isStep2Done ? 2 : 3;

  return (
    <div className="max-w-7xl mx-auto px-10 py-20 flex flex-col h-full animate-in fade-in duration-1000">
      <header className="mb-16 text-left">
        <h1 className="text-5xl font-light text-slate-900 tracking-tight mb-3">Command Centre</h1>
        <p className="text-slate-400 text-lg font-medium">Align your daily actions with your strategic intent.</p>
      </header>

      {/* REFINED WORKFLOW CARDS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* STEP 1 - STRATEGY HUB (Target Icon) */}
        <div className={`group relative p-10 rounded-[3.5rem] border transition-all duration-500 flex flex-col h-full 
          ${activeStep === 1 
            ? 'bg-white border-emerald-100 shadow-[0_32px_64px_-16px_rgba(16,185,129,0.12)] ring-1 ring-emerald-50' 
            : 'bg-white/50 border-slate-100 shadow-sm opacity-60 hover:opacity-100'
          }`}>
          <div className="flex justify-between items-start mb-8">
            <div className={`p-4 rounded-[1.5rem] transition-all duration-500 ${activeStep === 1 ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-200/50 scale-110' : 'bg-slate-100 text-slate-300'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="6" />
                <circle cx="12" cy="12" r="2" />
              </svg>
            </div>
            {isStep1Done && (
              <div className="bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border border-emerald-100">Valid Strategy</div>
            )}
          </div>
          
          <h2 className="text-2xl font-bold text-slate-900 mb-4 tracking-tight">1. Strategy Hub</h2>
          <p className="text-slate-400 mb-10 leading-relaxed text-sm font-medium">
            Define your core pillars. These act as high-pass filters for every task that enters your life.
          </p>
          
          <button 
            onClick={onOpenStrategy}
            className={`mt-auto w-full py-5 rounded-[1.75rem] font-bold text-sm transition-all duration-300 flex items-center justify-center gap-3 
              ${activeStep === 1 
                ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-xl shadow-emerald-200/40' 
                : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
              }`}
          >
            {isStep1Done ? 'Edit Pillars' : 'Set Priorities'}
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>
        </div>

        {/* STEP 2 - PLANNING (Calendar Icon) */}
        <div className={`group relative p-10 rounded-[3.5rem] border transition-all duration-500 flex flex-col h-full 
          ${activeStep === 2 
            ? 'bg-white border-indigo-100 shadow-[0_32px_64px_-16px_rgba(79,70,229,0.12)] ring-1 ring-indigo-50' 
            : !isStep1Done 
              ? 'bg-slate-50 border-slate-100 opacity-30 cursor-not-allowed grayscale' 
              : 'bg-white/50 border-slate-100 shadow-sm opacity-60 hover:opacity-100'
          }`}>
          <div className="flex justify-between items-start mb-8">
            <div className={`p-4 rounded-[1.5rem] transition-all duration-500 ${activeStep === 2 ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200/50 scale-110' : 'bg-slate-100 text-slate-300'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            {isStep2Done && (
              <div className="bg-indigo-50 text-indigo-600 text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border border-indigo-100">Plan Ready</div>
            )}
          </div>
          
          <h2 className="text-2xl font-bold text-slate-900 mb-4 tracking-tight">2. Planning</h2>
          <p className="text-slate-400 mb-10 leading-relaxed text-sm font-medium">
            Dump your thoughts, triage against strategy, and claim your time on the calendar.
          </p>
          
          <button 
            disabled={!isStep1Done}
            onClick={onStartNew}
            className={`mt-auto w-full py-5 rounded-[1.75rem] font-bold text-sm transition-all duration-300 flex items-center justify-center gap-3 
              ${activeStep === 2 
                ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-xl shadow-indigo-200/40' 
                : isStep1Done 
                  ? 'bg-slate-50 text-slate-500 hover:bg-slate-100' 
                  : 'bg-transparent border border-slate-200 text-slate-200'
              }`}
          >
            Start Session
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>
        </div>

        {/* STEP 3 - EXECUTION (Rocket Icon) */}
        <div className={`group relative p-10 rounded-[3.5rem] border transition-all duration-500 flex flex-col h-full 
          ${activeStep === 3 
            ? 'bg-slate-900 border-slate-800 shadow-2xl scale-[1.03] ring-1 ring-slate-800' 
            : 'bg-slate-50 border-slate-100 opacity-30 grayscale cursor-not-allowed'
          }`}>
          <div className="flex justify-between items-start mb-8">
            <div className={`p-4 rounded-[1.5rem] transition-all duration-500 ${activeStep === 3 ? 'bg-emerald-500 text-white shadow-xl shadow-emerald-400/30 animate-pulse' : 'bg-slate-200 text-slate-400'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
                <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
                <path d="M9 12H4s.55-3.03 2-5c1.62-2.2 5-3 5-3" />
                <path d="M12 15v5s3.03-.55 5-2c2.2-1.62 3-5 3-5" />
              </svg>
            </div>
            {activeStep === 3 && (
              <div className="bg-emerald-500/10 text-emerald-400 text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border border-emerald-500/20">Active Mode</div>
            )}
          </div>
          
          <h2 className={`text-2xl font-bold mb-4 tracking-tight ${activeStep === 3 ? 'text-white' : 'text-slate-300'}`}>3. Execution</h2>
          <p className={`mb-10 leading-relaxed text-sm font-medium ${activeStep === 3 ? 'text-slate-400' : 'text-slate-400'}`}>
            Enter the focus flow. See only the current task and execute with total clarity.
          </p>
          
          <button 
            disabled={activeStep !== 3}
            onClick={onStartExecution}
            className={`mt-auto w-full py-5 rounded-[1.75rem] font-bold text-sm transition-all duration-300 flex items-center justify-center gap-3 
              ${activeStep === 3 
                ? 'bg-white text-slate-900 hover:bg-slate-50 shadow-xl' 
                : 'bg-transparent border border-slate-200 text-slate-200'
              }`}
          >
            Go Live
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>
        </div>
      </div>
    </div>
  );
};
