import React, { useState, useRef, useEffect } from "react";
import { StrategicPriority } from "../types";
import { v4 as uuidv4 } from 'uuid';

interface Props {
  onComplete: (priorities: StrategicPriority[]) => void;
  initialPriorities: StrategicPriority[];
}

export const OnboardingScreen: React.FC<Props> = ({ onComplete, initialPriorities }) => {
  const [priorities, setPriorities] = useState<StrategicPriority[]>(initialPriorities);
  const [isAddingMode, setIsAddingMode] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "", description: "" });
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

  const startAdding = () => {
    setEditingId(null);
    setFormData({
      name: "",
      description: ""
    });
    setIsAddingMode(true);
  };

  const startEditing = (priority: StrategicPriority) => {
    setEditingId(priority.id);
    setFormData({
      name: priority.name,
      description: priority.description
    });
    setIsAddingMode(true);
  };

  const savePriority = (stayInMode: boolean = false) => {
    if (!formData.name.trim()) return;

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

  const handleSavePriority = (e: React.FormEvent) => {
    e.preventDefault();
    savePriority(false);
  };

  const isReady = priorities.length > 0;

  return (
    <div className="max-w-6xl mx-auto px-12 py-8 flex flex-col h-full relative overflow-hidden">
      {/* HEADER */}
      <header className="flex flex-col md:flex-row justify-between items-center mb-10 shrink-0 animate-in fade-in slide-in-from-top-4 duration-700 gap-6">
        <div className="text-center md:text-left">
          <h1 className="text-3xl font-light text-slate-800 mb-1 tracking-tight">Strategy Hub</h1>
          <p className="text-slate-500 max-w-md leading-relaxed text-sm">
            Define the strategic pillars of your life to anchor your decisions.
          </p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto no-scrollbar relative min-h-0 pb-24">
        {/* FOCUSED EDIT/ADD FORM */}
        {isAddingMode && (
          <div className="w-full max-w-2xl mx-auto animate-in fade-in zoom-in-95 duration-500 slide-in-from-bottom-8">
            <div className="text-center mb-10">
              <span className="text-indigo-600 font-bold text-[10px] uppercase tracking-[0.25em] mb-3 block">Strategy Configuration</span>
              <h2 className="text-3xl font-light text-slate-800">
                {editingId ? "Refine Priority" : "Define New Priority"}
              </h2>
            </div>
            <form onSubmit={handleSavePriority} className="bg-white p-10 rounded-[3rem] shadow-2xl shadow-indigo-100/50 border border-indigo-50 space-y-8">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Priority Name</label>
                <input 
                  ref={inputRef}
                  className="w-full text-2xl font-light bg-slate-50 border border-slate-100 rounded-2xl p-6 focus:bg-white focus:ring-4 focus:ring-indigo-50/50 focus:border-indigo-200 outline-none transition-all placeholder:text-slate-200"
                  placeholder="e.g. Scaling Business..."
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Description</label>
                <textarea 
                  className="w-full text-lg font-light bg-slate-50 border border-slate-100 rounded-2xl p-6 focus:bg-white focus:ring-4 focus:ring-indigo-50/50 focus:border-indigo-200 outline-none transition-all placeholder:text-slate-200 h-36 resize-none"
                  placeholder="Why is it strategic right now?"
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                />
              </div>

              <div className="flex flex-col gap-4 pt-4">
                <div className="flex gap-4">
                   <button 
                    type="button"
                    onClick={() => savePriority(true)}
                    className="flex-1 bg-white border border-indigo-200 text-indigo-600 px-8 py-5 rounded-2xl font-bold text-sm hover:bg-indigo-50 transition-all flex items-center justify-center gap-2 group"
                  >
                    Add & Create Another
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:rotate-90 transition-transform"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 bg-indigo-600 text-white px-8 py-5 rounded-2xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 flex items-center justify-center gap-2 group"
                  >
                    {editingId ? "Update & Close" : "Save & Finish"}
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                  </button>
                </div>
                <button 
                  type="button"
                  onClick={() => setIsAddingMode(false)}
                  className="w-full py-4 text-slate-400 font-semibold hover:text-slate-600 transition-colors text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* BLANK STATE */}
        {!isAddingMode && priorities.length === 0 && (
          <div className="w-full py-32 border-2 border-dashed border-slate-200 rounded-[4rem] flex flex-col items-center justify-center text-center bg-white/40 backdrop-blur-md animate-in fade-in duration-700">
            <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-400 mb-8 border border-indigo-100 shadow-inner">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
            </div>
            <h2 className="text-3xl font-light text-slate-800 mb-4">Your strategy is clear space</h2>
            <p className="text-slate-400 mb-12 max-w-sm text-xl leading-relaxed">Start your journey by defining your primary strategic focus.</p>
            <button 
              onClick={() => startAdding()}
              className="bg-indigo-600 text-white px-12 py-6 rounded-[2rem] font-bold text-lg hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-100 flex items-center gap-3 transform hover:-translate-y-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              Add My First Priority
            </button>
          </div>
        )}

        {/* PRIORITY GRID */}
        {!isAddingMode && priorities.length > 0 && (
          <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {priorities.map(p => (
              <div 
                key={p.id} 
                className="flex flex-col rounded-[2.5rem] border-2 transition-all group overflow-hidden bg-white border-slate-100 shadow-xl shadow-slate-100 hover:border-indigo-100"
              >
                <div className="p-8 flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl font-bold text-slate-800 leading-tight">{p.name}</h3>
                  </div>
                  <p className="text-sm text-slate-500 leading-relaxed line-clamp-4 italic">
                    {p.description}
                  </p>
                </div>
                
                {/* ACTION BAR */}
                <div className="px-8 pb-8 flex gap-3">
                  <button 
                    onClick={() => startEditing(p)}
                    className="flex-1 bg-slate-50 hover:bg-indigo-50 text-slate-500 hover:text-indigo-600 py-4 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 border border-slate-100 hover:border-indigo-100"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                    Edit
                  </button>
                  <button 
                    onClick={() => handleRemove(p.id)}
                    className="p-4 bg-slate-50 hover:bg-red-50 text-slate-300 hover:text-red-500 rounded-2xl transition-all border border-slate-100 hover:border-red-100"
                    title="Remove Priority"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                  </button>
                </div>
              </div>
            ))}
            
            {/* ADD CARD */}
            <button 
              onClick={() => startAdding()}
              className="border-2 border-dashed border-slate-200 rounded-[2.5rem] p-12 text-slate-400 hover:border-indigo-300 hover:text-indigo-400 hover:bg-white hover:shadow-2xl hover:shadow-indigo-100/30 transition-all flex flex-col items-center justify-center gap-3 bg-white/40 backdrop-blur-sm group"
            >
              <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 mb-2 border border-slate-100 group-hover:scale-110 group-hover:bg-indigo-50 group-hover:text-indigo-400 transition-all">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              </div>
              <span className="text-lg font-semibold tracking-tight">Add Custom Priority</span>
            </button>
          </div>
        )}
      </div>

      {/* STANDARD NAVIGATION BUTTON */}
      {!isAddingMode && isReady && (
        <div className="fixed bottom-12 right-12 z-40 animate-in fade-in slide-in-from-bottom-8 duration-500">
          <button
            onClick={() => onComplete(priorities)}
            className="flex items-center gap-4 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-5 rounded-2xl font-bold text-lg shadow-2xl shadow-indigo-200 transition-all transform hover:-translate-y-1 hover:scale-105 active:scale-95 group"
          >
            <span className="tracking-tight">Proceed to Brain Dump</span>
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