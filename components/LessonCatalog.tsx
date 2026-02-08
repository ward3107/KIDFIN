import React from 'react';
import { Lock, CheckCircle, Star, Target, BookOpen, GraduationCap, TrendingUp, Building2, CreditCard } from 'lucide-react';
import { Card, Button } from './UI';
import { useAppContext } from '../context/AppContext';
import { usePersonalGoals } from '../hooks/usePersonalGoals';
import { LessonV2 } from '../types/lessons';

/**
 * Category icons and colors
 */
const CATEGORY_CONFIG = {
  savings: { icon: TrendingUp, color: 'green', label: 'חיסכון' },
  spending: { icon: Target, color: 'orange', label: 'הוצאות' },
  earning: { icon: Star, color: 'yellow', label: 'הרווחה' },
  banking: { icon: Building2, color: 'blue', label: 'בנקאות' },
  investing: { icon: BookOpen, color: 'purple', label: 'השקעות' },
};

/**
 * Difficulty labels and colors
 */
const DIFFICULTY_CONFIG = {
  beginner: { label: 'מתחילים', color: 'emerald', hebrew: 'מתחילים' },
  intermediate: { label: 'מתקדמים', color: 'amber', hebrew: 'מתקדמים' },
  advanced: { label: 'מומחים', color: 'purple', hebrew: 'מומחים' },
};

/**
 * Lesson Catalog Component
 * Shows all available lessons with progress tracking
 */
interface LessonCatalogProps {
  lessons: LessonV2[];
  onSelectLesson: (lesson: LessonV2) => void;
}

export const LessonCatalog: React.FC<LessonCatalogProps> = ({ lessons, onSelectLesson }) => {
  const { stats } = useAppContext();
  const { goalsState } = usePersonalGoals();

  // Group lessons by difficulty
  const groupedLessons = {
    beginner: lessons.filter(l => l.difficulty === 'beginner'),
    intermediate: lessons.filter(l => l.difficulty === 'intermediate'),
    advanced: lessons.filter(l => l.difficulty === 'advanced'),
  };

  return (
    <div className="space-y-4">
      {/* Header with overall progress */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4 rounded-2xl text-white">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <GraduationCap size={24} />
            <h2 className="text-lg font-black">האקדמיה לפיננסים</h2>
          </div>
          <div className="bg-white/20 px-3 py-1 rounded-full">
            <span className="text-sm font-bold">{stats.knowledgePoints} נקודות ידע</span>
          </div>
        </div>
        <p className="text-xs text-indigo-100">
          📖 סיפורים • 🎮 סימולציות • 🦊 דמויות • 🎯 אתגרים
        </p>

        {/* Goals connection */}
        {goalsState.hasSelectedGoals && goalsState.goals.length > 0 && (
          <div className="bg-white/10 rounded-xl p-2 text-center mt-2">
            <p className="text-xs font-bold">
              🎯 השלם שיעורים כדי להרוויח ולהגיע ל{goalsState.goals[0].name}!
            </p>
          </div>
        )}
      </div>

      {/* Beginner lessons */}
      {groupedLessons.beginner.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="bg-emerald-500 text-white p-1.5 rounded-lg">
              <BookOpen size={16} />
            </div>
            <h3 className="font-bold text-slate-800">שיעורי מתחילים</h3>
            <span className="text-xs text-slate-500">({groupedLessons.beginner.length} שיעורים)</span>
          </div>
          <div className="space-y-2">
            {groupedLessons.beginner.map(lesson => (
              <InteractiveLessonCard key={lesson.id} lesson={lesson} onSelect={() => onSelectLesson(lesson)} />
            ))}
          </div>
        </div>
      )}

      {/* Intermediate lessons */}
      {groupedLessons.intermediate.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="bg-amber-500 text-white p-1.5 rounded-lg">
              <Target size={16} />
            </div>
            <h3 className="font-bold text-slate-800">שיעורי מתקדמים</h3>
            <span className="text-xs text-slate-500">({groupedLessons.intermediate.length} שיעורים)</span>
          </div>
          <div className="space-y-2">
            {groupedLessons.intermediate.map(lesson => (
              <InteractiveLessonCard key={lesson.id} lesson={lesson} onSelect={() => onSelectLesson(lesson)} />
            ))}
          </div>
        </div>
      )}

      {/* Advanced lessons */}
      {groupedLessons.advanced.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="bg-purple-500 text-white p-1.5 rounded-lg">
              <TrendingUp size={16} />
            </div>
            <h3 className="font-bold text-slate-800">שיעורי מומחים</h3>
            <span className="text-xs text-slate-500">({groupedLessons.advanced.length} שיעורים)</span>
          </div>
          <div className="space-y-2">
            {groupedLessons.advanced.map(lesson => (
              <InteractiveLessonCard key={lesson.id} lesson={lesson} onSelect={() => onSelectLesson(lesson)} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Interactive Lesson Card
 */
const InteractiveLessonCard: React.FC<{
  lesson: LessonV2;
  onSelect: () => void;
}> = ({ lesson, onSelect }) => {
  const { stats } = useAppContext();
  const isLocked = lesson.requiredKnowledgePoints && stats.knowledgePoints < lesson.requiredKnowledgePoints;

  const categoryConfig = CATEGORY_CONFIG[lesson.category];
  const difficultyConfig = DIFFICULTY_CONFIG[lesson.difficulty];
  const CategoryIcon = categoryConfig.icon;

  return (
    <Card
      className={`relative overflow-hidden transition-all ${
        isLocked
          ? 'bg-slate-50 border-slate-200 opacity-70'
          : 'bg-white border-slate-100 hover:border-indigo-200 hover:shadow-md'
      }`}
      onClick={!isLocked ? onSelect : undefined}
    >
      <div className="flex items-start gap-3">
        {/* Category icon */}
        <div className={`p-2 rounded-xl bg-${categoryConfig.color}-100 text-${categoryConfig.color}-600 shrink-0`}>
          <CategoryIcon size={20} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title and badges */}
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4 className="font-bold text-slate-800 text-sm leading-tight">
              {lesson.title}
            </h4>
            {isLocked && (
              <div className="bg-slate-400 text-white p-1 rounded-full shrink-0">
                <Lock size={12} />
              </div>
            )}
          </div>

          {/* Topic hint - from hook */}
          <p className="text-xs text-slate-600 line-clamp-2 mb-2">
            {lesson.hook.scenario.split('\n')[0]}...
          </p>

          {/* Metadata */}
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full bg-${difficultyConfig.color}-100 text-${difficultyConfig.color}-700`}>
              {difficultyConfig.hebrew}
            </span>
            <span className="text-[9px] text-slate-500">•</span>
            <span className="text-[9px] text-slate-500">{categoryConfig.label}</span>
          </div>

          {/* Lesson type badges */}
          <div className="flex items-center gap-1 text-[8px] text-slate-500">
            <span>📖</span>
            <span>🎮</span>
            <span>💡</span>
            <span>✏️</span>
            <span>🏆</span>
          </div>
        </div>
      </div>

      {/* Lock overlay */}
      {isLocked && (
        <div className="absolute inset-0 bg-slate-900/10 flex items-center justify-center">
          <span className="bg-white/90 px-3 py-1 rounded-full text-xs font-bold text-slate-600">
            דורש {lesson.requiredKnowledgePoints}+ נקודות
          </span>
        </div>
      )}
    </Card>
  );
};

export default LessonCatalog;
