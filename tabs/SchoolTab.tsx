import React from 'react';
import { GraduationCap, X, Wallet, ChevronLeft, ShieldAlert, Baby, Banknote as BanknoteIcon, TrendingUp, Briefcase } from 'lucide-react';
import { Button, Card } from '../components/UI';
import { InteractiveLesson } from '../components/InteractiveLesson';
import { LessonCatalog } from '../components/LessonCatalog';
import { JourneyGuide } from '../components/JourneyGuide';
import { PayStubSimulator } from '../components/PayStubSimulator';
import { ScamMiniGame } from '../components/ScamMiniGame';
import { ChildSavingsSimulator } from '../components/ChildSavingsSimulator';
import { BanknoteGame } from '../components/BanknoteGame';
import { InvestingSimulator } from '../components/InvestingSimulator';
import { LemonadeStand } from '../components/LemonadeStand';
import { useAppContext } from '../context/AppContext';
import { INTERACTIVE_LESSONS, LessonV2 } from '../config/lessonsV2';

interface SimulatorCard {
  key: string;
  title: string;
  blurb: string;
  Icon: React.ComponentType<{ size?: number }>;
  border: string;
  bg: string;
  iconBg: string;
  iconShadow: string;
  text: string;
  badge: string;
  chevron: string;
  onClick: () => void;
}

/**
 * Academy tab - NEW Interactive Lessons!
 * Stories + Simulations + Characters + Learning by Doing
 */
