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
import { sanitizeForSpeech, speechLang } from '../../utils/speechText';
import { buildArmRig } from './armRig';
import { blinkAmount, blinkDuration, buildFaceRig, browPose } from './faceRig';

const MODEL_URL = '/models/robot.glb';

/**
 * The synthesizer's voice list loads asynchronously — on the first call
 * getVoices() is often empty, so the utterance grabs a wrong default voice
 * (which can sound like another language). Warm and cache the list here.
 */
let cachedVoices: SpeechSynthesisVoice[] = [];
if (typeof window !== 'undefined' && window.speechSynthesis) {
  const warm = () => {
    try {
      cachedVoices = window.speechSynthesis.getVoices();
    } catch {
      /* no-op */
    }
  };
  warm();
  window.speechSynthesis.addEventListener?.('voiceschanged', warm);
}

/** Pick the best installed voice for a BCP-47 language tag, else undefined. */
const pickVoice = (
  synth: SpeechSynthesis,
  lang: string,
): SpeechSynthesisVoice | undefined => {
  const voices = synth.getVoices().length ? synth.getVoices() : cachedVoices;
  const base = lang.split('-')[0];
  return (
    voices.find((v) => v.lang === lang) ??
    voices.find((v) => v.lang?.toLowerCase().startsWith(base.toLowerCase()))
  );
};

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

  // The GLB ships as one fused, boneless mesh. Give it a two-bone arm rig so
  // the arms can actually move while it talks (see armRig.ts).
  const rig = useMemo(() => buildArmRig(model), [model]);

  // Eyelids and eyebrows — the two things a face needs before it reads as alive.
  const face = useMemo(() => buildFaceRig(model), [model]);

  // When the next blink is due, and when the current one started.
  const blink = useRef({ nextAt: 1.5, phase: -1, double: false });

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    const m = motion.current;
    const calm = m.reducedMotion;

    const sp = m.speaking ? 1 : 0;

    // --- Idle: a faint breathing bob only. The body must NOT sway/turn — the
    //     model is one fused mesh, so any rotation.y / position.x moves the whole
    //     robot and reads as distracting "swinging". Liveliness comes from the
    //     mouth, eyes, eyebrows and hands instead. ---
    const bob = calm ? 0 : Math.sin(t * 1.2) * 0.008 + Math.sin(t * 0.63) * 0.004;
    const idleSwayY = calm ? 0 : Math.sin(t * 0.5) * 0.01; // barely-there drift
    const shiftX = 0; // no lateral body shift
    const idleTiltX = calm ? 0 : Math.sin(t * 0.4) * 0.008; // tiny nod

    // --- Talking: a small head nod on the voice, nothing that sways the body. ---
    const talk = sp * (m.mouth * 0.02 + Math.sin(t * 24) * 0.006 * m.mouth);
    const talkSwayY = calm ? 0 : sp * Math.sin(t * 2.1) * 0.012; // minimal
    const talkLeanZ = calm ? 0 : sp * Math.sin(t * 1.6) * 0.012; // slight head tilt
    const talkTiltX = calm ? 0 : sp * Math.sin(t * 3.0) * 0.022 * (0.4 + m.mouth); // nod

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
    // Arm targets, in radians: raise > 0 lifts the arm outward/up.
    let raiseL = 0;
    let raiseR = 0;
    let armFwd = 0;
    if (m.gesture) {
      const age = t - m.gesture.start;
      if (age > 1) {
        m.gesture = null;
      } else {
        const env = Math.sin(Math.min(age, 1) * Math.PI); // 0→1→0
        switch (m.gesture.name) {
          case 'wave':
            gy = Math.sin(age * 22) * 0.18 * env;
            raiseR = (1.15 + Math.sin(age * 16) * 0.3) * env;
            break;
          case 'nod':
            gx = Math.sin(age * 16) * 0.14 * env;
            raiseL = 0.12 * env;
            raiseR = 0.12 * env;
            break;
          case 'cheer':
            gy = Math.sin(age * 8) * 0.10 * env;
            lift += 0.06 * env;
            raiseL = (1.05 + Math.sin(age * 14) * 0.15) * env;
            raiseR = (1.05 + Math.sin(age * 14 + 1) * 0.15) * env;
            break;
          case 'shrug':
            gx = -0.10 * env;
            raiseL = 0.55 * env;
            raiseR = 0.55 * env;
            break;
          case 'think':
            tiltZ += 0.18 * env;
            raiseR = 0.75 * env;
            armFwd = 0.35 * env;
            break;
          default: break;
        }
      }
    }

    // Compose. lerp for smoothness so mood changes ease in.
    g.position.y = THREE.MathUtils.lerp(g.position.y, bob + talk + lift, 0.2);
    g.position.x = THREE.MathUtils.lerp(g.position.x, shiftX, 0.06);
    g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, idleTiltX + tiltX + talkTiltX + gx, 0.15);
    g.rotation.y = THREE.MathUtils.lerp(g.rotation.y, idleSwayY + talkSwayY + gy, 0.1);
    g.rotation.z = THREE.MathUtils.lerp(g.rotation.z, tiltZ + talkLeanZ, 0.15);

    // --- A faint squash & stretch on the voice — kept subtle so the body stays
    //     put and the mouth does the talking. ---
    const openness = m.speaking ? m.mouth : 0;
    const targetSy = 1 + openness * 0.02;
    const targetSx = 1 - openness * 0.008;
    g.scale.y = THREE.MathUtils.lerp(g.scale.y, targetSy, 0.25);
    g.scale.x = THREE.MathUtils.lerp(g.scale.x, targetSx, 0.25);
    g.scale.z = THREE.MathUtils.lerp(g.scale.z, targetSx, 0.25);

    // --- Arms. Idle breathing sway, plus loose "talking with your hands"
    //     motion driven by the same voice level that opens the mouth, plus
    //     whatever one-shot gesture is playing. ---
    if (rig) {
      const idleArm = calm ? 0 : Math.sin(t * 1.1) * 0.05 + Math.sin(t * 0.47) * 0.03;
      // The two arms run slightly out of phase so they never look mechanical.
      const beat = calm ? 0 : sp * (0.18 + m.mouth * 0.5);
      const gestureL = calm ? 0 : Math.sin(t * 5.3) * beat;
      const gestureR = calm ? 0 : Math.sin(t * 4.6 + 1.9) * beat;
      let moodArm = 0;
      if (m.expression === 'happy') moodArm = 0.16;
      else if (m.expression === 'surprised') moodArm = 0.3;
      else if (m.expression === 'sad') moodArm = -0.12;

      const targetL = idleArm + gestureL + moodArm + raiseL;
      const targetR = idleArm + gestureR + moodArm + raiseR;
      const fwd = armFwd + (calm ? 0 : sp * m.mouth * 0.18);

      // Signs are mirrored: +z lifts the left arm, −z lifts the right one.
      rig.armL.rotation.z = THREE.MathUtils.lerp(rig.armL.rotation.z, rig.restL.z + targetL, 0.16);
      rig.armR.rotation.z = THREE.MathUtils.lerp(rig.armR.rotation.z, rig.restR.z - targetR, 0.16);
      rig.armL.rotation.x = THREE.MathUtils.lerp(rig.armL.rotation.x, rig.restL.x + fwd, 0.16);
      rig.armR.rotation.x = THREE.MathUtils.lerp(rig.armR.rotation.x, rig.restR.x + fwd, 0.16);
    }

    // --- Blinking. Real blinks are quick and irregular: a fast close, a
    //     slightly slower open, and an uneven gap in between. ---
    const b = blink.current;
    if (calm) {
      face.lids.forEach(l => {
        l.scale.y = 0;
      });
    } else {
      if (b.phase < 0 && t >= b.nextAt) {
        b.phase = 0;
        b.double = Math.random() < 0.22; // people often blink twice
      }
      let shut = 0;
      if (b.phase >= 0) {
        const total = blinkDuration(b.double);
        // Advance the blink by elapsed time, but never by more than a quarter of
        // it in one frame: on a slow device a single frame can be longer than
        // the whole blink, and stepping in wall-clock time would skip straight
        // past the closed pose without ever drawing it.
        b.phase += Math.min(delta, total / 4);
        shut = blinkAmount(b.phase, b.double);
        if (b.phase >= total) {
          b.phase = -1;
          // Blink more often while talking — it tracks the pace of speech.
          const gap = m.speaking ? 1.6 : 2.6;
          b.nextAt = t + gap + Math.random() * 3.4;
        }
      }
      face.lids.forEach(l => {
        l.scale.y = shut;
      });
    }

    // --- Eyebrows. Mood sets the resting shape; speech nudges them so the
    //     face stays busy while it talks. ---
    const pose = browPose(m.expression);
    const emphasis = calm ? 0 : sp * m.mouth * 0.035;
    face.brows.forEach((brow, i) => {
      const inner = i === 0 ? 1 : -1; // the left brow's inner end points at +x
      // "Thinking" cocks one brow rather than both.
      const solo = m.expression === 'thinking' && i === 1 ? 1.9 : 1;
      brow.rotation.z = THREE.MathUtils.lerp(brow.rotation.z, pose.tilt * inner * solo, 0.12);
      brow.position.y = THREE.MathUtils.lerp(
        brow.position.y,
        face.browRestY[i] + pose.lift * solo + emphasis,
        0.12,
      );
    });

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

    // --- Web Audio graph: analyse the live voice so the mouth opens on the
    //     actual sound (louder syllables → wider), not a canned oscillation. ---
    const audioCtxRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const analyserDataRef = useRef<Uint8Array | null>(null);
    const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
    const usingAnalyserRef = useRef(false);
    // The animated mouth overlay (driven directly to avoid per-frame React renders).
    const mouthElRef = useRef<HTMLDivElement | null>(null);

    const ensureAudioGraph = (): AnalyserNode | null => {
      if (typeof window === 'undefined') return null;
      try {
        if (!audioCtxRef.current) {
          const Ctor =
            window.AudioContext ??
            (window as unknown as { webkitAudioContext?: typeof AudioContext })
              .webkitAudioContext;
          if (!Ctor) return null;
          const ctx = new Ctor();
          const analyser = ctx.createAnalyser();
          analyser.fftSize = 256;
          analyser.smoothingTimeConstant = 0.6;
          analyser.connect(ctx.destination);
          audioCtxRef.current = ctx;
          analyserRef.current = analyser;
          analyserDataRef.current = new Uint8Array(analyser.fftSize);
        }
        return analyserRef.current;
      } catch {
        return null;
      }
    };

    // Animation frame: derive the mouth-open level from real audio amplitude
    // (with a Web-Speech fallback), then drive the visible mouth overlay.
    const rafRef = useRef<number | null>(null);
    useEffect(() => {
      const tick = () => {
        const m = motion.current;
        if (m.speaking) {
          const analyser = analyserRef.current;
          const data = analyserDataRef.current;
          if (usingAnalyserRef.current && analyser && data) {
            analyser.getByteTimeDomainData(data);
            let sum = 0;
            for (let i = 0; i < data.length; i++) {
              const v = (data[i] - 128) / 128;
              sum += v * v;
            }
            const rms = Math.sqrt(sum / data.length);
            const level = Math.min(1, rms * 3.4); // gain up to a usable range
            m.mouth = m.mouth * 0.55 + level * 0.45; // smooth
          } else {
            // No analyser (e.g. Web Speech fallback): natural-looking cadence.
            m.mouth = 0.55 + 0.45 * Math.abs(Math.sin(performance.now() / 90));
          }
        }
        // Drive the animated mouth overlay: opens with the live voice level.
        const el = mouthElRef.current;
        if (el) {
          const open = m.speaking ? m.mouth : 0;
          el.style.opacity = open > 0.06 ? '1' : '0';
          el.style.transform = `translate(-50%, -50%) scaleY(${(0.22 + open * 1.5).toFixed(3)}) scaleX(${(0.85 + open * 0.3).toFixed(3)})`;
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
      if (sourceRef.current) {
        try {
          sourceRef.current.disconnect();
        } catch {
          /* no-op */
        }
        sourceRef.current = null;
      }
      usingAnalyserRef.current = false;
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
        try {
          void audioCtxRef.current?.close();
        } catch {
          /* no-op */
        }
        audioCtxRef.current = null;
      };
    }, []);

    useImperativeHandle(
      ref,
      (): AvatarHandle => ({
        speak: (text: string, opts?: SpeakOptions) => {
          const synth = typeof window !== 'undefined' ? window.speechSynthesis : undefined;
          if (opts?.expression) motion.current.expression = opts.expression;
          const spoken = sanitizeForSpeech(text); // strip emojis/markdown so they aren't read aloud
          if (!synth || !spoken) {
            opts?.onDone?.();
            return;
          }
          synth.cancel(); // interrupt any previous line
          usingAnalyserRef.current = false; // Web Speech can't be analysed → cadence fallback
          const u = new SpeechSynthesisUtterance(spoken);
          u.lang = speechLang(i18n.language, opts?.lang);
          u.rate = opts?.rate ?? 0.95;
          u.pitch = opts?.pitch ?? 1.1;

          // Use a voice that matches the language; never let it grab a foreign default.
          const match = pickVoice(synth, u.lang);
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
            usingAnalyserRef.current = false;
            const synth = typeof window !== 'undefined' ? window.speechSynthesis : undefined;
            const spoken = sanitizeForSpeech(opts?.fallbackText ?? '');
            if (!synth || !spoken) {
              finish();
              return;
            }
            const u = new SpeechSynthesisUtterance(spoken);
            u.lang = speechLang(i18n.language, opts?.lang);
            u.rate = 0.95;
            u.pitch = 1.1;
            const match = pickVoice(synth, u.lang);
            if (match) u.voice = match;
            u.onstart = () => {
              motion.current.speaking = true;
            };
            u.onend = finish;
            u.onerror = finish;
            synth.speak(u);
          };

          try {
            const audio = new Audio(url);
            audio.crossOrigin = 'anonymous';
            audioRef.current = audio;

            // Route the clip through the analyser so the mouth tracks the voice.
            const analyser = ensureAudioGraph();
            if (analyser && audioCtxRef.current) {
              try {
                if (audioCtxRef.current.state === 'suspended') {
                  void audioCtxRef.current.resume();
                }
                const src = audioCtxRef.current.createMediaElementSource(audio);
                src.connect(analyser);
                sourceRef.current = src;
                usingAnalyserRef.current = true;
              } catch {
                usingAnalyserRef.current = false; // still plays, mouth uses cadence
              }
            }

            audio.onplaying = () => {
              motion.current.speaking = true;
            };
            audio.onended = () => {
              stopAudioClip();
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
        getLiveAudioSink: () => {
          const analyser = ensureAudioGraph();
          const ctx = audioCtxRef.current;
          if (!analyser || !ctx) return null;
          if (ctx.state === 'suspended') void ctx.resume();
          // Live voice is analysed for real amplitude-based lip-sync.
          usingAnalyserRef.current = true;
          return { context: ctx, node: analyser };
        },
        setSpeaking: (on: boolean) => {
          motion.current.speaking = on;
          if (!on) motion.current.mouth = 0;
        },
      }),
      [i18n.language],
    );

    return (
      <div
        className={className}
        style={{
          height,
          width: '100%',
          position: 'relative',
          touchAction: interactive ? 'none' : 'auto',
        }}
      >
        {/* Animated mouth — opens with the live voice level. mouthElRef is the
            scaled wrapper; the inner layers give it lips, teeth and a tongue. */}
        <div
          ref={mouthElRef}
          aria-hidden
          style={{
            position: 'absolute',
            top: '44%',
            left: '50%',
            width: '13%',
            maxWidth: 58,
            aspectRatio: '3 / 2',
            opacity: 0,
            transform: 'translate(-50%, -50%) scaleY(0.22)',
            transition: 'opacity 120ms linear',
            pointerEvents: 'none',
            zIndex: 2,
          }}
        >
          {/* mouth interior + lip rim */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'radial-gradient(ellipse at 50% 38%, #2b1414 0%, #160a0a 60%, #050202 100%)',
              borderRadius: '50%',
              border: '2px solid rgba(150,70,70,0.85)',
              boxShadow:
                '0 1px 3px rgba(0,0,0,0.45), inset 0 2px 4px rgba(0,0,0,0.7)',
              overflow: 'hidden',
            }}
          >
            {/* upper teeth */}
            <div
              style={{
                position: 'absolute',
                top: '4%',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '74%',
                height: '20%',
                background: 'linear-gradient(#ffffff, #f2e9e2)',
                borderRadius: '0 0 45% 45%',
              }}
            />
            {/* tongue */}
            <div
              style={{
                position: 'absolute',
                bottom: '4%',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '64%',
                height: '46%',
                background:
                  'radial-gradient(ellipse at 50% 35%, #ec6a84 0%, #c8385a 100%)',
                borderRadius: '50% 50% 50% 50%',
              }}
            />
          </div>
        </div>
        <Canvas
          dpr={[1, 1.75]}
          shadows
          camera={{ position: [0, 0.4, 4.2], fov: 40 }}
          gl={{ antialias: true, alpha: true }}
        >
          {/* Self-contained lighting — no remote HDR, so the robot always renders
              (even offline / in the PWA cache). */}
          <ambientLight intensity={0.85} />
          <hemisphereLight args={['#ffffff', '#b9c6d6', 0.6]} />
          <directionalLight position={[3, 5, 4]} intensity={1.15} castShadow />
          <directionalLight position={[-4, 2, -2]} intensity={0.45} />
          <directionalLight position={[0, 2, -5]} intensity={0.35} />
          <Suspense fallback={null}>
            <Bounds fit clip observe margin={1.15}>
              <RobotModel motion={motion} />
            </Bounds>
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
