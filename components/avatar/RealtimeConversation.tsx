import React, { Suspense, useEffect, useRef, useState } from 'react';
import { Mic, MicOff, PhoneOff } from 'lucide-react';
import { ReplyIllustration } from './ReplyIllustration';
import type { ReplyOption } from '../../services/live/replyOptions';
import './realtimeRoom.css';
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
  render() { return this.state.failed ? <div className="kiwi-avatar-fallback" role="img" aria-label="Kiwi">🤖</div> : this.props.children; }
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
    budgetNotConfigured: string;
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
    tip: 'אפשר לדבר לאט, לעצור באמצע ולהחליף שפה. קול קטן או צחוק לא יעצרו את קיווי; כשמתחילים לדבר באמת, היא תעצור ותקשיב.',
    status: { idle: 'מוכן לשיחה', connecting: 'מתחבר…', listening: 'קיווי מקשיב', thinking: 'קיווי חושב…', speaking: 'קיווי מדבר' },
    errors: {
      notConfigured: 'השיחה החיה עדיין לא הוגדרה בשרת.',
      budgetNotConfigured: 'מכסת השיחות עדיין לא הופעלה. מנהל האתר צריך להגדיר אותה כדי שקיווי יוכל לדבר.',
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
    tip: 'احكي على راحتك وخذ وقتك وبدّل اللغة إذا بدك. صوت صغير أو ضحكة ما بوقفوا كيوي؛ لما تبدأ تحكي فعلاً بتوقف وبتسمع.',
    status: { idle: 'جاهز للمحادثة', connecting: 'جارٍ الاتصال…', listening: 'كيوي يستمع', thinking: 'كيوي يفكّر…', speaking: 'كيوي يتحدث' },
    errors: {
      notConfigured: 'لم يتم إعداد المحادثة المباشرة بعد.',
      budgetNotConfigured: 'لم يتم تفعيل حصة المحادثات بعد. على مسؤول الموقع إعدادها حتى يتمكن كيوي من التحدث.',
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
    tip: 'Take your time, pause mid-sentence, and switch languages freely. A tiny sound or laugh will not stop Kiwi; sustained speech will.',
    status: { idle: 'Ready to talk', connecting: 'Connecting…', listening: 'Kiwi is listening', thinking: 'Kiwi is thinking…', speaking: 'Kiwi is speaking' },
    errors: {
      notConfigured: 'Live conversation has not been configured on the server yet.',
      budgetNotConfigured: 'The call allowance has not been activated yet. The site administrator needs to configure it before Kiwi can talk.',
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
    tip: 'Говорите не спеша, делайте паузы и свободно меняйте язык. Короткий звук или смех не остановит Киви; настоящая речь остановит.',
    status: { idle: 'Готов к разговору', connecting: 'Подключение…', listening: 'Киви слушает', thinking: 'Киви думает…', speaking: 'Киви говорит' },
    errors: {
      notConfigured: 'Живой разговор ещё не настроен на сервере.',
      budgetNotConfigured: 'Лимит разговоров ещё не настроен. Администратору сайта нужно настроить его, чтобы Киви мог говорить.',
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

export default function RealtimeConversation() {
  const avatar = useRef<AvatarHandle>(null);
  const phaseRef = useRef<VoicePhase>('idle');
  const deliveryRef = useRef<Delivery>('calm');
  const call = useRef<KiwiRealtime | null>(null);
  // Kiwi opens in the browser's language and follows whatever language the
  // speaker switches to, so there is no language picker.
  const [lang] = useState<RealtimeLanguage>(initialLanguage);
  const [phase, setPhase] = useState<VoicePhase>('idle');
  const [caption, setCaption] = useState('');
  const [suggestions, setSuggestions] = useState<ReplyOption[]>([]);
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
    : error === 'budget_not_configured'
      ? copy.errors.budgetNotConfigured
    : error === 'demo_finished'
      ? copy.errors.finished
      : error === 'rate_limited' || error === 'temporarily_unavailable'
        ? copy.errors.busy
        : error === 'NotAllowedError' || /permission|denied/i.test(error)
          ? copy.errors.permission
          : copy.errors.generic;

  const hasChoices = active && suggestions.length > 0;
  return <section dir={rtl ? 'rtl' : 'ltr'} className="kiwi-room" data-active={active} data-choices={hasChoices}>
    <header className="kiwi-room-header">
      <p>{copy.eyebrow}</p>
      <p role="status" className="kiwi-status" data-phase={muted ? 'muted' : phase}>
        <span aria-hidden="true" />{muted ? copy.muted : copy.status[phase]}
      </p>
    </header>
    <div className="kiwi-room-body">
      <div className="kiwi-stage">
        <div className="kiwi-avatar-space">
          <AvatarBoundary>
            <Suspense fallback={<div className="kiwi-avatar-fallback" aria-hidden="true">🤖</div>}>
              <RobotAvatar expressive ref={avatar} height="100%" interactive />
            </Suspense>
          </AvatarBoundary>
        </div>
        <p aria-live="polite" className="kiwi-caption" dir="auto" title={caption}>{caption}</p>
      </div>
      <aside className="kiwi-choice-space" aria-label={hasChoices ? copy.suggestions : copy.eyebrow}>
        {hasChoices ? <>
          <p className="kiwi-choice-heading">{copy.suggestions}</p>
          <div className="kiwi-choices">
            {suggestions.map(suggestion => <button
              key={suggestion.label} type="button" className="kiwi-choice" aria-label={suggestion.label} title={suggestion.label}
              disabled={phase !== 'listening'} onClick={() => chooseSuggestion(suggestion.label)}
            >
              <ReplyIllustration picture={suggestion.picture} />
              <span dir="auto">{suggestion.label}</span>
            </button>)}
          </div>
        </> : !active ? <div className="kiwi-start-panel">
          {error && <p role="alert" className="kiwi-error">{errorText}</p>}
          <button type="button" onClick={start} className="kiwi-start"><Mic aria-hidden="true" size={22} />{copy.start}</button>
          <p className="kiwi-disclosure">{copy.disclosure}</p>
        </div> : <p className="kiwi-talk-hint"><Mic aria-hidden="true" size={28} />{copy.tip}</p>}
      </aside>
    </div>
    <footer className="kiwi-controls">
      {active && <>
        <button type="button" disabled={phase === 'connecting'} aria-label={muted ? copy.unmute : copy.mute}
          title={muted ? copy.unmute : copy.mute} aria-pressed={muted} className="kiwi-mic-control"
          onClick={() => { call.current?.setMuted(!muted); setMuted(!muted); }}>
          {muted ? <MicOff aria-hidden="true" size={21} /> : <Mic aria-hidden="true" size={21} />}
        </button>
        <button type="button" onClick={stop} className="kiwi-end-control"><PhoneOff aria-hidden="true" size={18} />{copy.end}</button>
      </>}
    </footer>
  </section>;
}
