import { useState, useEffect, useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { UserPersonalGoal, UserPersonalGoalsState, GoalSelectionStep, GoalSelectionProgress } from '../types/goals';
import { PersonalGoal, GOALS_CATALOG } from '../config/goalsCatalog';

const STORAGE_KEY = 'save4dream_personal_goals';
const SELECTION_PROGRESS_KEY = 'save4dream_goal_selection_progress';

/**
 * Hook to manage user's personal financial goals
 */
export const usePersonalGoals = () => {
  // User's selected goals with progress
  const [goalsState, setGoalsState] = useLocalStorage<UserPersonalGoalsState>(
    STORAGE_KEY,
    {
      hasSelectedGoals: false,
      goals: [],
      activeGoalId: null,
      totalSaved: 0,
      totalCompleted: 0,
    }
  );

  // Goal selection progress during onboarding
  const [selectionProgress, setSelectionProgress] = useLocalStorage<GoalSelectionProgress>(
    SELECTION_PROGRESS_KEY,
    {
      step: 'welcome',
      selectedNeeds: [],
      selectedWants: [],
      selectedDreams: [],
      minRequired: {
        needs: 2,
        wants: 2,
        dreams: 1,
      },
    }
  );

  // Get goal details from catalog
  const getGoalById = useCallback((goalId: string): PersonalGoal | undefined => {
    return GOALS_CATALOG.find(goal => goal.id === goalId);
  }, []);

  // Get user's goal with progress
  const getUserGoal = useCallback((goalId: string): UserPersonalGoal | undefined => {
    return goalsState.goals.find(goal => goal.id === goalId);
  }, [goalsState.goals]);

  // Select goals during onboarding
  const selectGoal = useCallback((goalId: string, category: 'needs' | 'wants' | 'dreams') => {
    setSelectionProgress(prev => {
      const categoryKey = category === 'needs' ? 'selectedNeeds' :
                         category === 'wants' ? 'selectedWants' : 'selectedDreams';

      const selected = prev[categoryKey];
      if (selected.includes(goalId)) {
        // Deselect
        return {
          ...prev,
          [categoryKey]: selected.filter(id => id !== goalId),
        };
      } else {
        // Select
        return {
          ...prev,
          [categoryKey]: [...selected, goalId],
        };
      }
    });
  }, [setSelectionProgress]);

  // Move to next selection step
  const nextStep = useCallback(() => {
    setSelectionProgress(prev => {
      const steps: GoalSelectionStep[] = ['welcome', 'select_needs', 'select_wants', 'select_dreams', 'confirm', 'complete'];
      const currentIndex = steps.indexOf(prev.step);
      if (currentIndex < steps.length - 1) {
        return { ...prev, step: steps[currentIndex + 1] };
      }
      return prev;
    });
  }, [setSelectionProgress]);

  // Go to previous selection step
  const prevStep = useCallback(() => {
    setSelectionProgress(prev => {
      const steps: GoalSelectionStep[] = ['welcome', 'select_needs', 'select_wants', 'select_dreams', 'confirm', 'complete'];
      const currentIndex = steps.indexOf(prev.step);
      if (currentIndex > 0) {
        return { ...prev, step: steps[currentIndex - 1] };
      }
      return prev;
    });
  }, [setSelectionProgress]);

  // Check if current step requirements are met
  const canProceed = useCallback((): boolean => {
    const { step, selectedNeeds, selectedWants, selectedDreams, minRequired } = selectionProgress;

    switch (step) {
      case 'select_needs':
        return selectedNeeds.length >= minRequired.needs;
      case 'select_wants':
        return selectedWants.length >= minRequired.wants;
      case 'select_dreams':
        return selectedDreams.length >= minRequired.dreams;
      case 'confirm':
        return selectedNeeds.length >= minRequired.needs &&
               selectedWants.length >= minRequired.wants &&
               selectedDreams.length >= minRequired.dreams;
      default:
        return true;
    }
  }, [selectionProgress]);

  // Complete goal selection and create user goals
  const completeSelection = useCallback(() => {
    const { selectedNeeds, selectedWants, selectedDreams } = selectionProgress;
    const allSelectedIds = [...selectedNeeds, ...selectedWants, ...selectedDreams];

    const userGoals: UserPersonalGoal[] = allSelectedIds.map((goalId, index) => {
      const catalogGoal = getGoalById(goalId);
      if (!catalogGoal) throw new Error(`Goal ${goalId} not found in catalog`);

      return {
        id: `user_goal_${Date.now()}_${index}`,
        goalId: catalogGoal.id,
        name: catalogGoal.name,
        icon: catalogGoal.icon,
        category: catalogGoal.category,
        targetCost: catalogGoal.cost,
        currentSavings: 0,
        completed: false,
        completedAt: null,
        createdAt: Date.now(),
      };
    });

    // Set first dream as active goal
    const firstDream = userGoals.find(g => g.category === 'dream');

    setGoalsState({
      hasSelectedGoals: true,
      goals: userGoals,
      activeGoalId: firstDream?.id || null,
      totalSaved: 0,
      totalCompleted: 0,
    });

    // Mark selection as complete
    setSelectionProgress(prev => ({ ...prev, step: 'complete' }));
  }, [selectionProgress, getGoalById, setGoalsState, setSelectionProgress]);

  // Add savings to a specific goal
  const addSavingsToGoal = useCallback((goalId: string, amount: number) => {
    setGoalsState(prev => {
      const updatedGoals = prev.goals.map(goal => {
        if (goal.id === goalId && !goal.completed) {
          const newSavings = goal.currentSavings + amount;
          const completed = newSavings >= goal.targetCost;

          return {
            ...goal,
            currentSavings: newSavings,
            completed,
            completedAt: completed ? Date.now() : null,
          };
        }
        return goal;
      });

      const newTotalSaved = updatedGoals.reduce((sum, g) => sum + g.currentSavings, 0);
      const newTotalCompleted = updatedGoals.filter(g => g.completed).length;

      return {
        ...prev,
        goals: updatedGoals,
        totalSaved: newTotalSaved,
        totalCompleted: newTotalCompleted,
      };
    });
  }, [setGoalsState]);

  // Set active goal (the primary goal to work towards)
  const setActiveGoal = useCallback((goalId: string) => {
    setGoalsState(prev => ({ ...prev, activeGoalId: goalId }));
  }, [setGoalsState]);

  // Get active goal object
  const activeGoal = goalsState.activeGoalId
    ? goalsState.goals.find(g => g.id === goalsState.activeGoalId)
    : goalsState.goals.find(g => g.category === 'dream') || goalsState.goals[0] || null;

  // Reset all goals (for starting over)
  const resetGoals = useCallback(() => {
    setGoalsState({
      hasSelectedGoals: false,
      goals: [],
      activeGoalId: null,
      totalSaved: 0,
      totalCompleted: 0,
    });
    setSelectionProgress({
      step: 'welcome',
      selectedNeeds: [],
      selectedWants: [],
      selectedDreams: [],
      minRequired: {
        needs: 2,
        wants: 2,
        dreams: 1,
      },
    });
  }, [setGoalsState, setSelectionProgress]);

  return {
    // State
    goalsState,
    selectionProgress,
    activeGoal,

    // Actions
    selectGoal,
    nextStep,
    prevStep,
    canProceed,
    completeSelection,
    addSavingsToGoal,
    setActiveGoal,
    getGoalById,
    getUserGoal,
    resetGoals,
  };
};

export default usePersonalGoals;
