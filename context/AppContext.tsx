import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserStats, Mission, Lesson, Reward, UserBehavior, Milestone, Scenario } from '../types';
import { INITIAL_MISSIONS } from '../constants';
import { SAVINGS_MILESTONES } from '../constants/milestones';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useGameStats } from '../hooks/useGameStats';
import { useAchievements } from '../hooks/useAchievements';
import { getDailyTip, generateMagicMission, generateLesson, updateLessonProgress } from '../services/geminiService';
import { SCENARIOS } from '../config/scenarios';

// Constants
export const MAX_DAILY_TASKS = 3;
export const BIKE_GOAL = 1200;

// LocalStorage keys
const STORAGE_KEYS = {
  STATS: 'save4dream_stats',
  MISSIONS: 'save4dream_missions',
  DAILY_TASKS: 'save4dream_daily_tasks',
  USER_BEHAVIOR: 'save4dream_user_behavior',
  MILESTONES: 'save4dream_milestones',
};

// Context interface
interface AppContextType {
  // State
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

  // Functions
  fetchTip: () => Promise<void>;
  handleMagicMission: () => Promise<void>;
  handleStartLesson: () => Promise<void>;
  handleAnswerQuiz: (index: number) => void;
  completeMission: (id: string, reward: number) => void;
  triggerConfetti: () => void;
  checkMilestones: (newSavings: number) => void;
  handleScenarioChoice: (choice: any) => void;
  triggerRandomScenario: () => void;
  handleDeposit: () => void;
  handleWithdraw: () => void;
  handlePurchase: (reward: Reward) => void;
}

