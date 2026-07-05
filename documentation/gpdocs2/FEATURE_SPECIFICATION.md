# Peak Hub: Complete Feature Specification & Reverse Engineering Analysis

## 1. Executive Summary
Peak Hub is a React 19 Single Page Application (SPA) built with Vite, Tailwind CSS v4, Zustand, and Supabase. It acts as a comprehensive, distraction-free productivity suite unifying task management, habit tracking, weekly scheduling, markdown note-taking (Nexus), deep work timers (Focus Chamber), and real-time collaborative workspaces. Security is enforced entirely via PostgreSQL Row Level Security (RLS). The application prioritizes optimistic UI updates, local state persistence, and a highly polished "celestial" aesthetic driven by Framer Motion.

---

## 2. Complete Feature Inventory

### Major Features
- Authentication (Email Magic Link, Google OAuth, Session Management)
- User Profiles (Theme, Accent Color, Density Customization)
- Dashboard (Daily Overview, Inbox Triage)
- Task Management (CRUD, Prioritization, Due Dates, Spaces/Lists, Project Scoping)
- Habit Tracking (CRUD, Daily Entry Logging, Streak Calculation, Archive)
- Timetable (24/7 Grid, Drag-and-drop Block Scheduling, Deadlines)
- Focus Chamber (Distraction-free Timer, Celestial Animation, Session Logging, Post-session Reflection)
- Mental Inbox (Quick Capture via Hotkey, Triage to Tasks)
- Nexus Notes (Markdown Editor, Folder Collections, Tagging, Version History, Public URL Sharing)
- Workspaces / Projects (Collaborative Environments, Role-based Access)
- Workspace Chat (Realtime WebSocket Messaging, File Attachments, Soft Deletes)
- Workspace Files (Supabase Storage Integration, Folder Hierarchy)
- Command Palette (Global Keyboard Navigation)

### Micro Features
- **UI/UX**: Dark mode default, theme switching (light/dark/system), compact UI toggle, dynamic accent color injection via CSS variables, loading skeletons, Framer Motion page transitions, celestial orb micro-animations, glassmorphism overlays, custom scrollbars.
- **Interactions**: Global hotkey (`⌘K` for Command Palette, `Ctrl+Space` for Quick Capture), drag-and-drop (Timetable grid), optimistic UI updates (checkboxes, timetable moves, chat messages), debounced database syncing (Nexus autosave, Timetable dragging), empty state fallbacks, responsive mobile hamburger navigation, confirmation dialogs (destructive actions), toast notifications.
- **Data**: Session persistence (`localStorage` for Focus Timer via Zustand `persist`), soft deletion (Habits, Projects, Chat Messages), partial unique indexing (daily notes), cascading deletes (DB level).

---

## 3. Feature Hierarchy

```text
Application
├── Core App Shell
│   ├── Routing (React Router)
│   ├── Sidebar Navigation
│   ├── Command Palette (⌘K)
│   └── Settings Modal (Profile & Appearance)
├── Authentication
│   ├── Login Page
│   ├── Magic Link Handler
│   └── OAuth Redirect
├── Dashboard (Today)
│   ├── Task Summary
│   ├── Habit Streaks
│   └── Inbox Review
├── Tasks (Personal & Workspace)
│   ├── Task List View
│   ├── Task Detail Panel
│   ├── Custom Spaces (Lists)
│   └── Attachments
├── Habits
│   ├── Habit Definition Editor
│   └── Daily Tracking Grid
├── Timetable
│   ├── Weekly Grid View
│   ├── Block Editor (Drag/Drop)
│   └── Deadline Markers
├── Focus Chamber
│   ├── Immersive Timer Overlay
│   ├── Celestial Animation Engine
│   ├── Mental Inbox (Quick Capture)
│   └── Post-session Reflection
├── Nexus (Notes)
│   ├── Document Editor (Markdown)
│   ├── Collections (Folders)
│   ├── Version Snapshotting
│   └── Public Sharing (Read-only)
└── Workspaces
    ├── Project Creation & Invites
    ├── Member Management
    ├── Realtime Chat Channel
    ├── Shared Documents
    └── File Storage Browser
```

---

## 4. Detailed Feature Specifications

