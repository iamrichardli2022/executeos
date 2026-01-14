
import React, { useState, useEffect } from "react";
import { DumpScreen } from "./components/DumpScreen";
import { SortScreen } from "./components/SortScreen";
import { PlanScreen } from "./components/PlanScreen";
import { ReviewScreen } from "./components/ReviewScreen";
import { OnboardingScreen } from "./components/OnboardingScreen";
import { RankScreen } from "./components/RankScreen";
import { StorageService } from "./services/storage";
import { CaptureItem, Commitment, StrategicPriority, CalendarBlock } from "./types";

type Screen = "strategy" | "rank" | "dump" | "sort" | "plan" | "summary";

const AnimatedLogo = ({ size = "large" }: { size?: "small" | "large" }) => {
  const isLarge = size === "large";
  return (
    <div className={`relative flex items-center justify-center ${isLarge ? 'w-24 h-24' : 'w-10 h-10'} group`}>
      {/* Outer Ring Animation */}
      <div className={`absolute inset-0 border-2 border-emerald-200 rounded-[2rem] animate-ring-pulse opacity-20`}></div>
      <div className={`absolute inset-0 border border-emerald-100 rounded-[1.8rem] animate-ring-pulse delay-700 opacity-10`}></div>
      
      {/* Main Square */}
      <div className={`relative z-10 w-full h-full bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-[1.8rem] flex items-center justify-center text-white font-black shadow-2xl shadow-emerald-200 overflow-hidden transform group-hover:scale-105 transition-transform duration-500`}>
        <div className="relative z-20 animate-in zoom-in-50 duration-700">
           <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width={isLarge ? "48" : "20"} 
            height={isLarge ? "48" : "20"} 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="3.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className="animate-draw"
          >
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
        
        {/* Shine Animation */}
        <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 skew-x-12"></div>
      </div>
    </div>
  );
};

const IntroModal = ({ onStart }: { onStart: () => void }) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-xl animate-in fade-in duration-700">
    <div className="bg-white max-w-2xl w-full rounded-[3.5rem] shadow-[0_32px_64px_-15px_rgba(0,0,0,0.2)] overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-12 duration-1000 border border-white/20">
      <div className="p-12 relative">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-emerald-50 rounded-full blur-3xl opacity-60"></div>
        
        <div className="relative z-10">
          <div className="flex justify-center mb-8">
            <AnimatedLogo size="large" />
          </div>
          
          <div className="text-center mb-10">
            <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-[0.2em] mb-4">
              Priority Operating System
            </span>
            <h2 className="text-4xl font-light text-slate-800 mb-4 tracking-tight leading-tight">
              Align your time with <br/>your highest intentions.
            </h2>
            <p className="text-slate-500 text-lg font-normal max-w-md mx-auto">
              ExecuteOS: A calm space to transform overwhelming thoughts into a focused, strategic calendar.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8 mb-12">
            <div className="flex gap-4 group">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-emerald-600 shrink-0 border border-slate-100 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-1">Strategic Pillars</h4>
                <p className="text-[13px] text-slate-500 leading-relaxed">Define the core areas of focus that anchor your seasonal goals.</p>
              </div>
            </div>
            <div className="flex gap-4 group">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-emerald-600 shrink-0 border border-slate-100 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7 10l5 5 5-5M7 6l5 5 5-5"/></svg>
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-1">Rank Focus</h4>
                <p className="text-[13px] text-slate-500 leading-relaxed">Sequence your priorities to guide your best energy and time.</p>
              </div>
            </div>
            <div className="flex gap-4 group">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-emerald-600 shrink-0 border border-slate-100 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-1">Brain Dump</h4>
                <p className="text-[13px] text-slate-500 leading-relaxed">Empty your mind without judgment. Capture every thought.</p>
              </div>
            </div>
            <div className="flex gap-4 group">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-emerald-600 shrink-0 border border-slate-100 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-1">Flow Into Calendar</h4>
                <p className="text-[13px] text-slate-500 leading-relaxed">Triage noise and drag meaningful tasks directly into your day.</p>
              </div>
            </div>
          </div>

          <button 
            onClick={onStart}
            className="w-full bg-slate-900 hover:bg-black text-white py-6 rounded-[2rem] font-bold text-lg transition-all shadow-2xl shadow-slate-200 flex items-center justify-center gap-3 active:scale-95 group"
          >
            Start Operating
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
          </button>
        </div>
      </div>
    </div>
  </div>
);

