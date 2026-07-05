# Codebase Inventory

This document details the languages, frameworks, directory structure, and key libraries used in the Peak Hub application.

## Languages & Frameworks
- **Frontend**: React 19 built with Vite. Written entirely in TypeScript (strict mode).
- **Backend**: Managed PostgreSQL via Supabase. Serverless edge functions written in TypeScript/Deno.
- **Styling**: Tailwind CSS v4 (using the new `@tailwindcss/vite` plugin and `@theme` CSS variable architecture).

## Key Directories

```text
c:\projects\productivity\
├── public/                 # Static assets (favicons, manifest)
├── src/                    # Main source code
│   ├── components/         # Shared UI components (Layout, SettingsModal, DatePicker)
│   ├── features/           # Feature-sliced business logic
│   │   ├── focus-chamber/  # Deep work timer, celestial orb animation
│   │   ├── habits/         # Habit tracking grid and logic
│   │   ├── inbox/          # Mental inbox and quick capture
│   │   ├── lists/          # Custom spaces for task grouping
│   │   ├── nexus/          # Markdown editor, note collections
│   │   ├── tasks/          # Task management, priority flags
│   │   ├── timer/          # Timer utilities (used by focus-chamber)
│   │   ├── timetable/      # Weekly grid planner, drag-and-drop logic
│   │   └── workspace/      # Collaborative projects, chat, files
│   ├── hooks/              # Global custom hooks (useAuth, useCapture)
│   ├── lib/                # Third-party integrations (Supabase client init)
│   ├── pages/              # Top-level route components (Dashboard, Login)
│   ├── store/              # Global Zustand stores (UI state, Profiles)
│   ├── types/              # Global TypeScript interfaces
│   ├── index.css           # Global CSS, Tailwind design system tokens
│   ├── App.tsx             # React Router definitions
│   └── main.tsx            # React root mount
├── supabase/               # Supabase configuration and backend code
│   └── functions/          # Deno edge functions (e.g., send-project-invite)
├── gpdocs/                 # Comprehensive documentation (this folder)
├── package.json            # NPM dependencies and scripts
├── vite.config.ts          # Vite bundler configuration
└── eslint.config.js        # ESLint flat config
```

## Important Files
- `package.json`: Defines project dependencies, scripts (`dev`, `build`), and metadata.
- `src/App.tsx`: The router entry point. Defines all public and protected routes.
- `src/index.css`: Contains all custom CSS variables mapping to the Tailwind v4 `@theme` directive, defining the app's visual identity (colors, typography, animations).
- `src/lib/supabase.ts`: Initializes the `@supabase/supabase-js` client using environment variables.
- `supabase/functions/send-project-invite/index.ts`: The primary serverless function handling email dispatching for collaborative workspaces.

## Third-Party Libraries
Key dependencies listed in `package.json`:

### UI & Styling
- `tailwindcss` (v4.0.0-alpha/beta): Core utility-first CSS framework.
- `framer-motion`: Used extensively for layout animations, modal transitions, and the complex celestial orb in the Focus Chamber.
- `lucide-react`: Standardized, clean SVG icon set used throughout the app.
- `clsx` & `tailwind-merge`: Utilities for conditionally joining and merging Tailwind class names without specificity conflicts.

### State & Data Fetching
- `zustand`: Lightweight global state management. Used for UI state, profile settings, and complex interactive features (Timetable grid). Utilizes `zustand/middleware` for `persist` (saving focus state to localStorage).
- `@tanstack/react-query`: Server state management. Handles caching, background fetching, and optimistic updates for data fetched from Supabase.

### Backend & Database
- `@supabase/supabase-js`: The official client for interacting with Supabase Auth, Postgres, Storage, and Realtime.

### Utilities
- `date-fns`: Date manipulation library, heavily used in the Timetable and Custom Date Picker components.
- `react-router-dom`: SPA routing.
