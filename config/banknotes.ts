/**
 * Israeli banknotes (current Bank of Israel series, 2017–).
 *
 * People depicted are all 20th-century Hebrew poets — a deliberate choice by
 * Bank of Israel to honor Israeli cultural heritage on the new series.
 */

export interface Banknote {
  readonly value: 20 | 50 | 100 | 200;
  readonly color: string;
  readonly hexBg: string;
  readonly hexInk: string;
  readonly figure: string;
  readonly figureHint: string;
  readonly funFact: string;
}

export const BANKNOTES: Banknote[] = [
  {
    value: 20,
    color: 'אדום',
    hexBg: '#e63946',
    hexInk: '#fff',
    figure: 'רחל המשוררת',
    figureHint: 'משוררת מהעלייה השנייה, "וְאוּלַי לֹא הָיוּ הַדְּבָרִים מֵעוֹלָם"',
    funFact: 'השטר הזה הוא הקטן ביותר שמחזיקים היום',
  },
  {
    value: 50,
    color: 'ירוק',
    hexBg: '#2a9d8f',
    hexInk: '#fff',
    figure: 'שאול טשרניחובסקי',
    figureHint: 'משורר ורופא, "האדם אינו אלא תבנית נוף מולדתו"',
    funFact: 'היה גם רופא ילדים ולא רק משורר',
  },
  {
    value: 100,
    color: 'כתום',
    hexBg: '#f4a261',
    hexInk: '#222',
    figure: 'לאה גולדברג',
    figureHint: 'משוררת ילדים מפורסמת, "דירה להשכיר"',
    funFact: 'כתבה את "ימי חנוכה" ועוד שירי ילדים שכולם מכירים',
  },
  {
    value: 200,
    color: 'כחול',
    hexBg: '#1d3557',
    hexInk: '#fff',
    figure: 'נתן אלתרמן',
    figureHint: 'משורר ופזמונאי, "כלניות", "מגש הכסף"',
    funFact: 'כתב מאות שירים שהפכו לפזמונים מפורסמים',
  },
];

/**
 * Security feature trivia. Real Bank of Israel features on the current series.
 */
export interface SecurityFeature {
  readonly id: string;
  readonly question: string;
  readonly options: readonly string[];
  readonly correctIndex: number;
  readonly explanation: string;
}

export const SECURITY_FEATURES: SecurityFeature[] = [
  {
    id: 'hologram',
    question: 'מה הרצועה המבריקה שמשנה צבע כשמזיזים את השטר?',
    options: ['קישוט יפה', 'הולוגרמה — סימן אבטחה', 'ציור של הציפור', 'פס מגנטי'],
    correctIndex: 1,
    explanation: 'הולוגרמה היא סימן אבטחה — אי אפשר להעתיק אותה במדפסת',
  },
  {
    id: 'raised',
    question: 'למה יש סימנים בולטים בפינות של השטר?',
    options: [
      'כדי שיהיה יותר יפה',
      'כדי שאנשים עיוורים יוכלו לזהות את הסכום',
      'כדי שלא יתקפל',
      'כדי שיהיה יותר כבד',
    ],
    correctIndex: 1,
    explanation: 'הסימנים הבולטים עוזרים לאנשים שלא רואים לזהות מה הערך של השטר',
  },
  {
    id: 'tear',
    question: 'מה לעשות עם שטר קרוע או פגום?',
    options: [
      'לזרוק לפח',
      'להחליף בבנק ישראל בחינם',
      'לקנות איתו מהר לפני שמגלים',
      'להדביק עם דבק',
    ],
    correctIndex: 1,
    explanation: 'בנק ישראל מחליף שטרות פגומים בחינם — לא צריך לאבד את הכסף',
  },
  {
    id: 'who_prints',
    question: 'מי מחליט מי יופיע על השטרות?',
    options: ['ראש הממשלה', 'נגיד בנק ישראל', 'משרד החינוך', 'הציבור בהצבעה'],
    correctIndex: 1,
    explanation: 'נגיד בנק ישראל בוחר את הדמויות — בסדרה הנוכחית הם בחרו 4 משוררים',
  },
];
