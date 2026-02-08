import React from 'react';
import { Lock, Calendar, DollarSign, CheckCircle, Loader2, Sparkles } from 'lucide-react';
import { Button } from '../components/UI';
import { JourneyGuide, CurrentStepCard } from '../components/JourneyGuide';
import { useAppContext } from '../context/AppContext';
import { MAX_DAILY_TASKS } from '../context/AppContext';

/**
 * Earn tab component for daily missions and challenges
 */
export const EarnTab: React.FC = () => {
  const {
    stats,
    dailyTasksGenerated,
    missions,
    isMissionLoading,
    setActiveTab,
    handleMagicMission,
    completeMission,
  } = useAppContext();

  if (stats.knowledgePoints === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center space-y-6 animate-fadeIn py-12">
        <div className="bg-slate-100 p-8 rounded-full">
          <Lock size={64} className="text-slate-300" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-700 underline decoration-indigo-400">האזור נעול!</h2>
          <p className="text-slate-500 mt-2 px-6 text-sm">
            כדי לקבל אתגרים פיננסיים ולהרוויח כסף, עליך קודם כל ללמוד שיעור באקדמיה.
          </p>
        </div>
        <Button onClick={() => setActiveTab('school')} variant="academy">עבור לאקדמיה</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Current Step Card */}
      <CurrentStepCard />

      <div className="flex justify-between items-end mb-2">
        <h2 className="text-xl font-black text-slate-800">אתגרים פיננסיים</h2>
        <div className="text-[10px] font-bold bg-slate-100 px-2 py-1 rounded-lg text-slate-500 flex items-center gap-1">
          <Calendar size={12} />
          {dailyTasksGenerated}/{MAX_DAILY_TASKS} להיום
        </div>
      </div>

      {dailyTasksGenerated < MAX_DAILY_TASKS ? (
        <Button variant="magic" onClick={handleMagicMission} disabled={isMissionLoading}>
          {isMissionLoading ? <Loader2 className="animate-spin" /> : <Sparkles />}
          {isMissionLoading ? "מייצר אתגר..." : "קבל אתגר חדש"}
        </Button>
      ) : (
        <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl text-center text-slate-500 text-xs">
          סיימת את האתגרים להיום! חזור מחר.
        </div>
      )}

      <div className="space-y-3">
        {missions.map((mission) => (
          <div
            key={mission.id}
            className={`p-4 rounded-3xl border-2 flex items-center justify-between transition-all ${
              mission.completed ? 'bg-slate-50 border-slate-100 opacity-60' : 'bg-white border-slate-100 shadow-sm'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="text-2xl bg-slate-100 w-12 h-12 rounded-2xl flex items-center justify-center">
                {mission.icon}
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-sm leading-tight">{mission.title}</h4>
                <div className="flex items-center text-orange-500 font-black text-xs mt-1">
                  <DollarSign size={14} strokeWidth={3} /> {mission.reward} מטבעות
                </div>
              </div>
            </div>
            {!mission.completed ? (
              <button
                onClick={() => completeMission(mission.id, mission.reward)}
                className="bg-blue-500 text-white p-2.5 rounded-xl shadow-lg shadow-blue-200 transition-transform active:scale-90"
              >
                <CheckCircle size={20} />
              </button>
            ) : (
              <div className="text-emerald-500 bg-emerald-100 p-2 rounded-xl">
                <CheckCircle size={18} />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Journey Guide */}
      <JourneyGuide tab="earn" />
    </div>
  );
};

export default EarnTab;
