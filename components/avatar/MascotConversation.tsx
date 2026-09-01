import React, { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Mic, MicOff, Play, Send } from 'lucide-react';
import type { AvatarHandle } from './avatarTypes';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import {
  audioUrl,
  getTurn,
  nextTurnId,
  turnListens,
  turnText,
} from '../../services/dialogue/engine';
import { CONVERSATION_START, type Lang } from '../../services/dialogue/conversation';

// Lazy-load the 3D avatar so three.js stays code-split.
const RobotAvatar = React.lazy(() =>
  import('./RobotAvatar').then((m) => ({ default: m.RobotAvatar })),
);

type Phase = 'idle' | 'speaking' | 'listening' | 'done';

// A few ms of silence — used only to ask the browser "would you let me play
// audio right now?" without a user gesture.
const SILENT_WAV =
  'data:audio/wav;base64,UklGRkwAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YSgAAACAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA';

/**
 * True when the browser will let us start audio with no user gesture — the case
 * in an installed PWA or a kiosk with autoplay enabled. On a normal cold tab
 * this is false and one screen touch is required first (a hard browser rule).
 */
const canAutoplay = async (): Promise<boolean> => {
  try {
    const a = new Audio(SILENT_WAV);
    a.volume = 0;
    const p = a.play();
    if (p && typeof p.then === 'function') await p;
    a.pause();
    return true;
  } catch {
    return false;
  }
};

/**
 * The interactive, proactive, bilingual talking mascot. The robot leads the
 * whole conversation: it speaks, then listens, reacts to what the child says,
 * and moves the lesson forward — so a shy child is gently pulled into talking.
 *
 * With `autoStart`, the robot begins the moment the page opens. If the browser
 * blocks audio before any interaction, a full-screen "touch anywhere" catch
 * (not a button) starts it on the child's first touch — the least friction the
 * browser allows.
 */
