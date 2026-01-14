
import React, { useState, useRef, useEffect } from "react";
import { StrategicPriority } from "../types";
import { v4 as uuidv4 } from 'uuid';

interface Props {
  onComplete: (priorities: StrategicPriority[]) => void;
  initialPriorities: StrategicPriority[];
}

interface PriorityCardProps {
  p: StrategicPriority;
  onEdit: (p: StrategicPriority) => void;
  onRemove: (id: string) => void;
  onTogglePin: (id: string) => void;
  onDragStart: (e: React.DragEvent, id: string) => void;
  isMain?: boolean;
}

export const OnboardingScreen: React.FC<Props> = ({ onComplete, initialPriorities }) => {
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

    // If stayInMode is false (Save & Close) and the form is empty, just close.
    if (!stayInMode && !isFormValid) {
      setIsAddingMode(false);
      setFormData({ name: "", description: "" });
      setEditingId(null);
      return;
    }

    // If we're trying to add/save but it's invalid, stop.
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
    <div className="h-full flex flex-col max-w-7xl mx-auto px-8 py-8 overflow-hidden relative">
      {/* HEADER - FIXED HEIGHT */}
      <header className="shrink-0 flex flex-col md:flex-row justify-between items-center mb-10 gap-6 animate-in fade-in slide-in-from-top-4 duration-700">
        <div className="text-center md:text-left">
          <h1 className="text-3xl font-light text-slate-800 mb-1 tracking-tight">Strategy Hub</h1>
          <p className="text-slate-500 max-w-md leading-relaxed text-sm">
            Define the core areas that deserve your best time.
          </p>
        </div>
        {!isAddingMode && (
          <button 
            onClick={startAdding}
            className="bg-emerald-600 text-white px-8 py-4 rounded-2xl font-bold text-sm hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-200 flex items-center gap-2 group transform hover:-translate-y-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            Add New Pillar
          </button>
        )}
      </header>

      {/* CONTENT AREA - GROWS TO FILL SPACE */}
      <div className="flex-1 min-h-0 relative">
        {isAddingMode ? (
          <div className="h-full flex items-center justify-center animate-in fade-in zoom-in-95 duration-500">
            <div className="w-full max-w-2xl">
              <div className="text-center mb-10">
                <span className="text-emerald-600 font-bold text-[10px] uppercase tracking-[0.25em] mb-3 block">Pillar Setup</span>
                <h2 className="text-3xl font-light text-slate-800">
                  {editingId ? "Refine Priority" : "Define New Priority"}
                </h2>
              </div>
              <form onSubmit={(e) => { e.preventDefault(); savePriority(false); }} className="bg-white p-10 rounded-[3.5rem] shadow-2xl shadow-emerald-100/30 border border-emerald-50 space-y-8">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Priority Name</label>
                  <input 
                    ref={inputRef}
                    className="w-full text-2xl font-light bg-slate-50 border border-slate-100 rounded-2xl p-6 focus:bg-white focus:ring-4 focus:ring-emerald-50/50 focus:border-emerald-200 outline-none transition-all placeholder:text-slate-200"
                    placeholder="e.g. Scaling Business..."
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Description / Intent</label>
                  <textarea 
                    className="w-full text-lg font-light bg-slate-50 border border-slate-100 rounded-2xl p-6 focus:bg-white focus:ring-4 focus:ring-emerald-50/50 focus:border-emerald-200 outline-none transition-all placeholder:text-slate-200 h-32 resize-none"
                    placeholder="Why is this a strategic pillar right now?"
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
                      className={`flex-1 px-8 py-5 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 group ${formData.name.trim() ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-200 hover:bg-emerald-700' : 'bg-slate-100 text-slate-300 cursor-not-allowed'}`}
                    >
                      Add & Create Another
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:rotate-90 transition-transform"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    </button>
                    <button 
                      type="button"
                      onClick={() => savePriority(false)}
                      className="flex-1 bg-white border border-emerald-200 text-emerald-600 px-8 py-5 rounded-2xl font-bold text-sm hover:bg-emerald-50 transition-all flex items-center justify-center gap-2 group"
                    >
                      {formData.name.trim() ? "Save & Close" : "Done Adding"}
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        ) : priorities.length === 0 ? (
          <div className="h-full border-2 border-dashed border-emerald-100 rounded-[4rem] flex flex-col items-center justify-center text-center bg-white/40 backdrop-blur-md animate-in fade-in duration-700">
            <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-400 mb-8 border border-emerald-100 shadow-inner">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
            </div>
            <h2 className="text-3xl font-light text-slate-800 mb-4">Define your Pillars.</h2>
            <p className="text-slate-400 mb-12 max-w-sm text-xl leading-relaxed">ExecuteOS needs to know what truly matters before scheduling.</p>
            <button 
              onClick={startAdding}
              className="bg-emerald-600 text-white px-12 py-6 rounded-[2rem] font-bold text-lg hover:bg-emerald-700 transition-all shadow-2xl shadow-emerald-200 flex items-center gap-3 transform hover:-translate-y-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              Add My First Pillar
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* MAIN FOCUS CONTAINER */}
            <section 
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(true)}
              className={`flex flex-col rounded-[3.5rem] border-2 p-10 overflow-hidden transition-all ${draggedPriorityId && !priorities.find(p => p.id === draggedPriorityId)?.isPinned ? 'border-emerald-400 bg-emerald-50/30 scale-[1.01] shadow-2xl' : 'bg-white border-emerald-100 shadow-xl shadow-emerald-50/50'}`}
            >
              <header className="flex items-center justify-between mb-8 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-emerald-100">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-800">Main Focus</h2>
                    <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Active Strategic Pillars</p>
                  </div>
                </div>
              </header>
              <div className="flex-1 overflow-y-auto no-scrollbar space-y-6 pr-1">
                {mainFocusItems.map(p => (
                  <PriorityCard key={p.id} p={p} onEdit={startEditing} onRemove={handleRemove} onTogglePin={togglePin} onDragStart={handleDragStart} isMain />
                ))}
                {mainFocusItems.length === 0 && (
                  <div className="h-full border-2 border-dashed border-slate-50 rounded-3xl flex flex-col items-center justify-center text-center opacity-40 py-20">
                    <p className="text-sm font-medium italic text-slate-400">Focus zone empty.</p>
                  </div>
                )}
              </div>
            </section>

            {/* BACKLOG / PIPELINE CONTAINER */}
            <section 
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(false)}
              className={`flex flex-col rounded-[3.5rem] border-2 p-10 overflow-hidden transition-all ${draggedPriorityId && priorities.find(p => p.id === draggedPriorityId)?.isPinned ? 'border-slate-400 bg-slate-100 scale-[1.01] shadow-2xl' : 'bg-slate-50 border-slate-200'}`}
            >
              <header className="flex items-center justify-between mb-8 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-200 text-slate-500 rounded-xl flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M21 8V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v2"/><path d="M21 12V10a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v2"/><path d="M21 16V14a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v2"/><path d="M21 20V18a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v2"/></svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-700">Pipeline</h2>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Backlog Pillars</p>
                  </div>
                </div>
              </header>
              <div className="flex-1 overflow-y-auto no-scrollbar space-y-6 pr-1">
                {pipelineItems.map(p => (
                  <PriorityCard key={p.id} p={p} onEdit={startEditing} onRemove={handleRemove} onTogglePin={togglePin} onDragStart={handleDragStart} />
                ))}
                {pipelineItems.length === 0 && (
                  <div className="h-full border-2 border-dashed border-slate-200/50 rounded-3xl flex flex-col items-center justify-center text-center opacity-30 py-20">
                    <p className="text-sm font-medium italic text-slate-400">Pipeline empty.</p>
                  </div>
                )}
              </div>
            </section>
          </div>
        )}
      </div>

      {/* FOOTER ACTION - ONLY SHOWS ON MAIN HUB VIEW */}
      {!isAddingMode && isReady && (
        <div className="shrink-0 flex justify-end mt-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <button
            onClick={() => onComplete(priorities)}
            className="flex items-center gap-4 bg-slate-900 hover:bg-black text-white px-10 py-5 rounded-[2rem] font-bold text-lg shadow-2xl shadow-slate-200 transition-all transform hover:-translate-y-1 group"
          >
            Confirm Strategy & Continue
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

const PriorityCard: React.FC<PriorityCardProps> = ({ p, onEdit, onRemove, onTogglePin, onDragStart, isMain }) => (
  <div 
    draggable
    onDragStart={(e) => onDragStart(e, p.id)}
    className={`flex flex-col rounded-[2.5rem] border-2 transition-all group overflow-hidden bg-white shadow-lg hover:shadow-2xl cursor-grab active:cursor-grabbing shrink-0 ${isMain ? 'border-emerald-50 shadow-emerald-100/20' : 'border-slate-50 shadow-slate-100/30'}`}
  >
    <div className="p-6">
      <div className="flex items-start justify-between mb-2">
        <h3 className={`text-lg font-bold leading-tight ${isMain ? 'text-slate-800' : 'text-slate-600'}`}>{p.name}</h3>
        <button 
          onClick={() => onTogglePin(p.id)}
          className={`p-2 rounded-xl transition-all ${p.isPinned ? 'text-emerald-500 bg-emerald-50' : 'text-slate-300 bg-slate-50 hover:text-emerald-400'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill={p.isPinned ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
        </button>
      </div>
      <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 italic">
        {p.description}
      </p>
    </div>
    <div className="px-6 pb-6 flex gap-2">
      <button 
        onClick={() => onEdit(p)}
        className="flex-1 bg-slate-50 hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 border border-slate-100"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
        Edit
      </button>
      <button 
        onClick={() => onRemove(p.id)}
        className="p-3 bg-slate-50 hover:bg-red-50 text-slate-300 hover:text-red-500 rounded-xl transition-all border border-slate-100"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
      </button>
    </div>
  </div>
);
