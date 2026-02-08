import React from 'react';
import { DollarSign } from 'lucide-react';
import { REWARDS } from '../constants';
import { JourneyGuide, CurrentStepCard } from '../components/JourneyGuide';
import { useAppContext } from '../context/AppContext';

/**
 * Rewards shop tab component for purchasing items with coins
 */
export const ShopTab: React.FC = () => {
  const { stats, handlePurchase } = useAppContext();

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Current Step Card */}
      <CurrentStepCard />

      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-black text-slate-800">חנות הפרסים</h2>
        <div className="bg-orange-50 px-3 py-1 rounded-full border border-orange-100 flex items-center gap-1">
          <DollarSign size={12} className="text-orange-500" />
          <span className="font-black text-orange-600 text-xs">{stats.coins}</span>
        </div>
      </div>
      <div className="flex gap-2 mb-3 justify-center">
        <div className="flex items-center gap-1 bg-green-50 px-2 py-1 rounded-full border border-green-200">
          <span className="w-2 h-2 rounded-full bg-green-500"></span>
          <span className="text-[9px] font-bold text-green-700">צורך</span>
        </div>
        <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-full border border-yellow-200">
          <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
          <span className="text-[9px] font-bold text-yellow-700">רצון</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {REWARDS.map((reward) => (
          <div
            key={reward.id}
            className={`${reward.color} p-4 rounded-[2rem] border border-slate-100 flex flex-col items-center gap-2 group hover:shadow-md transition-all relative`}
          >
            <div
              className={`absolute top-2 right-2 w-2 h-2 rounded-full ${
                reward.type === 'need' ? 'bg-green-500' : 'bg-yellow-500'
              }`}
            ></div>
            <div className="text-4xl group-hover:scale-110 transition-transform">{reward.icon}</div>
            <div className="text-center">
              <div className="font-black text-slate-800 text-[11px] leading-tight mb-0.5">{reward.name}</div>
              <div className="text-orange-600 font-black text-[10px] flex items-center justify-center gap-0.5">
                <DollarSign size={10} strokeWidth={3} /> {reward.price}
              </div>
            </div>
            <button
              onClick={() => handlePurchase(reward)}
              disabled={stats.coins < reward.price}
              className={`w-full font-black text-[9px] py-2 rounded-xl mt-1 transition-all ${
                stats.coins >= reward.price
                  ? 'bg-white text-slate-800 hover:bg-slate-800 hover:text-white border'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              {stats.coins >= reward.price ? 'קנה עכשיו' : 'חסר לך'}
            </button>
          </div>
        ))}
      </div>

      {/* Journey Guide */}
      <JourneyGuide tab="shop" />
    </div>
  );
};

export default ShopTab;
