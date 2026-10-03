# Kiwi natural voice: adult evaluation

The Realtime conversation is the root URL (also `/#realtime`). It opens with no
access code and no language picker: one Start tap (needed for the microphone),
then Kiwi talks in the browser's language and follows language switches. The
hands-free showcase (`/#demo`), the `/#scripted` experience and the legacy
`/#live` route are separate. This route uses OpenAI Realtime over WebRTC, not
the Gemini turn endpoint.

## Configure the Vercel project

Set these **server-only** environment variables for the intended deployment,
then redeploy. Never prefix secrets with `VITE_` or commit their values.

| Variable | Value |
| --- | --- |
| `KIWI_REALTIME_ENABLED` | `true` to enable the adult demo; otherwise disabled |
| `OPENAI_API_KEY` | API project key with active billing and Realtime access |
| `OPENAI_REALTIME_MODEL` | Optional; default `gpt-realtime-2.1`. Confirm account availability. |
| `KIWI_REALTIME_ORIGINS` | Exact allowed origins, comma-separated, including scheme, without trailing slash |
| `UPSTASH_REDIS_REST_URL` | Existing Upstash REST endpoint |
| `UPSTASH_REDIS_REST_TOKEN` | Existing Upstash REST token |

## Server-enforced admission budget

Redis is mandatory and fail-closed. The handler validates the payload, then uses
one atomic Lua operation **before** the paid OpenAI call to enforce:

- A persistent, non-renewing number of remaining call attempts. No automatic
  initialization, daily refill, TTL, retry or refund (even on upstream timeout).
- At most 10 starts in a rolling minute.
- At most `KIWI_REALTIME_DAILY_STARTS` starts in rolling 24 hours (default 10).
- At most `KIWI_REALTIME_CONCURRENT_STARTS` starts in rolling 65 minutes (default 2).
  These are conservative reservations, not observed active calls. Stop, failed
  negotiation and the five-minute UX timeout do not free a reservation early.
  This deliberately limits repeated demo restarts; size the operator allocation
  accordingly. The 65-minute window allows margin over the provider's documented
  60-minute session lifetime; it is **not** a guaranteed active-connection count.

Optional limits must be decimal integers 1–10000. Invalid limits, Redis errors,
unexpected responses, missing/corrupt/expiring ledger, and delayed reservations
return 503 without calling OpenAI. Exhausted quotas return 429. The ledger is
shared across instances/deployments using the same database; it uses Redis time.
Only timestamps and counters are retained, never audio, transcripts or identity.
There is still no access code. Origin matching is not authentication: an attacker
can forge Origin and consume the shared allowance, causing denial of service.

### Provision and operate

**Deployment starts closed until an operator explicitly allocates calls.** In the
Upstash console, initialize the following key once (example: 10 paid attempts,
not 10 five-minute calls and not a dollar allowance):

```redis
SET kiwi:realtime:spend:v1 '{"version":1,"remaining":10,"starts":[]}' NX
GET kiwi:realtime:spend:v1
TTL kiwi:realtime:spend:v1
```

TTL must be -1. `NX` avoids resetting an existing budget. Do not automate this
initialization or remove the key to refill it. Keep all funded deployments on
this guard and the same Redis/policy; retire old deployment URLs with the former
unbounded endpoint. Use a dedicated provider project/key and durable Redis with
no eviction/data rollback. Restoring an older ledger can restore spent credits.

To replenish: disable admission on **all** deployments, wait for in-flight
creation requests to finish, inspect provider usage, read the current JSON and
change **only** `remaining` (0–10000), preserving `version` and `starts`, then
re-enable. This is a new explicit spending authorization. Never reset timestamps
or replenish from a browser endpoint. Setting `KIWI_REALTIME_ENABLED=false`
stops new calls only; it does not terminate existing ones.

### Exact residual risk and architecture limit

This is a hard cap on provider **creation attempts**, not dollars, tokens or
five-minute session duration. Allocating N permits at most N calls through this
endpoint until explicit replenishment, including ambiguous/failed attempts.
An admitted hostile client can bypass the UX timer, send repeated responses and
change mutable session/response settings over the direct provider data channel.
`max_output_tokens: 420` is an initial per-response setting, not a total budget
or immutable security boundary. Cost per admitted call remains variable.

OpenAI documents a 60-minute Realtime session maximum. Do not estimate the
allocation using five-minute calls; retained/late-negotiated sessions and changes
to provider behavior also limit what our 65-minute reservation can guarantee.
No client heartbeat, ephemeral-key expiry or VAD idle timeout is a billing cap.

The provider supports `POST /v1/realtime/calls/{call_id}/hangup` for WebRTC.
Thus server termination is possible, but this repository's short-lived Edge
SDP handler has no durable worker/scheduler or proxy supervising the session
once it returns. Adding `setTimeout` after returning is not reliable enforcement.
A stronger design needs a durable controller that stores call IDs and registers
termination before returning SDP, retries hangup independently of the browser,
and handles worker/provider outages; a server-owned media/event proxy is needed
for strict event/token authorization. A scheduled hangup alone still depends on
provider availability and cannot promise an exact dollar cap. These components
are not deployed by this change. Provider budget alerts are not assumed to be
hard spending stops.

### Verification

`npm test` includes production Lua execution against disposable local Redis
(`redis-server` and `redis-cli` required; CI installs them). Optional
`REDIS_SERVER_BIN` / `REDIS_CLI_BIN` select explicit binary paths. Tests cover
parallel reservations, budget exhaustion, rolling windows, corruption/TTL,
provider ambiguity and fail-closed HTTP behavior, plus Child Voice v2 regression
coverage. No paid provider calls are made by the tests.

No microphone starts until Start is pressed. Stop,
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
exercise admission limits and lifecycle behavior; they cannot establish voice
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
- https://developers.openai.com/api/reference/typescript/resources/realtime/subresources/calls/methods/create
- https://developers.openai.com/api/reference/python/resources/realtime/subresources/calls/methods/hangup
- https://upstash.com/docs/redis/features/restapi
- https://developers.openai.com/api/docs/guides/voice-webrtc
- https://developers.openai.com/api/docs/guides/realtime-conversations
- https://developers.openai.com/api/docs/guides/safety-checks/under-18-api-guidance

`npm run dev` runs the Vite frontend only. Use a Vercel preview/development
environment to exercise `/api/kiwi-realtime`.
