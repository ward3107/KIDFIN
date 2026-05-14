import { useState, useEffect, useCallback } from 'react';
import { Reward, Milestone } from '../types';

/**
 * Transient UI notifications: confetti burst, purchase toast, milestone toast.
 * Each auto-hides on its own timer.
 */
export function useNotifications() {
  const [showConfetti, setShowConfetti] = useState(false);
  const [purchaseNotification, setPurchaseNotification] = useState<Reward | null>(null);
  const [milestoneNotification, setMilestoneNotification] = useState<Milestone | null>(null);

  useEffect(() => {
    if (!showConfetti) return;
    const t = setTimeout(() => setShowConfetti(false), 2000);
    return () => clearTimeout(t);
  }, [showConfetti]);

  useEffect(() => {
    if (!purchaseNotification) return;
    const t = setTimeout(() => setPurchaseNotification(null), 3000);
    return () => clearTimeout(t);
  }, [purchaseNotification]);

  useEffect(() => {
    if (!milestoneNotification) return;
    const t = setTimeout(() => setMilestoneNotification(null), 4000);
    return () => clearTimeout(t);
  }, [milestoneNotification]);

  const triggerConfetti = useCallback(() => setShowConfetti(true), []);

  return {
    showConfetti,
    setShowConfetti,
    purchaseNotification,
    setPurchaseNotification,
    milestoneNotification,
    setMilestoneNotification,
    triggerConfetti,
  };
}
