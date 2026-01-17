
import React, { useMemo, useState } from "react";
import { CalendarBlock, Commitment, CaptureItem, StrategicPriority } from "../types";
import { v4 as uuidv4 } from 'uuid';

interface Props {
    items: CaptureItem[];
    commitments: Commitment[];
    blocks: CalendarBlock[];
    priorities: StrategicPriority[];
    isHistorical?: boolean;
    onSave?: (score: number) => void;
    onRestart: () => void;
    onUpdateHistorical?: (data: { items: CaptureItem[], commitments: Commitment[], blocks: CalendarBlock[] }) => void;
}

export const ReviewScreen: React.FC<Props> = ({ items, commitments, blocks, priorities, isHistorical, onSave, onRestart, onUpdateHistorical }) => {
    const [addingToPillar, setAddingToPillar] = useState<string | null>(null);
    const [newTaskTitle, setNewTaskTitle] = useState("");

    const stats = useMemo(() => {
        const discardedCount = items.filter(i => i.status === "discarded").length;
        const scheduledCount = blocks.length;
        
        const pillarBreakdown = priorities.map(p => {
            const priorityCommitments = commitments.filter(c => c.priorityId === p.id);
            const priorityBlocks = blocks.filter(b => 
                priorityCommitments.some(pc => pc.id === b.commitmentId)
            );
            
            let totalMins = 0;
            priorityBlocks.forEach(b => {
                const start = new Date(b.startISO).getTime();
                const end = new Date(b.endISO).getTime();
                totalMins += (end - start) / 60000;
            });

            return {
                id: p.id,
                name: p.name,
                description: p.description,
                isPinned: p.isPinned,
                minutes: totalMins,
                tasks: priorityCommitments.map(pc => {
                    const block = blocks.find(pb => pb.commitmentId === pc.id);
                    return {
                        id: pc.id,
                        blockId: block?.id,
                        title: pc.title,
                        isScheduled: !!block,
                        blockStart: block?.startISO,
                        blockEnd: block?.endISO
                    };
                }).filter(t => t.isScheduled)
            };
        }).filter(p => p.tasks.length > 0 || isHistorical);

        const timeline = [...blocks].sort((a, b) => new Date(a.startISO).getTime() - new Date(b.startISO).getTime());
        const groupedTimeline: Record<string, CalendarBlock[]> = {};
        timeline.forEach(b => {
            const d = new Date(b.startISO).toDateString();
            if (!groupedTimeline[d]) groupedTimeline[d] = [];
            groupedTimeline[d].push(b);
        });

        const totalMinutes = pillarBreakdown.reduce((acc, curr) => acc + curr.minutes, 0);
        const seasonalMinutes = pillarBreakdown.filter(d => d.isPinned).reduce((acc, curr) => acc + curr.minutes, 0);
        const seasonalFocus = totalMinutes > 0 ? (seasonalMinutes / totalMinutes) * 100 : 0;

        return { 
            discardedCount, 
            scheduledCount, 
            pillarBreakdown, 
            groupedTimeline, 
            seasonalFocus, 
            totalMinutes
        };
    }, [items, commitments, blocks, priorities, isHistorical]);

    const formatTime = (iso: string) => {
        return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const handleDeleteTask = (commitmentId: string, blockId: string | undefined) => {
        if (!onUpdateHistorical) return;
        if (!confirm("Remove this task from the session?")) return;
        
        const nextCommitments = commitments.filter(c => c.id !== commitmentId);
        const nextBlocks = blocks.filter(b => b.id !== blockId);
        onUpdateHistorical({ items, commitments: nextCommitments, blocks: nextBlocks });
    };

    const handleEditTask = (commitmentId: string) => {
        if (!onUpdateHistorical) return;
        const commitment = commitments.find(c => c.id === commitmentId);
        if (!commitment) return;

        const newTitle = prompt("Edit Task Title:", commitment.title);
        if (newTitle !== null && newTitle.trim()) {
            const nextCommitments = commitments.map(c => c.id === commitmentId ? { ...c, title: newTitle.trim() } : c);
            onUpdateHistorical({ items, commitments: nextCommitments, blocks });
        }
    };

    const handleAddTaskToPillar = (priorityId: string) => {
        if (!onUpdateHistorical || !newTaskTitle.trim()) {
            setAddingToPillar(null);
            setNewTaskTitle("");
            return;
        }

        const newId = uuidv4();
        const blockId = uuidv4();
        const now = new Date();
        const end = new Date(now.getTime() + 30 * 60000);

        const newCommitment: Commitment = {
            id: newId,
            captureItemId: uuidv4(),
            type: "task",
            title: newTaskTitle.trim(),
            priorityId: priorityId,
            durationMinutes: 30,
            energy: "medium",
        };

        const newBlock: CalendarBlock = {
            id: blockId,
            commitmentId: newId,
            googleEventId: "",
            calendarId: "local",
            startISO: now.toISOString(),
            endISO: end.toISOString(),
            status: "planned",
            lastSyncedAtISO: now.toISOString()
        };

        onUpdateHistorical({
            items: [...items, { id: newCommitment.captureItemId, rawText: newCommitment.title, createdAt: now.toISOString(), status: "triaged" }],
            commitments: [...commitments, newCommitment],
            blocks: [...blocks, newBlock]
        });

        setNewTaskTitle("");
        setAddingToPillar(null);
    };

    return (
        <div className="max-w-7xl mx-auto px-8 md:px-12 py-8 flex flex-col h-full relative overflow-hidden bg-[#FDFDFF]">
            <header className="mb-10 shrink-0 animate-in fade-in slide-in-from-top-4 duration-700">
                <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                    <div>
                        <h1 className="text-4xl font-light text-slate-900 mb-2 tracking-tight">
                            {isHistorical ? "Session Retrospective" : "Review & Commit"}
                        </h1>
                        <p className="text-slate-500 text-lg font-medium">
                            Strategic Alignment: <span className="text-emerald-600 font-bold">{stats.seasonalFocus.toFixed(0)}%</span>
                        </p>
                    </div>
                </div>
            </header>
            
            <div className="flex-1 overflow-y-auto no-scrollbar pb-32 space-y-12">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
                      <div className="text-3xl font-light text-slate-800 mb-1">{items.length}</div>
                      <div className="text-[10px] text-slate-400 uppercase font-black tracking-[0.2em]">Captured</div>
                  </div>
                  <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
                      <div className="text-3xl font-light text-red-400 mb-1">{stats.discardedCount}</div>
                      <div className="text-[10px] text-slate-400 uppercase font-black tracking-[0.2em]">Discarded</div>
                  </div>
                   <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
                      <div className="text-3xl font-light text-indigo-600 mb-1">{stats.scheduledCount}</div>
                      <div className="text-[10px] text-slate-400 uppercase font-black tracking-[0.2em]">Tasks Planned</div>
                  </div>
                  <div className="bg-indigo-600 p-6 rounded-[2.5rem] shadow-xl shadow-indigo-100 text-white flex flex-col items-center justify-center text-center">
                      <div className="text-3xl font-light mb-1">{stats.totalMinutes}m</div>
                      <div className="text-[10px] opacity-70 uppercase font-black tracking-[0.2em]">Focus Capacity</div>
                  </div>
              </div>

              <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex items-center gap-4 mb-8">
                    <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">Pillar Allocation</h2>
                    <div className="h-px flex-1 bg-slate-100"></div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {stats.pillarBreakdown.map(pillar => (
                    <div key={pillar.id} className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col">
                        <header className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-lg font-bold text-slate-800 leading-tight">{pillar.name}</h3>
                                <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mt-1">{pillar.minutes} Minutes Allocated</p>
                            </div>
                            <div className={`p-2 rounded-lg ${pillar.isPinned ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-300'}`}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                            </div>
                        </header>
                        
                        <div className="space-y-3 mb-6 flex-1">
                            {pillar.tasks.map((task, idx) => (
                                <div key={idx} className="flex items-center justify-between group">
                                    <div className="flex items-center gap-3 min-w-0 flex-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-200 group-hover:bg-indigo-500 transition-colors shrink-0"></div>
                                        <span className="text-sm font-medium text-slate-600 truncate">{task.title}</span>
                                    </div>
                                    {isHistorical && (
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                                            <button onClick={() => handleEditTask(task.id)} className="p-1 text-slate-300 hover:text-indigo-500 hover:bg-indigo-50 rounded">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                            </button>
                                            <button onClick={() => handleDeleteTask(task.id, task.blockId)} className="p-1 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                            {isHistorical && addingToPillar === pillar.id ? (
                                <div className="animate-in slide-in-from-top-1 duration-200">
                                    <div className="relative">
                                        <input
                                            autoFocus
                                            className="w-full bg-slate-50 border border-indigo-100 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none"
                                            placeholder="Task title..."
                                            value={newTaskTitle}
                                            onChange={(e) => setNewTaskTitle(e.target.value)}
                                            onKeyDown={(e) => e.key === "Enter" && handleAddTaskToPillar(pillar.id)}
                                            onBlur={() => !newTaskTitle && setAddingToPillar(null)}
                                        />
                                    </div>
                                </div>
                            ) : isHistorical ? (
                                <button onClick={() => setAddingToPillar(pillar.id)} className="w-full py-2 border border-dashed border-slate-100 rounded-xl text-[9px] font-bold text-slate-300 uppercase tracking-widest hover:border-indigo-100 hover:text-indigo-500 transition-all">
                                    + Add Task
                                </button>
                            ) : null}
                        </div>

                        <div className="mt-auto pt-6 border-t border-slate-50">
                             <div className="text-[9px] font-bold text-slate-300 uppercase tracking-widest leading-none mb-2">Pillar Focus</div>
                             <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div 
                                    className={`h-full rounded-full transition-all duration-1000 ${pillar.isPinned ? 'bg-emerald-500' : 'bg-indigo-400'}`} 
                                    style={{ width: `${(pillar.minutes / stats.totalMinutes) * 100}%` }}
                                ></div>
                             </div>
                        </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
                <div className="flex items-center gap-4 mb-8">
                    <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">Timeline Preview</h2>
                    <div className="h-px flex-1 bg-slate-100"></div>
                </div>

                <div className="space-y-10">
                    {(Object.entries(stats.groupedTimeline) as [string, CalendarBlock[]][]).map(([dateStr, dayBlocks]) => (
                        <div key={dateStr} className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                            <div className="lg:col-span-1">
                                <div className="sticky top-0">
                                    <h3 className="text-xl font-light text-slate-800 leading-tight">{dateStr}</h3>
                                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mt-1">{dayBlocks.length} Appointments</p>
                                </div>
                            </div>
                            <div className="lg:col-span-3 space-y-4">
                                {dayBlocks.map(block => {
                                    const commitment = commitments.find(c => c.id === block.commitmentId);
                                    const priority = priorities.find(p => p.id === commitment?.priorityId);
                                    
                                    return (
                                        <div key={block.id} className="bg-white border border-slate-100 p-6 rounded-[2rem] shadow-sm flex items-center justify-between group hover:border-indigo-100 transition-all">
                                            <div className="flex items-center gap-6">
                                                <div className="w-20 text-right">
                                                    <div className="text-[10px] font-black text-slate-300 uppercase">{formatTime(block.startISO)}</div>
                                                    <div className="text-[9px] font-bold text-indigo-400 mt-0.5">{(new Date(block.endISO).getTime() - new Date(block.startISO).getTime()) / 60000}m</div>
                                                </div>
                                                <div className="w-px h-8 bg-slate-100"></div>
                                                <div>
                                                    <h4 className="text-base font-bold text-slate-800 leading-none">{commitment?.title}</h4>
                                                    <div className="flex items-center gap-1.5 mt-2">
                                                        <div className={`w-1.5 h-1.5 rounded-full ${priority?.isPinned ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{priority?.name || "Uncategorized"}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                                {isHistorical && (
                                                    <button onClick={() => handleDeleteTask(block.commitmentId, block.id)} className="p-2 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                                                    </button>
                                                )}
                                                <div className="bg-indigo-50 text-indigo-600 p-2 rounded-xl">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                    {Object.keys(stats.groupedTimeline).length === 0 && (
                        <div className="bg-slate-50 border-2 border-dashed border-slate-100 rounded-[3rem] p-20 text-center opacity-40">
                            <p className="text-xl font-light italic text-slate-400">No events scheduled in this session.</p>
                        </div>
                    )}
                </div>
              </section>
            </div>

            <div className="fixed bottom-12 right-12 z-40 animate-in fade-in slide-in-from-bottom-8 duration-500">
              {isHistorical ? (
                <button
                  onClick={onRestart}
                  className="flex items-center gap-4 bg-slate-900 hover:bg-black text-white px-8 py-5 rounded-2xl font-bold text-lg shadow-2xl shadow-slate-200 transition-all transform hover:-translate-y-1 hover:scale-105 active:scale-95 group"
                >
                  Return to Dashboard
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-1 transition-transform">
                    <line x1="19" y1="12" x2="5" y2="12"></line>
                    <polyline points="12 19 5 12 12 5"></polyline>
                  </svg>
                </button>
              ) : (
                <button
                  onClick={() => onSave && onSave(stats.seasonalFocus)}
                  className="flex items-center gap-4 bg-emerald-600 hover:bg-emerald-700 text-white px-10 py-5 rounded-[2rem] font-bold text-xl shadow-2xl shadow-emerald-200 transition-all transform hover:-translate-y-1 hover:scale-105 active:scale-95 group"
                >
                  <span className="tracking-tight">Finalize & Log Schedule</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                    <polyline points="17 21 17 13 7 13 7 21"></polyline>
                    <polyline points="7 3 7 8 15 8"></polyline>
                  </svg>
                </button>
              )}
            </div>
        </div>
    );
};
