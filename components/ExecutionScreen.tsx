
import React, { useState, useEffect, useMemo } from "react";
import { CalendarBlock, Commitment, StrategicPriority, ExecutionSession } from "../types";
import { StorageService } from "../services/storage";

interface Props {
  commitments: Commitment[];
  blocks: CalendarBlock[];
  priorities: StrategicPriority[];
  onClose: () => void;
}

export const ExecutionScreen: React.FC<Props> = ({ commitments, blocks, priorities, onClose }) => {
  const [now, setNow] = useState(new Date());
  const [completedBlockIds, setCompletedBlockIds] = useState<Set<string>>(new Set());
  const [sessions, setSessions] = useState<ExecutionSession[]>([]);

  useEffect(() => {
    setSessions(StorageService.getSessions());
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleComplete = (id: string) => {
    setCompletedBlockIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const sortedBlocks = useMemo(() => {
    return [...blocks].sort((a, b) => new Date(a.startISO).getTime() - new Date(b.startISO).getTime());
  }, [blocks]);

  const currentBlock = useMemo(() => {
    return sortedBlocks.find(b => {
      const start = new Date(b.startISO);
      const end = new Date(b.endISO);
      return now >= start && now <= end;
    });
  }, [sortedBlocks, now]);

  const currentCommitment = currentBlock ? commitments.find(c => c.id === currentBlock.commitmentId) : null;
  const currentPriority = currentCommitment ? priorities.find(p => p.id === currentCommitment.priorityId) : null;

  const totalTasks = blocks.length;
  const completedCount = completedBlockIds.size;
  const progressPercent = totalTasks > 0 ? (completedCount / totalTasks) * 100 : 0;

  const formatRemaining = (endISO: string) => {
    const diff = new Date(endISO).getTime() - now.getTime();
    if (diff <= 0) return "00:00";
    const mins = Math.floor(diff / 60000);
    const secs = Math.floor((diff % 60000) / 1000);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-full flex flex-col bg-[#F8FAFC] relative overflow-hidden">
      <nav className="px-10 py-5 flex justify-between items-center bg-white border-b border-slate-100 z-50 shadow-sm shrink-0">
        <div className="flex items-center gap-6">
          <button 
            onClick={onClose} 
            className="p-2.5 hover:bg-slate-50 rounded-2xl text-slate-400 hover:text-slate-900 transition-all border border-transparent hover:border-slate-100"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-indigo-600 block mb-0.5">Focus Mode</span>
            <span className="text-lg font-bold text-slate-900 tabular-nums">
              {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          </div>
        </div>

        <div id="tour-exec-progress" className="flex items-center gap-8 bg-white p-2 rounded-2xl">
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Daily Trajectory</span>
              <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">{Math.round(progressPercent)}%</span>
            </div>
            <div className="w-56 h-2 bg-slate-100 rounded-full overflow-hidden shadow-inner">
              <div className="h-full bg-indigo-600 transition-all duration-1000 ease-out shadow-[0_0_12px_rgba(79,70,229,0.3)]" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>
          <div className="h-10 w-px bg-slate-100 hidden md:block"></div>
          <div className="text-right hidden md:block">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Session Volume</span>
            <span className="text-sm font-bold text-slate-900">{completedCount} / {totalTasks} Tasks</span>
          </div>
        </div>
      </nav>

      <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
        <aside id="tour-exec-list" className="lg:w-[38%] flex flex-col bg-white border-r border-slate-100 overflow-hidden">
          <header className="px-10 py-8 border-b border-slate-50 shrink-0">
             <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 flex items-center gap-3">
                Timeline
                <div className="h-px flex-1 bg-slate-100"></div>
             </h3>
          </header>
          
          <div className="flex-1 overflow-y-auto px-10 py-6 space-y-4 no-scrollbar relative">
            <div className="absolute left-[54px] top-6 bottom-6 w-px bg-slate-100 z-0"></div>
            {sortedBlocks.map((block) => {
              const commitment = commitments.find(c => c.id === block.commitmentId);
              const priority = priorities.find(p => p.id === commitment?.priorityId);
              const isDone = completedBlockIds.has(block.id);
              const isActive = currentBlock?.id === block.id;
              const startTime = new Date(block.startISO);

              return (
                <div key={block.id} onClick={() => toggleComplete(block.id)} className={`relative flex gap-8 p-4 rounded-3xl transition-all cursor-pointer group z-10 ${isActive ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100 -translate-x-1' : isDone ? 'opacity-40 grayscale hover:opacity-70' : 'hover:bg-slate-50 border border-transparent hover:border-slate-100'}`}>
                  <div className="w-14 shrink-0 flex flex-col items-center pt-1">
                    <span className={`text-[10px] font-black tabular-nums ${isActive ? 'text-indigo-100' : 'text-slate-400'}`}>
                      {startTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }).split(' ')[0]}
                    </span>
                    <div className={`w-3 h-3 rounded-full border-2 mt-2 shadow-sm transition-all ${isDone ? 'bg-emerald-500 border-emerald-500' : isActive ? 'bg-white border-indigo-400' : 'bg-white border-slate-200 group-hover:border-indigo-400'}`}></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex flex-col min-w-0">
                        <span className={`text-sm font-bold truncate ${isActive ? 'text-white' : 'text-slate-800'}`}>{commitment?.title}</span>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className={`text-[9px] font-black uppercase tracking-widest ${isActive ? 'text-indigo-200' : 'text-slate-400'}`}>{priority?.name || "General"}</span>
                        </div>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isDone ? 'bg-emerald-500 border-emerald-500 text-white' : isActive ? 'border-indigo-400 text-white/20' : 'border-slate-100 text-transparent'}`}>
                         <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

        <main className="flex-1 flex flex-col bg-white relative overflow-hidden">
          <div className="flex-1 flex items-center justify-center p-12 relative z-10">
            {currentBlock ? (
              <div id="tour-exec-timer" className="max-w-2xl w-full bg-white p-12 rounded-[3.5rem] text-center animate-in fade-in zoom-in-95 duration-700 shadow-2xl shadow-indigo-100/50 border border-slate-50">
                <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100 mb-10 shadow-sm">
                  <span className="text-[11px] font-black uppercase tracking-[0.2em]">Executing Strategic Intent</span>
                </div>
                <h2 className="text-5xl font-light text-slate-900 tracking-tighter leading-[1.1] mb-6">{currentCommitment?.title}</h2>
                <div className="flex flex-col items-center gap-4 mb-16">
                  <div className="text-8xl font-black text-slate-900 tracking-tighter tabular-nums">{formatRemaining(currentBlock.endISO)}</div>
                  <div className="text-[10px] font-black text-slate-300 uppercase tracking-[0.5em] ml-2">Time Remaining</div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button onClick={() => toggleComplete(currentBlock.id)} className={`flex items-center justify-center gap-3 py-6 rounded-[2rem] font-black text-xs uppercase tracking-widest transition-all ${completedBlockIds.has(currentBlock.id) ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-100' : 'bg-slate-900 text-white shadow-2xl shadow-slate-200'}`}>
                    {completedBlockIds.has(currentBlock.id) ? "Marked as Done" : "Mark as Complete"}
                  </button>
                  <button onClick={onClose} className="flex items-center justify-center gap-3 py-6 rounded-[2rem] bg-white border border-slate-200 text-slate-400 font-black text-xs uppercase tracking-widest hover:bg-slate-50">Take a Break</button>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <h3 className="text-3xl font-light text-slate-400 tracking-tight">System in Stasis</h3>
                <button onClick={onClose} className="mt-12 text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 px-8 py-4 rounded-2xl">Return to Dashboard</button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};
