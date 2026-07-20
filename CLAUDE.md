# CLAUDE.md — MC_Voice_Training_Frontend

Guidance for Claude Code when working in this repo. Written from a direct code audit (2026-07-20).

## What this is

React 19 + Vite 7 + Tailwind v4 SPA for the MC Voice Training platform. **`package.json` name is `fpt-s7-website-frontend`** — this repo was forked from the main MC Hub website frontend and the package name was never updated; don't be confused by it when reading build output or lockfiles.

## Commands

```bash
npm install
npm run dev            # http://localhost:5173
npm run build
npm run preview
npm run lint
npm run test:e2e        # Playwright
npm run test:e2e:ui
npm run test:e2e:report
```

Env: `VITE_API_URL` must point at the backend's `/api/v1` root (production: `mc-voice-training-backend.onrender.com/api/v1`, dev: `http://localhost:5000/api/v1`).

## HTTP client (`src/services/api.js`)

Single axios instance. **Timeout 45000ms** (raised from 15000ms on 2026-07-20 — the backend runs on Render's free tier, which auto-sleeps after ~15min idle and takes 30-60s to wake up; the old 15s timeout made the first request after any idle period fail, showing up as empty dashboards or fetch errors). `aiService.js` (separate axios instance for the AI proxy path) uses the same 45000ms value — keep them in sync if either changes.

Request interceptor attaches `Authorization: Bearer <token>` from `localStorage`/`sessionStorage`. Response interceptor clears storage and redirects to `/login` on 401 (skips redirect if already on `/login` or `/register`). No refresh-token flow.

## State management

**Zustand**, single store: `src/store/useAuthStore.js` — `user`, `token`, `role`, `isAuthenticated`, persists to `localStorage` (remember-me) or `sessionStorage`, checks JWT expiry client-side via manual base64 decode. Everything else is local component state or React Context (`ThemeContext`, `TourContext`, `QuestGuideContext` — not Zustand stores).

## Routing (`src/App.jsx`)

React Router v7. Guards: `GuestRoute` (redirect authenticated users away), `ProtectedRoute` (require auth), `RoleRoute` (require specific role). Most pages are lazy-loaded. `/m/*` routes render inside `<Layout />` (Navbar/Footer) except a few full-screen ones.

Key routes: `/` (Home, redirects ADMIN → `/m/admin`), `/login`, `/register`, `/m/dashboard`, `/m/settings`, `/m/payment`, `/m/wallet` (MC/ADMIN only), `/m/voice/library`, `/m/voice/practice/:id`, `/m/voice/report/:sessionId`, `/m/community`, `/m/leaderboard`, `/m/courses`, `/m/courses/:id`, `/m/admin/:section` (ADMIN only), `/m/learning/guide/:id` (reading view), `/payment/success`, `/payment/cancel`.

**Known dead routes/files** — don't assume these are wired up just because the file exists:
- `/courses` and `/m/learning`, `/m/learning/milestone/:id` render an inline `<ComingSoon>` placeholder, not the real page components
- `src/pages/CoursesPublic.jsx` and `src/pages/MilestoneDetail.jsx` exist but are **not referenced by any route** — orphaned
- `src/pages/admin/sections/AdminOverview.jsx` and `AnalyticsSection.jsx` contain dead code (unused `Card`/`Stat` helpers) and aren't imported by `AdminDashboard.jsx`
- `src/components/ui/date-picker.jsx` and `popover.jsx` are unused (shadcn-installed, never wired into a page)

## UI component system — animate-ui + shadcn migration (complete)

Per `ANIMATE_UI_MIGRATION_PLAN.md` (root of repo), the full migration finished 2026-07-20. Two parallel sources for UI primitives:

- **`src/components/animate-ui/`** — Radix-backed components with built-in motion (Dialog, Sheet, Checkbox, Accordion, Dropdown Menu, Alert Dialog, Radio Group, Tabs, Switch, Progress, Tooltip, Avatar Group, animated Button). Installed via `npx shadcn@latest add <animate-ui-url>`.
- **`src/components/ui/`** — plain shadcn/ui primitives for what animate-ui doesn't cover: Card, Input, Table, Badge, Avatar, Skeleton, Sonner (toast). **Select was deliberately kept native** (not migrated) per the plan's own recommendation — this was an intentional decision, not an oversight.

When adding new UI, check `animate-ui/components/radix/` first; fall back to `ui/` only for the primitives it doesn't have. Don't reintroduce hand-rolled `AnimatePresence`+`motion.div` modals — that pattern was fully replaced by Radix `Dialog`/`Sheet` across 13+ modals for real focus-trap/ESC-close/scroll-lock behavior.

**Fragile spot:** `src/components/animate-ui/components/buttons/button.jsx` has `defaultVariants.variant` set to `'ghost'` (not shadcn's default `'default'`) — most buttons in this app are icon/nav/tab/toggle buttons with no background, and shadcn's `'default'` produces a solid-gold pill on all of them. **Re-running `npx shadcn@latest add` on this file will silently revert it to `'default'`** and reintroduce that bug site-wide (~200 usages). If you ever re-run the shadcn CLI and it prompts to overwrite this file, check the diff before accepting.

## i18n

`react-i18next`. `src/locales/en.json` and `vi.json`, 40 top-level namespaces each (parity maintained). 65+ files use `useTranslation()`. When adding user-facing strings, add keys to **both** locale files — don't hardcode Vietnamese or English text directly in components.

## E2E tests (Playwright)

`playwright.config.js` + `e2e/` directory. `global.setup.js` registers/logs-in a CLIENT and an ADMIN test user, producing `e2e/.auth/{user,admin}.json` storage states consumed by the other spec files via `storageState`. Suite specs: `auth`, `guest-auth-pages`, `public-pages`, `dashboard`, `courses`, `voice-practice`, `payment`, `misc-authenticated-pages`, `reading-and-admin`. Migration doc references "49/49 pass" as the full suite size as of the last complete run.

**Known fragility**: `global.setup.js` verifies newly-registered users by flipping `isVerified` via direct `mongosh` calls against `MONGODB_TEST_URI` (database `mchub_test`) — but the backend has no Spring test profile, so it always connects to whatever `MONGODB_URI` points at (production `mchub` by default). If the running backend wasn't specifically pointed at `mchub_test` when you run the suite, setup will register users in the wrong database and login will fail with no useful error beyond `loginRes.ok() === false`. If E2E setup fails immediately, check this before assuming a code regression — see [Backend CLAUDE.md](../MC_Voice_Training_Backend/CLAUDE.md) for the DB config detail.

Also uses `--no-deps` to reuse cached auth storage states for quick visual verification when the setup step itself is blocked (rate limits, DB mismatch, etc.).

## Key dependencies

React 19.2, React Router 7.13, Zustand 5.0, Tailwind v4 (`@tailwindcss/vite`), Framer Motion 12 + `motion` 12, `@stomp/stompjs` + `sockjs-client` (WebSocket — note the backend's `/ws-chat` endpoint has no chat feature actually wired to it, see Backend CLAUDE.md), Tiptap 3 + Yjs (collaborative reading-guide editor), `react-i18next`, `sonner` (toast), `recharts`, `canvas-confetti`, `html2pdf.js`/`jspdf` (admin PDF export), `react-big-calendar`, Playwright (E2E only).

`next-themes` is intentionally **not** a dependency — it was auto-added transitively by the shadcn Sonner component and manually removed; don't reinstall it as a "missing peer dep" fix.

## Production deployment

Vercel (auto-deploy from `main`). Watch for:
- **Case-sensitive filesystem on Vercel's Linux build** vs. case-insensitive Windows/Mac dev — a mismatched import casing (e.g. `import ... from '@/components/ui/skeleton'` vs. an actual file `Skeleton.jsx`) builds fine locally but fails Vercel with `ENOENT`/`vite:load-fallback` errors. If a Vercel build fails but `npm run build` passes locally, suspect this first; verify with `git ls-files | grep -i <name>` to see the exact case git has recorded.
- Preview deploys get per-deploy domains (`mc-voice-training-<hash>-<org>.vercel.app`) — the backend's CORS config handles this via a `https://*.vercel.app` wildcard pattern (see Backend CLAUDE.md), so preview URLs shouldn't need manual whitelisting.
