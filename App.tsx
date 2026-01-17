
import React, { useState, useEffect } from "react";
import { v4 as uuidv4 } from 'uuid';
import { HomeScreen } from "./components/HomeScreen";
import { DumpScreen } from "./components/DumpScreen";
import { SortScreen } from "./components/SortScreen";
import { DurationScreen } from "./components/DurationScreen";
import { PlanScreen } from "./components/PlanScreen";
import { ReviewScreen } from "./components/ReviewScreen";
import { OnboardingScreen } from "./components/OnboardingScreen";
import { ExecutionScreen } from "./components/ExecutionScreen";
import { StorageService } from "./services/storage";
import { CaptureItem, Commitment, StrategicPriority, CalendarBlock, ExecutionSession } from "./types";

type Screen = "home" | "strategy" | "dump" | "sort" | "duration" | "plan" | "summary" | "execution";

const AnimatedLogo = ({ size = "small" }: { size?: "small" | "large" }) => {
  const isLarge = size === "large";
  return (
    <div className={`relative flex items-center justify-center ${isLarge ? 'w-24 h-24' : 'w-10 h-10'} group`}>
      <div className={`absolute inset-0 border-2 border-emerald-200 rounded-[2rem] animate-ring-pulse opacity-20`}></div>
      <div className={`absolute inset-0 border border-emerald-100 rounded-[1.8rem] animate-ring-pulse delay-700 opacity-10`}></div>
      <div className={`relative z-10 w-full h-full bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-[1.8rem] flex items-center justify-center text-white shadow-2xl shadow-indigo-200/40 overflow-hidden transform group-hover:scale-105 transition-transform duration-500`}>
        <div className="relative z-20 animate-in zoom-in-50 duration-700 flex flex-col items-center justify-center">
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
            className="transition-transform group-hover:rotate-6"
          >
            {/* Styled Checkmark Circle */}
            <circle cx="12" cy="12" r="9" className="opacity-20"></circle>
            <polyline points="8 12 11 15 16 9" className="animate-draw" style={{ strokeDasharray: 50, strokeDashoffset: 50 }}></polyline>
          </svg>
        </div>
        <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 skew-x-12"></div>
      </div>
    </div>
  );
};

