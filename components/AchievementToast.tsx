import React, { useEffect } from 'react';
import { Achievement } from '../types';

interface AchievementToastProps {
  /** The achievement that was unlocked */
  achievement: Achievement;
  /** Optional callback when toast is dismissed */
  onDismiss?: () => void;
  /** Whether to animate the entrance */
  animate?: boolean;
}

/**
 * A toast notification component for displaying unlocked achievements.
 *
 * Features:
 * - Animated entrance (bounce effect)
 * - Achievement icon and name
 * - Description of what was achieved
 * - Auto-dismiss after 4 seconds
 * - Gradient background based on category
 *
 * @example
 * ```tsx
 * <AchievementToast
 *   achievement={newlyUnlocked}
 *   onDismiss={() => clearNewlyUnlocked()}
 *   animate={true}
 * />
 * ```
 */
export const AchievementToast: React.FC<AchievementToastProps> = ({
  achievement,
  onDismiss,
  animate = true,
}) => {
  // Auto-dismiss after 4 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onDismiss) onDismiss();
    }, 4000);

    return () => clearTimeout(timer);
  }, [onDismiss]);
  // Category colors
  const categoryColors: Record<Achievement['category'], string> = {
    savings: 'from-emerald-500 to-green-600',
    learning: 'from-blue-500 to-indigo-600',
    missions: 'from-orange-500 to-amber-600',
    special: 'from-purple-500 to-pink-600',
  };

  const gradientColor = categoryColors[achievement.category];

  return (
    <div className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-80 ${animate ? 'animate-bounce' : ''}`}>
      <div className={`bg-gradient-to-br ${gradientColor} text-white p-6 rounded-3xl shadow-2xl flex flex-col items-center gap-3 border-4 border-white relative overflow-hidden`}>
        {/* Animated background sparkles */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-2 right-4 text-4xl animate-pulse">✨</div>
          <div className="absolute bottom-4 left-2 text-3xl animate-pulse" style={{ animationDelay: '0.5s' }}>⭐</div>
          <div className="absolute top-1/2 right-2 text-2xl animate-pulse" style={{ animationDelay: '1s' }}>🌟</div>
        </div>

        {/* Achievement Icon */}
        <div className="text-6xl bg-white/20 p-4 rounded-full shadow-lg relative z-10">
          {achievement.icon}
        </div>

        {/* Achievement Name */}
        <div className="text-center relative z-10">
          <div className="text-xs font-bold opacity-80 mb-1">הישג חדש!</div>
          <h3 className="text-xl font-black leading-tight">{achievement.name}</h3>
        </div>

        {/* Achievement Description */}
        <p className="text-xs text-center opacity-90 leading-relaxed relative z-10">
          {achievement.description}
        </p>

        {/* Optional dismiss button */}
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="absolute top-2 right-2 bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors"
            aria-label="סגור"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M1 1L11 11M1 11L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default AchievementToast;
