import React, { Suspense, useEffect, useRef, useState } from 'react';
import type { AvatarHandle } from './avatarTypes';
import { deliveryFromText, type Delivery } from './conversationMotion';
import {
  KiwiRealtime,
  type RealtimeLanguage,
  type VoicePhase,
} from '../../services/live/realtimeClient';

const RobotAvatar = React.lazy(() => import('./RobotAvatar').then(m => ({ default: m.RobotAvatar })));

class AvatarBoundary extends React.Component<{ children: React.ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? <div className="flex h-72 items-center justify-center text-9xl" role="img" aria-label="Kiwi">🤖</div> : this.props.children; }
}

type UiCopy = {
  eyebrow: string;
  language: string;
  code: string;
  adult: string;
  disclosure: string;
  start: string;
  muted: string;
  mute: string;
  unmute: string;
  end: string;
  tip: string;
  status: Record<VoicePhase, string>;
  errors: {
    notConfigured: string;
    unauthorized: string;
    finished: string;
    permission: string;
    busy: string;
    generic: string;
  };
};

const COPY: Record<RealtimeLanguage, UiCopy> = {
  he: {
    eyebrow: 'הדגמת שיחה טבעית למבוגרים',
    language: 'שפת פתיחה',
    code: 'קוד כניסה להדגמה',
    adult: 'אני מבוגר/ת ובודק/ת את ההדגמה עם מידע מומצא בלבד. גרסה זו אינה מיועדת עדיין לשימוש עצמאי של ילדים.',
    disclosure: 'קיווי הוא דמות בינה מלאכותית. הקול יישלח ל־OpenAI לעיבוד. משך ההדגמה עד חמש דקות.',
    start: 'התחלת שיחה',
    muted: 'המיקרופון מושתק',
    mute: 'השתקת מיקרופון',
    unmute: 'הפעלת מיקרופון',
    end: 'סיום שיחה',
    tip: 'אפשר לדבר בשקט ובטבעיות, להחליף שפה ולקטוע את קיווי בזמן שהוא מדבר.',
    status: { idle: 'מוכן לשיחה', connecting: 'מתחבר…', listening: 'קיווי מקשיב', thinking: 'קיווי חושב…', speaking: 'קיווי מדבר — אפשר לקטוע אותו' },
    errors: {
      notConfigured: 'השיחה החיה עדיין לא הוגדרה בשרת.',
      unauthorized: 'קוד הכניסה אינו נכון.',
      finished: 'ההדגמה הסתיימה לאחר חמש דקות.',
      permission: 'יש לאפשר גישה למיקרופון ולנסות שוב.',
      busy: 'השירות עמוס כרגע. המתינו רגע ונסו שוב.',
      generic: 'החיבור הקולי לא הצליח. בדקו את המיקרופון והחיבור ונסו שוב.',
    },
  },
  ar: {
    eyebrow: 'تجربة محادثة طبيعية للبالغين',
    language: 'لغة البداية',
    code: 'رمز دخول العرض',
    adult: 'أنا بالغ وأختبر العرض باستخدام معلومات خيالية فقط. هذه النسخة ليست جاهزة بعد لاستخدام الأطفال بشكل مستقل.',
    disclosure: 'كيوي شخصية ذكاء اصطناعي. سيُرسل الصوت إلى OpenAI للمعالجة. مدة العرض حتى خمس دقائق.',
    start: 'ابدأ المحادثة',
    muted: 'الميكروفون مغلق',
    mute: 'كتم الميكروفون',
    unmute: 'تشغيل الميكروفون',
    end: 'إنهاء المحادثة',
    tip: 'تحدث بهدوء وبشكل طبيعي، بدّل اللغة أو قاطع كيوي أثناء حديثه.',
    status: { idle: 'جاهز للمحادثة', connecting: 'جارٍ الاتصال…', listening: 'كيوي يستمع', thinking: 'كيوي يفكّر…', speaking: 'كيوي يتحدث — يمكنك مقاطعته' },
    errors: {
      notConfigured: 'لم يتم إعداد المحادثة المباشرة بعد.',
      unauthorized: 'رمز الدخول غير صحيح.',
      finished: 'انتهت التجربة بعد خمس دقائق.',
      permission: 'اسمح بالميكروفون ثم حاول مجدداً.',
      busy: 'الخدمة مشغولة الآن. انتظر قليلاً ثم حاول مجدداً.',
      generic: 'تعذّر الاتصال الصوتي. تحقق من الميكروفون والاتصال ثم حاول مجدداً.',
    },
  },
  en: {
    eyebrow: 'Natural conversation demo for adults',
    language: 'Starting language',
    code: 'Demo access code',
    adult: 'I am an adult testing this demo with fictional information only. This version is not yet for independent use by children.',
    disclosure: 'Kiwi is an AI character. Audio is sent to OpenAI for processing. The demo lasts up to five minutes.',
    start: 'Start conversation',
    muted: 'Microphone muted',
    mute: 'Mute microphone',
    unmute: 'Turn microphone on',
    end: 'End conversation',
    tip: 'Speak quietly and naturally, switch languages, or interrupt Kiwi while it is talking.',
    status: { idle: 'Ready to talk', connecting: 'Connecting…', listening: 'Kiwi is listening', thinking: 'Kiwi is thinking…', speaking: 'Kiwi is speaking — you can interrupt' },
    errors: {
      notConfigured: 'Live conversation has not been configured on the server yet.',
      unauthorized: 'The access code is incorrect.',
      finished: 'The five-minute demo has ended.',
      permission: 'Allow microphone access and try again.',
      busy: 'The service is busy right now. Wait a moment and try again.',
      generic: 'The voice connection failed. Check the microphone and connection, then try again.',
    },
  },
  ru: {
    eyebrow: 'Демонстрация естественного разговора для взрослых',
    language: 'Язык начала',
    code: 'Код доступа к демонстрации',
    adult: 'Я взрослый пользователь и проверяю демонстрацию только с вымышленными данными. Эта версия пока не предназначена для самостоятельного использования детьми.',
    disclosure: 'Киви — персонаж с искусственным интеллектом. Аудио отправляется в OpenAI для обработки. Демонстрация длится до пяти минут.',
    start: 'Начать разговор',
    muted: 'Микрофон выключен',
    mute: 'Выключить микрофон',
    unmute: 'Включить микрофон',
    end: 'Завершить разговор',
    tip: 'Говорите тихо и естественно, меняйте язык или перебивайте Киви во время ответа.',
    status: { idle: 'Готов к разговору', connecting: 'Подключение…', listening: 'Киви слушает', thinking: 'Киви думает…', speaking: 'Киви говорит — его можно перебить' },
    errors: {
      notConfigured: 'Живой разговор ещё не настроен на сервере.',
      unauthorized: 'Неверный код доступа.',
      finished: 'Пятиминутная демонстрация завершена.',
      permission: 'Разрешите доступ к микрофону и попробуйте снова.',
      busy: 'Сервис сейчас занят. Подождите немного и попробуйте снова.',
      generic: 'Не удалось установить голосовое соединение. Проверьте микрофон и подключение.',
    },
  },
};

