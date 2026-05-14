import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAchievements } from '../hooks/useAchievements';
import type { UserStats, UserBehavior } from '../types';

const baseStats: UserStats = {
  coins: 0,
  level: 1,
  xp: 0,
  savings: 0,
  knowledgePoints: 0,
  name: '',
};

const baseBehavior: UserBehavior = {
  purchases: [],
  savingsDeposits: 0,
  completedMissions: 0,
  totalEarned: 0,
  totalSpent: 0,
};

describe('useAchievements', () => {
  it('starts with all achievements locked', () => {
    const { result } = renderHook(() => useAchievements('test_ach_empty'));
    expect(result.current.totalUnlocked).toBe(0);
    expect(result.current.newlyUnlocked).toBeNull();
  });

  it('unlocks first_savings when savings reaches 50', () => {
    const { result } = renderHook(() => useAchievements('test_ach_savings'));
    act(() => {
      result.current.checkAchievements({
        stats: { ...baseStats, savings: 50 },
        userBehavior: baseBehavior,
        missionsCompleted: 0,
        dailyTasksCompleted: 0,
      });
    });
    const first = result.current.achievements.find(a => a.id === 'first_savings');
    expect(first?.achieved).toBe(true);
    expect(result.current.newlyUnlocked?.id).toBe('first_savings');
    expect(result.current.totalUnlocked).toBeGreaterThanOrEqual(1);
  });

  it('does not re-fire newlyUnlocked for already-unlocked achievements', () => {
    const { result } = renderHook(() => useAchievements('test_ach_idempotent'));
    act(() => {
      result.current.checkAchievements({
        stats: { ...baseStats, savings: 50 },
        userBehavior: baseBehavior,
        missionsCompleted: 0,
        dailyTasksCompleted: 0,
      });
    });
    act(() => result.current.clearNewlyUnlocked());
    act(() => {
      result.current.checkAchievements({
        stats: { ...baseStats, savings: 50 },
        userBehavior: baseBehavior,
        missionsCompleted: 0,
        dailyTasksCompleted: 0,
      });
    });
    expect(result.current.newlyUnlocked).toBeNull();
  });

  it('unlocks wise_spender only when last 5 purchases are all needs', () => {
    const { result } = renderHook(() => useAchievements('test_ach_wise'));
    const fivePurchases = (type: 'need' | 'want') =>
      Array.from({ length: 5 }, (_, i) => ({
        rewardId: `r${i}`,
        rewardName: `item-${i}`,
        type,
        price: 10,
        timestamp: i,
      }));

    act(() => {
      result.current.checkAchievements({
        stats: baseStats,
        userBehavior: { ...baseBehavior, purchases: fivePurchases('want') },
        missionsCompleted: 0,
        dailyTasksCompleted: 0,
      });
    });
    expect(result.current.achievements.find(a => a.id === 'wise_spender')?.achieved).toBe(false);

    act(() => {
      result.current.checkAchievements({
        stats: baseStats,
        userBehavior: { ...baseBehavior, purchases: fivePurchases('need') },
        missionsCompleted: 0,
        dailyTasksCompleted: 0,
      });
    });
    expect(result.current.achievements.find(a => a.id === 'wise_spender')?.achieved).toBe(true);
  });
});
