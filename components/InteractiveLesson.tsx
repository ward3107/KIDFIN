import React, { useState } from 'react';
import { ChevronRight, Sparkles, Lightbulb, Trophy, Play } from 'lucide-react';
import { Card, Button } from './UI';
import { LessonV2, InteractiveChoice, CharacterDialogue, InteractiveLessonPhase } from '../types/lessons';

/**
 * Interactive Lesson Viewer
 * Shows all 5 phases: Hook → Explore → Explain → Practice → Quiz
 */

interface InteractiveLessonProps {
  lesson: LessonV2;
  onComplete: () => void;
}

export const InteractiveLesson: React.FC<InteractiveLessonProps> = ({ lesson, onComplete }) => {
  const [phase, setPhase] = useState<InteractiveLessonPhase | 'complete'>('hook');
  const [hookResult, setHookResult] = useState<{ choice: InteractiveChoice; index: number } | null>(null);
  const [practiceIndex, setPracticeIndex] = useState(0);
  const [practiceResults, setPracticeResults] = useState<number[]>([]);
  const [quizResult, setQuizResult] = useState<boolean | null>(null);

  const phases = ['hook', 'explore', 'explain', 'practice', 'quiz'];
  const currentPhaseIndex = phases.indexOf(phase);

  const nextPhase = () => {
    const currentIndex = phases.indexOf(phase);
    if (currentIndex < phases.length - 1) {
      setPhase(phases[currentIndex + 1] as any);
    }
  };

  const handleHookChoice = (choice: InteractiveChoice, index: number) => {
    setHookResult({ choice, index });
    setTimeout(() => nextPhase(), 1500);
  };

  const handlePracticeAnswer = (answerIndex: number) => {
    const newResults = [...practiceResults, answerIndex];
    setPracticeResults(newResults);
    if (newResults.length < lesson.practice.scenarios.length) {
      setPracticeIndex(newResults.length);
    } else {
      setTimeout(() => nextPhase(), 1500);
    }
  };

  const handleQuizAnswer = (answerIndex: number) => {
    const isCorrect = answerIndex === lesson.quiz.correctIndex;
    setQuizResult(isCorrect);
    setTimeout(() => {
      setPhase('complete');
    }, 2000);
  };

  if (phase === 'complete') {
    return (
      <div className="space-y-4 animate-fadeIn">
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
          <div className="text-center py-6">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-black text-green-800 mb-2">כל הכבוד!</h2>
            <p className="text-green-700 mb-4">{lesson.quiz.reward}</p>
            <div className="bg-white p-4 rounded-xl mb-4">
              <p className="text-sm text-green-800 font-bold">📊 הישגים:</p>
              <div className="flex justify-around mt-2 text-xs text-green-700">
                <span>✅ סיפור</span>
                <span>✅ סימולציה</span>
                <span>✅ הסבר</span>
                <span>✅ תרגול</span>
                <span>✅ חידון</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setPhase('hook')}>
                <Play size={14} /> חזור על השיעור
              </Button>
              <Button className="flex-1 bg-green-500" onClick={onComplete}>
                סיימתי! <Trophy size={14} />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Phase Progress */}
      <div className="bg-slate-100 p-3 rounded-xl">
        <div className="flex items-center justify-between text-xs font-bold text-slate-600 mb-2">
          <span>התקדמות</span>
          <span>שלב {currentPhaseIndex + 1} מתוך 5</span>
        </div>
        <div className="flex gap-1">
          {phases.map((p, i) => (
            <div
              key={p}
              className={`flex-1 h-2 rounded-full transition-all ${
                i < currentPhaseIndex ? 'bg-green-500' :
                i === currentPhaseIndex ? 'bg-indigo-500' : 'bg-slate-200'
              }`}
            />
          ))}
        </div>
        <div className="flex justify-between text-[9px] text-slate-500 mt-1">
          <span>📖 סיפור</span>
          <span>🎮 חקירה</span>
          <span>💡 הבנה</span>
          <span>✏️ תרגול</span>
          <span>🏆 אתגר</span>
        </div>
      </div>

      {/* Phase Content */}
      {phase === 'hook' && (
        <HookPhase hook={lesson.hook} onSelect={handleHookChoice} result={hookResult} />
      )}

      {phase === 'explore' && (
        <ExplorePhase explore={lesson.explore} onNext={nextPhase} />
      )}

      {phase === 'explain' && (
        <ExplainPhase explain={lesson.explain} onNext={nextPhase} />
      )}

      {phase === 'practice' && (
        <PracticePhase
          practice={lesson.practice}
          currentIndex={practiceIndex}
          onAnswer={handlePracticeAnswer}
          results={practiceResults}
        />
      )}

      {phase === 'quiz' && (
        <QuizPhase quiz={lesson.quiz} onSelect={handleQuizAnswer} result={quizResult} />
      )}
    </div>
  );
};

