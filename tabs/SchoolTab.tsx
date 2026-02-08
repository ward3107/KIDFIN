import React from 'react';
import { GraduationCap, X } from 'lucide-react';
import { Button } from '../components/UI';
import { InteractiveLesson } from '../components/InteractiveLesson';
import { LessonCatalog } from '../components/LessonCatalog';
import { JourneyGuide } from '../components/JourneyGuide';
import { useAppContext } from '../context/AppContext';
import { INTERACTIVE_LESSONS, LessonV2 } from '../config/lessonsV2';

/**
 * Academy tab - NEW Interactive Lessons!
 * Stories + Simulations + Characters + Learning by Doing
 */
export const SchoolTab: React.FC = () => {
  const { stats } = useAppContext();
  const [currentLesson, setCurrentLesson] = React.useState<LessonV2 | null>(null);

  const handleLessonComplete = () => {
    // Award coins and knowledge points
    alert('🎉 כל הכבוד! הרווחת 50 מטבעות ונקודת ידע!');
    setCurrentLesson(null);
  };

  // Show catalog when no lesson is active
  if (!currentLesson) {
    return (
      <div className="space-y-4 animate-fadeIn">
        <LessonCatalog lessons={INTERACTIVE_LESSONS} onSelectLesson={setCurrentLesson} />
        <JourneyGuide tab="school" />
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
