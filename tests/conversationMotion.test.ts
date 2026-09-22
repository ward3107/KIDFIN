import { describe, expect, it } from 'vitest';
import {
  deliveryFromText,
  motionPose,
  type ConversationMotion,
} from '../components/avatar/conversationMotion';

const speaking: ConversationMotion = {
  phase: 'speaking', delivery: 'explain', energy: 0.8, reduced: false, gesture: null,
};

describe('conversation choreography', () => {
  it('stops speech motion as soon as the user interrupts', () => {
    const pose = motionPose({ ...speaking, phase: 'listening' }, 2);
    expect(pose.mouth).toBe(0);
    expect(pose.left).toBe(0);
    expect(pose.right).toBe(0);
  });

  it('honours reduced motion while retaining lip movement', () => {
    const pose = motionPose({ ...speaking, reduced: true }, 2);
    expect(pose.mouth).toBe(0.8);
    expect(pose.left).toBe(0);
    expect(pose.right).toBe(0);
    expect(pose.bob).toBe(0);
  });

  it('bounds audio energy and expires one-shot gestures', () => {
    expect(motionPose({ ...speaking, energy: Number.NaN }, 2).mouth).toBe(0);
    expect(motionPose({ ...speaking, energy: 9 }, 2).mouth).toBe(1);
    expect(motionPose({ ...speaking, gesture: { name: 'wave', age: 2 } }, 2))
      .toEqual(motionPose(speaking, 2));
  });

  it('recognises question and praise cues in supported languages', () => {
    expect(deliveryFromText('מה תרצה ללמוד?')).toBe('question');
    expect(deliveryFromText('ماذا تريد؟')).toBe('question');
    expect(deliveryFromText('כל הכבוד, הצלחת')).toBe('celebrate');
    expect(deliveryFromText('אני עצוב!')).toBe('explain');
  });
});
