# 3D Talking Avatar — Build Plan

**Goal:** Turn the mascot robot (the green-faced robot holding a heart, grapes, and a
lightbulb) into a **3D character that renders, animates, talks, and runs social-interaction
lessons** inside the existing Save4Dream app, so the platform can teach students social &
emotional skills alongside financial literacy.

This is a **planning document only** — no app code is changed yet. It maps the work onto the
real structure of this repo (React 19 + TypeScript + Vite, `react-i18next`, existing
`Scenario` pattern) so implementation can proceed one slice at a time.

> **Open decision (deferred):** the dialogue "brain" — *scripted-only* vs *scripted + AI
> (LLM) replies* — is intentionally left open. The architecture below keeps the avatar's
> **behavior driven through a single interface** (`DialogueEngine`) so either choice can be
> plugged in later without touching the rendering or talking layers.

---

## 1. The four independent layers

The character is built as four layers that can be developed and tested separately. This is
what keeps the project shippable in small steps instead of one big risky change.

| Layer | Responsibility | Core tech | Cost |
|-------|----------------|-----------|------|
| **1. Model** (the body) | A 3D robot mesh | `.glb` file (image→3D or rigged artist model) | one-time |
| **2. Renderer** (the stage) | Show + animate it in a React component | `three.js` + `@react-three/fiber` + `@react-three/drei` | free, in-browser |
| **3. Voice** (talking) | Speak text; move the mouth | Web Speech API (`speechSynthesis`) → optional TTS service | free → paid |
| **4. Brain** (behaving) | Decide what to say/do per lesson | `DialogueEngine` interface: scripted trees → optional LLM | free → paid |

Each layer only depends on the one below it. You can ship layer 1+2 (a robot that just
stands and idles), then add 3 (it talks), then add 4 (it teaches).

---

## 2. Layer 1 — The 3D model

Two realistic ways to get the `.glb`:

### Option A — Image → 3D (fastest, recommended for MVP)
Feed the existing mascot picture (`/root/.claude/uploads/.../d7ca57bf-image.jpg`, keep a copy
in `public/`) into an image-to-3D generator to produce a static `.glb` mesh.
- ✅ Fast, cheap, looks like *this* robot.
- ❌ Not rigged — the mouth/limbs can't move on their own. Good enough for idle + whole-body
  bob/scale "talking" cues in an MVP.
- Tools: in-session `generate_3d`, or Meshy / Tripo / Rodin.

### Option B — Purpose-built **rigged** avatar (best for real talking)
Commission or generate a clean robot with:
- a **skeleton** (head, arms) for gestures (wave, point, cheer, think), and
- **face blendshapes / morph targets** (at minimum a `jawOpen` / mouth-open shape, plus a
  few expressions: happy, surprised, thinking, sad).
- ✅ Mouth syncs to speech, real gestures, real expressions — essential for social lessons.
- ❌ Slower, needs an artist or a rigging tool.

**Recommendation:** Ship the MVP on **Option A**, upgrade to **Option B** once the loop is
proven. The renderer component is written so swapping the `.glb` is a one-line change.

**Asset budget:** keep the `.glb` under ~5–8 MB (Draco-compress geometry, 1–2 K textures) so
it loads fast on a school tablet. Store in `public/models/robot.glb`.

---

## 3. Layer 2 — Rendering in the app

Stack (matches the existing Vite/React setup):

```
npm i three @react-three/fiber @react-three/drei
npm i -D @types/three
```

New files:

```
components/avatar/
  RobotAvatar.tsx        # <Canvas> wrapper; loads robot.glb, lights, camera
  useAvatarActions.ts    # imperative API: speak(), setExpression(), playGesture()
  avatarTypes.ts         # AvatarExpression, AvatarGesture, AvatarState types
public/models/
  robot.glb              # the model from Layer 1
```

`RobotAvatar` exposes a small imperative handle (via `useImperativeHandle`) so any tab can do:

```tsx
avatarRef.current.speak("שלום! בוא נלמד על חברות טובה 🤝");
avatarRef.current.setExpression("happy");
avatarRef.current.playGesture("wave");
```

Behavior details:
- **Idle loop:** gentle bob + occasional blink/look-around so it never looks frozen.
- **Reduced motion:** respect `prefers-reduced-motion` — swap continuous motion for subtle
  state changes (accessibility + the app already targets kids).
