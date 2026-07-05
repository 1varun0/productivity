# Features Documentation

Peak Hub is divided into several distinct feature modules. This document explains what each feature does, its key components, data flow, and underlying database tables.

## 1. Overview / Dashboard

- **What it does**: The central hub. Provides a high-level summary of the day: pending tasks, habit streaks, and quick access to the mental inbox.
- **Key Components**: `TodayPage` (the main view), `Sidebar` (global navigation).
- **Data Flow**: Uses global stores to pull aggregated data from tasks and habits to display a unified view.
- **Tables Used**: `tasks`, `habits`, `mental_inbox`.

## 2. Tasks & Lists

- **What it does**: Core to-do list functionality. Users can create tasks, assign due dates, flag as priority, and organize them into "Lists" (or spaces). Tasks can also belong to collaborative Projects.
- **Key Components**: Task list views, Task creation inputs, `TaskDetailPanel` (for adding attachments/descriptions).
- **Data Flow**: Fetched via React Query or Zustand. Mutations (complete, delete) update the local cache optimistically before hitting the Supabase API.
- **Tables Used**: `tasks`, `lists`, `task_attachments`.

## 3. Habits

- **What it does**: Allows users to define daily habits and track their completion. Calculates streaks and displays a visual grid of consistency.
- **Key Components**: `HabitsPage`, `HabitTracker` (grid visualization).
- **Data Flow**: The `habits` table stores definitions. Toggling a habit inserts/deletes a row in `habit_entries` for the current date.
- **Tables Used**: `habits`, `habit_entries`.

## 4. Timetable

- **What it does**: A weekly grid planner. Users can define recurring schedule blocks (e.g., Sleep, Deep Work, Classes) across a 7-day, 24-hour view to visualize their week.
- **Key Components**: `TimetablePage`, `WeeklyGrid` (drag and drop interface), `BlockEditor`.
- **Data Flow**: Managed heavily by `useWeeklyTimetableStore`. Changes to the grid are debounced and synced to Supabase to prevent excessive API calls during drag operations.
- **Tables Used**: `timetable_blocks`, `deadlines`.

## 5. Focus Chamber (Focus Mode)

- **What it does**: An immersive, full-screen timer environment for deep work. Hides standard UI elements, displays a "celestial" orb animation that breathes, and blocks distractions.
- **Key Components**: `FocusChamber`, `OrbAnimation`, `FocusEnvironment` (overlay wrapper).
- **Data Flow**: State (time remaining, phase) is tightly managed by `useStore` and persisted to `localStorage` so the timer survives page reloads. Upon completion, a session is saved to the database.
- **Tables Used**: `focus_sessions`, `session_memories`.

## 6. Mental Inbox

- **What it does**: A "parking lot" for distracting thoughts. If a user thinks of something while in the Focus Chamber, they can quickly capture it here to review later, preventing context switching.
- **Key Components**: `CaptureModal` (accessible via keyboard shortcut), Inbox review panel.
- **Data Flow**: Thoughts are inserted quickly. Later, users review the inbox and can convert entries into full `tasks`.
- **Tables Used**: `mental_inbox`, `captures`.

## 7. Nexus (Notes)

- **What it does**: A markdown-based note-taking environment. Supports rich text, tagging, folder-like collections, and public sharing via unique links.
- **Key Components**: `NexusView`, Markdown Editor, Document Sidebar.
- **Data Flow**: Notes are saved automatically as the user types (debounced). Supports creating version snapshots.
- **Tables Used**: `notes`, `note_collections`, `nexus_tags`, `note_versions`, `public_note_shares`.

## 8. Workspace (Projects)

- **What it does**: Collaborative environments for teams. Workspaces have their own tasks, real-time chat channels, document repositories, and file storage.
- **Key Components**: `WorkspacePage`, `ChatWindow`, `ProjectSettings`, Invite Modals.
- **Data Flow**: Chat uses Supabase Realtime (WebSockets) to broadcast messages to all online members. File uploads use Supabase Storage.
- **Tables Used**: `projects`, `project_members`, `project_invites`, `project_messages`, `project_docs`, `project_folders`, `project_files`.

## 9. Profile & Settings

- **What it does**: Manages user identity and application appearance (accent colors, compact mode, light/dark theme).
- **Key Components**: `SettingsModal`.
- **Data Flow**: Controlled by `useProfileStore`. Changes instantly update CSS variables in the DOM for immediate feedback, and sync to the database in the background.
- **Tables Used**: `profiles`.
