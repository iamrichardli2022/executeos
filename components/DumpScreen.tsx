
import React, { useState, useRef, useEffect } from "react";
import { CaptureItem } from "../types";
import { v4 as uuidv4 } from 'uuid';

interface Props {
  onNext: (items: CaptureItem[]) => void;
}

export const DumpScreen: React.FC<Props> = ({ onNext }) => {
  const [tasks, setTasks] = useState<string[]>([""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (tasks.length > 0) {
      const lastInput = inputRefs.current[tasks.length - 1];
      if (lastInput && tasks[tasks.length - 1] === "") {
        lastInput.focus();
      }
    }
  }, [tasks.length]);

  const handleAddTask = () => {
    setTasks([...tasks, ""]);
  };

  const handleRemoveTask = (index: number) => {
    if (tasks.length === 1) {
      setTasks([""]);
      return;
    }
    const newTasks = tasks.filter((_, i) => i !== index);
    setTasks(newTasks);
  };

  const handleUpdateTask = (index: number, value: string) => {
    const newTasks = [...tasks];
    newTasks[index] = value;
    setTasks(newTasks);
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTask();
    } else if (e.key === "Backspace" && tasks[index] === "" && tasks.length > 1) {
      e.preventDefault();
      handleRemoveTask(index);
      setTimeout(() => {
        inputRefs.current[index - 1]?.focus();
      }, 0);
    }
  };

  const handleProcess = () => {
    const validLines = tasks.filter(line => line.trim().length > 0);
    if (validLines.length === 0) return;
    
    const newItems: CaptureItem[] = validLines.map(line => ({
      id: uuidv4(),
      rawText: line.trim(),
      createdAt: new Date().toISOString(),
      status: "inbox"
    }));

    onNext(newItems);
  };

  const hasContent = tasks.some(t => t.trim().length > 0);

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto p-6 relative overflow-hidden">
      <header className="mb-6 shrink-0 animate-in fade-in slide-in-from-top-4 duration-700 text-center lg:text-left">
        <h1 className="text-3xl font-light text-slate-800">Brain Dump</h1>
        <p className="text-slate-500 mt-1">
          List out your actions. Press Enter for a new line.
        </p>
      </header>

      <div className="flex-1 bg-white rounded-[2.5rem] shadow-xl shadow-slate-100 border border-slate-100 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-500 mb-24">
        <div className="flex-1 overflow-y-auto p-8 space-y-3 no-scrollbar">
          {tasks.map((task, index) => (
            <div key={index} className="group flex items-center gap-3">
              <div className="flex-1 relative">
                <input
                  ref={el => { inputRefs.current[index] = el; }}
                  className="w-full py-4 px-6 text-xl text-slate-700 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:border-indigo-300 focus:ring-4 focus:ring-indigo-50/50 outline-none transition-all placeholder:text-slate-200"
                  placeholder="What's on your mind?"
                  value={task}
                  onChange={(e) => handleUpdateTask(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                />
              </div>
              <button
                onClick={() => handleRemoveTask(index)}
                className="p-3 text-slate-200 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all rounded-xl hover:bg-red-50"
                title="Remove task"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>
              </button>
            </div>
          ))}
          
          <button
            onClick={handleAddTask}
            className="w-full py-5 px-6 mt-4 text-slate-300 border-2 border-dashed border-slate-100 rounded-2xl hover:border-indigo-200 hover:text-indigo-400 transition-all flex items-center justify-center gap-2 group hover:bg-indigo-50/30"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="group-hover:scale-110 transition-transform"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            Add another item
          </button>
        </div>
      </div>

      {hasContent && (
        <div className="fixed bottom-12 right-12 z-40 animate-in fade-in slide-in-from-bottom-8 duration-500">
          <button
            onClick={handleProcess}
            className="flex items-center gap-4 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-5 rounded-2xl font-bold text-lg shadow-2xl shadow-indigo-200 transition-all transform hover:-translate-y-1 hover:scale-105 active:scale-95 group"
          >
            <span className="tracking-tight">Send to Triage</span>
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
