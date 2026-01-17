
import React, { useState, useRef, useEffect, useMemo } from "react";
import { StrategicPriority, Commitment, CalendarBlock } from "../types";
import { v4 as uuidv4 } from 'uuid';

interface Props {
  onComplete: (priorities: StrategicPriority[]) => void;
  initialPriorities: StrategicPriority[];
  commitments?: Commitment[];
  blocks?: CalendarBlock[];
}

interface PriorityCardProps {
  p: StrategicPriority;
  commitments: Commitment[];
  blocks: CalendarBlock[];
  onEdit: (p: StrategicPriority) => void;
  onRemove: (id: string) => void;
  onTogglePin: (id: string) => void;
  onDragStart: (e: React.DragEvent, id: string) => void;
  isMain?: boolean;
}

export const OnboardingScreen: React.FC<Props> = ({ onComplete, initialPriorities, commitments = [], blocks = [] }) => {
  const [priorities, setPriorities] = useState<StrategicPriority[]>(initialPriorities);
  const [isAddingMode, setIsAddingMode] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [draggedPriorityId, setDraggedPriorityId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isAddingMode && inputRef.current) {
      const timeout = setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [isAddingMode]);

  const handleRemove = (id: string) => {
    if (confirm("Are you sure you want to remove this priority?")) {
      setPriorities(priorities.filter(p => p.id !== id));
    }
  };

  const togglePin = (id: string) => {
    setPriorities(priorities.map(p => 
      p.id === id ? { ...p, isPinned: !p.isPinned } : p
    ));
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedPriorityId(id);
    e.dataTransfer.setData("priorityId", id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (targetPinned: boolean) => {
    if (!draggedPriorityId) return;
    setPriorities(prev => prev.map(p => 
      p.id === draggedPriorityId ? { ...p, isPinned: targetPinned } : p
    ));
    setDraggedPriorityId(null);
  };

  const startAdding = () => {
    setEditingId(null);
    setFormData({ name: "", description: "" });
    setIsAddingMode(true);
  };

  const startEditing = (priority: StrategicPriority) => {
    setEditingId(priority.id);
    setFormData({ name: priority.name, description: priority.description });
    setIsAddingMode(true);
  };

  const savePriority = (stayInMode: boolean = false) => {
    const isFormValid = formData.name.trim().length > 0;

    if (!stayInMode && !isFormValid) {
      setIsAddingMode(false);
      setFormData({ name: "", description: "" });
      setEditingId(null);
      return;
    }

    if (!isFormValid) return;

    if (editingId) {
      setPriorities(priorities.map(p => 
        p.id === editingId 
          ? { ...p, name: formData.name, description: formData.description } 
          : p
      ));
    } else {
      const newP: StrategicPriority = {
        id: uuidv4(),
        name: formData.name,
        weight: 50,
        description: formData.description || "Define what this priority means to you.",
        examples: [],
        antiExamples: [],
        isPinned: true 
      };
      setPriorities([...priorities, newP]);
    }

    if (stayInMode) {
      setFormData({ name: "", description: "" });
      setEditingId(null);
      inputRef.current?.focus();
    } else {
      setFormData({ name: "", description: "" });
      setEditingId(null);
      setIsAddingMode(false);
    }
  };

  const mainFocusItems = priorities.filter(p => p.isPinned);
  const pipelineItems = priorities.filter(p => !p.isPinned);
  const isReady = priorities.length > 0;

  return (
    <div className="h-full flex flex-col max-w-[1600px] mx-auto px-8 py-8 overflow-hidden relative">
      <header className="shrink-0 flex flex-col md:flex-row justify-between items-center mb-10 gap-6 animate-in fade-in slide-in-from-top-4 duration-700">
        <div className="text-center md:text-left">
          <h1 className="text-4xl font-black text-slate-900 mb-1 tracking-tight">Strategic Dashboard</h1>
          <p className="text-slate-500 max-w-md leading-relaxed text-sm">
            Monitor your pillars and track tasks that align with your core focus.
          </p>
        </div>
        {!isAddingMode && (
          <button 
            id="tour-strategy-add"
            onClick={startAdding}
            className="bg-indigo-600 text-white px-8 py-4 rounded-[2rem] font-black text-sm hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center gap-2 group transform hover:-translate-y-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            Create New Pillar
          </button>
        )}
      </header>

      <div className="flex-1 min-h-0 relative">
        {isAddingMode ? (
          <div className="h-full flex items-center justify-center animate-in fade-in zoom-in-95 duration-500">
            <div className="w-full max-w-2xl">
              <div className="text-center mb-10">
                <span className="text-indigo-600 font-black text-[10px] uppercase tracking-[0.25em] mb-3 block">Pillar Architect</span>
                <h2 className="text-4xl font-black text-slate-900">
                  {editingId ? "Refine Intent" : "Define New Pillar"}
                </h2>
              </div>
              <form onSubmit={(e) => { e.preventDefault(); savePriority(false); }} className="bg-white p-12 rounded-[3.5rem] shadow-2xl shadow-indigo-100/30 border border-indigo-50 space-y-8">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Label</label>
                  <input 
                    ref={inputRef}
                    className="w-full text-3xl font-bold bg-slate-50 border border-slate-100 rounded-[1.5rem] p-6 focus:bg-white focus:ring-8 focus:ring-indigo-50/50 focus:border-indigo-200 outline-none transition-all placeholder:text-slate-200"
                    placeholder="e.g. Scaling Business..."
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Strategic Context</label>
                  <textarea 
                    className="w-full text-lg font-medium bg-slate-50 border border-slate-100 rounded-[1.5rem] p-6 focus:bg-white focus:ring-8 focus:ring-indigo-50/50 focus:border-indigo-200 outline-none transition-all placeholder:text-slate-200 h-32 resize-none"
                    placeholder="Why does this deserve your best time right now?"
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                  />
                </div>

                <div className="flex flex-col gap-4 pt-4">
                  <div className="flex gap-4">
                    <button 
                      type="button"
                      onClick={() => savePriority(true)}
                      disabled={!formData.name.trim()}
                      className={`flex-1 px-8 py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 group ${formData.name.trim() ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200 hover:bg-indigo-700' : 'bg-slate-100 text-slate-300 cursor-not-allowed'}`}
                    >
                      Save & Add More
                    </button>
                    <button 
                      type="button"
                      onClick={() => savePriority(false)}
                      className="flex-1 bg-white border-2 border-slate-100 text-slate-400 px-8 py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all"
                    >
                      {formData.name.trim() ? "Save & Close" : "Cancel"}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        ) : (
          <div id="tour-strategy-list" className="flex flex-col lg:flex-row gap-8 h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* MAIN FOCUS - OCCUPIES MAJORITY SPACE */}
            <section 
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(true)}
              className={`flex-1 flex flex-col rounded-[3.5rem] border-4 p-10 overflow-hidden transition-all duration-500 ${draggedPriorityId && !priorities.find(p => p.id === draggedPriorityId)?.isPinned ? 'border-emerald-400 bg-emerald-50/30 scale-[1.005] shadow-2xl' : 'bg-white border-indigo-50/50 shadow-2xl shadow-indigo-100/20'}`}
            >
              <header className="flex items-center justify-between mb-10 shrink-0">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-indigo-600 text-white rounded-[1.5rem] flex items-center justify-center shadow-2xl shadow-indigo-200">
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-slate-900 leading-none">Main Focus</h2>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500 mt-2">Active Strategic Pillars</p>
                  </div>
                </div>
                <div className="text-right">
                    <div className="text-4xl font-black text-slate-100">{mainFocusItems.length}</div>
                </div>
              </header>

              <div className="flex-1 overflow-y-auto no-scrollbar grid grid-cols-1 xl:grid-cols-2 gap-8 pr-2 pb-4 content-start">
                {mainFocusItems.length === 0 ? (
                    <div className="col-span-full h-full flex flex-col items-center justify-center text-center p-20 border-2 border-dashed border-slate-100 rounded-[3rem] opacity-40">
                        <p className="text-xl font-bold text-slate-300">Your focus is empty.</p>
                        <p className="text-sm text-slate-300 mt-2">Promote items from the shelf or create one.</p>
                    </div>
                ) : (
                    mainFocusItems.map(p => (
                        <PriorityCard 
                          key={p.id} 
                          p={p} 
                          commitments={commitments} 
                          blocks={blocks} 
                          onEdit={startEditing} 
                          onRemove={handleRemove} 
                          onTogglePin={togglePin} 
                          onDragStart={handleDragStart} 
                          isMain 
                        />
                    ))
                )}
              </div>
            </section>

            {/* PIPELINE / SHELF - OCCUPIES MINORITY SPACE */}
            <section 
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(false)}
              className={`w-full lg:w-[400px] flex flex-col rounded-[3.5rem] border-4 p-8 overflow-hidden transition-all duration-500 ${draggedPriorityId && priorities.find(p => p.id === draggedPriorityId)?.isPinned ? 'border-slate-400 bg-slate-100 scale-[1.005]' : 'bg-slate-50 border-slate-200/50'}`}
            >
              <header className="flex items-center justify-between mb-8 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-200 text-slate-500 rounded-xl flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 8V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v2"/><path d="M21 12V10a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v2"/><path d="M21 16V14a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v2"/></svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-700">The Shelf</h2>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Backlog Intent</p>
                  </div>
                </div>
              </header>
              <div className="flex-1 overflow-y-auto no-scrollbar space-y-4 pr-1">
                {pipelineItems.length === 0 ? (
                    <div className="h-40 flex flex-col items-center justify-center text-center border-2 border-dashed border-slate-200 rounded-[2rem] opacity-30">
                        <p className="text-xs font-bold uppercase tracking-widest">Shelf Empty</p>
                    </div>
                ) : (
                    pipelineItems.map(p => (
                        <PriorityCard 
                          key={p.id} 
                          p={p} 
                          commitments={commitments} 
                          blocks={blocks} 
                          onEdit={startEditing} 
                          onRemove={handleRemove} 
                          onTogglePin={togglePin} 
                          onDragStart={handleDragStart} 
                        />
                    ))
                )}
              </div>
            </section>
          </div>
        )}
      </div>

      {!isAddingMode && isReady && (
        <div className="shrink-0 flex justify-center mt-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <button
            onClick={() => onComplete(priorities)}
            className="flex items-center gap-6 bg-slate-900 hover:bg-black text-white px-12 py-6 rounded-[2.5rem] font-black text-lg shadow-2xl shadow-slate-200 transition-all transform hover:-translate-y-1 group active:scale-95"
          >
            Confirm Strategy
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
          </button>
        </div>
      )}
    </div>
  );
};

