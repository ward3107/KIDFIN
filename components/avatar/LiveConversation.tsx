import React, { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Mic, MicOff } from 'lucide-react';
import type { AvatarHandle } from './avatarTypes';
import type { Lang } from '../../services/dialogue/conversation';
import type { GeminiLiveSession, LiveStatus } from '../../services/live/geminiLive';

// Lazy-load the 3D avatar so three.js stays code-split.
const RobotAvatar = React.lazy(() =>
  import('./RobotAvatar').then((m) => ({ default: m.RobotAvatar })),
);

// A few ms of silence — used only to ask the browser "would you let me start
// audio right now?" without a user gesture (installed PWA / kiosk).
const SILENT_WAV =
  'data:audio/wav;base64,UklGRkwAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YSgAAACAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA';

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

// Errors that mean "live voice can't run here" → fall back to scripted mode.
const FATAL_FALLBACK = new Set([
  'not_configured',
  'token_failed',
  'network',
  'connect_failed',
  'connection',
  'mic_graph',
]);

/**
 * Kiwi in LIVE voice mode: a real, two-way spoken conversation powered by Gemini
 * Live. Kiwi opens the conversation, listens continuously, and stops talking the
 * moment the child speaks. Understands and speaks Hebrew and spoken Arabic.
 *
 * If live voice isn't available (no key configured, offline, or the browser
 * can't connect), `onFallback` fires so the caller can drop back to the scripted
 * conversation — the app always works.
 */
export const LiveConversation: React.FC<{
  height?: number;
  bare?: boolean;
  autoStart?: boolean;
  onFallback?: (reason: string) => void;
}> = ({ height = 300, bare = false, autoStart = true, onFallback }) => {
  const { i18n } = useTranslation();
  const lang: Lang = (i18n.language || 'he').startsWith('ar') ? 'ar' : 'he';

  const avatar = useRef<AvatarHandle>(null);
  const sessionRef = useRef<GeminiLiveSession | null>(null);
  const startedRef = useRef(false);

  const [status, setStatus] = useState<LiveStatus>('closed');
  const [awaitingTap, setAwaitingTap] = useState(false);
  const [kiwiText, setKiwiText] = useState('');
  const [userText, setUserText] = useState('');
  const [micDenied, setMicDenied] = useState(false);

  const start = useCallback(async () => {
    if (startedRef.current) return;
    startedRef.current = true;
    setAwaitingTap(false);
    setMicDenied(false);

    const sink = avatar.current?.getLiveAudioSink?.();
    if (!sink) {
      onFallback?.('no_audio');
      return;
    }

    // Load the live engine lazily so its WebSocket/audio code isn't in the main
    // bundle and only downloads when a child actually starts talking.
    const { GeminiLiveSession } = await import('../../services/live/geminiLive');
    const session = new GeminiLiveSession({
      lang,
      sink: { context: sink.context, node: sink.node },
      callbacks: {
        onStatus: setStatus,
        onKiwiText: (t) => setKiwiText((prev) => (prev + ' ' + t).trim().slice(-240)),
        onUserText: (t) => setUserText((prev) => (prev + ' ' + t).trim().slice(-160)),
        onError: (code) => {
          if (code === 'mic_denied') setMicDenied(true);
          if (FATAL_FALLBACK.has(code)) onFallback?.(code);
        },
      },
    });
    session.onSpeakingChange = (on) => avatar.current?.setSpeaking?.(on);
    sessionRef.current = session;
    void session.start();
  }, [lang, onFallback]);

  // Proactive opening: start by itself if the browser allows audio; otherwise
  // wait for one screen touch (mic + audio unlock on the child's first tap).
  useEffect(() => {
    if (!autoStart) return;
    let cancelled = false;
    void canAutoplay().then((ok) => {
      if (cancelled) return;
      if (ok) void start();
      else setAwaitingTap(true);
    });
    return () => {
      cancelled = true;
    };
  }, [autoStart, start]);

  // Tear down the session on unmount.
  useEffect(
    () => () => {
      sessionRef.current?.stop();
      sessionRef.current = null;
    },
    [],
  );

  const listening = status === 'listening' || status === 'live';
  const speaking = status === 'speaking';
  const connecting = status === 'connecting';

  return (
    <div
      className={
        bare
          ? ''
          : 'rounded-3xl border-2 border-indigo-100 bg-gradient-to-b from-indigo-50 to-white p-3 md:p-4 shadow-sm'
      }
    >
      {awaitingTap && (
        <div
          onPointerDown={() => void start()}
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

      <div className={bare ? '' : 'overflow-hidden rounded-2xl bg-white/60'}>
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

      {/* Caption bubble — Kiwi's words (also helps hard-of-hearing kids). */}
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

      {userText && (
        <div className="mt-2 text-center text-xs text-indigo-500" dir="rtl">
          {lang === 'ar' ? 'قلت:' : 'אמרת:'} “{userText}”
        </div>
      )}

      {/* Live status */}
      <div className="mt-3 flex flex-col items-center gap-2">
        {connecting && (
          <div className="text-sm text-indigo-500 animate-pulse">
            {lang === 'ar' ? 'كيوي يستعد…' : 'קיווי מתכונן…'}
          </div>
        )}
        {speaking && (
          <div className="text-sm text-indigo-500">
            🔊 {lang === 'ar' ? 'كيوي يتحدث…' : 'קיווי מדבר…'}
          </div>
        )}
        {listening && (
          <div className="flex items-center gap-2 rounded-full bg-rose-500 px-5 py-2.5 text-white shadow-lg animate-pulse">
            <Mic size={18} /> {lang === 'ar' ? 'أنا أستمع… تكلم!' : 'אני מקשיב… דבר!'}
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

export default LiveConversation;
