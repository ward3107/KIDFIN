import { useState, useCallback, useMemo } from 'react';
import { Mission } from '../types';
import { useLocalStorage } from './useLocalStorage';
import { INITIAL_MISSIONS } from '../constants';
import { generateMagicMission } from '../services/geminiService';
import type useGameStats from './useGameStats';

type GameActions = ReturnType<typeof useGameStats>[1];

interface UseMissionsStateOptions {
  missionsKey: string;
  dailyTasksKey: string;
  maxDailyTasks: number;
  gameActions: GameActions;
  triggerConfetti: () => void;
}

interface DailyCounter {
  count: number;
  /** ISO date in the app's local day (YYYY-MM-DD). */
  date: string;
}

const todayKey = (): string => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export function useMissionsState({
  missionsKey,
  dailyTasksKey,
  maxDailyTasks,
  gameActions,
  triggerConfetti,
}: UseMissionsStateOptions) {
  const [missions, setMissions] = useLocalStorage<Mission[]>(missionsKey, INITIAL_MISSIONS);
  const [counter, setCounter] = useLocalStorage<DailyCounter>(dailyTasksKey, { count: 0, date: todayKey() });
  const [isMissionLoading, setIsMissionLoading] = useState(false);

  // If the stored counter is from a previous day, treat today's count as 0
  // without rewriting localStorage (the next increment will normalize it).
  const dailyTasksGenerated = useMemo(
    () => (counter.date === todayKey() ? counter.count : 0),
    [counter]
  );

  const setDailyTasksGenerated = useCallback(
    (next: number | ((prev: number) => number)) => {
      const today = todayKey();
      setCounter(prev => {
        const base = prev.date === today ? prev.count : 0;
        const newCount = typeof next === 'function' ? (next as (p: number) => number)(base) : next;
        return { count: newCount, date: today };
      });
    },
    [setCounter]
  );

  const handleMagicMission = useCallback(async () => {
    if (dailyTasksGenerated >= maxDailyTasks) return;
    setIsMissionLoading(true);
    try {
      const newMissionData = await generateMagicMission();
      if (!newMissionData) return;
      const newMission: Mission = {
        id: Date.now().toString(),
        title: newMissionData.title,
        reward: newMissionData.reward,
        icon: newMissionData.icon,
        completed: false,
        isAiGenerated: true,
      };
      setMissions(prev => [newMission, ...prev]);
      setDailyTasksGenerated(prev => prev + 1);
      triggerConfetti();
    } finally {
      setIsMissionLoading(false);
    }
  }, [dailyTasksGenerated, maxDailyTasks, setMissions, setDailyTasksGenerated, triggerConfetti]);

  const completeMission = useCallback((id: string, reward: number) => {
    setMissions(prev => prev.map(m => m.id === id ? { ...m, completed: true } : m));
    gameActions.addCoins(reward);
    gameActions.addXP(25);
    triggerConfetti();
  }, [setMissions, gameActions, triggerConfetti]);

  return {
    missions,
    setMissions,
    dailyTasksGenerated,
    setDailyTasksGenerated,
    isMissionLoading,
    setIsMissionLoading,
    handleMagicMission,
    completeMission,
  };
}
