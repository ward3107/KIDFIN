import React from 'react';
import { GraduationCap, X, Wallet, ChevronLeft } from 'lucide-react';
import { Button, Card } from '../components/UI';
import { InteractiveLesson } from '../components/InteractiveLesson';
import { LessonCatalog } from '../components/LessonCatalog';
import { JourneyGuide } from '../components/JourneyGuide';
import { PayStubSimulator } from '../components/PayStubSimulator';
import { useAppContext } from '../context/AppContext';
import { INTERACTIVE_LESSONS, LessonV2 } from '../config/lessonsV2';

/**
 * Academy tab - NEW Interactive Lessons!
 * Stories + Simulations + Characters + Learning by Doing
 */
export const SchoolTab: React.FC = () => {
  const { stats, gameActions, triggerConfetti } = useAppContext();
  const [currentLesson, setCurrentLesson] = React.useState<LessonV2 | null>(null);
  const [showPayStub, setShowPayStub] = React.useState(false);

  const handleLessonComplete = () => {
    // Award coins and knowledge points
    alert('🎉 כל הכבוד! הרווחת 50 מטבעות ונקודת ידע!');
    setCurrentLesson(null);
  };

  const handlePayStubComplete = () => {
    gameActions.addKnowledgePoints(1);
    gameActions.addCoins(40);
    gameActions.addXP(20);
    triggerConfetti();
  };

  // Show catalog when no lesson is active
  if (!currentLesson) {
    return (
      <div className="space-y-4 animate-fadeIn">
        {/* Interactive simulator card — distinct from the main lesson catalog */}
        <Card className="border-2 border-emerald-100 bg-gradient-to-br from-emerald-50 to-teal-50">
          <button
            type="button"
            onClick={() => setShowPayStub(true)}
            className="w-full flex items-center gap-3 text-right"
          >
            <div className="bg-emerald-500 text-white p-3 rounded-2xl shadow-lg shadow-emerald-200 shrink-0">
              <Wallet size={24} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-black text-emerald-900 text-base md:text-lg">סימולטור תלוש שכר</h3>
                <span className="text-[10px] bg-emerald-200 text-emerald-900 font-black px-2 py-0.5 rounded-full">חדש</span>
              </div>
              <p className="text-xs md:text-sm text-emerald-700 mt-0.5">
                גלה למה משכורת של 10,000 ₪ לא באמת 10,000 ₪
              </p>
            </div>
            <ChevronLeft size={20} className="text-emerald-600 shrink-0" />
          </button>
        </Card>

        <LessonCatalog lessons={INTERACTIVE_LESSONS} onSelectLesson={setCurrentLesson} />
        <JourneyGuide tab="school" />

        {showPayStub && (
          <PayStubSimulator
            onClose={() => setShowPayStub(false)}
            onComplete={handlePayStubComplete}
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
