
import React, { useState } from "react";
import { Commitment, StrategicPriority } from "../types";

interface Props {
  commitments: Commitment[];
  priorities: StrategicPriority[];
  onUpdateCommitments: (commitments: Commitment[]) => void;
  onFinish: () => void;
}

export const DurationScreen: React.FC<Props> = ({ commitments, priorities, onUpdateCommitments, onFinish }) => {
  const [activeCustomId, setActiveCustomId] = useState<string | null>(null);
  const [customVal, setCustomVal] = useState<string>("");

  const updateDuration = (id: string, minutes: number) => {
    const updated = commitments.map(c => 
      c.id === id ? { ...c, durationMinutes: minutes } : c
    );
    onUpdateCommitments(updated);
    setActiveCustomId(null);
    setCustomVal("");
  };

  const startCustom = (id: string, current: number) => {
    setActiveCustomId(id);
    setCustomVal(current > 0 ? current.toString() : "");
  };

  const handleCustomSubmit = (id: string) => {
    const mins = parseInt(customVal);
    if (!isNaN(mins) && mins > 0) {
      updateDuration(id, mins);
    } else {
      setActiveCustomId(null);
    }
  };

  const options = [
    { label: "15m", val: 15 },
    { label: "30m", val: 30 },
    { label: "1h", val: 60 },
    { label: "2h", val: 120 },
  ];

  return (
    <div className="h-full flex flex-col p-8 relative overflow-hidden bg-slate-50">
      <header className="mb-10 animate-in fade-in slide-in-from-top-4 duration-700 text-center lg:text-left">
        <h1 className="text-3xl font-light text-slate-800">Estimate Effort</h1>
        <p className="text-slate-500 mt-2">
          Precision scheduling requires realistic time estimates.
        </p>
      </header>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-32">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {priorities.map(priority => {
            const priorityCommitments = commitments.filter(c => c.priorityId === priority.id);
            if (priorityCommitments.length === 0) return null;

            return (
              <div key={priority.id} className="bg-white rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-100/50 p-8 flex flex-col gap-6 animate-in fade-in zoom-in-95">
                <header className="flex items-center gap-3 border-b border-slate-50 pb-4">
                  <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-sm shadow-indigo-100"></div>
                  <h3 className="text-sm font-black uppercase tracking-widest text-slate-800">{priority.name}</h3>
                </header>

                <div className="space-y-8">
                  {priorityCommitments.map(c => (
                    <div key={c.id} className="group flex flex-col gap-4">
                      <div className="flex justify-between items-start">
                         <h4 className="text-sm font-bold text-slate-700 leading-tight flex-1 pr-4">{c.title}</h4>
                         <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg transition-all ${c.durationMinutes > 0 ? 'bg-indigo-600 text-white' : 'bg-amber-50 text-amber-600 animate-pulse'}`}>
                           {c.durationMinutes > 0 ? `${c.durationMinutes}m` : "Required"}
                         </span>
                      </div>
                      
                      {activeCustomId === c.id ? (
                        <div className="flex gap-2 animate-in slide-in-from-left-2 duration-300">
                           <input 
                             autoFocus
                             className="flex-1 bg-slate-50 border border-indigo-200 rounded-xl px-4 py-2 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-100"
                             placeholder="Minutes..."
                             value={customVal}
                             onChange={(e) => setCustomVal(e.target.value)}
                             onKeyDown={(e) => e.key === 'Enter' && handleCustomSubmit(c.id)}
                           />
                           <button onClick={() => handleCustomSubmit(c.id)} className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-[10px] font-bold uppercase">Set</button>
                           <button onClick={() => setActiveCustomId(null)} className="text-slate-400 px-2 text-[10px] font-bold uppercase">Cancel</button>
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {options.map(opt => (
                            <button
                              key={opt.val}
                              onClick={() => updateDuration(c.id, opt.val)}
                              className={`px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${c.durationMinutes === opt.val ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-slate-50 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600'}`}
                            >
                              {opt.label}
                            </button>
                          ))}
                          <button
                            onClick={() => startCustom(c.id, c.durationMinutes)}
                            className="px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white transition-all"
                          >
                            Custom
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="fixed bottom-12 right-12 z-50 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <button
          onClick={onFinish}
          disabled={commitments.some(c => c.durationMinutes <= 0)}
          className={`flex items-center gap-4 px-8 py-5 rounded-2xl font-bold text-lg shadow-2xl transition-all transform hover:-translate-y-1 hover:scale-105 active:scale-95 group ${commitments.some(c => c.durationMinutes <= 0) ? 'bg-slate-300 text-slate-50 shadow-none cursor-not-allowed opacity-50' : 'bg-indigo-600 text-white shadow-indigo-200 hover:bg-indigo-700'}`}
        >
          <span className="tracking-tight">Move to Calendar</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </button>
      </div>
    </div>
  );
};