### 4.1 Authentication & Profiles
- **Feature**: User Auth & Session
- **Category**: Major / Core
- **Purpose**: Identify users and secure data.
- **How it works**: Uses `@supabase/supabase-js` `auth.signInWithOAuth()` and `auth.signInWithOtp()`. JWTs are automatically attached to all PostgREST requests.
- **Files**: `src/hooks/useAuth.tsx`, `src/pages/LoginPage.tsx`
- **DB Tables**: `auth.users` (Supabase internal)
- **State**: `useAuth` hook exposes session state.
- **Status**: Complete.

- **Feature**: Profile Customization
- **Category**: Major / Personalization
- **Purpose**: Let users personalize the app UI.
- **How it works**: Modifies `profiles` table. Updates apply CSS variables (`--color-accent`) to the DOM `document.documentElement.style`.
- **Files**: `src/components/SettingsModal.tsx`, `src/store/useProfileStore.ts`
- **DB Tables**: `profiles`
- **State**: `useProfileStore` (Zustand)
- **Status**: Complete.

### 4.2 Task Management
- **Feature**: Core Tasks
- **Category**: Major
- **Purpose**: Create and manage to-dos.
- **How it works**: CRUD operations on the `tasks` table. Uses React Query for fetching and caching. Updating a task uses optimistic updates before calling `supabase.from('tasks').update()`.
- **Files**: `src/features/tasks/`
- **DB Tables**: `tasks`, `lists`, `task_attachments`, `project_folders`
- **Dependencies**: `@tanstack/react-query`, `date-fns` (CustomDatePicker)
- **Status**: Complete.

### 4.3 Focus Chamber
- **Feature**: Distraction-Free Deep Work
- **Category**: Major / Differentiator
- **Purpose**: Force user focus via an immersive timer.
- **How it works**: `AppLayout` checks `useStore.getState().isFocusing`. If true, hides standard UI and mounts `FocusEnvironment`. The timer ticks via `setInterval` in a global effect. State is persisted to localStorage so accidental reloads don't kill the timer.
- **Files**: `src/features/focus-chamber/`, `src/store/useStore.ts`
- **DB Tables**: `focus_sessions`, `session_memories`
- **State**: `useStore` (Zustand + Persist)
- **Edge Cases**: Closing the browser tab pauses the timer (relies on initial timestamp vs current timestamp on reload).
- **Status**: Complete.

### 4.4 Timetable
- **Feature**: Weekly Grid Planner
- **Category**: Major
- **Purpose**: Time-blocking.
- **How it works**: Renders a 7x24 CSS Grid. Uses pointer events for drag-and-drop. To prevent Supabase rate-limiting during drag, state is updated in `useWeeklyTimetableStore` immediately, and a debounced function `syncToDatabase` fires 500ms after dragging stops.
- **Files**: `src/features/timetable/`, `src/store/useWeeklyTimetableStore.ts`
- **DB Tables**: `timetable_blocks`, `deadlines`
- **Status**: Complete.

### 4.5 Workspace & Realtime Chat
- **Feature**: Collaborative Projects
- **Category**: Major
- **Purpose**: Team environments with shared resources.
- **How it works**: Queries `projects` where user is in `project_members`. Chat uses Supabase WebSockets (`supabase.channel().on('postgres_changes')`) to listen for `INSERT` on `project_messages`.
- **Files**: `src/features/workspace/`, `src/store/useWorkspaceStore.ts`
- **DB Tables**: `projects`, `project_members`, `project_messages`, `project_invites`
- **Edge APIs**: `send-project-invite` Deno Edge Function (sends emails via Resend).
- **Status**: Complete.

### 4.6 Micro Features
- **Feature**: Quick Capture (Mental Inbox)
- **Category**: Micro
- **How it works**: Global `useEffect` listens for `Ctrl+Space`. Opens `CaptureModal`. Inserts string into `mental_inbox` table. Prevents context switching during Focus sessions.
- **Feature**: Theme CSS Variables
- **Category**: Micro
- **How it works**: `index.css` maps Tailwind `@theme` directives to custom CSS variables, which are injected dynamically by `useProfileStore`.

---

## 5. User Journeys

### The Deep Worker Journey
1. **Authenticated User** logs in and lands on Dashboard.
2. Navigates to **Tasks**, selects high-priority item, clicks "Start Focus".
3. UI transitions to **Focus Chamber**. (Timer starts).
4. User gets distracted by a random thought. Hits `Ctrl+Space`, types thought into **Capture Modal**, hits enter, modal closes. (Thought saved to `mental_inbox`).
5. Timer ends. User prompted for reflection. Types reflection. (Saved to `session_memories`).
6. UI transitions back to Tasks. Task is marked complete.

