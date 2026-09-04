/**
 * Gemini Live voice session for Kiwi — real-time, two-way spoken conversation.
 *
 * Flow:
 *   1. Ask our own server (/api/gemini-token) for a short-lived ephemeral token
 *      (the real GEMINI_API_KEY never reaches the browser).
 *   2. Open the Live WebSocket directly to Google with that token.
 *   3. Stream the child's microphone up as 16 kHz PCM; Gemini's built-in voice
 *      activity detection means Kiwi automatically STOPS talking and LISTENS the
 *      moment the child speaks (barge-in) — the behaviour scripted mode lacked.
 *   4. Play Gemini's 24 kHz PCM replies back through the avatar's lip-sync
 *      analyser so the mouth moves with the real voice.
 *
 * Everything that can be unit-tested lives in ./pcm; this file is the browser-
 * only glue (WebSocket + Web Audio) and is loaded lazily.
 */
import { GoogleGenAI, Modality, type LiveServerMessage, type Session } from '@google/genai';
import type { LiveAudioSink } from '../../components/avatar/avatarTypes';
import { kiwiSystemInstruction, DEFAULT_LIVE_MODEL, DEFAULT_LIVE_VOICE } from './persona';
import {
  GEMINI_INPUT_RATE,
  GEMINI_OUTPUT_RATE,
  base64ToInt16,
  floatTo16BitPCM,
  int16ToBase64,
  int16ToFloat32,
  resample,
} from './pcm';

export type LiveStatus =
  | 'connecting'
  | 'ready' // connected, mic idle — waiting for the child to press "talk"
  | 'listening' // child is holding/opened the turn; their speech is streaming
  | 'thinking' // child sent the turn; waiting for Kiwi's reply
  | 'speaking' // Kiwi is talking
  | 'error'
  | 'closed';

export interface LiveCallbacks {
  onStatus?: (status: LiveStatus) => void;
  /** Rolling transcript of what the child said. */
  onUserText?: (text: string) => void;
  /** Rolling transcript of what Kiwi said. */
  onKiwiText?: (text: string) => void;
  onError?: (code: string) => void;
}

export interface LiveSessionOptions {
  lang: 'he' | 'ar';
  /** The avatar's audio graph, so Kiwi's voice drives the mouth. */
  sink: LiveAudioSink;
  callbacks?: LiveCallbacks;
  /** Where to mint the ephemeral token. Defaults to /api/gemini-token. */
  tokenUrl?: string;
}

interface TokenResponse {
  token?: string;
  model?: string;
  lang?: string;
  error?: string;
}

/**
 * One live conversation. Construct, `await start()`, and call `stop()` when the
 * child leaves. All resources (WebSocket, mic, audio nodes) are released on stop
 * or on any fatal error.
 */
export class GeminiLiveSession {
  private readonly opts: LiveSessionOptions;
  private session: Session | null = null;
  private stream: MediaStream | null = null;
  private micSource: MediaStreamAudioSourceNode | null = null;
  private processor: ScriptProcessorNode | null = null;
  private muteGain: GainNode | null = null;
  private stopped = false;
  // Push-to-talk: the child's mic is streamed to Gemini ONLY between beginTurn()
  // and endTurn(). This is why background chatter in a classroom no longer keeps
  // the mic "listening" — nothing is sent unless the child is holding a turn.
  private turnActive = false;

  // Playback scheduling for Kiwi's returned audio.
  private nextStartTime = 0;
  private readonly playing = new Set<AudioBufferSourceNode>();

  constructor(opts: LiveSessionOptions) {
    this.opts = opts;
  }

  private emit(status: LiveStatus) {
    this.opts.callbacks?.onStatus?.(status);
  }

