import { Achievement } from '../types';

/**
 * All achievements that can be unlocked in the game.
 * Achievements are organized by category and have specific unlock criteria.
 */
export const ACHIEVEMENTS: Achievement[] = [
  // Savings Achievements
  {
    id: 'first_savings',
    name: 'החיסכון הראשון',
    icon: '🌱',
    description: 'הפקדת 50 מטבעות לחיסכון לראשונה!',
    achieved: false,
    category: 'savings',
  },
  {
    id: 'smart_saver',
    name: 'חוסס חכם',
    icon: '🎯',
    description: 'חסכת 500 מטבעות בבנק!',
    achieved: false,
    category: 'savings',
  },
  {
    id: 'savings_master',
    name: 'אלוף החיסכון',
    icon: '🏦',
    description: 'חסכת 1000 מטבעות!',
    achieved: false,
    category: 'savings',
  },
  {
    id: 'goal_getter',
    name: 'מגשים יעדים',
    icon: '🎉',
    description: 'הגעת ליעד האופניים (1200 מטבעות)!',
    achieved: false,
    category: 'savings',
  },

  // Learning Achievements
  {
    id: 'first_lesson',
    name: 'צעד ראשון',
    icon: '📚',
    description: 'סיימת שיעור ראשון באקדמיה!',
    achieved: false,
    category: 'learning',
  },
  {
    id: 'knowledge_seeker',
    name: 'חוקר ידע',
    icon: '🧠',
    description: 'סיימת 5 שיעורים באקדמיה!',
    achieved: false,
    category: 'learning',
  },
  {
    id: 'financial_expert',
    name: 'מומחה פיננסי',
    icon: '🎓',
    description: 'סיימת 10 שיעורים באקדמיה!',
    achieved: false,
    category: 'learning',
  },

  // Mission Achievements
  {
    id: 'first_mission',
    name: 'המשימה הראשונה',
    icon: '⭐',
    description: 'סיימת משימה ראשונה!',
    achieved: false,
    category: 'missions',
  },
  {
    id: 'mission_master',
    name: 'אלוף המשימות',
    icon: '🏆',
    description: 'סיימת 10 משימות!',
    achieved: false,
    category: 'missions',
  },
  {
    id: 'daily_hero',
    name: 'גיבור יומי',
    icon: '📅',
    description: 'סיימת את כל המשימות של יום אחד!',
    achieved: false,
    category: 'missions',
  },

  // Special Achievements
  {
    id: 'first_purchase',
    name: 'הקנייה הראשונה',
    icon: '🛒',
    description: 'ביצעת קנייה ראשונה בחנות!',
    achieved: false,
    category: 'special',
  },
  {
    id: 'wise_spender',
    name: 'מוציא חכם',
    icon: '💡',
    description: 'קנית רק צרכים ב-5 קניות אחרונות!',
    achieved: false,
    category: 'special',
  },
  {
    id: 'level_up',
    name: 'עליה שלב',
    icon: '🚀',
    description: 'הגעת לרמה 2!',
    achieved: false,
    category: 'special',
  },
  {
    id: 'high_roller',
    name: 'עשיר',
    icon: '💰',
    description: 'צברת 1000 מטבעות!',
    achieved: false,
    category: 'special',
  },

  // Simulator achievements
  {
    id: 'sim_paystub',
    name: 'מבין בתלוש',
    icon: '🧾',
    description: 'גילית למה ברוטו זה לא נטו!',
    achieved: false,
    category: 'learning',
  },
  {
    id: 'sim_scam_gold',
    name: 'בלש סייבר',
    icon: '🕵️',
    description: 'זיהית את כל ההונאות מההפעם הראשונה!',
    achieved: false,
    category: 'special',
  },
  {
    id: 'sim_child_savings',
    name: 'חוקר חיסכון',
    icon: '🍼',
    description: 'גילית את החיסכון לכל ילד שלך!',
    achieved: false,
    category: 'learning',
  },
  {
    id: 'sim_banknote',
    name: 'מומחה לשטרות',
    icon: '💴',
    description: 'הכרת את כל המשוררים שעל השטרות!',
    achieved: false,
    category: 'learning',
  },
  {
    id: 'sim_investing',
    name: 'משקיע צעיר',
    icon: '📈',
    description: 'התנסית בחלוקת תיק השקעות!',
    achieved: false,
    category: 'learning',
  },
  {
    id: 'sim_lemonade_profit',
    name: 'יזם קטן',
    icon: '🍋',
    description: 'הרווחת בשבוע אחד של דוכן לימונדה!',
    achieved: false,
    category: 'special',
  },
  {
    id: 'first_charity',
    name: 'נדבן צעיר',
    icon: '❤️',
    description: 'תרמת מהפקדה ראשונה לצדקה!',
    achieved: false,
    category: 'special',
  },
];

/**
 * Get achievement by ID
 */
export const getAchievementById = (id: string): Achievement | undefined => {
  return ACHIEVEMENTS.find(a => a.id === id);
};

/**
 * Get achievements by category
 */
export const getAchievementsByCategory = (category: Achievement['category']): Achievement[] => {
  return ACHIEVEMENTS.filter(a => a.category === category);
};

/**
 * Get all unlocked achievements
 */
export const getUnlockedAchievements = (achievements: Achievement[]): Achievement[] => {
  return achievements.filter(a => a.achieved);
};

/**
 * Get all locked achievements
 */
export const getLockedAchievements = (achievements: Achievement[]): Achievement[] => {
  return achievements.filter(a => !a.achieved);
};