export const SchoolTab: React.FC = () => {
  const { stats, gameActions, triggerConfetti, markSimulatorComplete } = useAppContext();
  const [currentLesson, setCurrentLesson] = React.useState<LessonV2 | null>(null);
  const [activeSim, setActiveSim] = React.useState<null | 'payStub' | 'scam' | 'childSavings' | 'banknote' | 'investing' | 'lemonade'>(null);

  const grantReward = (reward: { coins: number; xp: number; knowledgePoints: number }) => {
    if (reward.coins > 0) gameActions.addCoins(reward.coins);
    if (reward.xp > 0) gameActions.addXP(reward.xp);
    if (reward.knowledgePoints > 0) gameActions.addKnowledgePoints(reward.knowledgePoints);
    triggerConfetti();
  };

  const handleLessonComplete = () => {
    grantReward({ coins: 50, xp: 25, knowledgePoints: 1 });
    setCurrentLesson(null);
  };

  const handlePayStubComplete = () => {
    grantReward({ coins: 40, xp: 20, knowledgePoints: 1 });
    markSimulatorComplete('paystub');
  };
  const handleChildSavingsComplete = () => {
    grantReward({ coins: 35, xp: 15, knowledgePoints: 1 });
    markSimulatorComplete('childSavings');
  };
  const handleInvestingComplete = () => {
    grantReward({ coins: 35, xp: 15, knowledgePoints: 1 });
    markSimulatorComplete('investing');
  };
  const handleLemonadeComplete = (profit: number) => {
    // Reward scales with how much profit the kid made (capped). Loss still pays
    // a small participation award so trying things out is encouraged.
    const profitCoins = Math.max(15, Math.min(60, Math.round(profit / 2)));
    grantReward({ coins: profitCoins, xp: 20, knowledgePoints: 1 });
    markSimulatorComplete('lemonade', { lemonadeProfit: profit });
  };
  const handleScamComplete = (reward: { coins: number; xp: number; knowledgePoints: number }) => {
    grantReward(reward);
    markSimulatorComplete('scam', { scamGold: reward.knowledgePoints === 1 && reward.coins >= 80 });
  };
  const handleBanknoteComplete = (reward: { coins: number; xp: number; knowledgePoints: number }) => {
    grantReward(reward);
    markSimulatorComplete('banknote');
  };

  const simulators: SimulatorCard[] = [
    {
      key: 'payStub',
      title: 'תלוש שכר',
      blurb: 'למה 10,000 ₪ זה לא באמת 10,000 ₪',
      Icon: Wallet,
      border: 'border-emerald-100',
      bg: 'from-emerald-50 to-teal-50',
      iconBg: 'bg-emerald-500',
      iconShadow: 'shadow-emerald-200',
      text: 'text-emerald-900',
      badge: 'bg-emerald-200 text-emerald-900',
      chevron: 'text-emerald-600',
      onClick: () => setActiveSim('payStub'),
    },
    {
      key: 'scam',
      title: 'אמיתי או מזויף?',
      blurb: 'זהה הונאות ב-SMS, אימייל וצ\'אט',
      Icon: ShieldAlert,
      border: 'border-purple-100',
      bg: 'from-purple-50 to-fuchsia-50',
      iconBg: 'bg-purple-600',
      iconShadow: 'shadow-purple-200',
      text: 'text-purple-900',
      badge: 'bg-purple-200 text-purple-900',
      chevron: 'text-purple-600',
      onClick: () => setActiveSim('scam'),
    },
    {
      key: 'childSavings',
      title: 'חיסכון לכל ילד',
      blurb: 'כמה יהיה לך בגיל 18?',
      Icon: Baby,
      border: 'border-sky-100',
      bg: 'from-sky-50 to-blue-50',
      iconBg: 'bg-sky-500',
      iconShadow: 'shadow-sky-200',
      text: 'text-sky-900',
      badge: 'bg-sky-200 text-sky-900',
      chevron: 'text-sky-600',
      onClick: () => setActiveSim('childSavings'),
    },
    {
      key: 'banknote',
      title: 'השטרות שלנו',
      blurb: 'מי על השטרות ולמה יש סימני אבטחה',
      Icon: BanknoteIcon,
      border: 'border-amber-100',
      bg: 'from-amber-50 to-orange-50',
      iconBg: 'bg-amber-500',
      iconShadow: 'shadow-amber-200',
      text: 'text-amber-900',
      badge: 'bg-amber-200 text-amber-900',
      chevron: 'text-amber-600',
      onClick: () => setActiveSim('banknote'),
    },
    {
      key: 'investing',
      title: 'סיכון מול תשואה',
      blurb: 'איפה לשים 1,000 ₪ לשנה?',
      Icon: TrendingUp,
      border: 'border-violet-100',
      bg: 'from-violet-50 to-indigo-50',
      iconBg: 'bg-violet-500',
      iconShadow: 'shadow-violet-200',
      text: 'text-violet-900',
      badge: 'bg-violet-200 text-violet-900',
      chevron: 'text-violet-600',
      onClick: () => setActiveSim('investing'),
    },
    {
      key: 'lemonade',
      title: 'דוכן לימונדה',
      blurb: 'פתח עסק קטן ל-7 ימים',
      Icon: Briefcase,
      border: 'border-yellow-100',
      bg: 'from-yellow-50 to-amber-50',
      iconBg: 'bg-yellow-500',
      iconShadow: 'shadow-yellow-200',
      text: 'text-yellow-900',
      badge: 'bg-yellow-200 text-yellow-900',
      chevron: 'text-yellow-600',
      onClick: () => setActiveSim('lemonade'),
    },
  ];

  // Show catalog when no lesson is active
  if (!currentLesson) {
    return (
      <div className="space-y-4 animate-fadeIn">
        {/* Interactive simulators — distinct from the main lesson catalog */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {simulators.map(s => (
            <Card key={s.key} className={`border-2 ${s.border} bg-gradient-to-br ${s.bg}`}>
              <button
                type="button"
                onClick={s.onClick}
                className="w-full flex items-center gap-3 text-right"
              >
                <div className={`${s.iconBg} text-white p-3 rounded-2xl shadow-lg ${s.iconShadow} shrink-0`}>
                  <s.Icon size={24} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className={`font-black ${s.text} text-base md:text-lg`}>{s.title}</h3>
                    <span className={`text-[10px] ${s.badge} font-black px-2 py-0.5 rounded-full`}>חדש</span>
                  </div>
                  <p className={`text-xs md:text-sm ${s.text} opacity-80 mt-0.5`}>{s.blurb}</p>
                </div>
                <ChevronLeft size={20} className={`${s.chevron} shrink-0`} />
              </button>
            </Card>
          ))}
        </div>

        <LessonCatalog lessons={INTERACTIVE_LESSONS} onSelectLesson={setCurrentLesson} />
        <JourneyGuide tab="school" />

        {activeSim === 'payStub' && (
          <PayStubSimulator onClose={() => setActiveSim(null)} onComplete={handlePayStubComplete} />
        )}
        {activeSim === 'scam' && (
          <ScamMiniGame onClose={() => setActiveSim(null)} onComplete={handleScamComplete} />
        )}
        {activeSim === 'childSavings' && (
          <ChildSavingsSimulator
            onClose={() => setActiveSim(null)}
            onComplete={handleChildSavingsComplete}
          />
        )}
        {activeSim === 'banknote' && (
          <BanknoteGame onClose={() => setActiveSim(null)} onComplete={handleBanknoteComplete} />
        )}
        {activeSim === 'investing' && (
          <InvestingSimulator
            onClose={() => setActiveSim(null)}
            onComplete={handleInvestingComplete}
          />
        )}
        {activeSim === 'lemonade' && (
          <LemonadeStand
            onClose={() => setActiveSim(null)}
            onComplete={handleLemonadeComplete}
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Header with back button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GraduationCap className="text-indigo-600" size={24} />
          <h2 className="text-xl font-black text-slate-800">{currentLesson.title}</h2>
        </div>
        <Button
          variant="outline"
          onClick={() => setCurrentLesson(null)}
          className="text-xs py-1 px-3"
        >
          <X size={14} /> חזרה לקטלוג
        </Button>
      </div>

      {/* Interactive Lesson */}
      <InteractiveLesson lesson={currentLesson} onComplete={handleLessonComplete} />
    </div>
  );
};

export default SchoolTab;
