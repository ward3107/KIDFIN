// Netlify bundles the same guarded handler used by Vercel, preventing drift.
export { default } from '../../api/kiwi-turn.ts';

export const config = { path: '/api/kiwi-turn' };
