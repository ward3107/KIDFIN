import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Check, Sparkles, Target, Heart, Star } from 'lucide-react';
import { Button } from './UI';
import { usePersonalGoals } from '../hooks/usePersonalGoals';
import { GOALS_CATALOG, getGoalsByCategory } from '../config/goalsCatalog';
import { GoalCategory } from '../config/goalsCatalog';

/**
 * Goal Selection Onboarding Flow
 * Guides users through selecting needs, wants, and dreams
 */
export const GoalSelectionFlow: React.FC = () => {
  const {
    selectionProgress,
    selectGoal,
    nextStep,
    prevStep,
    canProceed,
    completeSelection,
  } = usePersonalGoals();

  const [animating, setAnimating] = useState(false);

  const handleNext = () => {
    if (canProceed()) {
      setAnimating(true);
      setTimeout(() => {
        nextStep();
        setAnimating(false);
      }, 300);
    }
  };

  const handleBack = () => {
    setAnimating(true);
    setTimeout(() => {
      prevStep();
      setAnimating(false);
    }, 300);
  };

  const handleComplete = () => {
    if (canProceed()) {
      completeSelection();
    }
  };

  const isSelected = (goalId: string) => {
    const { selectedNeeds, selectedWants, selectedDreams } = selectionProgress;
    return [...selectedNeeds, ...selectedWants, ...selectedDreams].includes(goalId);
  };

  const toggleGoal = (goalId: string) => {
    const { step } = selectionProgress;
    let category: 'needs' | 'wants' | 'dreams' = 'wants';

    if (step === 'select_needs') category = 'needs';
    else if (step === 'select_wants') category = 'wants';
    else if (step === 'select_dreams') category = 'dreams';

    selectGoal(goalId, category);
  };

  const getSelectedCount = () => {
    const { step, selectedNeeds, selectedWants, selectedDreams } = selectionProgress;
    if (step === 'select_needs') return selectedNeeds.length;
    if (step === 'select_wants') return selectedWants.length;
    if (step === 'select_dreams') return selectedDreams.length;
    return 0;
  };

  const getMinRequired = () => {
    const { step, minRequired } = selectionProgress;
    if (step === 'select_needs') return minRequired.needs;
    if (step === 'select_wants') return minRequired.wants;
    if (step === 'select_dreams') return minRequired.dreams;
    return 0;
  };

  const getCategoryForStep = (): GoalCategory | null => {
    const { step } = selectionProgress;
    if (step === 'select_needs') return 'need';
    if (step === 'select_wants') return 'want';
    if (step === 'select_dreams') return 'dream';
    return null;
  };

  // Render different steps
  if (selectionProgress.step === 'welcome') {
    return <WelcomeStep onNext={handleNext} />;
  }

  if (selectionProgress.step === 'confirm') {
    return <ConfirmStep onNext={handleComplete} onBack={handleBack} />;
  }

  if (selectionProgress.step === 'complete') {
    return null; // Will be handled by parent
  }

  // Selection steps
  const category = getCategoryForStep();
  if (!category) return null;

  const goalsToShow = getGoalsByCategory(category);
  const selectedCount = getSelectedCount();
  const minRequired = getMinRequired();
  const isValid = selectedCount >= minRequired;

  return (
    <div className={`space-y-4 animate-fadeIn ${animating ? 'opacity-0' : 'opacity-100'}`}>
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          {category === 'need' && <Target className="text-green-500" size={24} />}
          {category === 'want' && <Heart className="text-yellow-500" size={24} />}
          {category === 'dream' && <Star className="text-purple-500" size={24} />}
        </div>
        <h2 className="text-xl font-black text-slate-800 mb-1">
          {category === 'need' && 'בחר את הצרכים שלך'}
          {category === 'want' && 'בחר את הרצונות שלך'}
          {category === 'dream' && 'בחר את החלומות שלך'}
        </h2>
        <p className="text-xs text-slate-500 mb-3">
          בחר לפחות {minRequired} פריטים
          {isValid && <span className="text-green-600 font-bold"> ✓</span>}
        </p>

        {/* Progress indicator */}
        <div className="flex items-center justify-center gap-2">
          <div className={`w-2 h-2 rounded-full ${category === 'need' ? 'bg-green-500' : 'bg-slate-200'}`} />
          <div className={`w-2 h-2 rounded-full ${category === 'want' ? 'bg-yellow-500' : 'bg-slate-200'}`} />
          <div className={`w-2 h-2 rounded-full ${category === 'dream' ? 'bg-purple-500' : 'bg-slate-200'}`} />
        </div>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-2 gap-2 max-h-[320px] overflow-y-auto">
        {goalsToShow.map((goal) => {
          const selected = isSelected(goal.id);
          return (
            <button
              key={goal.id}
              onClick={() => toggleGoal(goal.id)}
              className={`relative p-3 rounded-2xl border-2 transition-all text-right ${
                selected
                  ? 'border-indigo-400 bg-indigo-50 shadow-md'
                  : 'border-slate-100 bg-white hover:border-indigo-200 hover:bg-indigo-50/50'
              }`}
            >
              {selected && (
                <div className="absolute top-1 left-1 bg-indigo-500 text-white p-1 rounded-full">
                  <Check size={10} />
                </div>
              )}
              <div className="text-2xl mb-1">{goal.icon}</div>
              <div className="font-bold text-slate-800 text-[10px] leading-tight mb-1">{goal.name}</div>
              <div className="text-orange-600 font-black text-[9px] flex items-center gap-0.5">
                {goal.cost} 💰
              </div>
              {goal.trending && (
                <div className="absolute top-1 right-1 bg-gradient-to-r from-pink-400 to-purple-400 text-white text-[7px] px-1.5 py-0.5 rounded-full font-bold">
                  🔥
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Selection counter */}
      <div className="bg-slate-50 p-2 rounded-xl text-center">
        <span className={`text-sm font-bold ${isValid ? 'text-green-600' : 'text-slate-600'}`}>
          נבחרו {selectedCount} מתוך {minRequired} מינימום
        </span>
      </div>

      {/* Navigation */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={handleBack}
          className="flex-1 text-xs"
        >
          <ChevronRight size={14} /> חזור
        </Button>
        <Button
          variant={isValid ? 'academy' : 'outline'}
          onClick={handleNext}
          disabled={!isValid}
          className={`flex-1 text-xs ${!isValid && 'opacity-50 cursor-not-allowed'}`}
        >
          המשך <ChevronLeft size={14} />
        </Button>
      </div>
    </div>
  );
};

/**
 * Welcome step - Explains the goal selection process
 */
const WelcomeStep: React.FC<{ onNext: () => void }> = ({ onNext }) => {
  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="text-center">
        <div className="text-5xl mb-3">🎯</div>
        <h2 className="text-xl font-black text-slate-800 mb-2">בוא נגדיר את המטרות שלך!</h2>
        <p className="text-sm text-slate-600 px-4">
          בחר דברים שתרצה לעצמך - נלמד איך להרוויח אותם!
        </p>
      </div>

      {/* Explanation cards */}
      <div className="space-y-2">
        <div className="bg-green-50 p-3 rounded-xl border-2 border-green-200 flex items-center gap-3">
          <div className="bg-green-500 text-white p-2 rounded-lg">
            <Target size={16} />
          </div>
          <div>
            <h4 className="font-bold text-green-800 text-xs">צרכים - חשובים</h4>
            <p className="text-[10px] text-green-700">דברים שאתה צריך לבית ספר ולחיים</p>
          </div>
        </div>

        <div className="bg-yellow-50 p-3 rounded-xl border-2 border-yellow-200 flex items-center gap-3">
          <div className="bg-yellow-500 text-white p-2 rounded-lg">
            <Heart size={16} />
          </div>
          <div>
            <h4 className="font-bold text-yellow-800 text-xs">רצונות - כיפיים</h4>
            <p className="text-[10px] text-yellow-700">דברים שיהיה כיף להרוויח</p>
          </div>
        </div>

        <div className="bg-purple-50 p-3 rounded-xl border-2 border-purple-200 flex items-center gap-3">
          <div className="bg-purple-500 text-white p-2 rounded-lg">
            <Star size={16} />
          </div>
          <div>
            <h4 className="font-bold text-purple-800 text-xs">חלומות - הגדולים!</h4>
            <p className="text-[10px] text-purple-700">המטרה הראשית שתעבוד לעברה</p>
          </div>
        </div>
      </div>

      <div className="bg-indigo-50 p-3 rounded-xl border-2 border-indigo-200">
        <p className="text-[10px] text-indigo-800 font-bold text-center">
          💡 כל מטרה שתבחר תהפוך למשימה אמיתית!
        </p>
      </div>

      <Button variant="academy" onClick={onNext} className="w-full">
        התחל לבחור <Sparkles size={16} />
      </Button>
    </div>
  );
};

/**
 * Confirm step - Shows summary of selected goals
 */
const ConfirmStep: React.FC<{ onNext: () => void; onBack: () => void }> = ({ onNext, onBack }) => {
  const { selectionProgress } = usePersonalGoals();
  const { selectedNeeds, selectedWants, selectedDreams } = selectionProgress;

  const getGoalName = (id: string) => {
    const goal = GOALS_CATALOG.find(g => g.id === id);
    return goal ? `${goal.icon} ${goal.name}` : id;
  };

  const getTotalCost = () => {
    const allIds = [...selectedNeeds, ...selectedWants, ...selectedDreams];
    return allIds.reduce((sum, id) => {
      const goal = GOALS_CATALOG.find(g => g.id === id);
      return sum + (goal?.cost || 0);
    }, 0);
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="text-center">
        <div className="text-5xl mb-3">🎯</div>
        <h2 className="text-xl font-black text-slate-800 mb-1">המטרות שלך!</h2>
        <p className="text-xs text-slate-500">בדוק שבחרת הכל כמו שצריך</p>
      </div>

      {/* Needs summary */}
      <div className="bg-green-50 p-3 rounded-xl border-2 border-green-200">
        <h4 className="font-bold text-green-800 text-xs mb-2 flex items-center gap-2">
          <Target size={14} /> הצרכים שלך ({selectedNeeds.length})
        </h4>
        <div className="space-y-1">
          {selectedNeeds.map(id => (
            <div key={id} className="text-[10px] text-green-700">{getGoalName(id)}</div>
          ))}
        </div>
      </div>

      {/* Wants summary */}
      <div className="bg-yellow-50 p-3 rounded-xl border-2 border-yellow-200">
        <h4 className="font-bold text-yellow-800 text-xs mb-2 flex items-center gap-2">
          <Heart size={14} /> הרצונות שלך ({selectedWants.length})
        </h4>
        <div className="space-y-1">
          {selectedWants.map(id => (
            <div key={id} className="text-[10px] text-yellow-700">{getGoalName(id)}</div>
          ))}
        </div>
      </div>

      {/* Dreams summary */}
      <div className="bg-purple-50 p-3 rounded-xl border-2 border-purple-200">
        <h4 className="font-bold text-purple-800 text-xs mb-2 flex items-center gap-2">
          <Star size={14} /> החלומות שלך ({selectedDreams.length})
        </h4>
        <div className="space-y-1">
          {selectedDreams.map(id => (
            <div key={id} className="text-[10px] text-purple-700 font-bold">{getGoalName(id)}</div>
          ))}
        </div>
      </div>

      {/* Total cost */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-3 rounded-xl border-2 border-indigo-200 text-center">
        <p className="text-[10px] text-indigo-700 mb-1">סה״כ צריך להרוויח</p>
        <p className="text-2xl font-black text-indigo-900">{getTotalCost()} 💰</p>
        <p className="text-[9px] text-indigo-600 mt-1">
          {Math.ceil(getTotalCost() / 50)} שיעורים או {Math.ceil(getTotalCost() / 30)} משימות!
        </p>
      </div>

      {/* Navigation */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={onBack}
          className="flex-1 text-xs"
        >
          <ChevronRight size={14} /> חזור
        </Button>
        <Button
          variant="academy"
          onClick={onNext}
          className="flex-1 text-xs"
        >
          אישור <Sparkles size={16} />
        </Button>
      </div>
    </div>
  );
};

export default GoalSelectionFlow;