const LANGUAGE_OPTIONS: Array<{ value: RealtimeLanguage; label: string }> = [
  { value: 'he', label: 'עברית' },
  { value: 'ar', label: 'العربية' },
  { value: 'en', label: 'English' },
  { value: 'ru', label: 'Русский' },
];

export default function RealtimeConversation({ height = 420 }: { height?: number }) {
  const avatar = useRef<AvatarHandle>(null);
  const phaseRef = useRef<VoicePhase>('idle');
  const deliveryRef = useRef<Delivery>('calm');
  const call = useRef<KiwiRealtime | null>(null);
  const [lang, setLang] = useState<RealtimeLanguage>('he');
  const [phase, setPhase] = useState<VoicePhase>('idle');
  const [caption, setCaption] = useState('');
  const [error, setError] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [adult, setAdult] = useState(false);
  const [muted, setMuted] = useState(false);
  const copy = COPY[lang];
  const rtl = lang === 'he' || lang === 'ar';
  const active = phase !== 'idle';

  useEffect(() => () => { call.current?.stop(); }, []);

  const stop = () => {
    call.current?.stop();
    call.current = null;
    setCaption('');
    setMuted(false);
    avatar.current?.setConversation?.('idle');
  };

  const start = (event: React.FormEvent) => {
    event.preventDefault();
    if (call.current || !adult || !accessCode) return;
    setError('');
    setCaption('');
    setMuted(false);
    const session = new KiwiRealtime({
      phase: next => {
        setPhase(next);
        phaseRef.current = next;
        if (next !== 'speaking') deliveryRef.current = 'calm';
        avatar.current?.setConversation?.(next, deliveryRef.current);
        avatar.current?.setExpression(next === 'thinking' ? 'thinking' : 'happy');
        if (next === 'idle') call.current = null;
      },
      caption: text => {
        setCaption(text);
        deliveryRef.current = deliveryFromText(text);
        avatar.current?.setConversation?.(phaseRef.current, deliveryRef.current);
      },
      error: setError,
    });
    call.current = session;
    const code = accessCode;
    setAccessCode('');
    void session.start(code, lang, avatar.current?.getLiveAudioSink?.() || null);
  };

  const errorText = error === 'not_configured'
    ? copy.errors.notConfigured
    : error === 'unauthorized'
      ? copy.errors.unauthorized
      : error === 'demo_finished'
        ? copy.errors.finished
        : error === 'rate_limited' || error === 'temporarily_unavailable'
          ? copy.errors.busy
          : error === 'NotAllowedError' || /permission|denied/i.test(error)
            ? copy.errors.permission
            : copy.errors.generic;

  return <section dir={rtl ? 'rtl' : 'ltr'} className="w-full py-3 text-center sm:py-5">
    <div className="mx-auto grid w-full max-w-6xl items-center gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,.65fr)] lg:gap-7">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-indigo-800">{copy.eyebrow}</p>
        <AvatarBoundary>
          <Suspense fallback={<div style={{ height }} className="grid place-items-center text-7xl">🤖</div>}>
            <RobotAvatar expressive ref={avatar} height={height} interactive />
          </Suspense>
        </AvatarBoundary>
        <p role="status" className="min-h-7 font-bold text-indigo-800">{muted ? copy.muted : copy.status[phase]}</p>
        <p aria-live="polite" className="mx-auto min-h-12 max-w-2xl px-3 text-base text-slate-800 sm:text-lg">{caption}</p>
      </div>

      <div className="mx-auto w-full max-w-md">
        {error && <p role="alert" className="mb-3 rounded-2xl bg-amber-50 p-3 text-amber-900 shadow-sm">{errorText}</p>}
        {!active ? <form onSubmit={start} className="flex flex-col gap-3 rounded-3xl bg-white/85 p-4 text-start shadow-lg backdrop-blur-sm sm:p-6">
          <label className="font-semibold">{copy.language}
            <select
              value={lang}
              onChange={e => setLang(e.target.value as RealtimeLanguage)}
              className="mt-1 block min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 py-2"
            >
              {LANGUAGE_OPTIONS.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
          <label>{copy.code}
            <input type="password" autoComplete="off" required maxLength={200} value={accessCode} onChange={e => setAccessCode(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 p-3" />
          </label>
          <label className="flex items-start gap-2 text-sm">
            <input type="checkbox" checked={adult} onChange={e => setAdult(e.target.checked)} required className="mt-1 h-4 w-4 shrink-0" />
            <span>{copy.adult}</span>
          </label>
          <p className="text-xs text-slate-600">{copy.disclosure}</p>
          <button disabled={!adult || !accessCode} className="min-h-12 rounded-full bg-indigo-700 px-5 py-3 font-bold text-white disabled:opacity-40">{copy.start}</button>
        </form> : <div className="rounded-3xl bg-white/75 p-4 shadow-md backdrop-blur-sm sm:p-5">
          <p className="mb-4 text-sm text-slate-700">{copy.tip}</p>
          <div className="flex flex-wrap justify-center gap-3">
            <button disabled={phase === 'connecting'} onClick={() => { call.current?.setMuted(!muted); setMuted(!muted); }} className="min-h-12 rounded-full border border-indigo-300 bg-white px-5 disabled:opacity-40">{muted ? copy.unmute : copy.mute}</button>
            <button onClick={stop} className="min-h-12 rounded-full bg-rose-700 px-5 font-bold text-white">{copy.end}</button>
          </div>
        </div>}
      </div>
    </div>
  </section>;
}
