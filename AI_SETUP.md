# AI Chat (Claude) — Setup

The mascot's **free-chat mode** uses Anthropic **Claude (Haiku)** for real
understanding of what a child says. The API key lives **only on the server**
(a serverless function), never in the browser. The same endpoint (`/api/chat`)
ships for **both hosts**: `api/chat.ts` on Vercel and
`netlify/functions/chat.mjs` on Netlify — so it works whichever one you deploy.

## 1. Get an Anthropic API key
- Go to the **Anthropic Console** → **API Keys** (console.anthropic.com/settings/keys).
- Create a key. Set spend limits in the console if you want.

## 2. Add it to your host (production)

**Vercel** → Project **kidfin** → Settings → **Environment Variables** → Add:

| Key | Value |
|-----|-------|
| `ANTHROPIC_API_KEY` | *your key* |
| `ANTHROPIC_MODEL` *(optional)* | e.g. `claude-haiku-4-5` (default) |

**Netlify** (if used) → **Site configuration → Environment variables** → add the
same variables.

Then **redeploy** (or push a commit) so the function picks up the variable.

> Do **not** put the key in the app code, a committed `.env`, or the client.

## 3. That's it
- The client calls `POST /api/chat` → the serverless function → Claude.
- Until a key is set, the endpoint returns `503` and the app shows a friendly
  "AI not enabled yet" notice and stays in scripted lesson mode.

## Safety (built in)
- Strict **system prompt**: kind tutor for young kids, simple words, only
  friendly/educational topics, steers away from unsafe subjects, never asks for
  personal data.
- Claude's built-in safety; refused replies are swapped for a safe line.
- Short replies (small token cap), input length limits, last-10-turns history.
- Replies are spoken with the browser voice for now; **natural TTS for dynamic
  AI replies** is a follow-up (scripted lines already use natural audio).

## Cost
Claude Haiku is inexpensive (about $1 per 1M input / $5 per 1M output tokens) —
roughly cents per child per chat session. Monitor and cap usage in the console.

## Model choice
Default is `claude-haiku-4-5` (fast, cheap, strong on Hebrew + Arabic, very
safety-conscious for children). To try another Claude model, set
`ANTHROPIC_MODEL`.
