# AI Chat (Gemini) — Setup

The mascot's **free-chat mode** uses Google **Gemini** for real understanding of
what a child says. The API key lives **only on the server** (a Netlify Function),
never in the browser.

## 1. Get a Gemini API key
- Go to **Google AI Studio** → **Get API key** (aistudio.google.com/app/apikey).
- Create a key (free to create). Set a spending cap in Google Cloud if you want.

## 2. Add it to Netlify (production)
Netlify site → **Site configuration → Environment variables → Add a variable**:

| Key | Value |
|-----|-------|
| `GEMINI_API_KEY` | *your key* |
| `GEMINI_MODEL` *(optional)* | e.g. `gemini-2.0-flash` (default) |

Then **redeploy** (or push a commit) so the function picks up the variable.

> Do **not** put the key in the app code, `.env` committed to git, or the client.

## 3. That's it
- The client calls `POST /api/chat` → `netlify/functions/chat.mjs` → Gemini.
- Until a key is set, the endpoint returns `503` and the app shows a friendly
  "AI not enabled yet" notice and stays in scripted lesson mode.

## Safety (built in)
- Strict **system prompt**: kind tutor for young kids, simple words, only
  friendly/educational topics, steers away from unsafe subjects.
- Gemini **safety filters** at `BLOCK_LOW_AND_ABOVE` for harassment, hate,
  sexual, and dangerous content; blocked replies are swapped for a safe line.
- Short replies (small token cap), input length limits, last-10-turns history.
- Replies are spoken with the browser voice for now; **natural TTS for dynamic
  AI replies** is a follow-up (scripted lines already use natural audio).

## Cost
Gemini Flash is very cheap — roughly a few cents per child per session of chat.
Monitor and cap usage in Google Cloud.
