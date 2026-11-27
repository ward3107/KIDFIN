/**
 * Batch "ears" pipeline for Kiwi (Route B).
 *
 * Records a short utterance and sends one WAV clip to our server
 * (/api/kiwi-turn), which asks Gemini to transcribe it and reply as Kiwi.
 *
 * Browser-only glue (mic + WAV); the pure bits live in ./pcm and ./wav.
 */
import { GEMINI_INPUT_RATE, floatTo16BitPCM, resample } from './pcm';
import { pcmToWavBase64 } from './wav';
import { MAX_TURN_SECONDS } from './turnLimits';

export interface KiwiTurnResult {
  heard: string;
  reply: string;
}

/** History turn sent for context (kept short server-side). */
export interface TurnHistory {
  role: 'user' | 'model';
  text: string;
}

/** Check the funded route before asking for microphone permission. No debit. */
export const checkKiwiTurnReady = async (url = '/api/kiwi-turn'): Promise<void> => {
  const response = await fetch(url, { cache: 'no-store' });
  const body = await response.json().catch(() => ({})) as { ready?: boolean; error?: string };
  if (!response.ok || body.ready !== true) throw new Error(body.error || 'not_configured');
};

/**
 * Records one microphone utterance and returns it as base64 WAV (16 kHz mono).
 * Reusable: call start() then stop() per turn.
 */
export class TalkRecorder {
  private ctx: AudioContext | null = null;
  private stream: MediaStream | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private processor: ScriptProcessorNode | null = null;
  private muteGain: GainNode | null = null;
  private chunks: Float32Array[] = [];
  private capturedSamples = 0;
  private recording = false;
  private disposed = false;

  /** True once the mic is granted; ask for permission up front. */
  async init(): Promise<void> {
    if (this.stream) return;
    if (this.disposed) throw new Error('recorder_disposed');
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: 1,
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });
    if (this.disposed) {
      stream.getTracks().forEach(track => track.stop());
      throw new Error('recorder_disposed');
    }
    this.stream = stream;
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    this.ctx = new Ctor();
  }

  start(): void {
    if (!this.ctx || !this.stream || this.recording) return;
    if (this.ctx.state === 'suspended') void this.ctx.resume();
    this.chunks = [];
    this.capturedSamples = 0;
    this.recording = true;
    this.source = this.ctx.createMediaStreamSource(this.stream);
    this.processor = this.ctx.createScriptProcessor(4096, 1, 1);
    this.muteGain = this.ctx.createGain();
    this.muteGain.gain.value = 0;
    this.processor.onaudioprocess = (e: AudioProcessingEvent) => {
      if (!this.recording || !this.ctx) return;
      // Copy — the underlying buffer is reused by the audio thread.
      const remaining = Math.floor(this.ctx.sampleRate * MAX_TURN_SECONDS) - this.capturedSamples;
      if (remaining <= 0) return;
      const samples = e.inputBuffer.getChannelData(0).subarray(0, remaining);
      this.chunks.push(new Float32Array(samples));
      this.capturedSamples += samples.length;
    };
    this.source.connect(this.processor);
    this.processor.connect(this.muteGain);
    this.muteGain.connect(this.ctx.destination);
  }

  /** Stop recording and return the utterance as base64 WAV (or '' if empty). */
  stop(): string {
    if (!this.recording || !this.ctx) return '';
    this.recording = false;
    try {
      this.processor?.disconnect();
      this.source?.disconnect();
      this.muteGain?.disconnect();
    } catch {
      /* no-op */
    }
    if (this.processor) this.processor.onaudioprocess = null;
    this.processor = null;
    this.source = null;
    this.muteGain = null;

    const total = this.capturedSamples;
    if (total === 0) return '';
    const flat = new Float32Array(total);
    let o = 0;
    for (const c of this.chunks) {
      flat.set(c, o);
      o += c.length;
    }
    this.chunks = [];
    this.capturedSamples = 0;
    const down = resample(flat, this.ctx.sampleRate, GEMINI_INPUT_RATE);
    return pcmToWavBase64(floatTo16BitPCM(down), GEMINI_INPUT_RATE);
  }

  /** How many seconds are captured so far (to reject accidental taps). */
  get seconds(): number {
    if (!this.ctx) return 0;
    return this.capturedSamples / this.ctx.sampleRate;
  }

  dispose(): void {
    this.disposed = true;
    this.recording = false;
    try {
      this.processor?.disconnect();
      this.source?.disconnect();
      this.muteGain?.disconnect();
    } catch {
      /* no-op */
    }
    this.stream?.getTracks().forEach((t) => t.stop());
    try {
      void this.ctx?.close();
    } catch {
      /* no-op */
    }
    this.ctx = null;
    this.stream = null;
    this.processor = null;
    this.source = null;
    this.muteGain = null;
    this.chunks = [];
    this.capturedSamples = 0;
  }
}

/** Send one recorded utterance to the server and get Kiwi's transcript + reply. */
export const postKiwiTurn = async (
  audioBase64: string,
  history: TurnHistory[],
  lang: 'he' | 'ar',
  tokenUrl = '/api/kiwi-turn',
): Promise<KiwiTurnResult> => {
  const res = await fetch(tokenUrl, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ audio: audioBase64, history, lang }),
  });
  const data = (await res.json().catch(() => ({}))) as Partial<KiwiTurnResult> & {
    error?: string;
  };
  if (!res.ok) {
    const err = new Error(data.error || (res.status === 503 ? 'not_configured' : 'turn_failed'));
    throw err;
  }
  return { heard: data.heard ?? '', reply: data.reply ?? '' };
};

/** Ask Kiwi for its opening line (no audio) so it can greet first. */
export const postKiwiGreeting = async (
  lang: 'he' | 'ar',
  tokenUrl = '/api/kiwi-turn',
): Promise<string> => {
  const res = await fetch(tokenUrl, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ greeting: true, lang }),
  });
  const data = (await res.json().catch(() => ({}))) as { reply?: string; error?: string };
  if (!res.ok) throw new Error(data.error || 'greeting_failed');
  return data.reply ?? '';
};
