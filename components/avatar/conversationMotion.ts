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
  // Audio amplitude drives emphasis, with a visible floor for quiet voices.
  const energy = motion.phase === 'speaking'
    ? Math.max(0.38, Math.min(1, Math.max(0, rawEnergy)))
    : 0;
  // Reduced-motion keeps communicative cues (mouth, gaze and a small nod)
  // instead of freezing the character completely.
  const motionScale = motion.reduced ? 0.55 : 1;
  const question = motion.phase === 'speaking' && motion.delivery === 'question';
  const celebrate = motion.phase === 'speaking' && motion.delivery === 'celebrate';
  let left: number;
  let right: number;
  let legLeft = 0;
  let legRight = 0;
  let nod: number;
  let tilt = 0;
  let turn = 0;
  let sway: number;
  let armForward = 0;
  let elbowLeft: number;
  let elbowRight: number;
  let liftLeft = 0;
  let liftRight = 0;

  if (motion.phase === 'speaking') {
    const leftBeat = 0.5 + 0.5 * Math.sin(time * 3.15);
    const rightBeat = 0.5 + 0.5 * Math.sin(time * 2.7 + 1.35);
    const step = Math.sin(time * 1.75);
    left = 0.22 + energy * (0.38 + 0.42 * leftBeat);
    right = 0.2 + energy * (0.36 + 0.48 * rightBeat);
    elbowLeft = 0.16 + energy * (0.2 + 0.14 * Math.sin(time * 3.7 + 0.5));
    elbowRight = 0.14 + energy * (0.22 + 0.14 * Math.sin(time * 3.35 + 1.8));
    legLeft = energy * 0.28 * step;
    legRight = -legLeft;
    liftLeft = energy * 0.12 * Math.max(0, step);
    liftRight = energy * 0.12 * Math.max(0, -step);
    nod = energy * (0.14 * Math.sin(time * 4.1) + 0.055 * Math.sin(time * 1.7));
    turn = energy * 0.11 * Math.sin(time * 1.45);
    sway = energy * 0.09 * Math.sin(time * 1.35);
    armForward = energy * (0.18 + 0.13 * Math.sin(time * 3.7));
  } else if (motion.phase === 'listening') {
    const step = Math.sin(time * 0.8);
    left = 0.14 + 0.065 * Math.sin(time * 1.15);
    right = 0.15 + 0.065 * Math.sin(time * 1.05 + 1.2);
    elbowLeft = 0.12;
    elbowRight = 0.14;
    legLeft = 0.08 * step;
    legRight = -legLeft;
    liftLeft = 0.025 * Math.max(0, step);
    liftRight = 0.025 * Math.max(0, -step);
    nod = 0.12 * Math.pow(Math.max(0, Math.sin(time * 0.8)), 10);
    tilt = 0.06;
    turn = 0.045 * Math.sin(time * 0.65);
    sway = 0.04 * Math.sin(time * 0.7);
  } else if (motion.phase === 'thinking') {
    left = 0.15;
    right = 0.48 + 0.08 * Math.sin(time * 1.8);
    elbowLeft = 0.12;
    elbowRight = 0.4;
    legLeft = 0.07;
    legRight = -0.07;
    liftLeft = 0.02;
    nod = -0.07 + 0.03 * Math.sin(time * 1.25);
    tilt = 0.2;
    turn = -0.08;
    sway = 0.055;
    armForward = 0.18;
  } else {
    left = 0.045 + 0.025 * Math.sin(time * 0.8);
    right = 0.045 + 0.025 * Math.sin(time * 0.8 + 1.5);
    elbowLeft = 0.06;
    elbowRight = 0.06;
    nod = 0.02 * Math.sin(time * 0.55);
    sway = 0.018 * Math.sin(time * 0.6);
  }

  if (celebrate) {
    left += 0.48; right += 0.48;
    elbowLeft += 0.18; elbowRight += 0.18;
    legLeft += 0.15; legRight -= 0.15;
  }
  if (question) { right += 0.34; elbowRight += 0.16; legRight -= 0.06; tilt += 0.11; }

  if (motion.gesture && motion.gesture.age >= 0 && motion.gesture.age < 1.4) {
    const age = motion.gesture.age;
    const envelope = Math.sin(Math.PI * age / 1.4);
    if (motion.gesture.name === 'wave') {
      right += envelope * (0.85 + 0.16 * Math.sin(age * 15));
      elbowRight += envelope * (0.32 + 0.18 * Math.sin(age * 15));
    }
    if (motion.gesture.name === 'cheer') {
      left += envelope * 0.8; right += envelope * 0.8;
      elbowLeft += envelope * 0.22; elbowRight += envelope * 0.22;
    }
    if (motion.gesture.name === 'nod') nod += envelope * 0.13 * Math.sin(age * 12);
    if (motion.gesture.name === 'shrug') { left += envelope * 0.4; right += envelope * 0.4; }
    if (motion.gesture.name === 'think') { right += envelope * 0.55; armForward += envelope * 0.2; }
    if (motion.gesture.name === 'cheer') { legLeft += envelope * 0.16; legRight -= envelope * 0.16; }
    if (motion.gesture.name === 'wave') legRight += envelope * 0.06;
  }

  const mouth = motion.phase === 'speaking'
    ? Math.min(1, energy * (0.82 + 0.28 * Math.abs(Math.sin(time * 9.7))))
    : 0;

  return {
    left: left * motionScale,
    right: right * motionScale,
    legLeft: legLeft * motionScale,
    legRight: legRight * motionScale,
    nod: nod * motionScale,
    tilt: tilt * motionScale,
    turn: turn * motionScale,
    sway: sway * motionScale,
    armForward: armForward * motionScale,
    elbowLeft: elbowLeft * motionScale,
    elbowRight: elbowRight * motionScale,
    liftLeft: liftLeft * motionScale,
    liftRight: liftRight * motionScale,
    bob: (motion.phase === 'speaking' ? 0.024 : 0.012) * Math.sin(time * 1.4) * motionScale,
    mouth,
    smile: celebrate ? 0.65 : motion.phase === 'speaking' ? 0.25 : 0.12,
    round: motion.phase === 'speaking'
      ? Math.min(0.6, energy * (question ? 0.38 : 0.18) * (0.55 + 0.45 * Math.sin(time * 6.3) ** 2))
      : 0,
    brow: (motion.phase === 'thinking' || question ? 0.04 : energy * 0.02) * motionScale,
  };
}
