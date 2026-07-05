# Exhaustive Codebase Audit & Feature Breakdown

This document is a comprehensive, granular audit of every feature, interaction, and data operation in the Peak Hub application as of July 2026.

---

## 1. Overview / Dashboard

### 1. What it does
The Dashboard (Today View) is the central landing page. It aggregates the user's high-priority tasks for the day, active habit streaks, and provides quick triage access to the Mental Inbox.

### 2. Every UI interaction
- **"Good Morning/Afternoon/Evening" text**: Dynamically calculates greeting based on local time.
- **Task Summary Cards**: 
  - Click a task: Opens the Task Detail slide-over panel.
  - Checkbox toggle: Instantly marks the task complete (optimistic UI), firing a strike-through animation.
- **Habit Streak Overview**: 
  - Click a habit pill: Redirects to the Habits page.
- **Mental Inbox Triage Section**:
  - Click "Convert to Task": Opens task creation modal pre-filled with the thought.
  - Click "Dismiss": Soft-deletes the thought from the inbox.
- **Global Command Palette Button (⌘K)**: Opens search overlay.

### 3. Data operations
- **Fetches**: 
  - `tasks` where `completed = false` AND `due_date <= today` OR `is_priority = true`.
  - `habits` joined with `habit_entries` to calculate current streaks.
  - `mental_inbox` where `status = 'unresolved'`.
- **Realtime**: None active on dashboard specifically.
- **Optimistic Updates**: Task completion and inbox dismissal update the local React Query cache instantly before DB confirmation.

### 4. Business logic
- Date math determines if a task is overdue vs due today.
- Greeting time boundaries (5am=Morning, 12pm=Afternoon, 5pm=Evening).

### 5. Cross-feature connections
- Connects to **Tasks** (displays them).
- Connects to **Habits** (displays streaks).
- Connects to **Focus Chamber** (Mental inbox captures originate there).

### 6. Edge cases handled
- **Empty States**: If no tasks due today, displays "You're all caught up!" illustration.
- **Loading State**: Displays pulsing skeleton cards for tasks and habits while React Query fetches.

### 7. Exact file locations
- Page: `src/pages/TodayPage.tsx`
- Components: `src/features/dashboard/components/TaskSummary.tsx`, `src/features/dashboard/components/InboxTriage.tsx`
- Hooks: `src/hooks/useTasks.ts`, `src/hooks/useHabits.ts`

---

## 2. Tasks & Lists

### 1. What it does
Comprehensive to-do management allowing categorization into personal spaces ("Lists"), prioritization, and due dates.

### 2. Every UI interaction
- **"Add Task" Input (Top of list)**:
  - Type text & press `Enter`: Submits task.
  - Click `+` icon inside input: Opens full creation modal for detailed entry.
- **Task Row**:
  - Checkbox click: Toggles completion (triggers Framer Motion exit animation if filtering by active).
  - Star icon click: Toggles `is_priority` boolean.
  - Row click: Opens `TaskDetailPanel` overlay.
- **Task Detail Panel (Slide-over)**:
  - Title input: Inline editing (blur to save).
  - Description textarea: Markdown supported.
  - Date picker button: Opens `CustomDatePicker`.
  - List selector dropdown: Moves task to a different space.
  - File upload button: Triggers OS file picker. Drag-and-drop file onto panel to upload.
  - Delete button (Trash icon): Opens confirmation modal.
- **List Sidebar Navigation**:
  - Click "New List": Opens tiny modal for Name, Color, Icon.
  - Click a list: Filters central view to that `list_id`.

### 3. Data operations
- **Saved to DB**: `tasks`, `lists`, `task_attachments`.
- **Fetched**: Tasks via React Query, filtered by `list_id` or `completed` status.
- **Caching**: React Query invalidates the `['tasks']` query key upon mutations.

### 4. Business logic
- Attachments are uploaded to Supabase Storage bucket `task-files`, returning a public URL saved to `task_attachments`.

### 5. Cross-feature connections
- Tasks can be assigned a `project_id`, linking them to the **Workspace** domain.
- **Focus Chamber** allows selecting a specific task to focus on.

### 6. Edge cases handled
- Uploading a file larger than 5MB triggers a toast error.
- Deleting a list prompts "Delete all tasks inside, or move to inbox?".

### 7. Exact file locations
- Page: `src/features/tasks/TasksPage.tsx`
- Components: `src/features/tasks/components/TaskRow.tsx`, `src/features/tasks/components/TaskDetailPanel.tsx`
- Types: `src/features/tasks/types.ts`

---

## 3. Habits

### 1. What it does
Visual daily habit tracker using a GitHub-style contribution grid to build streaks.

### 2. Every UI interaction
- **"New Habit" Button**: Opens modal (Name, Color Picker).
- **Habit Row**:
  - Drag handle (left): Reorder habits (updates `position`).
  - Three-dot menu: Edit color/name, Archive.
