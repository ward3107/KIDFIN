# Kiwi natural voice: adult evaluation

Open `/#realtime` on a Vercel deployment containing this change. The root
scripted experience and legacy `/#live` route are separate. This new route uses
OpenAI Realtime over WebRTC, not the Gemini turn endpoint.

## Configure the Vercel project

Set these **server-only** environment variables for the intended deployment,
then redeploy. Never prefix secrets with `VITE_` or commit their values.

| Variable | Value |
| --- | --- |
| `KIWI_REALTIME_ENABLED` | `true` to enable the adult demo; otherwise disabled |
| `OPENAI_API_KEY` | API project key with active billing and Realtime access |
| `OPENAI_REALTIME_MODEL` | Optional; default `gpt-realtime-2.1`. Confirm account availability. |
| `KIWI_DEMO_ACCESS_CODE` | Random secret of at least 16 characters, shared only with adult evaluators |
| `KIWI_REALTIME_ORIGINS` | Exact allowed origins, comma-separated, including scheme, without trailing slash |
| `UPSTASH_REDIS_REST_URL` | Existing Upstash REST endpoint |
| `UPSTASH_REDIS_REST_TOKEN` | Existing Upstash REST token |

Redis is mandatory: no paid calls are made if rate limiting is unavailable.
There is a global limit of 10 session admission attempts per minute (including
bad codes). This protects a small private demonstration, not a public launch.
The five-minute timer is a client UX limit, **not a hard billing cap**. Apply
provider budget controls and monitor usage. Public launch needs per-user
authorization, distributed concurrent-session quotas and server-controlled
session lifetimes. Origin matching alone is not authentication.

The code is entered into a password form and used for one session request. It is
not saved in browser storage. No microphone starts until Start is pressed. Stop,
unmount, connection failures and the demo timeout release microphone tracks.
The backend never returns the provider key and sets `Cache-Control: no-store`.

## Adult test sequence

1. Use an adult tester and fictional details only. Start in Hebrew, then Arabic.
2. Ask an unexpected question and follow with “why?”; check contextual relevance.
3. Correct a prior statement; check the correction is used in later answers.
4. Pause mid-sentence; check Kiwi waits rather than rushing to answer.
5. Interrupt a long answer; check speech stops and Kiwi answers the new turn.
6. Mute and unmute, deny microphone permission, disconnect the network, retry.
7. Stop while microphone permission is pending; confirm the mic stops if granted later.
8. Switch to `/#app` mid-call; confirm the microphone indicator clears.
9. Verify on real mobile Safari and Chrome and a device with WebGL disabled.

Record measured response latency, interruption delay, contextual correctness,
Hebrew/Arabic naturalness and provider cost per completed minute. Automated tests
exercise access controls and lifecycle behavior; they cannot establish voice
quality or child safety. No live API call has been verified without credentials.

Mouth movement uses the existing audio-amplitude analyser, not phoneme-accurate
lip sync. If the avatar cannot render, an emoji robot and normal audio playback
remain. Semantic VAD and interruption handling are provider-assisted. No durable
memory, camera, web search, whistle action or external tools are enabled here.

## Before use by children

This implementation is an adult evaluation, not a child-ready launch. The prompt
is not a content-filtering or compliance system. Confirm the provider's current
minor-use requirements, implement required data controls (including Zero Data
Retention for personal data below the applicable age), appropriate consent and
age assurance, content safeguards and escalation/reporting procedures. Do not
record child sessions while these prerequisites remain unresolved.

Application code does not persist audio/transcripts. Provider retention is a
separate setting and is not disabled by this implementation.

References:
- https://developers.openai.com/api/docs/guides/voice-webrtc
- https://developers.openai.com/api/docs/guides/realtime-conversations
- https://developers.openai.com/api/docs/guides/safety-checks/under-18-api-guidance

`npm run dev` runs the Vite frontend only. Use a Vercel preview/development
environment to exercise `/api/kiwi-realtime`.
