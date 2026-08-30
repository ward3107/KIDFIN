import * as THREE from 'three';

/**
 * Gives the (single-mesh, boneless) robot GLB a minimal skeleton so its two
 * arms can actually move.
 *
 * The exported model is one fused mesh with no nodes, no skin and no
 * animations, and a full humanoid auto-rig deforms its stubby proportions.
 * Instead of re-authoring the model we build the smallest rig that does the
 * job: a root bone plus one bone per arm.
 *
 * Finding the arms is done through mesh *connectivity*, not a bounding box:
 * we flood-fill outwards from each hand tip and refuse to cross the shoulder
 * plane. The head is wide enough to overlap the arms in X, but it is only
 * reachable through the neck at the centre, so the fill can never leak into
 * it. Anything fused to a hand (the heart it holds) comes along for free.
 */

export interface ArmRig {
  armL: THREE.Bone;
  armR: THREE.Bone;
  /** Rest pose of each arm, so callers can animate as offsets. */
  restL: THREE.Euler;
  restR: THREE.Euler;
}

/** |x| below this is body/neck/legs — the flood fill stops here. */
const SHOULDER_CUT = 0.26;
/** Width of the blend band above the cut, so the shoulder bends instead of tearing. */
const BLEND = 0.13;
/** Vertical band the hand tips are searched in (model space, y-up, ~±0.95). */
const ARM_Y_MIN = -0.55;
const ARM_Y_MAX = 0.06;
/** Position quantisation used to weld duplicated seam vertices. */
const WELD = 2000;

const smoothstep = (edge0: number, edge1: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
};

const largestMesh = (root: THREE.Object3D): THREE.Mesh | null => {
  let best: THREE.Mesh | null = null;
  let bestCount = 0;
  root.traverse(o => {
    const m = o as THREE.Mesh;
    if (!m.isMesh || !m.geometry?.attributes?.position) return;
    const n = m.geometry.attributes.position.count;
    if (n > bestCount) {
      bestCount = n;
      best = m;
    }
  });
  return best;
};

/**
 * Builds vertex adjacency over *welded* positions, so the fill is not stopped
 * by the duplicated vertices that UV/normal seams introduce.
 */
const buildAdjacency = (geometry: THREE.BufferGeometry) => {
  const pos = geometry.attributes.position;
  const count = pos.count;
  const weldOf = new Int32Array(count);
  const byKey = new Map<string, number>();
  for (let i = 0; i < count; i++) {
    const key = `${Math.round(pos.getX(i) * WELD)},${Math.round(pos.getY(i) * WELD)},${Math.round(
      pos.getZ(i) * WELD,
    )}`;
    const seen = byKey.get(key);
    if (seen === undefined) {
      byKey.set(key, i);
      weldOf[i] = i;
    } else {
      weldOf[i] = seen;
    }
  }

  // Union-find over welded vertices, so the fill can be restricted to the
  // robot itself: the model also contains ~15 small floating props (hearts,
  // leaves) that reach further out in X than the hands do.
  const parentOf = new Int32Array(count);
  for (let i = 0; i < count; i++) parentOf[i] = weldOf[i];
  const find = (x: number) => {
    let r = x;
    while (parentOf[r] !== r) {
      parentOf[r] = parentOf[parentOf[r]];
      r = parentOf[r];
    }
    return r;
  };
  const union = (a: number, b: number) => {
    const ra = find(a);
    const rb = find(b);
    if (ra !== rb) parentOf[ra] = rb;
  };

  const neighbours = new Map<number, number[]>();
  const link = (a: number, b: number) => {
    const la = neighbours.get(a);
    if (la) la.push(b);
    else neighbours.set(a, [b]);
  };
  const index = geometry.index;
  const triCount = index ? index.count : count;
  for (let i = 0; i < triCount; i += 3) {
    const a = weldOf[index ? index.getX(i) : i];
    const b = weldOf[index ? index.getX(i + 1) : i + 1];
    const c = weldOf[index ? index.getX(i + 2) : i + 2];
    link(a, b); link(b, a);
    link(b, c); link(c, b);
    link(c, a); link(a, c);
    union(a, b);
    union(b, c);
  }

  const sizes = new Map<number, number>();
  for (let i = 0; i < count; i++) {
    if (weldOf[i] !== i) continue;
    const r = find(i);
    sizes.set(r, (sizes.get(r) ?? 0) + 1);
  }
  let body = -1;
  let biggest = 0;
  for (const [r, n] of sizes) {
    if (n > biggest) {
      biggest = n;
      body = r;
    }
  }
  const inBody = (i: number) => find(i) === body;

  return { weldOf, neighbours, inBody };
};

/**
 * Flood-fills from the outermost vertex of one side, never crossing the
 * shoulder plane, and returns the welded-vertex ids that make up that arm.
 */
