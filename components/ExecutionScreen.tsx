
import React, { useState, useMemo } from "react";
import { CalendarBlock, Commitment, StrategicPriority } from "../types";

interface Props {
  commitments: Commitment[];
  blocks: CalendarBlock[];
  priorities: StrategicPriority[];
  onClose: () => void;
}

export const ExecutionScreen: React.FC<Props> = ({ commitments, blocks, priorities, onClose }) => {
  const [completedBlockIds, setCompletedBlockIds] = useState<Set<string>>(new Set());

  const toggleComplete = (id: string) => {
    setCompletedBlockIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const dayAgenda = useMemo<Record<string, CalendarBlock[]>>(() => {
    const sorted = [...blocks].sort((a, b) => new Date(a.startISO).getTime() - new Date(b.startISO).getTime());
    const grouped: Record<string, CalendarBlock[]> = {};
    sorted.forEach(b => {
      const dateKey = new Date(b.startISO).toDateString();
      if (!grouped[dateKey]) grouped[dateKey] = [];
      grouped[dateKey].push(b);
    });
    return grouped;
  }, [blocks]);

  const totalTasks = blocks.length;
  const completedCount = completedBlockIds.size;
  const progressPercent = totalTasks > 0 ? (completedCount / totalTasks) * 100 : 0;

  return (
    <div className="h-full flex flex-col p-8 bg-slate-50 relative overflow-hidden">
      <header className="mb-10 flex justify-between items-end animate-in fade-in slide-in-from-top-4 duration-700">
        <div>
          <h1 className="text-3xl font-light text-slate-800 mb-1">Execution Mode</h1>
          <p className="text-slate-500 text-sm">Focus only on what you planned.</p>
        </div>
        <div className="flex items-center gap-8">
          <div className="text-right">
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Progress</div>
            <div className="flex items-center gap-3">
              <span className="text-xl font-bold text-emerald-600">{completedCount}/{totalTasks}</span>
              <div className="w-32 h-2 bg-slate-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 transition-all duration-500 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-3 hover:bg-white rounded-2xl text-slate-400 hover:text-slate-600 transition-all border border-transparent hover:border-slate-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-32 max-w-4xl mx-auto w-full">
        {Object.keys(dayAgenda).map((date) => {
          const dayBlocks = dayAgenda[date];
          return (
            <div key={date} className="mb-12">
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-6 flex items-center gap-4">
                {date}
                <div className="h-px flex-1 bg-slate-200/50"></div>
              </h2>
              
              <div className="space-y-4">
                {dayBlocks.map(block => {
                  const commitment = commitments.find(c => c.id === block.commitmentId);
                  const priority = priorities.find(p => p.id === commitment?.priorityId);
                  const isCompleted = completedBlockIds.has(block.id);
                  const start = new Date(block.startISO);
                  const end = new Date(block.endISO);

                  return (
                    <div 
                      key={block.id}
                      className={`bg-white rounded-[2rem] border transition-all p-6 flex items-center gap-6 group cursor-pointer ${isCompleted ? 'border-emerald-100 bg-emerald-50/20 opacity-60' : 'border-slate-100 shadow-sm hover:shadow-xl hover:border-indigo-100'}`}
                      onClick={() => toggleComplete(block.id)}
                    >
                      <button 
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all border-2 shrink-0 ${isCompleted ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-200 text-transparent group-hover:border-indigo-500'}`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      </button>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className={`text-lg font-bold leading-tight truncate ${isCompleted ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                            {commitment?.title}
                          </h3>
                          {priority && (
                            <span className="text-[9px] font-black uppercase tracking-widest text-indigo-400 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100/50">
                              {priority.name}
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest tabular-nums">
                          {start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} – {end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          <span className="mx-2">•</span>
                          {(end.getTime() - start.getTime()) / 60000} Minutes
                        </div>
                      </div>

                      <div className={`p-3 rounded-2xl transition-all ${isCompleted ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-50 text-slate-300 opacity-0 group-hover:opacity-100'}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {blocks.length === 0 && (
          <div className="py-20 text-center opacity-30">
            <p className="text-xl font-light italic">No tasks planned yet.</p>
          </div>
        )}
      </div>

      <div className="fixed bottom-12 right-12 z-50">
        <button
          onClick={onClose}
          className="flex items-center gap-4 bg-slate-900 hover:bg-black text-white px-8 py-5 rounded-[2rem] font-bold text-lg shadow-2xl transition-all transform hover:-translate-y-1 active:scale-95 group"
        >
          <span>End Session</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </button>
      </div>
    </div>
  );
};
