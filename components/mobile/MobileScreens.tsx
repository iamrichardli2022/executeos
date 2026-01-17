
import React, { useState, useRef, useMemo, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Screen } from '../../App';
import { StrategicPriority, CaptureItem, Commitment, CalendarBlock, ExecutionSession } from '../../types';

// SHARED MOBILE HEADER
const MobileHeader = ({ title, subtitle }: { title: string, subtitle?: string }) => (
  <header className="px-6 pt-8 pb-4 shrink-0">
    <h1 className="text-2xl font-black text-slate-900 tracking-tight">{title}</h1>
    {subtitle && <p className="text-xs font-medium text-slate-400 mt-1">{subtitle}</p>}
  </header>
);

// 1. MOBILE HOME
export const MobileHomeScreen = ({ onStartNew, onStartDemo, isDemoMode, onExitDemo, sessions }: any) => {
  return (
    <div className="h-full overflow-y-auto no-scrollbar pb-24 flex flex-col">
      <div className="p-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
           <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
           </div>
           <span className="font-black text-xl tracking-tighter">TaskOS</span>
        </div>
        <button onClick={isDemoMode ? onExitDemo : onStartDemo} className="bg-slate-50 text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-xl border border-slate-100">
           {isDemoMode ? "Exit Demo" : "Try Demo"}
        </button>
      </div>

      <MobileHeader title="Ready to align?" subtitle="Master your strategic intent today." />

      <div className="px-6 mt-4 space-y-4">
        <button onClick={onStartNew} className="w-full p-8 bg-indigo-600 text-white rounded-[2.5rem] shadow-xl shadow-indigo-100 flex flex-col items-start gap-4 active:scale-[0.98] transition-all">
           <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
           </div>
           <div className="text-left">
             <div className="text-lg font-bold">New Plan</div>
             <div className="text-xs opacity-60">Dump thoughts & schedule.</div>
           </div>
        </button>

        <div className="grid grid-cols-2 gap-4">
           <div className="p-6 bg-white border border-slate-100 rounded-[2rem] flex flex-col gap-3">
              <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Efficiency</div>
              <div className="text-2xl font-bold">92%</div>
           </div>
           <div className="p-6 bg-white border border-slate-100 rounded-[2rem] flex flex-col gap-3">
              <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Sessions</div>
              <div className="text-2xl font-bold">{sessions.length}</div>
           </div>
        </div>

        <div className="pt-6">
           <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 px-2">Recent Sessions</h2>
           <div className="space-y-3">
              {sessions.length === 0 ? (
                <div className="py-10 text-center opacity-30 text-xs font-bold uppercase tracking-widest">No history yet</div>
              ) : (
                sessions.slice(0, 3).map((s: any) => (
                  <div key={s.id} className="bg-white p-5 rounded-[1.5rem] border border-slate-100 flex justify-between items-center">
                    <div>
                       <div className="text-sm font-bold">{new Date(s.timestampISO).toLocaleDateString()}</div>
                       <div className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">{s.blocks.length} Tasks Scheduled</div>
                    </div>
                    <div className="text-emerald-500 font-black text-xs">{s.alignmentScore.toFixed(0)}%</div>
                  </div>
                ))
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

// 2. MOBILE BRAIN DUMP
export const MobileDumpScreen = ({ onNext }: any) => {
  const [tasks, setTasks] = useState<string[]>([""]);
  const inputRef = useRef<HTMLInputElement>(null);

  const addTask = () => setTasks(["", ...tasks]);
  
  const updateTask = (i: number, v: string) => {
    const next = [...tasks];
    next[i] = v;
    setTasks(next);
  };

  const removeTask = (i: number) => {
    setTasks(tasks.filter((_, idx) => idx !== i));
  };

  const handleProcess = () => {
    const valid = tasks.filter(t => t.trim().length > 0);
    if (valid.length === 0) return;
    onNext(valid.map(t => ({ id: uuidv4(), rawText: t, createdAt: new Date().toISOString(), status: "inbox" })));
  };

  return (
    <div className="h-full flex flex-col bg-white">
      <MobileHeader title="Brain Dump" subtitle="Everything out of your head." />
      
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 no-scrollbar">
        <button onClick={addTask} className="w-full py-4 border-2 border-dashed border-slate-100 rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-300 flex items-center justify-center gap-2 active:bg-slate-50">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Add Thought
        </button>

        {tasks.map((t, i) => (
          <div key={i} className="flex gap-2">
            <input 
              autoFocus={i === 0 && t === ""}
              className="flex-1 bg-slate-50 border border-transparent rounded-2xl px-5 py-4 text-sm font-bold text-slate-800 focus:bg-white focus:border-indigo-100 outline-none transition-all"
              placeholder="E.g. Call marketing team..."
              value={t}
              onChange={(e) => updateTask(i, e.target.value)}
            />
            <button onClick={() => removeTask(i)} className="p-4 text-slate-200"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="12"></line></svg></button>
          </div>
        ))}
      </div>

      <div className="p-6 shrink-0">
        <button onClick={handleProcess} className="w-full bg-slate-900 text-white py-5 rounded-[2rem] font-black uppercase tracking-widest text-xs active:scale-95 transition-all shadow-xl shadow-slate-200">
          Map to Priorities
        </button>
      </div>
    </div>
  );
};

// 3. MOBILE SORT / TRIAGE (Redesigned for touch)
export const MobileSortScreen = ({ items, priorities, onUpdateItems, onUpdateCommitments, setCurrentScreen }: any) => {
  const inbox = items.filter((i: any) => i.status === "inbox");
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentItem = inbox[currentIndex];

  const handleTriage = (priorityId: string | "discard") => {
    if (!currentItem) return;

    const updatedItems = items.map((i: any) => 
      i.id === currentItem.id 
        ? { ...i, status: (priorityId === "discard" ? "discarded" : "triaged") } 
        : i
    );
    onUpdateItems(updatedItems);

    if (priorityId !== "discard") {
      onUpdateCommitments((prev: any) => [...prev, {
        id: uuidv4(),
        captureItemId: currentItem.id,
        type: "task",
        title: currentItem.rawText,
        priorityId,
        durationMinutes: 30,
        energy: "medium"
      }]);
    }

    if (currentIndex >= inbox.length - 1) {
      setCurrentScreen("duration");
    }
  };

  if (!currentItem) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-10 text-center">
        <div className="w-20 h-20 bg-emerald-50 rounded-[2.5rem] flex items-center justify-center text-emerald-600 mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
        </div>
        <h2 className="text-xl font-bold">Clear Skies</h2>
        <p className="text-slate-400 text-sm mt-2">All thoughts triaged.</p>
        <button onClick={() => setCurrentScreen("duration")} className="mt-8 bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold">Next Stage</button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-slate-50 overflow-hidden">
      <MobileHeader title="Triage" subtitle={`${currentIndex + 1} of ${inbox.length} Items`} />
      
      <div className="px-6 flex-1 flex flex-col justify-center gap-8">
        {/* The Card to Sort */}
        <div className="bg-white p-10 rounded-[3rem] shadow-2xl shadow-indigo-100/50 border border-indigo-50 flex flex-col items-center text-center animate-in zoom-in-95 duration-500">
           <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-4">Assign Intent</span>
           <h3 className="text-xl font-bold text-slate-800 leading-relaxed">{currentItem.rawText}</h3>
        </div>

        {/* The Buckets */}
        <div className="grid grid-cols-2 gap-3">
          {priorities.map((p: any) => (
            <button key={p.id} onClick={() => handleTriage(p.id)} className="bg-white border border-slate-100 p-5 rounded-[1.5rem] flex flex-col items-center gap-2 active:bg-indigo-50 active:border-indigo-100 transition-all">
               <div className="w-2 h-2 rounded-full bg-indigo-400"></div>
               <span className="text-xs font-bold truncate w-full text-center">{p.name}</span>
            </button>
          ))}
          <button onClick={() => handleTriage("discard")} className="bg-red-50 text-red-500 border border-red-100 p-5 rounded-[1.5rem] flex flex-col items-center gap-2 active:bg-red-100 transition-all">
             <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
             <span className="text-xs font-bold uppercase tracking-widest text-[9px]">Discard</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// 4. MOBILE DURATION
export const MobileDurationScreen = ({ commitments, onUpdateCommitments, setCurrentScreen }: any) => {
  const [activeIdx, setActiveIdx] = useState(0);
  const current = commitments[activeIdx];

  const setDuration = (mins: number) => {
    const next = [...commitments];
    next[activeIdx] = { ...current, durationMinutes: mins };
    onUpdateCommitments(next);
    
    if (activeIdx < commitments.length - 1) {
      setActiveIdx(activeIdx + 1);
    } else {
      setCurrentScreen("plan");
    }
  };

  if (!current) return null;

  return (
    <div className="h-full flex flex-col bg-white">
      <MobileHeader title="Effort Analysis" subtitle={`${activeIdx + 1} / ${commitments.length}`} />
      
      <div className="flex-1 flex flex-col items-center justify-center p-10 text-center gap-10">
        <div className="space-y-2">
          <h3 className="text-2xl font-bold text-slate-800">{current.title}</h3>
          <p className="text-xs text-slate-400">How long will this take?</p>
        </div>

        <div className="grid grid-cols-2 w-full gap-4">
          {[15, 30, 60, 90, 120, 180].map(m => (
            <button key={m} onClick={() => setDuration(m)} className="bg-slate-50 hover:bg-indigo-50 border border-slate-100 rounded-3xl py-6 font-bold text-lg active:scale-95 transition-all">
              {m < 60 ? `${m}m` : `${m/60}h`}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// 5. MOBILE PLAN (Vertical Day/Timeline)
export const MobilePlanScreen = ({ commitments, blocks, setCurrentScreen }: any) => {
  const [selectedCommitmentId, setSelectedCommitmentId] = useState<string | null>(null);
  const unscheduled = commitments.filter((c: any) => !blocks.find((b: any) => b.commitmentId === c.id));
  
  // Logic simplified for mobile: automatically schedules at the next available slot today
  const scheduleNext = (c: any) => {
    const now = new Date();
    now.setMinutes(Math.ceil(now.getMinutes() / 30) * 30, 0, 0);
    const start = new Date(now.getTime() + (blocks.length * 30 * 60000));
    const end = new Date(start.getTime() + c.durationMinutes * 60000);

    const newBlock: CalendarBlock = {
      id: uuidv4(),
      commitmentId: c.id,
      googleEventId: "",
      calendarId: "local",
      startISO: start.toISOString(),
      endISO: end.toISOString(),
      status: "planned",
      lastSyncedAtISO: new Date().toISOString()
    };

    const existing = JSON.parse(localStorage.getItem("ps_calendar_blocks") || "[]");
    localStorage.setItem("ps_calendar_blocks", JSON.stringify([...existing, newBlock]));
    // Forcing a re-render by calling setCurrentScreen('plan') is a hack, usually use state but for this context:
    window.location.reload(); 
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 overflow-hidden">
      <MobileHeader title="Claim Time" subtitle="Assign slots to items." />
      
      <div className="flex-1 overflow-y-auto px-6 space-y-3 no-scrollbar pb-10">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-2 px-2">Unscheduled</h3>
        {unscheduled.length === 0 ? (
          <div className="bg-emerald-50 p-6 rounded-[2rem] text-center border border-emerald-100">
             <p className="text-emerald-600 font-bold text-sm">Full Alignment Achieved</p>
          </div>
        ) : (
          unscheduled.map((c: any) => (
            <div key={c.id} onClick={() => scheduleNext(c)} className="bg-white p-5 rounded-3xl border border-slate-100 flex justify-between items-center active:scale-95 transition-all">
              <span className="text-sm font-bold text-slate-700">{c.title}</span>
              <span className="text-[10px] font-black bg-indigo-50 text-indigo-500 px-3 py-1 rounded-full">{c.durationMinutes}m</span>
            </div>
          ))
        )}

        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-6 px-2">Agenda</h3>
        {blocks.length === 0 ? (
          <p className="p-6 text-center text-slate-300 italic text-sm">No items scheduled yet.</p>
        ) : (
          blocks.map((b: any) => {
            const c = commitments.find((comp: any) => comp.id === b.commitmentId);
            return (
              <div key={b.id} className="bg-white p-5 rounded-3xl border-l-4 border-l-indigo-600 border border-slate-100 flex justify-between items-center">
                <div>
                  <div className="text-sm font-bold text-slate-800">{c?.title}</div>
                  <div className="text-[9px] font-black text-slate-400 uppercase mt-1">
                    {new Date(b.startISO).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="p-6 shrink-0 bg-white border-t border-slate-100">
        <button onClick={() => setCurrentScreen("summary")} className="w-full bg-indigo-600 text-white py-5 rounded-[2rem] font-black uppercase tracking-widest text-xs">
          Final Review
        </button>
      </div>
    </div>
  );
};

// 6. MOBILE REVIEW
export const MobileReviewScreen = ({ onSaveSession, setCurrentScreen }: any) => {
  return (
    <div className="h-full flex flex-col bg-white">
      <MobileHeader title="Session Recap" subtitle="One final check before logging." />
      
      <div className="flex-1 flex flex-col items-center justify-center p-10 text-center">
         <div className="w-32 h-32 bg-indigo-600 rounded-full flex items-center justify-center shadow-2xl shadow-indigo-200 mb-8 relative">
            <div className="absolute inset-0 rounded-full border-4 border-white/20 animate-ping"></div>
            <span className="text-3xl font-black text-white">92%</span>
         </div>
         <h2 className="text-xl font-bold">Strategic Match</h2>
         <p className="text-slate-400 text-sm mt-2 px-10">Your scheduled tasks align perfectly with your Growth and Business pillars.</p>
      </div>

      <div className="p-6 space-y-3">
        <button onClick={() => onSaveSession(92)} className="w-full bg-emerald-600 text-white py-5 rounded-[2rem] font-black uppercase tracking-widest text-xs active:scale-95 transition-all">
          Commit to Today
        </button>
        <button onClick={() => setCurrentScreen("home")} className="w-full bg-slate-50 text-slate-400 py-5 rounded-[2rem] font-black uppercase tracking-widest text-xs">
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

// 7. MOBILE EXECUTION
export const MobileExecutionScreen = ({ commitments, blocks, onClose }: any) => {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const currentBlock = blocks.find((b: any) => {
    const s = new Date(b.startISO);
    const e = new Date(b.endISO);
    return now >= s && now <= e;
  });

  const c = commitments.find((comp: any) => comp.id === currentBlock?.commitmentId);

  const formatRemaining = (endISO: string) => {
    const diff = new Date(endISO).getTime() - now.getTime();
    if (diff <= 0) return "00:00";
    const mins = Math.floor(diff / 60000);
    const secs = Math.floor((diff % 60000) / 1000);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 text-white">
      <div className="p-6 flex justify-between items-center">
         <button onClick={onClose} className="p-2 text-slate-400"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg></button>
         <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500">Live Focus</span>
         <div className="w-6"></div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-10 text-center gap-12">
        {currentBlock ? (
          <>
            <div className="space-y-4">
              <h2 className="text-3xl font-bold tracking-tight">{c?.title}</h2>
              <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Current Objective</div>
            </div>
            
            <div className="text-8xl font-black tabular-nums tracking-tighter">
              {formatRemaining(currentBlock.endISO)}
            </div>

            <button className="bg-white text-black px-12 py-5 rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-2xl shadow-white/10 active:scale-95 transition-all">
              Mark Complete
            </button>
          </>
        ) : (
          <div className="space-y-4">
             <h2 className="text-2xl font-bold text-slate-500">No active tasks.</h2>
             <p className="text-slate-600 text-sm">Enjoy the quiet or schedule a session.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// 8. MOBILE STRATEGY
export const MobileStrategyScreen = ({ priorities, onAddPriority }: any) => {
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState("");

  const handleAdd = () => {
    if(!name) return;
    onAddPriority({
      id: uuidv4(),
      name,
      description: "Added on mobile.",
      weight: 50,
      isPinned: true
    });
    setName("");
    setIsAdding(false);
  };

  return (
    <div className="h-full flex flex-col bg-white">
      <MobileHeader title="Strategy Hub" subtitle="Define what matters." />
      
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 no-scrollbar">
        {isAdding ? (
          <div className="bg-slate-50 p-6 rounded-3xl space-y-4 animate-in fade-in slide-in-from-top-4">
             <input 
               autoFocus
               className="w-full bg-white border border-slate-100 rounded-2xl p-5 font-bold text-sm outline-none focus:border-indigo-200"
               placeholder="Pillar name..."
               value={name}
               onChange={e => setName(e.target.value)}
             />
             <div className="flex gap-2">
                <button onClick={handleAdd} className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-bold text-xs">Add Pillar</button>
                <button onClick={() => setIsAdding(false)} className="flex-1 bg-white border border-slate-200 text-slate-400 py-4 rounded-2xl font-bold text-xs">Cancel</button>
             </div>
          </div>
        ) : (
          <button onClick={() => setIsAdding(true)} className="w-full py-4 border-2 border-dashed border-slate-100 rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-300 flex items-center justify-center gap-2">
            + Add Pillar
          </button>
        )}

        {priorities.map((p: any) => (
          <div key={p.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 flex items-center justify-between">
            <div>
               <div className="font-bold text-slate-800">{p.name}</div>
               <div className="text-[9px] text-slate-400 uppercase font-black tracking-widest mt-1">Active Pillar</div>
            </div>
            <div className={`w-3 h-3 rounded-full ${p.isPinned ? 'bg-emerald-500' : 'bg-slate-200'}`}></div>
          </div>
        ))}
      </div>
    </div>
  );
};