// Create context with undefined as default (will be set by provider)
const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider component
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<string>('home');

  // Use useGameStats for all game stats with automatic persistence
  const [stats, gameActions] = useGameStats({
    storageKey: STORAGE_KEYS.STATS,
  });

  const [missions, setMissions] = useLocalStorage<Mission[]>(STORAGE_KEYS.MISSIONS, INITIAL_MISSIONS);
  const [dailyTasksGenerated, setDailyTasksGenerated] = useLocalStorage<number>(STORAGE_KEYS.DAILY_TASKS, 0);

  const [userBehavior, setUserBehavior] = useLocalStorage<UserBehavior>(STORAGE_KEYS.USER_BEHAVIOR, {
    purchases: [],
    savingsDeposits: 0,
    completedMissions: 0,
    totalEarned: 0,
    totalSpent: 0,
  });

  const [milestones, setMilestones] = useLocalStorage<Milestone[]>(STORAGE_KEYS.MILESTONES, SAVINGS_MILESTONES);

  // Achievement system
  const {
    achievements,
    totalUnlocked,
    newlyUnlocked,
    clearNewlyUnlocked,
    checkAchievements,
  } = useAchievements(STORAGE_KEYS.MILESTONES + '_achievements');

  // Calculate completed missions count for achievements
  const missionsCompleted = missions.filter(m => m.completed).length;

  // Check for achievements when stats, behavior, or missions change
  useEffect(() => {
    checkAchievements({
      stats,
      userBehavior,
      missionsCompleted,
      dailyTasksCompleted: dailyTasksGenerated,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stats.savings, stats.knowledgePoints, stats.level, stats.coins, missionsCompleted, dailyTasksGenerated, userBehavior.purchases.length]);

  // Non-persistent state (kept as regular useState)
  const [dailyTip, setDailyTip] = useState<string>("טוען טיפ חכם בשבילך...");
  const [isTipLoading, setIsTipLoading] = useState(false);
  const [isMissionLoading, setIsMissionLoading] = useState(false);
  const [isLessonLoading, setIsLessonLoading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [purchaseNotification, setPurchaseNotification] = useState<Reward | null>(null);
  const [milestoneNotification, setMilestoneNotification] = useState<Milestone | null>(null);

  // Scenario state
  const [scenarios, setScenarios] = useLocalStorage(STORAGE_KEYS.MISSIONS + '_scenarios', SCENARIOS);
  const [currentScenario, setCurrentScenario] = useState<Scenario | null>(null);
  const [showScenario, setShowScenario] = useState(false);

  // Academy States
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [lessonResult, setLessonResult] = useState<'success' | 'failure' | null>(null);

  // Initialize lesson progress on mount
  useEffect(() => {
    fetchTip();
    updateLessonProgress(stats.knowledgePoints);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-hide confetti after 2 seconds with cleanup
  useEffect(() => {
    if (showConfetti) {
      const timer = setTimeout(() => setShowConfetti(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [showConfetti]);

  // Auto-hide purchase notification after 3 seconds with cleanup
  useEffect(() => {
    if (purchaseNotification) {
      const timer = setTimeout(() => setPurchaseNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [purchaseNotification]);

  // Auto-hide milestone notification after 4 seconds with cleanup
  useEffect(() => {
    if (milestoneNotification) {
      const timer = setTimeout(() => setMilestoneNotification(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [milestoneNotification]);

  const fetchTip = async () => {
    setIsTipLoading(true);
    const tip = await getDailyTip();
    setDailyTip(tip);
    setIsTipLoading(false);
  };

  const handleMagicMission = async () => {
    if (dailyTasksGenerated >= MAX_DAILY_TASKS) return;
    setIsMissionLoading(true);
    const newMissionData = await generateMagicMission();
    if (newMissionData) {
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
    }
    setIsMissionLoading(false);
  };

  const handleStartLesson = async () => {
    setIsLessonLoading(true);
    setLessonResult(null);
    const lesson = await generateLesson();
    if (lesson) setCurrentLesson(lesson);
    setIsLessonLoading(false);
  };

  const handleAnswerQuiz = (index: number) => {
    if (!currentLesson) return;
    if (index === currentLesson.correctIndex) {
      setLessonResult('success');
      gameActions.addKnowledgePoints(1);
      gameActions.addCoins(50);
      gameActions.addXP(15);

      // Track lesson progress for the config system
      updateLessonProgress(stats.knowledgePoints + 1, `lesson_${Date.now()}`);

      triggerConfetti();
    } else {
      setLessonResult('failure');
    }
  };

  const completeMission = (id: string, reward: number) => {
    setMissions(prev => prev.map(m => m.id === id ? { ...m, completed: true } : m));
    gameActions.addCoins(reward);
    gameActions.addXP(25);
    triggerConfetti();
  };

  const triggerConfetti = useCallback(() => {
    setShowConfetti(true);
  }, []);

  const checkMilestones = (newSavings: number) => {
    const progressPercent = Math.floor((newSavings / BIKE_GOAL) * 100);

    // Check if any milestone has been reached
    const updatedMilestones = milestones.map(milestone => {
      if (!milestone.achieved && progressPercent >= milestone.percentage) {
        // Trigger milestone celebration
        setMilestoneNotification({
          ...milestone,
          achieved: true,
          achievedAt: Date.now(),
        });
        triggerConfetti();
        return { ...milestone, achieved: true, achievedAt: Date.now() };
      }
      return milestone;
    });

    // Only update if something changed
    const hasNewAchievement = updatedMilestones.some(
      (m, i) => m.achieved !== milestones[i].achieved
    );

    if (hasNewAchievement) {
      setMilestones(updatedMilestones);
    }
  };

  const handleScenarioChoice = (choice: any) => {
    // Award rewards from the choice
    if (choice.coinsReward) {
      gameActions.addCoins(choice.coinsReward);
    }
    if (choice.xpReward) {
      gameActions.addXP(choice.xpReward);
    }

    // Mark scenario as completed
    if (currentScenario) {
      setScenarios(prev => prev.map(s =>
        s.id === currentScenario.id
          ? { ...s, completed: true, completedAt: Date.now() }
          : s
      ));
    }

    // Trigger celebration and close
    triggerConfetti();
    setTimeout(() => {
      setShowScenario(false);
      setCurrentScenario(null);
    }, 2000);
  };

  const triggerRandomScenario = () => {
    // Get uncompleted scenarios
    const uncompleted = scenarios.filter(s => !s.completed);
    if (uncompleted.length > 0) {
      const randomScenario = uncompleted[Math.floor(Math.random() * uncompleted.length)];
      setCurrentScenario(randomScenario);
      setShowScenario(true);
    }
  };

  const handleDeposit = () => {
    if (stats.coins >= 50) {
      gameActions.removeCoins(50);
      gameActions.addSavings(50);
      triggerConfetti();
      checkMilestones(stats.savings + 50);
    }
  };

  const handleWithdraw = () => {
    if (stats.savings >= 50) {
      gameActions.removeSavings(50);
      gameActions.addCoins(50);
    }
  };

  const handlePurchase = (reward: Reward) => {
    if (stats.coins >= reward.price) {
      gameActions.removeCoins(reward.price);

      // Track purchase for analysis
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
          }
        ],
        totalSpent: prev.totalSpent + reward.price,
      }));

      setPurchaseNotification(reward);
      triggerConfetti();
    }
  };

  const value: AppContextType = {
    activeTab,
    setActiveTab,
    stats,
    gameActions,
    missions,
    setMissions,
    dailyTasksGenerated,
    setDailyTasksGenerated,
    userBehavior,
    setUserBehavior,
    milestones,
    setMilestones,
    achievements,
    totalUnlocked,
    newlyUnlocked,
    clearNewlyUnlocked,
    dailyTip,
    setDailyTip,
    isTipLoading,
    setIsTipLoading,
    isMissionLoading,
    setIsMissionLoading,
    isLessonLoading,
    setIsLessonLoading,
    showConfetti,
    setShowConfetti,
    purchaseNotification,
    setPurchaseNotification,
    milestoneNotification,
    setMilestoneNotification,
    scenarios,
    setScenarios,
    currentScenario,
    setCurrentScenario,
    showScenario,
    setShowScenario,
    currentLesson,
    setCurrentLesson,
    lessonResult,
    setLessonResult,
    fetchTip,
    handleMagicMission,
    handleStartLesson,
    handleAnswerQuiz,
    completeMission,
    triggerConfetti,
    checkMilestones,
    handleScenarioChoice,
    triggerRandomScenario,
    handleDeposit,
    handleWithdraw,
    handlePurchase,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// Custom hook to use the App context
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

export default AppContext;
