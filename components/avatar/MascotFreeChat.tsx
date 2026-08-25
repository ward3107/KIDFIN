import React, { Suspense, useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Mic, Send, Sparkles } from 'lucide-react';
import type { AvatarHandle } from './avatarTypes';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import { aiChat, type ChatTurn } from '../../services/dialogue/aiChat';
import type { Lang } from '../../services/dialogue/conversation';

const RobotAvatar = React.lazy(() =>
  import('./RobotAvatar').then((m) => ({ default: m.RobotAvatar })),
);

/**
 * Free-chat mode: the child can ask the robot ANYTHING (by voice or text) and
 * an LLM (Claude, via the /api/chat backend) replies with real understanding.
 * Kid-safe guardrails live server-side. Replies are spoken with the browser
 * voice for now (natural TTS for dynamic replies is a later upgrade). Falls
 * back to a friendly notice when the AI backend isn't configured yet.
 */
export const MascotFreeChat: React.FC<{ height?: number; childName?: string }> = ({
  height = 300,
  childName,
}) => {
  const { i18n } = useTranslation();
  const lang: Lang = (i18n.language || 'he').startsWith('ar') ? 'ar' : 'he';
  const ar = lang === 'ar';

  const avatar = useRef<AvatarHandle>(null);
  const [started, setStarted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [caption, setCaption] = useState('');
  const [childSaid, setChildSaid] = useState('');
  const [typed, setTyped] = useState('');
  const [unavailable, setUnavailable] = useState(false);
  const historyRef = useRef<ChatTurn[]>([]);

  const speak = useCallback((text: string) => {
    setCaption(text);
    avatar.current?.setExpression('happy');
    avatar.current?.speak(text, {
      lang: ar ? 'ar' : 'he-IL',
      expression: 'happy',
      onDone: () => avatar.current?.setExpression('neutral'),
    });
  }, [ar]);

  const send = useCallback(
    async (text: string) => {
      const msg = text.trim();
      if (!msg || busy) return;
      setChildSaid(msg);
      setBusy(true);
      avatar.current?.setExpression('thinking');
      const res = await aiChat(msg, historyRef.current, lang);
      setBusy(false);
      if (res.unavailable) {
        setUnavailable(true);
        speak(
          ar
            ? 'أنا لست جاهزًا للدردشة الحرة بعد. لنكمل الدرس معًا!'
            : 'אני עוד לא מוכן לשיחה חופשית. בוא נמשיך בשיעור ביחד!',
        );
        return;
      }
      const next: ChatTurn[] = [
        ...historyRef.current,
        { role: 'user', text: msg },
        { role: 'model', text: res.reply },
      ];
      historyRef.current = next.slice(-12);
      speak(res.reply);
    },
    [busy, lang, ar, speak],
  );

  const recognition = useSpeechRecognition((text) => send(text));

  const begin = () => {
    setStarted(true);
    const hi = childName
      ? ar
        ? `مرحبا ${childName}! اسألني أي شيء أو أخبرني كيف تشعر.`
        : `שלום ${childName}! שאל אותי כל דבר או ספר לי איך אתה מרגיש.`
      : ar
        ? 'مرحبا! اسألني أي شيء أو أخبرني كيف تشعر.'
        : 'שלום! שאל אותי כל דבר או ספר לי איך אתה מרגיש.';
    avatar.current?.playGesture('wave');
    speak(hi);
  };

  const submitTyped = (e: React.FormEvent) => {
    e.preventDefault();
    const t = typed.trim();
    if (!t) return;
    setTyped('');
    send(t);
  };

  return (
    <div className="rounded-3xl border-2 border-indigo-100 bg-gradient-to-b from-indigo-50 to-white p-3 md:p-4 shadow-sm">
      <div className="overflow-hidden rounded-2xl bg-white/60">
        <Suspense
          fallback={
            <div style={{ height }} className="flex items-center justify-center text-4xl animate-pulse">
              🤖
            </div>
          }
        >
          <RobotAvatar ref={avatar} height={height} interactive={false} />
        </Suspense>
      </div>

      <div className="mt-3 min-h-[3.5rem] rounded-2xl bg-white px-3 py-2 text-center text-sm md:text-base font-medium text-slate-700 shadow-sm ring-1 ring-indigo-100">
        {caption || (ar ? 'اضغط لتبدأ محادثة حرة مع كيوي! 👇' : 'לחץ כדי להתחיל שיחה חופשית עם קיווי! 👇')}
      </div>

      {childSaid && (
        <div className="mt-2 text-center text-xs text-indigo-500">
          {ar ? 'قلت:' : 'אמרת:'} “{childSaid}”
        </div>
      )}

      <div className="mt-3 flex flex-col items-center gap-2">
        {!started && (
          <button
            onClick={begin}
            className="flex items-center gap-2 rounded-2xl bg-indigo-600 px-6 py-3 text-base font-bold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 active:scale-95"
          >
            <Sparkles size={20} /> {ar ? 'محادثة حرة' : 'שיחה חופשית'}
          </button>
        )}

        {started && busy && (
          <div className="text-sm text-indigo-500">💭 {ar ? 'كيوي يفكر…' : 'קיווי חושב…'}</div>
        )}

        {started && !busy && (
          <div className="flex w-full max-w-xs flex-col items-center gap-2">
            {recognition.supported && (
              <button
                onClick={() => recognition.start()}
                disabled={recognition.listening}
                className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-white shadow-lg transition ${
                  recognition.listening ? 'bg-rose-500 animate-pulse' : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                <Mic size={18} />
                {recognition.listening
                  ? ar ? 'أنا أستمع… تكلم!' : 'אני מקשיב… דבר!'
                  : ar ? 'تكلم معي' : 'דבר איתי'}
              </button>
            )}
            <form onSubmit={submitTyped} className="flex w-full items-center gap-2">
              <input
                type="text"
                value={typed}
                onChange={(e) => setTyped(e.target.value)}
                placeholder={ar ? 'أو اكتب سؤالك…' : 'או כתוב שאלה…'}
                dir="rtl"
                className="flex-1 rounded-2xl border-2 border-indigo-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-indigo-400"
              />
              <button
                type="submit"
                aria-label={ar ? 'إرسال' : 'שליחה'}
                className="rounded-2xl bg-indigo-600 p-2.5 text-white shadow transition hover:bg-indigo-700 active:scale-95"
              >
                <Send size={16} />
              </button>
            </form>
          </div>
        )}

        {unavailable && (
          <p className="mt-1 text-center text-xs text-amber-700">
            {ar
              ? 'الدردشة بالذكاء الاصطناعي غير مُفعّلة بعد (يلزم مفتاح ذكاء اصطناعي).'
              : 'שיחת ה-AI עדיין לא מופעלת (נדרש מפתח AI).'}
          </p>
        )}
      </div>
    </div>
  );
};

export default MascotFreeChat;
