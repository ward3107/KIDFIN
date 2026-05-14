import { useState, useCallback } from 'react';
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

export function useMissionsState({
  missionsKey,
  dailyTasksKey,
  maxDailyTasks,
  gameActions,
  triggerConfetti,
}: UseMissionsStateOptions) {
  const [missions, setMissions] = useLocalStorage<Mission[]>(missionsKey, INITIAL_MISSIONS);
  const [dailyTasksGenerated, setDailyTasksGenerated] = useLocalStorage<number>(dailyTasksKey, 0);
  const [isMissionLoading, setIsMissionLoading] = useState(false);

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
