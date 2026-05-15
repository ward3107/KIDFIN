import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PiggyBank, DollarSign, ArrowUpRight, Target, Heart } from 'lucide-react';
import { Card, Badge, Button } from '../components/UI';
import { ProgressBar } from '../components/ProgressBar';
import { JourneyGuide, CurrentStepCard } from '../components/JourneyGuide';
import { PersonalGoalsDisplay } from '../components/PersonalGoalsDisplay';
import { useAppContext } from '../context/AppContext';
import { usePersonalGoals } from '../hooks/usePersonalGoals';
import { BIKE_GOAL } from '../context/AppContext';

type CharityPercent = 0 | 10 | 20;

/**
 * Savings bank tab component for managing savings goals
 */
export const SaveTab: React.FC = () => {
  const { t } = useTranslation();
  const { stats, handleDeposit, handleWithdraw, userBehavior } = useAppContext();
  const { activeGoal, goalsState, addSavingsToGoal } = usePersonalGoals();
  const [charityPercent, setCharityPercent] = useState<CharityPercent>(0);

  // If user has personal goals, use them; otherwise use default bike goal
  const hasPersonalGoals = goalsState.hasSelectedGoals && goalsState.goals.length > 0;
  const goalToUse = activeGoal || { targetCost: BIKE_GOAL, name: t('save.defaultGoal'), icon: '🚲', currentSavings: stats.savings };
  const progressPercent = Math.min(100, Math.floor((goalToUse.currentSavings / goalToUse.targetCost) * 100));
  const leftToGoal = Math.max(0, goalToUse.targetCost - goalToUse.currentSavings);
  const milestones = [25, 50, 75];

  const charityCoins = (50 * charityPercent) / 100;
  const savingsCoins = 50 - charityCoins;
  const totalDonated = userBehavior.totalDonated ?? 0;

  // Custom deposit handler that also updates personal goal
  const handleDepositWithGoal = () => {
    if (stats.coins < 50) return;
    handleDeposit(charityPercent);
    if (hasPersonalGoals && activeGoal && !activeGoal.completed && savingsCoins > 0) {
      addSavingsToGoal(activeGoal.id, savingsCoins);
    }
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Current Step Card */}
      <CurrentStepCard />

      <h2 className="text-xl font-black text-slate-800">{t('save.title')}</h2>

      {/* Main Savings Card */}
      <div className="bg-emerald-500 p-6 rounded-[2.5rem] text-white shadow-xl shadow-emerald-100 relative overflow-hidden transition-all">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-12 translate-x-12 blur-2xl"></div>
        <div className="flex justify-between items-start mb-2">
          <div>
            <p className="text-emerald-100 text-xs font-bold mb-1">{t('save.totalLabel')}</p>
            <div className="text-5xl font-black flex items-center gap-1 transition-transform active:scale-105">
              <DollarSign size={36} strokeWidth={3} /> {stats.savings}
            </div>
          </div>
          <div className="p-3 bg-white/20 rounded-2xl">
            <PiggyBank size={28} />
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center text-xs md:text-sm font-bold text-emerald-100">
          <span className="flex items-center gap-1">
            <ArrowUpRight size={16} /> {t('save.monthlyChange')}
          </span>
          <span className="bg-emerald-600/50 px-2 py-1 rounded-lg">{t('save.annualInterest')}</span>
        </div>
      </div>

      {/* Dynamic Goal Card */}
      <Card className="border-2 border-slate-50 relative overflow-hidden">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <div className="bg-blue-100 p-2 rounded-xl text-blue-600">
              <Target size={20} />
            </div>
            <h4 className="font-black text-slate-700 text-sm">{t('save.goalLabel', { name: goalToUse.name })}</h4>
          </div>
          <Badge className="bg-blue-100 text-blue-600 font-black tracking-tight">{progressPercent}%</Badge>
        </div>

        {/* Reusable Progress Bar Component */}
        <ProgressBar current={goalToUse.currentSavings} goal={goalToUse.targetCost} milestones={milestones} />

        <div className="text-center px-2">
          {leftToGoal > 0 ? (
            <div className="bg-indigo-50 py-2 rounded-2xl inline-block px-4 border border-indigo-100">
              <p className="text-xs md:text-sm text-indigo-700 font-black">
                {t('save.leftToGoal', { n: leftToGoal, name: goalToUse.name, icon: goalToUse.icon })}
              </p>
            </div>
          ) : (
            <div className="bg-emerald-50 py-3 rounded-2xl border-2 border-emerald-200 animate-bounce">
              <p className="text-sm md:text-base text-emerald-600 font-black">
                {t('save.goalReached', { name: goalToUse.name })}
              </p>
            </div>
          )}
        </div>

        {/* Charity (Tzedaka) selector — split the deposit before saving */}
        <div className="mt-5 bg-rose-50 border border-rose-100 rounded-2xl p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-rose-700 font-black text-sm">
              <Heart size={16} className="fill-rose-500 text-rose-500" /> {t('save.charityLabel')}
            </div>
            {totalDonated > 0 && (
              <span className="text-xs font-bold text-rose-600 bg-white px-2 py-0.5 rounded-full">
                {t('save.totalDonated', { n: totalDonated })}
              </span>
            )}
          </div>
          <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label={t('save.charityAria')}>
            {([0, 10, 20] as const).map(pct => (
              <button
                key={pct}
                type="button"
                role="radio"
                aria-checked={charityPercent === pct}
                onClick={() => setCharityPercent(pct)}
                className={`py-2 rounded-xl text-sm font-black transition-all border-2 ${
                  charityPercent === pct
                    ? 'bg-rose-500 text-white border-rose-500 shadow-md'
                    : 'bg-white text-rose-700 border-rose-200 hover:border-rose-300'
                }`}
              >
                {pct === 0 ? t('save.zero') : `${pct}%`}
              </button>
            ))}
          </div>
          {charityPercent > 0 && (
            <p className="text-xs text-rose-700 mt-2 text-center">
              {t('save.charitySplit', { c: charityCoins, s: savingsCoins })}
            </p>
          )}
        </div>

        <div className="mt-4 flex gap-3">
          <Button
            variant="success"
            onClick={handleDepositWithGoal}
            disabled={stats.coins < 50}
            className="flex-1 shadow-emerald-100 hover:shadow-emerald-200"
          >
            {t('save.deposit50')} <DollarSign size={16} strokeWidth={3} />
          </Button>
          <Button
            variant="outline"
            onClick={handleWithdraw}
            disabled={stats.savings < 50}
            className="flex-1 text-red-400 border-red-50 hover:bg-red-50"
          >
            {t('save.withdraw')} <ArrowUpRight className="rotate-90" size={16} />
          </Button>
        </div>
      </Card>

      {/* Personal Goals List */}
      {hasPersonalGoals && (
        <div className="bg-indigo-50 p-3 rounded-xl">
          <h4 className="font-bold text-indigo-900 text-sm md:text-base mb-2">{t('save.allGoals')}</h4>
          <PersonalGoalsDisplay />
        </div>
      )}

      {/* Journey Guide */}
      <JourneyGuide tab="save" />
    </div>
  );
};

export default SaveTab;