const App = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>("strategy");
  const [showIntro, setShowIntro] = useState(false);
  
  const [priorities, setPriorities] = useState<StrategicPriority[]>([]);
  const [items, setItems] = useState<CaptureItem[]>([]);
  const [commitments, setCommitments] = useState<Commitment[]>([]);
  const [blocks, setBlocks] = useState<CalendarBlock[]>([]);

  useEffect(() => {
    const storedPriorities = StorageService.getPriorities();
    setPriorities(storedPriorities);
    setItems(StorageService.getCaptureItems());
    setCommitments(StorageService.getCommitments());
    setBlocks(StorageService.getCalendarBlocks());
    
    if (storedPriorities.length > 0) {
      setCurrentScreen("dump");
    } else {
      setCurrentScreen("strategy");
    }

    const introSeen = localStorage.getItem("ps_intro_seen");
    if (!introSeen) {
      setShowIntro(true);
    }
  }, []);

  const handlePrioritySetupComplete = (newPriorities: StrategicPriority[]) => {
    setPriorities(newPriorities);
    StorageService.savePriorities(newPriorities);
    setCurrentScreen("rank");
  };

  const handleRankComplete = (rankedPriorities: StrategicPriority[]) => {
    setPriorities(rankedPriorities);
    StorageService.savePriorities(rankedPriorities);
    setCurrentScreen("dump");
  };

  const handleDumpNext = (newItems: CaptureItem[]) => {
    const updated = [...items, ...newItems];
    setItems(updated);
    StorageService.saveCaptureItems(updated);
    setCurrentScreen("sort");
  };

  const handleUpdateItems = (updatedItems: CaptureItem[]) => {
    setItems(updatedItems);
    StorageService.saveCaptureItems(updatedItems);
  };

  const handleUpdateCommitments = (updatedCommitments: Commitment[]) => {
    setCommitments(updatedCommitments);
    StorageService.saveCommitments(updatedCommitments);
  };

  const handleSortFinish = () => {
    const stored = StorageService.getCommitments();
    setCommitments(stored);
    setCurrentScreen("plan");
  };

  const handlePlanFinish = () => {
    const storedBlocks = StorageService.getCalendarBlocks();
    setBlocks(storedBlocks);
    setCurrentScreen("summary");
  };

  const navScreens: Screen[] = ["strategy", "rank", "dump", "sort", "plan", "summary"];

  const handleBack = () => {
    const currentIndex = navScreens.indexOf(currentScreen);
    if (currentIndex > 0) {
      setCurrentScreen(navScreens[currentIndex - 1]);
    }
  };

  const closeIntro = () => {
    localStorage.setItem("ps_intro_seen", "true");
    setShowIntro(false);
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-slate-50 text-slate-900 font-sans flex flex-col">
      {showIntro && <IntroModal onStart={closeIntro} />}
      
      <nav className="bg-white border-b border-slate-200 px-8 py-4 sticky top-0 z-50 shrink-0">
        <div className="flex justify-between items-center max-w-[1400px] mx-auto">
          <div className="flex items-center gap-4">
              {currentScreen !== "strategy" && (
                <button 
                  onClick={handleBack}
                  className="p-2 hover:bg-slate-50 rounded-full text-slate-400 transition-colors"
                  title="Back"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                </button>
              )}
              <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setCurrentScreen("dump")}>
                  <AnimatedLogo size="small" />
                  <span className="font-bold text-xl tracking-tight text-slate-800 hidden md:block group-hover:text-emerald-600 transition-colors">ExecuteOS</span>
              </div>
          </div>
          
          <div className="flex gap-1 items-center">
              {navScreens.map((s, idx) => (
                  <div key={s} className="flex items-center">
                      <button 
                        className={`px-3 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest transition-all ${currentScreen === s ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'text-slate-400 hover:text-slate-600'}`}
                        onClick={() => setCurrentScreen(s)}
                      >
                          {s}
                      </button>
                      {idx < navScreens.length - 1 && <div className="w-2 h-px bg-slate-100 mx-1"></div>}
                  </div>
              ))}
          </div>
        </div>
      </nav>

      <main className="flex-1 relative overflow-hidden">
        {currentScreen === "strategy" && (
          <OnboardingScreen 
              initialPriorities={priorities} 
              onComplete={handlePrioritySetupComplete} 
          />
        )}
        {currentScreen === "rank" && (
          <RankScreen 
              priorities={priorities} 
              onComplete={handleRankComplete} 
          />
        )}
        {currentScreen === "dump" && <DumpScreen onNext={handleDumpNext} />}
        {currentScreen === "sort" && (
            <SortScreen 
                items={items} 
                commitments={commitments}
                priorities={priorities} 
                onUpdateItems={handleUpdateItems}
                onUpdateCommitments={handleUpdateCommitments}
                onFinish={handleSortFinish} 
            />
        )}
        {currentScreen === "plan" && (
            <PlanScreen 
                commitments={commitments} 
                priorities={priorities}
                onFinish={handlePlanFinish} 
            />
        )}
        {currentScreen === "summary" && (
            <ReviewScreen 
                items={items}
                commitments={commitments}
                blocks={blocks}
                priorities={priorities}
                onRestart={() => {
                    if(confirm("Clear current session? This will reset all local data.")) {
                        StorageService.clearAll();
                    }
                }}
            />
        )}
      </main>
    </div>
  );
};

export default App;
