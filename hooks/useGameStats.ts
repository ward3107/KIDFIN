import { useState, useCallback } from 'react';
import { UserStats } from '../types';
import { useLocalStorage } from './useLocalStorage';

interface UseGameStatsOptions {
  /** Initial stats value */
  initialStats?: UserStats;
  /** Storage key for localStorage */
  storageKey?: string;
  /** XP required for level up */
  xpPerLevel?: number;
}

interface GameStatsActions {
  /** Add coins to the balance */
  addCoins: (amount: number) => void;
  /** Remove coins from the balance */
  removeCoins: (amount: number) => void;
  /** Add XP with automatic level up handling */
  addXP: (amount: number) => void;
  /** Add knowledge points */
  addKnowledgePoints: (amount: number) => void;
  /** Set savings amount */
  setSavings: (amount: number) => void;
  /** Add to savings */
  addSavings: (amount: number) => void;
  /** Remove from savings */
  removeSavings: (amount: number) => void;
  /** Update user name */
  setName: (name: string) => void;
  /** Reset stats to initial values */
  resetStats: () => void;
}

/**
 * A custom hook for managing game statistics with automatic persistence.
 *
 * This hook encapsulates all game stats logic including:
 * - Level calculation and progression
 * - XP tracking with level ups
 * - Coin management
 * - Knowledge points tracking
 * - Savings management
 * - Automatic localStorage persistence
 *
 * @param options - Configuration options
 * @returns [stats, actions] tuple similar to useState
 *
 * @example
 * ```tsx
 * const [stats, { addCoins, addXP, addKnowledgePoints }] = useGameStats({
 *   storageKey: 'myapp_stats',
 *   initialStats: {
 *     coins: 100,
 *     level: 1,
 *     xp: 0,
 *     savings: 0,
 *     knowledgePoints: 0,
 *     name: 'Player'
 *   }
 * });
 *
 * // Add coins
 * addCoins(50);
 *
 * // Add XP (will level up if >= xpPerLevel)
 * addXP(25);
 *
 * // Add knowledge points
 * addKnowledgePoints(1);
 * ```
 */
export function useGameStats(
  options: UseGameStatsOptions = {}
): [UserStats, GameStatsActions] {
  const {
    initialStats = {
      coins: 450,
      level: 1,
      xp: 65,
      savings: 820,
      knowledgePoints: 0,
      name: 'אופיר',
    },
    storageKey = 'save4dream_stats',
    xpPerLevel = 100,
  } = options;

  const [stats, setStats] = useLocalStorage<UserStats>(storageKey, initialStats);

  // Add coins
  const addCoins = useCallback((amount: number) => {
    setStats(prev => ({ ...prev, coins: prev.coins + amount }));
  }, [setStats]);

  // Remove coins
  const removeCoins = useCallback((amount: number) => {
    setStats(prev => ({ ...prev, coins: Math.max(0, prev.coins - amount) }));
  }, [setStats]);

  // Add XP with level up handling
  const addXP = useCallback((amount: number) => {
    setStats(prev => {
      const newXp = prev.xp + amount;
      const leveledUp = newXp >= xpPerLevel;

      return {
        ...prev,
        xp: leveledUp ? newXp - xpPerLevel : newXp,
        level: leveledUp ? prev.level + 1 : prev.level,
      };
    });
  }, [setStats, xpPerLevel]);

  // Add knowledge points
  const addKnowledgePoints = useCallback((amount: number) => {
    setStats(prev => ({ ...prev, knowledgePoints: prev.knowledgePoints + amount }));
  }, [setStats]);

  // Set savings amount
  const setSavings = useCallback((amount: number) => {
    setStats(prev => ({ ...prev, savings: Math.max(0, amount) }));
  }, [setStats]);

  // Add to savings
  const addSavings = useCallback((amount: number) => {
    setStats(prev => ({ ...prev, savings: prev.savings + amount }));
  }, [setStats]);

  // Remove from savings
  const removeSavings = useCallback((amount: number) => {
    setStats(prev => ({ ...prev, savings: Math.max(0, prev.savings - amount) }));
  }, [setStats]);

  // Update user name
  const setName = useCallback((name: string) => {
    setStats(prev => ({ ...prev, name }));
  }, [setStats]);

  // Reset stats to initial values
  const resetStats = useCallback(() => {
    setStats(initialStats);
  }, [setStats, initialStats]);

  const actions: GameStatsActions = {
    addCoins,
    removeCoins,
    addXP,
    addKnowledgePoints,
    setSavings,
    addSavings,
    removeSavings,
    setName,
    resetStats,
  };

  return [stats, actions];
}

export default useGameStats;
