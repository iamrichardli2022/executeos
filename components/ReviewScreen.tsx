
import React, { useMemo } from "react";
import { CalendarBlock, Commitment, CaptureItem, StrategicPriority } from "../types";
import { Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Cell as RechartsCell } from "recharts";

interface Props {
    items: CaptureItem[];
    commitments: Commitment[];
    blocks: CalendarBlock[];
    priorities: StrategicPriority[];
    isHistorical?: boolean;
    onSave?: (score: number) => void;
    onRestart: () => void;
}

export const ReviewScreen: React.FC<Props> = ({ items, commitments, blocks, priorities, isHistorical, onSave, onRestart }) => {
    
    const stats = useMemo(() => {
        const discarded = items.filter(i => i.status === "discarded").length;
        const scheduled = blocks.length;
        
        const priorityDistribution = priorities.map(p => {
            const priorityCommitmentIds = new Set(commitments.filter(c => c.priorityId === p.id).map(c => c.id));
            const priorityBlocks = blocks.filter(b => priorityCommitmentIds.has(b.commitmentId));
            
            let minutes = 0;
            priorityBlocks.forEach(b => {
                const start = new Date(b.startISO).getTime();
                const end = new Date(b.endISO).getTime();
                minutes += (end - start) / 60000;
            });
            
            return {
                name: p.name,
                value: minutes,
                isPinned: p.isPinned
            };
        }).filter(d => d.value > 0);

        priorityDistribution.sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));

        const totalMinutes = priorityDistribution.reduce((acc, curr) => acc + curr.value, 0);
        const seasonalMinutes = priorityDistribution.filter(d => d.isPinned).reduce((acc, curr) => acc + curr.value, 0);
        const seasonalFocus = totalMinutes > 0 ? (seasonalMinutes / totalMinutes) * 100 : 0;

        return { discarded, scheduled, priorityDistribution, seasonalFocus, totalMinutes };
    }, [items, commitments, blocks, priorities]);

    return (
        <div className="max-w-6xl mx-auto px-12 py-8 flex flex-col h-full relative overflow-hidden">
            <header className="mb-10 shrink-0 text-center md:text-left animate-in fade-in slide-in-from-top-4 duration-700">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <div>
                        <h1 className="text-3xl font-light text-slate-800 mb-1 tracking-tight">
                            {isHistorical ? "Session Retrospective" : "Executive Summary"}
                        </h1>
                        <p className="text-slate-500 text-sm">
                            Session completed. Seasonal alignment is at <span className="text-emerald-600 font-bold">{stats.seasonalFocus.toFixed(0)}%</span>
                        </p>
                    </div>
                </div>
            </header>
            
            <div className="flex-1 overflow-y-auto no-scrollbar pb-24">
              <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-100 mb-8 animate-in fade-in zoom-in-95 duration-500">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 mb-6">Accomplishments</h3>
                <div className="space-y-4">
                  <p className="text-lg font-light text-slate-700 leading-relaxed">
                    You processed <span className="font-bold text-emerald-600">{items.length}</span> individual items from your brain dump. 
                    By filtering out <span className="font-bold text-red-400">{stats.discarded}</span> non-essential tasks, 
                    you successfully committed <span className="font-bold text-emerald-600">{stats.totalMinutes} minutes</span> of high-value strategic time 
                    across <span className="font-bold text-emerald-600">{stats.scheduled}</span> calendar blocks.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                  <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-slate-100 border border-slate-50">
                      <div className="text-3xl font-light text-slate-800 mb-1">{items.length}</div>
                      <div className="text-[10px] text-slate-400 uppercase font-bold tracking-[0.2em]">Thoughts Captured</div>
                  </div>
                  <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-slate-100 border border-slate-50">
                      <div className="text-3xl font-light text-red-400 mb-1">{stats.discarded}</div>
                      <div className="text-[10px] text-slate-400 uppercase font-bold tracking-[0.2em]">Noise Removed</div>
                  </div>
                   <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-slate-100 border border-slate-50">
                      <div className="text-3xl font-light text-emerald-500 mb-1">{stats.scheduled}</div>
                      <div className="text-[10px] text-slate-400 uppercase font-bold tracking-[0.2em]">Blocks Created</div>
                  </div>
                  <div className="bg-emerald-600 p-6 rounded-[2rem] shadow-2xl shadow-emerald-100 text-white">
                      <div className="text-3xl font-light mb-1">{stats.totalMinutes}m</div>
                      <div className="text-[10px] opacity-70 uppercase font-bold tracking-[0.2em]">Strategy Time</div>
                  </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                  <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl shadow-slate-100/50 border border-slate-50">
                      <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 mb-8">Strategic Distribution</h3>
                      <div className="h-64 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={stats.priorityDistribution} layout="vertical" margin={{ left: 20 }}>
                                  <XAxis type="number" hide />
                                  <YAxis dataKey="name" type="category" stroke="#cbd5e1" fontSize={11} tickLine={false} axisLine={false} />
                                  <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'}} />
                                  <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={24}>
                                      {stats.priorityDistribution.map((entry, index) => (
                                          <RechartsCell key={`cell-${index}`} fill={entry.isPinned ? '#10b981' : '#f1f5f9'} />
                                      ))}
                                  </Bar>
                              </BarChart>
                          </ResponsiveContainer>
                      </div>
                  </div>

                  <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl shadow-slate-100/50 border border-slate-50 flex flex-col items-center justify-center text-center">
                      <div className="relative w-48 h-48 mb-6">
                          <svg className="w-full h-full transform -rotate-90">
                              <circle cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-50" />
                              <circle 
                                  cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="12" fill="transparent" 
                                  className="text-emerald-600 transition-all duration-[1500ms] ease-out" 
                                  strokeDasharray={2 * Math.PI * 80} 
                                  strokeDashoffset={2 * Math.PI * 80 * (1 - stats.seasonalFocus / 100)} 
                                  strokeLinecap="round"
                              />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                              <span className="text-4xl font-light text-slate-800">{stats.seasonalFocus.toFixed(0)}%</span>
                              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-[0.2em] mt-1">Alignment</span>
                          </div>
                      </div>
                  </div>
              </div>
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
                  <span className="tracking-tight">Finalize & Store Session</span>
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
