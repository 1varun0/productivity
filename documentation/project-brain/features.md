# Features

## 1. Authentication
- Magic link login
- Google SSO
- Protected routing architecture (/app vs /login)
- Session persistence

## 2. Quick Capture
- Global modal triggered by `Cmd+K` (or `Ctrl+K`).
- Submits directly to the `tasks` database table.
- Animated with Framer Motion (spring physics).

## 3. Tasks / Dashboard
- Displays priority tasks.
- TanStack Query used for optimistic UI updates on completion and deletion.
- Empty states and skeleton loading screens.
- Inline task deletion (hover state).

## 4. Focus Timer
- Pomodoro-style 25-minute timer.
- Ambient breathing background animations for a calming UX.
- Saves completed sessions to `focus_sessions` table in Supabase.
- Soft, tactile buttons.

## 5. Navigation
- Desktop: Premium minimal sidebar with hover depth.
- Mobile: Premium glassmorphism bottom navigation bar.
