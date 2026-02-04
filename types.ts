
export interface Mission {
  id: string;
  title: string;
  reward: number;
  icon: string;
  completed: boolean;
  isAiGenerated?: boolean;
}

export interface Reward {
  id: string;
  name: string;
  price: number;
  icon: string;
  color: string;
  type: 'need' | 'want';
}

export interface UserStats {
  coins: number;
  level: number;
  xp: number;
  savings: number;
  knowledgePoints: number;
  name: string;
}

export type TabType = 'home' | 'school' | 'earn' | 'save' | 'shop' | 'analysis';

export interface Lesson {
  concept: string;
  question: string;
  options: string[];
  correctIndex: number;
}

export interface UserBehavior {
  purchases: Array<{
    rewardId: string;
    rewardName: string;
    type: 'need' | 'want';
    price: number;
    timestamp: number;
  }>;
  savingsDeposits: number;
  completedMissions: number;
  totalEarned: number;
  totalSpent: number;
}
