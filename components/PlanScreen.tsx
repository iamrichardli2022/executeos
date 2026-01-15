
import React, { useState, useEffect, useMemo } from "react";
import { CalendarBlock, Commitment, StrategicPriority } from "../types";
import { GoogleService } from "../services/googleService";
import { v4 as uuidv4 } from 'uuid';

interface Props {
  commitments: Commitment[];
  priorities: StrategicPriority[];
  onFinish: () => void;
}

type ViewType = "day" | "week" | "month";

export const PlanScreen: React.FC<Props> = ({ commitments, priorities, onFinish }) => {
  const [loading, setLoading] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [localMode, setLocalMode] = useState(true);
  const [viewType, setViewType] = useState<ViewType>("week");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [gridInterval, setGridInterval] = useState(30);
  const [taskLists, setTaskLists] = useState<any[]>([]);

  // Dragging state
  const [draggingCommitment, setDraggingCommitment] = useState<Commitment | null>(null);
  const [draggingBlockId, setDraggingBlockId] = useState<string | null>(null);
  const [dragOverInfo, setDragOverInfo] = useState<{ date: Date, hour: number, minute: number } | null>(null);

  // Constants for precision
  const HOUR_HEIGHT = 120; 

  // State for blocks
  const [blocks, setBlocks] = useState<CalendarBlock[]>([]);
  
  useEffect(() => {
    const storedBlocks = JSON.parse(localStorage.getItem("ps_calendar_blocks") || "[]");
    setBlocks(storedBlocks);
    GoogleService.init().catch(e => console.error("Google Init Failed", e));
  }, []);

  const scheduledIds = useMemo(() => new Set(blocks.map(b => b.commitmentId)), [blocks]);
  const unscheduled = commitments.filter(c => !scheduledIds.has(c.id));

  const handleSignIn = async () => {
    try {
      setLoading(true);
      await GoogleService.signIn();
      const lists = await GoogleService.listTaskLists();
      setTaskLists(lists);
      setSignedIn(true);
      setLocalMode(false);
    } catch (e) {
      console.error("Sign in failed", e);
      alert("Google connection failed. You can continue in Local Mode.");
      setLocalMode(true);
    } finally {
      setLoading(false);
    }
  };

  const scheduleEvent = async (commitment: Commitment, start: Date) => {
    const duration = commitment.durationMinutes || 60;
    const end = new Date(start.getTime() + duration * 60000);
    
    setLoading(true);
    try {
        let googleEventId = "";
        if (signedIn && !localMode) {
            const event = await GoogleService.createEvent("primary", {
                summary: commitment.title,
                description: commitment.description || `Managed by ExecuteOS`,
                start: { dateTime: start.toISOString() },
                end: { dateTime: end.toISOString() }
            });
            googleEventId = event.id;
        }

        const block: CalendarBlock = {
            id: uuidv4(),
            commitmentId: commitment.id,
            googleEventId: googleEventId,
            calendarId: localMode ? "local" : "primary",
            startISO: start.toISOString(),
            endISO: end.toISOString(),
            status: "planned",
            lastSyncedAtISO: new Date().toISOString()
        };
        
        const updatedBlocks = [...blocks, block];
        setBlocks(updatedBlocks);
        localStorage.setItem("ps_calendar_blocks", JSON.stringify(updatedBlocks));
    } catch (e) {
        console.error(e);
        alert("Scheduling failed.");
    } finally {
        setLoading(false);
        setDraggingCommitment(null);
        setDragOverInfo(null);
    }
  };

  const sendToTasks = async (commitment: Commitment) => {
    if (!signedIn || localMode) {
      alert("Please sign in to Google to use Tasks.");
      return;
    }

    setLoading(true);
    try {
      const defaultListId = taskLists[0]?.id || "@default";
      await GoogleService.createTask(defaultListId, {
        title: commitment.title,
        notes: commitment.description
      });
      
      // Mark as "scheduled" by creating a ghost block or similar
      // For now, let's treat Tasks as "scheduled elsewhere"
      const block: CalendarBlock = {
          id: uuidv4(),
          commitmentId: commitment.id,
          googleEventId: "task-id",
          calendarId: "tasks",
          startISO: new Date().toISOString(),
          endISO: new Date().toISOString(),
          status: "completed",
          lastSyncedAtISO: new Date().toISOString()
      };
      
      const updatedBlocks = [...blocks, block];
      setBlocks(updatedBlocks);
      localStorage.setItem("ps_calendar_blocks", JSON.stringify(updatedBlocks));
      alert("Sent to Google Tasks!");
    } catch (e) {
      console.error(e);
      alert("Failed to send to Tasks.");
    } finally {
      setLoading(false);
    }
  };

  const moveBlock = async (blockId: string, newStart: Date) => {
    const blockIndex = blocks.findIndex(b => b.id === blockId);
    if (blockIndex === -1) return;

    const block = blocks[blockIndex];
    const durationMs = new Date(block.endISO).getTime() - new Date(block.startISO).getTime();
    const newEnd = new Date(newStart.getTime() + durationMs);

    setLoading(true);
    try {
        const updatedBlock = {
            ...block,
            startISO: newStart.toISOString(),
            endISO: newEnd.toISOString(),
            lastSyncedAtISO: new Date().toISOString()
        };

        const updatedBlocks = [...blocks];
        updatedBlocks[blockIndex] = updatedBlock;
        setBlocks(updatedBlocks);
        localStorage.setItem("ps_calendar_blocks", JSON.stringify(updatedBlocks));
    } finally {
        setLoading(false);
        setDraggingBlockId(null);
        setDragOverInfo(null);
    }
  };

  const deleteBlock = (blockId: string) => {
    if(!confirm("Remove from schedule?")) return;
    const updated = blocks.filter(b => b.id !== blockId);
    setBlocks(updated);
    localStorage.setItem("ps_calendar_blocks", JSON.stringify(updated));
  };

  const daysInWeek = useMemo(() => {
    const start = new Date(currentDate);
    start.setDate(start.getDate() - start.getDay());
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      return d;
    });
  }, [currentDate]);

  const monthGrid = useMemo(() => {
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const startOffset = firstDay.getDay();
    const grid = [];
    for (let i = startOffset; i > 0; i--) {
        const d = new Date(firstDay);
        d.setDate(d.getDate() - i);
        grid.push({ date: d, currentMonth: false });
    }
    for (let i = 1; i <= lastDay.getDate(); i++) {
        grid.push({ date: new Date(currentDate.getFullYear(), currentDate.getMonth(), i), currentMonth: true });
    }
    const remaining = 42 - grid.length;
    for (let i = 1; i <= remaining; i++) {
        const d = new Date(lastDay);
        d.setDate(d.getDate() + i);
        grid.push({ date: d, currentMonth: false });
    }
    return grid;
  }, [currentDate]);

  const changeDate = (offset: number) => {
    const next = new Date(currentDate);
    if (viewType === "day") next.setDate(next.getDate() + offset);
    if (viewType === "week") next.setDate(next.getDate() + (offset * 7));
    if (viewType === "month") next.setMonth(next.getMonth() + offset);
    setCurrentDate(next);
  };

  const formatTime = (h: number, m: number) => {
    const period = h >= 12 ? 'PM' : 'AM';
    const displayH = h % 12 === 0 ? 12 : h % 12;
    return `${displayH}:${m.toString().padStart(2, '0')} ${period}`;
  };

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const slotsPerHour = 60 / gridInterval;

  const onSlotDragOver = (e: React.DragEvent, date: Date, hour: number, minute: number) => {
      e.preventDefault();
      const infoDate = new Date(date);
      infoDate.setHours(hour, minute, 0, 0);
      if (!dragOverInfo || dragOverInfo.date.getTime() !== infoDate.getTime()) {
          setDragOverInfo({ date: infoDate, hour, minute });
      }
  };

  const onSlotDrop = (e: React.DragEvent, date: Date, hour: number, minute: number) => {
      e.preventDefault();
      const start = new Date(date);
      start.setHours(hour, minute, 0, 0);

      if (draggingCommitment) {
          scheduleEvent(draggingCommitment, start);
      } else if (draggingBlockId) {
          moveBlock(draggingBlockId, start);
      }
      setDragOverInfo(null);
  };

  return (
    <div className="flex h-full bg-white overflow-hidden relative">
      <aside className="w-80 border-r border-slate-100 flex flex-col z-50 bg-white shadow-2xl shadow-slate-200">
        <header className="p-6 border-b border-slate-50 shrink-0">
          <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Inventory</h2>
          <div className="text-2xl font-light text-slate-800">{unscheduled.length} Remaining</div>
        </header>

        <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-3">
          {unscheduled.map(c => {
            const p = priorities.find(pri => pri.id === c.priorityId);
            return (
              <div 
                key={c.id}
                draggable
                onDragStart={() => {
                  setDraggingCommitment(c);
                  setDraggingBlockId(null);
                }}
                className="bg-slate-50 border border-slate-100 p-4 rounded-2xl cursor-grab active:cursor-grabbing hover:bg-white hover:border-indigo-100 hover:shadow-lg transition-all group"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h4 className="text-xs font-bold text-slate-700 leading-tight group-hover:text-indigo-600">{c.title}</h4>
                  <span className="text-[9px] font-black text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-lg shrink-0">{c.durationMinutes}m</span>
                </div>
                {p && (
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{p.name}</span>
                  </div>
                )}
                <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => sendToTasks(c)}
                    className="w-full text-[9px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 py-1.5 rounded-lg border border-emerald-100 hover:bg-emerald-100"
                  >
                    Send to Google Tasks
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-6 border-t border-slate-50 bg-slate-50/30 space-y-6 shrink-0">
            {!signedIn ? (
              <button 
                onClick={handleSignIn}
                className="w-full flex items-center justify-center gap-3 bg-white border border-slate-200 py-4 rounded-2xl shadow-sm hover:shadow-md hover:border-indigo-200 transition-all group"
              >
                <svg width="18" height="18" viewBox="0 0 18 18"><path fill="#4285F4" d="M17.64 9.2c0-.63-.06-1.25-.16-1.84H9v3.49h4.84a4.14 4.14 0 0 1-1.8 2.71v2.26h2.91C16.65 13.98 18 11.5 18 8.6c0-.21-.02-.42-.05-.63z"/><path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.91-2.26c-.8.54-1.83.86-3.05.86-2.34 0-4.32-1.58-5.03-3.7H.95v2.3C2.43 15.89 5.5 18 9 18z"/><path fill="#FBBC05" d="M3.97 10.71c-.18-.54-.28-1.12-.28-1.71s.1-1.17.28-1.71V4.99H.95A8.996 8.996 0 0 0 0 9c0 1.45.35 2.82.95 4.01l3.02-2.3z"/><path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.47.89 11.43 0 9 0 5.5 0 2.43 2.11.95 4.99l3.02 2.3c.71-2.12 2.69-3.7 5.03-3.7z"/></svg>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 group-hover:text-indigo-600">Connect Google</span>
              </button>
            ) : (
              <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-2xl border border-emerald-100">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Google Connected</span>
              </div>
            )}
            
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3">Grid Precision</h3>
              <div className="grid grid-cols-3 gap-2">
                  {[15, 30, 60].map(int => (
                      <button 
                          key={int}
                          onClick={() => setGridInterval(int)}
                          className={`py-2 rounded-xl text-[10px] font-black uppercase transition-all ${gridInterval === int ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-white border border-slate-200 text-slate-400 hover:border-indigo-200'}`}
                      >
                          {int}m
                      </button>
                  ))}
              </div>
            </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden relative bg-slate-50">
        <nav className="h-16 border-b border-slate-100 px-8 flex items-center justify-between shrink-0 bg-white z-[50]">
          <div className="flex items-center gap-6">
            <div className="flex items-center bg-slate-100 p-1 rounded-2xl">
                {["day", "week", "month"].map(t => (
                  <button 
                    key={t}
                    onClick={() => setViewType(t as ViewType)} 
                    className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewType === t ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    {t}
                  </button>
                ))}
            </div>
            
            <div className="flex items-center gap-3">
                <button onClick={() => changeDate(-1)} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-all"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg></button>
                <h3 className="text-sm font-bold text-slate-800 tracking-tight min-w-[120px] text-center uppercase tracking-widest">
                    {viewType === "month" 
                        ? currentDate.toLocaleDateString([], { month: 'long', year: 'numeric' })
                        : currentDate.toLocaleDateString([], { month: 'short', day: 'numeric' })}
                </h3>
                <button onClick={() => changeDate(1)} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-all"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg></button>
            </div>
          </div>

          <button onClick={onFinish} className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold text-xs hover:bg-black transition-all">
            Review Plan
          </button>
        </nav>

        {viewType !== "month" ? (
          <div className="flex-1 overflow-auto relative flex flex-col bg-slate-50 no-scrollbar">
            
            {/* STICKY DAY HEADERS ROW */}
            <div className="flex sticky top-0 z-[45] bg-white border-b border-slate-100 shrink-0">
                <div className="w-20 bg-white border-r border-slate-100 shrink-0"></div>
                <div className="flex-1 flex min-w-[1200px]">
                    {(viewType === "day" ? [currentDate] : daysInWeek).map(day => (
                        <div key={day.toISOString()} className="flex-1 h-16 flex flex-col items-center justify-center border-r border-slate-100 bg-white/95 backdrop-blur-md">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{day.toLocaleDateString([], { weekday: 'short' })}</span>
                            <span className={`text-sm font-bold mt-1 tabular-nums ${new Date().toDateString() === day.toDateString() ? 'text-indigo-600 bg-indigo-50 px-2 rounded-lg' : 'text-slate-800'}`}>{day.getDate()}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* MAIN GRID BODY */}
            <div className="flex relative min-h-fit">
                {/* STICKY TIME LABELS COLUMN */}
                <div className="w-20 sticky left-0 z-40 bg-white border-r border-slate-100 shrink-0">
                    {hours.map(h => (
                        <div key={h} className="relative" style={{ height: `${HOUR_HEIGHT}px` }}>
                            <span className="absolute -top-2.5 right-3 text-[10px] font-black text-slate-300 uppercase tabular-nums bg-white px-1">
                                {h === 0 ? '12 AM' : h < 12 ? `${h} AM` : h === 12 ? '12 PM' : `${h - 12} PM`}
                            </span>
                        </div>
                    ))}
                </div>

                {/* DAY GRID COLUMNS */}
                <div className="flex-1 flex min-w-[1200px] relative">
                    {(viewType === "day" ? [currentDate] : daysInWeek).map(day => (
                        <div key={day.toISOString()} className="flex-1 border-r border-slate-100 relative group">
                            
                            {/* GRID LINES & DROP ZONES */}
                            <div className="relative" style={{ height: `${24 * HOUR_HEIGHT}px` }}>
                                {hours.map(h => (
                                    <React.Fragment key={h}>
                                        {/* Major hour line */}
                                        <div className="absolute left-0 right-0 border-b border-slate-200 pointer-events-none" style={{ top: `${h * HOUR_HEIGHT}px`, height: '1px' }}></div>
                                        
                                        {/* Sub-hour Interval lines */}
                                        {Array.from({ length: slotsPerHour }).map((_, i) => {
                                            const min = i * gridInterval;
                                            return (
                                                <div 
                                                    key={min}
                                                    className={`absolute left-0 right-0 border-b border-slate-100/40 transition-all z-0 hover:bg-indigo-500/5`}
                                                    style={{ 
                                                        top: `${(h + min/60) * HOUR_HEIGHT}px`, 
                                                        height: `${(gridInterval/60) * HOUR_HEIGHT}px`
                                                    }}
                                                    onDragOver={(e) => onSlotDragOver(e, day, h, min)}
                                                    onDrop={(e) => onSlotDrop(e, day, h, min)}
                                                />
                                            );
                                        })}
                                    </React.Fragment>
                                ))}

                                {/* DRAG PREVIEW */}
                                {dragOverInfo && (draggingCommitment || draggingBlockId) && dragOverInfo.date.toDateString() === day.toDateString() && (() => {
                                    const commitment = draggingCommitment || commitments.find(c => {
                                        const b = blocks.find(blk => blk.id === draggingBlockId);
                                        return b?.commitmentId === c.id;
                                    });
                                    const duration = commitment?.durationMinutes || 60;
                                    const top = (dragOverInfo.hour + dragOverInfo.minute / 60) * HOUR_HEIGHT;
                                    const height = (duration / 60) * HOUR_HEIGHT;
                                    return (
                                        <div 
                                            style={{ top: `${top}px`, height: `${height}px` }}
                                            className="absolute left-1 right-1 border-2 border-dashed border-indigo-400 bg-indigo-500/10 rounded-xl z-20 pointer-events-none animate-pulse flex flex-col items-center justify-center"
                                        >
                                            <div className="bg-indigo-600 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded shadow-lg">
                                                {formatTime(dragOverInfo.hour, dragOverInfo.minute)}
                                            </div>
                                        </div>
                                    );
                                })()}

                                {/* SCHEDULED ITEMS */}
                                {blocks.filter(b => new Date(b.startISO).toDateString() === day.toDateString()).map(block => {
                                    const commitment = commitments.find(c => c.id === block.commitmentId);
                                    const priority = priorities.find(p => p.id === commitment?.priorityId);
                                    const start = new Date(block.startISO);
                                    const end = new Date(block.endISO);
                                    const durationMin = (end.getTime() - start.getTime()) / 60000;
                                    const top = (start.getHours() + start.getMinutes() / 60) * HOUR_HEIGHT;
                                    const height = (durationMin / 60) * HOUR_HEIGHT;
                                    const isDragging = draggingBlockId === block.id;

                                    return (
                                        <div 
                                            key={block.id}
                                            draggable
                                            onDragStart={() => {
                                                setDraggingBlockId(block.id);
                                                setDraggingCommitment(null);
                                            }}
                                            style={{ top: `${top}px`, height: `${height}px` }}
                                            className={`absolute left-1 right-1 border-l-[6px] rounded-xl shadow-md p-3 overflow-visible z-10 cursor-move transition-all flex flex-col group/block bg-white hover:shadow-2xl hover:z-[60] ${isDragging ? 'opacity-20 grayscale border-slate-300' : 'border-indigo-600'}`}
                                        >
                                            <div className="flex justify-between items-start gap-1">
                                                <h5 className="text-[11px] font-bold text-slate-800 leading-tight truncate">{commitment?.title || "Event"}</h5>
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); deleteBlock(block.id); }}
                                                    className="opacity-0 group-hover/block:opacity-100 p-1 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all shrink-0"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                                                </button>
                                            </div>
                                            <div className="mt-auto flex flex-col gap-0.5 text-[9px] font-black text-slate-400 tabular-nums">
                                                <div className="flex items-center gap-1.5 uppercase tracking-wider text-slate-300">
                                                  {formatTime(start.getHours(), start.getMinutes())} – {formatTime(end.getHours(), end.getMinutes())}
                                                </div>
                                                <span className="text-indigo-400 font-bold">{durationMin}m</span>
                                            </div>

                                            {/* HOVER TOOLTIP */}
                                            <div className="absolute left-full ml-4 top-0 w-64 bg-slate-900 text-white rounded-[1.5rem] p-5 shadow-2xl opacity-0 pointer-events-none group-hover/block:opacity-100 transition-all z-[100] translate-x-2 group-hover/block:translate-x-0">
                                                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 mb-2">Details</div>
                                                <h6 className="text-sm font-bold mb-3 leading-snug">{commitment?.title}</h6>
                                                <div className="grid grid-cols-2 gap-4 border-t border-slate-800 pt-3">
                                                    <div>
                                                      <div className="text-[9px] font-black text-slate-500 uppercase mb-1">Duration</div>
                                                      <div className="text-xs font-bold">{durationMin} Minutes</div>
                                                    </div>
                                                    <div>
                                                      <div className="text-[9px] font-black text-slate-500 uppercase mb-1">Priority</div>
                                                      <div className="text-xs font-bold truncate text-indigo-300">{priority?.name || "None"}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
          </div>
        ) : (
          /* MONTH VIEW */
          <div className="flex-1 overflow-y-auto grid grid-cols-7 bg-slate-50 p-6 gap-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                  <div key={d} className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">{d}</div>
              ))}
              {monthGrid.map(({ date, currentMonth }, i) => {
                  const dayBlocks = blocks.filter(b => new Date(b.startISO).toDateString() === date.toDateString());
                  return (
                      <div 
                        key={i} 
                        className={`min-h-[120px] border border-slate-200/50 rounded-[2rem] p-4 flex flex-col gap-1 transition-all ${currentMonth ? 'bg-white hover:border-indigo-100' : 'bg-slate-50/50 opacity-20 grayscale'}`}
                      >
                          <div className={`text-[10px] font-black ${new Date().toDateString() === date.toDateString() ? 'text-indigo-600' : 'text-slate-400'}`}>
                              {date.getDate()}
                          </div>
                          <div className="flex-1 overflow-y-auto no-scrollbar space-y-1 mt-2">
                              {dayBlocks.map(b => (
                                  <div key={b.id} className="text-[9px] font-bold bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded-lg truncate border border-indigo-100/50">
                                      {commitments.find(c => c.id === b.commitmentId)?.title || "Event"}
                                  </div>
                              ))}
                          </div>
                      </div>
                  );
              })}
          </div>
        )}
      </main>

      {loading && (
        <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-[200] flex flex-col items-center justify-center gap-4 animate-in fade-in">
           <div className="w-12 h-12 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin"></div>
           <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Syncing Intelligence</p>
        </div>
      )}
    </div>
  );
};
