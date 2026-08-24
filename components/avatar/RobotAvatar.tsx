import React, {
  Suspense,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import {
  Bounds,
  ContactShadows,
  Environment,
  OrbitControls,
  useGLTF,
} from '@react-three/drei';
import * as THREE from 'three';
import { useTranslation } from 'react-i18next';
import type {
  AvatarExpression,
  AvatarGesture,
  AvatarHandle,
  PlayClipOptions,
  SpeakOptions,
} from './avatarTypes';

const MODEL_URL = '/models/robot.glb';

/** Mutable state shared from the DOM layer (speak/expression) into the R3F loop. */
interface AvatarMotionState {
  speaking: boolean;
  /** Rising while speaking, decaying to 0 when silent — drives the "talking" pulse. */
  mouth: number;
  expression: AvatarExpression;
  gesture: { name: AvatarGesture; start: number } | null;
  reducedMotion: boolean;
}

interface RobotAvatarProps {
  /** Height of the canvas box. Defaults to a comfortable portrait card. */
  height?: number | string;
  /** Allow click-drag orbiting (default true). */
  interactive?: boolean;
  className?: string;
}

/* -------------------------------------------------------------------------- */
/*  The model (runs inside the R3F render loop)                               */
/* -------------------------------------------------------------------------- */

const RobotModel: React.FC<{ motion: React.MutableRefObject<AvatarMotionState> }> = ({
  motion,
}) => {
  const group = useRef<THREE.Group>(null);
  const { scene } = useGLTF(MODEL_URL);

  // Clone so the cached GLTF is never mutated across mounts.
  const model = useMemo(() => scene.clone(true), [scene]);

  useFrame((state) => {
    const g = group.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    const m = motion.current;
    const calm = m.reducedMotion;

    // --- Idle: gentle breathing bob + slow sway (skipped under reduced-motion) ---
    const bob = calm ? 0 : Math.sin(t * 1.4) * 0.03;
    const sway = calm ? 0 : Math.sin(t * 0.6) * 0.05;

    // --- Talking: quick vertical "nodding" pulse scaled by mouth level ---
    const talk = m.speaking ? Math.sin(t * 16) * 0.04 * m.mouth : 0;

    // --- Expression: subtle head tilt / lift per mood ---
    let tiltX = 0;
    let tiltZ = 0;
    let lift = 0;
    switch (m.expression) {
      case 'happy':     lift = 0.04; break;
      case 'thinking':  tiltZ = 0.12; break;
      case 'surprised': lift = 0.08; break;
      case 'sad':       tiltX = 0.12; lift = -0.04; break;
      default: break;
    }

    // --- One-shot gesture (decays over ~1s) ---
    let gx = 0;
    let gy = 0;
    if (m.gesture) {
      const age = t - m.gesture.start;
      if (age > 1) {
        m.gesture = null;
      } else {
        const env = Math.sin(Math.min(age, 1) * Math.PI); // 0→1→0
        switch (m.gesture.name) {
          case 'wave':  gy = Math.sin(age * 22) * 0.18 * env; break;
          case 'nod':   gx = Math.sin(age * 16) * 0.14 * env; break;
          case 'cheer': gy = Math.sin(age * 8) * 0.10 * env; lift += 0.06 * env; break;
          case 'shrug': gx = -0.10 * env; break;
          case 'think': tiltZ += 0.18 * env; break;
          default: break;
        }
      }
    }

    // Compose. lerp for smoothness so mood changes ease in.
    g.position.y = THREE.MathUtils.lerp(g.position.y, bob + talk + lift, 0.15);
    g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, tiltX + gx, 0.15);
    g.rotation.y = THREE.MathUtils.lerp(g.rotation.y, sway + gy, 0.1);
    g.rotation.z = THREE.MathUtils.lerp(g.rotation.z, tiltZ, 0.15);

    // Decay the mouth level when not speaking.
    if (!m.speaking && m.mouth > 0) {
      m.mouth = Math.max(0, m.mouth - 0.08);
    }
  });

  return (
    <group ref={group}>
      <primitive object={model} />
    </group>
  );
};

/* -------------------------------------------------------------------------- */
/*  The avatar (DOM + Canvas + Web Speech)                                     */
/* -------------------------------------------------------------------------- */