export const MascotConversation: React.FC<{ height?: number; autoStart?: boolean }> = ({
  height = 300,
  autoStart = false,
}) => {
  const { t, i18n } = useTranslation();
  const lang: Lang = (i18n.language || 'he').startsWith('ar') ? 'ar' : 'he';

  const avatar = useRef<AvatarHandle>(null);
  const [started, setStarted] = useState(false);
  const [phase, setPhase] = useState<Phase>('idle');
  const [turnId, setTurnId] = useState<string>(CONVERSATION_START);
  const [caption, setCaption] = useState('');
  const [childSaid, setChildSaid] = useState('');
  const [typed, setTyped] = useState('');
  const [awaitingTap, setAwaitingTap] = useState(false);
  const listenTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearListenTimer = () => {
    if (listenTimer.current) {
      clearTimeout(listenTimer.current);
      listenTimer.current = null;
    }
  };

  // Forward-declared so speak/afterSpeak can reference each other.
  const playTurnRef = useRef<(id: string) => void>(() => {});

  const advanceOnHeard = useCallback(
    (text: string) => {
      clearListenTimer();
      setChildSaid(text);
      const turn = getTurn(turnId);
      if (!turn) return;
      const nid = nextTurnId(turn, text, lang);
      if (nid) playTurnRef.current(nid);
      else setPhase('idle');
    },
    [turnId, lang],
  );

  const recognition = useSpeechRecognition(advanceOnHeard);

  const beginListening = useCallback(
    (turnIdForFallback: string) => {
      setPhase('listening');
      if (recognition.supported) {
        recognition.start();
        // Safety: if the child says nothing, gently continue after a while.
        clearListenTimer();
        listenTimer.current = setTimeout(() => {
          recognition.stop();
          const turn = getTurn(turnIdForFallback);
          const nid = turn?.fallbackNext ?? turn?.next;
          if (nid) playTurnRef.current(nid);
          else setPhase('idle');
        }, 9000);
      }
    },
    [recognition],
  );

  const playTurn = useCallback(
    (id: string) => {
      const turn = getTurn(id);
      if (!turn) return;
      setTurnId(id);
      setChildSaid('');
      setPhase('speaking');
      const text = turnText(turn, lang);
      setCaption(text);
      const a = avatar.current;
      if (!a) return;
      a.setExpression(turn.expression);
      if (turn.gesture) a.playGesture(turn.gesture);
      a.playClip(audioUrl(turn.audioKey, lang), {
        expression: turn.expression,
        fallbackText: text,
        lang: lang === 'ar' ? 'ar' : 'he-IL',
        onDone: () => {
          if (turn.end) {
            setPhase('done');
          } else if (turnListens(turn)) {
            beginListening(turn.id);
          } else if (turn.next) {
            playTurn(turn.next);
          } else {
            setPhase('idle');
          }
        },
      });
    },
    [lang, beginListening],
  );
  playTurnRef.current = playTurn;

  const start = () => {
    setAwaitingTap(false);
    setStarted(true);
    playTurn(CONVERSATION_START);
  };

  // Proactive opening: the robot starts by itself when the page loads. If the
  // browser won't allow audio yet, wait for the first touch anywhere (below)
  // rather than making the child hunt for a start button.
  const autoStarted = useRef(false);
  useEffect(() => {
    if (!autoStart || autoStarted.current) return;
    autoStarted.current = true;
    let cancelled = false;
    void canAutoplay().then((ok) => {
      if (cancelled) return;
      if (ok) start();
      else setAwaitingTap(true);
    });
    return () => {
      cancelled = true;
    };
    // start is stable enough for a once-only autostart; guarded by autoStarted.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoStart]);

  const restart = () => {
    recognition.stop();
    clearListenTimer();
    playTurn(CONVERSATION_START);
  };

  const talkAgain = () => {
    const turn = getTurn(turnId);
    if (turn && turnListens(turn)) beginListening(turn.id);
  };

  // Let the child TYPE instead of speaking.
  const submitTyped = (e: React.FormEvent) => {
    e.preventDefault();
    const text = typed.trim();
    if (!text) return;
    recognition.stop();
    clearListenTimer();
    setTyped('');
    advanceOnHeard(text);
  };

  return (
    <div className="rounded-3xl border-2 border-indigo-100 bg-gradient-to-b from-indigo-50 to-white p-3 md:p-4 shadow-sm">
      {/* Full-screen "touch anywhere" catch — shown only when the browser blocks
          audio before the child interacts. It is the whole screen, not a button,
          so a young student just taps and Kiwi starts talking. */}
      {awaitingTap && (
        <div
          onPointerDown={start}
          role="button"
          tabIndex={0}
          aria-label={lang === 'ar' ? 'المس الشاشة لتتحدث مع كيوي' : 'געו במסך כדי לדבר עם קיווי'}
          className="fixed inset-0 z-50 flex cursor-pointer flex-col items-center justify-center gap-5 bg-indigo-950/45 text-white backdrop-blur-sm"
        >
          <div className="text-7xl animate-bounce">👋</div>
          <div className="px-6 text-center text-2xl font-black drop-shadow">
            {lang === 'ar' ? 'المس الشاشة لتتحدث مع كيوي' : 'געו במסך כדי לדבר עם קיווי'}
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl bg-white/60">
        <Suspense
          fallback={
            <div
              style={{ height }}
              className="flex items-center justify-center text-4xl animate-pulse"
            >
              🤖
            </div>
          }
        >
          <RobotAvatar ref={avatar} height={height} interactive={false} />
        </Suspense>
      </div>

      {/* Caption bubble — the robot's words (also helps non-audio/hard-of-hearing) */}
      <div className="mt-3 min-h-[3.5rem] rounded-2xl bg-white px-3 py-2 text-center text-sm md:text-base font-medium text-slate-700 shadow-sm ring-1 ring-indigo-100">
        {caption ||
          (autoStart
            ? lang === 'ar'
              ? 'مرحباً! 👋'
              : 'שלום! 👋'
            : lang === 'ar'
              ? 'اضغط لتبدأ الحديث مع كيوي! 👇'
              : 'לחץ כדי להתחיל לדבר עם קיווי! 👇')}
      </div>

      {/* What the child said */}
      {childSaid && (
        <div className="mt-2 text-center text-xs text-indigo-500">
          {lang === 'ar' ? 'قلت:' : 'אמרת:'} “{childSaid}”
        </div>
      )}

      {/* Live state / controls */}
      <div className="mt-3 flex flex-col items-center gap-2">
        {!started && !autoStart && (
          <button
            onClick={start}
            className="flex items-center gap-2 rounded-2xl bg-indigo-600 px-6 py-3 text-base font-bold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 active:scale-95"
          >
            <Play size={20} /> {lang === 'ar' ? 'هيا نبدأ' : 'בוא נתחיל'}
          </button>
        )}

        {started && phase === 'speaking' && (
          <div className="text-sm text-indigo-500">🔊 {lang === 'ar' ? 'كيوي يتحدث…' : 'קיווי מדבר…'}</div>
        )}

        {started && phase === 'listening' && (
          <div className="flex items-center gap-2 rounded-full bg-rose-500 px-5 py-2.5 text-white shadow-lg animate-pulse">
            <Mic size={18} /> {lang === 'ar' ? 'أنا أستمع… تكلم!' : 'אני מקשיב… דבר!'}
          </div>
        )}

        {started && phase === 'listening' && !recognition.supported && (
          <button
            onClick={() => advanceOnHeard('')}
            className="rounded-2xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow"
          >
            {lang === 'ar' ? 'متابعة ▶' : 'המשך ▶'}
          </button>
        )}

        {started && phase === 'listening' && recognition.supported && (
          <button onClick={talkAgain} className="text-xs text-indigo-500 underline">
            {lang === 'ar' ? 'لم يسمعني؟ حاول ثانية' : 'לא שמע? נסה שוב'}
          </button>
        )}

        {/* Type instead of talking — for kids who prefer to write */}
        {started && phase === 'listening' && (
          <form onSubmit={submitTyped} className="mt-1 flex w-full max-w-xs items-center gap-2">
            <input
              type="text"
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              placeholder={lang === 'ar' ? 'أو اكتب هنا…' : 'או כתוב כאן…'}
              dir={lang === 'ar' ? 'rtl' : 'rtl'}
              className="flex-1 rounded-2xl border-2 border-indigo-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-indigo-400"
            />
            <button
              type="submit"
              aria-label={lang === 'ar' ? 'إرسال' : 'שליחה'}
              className="rounded-2xl bg-indigo-600 p-2.5 text-white shadow transition hover:bg-indigo-700 active:scale-95"
            >
              <Send size={16} />
            </button>
          </form>
        )}

        {started && phase === 'done' && (
          <button
            onClick={restart}
            className="rounded-2xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow hover:bg-indigo-700"
          >
            {lang === 'ar' ? 'من البداية 🔄' : 'מהתחלה 🔄'}
          </button>
        )}

        {recognition.error === 'not-allowed' && (
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

export default MascotConversation;
