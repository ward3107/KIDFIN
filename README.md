# Kiwi — Talking Robot

Kiwi is a standalone conversational 3D robot with voice, captions, facial expressions and body motion. The former finance app, rewards, lessons, games and teacher shortcut have been removed.

## Experiences

- `/`, `/#robot`, `/#realtime`: natural conversation using OpenAI Realtime. Start explicitly to request microphone access. Supports Hebrew, Arabic, English and Russian.
- `/#scripted`: the Hebrew/Arabic scripted conversation, with recorded speech and text input.
- `/#demo`: a hands-free sample conversation, without microphone access.
- `/#live`: the alternate Gemini audio-turn experience, with fallback to the scripted robot.
- `/#avatar`: voice, gesture and expression preview.

Old bookmarks such as `/#app` now open Kiwi. The app no longer reads or resets the retired game's saved progress.

## Development

Use Node.js 22 and run:

```sh
npm ci
npm run dev
```

Vite serves the frontend on port 3000. It does not run the `/api` functions; use a Vercel development environment or deployment to test hosted voice calls. The scripted and avatar previews do not require API credentials.

## Checks

```sh
npm run typecheck
npm run lint
npm test
npm run build
```

The admission tests require `redis-server` and `redis-cli` (CI installs both). Set `REDIS_SERVER_BIN` and `REDIS_CLI_BIN` for nonstandard locations. For frontend and endpoint unit tests on a machine without Redis, run `npm test -- --exclude tests/realtimeAdmission.test.ts` and report that exclusion.

## Voice configuration

The production realtime endpoint is hosted by Vercel. Follow [Kiwi Realtime](docs/KIWI_REALTIME.md) for server environment variables, explicit call allocation and spend limits. [Voice setup](AI_SETUP.md) explains the alternate Gemini route. Never expose provider keys in the browser or commit credentials.

A successful build or mocked voice test does not verify microphone permissions, live speech understanding or audible playback. Check these on a real device before treating the voice experience as validated.

## Structure

- `App.tsx`: robot-only routes and loading state.
- `components/avatar/`: robot room, conversation UI, 3D models and motion.
- `services/live/`, `api/`, `server/`: audio transport, voice personas and admission control.
- `services/dialogue/`, `public/audio/`: scripted bilingual conversation and recorded clips.
- `public/models/`, `scripts/export-kiwi.py`: robot assets and exporter.
- `docs/KIWI_MOTION.md`: current motion behavior and limitations.

The repository keeps its KIDFIN name and existing deployment address; the app is branded Kiwi.
