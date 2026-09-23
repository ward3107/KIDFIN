import { describe, expect, it } from 'vitest';
import { motionPose } from '../components/avatar/conversationMotion';

const speakingFrames = (reduced: boolean, energy = 0.38) => Array.from({ length: 241 }, (_, frame) => motionPose({
  phase: 'speaking' as const,
  delivery: 'explain' as const,
  energy,
  reduced,
  gesture: null,
}, frame / 24));

const span = (frames: ReturnType<typeof speakingFrames>, key: keyof ReturnType<typeof motionPose>) => {
  const values = frames.map(frame => Number(frame[key]));
  return Math.max(...values) - Math.min(...values);
};

describe('conversation motion', () => {
  it('keeps hand gestures gentle and slow', () => {
    const frames = speakingFrames(false);
    expect(span(frames, 'left')).toBeGreaterThan(0.06);
    expect(span(frames, 'left')).toBeLessThan(0.12);
    expect(span(frames, 'wristLeft')).toBeGreaterThan(0.07);
    expect(span(frames, 'wristLeft')).toBeLessThan(0.15);
    const largestFrameChange = Math.max(...frames.slice(1).map((frame, index) =>
      Math.abs(frame.wristLeft - frames[index].wristLeft)));
    expect(largestFrameChange).toBeLessThan(0.005);
  });

  it('never animates legs or feet in conversational states', () => {
    for (const phase of ['idle', 'listening', 'thinking', 'speaking'] as const) {
      const pose = motionPose({ phase, delivery: 'celebrate', energy: 1, reduced: false, gesture: { name: 'cheer', age: 0.8 } }, 3);
      expect([pose.legLeft, pose.legRight, pose.liftLeft, pose.liftRight]).toEqual([0, 0, 0, 0]);
    }
  });

  it('does not drive body gestures from audio amplitude', () => {
    const quiet = motionPose({ phase: 'speaking', delivery: 'explain', energy: 0.4, reduced: false, gesture: null }, 3);
    const loud = motionPose({ phase: 'speaking', delivery: 'explain', energy: 1, reduced: false, gesture: null }, 3);
    expect([loud.left, loud.right, loud.elbowLeft, loud.elbowRight, loud.wristLeft, loud.wristRight])
      .toEqual([quiet.left, quiet.right, quiet.elbowLeft, quiet.elbowRight, quiet.wristLeft, quiet.wristRight]);
    expect(loud.mouth).toBeGreaterThan(quiet.mouth);
  });
});