  async start(): Promise<void> {
    this.emit('connecting');
    let token: string;
    let model: string | undefined;
    try {
      const res = await fetch(this.opts.tokenUrl || '/api/gemini-token', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ lang: this.opts.lang }),
      });
      const data = (await res.json().catch(() => ({}))) as TokenResponse;
      if (!res.ok || !data.token) {
        this.fail(data.error || (res.status === 503 ? 'not_configured' : 'token_failed'));
        return;
      }
      token = data.token;
      model = data.model;
    } catch {
      this.fail('network');
      return;
    }
    if (this.stopped) return;

    // Ask for the mic BEFORE connecting so a permission denial fails fast.
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
    } catch {
      this.fail('mic_denied');
      return;
    }
    if (this.stopped) {
      this.releaseMic();
      return;
    }

    try {
      const ai = new GoogleGenAI({ apiKey: token, httpOptions: { apiVersion: 'v1alpha' } });
      this.session = await ai.live.connect({
        model: model || DEFAULT_LIVE_MODEL,
        callbacks: {
          onopen: () => {
            if (this.stopped) return;
            this.beginMicStreaming();
            // Kiwi leads: nudge the model to greet first (no audio needed). This
            // is a stage direction, not shown to the child and not transcribed.
            try {
              this.session?.sendClientContent({
                turns:
                  'Begin the conversation now: greet the child warmly and ask their name. Keep it to one short sentence.',
                turnComplete: true,
              });
              this.emit('thinking');
            } catch {
              this.emit('ready');
            }
          },
          onmessage: (msg: LiveServerMessage) => this.onMessage(msg),
          onerror: () => this.fail('connection'),
          onclose: () => {
            if (!this.stopped) this.emit('closed');
          },
        },
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: kiwiSystemInstruction(this.opts.lang),
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: DEFAULT_LIVE_VOICE } },
          },
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          // Push-to-talk: turn OFF Gemini's automatic voice detection so ambient
          // classroom noise can't trigger or hold a turn. The client sends
          // explicit activityStart/activityEnd markers instead (begin/endTurn).
          realtimeInputConfig: {
            automaticActivityDetection: { disabled: true },
          },
        },
      });
    } catch {
      this.fail('connect_failed');
      return;
    }
  }

  /** Capture the mic, downsample to 16 kHz PCM, and stream it up continuously. */
  private beginMicStreaming() {
    const ctx = this.opts.sink.context;
    if (!this.stream) return;
    try {
      this.micSource = ctx.createMediaStreamSource(this.stream);
      // ScriptProcessor is deprecated but universally available; a single 16 kHz
      // mono voice stream is light. (Follow-up: move to an AudioWorklet.)
      this.processor = ctx.createScriptProcessor(4096, 1, 1);
      this.muteGain = ctx.createGain();
      this.muteGain.gain.value = 0; // keep the node pulling without audible passthrough

      this.processor.onaudioprocess = (e: AudioProcessingEvent) => {
        // Only stream while the child is holding a turn (push-to-talk).
        if (this.stopped || !this.session || !this.turnActive) return;
        const input = e.inputBuffer.getChannelData(0);
        const down = resample(input, ctx.sampleRate, GEMINI_INPUT_RATE);
        const pcm = floatTo16BitPCM(down);
        try {
          this.session.sendRealtimeInput({
            audio: { data: int16ToBase64(pcm), mimeType: `audio/pcm;rate=${GEMINI_INPUT_RATE}` },
          });
        } catch {
          /* transient send error; keep streaming */
        }
      };

      this.micSource.connect(this.processor);
      this.processor.connect(this.muteGain);
      this.muteGain.connect(ctx.destination);
    } catch {
      this.fail('mic_graph');
    }
  }

  private onMessage(msg: LiveServerMessage) {
    if (this.stopped) return;
    const content = msg.serverContent;
    if (!content) return;

    // Barge-in: the model reports its turn was interrupted — drop queued audio.
    if (content.interrupted) {
      this.flushPlayback();
    }

    // Transcripts (for captions / "what you said").
    const userText = content.inputTranscription?.text;
    if (userText) this.opts.callbacks?.onUserText?.(userText);
    const kiwiText = content.outputTranscription?.text;
    if (kiwiText) this.opts.callbacks?.onKiwiText?.(kiwiText);

    // Kiwi's audio reply — one or more inline PCM parts.
    const parts = content.modelTurn?.parts ?? [];
    for (const part of parts) {
      const data = part.inlineData?.data;
      if (data && part.inlineData?.mimeType?.startsWith('audio/')) {
        this.enqueueAudio(data);
      }
    }
  }

  /** Schedule a returned PCM chunk for gapless playback through the lip-sync analyser. */
  private enqueueAudio(base64: string) {
    const ctx = this.opts.sink.context;
    let buffer: AudioBuffer;
    try {
      const floats = int16ToFloat32(base64ToInt16(base64));
      if (floats.length === 0) return;
      buffer = ctx.createBuffer(1, floats.length, GEMINI_OUTPUT_RATE);
      buffer.getChannelData(0).set(floats);
    } catch {
      return;
    }

    const src = ctx.createBufferSource();
    src.buffer = buffer;
    src.connect(this.opts.sink.node);

    const now = ctx.currentTime;
    const startAt = Math.max(now, this.nextStartTime);
    src.start(startAt);
    this.nextStartTime = startAt + buffer.duration;

    this.setSpeaking(true);
    this.emit('speaking');

    this.playing.add(src);
    src.onended = () => {
      this.playing.delete(src);
      // When the last scheduled chunk finishes, Kiwi is done talking → listening.
      if (this.playing.size === 0 && !this.stopped) {
        this.setSpeaking(false);
        // Back to idle: the child presses "talk" to take the next turn.
        this.emit(this.turnActive ? 'listening' : 'ready');
      }
    };
  }

  /** Stop and discard all queued/playing audio (used for barge-in and stop). */
  private flushPlayback() {
    for (const src of this.playing) {
      try {
        src.onended = null;
        src.stop();
        src.disconnect();
      } catch {
        /* already stopped */
      }
    }
    this.playing.clear();
    this.nextStartTime = 0;
    this.setSpeaking(false);
  }

  private setSpeaking(on: boolean) {
    // The sink node is the avatar's analyser; the avatar exposes setSpeaking via
    // the handle, wired by the caller through onSpeaking below.
    this.onSpeakingChange?.(on);
  }

  /** Set by the caller to reflect Kiwi's speaking state onto the avatar. */
  onSpeakingChange: ((on: boolean) => void) | null = null;

  /**
   * Child pressed "talk": open a turn. If Kiwi is mid-sentence, interrupt it.
   * Mic audio now streams to Gemini until endTurn().
   */
  beginTurn() {
    if (this.stopped || !this.session || this.turnActive) return;
    this.flushPlayback(); // stop Kiwi if it was still talking (barge-in)
    this.turnActive = true;
    try {
      this.session.sendRealtimeInput({ activityStart: {} });
      this.emit('listening');
    } catch {
      this.turnActive = false;
    }
  }

  /** Child pressed "send": close the turn so Kiwi can reply. */
  endTurn() {
    if (this.stopped || !this.session || !this.turnActive) return;
    this.turnActive = false;
    try {
      this.session.sendRealtimeInput({ activityEnd: {} });
      this.emit('thinking');
    } catch {
      this.emit('ready');
    }
  }

  private fail(code: string) {
    if (this.stopped) return;
    this.opts.callbacks?.onError?.(code);
    this.emit('error');
    this.stop();
  }

  private releaseMic() {
    this.stream?.getTracks().forEach((t) => t.stop());
    this.stream = null;
  }

  stop() {
    if (this.stopped) return;
    this.stopped = true;
    this.flushPlayback();
    try {
      if (this.processor) this.processor.onaudioprocess = null;
      this.processor?.disconnect();
      this.micSource?.disconnect();
      this.muteGain?.disconnect();
    } catch {
      /* no-op */
    }
    this.processor = null;
    this.micSource = null;
    this.muteGain = null;
    this.releaseMic();
    try {
      this.session?.close();
    } catch {
      /* no-op */
    }
    this.session = null;
    this.onSpeakingChange?.(false);
    this.emit('closed');
  }
}
