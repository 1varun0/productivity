# Store Documentation

State management in Peak Hub is handled by **Zustand**. Stores are modularized into global application state and feature-specific state.

---

## 1. `useStore` (Global Application State)

**Purpose**: Manages high-level UI states (like which modals are open) and orchestrates the Focus Session lifecycle. This store uses the `persist` middleware to save the active focus session to `localStorage`, allowing the timer to survive accidental page refreshes.

**State Shape**:
- `isCaptureModalOpen`: boolean
- `isFocusing`: boolean
- `focusSession`: object (duration, timeRemaining, intention, phase)
- `sessionState`: 'idle' | 'active' | 'paused' | 'completed'

**Key Actions**:
- `startFocusSession(duration, intention, taskId)`: Initializes timer and transitions app into Focus Mode.
- `endFocusSession(completionState)`: Finalizes timer, saves memory to DB, and restores standard UI.
- `tick()`: Decrements the remaining time (called by a `setInterval` in the `AppLayout`).

**Consumed By**: `AppLayout`, `FocusChamber`, `Sidebar`, `CaptureModal`.

---

## 2. `useProfileStore`

**Purpose**: Manages user identity, theme preferences, and UI density. Syncs directly with the `profiles` table in Supabase.

**State Shape**:
- `profile`: object (id, username, display_name, accent_color, theme, compact_mode)
- `isLoading`: boolean

**Key Actions**:
- `setProfile(profileData)`: Updates local state.
- `updateAppearance(theme, color, compact)`: Updates local state, applies CSS variables to the DOM, and fires a debounced Supabase `update` to persist the changes.

**Consumed By**: `SettingsModal`, `AppLayout`, various UI components that need to know the active accent color.

---

## 3. `useWeeklyTimetableStore` (Feature State)

**Purpose**: Manages the complex drag-and-drop grid logic for the weekly planner view.

**State Shape**:
- `blocks`: Array of `timetable_blocks`
- `activeBlockId`: string (currently being edited)
- `isDragging`: boolean
- `history`: Undo/Redo stack

**Key Actions**:
- `addBlock(block)`: Inserts a new time block optimistically.
- `updateBlock(id, changes)`: Resizes or moves a block on the grid.
- `syncToDatabase()`: Debounced function that flushes pending block changes to Supabase to avoid hitting the API 60 times a second while dragging.

**Consumed By**: `TimetablePage`, `WeeklyGrid`, `BlockEditor`.

---

## 4. `useWorkspaceStore` (Feature State)

**Purpose**: Manages state for collaborative projects, including active chat channels and member lists.

**State Shape**:
- `activeProjectId`: string | null
- `projects`: Array of projects
- `members`: Array of profiles in the active project
- `messages`: Array of chat messages

**Key Actions**:
- `setActiveProject(id)`: Switches context. Triggers data fetching and sets up Realtime WebSocket subscriptions for the new project.
- `sendMessage(content, attachments)`: Optimistically adds a message to the chat UI and inserts it into Supabase.

**Consumed By**: `WorkspacePage`, `Sidebar` (for project navigation), `ChatWindow`.

---

## 5. `useCommandPaletteStore` (Global UI State)

**Purpose**: Extremely lightweight store simply to toggle the global ⌘K command palette from anywhere in the app.

**State Shape**:
- `isOpen`: boolean
- `searchQuery`: string

**Key Actions**:
- `setIsOpen(boolean)`
- `toggle()`

**Consumed By**: `CommandPalette`, `AppLayout` (global keyboard listener).
