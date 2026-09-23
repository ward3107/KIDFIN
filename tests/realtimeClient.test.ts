import { afterEach, describe, expect, it, vi } from 'vitest';
import { KiwiRealtime } from '../services/live/realtimeClient';

afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers(); });
const events = () => ({ phase: vi.fn(), caption: vi.fn(), options: vi.fn(), error: vi.fn() });

describe('voice lifecycle', () => {
  it('drives speaking from playback rather than text and returns to listening on interruption', () => {
    const handlers = events(); const call = new KiwiRealtime(handlers);
    call.receive({ type: 'response.output_audio_transcript.delta', delta: 'שלום' });
    expect(handlers.caption).toHaveBeenLastCalledWith('שלום');
    expect(handlers.phase).not.toHaveBeenCalled();
    call.receive({ type: 'output_audio_buffer.started' });
    expect(handlers.phase).toHaveBeenLastCalledWith('speaking');
    call.receive({ type: 'input_audio_buffer.speech_started' });
    expect(handlers.phase).toHaveBeenLastCalledWith('listening');
    expect(handlers.caption).toHaveBeenLastCalledWith('');
    expect(handlers.options).toHaveBeenLastCalledWith([]);
    call.stop();
    call.receive({ type: 'output_audio_buffer.started' });
    expect(handlers.phase).toHaveBeenLastCalledWith('idle');
  });
  it('releases a microphone granted after the user already cancelled', async () => {
    let grant!: (stream: MediaStream) => void;
    const track = { stop: vi.fn() };
    vi.stubGlobal('navigator', { mediaDevices: { getUserMedia: () => new Promise<MediaStream>(r => { grant = r; }) } });
    vi.stubGlobal('RTCPeerConnection', vi.fn());
    const call = new KiwiRealtime(events());
    const starting = call.start('code', 'he', null);
    call.stop();
    grant({ getTracks: () => [track] } as unknown as MediaStream);
    await starting;
    expect(track.stop).toHaveBeenCalledOnce();
    expect(RTCPeerConnection).not.toHaveBeenCalled();
  });
  it('ends the demo and ignores late events', () => {
    vi.useFakeTimers();
    const handlers = events(); const call = new KiwiRealtime(handlers);
    call.receive({ type: 'session.created' });
    vi.advanceTimersByTime(300_000);
    expect(handlers.error).toHaveBeenCalledWith('demo_finished');
    expect(handlers.phase).toHaveBeenLastCalledWith('idle');
  });
});
