import React, { useState } from 'react';
import { X, TrendingUp, TrendingDown, Trophy, RotateCcw } from 'lucide-react';
import { Card, Button } from './UI';
import {
  AssetKey,
  Allocation,
  runYear,
  ASSET_LABEL,
  ASSET_DESCRIPTION,
  SimulationResult,
} from '../utils/investing';

interface InvestingSimulatorProps {
  onClose: () => void;
  onComplete?: () => void;
}

const ASSET_COLOR: Record<AssetKey, { ring: string; fill: string; text: string; bg: string }> = {
  savings: { ring: 'border-emerald-400', fill: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50' },
  bond:    { ring: 'border-sky-400',     fill: 'bg-sky-500',     text: 'text-sky-700',     bg: 'bg-sky-50' },
  stock:   { ring: 'border-rose-400',    fill: 'bg-rose-500',    text: 'text-rose-700',    bg: 'bg-rose-50' },
};

const STEP = 100;

export const InvestingSimulator: React.FC<InvestingSimulatorProps> = ({ onClose, onComplete }) => {
  const [allocation, setAllocation] = useState<Allocation>({ savings: 400, bond: 300, stock: 300 });
  const [result, setResult] = useState<SimulationResult | null>(null);

  const total = allocation.savings + allocation.bond + allocation.stock;
  const remaining = 1000 - total;

  const adjust = (asset: AssetKey, delta: number) => {
    setAllocation(prev => {
      const next = { ...prev };
      const candidate = next[asset] + delta;
      if (candidate < 0) return prev;
      // Don't allow the new total to exceed 1000
      const newTotal = total - prev[asset] + candidate;
      if (newTotal > 1000) return prev;
      next[asset] = candidate;
      return next;
    });
  };

  const handleRun = () => {
    if (total !== 1000) return;
    setResult(runYear(allocation));
  };

  const handleReset = () => {
    setAllocation({ savings: 400, bond: 300, stock: 300 });
    setResult(null);
  };

  const handleFinish = () => {
    onComplete?.();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fadeIn">
      <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-md w-full max-h-[90dvh] overflow-y-auto" dir="rtl">
        <div className="bg-gradient-to-r from-violet-500 to-indigo-600 p-5 rounded-t-[2.5rem] text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 left-4 p-2 hover:bg-white/20 rounded-full transition-colors"
            aria-label="סגור"
          >
            <X size={20} />
          </button>
          <div className="flex items-center gap-3">
            <TrendingUp size={26} />
            <div>
              <h2 className="text-xl font-black">סיכון מול תשואה</h2>
              <p className="text-xs opacity-90">חלק 1,000 ₪ לשנה אחת — איך תחלק?</p>
            </div>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {!result ? (
            <>
              <Card className="bg-violet-50 border-2 border-violet-100 text-center">
                <p className="text-xs font-bold text-violet-700">סך הכל הוקצה</p>
                <p className={`text-3xl font-black ${total === 1000 ? 'text-violet-900' : 'text-amber-700'}`}>
                  {total} / 1,000 ₪
                </p>
                {remaining !== 0 && (
                  <p className="text-xs text-amber-700 font-bold">
                    {remaining > 0 ? `נותרו ${remaining} ₪` : `חרגת ב-${-remaining} ₪`}
                  </p>
                )}
              </Card>

              {(['savings', 'bond', 'stock'] as AssetKey[]).map(asset => {
                const c = ASSET_COLOR[asset];
                const value = allocation[asset];
                const pct = Math.round((value / 1000) * 100);
                return (
                  <Card key={asset} className={`border-2 ${c.ring} ${c.bg}`}>
                    <div className="flex justify-between items-baseline mb-1">
                      <p className={`font-black text-sm ${c.text}`}>{ASSET_LABEL[asset]}</p>
                      <p className={`font-black text-lg ${c.text}`}>{value} ₪</p>
                    </div>
                    <p className="text-[11px] text-slate-500 mb-2">{ASSET_DESCRIPTION[asset]}</p>
                    <div className="w-full h-2 bg-white rounded-full overflow-hidden mb-2">
                      <div className={`h-full ${c.fill} transition-all`} style={{ width: `${pct}%` }} />
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => adjust(asset, -STEP)}
                        disabled={value === 0}
                        className="flex-1 py-1.5 bg-white border-2 border-slate-200 hover:border-slate-400 rounded-xl font-black text-sm disabled:opacity-40"
                      >
                        −{STEP}
                      </button>
                      <button
                        type="button"
                        onClick={() => adjust(asset, STEP)}
                        disabled={remaining <= 0}
                        className="flex-1 py-1.5 bg-white border-2 border-slate-200 hover:border-slate-400 rounded-xl font-black text-sm disabled:opacity-40"
                      >
                        +{STEP}
                      </button>
                    </div>
                  </Card>
                );
              })}

              <Button variant="academy" disabled={total !== 1000} onClick={handleRun}>
                {total === 1000 ? 'הרץ שנה אחת' : `קבע ${remaining > 0 ? 'עוד' : 'פחות'} ${Math.abs(remaining)} ₪`}
              </Button>
            </>
          ) : (
            <>
              <Card
                className={`border-2 text-center ${
                  result.returnPct >= 0
                    ? 'border-emerald-200 bg-emerald-50'
                    : 'border-rose-200 bg-rose-50'
                }`}
              >
                <p className="text-xs font-bold text-slate-600">אחרי שנה</p>
                <div className={`text-4xl font-black ${result.returnPct >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {result.final.toLocaleString('he-IL')} ₪
                </div>
                <p className={`text-sm font-bold flex items-center justify-center gap-1 mt-1 ${
                  result.returnPct >= 0 ? 'text-emerald-700' : 'text-rose-700'
                }`}>
                  {result.returnPct >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  {result.returnPct >= 0 ? '+' : ''}{result.returnPct.toFixed(1)}%
                </p>
              </Card>

              <div className="space-y-2">
                {result.byAsset.map(row => {
                  const c = ASSET_COLOR[row.asset];
                  const delta = row.final - row.invested;
                  return (
                    <div key={row.asset} className={`border ${c.ring.replace('border-', 'border-')} ${c.bg} rounded-2xl p-3`}>
                      <div className="flex justify-between items-baseline">
                        <p className={`font-black text-sm ${c.text}`}>{ASSET_LABEL[row.asset]}</p>
                        <p className={`text-xs font-bold ${row.returnPct >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                          {row.returnPct >= 0 ? '+' : ''}{row.returnPct.toFixed(1)}%
                        </p>
                      </div>
                      <div className="flex justify-between items-baseline text-[11px] mt-1">
                        <span className="text-slate-500">{row.invested} ₪ → {row.final} ₪</span>
                        <span className={delta >= 0 ? 'text-emerald-700 font-black' : 'text-rose-700 font-black'}>
                          {delta >= 0 ? '+' : ''}{delta} ₪
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <Card className="border border-amber-200 bg-amber-50">
                <p className="text-xs font-bold text-amber-800">💡 לקח</p>
                <p className="text-xs text-amber-700 leading-relaxed mt-1">
                  סיכון גבוה מביא רווח אפשרי גבוה — וגם הפסד אפשרי. חיסכון בטוח לא יוצא הפסד, אבל גם
                  לא יוצא רווח גדול. רוב המבוגרים מחזיקים תמהיל — קצת מכל סוג.
                </p>
              </Card>

              <div className="flex gap-2">
                <Button variant="outline" onClick={handleReset} className="flex-1">
                  <RotateCcw size={14} /> שוב
                </Button>
                <Button variant="academy" onClick={handleFinish} className="flex-1">
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

export default InvestingSimulator;
