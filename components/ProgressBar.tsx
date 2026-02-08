import React from 'react';
import { DollarSign } from 'lucide-react';

interface ProgressBarProps {
  /** Current value towards the goal */
  current: number;
  /** Goal value to reach */
  goal: number;
  /** Milestone percentages (e.g., [25, 50, 75]) */
  milestones?: number[];
  /** Optional label for the goal */
  label?: string;
  /** Optional currency symbol to display */
  currencySymbol?: string;
}

/**
 * A reusable progress bar component for tracking savings goals.
 *
 * Features:
 * - Animated gradient progress bar with glossy overlay
 * - Milestone markers at custom percentages
 * - Current and goal value labels
 * - Sparkle animation at progress bar tip
 *
 * @example
 * ```tsx
 * <ProgressBar
 *   current={820}
 *   goal={1200}
 *   milestones={[25, 50, 75]}
 *   label="אופניים חדשים"
 * />
 * ```
 */
export const ProgressBar: React.FC<ProgressBarProps> = ({
  current,
  goal,
  milestones = [25, 50, 75],
  label,
  currencySymbol = 'coins',
}) => {
  const progressPercent = Math.min(100, Math.floor((current / goal) * 100));
  const leftToGoal = Math.max(0, goal - current);

  return (
    <div className="relative pt-2 pb-6">
      {/* Progress Bar Container */}
      <div className="w-full bg-slate-100 h-6 rounded-full overflow-hidden border-4 border-white shadow-inner relative">
        {/* Dynamic Filling Bar */}
        <div
          className="bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500 h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_12px_rgba(59,130,246,0.4)] relative"
          style={{ width: `${progressPercent}%` }}
        >
          {/* Glossy overlay effect */}
          <div className="absolute inset-0 bg-white/20 blur-[1px] h-1/3 rounded-full mt-0.5 ml-1 mr-1" />

          {/* "Current" sparkle at the tip of the progress bar */}
          {progressPercent > 0 && progressPercent < 100 && (
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white/50 blur-md rounded-full animate-pulse" />
          )}
        </div>

        {/* Milestones Markers */}
        {milestones.map((m) => (
          <div
            key={m}
            className={`absolute top-0 bottom-0 w-0.5 transition-colors duration-300 ${
              progressPercent >= m ? 'bg-white/40' : 'bg-slate-300'
            }`}
            style={{ left: `${m}%` }}
          >
            <div
              className={`absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full ${
                progressPercent >= m ? 'bg-white' : 'bg-slate-300'
              }`}
            />
          </div>
        ))}
      </div>

      {/* Goal Marker Label */}
      <div className="absolute right-0 bottom-0 flex flex-col items-end">
        <div className="text-[10px] font-black text-slate-400 flex items-center gap-1">
          <span>{goal}</span>
          <DollarSign size={10} strokeWidth={4} />
        </div>
      </div>

      {/* Current Marker Label */}
      <div className="absolute left-0 bottom-0 flex flex-col items-start">
        <div className="text-[10px] font-black text-indigo-500 flex items-center gap-1">
          <span>{current}</span>
          <DollarSign size={10} strokeWidth={4} />
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;
