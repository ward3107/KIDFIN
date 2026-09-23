import type { LiveAudioSink } from '../../components/avatar/avatarTypes';
import type { RealtimeLanguage } from './realtimePersona';

export type { RealtimeLanguage };
export type VoicePhase = 'idle' | 'connecting' | 'listening' | 'thinking' | 'speaking';
export interface VoiceEvents {
  phase: (phase: VoicePhase) => void;
  caption: (text: string) => void;
  options: (options: string[]) => void;
  error: (code: string) => void;
}

type RealtimeOutputItem = {
  type?: string;
  name?: string;
  call_id?: string;
  arguments?: string;
};

type RealtimeServerEvent = {
  type?: string;
  delta?: string;
  transcript?: string;
  response?: {
    status?: string;
    output?: RealtimeOutputItem[];
  };
};

/** One disposable WebRTC call. Never retains an access code or a transcript. */
export class KiwiRealtime {
  private peer: RTCPeerConnection | null = null;
  private channel: RTCDataChannel | null = null;
  private mic: MediaStream | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private audio: HTMLAudioElement | null = null;
  private abort = new AbortController();
  private closed = false;
  private caption = '';
  private timer: ReturnType<typeof setTimeout> | undefined;
  private connectionTimer: ReturnType<typeof setTimeout> | undefined;
  private playbackSettleTimer: ReturnType<typeof setTimeout> | undefined;
  private userMuted = false;
  private assistantTurnActive = false;
  private outputPlaying = false;
  private handledCalls = new Set<string>();

  constructor(private events: VoiceEvents) {}

