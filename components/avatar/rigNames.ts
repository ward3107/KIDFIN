/**
 * Blender adds three-digit duplicate suffixes such as `.001`. GLTFLoader uses
 * PropertyBinding.sanitizeNodeName(), which removes the dot and exposes the
 * same node as `Name001` at runtime. Accept raw, sanitized and underscore forms
 * while preserving intentional names such as `KIWI_Finger_L0`.
 */
export const normalizeRigNodeName = (name: string) => name.replace(/[._]?\d{3}$/, '');
