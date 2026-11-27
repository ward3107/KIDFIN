# Kiwi voice setup

The default robot at `/` and `/#realtime` uses **OpenAI Realtime**. Follow [docs/KIWI_REALTIME.md](docs/KIWI_REALTIME.md) for its required environment, Redis admission ledger and explicit call allocation. It does not automatically fall back to Gemini.

## Alternate Gemini route

`/#live` records one WAV utterance at a time and sends it to `POST /api/kiwi-turn`. The server asks Gemini for JSON `{ heard, reply }`. Playback uses the browser voice. This is a batch audio-turn route, not a Gemini Live WebSocket or token-minting flow. The microphone and first paid turn start only after an explicit tap. Recording is capped at 15 seconds.

Server-only configuration:

| Variable | Purpose |
| --- | --- |
| `GEMINI_API_KEY` | Gemini credential |
| `GEMINI_MODEL` | Optional model override; see the endpoint for the current default |
| `KIWI_GEMINI_ENABLED` | Must be `true` for the adult evaluation; otherwise closed |
| `KIWI_GEMINI_ORIGINS` | Exact allowed origins, comma-separated, including scheme and no trailing slash |
| `UPSTASH_REDIS_REST_URL` | Required durable Redis REST endpoint |
| `UPSTASH_REDIS_REST_TOKEN` | Required Redis REST credential |
| `KIWI_GEMINI_MINUTE_TURNS` | Optional global turns per rolling minute; default 30 |
| `KIWI_GEMINI_DAILY_TURNS` | Optional global turns per rolling 24 hours; default 100 |

Vercel uses `api/kiwi-turn.ts`; Netlify has a separate handler at `netlify/functions/kiwi-turn.mjs`. The default OpenAI realtime handler is only implemented for Vercel in this repository.

The route fails closed if Redis, configuration, or its ledger is unavailable. It accepts only bounded 16 kHz mono PCM WAV data and does not ask for names. Invalid requests do not debit the ledger. An admitted request consumes one paid attempt before the Gemini call; failures and timeouts are never retried or refunded.

The Gemini ledger is separate from OpenAI Realtime. Before enabling, allocate a fixed number of turns once in the same durable Upstash database used by every deployment of this route:

```redis
SET kiwi:gemini:spend:v1 '{"version":1,"remaining":10,"turns":[]}' NX
GET kiwi:gemini:spend:v1
TTL kiwi:gemini:spend:v1
```

The TTL must be -1. The `NX` condition prevents accidental reset. Do not initialize or replenish from a browser request. To add turns, first disable the route on every deployment, let in-flight requests finish, check provider usage, then change only `remaining` while preserving `version` and `turns`. A missing, expired or corrupt ledger keeps the route closed. `GET /api/kiwi-turn` checks readiness without spending a turn or contacting Gemini; it distinguishes a spent allocation (`budget_exhausted`) from a rolling limit (`rate_limited`).

This is a cap on Gemini request attempts, not a dollar cap. Origin checks are not authentication: a forged Origin can consume the allocation. Keep the provider key in a dedicated project with usage monitoring. The adult evaluation notice does not make this a child-ready service; complete the privacy, consent, age, safety and real-device checks in [Kiwi Realtime](docs/KIWI_REALTIME.md) before child use.

Use `/#scripted` for the recorded bilingual conversation or `/#demo` for a hands-free sample without microphone access. Microphone permission, available browser voices and network access affect live playback. Never put API keys in client code or commit their values.
