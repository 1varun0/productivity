# AGENTS.md — Global AI Coding Rules

> **Canonical rules file for the Productivity App (codename: "Peak Hub").**
> All AI coding agents MUST read and obey this file before generating any code.

---

## 1. Project Identity

| Key        | Value                                    |
| ---------- | ---------------------------------------- |
| Name       | Productivity (Peak Hub)                  |
| Type       | Single-Page Application                  |
| Language   | TypeScript (strict, ES2023 target)       |
| Runtime    | Browser (Vite 8 dev server)              |
| Backend    | Supabase (Postgres + Auth + Storage + Edge Functions + Realtime) |
| Hosting    | Static SPA (Vite build output in `dist/`) |

---

## 2. Tech Stack — Canonical Versions

| Layer              | Technology                  | Version   |
| ------------------ | --------------------------- | --------- |
| Framework          | React                       | 19.x      |
| Build Tool         | Vite                        | 8.x       |
| Language           | TypeScript                  | 6.x       |
| Styling            | Tailwind CSS (v4)           | 4.3.x     |
| CSS Utilities      | clsx, tailwind-merge        | latest    |
| State Management   | Zustand                     | 5.x       |
| Server State       | TanStack React Query        | 5.x       |
| Routing            | React Router DOM            | 7.x       |
| Animation          | Framer Motion               | 12.x      |
| Icons              | Lucide React                | 1.x       |
| Date Utilities     | date-fns                    | 4.x       |
| Markdown           | react-markdown + remark-gfm | latest    |
| Backend Client     | @supabase/supabase-js       | 2.x       |
| Font Loading       | Google Fonts (via `<link>`) | —         |

---

## 3. Directory Structure

```
c:\projects\productivity\
├── index.html                    # SPA entry point
├── vite.config.ts                # Vite + Tailwind + path aliases
├── tsconfig.app.json             # TypeScript config (target: es2023)
├── package.json
├── .env.local                    # VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
│
├── public/                       # Static assets (favicon, etc.)
│
├── src/
│   ├── main.tsx                  # Root render: StrictMode → BrowserRouter → QueryClientProvider → AuthProvider → App
│   ├── App.tsx                   # Route declarations
│   ├── App.css                   # Legacy styles (from Vite scaffold — do NOT extend)
│   ├── index.css                 # Design system tokens + Tailwind @theme + base styles
│   │
│   ├── assets/                   # Static assets imported by components
│   │
│   ├── components/               # Shared, cross-feature components
│   │   ├── layout/               # AppLayout, Sidebar, Topbar, BottomBar, ProtectedRoute
│   │   ├── CommandPalette/       # ⌘K command palette
│   │   ├── CaptureModal.tsx      # Quick-capture modal
│   │   ├── SettingsModal.tsx     # Profile & appearance settings
│   │   ├── CustomDatePicker.tsx  # Shared date picker
│   │   └── icons/                # Custom SVG icon components
│   │
│   ├── features/                 # Feature-sliced modules
│   │   ├── captures/             # Quick thought capture
│   │   ├── focus-chamber/        # Celestial focus timer with orbital UI
│   │   ├── habits/               # Habit tracking + streak grid
│   │   ├── inbox/                # Mental inbox / parking lot
│   │   ├── lists/                # Task lists / spaces
│   │   ├── nexus/                # Note editor (markdown, templates, collections, sharing)
│   │   ├── tasks/                # Task management (CRUD, detail panel, attachments)
│   │   ├── timer/                # Focus environment orchestration
│   │   ├── timetable/            # Weekly timetable planner
│   │   └── workspace/            # Collaborative projects (chat, docs, files, invites)
│   │
│   ├── hooks/                    # Global hooks (useAuth, useCapture)
│   ├── lib/                      # Third-party wrappers (supabase.ts)
│   ├── pages/                    # Top-level page components (TodayPage, LoginPage, PublicNotePage)
│   ├── store/                    # Global Zustand stores
│   ├── types/                    # Shared TypeScript types
│   └── utils/                    # (currently empty — place pure helper functions here)
│
├── supabase/
│   └── functions/                # Supabase Edge Functions (Deno)
│       └── send-project-invite/  # Email invite sender
│
└── gdocs/                        # This documentation suite
```

---

## 4. Architectural Conventions

### 4.1 Feature Slices

Every domain feature lives under `src/features/<feature>/` and follows this internal structure:

```
features/<feature>/
├── components/     # React components scoped to the feature
├── hooks/          # Feature-specific custom hooks
├── store/          # Feature-scoped Zustand store(s)
├── types.ts        # Feature-specific TypeScript types
├── styles/         # Feature-specific CSS (if any)
├── utils/          # Feature-specific pure helpers
└── data/           # Static constants / seed data
```

**Not every feature has all sub-folders.** Only create what is needed.

### 4.2 State Management

- **Global UI state** → `src/store/useStore.ts` (Zustand with `persist` middleware)
- **Feature-scoped state** → `src/features/<feature>/store/use<Feature>Store.ts` (Zustand)
- **Server state** → TanStack React Query (or direct Supabase calls inside Zustand stores)
- **Auth state** → React Context (`src/hooks/useAuth.tsx`)
- **Profile/appearance** → `src/store/useProfileStore.ts` (Zustand, synced to Supabase `profiles` table)
- **Component-local UI state** → `useState` / `useReducer`

