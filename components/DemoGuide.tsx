
import React, { useState, useEffect, useRef } from 'react';
import { Screen } from '../App';

interface Props {
  currentScreen: string;
  onExit: () => void;
  onNavigate: (screen: Screen) => void;
  onStartPlanning: () => void;
}

const STEPS: Record<string, { title: string; text: string }> = {
  home: {
    title: "Welcome to the Demo",
    text: "TaskOS helps you schedule with strategic intent. We've loaded some sample focus areas for you."
  },
  dump: {
    title: "Step 1: The Brain Dump",
    text: "Get everything out of your head. Type your thoughts and press Enter. Don't filter yet—just empty the 'mental RAM'."
  },
  sort: {
    title: "Step 2: Strategic Triage",
    text: "Drag items from the inbox into your Focus Areas. If it doesn't align with a pillar, move it to 'Noise'. This ensures you only work on what matters."
  },
  duration: {
    title: "Step 3: Effort Estimation",
    text: "How much 'life' does this task take? Assign a realistic duration. Over-estimating is better than under-estimating!"
  },
  plan: {
    title: "Step 4: The Calendar",
    text: "Drag tasks from the left onto the grid to claim your time. You can sync this directly with Google Calendar if connected."
  },
  summary: {
    title: "Final Review",
    text: "See your strategic alignment. This score shows how much of your day is spent on your top priorities."
  },
  execution: {
    title: "Execution Mode",
    text: "Minimalist focus. TaskOS shows you exactly what to do RIGHT NOW. Complete one task, move to the next."
  },
  strategy: {
    title: "Strategic Pillars",
    text: "These are your life's filters. If it's not here, it's not a priority. Edit these as your life seasons change."
  }
};

const HOME_TOUR_STEPS = [
  {
    id: "tour-strategy",
    title: "1. Strategy Hub",
    text: "This is your starting point. You define what truly matters here. If a task doesn't align with these pillars, it shouldn't be on your calendar."
  },
  {
    id: "tour-planning",
    title: "2. Planning Cycle",
    text: "Capture everything, then triage it. We help you map your chaotic 'to-do' list to your strategic intent. No more 'busy-work'."
  },
  {
    id: "tour-execution",
    title: "3. Pure Execution",
    text: "Once the plan is set, enter Focus Mode. We strip away the noise so you can focus on one single task at a time."
  }
];

const STRATEGY_TOUR_STEPS = [
  {
    id: "tour-strategy-list",
    title: "Your Pillars",
    text: "These are the themes of your life. Every commitment you make should ideally map to one of these core values."
  },
  {
    id: "tour-strategy-add",
    title: "Add & Refine",
    text: "Seasons change. Use this to add new pillars as your focus shifts from business growth to health or family."
  }
];

const PLANNING_TOUR_STEPS = [
  {
    id: "tour-nav-dump",
    title: "The Brain Dump",
    text: "Stage 1: Immediate capture. Get thoughts out of your head without judgment. Speed is key here."
  },
  {
    id: "tour-nav-sort",
    title: "Strategic Triage",
    text: "Stage 2: Sorting. We map your 'to-dos' to your pillars. This is the filter that keeps your life aligned."
  },
  {
    id: "tour-nav-duration",
    title: "Effort Analysis",
    text: "Stage 3: Sizing. Assigning duration turns abstract ideas into physical blocks of time."
  },
  {
    id: "tour-nav-plan",
    title: "Dynamic Scheduling",
    text: "Stage 4: Commitment. Claim your time on the calendar. This is where intent becomes a plan."
  },
  {
    id: "tour-nav-summary",
    title: "Alignment Review",
    text: "Stage 5: Verification. Before finalizing, we check your session score to ensure you aren't ignoring your priorities."
  }
];

const EXECUTION_TOUR_STEPS = [
  {
    id: "tour-exec-timer",
    title: "The Focus Engine",
    text: "This countdown helps you maintain deep work. Focus on this single task until the clock hits zero."
  },
  {
    id: "tour-exec-list",
    title: "Today's Agenda",
    text: "A distraction-free list of your planned blocks. Tap a task to mark it as complete."
  },
  {
    id: "tour-exec-progress",
    title: "Daily Trajectory",
    text: "See your momentum in real-time. This keeps you accountable to your morning plan."
  }
];

