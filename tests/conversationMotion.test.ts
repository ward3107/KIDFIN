import { describe, expect, it } from 'vitest';
import { motionPose } from '../components/avatar/conversationMotion';

const speakingFrames = (reduced: boolean) => Array.from({ length: 241 }, (_, frame) => motionPose({
  phase: 'speaking' as const,
  delivery: 'explain' as const,
  energy: 0.38,
  reduced,
  gesture: null,
}, frame / 24));

const span = (frames: ReturnType<typeof speakingFrames>, key: keyof ReturnType<typeof motionPose>) => {
  const values = frames.map(frame => Number(frame[key]));
  return Math.max(...values) - Math.min(...values);
};

describe('conversation motion', () => {
  it('keeps hands and legs visibly animated for quiet speech', () => {
    const frames = speakingFrames(false);
    expect(span(frames, 'left')).toBeGreaterThan(0.15);
    expect(span(frames, 'wristLeft')).toBeGreaterThan(0.25);
    expect(span(frames, 'legLeft')).toBeGreaterThan(0.35);
    expect(Math.max(...frames.map(frame => frame.liftLeft))).toBeGreaterThan(0.07);
  });

  it('reduces motion without freezing communicative gestures', () => {
    const frames = speakingFrames(true);
    expect(span(frames, 'wristRight')).toBeGreaterThan(0.15);
    expect(span(frames, 'legRight')).toBeGreaterThan(0.2);
  });
});
