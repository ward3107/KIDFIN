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
      if (object instanceof THREE.Mesh && object.morphTargetInfluences) morphs.push(object);
    });
    const rests = new Map([...nodes.values()].map((object) => [object, {
      rotation: object.rotation.clone(), position: object.position.clone(),
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
    rotate('KIWI_Head_pivot', 'x', pose.nod);
    rotate('KIWI_Head_pivot', 'z', -pose.tilt);

    const torso = rig.nodes.get('KIWI_Torso');
    if (torso) torso.position.y = THREE.MathUtils.lerp(
      torso.position.y, rig.rests.get(torso)!.position.y + pose.bob, alpha,
    );
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
          : name === 'mouthOpen' ? pose.mouth
            : name === 'mouthRound' ? pose.round
              : name === 'smile' ? pose.smile : 0;
        mesh.morphTargetInfluences![index] = THREE.MathUtils.lerp(
          mesh.morphTargetInfluences![index], target, alpha,
        );
      }
    }
  });

  return <primitive object={rig.model} />;
}

useGLTF.preload('/models/kiwi-expressive.glb');
