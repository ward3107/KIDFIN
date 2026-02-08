import React from 'react';
import {
  GraduationCap,
  CheckCircle,
  Lock,
  AlertCircle,
  Loader2,
  Sparkles,
  PiggyBank,
  ShoppingBag,
} from 'lucide-react';
import { Card, Button } from '../components/UI';
import { StatsCard } from '../components/StatsCard';
import { JourneyGuide, JourneyProgress, CurrentStepCard } from '../components/JourneyGuide';
import { GoalSelectionFlow } from '../components/GoalSelection';
import { PersonalGoalsDisplay, GoalsSummary } from '../components/PersonalGoalsDisplay';
import { useAppContext } from '../context/AppContext';
import { usePersonalGoals } from '../hooks/usePersonalGoals';

/**
 * Home tab component displaying user stats, quick actions, and daily tips
 */
export const HomeTab: React.FC = () => {
  const {
    stats,
    dailyTip,
    isTipLoading,
    fetchTip,
    setActiveTab,
    scenarios,
    triggerRandomScenario,
  } = useAppContext();

  const { goalsState, selectionProgress } = usePersonalGoals();

  // Show goal selection flow if user hasn't selected goals yet
  if (!goalsState.hasSelectedGoals) {
    return (
      <div className="space-y-4 animate-fadeIn">
        {/* Level & Knowledge Header */}
        <div className="grid grid-cols-2 gap-3">
          <StatsCard variant="level" value={stats.level} secondaryValue={stats.xp} />
          <StatsCard variant="knowledge" value={stats.knowledgePoints} />
        </div>

        {/* Goal Selection Flow */}
        <GoalSelectionFlow />
      </div>
    );
  }

  return (
    <div className="space-y-3 md:space-y-4 lg:space-y-5 animate-fadeIn">
      {/* Level & Knowledge Header - 2 columns */}
      <div className="grid grid-cols-2 gap-2 md:gap-3 lg:gap-4">
        <StatsCard variant="level" value={stats.level} secondaryValue={stats.xp} />
        <StatsCard variant="knowledge" value={stats.knowledgePoints} />
      </div>

      {/* Journey Progress & Current Step - Side by side on larger screens */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
        <JourneyProgress />
        <CurrentStepCard />
      </div>

      {/* Goals Summary & Goals - Side by side on larger screens */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
        <GoalsSummary />
        <PersonalGoalsDisplay />
      </div>

      {/* Quick Actions - 2 columns on mobile, 4 on larger screens */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3 lg:gap-4">
        <button
          onClick={() => setActiveTab('school')}
          className="bg-indigo-50 hover:bg-indigo-100 p-3 md:p-4 lg:p-5 rounded-2xl md:rounded-3xl border-2 border-indigo-100 flex flex-col items-center gap-1.5 md:gap-2 transition-all group"
        >
          <div className="p-2 md:p-3 bg-indigo-500 text-white rounded-xl md:rounded-2xl shadow-lg shadow-indigo-200 group-hover:scale-110 transition-transform">
            <GraduationCap size={20} className="md:w-6 md:h-6" />
          </div>
          <span className="font-bold text-slate-700 text-xs md:text-sm text-center">אקדמיה (למד)</span>
        </button>
        <button
          onClick={() => setActiveTab('earn')}
          className={`p-3 md:p-4 lg:p-5 rounded-2xl md:rounded-3xl border-2 flex flex-col items-center gap-1.5 md:gap-2 transition-all group ${
            stats.knowledgePoints >= 1 ? 'bg-orange-50 hover:bg-orange-100 border-orange-100' : 'bg-slate-100 border-slate-200 opacity-70'
          }`}
        >
          <div
            className={`p-2 md:p-3 text-white rounded-xl md:rounded-2xl shadow-lg transition-transform ${
              stats.knowledgePoints >= 1 ? 'bg-orange-500 shadow-orange-200 group-hover:scale-110' : 'bg-slate-400 shadow-none'
            }`}
          >
            {stats.knowledgePoints >= 1 ? <CheckCircle size={20} className="md:w-6 md:h-6" /> : <Lock size={20} className="md:w-6 md:h-6" />}
          </div>
          <span className="font-bold text-slate-700 text-xs md:text-sm text-center">
            אתגרים {stats.knowledgePoints < 1 && '🔒'}
          </span>
        </button>
        {/* Save button */}
        <button
          onClick={() => setActiveTab('save')}
          className="bg-green-50 hover:bg-green-100 p-3 md:p-4 lg:p-5 rounded-2xl md:rounded-3xl border-2 border-green-100 flex flex-col items-center gap-1.5 md:gap-2 transition-all group"
        >
          <div className="p-2 md:p-3 bg-green-500 text-white rounded-xl md:rounded-2xl shadow-lg shadow-green-200 group-hover:scale-110 transition-transform">
            <PiggyBank size={20} className="md:w-6 md:h-6" />
          </div>
          <span className="font-bold text-slate-700 text-xs md:text-sm text-center">חיסכון</span>
        </button>
        {/* Shop button */}
        <button
          onClick={() => setActiveTab('shop')}
          className="bg-pink-50 hover:bg-pink-100 p-3 md:p-4 lg:p-5 rounded-2xl md:rounded-3xl border-2 border-pink-100 flex flex-col items-center gap-1.5 md:gap-2 transition-all group"
        >
          <div className="p-2 md:p-3 bg-pink-500 text-white rounded-xl md:rounded-2xl shadow-lg shadow-pink-200 group-hover:scale-110 transition-transform">
            <ShoppingBag size={20} className="md:w-6 md:h-6" />
          </div>
          <span className="font-bold text-slate-700 text-xs md:text-sm text-center">חנות</span>
        </button>
      </div>

      {/* Daily Tip */}
      <Card className="bg-blue-50 border-blue-100">
        <div className="flex gap-3 md:gap-4">
          <div className="text-3xl md:text-4xl bg-white w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center shadow-sm shrink-0">
            🐿️
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-center mb-1">
              <h3 className="font-bold text-blue-900 text-sm md:text-base">טיפ מהסנאי</h3>
              <button onClick={fetchTip} disabled={isTipLoading} className="text-blue-600">
                {isTipLoading ? <Loader2 size={16} className="md:w-5 md:h-5 animate-spin" /> : <Sparkles size={16} className="md:w-5 md:h-5" />}
              </button>
            </div>
            <p className="text-xs md:text-sm text-blue-700 leading-relaxed">
              {isTipLoading ? "השועל חושב על משהו חכם..." : dailyTip}
            </p>
          </div>
        </div>
      </Card>

      {/* Intro Widget */}
      {stats.knowledgePoints === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 p-3 md:p-4 rounded-2xl flex items-start gap-2 md:gap-3">
          <AlertCircle className="text-yellow-600 shrink-0 w-[18px] h-[18px] md:w-5 md:h-5" />
          <div>
            <h4 className="font-bold text-yellow-800 text-sm md:text-base">חדש כאן?</h4>
            <p className="text-yellow-700 text-xs md:text-sm mt-0.5">
              כדי לפתוח את האתגרים ולהרוויח מטבעות, עליך ללמוד שיעור אחד באקדמיה!
            </p>
          </div>
        </div>
      )}

      {/* Interactive Scenario Trigger */}
      {stats.knowledgePoints >= 2 && (
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-100">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="text-3xl md:text-4xl">🎭</div>
              <div>
                <h4 className="font-bold text-purple-900 text-sm md:text-base">תרגיל החלטה</h4>
                <p className="text-[10px] md:text-xs text-purple-700">
                  סיימת {scenarios.filter(s => s.completed).length} מתוך {scenarios.length} תרחישים
                </p>
              </div>
            </div>
            <Button
              onClick={triggerRandomScenario}
              variant="academy"
              className="text-xs md:text-sm py-2 px-3 md:px-4"
              disabled={scenarios.every(s => s.completed)}
            >
              {scenarios.every(s => s.completed) ? 'כל הכבוד!' : 'התחל'}
            </Button>
          </div>
        </Card>
      )}

      {/* Journey Guide */}
      <JourneyGuide tab="home" />
    </div>
  );
};

export default HomeTab;
