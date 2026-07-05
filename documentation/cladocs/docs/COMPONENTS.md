# Components Documentation

This document outlines the major, globally shared components found in `src/components/`. Feature-specific components (like `FocusOrb` or `WeeklyGrid`) live inside their respective feature folders and are not covered here.

---

## 1. `AppLayout`

**Purpose**: The master wrapper for all authenticated routes. It orchestrates the structural layout of the app, manages the transitions between standard mode and "Focus Mode", and houses global modals.

**Props**:
- `children` (ReactNode): The page content to render.

**Uses**:
- `useStore`: To determine if `isFocusing` is true (triggers the celestial background overlay).
- `useProfileStore`: To apply the user's selected `theme` and `compact_mode` classes to the container.

**Where it's used**: Wrapped around all protected routes in `App.tsx`.

---

## 2. `Sidebar`

**Purpose**: The primary navigation menu on desktop (collapses to a hamburger menu or bottom bar on mobile). Displays navigation links, user profile access, and project workspace links.

**Props**: None.

**Uses**:
- `useWorkspaceStore`: To list the user's active projects in the secondary navigation section.
- React Router `NavLink`: To handle active states (`active` class styling).

**Where it's used**: Inside `AppLayout`.

---

## 3. `SettingsModal`

**Purpose**: Provides the UI for users to update their profile information (username, display name) and application appearance (dark/light theme, accent color, UI density).

**Props**: None (controlled globally).

**Uses**:
- `useProfileStore`: Reads current settings and dispatches `updateAppearance` to change CSS variables and persist to Supabase.
- Framer Motion: For smooth entry/exit modal animations.

**Where it's used**: Rendered via a portal or conditionally within `AppLayout`.

---

## 4. `CaptureModal`

**Purpose**: A quick-entry modal to capture fleeting thoughts into the `mental_inbox`. Can be triggered via a button or globally via a keyboard shortcut (e.g., `Ctrl+Space`).

**Props**: None (controlled globally).

**Uses**:
- `useStore`: To check `isCaptureModalOpen`.
- `useCapture`: A custom hook that handles the Supabase insertion logic into the `captures` or `mental_inbox` tables depending on context.

**Where it's used**: Conditionally rendered in `AppLayout`.

---

## 5. `CustomDatePicker`

**Purpose**: A reusable, highly styled date picker component used for setting task due dates and scheduling timetable entries. Replaces default browser `<input type="date">` for visual consistency.

**Props**:
- `date` (Date | null): The currently selected date.
- `onChange` ((date: Date) => void): Callback when a new date is selected.
- `minDate` / `maxDate` (Optional): Constraints.

**Uses**:
- `date-fns`: For calendar math (start of month, days in month, formatting).
- Lucide React: For chevron icons to navigate months.

**Where it's used**: Task creation forms, Deadline editors.

---

## 6. `CommandPalette`

**Purpose**: A global search and navigation overlay triggered by `⌘K` or `Ctrl+K`. Allows users to quickly jump to pages, create tasks, or open settings without using the mouse.

**Props**: None.

**Uses**:
- `useCommandPaletteStore`: To control visibility.
- React Router `useNavigate`: To perform the actual navigation actions.

**Where it's used**: Conditionally rendered in `AppLayout`.