### 4.3 Supabase Patterns

- The Supabase client is a **singleton** at `src/lib/supabase.ts`.
- Environment variables are prefixed with `VITE_` for Vite exposure.
- All database operations use **optimistic updates** with rollback on error.
- Soft deletes use an `archived` boolean column; hard deletes are reserved for junction/join tables.
- All tables have **RLS enabled**. Always verify RLS policies after schema changes.
- Auth providers: Google OAuth, Magic Link (email OTP).

### 4.4 Styling

- **Tailwind CSS v4** with the `@tailwindcss/vite` plugin.
- Design tokens are declared in `src/index.css` under `@theme { }` and `:root { }`.
- Use the `@/` path alias (maps to `src/`) for all imports.
- Prefer Tailwind utility classes inline. Use `clsx()` and `tailwind-merge` (`twMerge`) for conditional class merging.
- Custom keyframe animations are defined in `@theme { }`, not in component files.

### 4.5 Component Conventions

- Functional components only. No class components.
- Named exports for all components (no `export default` except `App.tsx`).
- Framer Motion `<AnimatePresence>` wraps all conditional renders that need exit animations.
- Modals use a portal-like pattern: rendered inside `<AppLayout>` children, controlled by Zustand booleans.

### 4.6 Routing

- React Router DOM v7 with `<BrowserRouter>`.
- `<ProtectedRoute>` is an `<Outlet>`-based wrapper that redirects unauthenticated users to `/login`.
- Public routes: `/login`, `/share/:slug`, `/invite/:token`.
- All authenticated routes are wrapped in `<AppLayout>` which provides Sidebar, Topbar, BottomBar, and the Focus Environment overlay.

---

## 5. Negative Rules — What NOT To Do

> These rules exist to prevent regressions, hallucinations, and inconsistencies.

### 5.1 Libraries — Do NOT Use

| ❌ Do NOT use           | ✅ Use instead                            | Why                                      |
| ----------------------- | ----------------------------------------- | ---------------------------------------- |
| Redux / Redux Toolkit   | Zustand                                   | Already established; simpler API         |
| Styled Components / Emotion | Tailwind CSS v4                      | Entire design system is Tailwind-based   |
| Axios                   | Supabase client / `fetch`                 | No REST API layer exists                 |
| MUI / Chakra / Ant Design | Custom components + Tailwind            | Design is bespoke, premium dark-mode     |
| Moment.js               | date-fns                                  | Already established; tree-shakeable      |
| SWR                     | TanStack React Query                      | Already established                      |
| Next.js / Remix         | Vite SPA                                  | App is a client-side SPA, no SSR needed  |
| Tailwind CSS v3         | Tailwind CSS v4                           | v4 is already configured                 |
| CSS Modules             | Tailwind utility classes                  | Consistency with existing codebase       |

### 5.2 Patterns — Do NOT Introduce

- **Do NOT** create a separate REST API layer. All data goes through the Supabase client directly.
- **Do NOT** use `useEffect` for data fetching in new code. Use React Query or invoke Zustand store actions.
- **Do NOT** hard-delete rows from Supabase. Use `archived = true` for user-facing entities.
- **Do NOT** store secrets or API keys in code. Use `.env.local` with `VITE_` prefix.
- **Do NOT** add new Google Fonts via npm. Load them via `<link>` tags in `index.html`.
- **Do NOT** create global CSS files beyond `index.css`. Feature-specific CSS goes in `features/<feature>/styles/`.
- **Do NOT** use `any` type in new code. Provide explicit types or use `unknown` with type guards.
- **Do NOT** use `default export` for components (except `App.tsx`).
- **Do NOT** bypass RLS. Always ensure new tables have RLS enabled and policies defined.
- **Do NOT** use inline `style={{ }}` for design-token colors. Use Tailwind classes mapped to CSS variables.

### 5.3 File Naming

- Components: `PascalCase.tsx`
- Hooks: `useCamelCase.ts`
- Stores: `useCamelCaseStore.ts`
- Types: `camelCase.ts` or `types.ts`
- Utilities: `camelCase.ts`

### 5.4 Deprecated Patterns in This Codebase

- `App.css` is a leftover from the Vite scaffold. Do NOT add styles there.
- The `template_blocks` + `scheduled_entries` tables represent a legacy day-view timetable. The newer system uses `timetable_blocks` (24-hour weekly grid).
- Some components use inline `style={{ }}` with hardcoded hex colors — this is tech debt, not a pattern to follow.

---

## 6. Environment Variables

| Variable                  | Purpose                        | Required |
| ------------------------- | ------------------------------ | -------- |
| `VITE_SUPABASE_URL`       | Supabase project API URL       | Yes      |
| `VITE_SUPABASE_ANON_KEY`  | Supabase publishable anon key  | Yes      |

---

## 7. Commands

| Command            | Purpose                              |
| ------------------ | ------------------------------------ |
| `npm run dev`      | Start Vite dev server with HMR       |
| `npm run build`    | TypeScript check + production build  |
| `npm run lint`     | Run ESLint                           |
| `npm run preview`  | Preview production build locally     |