- **Performance:** cap devicePixelRatio, pause the render loop when the avatar is off-screen
  (`useFrame` + `IntersectionObserver`), lazy-load the whole avatar bundle with
  `React.lazy` so non-avatar tabs stay light.
- **RTL/layout:** the `<Canvas>` sits in a normal flex/grid cell — no RTL conflict since it's
  a visual box, not text.

---

## 4. Layer 3 — Talking (voice + mouth)

### MVP — Web Speech API (free, built into browsers)
```ts
const u = new SpeechSynthesisUtterance(text);
u.lang = i18n.language === 'he' ? 'he-IL' : 'en-US';
speechSynthesis.speak(u);
```
- ✅ Free, offline-friendly, supports Hebrew, no keys.
- Drive a **mouth-open value** from utterance `start`/`boundary`/`end` events (or a simple
  timer/oscillation while `speaking`) → feed into the model's `jawOpen` morph (Option B) or a
  head-scale pulse (Option A).
- **Listening back** (optional, kids reply by voice): `SpeechRecognition` (webkit-prefixed),
  behind a feature flag — browser support varies.

### Upgrade — TTS service (premium voice)
Swap the voice provider behind one interface so the app code never changes:

```
services/voice/
  VoiceProvider.ts       # interface: speak(text, opts) -> events(mouth level, done)
  webSpeechProvider.ts   # default, free
  ttsProvider.ts         # optional ElevenLabs/Azure/etc. (needs key + backend proxy)
```

> Keys never ship in the client. A TTS provider requires a tiny serverless proxy
> (Netlify/Vercel function) — the app already deploys to Netlify.

---

## 5. Layer 4 — Behaving & social-interaction lessons (the brain)

This is where "teach social interaction" actually lives. Reuse the app's proven pattern: the
existing **`Scenario` / `ScenarioModal`** flow (`components/Scenario.tsx`,
`config/scenarios.ts`) is *already* a social-decision engine — a situation, a set of choices,
feedback per choice, and rewards. The avatar makes it embodied.

### 5.1 Data model — a social-skills scenario
Extend the existing `Scenario` shape (in `types.ts`) rather than inventing a new one. Add a
new category and per-choice avatar cues:

```ts
// types.ts — extend the existing unions/interfaces
export type ScenarioCategory =
  | 'needs_vs_wants' | 'saving' | 'spending' | 'ethics'
  | 'sharing' | 'empathy' | 'conflict' | 'greeting' | 'teamwork'; // NEW social topics

export interface ScenarioChoice {
  // ...existing fields (text, feedback, isCorrect, coinsReward, xpReward)...
  avatarExpression?: AvatarExpression; // NEW: how the robot reacts
  avatarGesture?: AvatarGesture;       // NEW
  avatarLine?: string;                 // NEW: spoken feedback (i18n key or text)
}
```

New content file, mirroring `config/scenarios.ts`:
```
config/socialScenarios.ts   # SOCIAL_SCENARIOS: Scenario[]  (Hebrew first, i18n-ready)
```

Example topics for students: greeting someone new, sharing/taking turns, reading feelings,
resolving a disagreement, asking for help, giving a compliment, handling "no", teamwork.

### 5.2 The `DialogueEngine` interface (keeps the AI decision deferred)
All "what should the robot say/do next" goes through **one interface**, so scripted vs AI is a
swap, not a rewrite:

```
services/dialogue/
  DialogueEngine.ts        # interface: next(state, userChoice) -> AvatarTurn
  scriptedEngine.ts        # DEFAULT: reads socialScenarios.ts trees (safe, offline, free)
  aiEngine.ts              # OPTIONAL LATER: LLM-backed, behind guardrails + proxy
```

```ts
interface AvatarTurn {
  line: string;                 // what to speak
  expression: AvatarExpression; // happy | thinking | surprised | sad | neutral
  gesture?: AvatarGesture;      // wave | point | cheer | shrug | think
  choices?: ScenarioChoice[];   // next options for the child
  done?: boolean;
}
```

- **Scripted engine** = the whole MVP brain. Deterministic, reviewed content, appropriate for
  children, works offline. Strongly recommended as the default for a kids' platform.
