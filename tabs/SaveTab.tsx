import React from 'react';
import { PiggyBank, DollarSign, ArrowUpRight, Target } from 'lucide-react';
import { Card, Badge, Button } from '../components/UI';
import { ProgressBar } from '../components/ProgressBar';
import { JourneyGuide, CurrentStepCard } from '../components/JourneyGuide';
import { PersonalGoalsDisplay } from '../components/PersonalGoalsDisplay';
import { useAppContext } from '../context/AppContext';
import { usePersonalGoals } from '../hooks/usePersonalGoals';
import { BIKE_GOAL } from '../context/AppContext';

/**
 * Savings bank tab component for managing savings goals
 */
export const SaveTab: React.FC = () => {
  const { stats, handleDeposit, handleWithdraw } = useAppContext();
  const { activeGoal, goalsState, addSavingsToGoal } = usePersonalGoals();

  // If user has personal goals, use them; otherwise use default bike goal
  const hasPersonalGoals = goalsState.hasSelectedGoals && goalsState.goals.length > 0;
  const goalToUse = activeGoal || { targetCost: BIKE_GOAL, name: 'אופניים חדשים', icon: '🚲', currentSavings: stats.savings };
  const progressPercent = Math.min(100, Math.floor((goalToUse.currentSavings / goalToUse.targetCost) * 100));
  const leftToGoal = Math.max(0, goalToUse.targetCost - goalToUse.currentSavings);
  const milestones = [25, 50, 75];

  // Custom deposit handler that also updates personal goal
  const handleDepositWithGoal = () => {
    if (stats.coins >= 50) {
      handleDeposit(); // Original deposit
      if (hasPersonalGoals && activeGoal && !activeGoal.completed) {
        addSavingsToGoal(activeGoal.id, 50); // Also add to personal goal
      }
    }
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Current Step Card */}
      <CurrentStepCard />

      <h2 className="text-xl font-black text-slate-800">הבנק שלי</h2>

      {/* Main Savings Card */}
      <div className="bg-emerald-500 p-6 rounded-[2.5rem] text-white shadow-xl shadow-emerald-100 relative overflow-hidden transition-all">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-12 translate-x-12 blur-2xl"></div>
        <div className="flex justify-between items-start mb-2">
          <div>
            <p className="text-emerald-100 text-xs font-bold mb-1">סה"כ בחיסכון</p>
            <div className="text-5xl font-black flex items-center gap-1 transition-transform active:scale-105">
              <DollarSign size={36} strokeWidth={3} /> {stats.savings}
            </div>
          </div>
          <div className="p-3 bg-white/20 rounded-2xl">
            <PiggyBank size={28} />
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center text-[10px] font-bold text-emerald-100">
          <span className="flex items-center gap-1">
            <ArrowUpRight size={14} /> +12% החודש
          </span>
          <span className="bg-emerald-600/50 px-2 py-1 rounded-lg">ריבית שנתית: 4.5% 📈</span>
        </div>
      </div>

      {/* Dynamic Goal Card */}
      <Card className="border-2 border-slate-50 relative overflow-hidden">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <div className="bg-blue-100 p-2 rounded-xl text-blue-600">
              <Target size={20} />
            </div>
            <h4 className="font-black text-slate-700 text-sm">יעד: {goalToUse.name}</h4>
          </div>
          <Badge className="bg-blue-100 text-blue-600 font-black tracking-tight">{progressPercent}%</Badge>
        </div>

        {/* Reusable Progress Bar Component */}
        <ProgressBar current={goalToUse.currentSavings} goal={goalToUse.targetCost} milestones={milestones} />

        <div className="text-center px-2">
          {leftToGoal > 0 ? (
            <div className="bg-indigo-50 py-2 rounded-2xl inline-block px-4 border border-indigo-100">
              <p className="text-[10px] text-indigo-700 font-black">
                נשאר רק עוד <span className="text-sm text-indigo-900">{leftToGoal}</span> מטבעות כדי להגיע ל{goalToUse.name}! {goalToUse.icon}
              </p>
            </div>
          ) : (
            <div className="bg-emerald-50 py-3 rounded-2xl border-2 border-emerald-200 animate-bounce">
              <p className="text-xs text-emerald-600 font-black">
                מזל טוב! הגעת ליעד! 🎉 הגעת ל{goalToUse.name}!
              </p>
            </div>
          )}
        </div>

        <div className="mt-6 flex gap-3">
          <Button
            variant="success"
            onClick={handleDepositWithGoal}
            disabled={stats.coins < 50}
            className="flex-1 text-sm shadow-emerald-100 hover:shadow-emerald-200"
          >
            הפקד 50 <DollarSign size={14} strokeWidth={3} />
          </Button>
          <Button
            variant="outline"
            onClick={handleWithdraw}
            disabled={stats.savings < 50}
            className="flex-1 text-red-400 border-red-50 text-xs hover:bg-red-50"
          >
            משיכה <ArrowUpRight className="rotate-90" size={14} />
          </Button>
        </div>
      </Card>

      {/* Personal Goals List */}
      {hasPersonalGoals && (
        <div className="bg-indigo-50 p-3 rounded-xl">
          <h4 className="font-bold text-indigo-900 text-xs mb-2">כל המטרות שלך</h4>
          <PersonalGoalsDisplay />
        </div>
      )}

      {/* Journey Guide */}
      <JourneyGuide tab="save" />
    </div>
  );
};

export default SaveTab;
