import type { LiveAudioSink } from '../../components/avatar/avatarTypes';

export type VoicePhase = 'idle' | 'connecting' | 'listening' | 'thinking' | 'speaking';
export interface VoiceEvents {
  phase: (phase: VoicePhase) => void;
  caption: (text: string) => void;
  error: (code: string) => void;
}

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

  constructor(private events: VoiceEvents) {}

  async start(accessCode: string, lang: 'he' | 'ar', sink: LiveAudioSink | null) {
    this.events.phase('connecting');
    try {
      if (!navigator.mediaDevices?.getUserMedia || typeof RTCPeerConnection === 'undefined') throw new Error('unsupported');
      this.connectionTimer = setTimeout(() => this.fail('connection_timeout'), 35_000);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: {
        echoCancellation: true, noiseSuppression: true, autoGainControl: true,
      } });
      if (this.closed) { stream.getTracks().forEach(t => t.stop()); return; }
      this.mic = stream;
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
      const response = await fetch('/api/kiwi-realtime', {
        method: 'POST', signal: this.abort.signal,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sdp: offer.sdp, lang, accessCode, adultDemo: true }),
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

  receive(event: { type?: string; delta?: string; transcript?: string; response?: { status?: string } }) {
    if (this.closed) return;
    switch (event.type) {
      case 'session.created':
        clearTimeout(this.connectionTimer);
        this.events.phase('listening');
        this.send({ type: 'response.create' });
        // Demo UX limit, not a server-enforced billing cap.
        this.timer = setTimeout(() => this.fail('demo_finished'), 5 * 60_000);
        break;
      case 'input_audio_buffer.speech_started':
        this.events.phase('listening');
        this.caption = '';
        this.events.caption('');
        break;
      case 'input_audio_buffer.speech_stopped': this.events.phase('thinking'); break;
      case 'response.created': this.caption = ''; break;
      case 'output_audio_buffer.started': this.events.phase('speaking'); break;
      case 'output_audio_buffer.stopped':
      case 'output_audio_buffer.cleared': this.events.phase('listening'); break;
      case 'response.output_audio_transcript.delta':
        this.caption += event.delta || '';
        this.events.caption(this.caption);
        break;
      case 'response.output_audio_transcript.done':
        if (event.transcript) this.events.caption(event.transcript);
        break;
      case 'response.done':
        if (event.response?.status === 'failed') this.fail('voice_service_unavailable');
        break;
      case 'error': this.fail('voice_service_unavailable'); break;
    }
  }

  private send(event: object) {
    if (this.channel?.readyState === 'open') this.channel.send(JSON.stringify(event));
  }

  setMuted(muted: boolean) { this.mic?.getAudioTracks().forEach(t => { t.enabled = !muted; }); }

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
