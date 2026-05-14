import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserStats, Mission, Lesson, Reward, UserBehavior, Milestone, Scenario, ScenarioChoice } from '../types';
import { SAVINGS_MILESTONES } from '../constants/milestones';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useGameStats } from '../hooks/useGameStats';
import { useAchievements } from '../hooks/useAchievements';
import { useNotifications } from '../hooks/useNotifications';
import { useLessonState } from '../hooks/useLessonState';
import { useScenarioState } from '../hooks/useScenarioState';
import { useMissionsState } from '../hooks/useMissionsState';

export const MAX_DAILY_TASKS = 3;
export const BIKE_GOAL = 1200;

const STORAGE_KEYS = {
  STATS: 'save4dream_stats',
  MISSIONS: 'save4dream_missions',
  DAILY_TASKS: 'save4dream_daily_tasks',
  USER_BEHAVIOR: 'save4dream_user_behavior',
  MILESTONES: 'save4dream_milestones',
  ACHIEVEMENTS: 'save4dream_achievements',
  SCENARIOS: 'save4dream_scenarios',
};

interface AppContextType {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  stats: UserStats;
  gameActions: ReturnType<typeof useGameStats>[1];
  missions: Mission[];
  setMissions: React.Dispatch<React.SetStateAction<Mission[]>>;
  dailyTasksGenerated: number;
  setDailyTasksGenerated: React.Dispatch<React.SetStateAction<number>>;
  userBehavior: UserBehavior;
  setUserBehavior: React.Dispatch<React.SetStateAction<UserBehavior>>;
  milestones: Milestone[];
  setMilestones: React.Dispatch<React.SetStateAction<Milestone[]>>;
  achievements: ReturnType<typeof useAchievements>['achievements'];
  totalUnlocked: number;
  newlyUnlocked: ReturnType<typeof useAchievements>['newlyUnlocked'];
  clearNewlyUnlocked: () => void;
  dailyTip: string;
  setDailyTip: React.Dispatch<React.SetStateAction<string>>;
  isTipLoading: boolean;
  setIsTipLoading: React.Dispatch<React.SetStateAction<boolean>>;
  isMissionLoading: boolean;
  setIsMissionLoading: React.Dispatch<React.SetStateAction<boolean>>;
  isLessonLoading: boolean;
  setIsLessonLoading: React.Dispatch<React.SetStateAction<boolean>>;
  showConfetti: boolean;
  setShowConfetti: React.Dispatch<React.SetStateAction<boolean>>;
  purchaseNotification: Reward | null;
  setPurchaseNotification: React.Dispatch<React.SetStateAction<Reward | null>>;
  milestoneNotification: Milestone | null;
  setMilestoneNotification: React.Dispatch<React.SetStateAction<Milestone | null>>;
  scenarios: Scenario[];
  setScenarios: React.Dispatch<React.SetStateAction<Scenario[]>>;
  currentScenario: Scenario | null;
  setCurrentScenario: React.Dispatch<React.SetStateAction<Scenario | null>>;
  showScenario: boolean;
  setShowScenario: React.Dispatch<React.SetStateAction<boolean>>;
  currentLesson: Lesson | null;
  setCurrentLesson: React.Dispatch<React.SetStateAction<Lesson | null>>;
  lessonResult: 'success' | 'failure' | null;
  setLessonResult: React.Dispatch<React.SetStateAction<'success' | 'failure' | null>>;
  fetchTip: () => Promise<void>;
  handleMagicMission: () => Promise<void>;
  handleStartLesson: () => Promise<void>;
  handleAnswerQuiz: (index: number) => void;
  completeMission: (id: string, reward: number) => void;
  triggerConfetti: () => void;
  checkMilestones: (newSavings: number) => void;
  handleScenarioChoice: (choice: ScenarioChoice) => void;
  triggerRandomScenario: () => void;
  handleDeposit: () => void;
  handleWithdraw: () => void;
  handlePurchase: (reward: Reward) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [stats, gameActions] = useGameStats({ storageKey: STORAGE_KEYS.STATS });

  const notifications = useNotifications();
  const { triggerConfetti, setPurchaseNotification, setMilestoneNotification } = notifications;