  async start(accessCode: string, lang: RealtimeLanguage, sink: LiveAudioSink | null) {
    this.events.phase('connecting');
    try {
      if (!navigator.mediaDevices?.getUserMedia || typeof RTCPeerConnection === 'undefined') throw new Error('unsupported');
      this.connectionTimer = setTimeout(() => this.fail('connection_timeout'), 35_000);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        channelCount: 1,
      } });
      if (this.closed) { stream.getTracks().forEach(t => t.stop()); return; }
      this.mic = stream;
      this.syncMicrophone();
      const peer = new RTCPeerConnection();
      this.peer = peer;
      stream.getTracks().forEach(track => peer.addTrack(track, stream));
      // Create/unlock playback during the caller's explicit Start interaction.
      const audio = new Audio();
      audio.autoplay = true;
      this.audio = audio;
      peer.ontrack = event => {
        if (this.closed) return;
        const remote = event.streams[0] || new MediaStream([event.track]);
        // The avatar graph is the only audible path; the muted media element
        // also attaches the WebRTC stream for browser interoperability.
        audio.srcObject = remote;
        audio.muted = Boolean(sink);
        if (sink) {
          this.source?.disconnect();
          this.source = sink.context.createMediaStreamSource(remote);
          this.source.connect(sink.node);
          void sink.context.resume().catch(() => this.fail('audio_blocked'));
        }
        void audio.play().catch(() => this.fail('audio_blocked'));
      };
      peer.onconnectionstatechange = () => {
        if (peer.connectionState === 'failed' || peer.connectionState === 'disconnected') this.fail('disconnected');
      };
      const channel = peer.createDataChannel('oai-events');
      this.channel = channel;
      channel.onclose = () => { if (!this.closed) this.fail('disconnected'); };
      channel.onmessage = message => {
        if (this.closed) return;
        try { this.receive(JSON.parse(message.data)); } catch { this.fail('invalid_event'); }
      };
      const offer = await peer.createOffer();
      if (this.closed) return;
      await peer.setLocalDescription(offer);
      const micProfile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)
        ? 'near_field'
        : 'far_field';
      const response = await fetch('/api/kiwi-realtime', {
        method: 'POST', signal: this.abort.signal,
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sdp: offer.sdp, lang, micProfile, accessCode, adultDemo: true }),
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || 'session_failed');
      }
      const sdp = await response.text();
      if (this.closed) return;
      await peer.setRemoteDescription({ type: 'answer', sdp });
    } catch (error) {
      if (!this.closed) this.fail(error instanceof Error ? error.message : 'session_failed');
    }
  }

  receive(event: RealtimeServerEvent) {
    if (this.closed) return;
    switch (event.type) {
      case 'session.created':
        clearTimeout(this.connectionTimer);
        this.events.phase('listening');
        // One brief greeting only. The server-owned persona explicitly forbids
        // reintroducing Kiwi or repeating its role on later turns.
        this.beginAssistantTurn();
        this.send({ type: 'response.create' });
        // Demo UX limit, not a server-enforced billing cap.
        this.timer = setTimeout(() => this.fail('demo_finished'), 5 * 60_000);
        break;
      case 'input_audio_buffer.speech_started':
        this.events.phase('listening');
        this.caption = '';
        this.events.caption('');
        this.events.options([]);
        break;
      case 'input_audio_buffer.speech_stopped':
        this.events.phase('thinking');
        this.beginAssistantTurn();
        break;
      case 'response.created':
        this.caption = '';
        this.beginAssistantTurn();
        break;
      case 'output_audio_buffer.started':
        this.outputPlaying = true;
        this.syncMicrophone();
        this.events.phase('speaking');
        break;
      case 'output_audio_buffer.stopped':
      case 'output_audio_buffer.cleared':
        this.settlePlaybackAfterEcho();
        break;
      case 'response.output_audio_transcript.delta':
        this.caption += event.delta || '';
        this.events.caption(this.caption);
        break;
      case 'response.output_audio_transcript.done':
        if (event.transcript) this.events.caption(event.transcript);
        break;
      case 'response.done':
        if (event.response?.status === 'failed') this.fail('voice_service_unavailable');
        else {
          this.assistantTurnActive = false;
          this.handleFunctionCalls(event.response?.output || []);
          this.syncMicrophone();
          if (!this.outputPlaying) this.events.phase('listening');
        }
        break;
      case 'error': this.fail('voice_service_unavailable'); break;
    }
  }

  private handleFunctionCalls(output: RealtimeOutputItem[]) {
    for (const item of output) {
      if (item.type !== 'function_call' || item.name !== 'show_reply_options' || !item.call_id) continue;
      if (this.handledCalls.has(item.call_id)) continue;
      this.handledCalls.add(item.call_id);
      let options: string[] = [];
      try {
        const parsed = JSON.parse(item.arguments || '{}') as { options?: unknown };
        if (Array.isArray(parsed.options)) {
          options = [...new Set(parsed.options
            .filter((value): value is string => typeof value === 'string')
            .map(value => value.replace(/\s+/g, ' ').trim().slice(0, 80))
            .filter(Boolean))].slice(0, 4);
        }
      } catch {
        options = [];
      }
      const shown = options.length >= 2;
      this.events.options(shown ? options : []);
      this.send({
        type: 'conversation.item.create',
        item: {
          type: 'function_call_output',
          call_id: item.call_id,
          output: JSON.stringify({ shown }),
        },
      });
    }
  }

  private send(event: object): boolean {
    if (this.channel?.readyState !== 'open') return false;
    this.channel.send(JSON.stringify(event));
    return true;
  }

  sendText(text: string): boolean {
    const clean = text.replace(/\s+/g, ' ').trim().slice(0, 200);
    if (!clean || this.channel?.readyState !== 'open' || this.outputPlaying) return false;
    this.events.options([]);
    this.caption = '';
    this.events.caption('');
    this.events.phase('thinking');
    this.beginAssistantTurn();
    const created = this.send({
      type: 'conversation.item.create',
      item: {
        type: 'message',
        role: 'user',
        content: [{ type: 'input_text', text: clean }],
      },
    });
    if (created) this.send({ type: 'response.create' });
    return created;
  }

  setMuted(muted: boolean) {
    this.userMuted = muted;
    this.syncMicrophone();
  }

  private beginAssistantTurn() {
    clearTimeout(this.playbackSettleTimer);
    this.assistantTurnActive = true;
    this.syncMicrophone();
  }

  private settlePlaybackAfterEcho() {
    clearTimeout(this.playbackSettleTimer);
    // Keep playback state stable for a fraction of a second while the audible
    // tail settles. The microphone remains live throughout for barge-in.
    this.outputPlaying = true;
    this.playbackSettleTimer = setTimeout(() => {
      this.outputPlaying = false;
      this.syncMicrophone();
      if (!this.assistantTurnActive) this.events.phase('listening');
    }, 220);
  }

  private syncMicrophone() {
    // Keep WebRTC input live while Kiwi is speaking. Server VAD uses the live
    // track to detect a real user interruption and cancels/truncates the
    // response automatically. Browser echo cancellation and server-side noise
    // reduction protect against loudspeaker echo; gating here makes barge-in
    // impossible and causes the assistant to appear deaf.
    const enabled = !this.userMuted;
    this.mic?.getAudioTracks().forEach(track => { track.enabled = enabled; });
  }

  private fail(code: string) {
    if (this.closed) return;
    this.stop();
    this.events.error(code);
  }

  stop() {
    if (this.closed) return;
    this.closed = true;
    this.abort.abort();
    clearTimeout(this.timer);
    clearTimeout(this.connectionTimer);
    clearTimeout(this.playbackSettleTimer);
    this.mic?.getTracks().forEach(t => t.stop());
    this.source?.disconnect();
    if (this.audio) { this.audio.pause(); this.audio.srcObject = null; }
    this.channel?.close();
    this.peer?.close();
    this.mic = null;
    this.peer = null;
    this.channel = null;
    this.source = null;
    this.audio = null;
    this.caption = '';
    this.events.phase('idle');
  }
}
