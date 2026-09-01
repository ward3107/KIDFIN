import * as THREE from 'three';

/**
 * Adds the two things the robot's face was missing: eyelids that can blink and
 * eyebrows that can change shape with its mood.
 *
 * Both are real 3D objects parented to the model rather than DOM overlays, so
 * they stay glued to the face through every idle sway, head tilt and orbit —
 * an overlay would slide off the moment the robot turns.
 *
 * The eye positions below were measured off the model: an orthographic front
 * render, the two dark pupils located in it, then a ray cast back into the mesh
 * to find the exact depth of the face at each eye.
 */

interface EyeSpec {
  x: number;
  y: number;
  z: number;
}

const EYES: EyeSpec[] = [
  { x: -0.23, y: 0.318, z: 0.312 }, // the robot's right eye (screen left)
  { x: 0.18, y: 0.333, z: 0.296 },
];

/** Radius that just covers the painted iris ring. */
const EYE_R = 0.118;
/** How far in front of the face the lids and brows sit. */
const LID_OFFSET = 0.032;
/** How much the lid domes forward — the face is curved, so a flat disc sinks
 *  into it at the edges and leaves slivers of eye showing. */
const LID_CURVE = 1.3;
const BROW_OFFSET = 0.026;
/** Brow sits this far above the eye centre. */
const BROW_LIFT = 0.088;
/** A flat bar reads as a sticker; letting the ends droop gives it an arch. */
const BROW_ARCH = 0.05;

export interface FaceRig {
  /** Scale .y from 0 (open) to 1 (shut) to blink. */
  lids: THREE.Object3D[];
  /** Rotate about z to change mood; +z raises the inner end of each brow. */
  brows: THREE.Object3D[];
  browRestY: number[];
}

export const buildFaceRig = (root: THREE.Object3D): FaceRig => {
  const lids: THREE.Object3D[] = [];
  const brows: THREE.Object3D[] = [];
  const browRestY: number[] = [];

  // Lit rather than flat so the lid picks up the same light as the face it
  // covers and doesn't read as a sticker when the robot turns.
  const lidMaterial = new THREE.MeshStandardMaterial({
    color: 0x8d9f4e,
    roughness: 0.85,
    metalness: 0,
  });
  const browMaterial = new THREE.MeshStandardMaterial({
    color: 0x3d3026,
    roughness: 0.6,
    metalness: 0.05,
  });

  EYES.forEach(eye => {
    // The lid hangs from the top of the eye: the disc is shifted down by its
    // own radius so the pivot sits on the upper lash line, which means scaling
    // the group in y sweeps it closed instead of shrinking it towards the pupil.
    const lidGeometry = new THREE.CircleGeometry(EYE_R, 32);
    const lidPos = lidGeometry.attributes.position;
    for (let v = 0; v < lidPos.count; v++) {
      const px = lidPos.getX(v);
      const py = lidPos.getY(v);
      lidPos.setZ(v, -LID_CURVE * (px * px + py * py));
    }
    lidGeometry.computeVertexNormals();
    lidGeometry.translate(0, -EYE_R, 0);
    const lid = new THREE.Mesh(lidGeometry, lidMaterial);
    lid.scale.x = 1.12; // a touch wider than tall, like a real lid

    const lidPivot = new THREE.Group();
    lidPivot.position.set(eye.x, eye.y + EYE_R, eye.z + LID_OFFSET);
    lidPivot.scale.y = 0; // start open
    lidPivot.add(lid);
    lidPivot.renderOrder = 3;
    root.add(lidPivot);
    lids.push(lidPivot);

    const browGeometry = new THREE.CapsuleGeometry(0.015, 0.15, 4, 12);
    browGeometry.rotateZ(Math.PI / 2); // lie the capsule along x
    const browPos = browGeometry.attributes.position;
    for (let v = 0; v < browPos.count; v++) {
      const px = browPos.getX(v);
      browPos.setY(v, browPos.getY(v) - BROW_ARCH * px * px * 4);
      browPos.setZ(v, browPos.getZ(v) - 0.7 * px * px); // follow the face's curve
    }
    browGeometry.computeVertexNormals();
    const brow = new THREE.Mesh(browGeometry, browMaterial);
    brow.position.set(eye.x, eye.y + BROW_LIFT, eye.z + BROW_OFFSET);
    brow.renderOrder = 3;
    root.add(brow);
    brows.push(brow);
    browRestY.push(brow.position.y);
  });

  return { lids, brows, browRestY };
};

/** Mood → how the brows sit. Angles are radians on the inner end. */
export const browPose = (expression: string) => {
  switch (expression) {
    case 'happy':
      return { tilt: -0.1, lift: 0.022 };
    case 'surprised':
      return { tilt: 0.05, lift: 0.055 };
    case 'sad':
      return { tilt: 0.3, lift: -0.012 };
    case 'thinking':
      return { tilt: 0.16, lift: 0.03 };
    default:
      return { tilt: 0, lift: 0 };
  }
};

/** How long a single blink takes: a fast close, a slightly slower open. */
export const BLINK_CLOSE = 0.06;
export const BLINK_OPEN = 0.1;
const BLINK_ONE = BLINK_CLOSE + BLINK_OPEN;
/** A second blink follows this long after the first one started. */
export const BLINK_REPEAT = 0.2;

/**
 * How shut the lids are, `age` seconds into a blink: 0 open, 1 shut.
 * Returns 0 once the blink is over, so callers can treat it as an envelope.
 */
export const blinkAmount = (age: number, double = false): number => {
  const one = (a: number) => {
    if (a < 0) return 0;
    if (a < BLINK_CLOSE) return a / BLINK_CLOSE;
    if (a < BLINK_ONE) return 1 - (a - BLINK_CLOSE) / BLINK_OPEN;
    return 0;
  };
  if (double && age >= BLINK_REPEAT) return one(age - BLINK_REPEAT);
  return one(age);
};

/** When a blink that started at `age` 0 is finished. */
export const blinkDuration = (double: boolean): number =>
  double ? BLINK_REPEAT + BLINK_ONE : BLINK_ONE;
