// ============================================================================
// ID TYPES - kept as aliases for documentation
// ============================================================================

export type MissionId = string;
export type RewardId = string;
export type ScenarioId = string;
export type AchievementId = string;

// ============================================================================
// LITERAL TYPES AND ENUMS
// ============================================================================

export type TabType = 'home' | 'school' | 'earn' | 'save' | 'shop' | 'analysis';

export type RewardType = 'need' | 'want';

export type MissionStatus = 'pending' | 'completed';

export type LessonStatus = 'not_started' | 'in_progress' | 'completed' | 'failed';

export type AchievementCategory = 'savings' | 'learning' | 'missions' | 'special';

export type ScenarioCategory = 'needs_vs_wants' | 'saving' | 'spending' | 'ethics';

export type LessonDifficulty = 'beginner' | 'intermediate' | 'advanced';

export type LessonCategory =
  | 'basics'
  | 'saving'
  | 'spending'
  | 'earning'
  | 'banking'
  | 'investing'
  | 'charity';

// Journey stage type
export type JourneyStage =
  | 'onboarding'
  | 'learning'
  | 'earning'
  | 'saving'
  | 'spending'
  | 'mastering';

// ============================================================================
// MISSION
// ============================================================================

export interface Mission {
  readonly id: MissionId;
  readonly title: string;
  readonly reward: number;
  readonly icon: string;
  readonly isAiGenerated?: boolean;
  readonly status?: MissionStatus;
  readonly completed: boolean;
  readonly completedAt?: number;
}

export const isMissionCompleted = (mission: Mission): boolean =>
  mission.completed === true;

// ============================================================================
// CORE INTERFACES with Readonly and strict typing
// ============================================================================

export interface Reward {
  readonly id: RewardId;
  readonly name: string;
  readonly price: number;
  readonly icon: string;
  readonly color: string;
  readonly type: RewardType;
}

export interface UserStats {
  coins: number;
  level: number;
  xp: number;
  savings: number;
  knowledgePoints: number;
  name: string;
}

// ============================================================================
// LESSON TYPES with discriminated union for state
// ============================================================================

export interface PracticeExample {
  readonly id: string;
  readonly question: string;
  readonly options: readonly string[];
  readonly correctIndex: number;
  readonly explanation: string;
}

export interface Lesson {
  readonly id?: string;
  readonly concept: string;
  readonly question: string;
  readonly options: readonly string[];
  readonly correctIndex: number;
  readonly difficulty?: LessonDifficulty;
  readonly category?: LessonCategory;
  readonly examples?: readonly PracticeExample[];
}

export type LessonPhase = 'learn' | 'practice' | 'quiz';

export type LessonState = LessonNotStarted | LessonInProgress | LessonSuccess | LessonFailed;

export interface LessonNotStarted {
  state: 'not_started';
  lesson: Lesson | null;
  result: null;
}

export interface LessonInProgress {
  state: 'in_progress';
  lesson: Lesson;
  result: null;
}

export interface LessonSuccess {
  state: 'success';
  lesson: Lesson;
  result: {
    coinsEarned: number;
    xpEarned: number;
    knowledgePointsEarned: number;
  };
}

export interface LessonFailed {
  state: 'failure';
  lesson: Lesson;
  result: null;
}

// ============================================================================
// USER BEHAVIOR with strict typing
// ============================================================================

export interface Purchase {
  readonly rewardId: RewardId;
  readonly rewardName: string;
  readonly type: RewardType;
  readonly price: number;
  readonly timestamp: number;
}

export interface UserBehavior {
  readonly purchases: ReadonlyArray<Purchase>;
  savingsDeposits: number;
  completedMissions: number;
  totalEarned: number;
  totalSpent: number;
}

// ============================================================================
// MILESTONE & ACHIEVEMENT TYPES
// ============================================================================

export interface Milestone {
  readonly percentage: number;
  readonly name: string;
  readonly icon: string;
  readonly description: string;
  achieved: boolean;
  achievedAt?: number | null;
}

