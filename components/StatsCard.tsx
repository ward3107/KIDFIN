import React from 'react';

type StatsCardVariant = 'level' | 'knowledge' | 'missions' | 'coins' | 'savings';

interface StatsCardProps {
  /** Type of stat card to display */
  variant: StatsCardVariant;
  /** Primary value to display (level, count, etc.) */
  value: string | number;
  /** Optional secondary value (e.g., XP percentage) */
  secondaryValue?: number;
  /** Optional custom label */
  label?: string;
  /** Optional custom icon (emoji) */
  icon?: string;
}

const DEFAULT_LABELS: Record<StatsCardVariant, string> = {
  level: 'שלב נוכחי',
  knowledge: 'נקודות ידע',
  missions: 'משימות',
  coins: 'מטבעות',
  savings: 'חיסכון',
};

const DEFAULT_ICONS: Record<StatsCardVariant, string> = {
  level: '',
  knowledge: '🧠',
  missions: '✅',
  coins: '💰',
  savings: '🏦',
};

/**
 * A reusable stats card component for displaying various game statistics.
 *
 * Supports multiple variants with different styles:
 * - `level`: Gradient card with progress bar
 * - `knowledge`: Simple white card with centered content
 * - `missions`: Orange accent card
 * - `coins`: Gold accent card
 * - `savings`: Green accent card
 *
 * @example
 * ```tsx
 * <StatsCard variant="level" value={5} secondaryValue={65} />
 * <StatsCard variant="knowledge" value={12} />
 * <StatsCard variant="missions" value={7} label="השלמות" />
 * ```
 */
export const StatsCard: React.FC<StatsCardProps> = ({
  variant,
  value,
  secondaryValue,
  label,
  icon,
}) => {
  const displayLabel = label ?? DEFAULT_LABELS[variant];
  const displayIcon = icon ?? DEFAULT_ICONS[variant];

  // Level variant - gradient with progress bar
  if (variant === 'level') {
    return (
      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-4 rounded-3xl text-white shadow-lg relative overflow-hidden">
        <div className="text-indigo-100 text-[10px] font-bold">{displayLabel}</div>
        <div className="text-2xl font-black">
          {typeof value === 'number' ? `רמה ${value}` : value}
        </div>
        {secondaryValue !== undefined && (
          <div className="w-full bg-white/20 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-yellow-400 h-full transition-all duration-700"
              style={{ width: `${Math.min(100, secondaryValue)}%` }}
            />
          </div>
        )}
      </div>
    );
  }

  // Knowledge variant - simple white card
  if (variant === 'knowledge') {
    return (
      <div className="bg-white border-2 border-indigo-100 p-4 rounded-3xl shadow-sm flex flex-col justify-center items-center">
        <div className="text-slate-400 text-[10px] font-bold mb-1">
          {displayIcon && `${displayIcon} `}
          {displayLabel}
        </div>
        <div className="text-2xl font-black text-indigo-600 tracking-tight">{value}</div>
      </div>
    );
  }

  // Missions variant - orange accent
  if (variant === 'missions') {
    return (
      <div className="bg-gradient-to-br from-orange-500 to-amber-600 p-4 rounded-3xl text-white shadow-lg">
        <div className="text-orange-100 text-[10px] font-bold">
          {displayIcon && `${displayIcon} `}
          {displayLabel}
        </div>
        <div className="text-2xl font-black">{value}</div>
      </div>
    );
  }

  // Coins variant - gold accent
  if (variant === 'coins') {
    return (
      <div className="bg-gradient-to-br from-yellow-400 to-amber-500 p-4 rounded-3xl text-white shadow-lg">
        <div className="text-yellow-100 text-[10px] font-bold">
          {displayIcon && `${displayIcon} `}
          {displayLabel}
        </div>
        <div className="text-2xl font-black">{value}</div>
      </div>
    );
  }

  // Savings variant - green accent
  if (variant === 'savings') {
    return (
      <div className="bg-gradient-to-br from-emerald-500 to-green-600 p-4 rounded-3xl text-white shadow-lg">
        <div className="text-emerald-100 text-[10px] font-bold">
          {displayIcon && `${displayIcon} `}
          {displayLabel}
        </div>
        <div className="text-2xl font-black">{value}</div>
      </div>
    );
  }

  // Fallback for unknown variants
  return (
    <div className="bg-white border-2 border-slate-100 p-4 rounded-3xl shadow-sm">
      <div className="text-slate-400 text-[10px] font-bold">{displayLabel}</div>
      <div className="text-2xl font-black text-slate-700">{value}</div>
    </div>
  );
};

export default StatsCard;
