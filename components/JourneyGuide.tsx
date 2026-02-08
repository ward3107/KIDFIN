import React from 'react';
import { ArrowRight, X, Sparkles, MapPin, Target } from 'lucide-react';
import { Button } from './UI';
import { useJourney } from '../hooks/useJourney';
import { useAppContext } from '../context/AppContext';

interface JourneyGuideProps {
  tab: string;
}

/**
 * JourneyGuide component - Shows contextual hints and next steps
 * Displays differently based on current tab and user progress
 */
export const JourneyGuide: React.FC<JourneyGuideProps> = ({ tab }) => {
  const { setActiveTab } = useAppContext();
  const { journeyState, currentStep, getHintForTab, toggleJourneyGuide } = useJourney();

  const hint = getHintForTab(tab);

  // Don't show if journey guide is hidden or no hint available
  if (!journeyState.showJourneyGuide || !hint) {
    return null;
  }

  const handleAction = () => {
    if (hint.targetTab !== tab) {
      setActiveTab(hint.targetTab);
    }
  };

  return (
    <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border-2 border-indigo-200 rounded-3xl p-4 relative overflow-hidden">
      {/* Close button */}
      <button
        onClick={toggleJourneyGuide}
        className="absolute top-2 left-2 text-indigo-400 hover:text-indigo-600 transition-colors p-1"
      >
        <X size={16} />
      </button>

      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-200/20 rounded-full -translate-y-8 translate-x-8"></div>
      <div className="absolute bottom-0 left-0 w-16 h-16 bg-pink-200/20 rounded-full translate-y-8 -translate-x-8"></div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header with icon */}
        <div className="flex items-start gap-3 mb-3">
          <div className="bg-indigo-500 text-white p-2 rounded-xl shadow-lg shadow-indigo-200 shrink-0">
            <Sparkles size={18} />
          </div>
          <div className="flex-1">
            <h4 className="font-black text-indigo-900 text-sm mb-1">{hint.title}</h4>
            <p className="text-xs text-indigo-700 leading-relaxed">{hint.message}</p>
          </div>
        </div>

        {/* Action button */}
        <Button
          onClick={handleAction}
          variant="academy"
          className="w-full text-xs py-2 shadow-indigo-200"
        >
          {hint.actionLabel}
          <ArrowRight size={14} />
        </Button>
      </div>
    </div>
  );
};

/**
 * JourneyProgress component - Shows overall journey progress
 */
export const JourneyProgress: React.FC = () => {
  const { journeyProgress, toggleJourneyGuide } = useJourney();

  return (
    <div className="bg-white border-2 border-slate-100 rounded-2xl p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <MapPin className="text-indigo-500" size={16} />
          <span className="font-bold text-slate-700 text-xs">המסע שלך</span>
        </div>
        <span className="text-[10px] text-slate-500 font-bold">
          {journeyProgress.current}/{journeyProgress.total} שלבים
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
        <div
          className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-full transition-all duration-500 rounded-full"
          style={{ width: `${journeyProgress.percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

/**
 * CurrentStepCard component - Shows the current journey step
 */
export const CurrentStepCard: React.FC = () => {
  const { currentStep, getNextAction } = useJourney();
  const { setActiveTab } = useAppContext();

  const nextAction = getNextAction();

  if (!nextAction || !currentStep || currentStep.completed) {
    return null;
  }

  const handleNavigate = () => {
    setActiveTab(currentStep.targetTab);
  };

  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-3xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="bg-amber-500 text-white p-1.5 rounded-lg">
          <Target size={14} />
        </div>
        <span className="font-bold text-amber-900 text-xs">השלב הנוכחי</span>
      </div>

      <div className="flex items-center gap-3">
        <div className="text-3xl">{currentStep.icon}</div>
        <div className="flex-1">
          <h4 className="font-bold text-slate-800 text-sm mb-1">{currentStep.title}</h4>
          <p className="text-[10px] text-slate-600 leading-relaxed">{currentStep.description}</p>
        </div>
      </div>

      {currentStep.targetTab !== 'school' && (
        <button
          onClick={handleNavigate}
          className="w-full mt-3 bg-white text-amber-700 font-bold text-xs py-2 rounded-xl border-2 border-amber-200 hover:bg-amber-50 transition-colors"
        >
          עבור ל{currentStep.targetTab === 'earn' ? 'אתגרים' :
                    currentStep.targetTab === 'save' ? 'חיסכון' :
                    currentStep.targetTab === 'shop' ? 'חנות' :
                    currentStep.targetTab === 'analysis' ? 'ניתוח' :
                    currentStep.targetTab === 'home' ? 'בית' : 'אקדמיה'} <ArrowRight size={12} />
        </button>
      )}
    </div>
  );
};

export default JourneyGuide;
