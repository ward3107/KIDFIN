import React, { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Mic, MicOff, Send } from 'lucide-react';
import type { AvatarHandle } from './avatarTypes';
import type { Lang } from '../../services/dialogue/conversation';
import type { TalkRecorder, TurnHistory } from '../../services/live/turnClient';
import { MAX_TURN_SECONDS } from '../../services/live/turnLimits';

// Lazy-load the 3D avatar so three.js stays code-split.
const RobotAvatar = React.lazy(() =>
  import('./RobotAvatar').then((m) => ({ default: m.RobotAvatar })),
);

type Phase = 'idle' | 'greeting' | 'ready' | 'recording' | 'thinking' | 'speaking';

const FATAL = new Set(['not_configured', 'budget_not_configured', 'temporarily_unavailable', 'rate_limited', 'bad_key', 'upstream', 'too_large', 'bad_request', 'network', 'turn_failed', 'greeting_failed', 'no_audio']);

/**
 * Kiwi voice — Route B. An adult taps to record, taps to send, and Gemini
 * transcribes and replies. Falls back to scripted mode if unavailable.
 */
export const TalkConversation: React.FC<{
  height?: number;
  bare?: boolean;
  onFallback?: (reason: string) => void;
}> = ({ height = 300, bare = false, onFallback }) => {
  const { i18n } = useTranslation();
  const lang: Lang = (i18n.language || 'he').startsWith('ar') ? 'ar' : 'he';
  const speechLang = lang === 'ar' ? 'ar' : 'he-IL';

  const avatar = useRef<AvatarHandle>(null);
  const recorder = useRef<TalkRecorder | null>(null);
  const mounted = useRef(true);
  const recordingTimer = useRef<number | null>(null);
  const history = useRef<TurnHistory[]>([]);
  const startedRef = useRef(false);

  const [phase, setPhase] = useState<Phase>('idle');
  const [awaitingTap, setAwaitingTap] = useState(true);
  const [kiwiText, setKiwiText] = useState('');
  const [heard, setHeard] = useState('');
  const [micDenied, setMicDenied] = useState(false);

  const speak = useCallback(
    (text: string) => {
      setKiwiText(text);
      setPhase('speaking');
      const a = avatar.current;
      if (!a) {
        setPhase('ready');
        return;
      }
      a.speak(text, {
        lang: speechLang,
        expression: 'happy',
        onDone: () => setPhase('ready'),
      });
    },
    [speechLang],
  );

  const start = useCallback(async () => {
    if (startedRef.current) return;
    startedRef.current = true;
    setAwaitingTap(false);
    setMicDenied(false);

    const { TalkRecorder, postKiwiGreeting, checkKiwiTurnReady } = await import('../../services/live/turnClient');
    try {
      await checkKiwiTurnReady();
    } catch {
      if (mounted.current) onFallback?.('not_configured');
      return;
    }
    if (!mounted.current) return;
    const rec = new TalkRecorder();
    recorder.current = rec;
    try {
      await rec.init();
    } catch {
      rec.dispose();
      if (!mounted.current || recorder.current !== rec) return;
      setMicDenied(true);
      // Mic is required for the voice chat; drop to scripted so the app still works.
      onFallback?.('mic_denied');
      return;
    }
    if (!mounted.current || recorder.current !== rec) { rec.dispose(); return; }
    setPhase('greeting');
    try {
      const reply = await postKiwiGreeting(lang);
      if (!mounted.current) return;
      history.current.push({ role: 'model', text: reply });
      speak(reply);
    } catch (e) {
      if (!mounted.current) return;
      const code = e instanceof Error ? e.message : 'greeting_failed';
      if (FATAL.has(code)) onFallback?.(code);
      else setPhase('ready');
    }
  }, [lang, onFallback, speak]);

  useEffect(
    () => {
      mounted.current = true;
      return () => {
        mounted.current = false;
        if (recordingTimer.current !== null) window.clearTimeout(recordingTimer.current);
        recorder.current?.dispose();
        recorder.current = null;
      };
    },
    [],
  );

  const onTalk = () => {
    const rec = recorder.current;
    if (!rec) return;
    avatar.current?.stopSpeaking();
    rec.start();
    recordingTimer.current = window.setTimeout(() => void onSend(), MAX_TURN_SECONDS * 1000);
    setHeard('');
    setPhase('recording');
  };

  const onSend = async () => {
    if (recordingTimer.current !== null) {
      window.clearTimeout(recordingTimer.current);
      recordingTimer.current = null;
    }
    const rec = recorder.current;
    if (!rec) return;
    const secs = rec.seconds;
    const audio = rec.stop();
    if (secs < 0.35 || !audio) {
      setPhase('ready'); // accidental tap — nothing captured
      return;
    }
    setPhase('thinking');
    try {
      const { postKiwiTurn } = await import('../../services/live/turnClient');
      const res = await postKiwiTurn(audio, history.current, lang);
      if (res.heard) {
        setHeard(res.heard);
        history.current.push({ role: 'user', text: res.heard });
      }
      history.current.push({ role: 'model', text: res.reply });
      if (history.current.length > 16) history.current = history.current.slice(-16);
      speak(res.reply);
    } catch (e) {
      const code = e instanceof Error ? e.message : 'turn_failed';
      if (FATAL.has(code)) onFallback?.(code);
      else setPhase('ready');
    }
  };

  const recording = phase === 'recording';
  const thinking = phase === 'thinking' || phase === 'greeting';
  const speaking = phase === 'speaking';

  return (
    <div
      className={
        bare
          ? ''
          : 'rounded-3xl border-2 border-indigo-100 bg-gradient-to-b from-indigo-50 to-white p-3 md:p-4 shadow-sm'
      }
    >
      {awaitingTap && (
        <button
          type="button"
          onClick={() => void start()}
          aria-label={lang === 'ar' ? 'المس الشاشة لتتحدث مع كيوي' : 'געו במסך כדי לדבר עם קיווי'}
          className="fixed inset-0 z-50 flex cursor-pointer flex-col items-center justify-center gap-5 bg-indigo-950/45 text-white backdrop-blur-sm"
        >
          <div className="text-7xl animate-bounce">👋</div>
          <div className="px-6 text-center text-2xl font-black drop-shadow">
            {lang === 'ar' ? 'المس الشاشة لتتحدث مع كيوي' : 'געו במסך כדי לדבר עם קיווי'}
          </div>
          <div className="max-w-sm px-6 text-center text-sm">
            {lang === 'ar'
              ? 'تجربة للبالغين فقط. كيوي شخصية ذكاء اصطناعي، وسيُرسل الصوت إلى Gemini للمعالجة.'
              : 'הדגמה למבוגרים בלבד. קיווי הוא דמות בינה מלאכותית, והקול יישלח ל־Gemini לעיבוד.'}
          </div>
        </button>
      )}

      <div className={bare ? '' : 'overflow-hidden rounded-2xl bg-white/60'}>
        <Suspense
          fallback={
            <div style={{ height }} className="flex items-center justify-center text-4xl animate-pulse">
              🤖
            </div>
          }
        >
          <RobotAvatar expressive ref={avatar} height={height} interactive />
        </Suspense>
      </div>

      <div
        className={
          bare
            ? 'mt-3 min-h-[3.5rem] px-3 py-2 text-center text-base md:text-lg font-semibold text-slate-800'
            : 'mt-3 min-h-[3.5rem] rounded-2xl bg-white px-3 py-2 text-center text-sm md:text-base font-medium text-slate-700 shadow-sm ring-1 ring-indigo-100'
        }
        dir="rtl"
      >
        {kiwiText || (lang === 'ar' ? 'مرحباً! 👋' : 'שלום! 👋')}
      </div>

      {heard && (
        <div className="mt-2 text-center text-xs text-indigo-500" dir="rtl">
          {lang === 'ar' ? 'قلت:' : 'אמרת:'} “{heard}”
        </div>
      )}

      <div className="mt-3 flex flex-col items-center gap-2">
        {thinking && (
          <div className="text-sm text-indigo-500 animate-pulse">
            {lang === 'ar' ? 'كيوي يفكّر…' : 'קיווי חושב…'}
          </div>
        )}
        {speaking && (
          <div className="text-sm text-indigo-500">
            🔊 {lang === 'ar' ? 'كيوي يتحدث…' : 'קיווי מדבר…'}
          </div>
        )}

        {!awaitingTap && !micDenied && (
          recording ? (
            <button
              onClick={() => void onSend()}
              className="flex items-center gap-2 rounded-full bg-emerald-600 px-8 py-4 text-lg font-black text-white shadow-lg shadow-emerald-200 transition active:scale-95"
            >
              <Send size={22} /> {lang === 'ar' ? 'أرسل لكيوي ✋' : 'שלח לקיווי ✋'}
            </button>
          ) : (
            <button
              onClick={onTalk}
              disabled={thinking}
              className="flex items-center gap-2 rounded-full bg-indigo-600 px-8 py-4 text-lg font-black text-white shadow-lg shadow-indigo-200 transition active:scale-95 disabled:opacity-40"
            >
              <Mic size={22} /> {lang === 'ar' ? 'اضغط لتتكلّم' : 'לחצו כדי לדבר'}
            </button>
          )
        )}
        {recording && (
          <div className="text-xs text-rose-500 animate-pulse">
            {lang === 'ar' ? '🔴 أنا أسجّل… اضغط "أرسل" عند الانتهاء (15 ثانية كحد أقصى)' : '🔴 מקליט… לחצו "שלח" בסיום (עד 15 שניות)'}
          </div>
        )}

        {micDenied && (
          <p className="text-center text-xs text-amber-700">
            <MicOff size={12} className="inline" />{' '}
            {lang === 'ar'
              ? 'اسمح باستخدام الميكروفون ليتمكن كيوي من سماعك.'
              : 'אפשר גישה למיקרופון כדי שקיווי ישמע אותך.'}
          </p>
        )}
      </div>
    </div>
  );
};

export default TalkConversation;
