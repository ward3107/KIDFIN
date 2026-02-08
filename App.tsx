import React from 'react';
import {
  Home,
  CheckCircle,
  PiggyBank,
  ShoppingBag,
  TrendingUp,
  DollarSign,
  GraduationCap,
} from 'lucide-react';
import { Button, Card } from './components/UI';
import { AchievementToast } from './components/AchievementToast';
import { ScenarioModal } from './components/Scenario';
import { AppProvider, useAppContext } from './context/AppContext';
import { HomeTab } from './tabs/HomeTab';
import { SchoolTab } from './tabs/SchoolTab';
import { EarnTab } from './tabs/EarnTab';
import { SaveTab } from './tabs/SaveTab';
import { ShopTab } from './tabs/ShopTab';
import { AnalysisTab } from './tabs/AnalysisTab';

// Main App component with context provider
const AppWithProvider: React.FC = () => (
  <AppProvider>
    <AppContent />
  </AppProvider>
);

// App content that consumes the context
const AppContent: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    stats,
    purchaseNotification,
    milestoneNotification,
    showConfetti,
    showScenario,
    currentScenario,
    newlyUnlocked,
    clearNewlyUnlocked,
    handleScenarioChoice,
    setShowScenario,
    setCurrentScenario,
  } = useAppContext();

  return (
    <div className="w-full h-[100dvh] bg-slate-100 flex items-center justify-center p-1 md:p-4 lg:p-6 xl:p-8 font-rubik overflow-hidden" dir="rtl">
      <div className="relative w-full max-w-[420px] md:max-w-4xl lg:max-w-6xl xl:max-w-7xl h-[min(900px,96dvh)] bg-white rounded-[2rem] md:rounded-[2.5rem] shadow-2xl border-[6px] md:border-[4px] border-slate-900 flex flex-col">

        {/* Purchase Success Toast Overlay */}
        {purchaseNotification && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 w-64 animate-bounce">
            <div className="bg-indigo-600 text-white p-4 rounded-3xl shadow-2xl flex items-center gap-3 border-2 border-white">
              <div className="text-3xl shrink-0 bg-white/20 p-2 rounded-2xl">{purchaseNotification.icon}</div>
              <div>
                <p className="font-black text-sm">איזה יופי!</p>
                <p className="text-[10px] opacity-90 leading-tight">קנית את "{purchaseNotification.name}" בהצלחה!</p>
              </div>
            </div>
          </div>
        )}

        {/* Milestone Achievement Toast Overlay */}
        {milestoneNotification && (
          <div className="absolute top-32 left-1/2 -translate-x-1/2 z-50 w-72 animate-pulse">
            <div className="bg-gradient-to-br from-yellow-400 to-orange-500 text-white p-4 rounded-3xl shadow-2xl flex items-center gap-3 border-2 border-white">
              <div className="text-4xl shrink-0 bg-white/20 p-2 rounded-2xl">{milestoneNotification.icon}</div>
              <div>
                <p className="font-black text-sm">{milestoneNotification.name}</p>
                <p className="text-[10px] opacity-90 leading-tight">{milestoneNotification.description}</p>
              </div>
            </div>
          </div>
        )}

        {/* Achievement Unlock Toast */}
        {newlyUnlocked && <AchievementToast achievement={newlyUnlocked} onDismiss={clearNewlyUnlocked} />}

        {/* Interactive Scenario Modal */}
        {showScenario && currentScenario && (
          <ScenarioModal
            scenario={currentScenario}
            onChoice={handleScenarioChoice}
            onClose={() => {
              setShowScenario(false);
              setCurrentScenario(null);
            }}
          />
        )}

        {/* Notch - Hidden on desktop */}
        <div className="h-6 md:hidden bg-slate-900 w-full flex justify-center items-end absolute top-0 z-30">
          <div className="w-24 h-4 bg-black rounded-b-2xl"></div>
        </div>

        {/* Header */}
        <div className="pt-8 md:pt-5 lg:pt-6 xl:pt-7 pb-2 md:pb-3 px-4 md:px-5 lg:px-6 xl:px-8 bg-white border-b border-slate-100 flex justify-between items-center z-20">
          <div className="flex items-center gap-1">
            <span className="text-slate-800 font-black text-lg md:text-xl lg:text-2xl xl:text-3xl italic">Dream</span>
            <span className="text-indigo-600 font-black text-lg md:text-xl lg:text-2xl xl:text-3xl italic"> 4 </span>
            <span className="text-slate-800 font-black text-lg md:text-xl lg:text-2xl xl:text-3xl italic underline decoration-yellow-400">Save</span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-x-hidden overflow-y-auto px-4 md:px-5 lg:px-6 xl:px-8 py-3 md:py-4 lg:py-5 pb-24 md:pb-28 bg-white relative no-scrollbar">
          {showConfetti && (
            <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center overflow-hidden">
               <div className="animate-bounce flex flex-wrap gap-4 justify-center">
                  <span className="text-4xl">🎉</span><span className="text-4xl">✨</span><span className="text-4xl">💰</span>
               </div>
            </div>
          )}

          {activeTab === 'home' && <HomeTab />}
          {activeTab === 'school' && <SchoolTab />}
          {activeTab === 'earn' && <EarnTab />}
          {activeTab === 'save' && <SaveTab />}
          {activeTab === 'shop' && <ShopTab />}
          {activeTab === 'analysis' && <AnalysisTab />}
        </div>

        {/* Navigation */}
        <div className="absolute bottom-0 w-full bg-white/95 backdrop-blur-md border-t border-slate-100 py-2 md:py-3 lg:py-4 xl:py-5 px-3 md:px-6 lg:px-10 xl:px-16 flex justify-between items-center pb-6 md:pb-5 lg:pb-6 xl:pb-8 rounded-b-[2rem] md:rounded-b-[2.5rem] z-20">
          <NavButton icon={Home} label="בית" active={activeTab === 'home'} onClick={() => setActiveTab('home')} />
          <NavButton icon={GraduationCap} label="אקדמיה" active={activeTab === 'school'} onClick={() => setActiveTab('school')} />
          <NavButton icon={CheckCircle} label="אתגרים" active={activeTab === 'earn'} onClick={() => setActiveTab('earn')} />
          <NavButton icon={PiggyBank} label="חיסכון" active={activeTab === 'save'} onClick={() => setActiveTab('save')} />
          <NavButton icon={ShoppingBag} label="חנות" active={activeTab === 'shop'} onClick={() => setActiveTab('shop')} />
          <NavButton icon={TrendingUp} label="ניתוח" active={activeTab === 'analysis'} onClick={() => setActiveTab('analysis')} />
        </div>
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

const NavButton = ({ icon: Icon, label, active, onClick }: { icon: any; label: string; active: boolean; onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center gap-0.5 md:gap-1 lg:gap-1.5 transition-all relative ${active ? 'text-indigo-600 scale-105' : 'text-slate-400 hover:text-slate-600'}`}
  >
    {active && <div className="absolute -top-0.5 md:-top-1 w-5 md:w-7 lg:w-9 h-0.5 md:h-1 bg-indigo-600 rounded-full"></div>}
    <Icon size={18} className="md:w-5 md:h-5 lg:w-6 lg:h-6 xl:w-7 xl:h-7" strokeWidth={active ? 2.5 : 2} />
    <span className={`text-[8px] md:text-[9px] lg:text-[10px] xl:text-xs font-black ${active ? 'opacity-100' : 'opacity-70'}`}>{label}</span>
  </button>
);

export default AppWithProvider;
