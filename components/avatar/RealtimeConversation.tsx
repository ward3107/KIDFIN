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
  disclosure: string;
  start: string;
  suggestions: string;
  muted: string;
  mute: string;
  unmute: string;
  end: string;
  tip: string;
  status: Record<VoicePhase, string>;
  errors: {
    notConfigured: string;
    finished: string;
    permission: string;
    busy: string;
    generic: string;
  };
};

const COPY: Record<RealtimeLanguage, UiCopy> = {
  he: {
    eyebrow: 'שיחה חופשית עם קיווי',
    disclosure: 'קיווי הוא דמות בינה מלאכותית. הקול יישלח ל־OpenAI לעיבוד. משך ההדגמה עד חמש דקות.',
    start: 'התחלת שיחה',
    suggestions: 'אפשר לענות בקול או לבחור:',
    muted: 'המיקרופון מושתק',
    mute: 'השתקת מיקרופון',
    unmute: 'הפעלת מיקרופון',
    end: 'סיום שיחה',
    tip: 'אפשר לדבר בשקט ובטבעיות ולהחליף שפה. אפשר לדבר גם כשקיווי מדברת — היא תעצור ותקשיב.',
    status: { idle: 'מוכן לשיחה', connecting: 'מתחבר…', listening: 'קיווי מקשיב', thinking: 'קיווי חושב…', speaking: 'קיווי מדבר' },
    errors: {
      notConfigured: 'השיחה החיה עדיין לא הוגדרה בשרת.',
      finished: 'ההדגמה הסתיימה לאחר חמש דקות.',
      permission: 'יש לאפשר גישה למיקרופון ולנסות שוב.',
      busy: 'השירות עמוס כרגע. המתינו רגע ונסו שוב.',
      generic: 'החיבור הקולי לא הצליח. בדקו את המיקרופון והחיבור ונסו שוב.',
    },
  },
  ar: {
    eyebrow: 'محادثة حرة مع كيوي',
    disclosure: 'كيوي شخصية ذكاء اصطناعي. سيُرسل الصوت إلى OpenAI للمعالجة. مدة العرض حتى خمس دقائق.',
    start: 'ابدأ المحادثة',
    suggestions: 'أجب بصوتك أو اختر:',
    muted: 'الميكروفون مغلق',
    mute: 'كتم الميكروفون',
    unmute: 'تشغيل الميكروفون',
    end: 'إنهاء المحادثة',
    tip: 'تحدث بهدوء وبشكل طبيعي وبدّل اللغة متى شئت. يمكنك التحدث أثناء كلام كيوي — ستتوقف وتستمع.',
    status: { idle: 'جاهز للمحادثة', connecting: 'جارٍ الاتصال…', listening: 'كيوي يستمع', thinking: 'كيوي يفكّر…', speaking: 'كيوي يتحدث' },
    errors: {
      notConfigured: 'لم يتم إعداد المحادثة المباشرة بعد.',
      finished: 'انتهت التجربة بعد خمس دقائق.',
      permission: 'اسمح بالميكروفون ثم حاول مجدداً.',
      busy: 'الخدمة مشغولة الآن. انتظر قليلاً ثم حاول مجدداً.',
      generic: 'تعذّر الاتصال الصوتي. تحقق من الميكروفون والاتصال ثم حاول مجدداً.',
    },
  },
  en: {
    eyebrow: 'Free conversation with Kiwi',
    disclosure: 'Kiwi is an AI character. Audio is sent to OpenAI for processing. The demo lasts up to five minutes.',
    start: 'Start conversation',
    suggestions: 'Answer aloud or choose:',
    muted: 'Microphone muted',
    mute: 'Mute microphone',
    unmute: 'Turn microphone on',
    end: 'End conversation',
    tip: 'Speak quietly and naturally, and switch languages whenever you like. You can talk while Kiwi is speaking—she will stop and listen.',
    status: { idle: 'Ready to talk', connecting: 'Connecting…', listening: 'Kiwi is listening', thinking: 'Kiwi is thinking…', speaking: 'Kiwi is speaking' },
    errors: {
      notConfigured: 'Live conversation has not been configured on the server yet.',
      finished: 'The five-minute demo has ended.',
      permission: 'Allow microphone access and try again.',
      busy: 'The service is busy right now. Wait a moment and try again.',
      generic: 'The voice connection failed. Check the microphone and connection, then try again.',
    },
  },
  ru: {
    eyebrow: 'Свободный разговор с Киви',
    disclosure: 'Киви — персонаж с искусственным интеллектом. Аудио отправляется в OpenAI для обработки. Демонстрация длится до пяти минут.',
    start: 'Начать разговор',
    suggestions: 'Ответьте голосом или выберите:',
    muted: 'Микрофон выключен',
    mute: 'Выключить микрофон',
    unmute: 'Включить микрофон',
    end: 'Завершить разговор',
    tip: 'Говорите тихо и естественно и меняйте язык когда захотите. Можно заговорить, пока Киви говорит — она остановится и выслушает.',
    status: { idle: 'Готов к разговору', connecting: 'Подключение…', listening: 'Киви слушает', thinking: 'Киви думает…', speaking: 'Киви говорит' },
    errors: {
      notConfigured: 'Живой разговор ещё не настроен на сервере.',
      finished: 'Пятиминутная демонстрация завершена.',
      permission: 'Разрешите доступ к микрофону и попробуйте снова.',
      busy: 'Сервис сейчас занят. Подождите немного и попробуйте снова.',
      generic: 'Не удалось установить голосовое соединение. Проверьте микрофон и подключение.',
    },
  },
};

