// @vitest-environment node
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { expect, it, vi } from 'vitest';

it('retires finance caches and old robot caches while keeping unrelated caches', async () => {
  const handlers: Record<string, (event: { waitUntil: (work: Promise<unknown>) => void }) => void> = {};
  const remove = vi.fn().mockResolvedValue(true);
  const claim = vi.fn();
  runInNewContext(readFileSync(new URL('../public/sw.js', import.meta.url), 'utf8'), {
    self: {
      addEventListener: (name: string, handler: typeof handlers[string]) => { handlers[name] = handler; },
      clients: { claim },
    },
    caches: {
      keys: async () => ['save4dream-v3', 'kiwi-v0', 'kiwi-v1', 'unrelated-cache'],
      delete: remove,
    },
  });
  let activation: Promise<unknown> | undefined;
  handlers.activate({ waitUntil: work => { activation = work; } });
  await activation;
  expect(remove.mock.calls.map(([key]) => key)).toEqual(['save4dream-v3', 'kiwi-v0']);
  expect(claim).toHaveBeenCalledOnce();
});
