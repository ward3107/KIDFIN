import { describe, expect, it } from 'vitest';
import { normalizeRigNodeName } from '../components/avatar/rigNames';

describe('normalizeRigNodeName', () => {
  it.each([
    ['KIWI_Shoulder_L.001', 'KIWI_Shoulder_L'],
    ['KIWI_Shoulder_L_001', 'KIWI_Shoulder_L'],
    ['KIWI_Shoulder_L001', 'KIWI_Shoulder_L'],
    ['KIWI_Finger_L0001', 'KIWI_Finger_L0'],
  ])('maps Blender and GLTFLoader names %s', (runtimeName, expected) => {
    expect(normalizeRigNodeName(runtimeName)).toBe(expected);
  });

  it('preserves intentional numeric finger names', () => {
    expect(normalizeRigNodeName('KIWI_Finger_L0')).toBe('KIWI_Finger_L0');
    expect(normalizeRigNodeName('KIWI_Finger_R2')).toBe('KIWI_Finger_R2');
  });
});
