import React from 'react';
import { useTranslation } from 'react-i18next';
import { PiggyBank, Trophy, AlertCircle, Sparkles } from 'lucide-react';
import { JourneyGuide, CurrentStepCard } from '../components/JourneyGuide';
import { useAppContext } from '../context/AppContext';

export const AnalysisTab: React.FC = () => {
  const { t } = useTranslation();
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
    insights.strengths.push(t('analysis.insight.focusOnNeeds'));
  } else if (spendingRatio >= 50) {
    insights.strengths.push(t('analysis.insight.balanced'));
  } else if (totalPurchases > 0) {
    insights.weaknesses.push(t('analysis.insight.tooManyWants'));
    insights.tips.push(t('analysis.insight.thinkBeforeBuying'));
  }

  if (userBehavior.totalSpent < 500 && totalPurchases > 3) {
    insights.strengths.push(t('analysis.insight.controlsExpenses'));
  } else if (userBehavior.totalSpent > 1500) {
    insights.weaknesses.push(t('analysis.insight.spendsTooMuch'));
    insights.tips.push(t('analysis.insight.saveBeforeBigBuys'));
  }

  if (stats.savings > 1000) {
    insights.strengths.push(t('analysis.insight.impressiveSavings'));
  } else if (stats.savings < 300) {
    insights.weaknesses.push(t('analysis.insight.lowSavings'));
    insights.tips.push(t('analysis.insight.saveAtLeast20'));
  }

  if (totalPurchases === 0) {
    insights.tips.push(t('analysis.insight.startBuying'));
  }

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Current Step Card */}
      <CurrentStepCard />

      <h2 className="text-xl font-black text-slate-800 mb-4">{t('analysis.title')}</h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-3 rounded-2xl text-white">
          <div className="text-xs md:text-sm opacity-80">{t('analysis.totalPurchases')}</div>
          <div className="text-2xl font-black">{totalPurchases}</div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-3 rounded-2xl text-white">
          <div className="text-xs md:text-sm opacity-80">{t('analysis.needsBought')}</div>
          <div className="text-2xl font-black">{needPurchases}</div>
        </div>
        <div className="bg-gradient-to-br from-yellow-500 to-orange-500 p-3 rounded-2xl text-white">
          <div className="text-xs md:text-sm opacity-80">{t('analysis.wantsBought')}</div>
          <div className="text-2xl font-black">{wantPurchases}</div>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-cyan-600 p-3 rounded-2xl text-white">
          <div className="text-xs md:text-sm opacity-80">{t('analysis.totalSpent')}</div>
          <div className="text-2xl font-black">{userBehavior.totalSpent}</div>
        </div>
      </div>

      {/* Savings Section */}
      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-4 rounded-2xl border-2 border-emerald-200">
        <div className="flex items-center justify-between mb-3">
          <div className="font-black text-emerald-800 text-sm flex items-center gap-2">
            <PiggyBank size={18} />
            {t('analysis.yourSavings')}
          </div>
          <div className="text-2xl font-black text-emerald-600">{stats.savings} 💰</div>
        </div>

        {/* Savings Progress */}
        <div className="mb-3">
          <div className="flex justify-between text-xs md:text-sm text-emerald-700 mb-1">
            <span>{t('analysis.goalProgress')}</span>
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
          <div className="font-bold text-emerald-800 text-xs md:text-sm mb-2">{t('analysis.whatToDoTitle')}</div>
          <div className="space-y-1">
            <div className="flex items-start gap-2 text-xs md:text-sm text-emerald-700">
              <span>🎯</span>
              <span>
                <strong>{t('analysis.bigGoalLabel')}</strong> {t('analysis.bigGoalDesc')}
              </span>
            </div>
            <div className="flex items-start gap-2 text-xs md:text-sm text-emerald-700">
              <span>🆘</span>
              <span>
                <strong>{t('analysis.emergencyLabel')}</strong> {t('analysis.emergencyDesc')}
              </span>
            </div>
            <div className="flex items-start gap-2 text-xs md:text-sm text-emerald-700">
              <span>📈</span>
              <span>
                <strong>{t('analysis.investmentLabel')}</strong> {t('analysis.investmentDesc')}
              </span>
            </div>
            <div className="flex items-start gap-2 text-xs md:text-sm text-emerald-700">
              <span>🎓</span>
              <span>
                <strong>{t('analysis.educationLabel')}</strong> {t('analysis.educationDesc')}
              </span>
            </div>
            <div className="flex items-start gap-2 text-xs md:text-sm text-emerald-700">
              <span>🎁</span>
              <span>
                <strong>{t('analysis.generosityLabel')}</strong> {t('analysis.generosityDesc')}
              </span>
            </div>
          </div>
        </div>

        {/* Savings Tip */}
        <div className="mt-3 p-2 bg-emerald-100 rounded-lg">
          <div className="text-xs md:text-sm text-emerald-800 flex items-start gap-2">
            <span className="text-lg">💡</span>
            <span>
              <strong>{t('analysis.tipLabel')}</strong> {t('analysis.savingsTip')}
            </span>
          </div>
        </div>
      </div>

      {/* Spending Ratio Bar */}
      {totalPurchases > 0 && (
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
          <div className="text-sm md:text-base font-bold text-slate-800 mb-2">{t('analysis.needsWantsRatio')}</div>
          <div className="w-full bg-slate-200 h-4 rounded-full overflow-hidden flex">
            <div
              className="bg-green-500 h-full transition-all duration-500 flex items-center justify-center text-xs md:text-sm text-white font-black"
              style={{ width: `${spendingRatio}%` }}
            >
              {spendingRatio > 15 && t('analysis.needsPct', { pct: Math.round(spendingRatio) })}
            </div>
            <div
              className="bg-yellow-500 h-full transition-all duration-500 flex items-center justify-center text-xs md:text-sm text-white font-black"
              style={{ width: `${100 - spendingRatio}%` }}
            >
              {100 - spendingRatio > 15 && t('analysis.wantsPct', { pct: Math.round(100 - spendingRatio) })}
            </div>
          </div>
        </div>
      )}

      {/* Educational Section: Needs vs Wants */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-2xl border-2 border-purple-200">
        <div className="font-black text-purple-800 text-sm mb-3 flex items-center gap-2">
          <span className="text-xl">🎓</span>
          {t('analysis.nwTitle')}
        </div>

        {/* What is a Need */}
        <div className="bg-green-100 p-3 rounded-xl mb-3">
          <div className="font-bold text-green-800 text-xs md:text-sm mb-2 flex items-center gap-2">
            <span>🟢</span>
            <strong>{t('analysis.needBox.title')}</strong>
          </div>
          <div className="text-xs md:text-sm text-green-700 mb-2">
            {t('analysis.needBox.desc')}
          </div>
          <div className="grid grid-cols-2 gap-1">
            <div className="bg-white/70 p-2 rounded-lg text-center">
              <div className="text-lg">🍎</div>
              <div className="text-xs md:text-sm font-bold text-green-800">{t('analysis.needBox.food')}</div>
            </div>
            <div className="bg-white/70 p-2 rounded-lg text-center">
              <div className="text-lg">👕</div>
              <div className="text-xs md:text-sm font-bold text-green-800">{t('analysis.needBox.clothes')}</div>
            </div>
            <div className="bg-white/70 p-2 rounded-lg text-center">
              <div className="text-lg">🏠</div>
              <div className="text-xs md:text-sm font-bold text-green-800">{t('analysis.needBox.home')}</div>
            </div>
            <div className="bg-white/70 p-2 rounded-lg text-center">
              <div className="text-lg">📚</div>
              <div className="text-xs md:text-sm font-bold text-green-800">{t('analysis.needBox.study')}</div>
            </div>
          </div>
        </div>

        {/* What is a Want */}
        <div className="bg-yellow-100 p-3 rounded-xl mb-3">
          <div className="font-bold text-yellow-800 text-xs md:text-sm mb-2 flex items-center gap-2">
            <span>🟡</span>
            <strong>{t('analysis.wantBox.title')}</strong>
          </div>
          <div className="text-xs md:text-sm text-yellow-700 mb-2">
            {t('analysis.wantBox.desc')}
          </div>
          <div className="grid grid-cols-2 gap-1">
            <div className="bg-white/70 p-2 rounded-lg text-center">
              <div className="text-lg">🎮</div>
              <div className="text-xs md:text-sm font-bold text-yellow-800">{t('analysis.wantBox.games')}</div>
            </div>
            <div className="bg-white/70 p-2 rounded-lg text-center">
              <div className="text-lg">🍦</div>
              <div className="text-xs md:text-sm font-bold text-yellow-800">{t('analysis.wantBox.icecream')}</div>
            </div>
            <div className="bg-white/70 p-2 rounded-lg text-center">
              <div className="text-lg">🎸</div>
              <div className="text-xs md:text-sm font-bold text-yellow-800">{t('analysis.wantBox.toys')}</div>
            </div>
            <div className="bg-white/70 p-2 rounded-lg text-center">
              <div className="text-lg">🍕</div>
              <div className="text-xs md:text-sm font-bold text-yellow-800">{t('analysis.wantBox.sweets')}</div>
            </div>
          </div>
        </div>

        {/* Why it matters */}
        <div className="bg-blue-100 p-3 rounded-xl mb-3">
          <div className="font-bold text-blue-800 text-xs md:text-sm mb-2">{t('analysis.whyTitle')}</div>
          <div className="space-y-1 text-xs md:text-sm text-blue-700">
            <div>✓ {t('analysis.why1')}</div>
            <div>✓ {t('analysis.why2')}</div>
            <div>✓ {t('analysis.why3')}</div>
            <div>✓ {t('analysis.why4')}</div>
          </div>
        </div>

        {/* How to decide */}
        <div className="bg-purple-100 p-3 rounded-xl">
          <div className="font-bold text-purple-800 text-xs md:text-sm mb-2">{t('analysis.decideTitle')}</div>
          <div className="space-y-1 text-xs md:text-sm text-purple-700">
            <div className="flex items-start gap-2">
              <span className="font-black">1.</span>
              <span>{t('analysis.decide1')}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-black">2.</span>
              <span>{t('analysis.decide2')}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-black">3.</span>
              <span>{t('analysis.decide3')}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-black">4.</span>
              <span>{t('analysis.decide4')}</span>
            </div>
          </div>
        </div>

        {/* Kid-friendly tip */}
        <div className="mt-3 p-2 bg-gradient-to-r from-pink-100 to-purple-100 rounded-lg">
          <div className="text-xs md:text-sm text-purple-800 flex items-start gap-2">
            <span className="text-lg">🐿️</span>
            <span>
              <strong>{t('analysis.squirrelTipLabel')}</strong> {t('analysis.squirrelTip')}
            </span>
          </div>
        </div>
      </div>

      {/* Strengths */}
      {insights.strengths.length > 0 && (
        <div className="bg-green-50 p-4 rounded-2xl border-2 border-green-200">
          <div className="font-black text-green-800 text-sm mb-2 flex items-center gap-2">
            <Trophy size={16} />
            {t('analysis.strengthsTitle')}
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
            {t('analysis.weaknessesTitle')}
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
            {t('analysis.tipsTitle')}
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
          <div className="text-sm font-bold text-slate-800 mb-1">{t('analysis.emptyTitle')}</div>
          <div className="text-xs text-slate-600">{t('analysis.emptyDesc')}</div>
        </div>
      )}

      {/* Journey Guide */}
      <JourneyGuide tab="analysis" />
    </div>
  );
};

export default AnalysisTab;
