import React from 'react';
import { Target, Heart, Star, TrendingUp, CheckCircle, Lock } from 'lucide-react';
import { Card } from './UI';
import { usePersonalGoals } from '../hooks/usePersonalGoals';
import { useAppContext } from '../context/AppContext';
import type { UserPersonalGoal } from '../types/goals';

/**
 * Display user's personal goals with progress
 */
export const PersonalGoalsDisplay: React.FC = () => {
  const { goalsState, activeGoal, setActiveGoal, addSavingsToGoal } = usePersonalGoals();
  const { stats, setActiveTab, handleDeposit } = useAppContext();

  if (!goalsState.hasSelectedGoals || goalsState.goals.length === 0) {
    return null;
  }

  const needs = goalsState.goals.filter(g => g.category === 'need');
  const wants = goalsState.goals.filter(g => g.category === 'want');
  const dreams = goalsState.goals.filter(g => g.category === 'dream');

  const handleQuickSave = () => {
    if (!activeGoal || stats.coins < 50) return;
    // handleDeposit removes 50 coins and adds 50 to general savings;
    // the per-goal tracker also gets the same 50 so the active goal progresses.
    handleDeposit(0);
    addSavingsToGoal(activeGoal.id, 50);
    setActiveTab('save');
  };

  return (
    <div className="space-y-3">
      {/* Active Goal - Featured */}
      {activeGoal && (
        <ActiveGoalCard
          goal={activeGoal}
          isPrimary
          onQuickSave={handleQuickSave}
          canSave={stats.coins >= 50}
        />
      )}

      {/* Other Dreams */}
      {dreams.filter(g => g.id !== activeGoal?.id).length > 0 && (
        <div className="bg-purple-50 p-3 rounded-2xl border-2 border-purple-200">
          <h4 className="font-bold text-purple-900 text-sm md:text-base mb-2 flex items-center gap-2">
            <Star size={16} /> חלומות נוספים
          </h4>
          <div className="space-y-2">
            {dreams.filter(g => g.id !== activeGoal?.id).map(goal => (
              <MiniGoalCard
                key={goal.id}
                goal={goal}
                onClick={() => setActiveGoal(goal.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Wants */}
      {wants.length > 0 && (
        <div className="bg-yellow-50 p-3 rounded-2xl border-2 border-yellow-200">
          <h4 className="font-bold text-yellow-900 text-sm md:text-base mb-2 flex items-center gap-2">
            <Heart size={16} /> רצונות ({wants.filter(g => g.completed).length}/{wants.length})
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {wants.map(goal => (
              <MiniGoalCard
                key={goal.id}
                goal={goal}
                onClick={() => setActiveGoal(goal.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Needs */}
      {needs.length > 0 && (
        <div className="bg-green-50 p-3 rounded-2xl border-2 border-green-200">
          <h4 className="font-bold text-green-900 text-sm md:text-base mb-2 flex items-center gap-2">
            <Target size={16} /> צרכים ({needs.filter(g => g.completed).length}/{needs.length})
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {needs.map(goal => (
              <MiniGoalCard
                key={goal.id}
                goal={goal}
                onClick={() => setActiveGoal(goal.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Featured active goal card
 */
const ActiveGoalCard: React.FC<{
  goal: UserPersonalGoal;
  isPrimary?: boolean;
  onQuickSave?: () => void;
  canSave?: boolean;
}> = ({ goal, isPrimary, onQuickSave, canSave }) => {
  const progressPercent = Math.min(100, Math.floor((goal.currentSavings / goal.targetCost) * 100));
  const remaining = Math.max(0, goal.targetCost - goal.currentSavings);

  const categoryColors = {
    need: 'from-green-400 to-emerald-500',
    want: 'from-yellow-400 to-orange-500',
    dream: 'from-purple-400 to-pink-500',
  };

  return (
    <Card className={`bg-gradient-to-br ${categoryColors[goal.category]} p-4 text-white relative overflow-hidden`}>
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-8 translate-x-8"></div>
      <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full translate-y-8 -translate-x-8"></div>

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              {isPrimary && <span className="bg-white/20 px-2 py-0.5 rounded-full text-[9px] md:text-[10px] font-bold">המטרה שלי</span>}
              {goal.completed && (
                <span className="bg-green-500 px-2 py-0.5 rounded-full text-[9px] md:text-[10px] font-bold flex items-center gap-1">
                  <CheckCircle size={12} /> הושג!
                </span>
              )}
            </div>
            <h3 className="font-black text-lg flex items-center gap-2">
              <span className="text-2xl">{goal.icon}</span>
              {goal.name}
            </h3>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-3">
          <div className="flex justify-between text-xs md:text-sm mb-1">
            <span>התקדמות</span>
            <span className="font-bold">{progressPercent}%</span>
          </div>
          <div className="w-full bg-white/30 h-2 rounded-full overflow-hidden">
            <div
              className="bg-white h-full transition-all duration-500 rounded-full"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>

        {/* Stats */}
        <div className="flex justify-between items-center">
          <div>
            <p className="text-xs md:text-sm opacity-80">חיסכון עד עכשיו</p>
            <p className="font-black text-xl">{goal.currentSavings} 💰</p>
          </div>
          {!goal.completed ? (
            <div className="text-right">
              <p className="text-xs md:text-sm opacity-80">חסר עוד</p>
              <p className="font-black text-xl">{remaining} 💰</p>
            </div>
          ) : (
            <div className="text-right">
              <p className="text-sm md:text-base font-bold">🎉 מזל טוב!</p>
            </div>
          )}
        </div>

        {/* Quick save button */}
        {!goal.completed && onQuickSave && canSave && (
          <button
            onClick={onQuickSave}
            className="w-full mt-3 bg-white text-purple-600 font-bold text-xs py-2 rounded-xl hover:bg-white/90 transition-colors"
          >
            הפקד 50 לחיסכון! 🏦
          </button>
        )}
      </div>
    </Card>
  );
};

/**
 * Mini goal card for list views
 */
const MiniGoalCard: React.FC<{ goal: UserPersonalGoal; onClick?: () => void }> = ({ goal, onClick }) => {
  const progressPercent = Math.min(100, Math.floor((goal.currentSavings / goal.targetCost) * 100));

  return (
    <button
      onClick={onClick}
      className={`w-full p-2 rounded-xl border-2 transition-all text-right relative ${
        goal.completed
          ? 'bg-green-50 border-green-200 opacity-70'
          : 'bg-white border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/50'
      }`}
    >
      {goal.completed && (
        <div className="absolute top-1 left-1 text-green-500">
          <CheckCircle size={12} />
        </div>
      )}
      <div className="flex items-center gap-2">
        <span className="text-lg">{goal.icon}</span>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-slate-800 text-xs md:text-sm leading-tight truncate">{goal.name}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <div className="flex-1 bg-slate-100 h-1 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${goal.completed ? 'bg-green-500' : 'bg-indigo-500'}`}
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
            <span className="text-[9px] md:text-[10px] text-slate-600 font-bold whitespace-nowrap">{progressPercent}%</span>
          </div>
        </div>
      </div>
    </button>
  );
};

/**
 * Total savings progress across all goals
 */
export const GoalsSummary: React.FC = () => {
  const { goalsState } = usePersonalGoals();

  if (!goalsState.hasSelectedGoals) {
    return null;
  }

  const totalTarget = goalsState.goals.reduce((sum, g) => sum + g.targetCost, 0);
  const totalSaved = goalsState.goals.reduce((sum, g) => sum + g.currentSavings, 0);
  const progressPercent = Math.min(100, Math.floor((totalSaved / totalTarget) * 100));

  return (
    <Card className="bg-gradient-to-r from-indigo-500 to-purple-600 p-3 text-white">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm md:text-base font-bold flex items-center gap-2">
          <TrendingUp size={16} /> התקדמות כללית
        </span>
        <span className="text-lg font-black">{progressPercent}%</span>
      </div>
      <div className="w-full bg-white/30 h-2 rounded-full overflow-hidden">
        <div
          className="bg-white h-full transition-all duration-500 rounded-full"
          style={{ width: `${progressPercent}%` }}
        ></div>
      </div>
      <div className="flex justify-between mt-2 text-xs md:text-sm">
        <span>{goalsState.totalCompleted} הושגו</span>
        <span>{totalSaved} / {totalTarget} 💰</span>
      </div>
    </Card>
  );
};

export default PersonalGoalsDisplay;