export const RobotAvatar = forwardRef<AvatarHandle, RobotAvatarProps>(
  ({ height = 420, interactive = true, className }, ref) => {
    const { i18n } = useTranslation();

    const motion = useRef<AvatarMotionState>({
      speaking: false,
      mouth: 0,
      expression: 'neutral',
      gesture: null,
      reducedMotion:
        typeof window !== 'undefined' &&
        window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true,
    });

    // Keep an animation frame running to raise the "mouth" level while speaking,
    // so the talking pulse feels lively even without real visemes/morph targets.
    const rafRef = useRef<number | null>(null);
    useEffect(() => {
      const tick = () => {
        const m = motion.current;
        if (m.speaking) {
          // Oscillate the target mouth openness for a natural cadence.
          m.mouth = 0.6 + 0.4 * Math.abs(Math.sin(performance.now() / 90));
        }
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
      return () => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
      };
    }, []);

    // Holds the currently-playing natural-voice audio clip (if any).
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const stopAudioClip = () => {
      const a = audioRef.current;
      if (a) {
        a.onended = null;
        a.onerror = null;
        a.pause();
        audioRef.current = null;
      }
    };

    // Cancel any speech/clip if the component unmounts.
    useEffect(() => {
      return () => {
        try {
          window.speechSynthesis?.cancel();
        } catch {
          /* no-op */
        }
        stopAudioClip();
      };
    }, []);

    useImperativeHandle(
      ref,
      (): AvatarHandle => ({
        speak: (text: string, opts?: SpeakOptions) => {
          const synth = typeof window !== 'undefined' ? window.speechSynthesis : undefined;
          if (opts?.expression) motion.current.expression = opts.expression;
          if (!synth || !text) {
            opts?.onDone?.();
            return;
          }
          synth.cancel(); // interrupt any previous line
          const u = new SpeechSynthesisUtterance(text);
          u.lang = opts?.lang ?? (i18n.language?.startsWith('he') ? 'he-IL' : 'en-US');
          u.rate = opts?.rate ?? 0.95;
          u.pitch = opts?.pitch ?? 1.1;

          // Prefer a voice matching the language, if the browser has one.
          const voices = synth.getVoices();
          const match = voices.find((v) => v.lang === u.lang) ??
            voices.find((v) => v.lang?.startsWith(u.lang.split('-')[0]));
          if (match) u.voice = match;

          u.onstart = () => {
            motion.current.speaking = true;
          };
          const end = () => {
            motion.current.speaking = false;
            opts?.onDone?.();
          };
          u.onend = end;
          u.onerror = end;
          synth.speak(u);
        },
        playClip: (url: string, opts?: PlayClipOptions) => {
          if (opts?.expression) motion.current.expression = opts.expression;
          // Stop any prior clip/speech first.
          stopAudioClip();
          try {
            window.speechSynthesis?.cancel();
          } catch {
            /* no-op */
          }

          const finish = () => {
            motion.current.speaking = false;
            opts?.onDone?.();
          };

          // Fall back to Web Speech if the clip can't be played.
          const fallback = () => {
            stopAudioClip();
            const synth = typeof window !== 'undefined' ? window.speechSynthesis : undefined;
            if (!synth || !opts?.fallbackText) {
              finish();
              return;
            }
            const u = new SpeechSynthesisUtterance(opts.fallbackText);
            u.lang = opts.lang ?? (i18n.language?.startsWith('ar') ? 'ar' : 'he-IL');
            u.rate = 0.95;
            u.pitch = 1.1;
            u.onstart = () => {
              motion.current.speaking = true;
            };
            u.onend = finish;
            u.onerror = finish;
            synth.speak(u);
          };

          try {
            const audio = new Audio(url);
            audioRef.current = audio;
            audio.onplaying = () => {
              motion.current.speaking = true;
            };
            audio.onended = () => {
              audioRef.current = null;
              finish();
            };
            audio.onerror = fallback;
            const p = audio.play();
            if (p && typeof p.catch === 'function') p.catch(fallback);
          } catch {
            fallback();
          }
        },
        stopSpeaking: () => {
          try {
            window.speechSynthesis?.cancel();
          } catch {
            /* no-op */
          }
          stopAudioClip();
          motion.current.speaking = false;
        },
        setExpression: (expression: AvatarExpression) => {
          motion.current.expression = expression;
        },
        playGesture: (gesture: AvatarGesture) => {
          motion.current.gesture = { name: gesture, start: performance.now() / 1000 };
        },
        isSpeaking: () => motion.current.speaking,
      }),
      [i18n.language],
    );

    return (
      <div
        className={className}
        style={{ height, width: '100%', touchAction: interactive ? 'none' : 'auto' }}
      >
        <Canvas
          dpr={[1, 1.75]}
          shadows
          camera={{ position: [0, 0.4, 4.2], fov: 40 }}
          gl={{ antialias: true, alpha: true }}
        >
          <ambientLight intensity={0.7} />
          <directionalLight position={[3, 5, 4]} intensity={1.1} castShadow />
          <directionalLight position={[-4, 2, -2]} intensity={0.4} />
          <Suspense fallback={null}>
            <Bounds fit clip observe margin={1.15}>
              <RobotModel motion={motion} />
            </Bounds>
            <Environment preset="city" />
          </Suspense>
          <ContactShadows
            position={[0, -1.15, 0]}
            opacity={0.35}
            scale={6}
            blur={2.4}
            far={3}
          />
          {interactive && (
            <OrbitControls
              enablePan={false}
              minDistance={2.5}
              maxDistance={6}
              minPolarAngle={Math.PI / 3}
              maxPolarAngle={Math.PI / 1.9}
              autoRotate={!motion.current.reducedMotion}
              autoRotateSpeed={0.6}
            />
          )}
        </Canvas>
      </div>
    );
  },
);

RobotAvatar.displayName = 'RobotAvatar';

// Warm the GLTF cache so the model is ready when the avatar mounts.
useGLTF.preload(MODEL_URL);