const fillArm = (
  geometry: THREE.BufferGeometry,
  adjacency: ReturnType<typeof buildAdjacency>,
  side: 1 | -1,
) => {
  const pos = geometry.attributes.position;
  const { weldOf, neighbours, inBody } = adjacency;
  const outward = (i: number) => pos.getX(i) * side;

  // Seed: the most outboard vertex inside the arm's vertical band — i.e. the hand tip.
  let seed = -1;
  let bestReach = SHOULDER_CUT;
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i);
    if (y < ARM_Y_MIN || y > ARM_Y_MAX) continue;
    if (!inBody(weldOf[i])) continue; // skip the floating props
    const reach = outward(i);
    if (reach > bestReach) {
      bestReach = reach;
      seed = weldOf[i];
    }
  }
  if (seed < 0) return null;

  const inArm = new Set<number>([seed]);
  const stack = [seed];
  while (stack.length) {
    const v = stack.pop() as number;
    const next = neighbours.get(v);
    if (!next) continue;
    for (const n of next) {
      if (inArm.has(n)) continue;
      // The barrier: everything inboard of the shoulder belongs to the body.
      if (outward(n) < SHOULDER_CUT) continue;
      inArm.add(n);
      stack.push(n);
    }
  }
  return inArm;
};

/**
 * Converts the model's mesh into a SkinnedMesh with a root + two arm bones.
 * Returns the arm bones to animate, or null if the model does not look like
 * the expected robot (in which case the caller simply renders it unrigged).
 */
export const buildArmRig = (root: THREE.Object3D): ArmRig | null => {
  const mesh = largestMesh(root);
  if (!mesh || (mesh as unknown as THREE.SkinnedMesh).isSkinnedMesh) return null;

  // Clone so the cached GLTF geometry is never given skin attributes — other
  // mounts of the same model must stay independent.
  const geometry = mesh.geometry.clone();
  const pos = geometry.attributes.position;
  const adjacency = buildAdjacency(geometry);
  const right = fillArm(geometry, adjacency, 1);
  const left = fillArm(geometry, adjacency, -1);
  if (!right || !left || right.size < 100 || left.size < 100) return null;

  // Shoulder pivots: the centre of each arm's cross-section at the cut plane.
  const shoulder = (arm: Set<number>, side: 1 | -1) => {
    let y = 0;
    let z = 0;
    let n = 0;
    for (const i of arm) {
      if (pos.getX(i) * side > SHOULDER_CUT + BLEND) continue;
      y += pos.getY(i);
      z += pos.getZ(i);
      n++;
    }
    return n ? new THREE.Vector3(SHOULDER_CUT * side, y / n, z / n) : new THREE.Vector3(SHOULDER_CUT * side, -0.15, 0);
  };
  const pivotR = shoulder(right, 1);
  const pivotL = shoulder(left, -1);

  // Skin weights: bone 0 is the (immobile) root, 1 = left arm, 2 = right arm.
  // Weight ramps from 0 at the cut plane to 1 one blend-width outboard, so the
  // shoulder deforms smoothly instead of shearing off.
  const count = pos.count;
  const skinIndex = new Uint16Array(count * 4);
  const skinWeight = new Float32Array(count * 4);
  const { weldOf } = adjacency;
  for (let i = 0; i < count; i++) {
    const welded = weldOf[i];
    let bone = 0;
    let w = 0;
    if (right.has(welded)) {
      bone = 2;
      w = smoothstep(SHOULDER_CUT, SHOULDER_CUT + BLEND, pos.getX(i));
    } else if (left.has(welded)) {
      bone = 1;
      w = smoothstep(SHOULDER_CUT, SHOULDER_CUT + BLEND, -pos.getX(i));
    }
    skinIndex[i * 4] = bone;
    skinWeight[i * 4] = w;
    skinIndex[i * 4 + 1] = 0; // root takes the remainder
    skinWeight[i * 4 + 1] = 1 - w;
  }
  geometry.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(skinIndex, 4));
  geometry.setAttribute('skinWeight', new THREE.Float32BufferAttribute(skinWeight, 4));

  const rootBone = new THREE.Bone();
  const armL = new THREE.Bone();
  const armR = new THREE.Bone();
  armL.position.copy(pivotL);
  armR.position.copy(pivotR);
  rootBone.add(armL);
  rootBone.add(armR);

  const skinned = new THREE.SkinnedMesh(geometry, mesh.material);
  skinned.name = mesh.name;
  skinned.position.copy(mesh.position);
  skinned.quaternion.copy(mesh.quaternion);
  skinned.scale.copy(mesh.scale);
  // The rig only ever bends the arms outward; a stale bounding sphere would
  // otherwise cull the mesh at the edge of the frame.
  skinned.frustumCulled = false;

  const parent = mesh.parent ?? root;
  const at = parent.children.indexOf(mesh);
  parent.remove(mesh);
  if (at >= 0) parent.children.splice(at, 0, skinned);
  else parent.children.push(skinned);
  skinned.parent = parent;
  skinned.add(rootBone);
  skinned.updateMatrixWorld(true);
  skinned.bind(new THREE.Skeleton([rootBone, armL, armR]));

  return {
    armL,
    armR,
    restL: armL.rotation.clone(),
    restR: armR.rotation.clone(),
  };
};
