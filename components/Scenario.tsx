import React, { useState } from 'react';
import { Scenario, ScenarioChoice } from '../types';
import { Button } from './UI';

interface ScenarioComponentProps {
  /** The scenario to display */
  scenario: Scenario;
  /** Called when a choice is made with the choice result */
  onChoice: (choice: ScenarioChoice) => void;
  /** Called to close/dismiss the scenario */
  onClose?: () => void;
}

/**
 * An interactive scenario component for teaching financial decision-making.
 *
 * Displays a scenario with multiple choice options and provides immediate feedback
 * based on the user's choice. Rewards are given for good decisions.
 *
 * @example
 * ```tsx
 * <Scenario
 *   scenario={currentScenario}
 *   onChoice={(choice) => {
 *     // Handle the choice - award rewards, show feedback, etc.
 *   }}
 *   onClose={() => setShowScenario(false)}
 * />
 * ```
 */
export const ScenarioModal: React.FC<ScenarioComponentProps> = ({
  scenario,
  onChoice,
  onClose,
}) => {
  const [selectedChoice, setSelectedChoice] = useState<ScenarioChoice | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const handleChoiceClick = (choice: ScenarioChoice) => {
    setSelectedChoice(choice);
    setShowFeedback(true);

    // Notify parent component after a short delay for visual effect
    setTimeout(() => {
      onChoice(choice);
    }, 1500);
  };

  const handleReset = () => {
    setSelectedChoice(null);
    setShowFeedback(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-md w-full max-h-[90dvh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 rounded-t-[2.5rem] text-white relative">
          {onClose && (
            <button
              onClick={onClose}
              className="absolute top-4 left-4 bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors"
              aria-label="סגור"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M1 1L15 15M1 15L15 1" stroke="currentColor" strokeWidth={2} strokeLinecap="round"/>
              </svg>
            </button>
          )}
          <div className="text-5xl mb-3">{scenario.icon}</div>
          <h2 className="text-xl font-black mb-2">{scenario.title}</h2>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Scenario Description */}
          <p className="text-slate-700 leading-relaxed text-sm mb-6">
            {scenario.description}
          </p>

          {!showFeedback ? (
            /* Choices */
            <div className="space-y-3">
              <p className="text-sm font-bold text-slate-800 mb-3">מה תעשה?</p>
              {scenario.choices.map((choice) => (
                <button
                  key={choice.id}
                  onClick={() => handleChoiceClick(choice)}
                  className="w-full text-right p-4 rounded-2xl border-2 border-slate-100 bg-white hover:border-indigo-200 hover:bg-indigo-50 transition-all group"
                >
                  <span className="font-bold text-slate-800 text-sm">{choice.text}</span>
                </button>
              ))}
            </div>
          ) : (
            /* Feedback */
            <div className="space-y-4">
              <div className={`p-4 rounded-2xl border-2 ${
                selectedChoice?.isCorrect
                  ? 'bg-green-50 border-green-200'
                  : 'bg-orange-50 border-orange-200'
              }`}>
                <div className="flex items-start gap-3">
                  <div className="text-2xl shrink-0">
                    {selectedChoice?.isCorrect ? '🌟' : '💭'}
                  </div>
                  <div>
                    <p className={`font-black text-sm mb-1 ${
                      selectedChoice?.isCorrect ? 'text-green-800' : 'text-orange-800'
                    }`}>
                      {selectedChoice?.isCorrect ? 'בחירה מצוינת!' : 'נסה לחשוב שוב...'}
                    </p>
                    <p className={`text-sm leading-relaxed ${
                      selectedChoice?.isCorrect ? 'text-green-700' : 'text-orange-700'
                    }`}>
                      {selectedChoice?.feedback}
                    </p>
                  </div>
                </div>
              </div>

              {/* Rewards */}
              {selectedChoice && (selectedChoice.coinsReward > 0 || selectedChoice.xpReward > 0) && (
                <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100">
                  <p className="text-sm font-black text-indigo-900 mb-2">הרווחת:</p>
                  <div className="flex gap-4">
                    {selectedChoice.coinsReward > 0 && (
                      <div className="flex items-center gap-1">
                        <span className="text-orange-500 font-black text-sm">
                          {selectedChoice.coinsReward}
                        </span>
                        <span className="text-xs text-slate-600">מטבעות</span>
                      </div>
                    )}
                    {selectedChoice.xpReward > 0 && (
                      <div className="flex items-center gap-1">
                        <span className="text-indigo-500 font-black text-sm">
                          {selectedChoice.xpReward}
                        </span>
                        <span className="text-xs text-slate-600">XP</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Try Again Button */}
              <Button
                onClick={handleReset}
                variant="academy"
                className="w-full"
              >
                נסה שוב
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScenarioModal;
