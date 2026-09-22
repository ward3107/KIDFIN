import { useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import type { AvatarMotionState } from './RobotAvatar';
import { motionPose } from './conversationMotion';

const cleanName = (name: string) => name.replace(/\.\d+$/, '');

export function ExpressiveRobotModel({ motion }: { motion: React.MutableRefObject<AvatarMotionState> }) {
  const { scene } = useGLTF('/models/kiwi-expressive.glb');
  const rig = useMemo(() => {
    const model = scene.clone(true);
    const nodes = new Map<string, THREE.Object3D>();
    const morphs: THREE.Mesh[] = [];
    model.traverse((object) => {
      nodes.set(cleanName(object.name), object);
      if (object instanceof THREE.Mesh && object.morphTargetInfluences) {
        morphs.push(object);
        object.material = Array.isArray(object.material)
          ? object.material.map(material => material.clone())
          : object.material.clone();
        if (cleanName(object.name) === 'KIWI_Expressive_mouth') {
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
    const controls = nodes.get('KIWI_CONTROLS');
    const makeLegPivot = (name: string, x: number, parts: string[]) => {
      if (!controls) return;
      const pivot = new THREE.Group();
      pivot.name = name;
      pivot.position.set(x, 0.8, 0);
      controls.add(pivot);
      pivot.updateMatrixWorld(true);
      for (const part of parts) {
        const object = nodes.get(part);
        if (object) pivot.attach(object);
      }
      nodes.set(name, pivot);
    };
    makeLegPivot('KIWI_Leg_pivot_L', -0.34, ['KIWI_Hip_L', 'KIWI_Leg_L', 'KIWI_Foot_L', 'KIWI_Sole_L']);
    makeLegPivot('KIWI_Leg_pivot_R', 0.34, ['KIWI_Hip_R', 'KIWI_Leg_R', 'KIWI_Foot_R', 'KIWI_Sole_R']);
    const rests = new Map([...nodes.values()].map((object) => [object, {
      rotation: object.rotation.clone(),
      position: object.position.clone(),
      scale: object.scale.clone(),
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
    const alpha = 1 - Math.exp(-12 * Math.min(delta, 0.1));
    const rotate = (name: string, axis: 'x' | 'y' | 'z', value: number) => {
      const object = rig.nodes.get(name);
      if (!object) return;
      object.rotation[axis] = THREE.MathUtils.lerp(
        object.rotation[axis], rig.rests.get(object)!.rotation[axis] + value, alpha,
      );
    };

    // Blender's Y axis becomes negative Z in the exported Y-up model.
    rotate('KIWI_Shoulder_L', 'z', -pose.left);
    rotate('KIWI_Shoulder_R', 'z', pose.right);
    rotate('KIWI_Shoulder_L', 'x', pose.armForward);
    rotate('KIWI_Shoulder_R', 'x', pose.armForward);
    // Side-to-side hip rotation is visible from the front; a smaller forward
    // component adds a natural weight shift instead of a marching motion.
    rotate('KIWI_Leg_pivot_L', 'z', pose.legLeft * 0.72);
    rotate('KIWI_Leg_pivot_R', 'z', pose.legRight * 0.72);
    rotate('KIWI_Leg_pivot_L', 'x', pose.legLeft * 0.38);
    rotate('KIWI_Leg_pivot_R', 'x', pose.legRight * 0.38);
    rotate('KIWI_Head_pivot', 'x', pose.nod);
    rotate('KIWI_Head_pivot', 'y', pose.turn);
    rotate('KIWI_Head_pivot', 'z', -pose.tilt);

    const torso = rig.nodes.get('KIWI_Torso');
    if (torso) {
      const rest = rig.rests.get(torso)!;
      torso.position.y = THREE.MathUtils.lerp(torso.position.y, rest.position.y + pose.bob, alpha);
      torso.position.x = THREE.MathUtils.lerp(torso.position.x, rest.position.x + pose.sway * 0.32, alpha);
      torso.rotation.z = THREE.MathUtils.lerp(torso.rotation.z, rest.rotation.z - pose.sway, alpha);
    }
    for (const name of ['KIWI_Brow_L', 'KIWI_Brow_R']) {
      const brow = rig.nodes.get(name);
      if (brow) brow.position.y = THREE.MathUtils.lerp(
        brow.position.y, rig.rests.get(brow)!.position.y + pose.brow, alpha,
      );
    }

    const blink = state.reducedMotion ? 0 : Math.pow(Math.max(0, Math.cos(time * 1.37)), 100);
    for (const mesh of rig.morphs) {
      for (const [name, index] of Object.entries(mesh.morphTargetDictionary || {})) {
        const target = name.startsWith('blink') ? blink
          : name === 'mouthOpen' ? Math.min(1, pose.mouth * 1.55 + (state.phase === 'speaking' ? 0.1 : 0))
            : name === 'mouthRound' ? Math.min(1, pose.round * 1.25)
              : name === 'smile' ? pose.smile : 0;
        mesh.morphTargetInfluences![index] = THREE.MathUtils.lerp(
          mesh.morphTargetInfluences![index], target, alpha,
        );
      }
    }

    // The authored mouth has visemes, but a little whole-mesh stretch makes
    // quieter syllables readable on a phone without looking like a flat decal.
    const mouth = rig.nodes.get('KIWI_Expressive_mouth');
    if (mouth) {
      const rest = rig.rests.get(mouth)!;
      mouth.scale.y = THREE.MathUtils.lerp(
        mouth.scale.y,
        rest.scale.y * (1 + pose.mouth * 0.34),
        alpha,
      );
      mouth.scale.x = THREE.MathUtils.lerp(
        mouth.scale.x,
        rest.scale.x * (1 + pose.round * 0.12 - pose.mouth * 0.04),
        alpha,
      );
    }
  });

  return <primitive object={rig.model} />;
}

useGLTF.preload('/models/kiwi-expressive.glb');
