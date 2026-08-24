import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Voice input for the talking mascot (AVATAR_3D_PLAN.md — Layer 3, listening).
 *
 * Thin wrapper around the Web Speech API's SpeechRecognition (webkit-prefixed
 * in most browsers). Lets a child speak; returns the recognized transcript.
 * Language follows the app language (he / ar). Gracefully reports when the
 * browser has no support so the UI can hide the mic.
 */

// Minimal typings — the DOM lib doesn't ship SpeechRecognition types everywhere.
type SpeechRecognitionResultLike = { transcript: string };
interface SpeechRecognitionEventLike {
  results: ArrayLike<ArrayLike<SpeechRecognitionResultLike>>;
}
interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((e: SpeechRecognitionEventLike) => void) | null;
  onerror: ((e: { error?: string }) => void) | null;
  onend: (() => void) | null;
}
type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

const getRecognitionCtor = (): SpeechRecognitionCtor | null => {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
};

const langToRecognition = (appLang: string): string => {
  if (appLang.startsWith('ar')) return 'ar-SA';
  if (appLang.startsWith('he')) return 'he-IL';
  if (appLang.startsWith('en')) return 'en-US';
  return appLang;
};

export interface UseSpeechRecognition {
  /** True if this browser can do voice input at all. */
  supported: boolean;
  /** True while actively listening to the microphone. */
  listening: boolean;
  /** The most recent recognized text. */
  transcript: string;
  /** Last error code, if any (e.g. 'not-allowed', 'no-speech'). */
  error: string | null;
  /** Begin listening. Resolves the transcript via onResult. */
  start: () => void;
  /** Stop listening. */
  stop: () => void;
  /** Clear the current transcript. */
  reset: () => void;
}

export const useSpeechRecognition = (
  onResult?: (text: string) => void,
): UseSpeechRecognition => {
  const { i18n } = useTranslation();
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const onResultRef = useRef(onResult);
  onResultRef.current = onResult;

  const [supported] = useState<boolean>(() => getRecognitionCtor() !== null);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const Ctor = getRecognitionCtor();
    if (!Ctor) return;

    const rec = new Ctor();
    rec.continuous = false;
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.lang = langToRecognition(i18n.language || 'he');

    rec.onresult = (e) => {
      const text = e.results?.[0]?.[0]?.transcript?.trim() ?? '';
      setTranscript(text);
      if (text) onResultRef.current?.(text);
    };
    rec.onerror = (e) => {
      setError(e?.error ?? 'error');
      setListening(false);
    };
    rec.onend = () => setListening(false);

    recognitionRef.current = rec;
    return () => {
      rec.onresult = null;
      rec.onerror = null;
      rec.onend = null;
      try {
        rec.abort();
      } catch {
        /* no-op */
      }
      recognitionRef.current = null;
    };
  }, [i18n.language]);

  const start = useCallback(() => {
    const rec = recognitionRef.current;
    if (!rec || listening) return;
    setError(null);
    setTranscript('');
    try {
      rec.start();
      setListening(true);
    } catch {
      // start() throws if called while already started — ignore.
    }
  }, [listening]);

  const stop = useCallback(() => {
    try {
      recognitionRef.current?.stop();
    } catch {
      /* no-op */
    }
    setListening(false);
  }, []);

  const reset = useCallback(() => setTranscript(''), []);

  return { supported, listening, transcript, error, start, stop, reset };
};