const PriorityCard: React.FC<PriorityCardProps> = ({ p, commitments, blocks, onEdit, onRemove, onTogglePin, onDragStart, isMain }) => {
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

  const completedTasks = pillarTasks.filter(t => t.isCompleted);
  const currentAndUpcoming = pillarTasks.filter(t => !t.isCompleted);

  return (
    <div 
      draggable
      onDragStart={(e) => onDragStart(e, p.id)}
      className={`flex flex-col rounded-[2.5rem] border-2 transition-all group overflow-hidden bg-white shadow-xl hover:shadow-2xl cursor-grab active:cursor-grabbing shrink-0 animate-in fade-in zoom-in-95 ${isMain ? 'border-indigo-100 p-8' : 'border-slate-100 p-6 opacity-70 hover:opacity-100 scale-95 hover:scale-100'}`}
    >
      <div className="flex-1">
        <div className="flex items-start justify-between mb-4">
          <h3 className={`font-black tracking-tight leading-tight ${isMain ? 'text-2xl text-slate-800' : 'text-lg text-slate-600'}`}>{p.name}</h3>
          <button 
              onClick={(e) => { e.stopPropagation(); onTogglePin(p.id); }} 
              className={`p-2 rounded-xl transition-all ${p.isPinned ? 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100' : 'text-slate-300 bg-slate-50 hover:text-indigo-400'}`}
              title={p.isPinned ? "Move to shelf" : "Move to focus"}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width={isMain ? "20" : "16"} height={isMain ? "20" : "16"} viewBox="0 0 24 24" fill={p.isPinned ? "currentColor" : "none"} stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </button>
        </div>
        <p className={`${isMain ? 'text-sm mb-6' : 'text-xs'} text-slate-500 leading-relaxed line-clamp-2 font-medium italic`}>{p.description}</p>

        {/* TASK VISUALIZATION (Main focus only) */}
        {isMain && (
          <div className="mt-4 space-y-4">
            {currentAndUpcoming.length > 0 && (
              <div className="space-y-2">
                <div className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Active & Upcoming</div>
                <div className="space-y-2">
                  {currentAndUpcoming.slice(0, 3).map(task => (
                    <div key={task.id} className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${task.isCurrent ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-slate-50 border-slate-100 text-slate-700'}`}>
                      <div className={`w-2 h-2 rounded-full ${task.isCurrent ? 'bg-white animate-pulse' : 'bg-indigo-300'}`}></div>
                      <span className="text-xs font-bold truncate flex-1">{task.title}</span>
                      {task.isCurrent && <span className="text-[8px] font-black uppercase bg-white/20 px-1.5 py-0.5 rounded-full">LIVE</span>}
                    </div>
                  ))}
                  {currentAndUpcoming.length > 3 && (
                    <div className="text-[9px] text-slate-300 font-black uppercase text-center">+ {currentAndUpcoming.length - 3} More Scheduled</div>
                  )}
                </div>
              </div>
            )}

            {completedTasks.length > 0 && (
              <div className="space-y-2">
                <div className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Completed Intent</div>
                <div className="space-y-2">
                  {completedTasks.slice(0, 2).map(task => (
                    <div key={task.id} className="flex items-center gap-3 p-3 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-700 opacity-60">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      <span className="text-xs font-bold truncate flex-1 line-through">{task.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {pillarTasks.length === 0 && (
              <div className="py-8 text-center border-2 border-dashed border-slate-100 rounded-3xl opacity-30">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">No tasks mapped yet</p>
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className={`flex gap-2 ${isMain ? 'mt-8' : 'mt-4'} opacity-0 group-hover:opacity-100 transition-opacity`}>
        <button onClick={(e) => { e.stopPropagation(); onEdit(p); }} className="flex-1 bg-slate-50 hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-slate-100">Modify</button>
        <button onClick={(e) => { e.stopPropagation(); onRemove(p.id); }} className="p-3 bg-slate-50 hover:bg-red-50 text-slate-300 hover:text-red-500 rounded-xl transition-all border border-slate-100">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
        </button>
      </div>
    </div>
  );
};