export const DemoGuide: React.FC<Props> = ({ currentScreen, onExit, onNavigate, onStartPlanning }) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [walkthroughIndex, setWalkthroughIndex] = useState<number | null>(null);
  const [activeSequence, setActiveSequence] = useState<'home' | 'strategy' | 'planning' | 'execution' | null>(null);
  const [spotlightRect, setSpotlightRect] = useState<DOMRect | null>(null);
  const calloutRef = useRef<HTMLDivElement>(null);
  
  const step = STEPS[currentScreen] || { title: "Demo Mode", text: "Explore the app with mock data." };
  
  const getActiveTourSteps = () => {
    switch(activeSequence) {
      case 'home': return HOME_TOUR_STEPS;
      case 'strategy': return STRATEGY_TOUR_STEPS;
      case 'planning': return PLANNING_TOUR_STEPS;
      case 'execution': return EXECUTION_TOUR_STEPS;
      default: return HOME_TOUR_STEPS;
    }
  };

  const activeTourSteps = getActiveTourSteps();

  // Robust spotlight position updates using polling when active
  useEffect(() => {
    let interval: any;

    const updateSpotlight = () => {
      if (walkthroughIndex !== null) {
        const targetId = activeTourSteps[walkthroughIndex]?.id;
        const element = document.getElementById(targetId);
        if (element) {
          const rect = element.getBoundingClientRect();
          // Only update state if position actually changed to avoid unnecessary renders
          setSpotlightRect((prev) => {
            if (!prev || 
                prev.top !== rect.top || 
                prev.left !== rect.left || 
                prev.width !== rect.width || 
                prev.height !== rect.height) {
              return rect;
            }
            return prev;
          });
        }
      } else {
        setSpotlightRect(null);
      }
    };

    if (walkthroughIndex !== null) {
      updateSpotlight();
      // Poll every 50ms while tour is active to handle layout shifts and async renders
      interval = setInterval(updateSpotlight, 50);
    } else {
      setSpotlightRect(null);
    }

    window.addEventListener('resize', updateSpotlight);
    window.addEventListener('scroll', updateSpotlight, true);

    return () => {
      if (interval) clearInterval(interval);
      window.removeEventListener('resize', updateSpotlight);
      window.removeEventListener('scroll', updateSpotlight, true);
    };
  }, [walkthroughIndex, activeTourSteps]);

  // Sync walkthrough state with manual screen changes if NOT in deep-dive
  useEffect(() => {
    if (!activeSequence) {
        setWalkthroughIndex(null);
    }
  }, [currentScreen, activeSequence]);

  const handleNextTour = () => {
    if (walkthroughIndex !== null) {
      if (walkthroughIndex < activeTourSteps.length - 1) {
        setWalkthroughIndex(walkthroughIndex + 1);
      } else {
        // End of current sub-tour logic handled by UI buttons
      }
    }
  };

  const handleDeepDiveNext = (next: 'strategy' | 'planning' | 'execution') => {
      setActiveSequence(next);
      setWalkthroughIndex(0);
      setSpotlightRect(null); // Clear spotlight before navigation
      if (next === 'strategy') onNavigate('strategy');
      if (next === 'planning') onStartPlanning();
      if (next === 'execution') onNavigate('execution');
  };

  const startTour = () => {
    setIsMinimized(false);
    setActiveSequence('home');
    setWalkthroughIndex(0);
    onNavigate('home');
  };

  const getCalloutStyles = (): React.CSSProperties => {
    if (!spotlightRect) return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };

    const padding = 20;
    const calloutWidth = 460;
    const estimatedHeight = 240; 
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    
    const spaceBelow = viewportHeight - spotlightRect.bottom;
    const shouldFlip = spaceBelow < estimatedHeight + padding;

    let idealLeft = spotlightRect.left + (spotlightRect.width / 2);
    const halfWidth = calloutWidth / 2;
    if (idealLeft - halfWidth < padding) {
      idealLeft = halfWidth + padding;
    } else if (idealLeft + halfWidth > viewportWidth - padding) {
      idealLeft = viewportWidth - halfWidth - padding;
    }

    if (shouldFlip) {
      return {
        bottom: `calc(100vh - ${spotlightRect.top}px + ${padding}px)`,
        left: `${idealLeft}px`,
        transform: 'translateX(-50%)',
        position: 'fixed'
      };
    }
    
    return {
      top: `${spotlightRect.bottom + padding}px`,
      left: `${idealLeft}px`,
      transform: 'translateX(-50%)',
      position: 'fixed'
    };
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-2 duration-300">
        <button 
          onClick={() => setIsMinimized(false)}
          className="bg-slate-900 text-white px-6 py-3 rounded-full shadow-2xl border border-slate-700 flex items-center gap-3 hover:bg-black transition-all group ring-4 ring-slate-900/10"
        >
          <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
          <span className="text-[10px] font-black uppercase tracking-widest">Open Guide</span>
        </button>
      </div>
    );
  }

  return (
    <>
      {/* SPOTLIGHT OVERLAY */}
      {walkthroughIndex !== null && spotlightRect && (
        <div className="fixed inset-0 z-[90] pointer-events-none overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]">
          <div 
            className="absolute inset-0 bg-slate-950/75 backdrop-blur-[1px] transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
            style={{
              clipPath: `polygon(
                0% 0%, 0% 100%, 100% 100%, 100% 0%, 0% 0%,
                ${spotlightRect.left}px ${spotlightRect.top}px, 
                ${spotlightRect.right}px ${spotlightRect.top}px, 
                ${spotlightRect.right}px ${spotlightRect.bottom}px, 
                ${spotlightRect.left}px ${spotlightRect.bottom}px, 
                ${spotlightRect.left}px ${spotlightRect.top}px
              )`
            }}
          ></div>
          
          <div 
            className="absolute border-4 border-indigo-500/50 rounded-xl animate-soft-glow transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
            style={{
              top: spotlightRect.top - 4,
              left: spotlightRect.left - 4,
              width: spotlightRect.width + 8,
              height: spotlightRect.height + 8,
              borderRadius: '2rem'
            }}
          ></div>
        </div>
      )}

      {/* CALLOUT BOX FOR TOUR */}
      {walkthroughIndex !== null && (
        <div 
          className="fixed z-[95] pointer-events-none transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
          style={getCalloutStyles()}
        >
           <div 
              ref={calloutRef}
              className="bg-white p-6 rounded-[2.5rem] shadow-[0_32px_128px_-32px_rgba(0,0,0,0.5)] border border-slate-100 w-[460px] pointer-events-auto animate-in zoom-in-95 fade-in duration-500 flex flex-col gap-3"
            >
              <div className="flex justify-between items-center">
                <span className="text-[9px] font-black uppercase tracking-[0.25em] text-indigo-600">
                  {activeSequence === 'home' ? "Guided Overview" : 
                   activeSequence === 'strategy' ? "Strategy deep-dive" :
                   activeSequence === 'planning' ? "Planning deep-dive" : "Execution deep-dive"}
                </span>
                <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{walkthroughIndex + 1} / {activeTourSteps.length}</span>
              </div>
              <h4 className="text-lg font-bold text-slate-900 leading-tight">
                {activeTourSteps[walkthroughIndex].title}
              </h4>
              <p className="text-[13px] text-slate-500 leading-relaxed">
                {activeTourSteps[walkthroughIndex].text}
              </p>
              
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-50">
                <div className="flex gap-1.5">
                   {activeTourSteps.map((_, i) => (
                     <div key={i} className={`h-1 rounded-full transition-all duration-500 ${i === walkthroughIndex ? 'bg-indigo-600 w-6' : 'bg-slate-100 w-2'}`}></div>
                   ))}
                </div>

                <div className="flex gap-2">
                  {walkthroughIndex === activeTourSteps.length - 1 ? (
                    <>
                      <button 
                        onClick={() => { setWalkthroughIndex(null); setActiveSequence(null); }}
                        className="bg-slate-100 text-slate-500 px-5 py-2 rounded-xl font-bold text-[11px] hover:bg-slate-200 transition-all"
                      >
                        Finish Tour
                      </button>
                      {activeSequence === 'home' && (
                        <button 
                          onClick={() => handleDeepDiveNext('strategy')}
                          className="bg-indigo-600 text-white px-5 py-2 rounded-xl font-bold text-[11px] hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all flex items-center gap-2 group"
                        >
                          Deep-Dive Tour
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform">
                             <line x1="5" y1="12" x2="19" y2="12"></line>
                             <polyline points="12 5 19 12 12 19"></polyline>
                          </svg>
                        </button>
                      )}
                      {activeSequence === 'strategy' && (
                        <button onClick={() => handleDeepDiveNext('planning')} className="bg-indigo-600 text-white px-5 py-2 rounded-xl font-bold text-[11px]">Next: Planning</button>
                      )}
                      {activeSequence === 'planning' && (
                        <button onClick={() => handleDeepDiveNext('execution')} className="bg-indigo-600 text-white px-5 py-2 rounded-xl font-bold text-[11px]">Next: Execution</button>
                      )}
                    </>
                  ) : (
                    <button 
                      onClick={handleNextTour}
                      className="bg-slate-900 text-white px-5 py-2 rounded-xl font-bold text-[11px] hover:bg-black transition-all flex items-center gap-2"
                    >
                      Next Step
                    </button>
                  )}
                </div>
              </div>
           </div>
        </div>
      )}

      {/* STANDARD FLOATING GUIDE */}
      {walkthroughIndex === null && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-md animate-in slide-in-from-bottom-4 duration-500">
          <div className="bg-slate-900 text-white p-6 rounded-[2.5rem] shadow-2xl border border-slate-800 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500/30">
              <div className="h-full bg-indigo-500 animate-pulse w-full"></div>
            </div>
            
            <div className="flex justify-between items-start mb-2">
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-indigo-400">Demo Guide</span>
              <button onClick={() => setIsMinimized(true)} className="text-slate-500 hover:text-white transition-colors p-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
              </button>
            </div>
            
            <h3 className="text-lg font-bold mb-1">{step.title}</h3>
            <p className="text-sm text-slate-400 leading-relaxed">{step.text}</p>
            
            <div className="mt-6 flex flex-col gap-4">
              <button 
                onClick={startTour}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all shadow-lg shadow-indigo-900/50 flex items-center justify-center gap-2 group"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="animate-pulse"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>
                {activeSequence ? "Continue Guided Tour" : "Start Guided Tour"}
              </button>
              
              <div className="flex justify-between items-center px-2">
                <button onClick={onExit} className="text-[9px] font-black uppercase tracking-widest text-indigo-400 hover:text-indigo-300">Exit Demo Mode</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
