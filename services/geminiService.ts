import { Lesson } from "../types";

// AI is disabled for security - using fallback content only

// Fallback lessons for when AI is not available
const FALLBACK_LESSONS: Lesson[] = [
  {
    concept: "📈 **ריבית** זה איך הבנק משלם לך על הכסף ששמרת!\n\nכשאתה מכניס כסף לחשבון חיסכון, הבנק משלם לך ריבית - כלומר, הבנק מוסיף לך עוד כסף בגלל שהשארת את הכסף אצלו. ככל שהכסף נשאר יותר זמן, אתה מקבל יותר ריבית. זה כמו מתנה שמקבלים סתם כי חיסכת!",
    question: "יש לך 100 ש\"ח בחשבון עם ריבית שנתית של 10%. כמה כסף יהיה לך אחרי שנה?",
    options: ["100 ש\"ח", "110 ש\"ח", "200 ש\"ח"],
    correctIndex: 1
  },
  {
    concept: "📊 **תקציב** זה תוכנית לאיך להשתמש בכסף שלך!\n\nכשאתה מקבל כסף - ממשפחה, משלושה, או מעבודה - חשוב לתכנן מראש: כמה להוציא על דברים שאתה צריך (כמו חטיפים לבית הספר), כמה לחסוך, וכמה להשאיר לדברים כיפיים. תקציב עוזר לך לדעת תמיד כמה כסף יש לך!",
    question: "קיבלת 50 ש\"ח תקציב לשבוע. אתה רוצה לקנות חטיף שעולה 5 ש\"ח כל יום. כמה יישאר לך בסוף השבוע?",
    options: ["15 ש\"ח", "45 ש\"ח", "25 ש\"ח"],
    correctIndex: 0
  },
  {
    concept: "💎 **חיסכון** זה לא להוציא הכל עכשיו!\n\nכשאתה מקבל כסף, יכול להיות מפתה להוציא את הכל על דברים כיפיים. אבל אם תחסוך חלק מהכסף - תוכל לקנות משהו גדול וחשוב יותר בעתיד! למשל: במקום לקנות חטיף קטן כל יום, אפשר לחסוך ולקנות משחק חדש אחרי חודש!",
    question: "ילד מקבל 10 ש\"ח בשבוע. אם הוא חוסך 3 ש\"ח כל שבוע, כמה יחסוך אחרי 4 שבועות?",
    options: ["7 ש\"ח", "12 ש\"ח", "3 ש\"ח"],
    correctIndex: 1
  },
  {
    concept: "🏪 **השוואת מחירים** זה לבדוק לפני שקונים!\n\nאותו מוצר יכול לעלות מחירים שונים בחנויות שונות. לפני שקונים משהו, שווה לבדוק ב-2-3 מקומות כמה זה עולה. ככה תוכל לחסוך המון כסף! לפעמים ההפרש יכול להיות עשרות שקלים על אותו הדבר!",
    question: "חטיף עולה 12 ש\"ח בחנות הקרובה, ו-8 ש\"ח בסופר שנמצא קצת רחוק יותר. כמה תחסוך אם תקנה בסופר?",
    options: ["4 ש\"ח", "12 ש\"ח", "8 ש\"ח"],
    correctIndex: 0
  },
  {
    concept: "🎯 **צרכים vs רצונות** - ההבדל החשוב!\n\n**צרך** = משהו שאתה חייב כדי לחיות (אוכל, מים, ביגוד)\n**רצון** = משהו שכיף לך אבת לא חייב (משחק חדש, חטיף יוקרה)\n\nלפני שקונים - שאל את עצמך: זה צורך או רצון? אם זה רק רצון - אולי כדאי לחכות ולחסוך על זה!",
    question: "איזה מאלו הוא 'צורך' ולא 'רצון'?",
    options: ["משחק חדש לקונסולה", "כריך לארוחת צהריים", "חטיף יוקרתי"],
    correctIndex: 1
  },
  {
    concept: "📈 **אינפלציה** זה שדברים נהיים יקרים יותר!\n\nאינפלציה זה המצב שבו המחירים של דברים עולים עם הזמן. פעם חטיף עלה 1 ש\"ח, היום הוא עולה 5 ש\"ח. זה אומר שהכסף שלך שווה פחות! לכן חשוב לחסוך ולהשקיע - כדי שהכסף שלך ישמור על הערך שלו!",
    question: "אם חטיף עלה 5 ש\"ח ובגלל אינפלציה המחיר עלה ב-20%, כמה הוא יעלה עכשיו?",
    options: ["6 ש\"ח", "25 ש\"ח", "7 ש\"ח"],
    correctIndex: 0
  }
];

let lessonIndex = 0;

export const getDailyTip = async (): Promise<string> => {
  // Return random tip from fallback list
  const fallbackTips = [
    "תמיד כדאי לשמור קצת מטבעות ליום סגריר! 🐿️",
    "חיסכון של 10 שקלים כל שבוע = יותר מ-500 שקל בשנה! 💰",
    "לפני קנייה - שאל את עצמך: צורך או רצון? 🤔",
    "השווה מחירים לפני שקונים - תופתע כמה תחסוך! 📊",
    "כסף שחוסכים היום, שווה יותר מחר! 📈",
    "קנייה חכמה זו לא רק הכי זול - גם הכי איכותי! 🏆",
  ];
  return fallbackTips[Math.floor(Math.random() * fallbackTips.length)];
};

// Fallback missions for when AI is not available
const FALLBACK_MISSIONS = [
  { title: "בדוק כמה עולה קילו עגבניות ב-3 חנויות שונות", reward: 80, icon: "🍅" },
  { title: "השווה מחיר של אותו חטיף ב-2 סופרים שונים", reward: 70, icon: "🍫" },
  { title: "ספור את כל המטבעות בקופת החיסכון שלך", reward: 60, icon: "🪙" },
  { title: "בדוק מה המחיר של 3 פריטים בסל הקניות וסכום אותם", reward: 90, icon: "🛒" },
  { title: "מצא את המחיר הזול ביותר לחלב ב-3 חנויות", reward: 75, icon: "🥛" },
  { title: "חשב כמה עולה חודש של ארוחות צהריים בבית הספר", reward: 100, icon: "🍱" },
];

let missionIndex = 0;

export const generateMagicMission = async (): Promise<{ title: string; reward: number; icon: string } | null> => {
  // Return fallback mission
  const fallbackMission = FALLBACK_MISSIONS[missionIndex % FALLBACK_MISSIONS.length];
  missionIndex++;
  return fallbackMission;
};

export const generateLesson = async (): Promise<Lesson | null> => {
  // Return fallback lesson
  const fallbackLesson = FALLBACK_LESSONS[lessonIndex % FALLBACK_LESSONS.length];
  lessonIndex++;
  return fallbackLesson;
};
