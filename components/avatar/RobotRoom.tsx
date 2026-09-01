import React from 'react';
import { useTranslation } from 'react-i18next';
import { MascotConversation } from './MascotConversation';

/**
 * The app's front door. On open the child sees only the robot, and the robot
 * starts the conversation by itself — no start button, no navigation, nothing
 * else to figure out (see MascotConversation's autoStart). This is what loads
 * at the root URL; the rest of the app lives behind "…/#app" for teachers.
 */
export const RobotRoom: React.FC<{ childName?: string }> = () => {
  const { i18n } = useTranslation();
  const ar = (i18n.language || 'he').startsWith('ar');

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

      <div className="mx-auto w-full max-w-md">
        <MascotConversation height={avatarHeight} autoStart />
      </div>
    </div>
  );
};

export default RobotRoom;