const LANGUAGE_KEY = 'kiwi:realtime-language:v1';

const initialLanguage = (): RealtimeLanguage => {
  if (typeof window === 'undefined') return 'he';
  try {
    const saved = window.localStorage.getItem(LANGUAGE_KEY);
    if (saved === 'he' || saved === 'ar' || saved === 'en' || saved === 'ru') return saved;
  } catch {
    // Storage can be unavailable in strict privacy modes; browser language is enough.
  }
  // Hebrew by default (many Israeli phones are set to English); Arabic and
  // Russian phones get their own language. Kiwi still follows whatever
  // language the speaker actually uses, English included.
  const browser = (navigator.languages?.[0] || navigator.language || '').toLowerCase();
  if (browser.startsWith('ar')) return 'ar';
  if (browser.startsWith('ru')) return 'ru';
  return 'he';
};

export default function RealtimeConversation({ height = 420 }: { height?: number }) {
  const avatar = useRef<AvatarHandle>(null);
  const phaseRef = useRef<VoicePhase>('idle');
  const deliveryRef = useRef<Delivery>('calm');
  const call = useRef<KiwiRealtime | null>(null);
  // Kiwi opens in the browser's language and follows whatever language the
  // speaker switches to, so there is no language picker.
  const [lang] = useState<RealtimeLanguage>(initialLanguage);
  const [phase, setPhase] = useState<VoicePhase>('idle');
  const [caption, setCaption] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [muted, setMuted] = useState(false);
  const copy = COPY[lang];
  const rtl = lang === 'he' || lang === 'ar';
  const active = phase !== 'idle';

  useEffect(() => () => call.current?.stop(), []);

  const stop = () => {
    call.current?.stop();
    call.current = null;
    setCaption('');
    setSuggestions([]);
    setMuted(false);
    avatar.current?.setConversation?.('idle');
  };

  const start = () => {
    if (call.current) return;
    setError('');
    setCaption('');
    setSuggestions([]);
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
      options: setSuggestions,
      error: setError,
    });
    call.current = session;
    void session.start(lang, avatar.current?.getLiveAudioSink?.() || null);
  };

  const chooseSuggestion = (suggestion: string) => {
    if (call.current?.sendText(suggestion)) setSuggestions([]);
  };

  const errorText = error === 'not_configured'
    ? copy.errors.notConfigured
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
        {active && suggestions.length > 0 && <div className="mx-auto mt-2 max-w-2xl px-3" aria-label={copy.suggestions}>
          <p className="mb-2 text-sm font-semibold text-indigo-800">{copy.suggestions}</p>
          <div className="flex flex-wrap justify-center gap-2">
            {suggestions.map((suggestion, index) => <button
              key={`${index}-${suggestion}`}
              type="button"
              disabled={phase !== 'listening'}
              onClick={() => chooseSuggestion(suggestion)}
              className="min-h-12 rounded-full border-2 border-indigo-300 bg-white px-5 py-2.5 font-semibold text-indigo-900 shadow-sm transition hover:border-indigo-500 hover:bg-indigo-50 disabled:cursor-wait disabled:opacity-50"
            >{suggestion}</button>)}
          </div>
        </div>}
      </div>

      <div className="mx-auto w-full max-w-md">
        {error && <p role="alert" className="mb-3 rounded-2xl bg-amber-50 p-3 text-amber-900 shadow-sm">{errorText}</p>}
        {!active ? <div className="rounded-3xl bg-white/80 p-4 shadow-md backdrop-blur-sm sm:p-5">
          <button type="button" onClick={start} className="min-h-14 w-full rounded-full bg-indigo-700 px-5 py-3 text-lg font-bold text-white shadow-sm hover:bg-indigo-800">{copy.start}</button>
          <p className="mt-3 text-xs text-slate-600">{copy.disclosure}</p>
        </div> : <div className="rounded-3xl bg-white/75 p-4 shadow-md backdrop-blur-sm sm:p-5">
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
