import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { Button, Card } from './UI';

interface OnboardingNameEntryProps {
  onSubmit: (name: string) => void;
}

/**
 * First-launch screen: ask the kid for their name so the rest of the app
 * can greet them by name. Trims input and rejects empty / whitespace-only.
 */
export const OnboardingNameEntry: React.FC<OnboardingNameEntryProps> = ({ onSubmit }) => {
  const [name, setName] = useState('');
  const trimmed = name.trim();
  const isValid = trimmed.length >= 1 && trimmed.length <= 20;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValid) onSubmit(trimmed);
  };

  return (
    <div className="w-full h-full flex items-center justify-center p-4 md:p-6 animate-fadeIn">
      <Card className="w-full max-w-md bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-100">
        <div className="text-center mb-6">
          <div className="text-6xl md:text-7xl mb-3">🐿️</div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-800 mb-2">
            שלום! אני סנאי החיסכון
          </h1>
          <p className="text-sm md:text-base text-slate-600">
            איך קוראים לך? אני אקרא לך בשם כל פעם שניפגש
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="kid-name" className="block text-sm font-bold text-slate-700 mb-2">
              השם שלי הוא...
            </label>
            <input
              id="kid-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={20}
              autoFocus
              placeholder="לדוגמה: דניאל"
              className="w-full bg-white border-2 border-indigo-200 focus:border-indigo-500 outline-none rounded-2xl px-4 py-3 text-lg font-bold text-slate-800 text-center"
              dir="rtl"
            />
            <p className="text-xs text-slate-500 mt-2 text-center">
              עד 20 תווים • אפשר תמיד לשנות
            </p>
          </div>

          <Button
            type="submit"
            disabled={!isValid}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white"
          >
            <Sparkles size={18} /> בוא נתחיל!
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default OnboardingNameEntry;
