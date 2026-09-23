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
  // Audio amplitude drives only the mouth. Body gestures use slow conversational
  // timing so syllables and microphone noise can never make the character twitch.
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
  const legLeft = 0;
  const legRight = 0;
  let nod: number;
  let tilt = 0;
  let turn = 0;
  let sway: number;
  let armForward = 0;
  let elbowLeft: number;
  let elbowRight: number;
  let wristLeft: number;
  let wristRight: number;
  const liftLeft = 0;
  const liftRight = 0;

  if (motion.phase === 'speaking') {
    const phrase = 0.5 + 0.5 * Math.sin(time * 0.58);
    const leftPhrase = 0.5 + 0.5 * Math.sin(time * 0.62 + 0.4);
    const rightPhrase = 0.5 + 0.5 * Math.sin(time * 0.56 + 2.1);
    left = 0.12 + 0.09 * leftPhrase;
    right = 0.11 + 0.09 * rightPhrase;
    elbowLeft = 0.16 + 0.09 * leftPhrase;
    elbowRight = 0.16 + 0.09 * rightPhrase;
    wristLeft = 0.04 * Math.sin(time * 0.85 + 0.3) + 0.025 * Math.sin(time * 0.37);
    wristRight = 0.04 * Math.sin(time * 0.8 + 1.6) + 0.025 * Math.sin(time * 0.34 + 0.7);
    nod = 0.025 * Math.sin(time * 0.8) + 0.012 * Math.sin(time * 0.33);
    turn = 0.028 * Math.sin(time * 0.38);
    sway = 0.018 * Math.sin(time * 0.31);
    armForward = 0.035 + 0.025 * phrase;
  } else if (motion.phase === 'listening') {
    left = 0.08 + 0.02 * Math.sin(time * 0.35);
    right = 0.08 + 0.02 * Math.sin(time * 0.32 + 1.2);
    elbowLeft = 0.1;
    elbowRight = 0.1;
    wristLeft = 0.018 * Math.sin(time * 0.42);
    wristRight = 0.018 * Math.sin(time * 0.4 + 1.1);
    nod = 0.018 * Math.sin(time * 0.38);
    tilt = 0.025;
    turn = 0.02 * Math.sin(time * 0.3);
    sway = 0.01 * Math.sin(time * 0.28);
  } else if (motion.phase === 'thinking') {
    left = 0.09;
    right = 0.22 + 0.025 * Math.sin(time * 0.4);
    elbowLeft = 0.1;
    elbowRight = 0.23;
    wristLeft = 0.02;
    wristRight = 0.07;
    nod = -0.035 + 0.012 * Math.sin(time * 0.36);
    tilt = 0.1;
    turn = -0.04;
    sway = 0.018;
    armForward = 0.09;
  } else {
    left = 0.04 + 0.008 * Math.sin(time * 0.25);
    right = 0.04 + 0.008 * Math.sin(time * 0.24 + 1.5);
    elbowLeft = 0.05;
    elbowRight = 0.05;
    wristLeft = 0.01 * Math.sin(time * 0.28);
    wristRight = 0.01 * Math.sin(time * 0.27 + 1.4);
    nod = 0.008 * Math.sin(time * 0.24);
    sway = 0.006 * Math.sin(time * 0.22);
  }

  if (celebrate) {
    left += 0.12; right += 0.12;
    elbowLeft += 0.08; elbowRight += 0.08;
  }
  if (question) { right += 0.12; elbowRight += 0.08; tilt += 0.05; }

  if (motion.gesture && motion.gesture.age >= 0 && motion.gesture.age < 2.2) {
    const age = motion.gesture.age;
    const envelope = Math.sin(Math.PI * age / 2.2);
    if (motion.gesture.name === 'wave') {
      right += envelope * (0.28 + 0.03 * Math.sin(age * 5.5));
      elbowRight += envelope * 0.14;
      wristRight += envelope * 0.18 * Math.sin(age * 5.5);
    }
    if (motion.gesture.name === 'cheer') {
      left += envelope * 0.25; right += envelope * 0.25;
      elbowLeft += envelope * 0.1; elbowRight += envelope * 0.1;
      wristLeft += envelope * 0.06; wristRight -= envelope * 0.06;
    }
    if (motion.gesture.name === 'nod') nod += envelope * 0.05 * Math.sin(age * 4.5);
    if (motion.gesture.name === 'shrug') { left += envelope * 0.15; right += envelope * 0.15; }
    if (motion.gesture.name === 'think') { right += envelope * 0.2; armForward += envelope * 0.08; }
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
    wristLeft: wristLeft * motionScale,
    wristRight: wristRight * motionScale,
    liftLeft: liftLeft * motionScale,
    liftRight: liftRight * motionScale,
    bob: (motion.phase === 'speaking' ? 0.006 : 0.004) * Math.sin(time * 0.45) * motionScale,
    mouth,
    smile: celebrate ? 0.65 : motion.phase === 'speaking' ? 0.25 : 0.12,
    round: motion.phase === 'speaking'
      ? Math.min(0.6, energy * (question ? 0.38 : 0.18) * (0.55 + 0.45 * Math.sin(time * 6.3) ** 2))
      : 0,
    brow: (motion.phase === 'thinking' || question ? 0.025 : motion.phase === 'speaking' ? 0.01 : 0) * motionScale,
  };
}
