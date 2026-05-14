/**
 * Scam / Real scenarios for the "אמיתי או מזויף?" mini-game.
 *
 * Each card shows a realistic Israeli message a kid might encounter. The
 * mix is intentional: roughly half real, half fake, so the player must
 * pay attention to actual red flags instead of pattern-matching on "looks
 * suspicious". Red flags are revealed only after the choice is made.
 *
 * Examples are educational fakes — not real URLs or phone numbers.
 */

export type ScamSource = 'sms' | 'popup' | 'email' | 'dm' | 'app';

export interface ScamScenario {
  readonly id: string;
  readonly source: ScamSource;
  readonly sender: string;
  readonly body: string;
  readonly isFake: boolean;
  /** Reasons it's fake, OR reasons we know it's real (shown after answer). */
  readonly redFlags: readonly string[];
  /** One-line takeaway shown on the answer card. */
  readonly lesson: string;
}

export const SCAM_SCENARIOS: ScamScenario[] = [
  {
    id: 'paybox_phish',
    source: 'sms',
    sender: 'PayBox',
    body: 'שלום, חשבון ה-PayBox שלך הושעה. לחץ עכשיו כדי לאשר את הזהות שלך: http://pay-box-il.xyz/login',
    isFake: true,
    redFlags: [
      'הקישור לא כתובת PayBox האמיתית (paybox.co.il) אלא דומה עם סיומת xyz',
      'דחיפות מלאכותית — "עכשיו"',
      'PayBox לעולם לא מבקש סיסמה בקישור מ-SMS',
    ],
    lesson: 'אם יש ספק — תיכנס לאפליקציה דרך הטלפון, לא דרך קישור בהודעה',
  },
  {
    id: 'real_bituach_leumi',
    source: 'sms',
    sender: 'בטל',
    body: 'הקצבה שלך הופקדה בחשבונך. לפרטים: my.btl.gov.il',
    isFake: false,
    redFlags: [
      'אין בקשה ללחוץ על קישור או למסור פרטים',
      'הכתובת btl.gov.il היא הכתובת הרשמית של ביטוח לאומי',
      'אין דחיפות מלאכותית',
    ],
    lesson: 'הודעות מהמדינה מסתיימות תמיד ב-gov.il',
  },
  {
    id: 'iphone_prize',
    source: 'popup',
    sender: 'דפדפן',
    body: 'מזל טוב! זכית באייפון 16 PRO! אתה הגולש ה-1,000,000 באתר. לחץ כאן לאסוף את הפרס שלך תוך 60 שניות.',
    isFake: true,
    redFlags: [
      'אף אחד לא נותן אייפון במתנה בגלל "ביקור באתר"',
      'טיימר של 60 שניות — לחץ כדי למנוע ממך לחשוב',
      'אין שם אתר ברור או חברה אמיתית מאחורי זה',
    ],
    lesson: 'אם נשמע טוב מדי מכדי להיות אמיתי — זה כנראה מזויף',
  },
  {
    id: 'package_stuck',
    source: 'sms',
    sender: '+972-58-XXX',
    body: 'החבילה שלך נתקעה במכס. שלם 12.90 ₪ עכשיו כדי לשחרר: track-il.click/pay',
    isFake: true,
    redFlags: [
      'מספר טלפון פרטי במקום שם של חברת משלוחים',
      'דומיין מוזר (.click במקום .co.il של חברה אמיתית)',
      'סכום קטן שנשמע "סביר" — טריק שמרבים להשתמש בו',
    ],
    lesson: 'דואר ישראל / DHL / UPS לא גובים תשלום קטן דרך SMS — תמיד באפליקציה',
  },
  {
    id: 'real_bank',
    source: 'app',
    sender: 'אפליקציית הבנק',
    body: 'התראה: בוצעה עסקה ע"ס 78 ₪ ב"שופרסל דיל" ב-14:23. לא אתה? היכנס דרך האפליקציה.',
    isFake: false,
    redFlags: [
      'ההתראה הגיעה דרך אפליקציית הבנק עצמה — לא דרך SMS',
      'מפרט מקום, סכום וזמן מדויק',
      'מפנה אותך לאפליקציה ולא לקישור חיצוני',
    ],
    lesson: 'התראות אמיתיות מגיעות תמיד דרך האפליקציה הרשמית',
  },
  {
    id: 'grandma_help',
    source: 'dm',
    sender: 'משתמש לא מוכר',
    body: 'היי, זה אני סבא! איבדתי את הטלפון, הכרטיס שלי נחסם. תוכל להעביר לי 200 ש"ח דחוף לחשבון 12-345-678?',
    isFake: true,
    redFlags: [
      'משתמש לא מוכר טוען להיות בן משפחה',
      'דחיפות + סיפור רגשי כדי שלא תחשוב',
      'בקשה להעביר כסף לחשבון לא מוכר',
    ],
    lesson: 'אם בן משפחה מבקש כסף — תתקשר אליו לפני, ולא דרך אפליקציה זרה',
  },
  {
    id: 'discord_nitro',
    source: 'dm',
    sender: 'Discord_Staff',
    body: 'Congrats! You won a free year of Discord Nitro! Click here to claim: discord-gift.xyz/free',
    isFake: true,
    redFlags: [
      'Discord לא שולח הודעות פרטיות מ"Staff"',
      'הקישור הוא לא discord.com',
      'ההודעה באנגלית למרות שאתה משתמש בעברית',
    ],
    lesson: 'משחקים ופלטפורמות לא מחלקים פרסים בהודעות פרטיות',
  },
  {
    id: 'real_school',
    source: 'app',
    sender: 'משוב',
    body: 'תזכורת: שיעורי בית במתמטיקה לתאריך מחר, פרק 4 שאלות 1-8',
    isFake: false,
    redFlags: [
      'הודעה דרך אפליקציית בית הספר הרשמית',
      'אין בקשת כסף או לחיצה על קישור',
      'תוכן ספציפי שמתאים לכיתה שלך',
    ],
    lesson: 'אפליקציות רשמיות של בית הספר משתמשות בשם המורה ובפרטים ספציפיים',
  },
  {
    id: 'fake_order',
    source: 'email',
    sender: 'amazon-support@am4zon-il.com',
    body: 'תודה על ההזמנה שלך ע"ס 1,840 ₪. לא הזמנת? לחץ כאן כדי לבטל מיידית.',
    isFake: true,
    redFlags: [
      'הכתובת am4zon — עם 4 במקום a — לא הדומיין האמיתי',
      'סכום גבוה כדי להלחיץ אותך ללחוץ',
      'אמזון לא שולחת אישורים על הזמנות שלא הוזמנו',
    ],
    lesson: 'תמיד תבדוק את הכתובת של השולח — שינויים קטנים = הונאה',
  },
  {
    id: 'real_2fa',
    source: 'sms',
    sender: 'Google',
    body: 'G-748293 הוא קוד האימות שלך. אל תשתף אותו עם אף אחד.',
    isFake: false,
    redFlags: [
      'אין קישור ללחוץ עליו',
      'אין בקשה לשתף את הקוד',
      'אזהרה מפורשת שלא לשתף אותו',
    ],
    lesson: 'קוד אימות = אף פעם לא שולחים לאף אחד, גם לא לתמיכה',
  },
];

export const SOURCE_LABEL: Record<ScamSource, string> = {
  sms: 'הודעת SMS',
  popup: 'חלון קופץ',
  email: 'אימייל',
  dm: 'הודעה פרטית',
  app: 'התראת אפליקציה',
};

export const SOURCE_ICON: Record<ScamSource, string> = {
  sms: '💬',
  popup: '⚠️',
  email: '📧',
  dm: '👤',
  app: '📱',
};
