import React, { useState } from 'react';
import { X, Trophy, RotateCcw, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, Button } from './UI';
import {
  PRODUCTS,
  ProductKey,
  DayPlan,
  RunResult,
  DayResult,
  runWeek,
  getProduct,
  WEATHER_LABEL,
} from '../utils/lemonadeStand';

interface LemonadeStandProps {
  onClose: () => void;
  onComplete?: (totalProfit: number) => void;
}

const DAYS = 7;

const blankPlan = (): DayPlan => ({ product: 'lemonade', price: 4, unitsStocked: 20 });

export const LemonadeStand: React.FC<LemonadeStandProps> = ({ onClose, onComplete }) => {
  const [phase, setPhase] = useState<'plan' | 'result'>('plan');
  // For simplicity, the kid plans one strategy and we apply it for all 7 days.
  // This keeps cognitive load reasonable for a first entrepreneurship lesson.
  const [plan, setPlan] = useState<DayPlan>(blankPlan());
  const [result, setResult] = useState<RunResult | null>(null);

  const product = getProduct(plan.product);
  const margin = plan.price - product.unitCost;
  const breakEvenUnits = product.unitCost > 0 && plan.price > product.unitCost
    ? Math.ceil((plan.unitsStocked * product.unitCost) / plan.price)
    : 0;

  const handleRun = () => {
    const plans = Array.from({ length: DAYS }, () => ({ ...plan }));
    setResult(runWeek(plans));
    setPhase('result');
  };

  const handleReset = () => {
    setPlan(blankPlan());
    setResult(null);
    setPhase('plan');
  };

  const handleFinish = () => {
    onComplete?.(result?.totalProfit ?? 0);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fadeIn">
      <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-md w-full max-h-[90dvh] overflow-y-auto" dir="rtl">
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-5 rounded-t-[2.5rem] text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 left-4 p-2 hover:bg-white/20 rounded-full transition-colors"
            aria-label="סגור"
          >
            <X size={20} />
          </button>
          <h2 className="text-xl font-black">דוכן לימונדה</h2>
          <p className="text-xs opacity-90">תפתח עסק קטן ל-7 ימים. כמה רווח תצליח?</p>
        </div>

        <div className="p-5 space-y-4">
          {phase === 'plan' && (
            <>
              <div>
                <p className="text-xs font-black text-slate-700 mb-2">מה אתה מוכר?</p>
                <div className="grid grid-cols-3 gap-2">
                  {PRODUCTS.map(p => {
                    const selected = plan.product === p.key;
                    return (
                      <button
                        key={p.key}
                        type="button"
                        onClick={() => setPlan(prev => ({ ...prev, product: p.key, price: p.sweetSpotPrice }))}
                        className={`p-3 rounded-2xl border-2 transition-all ${
                          selected
                            ? 'bg-amber-500 text-white border-amber-500'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-amber-300'
                        }`}
                      >
                        <div className="text-2xl">{p.icon}</div>
                        <div className="text-[11px] font-black mt-1">{p.label}</div>
                        <div className={`text-[10px] mt-0.5 ${selected ? 'opacity-90' : 'text-slate-500'}`}>
                          עלות: {p.unitCost}₪
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <Card className="bg-amber-50 border-2 border-amber-100">
                <label className="block">
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="text-xs font-bold text-amber-800">מחיר ליחידה</span>
                    <span className="text-lg font-black text-amber-900">{plan.price.toFixed(1)} ₪</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={15}
                    step={0.5}
                    value={plan.price}
                    onChange={(e) => setPlan(prev => ({ ...prev, price: Number(e.target.value) }))}
                    className="w-full accent-amber-600"
                    aria-label="מחיר"
                  />
                  <div className="flex justify-between text-[10px] text-amber-700 font-bold">
                    <span>זול</span>
                    <span>אופטימלי: {product.sweetSpotPrice}₪</span>
                    <span>יקר</span>
                  </div>
                </label>
                <p className={`text-[11px] font-bold mt-2 ${margin > 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                  רווח גולמי על יחידה: {margin.toFixed(1)} ₪
                </p>
              </Card>

              <Card className="bg-sky-50 border-2 border-sky-100">
                <label className="block">
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="text-xs font-bold text-sky-800">כמה יחידות להכין ביום</span>
                    <span className="text-lg font-black text-sky-900">{plan.unitsStocked}</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={50}
                    step={5}
                    value={plan.unitsStocked}
                    onChange={(e) => setPlan(prev => ({ ...prev, unitsStocked: Number(e.target.value) }))}
                    className="w-full accent-sky-600"
                    aria-label="מלאי יומי"
                  />
                  <div className="flex justify-between text-[10px] text-sky-700 font-bold">
                    <span>0</span>
                    <span>50</span>
                  </div>
                </label>
                <div className="grid grid-cols-2 gap-2 mt-2 text-[11px]">
                  <div className="bg-white rounded-lg p-1.5">
                    <div className="text-slate-500">עלות יומית</div>
                    <div className="font-black text-slate-800">
                      {(plan.unitsStocked * product.unitCost).toFixed(1)} ₪
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-1.5">
                    <div className="text-slate-500">נקודת איזון</div>
                    <div className="font-black text-slate-800">{breakEvenUnits} יחידות</div>
                  </div>
                </div>
              </Card>

              <Card className="border border-slate-200 bg-slate-50">
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  💡 <strong>טיפ:</strong> מחיר נמוך מדי = מעט רווח לכל יחידה. גבוה מדי = פחות לקוחות.
                  אם מכינים יותר מדי ולא מוכרים — הכל הולך לפח. מזג האוויר משפיע הרבה.
                </p>
              </Card>

              <Button variant="warning" onClick={handleRun}>
                התחל שבוע 🚀
              </Button>
            </>
          )}

          {phase === 'result' && result && (
            <>
              <Card
                className={`border-2 text-center ${
                  result.totalProfit >= 0
                    ? 'border-emerald-300 bg-emerald-50'
                    : 'border-rose-300 bg-rose-50'
                }`}
              >
                <p className="text-xs font-bold text-slate-600">רווח השבוע</p>
                <div className={`text-4xl font-black ${result.totalProfit >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {result.totalProfit >= 0 ? '+' : ''}{result.totalProfit.toFixed(2)} ₪
                </div>
                <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-200 text-[11px]">
                  <div>
                    <div className="text-slate-500">הכנסות</div>
                    <div className="font-black text-slate-800">{result.totalRevenue.toFixed(2)} ₪</div>
                  </div>
                  <div>
                    <div className="text-slate-500">עלויות</div>
                    <div className="font-black text-slate-800">{result.totalCost.toFixed(2)} ₪</div>
                  </div>
                  <div>
                    <div className="text-slate-500">נמכרו</div>
                    <div className="font-black text-slate-800">{result.totalUnitsSold}/{result.totalUnitsStocked}</div>
                  </div>
                </div>
              </Card>

              <div className="space-y-1.5">
                {result.days.map((d: DayResult) => (
                  <div key={d.day} className="flex items-center gap-2 bg-white border border-slate-100 rounded-xl p-2 text-xs">
                    <div className="w-6 text-center font-black text-slate-500">{d.day}</div>
                    <div className="text-base shrink-0">{WEATHER_LABEL[d.weather].emoji}</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-slate-700">{WEATHER_LABEL[d.weather].label}</div>
                      <div className="text-[10px] text-slate-500">
                        נמכרו {d.unitsSold}/{d.plan.unitsStocked}
                      </div>
                    </div>
                    <div className={`font-black ${d.profit >= 0 ? 'text-emerald-700' : 'text-rose-700'} text-sm flex items-center gap-0.5`}>
                      {d.profit >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                      {d.profit >= 0 ? '+' : ''}{d.profit.toFixed(1)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={handleReset} className="flex-1">
                  <RotateCcw size={14} /> שבוע חדש
                </Button>
                <Button variant="warning" onClick={handleFinish} className="flex-1">
                  <Trophy size={14} /> סיימתי
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LemonadeStand;
