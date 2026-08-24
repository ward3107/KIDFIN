/**
 * Shared types for the 3D talking mascot avatar.
 *
 * See AVATAR_3D_PLAN.md — these back Layer 2 (renderer) and Layer 3 (voice).
 * They are intentionally small and stable so the dialogue engine (Layer 4,
 * scripted vs AI) can be wired in later without changing the renderer.
 */

/** Emotional states the avatar can express. */
export type AvatarExpression =
  | 'neutral'
  | 'happy'
  | 'thinking'
  | 'surprised'
  | 'sad';

/** One-shot gestures the avatar can play. */
export type AvatarGesture = 'wave' | 'nod' | 'cheer' | 'shrug' | 'think';

/**
 * Imperative handle exposed by <RobotAvatar/> via ref, so any tab/lesson can
 * drive it: speak a line, set a mood, or play a gesture.
 */
export interface AvatarHandle {
  /** Speak text aloud (Web Speech) and animate the "talking" motion. */
  speak: (text: string, opts?: SpeakOptions) => void;
  /** Stop any in-progress speech immediately. */
  stopSpeaking: () => void;
  /** Set the current facial/emotional expression. */
  setExpression: (expression: AvatarExpression) => void;
  /** Play a one-shot gesture, then return to idle. */
  playGesture: (gesture: AvatarGesture) => void;
  /** Whether speech is currently playing. */
  isSpeaking: () => boolean;
}

export interface SpeakOptions {
  /** BCP-47 language, e.g. 'he-IL' or 'en-US'. Defaults from app language. */
  lang?: string;
  /** Speech rate (0.1–10, default ~0.95 for a calm, kid-friendly pace). */
  rate?: number;
  /** Pitch (0–2, default ~1.1 for a friendly mascot tone). */
  pitch?: number;
  /** Expression to hold while speaking. */
  expression?: AvatarExpression;
  /** Called when speech finishes (or is cancelled). */
  onDone?: () => void;
}
