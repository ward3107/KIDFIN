# AI Voice (Gemini Live) — Setup

Kiwi's front page is a real, two-way spoken conversation powered by **Gemini
Live**. Kiwi opens the chat by itself and understands and speaks **Hebrew and
everyday spoken Arabic**. If no Gemini key is set (or the browser can't
connect), the page **falls back automatically** to the scripted conversation —
so the app always works.

## Push-to-talk (why there's a button)
The child taps **"לחצו כדי לדבר" / "اضغط لتتكلّم"** to talk, then **"שלח" /
"أرسل"** to send it to Kiwi. Gemini's automatic voice detection is deliberately
**disabled**: in a classroom, background chatter would otherwise keep the mic
open and feed other children's voices into the conversation. With push-to-talk
the mic is streamed **only** between those two taps, so Kiwi hears one child, on
purpose. Tapping "talk" while Kiwi is speaking also interrupts it, so a child
never has to wait for Kiwi to finish.

The API key lives **only on the server**. The browser never sees it: a
serverless endpoint mints a short-lived, single-use **ephemeral token** locked
to Kiwi's model and kid-safe instructions, and the browser opens the Live
connection with that token.

## 1. Get a Gemini API key (free)
- Go to **https://aistudio.google.com/apikey** and sign in with any Google
  account (a normal Gmail works — no credit card needed to start).
- Click **Create API key** → **Create API key in new project**.
- Copy the key (starts with `AIza…`). Keep it private — never paste it in code
  or the browser.

## 2. Add it to your host (production)

**Vercel** → Project **kidfin** → Settings → **Environment Variables** → Add:

| Key | Value |
|-----|-------|
| `GEMINI_API_KEY` | *your key* |
| `GEMINI_LIVE_MODEL` *(optional)* | a Live model id (default: native-audio 2.5 Flash) |
| `GEMINI_LIVE_VOICE` *(optional)* | a prebuilt voice name (default `Aoede`) |

**Netlify** (if used) → **Environment variables** → add the same.

Then **redeploy** (or push a commit) so the function picks up the variable.

> Do **not** put the key in the app code, a committed `.env`, or the client.

## 3. That's it
- The client asks `POST /api/gemini-token` → the serverless function mints an
  ephemeral token → the browser opens the Gemini Live WebSocket with it.
- Until a key is set, the token endpoint returns `503` and the front page quietly
  runs the scripted conversation instead.

## Abuse protection (the endpoint is public)
1. **Google spend — free tier is the backstop.** The free tier has hard rate
   limits, so you can't overspend unless you deliberately enable paid billing.
   If you go paid, set a budget/quota in Google Cloud.
2. **Same-origin check (built in).** The token endpoint only answers requests
   from your own site (a random `curl` or another website is rejected, 403).
   Custom domains: set `ALLOWED_ORIGINS` (comma-separated) if needed.
3. **Per-IP rate limit (optional, recommended).** Uses **Upstash Redis** (free
   tier). Create a database at upstash.com, then add its two REST values:

   | Key | Value |
   |-----|-------|
   | `UPSTASH_REDIS_REST_URL` | *from the Upstash database page* |
   | `UPSTASH_REDIS_REST_TOKEN` | *from the Upstash database page* |
   | `LIVE_RATE_LIMIT` *(optional)* | token requests per minute per IP (default `10`) |

   **If Upstash isn't configured or is unreachable, the limit fails open**
   (allows the request) — it can never lock out a real student.

## Safety (built in)
- Strict, kid-safe **system instruction**: a kind tutor for young kids, simple
  words, only friendly/educational topics, steers away from unsafe subjects,
  never asks for personal data. Locked into the ephemeral token so the browser
  can't change it.
- Gemini's built-in safety filters.
- The mic uses echo cancellation / noise suppression; audio never leaves the
  child's device except as the live stream to Google.

## Cost
Roughly a few cents per 5-minute child session — and $0 while you stay on the
free tier. Monitor usage in Google AI Studio / Google Cloud.

## If Kiwi's live voice doesn't start
- **"model not found" / connect fails:** Gemini preview model ids rotate. Set
  `GEMINI_LIVE_MODEL` to the current Live model id from
  https://ai.google.dev/gemini-api/docs/models — no code change needed.
- **No mic permission:** the child's browser must allow the microphone; Kiwi
  shows a gentle "allow the microphone" note.
- **No key yet:** the page quietly runs the scripted conversation until
  `GEMINI_API_KEY` is set.
