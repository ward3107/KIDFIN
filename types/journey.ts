// ============================================================================
// JOURNEY & PROGRESSION TYPES
// ============================================================================

/**
 * Journey stages represent the user's overall progress in the financial literacy journey
 */
export type JourneyStage =
  | 'onboarding'      // Just started, needs to learn
  | 'learning'        // Learning basics in Academy
  | 'earning'         // Completing missions to earn coins
  | 'saving'          // Started saving for goals
  | 'spending'        // Making purchase decisions
  | 'mastering';      // Advanced user, analyzing behavior

/**
 * Individual journey steps that guide the user through the app
 */
export interface JourneyStep {
  readonly id: string;
  readonly stage: JourneyStage;
  readonly title: string;
  readonly description: string;
  readonly targetTab: string;
  readonly action: string;
  readonly icon: string;
  readonly completed: boolean;
  readonly requiredProgress: {
    knowledgePoints?: number;
    completedLessons?: number;
    completedMissions?: number;
    coins?: number;
    savings?: number;
    purchases?: number;
  };
  readonly reward?: {
    coins?: number;
    xp?: number;
    message: string;
  };
}

/**
 * User's journey state
 */
export interface JourneyState {
  readonly currentStage: JourneyStage;
  readonly currentStepIndex: number;
  readonly completedSteps: string[];
  readonly showJourneyGuide: boolean;
  readonly lastCompletedAction: string | null;
  readonly totalActionsCompleted: number;
}

/**
 * Journey trigger - events that move the journey forward
 */
export interface JourneyTrigger {
  readonly type: 'lesson_complete' | 'mission_complete' | 'deposit' | 'purchase' | 'milestone_reach' | 'scenario_complete';
  readonly data?: any;
}

/**
 * Journey hints - contextual suggestions shown in each tab
 */
export interface JourneyHint {
  readonly id: string;
  readonly tab: string;
  readonly condition: (state: any) => boolean;
  readonly title: string;
  readonly message: string;
  readonly actionLabel: string;
  readonly targetTab: string;
  readonly priority: number;
}

// ============================================================================
// JOURNEY CONFIGURATION
// ============================================================================

/**
 * Complete journey path - all steps in order
 */
