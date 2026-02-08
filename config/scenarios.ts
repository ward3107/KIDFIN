import { Scenario } from '../types';

/**
 * Interactive scenarios that teach financial decision-making
 * through practical, real-world situations children might face.
 */
export const SCENARIOS: Scenario[] = [
  {
    id: 'toy_store_decision',
    title: 'החלטה בחנות הצעצועים',
    description: 'אתה בחנות צעצועים עם 50 ש"ח שחסכת. ראית צעצוע חדש ומגניב שעולה 45 ש"ח, אבל גם ראית שקל עם הדמות האהובה עליו ב-15 ש"ח. חשבון החשבון שלך כבר יש לך 3 צעצועים דומים מאותו סוג.',
    icon: '🧸',
    category: 'needs_vs_wants',
    completed: false,
    choices: [
      {
        id: 'buy_expensive_toy',
        text: 'לקנות את הצעצוע החדש והמגניב ב-45 ש"ח',
        feedback: 'זה נחמד להשיג צעצוע חדש, אבל כבר יש לך 3 דומים! חשוב לבדוק אם זה באמת יוסיף לך משהו או שמדובר ברצון רגעי. החסכון שלך כמעט נגמר לגמרי.',
        isCorrect: false,
        coinsReward: 0,
        xpReward: 5,
      },
      {
        id: 'buy_cheap_card',
        text: 'לקנות את הקל ב-15 ש"ח ולחסוך את שאר הכסף',
        feedback: 'החלטה מצוינת! קנית משהו שנותן לך הנאה (קל עם הדמות האהובה) ועוד נשארת עם 35 ש"ח לחיסכון למטרות חשובות יותר. זה דוגמה מצוינת להבדל בין צורך לרצון!',
        isCorrect: true,
        coinsReward: 20,
        xpReward: 20,
      },
      {
        id: 'save_all',
        text: 'לא לקנות כלום ולחסוך את כל ה-50 ש"ח',
        feedback: 'לחסוך זה תמיד בחירה טובה, אבל פעם בזמן מותר לפנק לעצמך גם קצת הנאה קטנה! חשוב למצוא איזון בין חיסכון להנאה סבירה.',
        isCorrect: false,
        coinsReward: 10,
        xpReward: 10,
      },
    ],
  },
  {
    id: 'birthday_money',
    title: 'כסף יום הולדת',
    description: 'קיבלת 100 ש"ח מתנה ליום הולדת מסבתא וסבא! יש לך 3 אפשרויות מול הפנים. ההורים שלך אמרו שאתה יכול להחליט לבד מה לעשות עם הכסף.',
    icon: '🎂',
    category: 'spending',
    completed: false,
    choices: [
      {
        id: 'spend_all_on_candy',
        text: 'לקנות המון סוכריות וחטיפים ולאכול הכל מיד',
        feedback: 'זה כיף להתפנק בחטיפים, אבל לאכול הכל מיד זה לא רק לא בריא - זה גם בזבוז של כסף. חשוב כמה ימים ההנאה תימשך לעומת כמה זמן חיסכת להשיג את הכסף הזה.',
        isCorrect: false,
        coinsReward: 0,
        xpReward: 5,
      },
      {
        id: 'save_half_spend_half',
        text: 'לחסוך 50 ש"ח ולהוציא 50 ש"ח על משהו כיפי',
        feedback: 'חלוקה חכמה! חסכת חצי למטרות עתידיות ועוד הרשית לעצמך להנות עכשיו. זו דוגמה מצוינת לאיזון בין חיסכון להוצאות!',
        isCorrect: true,
        coinsReward: 30,
        xpReward: 25,
      },
      {
        id: 'save_all_and_donate',
        text: 'לחסוך 80 ש"ח ולתרום 20 ש"ח לילדים שצריכים עזרה',
        feedback: 'החלטה נדיבה ומבוגרת מאוד! חיסכת למטרה חשובה ועוד עזרת לאחרים. זה מראה בשלות ורגישות חברתית גבוהה!',
        isCorrect: true,
        coinsReward: 50,
        xpReward: 30,
      },
    ],
  },
  {
    id: 'broken_item',
    title: 'החפץ השבור',
    description: 'האוזניות האהובות עליך התקלקלו. אפשר לתקן אותן ב-30 ש"ח, או לקנות חדשות ומשודרגות יותר ב-80 ש"ח. יש לך בדיוק 80 ש"ח בחיסכון, שתוכננו למטרה אחרת.',
    icon: '🎧',
    category: 'needs_vs_wants',
    completed: false,
    choices: [
      {
        id: 'buy_new_expensive',
        text: 'לקנות אוזניות חדשות ומשודרגות ב-80 ש"ח',
        feedback: 'יש אוזניות חדשות זה כיף, אבל חשבוב על זה - השתמשת בכל החיסכון שלך ועכשיו אין לך כסף למצבים חירום. אולי כדאי לשקול את האפשרות לפני להשתמש בכל החיסכון.',
        isCorrect: false,
        coinsReward: 0,
        xpReward: 5,
      },
      {
        id: 'repair_old_ones',
        text: 'לתקן את הקיימות ב-30 ש"ח ולחסוך את שאר הכסף',
        feedback: 'החלטה מעולה! תיקנת את הבעיה בעלות נמוכה יותר ועוד נשארת עם 50 ש"ח לחיסכון. זה דוגמה מצוינת לחשיבה כלכלית - לא תמיד צריך חדש כדי לפתור בעיה!',
        isCorrect: true,
        coinsReward: 25,
        xpReward: 25,
      },
      {
        id: 'buy_cheap_alternative',
        text: 'לקנות אוזניות זולות יותר ב-40 ש"ח',
        feedback: 'חיסכת ביחס למחיר המלא, אבל אוזניות זולות לפעמים מתקלקלות מהר יותר. חשוב גם על איכות לא רק על מחיר. לפעמים תיקון זה הבחירה הכי חכמה!',
        isCorrect: false,
        coinsReward: 10,
        xpReward: 10,
      },
    ],
  },
  {
    id: 'group_gift',
    title: 'מתנה קבוצתית',
    description: 'חברך לכיתה חוגג יום הולדת והחלטתם בכיתה להשיקיע יחד מתנה ב-150 ש"ח. יש 10 ילדים בכיתה, כל אחד צריך לשים 15 ש"ח. יש לך בדיוק 15 ש"ח פנויים.',
    icon: '🎁',
    category: 'ethics',
    completed: false,
    choices: [
      {
        id: 'contribute_full',
        text: 'לתרום את ה-15 ש"ח המלאים',
        feedback: 'תרומה נכונה והוגנת! כל אחד נותן את חלקו וכולם נהנים. זה מלמד אותך על שיתוף, אחריות קבוצתית, ולתת מה שיש לך למען הזולת.',
        isCorrect: true,
        coinsReward: 20,
        xpReward: 20,
      },
      {
        id: 'contribute_half',
        text: 'לתרום רק 7.50 ש"ח ולשמור את השאר',
        feedback: 'חשוב לשמור גם לעצמך, אבל כשמסכימים להשיקיע בקבוצה - צריך לעמוד במילה. אם כולם יתרמו רק חצי, לא יהיה מספיק למתנה. חשוב על ההשפעה שלך על הקבוצה כולה.',
        isCorrect: false,
        coinsReward: 5,
        xpReward: 10,
      },
      {
        id: 'dont_contribute',
        text: 'לא לתרום כלום ולחסוך את הכסף',
        feedback: 'חיסכת את כל הכסף, אבל חברך לא יקבל את המתנה שכולם רצו לו. פעם בזמן שווה להיות חלק מהקבוצה ולתרום לשמחה של מישהו אחר.',
        isCorrect: false,
        coinsReward: 0,
        xpReward: 5,
      },
    ],
  },
];

/**
 * Get scenario by ID
 */
export const getScenarioById = (id: string): Scenario | undefined => {
  return SCENARIOS.find(s => s.id === id);
};

/**
 * Get scenarios by category
 */
export const getScenariosByCategory = (category: Scenario['category']): Scenario[] => {
  return SCENARIOS.filter(s => s.category === category);
};

/**
 * Get next uncompleted scenario
 */
export const getNextScenario = (completedIds: string[]): Scenario | undefined => {
  return SCENARIOS.find(s => !completedIds.includes(s.id));
};

/**
 * Get all completed scenarios
 */
export const getCompletedScenarios = (scenarios: Scenario[]): Scenario[] => {
  return scenarios.filter(s => s.completed);
};
