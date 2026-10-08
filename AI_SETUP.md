# Kiwi voice setup

The default robot at `/` and `/#realtime` uses **OpenAI Realtime**. Follow [docs/KIWI_REALTIME.md](docs/KIWI_REALTIME.md) for its required environment, Redis admission ledger and explicit call allocation. It does not automatically fall back to Gemini.

## Alternate Gemini route

`/#live` records one WAV utterance at a time and sends it to `POST /api/kiwi-turn`. The server asks Gemini for JSON `{ heard, reply }`. Playback uses the browser voice. This is a batch audio-turn route, not a Gemini Live WebSocket or token-minting flow.

Server-only configuration:

| Variable | Purpose |
| --- | --- |
| `GEMINI_API_KEY` | Gemini credential |
| `GEMINI_MODEL` | Optional model override; see the endpoint for the current default |
| `ALLOWED_ORIGINS` | Additional allowed origins, comma-separated |
| `UPSTASH_REDIS_REST_URL` | Optional rate limiter endpoint |
| `UPSTASH_REDIS_REST_TOKEN` | Optional rate limiter credential |
| `LIVE_RATE_LIMIT` | Optional per-IP requests per minute; default 30 |

Vercel uses `api/kiwi-turn.ts`; Netlify has a separate handler at `netlify/functions/kiwi-turn.mjs`. The default OpenAI realtime handler is only implemented for Vercel in this repository.

The alternate route's limiter currently fails open when Redis is missing or unavailable. Origin checks are not authentication. This route does not share the durable call budget used by OpenAI Realtime; account for that when enabling it.

Use `/#scripted` for the recorded bilingual conversation or `/#demo` for a hands-free sample without microphone access. Microphone permission, available browser voices and network access affect live playback. Never put API keys in client code or commit their values.
