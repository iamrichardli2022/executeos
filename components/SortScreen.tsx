
import React, { useState, useRef, useMemo, useEffect } from "react";
import { CaptureItem, Commitment, StrategicPriority, CommitmentType, EnergyLevel, ItemStatus, ExecutionSession } from "../types";
import { v4 as uuidv4 } from 'uuid';
import { StorageService } from "../services/storage";

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
  const [activeInboxTab, setActiveInboxTab] = useState<"inbox" | "backlog">("inbox");
  const [historicalSessions, setHistoricalSessions] = useState<ExecutionSession[]>([]);
  
  // Inline task creation state
  const [addingTaskToPriorityId, setAddingTaskToPriorityId] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  
  const addInputRef = useRef<HTMLInputElement>(null);
  const inlineInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setHistoricalSessions(StorageService.getSessions());
  }, []);

  const inboxItems = items.filter(i => i.status === "inbox");
  const discardedItems = items.filter(i => i.status === "discarded");

  const backlogItems = useMemo(() => {
    const currentTitles = new Set([
      ...items.map(i => i.rawText.toLowerCase()),
      ...commitments.map(c => c.title.toLowerCase())
    ]);

    const itemsFromHistory: { title: string; originalPriorityId?: string }[] = [];
    historicalSessions.forEach(s => {
      s.commitments.forEach(c => {
        if (!currentTitles.has(c.title.toLowerCase())) {
          itemsFromHistory.push({ title: c.title, originalPriorityId: c.priorityId });
        }
      });
    });

    const uniqueBacklog = Array.from(new Set(itemsFromHistory.map(t => t.title))).map(title => {
      return itemsFromHistory.find(t => t.title === title)!;
    });

    return uniqueBacklog;
  }, [historicalSessions, items, commitments]);

  const handleDragStart = (id: string, isBacklog: boolean = false) => {
    if (isBacklog) {
      // Create a temporary item for the backlog task so it can be handled by existing drag/drop logic
      const title = id; // id is the title in backlog
      const newId = `backlog-${uuidv4()}`;
      const newItem: CaptureItem = {
        id: newId,
        rawText: title,
        createdAt: new Date().toISOString(),
        status: "inbox"
      };
      onUpdateItems([...items, newItem]);
      setDraggedItemId(newId);
    } else {
      setDraggedItemId(id);
    }
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

  const handleCreateInlineTask = (priorityId: string) => {
    if (!newTaskTitle.trim()) {
      setAddingTaskToPriorityId(null);
      return;
    }

    const itemId = uuidv4();
    const newItem: CaptureItem = {
      id: itemId,
      rawText: newTaskTitle.trim(),
      createdAt: new Date().toISOString(),
      status: "triaged"
    };

    const newCommitment: Commitment = {
      id: uuidv4(),
      captureItemId: itemId,
      type: "task",
      title: newTaskTitle.trim(),
      priorityId: priorityId,
      durationMinutes: 30,
      energy: "medium",
    };

    onUpdateItems([...items, newItem]);
    onUpdateCommitments([...commitments, newCommitment]);
    
    setNewTaskTitle("");
    setAddingTaskToPriorityId(null);
  };

  const handleInlineKeyDown = (e: React.KeyboardEvent, priorityId: string) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleCreateInlineTask(priorityId);
    } else if (e.key === "Escape") {
      setAddingTaskToPriorityId(null);
      setNewTaskTitle("");
    }
  };

  return (
    <div className="h-full flex flex-col p-8 relative pb-32">
      <header className="mb-10 animate-in fade-in slide-in-from-top-4 duration-700 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-light text-slate-800 tracking-tight">Triage Board</h1>
          <p className="text-slate-500 mt-2 font-medium">Map intent to specific strategic buckets.</p>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
             <div className="text-[10px] font-black uppercase tracking-widest text-slate-300">Remaining items</div>
             <div className="text-2xl font-light text-indigo-600">{inboxItems.length}</div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex gap-8 overflow-hidden min-h-0">
        {/* INBOX/BACKLOG PANEL */}
        <div className="w-80 flex flex-col bg-slate-100/50 rounded-[2.5rem] border border-slate-200/60 p-6">
          <div className="flex bg-white/80 p-1.5 rounded-2xl border border-slate-100 mb-6 shrink-0">
            <button 
              onClick={() => setActiveInboxTab("inbox")}
              className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeInboxTab === "inbox" ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Inbox
            </button>
            <button 
              onClick={() => setActiveInboxTab("backlog")}
              className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeInboxTab === "backlog" ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Backlog
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-3 no-scrollbar pr-1">
            {activeInboxTab === "inbox" ? (
              inboxItems.map(item => (
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
              ))
            ) : (
              backlogItems.map((item, i) => (
                <div
                  key={i}
                  draggable
                  onDragStart={() => handleDragStart(item.title, true)}
                  className="bg-white/80 p-5 rounded-2xl shadow-sm border border-slate-100 cursor-grab active:cursor-grabbing hover:border-indigo-200 hover:shadow-md transition-all group relative animate-in fade-in slide-in-from-left-2"
                >
                  <div className="flex flex-col">
                    <p className="text-sm font-medium text-slate-700 leading-relaxed">{item.title}</p>
                    <span className="text-[9px] font-black text-slate-300 uppercase mt-2 tracking-widest">From Archive</span>
                  </div>
                </div>
              ))
            )}
            
            {activeInboxTab === "inbox" && inboxItems.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-40 py-20">
                <p className="text-xs font-bold uppercase tracking-widest text-emerald-600">Inbox Clear</p>
              </div>
            )}
            {activeInboxTab === "backlog" && backlogItems.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-40 py-20">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Backlog Clear</p>
              </div>
            )}
          </div>
        </div>

        {/* PRIORITY GRID */}
        <div className="flex-1 flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 flex-1 overflow-y-auto no-scrollbar pb-6 pr-2">
            {priorities.map(priority => {
              const assignedCommitments = commitments.filter(c => c.priorityId === priority.id);
              const isAddingInline = addingTaskToPriorityId === priority.id;

              return (
                <div
                  key={priority.id}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleDrop(priority.id)}
                  className={`p-6 rounded-[3rem] border-2 transition-all flex flex-col relative group min-h-[14rem] ${draggedItemId ? 'border-indigo-200 border-dashed bg-indigo-50/20' : 'border-slate-100 bg-white hover:border-indigo-100 shadow-sm'}`}
                >
                  <div className="mb-6 flex items-center justify-between">
                    <h4 className="text-base font-bold text-slate-800 flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-indigo-600"></div>
                      {priority.name}
                    </h4>
                    <span className="text-[10px] font-black text-slate-300">{assignedCommitments.length}</span>
                  </div>
                  
                  <div className="flex-1 space-y-2 mb-6">
                    {assignedCommitments.map(c => (
                      <div 
                        key={c.id} 
                        draggable
                        onDragStart={() => handleDragStart(c.captureItemId)}
                        className="bg-slate-50 border border-slate-100 p-4 rounded-2xl animate-in fade-in zoom-in-95 hover:bg-white hover:border-indigo-100 transition-all cursor-grab active:cursor-grabbing"
                      >
                        <p className="text-[11px] font-bold text-slate-700 leading-tight">{c.title}</p>
                      </div>
                    ))}
                    
                    {isAddingInline ? (
                      <div className="animate-in slide-in-from-top-1 duration-200">
                          <input
                            ref={inlineInputRef}
                            autoFocus
                            className="w-full bg-indigo-50/50 border border-indigo-200 rounded-xl px-4 py-3 text-[11px] font-bold text-slate-700 outline-none focus:bg-white transition-all"
                            placeholder="Type and enter..."
                            value={newTaskTitle}
                            onChange={(e) => setNewTaskTitle(e.target.value)}
                            onKeyDown={(e) => handleInlineKeyDown(e, priority.id)}
                            onBlur={() => !newTaskTitle && setAddingTaskToPriorityId(null)}
                          />
                      </div>
                    ) : (
                      <button 
                        onClick={() => { setAddingTaskToPriorityId(priority.id); setNewTaskTitle(""); }}
                        className="w-full py-3 px-4 border border-dashed border-slate-200 rounded-2xl text-[9px] font-black text-slate-300 uppercase tracking-widest hover:border-indigo-200 hover:text-indigo-600 hover:bg-indigo-50/30 transition-all flex items-center justify-center gap-2"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                        New Task
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            <button 
              onClick={() => setIsAddingPriority(true)}
              className="p-6 rounded-[3rem] border-2 border-dashed border-slate-100 bg-slate-50/30 text-slate-300 hover:border-indigo-100 hover:text-indigo-400 hover:bg-white transition-all flex flex-col items-center justify-center group min-h-[14rem]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="mb-2 group-hover:scale-110 transition-transform"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              <span className="text-[10px] font-black uppercase tracking-widest">New Priority Bucket</span>
            </button>
          </div>
        </div>
      </div>

      <div className="fixed bottom-12 right-12 z-50 animate-in fade-in slide-in-from-bottom-8 duration-500">
        <button
          onClick={onFinish}
          className="flex items-center gap-4 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-5 rounded-[2rem] font-bold text-lg shadow-2xl shadow-indigo-200 transition-all transform hover:-translate-y-1 hover:scale-105 group"
        >
          <span className="tracking-tight">Proceed to Effort Analysis</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </button>
      </div>
    </div>
  );
};
