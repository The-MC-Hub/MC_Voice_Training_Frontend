# MC Voice Training — Frontend

> AI-powered voice coaching platform for professional MCs. Practice speech delivery, receive real-time AI feedback on accuracy, rhythm and pace, and track performance over time.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react) ![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite) ![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38BDF8?logo=tailwindcss) ![License](https://img.shields.io/badge/license-MIT-green)

For full architectural detail (route table, dead/orphaned routes, UI component migration status, known fragile spots, E2E setup pitfalls) see **[CLAUDE.md](./CLAUDE.md)** — this README is a quick-start only.

---

## Overview

React 19 SPA for voice practice sessions, AI analysis reports, course/academy content, and community leaderboards/competitions. Three roles with distinct access: `CLIENT`, `MC`, `ADMIN` (route guards: `GuestRoute`, `ProtectedRoute`, `RoleRoute` — see `src/App.jsx`).

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
| Realtime | `@stomp/stompjs` + `sockjs-client` (connects to backend's `/ws-chat`; no chat feature is actually wired to it server-side) |
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

`/courses`, `/m/learning`, and `/m/learning/milestone/:id` render an inline `<ComingSoon>` placeholder — they do **not** use `src/pages/CoursesPublic.jsx` or `src/pages/MilestoneDetail.jsx`, which exist in the codebase but are orphaned (no route references them). Don't assume a page file being present means it's reachable — check `src/App.jsx`.

## E2E tests

Playwright, config at repo root, specs in `e2e/`. `global.setup.js` registers/verifies a CLIENT and ADMIN test user and caches `e2e/.auth/{user,admin}.json` storage states. **If setup fails with `loginRes.ok() === false`**, check whether the backend's `MONGODB_URI` actually points at the same database `global.setup.js`'s mongosh verification step targets (`MONGODB_TEST_URI` / `mchub_test`) — there's no Spring test profile forcing this alignment automatically, so a backend pointed at production `mchub` will silently break the whole suite with no clearer error than a failed login.

## Further reference

- [CLAUDE.md](./CLAUDE.md) — full route table, migration status detail, timeout/CORS history
- [ANIMATE_UI_MIGRATION_PLAN.md](./ANIMATE_UI_MIGRATION_PLAN.md) — per-component migration decisions and rationale
- [COLOR-SYSTEM.md](./COLOR-SYSTEM.md) — design tokens, spacing, component visual patterns
- [FEATURES_LOG.md](./FEATURES_LOG.md) — historical sprint/feature changelog (not current-state — see CLAUDE.md for that)
- [GA4_TRACKING_REPORT.md](./GA4_TRACKING_REPORT.md) — GA4 event tracking inventory
