
import React, { useState, useRef } from "react";
import { CaptureItem, Commitment, StrategicPriority, CommitmentType, EnergyLevel, ItemStatus } from "../types";
import { v4 as uuidv4 } from 'uuid';

interface Props {
  items: CaptureItem[];
  commitments: Commitment[];
  priorities: StrategicPriority[];
  onFinish: () => void;
  onUpdateItems: (items: CaptureItem[]) => void;
  onUpdateCommitments: (commitments: Commitment[]) => void;
  onAddPriority: (priority: StrategicPriority) => void;
}

export const SortScreen: React.FC<Props> = ({ items, commitments, priorities, onFinish, onUpdateItems, onUpdateCommitments, onAddPriority }) => {
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [isAddingPriority, setIsAddingPriority] = useState(false);
  const [newPriorityName, setNewPriorityName] = useState("");
  const addInputRef = useRef<HTMLInputElement>(null);

  const inboxItems = items.filter(i => i.status === "inbox");
  const discardedItems = items.filter(i => i.status === "discarded");

  const handleDragStart = (id: string) => {
    setDraggedItemId(id);
  };

  const handleDrop = (priorityId: string | "discard") => {
    if (!draggedItemId) return;
    processItem(draggedItemId, priorityId);
    setDraggedItemId(null);
  };

  const processItem = (itemId: string, target: string | "discard") => {
    const item = items.find(i => i.id === itemId);
    if (!item) return;

    const updatedItems: CaptureItem[] = items.map(i => 
      i.id === itemId 
        ? { ...i, status: (target === "discard" ? "discarded" : "triaged") as ItemStatus } 
        : i
    );

    if (target !== "discard") {
      const newCommitment: Commitment = {
        id: uuidv4(),
        captureItemId: itemId,
        type: "task",
        title: item.rawText,
        priorityId: target,
        durationMinutes: 30,
        energy: "medium",
      };

      onUpdateCommitments([...commitments, newCommitment]);
    } else {
      // Remove any commitment if it was moved to noise from a priority
      onUpdateCommitments(commitments.filter(c => c.captureItemId !== itemId));
    }

    onUpdateItems(updatedItems);
  };

  const handleAddPriority = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPriorityName.trim()) return;

    const newP: StrategicPriority = {
      id: uuidv4(),
      name: newPriorityName.trim(),
      weight: 50,
      description: "Added during triage session.",
      examples: [],
      antiExamples: [],
      isPinned: true
    };

    onAddPriority(newP);
    setNewPriorityName("");
    setIsAddingPriority(false);
  };

  return (
    <div className="h-full flex flex-col p-8 relative pb-32">
      <header className="mb-10 animate-in fade-in slide-in-from-top-4 duration-700 text-center lg:text-left flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-light text-slate-800">Triage Board</h1>
          <p className="text-slate-500 mt-2">
            Drag tasks into priorities or move them to Noise.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
             <div className="text-[10px] font-black uppercase tracking-widest text-slate-300">Remaining</div>
             <div className="text-2xl font-light text-indigo-600">{inboxItems.length}</div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex gap-8 overflow-hidden min-h-0">
        {/* INBOX PANEL */}
        <div className="w-80 flex flex-col bg-slate-100/50 rounded-[2.5rem] border border-slate-200/60 p-6">
          <div className="flex items-center justify-between mb-6 px-2">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Captured Inbox</h3>
            <span className="bg-white px-2 py-0.5 rounded-full text-[10px] font-bold text-indigo-500 border border-slate-100 shadow-sm">
              {inboxItems.length}
            </span>
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-3 no-scrollbar pr-1">
            {inboxItems.map(item => (
              <div
                key={item.id}
                draggable
                onDragStart={() => handleDragStart(item.id)}
                className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 cursor-grab active:cursor-grabbing hover:border-indigo-200 hover:shadow-md transition-all group relative animate-in fade-in slide-in-from-left-2"
              >
                <p className="text-sm font-medium text-slate-700 leading-relaxed">{item.rawText}</p>
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-300"><circle cx="9" cy="12" r="1"/><circle cx="9" cy="5" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="19" r="1"/></svg>
                </div>
              </div>
            ))}
            {inboxItems.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-40 py-20">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mb-4 text-emerald-500"><path d="M20 6 9 17l-5-5"/></svg>
                <p className="text-xs font-bold uppercase tracking-widest text-emerald-600">All Items Processed</p>
              </div>
            )}
          </div>
        </div>

        {/* PRIORITY GRID */}
        <div className="flex-1 flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 flex-1 overflow-y-auto no-scrollbar pb-6 pr-2">
            {priorities.map(priority => {
              const assignedCommitments = commitments.filter(c => c.priorityId === priority.id);
              return (
                <div
                  key={priority.id}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleDrop(priority.id)}
                  className={`p-6 rounded-[3rem] border-2 transition-all flex flex-col relative group min-h-[12rem] ${draggedItemId ? 'border-indigo-200 border-dashed bg-indigo-50/30' : 'border-slate-100 bg-white hover:border-indigo-100 shadow-sm'}`}
                >
                  <div className="mb-4 flex items-center justify-between">
                    <h4 className="text-base font-bold text-slate-800 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                      {priority.name}
                    </h4>
                    <span className="text-[10px] font-black text-slate-300 group-hover:text-indigo-400 transition-colors">{assignedCommitments.length}</span>
                  </div>
                  
                  <div className="flex-1 space-y-2 mb-4">
                    {assignedCommitments.map(c => (
                      <div 
                        key={c.id} 
                        draggable
                        onDragStart={() => handleDragStart(c.captureItemId)}
                        className="bg-slate-50 border border-slate-100 p-3 rounded-xl animate-in fade-in zoom-in-95 duration-300 hover:bg-white hover:border-indigo-100 transition-all cursor-grab active:cursor-grabbing"
                      >
                        <p className="text-[11px] font-medium text-slate-600 line-clamp-2">{c.title}</p>
                      </div>
                    ))}
                    {assignedCommitments.length === 0 && !draggedItemId && (
                       <div className="h-full flex items-center justify-center border-2 border-dashed border-slate-50 rounded-2xl py-8 opacity-40">
                          <p className="text-[10px] uppercase tracking-widest text-slate-300 font-bold">Empty</p>
                       </div>
                    )}
                  </div>

                  {draggedItemId && (
                    <div className="absolute inset-0 bg-indigo-500/5 rounded-[3rem] pointer-events-none animate-pulse"></div>
                  )}
                </div>
              );
            })}

            {/* ADD NEW PRIORITY CARD */}
            {isAddingPriority ? (
               <form 
                onSubmit={handleAddPriority}
                className="p-6 rounded-[3rem] border-2 border-indigo-200 bg-indigo-50/20 flex flex-col justify-center animate-in zoom-in-95"
              >
                <input 
                  autoFocus
                  ref={addInputRef}
                  className="bg-white border border-indigo-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-200 mb-3"
                  placeholder="Bucket name..."
                  value={newPriorityName}
                  onChange={e => setNewPriorityName(e.target.value)}
                />
                <div className="flex gap-2">
                   <button type="submit" className="flex-1 bg-indigo-600 text-white py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest">Create</button>
                   <button type="button" onClick={() => setIsAddingPriority(false)} className="px-4 py-2 text-slate-400 text-[10px] font-bold uppercase tracking-widest">Cancel</button>
                </div>
               </form>
            ) : (
              <button 
                onClick={() => setIsAddingPriority(true)}
                className="p-6 rounded-[3rem] border-2 border-dashed border-slate-100 bg-slate-50/30 text-slate-300 hover:border-indigo-100 hover:text-indigo-400 hover:bg-white transition-all flex flex-col items-center justify-center group min-h-[12rem]"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="mb-2 group-hover:scale-110 transition-transform"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                <span className="text-[10px] font-bold uppercase tracking-widest">Add Focus Area</span>
              </button>
            )}

            {/* NOISE / LATER BUCKET - PERSISTENT VISIBILITY */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop("discard")}
              className={`p-6 rounded-[3rem] border-2 transition-all flex flex-col group min-h-[12rem] ${draggedItemId ? 'border-red-200 border-dashed bg-red-50/30' : 'border-slate-100 bg-slate-50/50 hover:border-red-100'}`}
            >
              <div className="mb-4 flex items-center justify-between">
                <h4 className="text-base font-bold text-slate-400 flex items-center gap-2 group-hover:text-red-400 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                  Noise / Later
                </h4>
                <span className="text-[10px] font-black text-slate-200 group-hover:text-red-200 transition-colors">{discardedItems.length}</span>
              </div>
              
              <div className="flex-1 overflow-y-auto space-y-2 no-scrollbar mb-4 max-h-[150px]">
                {discardedItems.map(item => (
                  <div 
                    key={item.id} 
                    draggable
                    onDragStart={() => handleDragStart(item.id)}
                    className="bg-white/60 border border-slate-100 p-3 rounded-xl opacity-60 hover:opacity-100 transition-all cursor-grab active:cursor-grabbing"
                  >
                    <p className="text-[11px] font-medium text-slate-400 line-clamp-1">{item.rawText}</p>
                  </div>
                ))}
                {discardedItems.length === 0 && !draggedItemId && (
                   <div className="h-full flex items-center justify-center opacity-30 text-center py-4">
                      <p className="text-[10px] uppercase tracking-widest text-slate-400 italic">Clear skies</p>
                   </div>
                )}
              </div>

              {draggedItemId && (
                <div className="absolute inset-0 bg-red-500/5 rounded-[3rem] pointer-events-none animate-pulse"></div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-12 right-12 z-50 animate-in fade-in slide-in-from-bottom-8 duration-500">
        <button
          onClick={onFinish}
          className="flex items-center gap-4 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-5 rounded-2xl font-bold text-lg shadow-2xl shadow-indigo-200 transition-all transform hover:-translate-y-1 hover:scale-105 active:scale-95 group"
        >
          <span className="tracking-tight">{inboxItems.length === 0 ? "Commit & Plan Schedule" : "Finish Triage"}</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </button>
      </div>
    </div>
  );
};
