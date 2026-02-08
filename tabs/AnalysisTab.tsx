import React from 'react';
import { PiggyBank, Trophy, AlertCircle, Sparkles } from 'lucide-react';
import { JourneyGuide, CurrentStepCard } from '../components/JourneyGuide';
import { useAppContext } from '../context/AppContext';

/**
 * Analysis tab component for financial behavior tracking and insights
 */
export const AnalysisTab: React.FC = () => {
  const { stats, userBehavior } = useAppContext();

  // Calculate insights from user behavior
  const needPurchases = userBehavior.purchases.filter((p) => p.type === 'need').length;
  const wantPurchases = userBehavior.purchases.filter((p) => p.type === 'want').length;
  const totalPurchases = userBehavior.purchases.length;
  const spendingRatio = totalPurchases > 0 ? (needPurchases / totalPurchases) * 100 : 0;

  // Generate insights based on behavior
  const insights = {
    strengths: [] as string[],
    weaknesses: [] as string[],
    tips: [] as string[],
  };

  if (spendingRatio >= 70) {
    insights.strengths.push('💪 מצוין! מתמקד בצרכים ולא ברצונות');
  } else if (spendingRatio >= 50) {
    insights.strengths.push('👍 איזון טוב בין צרכים לרצונות');
  } else if (totalPurchases > 0) {
    insights.weaknesses.push('⚠️ קונה הרבה רצונות, לא רק צרכים');
    insights.tips.push('💡 נסה לחשוב לפני קנייה - האם זה צורך או רצון?');
  }

  if (userBehavior.totalSpent < 500 && totalPurchases > 3) {
    insights.strengths.push('💰 שולט בהוצאות - מוציא בצמצום');
  } else if (userBehavior.totalSpent > 1500) {
    insights.weaknesses.push('💸 מוציא הרבה כסף');
    insights.tips.push('💡 כדאי להגדיל חיסכון לפני קניות גדולות');
  }

  if (stats.savings > 1000) {
    insights.strengths.push('🏦 חיסכון מרשים!');
  } else if (stats.savings < 300) {
    insights.weaknesses.push('📉 חיסכון נמוך מדי');
    insights.tips.push('💡 שמור לפחות 20% מכל הכנסה');
  }

  if (totalPurchases === 0) {
    insights.tips.push('🎯 התחל לקנות כדי לראות את הניתוח שלך!');
  }

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Current Step Card */}
      <CurrentStepCard />

      <h2 className="text-xl font-black text-slate-800 mb-4">ניתוח התנהגות פיננסית</h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-3 rounded-2xl text-white">
          <div className="text-[10px] opacity-80">סה"כ קניות</div>
          <div className="text-2xl font-black">{totalPurchases}</div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-3 rounded-2xl text-white">
          <div className="text-[10px] opacity-80">צרכים נקנו</div>
          <div className="text-2xl font-black">{needPurchases}</div>
        </div>
        <div className="bg-gradient-to-br from-yellow-500 to-orange-500 p-3 rounded-2xl text-white">
          <div className="text-[10px] opacity-80">רצונות נקנו</div>
          <div className="text-2xl font-black">{wantPurchases}</div>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-cyan-600 p-3 rounded-2xl text-white">
          <div className="text-[10px] opacity-80">סה"כ הוצאה</div>
          <div className="text-2xl font-black">{userBehavior.totalSpent}</div>
        </div>
      </div>

      {/* Savings Section */}
      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-4 rounded-2xl border-2 border-emerald-200">
        <div className="flex items-center justify-between mb-3">
          <div className="font-black text-emerald-800 text-sm flex items-center gap-2">
            <PiggyBank size={18} />
            החיסכון שלך
          </div>
          <div className="text-2xl font-black text-emerald-600">{stats.savings} 💰</div>
        </div>

        {/* Savings Progress */}
        <div className="mb-3">
          <div className="flex justify-between text-[10px] text-emerald-700 mb-1">
            <span>התקדמות למטרה</span>
            <span>{Math.min(100, Math.round((stats.savings / 2000) * 100))}%</span>
          </div>
          <div className="w-full bg-emerald-200 h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full transition-all duration-500"
              style={{ width: `${Math.min(100, (stats.savings / 2000) * 100)}%` }}
            ></div>
          </div>
        </div>

        {/* What can you do with savings */}
        <div className="bg-white/70 p-3 rounded-xl">
          <div className="font-bold text-emerald-800 text-xs mb-2">💡 מה אפשר לעשות עם חיסכון?</div>
          <div className="space-y-1">
            <div className="flex items-start gap-2 text-[10px] text-emerald-700">
              <span>🎯</span>
              <span>
                <strong>מטרה גדולה:</strong> לקנות משהו שחלמת עליו
              </span>
            </div>
            <div className="flex items-start gap-2 text-[10px] text-emerald-700">
              <span>🆘</span>
              <span>
                <strong>חירום:</strong> למקרה שצריך כסף בדחיפות
              </span>
            </div>
            <div className="flex items-start gap-2 text-[10px] text-emerald-700">
              <span>📈</span>
              <span>
                <strong>השקעה:</strong> הכסף גדל עם הזמן!
              </span>
            </div>
            <div className="flex items-start gap-2 text-[10px] text-emerald-700">
              <span>🎓</span>
              <span>
                <strong>לימודים:</strong> להשקיע בעתיד שלך
              </span>
            </div>
            <div className="flex items-start gap-2 text-[10px] text-emerald-700">
              <span>🎁</span>
              <span>
                <strong>נדיבות:</strong> לעזור לאחרים
              </span>
            </div>
          </div>
        </div>

        {/* Savings Tip */}
        <div className="mt-3 p-2 bg-emerald-100 rounded-lg">
          <div className="text-[10px] text-emerald-800 flex items-start gap-2">
            <span className="text-lg">💡</span>
            <span>
              <strong>טיפ:</strong> מומלץ לשמור לפחות 20% מכל הכנסה לחיסכון!
            </span>
          </div>
        </div>
      </div>

      {/* Spending Ratio Bar */}
      {totalPurchases > 0 && (
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
          <div className="text-sm font-bold text-slate-800 mb-2">יחס צרכים לרצונות</div>
          <div className="w-full bg-slate-200 h-4 rounded-full overflow-hidden flex">
            <div
              className="bg-green-500 h-full transition-all duration-500 flex items-center justify-center text-[8px] text-white font-black"
              style={{ width: `${spendingRatio}%` }}
            >
              {spendingRatio > 15 && `צרכים ${Math.round(spendingRatio)}%`}
            </div>
            <div
              className="bg-yellow-500 h-full transition-all duration-500 flex items-center justify-center text-[8px] text-white font-black"
              style={{ width: `${100 - spendingRatio}%` }}
            >
              {100 - spendingRatio > 15 && `רצונות ${Math.round(100 - spendingRatio)}%`}
            </div>
          </div>
        </div>
      )}

      {/* Educational Section: Needs vs Wants */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-2xl border-2 border-purple-200">
        <div className="font-black text-purple-800 text-sm mb-3 flex items-center gap-2">
          <span className="text-xl">🎓</span>
          להבין את ההבדל: צרכים vs רצונות
        </div>

        {/* What is a Need */}
        <div className="bg-green-100 p-3 rounded-xl mb-3">
          <div className="font-bold text-green-800 text-xs mb-2 flex items-center gap-2">
            <span>🟢</span>
            <strong>מה זה צורך (NEED)?</strong>
          </div>
          <div className="text-[10px] text-green-700 mb-2">
            צורך זה משהו ש<strong>אי אפשר בלעדיו</strong> - דברים שחייבים כדי לחיות בריא ומסודר!
          </div>
          <div className="grid grid-cols-2 gap-1">
            <div className="bg-white/70 p-2 rounded-lg text-center">
              <div className="text-lg">🍎</div>
              <div className="text-[9px] font-bold text-green-800">אוכל</div>
            </div>
            <div className="bg-white/70 p-2 rounded-lg text-center">
              <div className="text-lg">👕</div>
              <div className="text-[9px] font-bold text-green-800">בגדים</div>
            </div>
            <div className="bg-white/70 p-2 rounded-lg text-center">
              <div className="text-lg">🏠</div>
              <div className="text-[9px] font-bold text-green-800">בית</div>
            </div>
            <div className="bg-white/70 p-2 rounded-lg text-center">
              <div className="text-lg">📚</div>
              <div className="text-[9px] font-bold text-green-800">לימודים</div>
            </div>
          </div>
        </div>

        {/* What is a Want */}
        <div className="bg-yellow-100 p-3 rounded-xl mb-3">
          <div className="font-bold text-yellow-800 text-xs mb-2 flex items-center gap-2">
            <span>🟡</span>
            <strong>מה זה רצון (WANT)?</strong>
          </div>
          <div className="text-[10px] text-yellow-700 mb-2">
            רצון זה משהו ש<strong>כיף לנו</strong> אבל אפשר לחיות בלעדיו. זה דברים שנחמד לקנות, אבל לא
            חייבים!
          </div>
          <div className="grid grid-cols-2 gap-1">
            <div className="bg-white/70 p-2 rounded-lg text-center">
              <div className="text-lg">🎮</div>
              <div className="text-[9px] font-bold text-yellow-800">משחקים</div>
            </div>
            <div className="bg-white/70 p-2 rounded-lg text-center">
              <div className="text-lg">🍦</div>
              <div className="text-[9px] font-bold text-yellow-800">גלידה</div>
            </div>
            <div className="bg-white/70 p-2 rounded-lg text-center">
              <div className="text-lg">🎸</div>
              <div className="text-[9px] font-bold text-yellow-800">צעצועים</div>
            </div>
            <div className="bg-white/70 p-2 rounded-lg text-center">
              <div className="text-lg">🍕</div>
              <div className="text-[9px] font-bold text-yellow-800">ממתקים</div>
            </div>
          </div>
        </div>

        {/* Why it matters */}
        <div className="bg-blue-100 p-3 rounded-xl mb-3">
          <div className="font-bold text-blue-800 text-xs mb-2">💡 למה זה חשוב להבין?</div>
          <div className="space-y-1 text-[10px] text-blue-700">
            <div>✓ כשמבינים את ההבדל, אפשר <strong>לחסוך יותר כסף</strong></div>
            <div>✓ לומדים <strong>איך לתעדף</strong> - מה לקנות קודם</div>
            <div>✓ מתחילים לחשוב <strong>לפני קנייה</strong></div>
            <div>✓ הופכים להיות <strong>צרכנים חכמים</strong></div>
          </div>
        </div>

        {/* How to decide */}
        <div className="bg-purple-100 p-3 rounded-xl">
          <div className="font-bold text-purple-800 text-xs mb-2">🤔 איך להחליט? שאל את עצמך:</div>
          <div className="space-y-1 text-[10px] text-purple-700">
            <div className="flex items-start gap-2">
              <span className="font-black">1.</span>
              <span>
                <strong>האם אני יכול לחיות בלעדי זה?</strong> אם כן = רצון
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-black">2.</span>
              <span>
                <strong>האם זה משהו שאני חייב לבריאות שלי?</strong> אם כן = צורך
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-black">3.</span>
              <span>
                <strong>האם אני יכול לחכות איתו?</strong> אם כן = רצון
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-black">4.</span>
              <span>
                <strong>כמה דברים דומים יש לי כבר?</strong> הרבה? אולי זה רצון
              </span>
            </div>
          </div>
        </div>

        {/* Kid-friendly tip */}
        <div className="mt-3 p-2 bg-gradient-to-r from-pink-100 to-purple-100 rounded-lg">
          <div className="text-[10px] text-purple-800 flex items-start gap-2">
            <span className="text-lg">🐿️</span>
            <span>
              <strong>טיפ מהסנאי:</strong> חשוב על זה כמו על מגש באוכל - קודם מגישים את הירקות
              (צרכים), ורק אז יש מקום לקינוח (רצונות)!
            </span>
          </div>
        </div>
      </div>

      {/* Strengths */}
      {insights.strengths.length > 0 && (
        <div className="bg-green-50 p-4 rounded-2xl border-2 border-green-200">
          <div className="font-black text-green-800 text-sm mb-2 flex items-center gap-2">
            <Trophy size={16} />
            חוזקות שלך
          </div>
          <div className="space-y-1">
            {insights.strengths.map((strength, idx) => (
              <div key={idx} className="text-xs text-green-700 font-bold">{strength}</div>
            ))}
          </div>
        </div>
      )}

      {/* Weaknesses */}
      {insights.weaknesses.length > 0 && (
        <div className="bg-red-50 p-4 rounded-2xl border-2 border-red-200">
          <div className="font-black text-red-800 text-sm mb-2 flex items-center gap-2">
            <AlertCircle size={16} />
            דברים לשיפור
          </div>
          <div className="space-y-1">
            {insights.weaknesses.map((weakness, idx) => (
              <div key={idx} className="text-xs text-red-700 font-bold">{weakness}</div>
            ))}
          </div>
        </div>
      )}

      {/* Tips */}
      {insights.tips.length > 0 && (
        <div className="bg-blue-50 p-4 rounded-2xl border-2 border-blue-200">
          <div className="font-black text-blue-800 text-sm mb-2 flex items-center gap-2">
            <Sparkles size={16} />
            טיפים לשיפור
          </div>
          <div className="space-y-1">
            {insights.tips.map((tip, idx) => (
              <div key={idx} className="text-xs text-blue-700 font-bold">{tip}</div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {totalPurchases === 0 && (
        <div className="bg-slate-50 p-8 rounded-2xl text-center border border-slate-200">
          <div className="text-4xl mb-3">📊</div>
          <div className="text-sm font-bold text-slate-800 mb-1">עדיין אין נתונים</div>
          <div className="text-xs text-slate-600">בצע קניות ומשימות כדי לראות את הניתוח שלך</div>
        </div>
      )}

      {/* Journey Guide */}
      <JourneyGuide tab="analysis" />
    </div>
  );
};

export default AnalysisTab;
