import React, { useState } from "react";
import { StrategicPriority } from "../types";

interface Props {
  priorities: StrategicPriority[];
  onComplete: (rankedPriorities: StrategicPriority[]) => void;
}

export const RankScreen: React.FC<Props> = ({ priorities, onComplete }) => {
  const [list, setList] = useState<StrategicPriority[]>([...priorities]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const move = (index: number, direction: 'up' | 'down') => {
    const newList = [...list];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex < 0 || targetIndex >= newList.length) return;
    
    const temp = newList[index];
    newList[index] = newList[targetIndex];
    newList[targetIndex] = temp;
    setList(newList);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (index: number) => {
    if (draggedIndex === null || draggedIndex === index) return;
    
    const newList = [...list];
    const draggedItem = newList[draggedIndex];
    
    // Remove from old position and insert at new position
    newList.splice(draggedIndex, 1);
    newList.splice(index, 0, draggedItem);
    
    setList(newList);
    setDraggedIndex(null);
  };

  return (
    <div className="max-w-4xl mx-auto px-12 py-8 flex flex-col h-full relative overflow-hidden">
      <header className="mb-12 shrink-0 text-center animate-in fade-in slide-in-from-top-4 duration-700">
        <h1 className="text-3xl font-light text-slate-800 mb-2 tracking-tight">Sequence Your Focus</h1>
        <p className="text-slate-500 max-w-lg mx-auto leading-relaxed text-sm">
          Rank your strategic pillars. The top items dictate where your best time and energy must flow.
        </p>
      </header>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-32">
        <div className="relative max-w-2xl mx-auto flex gap-10 items-stretch">
          
          {/* Refined Priority Scale Indicator - Labels are now horizontal */}
          <div className="shrink-0 flex flex-col items-center select-none py-2 w-24">
            <div className="text-[9px] font-black text-indigo-600 uppercase tracking-[0.2em] mb-4 text-center leading-tight">
              Highest<br/>Priority
            </div>
            
            <div className="flex-1 w-1.5 rounded-full bg-slate-100 relative overflow-hidden shadow-inner">
              <div className="absolute inset-0 bg-gradient-to-b from-indigo-500 via-indigo-300 to-transparent opacity-80"></div>
            </div>
            
            <div className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] mt-4 text-center leading-tight">
              Lowest<br/>Priority
            </div>
          </div>

          {/* Draggable List */}
          <div className="flex-1 space-y-4">
            {list.map((priority, index) => (
              <div 
                key={priority.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(index)}
                className={`group flex items-center gap-6 bg-white p-6 rounded-[2.5rem] border-2 transition-all animate-in fade-in slide-in-from-bottom-4 duration-500 cursor-grab active:cursor-grabbing ${
                  draggedIndex === index ? 'opacity-30' : 'opacity-100'
                } ${
                  draggedIndex !== null && draggedIndex !== index ? 'border-indigo-100 scale-[0.98]' : 'border-slate-50 hover:border-indigo-100'
                } shadow-xl shadow-slate-100/40`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg shrink-0 transition-all ${
                  index === 0 ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100 scale-110' : 'bg-indigo-50 text-indigo-500'
                }`}>
                  {index + 1}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-slate-800 text-lg leading-tight truncate">{priority.name}</h3>
                    {index === 0 && (
                      <span className="bg-indigo-50 text-indigo-600 text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border border-indigo-100 shrink-0">Vital Focus</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 italic line-clamp-1 mt-1 font-medium">{priority.description}</p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={(e) => { e.stopPropagation(); move(index, 'up'); }}
                      disabled={index === 0}
                      className="p-1.5 hover:bg-indigo-50 rounded-lg text-slate-300 hover:text-indigo-600 disabled:opacity-0 transition-all"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); move(index, 'down'); }}
                      disabled={index === list.length - 1}
                      className="p-1.5 hover:bg-indigo-50 rounded-lg text-slate-300 hover:text-indigo-600 disabled:opacity-0 transition-all"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                    </button>
                  </div>
                  <div className="p-2 text-slate-200 cursor-grab hover:text-slate-400 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="12" r="1"/><circle cx="9" cy="5" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="19" r="1"/></svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="fixed bottom-12 right-12 z-40 animate-in fade-in slide-in-from-bottom-8 duration-500">
        <button
          onClick={() => onComplete(list)}
          className="flex items-center gap-4 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-5 rounded-2xl font-bold text-lg shadow-2xl shadow-indigo-200 transition-all transform hover:-translate-y-1 hover:scale-105 active:scale-95 group"
        >
          <span className="tracking-tight">Confirm Strategy & Continue</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </button>
      </div>
    </div>
  );
};
