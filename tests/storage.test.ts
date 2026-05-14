import { describe, it, expect, beforeEach } from 'vitest';
import { runSchemaMigration, SCHEMA_KEY, SCHEMA_VERSION, STORAGE_PREFIX } from '../utils/storage';

describe('runSchemaMigration', () => {
  beforeEach(() => window.localStorage.clear());

  it('writes the current schema version on first run', () => {
    runSchemaMigration();
    expect(window.localStorage.getItem(SCHEMA_KEY)).toBe(String(SCHEMA_VERSION));
  });

  it('wipes save4dream_* keys when version mismatches', () => {
    window.localStorage.setItem(SCHEMA_KEY, '0');
    window.localStorage.setItem(`${STORAGE_PREFIX}stats`, '{"old":true}');
    window.localStorage.setItem(`${STORAGE_PREFIX}missions`, '[]');
    window.localStorage.setItem('unrelated_key', 'keep me');

    runSchemaMigration();

    expect(window.localStorage.getItem(`${STORAGE_PREFIX}stats`)).toBeNull();
    expect(window.localStorage.getItem(`${STORAGE_PREFIX}missions`)).toBeNull();
    expect(window.localStorage.getItem('unrelated_key')).toBe('keep me');
    expect(window.localStorage.getItem(SCHEMA_KEY)).toBe(String(SCHEMA_VERSION));
  });

  it('leaves data alone when version matches', () => {
    window.localStorage.setItem(SCHEMA_KEY, String(SCHEMA_VERSION));
    window.localStorage.setItem(`${STORAGE_PREFIX}stats`, '{"coins":42}');
    runSchemaMigration();
    expect(window.localStorage.getItem(`${STORAGE_PREFIX}stats`)).toBe('{"coins":42}');
  });
});
