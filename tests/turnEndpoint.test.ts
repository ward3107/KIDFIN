// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import handler from '../api/kiwi-turn';
import { pcmToWavBase64 } from '../services/live/wav';

const generateContent = vi.hoisted(() => vi.fn());
vi.mock('@google/genai', () => ({
  GoogleGenAI: class {
    models = { generateContent };
  },
}));

const url = 'https://demo.example/api/kiwi-turn';
const wav = pcmToWavBase64(new Int16Array(1600), 16_000);
const request = (payload: unknown, origin = 'https://demo.example') => new Request(url, {
  method: 'POST',
  headers: { origin, 'content-type': 'application/json' },
  body: JSON.stringify(payload),
});
const redis = (result: unknown) => new Response(JSON.stringify({ result }));

beforeEach(() => {
  vi.stubEnv('KIWI_GEMINI_ENABLED', 'true');
  vi.stubEnv('KIWI_GEMINI_ORIGINS', 'https://demo.example');
  vi.stubEnv('GEMINI_API_KEY', 'server-only-key');
  vi.stubEnv('UPSTASH_REDIS_REST_URL', 'https://redis.example');
  vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', 'redis-secret');
  generateContent.mockReset();
});
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });

describe('Gemini turn boundary', () => {
  it('stays closed when disabled or missing Redis configuration', async () => {
    const fetch = vi.fn(); vi.stubGlobal('fetch', fetch);
    vi.stubEnv('KIWI_GEMINI_ENABLED', 'false');
    expect((await handler(request({ greeting: true, lang: 'he' }))).status).toBe(503);
    vi.stubEnv('KIWI_GEMINI_ENABLED', 'true');
    vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', '');
    expect((await handler(request({ greeting: true, lang: 'he' }))).status).toBe(503);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('inspects readiness without buying a turn', async () => {
    const fetch = vi.fn().mockResolvedValueOnce(redis(1)).mockResolvedValueOnce(redis(-2));
    vi.stubGlobal('fetch', fetch);
    const ready = await handler(new Request(url));
    expect(ready.status).toBe(200);
    expect(await ready.json()).toEqual({ ready: true });
    expect(ready.headers.get('cache-control')).toBe('no-store');
    expect(JSON.parse(fetch.mock.calls[0][1].body).at(-1)).toBe('inspect');
    const missing = await handler(new Request(url));
    expect(missing.status).toBe(503);
    expect(await missing.json()).toEqual({ error: 'budget_not_configured' });
    expect(generateContent).not.toHaveBeenCalled();
  });

  it('rejects untrusted origins, bad audio and oversized bodies before any paid call', async () => {
    const fetch = vi.fn(); vi.stubGlobal('fetch', fetch);
    expect((await handler(request({ greeting: true, lang: 'he' }, 'https://evil.example'))).status).toBe(403);
    expect((await handler(request({ audio: 'not-wav', lang: 'he' }))).status).toBe(400);
    expect((await handler(request({ audio: wav, lang: 'en' }))).status).toBe(400);
    expect((await handler(request({ audio: wav, lang: 'he', history: [{ role: 'user', text: 'x'.repeat(801) }] }))).status).toBe(400);
    expect((await handler(request({ audio: 'x'.repeat(700_001), lang: 'he' }))).status).toBe(413);
    expect(fetch).not.toHaveBeenCalled();
    expect(generateContent).not.toHaveBeenCalled();
  });

  it('fails closed for an unavailable, corrupt or exhausted ledger', async () => {
    const fetch = vi.fn().mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce(redis('1')).mockResolvedValueOnce(redis(0))
      .mockResolvedValueOnce(redis(-3));
    vi.stubGlobal('fetch', fetch);
    for (const [status, error] of [[503, 'temporarily_unavailable'], [503, 'temporarily_unavailable'], [429, 'rate_limited'], [429, 'budget_exhausted']] as const) {
      const response = await handler(request({ audio: wav, lang: 'he' }));
      expect(response.status).toBe(status);
      expect(await response.json()).toEqual({ error });
    }
    expect(generateContent).not.toHaveBeenCalled();
  });

  it('reserves exactly once before Gemini and never returns credentials', async () => {
    const fetch = vi.fn().mockResolvedValueOnce(redis(1)); vi.stubGlobal('fetch', fetch);
    generateContent.mockResolvedValueOnce({ text: JSON.stringify({ heard: 'שלום', reply: 'היי!' }) });
    const response = await handler(request({ audio: wav, lang: 'he' }));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ heard: 'שלום', reply: 'היי!' });
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(generateContent).toHaveBeenCalledTimes(1);
  });

  it('keeps the debit after provider failure', async () => {
    const fetch = vi.fn().mockResolvedValueOnce(redis(1)); vi.stubGlobal('fetch', fetch);
    generateContent.mockRejectedValueOnce(new Error('provider offline'));
    expect((await handler(request({ audio: wav, lang: 'he' }))).status).toBe(502);
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(generateContent).toHaveBeenCalledTimes(1);
  });
});
