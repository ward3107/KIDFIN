import { afterEach, expect, it, vi } from 'vitest';
import { checkKiwiTurnReady, TalkRecorder } from '../services/live/turnClient';

afterEach(() => vi.unstubAllGlobals());

it('checks the funded turn route without sending audio', async () => {
  const fetch = vi.fn()
    .mockResolvedValueOnce({ ok: true, json: async () => ({ ready: true }) })
    .mockResolvedValueOnce({ ok: false, json: async () => ({ error: 'budget_exhausted' }) });
  vi.stubGlobal('fetch', fetch);
  await expect(checkKiwiTurnReady()).resolves.toBeUndefined();
  await expect(checkKiwiTurnReady()).rejects.toThrow('budget_exhausted');
  expect(fetch).toHaveBeenCalledTimes(2);
  expect(fetch).toHaveBeenCalledWith('/api/kiwi-turn', { cache: 'no-store' });
});

it('stops microphone tracks granted after the recorder was disposed', async () => {
  let grant!: (stream: MediaStream) => void;
  const pending = new Promise<MediaStream>(resolve => { grant = resolve; });
  const stop = vi.fn();
  vi.stubGlobal('navigator', {
    mediaDevices: { getUserMedia: vi.fn().mockReturnValue(pending) },
  });

  const recorder = new TalkRecorder();
  const initialization = recorder.init();
  recorder.dispose();
  grant({ getTracks: () => [{ stop }] } as unknown as MediaStream);
  await expect(initialization).rejects.toThrow('recorder_disposed');
  expect(stop).toHaveBeenCalledOnce();
});
