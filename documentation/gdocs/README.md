# Peak Hub — Productivity App

> A premium, dark-mode productivity suite combining task management, habit tracking, note-taking (Nexus), weekly timetable planning, immersive focus sessions (Focus Chamber), and collaborative project workspaces — powered by React 19, Vite 8, Supabase, and Zustand.

---

## Quick Start Tutorial

This guide walks you through setting up the local development environment from a fresh clone.

### Prerequisites

| Tool | Version | Check |
|---|---|---|
| Node.js | 20.x or later | `node --version` |
| npm | 10.x or later | `npm --version` |
| Git | Any recent | `git --version` |
| A Supabase project | Free tier works | [supabase.com/dashboard](https://supabase.com/dashboard) |

### Step 1: Clone the Repository

```bash
git clone <your-repo-url> productivity
cd productivity
```

### Step 2: Install Dependencies

```bash
npm install
```

This installs all production and development dependencies listed in `package.json`, including React 19, Vite 8, Tailwind CSS v4, Zustand, Framer Motion, Supabase client, TanStack React Query, and more.

### Step 3: Configure Environment Variables

Create a `.env.local` file in the project root (it may already exist):

```bash
# .env.local
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

**Where to find these values:**
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Settings → API**
4. Copy the **Project URL** → `VITE_SUPABASE_URL`
5. Copy the **anon / public** key → `VITE_SUPABASE_ANON_KEY`

> ⚠️ **Important:** The `VITE_` prefix is required for Vite to expose these variables to the browser.

### Step 4: Set Up Supabase Auth

In your Supabase Dashboard:

1. Go to **Authentication → Providers**
2. Enable **Google** OAuth:
   - Add your Google OAuth client ID and secret
   - Set the redirect URL to `http://localhost:5173` (Vite's default port)
3. **Email (Magic Link)** is enabled by default

### Step 5: Set Up the Database Schema

The database requires 28 tables with Row Level Security (RLS). If you're starting fresh, apply the migrations from the `supabase/` directory, or use the Supabase MCP tools to verify your schema matches the tables documented in [ARCHITECTURE.md](./ARCHITECTURE.md).

Key tables: `profiles`, `tasks`, `habits`, `habit_entries`, `notes`, `timetable_blocks`, `projects`, `project_members`, `project_messages`, `mental_inbox`, `focus_sessions`, `lists`, `captures`, `deadlines`.

### Step 6: Start the Development Server

```bash
npm run dev
```

This starts the Vite dev server with Hot Module Replacement (HMR). By default it runs on:

```
http://localhost:5173
```

Open this URL in your browser. You should see the **login page**. Sign in with Google or a magic link to access the app.

### Step 7: Verify Everything Works

After signing in, you should see:

- ✅ **Sidebar** with navigation: Overview, Habits, Timetable, Nexus
- ✅ **Overview page** with task list and mental inbox
- ✅ **Settings modal** (click Profile in sidebar bottom)
- ✅ **Command palette** with `Ctrl+K` / `⌘K`

---

## Available Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start Vite dev server (port 5173) |
| `npm run build` | TypeScript check + production build to `dist/` |
| `npm run lint` | Run ESLint across the project |
| `npm run preview` | Preview the production build locally |

---

## Project Structure

```
├── src/
│   ├── main.tsx              # Root: StrictMode → Router → QueryClient → Auth → App
│   ├── App.tsx               # Route declarations
│   ├── index.css             # Design tokens + Tailwind @theme
│   ├── components/           # Shared components (layout, modals, icons)
│   ├── features/             # Feature modules (10 domains)
│   │   ├── captures/         # Quick thought capture
│   │   ├── focus-chamber/    # Celestial focus timer
│   │   ├── habits/           # Habit tracker
│   │   ├── inbox/            # Mental inbox
│   │   ├── lists/            # Task lists / spaces
│   │   ├── nexus/            # Note editor
│   │   ├── tasks/            # Task management
│   │   ├── timer/            # Focus environment
│   │   ├── timetable/        # Weekly planner
│   │   └── workspace/        # Collaborative projects
│   ├── hooks/                # Auth hook, capture hook
│   ├── lib/                  # Supabase client singleton
│   ├── pages/                # Top-level pages
│   ├── store/                # Global Zustand stores
│   └── types/                # Shared TypeScript types
├── supabase/functions/       # Edge Functions (Deno)
└── gdocs/                    # Documentation suite
```

---

## Documentation

| Document | Purpose |
|---|---|
| [AGENTS.md](./gdocs/AGENTS.md) | AI coding rules, tech stack, negative rules |
| [DESIGN.md](./gdocs/DESIGN.md) | Visual identity, design tokens, component states |
| [ARCHITECTURE.md](./gdocs/ARCHITECTURE.md) | C4 diagrams, data model, state management |
| [ADR-0001](./gdocs/docs/adr/0001-initial-architecture.md) | Architecture decision records |
| [llms.txt](./gdocs/llms.txt) | AI-readable project index |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + TypeScript 6 |
| Build | Vite 8 |
| Styling | Tailwind CSS v4 |
| State | Zustand 5 + TanStack React Query 5 |
| Animation | Framer Motion 12 |
| Backend | Supabase (Postgres, Auth, Storage, Realtime, Edge Functions) |
| Routing | React Router DOM 7 |
| Icons | Lucide React |
| Fonts | Inter, JetBrains Mono (Google Fonts) |
