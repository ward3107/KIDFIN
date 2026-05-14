import React, { useState, useMemo } from 'react';
import { X, Baby, TrendingUp, Trophy, Coins } from 'lucide-react';
import { Card, Button } from './UI';
import { projectChildSavings, SavingsTrack, ANNUAL_RATE } from '../utils/childSavings';

interface ChildSavingsSimulatorProps {
  onClose: () => void;
  onComplete?: () => void;
}

const fmt = (n: number) => n.toLocaleString('he-IL');

export const ChildSavingsSimulator: React.FC<ChildSavingsSimulatorProps> = ({ onClose, onComplete }) => {
  const [ageNow, setAgeNow] = useState(10);
  const [parentMonthly, setParentMonthly] = useState(0);
  const [track, setTrack] = useState<SavingsTrack>('bank');

  const result = useMemo(
    () =>
      projectChildSavings({
        ageNow,
        startingBalance: 0,
        monthlyBituachLeumi: 57,
        monthlyParent: parentMonthly,
        track,
      }),
    [ageNow, parentMonthly, track]
  );

  // What would the same money do without parent matching, for comparison?
  const withoutParent = useMemo(
    () =>
      projectChildSavings({
        ageNow,
        startingBalance: 0,
        monthlyBituachLeumi: 57,
        monthlyParent: 0,
        track,
      }),
    [ageNow, track]
  );

  const parentImpact = result.finalAt18 - withoutParent.finalAt18;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fadeIn">
      <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-md w-full max-h-[90dvh] overflow-y-auto" dir="rtl">
        <div className="bg-gradient-to-r from-sky-500 to-blue-600 p-5 rounded-t-[2.5rem] text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 left-4 p-2 hover:bg-white/20 rounded-full transition-colors"
            aria-label="סגור"
          >
            <X size={20} />
          </button>
          <div className="flex items-center gap-3">
            <Baby size={28} />
            <div>
              <h2 className="text-xl font-black">חיסכון לכל ילד</h2>
              <p className="text-xs opacity-90">כמה יהיה לך בגיל 18?</p>
            </div>
          </div>
        </div>

        <div className="p-5 space-y-4">
          <Card className="bg-sky-50 border-2 border-sky-100">
            <p className="text-xs text-sky-700 mb-3 leading-relaxed">
              ביטוח לאומי מפקיד לך{' '}
              <span className="font-black text-sky-900">57 ₪</span> כל חודש מהלידה ועד גיל 18.
              ההורים שלך יכולים להוסיף עד 57 ₪ נוספים. בוא נראה כמה זה יוצא.
            </p>

            <label className="block">
              <span className="text-xs font-bold text-sky-800">הגיל שלי עכשיו</span>
              <div className="flex items-center gap-3 mt-1">
                <input
                  type="range"
                  min={0}
                  max={17}
                  value={ageNow}
                  onChange={(e) => setAgeNow(Number(e.target.value))}
                  className="flex-1 accent-sky-600"
                  aria-label="גיל"
                />
                <span className="text-lg font-black text-sky-900 w-8 text-center">{ageNow}</span>
              </div>
            </label>
          </Card>

          <Card className="border-2 border-purple-100 bg-purple-50">
            <label className="block">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-800">הוספה חודשית מההורים</span>
                <span className="text-base font-black text-purple-900">{parentMonthly} ₪</span>
              </div>
              <input
                type="range"
                min={0}
                max={210}
                step={10}
                value={parentMonthly}
                onChange={(e) => setParentMonthly(Number(e.target.value))}
                className="w-full accent-purple-600 mt-2"
                aria-label="הוספת הורים"
              />
              <div className="flex justify-between text-[10px] text-purple-700 font-bold">
                <span>0</span>
                <span>57 (כפול)</span>
                <span>210 (מקסימום מומלץ)</span>
              </div>
            </label>
          </Card>

          <div>
            <p className="text-xs font-bold text-slate-600 mb-2">איפה הכסף נשמר?</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTrack('bank')}
                className={`py-3 rounded-2xl text-sm font-black border-2 transition-all ${
                  track === 'bank'
                    ? 'bg-emerald-500 text-white border-emerald-500'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-300'
                }`}
              >
                <div>חשבון בבנק</div>
                <div className="text-[10px] opacity-80 font-bold">
                  {Math.round(ANNUAL_RATE.bank * 100)}% בשנה • בטוח
                </div>
              </button>
              <button
                type="button"
                onClick={() => setTrack('gemel')}
                className={`py-3 rounded-2xl text-sm font-black border-2 transition-all ${
                  track === 'gemel'
                    ? 'bg-indigo-500 text-white border-indigo-500'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300'
                }`}
              >
                <div>קופת גמל</div>
                <div className="text-[10px] opacity-80 font-bold">
                  {Math.round(ANNUAL_RATE.gemel * 100)}% בשנה • בסיכון
                </div>
              </button>
            </div>
          </div>

          <Card className="border-2 border-indigo-300 bg-gradient-to-br from-indigo-50 to-purple-50">
            <div className="flex items-baseline justify-between mb-1">
              <p className="text-xs font-black text-indigo-800">בגיל 18 יהיה לך</p>
              <span className="text-xs text-indigo-700 font-bold">
                {result.months} חודשים מהיום
              </span>
            </div>
            <div className="text-4xl font-black text-indigo-900">
              {fmt(result.finalAt18)} ₪
            </div>

            <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-indigo-200">
              <div>
                <p className="text-[10px] text-indigo-700 font-bold">הופקד בסך הכל</p>
                <p className="text-sm font-black text-indigo-900">{fmt(result.totalContributed)} ₪</p>
              </div>
              <div>
                <p className="text-[10px] text-indigo-700 font-bold flex items-center gap-1">
                  <TrendingUp size={10} /> ריבית הרוויחה לך
                </p>
                <p className="text-sm font-black text-emerald-700">+{fmt(result.interestEarned)} ₪</p>
              </div>
            </div>
          </Card>

          {parentMonthly > 0 && (
            <Card className="border border-purple-200 bg-purple-50">
              <p className="text-xs font-bold text-purple-800 flex items-center gap-1">
                <Coins size={14} /> ההוספה של ההורים שווה לך
              </p>
              <p className="text-lg font-black text-purple-900">
                +{fmt(parentImpact)} ₪ <span className="text-xs font-bold">בגיל 18</span>
              </p>
            </Card>
          )}

          <Card className="border border-amber-200 bg-amber-50">
            <p className="text-xs font-bold text-amber-800">💡 אם מחכים עד גיל 21:</p>
            <p className="text-lg font-black text-amber-900">{fmt(result.finalAt21)} ₪</p>
            <p className="text-[10px] text-amber-700 leading-tight mt-0.5">
              3 שנים נוספות של ריבית בלי להוסיף שקל
            </p>
          </Card>

          <Button
            variant="academy"
            onClick={() => {
              onComplete?.();
              onClose();
            }}
          >
            הבנתי <Trophy size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChildSavingsSimulator;
