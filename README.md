# MC Voice Training — Frontend

> AI-powered voice coaching platform for professional MCs. Practice speech delivery, receive real-time AI feedback on accuracy, rhythm and pace, and track performance over time.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react) ![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite) ![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38BDF8?logo=tailwindcss) ![License](https://img.shields.io/badge/license-MIT-green)

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Project Structure](#project-structure)
- [Pages & Routes](#pages--routes)
- [Environment Variables](#environment-variables)
- [Getting Started](#getting-started)
- [Design System](#design-system)
- [Role Access Matrix](#role-access-matrix)
- [API Integration](#api-integration)

---

## Overview

MC Voice Training Frontend is a React 19 SPA built for the MC Hub platform. It serves as the primary interface for voice practice sessions, AI analysis reports, academy course management, and community competitions.

The application serves **4 user roles**: `guest`, `user`, `mc`, and `admin`, each with distinct dashboards and access levels.

---

## Tech Stack

| Category | Technology |
|---|---|
| Framework | React 19 + React Router v7 |
| Build Tool | Vite 7 |
| Styling | Tailwind CSS 4 (`@tailwindcss/vite`) |
| Animation | Framer Motion 12 |
| State Management | Zustand |
| HTTP Client | Axios |
| Real-time | Socket.IO Client, SockJS + STOMP |
| UI Components | HeroUI 3 (Avatar, Dropdown) |
| Markdown | ReactMarkdown + remark-gfm |
| Charts | Recharts |
| i18n | react-i18next (VI / EN) |
| Audio | Web Audio API (MediaRecorder) |

---

## Features

### Voice Practice
- Record voice sessions directly in the browser via **MediaRecorder API**
- Real-time waveform visualization during recording
- AI analysis pipeline: pitch, rhythm, pacing, accuracy scoring
- Detailed **Voice Report** with Mel-spectrogram breakdown (Premium)
- Bilingual feedback output (Vietnamese & English)

### Academy & Learning
- Structured course catalog with milestones
- Reading view for theory content with Markdown rendering
- Quiz system integrated into milestones
- Progress tracking per course

### Community
- **Voice Duel Arenas** — weekly/daily speech competitions
- Leaderboard ranking system
- Competition history and score comparison

### Dashboard
- Personal practice statistics and history
- Score trends over time
- Session replay and feedback review

### Admin Panel
- User management (verify/suspend MC accounts)
- Lesson/script catalog management (CRUD)
- Competition arena management
- Transaction ledger overview
- Academy course and milestone builder

### Premium Subscription
- One-time lifetime payment via **VietQR MBBank**
- Instant activation via payment memo matching
- Unlocks unlimited recording attempts + advanced AI reports

---

## Project Structure

```
MC_Voice_Training_Frontend/
├── public/
│   ├── images/             # MC profile photos
│   └── legal/              # Terms & Privacy markdown files
├── src/
│   ├── assets/             # Static assets
│   ├── components/
│   │   ├── animations/     # PageTransition, ScrollReveal, CountUp, ShinyText
│   │   ├── chat/           # ChatWindow, MessageList, ConversationHeader
│   │   ├── dashboard/      # OverviewTab
│   │   ├── editor/         # CollaborativeEditor
│   │   ├── modals/         # ContactModal
│   │   ├── profile/        # MCProfileView
│   │   └── ui/             # Toast, PageLoader, Skeleton, EmptyState
│   ├── contexts/           # ThemeContext
│   ├── controllers/        # Data orchestration layer (services → pages)
│   ├── hooks/              # useApi, useAuth, useSocket, useDebounce
│   ├── layout/             # MainLayout (Navbar + Outlet + Footer)
│   ├── locales/            # en.json, vi.json translation files
│   ├── pages/
│   │   ├── admin/          # Admin section components + managers
│   │   └── *.jsx           # All route-level pages
│   ├── services/           # Axios API wrappers per domain
│   ├── store/              # Zustand auth store
│   ├── App.jsx             # Route definitions
│   ├── index.css           # Tailwind + design tokens
│   └── index.jsx           # Entry point
├── .env.example
├── package.json
└── vite.config.js
```

---

## Pages & Routes

| Route | Page | Auth Required |
|---|---|---|
| `/` | Home | No |
| `/about` | About | No |
| `/login` | Login | Guest only |
| `/register` | Register | Guest only |
| `/forgot-password` | ForgotPassword | Guest only |
| `/courses` | CoursesPublic | No |
| `/terms` | Terms of Service | No |
| `/privacy` | Privacy Policy | No |
| `/help` | Help Center | No |
| `/contact` | Contact Us | No |
| `/onboarding` | Onboarding | Yes |
| `/m/dashboard` | Dashboard | Yes |
| `/m/voice/library` | Voice Library | No |
| `/m/voice/practice/:id` | Voice Practice | Yes (full-screen) |
| `/m/voice/report/:sessionId` | Voice Report | Yes |
| `/m/learning` | Learning / Academy | No |
| `/m/learning/milestone/:id` | Milestone Detail | Yes |
| `/m/courses` | Course List | Yes |
| `/m/courses/:id` | Course Detail | Yes |
| `/m/community` | Community | No |
| `/m/settings` | Settings | Yes |
| `/m/payment` | Payment | Yes |
| `/m/wallet` | Wallet | MC / Admin |
| `/m/notifications` | Notifications | Yes |
| `/m/admin` | Admin Dashboard | Admin only |

---

## Environment Variables

Copy `.env.example` to `.env` and fill in values:

```bash
cp .env.example .env
# Windows PowerShell:
Copy-Item .env.example .env
```

| Variable | Description | Example |
|---|---|---|
| `VITE_APP_NAME` | Application display name | `MC Voice Training` |
| `VITE_API_URL` | Backend REST API base URL | `http://localhost:5000/api/v1` |
| `VITE_AI_API_URL` | AI voice analysis service URL | `http://localhost:8000` |

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+ or pnpm

### Install & Run

```bash
# Install dependencies
npm install

# Start development server (http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint
npm run lint
```

---

## Design System

The UI follows an **Apple / Linear** inspired dark design system with gold accent.

### Color Tokens (`src/index.css`)

| Token | Value | Usage |
|---|---|---|
| `--bg-base` | `#09090b` | App background |
| `--bg-surface` | `#111113` | Cards, panels |
| `--bg-elevated` | `#1a1a1e` | Hover states, dropdowns |
| `--gold` | `#f5a623` | Primary CTA, active states, metrics |
| `--text-primary` | `#fafafa` | Main text |
| `--text-secondary` | `#a1a1aa` | Supporting text |
| `--text-muted` | `#52525b` | Placeholder, labels |
| `--border` | `rgba(255,255,255,0.08)` | Card borders |

### Animation Presets (Framer Motion)

```jsx
const fadeUp    = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.4 } }
const fadeIn    = { initial: { opacity: 0 },         animate: { opacity: 1 },        transition: { duration: 0.3 } }
const hoverLift = { whileHover: { y: -4 },           transition: { duration: 0.2 } }
```

### Typography Rules
- Headings: `font-bold` / `font-semibold` — no uppercase italic
- Labels / badges: `text-[10px] uppercase tracking-wider`
- Body text: `text-[13px]` or `text-[12px]`
- Monospace: `font-mono` for IDs, codes, script content

---

## Role Access Matrix

| Feature | Guest | User | MC | Admin |
|---|---|---|---|---|
| Browse Voice Library | ✓ | ✓ | ✓ | ✓ |
| Start Practice Session | — | ✓ | ✓ | ✓ |
| View AI Report (basic) | — | ✓ | ✓ | ✓ |
| View AI Report (full) | — | Premium | Premium | ✓ |
| Community Competitions | ✓ | ✓ | ✓ | ✓ |
| MC Profile / Portfolio | — | — | ✓ | ✓ |
| Wallet | — | — | ✓ | ✓ |
| Admin Panel | — | — | — | ✓ |

---

## API Integration

### Backend (REST)

All API calls go through `src/services/api.js` — Axios instance with JWT Bearer token interceptor.

Base URL: `VITE_API_URL` (default `http://localhost:5000/api/v1`)

| Service File | Domain |
|---|---|
| `authService.js` | Login, register, forgot password, update profile |
| `voiceController.js` | Fetch lessons, submit recording, fetch history |
| `academyService.js` | Courses, milestones, enrollment, progress |
| `communityController.js` | Competitions, leaderboard, submissions |
| `paymentService.js` | Create order, verify payment status |
| `mediaService.js` | Cloudinary upload — avatar + portfolio photos |
| `notificationService.js` | Fetch, mark read |
| `mcService.js` | MC profile CRUD |
| `publicService.js` | Public MC listing, search |

### AI Service (Voice Analysis)

Base URL: `VITE_AI_API_URL` (default `http://localhost:8000`)

Called from `src/services/aiService.js`:

```
POST /analyze
  Body: FormData { audio: Blob }
  Returns: { accuracy_score, pitch_data, rhythm_score, ai_feedback, spectrogram_url }
```

### Real-time (WebSocket)

STOMP over SockJS — managed in `src/hooks/useSocket.js`

| Topic | Purpose |
|---|---|
| `/topic/notifications/{userId}` | Push notifications |
| `/topic/messages/{conversationId}` | Live chat messages |
| `/app/chat/send` | Send message |

---

## License

MIT © The MC Hub Team