### The Collaborator Journey
1. **Authenticated User** navigates to **Workspaces**.
2. Clicks "New Project". (Creates `projects` row, sets self as owner in `project_members`).
3. Clicks "Invite". Enters email. (Triggers Edge Function, sends email with secure token).
4. **New User** clicks email link. Redirected to `peakhub.app/invite/TOKEN`. 
5. Prompts for signup. After signup, token is validated, user added to `project_members`.
6. Both users open Chat. Typing a message instantly appears on both screens via WebSockets.

---

## 6. Feature Dependencies

```text
Focus Chamber
└── Requires Global Zustand Store
    └── Requires LocalStorage Persistence
    └── Writes to Focus_Sessions DB Table
        └── Optionally creates Session_Memories DB Table
            └── Links to Notes DB Table

Workspace Invites
└── Requires Supabase Auth
    └── Writes to Project_Invites DB Table
        └── Triggers Supabase Edge Function
            └── Requires RESEND_API_KEY env var
                └── Requires APP_URL env var
```

---

## 7. Hidden Features

- **Public Note Sharing**: Users can generate a public URL slug for a Nexus note. This bypasses standard RLS by querying via a specific unauthenticated endpoint logic or a uniquely unrestricted public table (`public_note_shares` joined to `notes`).
- **Legacy Timetable Blocks**: The database contains `template_blocks` and `scheduled_entries` tables. These are deprecated artifacts from an older iteration of the day-view schedule system, now superseded by the 24/7 `timetable_blocks`. (Dead code/Database bloat).
- **System Templates**: `note_templates` table has an `is_system_template` flag. These are globally readable templates created by the developer, unmodifiable by standard users.

---

## 8. Technical Notes

- **Optimistic UI Mastery**: The app relies heavily on updating local state *before* database confirmation. This is implemented manually in Zustand stores and via React Query's `onMutate` handlers. **Bug Risk**: If Supabase is down, the UI will briefly show success before snapping back to the old state with an error toast.
- **Debouncing**: `useWeeklyTimetableStore.ts` and Nexus editor autosave use debouncing to protect the DB from rate limits.
- **CSS Architecture**: Tailwind v4 is used. The codebase avoids inline styles by mapping Tailwind utility classes to dynamic CSS variables set on the root element.
- **Security**: 100% of data protection is handled by Postgres RLS. There is no backend Node server to validate logic. The client is untrusted.

---

## 9. Missing Features / Technical Debt

- **Missing Offline Mode**: While Zustand `persist` saves the focus timer, React Query is not configured for aggressive offline caching with IndexedDB. The app fails gracefully without a network but cannot queue mutations offline.
- **Missing Pagination**: `project_messages` (chat) fetches recent messages but lacks infinite scrolling for historical data.
- **Tech Debt**: Lingering `style={{}}` tags in early components (mentioned in prior ADRs) that haven't been fully migrated to the Tailwind variable system.
- **Dead Code**: Legacy timetable tables (`template_blocks`) still exist in the schema.

---

## 10. Future Opportunities

- **AI Integration (LLMs)**: The `session_memories` and `mental_inbox` data are primed for an AI feature that summarizes weekly productivity trends or generates insights based on captured thoughts.
- **Desktop App**: Porting the Vite build to Tauri or Electron would allow global OS hotkeys for the Capture Modal, independent of browser focus.
- **Calendar Sync**: Integrating Google Calendar API to populate `timetable_blocks` automatically.

---

## 11. Project Statistics

- **Total Features**: ~50 (Macro + Micro)
- **Major Features**: 10 (Tasks, Habits, Timetable, Focus, Nexus, Workspace, Chat, Dashboard, Profiles, Auth)
- **Database Tables**: 28
- **Edge Functions**: 1 (`send-project-invite`)
- **State Stores**: 5 primary Zustand stores (`useStore`, `useProfileStore`, `useTimetableStore`, `useWeeklyTimetableStore`, `useWorkspaceStore`)
- **Implementation Maturity**: Nearly Complete (Production Ready SPA, lacking offline support and advanced analytics).

---

## 12. Appendix
- **Reference**: `ARCHITECTURE.md` (System flows)
- **Reference**: `DATABASE.md` (Schema definitions)
- **Reference**: `STORES.md` (State shapes)