- **AI engine** = optional upgrade for freer conversation. If chosen later, it must run behind
  a server proxy with strict system prompts, output filtering, and topic allow-lists. Note the
  repo currently *disables* client AI on purpose (`services/geminiService.ts`) — respect that
  posture; any AI path is server-side + guardrailed.

### 5.3 A "Social" tab (surfacing it in the platform)
Add a tab alongside the existing six (`home / school / earn / save / shop / analysis`):

```
tabs/SocialTab.tsx          # hosts <RobotAvatar/> + the active social scenario UI
hooks/useSocialState.ts     # progress, completed social lessons (mirror useScenarioState.ts)
```
Wire it into `NAV_ITEMS` in `App.tsx` with a lucide icon (e.g. `MessagesSquare` / `Users`),
and add nav + content i18n keys under `i18n/`. Progress plugs into the existing achievement/XP
system (`useAchievements`, `useGameStats`) so social lessons reward the same coins/XP as
finance lessons — one unified game economy.

---

## 6. Milestones (each independently shippable)

| # | Milestone | Deliverable | Depends on |
|---|-----------|-------------|-----------|
| **M0** | Model asset | `public/models/robot.glb` (Option A) | — |
| **M1** | Static render | `RobotAvatar` shows the robot idle-animating on a demo route | M0 |
| **M2** | It talks | Web Speech voice + mouth/head motion via `useAvatarActions.speak()` | M1 |
| **M3** | It reacts | `setExpression` / `playGesture`; scripted `DialogueEngine` + one social scenario | M2 |
| **M4** | Social tab | `SocialTab` + `useSocialState`, wired into nav, i18n, XP/achievements | M3 |
| **M5** | Content | 6–10 authored social scenarios (Hebrew + English) in `socialScenarios.ts` | M4 |
| **M6** | Polish (opt.) | Rigged model (Option B), premium TTS, voice input, `prefers-reduced-motion` audit | M2–M5 |

**Suggested first PR = M0–M2** (a robot that renders and talks on a hidden demo route). Small,
low-risk, visually convincing, and it proves the two hardest layers before any content work.

---

## 7. Risks & decisions to make

- **Bundle size / device perf.** three.js + a `.glb` adds weight. Mitigate with lazy-loading,
  Draco compression, and pausing the loop off-screen. Test on a low-end tablet early.
- **Rigging vs static.** Static (Option A) limits "talking" realism. Decide before M6 whether
  a rigged model is worth commissioning.
- **Voice quality vs cost.** Web Speech is free but robotic; a TTS service needs a key + proxy
  + budget. Ship free, upgrade if the classroom experience demands it.
- **Scripted vs AI brain** *(the deferred decision).* Default scripted. Only add AI with a
  server proxy and child-safety guardrails; it changes privacy, cost, and moderation scope.
- **Accessibility & inclusivity.** Reduced-motion, captions/subtitles for every spoken line
  (show `line` as text too — also helps deaf/hard-of-hearing and non-audio classrooms),
  Hebrew + English parity.
- **Child-safety / privacy.** No audio leaves the device with Web Speech. Voice *input* and any
  AI path introduce data handling that needs review before enabling in a school.

---

## 8. New/changed files at a glance

```
public/models/robot.glb                 NEW  (from image→3D)
components/avatar/RobotAvatar.tsx        NEW
components/avatar/useAvatarActions.ts    NEW
components/avatar/avatarTypes.ts         NEW
services/voice/VoiceProvider.ts          NEW
services/voice/webSpeechProvider.ts      NEW
services/voice/ttsProvider.ts            NEW  (optional, later)
services/dialogue/DialogueEngine.ts      NEW
services/dialogue/scriptedEngine.ts      NEW
services/dialogue/aiEngine.ts            NEW  (optional, later)
config/socialScenarios.ts                NEW
tabs/SocialTab.tsx                       NEW
hooks/useSocialState.ts                  NEW
types.ts                                 EDIT (extend ScenarioCategory + ScenarioChoice)
App.tsx                                  EDIT (add 'social' tab to NAV_ITEMS)
i18n/*                                   EDIT (nav.social + social scenario strings)
package.json                             EDIT (three, @react-three/fiber, @react-three/drei)
```

---

*Next step when you're ready: say the word and I'll implement **M0–M2** (render + talk) on
this branch as the first PR.*