- **Grid Squares**:
  - Hover: Displays tooltip with exact date (e.g., "Mon, Jul 1").
  - Click: Toggles the square (fills with habit color or empties).
  - Disabled state: Cannot click future dates.

### 3. Data operations
- **Saved to DB**: `habits` (definitions), `habit_entries` (completion logs).
- **Fetched**: Fetches all active habits and their entries for the visible date range (usually current month).
- **Optimistic Updates**: Grid click immediately paints the square locally while the DB `INSERT/DELETE` happens in background.

### 4. Business logic
- **Streak Calculation**: Iterates backwards from today through `habit_entries`. Breaks streak if a day is missing.
- **Unique Constraint**: DB enforces `UNIQUE(habit_id, completed_date)` to prevent double-logging.

### 5. Cross-feature connections
- Dashboard displays top streaks.

### 6. Edge cases handled
- Future date clicking is blocked by UI (cursor-not-allowed).
- Empty state: "No habits yet. Start a new routine."

### 7. Exact file locations
- Page: `src/features/habits/HabitsPage.tsx`
- Components: `src/features/habits/components/HabitGrid.tsx`, `src/features/habits/components/GridSquare.tsx`

---

## 4. Timetable

### 1. What it does
A 24/7 weekly drag-and-drop grid planner for scheduling blocks of time.

### 2. Every UI interaction
- **Grid Area**:
  - Click & Drag on empty slot: Draws a new block.
  - Hover block: Shows resize handles (top/bottom).
  - Drag block center: Moves block to different day/hour.
  - Drag block handle: Changes `duration`.
  - Click block: Opens popover to edit name, category, color.
- **Toolbar**:
  - Undo/Redo buttons: Traverses `useWeeklyTimetableStore.history`.
  - "Add Deadline" button: Drops a pin on a specific day.

### 3. Data operations
- **Saved to DB**: `timetable_blocks`, `deadlines`.
- **Debouncing**: To prevent DB rate limits during dragging (which fires 60fps), changes are saved to Zustand instantly, but `syncToDatabase` only fires 500ms after the mouse is released.

### 4. Business logic
- Collision detection (visual warning if blocks overlap).
- DB `CHECK` constraints ensure `day` is 0-6 and `start_hour` is 0-23.

### 5. Cross-feature connections
- None currently (standalone feature).

### 6. Edge cases handled
- Blocks cannot be dragged past 11:59 PM (Sunday). Boundary constraints.

### 7. Exact file locations
- Page: `src/features/timetable/TimetablePage.tsx`
- Components: `src/features/timetable/components/WeeklyGrid.tsx`, `src/features/timetable/components/Block.tsx`
- Store: `src/store/useWeeklyTimetableStore.ts`

---

## 5. Focus Chamber

### 1. What it does
An immersive, full-screen timer environment designed to block distractions using a breathing celestial animation.

### 2. Every UI interaction
- **Setup Screen**:
  - Input: "What is your intention?"
  - Dropdown: Select Task (optional).
  - Slider/Buttons: Select duration (15m, 25m, 50m, custom).
  - "Enter Chamber" Button: Starts timer.
- **Active Chamber**:
  - Mouse movement: Reveals hidden "Pause" and "End early" buttons (fade out when idle).
  - `Ctrl+Space` shortcut: Opens Quick Capture (Mental Inbox) overlay without leaving the timer.
- **Completion Screen**:
  - Textarea: Post-session reflection note.
  - "Save Session" button.

### 3. Data operations
- **Saved to DB**: `focus_sessions`, `session_memories` (if reflection added), `mental_inbox` (if capture used).
- **State**: Uses Zustand `persist` middleware to save the active timer to `localStorage`.

### 4. Business logic
- The timer calculation compares `started_at` to `Date.now()` on every tick to ensure accuracy even if the browser tab is throttled/backgrounded.

### 5. Cross-feature connections
- Connects to **Tasks** (links session to task).
- Connects to **Nexus** (saves reflection as a note).

### 6. Edge cases handled
- If user refreshes the page, the timer restores accurately from `localStorage`.

### 7. Exact file locations
- Components: `src/features/focus-chamber/FocusChamber.tsx`, `src/features/focus-chamber/OrbAnimation.tsx`
- Store: `src/store/useStore.ts` (manages `isFocusing` state)

---

## 6. Nexus (Notes)

### 1. What it does
Markdown-based document editor for knowledge management, featuring collections and public sharing.

### 2. Every UI interaction
- **Sidebar**:
  - "New Note" button.
  - "New Collection" (Folder) button.
  - Drag note into collection folder.
- **Editor**:
  - Markdown text area: Typing auto-formats (e.g., `#` becomes H1).
  - Top Bar: Pin toggle, Share button.
- **Share Modal**:
  - Toggle "Enable Public Link".
  - Click "Copy URL" (writes to clipboard).

