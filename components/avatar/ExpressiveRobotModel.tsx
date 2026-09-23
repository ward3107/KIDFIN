import { useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import type { AvatarMotionState } from './RobotAvatar';
import { motionPose } from './conversationMotion';
import { normalizeRigNodeName } from './rigNames';

export function ExpressiveRobotModel({ motion }: { motion: React.MutableRefObject<AvatarMotionState> }) {
  const { scene } = useGLTF('/models/kiwi-expressive.glb');
  const rig = useMemo(() => {
    const model = scene.clone(true);
    const nodes = new Map<string, THREE.Object3D>();
    const morphs: THREE.Mesh[] = [];
    model.traverse((object) => {
      nodes.set(object.name, object);
      const baseName = normalizeRigNodeName(object.name);
      const current = nodes.get(baseName);
      // Blender often gives a control group and a visible mesh nearly the same
      // name. Prefer the group so rotations move the whole limb, not only the
      // decorative joint mesh.
      if (!current || (!(current instanceof THREE.Group) && object instanceof THREE.Group)) {
        nodes.set(baseName, object);
      }
      if (object instanceof THREE.Mesh && object.morphTargetInfluences) {
        morphs.push(object);
        object.material = Array.isArray(object.material)
          ? object.material.map(material => material.clone())
          : object.material.clone();
        if (normalizeRigNodeName(object.name) === 'KIWI_Expressive_mouth') {
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          for (const material of materials) {
            if (material instanceof THREE.MeshStandardMaterial) {
              material.color.set('#d94f70');
              material.emissive.set('#3a0713');
              material.emissiveIntensity = 0.28;
              material.roughness = 0.42;
            }
          }
        }
      }
    });
    model.updateMatrixWorld(true);
    const makePivot = (
      name: string,
      parentName: string,
      position: [number, number, number],
      parts: string[],
    ) => {
      const parent = nodes.get(parentName);
      if (!parent) return;
      const pivot = new THREE.Group();
      pivot.name = name;
      pivot.position.set(...position);
      parent.add(pivot);
      model.updateMatrixWorld(true);
      for (const part of parts) {
        const object = nodes.get(part);
        if (object) pivot.attach(object);
      }
      nodes.set(name, pivot);
    };
    makePivot('KIWI_Leg_pivot_L', 'KIWI_CONTROLS', [-0.34, 0.8, 0], ['KIWI_Hip_L', 'KIWI_Leg_L', 'KIWI_Foot_L', 'KIWI_Sole_L']);
    makePivot('KIWI_Leg_pivot_R', 'KIWI_CONTROLS', [0.34, 0.8, 0], ['KIWI_Hip_R', 'KIWI_Leg_R', 'KIWI_Foot_R', 'KIWI_Sole_R']);
    makePivot('KIWI_Elbow_pivot_L', 'KIWI_Shoulder_L', [-0.16, -0.5, 0], [
      'KIWI_Elbow_L', 'KIWI_Forearm_L',
    ]);
    makePivot('KIWI_Elbow_pivot_R', 'KIWI_Shoulder_R', [0.16, -0.5, 0], [
      'KIWI_Elbow_R', 'KIWI_Forearm_R',
    ]);
    makePivot('KIWI_Wrist_pivot_L', 'KIWI_Elbow_pivot_L', [-0.03, -0.36, 0], [
      'KIWI_Palm_L', 'KIWI_Thumb_L', 'KIWI_Finger_L0', 'KIWI_Finger_L1', 'KIWI_Finger_L2',
    ]);
    makePivot('KIWI_Wrist_pivot_R', 'KIWI_Elbow_pivot_R', [0.03, -0.36, 0], [
      'KIWI_Palm_R', 'KIWI_Thumb_R', 'KIWI_Finger_R0', 'KIWI_Finger_R1', 'KIWI_Finger_R2',
    ]);
    const requiredControls = [
      'KIWI_Shoulder_L', 'KIWI_Shoulder_R', 'KIWI_Elbow_pivot_L', 'KIWI_Elbow_pivot_R',
      'KIWI_Wrist_pivot_L', 'KIWI_Wrist_pivot_R', 'KIWI_Leg_pivot_L', 'KIWI_Leg_pivot_R',
      'KIWI_Head_pivot',
    ];
    const missingControls = requiredControls.filter(name => !nodes.has(name));
    if (missingControls.length) console.warn('[KiwiAvatar] Missing rig controls', missingControls);
    const rests = new Map([...nodes.values()].map((object) => [object, {
      rotation: object.rotation.clone(),
      position: object.position.clone(),
    }]));
    return { model, nodes, morphs, rests };
  }, [scene]);

  useFrame((_, delta) => {
    const state = motion.current;
    const time = performance.now() / 1000;
    const pose = motionPose({
      phase: state.phase,
      delivery: state.delivery,
      energy: state.speaking ? state.mouth : 0,
      reduced: state.reducedMotion,
      gesture: state.gesture ? { name: state.gesture.name, age: time - state.gesture.start } : null,
    }, time);
    const bodyAlpha = 1 - Math.exp(-4 * Math.min(delta, 0.1));
    const faceAlpha = 1 - Math.exp(-12 * Math.min(delta, 0.1));
    const rotate = (name: string, axis: 'x' | 'y' | 'z', value: number) => {
      const object = rig.nodes.get(name);
      if (!object) return;
      object.rotation[axis] = THREE.MathUtils.lerp(
        object.rotation[axis], rig.rests.get(object)!.rotation[axis] + value, bodyAlpha,
      );
    };
    const move = (name: string, axis: 'x' | 'y' | 'z', value: number) => {
      const object = rig.nodes.get(name);
      if (!object) return;
      object.position[axis] = THREE.MathUtils.lerp(
        object.position[axis], rig.rests.get(object)!.position[axis] + value, bodyAlpha,
      );
    };

    // Blender's Y axis becomes negative Z in the exported Y-up model.
    rotate('KIWI_Shoulder_L', 'z', -pose.left);
    rotate('KIWI_Shoulder_R', 'z', pose.right);
    rotate('KIWI_Shoulder_L', 'x', pose.armForward);
    rotate('KIWI_Shoulder_R', 'x', pose.armForward);
    rotate('KIWI_Elbow_pivot_L', 'z', pose.elbowLeft);
    rotate('KIWI_Elbow_pivot_R', 'z', -pose.elbowRight);
    rotate('KIWI_Wrist_pivot_L', 'z', pose.wristLeft);
    rotate('KIWI_Wrist_pivot_R', 'z', -pose.wristRight);
    rotate('KIWI_Wrist_pivot_L', 'x', pose.wristLeft * 0.45);
    rotate('KIWI_Wrist_pivot_R', 'x', pose.wristRight * 0.45);
    // Side-to-side hip rotation is visible from the front; a smaller forward
    // component adds a natural weight shift instead of a marching motion.
    rotate('KIWI_Leg_pivot_L', 'z', pose.legLeft * 0.95);
    rotate('KIWI_Leg_pivot_R', 'z', pose.legRight * 0.95);
    rotate('KIWI_Leg_pivot_L', 'x', pose.legLeft * 0.62);
    rotate('KIWI_Leg_pivot_R', 'x', pose.legRight * 0.62);
    move('KIWI_Leg_pivot_L', 'y', pose.liftLeft);
    move('KIWI_Leg_pivot_R', 'y', pose.liftRight);
    rotate('KIWI_Head_pivot', 'x', pose.nod);
    rotate('KIWI_Head_pivot', 'y', pose.turn);
    rotate('KIWI_Head_pivot', 'z', -pose.tilt);

    const torso = rig.nodes.get('KIWI_Torso');
    if (torso) {
      const rest = rig.rests.get(torso)!;
      torso.position.y = THREE.MathUtils.lerp(torso.position.y, rest.position.y + pose.bob, bodyAlpha);
      torso.position.x = THREE.MathUtils.lerp(torso.position.x, rest.position.x + pose.sway * 0.32, bodyAlpha);
      torso.rotation.z = THREE.MathUtils.lerp(torso.rotation.z, rest.rotation.z - pose.sway, bodyAlpha);
    }
    for (const name of ['KIWI_Brow_L', 'KIWI_Brow_R']) {
      const brow = rig.nodes.get(name);
      if (brow) brow.position.y = THREE.MathUtils.lerp(
        brow.position.y, rig.rests.get(brow)!.position.y + pose.brow, bodyAlpha,
      );
    }

    const blink = state.reducedMotion ? 0 : Math.pow(Math.max(0, Math.cos(time * 1.37)), 100);
    for (const mesh of rig.morphs) {
      for (const [name, index] of Object.entries(mesh.morphTargetDictionary || {})) {
        const target = name.startsWith('blink') ? blink
          : name === 'mouthOpen' ? Math.min(0.92, pose.mouth * 1.05 + (state.phase === 'speaking' ? 0.05 : 0))
            : name === 'mouthRound' ? Math.min(0.7, pose.round)
              : name === 'smile' ? pose.smile : 0;
        mesh.morphTargetInfluences![index] = THREE.MathUtils.lerp(
          mesh.morphTargetInfluences![index], target, faceAlpha,
        );
      }
    }
    // Do not scale the mouth object itself. Its vertices are authored far from
    // the object's origin, so object scaling also translates it toward the eyes.
  });

  return <primitive object={rig.model} />;
}

useGLTF.preload('/models/kiwi-expressive.glb');
