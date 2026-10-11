/** A small, local picture vocabulary: no remote images or image-generation delay. */
export const REPLY_PICTURES = ['story', 'words', 'friends', 'play', 'art', 'music', 'numbers', 'cat', 'dog', 'nature', 'food', 'sun', 'moon', 'happy', 'sad', 'yes', 'no', 'idea', 'chat'] as const;
export type ReplyPicture = typeof REPLY_PICTURES[number];
export type ReplyOption = { label: string; picture: ReplyPicture };

const legacyPictures: [ReplyPicture, RegExp][] = [
  ['story', /story|book|סיפור|ספר|قصة|قصه|كتاب|حكاية|حكي|сказ|книг/iu],
  ['words', /word|letter|מיל|אות|كلم|حرف|слов|букв/iu],
  ['friends', /friend|חבר|صديق|أصدقاء|اصدقاء|друг|друз/iu],
  ['cat', /cat|חתול|قط|кот|кош/iu], ['dog', /dog|כלב|كلب|собак/iu],
  ['art', /draw|paint|color|ציור|לצייר|צבע|رسم|نرسم|لون|لوّن|рис|цвет/iu],
  ['music', /music|sing|song|שיר|מוזיק|غن|موسيق|пес|музык/iu],
  ['play', /play|ball|משחק|לשחק|כדור|لعب|كرة|игр|мяч/iu],
  ['nature', /tree|flower|garden|עץ|פרח|גינה|شجر|زهر|حديقة|дерев|цветок/iu],
  ['food', /food|apple|eat|אוכל|תפוח|לאכול|أكل|اكل|تفاح|еда|яблок/iu],
  ['happy', /happy|שמח|שמחה|سعيد|فرح|радост|весел/iu],
  ['sad', /sad|עצוב|حزين|груст/iu],
  ['numbers', /number|count|מספר|לספור|عدد|نعد|числ|счит/iu],
  ['yes', /^(yes|כן|نعم|آه|да)[! .]*$/iu], ['no', /^(no|לא|لا|нет)[! .]*$/iu],
];
export const inferReplyPicture = (label: string): ReplyPicture => legacyPictures.find(([, pattern]) => pattern.test(label))?.[0] || 'chat';

export function parseReplyOptions(value: unknown): ReplyOption[] {
  if (!Array.isArray(value)) return [];
  const options: ReplyOption[] = [];
  for (const entry of value) {
    const raw = typeof entry === 'string' ? { label: entry } : entry;
    if (!raw || typeof raw !== 'object' || typeof raw.label !== 'string') continue;
    const label = raw.label.replace(/\s+/g, ' ').trim().slice(0, 80);
    if (!label || options.some(option => option.label === label)) continue;
    const picture = REPLY_PICTURES.includes(raw.picture) ? raw.picture as ReplyPicture : inferReplyPicture(label);
    options.push({ label, picture });
    if (options.length === 4) break;
  }
  return options.length >= 2 ? options : [];
}
