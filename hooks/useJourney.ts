import { useState, useEffect, useCallback } from 'react';
import { JourneyState, JourneyStep, JOURNEY_STEPS, JOURNEY_HINTS, JourneyHint } from '../types/journey';
import { useAppContext } from '../context/AppContext';
import { useLocalStorage } from './useLocalStorage';

const STORAGE_KEY = 'save4dream_journey';

/**
 * Hook to manage the user's journey through the financial literacy app
 * Provides contextual hints and tracks progress
 */
export const useJourney = () => {
  const { stats, userBehavior, missions, scenarios } = useAppContext();

  // Journey state
  const [journeyState, setJourneyState] = useLocalStorage<{
    currentStage: JourneyState['currentStage'];
    completedSteps: string[];
    showJourneyGuide: boolean;
    lastCompletedAction: string | null;
    totalActionsCompleted: number;
  }>(
    STORAGE_KEY,
    {
      currentStage: 'onboarding',
      completedSteps: [],
      showJourneyGuide: true,
      lastCompletedAction: null,
      totalActionsCompleted: 0,
    }
  );

  // Calculate current step based on progress
  const getCurrentStep = useCallback((): JourneyStep => {
    const completedLessons = stats.knowledgePoints;
    const completedMissions = missions.filter(m => m.completed).length;
    const completedScenarios = scenarios.filter(s => s.completed).length;
    const purchases = userBehavior.purchases.length;

    for (let i = 0; i < JOURNEY_STEPS.length; i++) {
      const step = JOURNEY_STEPS[i];
      const isCompleted = journeyState.completedSteps.includes(step.id);

      if (isCompleted) continue;

      // Check if step requirements are met
      const requirements = step.requiredProgress;
      const meetsRequirements =
        (!requirements.knowledgePoints || stats.knowledgePoints >= requirements.knowledgePoints) &&
        (!requirements.completedLessons || completedLessons >= requirements.completedLessons) &&
        (!requirements.completedMissions || completedMissions >= requirements.completedMissions) &&
        (!requirements.coins || stats.coins >= requirements.coins) &&
        (!requirements.savings || stats.savings >= requirements.savings) &&
        (!requirements.purchases || purchases >= requirements.purchases);

      if (meetsRequirements) {
        return { ...step, completed: false };
      }
    }

    // All steps completed
    return {
      ...JOURNEY_STEPS[JOURNEY_STEPS.length - 1],
      completed: journeyState.completedSteps.includes(JOURNEY_STEPS[JOURNEY_STEPS.length - 1].id),
    };
  }, [stats, userBehavior, missions, scenarios, journeyState.completedSteps]);

  // Get current journey step
  const currentStep = getCurrentStep();

  // Get relevant hint for current tab
  const getHintForTab = useCallback((tab: string): JourneyHint | null => {
    const appState = { stats, userBehavior, missions, scenarios };

    // Filter hints for this tab
    const tabHints = JOURNEY_HINTS.filter(h => h.tab === tab);

    // Sort by priority
    tabHints.sort((a, b) => a.priority - b.priority);

    // Find first hint that meets condition
    for (const hint of tabHints) {
      if (hint.condition(appState)) {
        return hint;
      }
    }

    return null;
  }, [stats, userBehavior, missions, scenarios]);

  // Mark a step as completed
  const completeStep = useCallback((stepId: string) => {
    if (!journeyState.completedSteps.includes(stepId)) {
      setJourneyState(prev => ({
        ...prev,
        completedSteps: [...prev.completedSteps, stepId],
        lastCompletedAction: stepId,
        totalActionsCompleted: prev.totalActionsCompleted + 1,
      }));
    }
  }, [journeyState.completedSteps, setJourneyState]);

  // Check and auto-complete steps based on current progress
  useEffect(() => {
    const completedLessons = stats.knowledgePoints;
    const completedMissions = missions.filter(m => m.completed).length;
    const purchases = userBehavior.purchases.length;

    JOURNEY_STEPS.forEach(step => {
      if (journeyState.completedSteps.includes(step.id)) return;

      const requirements = step.requiredProgress;
      const meetsRequirements =
        (!requirements.knowledgePoints || stats.knowledgePoints >= requirements.knowledgePoints) &&
        (!requirements.completedLessons || completedLessons >= requirements.completedLessons) &&
        (!requirements.completedMissions || completedMissions >= requirements.completedMissions) &&
        (!requirements.coins || stats.coins >= requirements.coins) &&
        (!requirements.savings || stats.savings >= requirements.savings) &&
        (!requirements.purchases || purchases >= requirements.purchases);

      if (meetsRequirements) {
        completeStep(step.id);
      }
    });
  }, [stats, missions, userBehavior, journeyState.completedSteps, completeStep]);

  // Calculate overall journey progress
  const journeyProgress = {
    current: journeyState.completedSteps.length,
    total: JOURNEY_STEPS.length,
    percentage: Math.round((journeyState.completedSteps.length / JOURNEY_STEPS.length) * 100),
  };

  // Get next recommended action
  const getNextAction = useCallback((): { step: JourneyStep; hint: string } | null => {
    if (currentStep.completed) {
      // Find next incomplete step
      const nextStep = JOURNEY_STEPS.find(step => !journeyState.completedSteps.includes(step.id));
      if (nextStep) {
        return {
          step: { ...nextStep, completed: false },
          hint: `השלב הבא: ${nextStep.title}`,
        };
      }
    }
    return currentStep && !currentStep.completed ? {
      step: currentStep,
      hint: currentStep.description,
    } : null;
  }, [currentStep, journeyState.completedSteps]);

  // Toggle journey guide visibility
  const toggleJourneyGuide = useCallback(() => {
    setJourneyState(prev => ({ ...prev, showJourneyGuide: !prev.showJourneyGuide }));
  }, [setJourneyState]);

  return {
    journeyState,
    currentStep,
    journeyProgress,
    getHintForTab,
    completeStep,
    getNextAction,
    toggleJourneyGuide,
  };
};

export default useJourney;
