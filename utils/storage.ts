/**
 * LocalStorage schema versioning.
 *
 * Bump SCHEMA_VERSION whenever the shape of any persisted save4dream_* key
 * changes in a way that would break older payloads (renamed fields, removed
 * union variants, etc.). On mismatch we clear every save4dream_* key so the
 * app re-seeds from defaults rather than crashing on stale data.
 */

export const SCHEMA_VERSION = 3;
export const SCHEMA_KEY = 'save4dream_schema_version';
export const STORAGE_PREFIX = 'save4dream_';

export function runSchemaMigration(): void {
  if (typeof window === 'undefined') return;
  try {
    const raw = window.localStorage.getItem(SCHEMA_KEY);
    const stored = raw ? parseInt(raw, 10) : null;
    if (stored === SCHEMA_VERSION) return;

    const toRemove: string[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (key && key.startsWith(STORAGE_PREFIX) && key !== SCHEMA_KEY) {
        toRemove.push(key);
      }
    }
    toRemove.forEach(k => window.localStorage.removeItem(k));
    window.localStorage.setItem(SCHEMA_KEY, String(SCHEMA_VERSION));
  } catch {
    // localStorage unavailable (private mode, quota) — no-op
  }
}
