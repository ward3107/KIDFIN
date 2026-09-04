import React from 'react';
import { useTranslation } from 'react-i18next';
import { MascotConversation } from './MascotConversation';
import { LiveConversation } from './LiveConversation';

/**
 * The app's front door. On open the child sees only the robot, and the robot
 * starts the conversation by itself — no start button, no navigation, nothing
 * else to figure out. This is what loads at the root URL; the rest of the app
 * lives behind "…/#app" for teachers.
 *
 * DEFAULT = the scripted, natural-voice robot: polished, reliable, and it works
 * every time (no microphone, no ambient-noise problems). This is what the
 * customer and the children see.
 *
 * LIVE voice (Gemini Live — real two-way talking) is still in BETA while we tune
 * it, so it is opt-in at "…/#live" rather than the default. If live voice can't
 * run there (no key, offline, mic denied), it falls back to the scripted robot.
 */
export const RobotRoom: React.FC<{ childName?: string }> = () => {
  const { i18n } = useTranslation();
  const ar = (i18n.language || 'he').startsWith('ar');

  // Live voice is opt-in via the "#live" URL; everyone else gets the reliable
  // scripted robot. (Kept in state so a failed live start can drop to scripted.)
  const wantsLive =
    typeof window !== 'undefined' && /(?:^|[#/])live$/.test(window.location.hash);
  const [mode, setMode] = React.useState<'live' | 'scripted'>(
    wantsLive ? 'live' : 'scripted',
  );

  // Fill the viewport so the robot is as large as the screen comfortably allows.
  const [avatarHeight, setAvatarHeight] = React.useState(420);
  React.useEffect(() => {
    const resize = () =>
      setAvatarHeight(Math.round(Math.min(Math.max(window.innerHeight * 0.52, 320), 560)));
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
      className="relative flex min-h-dvh w-full flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-indigo-100 via-indigo-50 to-purple-100 px-3"
    >
      <button
        onClick={toApp}
        aria-label={ar ? 'للمعلّم: التطبيق' : 'למורה: האפליקציה'}
        title={ar ? 'للمعلّم' : 'למורה'}
        className="absolute top-2 ltr:right-2 rtl:left-2 z-10 rounded-full p-2 text-xs text-indigo-400/50 transition hover:bg-white/60 hover:text-indigo-700"
      >
        ⚙
      </button>

      {mode === 'live' && (
        <div className="absolute top-2 left-1/2 z-10 -translate-x-1/2 rounded-full bg-amber-400/90 px-3 py-1 text-xs font-bold text-amber-950 shadow">
          {ar ? 'صوت مباشر (تجريبي)' : 'קול חי (בטא)'}
        </div>
      )}

      <div className="mx-auto w-full max-w-md">
        {mode === 'live' ? (
          <LiveConversation
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
