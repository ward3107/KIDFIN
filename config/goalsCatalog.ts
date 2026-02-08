// ============================================================================
// PERSONAL GOALS CATALOG - Items relevant to students in 2026
// ============================================================================

export type GoalCategory = 'need' | 'want' | 'dream';

export interface PersonalGoal {
  readonly id: string;
  readonly name: string;
  readonly icon: string;
  readonly category: GoalCategory;
  readonly cost: number; // Coins needed
  readonly description: string;
  readonly ageGroup: '6-8' | '9-11' | '12-14' | 'all';
  readonly trending?: boolean; // Popular in 2026
}

/**
 * 2026-relevant items that kids actually want - REAL brands and products!
 */
export const GOALS_CATALOG: PersonalGoal[] = [
  // ===== NEEDS (צרכים) - Essential items =====
  {
    id: 'school_backpack_2026',
    name: 'תיק בית ספר חדש',
    icon: '🎒',
    category: 'need',
    cost: 200,
    description: 'תיק מגניב ומגניב לכל הציוד שלך',
    ageGroup: 'all',
  },
  {
    id: 'sneakers_nike',
    name: 'נעליים נייק / אדידס',
    icon: '👟',
    category: 'need',
    cost: 350,
    description: 'נעליים מקצועיות ונוחות לבית הספר',
    ageGroup: 'all',
    trending: true,
  },
  {
    id: 'winter_jacket',
    name: 'מעיל חורף חדש',
    icon: '🧥',
    category: 'need',
    cost: 300,
    description: 'מעיל חם ויפה לימים קרים',
    ageGroup: 'all',
  },
  {
    id: 'school_supplies_full',
    name: 'ציוד בית ספר מלא',
    icon: '✏️',
    category: 'need',
    cost: 150,
    description: 'מחברות, עטים, תיק, קלמר - הכל!',
    ageGroup: 'all',
  },
  {
    id: 'water_bottle_premium',
    name: 'בקבוע שושי / הידרופלאסק',
    icon: '💧',
    category: 'need',
    cost: 100,
    description: 'בקבוע מקצועי עם שם מותג',
    ageGroup: 'all',
    trending: true,
  },
  {
    id: 'lunch_box_cool',
    name: 'קופסת אוכל מעוצבת',
    icon: '🍱',
    category: 'need',
    cost: 80,
    description: 'קופסת אוכל יפה ומגניבת',
    ageGroup: 'all',
  },

  // ===== WANTS (רצונות) - Fun but not essential =====
  {
    id: 'iphone_android',
    name: 'סמארטפון חדש',
    icon: '📱',
    category: 'want',
    cost: 2500,
    description: 'אייפון או סמארטפון אנדרואיד חדש',
    ageGroup: 'all',
    trending: true,
  },
  {
    id: 'airpods_wireless',
    name: 'אוזניות אלחוטיות',
    icon: '🎧',
    category: 'want',
    cost: 800,
    description: 'אוזניות אפל או סמסונג מקוריות',
    ageGroup: 'all',
    trending: true,
  },
  {
    id: 'nintendo_switch',
    name: 'נינטנדו סוויץ',
    icon: '🎮',
    category: 'want',
    cost: 1500,
    description: 'קונסולת משחקים ניידת מבית נינטנדו',
    ageGroup: 'all',
    trending: true,
  },
  {
    id: 'apple_watch_smartwatch',
    name: 'שעון חכם',
    icon: '⌚',
    category: 'want',
    cost: 1200,
    description: 'שעון אפל או גאלקסי חדש',
    ageGroup: 'all',
    trending: true,
  },
  {
    id: 'tablet_ipad_android',
    name: 'טאבלט חדש',
    icon: '📱',
    category: 'want',
    cost: 1800,
    description: 'אייפד או טאבלט אנדרואיד',
    ageGroup: 'all',
    trending: true,
  },
  {
    id: 'gaming_headset',
    name: 'אוזניות גיימינג',
    icon: '🎧',
    category: 'want',
    cost: 400,
    description: 'אוזניות מקצועיות עם מיקרופון',
    ageGroup: 'all',
  },
  {
    id: 'gaming_keyboard',
    name: 'מקלדת גיימינג',
    icon: '⌨️',
    category: 'want',
    cost: 350,
    description: 'מקלדת מכנית צבעונית למשחקים',
    ageGroup: 'all',
  },
  {
    id: 'gaming_mouse',
    name: 'עכבר גיימינג',
    icon: '🖱️',
    category: 'want',
    cost: 200,
    description: 'עכבר מקצועי עם חיישן וכפתורים',
    ageGroup: 'all',
  },
  {
    id: 'led_lights_room',
    name: 'תאורת LED לחדר',
    icon: '💡',
    category: 'want',
    cost: 150,
    description: 'פס תאורה צבעוני לחדר',
    ageGroup: 'all',
    trending: true,
  },
  {
    id: 'portable_speaker',
    name: 'רמקול נייד',
    icon: '🔊',
    category: 'want',
    cost: 300,
    description: 'רמקול בלוטוס JBL או מותגים אחרים',
    ageGroup: 'all',
  },
  {
    id: 'hoverboard',
    name: 'הוברבורד / סקייטבורד חשמלי',
    icon: '🛹',
    category: 'want',
    cost: 1200,
    description: 'הוברבורד חדש לשכונה',
    ageGroup: 'all',
    trending: true,
  },
  {
    id: 'drone_camera',
    name: 'רחפן עם מצלמה',
    icon: '🚁',
    category: 'want',
    cost: 600,
    description: 'רחפן לצילום ונסיעות',
    ageGroup: 'all',
  },
  {
    id: 'digital_camera',
    name: 'מצלמה לצילום',
    icon: '📷',
    category: 'want',
    cost: 1500,
    description: 'מצלמה מקצועית לצילום וידאו',
    ageGroup: 'all',
  },
  {
    id: 'electric_scooter',
    name: 'קורקינט חשמלי',
    icon: '🛴',
    category: 'want',
    cost: 2000,
    description: 'קורקינט חשמלי מהיר',
    ageGroup: 'all',
    trending: true,
  },
  {
    id: 'vr_headset',
    name: 'משקפי VR',
    icon: '🥽',
    category: 'want',
    cost: 1000,
    description: 'משקפי מציאות מדומה',
    ageGroup: 'all',
  },
  {
    id: 'lego_set_big',
    name: 'ערכת לגו גדולה',
    icon: '🧱',
    category: 'want',
    cost: 500,
    description: 'ערכת לגו משחק הכתר',
    ageGroup: '9-11',
  },
  {
    id: 'remote_control_car',
    name: 'מכונית שלט רדיו',
    icon: '🚗',
    category: 'want',
    cost: 350,
    description: 'מכונית מהירה עם שלט רדיו',
    ageGroup: '6-8',
  },
  {
    id: 'musical_instrument',
    name: 'כלי נגינה',
    icon: '🎸',
    category: 'want',
    cost: 800,
    description: 'גיטרה חשמלית קלידים או תופים',
    ageGroup: 'all',
  },
  {
    id: 'hoodie_brand',
    name: 'הודי מותג',
    icon: '👕',
    category: 'want',
    cost: 250,
    description: 'הודי מותג כמו נייקי או אדידס',
    ageGroup: 'all',
    trending: true,
  },
  {
    id: 'sneakers_jordan',
    name: 'נעלי אייר ג\'ורדן',
    icon: '👟',
    category: 'want',
    cost: 500,
    description: 'נעלי ג\'ורדן או נייק אייר מקס',
    ageGroup: 'all',
    trending: true,
  },
  {
    id: 'baseball_cap_new_era',
    name: 'קפוץ ניו ארה',
    icon: '🧢',
    category: 'want',
    cost: 100,
    description: 'קפוץ מותג ניו ארה',
    ageGroup: 'all',
  },
  {
    id: 'backpack_herschel',
    name: 'תיק מותג',
    icon: '🎒',
    category: 'want',
    cost: 200,
    description: 'תיק מותג כמו הרשל או נורת\'פייס',
    ageGroup: 'all',
  },
  {
    id: 'phone_case_trendy',
    name: 'קייס לטלפון מעוצב',
    icon: '📱',
    category: 'want',
    cost: 80,
    description: 'קייס מותג לטלפון',
    ageGroup: 'all',
  },

  // ===== DREAMS (חלומות) - Big goals =====
  {
    id: 'playstation_5',
    name: 'פלייסטיישן 5',
    icon: '🎮',
    category: 'dream',
    cost: 2500,
    description: 'קונסולת פלייסטיישן 5 עם שליטה',
    ageGroup: 'all',
    trending: true,
  },
  {
    id: 'xbox_series_x',
    name: 'Xbox Series X',
    icon: '🎮',
    category: 'dream',
    cost: 2500,
    description: 'קונסולת Xbox חדשה',
    ageGroup: 'all',
    trending: true,
  },
  {
    id: 'gaming_pc',
    name: 'מחשב גיימינג',
    icon: '💻',
    category: 'dream',
    cost: 5000,
    description: 'מחשב מהיר לגיימינג עם מסך מרחב',
    ageGroup: '12-14',
    trending: true,
  },
  {
    id: 'macbook_air',
    name: 'מקבוק אייר',
    icon: '💻',
    category: 'dream',
    cost: 4500,
    description: 'מקבוק ללימודים ויצירה',
    ageGroup: 'all',
    trending: true,
  },
  {
    id: 'electric_bike',
    name: 'אופניים חשמליים',
    icon: '🚲',
    category: 'dream',
    cost: 3000,
    description: 'אופניים חשמליים לנסיעות',
    ageGroup: '12-14',
    trending: true,
  },
  {
    id: 'scooter_pro',
    name: 'קורקינט חשמלי מקצועי',
    icon: '🛴',
    category: 'dream',
    cost: 2500,
    description: 'קורקינט חשמלי מהיר',
    ageGroup: 'all',
    trending: true,
  },
  {
    id: 'iphone_pro',
    name: 'אייפון פרו חדש',
    icon: '📱',
    category: 'dream',
    cost: 4000,
    description: 'אייפון 15 פרו או הדגם הכי חדש',
    ageGroup: 'all',
    trending: true,
  },
  {
    id: 'ipad_pro',
    name: 'אייפד פרו',
    icon: '📱',
    category: 'dream',
    cost: 3000,
    description: 'אייפד פרו עם עט אפל פנסיל',
    ageGroup: 'all',
  },
  {
    id: 'gaming_setup_full',
    name: 'מערכת גיימינג מלאה',
    icon: '🎮',
    category: 'dream',
    cost: 6000,
    description: 'מסך, קונסולה, מערכת שמת, כיסא - הכל!',
    ageGroup: 'all',
    trending: true,
  },
  {
    id: 'summer_camp_usa',
    name: 'מחנה קיץ בארה״ב',
    icon: '⛺',
    category: 'dream',
    cost: 8000,
    description: 'מחנה קיץ של חודש באמריקה!',
    ageGroup: 'all',
  },
  {
    id: 'family_trip_europe',
    name: 'טיול משפחתי לאירופה',
    icon: '✈️',
    category: 'dream',
    cost: 10000,
    description: 'טיול משפחתי לאירופה לשבוע',
    ageGroup: 'all',
  },
  {
    id: 'concert_tickets',
    name: 'כרטיסים להופעה',
    icon: '🎤',
    category: 'dream',
    cost: 1500,
    description: 'כרטיסים להופעה של האמן האהוב עליך',
    ageGroup: 'all',
    trending: true,
  },
  {
    id: 'drone_professional',
    name: 'רחפן מקצועי',
    icon: '🚁',
    category: 'dream',
    cost: 2000,
    description: 'רחפן DJI עם מצלמת 4K',
    ageGroup: 'all',
  },
  {
    id: 'electric_skateboard',
    name: 'סקייטבורד חשמלי',
    icon: '🛹',
    category: 'dream',
    cost: 2000,
    description: 'סקייטבורד חשמלי מורחב טוב',
    ageGroup: 'all',
  },
  {
    id: '3d_printer',
    name: 'מדפסת תלת ממד',
    icon: '🖨️',
    category: 'dream',
    cost: 2500,
    description: 'מדפסת להדפסת צעצותים וחלקים',
    ageGroup: '12-14',
  },
  {
    id: 'robotics_kit_advanced',
    name: 'ערכת רובוטיקה מתקדמת',
    icon: '🤖',
    category: 'dream',
    cost: 1500,
    description: 'ערכת לבניית ותכנות רובוטים',
    ageGroup: '12-14',
  },
  {
    id: 'music_production_setup',
    name: 'אולפן הקלטות ביתי',
    icon: '🎹',
    category: 'dream',
    cost: 3000,
    description: 'מחשב, מיקרופון, רמקולים - להקלטת מוזיקה',
    ageGroup: 'all',
  },
  {
    id: 'telescope_astronomy',
    name: 'טלסקופ לכוכבים',
    icon: '🔭',
    category: 'dream',
    cost: 1200,
    description: 'טלסקופ מקצועי לצפייה בכוכבים',
    ageGroup: 'all',
  },
  {
    id: 'camera_mirrorless',
    name: 'מצלמת מקצועית',
    icon: '📷',
    category: 'dream',
    cost: 3500,
    description: 'מצלמת סוני או קנון מקצועית',
    ageGroup: 'all',
  },
  {
    id: 'sports_equipment_full',
    name: 'ציוד ספורט מלא',
    icon: '⚽',
    category: 'dream',
    cost: 1500,
    description: 'כדורגל כדורסל טניס - כל הציוד',
    ageGroup: 'all',
  },
  {
    id: 'playstation_vr',
    name: 'משקפי VR לפלייסטיישן',
    icon: '🥽',
    category: 'dream',
    cost: 1500,
    description: 'משקפי מציאות מדומה לקונסולה',
    ageGroup: 'all',
    trending: true,
  },
];

/**
 * Get goals by category
 */
export const getGoalsByCategory = (category: GoalCategory): PersonalGoal[] => {
  return GOALS_CATALOG.filter(goal => goal.category === category);
};

/**
 * Get trending goals
 */
export const getTrendingGoals = (): PersonalGoal[] => {
  return GOALS_CATALOG.filter(goal => goal.trending);
};

/**
 * Get goals by age group
 */
export const getGoalsByAge = (ageGroup: '6-8' | '9-11' | '12-14' | 'all'): PersonalGoal[] => {
  return GOALS_CATALOG.filter(goal => goal.ageGroup === ageGroup || goal.ageGroup === 'all');
};

/**
 * Get recommended goals (trending + age appropriate)
 */
export const getRecommendedGoals = (ageGroup: '6-8' | '9-11' | '12-14'): PersonalGoal[] => {
  const ageGoals = getGoalsByAge(ageGroup);
  return ageGoals.filter(goal => goal.trending).slice(0, 8);
};
