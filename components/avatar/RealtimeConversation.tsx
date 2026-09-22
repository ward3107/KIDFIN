import React, { Suspense, useEffect, useRef, useState } from 'react';
import type { AvatarHandle } from './avatarTypes';
import { deliveryFromText, type Delivery } from './conversationMotion';
import { KiwiRealtime, type VoicePhase } from '../../services/live/realtimeClient';

const RobotAvatar = React.lazy(() => import('./RobotAvatar').then(m => ({ default: m.RobotAvatar })));

class AvatarBoundary extends React.Component<{ children: React.ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? <div className="flex h-72 items-center justify-center text-9xl" role="img" aria-label="Kiwi">🤖</div> : this.props.children; }
}

export default function RealtimeConversation({ height = 420 }: { height?: number }) {
  const avatar = useRef<AvatarHandle>(null);
  const phaseRef = useRef<VoicePhase>('idle');
  const deliveryRef = useRef<Delivery>('calm');
  const previewTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const call = useRef<KiwiRealtime | null>(null);
  const [lang, setLang] = useState<'he' | 'ar'>('he');
  const [phase, setPhase] = useState<VoicePhase>('idle');
  const [caption, setCaption] = useState('');
  const [error, setError] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [adult, setAdult] = useState(false);
  const [muted, setMuted] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const ar = lang === 'ar';
  const active = phase !== 'idle';

  useEffect(() => () => {
    call.current?.stop();
    if (previewTimer.current) clearTimeout(previewTimer.current);
  }, []);

  const preview = (delivery: Delivery, nextPhase: VoicePhase) => {
    if (previewTimer.current) clearTimeout(previewTimer.current);
    setPreviewing(true);
    avatar.current?.setConversation?.(nextPhase, delivery);
    previewTimer.current = setTimeout(() => {
      avatar.current?.setConversation?.('idle');
      setPreviewing(false);
    }, 4500);
  };

  const stop = () => {
    call.current?.stop(); call.current = null;
    setCaption(''); setMuted(false);
    avatar.current?.setConversation?.('idle');
  };

  const start = (event: React.FormEvent) => {
    event.preventDefault();
    if (call.current || !adult || !accessCode) return;
    if (previewTimer.current) clearTimeout(previewTimer.current);
    setPreviewing(false);
    setError(''); setCaption(''); setMuted(false);
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
    ? (ar ? 'لم يتم إعداد المحادثة المباشرة بعد.' : 'השיחה החיה עדיין לא הוגדרה בשרת.')
    : error === 'unauthorized'
      ? (ar ? 'رمز الدخول غير صحيح.' : 'קוד הכניסה אינו נכון.')
      : error === 'demo_finished'
        ? (ar ? 'انتهت التجربة بعد خمس دقائق.' : 'ההדגמה הסתיימה לאחר חמש דקות.')
        : error === 'NotAllowedError' || /permission|denied/i.test(error)
          ? (ar ? 'اسمح بالميكروفون ثم حاول مجدداً.' : 'יש לאפשר גישה למיקרופון ולנסות שוב.')
          : (ar ? 'تعذّر الاتصال الصوتي. تحقق من الميكروفون والاتصال ثم حاول مجدداً.' : 'החיבור הקולי לא הצליח. בדקו את המיקרופון והחיבור ונסו שוב.');
  const labels = ar
    ? { idle: 'جاهز للمحادثة', connecting: 'جارٍ الاتصال…', listening: 'كيوي يستمع', thinking: 'كيوي يفكّر…', speaking: 'كيوي يتحدث — يمكنك مقاطعته' }
    : { idle: 'מוכן לשיחה', connecting: 'מתחבר…', listening: 'קיווי מקשיב', thinking: 'קיווי חושב…', speaking: 'קיווי מדבר — אפשר לקטוע אותו' };

  return <section dir="rtl" className="py-10 text-center">
    <p className="text-sm font-semibold text-indigo-800">{ar ? 'تجربة محادثة طبيعية للبالغين' : 'הדגמת שיחה טבעית למבוגרים'}</p>
    <AvatarBoundary><Suspense fallback={<div style={{ height }} className="grid place-items-center text-7xl">🤖</div>}>
      <RobotAvatar expressive ref={avatar} height={height} interactive={false} />
    </Suspense></AvatarBoundary>
    <p role="status" className="min-h-8 font-bold text-indigo-800">{muted ? (ar ? 'الميكروفون مغلق' : 'המיקרופון מושתק') : labels[phase]}</p>
    <p className="min-h-16 px-3 text-lg text-slate-800">{caption}</p>
    {error && <p role="alert" className="my-3 rounded-xl bg-amber-50 p-3 text-amber-900">{errorText}</p>}
    {!active && <div className="my-4 rounded-xl bg-slate-50 p-3">
      <p className="mb-2 text-sm">{ar ? 'معاينة الحركة بدون صوت' : 'תצוגת תנועה ללא קול'}</p>
      <div className="flex flex-wrap justify-center gap-2">
        <button type="button" onClick={() => preview('calm', 'listening')} className="min-h-11 rounded-lg border bg-white px-3">{ar ? 'استماع' : 'הקשבה'}</button>
        <button type="button" onClick={() => preview('explain', 'speaking')} className="min-h-11 rounded-lg border bg-white px-3">{ar ? 'شرح' : 'הסבר'}</button>
        <button type="button" onClick={() => preview('question', 'speaking')} className="min-h-11 rounded-lg border bg-white px-3">{ar ? 'سؤال' : 'שאלה'}</button>
        <button type="button" onClick={() => preview('celebrate', 'speaking')} className="min-h-11 rounded-lg border bg-white px-3">{ar ? 'تشجيع' : 'עידוד'}</button>
      </div>
      {previewing && <p role="status" className="mt-2 text-sm">{ar ? 'معاينة قصيرة — بدون ميكروفون' : 'הדגמה קצרה — ללא מיקרופון'}</p>}
    </div>}
    {!active ? <form onSubmit={start} className="flex flex-col gap-3 rounded-2xl bg-white/80 p-5 text-right shadow-sm">
      <label className="font-semibold">{ar ? 'لغة البداية' : 'שפת פתיחה'}
        <select value={lang} onChange={e => setLang(e.target.value as 'he' | 'ar')} className="mx-3 rounded-lg border p-2">
          <option value="he">עברית</option><option value="ar">العربية</option>
        </select>
      </label>
      <label>{ar ? 'رمز دخول العرض' : 'קוד כניסה להדגמה'}
        <input type="password" autoComplete="off" required maxLength={200} value={accessCode} onChange={e => setAccessCode(e.target.value)} className="mt-1 w-full rounded-lg border p-3" />
      </label>
      <label className="flex items-start gap-2 text-sm"><input type="checkbox" checked={adult} onChange={e => setAdult(e.target.checked)} required className="mt-1" />
        {ar ? 'أنا بالغ وأختبر العرض باستخدام معلومات خيالية فقط. هذه النسخة ليست للاستخدام من قبل الأطفال.' : 'אני מבוגר/ת ובודק/ת את ההדגמה עם מידע מומצא בלבד. גרסה זו אינה מיועדת לשימוש ילדים.'}
      </label>
      <p className="text-xs text-slate-600">{ar ? 'كيوي شخصية ذكاء اصطناعي. سيُرسل الصوت إلى OpenAI للمعالجة. مدة العرض حتى خمس دقائق.' : 'קיווי הוא דמות בינה מלאכותית. הקול יישלח ל־OpenAI לעיבוד. משך ההדגמה עד חמש דקות.'}</p>
      <button disabled={!adult || !accessCode} className="min-h-12 rounded-full bg-indigo-700 px-5 py-3 font-bold text-white disabled:opacity-40">{ar ? 'ابدأ المحادثة' : 'התחלת שיחה'}</button>
    </form> : <div className="flex justify-center gap-3">
      <button disabled={phase === 'connecting'} onClick={() => { call.current?.setMuted(!muted); setMuted(!muted); }} className="min-h-12 rounded-full border border-indigo-300 bg-white px-5 disabled:opacity-40">{muted ? (ar ? 'تشغيل الميكروفون' : 'הפעלת מיקרופון') : (ar ? 'كتم الميكروفون' : 'השתקת מיקרופון')}</button>
      <button onClick={stop} className="min-h-12 rounded-full bg-rose-700 px-5 font-bold text-white">{ar ? 'إنهاء' : 'סיום שיחה'}</button>
    </div>}
  </section>;
}