### 3. Data operations
- **Saved to DB**: `notes`, `note_collections`, `note_collection_items`, `public_note_shares`.
- **Autosave**: Content updates are debounced by 1.5 seconds before calling Supabase `.update()`.

### 4. Business logic
- Public sharing creates a cryptographically random slug in `public_note_shares` and bypasses RLS for read-only access.

### 5. Cross-feature connections
- Post-focus reflections automatically generate `notes`.

### 6. Edge cases handled
- Network disconnect during autosave shows a "Sync failed - Saving locally" warning.

### 7. Exact file locations
- Page: `src/features/nexus/NexusView.tsx`
- Components: `src/features/nexus/components/MarkdownEditor.tsx`, `src/pages/PublicNotePage.tsx`

---

## 7. Workspace (Projects)

### 1. What it does
Collaborative environments containing scoped tasks, real-time chat, and shared files.

### 2. Every UI interaction
- **Project Switcher (Sidebar)**: Dropdown to switch contexts between workspaces.
- **Chat Interface**:
  - Text input: Type message, `Enter` to send.
  - Clip icon: Attach file to message.
  - Message hover: Three-dot menu -> Delete (soft delete).
- **Member Settings**:
  - "Invite Member" input (email).
  - Role dropdown: Change existing member from Viewer to Member.

### 3. Data operations
- **Saved to DB**: `projects`, `project_members`, `project_messages`, `project_invites`, `project_files`.
- **Realtime**: Active WebSocket subscription to `project_messages` filtered by `project_id`.

### 4. Business logic
- **Edge Function**: Inviting a user triggers `send-project-invite` to dispatch an email via Resend.
- **RLS**: Extreme isolation. Users cannot even read the name of a project they are not a member of.

### 5. Cross-feature connections
- Workspace tasks appear in the global Task view but are badged with the Project name.

### 6. Edge cases handled
- Chat scroll snaps to bottom on new message *unless* the user has scrolled up to read history.

### 7. Exact file locations
- Page: `src/features/workspace/WorkspacePage.tsx`
- Components: `src/features/workspace/components/ChatWindow.tsx`, `src/features/workspace/components/ProjectSettings.tsx`
- Store: `src/store/useWorkspaceStore.ts`

---

## 8. Profile & Settings

### 1. What it does
Manages user identity and global application appearance.

### 2. Every UI interaction
- **Settings Modal** (Opened via Avatar click):
  - Inputs: Display Name, Username.
  - Theme Toggle: System / Dark / Light buttons.
  - Color Picker: 8 preset hex swatches for Accent Color.
  - Density Toggle: "Compact Mode" switch.

### 3. Data operations
- **Saved to DB**: `profiles`.

### 4. Business logic
- Changing theme or color instantly updates CSS variables (`--color-accent`) on `document.documentElement`, changing the app's look in real-time before the DB save completes.
- Username must be unique (DB constraint `profiles_username_key`).

### 5. Cross-feature connections
- Affects the visual rendering of the entire application.

### 6. Edge cases handled
- Username collision error triggers an inline red warning text.

### 7. Exact file locations
- Component: `src/components/SettingsModal.tsx`
- Store: `src/store/useProfileStore.ts`

---

## 9. Final Application Metrics

### **COMPLETE FEATURE COUNT**
- **Distinct Macro Features**: 12 (Auth, Dashboard, Tasks, Habits, Timetable, Focus Timer, Nexus Notes, Workspaces, Chat, File Storage, Quick Capture, Profile Settings).
- **Distinct Micro/UI Interactions**: ~85 (including drag-and-drop zones, optimisic toggles, hotkeys, theme injections, real-time sockets).

### **MISSING OR INCOMPLETE**
- **Offline Mutation Queue**: The app caches read data via React Query, but if the network drops, mutations (completing a task) will fail after the optimistic update rolls back. There is no IndexedDB background sync queue implemented.
- **Pagination**: Chat history loads a fixed number of recent messages; infinite scrolling upwards is not fully implemented.
- **Goals Feature**: Mentioned in early design docs but does not exist in the codebase.

### **KNOWN BUGS**
- **Focus Timer Drift**: If the browser tab is heavily throttled by the OS (e.g., Safari background tab), the `setInterval` may drift. While the final duration calculation is exact (using timestamps), the visual countdown might jump when the tab is foregrounded.

### **TECHNICAL DEBT**
- **Legacy Database Tables**: `template_blocks` and `scheduled_entries` remain in the schema from an older iteration of the day-view schedule. They are dead code and should be dropped via a migration to reduce bloat.
- **Inline Styles**: Some early components use `style={{ ... }}` instead of mapping directly to Tailwind `@theme` variables, leading to slight inconsistency if the core theme tokens change.
- **Test Coverage**: The UI is heavily reliant on manual testing. Component tests for complex interactions (Timetable drag-and-drop) are missing.
