import React, { Suspense, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { AvatarHandle } from './avatarTypes';

// Lazy-load the 3D avatar so three.js is code-split into its own chunk and only
// downloaded when this greeter actually renders (keeps first paint fast).
const RobotAvatar = React.lazy(() =>
  import('./RobotAvatar').then((m) => ({ default: m.RobotAvatar })),
);

interface MascotGreeterProps {
  /** Child's name, used to personalize the spoken greeting. */
  name?: string;
  height?: number;
}

// Friendly Hebrew mascot lines (the app is he/RTL). Tapping cycles through them.
const LINES = [
  'שלום! אני קיווי, החבר הרובוט שלך. כיף לראות אותך!',
  'בוא נלמד היום משהו חדש ביחד. אתה מוכן?',
  'זכור: כל שקל שחוסכים היום שווה יותר מחר!',
  'אני כאן כדי לעזור לך ללמוד ולהתרגל. אתה אלוף!',
];

/**
 * A talking 3D mascot card for the Home screen. Renders the robot, greets the
 * child by name, and speaks a rotating set of encouraging lines on tap.
 */
export const MascotGreeter: React.FC<MascotGreeterProps> = ({ name, height = 260 }) => {
  const { t } = useTranslation();
  const avatar = useRef<AvatarHandle>(null);
  const [idx, setIdx] = useState(0);
  const [bubble, setBubble] = useState<string>('');

  const talk = () => {
    const a = avatar.current;
    if (!a) return;
    const base = LINES[idx % LINES.length];
    const line = idx === 0 && name ? `שלום ${name}! ${base.replace(/^שלום! /, '')}` : base;
    setBubble(line);
    a.setExpression('happy');
    a.playGesture(idx === 0 ? 'wave' : 'nod');
    a.speak(line, { expression: 'happy', onDone: () => a.setExpression('neutral') });
    setIdx((i) => i + 1);
  };

  return (
    <div className="rounded-3xl border-2 border-indigo-100 bg-gradient-to-b from-indigo-50 to-white p-3 md:p-4 shadow-sm">
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="w-full sm:w-1/2 overflow-hidden rounded-2xl bg-white/60">
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
            <RobotAvatar ref={avatar} height={height} />
          </Suspense>
        </div>

        <div className="w-full sm:w-1/2 text-center sm:text-right">
          <div className="min-h-[3.5rem] rounded-2xl bg-white px-3 py-2 text-sm md:text-base text-slate-700 shadow-sm ring-1 ring-indigo-100">
            {bubble || 'לחץ על הכפתור כדי לדבר איתי! 👇'}
          </div>
          <button
            onClick={talk}
            className="mt-3 w-full rounded-2xl bg-indigo-600 px-4 py-3 text-sm md:text-base font-bold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 active:scale-95"
          >
            🎤 {t('mascot.talk', 'דבר איתי')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MascotGreeter;
