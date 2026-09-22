import type { AvatarGesture } from './avatarTypes';

export type ConversationPhase = 'idle' | 'connecting' | 'listening' | 'thinking' | 'speaking';
export type Delivery = 'calm' | 'explain' | 'question' | 'celebrate';

export interface ConversationMotion {
  phase: ConversationPhase;
  delivery: Delivery;
  energy: number;
  reduced: boolean;
  gesture: { name: AvatarGesture; age: number } | null;
}

/** Uses assistant wording only. It never attempts to infer a child's emotions. */
export function deliveryFromText(text: string): Delivery {
  if (/[?؟]\s*$/.test(text)) return 'question';
  if (/(כל הכבוד|הצלחת|أحسنت|رائع|well done|great job)/i.test(text)) return 'celebrate';
  return 'explain';
}

export function motionPose(motion: ConversationMotion, time: number) {
  const rawEnergy = Number.isFinite(motion.energy) ? motion.energy : 0;
  const energy = motion.phase === 'speaking' ? Math.min(1, Math.max(0, rawEnergy)) : 0;
  const moving = !motion.reduced;
  const question = motion.phase === 'speaking' && motion.delivery === 'question';
  const celebrate = motion.phase === 'speaking' && motion.delivery === 'celebrate';
  let left = 0;
  let right = 0;
  let nod = 0;

  if (moving) {
    left = energy * (0.15 + 0.26 * Math.max(0, Math.sin(time * 3.2)));
    right = energy * (0.12 + 0.3 * Math.max(0, Math.sin(time * 2.7 + 1.3)));
    if (celebrate) { left += 0.32; right += 0.32; }
    if (question) right += 0.16;
    if (motion.phase === 'listening') nod = 0.035 * Math.pow(Math.max(0, Math.sin(time * 0.85)), 8);
    if (motion.phase === 'speaking') nod = energy * 0.055 * Math.sin(time * 4.5);

    if (motion.gesture && motion.gesture.age >= 0 && motion.gesture.age < 1.4) {
      const age = motion.gesture.age;
      const envelope = Math.sin(Math.PI * age / 1.4);
      if (motion.gesture.name === 'wave') right += envelope * (0.85 + 0.16 * Math.sin(age * 15));
      if (motion.gesture.name === 'cheer') { left += envelope * 0.8; right += envelope * 0.8; }
      if (motion.gesture.name === 'nod') nod += envelope * 0.13 * Math.sin(age * 12);
      if (motion.gesture.name === 'shrug') { left += envelope * 0.4; right += envelope * 0.4; }
      if (motion.gesture.name === 'think') right += envelope * 0.55;
    }
  }

  return {
    left,
    right,
    nod,
    tilt: moving ? motion.phase === 'thinking' ? 0.13 : question ? 0.1 : motion.phase === 'listening' ? 0.035 : 0 : 0,
    bob: moving ? 0.006 * Math.sin(time * 1.4) : 0,
    mouth: energy,
    smile: celebrate ? 0.65 : motion.phase === 'speaking' ? 0.25 : 0.12,
    round: question ? energy * 0.25 : 0,
    brow: motion.phase === 'thinking' || question ? 0.025 : energy * 0.012,
  };
}