export const JOURNEY_STEPS: Omit<JourneyStep, 'completed'>[] = [
  // ===== ONBOARDING STAGE =====
  {
    id: 'welcome',
    stage: 'onboarding',
    title: 'ברוכים הבאים לעולם הכסף! 🌟',
    description: 'התחנכו במסע להבנת הכסף - תלמדו, תרוויחו, תחסכו ותחכמו!',
    targetTab: 'school',
    action: 'start_first_lesson',
    icon: '🎓',
    requiredProgress: {},
    reward: {
      coins: 10,
      xp: 5,
      message: 'התחלת מסע חדש!',
    }
  },
  {
    id: 'first_lesson',
    stage: 'learning',
    title: 'למדו את השיעור הראשון שלכם',
    description: 'התחילו באקדמיה ולמדו מושג חדש. השיעור כולל למידה, תרגול וחידון!',
    targetTab: 'school',
    action: 'complete_lesson',
    icon: '📚',
    requiredProgress: { knowledgePoints: 0 },
    reward: {
      coins: 50,
      xp: 15,
      message: 'מדהים! קיבלת נקודת ידע ראשונה!',
    }
  },

  // ===== EARNING STAGE =====
  {
    id: 'first_mission',
    stage: 'earning',
    title: 'הרוויחו את המטבעות הראשונות שלכם',
    description: 'עכשיו שיש לכם ידע, הגיע הזמן להרוויח! עשו משימות וקבלו מטבעות.',
    targetTab: 'earn',
    action: 'complete_mission',
    icon: '🎯',
    requiredProgress: { knowledgePoints: 1 },
    reward: {
      coins: 30,
      xp: 25,
      message: 'עבודה טובה! הרווחת מטבעות!',
    }
  },
  {
    id: 'three_lessons',
    stage: 'learning',
    title: 'למדו עוד 2 שיעורים',
    description: 'כדי להיות מומחים, תלמדו עוד קצת. השיעורים יפתחו לכם תרחישים!',
    targetTab: 'school',
    action: 'complete_lessons',
    icon: '📖',
    requiredProgress: { knowledgePoints: 1, completedLessons: 2 },
    reward: {
      coins: 40,
      xp: 20,
      message: 'ידע חדש!',
    }
  },

  // ===== SAVING STAGE =====
  {
    id: 'first_deposit',
    stage: 'saving',
    title: 'התחילו לחסוך לאופניים',
    description: 'הפקידו 50 מטבעות בבנק ותתחילו להגיע ליעד שלכם!',
    targetTab: 'save',
    action: 'make_deposit',
    icon: '🏦',
    requiredProgress: { coins: 50, savings: 0 },
    reward: {
      coins: 10,
      xp: 15,
      message: 'חיסכון ראשון - מתחילים את הדרך!',
    }
  },
  {
    id: 'first_scenario',
    stage: 'learning',
    title: 'תרגילו החלטה ראשונה',
    description: 'סיימתם 3 שיעורים? עכשיו הגיע הזמן לתרגל עם תרחיש אמיתי!',
    targetTab: 'home',
    action: 'complete_scenario',
    icon: '🎭',
    requiredProgress: { knowledgePoints: 3 },
    reward: {
      coins: 20,
      xp: 30,
      message: 'החלטה חכמה!',
    }
  },

  // ===== SPENDING STAGE =====
  {
    id: 'first_purchase',
    stage: 'spending',
    title: 'קנו את הפרס הראשון שלכם',
    description: 'הגיע הזמן להשתמש במטבעות! קנו פרס מהחנות.',
    targetTab: 'shop',
    action: 'make_purchase',
    icon: '🛍️',
    requiredProgress: { coins: 20, purchases: 0 },
    reward: {
      xp: 20,
      message: 'רכישה ראשונה!',
    }
  },
  {
    id: 'save_100',
    stage: 'saving',
    title: 'חסכו 100 מטבעות',
    description: 'המשיכו לחסוך! כל 50 מטבעות שאתם מפקידים מקרבים אתכם לאופניים.',
    targetTab: 'save',
    action: 'reach_savings',
    icon: '💰',
    requiredProgress: { savings: 50 },
    reward: {
      coins: 25,
      xp: 30,
      message: 'חיסכון מרשים!',
    }
  },

  // ===== MASTERING STAGE =====
  {
    id: 'five_lessons',
    stage: 'learning',
    title: 'המשיכו ללמוד',
    description: 'תלמדו עוד שיעורים כדי לפתוח תכנים מתקדמים יותר.',
    targetTab: 'school',
    action: 'complete_more_lessons',
    icon: '🎓',
    requiredProgress: { completedLessons: 5 },
    reward: {
      coins: 60,
      xp: 40,
      message: 'ידע מעמיק!',
    }
  },
  {
    id: 'all_scenarios',
    stage: 'learning',
    title: 'סיימו את כל התרחישים',
    description: 'התנסו בכל המצבים ותלמדו להחליט חכם.',
    targetTab: 'home',
    action: 'complete_all_scenarios',
    icon: '🏆',
    requiredProgress: { knowledgePoints: 5 },
    reward: {
      coins: 50,
      xp: 50,
      message: 'אדון ההחלטות!',
    }
  },
  {
    id: 'reach_25_percent',
    stage: 'saving',
    title: 'הגעתם ל-25% מהיעד!',
    description: 'המשיכו ככה - כבר רבע מהדרך מאחוריכם!',
    targetTab: 'save',
    action: 'reach_milestone',
    icon: '🎯',
    requiredProgress: { savings: 300 },
    reward: {
      coins: 40,
      xp: 35,
      message: 'רבע מהדרך!',
    }
  },
  {
    id: 'check_analysis',
    stage: 'mastering',
    title: 'בדקו את ההתנהגות שלכם',
    description: 'כנסו לניתוח וראו איך אתם מתנהגים עם הכסף.',
    targetTab: 'analysis',
    action: 'view_analysis',
    icon: '📊',
    requiredProgress: { purchases: 3 },
    reward: {
      xp: 25,
      message: 'מודעות עצמית!',
    }
  },
  {
    id: 'bike_goal',
    stage: 'mastering',
    title: 'הגעתם ליעד - אופניים חדשים!',
    description: 'מזל טוב! חסכתם 1200 מטבעות וכעת תוכלו לקנות את האופניים!',
    targetTab: 'save',
    action: 'complete_goal',
    icon: '🚲',
    requiredProgress: { savings: 1200 },
    reward: {
      coins: 200,
      xp: 200,
      message: 'הושט הגדול - קניתם אופניים!',
    }
  },
];

/**
 * Journey hints - contextual suggestions for each tab
 */
