import React, { useState } from 'react';
import { Info, X } from 'lucide-react';

interface VatBreakdownProps {
  price: number;
  vatRate?: number;
}

/**
 * Israeli VAT (מע"מ) is 18% as of 2025-2026. Standard retail prices in Israel
 * are quoted including VAT, so this component shows the kid how much of any
 * sticker price is actually the tax. Tapping the info icon expands an inline
 * breakdown.
 */
export const VatBreakdown: React.FC<VatBreakdownProps> = ({ price, vatRate = 0.18 }) => {
  const [open, setOpen] = useState(false);
  // price = base * (1 + vatRate)  →  base = price / (1 + vatRate)
  const base = Math.round((price / (1 + vatRate)) * 100) / 100;
  const vat = Math.round((price - base) * 100) / 100;

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
        className="inline-flex items-center justify-center p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        aria-label="פירוט מע״מ"
      >
        <Info size={12} />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white rounded-3xl p-5 max-w-xs w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            dir="rtl"
          >
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-black text-slate-800 text-base">מתוך {price} ₪</h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-slate-400 hover:text-slate-700"
                aria-label="סגור"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-2">
              <div className="bg-slate-50 p-2 rounded-xl flex justify-between items-baseline">
                <span className="text-xs font-bold text-slate-600">מחיר בלי מע״מ</span>
                <span className="font-black text-slate-800 text-sm">{base.toFixed(2)} ₪</span>
              </div>
              <div className="bg-amber-50 border border-amber-100 p-2 rounded-xl flex justify-between items-baseline">
                <span className="text-xs font-bold text-amber-700">מע״מ ({Math.round(vatRate * 100)}%)</span>
                <span className="font-black text-amber-800 text-sm">{vat.toFixed(2)} ₪</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 mt-3 leading-tight">
              💡 בכל פעם שקונים משהו בארץ, המדינה מקבלת {Math.round(vatRate * 100)}% מהמחיר. הכסף הזה משלם
              עבור בתי ספר, כבישים וצבא.
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default VatBreakdown;
