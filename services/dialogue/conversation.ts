/**
 * Scripted, proactive, bilingual conversation for the talking mascot.
 *
 * The robot LEADS: it opens, asks, and reacts, so a shy child never has to
 * start. Each turn carries natural-voice audio keys (played as
 * /audio/{lang}/{key}.mp3, with a Web Speech fallback) plus per-language text
 * (captions + fallback) and per-language keyword intents for matching what the
 * child says by voice.
 *
 * This is the safe "Hybrid" half (AVATAR_3D_PLAN.md — Layer 4, scripted).
 * The AI free-chat engine will implement the same TurnResult contract later.
 */

import type { AvatarExpression, AvatarGesture } from '../../components/avatar/avatarTypes';

export type Lang = 'he' | 'ar';
export type LocalizedText = Record<Lang, string>;

export interface ConvoOption {
  /** Keywords (per language) that select this branch when heard in the child's speech. */
  keywords: Record<Lang, string[]>;
  /** Turn id to go to when matched. */
  next: string;
}

export interface ConvoTurn {
  id: string;
  /** Audio clip base name — resolves to /audio/{lang}/{audioKey}.mp3. */
  audioKey: string;
  /** Spoken/caption text per language (also the Web Speech fallback). */
  text: LocalizedText;
  expression: AvatarExpression;
  gesture?: AvatarGesture;
  /**
   * If present, the robot listens after speaking and branches on what it hears.
   * If absent, the turn auto-advances to `next` (or ends if none).
   */
  options?: ConvoOption[];
  /** Branch used when the child speaks but nothing matches. */
  fallbackNext?: string;
  /** Auto-advance target when there are no options. */
  next?: string;
  /** Marks the end of the conversation. */
  end?: boolean;
}

/**
 * A small "meet + feelings + sharing lesson" flow. Short on purpose; more
 * scenarios (empathy, greetings, conflict, teamwork) plug in the same way.
 */
export const CONVERSATION: Record<string, ConvoTurn> = {
  greet: {
    id: 'greet',
    audioKey: 'greet',
    text: {
      he: 'היי! אני קיווי, החבר הרובוט שלך. כל כך כיף שבאת! איך קוראים לך?',
      ar: 'مرحبا! أنا كيوي، صديقك الروبوت. سعيد جدا بقدومك! ما اسمك؟',
    },
    expression: 'happy',
    gesture: 'wave',
    // We listen (to hear the name) but any answer moves on warmly.
    options: [],
    fallbackNext: 'nice_to_meet',
  },
  nice_to_meet: {
    id: 'nice_to_meet',
    audioKey: 'nice_to_meet',
    text: {
      he: 'נעים מאוד להכיר אותך! ספר לי, איך אתה מרגיש היום?',
      ar: 'تشرفت بمعرفتك! أخبرني، كيف تشعر اليوم؟',
    },
    expression: 'happy',
    gesture: 'nod',
    options: [
      {
        keywords: {
          he: ['טוב', 'שמח', 'מעולה', 'מצוין', 'כיף', 'נהדר', 'בסדר'],
          ar: ['بخير', 'سعيد', 'جيد', 'ممتاز', 'رائع', 'تمام', 'مبسوط'],
        },
        next: 'feel_good',
      },
      {
        keywords: {
          he: ['עצוב', 'רע', 'לא טוב', 'כועס', 'עייף', 'משעמם', 'פוחד'],
          ar: ['حزين', 'سيء', 'غاضب', 'تعبان', 'ممل', 'خائف', 'زعلان'],
        },
        next: 'feel_sad',
      },
    ],
    fallbackNext: 'feel_neutral',
  },
  feel_good: {
    id: 'feel_good',
    audioKey: 'feel_good',
    text: {
      he: 'איזה יופי שאתה מרגיש טוב! בוא נלמד יחד משהו על חברות.',
      ar: 'ما أجمل أنك تشعر بخير! هيا نتعلم معا شيئا عن الصداقة.',
    },
    expression: 'happy',
    gesture: 'cheer',
    next: 'lesson_share',
  },
  feel_sad: {
    id: 'feel_sad',
    audioKey: 'feel_sad',
    text: {
      he: 'תודה ששיתפת אותי. זה בסדר גמור להרגיש ככה, ואני כאן איתך. בוא ננסה משהו נחמד ביחד.',
      ar: 'شكرا لأنك شاركتني. لا بأس أن تشعر هكذا، وأنا هنا معك. هيا نجرب شيئا لطيفا معا.',
    },
    expression: 'sad',
    gesture: 'nod',
    next: 'lesson_share',
  },
  feel_neutral: {
    id: 'feel_neutral',
    audioKey: 'feel_neutral',
    text: {
      he: 'הבנתי! תודה שסיפרת לי. בוא נלמד יחד משהו כיף על חברים.',
      ar: 'فهمت! شكرا لأنك أخبرتني. هيا نتعلم معا شيئا ممتعا عن الأصدقاء.',
    },
    expression: 'thinking',
    gesture: 'think',
    next: 'lesson_share',
  },
  lesson_share: {
    id: 'lesson_share',
    audioKey: 'lesson_share',
    text: {
      he: 'דמיין: חבר שלך רוצה לשחק עם הצעצוע שאתה מחזיק. מה כדאי לעשות?',
      ar: 'تخيل: صديقك يريد أن يلعب باللعبة التي تمسكها. ماذا يجدر بك أن تفعل؟',
    },
    expression: 'thinking',
    gesture: 'think',
    options: [
      {
        keywords: {
          he: ['לשתף', 'לחלוק', 'לתת', 'ביחד', 'תור', 'להשאיל'],
          ar: ['أشارك', 'أعطي', 'معا', 'دور', 'نتشارك', 'أعيره'],
        },
        next: 'share_good',
      },
    ],
    fallbackNext: 'share_hint',
  },
  share_hint: {
    id: 'share_hint',
    audioKey: 'share_hint',
    text: {
      he: 'רעיון טוב לחשוב על זה! מה דעתך לשתף ולשחק בתורות? נסה להגיד "לשתף".',
      ar: 'فكرة جيدة أن تفكر في ذلك! ما رأيك أن نتشارك ونلعب بالأدوار؟ جرب أن تقول "أشارك".',
    },
    expression: 'happy',
    gesture: 'nod',
    options: [
      {
        keywords: {
          he: ['לשתף', 'לחלוק', 'לתת', 'ביחד', 'תור', 'להשאיל', 'כן'],
          ar: ['أشارك', 'أعطي', 'معا', 'دور', 'نتشارك', 'أعيره', 'نعم'],
        },
        next: 'share_good',
      },
    ],
    fallbackNext: 'share_good',
  },
  share_good: {
    id: 'share_good',
    audioKey: 'share_good',
    text: {
      he: 'כל הכבוד! שיתוף גורם לשנינו להיות שמחים, וזה מה שחברים עושים. אני ממש גאה בך!',
      ar: 'أحسنت! المشاركة تجعلنا سعيدين معا، وهذا ما يفعله الأصدقاء. أنا فخور بك جدا!',
    },
    expression: 'surprised',
    gesture: 'cheer',
    next: 'bye',
  },
  bye: {
    id: 'bye',
    audioKey: 'bye',
    text: {
      he: 'היה לי כיף לדבר איתך! נתראה בפעם הבאה, חבר. להתראות!',
      ar: 'استمتعت بالحديث معك! أراك في المرة القادمة يا صديقي. إلى اللقاء!',
    },
    expression: 'happy',
    gesture: 'wave',
    end: true,
  },
};

export const CONVERSATION_START = 'greet';
