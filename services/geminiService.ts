import { Lesson } from "../types";
import { LESSONS_CONFIG, getNextLesson } from "../config/lessonsConfig";

// AI is disabled for security - using config-based lessons

// Track completed lesson IDs for progression
const completedLessonIds: string[] = [];
let currentKnowledgePoints = 0;

// Update the knowledge points and completed lessons
export const updateLessonProgress = (knowledgePoints: number, lessonId?: string) => {
  currentKnowledgePoints = knowledgePoints;
  if (lessonId && !completedLessonIds.includes(lessonId)) {
    completedLessonIds.push(lessonId);
  }
};

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
  // Get next recommended lesson based on progress
  const nextLesson = getNextLesson(currentKnowledgePoints, completedLessonIds);

  if (nextLesson) {
    // Return the lesson object
    return nextLesson.lesson;
  }

  // Fallback to sequential lessons from config if no recommended lesson
  const lessonModule = LESSONS_CONFIG[lessonIndex % LESSONS_CONFIG.length];
  lessonIndex++;
  return lessonModule.lesson;
};
