import React, { useState } from "react";
import { CaptureItem, Commitment, StrategicPriority, CommitmentType, EnergyLevel, ItemStatus } from "../types";
import { v4 as uuidv4 } from 'uuid';

interface Props {
  items: CaptureItem[];
  commitments: Commitment[];
  priorities: StrategicPriority[];
  onFinish: () => void;
  onUpdateItems: (items: CaptureItem[]) => void;
  onUpdateCommitments: (commitments: Commitment[]) => void;
}

export const SortScreen: React.FC<Props> = ({ items, commitments, priorities, onFinish, onUpdateItems, onUpdateCommitments }) => {
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const inboxItems = items.filter(i => i.status === "inbox");

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

    // Fix: Explicitly type updatedItems as CaptureItem[] and cast the status to ItemStatus to avoid widening to string
    const updatedItems: CaptureItem[] = items.map(i => 
      i.id === itemId 
        ? { ...i, status: (target === "discard" ? "discarded" : "triaged") as ItemStatus } 
        : i
    );

    if (target !== "discard") {
      const newCommitment: Commitment = {
        id: uuidv4(),
        captureItemId: itemId,
        type: "task", // Default
        title: item.rawText,
        priorityId: target,
        durationMinutes: 30, // Default
        energy: "medium", // Default
      };

      onUpdateCommitments([...commitments, newCommitment]);
    }

    onUpdateItems(updatedItems);
  };

  return (
    <div className="h-full flex flex-col p-8 relative pb-32">
      <header className="mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
        <h1 className="text-3xl font-light text-slate-800">Triage Board</h1>
        <p className="text-slate-500 mt-2">
          Drag tasks into your strategic priorities to commit to them. See your strategy take shape in real-time.
        </p>
      </header>

      <div className="flex-1 flex gap-8 overflow-hidden min-h-0">
        {/* INBOX COLUMN */}
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
                className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 cursor-grab active:cursor-grabbing hover:border-indigo-200 hover:shadow-md transition-all group relative"
              >
                <p className="text-sm font-medium text-slate-700 leading-relaxed">{item.rawText}</p>
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-300"><circle cx="9" cy="12" r="1"/><circle cx="9" cy="5" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="19" r="1"/></svg>
                </div>
              </div>
            ))}
            {inboxItems.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-40 py-20">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mb-4"><path d="M20 6 9 17l-5-5"/></svg>
                <p className="text-xs font-bold uppercase tracking-widest">Inbox Empty</p>
              </div>
            )}
          </div>
        </div>

        {/* TARGET AREAS */}
        <div className="flex-1 flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 flex-1 overflow-y-auto no-scrollbar pb-6">
            {priorities.map(priority => {
              const assignedCommitments = commitments.filter(c => c.priorityId === priority.id);
              return (
                <div
                  key={priority.id}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleDrop(priority.id)}
                  onClick={() => draggedItemId && handleDrop(priority.id)}
                  className={`p-6 rounded-[3rem] border-2 transition-all flex flex-col relative group min-h-[12rem] ${draggedItemId ? 'border-indigo-200 border-dashed bg-indigo-50/30' : 'border-slate-100 bg-white hover:border-indigo-100 shadow-sm'}`}
                >
                  <div className="mb-4">
                    <h4 className="text-base font-bold text-slate-800 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                      {priority.name}
                    </h4>
                  </div>
                  
                  {/* LIST OF ASSIGNED TASKS */}
                  <div className="flex-1 space-y-2 mb-4">
                    {assignedCommitments.map(c => (
                      <div key={c.id} className="bg-slate-50 border border-slate-100 p-3 rounded-xl animate-in fade-in zoom-in-95 duration-300">
                        <p className="text-[11px] font-medium text-slate-600 line-clamp-2">{c.title}</p>
                      </div>
                    ))}
                    {assignedCommitments.length === 0 && !draggedItemId && (
                       <div className="h-full flex items-center justify-center border-2 border-dashed border-slate-50 rounded-2xl py-8">
                          <p className="text-[10px] uppercase tracking-widest text-slate-300 font-bold">No tasks yet</p>
                       </div>
                    )}
                  </div>

                  <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-slate-300">
                    <span>{assignedCommitments.length} Items</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                  </div>

                  {draggedItemId && (
                    <div className="absolute inset-0 bg-indigo-500/5 rounded-[3rem] pointer-events-none animate-pulse"></div>
                  )}
                </div>
              );
            })}

            {/* DISCARD ZONE */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop("discard")}
              onClick={() => draggedItemId && handleDrop("discard")}
              className={`p-6 rounded-[3rem] border-2 border-dashed transition-all flex flex-col group min-h-[12rem] ${draggedItemId ? 'border-red-200 bg-red-50/30 text-red-400' : 'border-slate-100 bg-slate-50/50 text-slate-400 opacity-60 hover:opacity-100 hover:border-red-100'}`}
            >
              <div className="mb-4">
                <h4 className="text-base font-bold flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                  Noise / Later
                </h4>
              </div>
              <div className="flex-1 flex items-center justify-center">
                 <p className="text-[10px] italic text-center px-4 leading-relaxed">
                   Drop here to remove items that don't fit your current focus.
                 </p>
              </div>
              <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest opacity-50">
                <span>Discard Bin</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* STANDARD NAVIGATION BUTTON */}
      <div className="fixed bottom-12 right-12 z-50 animate-in fade-in slide-in-from-bottom-8 duration-500">
        <button
          onClick={onFinish}
          className="flex items-center gap-4 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-5 rounded-2xl font-bold text-lg shadow-2xl shadow-indigo-200 transition-all transform hover:-translate-y-1 hover:scale-105 active:scale-95 group"
        >
          <span className="tracking-tight">{inboxItems.length === 0 ? "Proceed to Scheduling" : "Skip Remaining Triage"}</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </button>
      </div>
    </div>
  );
};