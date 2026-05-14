import { useState, useCallback } from 'react';
import { Scenario, ScenarioChoice } from '../types';
import { useLocalStorage } from './useLocalStorage';
import { SCENARIOS } from '../config/scenarios';
import type useGameStats from './useGameStats';

type GameActions = ReturnType<typeof useGameStats>[1];

interface UseScenarioStateOptions {
  storageKey: string;
  gameActions: GameActions;
  triggerConfetti: () => void;
}

export function useScenarioState({ storageKey, gameActions, triggerConfetti }: UseScenarioStateOptions) {
  const [scenarios, setScenarios] = useLocalStorage(storageKey, SCENARIOS);
  const [currentScenario, setCurrentScenario] = useState<Scenario | null>(null);
  const [showScenario, setShowScenario] = useState(false);

  const handleScenarioChoice = useCallback((choice: ScenarioChoice) => {
    if (choice.coinsReward) gameActions.addCoins(choice.coinsReward);
    if (choice.xpReward) gameActions.addXP(choice.xpReward);

    if (currentScenario) {
      setScenarios(prev => prev.map(s =>
        s.id === currentScenario.id ? { ...s, completed: true, completedAt: Date.now() } : s
      ));
    }

    triggerConfetti();
    setTimeout(() => {
      setShowScenario(false);
      setCurrentScenario(null);
    }, 2000);
  }, [currentScenario, gameActions, setScenarios, triggerConfetti]);

  const triggerRandomScenario = useCallback(() => {
    const uncompleted = scenarios.filter(s => !s.completed);
    if (uncompleted.length === 0) return;
    const randomScenario = uncompleted[Math.floor(Math.random() * uncompleted.length)];
    setCurrentScenario(randomScenario);
    setShowScenario(true);
  }, [scenarios]);

  return {
    scenarios,
    setScenarios,
    currentScenario,
    setCurrentScenario,
    showScenario,
    setShowScenario,
    handleScenarioChoice,
    triggerRandomScenario,
  };
}