  const [userBehavior, setUserBehavior] = useLocalStorage<UserBehavior>(STORAGE_KEYS.USER_BEHAVIOR, {
    purchases: [],
    savingsDeposits: 0,
    completedMissions: 0,
    totalEarned: 0,
    totalSpent: 0,
  });
  const [milestones, setMilestones] = useLocalStorage<Milestone[]>(STORAGE_KEYS.MILESTONES, SAVINGS_MILESTONES);

  const missionsState = useMissionsState({
    missionsKey: STORAGE_KEYS.MISSIONS,
    dailyTasksKey: STORAGE_KEYS.DAILY_TASKS,
    maxDailyTasks: MAX_DAILY_TASKS,
    gameActions,
    triggerConfetti,
  });

  const lessonState = useLessonState({
    knowledgePoints: stats.knowledgePoints,
    gameActions,
    triggerConfetti,
  });

  const scenarioState = useScenarioState({
    storageKey: STORAGE_KEYS.SCENARIOS,
    gameActions,
    triggerConfetti,
  });

  const {
    achievements,
    totalUnlocked,
    newlyUnlocked,
    clearNewlyUnlocked,
    checkAchievements,
  } = useAchievements(STORAGE_KEYS.ACHIEVEMENTS);

  const missionsCompleted = missionsState.missions.filter(m => m.completed).length;

  useEffect(() => {
    checkAchievements({
      stats,
      userBehavior,
      missionsCompleted,
      dailyTasksCompleted: missionsState.dailyTasksGenerated,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    stats.savings,
    stats.knowledgePoints,
    stats.level,
    stats.coins,
    missionsCompleted,
    missionsState.dailyTasksGenerated,
    userBehavior.purchases.length,
  ]);

  const checkMilestones = useCallback((newSavings: number) => {
    const progressPercent = Math.floor((newSavings / BIKE_GOAL) * 100);
    let firstNewlyAchieved: Milestone | null = null;
    let hasChanges = false;

    const updated = milestones.map(milestone => {
      if (!milestone.achieved && progressPercent >= milestone.percentage) {
        hasChanges = true;
        const reached = { ...milestone, achieved: true, achievedAt: Date.now() };
        if (!firstNewlyAchieved) firstNewlyAchieved = reached;
        return reached;
      }
      return milestone;
    });

    if (hasChanges) {
      setMilestones(updated);
      if (firstNewlyAchieved) {
        setMilestoneNotification(firstNewlyAchieved);
        triggerConfetti();
      }
    }
  }, [milestones, setMilestones, setMilestoneNotification, triggerConfetti]);

  const handleDeposit = useCallback(() => {
    if (stats.coins < 50) return;
    gameActions.removeCoins(50);
    gameActions.addSavings(50);
    triggerConfetti();
    checkMilestones(stats.savings + 50);
  }, [stats.coins, stats.savings, gameActions, triggerConfetti, checkMilestones]);

  const handleWithdraw = useCallback(() => {
    if (stats.savings < 50) return;
    gameActions.removeSavings(50);
    gameActions.addCoins(50);
  }, [stats.savings, gameActions]);

  const handlePurchase = useCallback((reward: Reward) => {
    if (stats.coins < reward.price) return;
    gameActions.removeCoins(reward.price);
    setUserBehavior(prev => ({
      ...prev,
      purchases: [
        ...prev.purchases,
        {
          rewardId: reward.id,
          rewardName: reward.name,
          type: reward.type,
          price: reward.price,
          timestamp: Date.now(),
        },
      ],
      totalSpent: prev.totalSpent + reward.price,
    }));
    setPurchaseNotification(reward);
    triggerConfetti();
  }, [stats.coins, gameActions, setUserBehavior, setPurchaseNotification, triggerConfetti]);

  const value: AppContextType = {
    activeTab,
    setActiveTab,
    stats,
    gameActions,
    ...missionsState,
    userBehavior,
    setUserBehavior,
    milestones,
    setMilestones,
    achievements,
    totalUnlocked,
    newlyUnlocked,
    clearNewlyUnlocked,
    ...lessonState,
    ...notifications,
    ...scenarioState,
    checkMilestones,
    handleDeposit,
    handleWithdraw,
    handlePurchase,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

export default AppContext;
