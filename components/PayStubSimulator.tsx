import React, { useState, useMemo } from 'react';
import { X, Wallet, TrendingDown, PiggyBank, Trophy } from 'lucide-react';
import { Card, Button } from './UI';
import { calcPayStub } from '../utils/payStub';

interface PayStubSimulatorProps {
  onClose: () => void;
  onComplete?: () => void;
}

const PRESETS = [
  { label: 'עבודה במכולת', gross: 3000 },
  { label: 'משרה חלקית', gross: 6000 },
  { label: 'משרה מלאה', gross: 12000 },
  { label: 'משכורת גבוהה', gross: 22000 },
];

export const PayStubSimulator: React.FC<PayStubSimulatorProps> = ({ onClose, onComplete }) => {
  const [gross, setGross] = useState(6000);
  const [showResult, setShowResult] = useState(false);

  const breakdown = useMemo(() => calcPayStub(gross), [gross]);
  const takeHomePct = Math.round((breakdown.net / gross) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fadeIn">
      <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-md w-full max-h-[90dvh] overflow-y-auto" dir="rtl">
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-6 rounded-t-[2.5rem] text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 left-4 p-2 hover:bg-white/20 rounded-full transition-colors"
            aria-label="סגור"
          >
            <X size={20} />
          </button>
          <div className="flex items-center gap-3 mb-1">
            <Wallet size={28} />
            <h2 className="text-2xl font-black">תלוש שכר</h2>
          </div>
          <p className="text-sm opacity-90">
            כשעובדים מקבלים משכורת, לא כל הסכום באמת מגיע לחשבון. בוא נראה למה!
          </p>
        </div>

        <div className="p-5 space-y-5">
          {!showResult ? (
            <>
              <Card className="border-2 border-emerald-100 bg-emerald-50">
                <p className="text-xs font-bold text-emerald-700 mb-1">משכורת ברוטו (לפני ניכויים)</p>
                <div className="text-4xl font-black text-emerald-800 mb-3">
                  {gross.toLocaleString('he-IL')} ₪
                </div>
                <input
                  type="range"
                  min={3000}
                  max={25000}
                  step={500}
                  value={gross}
                  onChange={(e) => setGross(Number(e.target.value))}
                  className="w-full accent-emerald-600"
                  aria-label="משכורת ברוטו"
                />
                <div className="flex justify-between text-[10px] text-emerald-700 font-bold mt-1">
                  <span>3,000</span>
                  <span>25,000</span>
                </div>
              </Card>

              <div>
                <p className="text-xs font-bold text-slate-600 mb-2">או בחר דוגמה:</p>
                <div className="grid grid-cols-2 gap-2">
                  {PRESETS.map(p => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => setGross(p.gross)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border-2 transition-all ${
                        gross === p.gross
                          ? 'bg-emerald-500 text-white border-emerald-500'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-300'
                      }`}
                    >
                      {p.label}
                      <div className="text-[10px] opacity-80">{p.gross.toLocaleString('he-IL')}₪</div>
                    </button>
                  ))}
                </div>
              </div>

              <Button onClick={() => setShowResult(true)} variant="success">
                גלה כמה באמת מגיע <TrendingDown size={18} />
              </Button>
            </>
          ) : (
            <>
              <Card className="border-2 border-emerald-100 bg-emerald-50 text-center">
                <p className="text-xs font-bold text-emerald-700">ברוטו</p>
                <div className="text-2xl font-black text-emerald-800">
                  {gross.toLocaleString('he-IL')} ₪
                </div>
              </Card>

              <div className="space-y-2">
                <DeductionRow
                  icon="🏥"
                  label="ביטוח לאומי + בריאות"
                  amount={breakdown.bituachLeumi}
                  hint="לבריאות ולפנסיה כשנהיה זקנים"
                />
                <DeductionRow
                  icon="🏛️"
                  label="מס הכנסה"
                  amount={breakdown.incomeTax}
                  hint="המדינה משתמשת בזה לבתי ספר, כבישים, צבא"
                />
                <DeductionRow
                  icon="🏦"
                  label="פנסיה חובה"
                  amount={breakdown.pension}
                  hint="חיסכון לטווח ארוך לפנסיה"
                />
              </div>

              <Card className="border-2 border-indigo-300 bg-gradient-to-br from-indigo-50 to-purple-50">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-black text-indigo-800">נטו — מה שמגיע באמת</p>
                  <span className="text-xs bg-indigo-200 text-indigo-900 font-black px-2 py-0.5 rounded-full">
                    {takeHomePct}% מהברוטו
                  </span>
                </div>
                <div className="text-4xl font-black text-indigo-900">
                  {breakdown.net.toLocaleString('he-IL')} ₪
                </div>
                <p className="text-xs text-indigo-700 mt-2 flex items-center gap-1">
                  <PiggyBank size={14} /> שווה תמיד לחסוך עוד 10% מזה לפני שמוציאים על דברים
                </p>
              </Card>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowResult(false)} className="flex-1">
                  נסה משכורת אחרת
                </Button>
                <Button
                  variant="success"
                  onClick={() => {
                    onComplete?.();
                    onClose();
                  }}
                  className="flex-1"
                >
                  הבנתי! <Trophy size={16} />
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const DeductionRow: React.FC<{ icon: string; label: string; amount: number; hint: string }> = ({
  icon,
  label,
  amount,
  hint,
}) => (
  <div className="bg-rose-50 border border-rose-100 rounded-2xl p-3 flex items-start gap-3">
    <div className="text-2xl shrink-0">{icon}</div>
    <div className="flex-1 min-w-0">
      <div className="flex justify-between items-baseline gap-2">
        <p className="font-black text-rose-800 text-sm">{label}</p>
        <p className="font-black text-rose-700 text-base shrink-0">−{amount.toLocaleString('he-IL')} ₪</p>
      </div>
      <p className="text-[11px] text-rose-600 mt-0.5 leading-tight">{hint}</p>
    </div>
  </div>
);

export default PayStubSimulator;
