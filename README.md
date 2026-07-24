# MC Voice Training — Frontend

> AI-powered voice coaching platform for professional MCs. Practice speech delivery, receive real-time AI feedback on accuracy, rhythm and pace, and track performance over time.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react) ![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite) ![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38BDF8?logo=tailwindcss) ![License](https://img.shields.io/badge/license-MIT-green)

For full architectural detail (route table, dead/orphaned routes, UI component migration status, known fragile spots, E2E setup pitfalls) see **[CLAUDE.md](./CLAUDE.md)** — this README is a quick-start only.

---

## Overview

React 19 SPA for voice practice sessions, AI analysis reports, course/academy content (learning roadmap, video/exercise/case-study lessons, progress dashboard, peer review), MC discovery search, MC booking, in-app chat, and community leaderboards/competitions. Three roles with distinct access: `CLIENT`, `MC`, `ADMIN` (route guards: `GuestRoute`, `ProtectedRoute`, `RoleRoute` — see `src/App.jsx`).

## Feature areas

- **Course learning path** (`/m/learning`, `/m/courses/:id`) — roadmap page, path map with reading/video/exercise/quiz/case-study nodes, `CourseProgressTab` (practice-session stats + score-over-time chart), `CaseStudyView` (annotated video + discussion), `PeerReview` (`/m/peer-review`, MC-only) for reviewing learners' practice sessions, gamified completion (XP + voucher toast)
- **MC search** (`/m/search`, `/m/mc/:id`) — filterable MC discovery and public profile view
- **Booking** (`/m/booking`, `/m/bookings`) — client booking creation/list, `BookingStatusBadge`, admin booking management section
- **Chat** (`/m/messaging`) — conversation list + message thread, backed by `useChatStore` and the shared `useAppSocket` hook (also used for notifications)

**Note:** `package.json`'s `name` field is `fpt-s7-website-frontend` (inherited from the repo this was forked from) — this doesn't affect functionality but will show up in build output/lockfiles.

## Tech Stack

| Category | Technology |
|---|---|
| Framework | React 19.2 + React Router 7.13 |
| Build Tool | Vite 7 |
| Styling | Tailwind CSS 4 (`@tailwindcss/vite`) |
| Animation | Framer Motion 12 + `motion` 12 |
| State Management | Zustand 5 (single store: `src/store/useAuthStore.js`) |
| UI Components | animate-ui (Radix-backed, animated) + shadcn/ui (plain primitives it doesn't cover) |
| i18n | react-i18next (`src/locales/en.json` + `vi.json`) |
| HTTP | axios (`src/services/api.js`, 45s timeout to survive backend cold-starts) |
| Realtime | `@stomp/stompjs` + `sockjs-client` via `useAppSocket` (connects to backend's `/ws-chat`; powers both notifications and chat) |
| Collaborative editing | Tiptap 3 + Yjs (reading-guide highlight annotations) |
| E2E | Playwright |

## Commands

```bash
npm install
npm run dev             # http://localhost:5173
npm run build
npm run preview
npm run lint
npm run test:e2e
npm run test:e2e:ui
npm run test:e2e:report
```

Copy `.env.example` → `.env`, set `VITE_API_URL` to the backend's `/api/v1` root.

## UI components — read before adding new UI

The animate-ui/shadcn migration is complete (`ANIMATE_UI_MIGRATION_PLAN.md`). Check `src/components/animate-ui/components/radix/` first (Dialog, Sheet, Checkbox, Accordion, Dropdown Menu, Alert Dialog, Radio Group, Tabs, Switch, Progress, Tooltip, Avatar Group — animated, Radix-backed); fall back to `src/components/ui/` only for what animate-ui doesn't cover (Card, Input, Table, Badge, Avatar, Skeleton, Sonner toast). Select is intentionally kept as a native `<select>`, not migrated.

**Known fragile spot:** re-running `npx shadcn@latest add` on `src/components/animate-ui/components/buttons/button.jsx` will silently revert its `defaultVariants.variant` from `'ghost'` back to shadcn's `'default'`, reintroducing a solid-gold-background bug across ~200 button usages. If the CLI prompts to overwrite this file, diff it before accepting.

## Routing gotchas

`/m/learning` now renders the real `Learning.jsx` roadmap (no longer `<ComingSoon>`); `/m/learning/milestone/:id` redirects to `/m/courses/:id` instead of using the orphaned `MilestoneDetail.jsx`. `/courses` (public, unauthenticated landing) still renders `<ComingSoon>` — that one is unchanged. `src/pages/CoursesPublic.jsx` and `src/pages/MilestoneDetail.jsx` remain orphaned (no route references them). Don't assume a page file being present means it's reachable — check `src/App.jsx`.

## E2E tests

Playwright, config at repo root, specs in `e2e/`. `global.setup.js` registers/verifies a CLIENT and ADMIN test user and caches `e2e/.auth/{user,admin}.json` storage states. **If setup fails with `loginRes.ok() === false`**, check whether the backend's `MONGODB_URI` actually points at the same database `global.setup.js`'s mongosh verification step targets (`MONGODB_TEST_URI` / `mchub_test`) — there's no Spring test profile forcing this alignment automatically, so a backend pointed at production `mchub` will silently break the whole suite with no clearer error than a failed login.

## Further reference

- [CLAUDE.md](./CLAUDE.md) — full route table, migration status detail, timeout/CORS history
- [ANIMATE_UI_MIGRATION_PLAN.md](./ANIMATE_UI_MIGRATION_PLAN.md) — per-component migration decisions and rationale
- [COLOR-SYSTEM.md](./COLOR-SYSTEM.md) — design tokens, spacing, component visual patterns
- [FEATURES_LOG.md](./FEATURES_LOG.md) — historical sprint/feature changelog (not current-state — see CLAUDE.md for that)
- [GA4_TRACKING_REPORT.md](./GA4_TRACKING_REPORT.md) — GA4 event tracking inventory
