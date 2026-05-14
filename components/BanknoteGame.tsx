import React, { useState, useMemo } from 'react';
import { X, Banknote as BanknoteIcon, Trophy, RotateCcw, CheckCircle, XCircle } from 'lucide-react';
import { Card, Button } from './UI';
import { BANKNOTES, SECURITY_FEATURES, Banknote } from '../config/banknotes';
import {
  buildMatchItems,
  scoreMatching,
  scoreFeatureQuiz,
  calcBanknoteReward,
} from '../utils/banknoteGame';

interface BanknoteGameProps {
  onClose: () => void;
  onComplete?: (reward: { coins: number; xp: number; knowledgePoints: number }) => void;
}

type Phase = 'match' | 'reveal' | 'quiz' | 'done';

function shuffle<T>(arr: readonly T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const BillSwatch: React.FC<{ note: Banknote; small?: boolean }> = ({ note, small }) => (
  <div
    className={`rounded-xl flex items-center justify-center font-black shadow-md ${
      small ? 'w-14 h-9 text-base' : 'w-20 h-12 text-xl'
    }`}
    style={{ background: note.hexBg, color: note.hexInk }}
  >
    {note.value} ₪
  </div>
);

export const BanknoteGame: React.FC<BanknoteGameProps> = ({ onClose, onComplete }) => {
  const matchItems = useMemo(() => buildMatchItems(BANKNOTES), []);
  // Shuffle figures so the answer order isn't trivial
  const [figures] = useState(() => shuffle(matchItems.map(m => m.figure)));
  const [picks, setPicks] = useState<Map<string, number>>(new Map());
  const [phase, setPhase] = useState<Phase>('match');
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [quizSelected, setQuizSelected] = useState<number | null>(null);

  const allMatched = picks.size === matchItems.length;
  const matchScore = useMemo(() => scoreMatching(matchItems, picks), [matchItems, picks]);
  const quizScore = useMemo(() => scoreFeatureQuiz(SECURITY_FEATURES, quizAnswers), [quizAnswers]);
  const reward = useMemo(() => calcBanknoteReward(matchScore, quizScore), [matchScore, quizScore]);

  const handlePick = (figure: string, value: number) => {
    if (phase !== 'match') return;
    setPicks(prev => {
      const next = new Map(prev);
      next.set(figure, value);
      return next;
    });
  };

  const currentQuiz = SECURITY_FEATURES[quizIndex];

  const handleQuizPick = (idx: number) => {
    if (quizSelected !== null) return;
    setQuizSelected(idx);
    setQuizAnswers(prev => [...prev, idx]);
  };

  const handleQuizNext = () => {
    if (quizIndex === SECURITY_FEATURES.length - 1) {
      setPhase('done');
    } else {
      setQuizIndex(i => i + 1);
      setQuizSelected(null);
    }
  };

  const handleReplay = () => {
    setPicks(new Map());
    setPhase('match');
    setQuizIndex(0);
    setQuizAnswers([]);
    setQuizSelected(null);
  };

  const handleFinish = () => {
    onComplete?.(reward);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fadeIn">
      <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-md w-full max-h-[90dvh] overflow-y-auto" dir="rtl">
        <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-5 rounded-t-[2.5rem] text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 left-4 p-2 hover:bg-white/20 rounded-full transition-colors"
            aria-label="סגור"
          >
            <X size={20} />
          </button>
          <div className="flex items-center gap-3">
            <BanknoteIcon size={26} />
            <div>
              <h2 className="text-xl font-black">השטרות הישראלים</h2>
              <p className="text-xs opacity-90">מי על איזה שטר? ולמה יש סימני אבטחה?</p>
            </div>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {phase === 'match' && (
            <>
              <Card className="bg-amber-50 border-2 border-amber-100">
                <p className="text-xs text-amber-800 font-bold">
                  שלב 1: התאם את הדמות לשטר הנכון. כל דמות מופיעה על שטר אחר.
                </p>
              </Card>

              {figures.map(figure => {
                const item = matchItems.find(m => m.figure === figure)!;
                const chosen = picks.get(figure);
                return (
                  <Card key={figure} className="border border-slate-200">
                    <p className="text-sm font-black text-slate-800 mb-2">{figure}</p>
                    <p className="text-[11px] text-slate-500 mb-2 leading-tight">{
                      BANKNOTES.find(b => b.figure === figure)?.figureHint
                    }</p>
                    <div className="flex gap-2">
                      {BANKNOTES.map(n => {
                        const isChosen = chosen === n.value;
                        const isCorrect = isChosen && item.correctValue === n.value;
                        return (
                          <button
                            key={n.value}
                            type="button"
                            onClick={() => handlePick(figure, n.value)}
                            className={`flex-1 rounded-xl p-1 transition-all border-2 ${
                              isChosen
                                ? isCorrect
                                  ? 'border-emerald-500 bg-emerald-50'
                                  : 'border-rose-400 bg-rose-50'
                                : 'border-transparent hover:border-slate-300'
                            }`}
                            aria-label={`${n.value} שקלים`}
                          >
                            <BillSwatch note={n} small />
                          </button>
                        );
                      })}
                    </div>
                  </Card>
                );
              })}

              <Button
                variant="academy"
                disabled={!allMatched}
                onClick={() => setPhase('reveal')}
              >
                {allMatched ? 'בדוק את התשובות' : `${picks.size}/${matchItems.length} הותאמו`}
              </Button>
            </>
          )}

          {phase === 'reveal' && (
            <>
              <Card className="border-2 border-amber-200 bg-amber-50 text-center">
                <p className="text-xs font-bold text-amber-800">תוצאת ההתאמה</p>
                <div className="text-3xl font-black text-amber-900 mt-1">
                  {matchScore.correct} / {matchScore.total}
                </div>
              </Card>

              {BANKNOTES.map(n => (
                <Card key={n.value} className="border border-slate-100">
                  <div className="flex items-center gap-3">
                    <BillSwatch note={n} />
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-slate-800 text-sm">{n.figure}</p>
                      <p className="text-[11px] text-slate-500 leading-tight">{n.funFact}</p>
                    </div>
                  </div>
                </Card>
              ))}

              <Button variant="academy" onClick={() => setPhase('quiz')}>
                המשך לשאלות אבטחה ←
              </Button>
            </>
          )}

          {phase === 'quiz' && currentQuiz && (
            <>
              <Card className="bg-amber-50 border-2 border-amber-100">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-bold text-amber-800">
                    שאלה {quizIndex + 1} מתוך {SECURITY_FEATURES.length}
                  </p>
                </div>
                <p className="text-sm md:text-base font-bold text-amber-900">
                  {currentQuiz.question}
                </p>
              </Card>

              <div className="space-y-2">
                {currentQuiz.options.map((opt, i) => {
                  const isPicked = quizSelected === i;
                  const isCorrect = i === currentQuiz.correctIndex;
                  const showResult = quizSelected !== null;
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleQuizPick(i)}
                      disabled={showResult}
                      className={`w-full text-right p-3 rounded-2xl border-2 font-bold text-sm transition-all ${
                        showResult
                          ? isCorrect
                            ? 'bg-emerald-50 border-emerald-400 text-emerald-800'
                            : isPicked
                              ? 'bg-rose-50 border-rose-400 text-rose-800'
                              : 'bg-white border-slate-200 text-slate-500 opacity-60'
                          : 'bg-white border-slate-200 hover:border-amber-300 text-slate-700'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        {showResult && isCorrect && <CheckCircle size={16} className="text-emerald-600" />}
                        {showResult && isPicked && !isCorrect && <XCircle size={16} className="text-rose-600" />}
                        {opt}
                      </span>
                    </button>
                  );
                })}
              </div>

              {quizSelected !== null && (
                <>
                  <Card className="border border-amber-200 bg-amber-50">
                    <p className="text-xs font-black text-amber-800 mb-1">💡 הסבר</p>
                    <p className="text-xs text-amber-700 leading-relaxed">
                      {currentQuiz.explanation}
                    </p>
                  </Card>
                  <Button variant="academy" onClick={handleQuizNext}>
                    {quizIndex === SECURITY_FEATURES.length - 1 ? 'ראה תוצאה' : 'הבא'} ←
                  </Button>
                </>
              )}
            </>
          )}

          {phase === 'done' && (
            <>
              <Card className="bg-gradient-to-br from-amber-400 to-orange-500 text-white border-0 text-center">
                <div className="text-5xl mb-2">🎉</div>
                <p className="text-lg font-black">סיימת!</p>
                <p className="text-sm opacity-90 mt-1">
                  התאמות: {matchScore.correct}/{matchScore.total} • אבטחה: {quizScore.correct}/{quizScore.total}
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

export default BanknoteGame;