const App = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>("home");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const [priorities, setPriorities] = useState<StrategicPriority[]>([]);
  const [items, setItems] = useState<CaptureItem[]>([]);
  const [commitments, setCommitments] = useState<Commitment[]>([]);
  const [blocks, setBlocks] = useState<CalendarBlock[]>([]);
  const [sessions, setSessions] = useState<ExecutionSession[]>([]);
  const [viewingSession, setViewingSession] = useState<ExecutionSession | null>(null);

  useEffect(() => {
    setPriorities(StorageService.getPriorities());
    setItems(StorageService.getCaptureItems());
    setCommitments(StorageService.getCommitments());
    setBlocks(StorageService.getCalendarBlocks());
    setSessions(StorageService.getSessions());
  }, []);

  const handleStartNewSession = () => {
    StorageService.clearCurrentBuffers();
    setItems([]);
    setCommitments([]);
    setBlocks([]);
    setCurrentScreen("dump");
  };

  const handleSaveSession = (alignmentScore: number) => {
    const newSession: ExecutionSession = {
      id: uuidv4(),
      timestampISO: new Date().toISOString(),
      items,
      commitments,
      blocks,
      alignmentScore
    };
    StorageService.saveSession(newSession);
    setSessions(StorageService.getSessions());
    setCurrentScreen("home");
  };

  const handlePrioritySetupComplete = (newPriorities: StrategicPriority[]) => {
    setPriorities(newPriorities);
    StorageService.savePriorities(newPriorities);
    setCurrentScreen("home");
  };

  const handleAddPriorityOnFly = (newPriority: StrategicPriority) => {
    const updated = [...priorities, newPriority];
    setPriorities(updated);
    StorageService.savePriorities(updated);
  };

  const sessionSteps: Screen[] = ["dump", "sort", "duration", "plan", "summary"];
  const isSessionWizard = sessionSteps.includes(currentScreen) && !viewingSession;
  const currentStepIndex = sessionSteps.indexOf(currentScreen);

  const goToStep = (step: Screen) => {
    if (viewingSession) return;
    setCurrentScreen(step);
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentScreen(sessionSteps[currentStepIndex - 1]);
    } else {
      setCurrentScreen("home");
    }
  };

  const handleViewHistorical = (s: ExecutionSession) => {
    setViewingSession(s);
    setCurrentScreen("summary");
    if (window.innerWidth < 1024) setIsSidebarOpen(false);
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#FDFDFF] text-slate-900 font-sans flex flex-col">
      {/* GLOBAL NAV - Flush to corners */}
      <nav className="bg-white/70 backdrop-blur-xl border-b border-slate-100/50 px-6 py-3.5 sticky top-0 z-50 shrink-0">
        <div className="flex justify-between items-center w-full relative">
          {/* TOP LEFT GROUP: Hamburger + Logo */}
          <div className="flex items-center gap-5">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className={`p-2.5 rounded-2xl transition-all duration-300 ${isSidebarOpen ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-slate-100/50 text-slate-400'}`}
              title="Toggle History"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="4" y1="12" x2="20" y2="12"></line>
                <line x1="4" y1="6" x2="20" y2="6"></line>
                <line x1="4" y1="18" x2="20" y2="18"></line>
              </svg>
            </button>
            <div className="flex items-center gap-3.5 cursor-pointer group" onClick={() => { setViewingSession(null); setCurrentScreen("home"); }}>
                <AnimatedLogo size="small" />
                <div className="flex flex-col">
                  <span className="font-bold text-lg tracking-tighter text-slate-900 leading-none group-hover:text-indigo-600 transition-colors">TaskOS</span>
                  <span className="text-[8px] font-black uppercase tracking-[0.18em] text-slate-400 leading-none mt-1.5 opacity-60">Master Your Strategic Intent</span>
                </div>
            </div>
          </div>

          {/* CENTER GROUP: SESSION PROGRESS */}
          {isSessionWizard && (
            <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-3 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-2xl hidden lg:flex">
                <button 
                  onClick={handleBack}
                  className="p-1.5 hover:bg-white hover:shadow-sm rounded-lg text-slate-400 transition-all"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                </button>
                <div className="w-px h-3.5 bg-slate-200"></div>
                <div className="flex items-center gap-6">
                  {sessionSteps.map((step, idx) => {
                    const isActive = currentScreen === step;
                    const isCompleted = currentStepIndex > idx;
                    const labels: Record<string, string> = { dump: "Dump", sort: "Triage", duration: "Effort", plan: "Schedule", summary: "Review" };
                    return (
                      <button
                        key={step}
                        onClick={() => goToStep(step)}
                        className={`flex items-center gap-2 group transition-all ${isActive ? 'scale-105' : 'opacity-40 hover:opacity-100'}`}
                      >
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-black transition-all ${isActive ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : isCompleted ? 'bg-emerald-500 text-white' : 'bg-slate-300 text-white'}`}>
                          {isCompleted ? <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> : idx + 1}
                        </div>
                        <span className={`text-[9px] font-bold uppercase tracking-widest ${isActive ? 'text-indigo-600' : 'text-slate-500'}`}>
                          {labels[step]}
                        </span>
                      </button>
                    );
                  })}
                </div>
            </div>
          )}

          {/* TOP RIGHT GROUP: NAV LINKS */}
          <div className="flex items-center gap-2">
            <button 
              onClick={() => { setViewingSession(null); setCurrentScreen("home"); }} 
              className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.15em] transition-all ${currentScreen === 'home' && !viewingSession ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-800'}`}
            >
              Home
            </button>
            <button 
              onClick={() => { setViewingSession(null); setCurrentScreen("strategy"); }} 
              className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.15em] transition-all ${currentScreen === 'strategy' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-400 hover:text-indigo-600'}`}
            >
              Strategy
            </button>
          </div>
        </div>
      </nav>

      <div className="flex-1 flex overflow-hidden">
        {/* SIDEBAR */}
        <aside className={`bg-white border-r border-slate-100/50 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] flex flex-col overflow-hidden shrink-0 ${isSidebarOpen ? 'w-80 shadow-2xl' : 'w-0'}`}>
          <div className="w-80 h-full flex flex-col">
            <header className="p-7 border-b border-slate-50 shrink-0">
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-2">History</h2>
              <div className="text-xl font-light text-slate-800 tracking-tight">Past Sessions</div>
            </header>
            <div className="flex-1 overflow-y-auto no-scrollbar p-5 space-y-4 bg-slate-50/10">
              {sessions.length === 0 ? (
                <div className="py-24 text-center opacity-30 px-10">
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Empty Archive</p>
                </div>
              ) : (
                sessions.map(session => (
                  <button 
                    key={session.id}
                    onClick={() => handleViewHistorical(session)}
                    className="w-full bg-white p-5 rounded-[2rem] border border-slate-100/50 shadow-sm hover:shadow-lg hover:border-indigo-200 transition-all duration-300 text-left group"
                  >
                    <div className="flex justify-between items-center mb-3">
                       <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{new Date(session.timestampISO).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                       <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{session.alignmentScore.toFixed(0)}% Match</span>
                    </div>
                    <div className="text-sm font-bold text-slate-700 group-hover:text-emerald-700 transition-colors mb-2">
                      {new Date(session.timestampISO).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} Session
                    </div>
                    <div className="text-[9px] font-black text-slate-300 uppercase tracking-wider">{session.blocks.length} Activities Logged</div>
                  </button>
                ))
              )}
            </div>
          </div>
        </aside>

        {/* MAIN AREA */}
        <main className="flex-1 relative overflow-hidden flex flex-col">
          <div className="flex-1 relative overflow-hidden">
            {currentScreen === "home" && (
              <HomeScreen 
                sessions={sessions} 
                priorities={priorities}
                blocks={blocks}
                onStartNew={handleStartNewSession} 
                onStartExecution={() => setCurrentScreen("execution")}
                onOpenStrategy={() => setCurrentScreen("strategy")}
              />
            )}
            {currentScreen === "strategy" && (
              <OnboardingScreen initialPriorities={priorities} onComplete={handlePrioritySetupComplete} />
            )}
            {currentScreen === "dump" && (
              <DumpScreen 
                priorities={priorities}
                onNext={(newItems) => {
                  const updated = [...items, ...newItems];
                  setItems(updated);
                  StorageService.saveCaptureItems(updated);
                  setCurrentScreen("sort");
                }} 
              />
            )}
            {currentScreen === "sort" && (
                <SortScreen 
                    items={StorageService.getCaptureItems()} 
                    commitments={StorageService.getCommitments()}
                    priorities={priorities} 
                    onUpdateItems={(i) => {setItems(i); StorageService.saveCaptureItems(i);}}
                    onUpdateCommitments={(c) => {setCommitments(c); StorageService.saveCommitments(c);}}
                    onAddPriority={handleAddPriorityOnFly}
                    onFinish={() => setCurrentScreen("duration")} 
                />
            )}
            {currentScreen === "duration" && (
                <DurationScreen
                    commitments={StorageService.getCommitments()}
                    priorities={priorities}
                    onUpdateCommitments={(c) => {setCommitments(c); StorageService.saveCommitments(c);}}
                    onFinish={() => setCurrentScreen("plan")}
                />
            )}
            {currentScreen === "plan" && (
                <PlanScreen 
                    commitments={StorageService.getCommitments()} 
                    priorities={priorities}
                    onFinish={() => {
                      setBlocks(StorageService.getCalendarBlocks());
                      setCurrentScreen("summary");
                    }} 
                />
            )}
            {currentScreen === "summary" && (
                <ReviewScreen 
                    items={viewingSession ? viewingSession.items : StorageService.getCaptureItems()}
                    commitments={viewingSession ? viewingSession.commitments : StorageService.getCommitments()}
                    blocks={viewingSession ? viewingSession.blocks : StorageService.getCalendarBlocks()}
                    priorities={priorities}
                    isHistorical={!!viewingSession}
                    onSave={handleSaveSession}
                    onRestart={() => { setViewingSession(null); setCurrentScreen("home"); }}
                />
            )}
            {currentScreen === "execution" && (
              <ExecutionScreen 
                commitments={StorageService.getCommitments()}
                blocks={StorageService.getCalendarBlocks()}
                priorities={priorities}
                onClose={() => setCurrentScreen("home")}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
