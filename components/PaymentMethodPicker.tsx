import React from 'react';
import { X, Smartphone, CreditCard, Users } from 'lucide-react';
import { Reward } from '../types';

export type PaymentMethod = 'bit' | 'paybox' | 'credit';

interface PaymentMethodPickerProps {
  reward: Reward;
  onSelect: (method: PaymentMethod) => void;
  onCancel: () => void;
}

interface MethodOption {
  key: PaymentMethod;
  label: string;
  blurb: string;
  detail: string;
  Icon: React.ComponentType<{ size?: number; className?: string }>;
  fill: string;
  text: string;
  bg: string;
  border: string;
}

const METHODS: MethodOption[] = [
  {
    key: 'bit',
    label: 'BIT',
    blurb: 'מיידי מהחשבון',
    detail: 'הכסף יורד מהבנק שלך עכשיו, ישר. אם אין מספיק — העסקה לא תתבצע.',
    Icon: Smartphone,
    fill: 'bg-blue-500',
    text: 'text-blue-900',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
  },
  {
    key: 'paybox',
    label: 'PayBox',
    blurb: 'בין חברים',
    detail: 'בעיקר מיועד להעברות בין אנשים. גם כאן הכסף יורד מהחשבון, אבל הרבה משתמשים בזה כדי לחלק חשבון.',
    Icon: Users,
    fill: 'bg-emerald-500',
    text: 'text-emerald-900',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
  },
  {
    key: 'credit',
    label: 'אשראי',
    blurb: 'תשלום פעם בחודש',
    detail: 'הכסף לא יורד עכשיו — תקבל חשבון בסוף החודש לכל הקניות יחד. צריך להיזהר לא להוציא יותר ממה שיש לך.',
    Icon: CreditCard,
    fill: 'bg-amber-500',
    text: 'text-amber-900',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
  },
];

/**
 * Pre-purchase modal that teaches the difference between debit-like (BIT,
 * PayBox) and credit-like payment. Picking any option completes the purchase
 * the same way — the educational value is in the explanation, not in
 * different actual outcomes.
 */
export const PaymentMethodPicker: React.FC<PaymentMethodPickerProps> = ({ reward, onSelect, onCancel }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fadeIn">
      <div className="bg-white rounded-[2rem] shadow-2xl max-w-sm w-full max-h-[90dvh] overflow-y-auto" dir="rtl">
        <div className="bg-gradient-to-r from-slate-700 to-slate-900 p-5 rounded-t-[2rem] text-white relative">
          <button
            onClick={onCancel}
            className="absolute top-3 left-3 p-2 hover:bg-white/20 rounded-full transition-colors"
            aria-label="ביטול"
          >
            <X size={18} />
          </button>
          <p className="text-xs opacity-80">קנייה: {reward.icon} {reward.name}</p>
          <p className="text-2xl font-black mt-1">{reward.price} ₪</p>
          <p className="text-sm opacity-90 mt-1">איך תרצה לשלם?</p>
        </div>

        <div className="p-4 space-y-2">
          {METHODS.map(m => (
            <button
              key={m.key}
              type="button"
              onClick={() => onSelect(m.key)}
              className={`w-full text-right p-3 rounded-2xl border-2 ${m.border} ${m.bg} hover:brightness-95 transition-all flex gap-3 items-start`}
            >
              <div className={`${m.fill} text-white p-2 rounded-xl shrink-0`}>
                <m.Icon size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`font-black text-sm ${m.text}`}>{m.label}</span>
                  <span className={`text-[10px] font-bold ${m.text} opacity-70`}>{m.blurb}</span>
                </div>
                <p className="text-[11px] text-slate-600 mt-1 leading-tight">{m.detail}</p>
              </div>
            </button>
          ))}

          <p className="text-[11px] text-slate-500 text-center pt-2 leading-tight">
            כל אמצעי תשלום יקנה לך את הפריט — ההבדל הוא רק <strong>מתי הכסף בעצם יורד</strong>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentMethodPicker;