export const JOURNEY_HINTS: JourneyHint[] = [
  // Home Tab Hints
  {
    id: 'home_to_school',
    tab: 'home',
    condition: (state) => state.stats.knowledgePoints === 0,
    title: 'התחילו את המסע!',
    message: 'למדו את השיעור הראשון שלכם כדי לפתוח את כל האפשרויות.',
    actionLabel: 'עברו לאקדמיה →',
    targetTab: 'school',
    priority: 1,
  },
  {
    id: 'home_scenarios_unlock',
    tab: 'home',
    condition: (state) => state.stats.knowledgePoints >= 2 && !state.scenarios?.every((s: any) => s.completed),
    title: 'תרחיש חדש זמין!',
    message: 'סיימתם 2 שיעורים? עכשיו תוכלו לתרגל החלטות אמיתיות!',
    actionLabel: 'התחילו תרחיש 🎭',
    targetTab: 'home',
    priority: 2,
  },

  // School Tab Hints
  {
    id: 'school_to_earn',
    tab: 'school',
    condition: (state) => state.stats.knowledgePoints >= 1 && state.missions?.filter((m: any) => !m.completed).length > 0,
    title: 'מוכנים להרוויח?',
    message: 'עכשיו שיש לכם ידע, הגיע הזמן להרוויח מטבעות!',
    actionLabel: 'עברו לאתגרים →',
    targetTab: 'earn',
    priority: 1,
  },
  {
    id: 'school_keep_learning',
    tab: 'school',
    condition: (state) => state.stats.knowledgePoints >= 1 && state.stats.knowledgePoints < 3,
    title: 'המשיכו ללמוד!',
    message: 'עוד 2 שיעורים ותפתחו את התרחישים!',
    actionLabel: 'התחילו שיעור נוסף 📚',
    targetTab: 'school',
    priority: 2,
  },

  // Earn Tab Hints
  {
    id: 'earn_to_save',
    tab: 'earn',
    condition: (state) => state.stats.coins >= 50 && state.stats.savings === 0,
    title: 'התחילו לחסוך!',
    message: 'יש לכם 50+ מטבעות! הפקידו אותן בבנק כדי להתחיל לחסוך לאופניים.',
    actionLabel: 'עברו לחיסכון →',
    targetTab: 'save',
    priority: 1,
  },
  {
    id: 'earn_earn_more',
    tab: 'earn',
    condition: (state) => state.stats.coins < 50,
    title: 'הרוויחו עוד!',
    message: 'תשלימו את המשימות כדי להרוויח עוד מטבעות.',
    actionLabel: 'קבלו אתגר חדש 🎯',
    targetTab: 'earn',
    priority: 2,
  },

  // Save Tab Hints
  {
    id: 'save_to_shop',
    tab: 'save',
    condition: (state) => state.stats.coins >= 20 && state.userBehavior?.purchases?.length === 0,
    title: 'הזמן לקנות משהו!',
    message: 'יש לכם מטבעות ויש לכם חיסכון - תתמרנו על פרס!',
    actionLabel: 'עברו לחנות →',
    targetTab: 'shop',
    priority: 1,
  },
  {
    id: 'save_keep_depositing',
    tab: 'save',
    condition: (state) => state.stats.coins >= 50 && state.stats.savings < 1200,
    title: 'המשיכו לחסוך!',
    message: 'כל 50 מטבעות מקרבים אתכם לאופניים!',
    actionLabel: 'הפקידו עוד 💰',
    targetTab: 'save',
    priority: 2,
  },

  // Shop Tab Hints
  {
    id: 'shop_need_vs_want',
    tab: 'shop',
    condition: (state) => state.userBehavior?.purchases?.length >= 1,
    title: 'חשבו לפני קנייה',
    message: 'זה צורך או רצון? בדקו את הניתוח כדי לראות את ההתנהגות שלכם.',
    actionLabel: 'עברו לניתוח →',
    targetTab: 'analysis',
    priority: 1,
  },
  {
    id: 'shop_earn_more',
    tab: 'shop',
    condition: (state) => state.stats.coins < 20,
    title: 'חסרות מטבעות',
    message: 'צריך עוד מטבעות? תשלימו משימות!',
    actionLabel: 'עברו לאתגרים →',
    targetTab: 'earn',
    priority: 2,
  },

  // Analysis Tab Hints
  {
    id: 'analysis_to_school',
    tab: 'analysis',
    condition: (state) => state.stats.knowledgePoints < 10,
    title: 'למדו עוד',
    message: 'המשיכו ללמוד באקדמיה כדי להיות מומחים בכסף.',
    actionLabel: 'עברו לאקדמיה →',
    targetTab: 'school',
    priority: 1,
  },
  {
    id: 'analysis_to_save',
    tab: 'analysis',
    condition: (state) => state.stats.savings < 1200,
    title: 'המשיכו לחסוך',
    message: 'חזרו לבנק ותמשיכו לחסוך ליעד.',
    actionLabel: 'עברו לחיסכון →',
    targetTab: 'save',
    priority: 2,
  },
];
