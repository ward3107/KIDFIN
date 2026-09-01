import { describe, expect, it } from 'vitest';
import {
  BLINK_CLOSE,
  BLINK_OPEN,
  BLINK_REPEAT,
  blinkAmount,
  blinkDuration,
  browPose,
} from '../components/avatar/faceRig';

describe('blinkAmount', () => {
  it('starts and ends with the eyes open', () => {
    expect(blinkAmount(0)).toBe(0);
    expect(blinkAmount(blinkDuration(false))).toBe(0);
  });

  it('is fully shut at the end of the closing phase', () => {
    expect(blinkAmount(BLINK_CLOSE * 0.999)).toBeCloseTo(1, 2);
  });

  it('reopens over the longer opening phase', () => {
    const halfwayOpen = BLINK_CLOSE + BLINK_OPEN / 2;
    expect(blinkAmount(halfwayOpen)).toBeCloseTo(0.5, 5);
  });

  it('never leaves the 0..1 range', () => {
    for (let age = -0.1; age < 0.6; age += 0.005) {
      const shut = blinkAmount(age, true);
      expect(shut).toBeGreaterThanOrEqual(0);
      expect(shut).toBeLessThanOrEqual(1);
    }
  });

  it('opens fully between the two halves of a double blink', () => {
    expect(blinkAmount(BLINK_CLOSE + BLINK_OPEN + 0.01, true)).toBe(0);
    expect(blinkAmount(BLINK_REPEAT + BLINK_CLOSE * 0.999, true)).toBeCloseTo(1, 2);
  });

  it('is over by the time blinkDuration says it is', () => {
    expect(blinkAmount(blinkDuration(true), true)).toBeCloseTo(0, 10);
    expect(blinkDuration(true)).toBeGreaterThan(blinkDuration(false));
  });
});

describe('browPose', () => {
  it('raises the brows when surprised and drops them when sad', () => {
    expect(browPose('surprised').lift).toBeGreaterThan(browPose('neutral').lift);
    expect(browPose('sad').lift).toBeLessThan(0);
  });

  it('tilts the inner ends up when sad — the classic worried brow', () => {
    expect(browPose('sad').tilt).toBeGreaterThan(0);
    expect(browPose('happy').tilt).toBeLessThan(0);
  });

  it('leaves an unknown mood neutral', () => {
    expect(browPose('whatever')).toEqual({ tilt: 0, lift: 0 });
  });
});
