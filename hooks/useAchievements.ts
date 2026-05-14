import { useState, useCallback, useEffect } from 'react';
import { Achievement, UserStats, UserBehavior } from '../types';
import { ACHIEVEMENTS } from '../constants/achievements';
import { useLocalStorage } from './useLocalStorage';

interface CheckAchievementsOptions {
  stats: UserStats;
  userBehavior: UserBehavior;
  missionsCompleted: number;
  dailyTasksCompleted: number;
}

interface UseAchievementsReturn {
  achievements: Achievement[];
  totalUnlocked: number;
  newlyUnlocked: Achievement | null;
  clearNewlyUnlocked: () => void;
  checkAchievements: (options: CheckAchievementsOptions) => void;
}

/**
 * A custom hook for managing game achievements.
 *
 * This hook:
 * - Tracks all achievements and their unlock status
 * - Checks achievement conditions based on game state
 * - Notifies when new achievements are unlocked
 * - Persists achievement state to localStorage
 *
 * @param storageKey - The localStorage key for persisting achievements
 * @returns Achievement tracking object
 *
 * @example
 * ```tsx
 * const {
 *   achievements,
 *   totalUnlocked,
 *   newlyUnlocked,
 *   checkAchievements
 * } = useAchievements('myapp_achievements');
 *
 * // Check for achievements when game state changes
 * useEffect(() => {
 *   checkAchievements({ stats, userBehavior, missionsCompleted, dailyTasksCompleted });
 * }, [stats]);
 *
 * // Show notification for new achievement
 * {newlyUnlocked && <AchievementToast achievement={newlyUnlocked} />}
 * ```
 */
export function useAchievements(storageKey: string = 'save4dream_achievements'): UseAchievementsReturn {
  const [achievements, setAchievements] = useLocalStorage<Achievement[]>(storageKey, ACHIEVEMENTS);
  const [newlyUnlocked, setNewlyUnlocked] = useState<Achievement | null>(null);

  // Calculate total unlocked
  const totalUnlocked = achievements.filter(a => a.achieved).length;

  // Clear newly unlocked notification
  const clearNewlyUnlocked = useCallback(() => {
    setNewlyUnlocked(null);
  }, []);

  /**
   * Check all achievement conditions and unlock any that are met
   */
  const checkAchievements = useCallback((options: CheckAchievementsOptions) => {
    const { stats, userBehavior, missionsCompleted, dailyTasksCompleted } = options;

    let firstNewUnlock: Achievement | null = null;
    let hasChanges = false;
    const now = Date.now();

    const updated = achievements.map(achievement => {
      if (achievement.achieved) return achievement;

      let shouldUnlock = false;
      switch (achievement.id) {
        case 'first_savings':     shouldUnlock = stats.savings >= 50; break;
        case 'smart_saver':       shouldUnlock = stats.savings >= 500; break;
        case 'savings_master':    shouldUnlock = stats.savings >= 1000; break;
        case 'goal_getter':       shouldUnlock = stats.savings >= 1200; break;
        case 'first_lesson':      shouldUnlock = stats.knowledgePoints >= 1; break;
        case 'knowledge_seeker':  shouldUnlock = stats.knowledgePoints >= 5; break;
        case 'financial_expert':  shouldUnlock = stats.knowledgePoints >= 10; break;
        case 'first_mission':     shouldUnlock = missionsCompleted >= 1; break;
        case 'mission_master':    shouldUnlock = missionsCompleted >= 10; break;
        case 'daily_hero':        shouldUnlock = dailyTasksCompleted >= 3; break;
        case 'first_purchase':    shouldUnlock = userBehavior.purchases.length >= 1; break;
        case 'wise_spender': {
          const last5 = userBehavior.purchases.slice(-5);
          shouldUnlock = last5.length >= 5 && last5.every(p => p.type === 'need');
          break;
        }
        case 'level_up':          shouldUnlock = stats.level >= 2; break;
        case 'high_roller':       shouldUnlock = stats.coins >= 1000; break;
      }

      if (shouldUnlock) {
        hasChanges = true;
        const unlocked = { ...achievement, achieved: true, achievedAt: now } as Achievement;
        if (!firstNewUnlock) firstNewUnlock = unlocked;
        return unlocked;
      }
      return achievement;
    });

    if (hasChanges) {
      setAchievements(updated);
      if (firstNewUnlock) setNewlyUnlocked(firstNewUnlock);
    }
  }, [achievements, setAchievements]);

  return {
    achievements,
    totalUnlocked,
    newlyUnlocked,
    clearNewlyUnlocked,
    checkAchievements,
  };
}

export default useAchievements;