export interface Achievement {
  readonly id: AchievementId;
  readonly name: string;
  readonly icon: string;
  readonly description: string;
  readonly category: AchievementCategory;
  achieved: boolean;
  achievedAt?: number | null;
}

export const isAchievementUnlocked = (achievement: Achievement): boolean =>
  achievement.achieved === true;

export const isMilestoneAchieved = (milestone: Milestone): boolean =>
  milestone.achieved === true;

// ============================================================================
// SCENARIO TYPES with discriminated unions
// ============================================================================

export interface ScenarioChoice {
  readonly id: string;
  readonly text: string;
  readonly feedback: string;
  readonly isCorrect: boolean;
  readonly coinsReward?: number;
  readonly xpReward?: number;
}

export interface Scenario {
  readonly id: ScenarioId;
  readonly title: string;
  readonly description: string;
  readonly icon: string;
  readonly category: ScenarioCategory;
  readonly choices: readonly ScenarioChoice[];
  completed: boolean;
  completedAt?: number | null;
}

export const isScenarioCompleted = (scenario: Scenario): boolean =>
  scenario.completed === true;

// ============================================================================
// STATE TYPES with readonly where appropriate
// ============================================================================

export interface AchievementsState {
  readonly achievements: readonly Achievement[];
  totalUnlocked: number;
}

export interface ScenariosState {
  readonly scenarios: readonly Scenario[];
  totalCompleted: number;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

// Deep readonly for immutable state
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

// Mutable version of readonly types (for internal mutations)
export type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
};

// Extract keys of a specific type
export type KeysOfType<T, U> = {
  [K in keyof T]: T[K] extends U ? K : never;
}[keyof T];

// Make specific properties optional
export type OptionalPartial<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// ============================================================================
// TYPE GUARDS
// ============================================================================

export const isDefined = <T>(value: T | null | undefined): value is T =>
  value !== null && value !== undefined;

export const isRewardType = (type: string): type is RewardType =>
  type === 'need' || type === 'want';

export const isTabType = (tab: string): tab is TabType =>
  tab === 'home' || tab === 'school' || tab === 'earn' || tab === 'save' || tab === 'shop' || tab === 'analysis';

// ============================================================================
// CONFIGURATION TYPES
// ============================================================================

export interface LessonModule {
  readonly id: string;
  readonly difficulty: LessonDifficulty;
  readonly category: LessonCategory;
  readonly lesson: Lesson;
  readonly requiredKnowledgePoints?: number;
}

export interface ScenarioConfig {
  readonly scenario: Scenario;
  readonly minKnowledgePoints?: number;
}

// ============================================================================
// ACTION TYPES for state updates
// ============================================================================

export type GameAction =
  | { type: 'ADD_COINS'; amount: number }
  | { type: 'REMOVE_COINS'; amount: number }
  | { type: 'ADD_XP'; amount: number }
  | { type: 'ADD_SAVINGS'; amount: number }
  | { type: 'REMOVE_SAVINGS'; amount: number }
  | { type: 'ADD_KNOWLEDGE_POINTS'; amount: number }
  | { type: 'LEVEL_UP' };

export interface GameStateActions {
  addCoins: (amount: number) => void;
  removeCoins: (amount: number) => void;
  addXP: (amount: number) => void;
  addSavings: (amount: number) => void;
  removeSavings: (amount: number) => void;
  addKnowledgePoints: (amount: number) => void;
}

// ============================================================================
// VALIDATION TYPES
// ============================================================================

export type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export const validatePositiveNumber = (value: number, fieldName: string): ValidationResult<number> => {
  if (typeof value !== 'number' || isNaN(value)) {
    return { success: false, error: `${fieldName} must be a number` };
  }
  if (value < 0) {
    return { success: false, error: `${fieldName} must be positive` };
  }
  return { success: true, data: value };
};

// ============================================================================
// EXPORTS
// ============================================================================
