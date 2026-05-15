import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Home,
  CheckCircle,
  PiggyBank,
  ShoppingBag,
  TrendingUp,
  GraduationCap,
} from 'lucide-react';
import { AchievementToast } from './components/AchievementToast';
import { ScenarioModal } from './components/Scenario';
import { OnboardingNameEntry } from './components/OnboardingNameEntry';
import { LanguageSwitcher } from './components/LanguageSwitcher';
import { AppProvider, useAppContext } from './context/AppContext';
import { useIsDesktop } from './hooks/useMediaQuery';
import { HomeTab } from './tabs/HomeTab';
import { SchoolTab } from './tabs/SchoolTab';
import { EarnTab } from './tabs/EarnTab';
import { SaveTab } from './tabs/SaveTab';
import { ShopTab } from './tabs/ShopTab';
import { AnalysisTab } from './tabs/AnalysisTab';

const AppWithProvider: React.FC = () => (
  <AppProvider>
    <AppContent />
  </AppProvider>
);

const PAYMENT_METHOD_KEYS: Record<string, { labelKey: string; copyKey: string }> = {
  bit:    { labelKey: 'payment.bitLabel',    copyKey: 'payment.bitCopy' },
  paybox: { labelKey: 'payment.payboxLabel', copyKey: 'payment.payboxCopy' },
  credit: { labelKey: 'payment.creditLabel', copyKey: 'payment.creditCopy' },
};

type TabId = 'home' | 'school' | 'earn' | 'save' | 'shop' | 'analysis';

const NAV_ITEMS: { id: TabId; icon: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>; labelKey: string }[] = [
  { id: 'home',     icon: Home,           labelKey: 'nav.home' },
  { id: 'school',   icon: GraduationCap,  labelKey: 'nav.school' },
  { id: 'earn',     icon: CheckCircle,    labelKey: 'nav.earn' },
  { id: 'save',     icon: PiggyBank,      labelKey: 'nav.save' },
  { id: 'shop',     icon: ShoppingBag,    labelKey: 'nav.shop' },
  { id: 'analysis', icon: TrendingUp,     labelKey: 'nav.analysis' },
];

const Brand: React.FC = () => (
  <div className="flex items-center gap-1 shrink-0">
    <span className="text-slate-800 font-black text-xl md:text-2xl italic">Dream</span>
    <span className="text-indigo-600 font-black text-xl md:text-2xl italic"> 4 </span>
    <span className="text-slate-800 font-black text-xl md:text-2xl italic underline decoration-yellow-400">Save</span>
  </div>
);

const TabContent: React.FC<{ tab: TabId }> = ({ tab }) => {
  switch (tab) {
    case 'home':     return <HomeTab />;
    case 'school':   return <SchoolTab />;
    case 'earn':     return <EarnTab />;
    case 'save':     return <SaveTab />;
    case 'shop':     return <ShopTab />;
    case 'analysis': return <AnalysisTab />;
  }
};

