
import React, { useState, useEffect, useMemo } from "react";
import { CalendarBlock, Commitment, StrategicPriority } from "../types";
import { GoogleService } from "../services/googleService";
import { v4 as uuidv4 } from 'uuid';

interface Props {
  commitments: Commitment[];
  priorities: StrategicPriority[];
  onFinish: () => void;
}

type ViewType = "day" | "week";

export const PlanScreen: React.FC<Props> = ({ commitments, priorities, onFinish }) => {
  const [loading, setLoading] = useState(false);
  const [calendars, setCalendars] = useState<any[]>([]);
  const [selectedCalendarId, setSelectedCalendarId] = useState<string>("primary");
  const [signedIn, setSignedIn] = useState(false);
  const [localMode, setLocalMode] = useState(false);
  const [viewType, setViewType] = useState<ViewType>("day");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [gridInterval, setGridInterval] = useState(30);

  // Dragging state
  const [draggingCommitment, setDraggingCommitment] = useState<Commitment | null>(null);
  const [draggingBlockId, setDraggingBlockId] = useState<string | null>(null);
  const [dragOverInfo, setDragOverInfo] = useState<{ day: string, hour: number, minute: number } | null>(null);

  // Track blocks
  const [blocks, setBlocks] = useState<CalendarBlock[]>([]);
  
  const HOUR_HEIGHT = 80; // Pixels per hour

  useEffect(() => {
    const storedBlocks = JSON.parse(localStorage.getItem("ps_calendar_blocks") || "[]");
    setBlocks(storedBlocks);
  }, []);

  const scheduledIds = useMemo(() => new Set(blocks.map(b => b.commitmentId)), [blocks]);
  const unscheduled = commitments.filter(c => !scheduledIds.has(c.id));

  useEffect(() => {
    GoogleService.init().catch(err => {
        console.error("PlanScreen: Google Service init error suppressed for UX", err);
    });
  }, []);

  const handleSignIn = async () => {
    try {
      await GoogleService.signIn();
      setSignedIn(true);
      const cals = await GoogleService.listCalendars();
      setCalendars(cals);
      setLocalMode(false);
    } catch (e) {
      console.error("Sign in failed", e);
    }
  };

  const handleStartOffline = () => {
    setLocalMode(true);
    setSignedIn(false);
  };

  const scheduleEvent = async (commitment: Commitment, start: Date) => {
    const duration = commitment.durationMinutes || gridInterval;
    const end = new Date(start.getTime() + duration * 60000);
    
    setLoading(true);
    try {
        let googleEventId = "";
        
        if (signedIn && !localMode) {
            const event = await GoogleService.createEvent(selectedCalendarId, {
                summary: commitment.title,
                description: `${commitment.description || ""}\n\nManaged by ExecuteOS`,
                start: { dateTime: start.toISOString() },
                end: { dateTime: end.toISOString() },
                extendedProperties: {
                    private: {
                        commitment_id: commitment.id,
                        version: "1"
                    }
                }
            });
            googleEventId = event.id;
        }

        const block: CalendarBlock = {
            id: uuidv4(),
            commitmentId: commitment.id,
            googleEventId: googleEventId,
            calendarId: localMode ? "local" : selectedCalendarId,
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
        alert("Failed to schedule.");
    } finally {
        setLoading(false);
        setDraggingCommitment(null);
        setDragOverInfo(null);
    }
  };

  const moveBlock = async (blockId: string, start: Date) => {
    const blockIndex = blocks.findIndex(b => b.id === blockId);
    if (blockIndex === -1) return;

    const block = blocks[blockIndex];
    const originalStart = new Date(block.startISO);
    const originalEnd = new Date(block.endISO);
    const durationMs = originalEnd.getTime() - originalStart.getTime();
    
    const newEnd = new Date(start.getTime() + durationMs);

    setLoading(true);
    try {
        const updatedBlock = {
            ...block,
            startISO: start.toISOString(),
            endISO: newEnd.toISOString(),
            lastSyncedAtISO: new Date().toISOString()
        };

        const updatedBlocks = [...blocks];
        updatedBlocks[blockIndex] = updatedBlock;
        setBlocks(updatedBlocks);
        localStorage.setItem("ps_calendar_blocks", JSON.stringify(updatedBlocks));
    } catch (e) {
        console.error(e);
        alert("Failed to move event.");
    } finally {
        setLoading(false);
        setDraggingBlockId(null);
        setDragOverInfo(null);
    }
  };

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const daysInWeek = useMemo(() => {
    const start = new Date(currentDate);
    start.setDate(start.getDate() - start.getDay());
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      return d;
    });
  }, [currentDate]);

  const displayedDays = viewType === "day" ? [currentDate] : daysInWeek;

  const onDragOver = (e: React.DragEvent, dayIso: string, hour: number, minute: number) => {
    e.preventDefault();
    if (dragOverInfo?.day !== dayIso || dragOverInfo?.hour !== hour || dragOverInfo?.minute !== minute) {
      setDragOverInfo({ day: dayIso, hour, minute });
    }
  };

  const onDrop = (e: React.DragEvent, date: Date, hour: number, minute: number) => {
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

  const changeDate = (offset: number) => {
    const next = new Date(currentDate);
    next.setDate(next.getDate() + offset);
    setCurrentDate(next);
  };

  const formatTime = (h: number, m: number) => {
    const period = h >= 12 ? 'PM' : 'AM';
    const displayH = h % 12 === 0 ? 12 : h % 12;
    return `${displayH}:${m.toString().padStart(2, '0')} ${period}`;
  };

  const getSubSlots = (interval: number) => {
    const count = 60 / interval;
    return Array.from({ length: count }, (_, i) => i * interval);
  };

  return (
    <div className="flex h-full relative overflow-hidden bg-slate-50">
      {/* Sidebar List */}
      <div className="w-80 border-r border-slate-100 bg-white flex flex-col overflow-hidden shrink-0 z-30">
        <div className="p-6 border-b border-slate-50">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-2">Inventory</h2>
            <h3 className="text-xl font-light text-slate-800">Unscheduled ({unscheduled.length})</h3>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
          {unscheduled.map(c => {
            const priority = priorities.find(p => p.id === c.priorityId);
            return (
              <div 
                key={c.id}
                draggable
                onDragStart={() => {
                  setDraggingCommitment(c);
                  setDraggingBlockId(null);
                }}
                onDragEnd={() => {
                  setDraggingCommitment(null);
                  setDragOverInfo(null);
                }}
                className="p-4 rounded-2xl border border-slate-50 bg-slate-50/30 hover:bg-white hover:border-indigo-100 hover:shadow-lg hover:shadow-indigo-50/50 transition-all cursor-grab active:cursor-grabbing group"
              >
                <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-start gap-3">
                        <h3 className="font-bold text-slate-700 text-xs leading-tight group-hover:text-indigo-600 transition-colors">{c.title}</h3>
                        <span className="text-[9px] bg-white border border-slate-100 px-2 py-0.5 rounded-full font-bold text-slate-400 shrink-0">{c.durationMinutes || gridInterval}m</span>
                    </div>
                    {priority && (
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                        <span className="text-[10px] font-bold text-indigo-500/80 uppercase tracking-wider">{priority.name}</span>
                      </div>
                    )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-100">
             <h4 className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-3">Grid Resolution</h4>
             <div className="flex gap-2">
                {[15, 30, 60].map(d => (
                    <button 
                        key={d}
                        onClick={() => setGridInterval(d)}
                        className={`flex-1 py-2 rounded-xl text-[10px] font-bold transition-all border ${gridInterval === d ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100' : 'bg-white text-slate-500 border-slate-200 hover:border-indigo-200'}`}
                    >
                        {d}m
                    </button>
                ))}
             </div>
        </div>
      </div>

      {/* Main Calendar View */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Calendar Header */}
        <header className="bg-white border-b border-slate-100 px-8 py-4 flex items-center justify-between shrink-0 z-40">
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-1">
                    <button onClick={() => changeDate(-1)} className="p-2 hover:bg-slate-50 rounded-full text-slate-400 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                    </button>
                    <button onClick={() => setCurrentDate(new Date())} className="px-4 py-2 hover:bg-slate-50 rounded-xl text-[10px] font-bold uppercase tracking-widest text-slate-500 transition-colors">Today</button>
                    <button onClick={() => changeDate(1)} className="p-2 hover:bg-slate-50 rounded-full text-slate-400 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                    </button>
                </div>
                <h2 className="text-xl font-light text-slate-800 tracking-tight">
                    {currentDate.toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })}
                </h2>
            </div>

            <div className="flex items-center gap-3">
                <div className="bg-slate-100 p-1 rounded-xl flex">
                    <button onClick={() => setViewType("day")} className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${viewType === "day" ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>Day</button>
                    <button onClick={() => setViewType("week")} className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${viewType === "week" ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>Week</button>
                </div>
                <div className="w-px h-6 bg-slate-100 mx-2"></div>
                {!signedIn && !localMode ? (
                    <button onClick={handleSignIn} className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-100">Connect Calendar</button>
                ) : (
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        <div className={`w-2 h-2 rounded-full ${localMode ? 'bg-amber-400' : 'bg-emerald-400'}`}></div>
                        {localMode ? 'Local Mode' : 'Live Sync'}
                    </div>
                )}
            </div>
        </header>

        {/* Scrollable Grid */}
        <div className="flex-1 overflow-y-auto relative no-scrollbar bg-white">
            <div className="flex min-h-full min-w-full">
                {/* Time Axis */}
                <div className="w-16 flex flex-col border-r border-slate-50 sticky left-0 bg-white z-20 shrink-0">
                    {hours.map(h => (
                        <div key={h} className="h-20 border-b border-slate-50 relative">
                            <span className="absolute -top-2 left-0 w-full text-center text-[9px] font-bold text-slate-300">
                                {h === 0 ? '12 AM' : h < 12 ? `${h} AM` : h === 12 ? '12 PM' : `${h - 12} PM`}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Day Columns */}
                <div className="flex-1 flex min-w-[600px]">
                    {displayedDays.map(day => (
                        <div key={day.toISOString()} className="flex-1 border-r border-slate-50 relative group">
                            {/* Day Header */}
                            <div className="sticky top-0 bg-white/95 backdrop-blur-md z-10 border-b border-slate-50 p-3 text-center transition-all group-hover:bg-indigo-50/20">
                                <span className="block text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                    {day.toLocaleDateString([], { weekday: 'short' })}
                                </span>
                                <span className={`inline-block w-8 h-8 leading-8 rounded-full text-sm font-bold mt-1 ${new Date().toDateString() === day.toDateString() ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-800'}`}>
                                    {day.getDate()}
                                </span>
                            </div>

                            {/* Hour Slots Container */}
                            <div className="relative">
                                {hours.map(h => (
                                    <div key={h} className="h-20 border-b border-slate-50 flex flex-col">
                                        {getSubSlots(gridInterval).map(min => (
                                          <div 
                                              key={min}
                                              className={`flex-1 transition-all border-b last:border-b-0 border-slate-50/30 relative z-0 ${
                                                dragOverInfo?.day === day.toISOString() && 
                                                dragOverInfo?.hour === h && 
                                                dragOverInfo?.minute === min 
                                                  ? 'bg-indigo-500/10' 
                                                  : 'hover:bg-slate-50/80'
                                              }`}
                                              onDragOver={(e) => onDragOver(e, day.toISOString(), h, min)}
                                              onDrop={(e) => onDrop(e, day, h, min)}
                                          />
                                        ))}
                                    </div>
                                ))}

                                {/* GHOST PLACEHOLDER */}
                                {dragOverInfo?.day === day.toISOString() && (draggingCommitment || draggingBlockId) && (() => {
                                    const dragSource = draggingCommitment || blocks.find(b => b.id === draggingBlockId);
                                    if (!dragSource) return null;
                                    
                                    let duration = 0;
                                    if ('durationMinutes' in dragSource) {
                                      duration = dragSource.durationMinutes || gridInterval;
                                    } else {
                                      const start = new Date(dragSource.startISO).getTime();
                                      const end = new Date(dragSource.endISO).getTime();
                                      duration = (end - start) / 60000;
                                    }

                                    const top = (dragOverInfo.hour * HOUR_HEIGHT) + (dragOverInfo.minute / 60 * HOUR_HEIGHT);
                                    const height = (duration / 60 * HOUR_HEIGHT);

                                    return (
                                        <div 
                                            style={{ top: `${top}px`, height: `${height}px` }}
                                            className="absolute left-1.5 right-1.5 border-2 border-dashed border-indigo-400 bg-indigo-50/40 rounded-xl z-20 pointer-events-none animate-pulse flex items-center justify-center"
                                        >
                                            <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest bg-white px-2 py-1 rounded-md shadow-sm">
                                                {formatTime(dragOverInfo.hour, dragOverInfo.minute)}
                                            </span>
                                        </div>
                                    );
                                })()}

                                {/* Events Rendering */}
                                {blocks
                                    .filter(b => new Date(b.startISO).toDateString() === day.toDateString())
                                    .map(b => {
                                        const comm = commitments.find(c => c.id === b.commitmentId);
                                        const start = new Date(b.startISO);
                                        const end = new Date(b.endISO);
                                        const top = (start.getHours() * HOUR_HEIGHT) + (start.getMinutes() / 60 * HOUR_HEIGHT);
                                        const height = ((end.getTime() - start.getTime()) / 60000 / 60 * HOUR_HEIGHT);
                                        
                                        const isDraggingThis = draggingBlockId === b.id;
                                        
                                        return (
                                            <div 
                                                key={b.id}
                                                draggable
                                                onDragStart={() => {
                                                  setDraggingBlockId(b.id);
                                                  setDraggingCommitment(null);
                                                }}
                                                onDragEnd={() => {
                                                  setDraggingBlockId(null);
                                                  setDragOverInfo(null);
                                                }}
                                                style={{ top: `${top}px`, height: `${height}px` }}
                                                className={`absolute left-1.5 right-1.5 border border-indigo-100 rounded-xl shadow-sm overflow-hidden z-10 group/event p-2 transition-all cursor-move active:cursor-grabbing ${
                                                  isDraggingThis ? 'opacity-20 grayscale' : 'bg-white hover:shadow-xl hover:border-indigo-300'
                                                }`}
                                            >
                                                <div className={`w-1 absolute left-0 top-0 bottom-0 ${isDraggingThis ? 'bg-slate-300' : 'bg-indigo-500'}`}></div>
                                                <div className="text-[10px] font-bold text-slate-800 truncate leading-tight">{comm?.title || "Untitled"}</div>
                                                <div className="text-[8px] text-slate-400 mt-1 font-semibold uppercase tracking-wider">
                                                    {formatTime(start.getHours(), start.getMinutes())}
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
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-12 right-12 z-50 animate-in fade-in slide-in-from-bottom-8 duration-500">
        <button
          onClick={onFinish}
          className="flex items-center gap-4 bg-slate-900 hover:bg-black text-white px-8 py-5 rounded-2xl font-bold text-lg shadow-2xl shadow-slate-200 transition-all transform hover:-translate-y-1 hover:scale-105 active:scale-95 group"
        >
          <span className="tracking-tight">View Session Summary</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </button>
      </div>
    </div>
  );
};
