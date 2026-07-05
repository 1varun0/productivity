# ADR-0001: Initial Architecture Decisions

- **Status:** Accepted
- **Date:** 2026-07-01
- **Decision Makers:** Solo developer (vibe-coded)

## Context and Problem Statement

A personal productivity application ("Peak Hub") was needed to consolidate task management, habit tracking, note-taking, timetable planning, focus sessions, and collaborative project workspaces into a single, premium dark-mode interface. The application was built iteratively ("vibe-coded"), meaning architectural decisions were made pragmatically during development rather than upfront.

This ADR retroactively documents the key technology choices that shaped the system.

---

## Decision Drivers

- **Rapid prototyping** — solo developer needing fast iteration cycles
- **Premium UI quality** — dark-mode, glassmorphism, micro-animations, celestial theme
- **Real-time collaboration** — workspace chat, presence indicators
- **Zero backend maintenance** — no custom servers to deploy or manage
- **Type safety** — catch errors at compile time, improve DX
- **Offline resilience** — optimistic UI updates for snappy feel

---

## Decisions

### Decision 1: Vite + React SPA (no SSR framework)

**Chosen:** Vite 8 with React 19 as a client-side SPA

**Considered Options:**
| Option | Pros | Cons |
|---|---|---|
| **Vite SPA** ✅ | Fastest HMR, simple deployment, no server needed | No SSR, no server-side data fetching |
| Next.js | SSR/SSG, API routes, mature ecosystem | Overkill for auth-gated app, adds server complexity |
| Remix | Nested routing, server loaders | Server-dependent, adds deployment complexity |

**Consequences:**
- (+) Extremely fast development feedback loop
- (+) Simple static hosting (any CDN)
- (+) No server maintenance
- (−) No SEO for authenticated pages (acceptable — app is fully auth-gated)
- (−) Initial load fetches all JS (mitigated by Vite's code splitting)

---

### Decision 2: Supabase as Backend-as-a-Service

**Chosen:** Supabase (Postgres + Auth + Storage + Realtime + Edge Functions)

**Considered Options:**
| Option | Pros | Cons |
|---|---|---|
| **Supabase** ✅ | Postgres, built-in auth, realtime, storage, RLS, free tier | Vendor lock-in, less control over infra |
| Firebase | Real-time DB, mature ecosystem | NoSQL (poor for relational data), vendor lock-in |
| Custom Express/Fastify API | Full control | Massive maintenance burden for solo dev |
| Convex | Real-time, type-safe | Newer, smaller community |

**Consequences:**
- (+) Zero backend code for CRUD — client talks directly to Postgres via RLS
- (+) Built-in auth with Google OAuth + Magic Link
- (+) Realtime subscriptions for workspace chat
- (+) Edge Functions for server-side logic (email sending)
- (+) All 28 tables have RLS enabled — security at the database layer
- (−) Vendor lock-in to Supabase's API surface
- (−) Complex RLS policies can be hard to debug

---

### Decision 3: Zustand for Client State Management

**Chosen:** Zustand 5 with `persist` middleware

**Considered Options:**
| Option | Pros | Cons |
|---|---|---|
| **Zustand** ✅ | Minimal boilerplate, no providers needed, tiny bundle | Less opinionated than Redux |
| Redux Toolkit | Battle-tested, devtools, middleware | Boilerplate-heavy for this app size |
| Jotai/Recoil | Atomic state, React-native feel | Less suited for complex domain stores |
| React Context only | No dependencies | Performance issues at scale, prop drilling |

**Consequences:**
- (+) Very low boilerplate — stores are plain functions
- (+) `persist` middleware enables focus session recovery across page reloads
- (+) Feature-scoped stores (per feature module) keep concerns separated
- (+) No provider wrappers needed (except for Auth context)
- (−) Optimistic update logic is repeated across stores (could be abstracted)
- (−) No built-in devtools (though Zustand devtools middleware is available)

---

### Decision 4: Tailwind CSS v4 for Styling

**Chosen:** Tailwind CSS 4.3 with the `@tailwindcss/vite` plugin

**Considered Options:**
| Option | Pros | Cons |
|---|---|---|
| **Tailwind CSS v4** ✅ | Utility-first, design tokens via `@theme`, zero-config | Verbose class strings, learning curve |
| Vanilla CSS / CSS Modules | Full control, no dependencies | Slower iteration, harder to maintain consistency |
| Styled Components | Component-scoped, dynamic styles | Runtime cost, different paradigm |
| shadcn/ui | Pre-built accessible components | Opinionated, may conflict with celestial theme |

**Consequences:**
- (+) Rapid UI development with consistent spacing/colors
- (+) `@theme` block in CSS enables design tokens without JS
- (+) `clsx` + `tailwind-merge` for clean conditional classes
- (+) Responsive design via `md:` and `lg:` prefixes
- (−) Some components accumulated inline `style={{ }}` with hardcoded hex values (tech debt)
- (−) Long className strings can be hard to read

---

### Decision 5: Framer Motion for Animations

**Chosen:** Framer Motion 12

**Considered Options:**
| Option | Pros | Cons |
|---|---|---|
| **Framer Motion** ✅ | Declarative API, `AnimatePresence` for exit animations, spring physics | Bundle size (~30KB) |
| CSS transitions only | Zero bundle cost | No exit animations, limited orchestration |
| React Spring | Spring physics, lightweight | Less ergonomic API |
| GSAP | Powerful, timeline-based | Imperative API, licensing |

**Consequences:**
- (+) `AnimatePresence` enables smooth page/modal exit animations
- (+) Spring-based animations feel natural and premium
- (+) Integrates cleanly with React's declarative model
- (+) Used extensively for the celestial Focus Chamber UI
- (−) Adds ~30KB to bundle
- (−) Overuse can cause layout thrashing if not careful

---

### Decision 6: Feature-Sliced Directory Structure

**Chosen:** `src/features/<domain>/` with internal `components/`, `hooks/`, `store/`, `types.ts`

**Considered Options:**
| Option | Pros | Cons |
|---|---|---|
| **Feature-sliced** ✅ | Colocation, clear boundaries, scalable | More directories to navigate |
| Flat by type (`components/`, `hooks/`) | Simple for small apps | Doesn't scale, cross-cutting concerns |
| Atomic Design | Systematic component hierarchy | Over-engineering for this project |

**Consequences:**
- (+) Each feature is self-contained and independently navigable
- (+) Easy to add new features without touching existing code
- (+) Stores are scoped to features, reducing global state surface
- (−) Some cross-feature dependencies exist (e.g., tasks ↔ timetable)
- (−) Shared components in `src/components/` can become a catch-all

---

## Summary

| Decision | Choice | Primary Driver |
|---|---|---|
| Frontend Framework | Vite + React 19 SPA | Fast iteration, no server needed |
| Backend | Supabase (full platform) | Zero-maintenance, built-in auth/realtime |
| State Management | Zustand 5 | Minimal boilerplate, persistence |
| Styling | Tailwind CSS v4 | Rapid UI, design tokens |
| Animation | Framer Motion 12 | Premium feel, exit animations |
| Architecture | Feature-sliced modules | Scalability, colocation |
