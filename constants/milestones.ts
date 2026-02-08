import { Milestone } from '../types';

/**
 * Savings goal milestones for the bike (1200 coins)
 * Each milestone represents a percentage of the goal and includes
 * a celebration message and icon.
 */
export const SAVINGS_MILESTONES: Milestone[] = [
  {
    percentage: 25,
    name: 'התחלה מצוינת!',
    icon: '🌱',
    description: 'הגעת ל-25% מהיעד! כל התחלה מתחילה בצעד קטן.',
    achieved: false,
  },
  {
    percentage: 50,
    name: 'חצי הדרך!',
    icon: '🎯',
    description: 'הגעת ל-50%! כבר חצית את הדרך לאופניים!',
    achieved: false,
  },
  {
    percentage: 75,
    name: 'כמעט שם!',
    icon: '🚀',
    description: '75%! רק רבע מהדרך נותר להגיע ליעד!',
    achieved: false,
  },
  {
    percentage: 100,
    name: 'מטרה הושגה!',
    icon: '🎉',
    description: 'כל הכבוד! הגעת ל-100% ויש לך אופניים חדשים!',
    achieved: false,
  },
];

/**
 * Get milestone at a specific percentage
 */
export const getMilestoneAtPercentage = (percentage: number): Milestone | undefined => {
  return SAVINGS_MILESTONES.find(m => m.percentage === percentage);
};

/**
 * Get next unachieved milestone
 */
export const getNextMilestone = (currentProgress: number): Milestone | undefined => {
  return SAVINGS_MILESTONES.find(m => m.percentage > currentProgress && !m.achieved);
};

/**
 * Get all achieved milestones up to current percentage
 */
export const getAchievedMilestones = (currentProgress: number): Milestone[] => {
  return SAVINGS_MILESTONES.filter(m => m.percentage <= currentProgress);
};
