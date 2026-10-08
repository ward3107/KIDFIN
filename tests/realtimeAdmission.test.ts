// @vitest-environment node
// Executes the production Lua script against a real disposable Redis, not a mock.
import { spawn, execFile } from 'node:child_process';
import { createServer } from 'node:net';
import { promisify } from 'node:util';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { REALTIME_BUDGET_KEY as key, RESERVE_REALTIME } from '../server/realtimeAdmission';

const exec = promisify(execFile);
let directory: string;
let server: ReturnType<typeof spawn>;
let port: number;
async function command(...args: string[]): Promise<unknown> {
  const { stdout } = await exec(process.env.REDIS_CLI_BIN || 'redis-cli', ['-h', '127.0.0.1', '-p', String(port), '--json', ...args]);
  return JSON.parse(stdout);
}
async function now(): Promise<number> { return Number((await command('TIME') as string[])[0]); }
async function seed(remaining: number, starts: number[] = []) {
  await command('SET', key, JSON.stringify({ version: 1, remaining, starts }));
}
const reserve = (daily = 10, concurrent = 2) => command('EVAL', RESERVE_REALTIME, '1', key, String(daily), String(concurrent));

beforeAll(async () => {
  directory = await mkdtemp(join(tmpdir(), 'kiwi-redis-'));
  const probe = createServer();
  await new Promise<void>(resolve => probe.listen(0, '127.0.0.1', resolve));
  const address = probe.address();
  if (!address || typeof address === 'string') throw new Error('No local test port');
  port = address.port;
  await new Promise<void>((resolve, reject) => probe.close(error => error ? reject(error) : resolve()));
  server = spawn(process.env.REDIS_SERVER_BIN || 'redis-server', [
    '--port', String(port), '--bind', '127.0.0.1', '--dir', directory, '--save', '', '--appendonly', 'no',
  ]);
  await new Promise<void>((resolve, reject) => {
    server.once('error', reject);
    server.once('exit', code => reject(new Error(`Redis exited: ${code}`)));
    server.stdout!.on('data', data => { if (data.toString().toLowerCase().includes('ready to accept connections')) resolve(); });
  });
}, 15000);
beforeEach(async () => { await command('FLUSHDB'); });
afterAll(async () => {
  if (server?.exitCode === null) {
    await new Promise<void>(resolve => { server.once('exit', () => resolve()); server.kill(); });
  }
  if (directory) await rm(directory, { recursive: true, force: true });
});

describe('atomic durable admission ledger', () => {
  it('inspects readiness without creating, decrementing or rewriting the ledger', async () => {
    const inspect = () => command('EVAL', RESERVE_REALTIME, '1', key, '10', '2', 'inspect');
    expect(await inspect()).toBe(-2);
    expect(await command('EXISTS', key)).toBe(0);
    await seed(3);
    const original = await command('GET', key);
    for (let i = 0; i < 5; i++) expect(await inspect()).toBe(1);
    expect(await command('GET', key)).toBe(original);
    expect(await command('TTL', key)).toBe(-1);
    await seed(0);
    expect(await inspect()).toBe(0);
    await seed(3, [await now(), await now()]);
    expect(await inspect()).toBe(0);
  });
  it('fails closed on missing, corrupt, wrongly typed and expiring state', async () => {
    expect(await reserve()).toBe(-2);
    for (const value of ['bad json', '{}', '{"version":2,"remaining":1,"starts":[]}',
      '{"version":1,"remaining":-1,"starts":[]}', '{"version":1,"remaining":1.5,"starts":[]}',
      '{"version":1,"remaining":1,"starts":["bad"]}', '{"version":1,"remaining":1,"starts":{"x":1}}']) {
      await command('SET', key, value);
      expect(await reserve()).toBe(-1);
    }
    await seed(10, [await now() + 600]);
    expect(await reserve()).toBe(-1);
    await seed(10);
    await command('EXPIRE', key, '600');
    expect(await reserve()).toBe(-1);
    await command('DEL', key);
    await command('LPUSH', key, 'bad');
    await expect(reserve()).rejects.toThrow(); // Redis error is rejected by the HTTP boundary too.
  });
  it('admits exactly the remaining budget under concurrent requests', async () => {
    await seed(3);
    const results = await Promise.all(Array.from({ length: 30 }, () => reserve(100, 100)));
    expect(results.filter(value => value === 1)).toHaveLength(3);
    expect(results.filter(value => value === 0)).toHaveLength(27);
    const state = JSON.parse(await command('GET', key) as string);
    expect(state.remaining).toBe(0);
    expect(state.starts).toHaveLength(3);
    expect(await command('TTL', key)).toBe(-1);
  });
  it('reserves conservative slots for 65 minutes even after the client stops', async () => {
    await seed(20);
    expect(await reserve()).toBe(1);
    expect(await reserve()).toBe(1);
    expect(await reserve()).toBe(0);
    await seed(18, [await now() - 301, await now() - 300]);
    expect(await reserve()).toBe(0); // UX timeout cannot free capacity.
    await seed(18, [await now() - 3905, await now() - 3904]);
    expect(await reserve()).toBe(1);
  });
  it('enforces rolling minute and 24h limits without boundary bursts', async () => {
    const time = await now();
    await seed(50, Array(10).fill(time - 5));
    expect(await reserve(100, 100)).toBe(0);
    await seed(50, Array(10).fill(time - 4000));
    expect(await reserve()).toBe(0);
    await seed(50, Array(10).fill(time - 86405));
    expect(await reserve()).toBe(1);
    const state = JSON.parse(await command('GET', key) as string);
    expect(state.remaining).toBe(49);
    expect(state.starts).toHaveLength(1);
  });
  it('never replenishes the lifetime budget as windows expire or state disappears', async () => {
    await seed(0, [await now() - 90000]);
    expect(await reserve()).toBe(0);
    await command('DEL', key);
    expect(await reserve()).toBe(-2);
  });
});
