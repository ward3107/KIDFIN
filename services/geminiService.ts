
import { GoogleGenAI, Type } from "@google/genai";
import { Lesson } from "../types";

const getAiClient = () => {
  if (!process.env.API_KEY || process.env.API_KEY === '') {
    throw new Error("API Key is missing");
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const getDailyTip = async (): Promise<string> => {
  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: "תן לי טיפ אחד קצר, מצחיק ומלמד על כסף לילד ישראלי בן 10. בעברית. מקסימום 20 מילים.",
      config: {
        temperature: 0.8,
      },
    });
    return response.text?.trim() || "כסף שחוסכים היום, שווה יותר מחר!";
  } catch (error) {
    console.error("Error fetching daily tip:", error);
    return "תמיד כדאי לשמור קצת מטבעות ליום סגריר!";
  }
};

export const generateMagicMission = async (): Promise<{ title: string; reward: number; icon: string } | null> => {
  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `צור "אתגר פיננסי" אחד לילד בבית. האתגר חייב להיות קשור לכסף, צרכנות, או חיסכון.
      דוגמאות: "השווה מחיר של חטיף בשני אתרים", "בדוק כמה עולה קילו עגבניות", "ספור את המטבעות בקופה".
      אל תיתן משימות כמו "לסדר חדר" או "לנקות". המשימה חייבת להיות כלכלית.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: {
              type: Type.STRING,
              description: "תיאור המשימה הפיננסית בעברית.",
            },
            reward: {
              type: Type.INTEGER,
              description: "מספר מטבעות כפרס (בין 50 ל-150).",
            },
            icon: {
              type: Type.STRING,
              description: "אימוג'י יחיד שמתאים למשימה.",
            },
          },
          required: ["title", "reward", "icon"],
        },
      },
    });

    const text = response.text?.trim();
    if (!text) return null;
    return JSON.parse(text);
  } catch (error) {
    console.error("Error generating magic mission:", error);
    return null;
  }
};

export const generateLesson = async (): Promise<Lesson | null> => {
  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `תסביר מושג כלכלי בסיסי אחד (כמו ריבית, אינפלציה, תקציב, מניה, חוב) בשפה פשוטה וכיפית לילד.
      אחרי ההסבר, תן "אתגר סימולציה" מעשי עם 3 אפשרויות בחירה.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            concept: { type: Type.STRING, description: "ההסבר על המושג בעברית." },
            question: { type: Type.STRING, description: "שאלת הסימולציה." },
            options: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "3 אפשרויות בחירה.",
            },
            correctIndex: { type: Type.INTEGER, description: "האינדקס של התשובה הנכונה (0-2)." },
          },
          required: ["concept", "question", "options", "correctIndex"],
        },
      },
    });

    const text = response.text?.trim();
    if (!text) return null;
    return JSON.parse(text);
  } catch (error) {
    console.error("Error generating lesson:", error);
    return null;
  }
};
