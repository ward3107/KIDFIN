# KIDFIN — Improvement Task Board

Tracking sheet for audit follow-ups. Mark `[x]` when done. Each task has an ID, priority, area, files, and the concrete change required.

Legend: 🔴 critical · 🟠 high · 🟡 medium · 🟢 low

---

## 🔴 Critical — Foundation & Safety

- [ ] **C1 · RTL physical positioning** — replace `left-*` / `right-*` with logical `start-*` / `end-*` (or `rtl:` variants).
  - Files: `components/BanknoteGame.tsx:99`, `PayStubSimulator.tsx:31`, `ScamMiniGame.tsx:79`, `LemonadeStand.tsx:60`, `InvestingSimulator.tsx:67`, `ChildSavingsSimulator.tsx:51`, `PaymentMethodPicker.tsx:74`, `Scenario.tsx:63`, `JourneyGuide.tsx:37`, `GoalSelection.tsx:157,167`, `AchievementToast.tsx:60-62,85`, `PersonalGoalsDisplay.tsx:122-123,206`, `ProgressBar.tsx:60,74,83,91`
  - Verify: test in both Hebrew and Arabic; close buttons land on the start side.

- [ ] **C2 · Tighten tsconfig** — add `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noImplicitOverride`, `forceConsistentCasingInFileNames` to `tsconfig.json`.
  - Fix all new errors surfaced.

- [ ] **C3a · Cleanup `setTimeout` in `useScenarioState`** — return cleanup function from effect, guard `setState` with `isMounted` ref.
  - File: `hooks/useScenarioState.ts:31-34`.

- [ ] **C3b · Stale-closure fix in `useMissionsState`** — read `dailyTasksGenerated` from a ref or include in deps.
  - File: `hooks/useMissionsState.ts:59-79`.

- [ ] **C3c · Race condition in `useAchievements`** — queue notifications instead of overwriting; drain on dismissal.
  - File: `hooks/useAchievements.ts:107-119`.

- [ ] **C4 · Non-destructive localStorage migration** — add per-version transformers `migrateV3toV4`; only wipe with explicit prompt.
  - File: `utils/storage.ts:19`.

- [ ] **C5 · Netlify security headers** — add CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy.
  - File: `netlify.toml`.

---

## 🟠 High — Flow & Design

- [ ] **H6a · Onboarding name optional** — allow skip with default (`חבר`/`صديق`); add Back button across steps.
  - Files: `components/OnboardingNameEntry.tsx`, `GoalSelection.tsx`.

- [ ] **H6b · Welcome overlay after onboarding** — 3-step pointer (name → goal → "tap School").
  - Files: new `components/WelcomeTour.tsx`, wire from `App.tsx`.

- [ ] **H7a · Empty-state CTAs on locked tabs** — `EarnTab` shows "Go learn a lesson" button that switches tab; mark default Save goal as placeholder.
  - Files: `tabs/EarnTab.tsx`, `tabs/SaveTab.tsx`.

- [ ] **H7b · `aria-live` regions for notifications** — wrap purchase / achievement toasts.
  - Files: `components/AchievementToast.tsx`, `tabs/ShopTab.tsx`.

- [ ] **H8 · Game failure feedback** — shake animation + Hebrew hint + reveal correct answer after 2 wrong tries; progress dots.
  - Files: all six simulators in `components/` (`BanknoteGame`, `PayStubSimulator`, `ScamMiniGame`, `LemonadeStand`, `ChildSavingsSimulator`, `InvestingSimulator`).

- [ ] **H9a · `aria-label` on every icon-only button** — pass through `components/UI.tsx`; audit all `<button>` with only Lucide icons.
  - Files: site-wide.

- [ ] **H9b · `:focus-visible` ring on all button variants** — extend `components/UI.tsx` Button variants.

- [ ] **H9c · `lang` attribute via `applyHtmlAttrs`** — set `lang="he"` / `lang="ar"` alongside `dir`.
  - File: `i18n/` setup.

- [ ] **H10a · Extract hard-coded Hebrew to i18n** — known offenders: `tabs/HomeTab.tsx:64`, `components/GoalSelection.tsx:125-179`, `components/JourneyGuide.tsx:84`.
  - Add keys to `i18n/he.json` and `i18n/ar.json`.

- [ ] **H10b · CI guard against new hard-coded RTL strings** — `grep -rE '"[א-ת]+|"[ا-ي]+"' tabs/ components/` fails the build.
  - File: `.github/workflows/ci.yml`.

---

## 🟡 Medium — Quality & Performance

- [ ] **M11 · Lazy-load tabs and game modals** — `React.lazy` + `<Suspense>` for each tab and each simulator.
  - File: `App.tsx`.

- [ ] **M12 · Memoize list items** — wrap `MissionCard`, `LessonCard`, `ShopItem` in `React.memo`; stable `useCallback` handlers.
  - Files: `tabs/EarnTab.tsx`, `tabs/SchoolTab.tsx`, `tabs/ShopTab.tsx`.

- [ ] **M13 · Vite build optimization** — add `build.sourcemap: 'hidden'`, `manualChunks` for react / i18n / icons.
  - File: `vite.config.ts`.

- [ ] **M14 · Align Node version** — bump `netlify.toml` from Node 20 → 22 to match CI.

- [ ] **M15 · `crypto.randomUUID()` for mission IDs** — replace `Date.now().toString()`.
  - File: `hooks/useMissionsState.ts:66`.

- [ ] **M16 · Refactor `geminiService` global state** — move into class instance scoped to AppContext.
  - File: `services/geminiService.ts:7-8,18,43`.

---

## 🟢 Low — Polish

- [ ] **L17 · ESLint hardening** — `@typescript-eslint/no-explicit-any: 'error'`, `no-console: ['warn', { allow: ['error','warn'] }]`.
  - File: `eslint.config.js`.

- [ ] **L18 · Add `npm audit` to CI** — `npm audit --audit-level=moderate` step.
  - File: `.github/workflows/ci.yml`.

- [ ] **L19 · Validate service worker + offline fallback** — confirm `public/sw.js` caches; add `offline.html`.

- [ ] **L20 · E2E smoke tests** — Playwright covering onboarding → first lesson → first save → first purchase.

- [ ] **L21 · `<noscript>` fallback in `index.html`** — Hebrew message for JS-disabled devices.

---

## ✅ Already Fixed (verified vs Feb 2025 audit)

- [x] Gemini API key exposure → AI disabled, fallback config used.
- [x] No data persistence → `localStorage` with `SCHEMA_VERSION = 4`.
- [x] `App.tsx` monolith (595 lines) → 263 lines + 6 tab files.
- [x] Bundle size 475 KB → ~140 KB (Recharts + Gemini SDK removed).
- [x] No error boundary → `components/ErrorBoundary.tsx` implemented.
- [x] No tests → 14 test files, ~130 cases.

---

## Suggested PR Grouping

1. **PR 1 — "Foundation"**: C1 + C2 + C5 (mechanical, independent).
2. **PR 2 — "Hook safety"**: C3a + C3b + C3c + C4 + M15.
3. **PR 3 — "Build & perf"**: M11 + M12 + M13 + M14 + L17 + L18.
4. **PR 4 — "i18n & a11y"**: H9a + H9b + H9c + H10a + H10b.
5. **PR 5 — "Flows & feel"**: H6a + H6b + H7a + H7b + H8.
6. **PR 6 — "Polish"**: L19 + L20 + L21 + M16.
