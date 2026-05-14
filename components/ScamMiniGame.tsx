import React, { useState, useMemo } from 'react';
import { X, CheckCircle, XCircle, ShieldAlert, Trophy, RotateCcw } from 'lucide-react';
import { Card, Button } from './UI';
import { SCAM_SCENARIOS, SOURCE_LABEL, SOURCE_ICON, ScamScenario } from '../config/scamScenarios';
import { scoreGame, calcReward, Medal } from '../utils/scamGame';

interface ScamMiniGameProps {
  onClose: () => void;
  onComplete?: (reward: { coins: number; xp: number; knowledgePoints: number }) => void;
}

/** Fisher-Yates — randomize each play-through so the kid can't memorize order. */
function shuffle<T>(arr: readonly T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const MEDAL_LABEL: Record<Medal, { label: string; emoji: string; color: string }> = {
  gold:   { label: 'מדליית זהב',   emoji: '🥇', color: 'from-yellow-400 to-amber-500' },
  silver: { label: 'מדליית כסף',   emoji: '🥈', color: 'from-slate-300 to-slate-500' },
  bronze: { label: 'מדליית ארד',    emoji: '🥉', color: 'from-orange-300 to-orange-500' },
  none:   { label: 'נסה שוב!',     emoji: '💪', color: 'from-rose-300 to-rose-500' },
};

export const ScamMiniGame: React.FC<ScamMiniGameProps> = ({ onClose, onComplete }) => {
  const [scenarios, setScenarios] = useState<ScamScenario[]>(() => shuffle(SCAM_SCENARIOS));
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [revealed, setRevealed] = useState<boolean | null>(null); // user's choice
  const [phase, setPhase] = useState<'play' | 'done'>('play');

  const current = scenarios[index];
  const isLast = index === scenarios.length - 1;

  const result = useMemo(() => scoreGame(scenarios, answers), [scenarios, answers]);
  const reward = useMemo(() => calcReward(result), [result]);
  const medal = MEDAL_LABEL[result.medal];

  const handleAnswer = (chooseFake: boolean) => {
    if (revealed !== null) return;
    setRevealed(chooseFake);
    setAnswers(prev => [...prev, chooseFake]);
  };

  const handleNext = () => {
    if (isLast) {
      setPhase('done');
    } else {
      setIndex(i => i + 1);
      setRevealed(null);
    }
  };

  const handleReplay = () => {
    setScenarios(shuffle(SCAM_SCENARIOS));
    setIndex(0);
    setAnswers([]);
    setRevealed(null);
    setPhase('play');
  };

  const handleFinish = () => {
    onComplete?.(reward);
    onClose();
  };

  const wasCorrect = revealed !== null && revealed === current.isFake;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fadeIn">
      <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-md w-full max-h-[90dvh] overflow-y-auto" dir="rtl">
        <div className="bg-gradient-to-r from-purple-600 to-fuchsia-600 p-5 rounded-t-[2.5rem] text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 left-4 p-2 hover:bg-white/20 rounded-full transition-colors"
            aria-label="סגור"
          >
            <X size={20} />
          </button>
          <div className="flex items-center gap-3">
            <ShieldAlert size={26} />
            <div>
              <h2 className="text-xl font-black">אמיתי או מזויף?</h2>
              <p className="text-xs opacity-90">
                {phase === 'play' ? `שאלה ${index + 1} מתוך ${scenarios.length}` : 'סיימת את כל האתגרים'}
              </p>
            </div>
          </div>
          {phase === 'play' && (
            <div className="mt-3 flex gap-1">
              {scenarios.map((_, i) => (
                <div
                  key={i}
                  className={`flex-1 h-1.5 rounded-full ${
                    i < index ? 'bg-white' : i === index ? 'bg-white/70' : 'bg-white/20'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        <div className="p-5 space-y-4">
          {phase === 'play' && (
            <>
              <Card className="border-2 border-slate-200">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-2">
                  <span className="text-lg">{SOURCE_ICON[current.source]}</span>
                  {SOURCE_LABEL[current.source]} • מאת {current.sender}
                </div>
                <p className="text-sm md:text-base text-slate-800 leading-relaxed whitespace-pre-line">
                  {current.body}
                </p>
              </Card>

              {revealed === null ? (
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleAnswer(false)}
                    className="py-4 rounded-2xl font-black text-base bg-emerald-50 text-emerald-700 border-2 border-emerald-200 hover:bg-emerald-100 transition-all active:scale-95 flex flex-col items-center gap-1"
                  >
                    <CheckCircle size={24} />
                    אמיתי
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAnswer(true)}
                    className="py-4 rounded-2xl font-black text-base bg-rose-50 text-rose-700 border-2 border-rose-200 hover:bg-rose-100 transition-all active:scale-95 flex flex-col items-center gap-1"
                  >
                    <XCircle size={24} />
                    מזויף
                  </button>
                </div>
              ) : (
                <>
                  <Card
                    className={`border-2 ${
                      wasCorrect
                        ? 'border-emerald-300 bg-emerald-50'
                        : 'border-rose-300 bg-rose-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {wasCorrect ? (
                        <>
                          <CheckCircle className="text-emerald-600" size={22} />
                          <span className="font-black text-emerald-800">צדקת!</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="text-rose-600" size={22} />
                          <span className="font-black text-rose-800">
                            לא בדיוק — זה {current.isFake ? 'מזויף' : 'אמיתי'}
                          </span>
                        </>
                      )}
                    </div>
                    <p className="text-xs font-bold text-slate-600 mb-2">
                      {current.isFake ? 'למה זה מזויף:' : 'איך יודעים שזה אמיתי:'}
                    </p>
                    <ul className="space-y-1.5">
                      {current.redFlags.map((flag, i) => (
                        <li key={i} className="text-sm text-slate-700 flex gap-2">
                          <span className="text-slate-400 shrink-0">•</span>
                          <span>{flag}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-3 pt-3 border-t border-slate-200">
                      <p className="text-xs font-black text-slate-700">💡 {current.lesson}</p>
                    </div>
                  </Card>

                  <Button variant="academy" onClick={handleNext}>
                    {isLast ? 'ראה תוצאה' : 'הבא'} ←
                  </Button>
                </>
              )}
            </>
          )}

          {phase === 'done' && (
            <>
              <Card className={`bg-gradient-to-br ${medal.color} text-white border-0 text-center`}>
                <div className="text-6xl mb-2">{medal.emoji}</div>
                <p className="text-lg font-black">{medal.label}</p>
                <p className="text-3xl font-black mt-2">
                  {result.correct} / {result.total}
                </p>
                <p className="text-sm opacity-90 mt-1">
                  זיהית נכון {Math.round(result.accuracy * 100)}% מההודעות
                </p>
              </Card>

              <Card className="border-2 border-indigo-100 bg-indigo-50">
                <p className="text-sm font-black text-indigo-900 mb-2">🎁 הרווחת:</p>
                <div className="flex justify-around text-center">
                  <div>
                    <div className="text-2xl font-black text-indigo-900">{reward.coins}</div>
                    <div className="text-xs text-indigo-700">מטבעות</div>
                  </div>
                  <div>
                    <div className="text-2xl font-black text-indigo-900">{reward.xp}</div>
                    <div className="text-xs text-indigo-700">XP</div>
                  </div>
                  {reward.knowledgePoints > 0 && (
                    <div>
                      <div className="text-2xl font-black text-indigo-900">+{reward.knowledgePoints}</div>
                      <div className="text-xs text-indigo-700">ידע</div>
                    </div>
                  )}
                </div>
              </Card>

              <div className="flex gap-2">
                <Button variant="outline" onClick={handleReplay} className="flex-1">
                  <RotateCcw size={16} /> שוב
                </Button>
                <Button variant="academy" onClick={handleFinish} className="flex-1">
                  <Trophy size={16} /> סיימתי
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScamMiniGame;
