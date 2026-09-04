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
 * The avatar's own Web Audio graph, handed to the live voice session so Kiwi's
 * streamed speech plays through the SAME analyser that drives the mouth — giving
 * real amplitude-based lip-sync for the live voice, exactly like pre-recorded
 * clips.
 */
export interface LiveAudioSink {
  /** The avatar's AudioContext (already resumed on a user gesture). */
  context: AudioContext;
  /** Connect live playback nodes here (the lip-sync analyser). */
  node: AudioNode;
}

/**
 * Imperative handle exposed by <RobotAvatar/> via ref, so any tab/lesson can
 * drive it: speak a line, set a mood, or play a gesture.
 */
export interface AvatarHandle {
  /** Speak text aloud (Web Speech) and animate the "talking" motion. */
  speak: (text: string, opts?: SpeakOptions) => void;
  /**
   * Play a pre-generated natural-voice audio clip (URL) and animate the mouth.
   * Falls back to `speak(fallbackText)` if the clip can't be loaded/played.
   */
  playClip: (url: string, opts?: PlayClipOptions) => void;
  /** Stop any in-progress speech or clip immediately. */
  stopSpeaking: () => void;
  /** Set the current facial/emotional expression. */
  setExpression: (expression: AvatarExpression) => void;
  /** Play a one-shot gesture, then return to idle. */
  playGesture: (gesture: AvatarGesture) => void;
  /** Whether speech is currently playing. */
  isSpeaking: () => boolean;
  /**
   * Live voice mode: return the avatar's audio graph so an external live audio
   * stream (Gemini Live) can be played through the same lip-sync analyser.
   * Ensures/resumes the audio context and switches the mouth to amplitude mode.
   * Returns null if Web Audio isn't available.
   */
  getLiveAudioSink?: () => LiveAudioSink | null;
  /** Force the "speaking" animation state on/off (used by live voice mode). */
  setSpeaking?: (on: boolean) => void;
}

export interface PlayClipOptions {
  /** Expression to hold while the clip plays. */
  expression?: AvatarExpression;
  /** Text spoken via Web Speech if the audio clip fails to load. */
  fallbackText?: string;
  /** Language for the fallback speech. */
  lang?: string;
  /** Called when the clip finishes (or fails/cancels). */
  onDone?: () => void;
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
