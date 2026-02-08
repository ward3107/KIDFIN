import React, { useState } from 'react';
import { Lightbulb, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from './UI';

interface PracticeExample {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface PracticePhaseProps {
  examples: PracticeExample[];
  onComplete: () => void;
}

/**
 * Practice phase component - Interactive examples before the quiz
 * Students can practice without penalties, with hints and explanations
 */
export const PracticePhase: React.FC<PracticePhaseProps> = ({ examples, onComplete }) => {
  const [currentExample, setCurrentExample] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const example = examples[currentExample];
  const isLastExample = currentExample === examples.length - 1;
  const isCorrect = selectedAnswer === example.correctIndex;

  const handleAnswer = (index: number) => {
    setSelectedAnswer(index);
    setShowExplanation(true);
  };

  const handleNext = () => {
    if (isLastExample) {
      onComplete();
    } else {
      setCurrentExample(prev => prev + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    }
  };

  const getButtonStyle = (index: number) => {
    if (!showExplanation) {
      return 'bg-white border-slate-100 hover:border-indigo-200 hover:bg-indigo-50 text-slate-800';
    }
    if (index === example.correctIndex) {
      return 'bg-green-100 border-green-300 text-green-800';
    }
    if (index === selectedAnswer && index !== example.correctIndex) {
      return 'bg-red-100 border-red-300 text-red-800';
    }
    return 'bg-slate-50 border-slate-100 text-slate-400 opacity-60';
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-50 to-yellow-50 p-4 rounded-2xl border-2 border-amber-200">
        <div className="flex items-center gap-2 mb-2">
          <Lightbulb className="text-amber-500" size={20} />
          <h3 className="font-bold text-amber-900 text-sm">תרגול - בוא ננסה!</h3>
        </div>
        <p className="text-xs text-amber-700">
          תרגול {currentExample + 1} מתוך {examples.length} - אין טעויות כאן, רק ללימוד!
        </p>
        {/* Progress Bar */}
        <div className="mt-3 bg-amber-200 h-2 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-amber-400 to-yellow-500 h-full transition-all duration-300"
            style={{ width: `${((currentExample + 1) / examples.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Example Card */}
      <div className="bg-white p-5 rounded-2xl border-2 border-slate-100 shadow-sm">
        <h4 className="font-bold text-slate-800 text-sm mb-3 flex items-center gap-2">
          <Sparkles className="text-indigo-500" size={16} />
          {example.question}
        </h4>

        <div className="space-y-2 mb-4">
          {example.options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => !showExplanation && handleAnswer(idx)}
              disabled={showExplanation}
              className={`w-full text-right p-3 rounded-xl border-2 font-bold text-sm transition-all ${getButtonStyle(idx)} ${
                !showExplanation && 'hover:scale-[1.02] active:scale-95 cursor-pointer'
              }`}
            >
              {option}
            </button>
          ))}
        </div>

        {/* Explanation */}
        {showExplanation && (
          <div className={`p-4 rounded-xl border-2 mb-4 animate-fadeIn ${
            isCorrect
              ? 'bg-green-50 border-green-200'
              : 'bg-blue-50 border-blue-200'
          }`}>
            <div className="flex items-start gap-2">
              <span className="text-xl">{isCorrect ? '✅' : '💡'}</span>
              <div>
                <p className={`font-bold text-xs mb-1 ${
                  isCorrect ? 'text-green-800' : 'text-blue-800'
                }`}>
                  {isCorrect ? 'מצוין! תשובה נכונה' : 'בוא נלמד'}
                </p>
                <p className={`text-xs leading-relaxed ${
                  isCorrect ? 'text-green-700' : 'text-blue-700'
                }`}>
                  {example.explanation}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Next Button */}
        {showExplanation && (
          <Button
            onClick={handleNext}
            variant={isLastExample ? 'academy' : 'outline'}
            className="w-full"
          >
            {isLastExample ? (
              <>מוכן לחידון! <ArrowRight size={16} /></>
            ) : (
              <>לדוגמה הבאה <ArrowRight size={16} /></>
            )}
          </Button>
        )}
      </div>
    </div>
  );
};

export default PracticePhase;
