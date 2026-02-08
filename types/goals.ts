// ============================================================================
// PERSONAL GOALS TYPES
// ============================================================================

import { GoalCategory } from '../config/goalsCatalog';

/**
 * User's selected personal goal with progress tracking
 */
export interface UserPersonalGoal {
  readonly id: string; // Goal ID from catalog
  readonly goalId: string; // Reference to catalog item
  readonly name: string;
  readonly icon: string;
  readonly category: GoalCategory;
  readonly targetCost: number;
  readonly currentSavings: number;
  readonly completed: boolean;
  readonly completedAt: number | null;
  readonly createdAt: number;
}

/**
 * User's personal goals state
 */
export interface UserPersonalGoalsState {
  readonly hasSelectedGoals: boolean;
  readonly goals: UserPersonalGoal[];
  readonly activeGoalId: string | null; // The primary goal they're working towards
  readonly totalSaved: number;
  readonly totalCompleted: number;
}

/**
 * Goal selection step in onboarding
 */
export type GoalSelectionStep = 'welcome' | 'select_needs' | 'select_wants' | 'select_dreams' | 'confirm' | 'complete';

/**
 * Goal selection progress
 */
export interface GoalSelectionProgress {
  readonly step: GoalSelectionStep;
  readonly selectedNeeds: string[];
  readonly selectedWants: string[];
  readonly selectedDreams: string[];
  readonly minRequired: {
    needs: number;
    wants: number;
    dreams: number;
  };
}
