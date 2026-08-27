import React from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Mascot } from './Mascot';
import { LanguageSwitcher } from '../LanguageSwitcher';

/**
 * A dedicated, distraction-free full-screen "room" for the robot. No app
 * navigation, stats, or other UI — just the robot and the talk/type controls,
 * so a child can focus entirely on the interaction. Reached at "…/#robot".
 */
export const RobotRoom: React.FC<{ childName?: string }> = ({ childName }) => {
  const { i18n } = useTranslation();
  const ar = (i18n.language || 'he').startsWith('ar');

  // Size the avatar to the viewport so it fills the focused screen nicely.
  const [avatarHeight, setAvatarHeight] = React.useState(360);
  React.useEffect(() => {
    const resize = () =>
      setAvatarHeight(Math.round(Math.min(Math.max(window.innerHeight * 0.46, 280), 480)));
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  const goBack = () => {
    // Clearing the hash returns to the normal app (see index.tsx routing).
    window.location.hash = '';
  };

  const Back = ar ? ArrowRight : ArrowLeft;

  return (
    <div
      dir={ar ? 'rtl' : 'rtl'}
      className="min-h-dvh w-full bg-gradient-to-b from-indigo-100 via-indigo-50 to-purple-100"
    >
      {/* Top bar: back + language only */}
      <div className="mx-auto flex max-w-md items-center justify-between px-3 pt-3">
        <button
          onClick={goBack}
          className="flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1.5 text-sm font-semibold text-indigo-700 shadow ring-1 ring-indigo-200 backdrop-blur transition hover:bg-white"
        >
          <Back size={16} /> {ar ? 'رجوع' : 'חזרה'}
        </button>
        <LanguageSwitcher />
      </div>

      {/* The robot, centered and large */}
      <div className="mx-auto flex max-w-md flex-col justify-center px-3 pb-6 pt-2">
        <h1 className="mb-2 text-center text-xl font-black text-indigo-900">
          {ar ? 'كيوي 🤖' : 'קיווי 🤖'}
        </h1>
        <Mascot childName={childName} height={avatarHeight} />
      </div>
    </div>
  );
};

export default RobotRoom;
