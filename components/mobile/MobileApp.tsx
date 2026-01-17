
import React from 'react';
import { Screen } from '../../App';
import { StrategicPriority, CaptureItem, Commitment, CalendarBlock, ExecutionSession } from '../../types';
import { 
  MobileHomeScreen, 
  MobileDumpScreen, 
  MobileSortScreen, 
  MobileDurationScreen, 
  MobilePlanScreen, 
  MobileReviewScreen, 
  MobileExecutionScreen,
  MobileStrategyScreen
} from './MobileScreens';

interface Props {
  currentScreen: Screen;
  setCurrentScreen: (s: Screen) => void;
  isDemoMode: boolean;
  priorities: StrategicPriority[];
  items: CaptureItem[];
  setItems: (i: CaptureItem[]) => void;
  commitments: Commitment[];
  setCommitments: (c: Commitment[]) => void;
  blocks: CalendarBlock[];
  sessions: ExecutionSession[];
  viewingSession: ExecutionSession | null;
  setViewingSession: (s: ExecutionSession | null) => void;
  onStartDemo: () => void;
  onExitDemo: () => void;
  onStartNew: () => void;
  onSaveSession: (score: number) => void;
  onUpdateHistorical: (s: ExecutionSession) => void;
  onPriorityComplete: (p: StrategicPriority[]) => void;
  onAddPriority: (p: StrategicPriority) => void;
}

export const MobileApp: React.FC<Props> = (props) => {
  const { currentScreen, setCurrentScreen } = props;

  const renderScreen = () => {
    switch(currentScreen) {
      case 'home':
        return <MobileHomeScreen {...props} />;
      case 'strategy':
        return <MobileStrategyScreen {...props} />;
      case 'dump':
        return <MobileDumpScreen {...props} />;
      case 'sort':
        return <MobileSortScreen {...props} />;
      case 'duration':
        return <MobileDurationScreen {...props} />;
      case 'plan':
        return <MobilePlanScreen {...props} />;
      case 'summary':
        return <MobileReviewScreen {...props} />;
      case 'execution':
        return <MobileExecutionScreen {...props} />;
      default:
        return <MobileHomeScreen {...props} />;
    }
  };

  return (
    <div className="fixed inset-0 bg-[#FDFDFF] text-slate-900 font-sans flex flex-col overflow-hidden select-none">
      {/* Dynamic Content */}
      <div className="flex-1 relative overflow-hidden">
        {renderScreen()}
      </div>

      {/* Bottom Tab Navigation */}
      <nav className="h-[80px] pb-[safe-area-inset-bottom] bg-white/80 backdrop-blur-xl border-t border-slate-100 flex items-center justify-around px-4 shrink-0 z-50">
        <TabButton 
          active={currentScreen === 'home'} 
          onClick={() => { props.setViewingSession(null); setCurrentScreen('home'); }}
          label="Home"
          icon={<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>}
        />
        <TabButton 
          active={['dump', 'sort', 'duration', 'plan', 'summary'].includes(currentScreen)} 
          onClick={() => { if(currentScreen !== 'dump') setCurrentScreen('dump'); }}
          label="Plan"
          icon={<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>}
        />
        <TabButton 
          active={currentScreen === 'execution'} 
          onClick={() => setCurrentScreen('execution')}
          label="Focus"
          icon={<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>}
        />
        <TabButton 
          active={currentScreen === 'strategy'} 
          onClick={() => setCurrentScreen('strategy')}
          label="Strategy"
          icon={<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>}
        />
      </nav>
    </div>
  );
};

const TabButton = ({ active, onClick, label, icon }: { active: boolean, onClick: () => void, label: string, icon: React.ReactNode }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center gap-1 transition-all ${active ? 'text-indigo-600 scale-105' : 'text-slate-300'}`}
  >
    <div className={`p-1.5 rounded-xl ${active ? 'bg-indigo-50' : ''}`}>
      {icon}
    </div>
    <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
  </button>
);
