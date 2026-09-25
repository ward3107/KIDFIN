import React from 'react';
import { useTranslation } from 'react-i18next';
import { MascotConversation } from './MascotConversation';
import { TalkConversation } from './TalkConversation';
const RealtimeConversation = React.lazy(() => import('./RealtimeConversation'));

/**
 * The app's front door. On open the child sees only the robot, and the robot
 * starts the conversation by itself — no start button, no navigation, nothing
 * else to figure out. This is what loads at the root URL; the rest of the app
 * lives behind "…/#app" for teachers.
 *
 * DEFAULT (root URL, also "…/#demo") = the hands-free showcase: the link to
 * share with people who just want to see Kiwi. No access code, no language
 * picker, no microphone and no typing — the robot plays a whole sample
 * conversation by itself, with the child's answers shown on screen.
 *
 * Other routes, for adults testing the real thing:
 * - "…/#realtime": natural Realtime conversation (access code required).
 * - "…/#scripted": the interactive scripted robot (mic or typing).
 * - "…/#live": Gemini Live voice (BETA); falls back to the scripted robot if it
 *   can't run (no key, offline, mic denied).
 */
export const RobotRoom: React.FC<{ childName?: string }> = () => {
  const { i18n } = useTranslation();
  const ar = (i18n.language || 'he').startsWith('ar');
  const hash = typeof window !== 'undefined' ? window.location.hash : '';
  const routeIs = (name: string) => new RegExp(`(?:^|[#/])${name}$`).test(hash);
  // The natural Realtime conversation (access code + language) lives at
  // #realtime, and the interactive scripted flow at #scripted / #live.
  const realtimeDemo = routeIs('realtime');
  // Default: the hands-free showcase, so a shared link needs no code, no
  // microphone and no typing — Kiwi talks through a sample conversation.
  const showcase = !realtimeDemo && !routeIs('scripted') && !routeIs('live');

  // Live voice is opt-in via the "#live" URL; everyone else gets the reliable
  // scripted robot. (Kept in state so a failed live start can drop to scripted.)
  const wantsLive = routeIs('live');
  const [mode, setMode] = React.useState<'live' | 'scripted'>(
    wantsLive ? 'live' : 'scripted',
  );

  // Keep the complete character visible on phones while giving it a proper
  // stage on larger screens. The surrounding page can scroll on short screens.
  const [avatarHeight, setAvatarHeight] = React.useState(420);
  React.useEffect(() => {
    const resize = () => {
      const mobile = window.innerWidth < 768;
      const next = mobile
        ? Math.min(Math.max(window.innerHeight * 0.4, 260), 400)
        : Math.min(Math.max(Math.min(window.innerHeight * 0.7, window.innerWidth * 0.52), 440), 700);
      setAvatarHeight(Math.round(next));
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  // Discreet exit for teachers only — small and low-contrast so children don't
  // reach for it, but always there so an adult can get to the main app.
  const toApp = () => {
    window.location.hash = 'app';
  };

  return (
    <div
      dir="rtl"
      className="relative flex min-h-dvh w-full flex-col items-center justify-start overflow-x-hidden overflow-y-auto bg-gradient-to-b from-indigo-100 via-indigo-50 to-purple-100 px-3 py-2 lg:justify-center lg:px-5"
    >
      {!showcase && <button
        onClick={toApp}
        aria-label={ar ? 'للمعلّم: التطبيق' : 'למורה: האפליקציה'}
        title={ar ? 'للمعلّم' : 'למורה'}
        className="absolute top-2 ltr:right-2 rtl:left-2 z-10 rounded-full p-2 text-xs text-indigo-400/50 transition hover:bg-white/60 hover:text-indigo-700"
      >
        ⚙
      </button>}

      {mode === 'live' && (
        <div className="absolute top-2 left-1/2 z-10 -translate-x-1/2 rounded-full bg-amber-400/90 px-3 py-1 text-xs font-bold text-amber-950 shadow">
          {ar ? 'صوت مباشر (تجريبي)' : 'קול חי (בטא)'}
        </div>
      )}

      <div className={`mx-auto w-full ${realtimeDemo ? 'max-w-6xl' : 'max-w-md'}`}>
        {showcase ? (
          <MascotConversation height={avatarHeight} autoStart bare demo />
        ) : realtimeDemo ? <RealtimeConversation height={avatarHeight} /> : mode === 'live' ? (
          <TalkConversation
            height={avatarHeight}
            autoStart
            bare
            onFallback={() => setMode('scripted')}
          />
        ) : (
          <MascotConversation height={avatarHeight} autoStart bare />
        )}
      </div>
    </div>
  );
};

export default RobotRoom;