/**
 * HOOK PHASE - Story with choices
 */
const HookPhase: React.FC<{
  hook: LessonV2['hook'];
  onSelect: (choice: InteractiveChoice, index: number) => void;
  result: { choice: InteractiveChoice; index: number } | null;
}> = ({ hook, onSelect, result }) => {
  const [selected, setSelected] = useState<number | null>(null);

  const handleSelect = (choice: InteractiveChoice, index: number) => {
    setSelected(index);
    setTimeout(() => onSelect(choice, index), 500);
  };

  return (
    <Card className="border-2 border-indigo-100 bg-gradient-to-br from-indigo-50 to-purple-50">
      <div className="flex items-center gap-2 mb-4">
        <span className="bg-indigo-500 text-white p-1.5 rounded-lg text-xs font-black">שלב 1</span>
        <h3 className="font-bold text-indigo-900">📖 {hook.title}</h3>
      </div>

      <div className="bg-white p-4 rounded-xl mb-4 border border-indigo-100">
        <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{hook.scenario}</p>
        <div className="text-center text-4xl my-3">{hook.character}</div>
        <p className="text-sm text-slate-800 font-bold">{hook.question}</p>
      </div>

      <div className="space-y-2">
        {hook.choices.map((choice, index) => {
          const isSelected = selected === index;
          const showResult = result && result.index === index;

          return (
            <button
              key={choice.id}
              onClick={() => !selected && handleSelect(choice, index)}
              disabled={!!selected}
              className={`w-full p-4 rounded-2xl text-right transition-all border-2 ${
                showResult
                  ? choice.isCorrect
                    ? 'bg-green-50 border-green-400'
                    : 'bg-red-50 border-red-400'
                  : isSelected
                  ? 'bg-indigo-50 border-indigo-400'
                  : 'bg-white border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/50'
              } ${selected ? 'cursor-default' : ''}`}
            >
              <p className="font-bold text-sm text-slate-800 mb-1">{choice.text}</p>
              {showResult && (
                <p className={`text-xs ${choice.isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                  {choice.feedback}
                </p>
              )}
            </button>
          );
        })}
      </div>

      {result && (
        <div className="mt-4 bg-white p-3 rounded-xl border border-indigo-100">
          <p className="text-xs text-slate-700">
            <span className="font-bold text-indigo-700">מה קרה אחרי כן:</span> {result.choice.consequence}
          </p>
        </div>
      )}
    </Card>
  );
};

/**
 * EXPLORE PHASE - Interactive simulation
 */
const ExplorePhase: React.FC<{
  explore: LessonV2['explore'];
  onNext: () => void;
}> = ({ explore, onNext }) => {
  const [value, setValue] = useState(explore.interactiveElement.defaultValue || 100);
  const [years, setYears] = useState(0);

  const handleNextYear = () => {
    setYears(years + 1);
    setValue(Math.round(value * 1.1)); // 10% interest
  };

  const reset = () => {
    setYears(0);
    setValue(explore.interactiveElement.defaultValue || 100);
  };

  return (
    <Card className="border-2 border-amber-100 bg-gradient-to-br from-amber-50 to-orange-50">
      <div className="flex items-center gap-2 mb-4">
        <span className="bg-amber-500 text-white p-1.5 rounded-lg text-xs font-black">שלב 2</span>
        <h3 className="font-bold text-amber-900">🎮 {explore.interactiveElement.title}</h3>
      </div>

      <p className="text-sm text-slate-700 mb-4 whitespace-pre-line">{explore.scenario}</p>

      {/* Interactive Interest Calculator */}
      <div className="bg-white p-4 rounded-xl border border-amber-100 mb-4">
        <p className="text-xs text-slate-600 mb-3">{explore.interactiveElement.instruction}</p>

        <div className="text-center mb-4">
          <div className="text-4xl font-black text-amber-600 mb-2">{value} 💰</div>
          <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
            <span>שנה {years}</span>
            {years > 0 && <span className="text-green-600">+{Math.round((value / (1.1 ** years)) * 0.1)} ריבית! 📈</span>}
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleNextYear}
            className="flex-1 text-xs"
            disabled={years >= 5}
          >
            שנה הבא ➡️
          </Button>
          <Button
            variant="outline"
            onClick={reset}
            className="text-xs"
          >
            איפוס 🔄
          </Button>
        </div>
      </div>

      {/* Character Dialogue */}
      <div className="space-y-2 mb-4">
        {explore.dialogue.map((line, i) => (
          <div
            key={i}
            className={`flex gap-2 text-sm ${line.character === 'squirrel' ? 'justify-start' : 'justify-end'}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-2xl ${
                line.character === 'squirrel'
                  ? 'bg-amber-100 text-amber-900 rounded-tl-none'
                  : 'bg-blue-100 text-blue-900 rounded-tr-none'
              }`}
            >
              <span className="text-xs font-bold opacity-70">
                {line.character === 'squirrel' ? '🐿️ סנאי' : '🦊 שועל'} • {getEmotion(line.emotion)}
              </span>
              <p className="mt-1">{line.text}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-amber-100 p-3 rounded-xl border border-amber-200 mb-4">
        <p className="text-xs text-amber-900 font-bold">
          <Lightbulb size={12} className="inline mr-1" />
          הבנת: {explore.keyInsight}
        </p>
      </div>

      <Button onClick={onNext} className="w-full">
        הבנתי! קדימה להמשיך <ChevronRight size={16} />
      </Button>
    </Card>
  );
};

/**
 * EXPLAIN PHASE - Character dialogue explaining the concept
 */
const ExplainPhase: React.FC<{
  explain: LessonV2['explain'];
  onNext: () => void;
}> = ({ explain, onNext }) => {
  return (
    <Card className="border-2 border-green-100 bg-gradient-to-br from-green-50 to-emerald-50">
      <div className="flex items-center gap-2 mb-4">
        <span className="bg-green-500 text-white p-1.5 rounded-lg text-xs font-black">שלב 3</span>
        <h3 className="font-bold text-green-900">💧 {explain.conceptName}</h3>
      </div>

      <div className="bg-white p-4 rounded-xl mb-4 border border-green-100">
        <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{explain.definition}</p>
      </div>

      <div className="space-y-3 mb-4">
        {explain.dialogue.map((line, i) => (
          <div
            key={i}
            className={`flex gap-2 ${line.character === 'squirrel' ? 'justify-start' : 'justify-end'}`}
          >
            <div
              className={`max-w-[85%] p-3 rounded-2xl ${
                line.character === 'squirrel'
                  ? 'bg-green-100 text-green-900 rounded-tl-none'
                  : line.character === 'fox'
                  ? 'bg-blue-100 text-blue-900 rounded-tr-none'
                  : 'bg-purple-100 text-purple-900'
              }`}
            >
              <span className="text-xs font-bold opacity-70">
                {line.character === 'squirrel' ? '🐿️ סנאי' : line.character === 'fox' ? '🦊 שועל' : '🐿️🦊'} • {getEmotion(line.emotion)}
              </span>
              <p className="text-sm mt-1">{line.text}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-green-100 p-3 rounded-xl border border-green-200 mb-4">
        <p className="text-xs text-green-800">
          <span className="font-bold">💡 במציאות:</span> {explain.realWorldExample}
        </p>
      </div>

      <Button onClick={onNext} className="w-full">
        בוא נתרגל! <ChevronRight size={16} />
      </Button>
    </Card>
  );
};

/**
 * PRACTICE PHASE - Multiple scenarios
 */
const PracticePhase: React.FC<{
  practice: LessonV2['practice'];
  currentIndex: number;
  onAnswer: (answerIndex: number) => void;
  results: number[];
}> = ({ practice, currentIndex, onAnswer, results }) => {
  const scenario = practice.scenarios[currentIndex];
  const [selected, setSelected] = useState<number | null>(null);
  const previousResult = results[currentIndex - 1];

  return (
    <Card className="border-2 border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="flex items-center gap-2 mb-4">
        <span className="bg-blue-500 text-white p-1.5 rounded-lg text-xs font-black">שלב 4</span>
        <h3 className="font-bold text-blue-900">✏️ תרגול - שאלה {currentIndex + 1} מתוך {practice.scenarios.length}</h3>
      </div>

      <div className="bg-white p-4 rounded-xl mb-4 border border-blue-100">
        <p className="text-sm text-slate-700 mb-2">{scenario.situation}</p>
        <p className="text-sm text-slate-900 font-bold">{scenario.question}</p>
      </div>

      <div className="space-y-2 mb-4">
        {scenario.options.map((option, index) => {
          const isSelected = selected === index;
          const isCorrect = index === scenario.correctIndex;
          const showResult = selected !== null;

          return (
            <button
              key={index}
              onClick={() => selected === null && handleSelectAndAnswer(index)}
              disabled={selected !== null}
              className={`w-full p-4 rounded-2xl text-right font-bold transition-all border-2 ${
                showResult && isCorrect
                  ? 'bg-green-50 border-green-400 text-green-800'
                  : showResult && isSelected && !isCorrect
                  ? 'bg-red-50 border-red-400 text-red-800'
                  : isSelected
                  ? 'bg-blue-50 border-blue-400'
                  : 'bg-white border-slate-100 hover:border-blue-200'
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>

      {selected !== null && (
        <div className="bg-blue-100 p-3 rounded-xl text-center">
          <p className="text-xs text-blue-800 font-bold">{scenario.explanation}</p>
        </div>
      )}

      {selected !== null && currentIndex < practice.scenarios.length - 1 && (
        <p className="text-xs text-center text-slate-500 mt-3">השאלה הבאה מופיעה עכשיו...</p>
      )}
    </Card>
  );

  function handleSelectAndAnswer(index: number) {
    setSelected(index);
    setTimeout(() => onAnswer(index), 1000);
  }
};

/**
 * QUIZ PHASE - Final challenge
 */
const QuizPhase: React.FC<{
  quiz: LessonV2['quiz'];
  onSelect: (answerIndex: number) => void;
  result: boolean | null;
}> = ({ quiz, onSelect, result }) => {
  const [selected, setSelected] = useState<number | null>(null);

  const handleSelect = (index: number) => {
    setSelected(index);
    setTimeout(() => onSelect(index), 500);
  };

  return (
    <Card className="border-2 border-purple-100 bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="flex items-center gap-2 mb-4">
        <span className="bg-purple-500 text-white p-1.5 rounded-lg text-xs font-black">שלב 5</span>
        <h3 className="font-bold text-purple-900">🏆 האתגר הסופי!</h3>
      </div>

      <div className="text-center mb-4">
        <div className="text-4xl mb-2">🎯</div>
        <p className="text-sm text-purple-700">בוא נראה אם הבנת את {result === true ? '✅' : ''}!</p>
      </div>

      <div className="bg-white p-4 rounded-xl mb-4 border border-purple-100">
        <p className="text-sm text-slate-900 font-bold text-center">{quiz.question}</p>
      </div>

      <div className="space-y-2">
        {quiz.options.map((option, index) => {
          const isSelected = selected === index;
          const isCorrect = index === quiz.correctIndex;
          const showResult = result !== null;

          return (
            <button
              key={index}
              onClick={() => selected === null && handleSelect(index)}
              disabled={selected !== null}
              className={`w-full p-4 rounded-2xl text-right font-bold transition-all border-2 ${
                showResult && isCorrect
                  ? 'bg-green-50 border-green-400'
                  : showResult && isSelected && !isCorrect
                  ? 'bg-red-50 border-red-400'
                  : isSelected
                  ? 'bg-purple-50 border-purple-400'
                  : 'bg-white border-slate-100 hover:border-purple-200'
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>

      {result === true && (
        <div className="mt-4 text-center">
          <p className="text-sm font-bold text-green-700">{quiz.reward}</p>
        </div>
      )}
    </Card>
  );
};

/**
 * Get emoji for emotion
 */
function getEmotion(emotion: CharacterDialogue['emotion']): string {
  const emotions = {
    curious: '🤔',
    excited: '🤩',
    thoughtful: '💭',
    proud: '😎',
    confused: '😕',
  };
  return emotions[emotion] || '💬';
}