const AppContent: React.FC = () => {
  const { t } = useTranslation();
  const isDesktop = useIsDesktop();
  const {
    activeTab,
    setActiveTab,
    stats,
    gameActions,
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
    userBehavior,
  } = useAppContext();

  const lastPurchaseMethod = userBehavior.purchases.length
    ? userBehavior.purchases[userBehavior.purchases.length - 1].paymentMethod
    : undefined;

  if (!stats.name) {
    return (
      <div className="w-full min-h-[100dvh] bg-slate-100 flex items-center justify-center p-2 md:p-6 font-rubik" dir="rtl">
        <div className="w-full max-w-[420px] md:max-w-md bg-white rounded-[2rem] shadow-2xl border-[6px] md:border-2 border-slate-900 md:border-slate-200 overflow-hidden">
          <OnboardingNameEntry onSubmit={gameActions.setName} />
        </div>
      </div>
    );
  }

  const tabAt = (id: TabId) => activeTab === id;

  return (
    <div className="w-full min-h-[100dvh] bg-slate-100 font-rubik flex items-stretch justify-center" dir="rtl">
      {/* Confetti — viewport overlay so it sits above everything */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-[60] flex items-center justify-center overflow-hidden">
          <div className="animate-bounce flex flex-wrap gap-4 justify-center">
            <span className="text-4xl md:text-6xl">🎉</span>
            <span className="text-4xl md:text-6xl">✨</span>
            <span className="text-4xl md:text-6xl">💰</span>
          </div>
        </div>
      )}

      {/* Achievement Unlock Toast — manages its own positioning */}
      {newlyUnlocked && <AchievementToast achievement={newlyUnlocked} onDismiss={clearNewlyUnlocked} />}

      {/* Interactive Scenario Modal — full-viewport overlay */}
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

      {/* Purchase Toast — viewport-anchored so it works in both shells */}
      {purchaseNotification && (
        <div className="fixed top-4 md:top-6 left-1/2 -translate-x-1/2 z-50 w-72 md:w-80 animate-bounce pointer-events-none">
          <div className="bg-indigo-600 text-white p-4 rounded-3xl shadow-2xl flex items-center gap-3 border-2 border-white">
            <div className="text-3xl shrink-0 bg-white/20 p-2 rounded-2xl">{purchaseNotification.icon}</div>
            <div className="flex-1 min-w-0">
              <p className="font-black text-sm">{t('toast.purchaseTitle')}</p>
              <p className="text-[10px] opacity-90 leading-tight">{t('toast.purchaseBody', { name: purchaseNotification.name })}</p>
              {lastPurchaseMethod && PAYMENT_METHOD_KEYS[lastPurchaseMethod] && (
                <p className="text-[10px] opacity-80 mt-1 flex items-center gap-1">
                  <span className="bg-white/20 px-1.5 py-0.5 rounded-full font-bold">
                    {t(PAYMENT_METHOD_KEYS[lastPurchaseMethod].labelKey)}
                  </span>
                  {t(PAYMENT_METHOD_KEYS[lastPurchaseMethod].copyKey)}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Milestone Toast — also viewport-anchored, offset below purchase */}
      {milestoneNotification && (
        <div className="fixed top-24 md:top-28 left-1/2 -translate-x-1/2 z-50 w-72 md:w-80 animate-pulse pointer-events-none">
          <div className="bg-gradient-to-br from-yellow-400 to-orange-500 text-white p-4 rounded-3xl shadow-2xl flex items-center gap-3 border-2 border-white">
            <div className="text-4xl shrink-0 bg-white/20 p-2 rounded-2xl">{milestoneNotification.icon}</div>
            <div>
              <p className="font-black text-sm">{milestoneNotification.name}</p>
              <p className="text-[10px] opacity-90 leading-tight">{milestoneNotification.description}</p>
            </div>
          </div>
        </div>
      )}

      {/* MOBILE SHELL — phone-frame, only rendered below md */}
      {!isDesktop && (
        <div className="w-full h-[100dvh] flex items-center justify-center p-1">
          <div className="relative w-full max-w-[420px] h-[min(900px,98dvh)] bg-white rounded-[2rem] shadow-2xl border-[6px] border-slate-900 flex flex-col overflow-hidden">
            {/* Notch */}
            <div className="h-6 bg-slate-900 w-full flex justify-center items-end absolute top-0 z-30">
              <div className="w-24 h-4 bg-black rounded-b-2xl"></div>
            </div>

            {/* Mobile Header */}
            <div className="pt-8 pb-2 px-4 bg-white border-b border-slate-100 flex justify-between items-center z-20 shrink-0">
              <Brand />
              <LanguageSwitcher />
            </div>

            {/* Mobile Content */}
            <div className="flex-1 overflow-x-hidden overflow-y-auto px-4 py-3 pb-24 bg-white relative no-scrollbar">
              <TabContent tab={activeTab as TabId} />
            </div>

            {/* Mobile Bottom Nav */}
            <div className="absolute bottom-0 w-full bg-white/95 backdrop-blur-md border-t border-slate-100 py-2 px-3 flex justify-between items-center pb-6 rounded-b-[2rem] z-20">
              {NAV_ITEMS.map(({ id, icon: Icon, labelKey }) => (
                <NavButton
                  key={id}
                  icon={Icon}
                  label={t(labelKey)}
                  active={tabAt(id)}
                  onClick={() => setActiveTab(id)}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TABLET / DESKTOP SHELL — proper webapp layout, rendered at md+ */}
      {isDesktop && (
        <div className="flex flex-col min-h-[100dvh] w-full">
          {/* Sticky top bar */}
          <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
            <div className="max-w-6xl mx-auto px-4 lg:px-6 py-3 flex items-center justify-between gap-4">
              <Brand />
              <nav className="flex items-center gap-1 lg:gap-2 overflow-x-auto no-scrollbar" aria-label="primary">
                {NAV_ITEMS.map(({ id, icon: Icon, labelKey }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setActiveTab(id)}
                    aria-current={tabAt(id) ? 'page' : undefined}
                    className={`flex items-center gap-1.5 px-2.5 lg:px-3 py-1.5 rounded-xl font-bold text-sm lg:text-base whitespace-nowrap transition-colors ${
                      tabAt(id)
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <Icon size={18} strokeWidth={tabAt(id) ? 2.5 : 2} />
                    <span>{t(labelKey)}</span>
                  </button>
                ))}
              </nav>
              <LanguageSwitcher />
            </div>
          </header>

          {/* Main content area — readable max-width, generous padding */}
          <main className="flex-1 w-full max-w-3xl mx-auto px-4 lg:px-6 py-5 lg:py-7 pb-12">
            <TabContent tab={activeTab as TabId} />
          </main>
        </div>
      )}

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
    className={`flex flex-col items-center gap-0.5 transition-all relative ${active ? 'text-indigo-600 scale-105' : 'text-slate-400 hover:text-slate-600'}`}
  >
    {active && <div className="absolute -top-0.5 w-5 h-0.5 bg-indigo-600 rounded-full"></div>}
    <Icon size={18} strokeWidth={active ? 2.5 : 2} />
    <span className={`text-xs font-black ${active ? 'opacity-100' : 'opacity-70'}`}>{label}</span>
  </button>
);

export default AppWithProvider;
