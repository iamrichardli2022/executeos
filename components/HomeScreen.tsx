
import React, { useState, useMemo } from "react";
import { ExecutionSession, StrategicPriority, CalendarBlock, Commitment } from "../types";

interface Props {
  sessions: ExecutionSession[];
  priorities: StrategicPriority[];
  blocks: CalendarBlock[];
  commitments: Commitment[];
  isDemoMode: boolean;
  onStartNew: () => void;
  onStartExecution: () => void;
  onOpenStrategy: () => void;
  onStartDemo: () => void;
}

export const HomeScreen: React.FC<Props> = ({ 
  sessions, 
  priorities, 
  blocks, 
  commitments = [],
  isDemoMode,
  onStartNew, 
  onStartExecution, 
  onOpenStrategy, 
  onStartDemo 
}) => {
  const [collapsedSteps, setCollapsedSteps] = useState<Record<number, boolean>>({});
  const [isFocusSectionCollapsed, setIsFocusSectionCollapsed] = useState(false);

  const toggleStep = (step: number) => {
    setCollapsedSteps(prev => ({ ...prev, [step]: !prev[step] }));
  };

  const isStep1Done = priorities.length > 0;
  const isStep2Done = blocks.length > 0 || sessions.length > 0;
  
  const activeStep: 1 | 2 | 3 = !isStep1Done ? 1 : !isStep2Done ? 2 : 3;

  const mainPillars = useMemo(() => priorities.filter(p => p.isPinned), [priorities]);

  const getStepContainerClasses = (step: 1 | 2 | 3) => {
    const isActive = activeStep === step;
    const isCollapsed = collapsedSteps[step];
    const baseClasses = "group relative rounded-[3rem] border transition-all duration-500 flex flex-col bg-white overflow-hidden";
    
    if (isDemoMode) {
      return `${baseClasses} border-slate-100 shadow-sm animate-soft-glow ring-2 ring-indigo-400/50 ${isCollapsed ? 'h-fit' : 'h-full'}`;
    }

    let stateClasses = "border-slate-100 shadow-sm";
    if (step === 1) {
      if (isActive) stateClasses = "border-emerald-100 shadow-[0_32px_64px_-16px_rgba(16,185,129,0.12)] ring-1 ring-emerald-50";
      else stateClasses = "opacity-60 hover:opacity-100";
    } else if (step === 2) {
      if (isActive) stateClasses = "border-indigo-100 shadow-[0_32px_64px_-16px_rgba(79,70,229,0.12)] ring-1 ring-indigo-50";
      else if (!isStep1Done) stateClasses = "bg-slate-50 border-slate-100 opacity-30 cursor-not-allowed grayscale shadow-none";
      else stateClasses = "opacity-60 hover:opacity-100";
    } else if (step === 3) {
      if (isActive) stateClasses = "border-emerald-100 shadow-[0_32px_64px_-16px_rgba(16,185,129,0.12)] ring-1 ring-emerald-50";
      else if (!isStep2Done) stateClasses = "bg-slate-50 border-slate-100 opacity-30 cursor-not-allowed grayscale shadow-none";
      else stateClasses = "opacity-60 hover:opacity-100";
    }
    
    return `${baseClasses} ${stateClasses} ${isCollapsed ? 'h-fit' : 'h-full'}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-10 py-16 flex flex-col h-full overflow-y-auto no-scrollbar animate-in fade-in duration-1000">
      <header className="mb-12 text-left flex justify-between items-end shrink-0">
        <div>
          <h1 className="text-5xl font-light text-slate-900 tracking-tight mb-3">Command Centre</h1>
          <p className="text-slate-400 text-lg font-medium">Align your daily actions with your strategic intent.</p>
        </div>
        <button 
          onClick={onStartDemo}
          disabled={isDemoMode}
          className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm border ${
            isDemoMode 
            ? "bg-emerald-50 text-emerald-600 border-emerald-100 cursor-default" 
            : "bg-indigo-50 text-indigo-600 border-indigo-100 hover:bg-indigo-100"
          }`}
        >
          {isDemoMode ? "Demo Active" : "Try Demo Mode"}
        </button>
      </header>

      {/* WORKFLOW STEPS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 shrink-0 mb-12">
        {/* STEP 1 */}
        <div id="tour-strategy" className={getStepContainerClasses(1)}>
          <div className="p-8 flex flex-col h-full">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl transition-all duration-500 ${(activeStep === 1 || isDemoMode) ? 'bg-emerald-600 text-white shadow-lg' : 'bg-slate-100 text-slate-300'}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg>
                </div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">1. Strategy Hub</h2>
              </div>
              <button onClick={() => toggleStep(1)} className="p-2 text-slate-300 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform duration-500 ${collapsedSteps[1] ? '' : 'rotate-180'}`}><polyline points="6 9 12 15 18 9"></polyline></svg>
              </button>
            </div>

            {!collapsedSteps[1] && (
              <div className="flex flex-col flex-1 animate-in fade-in slide-in-from-top-2 duration-500">
                <p className="text-slate-400 mb-8 leading-relaxed text-sm font-medium">
                  Define your core pillars. These act as high-pass filters for every task that enters your life.
                </p>
                <button onClick={onOpenStrategy} className={`mt-auto w-full py-4 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all ${(activeStep === 1 || isDemoMode) ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-200/40' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}>
                  {(isStep1Done || isDemoMode) ? 'Modify Pillars' : 'Set Priorities'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* STEP 2 */}
        <div id="tour-planning" className={getStepContainerClasses(2)}>
          <div className="p-8 flex flex-col h-full">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl transition-all duration-500 ${(activeStep === 2 || isDemoMode) ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-100 text-slate-300'}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                </div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">2. Planning</h2>
              </div>
              <button onClick={() => toggleStep(2)} className="p-2 text-slate-300 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform duration-500 ${collapsedSteps[2] ? '' : 'rotate-180'}`}><polyline points="6 9 12 15 18 9"></polyline></svg>
              </button>
            </div>

            {!collapsedSteps[2] && (
              <div className="flex flex-col flex-1 animate-in fade-in slide-in-from-top-2 duration-500">
                <p className="text-slate-400 mb-8 leading-relaxed text-sm font-medium">
                  Dump your thoughts, triage against strategy, and claim your time on the calendar.
                </p>
                <button disabled={!isStep1Done && !isDemoMode} onClick={onStartNew} className={`mt-auto w-full py-4 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all ${(activeStep === 2 || isDemoMode) ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200/40' : 'bg-slate-50 text-slate-300'}`}>
                  Start Planning
                </button>
              </div>
            )}
          </div>
        </div>

        {/* STEP 3 */}
        <div id="tour-execution" className={getStepContainerClasses(3)}>
          <div className="p-8 flex flex-col h-full">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl transition-all duration-500 ${(activeStep === 3 || isDemoMode) ? 'bg-emerald-500 text-white shadow-lg' : 'bg-slate-100 text-slate-300'}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" /><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" /><path d="M9 12H4s.55-3.03 2-5c1.62-2.2 5-3 5-3" /><path d="M12 15v5s3.03-.55 5-2c2.2-1.62 3-5 3-5" /></svg>
                </div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">3. Execution</h2>
              </div>
              <button onClick={() => toggleStep(3)} className="p-2 text-slate-300 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform duration-500 ${collapsedSteps[3] ? '' : 'rotate-180'}`}><polyline points="6 9 12 15 18 9"></polyline></svg>
              </button>
            </div>

            {!collapsedSteps[3] && (
              <div className="flex flex-col flex-1 animate-in fade-in slide-in-from-top-2 duration-500">
                <p className="text-slate-400 mb-8 leading-relaxed text-sm font-medium">
                  Enter the focus flow. See only the current task and execute with total clarity.
                </p>
                <button disabled={activeStep !== 3 && !isDemoMode} onClick={onStartExecution} className={`mt-auto w-full py-4 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all ${(activeStep === 3 || isDemoMode) ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-200/40' : 'bg-slate-50 text-slate-300'}`}>
                  Go Live
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* STRATEGIC FOCUS SECTION */}
      <section className="bg-white border border-slate-100 rounded-[3.5rem] p-10 shadow-sm mb-20 overflow-hidden transition-all duration-700">
        <header className="flex justify-between items-center mb-10 shrink-0">
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight leading-none">Strategic Focus</h2>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mt-2">Active Pillar Performance</p>
            </div>
          </div>
          <button 
            onClick={() => setIsFocusSectionCollapsed(!isFocusSectionCollapsed)}
            className="flex items-center gap-3 px-6 py-3 bg-slate-50 hover:bg-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 transition-all"
          >
            {isFocusSectionCollapsed ? "Expand Details" : "Collapse"}
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform duration-500 ${isFocusSectionCollapsed ? '' : 'rotate-180'}`}><polyline points="6 9 12 15 18 9"></polyline></svg>
          </button>
        </header>

        {!isFocusSectionCollapsed && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {mainPillars.length === 0 ? (
              <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-50 rounded-[2.5rem] opacity-40">
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No active pillars defined.</p>
                <button onClick={onOpenStrategy} className="mt-4 text-xs font-black text-indigo-600 uppercase tracking-widest hover:underline">Define Strategy →</button>
              </div>
            ) : (
              mainPillars.map(p => (
                <PillarFocusCard key={p.id} p={p} commitments={commitments} blocks={blocks} />
              ))
            )}
          </div>
        )}
      </section>
    </div>
  );
};

const PillarFocusCard: React.FC<{ p: StrategicPriority, commitments: Commitment[], blocks: CalendarBlock[] }> = ({ p, commitments, blocks }) => {
  const pillarTasks = useMemo(() => {
    const relevantCommitments = commitments.filter(c => c.priorityId === p.id);
    const now = new Date();
    
    return relevantCommitments.map(c => {
      const block = blocks.find(b => b.commitmentId === c.id);
      const isCompleted = block?.status === 'completed' || (block?.endISO && new Date(block.endISO) < now);
      const isCurrent = block?.startISO && block?.endISO && now >= new Date(block.startISO) && now <= new Date(block.endISO);
      
      return { ...c, isCompleted, isCurrent };
    });
  }, [p.id, commitments, blocks]);

  const completedCount = pillarTasks.filter(t => t.isCompleted).length;
  const totalCount = pillarTasks.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm hover:shadow-lg transition-all flex flex-col group h-full">
      <div className="flex justify-between items-start mb-6 shrink-0">
        <div>
          <h3 className="text-lg font-bold text-slate-800 tracking-tight leading-tight mb-1">{p.name}</h3>
          <div className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{totalCount} Active Initiatives</div>
        </div>
        <div className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
        </div>
      </div>

      <div className="flex-1 space-y-3 mb-8 overflow-y-auto no-scrollbar max-h-48">
        {pillarTasks.length === 0 ? (
          <div className="py-6 text-center opacity-20 text-[10px] font-black uppercase tracking-widest">No Active Intent</div>
        ) : (
          pillarTasks.map(task => (
            <div key={task.id} className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${task.isCurrent ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'bg-slate-50 border-slate-100 text-slate-600'}`}>
               <div className={`w-1.5 h-1.5 rounded-full ${task.isCurrent ? 'bg-white animate-pulse' : task.isCompleted ? 'bg-emerald-400' : 'bg-slate-300'}`}></div>
               <span className={`text-[11px] font-bold truncate flex-1 ${task.isCompleted ? 'line-through opacity-50' : ''}`}>{task.title}</span>
            </div>
          ))
        )}
      </div>

      <div className="mt-auto shrink-0">
        <div className="flex justify-between items-center mb-2">
           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Execution Progress</span>
           <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{Math.round(progress)}%</span>
        </div>
        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-indigo-600 rounded-full transition-all duration-1000" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};
