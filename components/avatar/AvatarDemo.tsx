import React, { useRef, useState } from 'react';
import { RobotAvatar } from './RobotAvatar';
import type { AvatarExpression, AvatarGesture, AvatarHandle } from './avatarTypes';

/**
 * Standalone demo of the 3D talking mascot (AVATAR_3D_PLAN.md — M1+M2 slice).
 *
 * Not wired into the main app navigation yet; mounted on the `#avatar` route so
 * it can be shown/shared without touching the existing tabs. Each button makes
 * the robot speak a short social-interaction line with a matching expression and
 * gesture — a preview of how Layer 4 (lessons) will drive the avatar.
 */

interface DemoLine {
  label: string;
  text: string;
  expression: AvatarExpression;
  gesture: AvatarGesture;
}

// Hebrew-first sample lines (the app is he/RTL). These stand in for real
// social-skills scenarios that will live in config/socialScenarios.ts.
const LINES: DemoLine[] = [
  {
    label: 'ברכה 👋',
    text: 'שלום! נעים מאוד להכיר אותך. איך קוראים לך?',
    expression: 'happy',
    gesture: 'wave',
  },
  {
    label: 'שיתוף 🤝',
    text: 'כשחבר משחק במשהו שגם אני רוצה, אפשר לשאול יפה ולחכות לתור. שיתוף זה כיף לשנינו!',
    expression: 'happy',
    gesture: 'nod',
  },
  {
    label: 'רגשות 💚',
    text: 'אני רואה שאתה קצת עצוב. זה בסדר גמור להרגיש ככה. רוצה לספר לי מה קרה?',
    expression: 'sad',
    gesture: 'think',
  },
  {
    label: 'עידוד 🎉',
    text: 'כל הכבוד! עשית בחירה מצוינת. אני ממש גאה בך!',
    expression: 'surprised',
    gesture: 'cheer',
  },
];

const EXPRESSIONS: AvatarExpression[] = ['neutral', 'happy', 'thinking', 'surprised', 'sad'];

export const AvatarDemo: React.FC = () => {
  const avatar = useRef<AvatarHandle>(null);
  const [voiceHint, setVoiceHint] = useState(false);

  const say = (line: DemoLine) => {
    const a = avatar.current;
    if (!a) return;
    a.setExpression(line.expression);
    a.playGesture(line.gesture);
    a.speak(line.text, {
      expression: line.expression,
      onDone: () => a.setExpression('neutral'),
    });
    // Some browsers only load voices after first user interaction.
    if (typeof window !== 'undefined' && window.speechSynthesis?.getVoices().length === 0) {
      setVoiceHint(true);
    }
  };

  return (
    <div dir="rtl" className="min-h-dvh bg-gradient-to-b from-indigo-50 to-purple-100 p-4 sm:p-8">
      <div className="mx-auto max-w-md">
        <header className="mb-4 text-center">
          <h1 className="text-2xl font-bold text-indigo-900">הרובוט החברתי 🤖</h1>
          <p className="text-sm text-indigo-700/80">
            הדגמה: דמות תלת-ממד שמדברת ומגיבה — לשיעורי מיומנויות חברתיות
          </p>
        </header>

        <div className="overflow-hidden rounded-[2rem] bg-white/70 shadow-xl ring-1 ring-indigo-100 backdrop-blur">
          <RobotAvatar height={400} />
        </div>

        <section className="mt-5">
          <h2 className="mb-2 text-sm font-semibold text-indigo-900">בוא נדבר:</h2>
          <div className="grid grid-cols-2 gap-2">
            {LINES.map((line) => (
              <button
                key={line.label}
                onClick={() => say(line)}
                className="rounded-2xl bg-indigo-600 px-3 py-3 text-sm font-semibold text-white shadow transition hover:bg-indigo-700 active:scale-95"
              >
                {line.label}
              </button>
            ))}
          </div>
        </section>

        <section className="mt-4">
          <h2 className="mb-2 text-sm font-semibold text-indigo-900">הבעות פנים:</h2>
          <div className="flex flex-wrap gap-2">
            {EXPRESSIONS.map((exp) => (
              <button
                key={exp}
                onClick={() => avatar.current?.setExpression(exp)}
                className="rounded-full bg-white px-3 py-1.5 text-xs font-medium text-indigo-800 shadow ring-1 ring-indigo-200 hover:bg-indigo-50"
              >
                {exp}
              </button>
            ))}
            <button
              onClick={() => avatar.current?.stopSpeaking()}
              className="rounded-full bg-rose-500 px-3 py-1.5 text-xs font-medium text-white shadow hover:bg-rose-600"
            >
              עצור דיבור ⏹
            </button>
          </div>
        </section>

        {voiceHint && (
          <p className="mt-4 rounded-xl bg-amber-50 p-3 text-xs text-amber-800 ring-1 ring-amber-200">
            טיפ: אם אין קול, ייתכן שהדפדפן עדיין טוען קולות. לחץ שוב על אחד הכפתורים.
          </p>
        )}

        <p className="mt-6 text-center text-xs text-indigo-500/70">
          גרור כדי לסובב את הרובוט · Web Speech · three.js
        </p>
      </div>
    </div>
  );
};

export default AvatarDemo;
