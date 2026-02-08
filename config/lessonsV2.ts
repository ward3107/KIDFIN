import { LessonV2 } from '../types/lessons';

/**
 * New Interactive Lesson Format
 * Combines: Story + Simulation + Characters + Learning by Doing
 */

// Re-export LessonV2 type for convenience
export type { LessonV2 } from '../types/lessons';

export const INTERACTIVE_LESSONS: LessonV2[] = [
  // ============================================================================
  // LESSON 1: INTEREST - The Magic Money That Grows!
  // ============================================================================
  {
    id: 'interest_magic',
    title: 'הכסף שגדל לבד!',
    category: 'savings',
    difficulty: 'beginner',
    requiredKnowledgePoints: 0,

    // PHASE 1: HOOK - Story of a magical discovery
    hook: {
      title: 'הגילוי המופלא בקופסה הישנה',
      scenario: 'הסנאי 🐿️ מוצא קופסה ישנה בעליית הגג של סבתא. בפנים יש מכתב ו-10 מטבעות זהובות.\n\nהמכתב אומר: "למי שימצא את הקופסה הזו - שמור את המטבעות בבנק ותחזור בעוד שנה. יהיה לך הפתעה!"',
      character: '🐿️',
      question: 'השועל צועק: "תן לי את המטבעות, אני יודע מקום טוב להחביא אותם!"\n\nמה הסנאי צריך לעשות?',
      choices: [
        {
          id: 'hide_fox',
          text: 'לתת לשועל להחביא את זה',
          isCorrect: false,
          feedback: 'השועל... הוא ממש לא אמין. הוא אוכל את המטבעות! 🦊',
          consequence: 'השועל לקח את המטבעות ונעלם. אופס.'
        },
        {
          id: 'spend_now',
          text: 'לקנות עכשיו גלידה!',
          isCorrect: false,
          feedback: 'איזה כיף! אבל... סבתא אמרה לחכות שנה. אולי פספסת משהו גדול יותר?',
          consequence: 'הגלידה הייתה טעימה, אבל אין מה להחזיר הביתה.'
        },
        {
          id: 'bank_deposit',
          text: 'ללכת לבנק כמו שסבתא אמרה',
          isCorrect: true,
          feedback: 'בחירה חכמה! בוא נראה מה קורה בבנק! 🏦',
          consequence: 'הבנק נותן לך קופסה משלך עם השם שלך!'
        }
      ]
    },

    // PHASE 2: EXPLORE - Interactive interest calculator
    explore: {
      id: 'interest_explore',
      scenario: 'הבנק מציע לך עסקה מיוחדת! כל שנה, הכסף שלך יגדל ב-10% - סתם כך!\n\nלחץ על הכפתור כדי לראות מה קורה אחרי כל שנה:',
      interactiveElement: {
        type: 'interest_calculator',
        title: '🎮 מחשבון קסמים',
        instruction: 'התחל עם 100 מטבעות. לחץ "שנה הבא" כדי לראות איך הכסף גדל!',
        defaultValue: 100
      },
      dialogue: [
        { character: 'squirrel', emotion: 'curious', text: 'וואו! הכסף גדל לבד! זה קסם?' },
        { character: 'fox', emotion: 'thoughtful', text: 'לא בדיוק קסם... זה נקרא ריבית! הבנק משלם לך סתם כי השארת לו את הכסף!' },
        { character: 'squirrel', emotion: 'excited', text: 'אז ככל שיש לי יותר כסף בבנק... יותר כסף יגדל?! 🤩' }
      ],
      keyInsight: 'כשמשאירים כסף בבנק, הוא מרוויח ריבית - הבנק מוסיף לך עוד כסף בגלל שהשארת אותו שם!'
    },

    // PHASE 3: EXPLAIN - Characters explain the concept
    explain: {
      conceptName: 'ריבית (Interest)',
      definition: '💡 ריבית זה הכסף שהבנק מוסיף לך בתמורה לשמירת הכסף אצלו. זה כמו פרס על החיסכון!',
      dialogue: [
        { character: 'fox', emotion: 'thoughtful', text: 'תחשוב על זה ככה - הבנק צריך את הכסף שלך כדי להלוות אותו לאנשים אחרים. אז הוא משלם לך "שכיר דירה" על הכסף!' },
        { character: 'squirrel', emotion: 'curious', text: 'והכיוף הזה גדול יותר ככל שהשארתי יותר זמן?' },
        { character: 'fox', emotion: 'proud', text: 'בדיוק! וגם ככל שיש לך יותר כסף - יותר ריבית אתה מקבל. זה נקרא "ריבית דריבית" - הכסף מרוויח כסף שמרוויח עוד כסף!' },
        { character: 'squirrel', emotion: 'excited', text: 'כמו ביצים שמטילות עוד ביצים! 🥚🐣' }
      ],
      realWorldExample: '💰 במציאות: אם תשמור 1,000 ש"ח בבנק עם 5% ריבית בשנה - אחרי שנה יהיה לך 1,050 ש"ח. אחרי 10 שנים? יותר מ-1,600 ש"ח! והכל בלי לעשות כלום!'
    },

    // PHASE 4: PRACTICE - Apply what you learned
    practice: {
      scenarios: [
        {
          situation: '🐿️ הסנאי שומר 50 מטבעות בבנק עם 10% ריבית לשנה.',
          question: 'כמה מטבעות הבנק יוסיף לו אחרי שנה?',
          options: ['5 מטבעות', '10 מטבעות', '50 מטבעות'],
          correctIndex: 0,
          explanation: '10% מ-50 זה 5! החישוב: 50 × 0.10 = 5 💰'
        },
        {
          situation: '🦊 השועל שומר 200 מטבעות בבנק עם 10% ריבית לשנה.',
          question: 'כמה מטבעות הבנק יוסיף לו אחרי שנה?',
          options: ['10 מטבעות', '20 מטבעות', '200 מטבעות'],
          correctIndex: 1,
          explanation: '10% מ-200 זה 20! החישוב: 200 × 0.10 = 20 💡'
        },
        {
          situation: '🐿️ הסנאי מחליט להשאיר את הכסף בבנק במשך 3 שנים. הוא מתחיל עם 100 מטבעות.',
          question: 'מה יקרה אחרי 3 שנים (בערך)?',
          options: ['ישאר עם 100 מטבעות', 'יהיה לו יותר מ-130 מטבעות', 'יהיה לו 110 מטבעות'],
          correctIndex: 1,
          explanation: 'כל שנה מקבלים 10 מטבעות ריבית (בערך). אחרי 3 שנים זה כבר 30+ מטבעות בריבית! 📈'
        }
      ]
    },

    // PHASE 5: QUIZ - Final challenge
    quiz: {
      question: 'בוא נראה אם הבנת! איזה משפט נכון יותר?',
      options: [
        'ריבית זה כשהבנק גובה ממך כסף',
        'ריבית זה כשהבנק משלם לך כסף על שמירת הכסף אצלו',
        'ריבית זה רק למבוגרים'
      ],
      correctIndex: 1,
      reward: '🎉 יש לך בראש ראש של בנקאי! הרווחת 50 מטבעות!'
    }
  },

  // ============================================================================
  // LESSON 2: NEEDS VS WANTS - The Shopping Challenge
  // ============================================================================
  {
    id: 'needs_wants_adventure',
    title: 'חנות הצעצועים הגדולה',
    category: 'spending',
    difficulty: 'beginner',
    requiredKnowledgePoints: 0,

    hook: {
      title: 'ההחלטה הקשה בחנות',
      scenario: 'הסנאי 🐿️ נכנס לחנות עם 50 מטבעות שקיבל מסבתא.\n\nבחנות יש המון דברים:\n• 🎒 תיק חדש לבית ספר (התיק שלו התקלף!) - 25 מטבעות\n• 🎮 משחק חדש ומגניב - 45 מטבעות\n• 🍕 פיצה גדולה - 20 מטבעות\n• 🧢 כובע מגניב - 30 מטבעות',
      character: '🐿️',
      question: 'השועל אומר: "קח את המשחק! זה הכי כיף!"\n\nמה הסנאי צריך לעשות?',
      choices: [
        {
          id: 'buy_game',
          text: 'לקחת את המשחק! זה הכי כיף!',
          isCorrect: false,
          feedback: 'המשחק כיף... אבל מחר אין לו תיק לספרים ובית ספר! 😰',
          consequence: 'המשחק כיף אבל... איך נושאים את הספרים?'
        },
        {
          id: 'buy_hat',
          text: 'לקחת את הכובב המגניב!',
          isCorrect: false,
          feedback: 'יפה אבל... זה לא דחוף. וגם יש כבר כובב בבית!',
          consequence: 'הכובב יפה אבל היום צריך תיק!'
        },
        {
          id: 'buy_backpack',
          text: 'לקחת את התיק לבית ספר',
          isCorrect: true,
          feedback: 'בחירה חכמה! זה **צורך** - משהו שחייבים לבית ספר! ✅',
          consequence: 'יש לו תיק חדש ונשארו עוד 25 מטבעות!'
        }
      ]
    },

    explore: {
      id: 'needs_wants_explore',
      scenario: 'בוא נבין את ההבדל! הסנאי מסתכל על כל מוצר ושואל: "זה צורך או רצון?"',
      interactiveElement: {
        type: 'price_comparison',
        title: '🎮 צרכים ורצונות',
        instruction: 'בחר איזה פריט הוא צורך ואיזה רצון!'
      },
      dialogue: [
        { character: 'fox', emotion: 'thoughtful', text: 'צורך = משהו שאי אפשר בלי זה. כמו אוכל, ביגוד, תיק לספרים...' },
        { character: 'squirrel', emotion: 'curious', text: 'ורצון זה... משהו שכיף אבל אפשר לחיות בלי זה?' },
        { character: 'fox', emotion: 'excited', text: 'בדיוק! כמו משחק חדש, חטיף יוקרה, צעצוע נוסף...' },
        { character: 'squirrel', emotion: 'proud', text: 'והטריק הוא: קודם קונים צרכים, אחר כך חוסכים על רצונות! 🎯' }
      ],
      keyInsight: '**צורך** = חייבים אותו (אוכל, ביגוד, ציוד לבית ספר)\n**רצון** = כיף להשיג אבל לא חייבים (משחקים, חטיפים יוקרים)'
    },

    explain: {
      conceptName: 'צרכים ורצונות',
      definition: '🎯 **צורך** = משהו שאי אפשר לחיות בליו (אוכל, מים, ביגוד, ציוד לימודים)\n\n❤️ **רצון** = משהו שכיף אבל לא הכרחי (משחקים, חטיפים, צעצועים)',
      dialogue: [
        { character: 'squirrel', emotion: 'confused', text: 'אבל איך מבחינים? לפעמים זה מבלבל!' },
        { character: 'fox', emotion: 'thoughtful', text: 'שאלה פשוטה: "אם לא אקנה את זה - משהו רע יקרה?" אם כן - זה צורך!' },
        { character: 'fox', emotion: 'excited', text: 'דוגמה: בלי תיק לספרים - לא יכול ללמוד. זה צורך!' },
        { character: 'squirrel', emotion: 'proud', text: 'ובלי משחק חדש - אני אשחק משהו אחר. זה רצון! 😎' }
      ],
      realWorldExample: '💡 במציאות: תמיד קודם מסדרים את הצרכים (שכר דירה, אוכל, חשבונות) ורק אז חוסכים על רצונות (בילויים, קניות, חופשות)'
    },

    practice: {
      scenarios: [
        {
          situation: 'יש לך 20 מטבעות. אתה בסופר ורועב.',
          question: 'איזה מאלו הוא "צורך"?',
          options: ['קנאבו חדש', 'ארוחת צהריים', 'גלידה מיוחדת'],
          correctIndex: 1,
          explanation: 'אוכל זה צורך - אי אפשר לחיות בליו! 🍎'
        },
        {
          situation: 'התיק שלך נקרע והספרים נופלים.',
          question: 'מה לעשות?',
          options: ['לקנות תיק חדש', 'לקנות משחק חדש', 'להמשיך עם התיק הקרוע'],
          correctIndex: 0,
          explanation: 'תיק לספרים זה צורך לימודי! 🎒'
        },
        {
          situation: 'יש לך 100 מטבעות. רואה כובע מגניב אבל... יש לך כבר 3 כובעות בבית.',
          question: 'מה לעשות?',
          options: ['לקנות את הכובב', 'לחסוך את הכסף למשהו אחר'],
          correctIndex: 1,
          explanation: 'כבר יש כובבות - זה רק רצון, לא צורך! 💰'
        }
      ]
    },

    quiz: {
      question: 'איזה משפט מסביר נכון את ההבדל בין צורך לרצון?',
      options: [
        'צורך זה משהו שכיף, רצון זה משהו שחייבים',
        'צורך זה משהו שחייבים כדי לחיות, רצון זה משהו שכיף אבל לא הכרחי',
        'אין הבדל ביניהם'
      ],
      correctIndex: 1,
      reward: '🎯 אתה צועם! הבנת את ההבדל בין צרכים ורצונות!'
    }
  },

  // ============================================================================
  // LESSON 3: SAVINGS - The Dream Jar
  // ============================================================================
  {
    id: 'savings_dream_jar',
    title: 'צנצנת החלומות',
    category: 'savings',
    difficulty: 'beginner',
    requiredKnowledgePoints: 0,

    hook: {
      title: 'החלום הגדול של הסנאי',
      scenario: 'הסנאי 🐿️ רוצה מאוד לקנות קורקינט חדש! עליו יש מדבקה עם המחיר: 150 מטבעות.\n\nהבעיה? יש לו רק 10 מטבעות בכיס.\n\nהשועל מגיע וצועק: "תן לי לעזור! אני יכול להשיג לך קורקינט ב-50 מטבעות! הוא... יהיה שימושי... בערך..."',
      character: '🐿️',
      question: 'מה הסנאי צריך לעשות?',
      choices: [
        {
          id: 'accept_deal',
          text: 'לקחת את העסקה! 50 מטבעות זה הרבה פחות!',
          isCorrect: false,
          feedback: 'הקורקינט נשבר אחרי יומיים... השועל קנה משהו זול! 😱',
          consequence: 'חיסכות על דבר זול = יקר בסופו של דבר'
        },
        {
          id: 'give_up',
          text: 'לוותר על הקורקינט... זה יקר מדי',
          isCorrect: false,
          feedback: 'עצוב... הקורקינט היה חלום! 😢',
          consequence: 'לפעמים כדאי לחכות ולחסוך!'
        },
        {
          id: 'save_plan',
          text: 'להתחיל לחסוך! קצת כל פעם',
          isCorrect: true,
          feedback: 'בחירה חכמה! חיסכון משתלם! 💰',
          consequence: 'אם יחסוך 15 מטבעות בשבוע - בעוד 10 שבועות יהיה לו קורקינט!'
        }
      ]
    },

    explore: {
      id: 'savings_explore',
      scenario: 'הסנאי מקבל 20 מטבעות כל שבוע מהורים. כמה לחסוך?\n\nלחץ על הכפתורים כדי לראות איך החיסכון משפיע על ההגעה ליעד:',
      interactiveElement: {
        type: 'savings_tracker',
        title: '🎮 מחשבון חיסכון',
        instruction: 'בחר כמה לחסוך כל שבוע וראה מתי מגיעים ל-150!'
      },
      dialogue: [
        { character: 'squirrel', emotion: 'confused', text: 'אבל אם אחסוך הכל - איך אני קונה חטיפים?!' },
        { character: 'fox', emotion: 'thoughtful', text: 'זה האתגר! צריך לאזן בין חיסכון להנאה מהכסף' },
        { character: 'fox', emotion: 'proud', text: 'הצעה: חסוך 25% מהכל מקבל. 20 מטבעות? שמור 5!' },
        { character: 'squirrel', emotion: 'excited', text: 'ככה זה לוקח יותר זמן... אבל אני עדיין יכול לקנות חטיפים! 🐿️' }
      ],
      keyInsight: 'חיסכון זה לא להוציא הכל עכשיו. זה לשמור חלק מהכסף כדי להגיע למטרה גדולה יותר בעתיד!'
    },

    explain: {
      conceptName: 'חיסכון',
      definition: '💎 **חיסכון** זה לא להוציא הכל עכשיו, אלא לשמור חלק מהכסף למטרה גדולה יותר בעתיד',
      dialogue: [
        { character: 'fox', emotion: 'thoughtful', text: 'כשאתה מקבל כסף - אפשר להוציא הכל מיד על דברים קטנים...' },
        { character: 'fox', emotion: 'excited', text: 'או אפשר לחסוך חלק מזה, ואז לקנות משהו גדול ומשמעותי יותר!' },
        { character: 'squirrel', emotion: 'curious', text: 'וזה קשה? לא להוציא הכל?' },
        { character: 'fox', emotion: 'proud', text: 'כן, זה דורש השתלטות עצמית! אבל התחושה כשמגיעים למטרה... אין עליה! 🎉' }
      ],
      realWorldExample: '💡 במציאות: אנשים חוסכים לדברים גדולים - דירה, מכונית, חופשה, שנת שירות. החיסכון מתחיל מגיל צעיר!'
    },

    practice: {
      scenarios: [
        {
          situation: 'קיבלת 50 מטבעות. רוצה לחסוך 30% לקורקינט.',
          question: 'כמה לחסוך?',
          options: ['10 מטבעות', '15 מטבעות', '20 מטבעות'],
          correctIndex: 1,
          explanation: '30% מ-50 זה 15! החישוב: 50 × 0.30 = 15 💰'
        },
        {
          situation: 'הקורקינט עולה 150 מטבעות. חוסך 15 מטבעות בשבוע.',
          question: 'כמה זמן ייקח להגיע?',
          options: ['5 שבועות', '10 שבועות', '15 שבועות'],
          correctIndex: 1,
          explanation: '150 ÷ 15 = 10 שבועות! זה קצת יותר מחודשיים! 🛴'
        },
        {
          situation: 'חוסך 10 מטבעות כל שבוע למשך 20 שבועות.',
          question: 'כמה יחסוך בסך הכל?',
          options: ['100 מטבעות', '150 מטבעות', '200 מטבעות'],
          correctIndex: 2,
          explanation: '10 × 20 = 200 מטבעות! 💡'
        }
      ]
    },

    quiz: {
      question: 'מה הכי חשוב לזכור על חיסכון?',
      options: [
        'לחסוך את כל הכסף תמיד',
        'לחסוך חלק מהכסף למטרה עתידית',
        'לא לחסוך כלוך כי זה מיותר'
      ],
      correctIndex: 1,
      reward: '🏦 בראש של בנקאי! חיסכון חכם זה הדרך להגשים חלומות!'
    }
  }
];
